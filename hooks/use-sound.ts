'use client'

import { useCallback, useRef } from 'react'

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
}

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = createAudioContext()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback((frequencies: number[], duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    if (!enabled) return
    const ctx = getCtx()
    if (!ctx) return

    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * (duration / frequencies.length))
      osc.connect(gain)
      osc.start(ctx.currentTime + i * (duration / frequencies.length))
      osc.stop(ctx.currentTime + duration)
    })
  }, [enabled, getCtx])

  const playReveal = useCallback(() => {
    // Pleasant rising chord - C E G
    playTone([523, 659, 784, 1046], 0.6, 'sine', 0.25)
  }, [playTone])

  const playStrike = useCallback(() => {
    // Harsh buzzer
    const ctx = getCtx()
    if (!ctx || !enabled) return
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4)
    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  }, [enabled, getCtx])

  const playVictory = useCallback(() => {
    // Fanfare: C E G C (ascending)
    playTone([261, 329, 392, 523, 659, 784, 1046], 1.2, 'sine', 0.3)
  }, [playTone])

  const playRoundStart = useCallback(() => {
    // Dramatic drum-like build
    const ctx = getCtx()
    if (!ctx || !enabled) return
    ;[0, 0.15, 0.3, 0.45].forEach((t, i) => {
      const gain = ctx.createGain()
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.3 + i * 0.1, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.1)
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(80 + i * 20, ctx.currentTime + t)
      osc.connect(gain)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.1)
    })
  }, [enabled, getCtx])

  const playSteal = useCallback(() => {
    // Tense dramatic sound
    playTone([220, 196, 175], 0.8, 'triangle', 0.3)
  }, [playTone])

  const playAwardPoints = useCallback(() => {
    // Cash register / point award sound
    playTone([880, 1100, 1320], 0.4, 'sine', 0.25)
  }, [playTone])

  return { playReveal, playStrike, playVictory, playRoundStart, playSteal, playAwardPoints }
}
