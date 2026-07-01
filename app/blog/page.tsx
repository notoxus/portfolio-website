import Link from 'next/link'
import { BlogPosts } from 'app/components/posts'
import AdminEditLink from 'app/components/AdminEditLink'
import { getSiteSettings } from 'lib/site-settings'
import type { BlogLanguage } from 'app/blog/utils'

export const metadata = {
  title: 'Blog',
  description:
    'Vietnamese and English blog posts by Phuoc Thinh on networking, Linux, security fundamentals, and software design.',
  openGraph: {
    title: 'Blog — Phuoc Thinh',
    description:
      'Vietnamese and English blog posts by Phuoc Thinh on networking, Linux, security fundamentals, and software design.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Phuoc Thinh',
    description:
      'Vietnamese and English blog posts by Phuoc Thinh on networking, Linux, security fundamentals, and software design.',
  },
}

const languageFilters: Array<{
  label: string
  language?: BlogLanguage
  href: string
}> = [
  { label: 'All posts', href: '/blog' },
  { label: 'Vietnamese', language: 'vi', href: '/blog?language=vi' },
  { label: 'English', language: 'en', href: '/blog?language=en' },
]

import SearchInput from 'app/components/SearchInput'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; q?: string }>
}) {
  const settings = getSiteSettings()
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME
  const params = await searchParams
  const selectedLanguage: BlogLanguage | undefined =
    params.language === 'vi' || params.language === 'en' ? params.language : undefined
  const q = params.q

  return (
    <section>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-500">
            {settings.blogPage.eyebrow}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
              {settings.blogPage.title}
            </h1>
            <AdminEditLink href="/admin/blog" label="edit blog" adminUsername={adminUsername} />
          </div>
        </div>
        <p className="max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-right">
          {settings.blogPage.description}
        </p>
      </div>

      <div className="mb-7 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <nav
          aria-label="Filter blog posts by language"
          className="flex flex-wrap items-center gap-2"
        >
          {languageFilters.map((filter) => {
            const active = filter.language === selectedLanguage
            // Preserve search query when changing language
            const href = q 
              ? (filter.href.includes('?') ? `${filter.href}&q=${encodeURIComponent(q)}` : `${filter.href}?q=${encodeURIComponent(q)}`)
              : filter.href

            return (
              <Link
                key={filter.label}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                    : 'border-neutral-200 bg-white/70 text-neutral-600 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-400 dark:hover:text-blue-400'
                }`}
              >
                {filter.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="w-full sm:w-80 mt-0 !mb-0 flex-shrink-0">
          <SearchInput placeholder="Search posts by title or summary..." />
        </div>
      </div>
      
      <BlogPosts language={selectedLanguage} searchQuery={q} />
    </section>
  )
}
