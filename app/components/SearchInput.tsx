'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export default function SearchInput({ 
  placeholder = 'Search...',
  className = ''
}: { 
  placeholder?: string
  className?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams?.get('q') || '')

  useEffect(() => {
    setQuery(searchParams?.get('q') || '')
  }, [searchParams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleSearch}
        className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-2 text-sm text-neutral-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
        </div>
      )}
    </div>
  )
}
