import { useEffect, useRef, useState } from "react"

interface CircleRecorderOverlayProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (clipUrl: string) => void
  userName?: string
  userAvatar?: number
}

function CircleIcon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    close: "M18 6L6 18M6 6l12 12",
    trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
    refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
    video: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
    check: "M20 6L9 17l-5-5",
    spark: "M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z",
    flip: "M20 7h-7m7 0l-3-3m3 3l-3 3M4 17h7m-7 0l3 3m-3-3l3-3",
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  )
}

const MAX_DURATION = 60 // 60 seconds
const RADIUS = 137.5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CircleRecorderOverlay({
  isOpen,
  onClose,
  onPublish,
  userName = "Вы",
  userAvatar = 11,
}: CircleRecorderOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "recording" | "review">("idle")
  const [seconds, setSeconds] = useState(0)
  const [clipUrl, setClipUrl] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isMirrored, setIsMirrored] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  // Attach camera stream to video element safely
  const attachVideo = (el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (el && streamRef.current) {
      if (el.srcObject !== streamRef.current) {
        el.srcObject = streamRef.current
      }
      el.play().catch(() => {})
    }
  }

  // Request camera and setup stream
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia не поддерживается")
      }

      let stream: MediaStream | null = null

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        })
      } catch {
        // Fallback to video only if audio permission fails or mic is busy
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      if (!stream) throw new Error("Поток камеры не получен")

      streamRef.current = stream
      setCameraActive(true)
      setCameraError(null)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.warn("Camera init note:", err)
      setCameraActive(false)
      setCameraError("Разрешите доступ к камере в браузере для записи")
    }
  }

  // Initialize camera when overlay opens
  useEffect(() => {
    if (!isOpen) return

    setPhase("idle")
    setSeconds(0)
    setClipUrl(null)
    setCameraError(null)

    startCamera()

    return () => {
      stopMediaTracks()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen])

  // Sync stream to video element if cameraActive changes
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
      videoRef.current.play().catch(() => {})
    }
  }, [cameraActive, phase])

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  // Handle timer during recording
  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording()
            return MAX_DURATION
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel()
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault()
        if (phase === "idle") startRecording()
        else if (phase === "recording") stopRecording()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, phase])

  const startRecording = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 240)
    setSeconds(0)
    recordedChunksRef.current = []

    if (streamRef.current && cameraActive) {
      try {
        let mimeType = "video/webm;codecs=vp9,opus"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm"
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""
          }
        }
        const recorder = mimeType
          ? new MediaRecorder(streamRef.current, { mimeType })
          : new MediaRecorder(streamRef.current)

        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: recorder.mimeType || "video/webm",
          })
          const url = URL.createObjectURL(blob)
          setClipUrl(url)
          setPhase("review")
        }

        recorder.start(250)
        setPhase("recording")
        return
      } catch (err) {
        console.warn("MediaRecorder start fallback:", err)
      }
    }

    // Interactive fallback mode
    setPhase("recording")
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    } else {
      // Review mode fallback
      setClipUrl(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80"
      )
      setPhase("review")
    }
  }

  const handleRetake = () => {
    if (clipUrl && clipUrl.startsWith("blob:")) {
      URL.revokeObjectURL(clipUrl)
    }
    setClipUrl(null)
    setSeconds(0)
    setPhase("idle")

    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }

  const handleCancel = () => {
    if (phase === "recording" && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    if (clipUrl && clipUrl.startsWith("blob:")) {
      URL.revokeObjectURL(clipUrl)
    }
    stopMediaTracks()
    setPhase("idle")
    setClipUrl(null)
    setSeconds(0)
    onClose()
  }

  const handlePublish = () => {
    const finalUrl =
      clipUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80"
    stopMediaTracks()
    onPublish(finalUrl)
    onClose()
  }

  if (!isOpen) return null

  // Calculate SVG progress ring offset
  const progressRatio = Math.min(seconds / MAX_DURATION, 1)
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressRatio)

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div
      className="circle-recorder-studio"
      role="dialog"
      aria-modal="true"
      aria-label="Запись видеокружка"
    >
      {/* 100% Solid white background backdrop */}
      <div className="circle-recorder-backdrop" onClick={handleCancel} />

      {/* Header bar with status and close button */}
      <header className="circle-recorder-header">
        <div className="circle-status-chip">
          {phase === "recording" ? (
            <span className="rec-badge recording">
              <span className="rec-pulse-dot" />
              REC {formatTimer(seconds)} / 01:00
            </span>
          ) : phase === "review" ? (
            <span className="rec-badge review">
              <CircleIcon name="check" size={13} />
              Кружок записан ({formatTimer(seconds || 5)})
            </span>
          ) : null}
        </div>

        <button
          className="circle-studio-close-btn"
          onClick={handleCancel}
          aria-label="Закрыть"
          title="Закрыть (Esc)"
        >
          <CircleIcon name="close" size={18} />
        </button>
      </header>

      {/* Main Center Stage with Circular Lens */}
      <main className="circle-lens-stage">
        {/* Shutter flash effect */}
        {flash && <div className="circle-shutter-flash" />}

        {/* Central circular viewfinder frame (exact 280x280) */}
        <div className={`circle-lens-frame ${phase === "recording" ? "is-recording" : ""}`}>
          {/* Progress SVG Ring (exact 280x280 perimeter) */}
          <svg className="circle-progress-svg" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              className="circle-track-ring"
              strokeWidth="5"
            />
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              className="circle-active-progress"
              strokeWidth="5"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Inner Circular Viewport / Camera Feed */}
          <div className="circle-lens-viewport">
            {phase === "review" ? (
              clipUrl && clipUrl.startsWith("blob:") ? (
                <video
                  ref={reviewVideoRef}
                  src={clipUrl}
                  autoPlay
                  loop
                  playsInline
                  className="circle-media-element"
                />
              ) : (
                <div className="circle-mock-preview">
                  <img
                    src={clipUrl || `https://i.pravatar.cc/400?img=${userAvatar}`}
                    alt="Предпросмотр"
                    className="circle-media-element"
                  />
                  <div className="circle-review-badge">
                    <CircleIcon name="spark" size={13} />
                    <span>Предпросмотр</span>
                  </div>
                </div>
              )
            ) : (
              <div className="circle-camera-viewport-wrap">
                <video
                  ref={attachVideo}
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
                  className={`circle-media-element ${isMirrored ? "mirrored" : ""}`}
                />
                {cameraError && !cameraActive && (
                  <div className="circle-cam-overlay-error">
                    <span>{cameraError}</span>
                    <button
                      type="button"
                      className="btn-enable-cam"
                      onClick={startCamera}
                    >
                      <CircleIcon name="video" size={14} />
                      <span>Разрешить камеру</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Informative caption */}
        <div className="circle-instruction-hint">
          {phase === "recording" ? (
            <span className="hint-active">Идёт запись... Нажмите кнопку для остановки</span>
          ) : phase === "review" ? (
            <span>Посмотрите результат: отправить в ЛС или удалить</span>
          ) : cameraError ? (
            <span>{cameraError}</span>
          ) : null}
        </div>
      </main>

      {/* Bottom Floating Control Dock */}
      <footer className="circle-control-dock">
        {phase === "idle" && (
          <div className="dock-actions-row">
            {cameraActive && (
              <button
                className="dock-tool-btn"
                onClick={() => setIsMirrored((m) => !m)}
                title="Отразить камеру"
                aria-label="Отразить камеру"
              >
                <CircleIcon name="flip" size={19} />
              </button>
            )}

            {/* Main Record Shutter Button */}
            <button
              className="circle-shutter-btn idle"
              onClick={startRecording}
              aria-label="Начать запись"
              title="Начать запись (Пробел)"
            >
              <span className="shutter-inner-core" />
            </button>

            <button
              className="dock-tool-btn"
              onClick={handleCancel}
              title="Отмена"
              aria-label="Отмена"
            >
              <CircleIcon name="close" size={19} />
            </button>
          </div>
        )}

        {phase === "recording" && (
          <div className="dock-actions-row">
            {/* Cancel & Discard button */}
            <button
              className="dock-tool-btn discard-btn"
              onClick={handleCancel}
              title="Отменить запись"
              aria-label="Отменить запись"
            >
              <CircleIcon name="trash" size={19} />
            </button>

            {/* Shutter Stop Button */}
            <button
              className="circle-shutter-btn recording-active"
              onClick={stopRecording}
              aria-label="Остановить запись"
              title="Остановить запись"
            >
              <span className="shutter-stop-square" />
            </button>

            {/* Finish & Review button */}
            <button
              className="dock-tool-btn complete-btn"
              onClick={stopRecording}
              title="Завершить запись"
              aria-label="Завершить запись"
            >
              <CircleIcon name="check" size={19} />
            </button>
          </div>
        )}

        {phase === "review" && (
          <div className="dock-actions-row review-actions">
            <button
              className="circle-icon-btn discard-btn"
              onClick={handleRetake}
              title="Удалить запись"
              aria-label="Удалить запись"
            >
              <CircleIcon name="trash" size={24} />
            </button>

            <button
              className="circle-icon-btn send-btn"
              onClick={handlePublish}
              title="Отправить"
              aria-label="Отправить"
            >
              <CircleIcon name="send" size={24} />
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
