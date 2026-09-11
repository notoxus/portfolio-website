'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteSettings } from 'lib/site-settings'
import { FONT_SIZE_MAX, FONT_SIZE_MIN, type FontSizeSettings } from 'lib/font-sizes'

const BLOG_SIZE_FIELDS: Array<{ key: keyof FontSizeSettings; label: string }> = [
  { key: 'blogEyebrow', label: 'Page eyebrow' },
  { key: 'blogTitle', label: 'Page title' },
  { key: 'blogDescription', label: 'Page description' },
  { key: 'postTitle', label: 'Post title' },
  { key: 'postSummary', label: 'Post summary' },
  { key: 'postMeta', label: 'Post date' },
  { key: 'postBadge', label: 'Post badges' },
]

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      )}
    </label>
  )
}

async function readJsonResponse(res: Response) {
  const text = await res.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

export default function BlogSettingsForm({ settings: initialSettings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const updateBlogPage = (key: keyof SiteSettings['blogPage'], value: string) => {
    setSettings((current) => ({
      ...current,
      blogPage: { ...current.blogPage, [key]: value },
    }))
  }

  const updateFontSize = (key: keyof FontSizeSettings, value: number) => {
    setSettings((current) => ({
      ...current,
      fontSizes: { ...current.fontSizes, [key]: value },
    }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = await readJsonResponse(res)
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setMessage('Saved')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    }

    setSaving(false)
  }

  return (
    <section className="surface-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Blog labels</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit the public blog heading. Homepage post sections stay in Homepage.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-neutral-100 dark:text-black"
        >
          {saving ? 'Saving...' : 'Save labels'}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/40">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          {message}
        </p>
      )}

      <div className="grid gap-4">
        <Field
          label="Blog page title"
          value={settings.blogPage.title}
          onChange={(value) => updateBlogPage('title', value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Blog page eyebrow"
            value={settings.blogPage.eyebrow}
            onChange={(value) => updateBlogPage('eyebrow', value)}
          />
          <Field
            label="Blog page description"
            value={settings.blogPage.description}
            onChange={(value) => updateBlogPage('description', value)}
            multiline
          />
        </div>
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="mb-3 text-sm font-semibold">Typography</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_SIZE_FIELDS.map((item) => (
              <label key={item.key}>
                <span className="text-xs text-neutral-500">{item.label}</span>
                <div className="relative">
                  <input
                    type="number"
                    min={FONT_SIZE_MIN}
                    max={FONT_SIZE_MAX}
                    value={settings.fontSizes[item.key]}
                    onChange={(event) => updateFontSize(item.key, Number(event.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <span className="pointer-events-none absolute right-3 top-3 text-xs text-neutral-400">px</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
