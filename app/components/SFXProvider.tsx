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

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Sound controls still work for the current session if storage is blocked.
  }
}

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
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  duration: number,
  volume: number,
  delay = 0,
) {
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const startAt = ctx.currentTime + delay

    osc.type = type
    osc.frequency.setValueAtTime(freq, startAt)
    gain.gain.setValueAtTime(volume, startAt)
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(startAt + duration)
    osc.addEventListener('ended', () => {
      osc.disconnect()
      gain.disconnect()
    }, { once: true })
  } catch {
    // Silently fail if AudioContext unavailable
  }
}

export function SFXProvider({ children }: { children: React.ReactNode }) {
  const [ambient, setAmbientState] = useState<AmbientSound>('off')
  const [ambientVolume, setAmbientVolumeState] = useState(40)
  const [uiSounds, setUiSoundsState] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [mounted, setMounted] = useState(false)

  const getAudioContext = useCallback(() => {
    try {
      let context = audioContextRef.current
      if (!context || context.state === 'closed') {
        context = new AudioContext()
        audioContextRef.current = context
      }
      if (context.state === 'suspended') {
        void context.resume().catch(() => {})
      }
      return context
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    return () => {
      const context = audioContextRef.current
      audioContextRef.current = null
      if (context && context.state !== 'closed') {
        void context.close().catch(() => {})
      }
    }
  }, [])

  // Initialize from localStorage
  useEffect(() => {
    const stored = readStorage(AMBIENT_KEY)
    if (stored && Object.keys(AMBIENT_FILES).includes(stored)) {
      setAmbientState(stored as AmbientSound)
    }
    const vol = readStorage(VOLUME_KEY)
    if (vol) {
      const parsedVolume = Number(vol)
      if (Number.isFinite(parsedVolume)) {
        setAmbientVolumeState(Math.min(100, Math.max(0, parsedVolume)))
      }
    }
    const ui = readStorage(UI_KEY)
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
    writeStorage(AMBIENT_KEY, sound)
  }, [])

  const setAmbientVolume = useCallback((vol: number) => {
    setAmbientVolumeState(vol)
    writeStorage(VOLUME_KEY, String(vol))
  }, [])

  const setUiSounds = useCallback((on: boolean) => {
    setUiSoundsState(on)
    writeStorage(UI_KEY, String(on))
    if (on) getAudioContext()
  }, [getAudioContext])

  const playClick = useCallback(() => {
    if (!uiSounds) return
    const context = getAudioContext()
    if (context) playSynth(context, 'sine', 600, 0.08, 0.15)
  }, [getAudioContext, uiSounds])

  const playHover = useCallback(() => {
    if (!uiSounds) return
    const context = getAudioContext()
    if (context) playSynth(context, 'sine', 800, 0.04, 0.06)
  }, [getAudioContext, uiSounds])

  const playToggle = useCallback(() => {
    if (!uiSounds) return
    const context = getAudioContext()
    if (!context) return
    playSynth(context, 'sine', 500, 0.12, 0.12)
    playSynth(context, 'sine', 700, 0.1, 0.1, 0.06)
  }, [getAudioContext, uiSounds])

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
