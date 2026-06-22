'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditIntroPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/intro')
      .then(r => r.json())
      .then(d => {
        setContent(d.content ?? '')
        setLoaded(true)
      })
      .catch(() => setError('Failed to load intro'))
  }, [])

  const save = async () => {
    if (!content.trim()) {
      setError('Content is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Save failed')
      router.push('/')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  if (!loaded && !error) {
    return <p className="text-sm text-neutral-400">Loading...</p>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold">Edit homepage intro</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-md">{error}</p>
      )}

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
      />
      <p className="mt-2 text-xs text-neutral-400">
        This text appears under your name on the homepage. Saving commits to GitHub; the live site updates after the next deploy.
      </p>
    </div>
  )
}
