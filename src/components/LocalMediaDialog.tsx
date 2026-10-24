import { useEffect, useRef, useState } from "react"
import "./LocalMediaDialog.css"

type Props = {
  mode: "voice" | "audio" | "video"
  recipient: string
  onClose: () => void
  onSave?: (data: string) => void
}

export default function LocalMediaDialog({ mode, recipient, onClose, onSave }: Props) {
  const [status, setStatus] = useState("ready")
  const [error, setError] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [recording, setRecording] = useState<Blob | null>(null)
  const [preview, setPreview] = useState("")
  const [muted, setMuted] = useState(false)
  const [camera, setCamera] = useState(true)
  const stream = useRef<MediaStream | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const video = useRef<HTMLVideoElement>(null)
  const mounted = useRef(false)
  const busy = useRef(false)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const stopTracks = () => stream.current?.getTracks().forEach((track) => track.stop())

  useEffect(() => {
    mounted.current = true
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current()
    }
    window.addEventListener("keydown", escape)
    return () => {
      mounted.current = false
      if (recorder.current?.state === "recording") recorder.current.stop()
      stopTracks()
      window.removeEventListener("keydown", escape)
    }
  }, [])

  useEffect(() => {
    if (!recording) return
    const url = URL.createObjectURL(recording)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [recording])

  useEffect(() => {
    if (status !== "recording") return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    if (seconds >= 120 && recorder.current?.state === "recording") recorder.current.stop()
  }, [seconds])

  const start = async () => {
    if (busy.current) return
    busy.current = true
    setError("")
    setStatus("requesting")
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported")
      if (mode === "voice" && typeof MediaRecorder === "undefined") throw new Error("unsupported")
      const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" })
      if (!mounted.current) {
        media.getTracks().forEach((track) => track.stop())
        return
      }
      stream.current = media
      setMuted(false)
      setCamera(true)
      if (video.current) video.current.srcObject = media
      if (mode !== "voice") {
        setStatus("preview")
        return
      }
      const chunks: BlobPart[] = []
      const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"]
        .find((type) => MediaRecorder.isTypeSupported(type))
      const instance = new MediaRecorder(media, mimeType ? { mimeType } : undefined)
      recorder.current = instance
      instance.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data)
      }
      instance.onstop = () => {
        stopTracks()
        if (!mounted.current) return
        const blob = new Blob(chunks, { type: instance.mimeType })
        if (!blob.size) {
          setError("Запись пустая. Попробуйте ещё раз.")
          setStatus("ready")
          return
        }
        setRecording(blob)
        setStatus("recorded")
      }
      instance.onerror = () => {
        stopTracks()
        if (mounted.current) {
          setError("Не удалось записать звук. Попробуйте ещё раз.")
          setStatus("ready")
        }
      }
      setRecording(null)
      setSeconds(0)
      instance.start()
      setStatus("recording")
    } catch (cause) {
      stopTracks()
      if (!mounted.current) return
      const name = cause instanceof DOMException ? cause.name : ""
      setError(name === "NotAllowedError"
        ? "Нет доступа. Разрешите микрофон и камеру в настройках браузера и предпросмотра."
        : name === "NotFoundError"
          ? "Микрофон или камера не найдены. Подключите устройство и повторите."
          : "Не удалось открыть устройство. Проверьте поддержку браузера и доступ к микрофону и камере.")
      setStatus("ready")
    } finally {
      busy.current = false
    }
  }

  const save = () => {
    if (!recording || status === "saving") return
    setStatus("saving")
    const reader = new FileReader()
    reader.onload = () => {
      if (!mounted.current) return
      onSave?.(String(reader.result))
      onClose()
    }
    reader.onerror = () => {
      if (!mounted.current) return
      setError("Не удалось сохранить запись. Скачайте её или попробуйте снова.")
      setStatus("recorded")
    }
    reader.readAsDataURL(recording)
  }

  useEffect(() => {
    if (mode !== "voice") void start()
  }, [mode])

  return (
    <div className={mode === "voice" ? "local-media-backdrop" : "netory-call-screen"}>
      <section className="local-media-dialog" role={mode === "voice" ? "dialog" : undefined} aria-modal={mode === "voice" ? true : undefined} aria-label={mode === "voice" ? "Голосовое сообщение" : "Экран звонка"}>
        <button className="local-media-close" onClick={onClose} autoFocus aria-label="Закрыть">×</button>
        <span className="local-media-eyebrow">{mode === "voice" ? "ГОЛОСОВОЕ СООБЩЕНИЕ" : mode === "video" ? "NETORY · ВИДЕОЗВОНОК" : "NETORY · АУДИОЗВОНОК"}</span>
        {mode === "audio" && <div className="call-person-monogram">{recipient.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>}
        <h2>{recipient}</h2>
        <p> {mode === "voice" ? "Запишите то, что хочется сказать." : error ? "Нет доступа к устройствам" : status === "preview" ? "Устройства готовы · соединение недоступно" : "Подготавливаем ваши устройства…"}</p>
        {mode === "video" && <video ref={video} autoPlay muted playsInline className="local-media-video" />}
        {mode === "voice" && (
          <div className="local-media-recording" role="status">
            {status === "recording" && <span className="local-media-dot" />}
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
            <small>{status === "recording" ? "Идёт запись · максимум 2 минуты" : "До 2 минут"}</small>
          </div>
        )}
        {recording && preview && <audio controls src={preview} aria-label="Прослушать запись" />}
        <p className="local-media-notice">{mode === "voice"
          ? "Запись можно добавить только в локальную переписку. Собеседник её не получит: бэкенд не подключён."
          : "Соединение с собеседником недоступно: бэкенд не подключён. Камера и микрофон работают только на вашем устройстве; данные не передаются."}</p>
        {error && <p role="alert" className="local-media-error">{error}</p>}
        <div className="local-media-actions">
          {(status === "ready" || status === "recorded") && <button className="primary" onClick={start}>{mode === "voice" ? recording ? "Перезаписать" : "Начать запись" : "Проверить устройства"}</button>}
          {status === "requesting" && <span role="status">Ожидаем разрешение браузера…</span>}
          {status === "recording" && <button className="primary" onClick={() => recorder.current?.stop()}>Остановить запись</button>}
          {recording && <button disabled={status === "saving"} onClick={save}>{status === "saving" ? "Сохранение…" : "Добавить локально"}</button>}
          {recording && preview && <a href={preview} download={`netory-voice.${recording.type.includes("mp4") ? "m4a" : recording.type.includes("ogg") ? "ogg" : "webm"}`}>Скачать</a>}
          {status === "preview" && <>
            <button aria-pressed={muted} onClick={() => {
              stream.current?.getAudioTracks().forEach((track) => { track.enabled = muted })
              setMuted(!muted)
            }}>{muted ? "Включить микрофон" : "Выключить микрофон"}</button>
            {mode === "video" && <button aria-pressed={!camera} onClick={() => {
              stream.current?.getVideoTracks().forEach((track) => { track.enabled = !camera })
              setCamera(!camera)
            }}>{camera ? "Выключить камеру" : "Включить камеру"}</button>}
          </>}
          <button onClick={onClose}>{status === "preview" ? "Завершить проверку" : "Отмена"}</button>
        </div>
      </section>
    </div>
  )
}
