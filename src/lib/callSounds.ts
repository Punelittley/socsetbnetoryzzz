/**
 * Web Audio синтезатор звуков звонков (гудки, рингтон, подключение, отбой)
 * Работает автономно в браузере с нулевой задержкой
 */

let audioCtx: AudioContext | null = null
let ringtoneInterval: number | null = null

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

/**
 * Запускает европейские гудки исходящего вызова (приятный тон 425Hz с паузами)
 */
export function startOutgoingRingtone() {
  stopRingtones()
  const ctx = getAudioContext()

  const playTone = () => {
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(425, now)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05)
      gain.gain.setValueAtTime(0.18, now + 0.95)
      gain.gain.linearRampToValueAtTime(0, now + 1.0)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.0)
    } catch {}
  }

  playTone()
  ringtoneInterval = window.setInterval(playTone, 3000)
}

/**
 * Запускает полифонический мелодичный рингтон входящего вызова
 */
export function startIncomingRingtone() {
  stopRingtones()
  const ctx = getAudioContext()

  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

  const playMelody = () => {
    try {
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.18
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.35)
      })
    } catch {}
  }

  playMelody()
  ringtoneInterval = window.setInterval(playMelody, 2400)
}

/**
 * Останавливает текущий рингтон/гудки
 */
export function stopRingtones() {
  if (ringtoneInterval !== null) {
    clearInterval(ringtoneInterval)
    ringtoneInterval = null
  }
}

/**
 * Звук успешного соединения (мягкий двойной дзынь)
 */
export function playConnectedSound() {
  stopRingtones()
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    ;[587.33, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, now + i * 0.1)

      gain.gain.setValueAtTime(0.16, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.25)
    })
  } catch {}
}

/**
 * Звук завершения / отбоя звонка
 */
export function playEndSound() {
  stopRingtones()
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    ;[440, 330, 220].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, now + i * 0.08)

      gain.gain.setValueAtTime(0.2, now + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.2)
    })
  } catch {}
}
