'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme, BG_PRESETS } from './ThemeProvider'
import { useSFX, AMBIENT_OPTIONS } from './SFXProvider'

/* ── Avatar ── */
function Avatar({ src, name, size = 26 }: { src?: string | null; name?: string | null; size?: number }) {
  const [errored, setErrored] = useState(false)
  const initial = (name ?? '?').charAt(0).toUpperCase()

  if (!src || errored) {
    return (
      <span
        className="flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-200"
        style={{ width: size, height: size }}
      >
        {initial}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={name ?? 'avatar'}
      width={size}
      height={size}
      className="rounded-full"
      unoptimized
      onError={() => setErrored(true)}
    />
  )
}

/* ── Theme toggle icon ── */
function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  if (theme === 'dark') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

/* ── Dropdown section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
      {children}
    </p>
  )
}

/* ── Admin links config ── */
const ADMIN_LINKS = [
  { href: '/admin/site-settings', label: 'Edit homepage' },
  { href: '/admin/intro', label: 'Edit intro' },
  { href: '/admin/new-post', label: 'New post' },
  { href: '/admin/projects', label: 'Manage projects' },
  { href: '/admin/blog', label: 'Manage blog' },
]

/* ── Main component ── */
export default function AuthButton({
  adminUsername,
}: {
  adminUsername?: string
}) {
  const { data: session, status } = useSession()
  const { theme, systemTheme, isCustomTheme, setTheme, resetToDefault, toggleTheme, bgPreset, setBgPreset } = useTheme()
  const { ambient, setAmbient, ambientVolume, setAmbientVolume, uiSounds, setUiSounds, playClick, playToggle } = useSFX()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isAdmin = (session as any)?.login === adminUsername

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleToggleTheme = useCallback(() => {
    toggleTheme()
    playToggle()
  }, [toggleTheme, playToggle])

  if (status === 'loading') return null

  /* ── Not signed in ── */
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2" ref={menuRef}>
        {/* Settings button */}
        <button
          onClick={() => { setOpen(!open); playClick() }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:hover:text-blue-400"
          aria-label="Personalization settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        <button
          onClick={() => signIn('github')}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Sign in
        </button>

        {/* Dropdown for not-signed-in */}
        {open && (
          <DropdownPanel
            theme={theme}
            systemTheme={systemTheme}
            isCustomTheme={isCustomTheme}
            setTheme={setTheme}
            resetToDefault={resetToDefault}
            toggleTheme={handleToggleTheme}
            bgPreset={bgPreset}
            setBgPreset={setBgPreset}
            ambient={ambient}
            setAmbient={setAmbient}
            ambientVolume={ambientVolume}
            setAmbientVolume={setAmbientVolume}
            uiSounds={uiSounds}
            setUiSounds={setUiSounds}
            playToggle={playToggle}
          />
        )}
      </div>
    )
  }

  /* ── Signed in ── */
  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => { setOpen(!open); playClick() }}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Avatar src={session.user.image} name={session.user.name} />
      </button>

      {/* Dropdown */}
      {open && (
        <DropdownPanel
          theme={theme}
          systemTheme={systemTheme}
          isCustomTheme={isCustomTheme}
          setTheme={setTheme}
          resetToDefault={resetToDefault}
          toggleTheme={handleToggleTheme}
          bgPreset={bgPreset}
          setBgPreset={setBgPreset}
          ambient={ambient}
          setAmbient={setAmbient}
          ambientVolume={ambientVolume}
          setAmbientVolume={setAmbientVolume}
          uiSounds={uiSounds}
          setUiSounds={setUiSounds}
          playToggle={playToggle}
          isAdmin={isAdmin}
          userName={session.user.name}
          onSignOut={() => signOut()}
        />
      )}
    </div>
  )
}

/* ── Dropdown Panel ── */
function DropdownPanel({
  theme,
  systemTheme,
  isCustomTheme,
  setTheme,
  resetToDefault,
  toggleTheme,
  bgPreset,
  setBgPreset,
  ambient,
  setAmbient,
  ambientVolume,
  setAmbientVolume,
  uiSounds,
  setUiSounds,
  playToggle,
  isAdmin = false,
  userName,
  onSignOut,
}: {
  theme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
  isCustomTheme: boolean
  setTheme: (t: 'light' | 'dark') => void
  resetToDefault: () => void
  toggleTheme: () => void
  bgPreset: string
  setBgPreset: (p: any) => void
  ambient: string
  setAmbient: (s: any) => void
  ambientVolume: number
  setAmbientVolume: (v: number) => void
  uiSounds: boolean
  setUiSounds: (on: boolean) => void
  playToggle: () => void
  isAdmin?: boolean
  userName?: string | null
  onSignOut?: () => void
}) {
  return (
    <div
      className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-dropdown overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 shadow-xl backdrop-blur-xl dark:border-neutral-700/80 dark:bg-neutral-900/95 sm:w-72"
      role="menu"
    >
      {/* User greeting */}
      {userName && (
        <div className="border-b border-neutral-100 px-3 py-2.5 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Signed in as <span className="font-semibold text-neutral-800 dark:text-neutral-200">{userName}</span>
          </p>
        </div>
      )}

      {/* ── Theme ── */}
      <SectionLabel>Theme</SectionLabel>
      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
        {/* Default Button */}
        <button
          onClick={() => { resetToDefault(); setBgPreset('default'); playToggle(); }}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
            theme === systemTheme && bgPreset === 'default'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
          }`}
        >
          Default
        </button>
        
        {/* Override Button (Opposite of systemTheme) */}
        <button
          onClick={() => { setTheme(systemTheme === 'light' ? 'dark' : 'light'); setBgPreset('default'); playToggle(); }}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
            theme !== systemTheme && bgPreset === 'default'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
          }`}
        >
          {systemTheme === 'light' ? 'Dark' : 'Light'}
        </button>

        {BG_PRESETS.filter(p => p.value !== 'default').map((preset) => (
          <button
            key={preset.value}
            onClick={() => { 
              if (preset.value === 'midnight' || preset.value === 'forest') setTheme('dark');
              if (preset.value === 'sepia' || preset.value === 'rose') setTheme('light');
              setBgPreset(preset.value); 
              playToggle(); 
            }}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
              bgPreset === preset.value
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* ── Sound Effects ── */}
      <div className="border-t border-neutral-100 dark:border-neutral-800">
        <SectionLabel>Sound Effects</SectionLabel>

        {/* Ambient selector */}
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          {AMBIENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setAmbient(opt.value); playToggle() }}
              className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition ${
                ambient === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Volume slider */}
        {ambient !== 'off' && (
          <div className="flex items-center gap-2 px-3 pb-2">
            <input
              type="range"
              min={0}
              max={100}
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-blue-500 dark:bg-neutral-700"
            />
            <span className="min-w-[2ch] text-right text-[10px] font-mono text-neutral-400">
              {ambientVolume}
            </span>
          </div>
        )}

        {/* UI sounds toggle */}
        <div className="flex items-center justify-between px-3 pb-2.5">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">UI sounds</span>
          <button
            onClick={() => { setUiSounds(!uiSounds); playToggle() }}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              uiSounds ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
            role="switch"
            aria-checked={uiSounds}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                uiSounds ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Admin: Modify ── */}
      {isAdmin && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          <SectionLabel>Modify</SectionLabel>
          <div className="pb-1">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                role="menuitem"
              >
                <span className="text-neutral-400 dark:text-neutral-500">→</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Sign out ── */}
      {onSignOut && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
