'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const RichTextEditor = dynamic(() => import('app/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg h-[480px] flex items-center justify-center text-sm text-neutral-400">
      Loading editor...
    </div>
  ),
})

export default function EditPostPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [content, setContent] = useState('')
  const [initialContent, setInitialContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/post/${slug}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.metadata.title ?? '')
        setSummary(data.metadata.summary ?? '')
        setCategory(data.metadata.category ?? '')
        setPublishedAt(data.metadata.publishedAt ?? '')
        setInitialContent(data.content ?? '')
        setContent(data.content ?? '')
        setLoaded(true)
      })
      .catch(() => setError('Failed to load post'))
  }, [slug])

  const save = async () => {
    if (!title || !summary || !content) {
      setError('Title, summary, and content are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          content,
          event: 'POST_UPDATED',
          metadata: { title, publishedAt, summary, category },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/admin')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  if (!loaded && !error) {
    return <p className="text-sm text-neutral-400">Loading post...</p>
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold">Edit: <span className="font-mono text-sm text-neutral-400">{slug}</span></h2>
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
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Published date</label>
            <input
              type="date"
              value={publishedAt}
              onChange={e => setPublishedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Summary *</label>
          <input
            type="text"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Content *</label>
        <div className="mt-1">
          {loaded && <RichTextEditor initialContent={initialContent} onChange={setContent} />}
        </div>
      </div>
    </div>
  )
}
