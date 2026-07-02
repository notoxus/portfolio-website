import Link from 'next/link'
import {
  formatDate,
  getBlogPosts,
  type BlogLanguage,
  type BlogPost,
} from 'app/blog/utils'
import { ViewCounter } from 'app/components/ViewCounter'
import { StaggerContainer, StaggerItem } from 'app/components/FadeIn'

const languageLabels: Record<BlogLanguage, string> = {
  vi: 'VI',
  en: 'EN',
}

function resolvePostLanguage(post: BlogPost): BlogLanguage {
  if (post.metadata.language === 'vi' || post.metadata.language === 'en') {
    return post.metadata.language
  }

  return /[À-ỹ]/.test(`${post.metadata.title} ${post.metadata.summary}`) ? 'vi' : 'en'
}

export async function BlogPosts({
  limit,
  showSummaries = true,
  language,
  searchQuery = '',
}: {
  limit?: number
  showSummaries?: boolean
  language?: BlogLanguage
  searchQuery?: string
}) {
  let allBlogs = await getBlogPosts()
  let posts = allBlogs
    .sort((a, b) => {
      if (
        new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
      ) {
        return -1
      }
      return 1
    })
    .filter((post) => !language || resolvePostLanguage(post) === language)

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    posts = posts.filter(
      (post) =>
        post.metadata.title.toLowerCase().includes(q) ||
        (post.metadata.summary && post.metadata.summary.toLowerCase().includes(q)) ||
        (post.metadata.category && post.metadata.category.toLowerCase().includes(q))
    )
  }

  posts = posts.slice(0, limit ?? posts.length)

  if (posts.length === 0) {
    return (
      <div className="surface-panel rounded-2xl px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No blog posts are available for this language yet.
      </div>
    )
  }

  return (
    <StaggerContainer className="glass-list">
      {posts.map((post) => (
        <StaggerItem
          key={post.slug}
          className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-200/80 px-4 py-4 transition-colors hover:border-blue-500/50 dark:border-neutral-800/80 sm:gap-5 sm:px-5 sm:py-6"
        >
          <Link href={`/blog/${post.slug}`} className="min-w-0">
            <p className="mb-1.5 font-mono text-xs text-neutral-500 dark:text-neutral-500 sm:mb-2">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <h3 className="text-base font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-blue-600 dark:text-neutral-50 dark:group-hover:text-blue-400 sm:text-lg">
              {post.metadata.title}
            </h3>
            {showSummaries && post.metadata.summary && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {post.metadata.summary}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300"
                title={resolvePostLanguage(post) === 'vi' ? 'Tiếng Việt' : 'English'}
              >
                {languageLabels[resolvePostLanguage(post)]}
              </span>
              {post.metadata.category && (
                <span className="inline-flex rounded-full bg-neutral-200/70 px-2.5 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {post.metadata.category}
                </span>
              )}
              <div className="ml-2">
                <ViewCounter slug={post.slug} />
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="arrow-box hidden sm:grid">-&gt;</span>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
