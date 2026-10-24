/**
 * WebRTC P2P менеджер аудио- и видеозвонков для Netory
 * Использует бесплатные STUN-серверы Google и Supabase Realtime Broadcast для сигналинга
 */
import { supabase, isSupabaseConfigured } from "./supabase"

export const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

export interface CallSignalPayload {
  type: "call-request" | "call-accept" | "call-reject" | "call-offer" | "call-answer" | "ice-candidate" | "call-end"
  fromId: string
  fromName: string
  fromAvatar?: string
  toId: string
  toName: string
  isVideo: boolean
  data?: any
}

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private realtimeChannel: any = null
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null
  private onSignalCallback: ((signal: CallSignalPayload) => void) | null = null

  /**
   * Подключает канал сигналинга в Supabase Realtime
   */
  public initSignaling(userId: string, onSignal: (signal: CallSignalPayload) => void) {
    this.onSignalCallback = onSignal

    if (isSupabaseConfigured && !this.realtimeChannel) {
      try {
        const channel = supabase.channel("netory-webrtc-signals", {
          config: { broadcast: { self: false } },
        })

        channel
          .on("broadcast", { event: "call-signal" }, (response) => {
            const payload: CallSignalPayload = response.payload
            if (payload && (payload.toId === userId || payload.toName === userId)) {
              this.onSignalCallback?.(payload)
            }
          })
          .subscribe()

        this.realtimeChannel = channel
      } catch (err) {
        console.error("Signaling init error:", err)
      }
    }
  }

  /**
   * Отправляет сигнал через Supabase Broadcast
   */
  public async sendSignal(signal: CallSignalPayload) {
    if (this.realtimeChannel) {
      try {
        await this.realtimeChannel.send({
          type: "broadcast",
          event: "call-signal",
          payload: signal,
        })
      } catch (err) {
        console.error("Failed to send call signal:", err)
      }
    }
  }

  /**
   * Захватывает камеру и микрофон пользователя
   */
  public async getLocalMedia(video: boolean, audio = true): Promise<MediaStream> {
    this.stopLocalMedia()
    const stream = await navigator.mediaDevices.getUserMedia({
      video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
      audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
    })
    this.localStream = stream
    return stream
  }

  /**
   * Создает RTCPeerConnection с бесплатным Google STUN
   */
  public createPeer(
    targetUserId: string,
    onRemoteStream: (stream: MediaStream) => void
  ): RTCPeerConnection {
    this.closePeer()
    this.onRemoteStreamCallback = onRemoteStream

    const pc = new RTCPeerConnection(ICE_CONFIG)
    this.peerConnection = pc

    // Добавляем локальные аудио/видео треки
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // При получении удаленного медиапотока
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStreamCallback?.(event.streams[0])
      }
    }

    // При нахождении ICE кандидатов отправляем их собеседнику
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: "ice-candidate",
          fromId: "me",
          fromName: "me",
          toId: targetUserId,
          toName: targetUserId,
          isVideo: true,
          data: event.candidate,
        })
      }
    }

    return pc
  }

  /**
   * Создает WebRTC Offer (исходящий вызов)
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error("Peer connection not initialized")
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  /**
   * Отвечает на WebRTC Offer (входящий вызов)
   */
  public async createAnswer(offerSdp: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error("Peer connection not initialized")
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp))
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  /**
   * Применяет полученный Answer от собеседника
   */
  public async handleAnswer(answerSdp: RTCSessionDescriptionInit) {
    if (this.peerConnection && this.peerConnection.signalingState !== "closed") {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp))
    }
  }

  /**
   * Применяет полученного ICE кандидата
   */
  public async handleIceCandidate(candidateInit: RTCIceCandidateInit) {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidateInit))
      } catch (err) {
        console.error("Error adding ice candidate:", err)
      }
    }
  }

  /**
   * Включает / отключает показ экрана (Screen Share)
   */
  public async toggleScreenShare(isSharing: boolean): Promise<boolean> {
    if (!this.peerConnection) return false

    if (isSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        this.screenStream = screenStream
        const screenTrack = screenStream.getVideoTracks()[0]

        const senders = this.peerConnection.getSenders()
        const videoSender = senders.find((s) => s.track?.kind === "video")
        if (videoSender) {
          videoSender.replaceTrack(screenTrack)
        }

        screenTrack.onended = () => {
          this.toggleScreenShare(false)
        }
        return true
      } catch (err) {
        console.warn("Screen share cancelled:", err)
        return false
      }
    } else {
      // Возвращаем камеру обратно
      if (this.screenStream) {
        this.screenStream.getTracks().forEach((t) => t.stop())
        this.screenStream = null
      }

      if (this.localStream) {
        const cameraTrack = this.localStream.getVideoTracks()[0]
        const senders = this.peerConnection.getSenders()
        const videoSender = senders.find((s) => s.track?.kind === "video")
        if (videoSender && cameraTrack) {
          videoSender.replaceTrack(cameraTrack)
        }
      }
      return false
    }
  }

  /**
   * Завершает звонок и освобождает камеру/микрофон
   */
  public endCall() {
    this.closePeer()
    this.stopLocalMedia()
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop())
      this.screenStream = null
    }
  }

  public closePeer() {
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
  }

  public stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop())
      this.localStream = null
    }
  }

  public getPeer(): RTCPeerConnection | null {
    return this.peerConnection
  }

  public getStream(): MediaStream | null {
    return this.localStream
  }
}

export const webrtc = new WebRTCManager()
export default webrtc
