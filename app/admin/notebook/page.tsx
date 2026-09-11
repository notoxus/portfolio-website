'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FONT_SIZE_MAX, FONT_SIZE_MIN, type FontSizeSettings } from 'lib/font-sizes'
import type { SiteSettings } from 'lib/site-settings'

const SIZE_FIELDS: Array<{ key: keyof FontSizeSettings; label: string }> = [
  { key: 'notebookTitle', label: 'Title' },
  { key: 'notebookDescription', label: 'Description' },
  { key: 'notebookFile', label: 'File names' },
]

export default function AdminNotebookPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/site-settings').then((res) => res.json()).then((data) => setSettings(data.settings)).catch(() => setError('Failed to load notebook settings'))
  }, [])

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setMessage('Notebook settings saved')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!settings && !error) return <p className="text-sm text-neutral-400">Loading...</p>
  if (!settings) return <p className="text-sm text-red-500">{error}</p>

  const updatePage = (key: keyof SiteSettings['notebookPage'], value: string) => setSettings({ ...settings, notebookPage: { ...settings.notebookPage, [key]: value } })

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Notebook editor</h2>
          <p className="mt-1 text-sm text-neutral-500">Configure the public GitHub notebook explorer.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-md bg-neutral-900 px-5 py-1.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-black">{saving ? 'Saving...' : 'Save'}</button>
      </div>
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
      {message && <p className="rounded-md bg-blue-500/10 px-3 py-2 text-sm text-blue-500">{message}</p>}
      <section className="surface-panel grid gap-4 rounded-2xl p-5">
        {(['title', 'description', 'owner', 'repo', 'branch'] as const).map((key) => (
          <label key={key}>
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{key}</span>
            {key === 'description' ? (
              <textarea rows={3} value={settings.notebookPage[key]} onChange={(event) => updatePage(key, event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            ) : (
              <input value={settings.notebookPage[key]} onChange={(event) => updatePage(key, event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            )}
          </label>
        ))}
        <div className="grid gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800 sm:grid-cols-3">
          {SIZE_FIELDS.map((item) => (
            <label key={item.key}>
              <span className="text-xs text-neutral-500">{item.label} size</span>
              <div className="relative">
                <input type="number" min={FONT_SIZE_MIN} max={FONT_SIZE_MAX} value={settings.fontSizes[item.key]} onChange={(event) => setSettings({ ...settings, fontSizes: { ...settings.fontSizes, [item.key]: Number(event.target.value) } })} className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
                <span className="pointer-events-none absolute right-3 top-3 text-xs text-neutral-400">px</span>
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
