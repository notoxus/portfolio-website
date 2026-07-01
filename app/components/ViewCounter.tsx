'use client'

import { useEffect, useState } from 'react'

export function ViewCounter({ slug, trackView = false }: { slug: string; trackView?: boolean }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const method = trackView ? 'POST' : 'GET'
        const res = await fetch(`/api/views/${slug}`, { method })
        if (res.ok) {
          const data = await res.json()
          if (data.count !== undefined) {
            setViews(data.count)
          }
        }
      } catch (error) {
        console.error('Error fetching views:', error)
      }
    }

    fetchViews()
  }, [slug, trackView])

  if (views === null) return null

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {views.toLocaleString()} views
    </span>
  )
}
