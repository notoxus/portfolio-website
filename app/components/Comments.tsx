'use client'

import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Comment {
  id: number
  body: string
  created_at: string
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
}

interface Props {
  slug: string
}

function Avatar({ src, name, size = 32 }: { src?: string | null; name?: string | null; size?: number }) {
  const [errored, setErrored] = useState(false)
  const initial = (name ?? '?').charAt(0).toUpperCase()
  const dimension = `${size}px`

  if (!src || errored) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-neutral-300 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
        style={{ width: dimension, height: dimension }}
      >
        {initial}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={name ?? 'avatar'}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: dimension, height: dimension }}
      unoptimized
      onError={() => setErrored(true)}
    />
  )
}

export default function Comments({ slug }: Props) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch {}
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchComments() }, [fetchComments])

  const submit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Failed to post comment')
      } else {
        setText('')
        await fetchComments()
      }
    } catch {
      setError('Network error')
    }
    setSubmitting(false)
  }

  return (
    <section className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
      <h2 className="text-lg font-semibold mb-6 tracking-tight">Comments</h2>

      {/* Comment list */}
      {loading ? (
        <p className="text-sm text-neutral-400">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-400">No comments yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-6 mb-8">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <a href={c.user.html_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Avatar src={c.user.avatar_url} name={c.user.login} />
              </a>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <a
                    href={c.user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
                  >
                    {c.user.login}
                  </a>
                  <span className="text-xs text-neutral-400">
                    {new Date(c.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {session ? (
        <div className="flex gap-3">
          <Avatar src={(session as any).avatar ?? session.user?.image} name={(session as any).login ?? session.user?.name ?? 'you'} />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                onClick={submit}
                disabled={submitting || !text.trim()}
                className="px-4 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 flex-1">
            Sign in with GitHub to leave a comment.
          </p>
          <button
            onClick={() => signIn('github')}
            className="px-4 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </button>
        </div>
      )}
    </section>
  )
}
