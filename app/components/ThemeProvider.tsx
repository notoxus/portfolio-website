'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type BgPreset = 'default' | 'midnight' | 'forest' | 'sepia' | 'rose'

interface ThemeContextValue {
  theme: Theme
  systemTheme: Theme
  isCustomTheme: boolean
  setTheme: (theme: Theme) => void
  resetToDefault: () => void
  toggleTheme: () => void
  bgPreset: BgPreset
  setBgPreset: (preset: BgPreset) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_KEY = 'portfolio-theme'
const BG_KEY = 'portfolio-bg-preset'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return null
}

function getStoredBgPreset(): BgPreset {
  if (typeof window === 'undefined') return 'default'
  const stored = localStorage.getItem(BG_KEY)
  if (['default', 'midnight', 'forest', 'sepia', 'rose'].includes(stored ?? '')) {
    return stored as BgPreset
  }
  return 'default'
}

function applyTheme(theme: Theme, bgPreset: BgPreset) {
  const root = document.documentElement

  // Dark class
  root.classList.toggle('dark', theme === 'dark')

  // Background preset — remove old, add new
  root.classList.forEach((cls) => {
    if (cls.startsWith('bg-preset-')) root.classList.remove(cls)
  })
  if (bgPreset !== 'default') {
    root.classList.add(`bg-preset-${bgPreset}`)
  }

  // Color-scheme for scrollbars etc.
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [systemTheme, setSystemTheme] = useState<Theme>('light')
  const [isCustomTheme, setIsCustomTheme] = useState(false)
  const [bgPreset, setBgPresetState] = useState<BgPreset>('default')
  const [mounted, setMounted] = useState(false)

  // Initialize on mount
  useEffect(() => {
    const sys = getSystemTheme()
    setSystemTheme(sys)
    
    const stored = getStoredTheme()
    setIsCustomTheme(stored !== null)
    const initial = stored ?? sys
    const initialBg = getStoredBgPreset()
    
    setTheme(initial)
    setBgPresetState(initialBg)
    applyTheme(initial, initialBg)
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      setIsCustomTheme(true)
      applyTheme(next, bgPreset)
      return next
    })
  }, [bgPreset])

  const setBgPreset = useCallback(
    (preset: BgPreset) => {
      setBgPresetState(preset)
      localStorage.setItem(BG_KEY, preset)
      applyTheme(theme, preset)
    },
    [theme]
  )

  const setThemeContext = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme)
      localStorage.setItem(THEME_KEY, newTheme)
      setIsCustomTheme(true)
      applyTheme(newTheme, bgPreset)
    },
    [bgPreset]
  )

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(THEME_KEY)
    setIsCustomTheme(false)
    setTheme(systemTheme)
    applyTheme(systemTheme, bgPreset)
  }, [systemTheme, bgPreset])

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const sys = e.matches ? 'dark' : 'light'
      setSystemTheme(sys)
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(sys)
        applyTheme(sys, bgPreset)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [bgPreset])

  return (
    <ThemeContext.Provider value={{ theme, systemTheme, isCustomTheme, setTheme: setThemeContext, resetToDefault, toggleTheme, bgPreset, setBgPreset }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export const BG_PRESETS: { value: BgPreset; label: string}[] = [
  { value: 'default', label: 'Default'},
  { value: 'midnight', label: 'Midnight'},
  { value: 'forest', label: 'Forest'},
  { value: 'sepia', label: 'Sepia'},
  { value: 'rose', label: 'Rose'},
]
