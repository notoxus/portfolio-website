'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteSettings } from 'lib/site-settings'

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

export default function ProjectSettingsForm({ settings: initialSettings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const updateHome = (key: 'featuredTitle' | 'featuredDescription', value: string) => {
    setSettings((current) => ({
      ...current,
      home: { ...current.home, [key]: value },
    }))
  }

  const updateProjectsPage = (key: keyof SiteSettings['projectsPage'], value: string) => {
    setSettings((current) => ({
      ...current,
      projectsPage: { ...current.projectsPage, [key]: value },
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
          <h2 className="text-base font-semibold">Project labels</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit the public projects page and homepage featured-work block.
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Featured title"
            value={settings.home.featuredTitle}
            onChange={(value) => updateHome('featuredTitle', value)}
          />
          <Field
            label="Projects page title"
            value={settings.projectsPage.title}
            onChange={(value) => updateProjectsPage('title', value)}
          />
        </div>
        <Field
          label="Featured description"
          value={settings.home.featuredDescription}
          onChange={(value) => updateHome('featuredDescription', value)}
          multiline
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Projects page eyebrow"
            value={settings.projectsPage.eyebrow}
            onChange={(value) => updateProjectsPage('eyebrow', value)}
          />
          <Field
            label="Projects page description"
            value={settings.projectsPage.description}
            onChange={(value) => updateProjectsPage('description', value)}
            multiline
          />
        </div>
      </div>
    </section>
  )
}
