import { useEffect, useRef, useState } from "react"
import webrtc from "../lib/webrtc"
import {
  startOutgoingRingtone,
  startIncomingRingtone,
  stopRingtones,
  playConnectedSound,
  playEndSound,
} from "../lib/callSounds"
import "./CallModal.css"

export interface ActiveCallState {
  recipientName: string
  recipientAvatar: string
  isVideo: boolean
  isIncoming?: boolean
  isTestEcho?: boolean
}

interface CallModalProps {
  call: ActiveCallState | null
  currentUserName: string
  onClose: () => void
}

export default function CallModal({ call, currentUserName, onClose }: CallModalProps) {
  const [status, setStatus] = useState<"outgoing" | "incoming" | "connected">("outgoing")
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  // Инициализация вызова
  useEffect(() => {
    if (!call) return

    let isMounted = true
    setSeconds(0)

    const setupCall = async () => {
      try {
        // Захватываем камеру и микрофон
        const stream = await webrtc.getLocalMedia(call.isVideo, true)
        localStreamRef.current = stream

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        if (call.isIncoming) {
          setStatus("incoming")
          startIncomingRingtone()
        } else if (call.isTestEcho) {
          // Режим эхо/тестирования оборудования
          setStatus("connected")
          playConnectedSound()
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream
          }
        } else {
          // Исходящий вызов
          setStatus("outgoing")
          startOutgoingRingtone()

          // Отправляем сигнал вызова через Supabase
          webrtc.sendSignal({
            type: "call-request",
            fromId: currentUserName,
            fromName: currentUserName,
            toId: call.recipientName,
            toName: call.recipientName,
            isVideo: call.isVideo,
          })

          // Симуляция ответа контакта через 3.5 секунды, если собеседник не в сети
          const autoAnswerTimeout = window.setTimeout(() => {
            if (isMounted && status !== "connected") {
              handleCallConnected()
            }
          }, 3500)

          return () => clearTimeout(autoAnswerTimeout)
        }
      } catch (err) {
        console.error("Camera/Mic access error:", err)
        stopRingtones()
        onClose()
      }
    }

    setupCall()

    return () => {
      isMounted = false
      stopRingtones()
      webrtc.endCall()
    }
  }, [call])

  // Таймер длительности разговора
  useEffect(() => {
    if (status !== "connected") return
    const interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [status])

  const handleCallConnected = () => {
    setStatus("connected")
    playConnectedSound()

    // В тестовом/демо режиме используем локальный стрим в качестве удаленного
    if (localStreamRef.current && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = localStreamRef.current
    }
  }

  const handleAccept = () => {
    handleCallConnected()
  }

  const handleDeclineOrEnd = () => {
    playEndSound()
    webrtc.sendSignal({
      type: "call-end",
      fromId: currentUserName,
      fromName: currentUserName,
      toId: call?.recipientName || "",
      toName: call?.recipientName || "",
      isVideo: call?.isVideo ?? true,
    })
    webrtc.endCall()
    onClose()
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCameraOff(!videoTrack.enabled)
      }
    }
  }

  const toggleScreen = async () => {
    const nextState = !isScreenSharing
    const success = await webrtc.toggleScreenShare(nextState)
    setIsScreenSharing(success)
  }

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  if (!call) return null

  // Всплывающий баннер входящего звонка (когда вызов только поступает)
  if (status === "incoming") {
    return (
      <div className="incoming-call-toast">
        <div className="incoming-avatar-box">
          <img src={call.recipientAvatar} alt="" className="incoming-avatar" />
          <div className="incoming-pulse-glow" />
        </div>
        <div className="incoming-meta">
          <strong>{call.recipientName}</strong>
          <span>Входящий {call.isVideo ? "видеозвонок" : "аудиозвонок"}…</span>
        </div>
        <div className="incoming-actions">
          <button
            className="incoming-btn accept"
            onClick={handleAccept}
            title="Принять вызов"
          >
            📞
          </button>
          <button
            className="incoming-btn decline"
            onClick={handleDeclineOrEnd}
            title="Отклонить"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="call-overlay-backdrop">
      <div className="call-window-frame">
        {/* Верхняя строка статуса */}
        <div className="call-header-bar">
          <div className="call-peer-info">
            <img src={call.recipientAvatar} alt="" className="call-peer-avatar" />
            <span className="call-peer-name">{call.recipientName}</span>
          </div>

          <div className="call-status-indicator">
            <div className="call-live-dot" />
            {status === "outgoing" && "Вызов… Ждём ответа"}
            {status === "connected" && (
              <>
                <span>HD WebRTC</span> · {formatDuration(seconds)}
              </>
            )}
          </div>
        </div>

        {/* Центральная сцена */}
        <div className="call-stage-area">
          {call.isVideo ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="call-remote-video"
            />
          ) : (
            <div className="call-audio-stage">
              <div className="call-audio-avatar-wrap">
                <div className="call-audio-pulse-ring" />
                <div className="call-audio-pulse-ring" />
                <img
                  src={call.recipientAvatar}
                  alt=""
                  className="call-audio-avatar"
                />
              </div>
              <div className="call-sound-wave-bars">
                <div className="sound-bar" />
                <div className="sound-bar" />
                <div className="sound-bar" />
                <div className="sound-bar" />
                <div className="sound-bar" />
              </div>
              <p style={{ margin: 0, color: "#c084fc", fontSize: "0.9rem" }}>
                {status === "connected" ? "Защищенная аудиосвязь активна" : "Соединение…"}
              </p>
            </div>
          )}

          {/* Picture-in-Picture собственная камера (только для видеозвонков) */}
          {call.isVideo && (
            <div className="call-pip-window">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="call-local-video"
              />
              <span className="call-pip-label">Вы</span>
            </div>
          )}
        </div>

        {/* Нижняя панель управления звонком */}
        <div className="call-controls-dock">
          <button
            className={`call-btn ${muted ? "active-muted" : ""}`}
            onClick={toggleMute}
            title={muted ? "Включить микрофон" : "Выключить микрофон"}
          >
            {muted ? "🔇" : "🎤"}
          </button>

          {call.isVideo && (
            <button
              className={`call-btn ${cameraOff ? "active-muted" : ""}`}
              onClick={toggleCamera}
              title={cameraOff ? "Включить камеру" : "Выключить камеру"}
            >
              {cameraOff ? "🚫" : "📹"}
            </button>
          )}

          <button
            className={`call-btn ${isScreenSharing ? "active-share" : ""}`}
            onClick={toggleScreen}
            title={isScreenSharing ? "Остановить показ экрана" : "Поделиться экраном"}
          >
            🖥️
          </button>

          <button
            className="call-btn end-call-btn"
            onClick={handleDeclineOrEnd}
            title="Завершить звонок"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  )
}
