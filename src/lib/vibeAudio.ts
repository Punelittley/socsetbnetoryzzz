/**
 * Web Audio синтезатор эффектов для стикер-бомбинга на Карте Вайба
 * Работает автономно прямо в браузере с нулевой задержкой
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

export function playStickerSound(type: "bump" | "ping" | "rocket" | "coffee" | "heart" | "pop") {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    if (type === "bump") {
      // Плотный басовый "БУМ" как в Blink
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35)

      gain.gain.setValueAtTime(0.6, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (type === "ping") {
      // Звонкий футуристичный пинг радара
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12)

      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.4)
    } else if (type === "rocket") {
      // Свистящий подъем ракеты
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3)

      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (type === "heart") {
      // Теплый созвучный аккорд
      ;[523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.04)

        gain.gain.setValueAtTime(0.18, now + i * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.04)
        osc.stop(now + 0.5)
      })
    } else {
      // Легкий щелчок / поп
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.1)
    }
  } catch (err) {
    console.error("Audio error:", err)
  }
}
