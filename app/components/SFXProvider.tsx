'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type AmbientSound = 'off' | 'rain' | 'lofi' | 'cafe' | 'nature'

interface SFXContextValue {
  ambient: AmbientSound
  setAmbient: (sound: AmbientSound) => void
  ambientVolume: number
  setAmbientVolume: (vol: number) => void
  uiSounds: boolean
  setUiSounds: (on: boolean) => void
  playClick: () => void
  playHover: () => void
  playToggle: () => void
}

const SFXContext = createContext<SFXContextValue | null>(null)

const AMBIENT_KEY = 'portfolio-sfx-ambient'
const VOLUME_KEY = 'portfolio-sfx-volume'
const UI_KEY = 'portfolio-sfx-ui'

const AMBIENT_FILES: Record<Exclude<AmbientSound, 'off'>, string> = {
  rain: '/audio/ambient/rain.mp3',
  lofi: '/audio/ambient/lofi.mp3',
  cafe: '/audio/ambient/cafe.mp3',
  nature: '/audio/ambient/nature.mp3',
}

export const AMBIENT_OPTIONS: { value: AmbientSound; label: string}[] = [
  { value: 'off', label: 'Off'},
  { value: 'rain', label: 'Rain'},
  { value: 'lofi', label: 'Lo-fi'},
  { value: 'cafe', label: 'Café'},
  { value: 'nature', label: 'Nature'},
]

/** Generates a short synthetic sound using Web Audio API. */
function playSynth(
  type: OscillatorType,
  freq: number,
  duration: number,
  volume: number
) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)

    // Cleanup
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000)
  } catch {
    // Silently fail if AudioContext unavailable
  }
}

export function SFXProvider({ children }: { children: React.ReactNode }) {
  const [ambient, setAmbientState] = useState<AmbientSound>('off')
  const [ambientVolume, setAmbientVolumeState] = useState(40)
  const [uiSounds, setUiSoundsState] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(AMBIENT_KEY)
    if (stored && Object.keys(AMBIENT_FILES).includes(stored)) {
      setAmbientState(stored as AmbientSound)
    }
    const vol = localStorage.getItem(VOLUME_KEY)
    if (vol) setAmbientVolumeState(Number(vol))
    const ui = localStorage.getItem(UI_KEY)
    if (ui === 'true') setUiSoundsState(true)
    setMounted(true)
  }, [])

  // Manage ambient audio playback
  useEffect(() => {
    if (!mounted) return

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    if (ambient === 'off') return

    const audio = new Audio(AMBIENT_FILES[ambient])
    audio.loop = true
    audio.volume = ambientVolume / 100
    audioRef.current = audio

    // Play (browsers require user gesture — will silently fail if not allowed)
    const playPromise = audio.play()
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked — we'll retry on next user interaction
      })
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [ambient, mounted])

  // Update volume on existing audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = ambientVolume / 100
    }
  }, [ambientVolume])

  const setAmbient = useCallback((sound: AmbientSound) => {
    setAmbientState(sound)
    localStorage.setItem(AMBIENT_KEY, sound)
  }, [])

  const setAmbientVolume = useCallback((vol: number) => {
    setAmbientVolumeState(vol)
    localStorage.setItem(VOLUME_KEY, String(vol))
  }, [])

  const setUiSounds = useCallback((on: boolean) => {
    setUiSoundsState(on)
    localStorage.setItem(UI_KEY, String(on))
  }, [])

  const playClick = useCallback(() => {
    if (!uiSounds) return
    playSynth('sine', 600, 0.08, 0.15)
  }, [uiSounds])

  const playHover = useCallback(() => {
    if (!uiSounds) return
    playSynth('sine', 800, 0.04, 0.06)
  }, [uiSounds])

  const playToggle = useCallback(() => {
    if (!uiSounds) return
    playSynth('sine', 500, 0.12, 0.12)
    setTimeout(() => playSynth('sine', 700, 0.1, 0.1), 60)
  }, [uiSounds])

  return (
    <SFXContext.Provider
      value={{
        ambient,
        setAmbient,
        ambientVolume,
        setAmbientVolume,
        uiSounds,
        setUiSounds,
        playClick,
        playHover,
        playToggle,
      }}
    >
      {children}
    </SFXContext.Provider>
  )
}

export function useSFX() {
  const ctx = useContext(SFXContext)
  if (!ctx) throw new Error('useSFX must be used within SFXProvider')
  return ctx
}
