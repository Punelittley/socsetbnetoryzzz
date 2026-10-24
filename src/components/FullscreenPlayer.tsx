import { useEffect, useRef } from "react"

export default function FullscreenPlayer({ title, artist, cover, playing, progress, duration, volume, onVolume, onToggle, onPrevious, onNext, onClose }: {
  title: string; artist: string; cover: string; playing: boolean; progress: number; duration: number; volume: number
  onVolume: (value: number) => void; onToggle: () => void; onPrevious: () => void; onNext: () => void; onClose: () => void
}) {
  const root = useRef<HTMLElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    root.current?.querySelector<HTMLButtonElement>("button")?.focus()
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current()
      if (event.key === "Tab") {
        const controls = root.current?.querySelectorAll<HTMLElement>("button, input")
        if (!controls?.length) return
        const first = controls[0], last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener("keydown", keyboard)
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", keyboard); previous?.focus() }
  }, [])
  const time = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`
  return <section ref={root} className="fullscreen-player" role="dialog" aria-modal="true" aria-label={`Сейчас играет: ${title}`}>
    <header><span>NETORY / ВАШЕ ЗВУКОВОЕ ПРОСТРАНСТВО</span><button onClick={onClose} aria-label="Свернуть плеер">↓</button></header>
    <div className="fullscreen-player-content">
      <div className={`fullscreen-album album-cover ${cover}`}><div className="album-shape" /><span>NETORY<br />SESSIONS</span><strong>{title}</strong><small>ЗВУК, В КОТОРОМ МОЖНО ОСТАТЬСЯ</small></div>
      <div className="fullscreen-track-info"><span>СЕЙЧАС ИГРАЕТ</span><h1>{title}</h1><p>{artist}</p></div>
      <div className="fullscreen-track-progress"><progress value={progress} max={duration} aria-label="Ход воспроизведения" /><div><span>{time(progress)}</span><span>{time(duration)}</span></div></div>
      <div className="fullscreen-track-controls"><button aria-label="Предыдущий трек" onClick={onPrevious}>‹</button><button className="fullscreen-play-button" aria-label={playing ? "Пауза" : "Воспроизвести"} onClick={onToggle}><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">{playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="m8 4 12 8-12 8z" />}</svg></button><button aria-label="Следующий трек" onClick={onNext}>›</button></div>
      <label className="fullscreen-volume">Громкость<input type="range" min="0" max="1" step=".01" value={volume} onChange={(event) => onVolume(Number(event.target.value))} /></label>
    </div><footer>Меньше шума. Больше своего.</footer>
  </section>
}
