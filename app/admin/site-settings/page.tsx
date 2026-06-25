'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteSettings } from 'lib/site-settings'

type EditableSettings = SiteSettings & {
  home: SiteSettings['home'] & {
    programmingLanguagesItemsText: string
    frameworksToolsItemsText: string
    technicalSkillsItemsText: string
    languageItemsText: string
  }
}

function toEditable(settings: SiteSettings): EditableSettings {
  return {
    ...settings,
    home: {
      ...settings.home,
      programmingLanguagesItemsText: settings.home.programmingLanguagesItems.join('\n'),
      frameworksToolsItemsText: settings.home.frameworksToolsItems.join('\n'),
      technicalSkillsItemsText: settings.home.technicalSkillsItems.join('\n'),
      languageItemsText: settings.home.languageItems.join('\n'),
    },
  }
}

function toPayload(settings: EditableSettings): SiteSettings {
  const {
    programmingLanguagesItemsText,
    frameworksToolsItemsText,
    technicalSkillsItemsText,
    languageItemsText,
    ...home
  } = settings.home

  return {
    ...settings,
    home: {
      ...home,
      programmingLanguagesItems: settings.home.programmingLanguagesItemsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      frameworksToolsItems: settings.home.frameworksToolsItemsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      technicalSkillsItems: settings.home.technicalSkillsItemsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      languageItems: settings.home.languageItemsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    },
  }
}

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

export default function SiteSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<EditableSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => setSettings(toEditable(data.settings)))
      .catch(() => setError('Failed to load site settings'))
  }, [])

  const updateHome = (key: keyof EditableSettings['home'], value: string) => {
    setSettings((current) =>
      current ? { ...current, home: { ...current.home, [key]: value } } : current,
    )
  }

  const updateSection = <K extends 'projectsPage' | 'blogPage' | 'footer'>(
    section: K,
    key: keyof EditableSettings[K],
    value: string,
  ) => {
    setSettings((current) =>
      current ? { ...current, [section]: { ...current[section], [key]: value } } : current,
    )
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: toPayload(settings) }),
      })
      const data = await readJsonResponse(res)
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    }

    setSaving(false)
  }

  if (!settings && !error) {
    return <p className="text-sm text-neutral-400">Loading...</p>
  }

  if (!settings) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">Edit site labels</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-neutral-100 dark:text-black"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/40">
          {error}
        </p>
      )}

      <div className="space-y-8">
        <section className="surface-panel rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Home</h3>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={settings.home.eyebrow} onChange={(v) => updateHome('eyebrow', v)} />
            <Field label="Headline" value={settings.home.headline} onChange={(v) => updateHome('headline', v)} multiline />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary CTA label" value={settings.home.primaryCtaLabel} onChange={(v) => updateHome('primaryCtaLabel', v)} />
              <Field label="Primary CTA link" value={settings.home.primaryCtaHref} onChange={(v) => updateHome('primaryCtaHref', v)} />
              <Field label="Secondary CTA label" value={settings.home.secondaryCtaLabel} onChange={(v) => updateHome('secondaryCtaLabel', v)} />
              <Field label="Secondary CTA link" value={settings.home.secondaryCtaHref} onChange={(v) => updateHome('secondaryCtaHref', v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Programming language label" value={settings.home.programmingLanguagesLabel} onChange={(v) => updateHome('programmingLanguagesLabel', v)} />
              <Field label="Frameworks & tools label" value={settings.home.frameworksToolsLabel} onChange={(v) => updateHome('frameworksToolsLabel', v)} />
              <Field label="Technical skills label" value={settings.home.technicalSkillsLabel} onChange={(v) => updateHome('technicalSkillsLabel', v)} />
              <Field label="Language label" value={settings.home.languageLabel} onChange={(v) => updateHome('languageLabel', v)} />
            </div>
            <Field label="Programming languages, one per line" value={settings.home.programmingLanguagesItemsText} onChange={(v) => updateHome('programmingLanguagesItemsText', v)} multiline />
            <Field label="Frameworks & tools, one per line" value={settings.home.frameworksToolsItemsText} onChange={(v) => updateHome('frameworksToolsItemsText', v)} multiline />
            <Field label="Technical skills, one per line" value={settings.home.technicalSkillsItemsText} onChange={(v) => updateHome('technicalSkillsItemsText', v)} multiline />
            <Field label="Languages, one per line" value={settings.home.languageItemsText} onChange={(v) => updateHome('languageItemsText', v)} multiline />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact label" value={settings.home.contactLabel} onChange={(v) => updateHome('contactLabel', v)} />
              <Field label="Featured title" value={settings.home.featuredTitle} onChange={(v) => updateHome('featuredTitle', v)} />
            </div>
            <Field label="Contact description" value={settings.home.contactDescription} onChange={(v) => updateHome('contactDescription', v)} multiline />
            <Field label="Featured description" value={settings.home.featuredDescription} onChange={(v) => updateHome('featuredDescription', v)} multiline />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latest title" value={settings.home.latestTitle} onChange={(v) => updateHome('latestTitle', v)} />
              <Field label="Latest description" value={settings.home.latestDescription} onChange={(v) => updateHome('latestDescription', v)} multiline />
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Projects page</h3>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={settings.projectsPage.eyebrow} onChange={(v) => updateSection('projectsPage', 'eyebrow', v)} />
            <Field label="Title" value={settings.projectsPage.title} onChange={(v) => updateSection('projectsPage', 'title', v)} />
            <Field label="Description" value={settings.projectsPage.description} onChange={(v) => updateSection('projectsPage', 'description', v)} multiline />
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Blog page</h3>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={settings.blogPage.eyebrow} onChange={(v) => updateSection('blogPage', 'eyebrow', v)} />
            <Field label="Title" value={settings.blogPage.title} onChange={(v) => updateSection('blogPage', 'title', v)} />
            <Field label="Description" value={settings.blogPage.description} onChange={(v) => updateSection('blogPage', 'description', v)} multiline />
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Footer</h3>
          <div className="grid gap-4">
            <Field label="Title" value={settings.footer.title} onChange={(v) => updateSection('footer', 'title', v)} />
            <Field label="Description" value={settings.footer.description} onChange={(v) => updateSection('footer', 'description', v)} multiline />
          </div>
        </section>
      </div>
    </div>
  )
}
