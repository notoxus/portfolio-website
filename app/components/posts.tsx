import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

export function BlogPosts({
  limit,
  showSummaries = true,
}: {
  limit?: number
  showSummaries?: boolean
}) {
  let allBlogs = getBlogPosts()
  const posts = allBlogs
    .sort((a, b) => {
      if (
        new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
      ) {
        return -1
      }
      return 1
    })
    .slice(0, limit ?? allBlogs.length)

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
            {post.metadata.category && (
              <span className="mt-3 inline-flex rounded-full bg-neutral-200/70 px-2.5 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {post.metadata.category}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <span className="arrow-box hidden sm:grid">-&gt;</span>
          </div>
        </div>
      ))}
    </div>
  )
}
