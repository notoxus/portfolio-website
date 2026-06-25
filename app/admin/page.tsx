import { getBlogPosts } from 'app/blog/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const posts = getBlogPosts().sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  )

  return (
    <div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/site-settings"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Site labels</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit homepage, blog, projects, and footer text.
          </p>
        </Link>
        <Link
          href="/admin/blog"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Blog content</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit blog labels and MDX posts.
          </p>
        </Link>
        <Link
          href="/admin/projects"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Project content</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit project labels and portfolio entries.
          </p>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-semibold">Posts ({posts.length})</h2>
        <Link
          href="/admin/new-post"
          className="px-4 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium hover:opacity-80 transition-opacity"
        >
          + New post
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {posts.map(post => (
          <div key={post.slug} className="py-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{post.metadata.title}</span>
              <span className="text-xs text-neutral-400">
                {post.metadata.category && <>{post.metadata.category} &middot; </>}
                {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                view &#8599;
              </Link>
              <Link
                href={`/admin/edit/${post.slug}`}
                className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                edit
              </Link>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-sm text-neutral-400 py-8 text-center">No posts yet.</p>
        )}
      </div>
    </div>
  )
}
