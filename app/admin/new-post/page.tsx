'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const RichTextEditor = dynamic(() => import('app/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg h-[480px] flex items-center justify-center text-sm text-neutral-400">
      Loading editor...
    </div>
  ),
})

const today = new Date().toISOString().split('T')[0]

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState<'vi' | 'en'>('vi')
  const [publishedAt, setPublishedAt] = useState(today)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')

  const handleTitle = (v: string) => {
    setTitle(v)
    if (!slug || slug === autoSlug(title)) setSlug(autoSlug(v))
  }

  const publish = async () => {
    if (!title || !slug || !summary || !content) {
      setError('Title, slug, summary, and content are required.')
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
          event: 'POST_CREATED',
          metadata: { title, publishedAt, summary, category, language },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Publish failed')
      router.push('/admin')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold">New post</h2>
        <button
          onClick={publish}
          disabled={saving}
          className="px-5 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
        >
          {saving ? 'Publishing...' : 'Publish'}
        </button>
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
            onChange={e => handleTitle(e.target.value)}
            placeholder="Post title"
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="my-post-slug"
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Published date *</label>
            <input
              type="date"
              value={publishedAt}
              onChange={e => setPublishedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Summary *</label>
            <input
              type="text"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief description"
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Design Patterns"
              className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Language *</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'vi' | 'en')}
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Content *</label>
        <div className="mt-1">
          <RichTextEditor onChange={setContent} placeholder="Start writing your post..." />
        </div>
      </div>
    </div>
  )
}
