'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteSettings } from 'lib/site-settings'

type EditableSettings = SiteSettings

function SkillGroupsEditor({
  groups,
  onChange,
}: {
  groups: SiteSettings['home']['skillGroups']
  onChange: (groups: SiteSettings['home']['skillGroups']) => void
}) {
  const updateGroupLabel = (index: number, label: string) => {
    onChange(groups.map((group, i) => (i === index ? { ...group, label } : group)))
  }

  const addGroup = () => {
    onChange([...groups, { label: 'New group', items: [] }])
  }

  const removeGroup = (index: number) => {
    onChange(groups.filter((_, i) => i !== index))
  }

  const addTag = (index: number, tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    onChange(
      groups.map((group, i) =>
        i === index ? { ...group, items: [...group.items, trimmed] } : group,
      ),
    )
  }

  const removeTag = (groupIndex: number, itemIndex: number) => {
    onChange(
      groups.map((group, i) =>
        i === groupIndex
          ? { ...group, items: group.items.filter((_, j) => j !== itemIndex) }
          : group,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Skill groups
      </span>
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-center gap-2">
            <input
              value={group.label}
              onChange={(event) => updateGroupLabel(groupIndex, event.target.value)}
              placeholder="Group label"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
            <button
              type="button"
              onClick={() => removeGroup(groupIndex)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:text-red-500"
            >
              Remove group
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {group.items.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeTag(groupIndex, itemIndex)}
                  aria-label={`Remove ${item}`}
                  className="text-neutral-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
            <TagInput onAdd={(tag) => addTag(groupIndex, tag)} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addGroup}
        className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
      >
        + Add group
      </button>
    </div>
  )
}

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }

  return (
    <span className="flex items-center gap-1">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
        }}
        placeholder="New tag"
        className="w-24 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Add tag"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
      >
        +
      </button>
    </span>
  )
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
      .then((data) => setSettings(data.settings))
      .catch(() => setError('Failed to load site settings'))
  }, [])

  const updateHome = <K extends keyof EditableSettings['home']>(
    key: K,
    value: EditableSettings['home'][K],
  ) => {
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
        body: JSON.stringify({ settings }),
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
            <SkillGroupsEditor
              groups={settings.home.skillGroups}
              onChange={(groups) => updateHome('skillGroups', groups)}
            />
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
