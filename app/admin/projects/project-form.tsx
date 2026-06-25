'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from 'lib/projects'

const emptyProject: Project = {
  id: '',
  title: '',
  kind: '',
  accent: 'green',
  tech: '',
  description: '',
  link: '',
  featured: false,
}

function autoId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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

export default function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const [project, setProject] = useState<Project>(emptyProject)
  const [loaded, setLoaded] = useState(!projectId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return

    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.project) throw new Error(data.error ?? 'Project not found')
        setProject(data.project)
        setLoaded(true)
      })
      .catch((err: any) => setError(err.message ?? 'Failed to load project'))
  }, [projectId])

  const update = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject((current) => ({ ...current, [key]: value }))
  }

  const handleTitle = (value: string) => {
    setProject((current) => ({
      ...current,
      title: value,
      id: projectId ? current.id : current.id && current.id !== autoId(current.title) ? current.id : autoId(value),
    }))
  }

  const save = async () => {
    if (!project.title || !project.kind || !project.tech || !project.description || !project.link) {
      setError('All project fields are required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(projectId ? `/api/projects/${projectId}` : '/api/projects', {
        method: projectId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      })
      const data = await readJsonResponse(res)
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/admin/projects')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    }

    setSaving(false)
  }

  if (!loaded && !error) {
    return <p className="text-sm text-neutral-400">Loading...</p>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">{projectId ? 'Edit project' : 'New project'}</h2>
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

      <div className="grid gap-4">
        {!projectId && (
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Project id
            </span>
            <input
              value={project.id}
              onChange={(event) => update('id', event.target.value)}
              placeholder="my-project"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Title
          </span>
          <input
            value={project.title}
            onChange={(event) => handleTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Kind label
            </span>
            <input
            value={project.kind}
            onChange={(event) => update('kind', event.target.value)}
              placeholder="Desktop app"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Accent
            </span>
            <select
              value={project.accent ?? 'green'}
              onChange={(event) => update('accent', event.target.value as Project['accent'])}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            >
              <option value="green">Green</option>
              <option value="amber">Amber</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Tech stack
          </span>
          <input
            value={project.tech}
            onChange={(event) => update('tech', event.target.value)}
            placeholder="Next.js / TypeScript"
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Description
          </span>
          <textarea
            value={project.description}
            onChange={(event) => update('description', event.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Link
          </span>
          <input
            value={project.link}
            onChange={(event) => update('link', event.target.value)}
            placeholder="https://github.com/notoxus/project"
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950/60">
          <input
            type="checkbox"
            checked={project.featured === true}
            onChange={(event) => update('featured', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700"
          />
          <span>
            <span className="block font-medium">Pin to Featured work</span>
            <span className="mt-1 block text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              Featured work shows pinned projects first, up to three items.
            </span>
          </span>
        </label>
      </div>
    </div>
  )
}
