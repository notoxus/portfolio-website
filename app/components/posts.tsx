import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import AdminEditLink from './AdminEditLink'

export function BlogPosts() {
  let allBlogs = getBlogPosts()
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <div
            key={post.slug}
            className="flex items-center justify-between gap-3 mb-4 group"
          >
            <Link
              className="flex flex-col space-y-1 min-w-0 flex-1"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
                <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                  {formatDate(post.metadata.publishedAt, false)}
                </p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {post.metadata.title}
                </p>
              </div>
            </Link>
            <AdminEditLink href={`/admin/edit/${post.slug}`} adminUsername={adminUsername} />
          </div>
        ))}
    </div>
  )
}
