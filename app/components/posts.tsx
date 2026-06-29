import Link from 'next/link'
import {
  formatDate,
  getBlogPosts,
  type BlogLanguage,
  type BlogPost,
} from 'app/blog/utils'

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
}: {
  limit?: number
  showSummaries?: boolean
  language?: BlogLanguage
}) {
  let allBlogs = await getBlogPosts()
  const posts = allBlogs
    .sort((a, b) => {
      if (
        new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
      ) {
        return -1
      }
      return 1
    })
    .filter((post) => !language || resolvePostLanguage(post) === language)
    .slice(0, limit ?? allBlogs.length)

  if (posts.length === 0) {
    return (
      <div className="surface-panel rounded-2xl px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No blog posts are available for this language yet.
      </div>
    )
  }

  return (
    <div className="glass-list">
      {posts.map((post) => (
        <div
          key={post.slug}
          className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 border-b border-neutral-200/80 py-6 transition-colors hover:border-blue-500/50 dark:border-neutral-800/80"
        >
          <Link href={`/blog/${post.slug}`} className="min-w-0">
            <p className="mb-2 font-mono text-xs text-neutral-500 dark:text-neutral-500">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-blue-600 dark:text-neutral-50 dark:group-hover:text-blue-400">
              {post.metadata.title}
            </h3>
            {showSummaries && post.metadata.summary && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {post.metadata.summary}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="arrow-box hidden sm:grid">-&gt;</span>
          </div>
        </div>
      ))}
    </div>
  )
}
