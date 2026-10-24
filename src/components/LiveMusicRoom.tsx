import { useEffect, useRef, useState } from "react"

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  chords: number[]
}

const ROOM_TRACKS: Track[] = [
  {
    id: "purple-sunset",
    title: "Фиолетовый Закат",
    artist: "Netory Ambient Lab",
    duration: 195,
    chords: [220, 261.63, 329.63, 392.0], // A minor 7th
  },
  {
    id: "deep-violet",
    title: "Ночной Пульс",
    artist: "Lofi Collective",
    duration: 178,
    chords: [174.61, 220, 261.63, 349.23], // F major 7th
  },
  {
    id: "neon-breeze",
    title: "Неоновый Ветер",
    artist: "Chill Wave Studio",
    duration: 210,
    chords: [196, 246.94, 293.66, 392.0], // G major
  },
]

interface LiveMusicRoomProps {
  isOpen: boolean
  onClose: () => void
  partnerName?: string
  partnerAvatar?: string
  onOpenDonate?: (recipientName: string, recipientAvatar?: string) => void
}

export default function LiveMusicRoom({
  isOpen,
  onClose,
  partnerName = "София Ковалёва",
  partnerAvatar,
  onOpenDonate,
}: LiveMusicRoomProps) {
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(24)
  const [reactions, setReactions] = useState<{ id: number; text: string; x: number }[]>([])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscNodesRef = useRef<OscillatorNode[]>([])
  const progressTimerRef = useRef<number | null>(null)

  const currentTrack = ROOM_TRACKS[trackIndex]

  // Start sound synthesis
  const startAudio = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }

      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioCtxRef.current = ctx

      const master = ctx.createGain()
      master.gain.setValueAtTime(0, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2)
      master.connect(ctx.destination)
      gainNodeRef.current = master

      const oscs: OscillatorNode[] = []
      currentTrack.chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        osc.type = idx % 2 === 0 ? "sine" : "triangle"
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        osc.detune.setValueAtTime(idx * 3 - 4, ctx.currentTime)

        // Sub gain per voice
        const subGain = ctx.createGain()
        subGain.gain.setValueAtTime(0.3, ctx.currentTime)
        osc.connect(subGain)
        subGain.connect(master)

        osc.start()
        oscs.push(osc)
      })

      oscNodesRef.current = oscs
      setIsPlaying(true)
    } catch {
      setIsPlaying(true)
    }
  }

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.3)
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      oscNodesRef.current.forEach((o) => {
        try {
          o.stop()
        } catch {
          // ignore
        }
      })
      oscNodesRef.current = []
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
      gainNodeRef.current = null
    }, 320)
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio()
    } else {
      startAudio()
    }
  }

  // Next / Prev track
  const changeTrack = (delta: number) => {
    stopAudio()
    setTrackIndex((prev) => (prev + delta + ROOM_TRACKS.length) % ROOM_TRACKS.length)
    setCurrentTime(0)
  }

  // Progress ticker
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            changeTrack(1)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [isPlaying, trackIndex])

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen) {
      stopAudio()
    }
  }, [isOpen])

  // Reaction burst
  const sendReaction = (text: string) => {
    const id = Date.now() + Math.random()
    const x = 30 + Math.random() * 40 // random position between 30% and 70%
    setReactions((prev) => [...prev, { id, text, x }])
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id))
    }, 2000)
  }

  if (!isOpen) return null

  const formatSec = (total: number) => {
    const m = Math.floor(total / 60)
    const s = Math.floor(total % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const percent = Math.min(100, Math.round((currentTime / currentTrack.duration) * 100))

  return (
    <div className="modal-overlay music-room-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="music-room-card" onClick={(e) => e.stopPropagation()}>
        {/* Floating live reaction particles */}
        <div className="music-room-reactions-stage" aria-hidden="true">
          {reactions.map((r) => (
            <div
              key={r.id}
              className="floating-vibe-pill"
              style={{ left: `${r.x}%` }}
            >
              <span>{r.text}</span>
            </div>
          ))}
        </div>

        {/* Room Header */}
        <div className="music-room-header">
          <div className="music-room-badge">
            <span className="live-pulse-dot" />
            <span>LIVE MUSIC ROOM</span>
          </div>

          <button className="music-room-close-btn" onClick={onClose} aria-label="Закрыть комнату">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Listeners Presence Bar */}
        <div className="music-room-listeners">
          <div className="listener-item">
            <div className="listener-avatar-wrap is-host">
              <img src="https://i.pravatar.cc/100?img=11" alt="Вы" className="listener-avatar" />
              <span className="listener-glow" />
            </div>
            <div className="listener-meta">
              <strong>Вы (Хост)</strong>
              <small>В эфире</small>
            </div>
          </div>

          <div className="listeners-sync-divider">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.4">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>В унисон</span>
          </div>

          <div className="listener-item">
            <div className="listener-avatar-wrap">
              <img
                src={partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={partnerName}
                className="listener-avatar"
              />
              <span className="listener-glow" />
            </div>
            <div className="listener-meta">
              <strong>{partnerName}</strong>
              <small>Слушает с вами</small>
            </div>
          </div>
        </div>

        {/* Central Visualizer & Vinyl Disc */}
        <div className="music-room-center-stage">
          <div className={`music-disc-volumetric ${isPlaying ? "spinning" : ""}`}>
            <div className="disc-inner-groove" />
            <div className="disc-center-label">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#9333ea">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
          </div>

          <div className="music-room-track-info">
            <h3>{currentTrack.title}</h3>
            <p>{currentTrack.artist}</p>
          </div>

          {/* Dynamic 24-Bar Sound Visualizer */}
          <div className={`music-room-visualizer ${isPlaying ? "active" : ""}`}>
            {[45, 75, 30, 90, 60, 100, 40, 85, 55, 95, 70, 35, 80, 50, 90, 65, 40, 75, 85, 30, 95, 60, 40, 70].map(
              (h, idx) => (
                <span
                  key={idx}
                  className="visualizer-bar"
                  style={{
                    height: isPlaying ? `${Math.max(14, (h * (0.6 + Math.sin(idx + currentTime) * 0.4)))}%` : "16%",
                    animationDelay: `${idx * 0.05}s`,
                  }}
                />
              )
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="music-room-timeline">
          <div className="timeline-labels">
            <span>{formatSec(currentTime)}</span>
            <span>{formatSec(currentTrack.duration)}</span>
          </div>
          <div
            className="timeline-track"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pos = (e.clientX - rect.left) / rect.width
              setCurrentTime(Math.floor(pos * currentTrack.duration))
            }}
          >
            <div className="timeline-fill" style={{ width: `${percent}%` }} />
            <div className="timeline-scrubber" style={{ left: `${percent}%` }} />
          </div>
        </div>

        {/* Player Action Buttons */}
        <div className="music-room-controls">
          <button className="room-nav-btn" onClick={() => changeTrack(-1)} aria-label="Предыдущий трек">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button
            className={`room-play-btn ${isPlaying ? "playing" : ""}`}
            onClick={togglePlayback}
            aria-label={isPlaying ? "Пауза" : "Играть"}
          >
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button className="room-nav-btn" onClick={() => changeTrack(1)} aria-label="Следующий трек">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Quick Vibe Reactions */}
        <div className="music-room-reaction-bar">
          <span className="reaction-title">Реакции:</span>
          {["Вайб", "Бит", "Джем", "Огонь", "Космос"].map((word) => (
            <button
              key={word}
              type="button"
              className="reaction-chip"
              onClick={() => sendReaction(word)}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Donate to DJ / Room Creator */}
        <div className="music-room-donate-strip">
          <button
            type="button"
            className="room-donate-action"
            onClick={() => {
              if (onOpenDonate) {
                onOpenDonate(partnerName, partnerAvatar)
              }
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10M15 10H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9" />
            </svg>
            <span>Поддержать трек / Донат</span>
          </button>
        </div>
      </div>
    </div>
  )
}
