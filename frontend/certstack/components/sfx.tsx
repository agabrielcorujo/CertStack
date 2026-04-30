"use client"

// Small WebAudio-based SFX helpers (no external files)
let audioCtx: AudioContext | null = null
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

function playTone(freq: number, type = 'sine', duration = 0.12, gain = 0.12) {
  const ctx = getCtx()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type as OscillatorType
  osc.frequency.setValueAtTime(freq, now)
  g.gain.setValueAtTime(gain, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function playCorrect() {
  try {
    playTone(880, 'sine', 0.12, 0.14)
    setTimeout(() => playTone(1100, 'sine', 0.14, 0.08), 80)
  } catch (e) {
    // ignore
  }
}

export function playWrong() {
  try {
    playTone(220, 'sawtooth', 0.18, 0.15)
    setTimeout(() => playTone(165, 'sawtooth', 0.12, 0.08), 140)
  } catch (e) {}
}

export function playVictory() {
  try {
    const melody = [880, 1100, 1320, 1760]
    let delay = 0
    melody.forEach((f, i) => {
      setTimeout(() => playTone(f, i % 2 ? 'triangle' : 'sine', 0.16, 0.12), delay)
      delay += 180
    })
  } catch (e) {}
}
