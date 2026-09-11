'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FONT_SIZE_MAX, FONT_SIZE_MIN } from 'lib/font-sizes'
import type { NavigationItem, SiteSettings } from 'lib/site-settings'

export default function CustomMenuPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setError('Failed to load menu settings'))
  }, [])

  const changeItems = (navigation: NavigationItem[]) => {
    setSettings((current) => current ? { ...current, navigation } : current)
  }

  const updateItem = (index: number, patch: Partial<NavigationItem>) => {
    if (!settings) return
    changeItems(settings.navigation.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  const move = (index: number, offset: number) => {
    if (!settings) return
    const target = index + offset
    if (target < 0 || target >= settings.navigation.length) return
    const navigation = [...settings.navigation]
    ;[navigation[index], navigation[target]] = [navigation[target], navigation[index]]
    changeItems(navigation)
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setMessage('Menu saved')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!settings && !error) return <p className="text-sm text-neutral-400">Loading...</p>
  if (!settings) return <p className="text-sm text-red-500">{error}</p>

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Custom Menu</h2>
          <p className="mt-1 text-sm text-neutral-500">Add, hide, remove, and reorder navigation links.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-md bg-neutral-900 px-5 py-1.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-black">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
      {message && <p className="rounded-md bg-blue-500/10 px-3 py-2 text-sm text-blue-500">{message}</p>}

      <section className="surface-panel rounded-2xl p-5">
        <label className="block max-w-xs">
          <span className="text-xs text-neutral-500">Menu font size</span>
          <div className="relative">
            <input type="number" min={FONT_SIZE_MIN} max={FONT_SIZE_MAX} value={settings.fontSizes.navigationLabel} onChange={(event) => setSettings({ ...settings, fontSizes: { ...settings.fontSizes, navigationLabel: Number(event.target.value) } })} className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            <span className="pointer-events-none absolute right-3 top-3 text-xs text-neutral-400">px</span>
          </div>
        </label>
      </section>

      <section className="space-y-3">
        {settings.navigation.map((item, index) => (
          <div key={item.id} className="surface-panel rounded-xl p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <input aria-label="Menu label" value={item.label} onChange={(event) => updateItem(index, { label: event.target.value })} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
              <input aria-label="Menu URL" value={item.href} onChange={(event) => updateItem(index, { href: event.target.value })} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
              <label className="flex items-center gap-2 text-sm text-neutral-500">
                <input type="checkbox" checked={item.visible} onChange={(event) => updateItem(index, { visible: event.target.checked })} /> Visible
              </label>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded px-2 py-1 text-xs text-neutral-500 disabled:opacity-30">↑ Up</button>
              <button type="button" disabled={index === settings.navigation.length - 1} onClick={() => move(index, 1)} className="rounded px-2 py-1 text-xs text-neutral-500 disabled:opacity-30">↓ Down</button>
              <button type="button" onClick={() => changeItems(settings.navigation.filter((_, itemIndex) => itemIndex !== index))} className="rounded px-2 py-1 text-xs text-red-500">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => changeItems([...settings.navigation, { id: `menu-${Date.now()}`, label: 'new link', href: '/', visible: true }])} className="rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-blue-500 hover:text-blue-500 dark:border-neutral-700">
          + Add menu item
        </button>
      </section>
    </div>
  )
}
