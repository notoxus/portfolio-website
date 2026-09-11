'use client'

import { useEffect } from 'react'

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const storageKey = `portfolio-viewed:${slug}`

    try {
      if (window.sessionStorage.getItem(storageKey)) return
      window.sessionStorage.setItem(storageKey, 'pending')
    } catch {
      // Tracking can still proceed if session storage is restricted.
    }

    void fetch(`/api/views/${encodeURIComponent(slug)}`, {
      method: 'POST',
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) throw new Error('View tracking failed')
      })
      .catch(() => {
        try {
          window.sessionStorage.removeItem(storageKey)
        } catch {}
      })
  }, [slug])

  return null
}
