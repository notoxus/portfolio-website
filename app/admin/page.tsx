import { getBlogPosts } from 'app/blog/utils'
import Link from 'next/link'
import { neon } from '@neondatabase/serverless'

export default async function AdminDashboard() {
  const posts = (await getBlogPosts()).sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  )

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL!
  const viewsBySlug: Record<string, number> = {}
  if (dbUrl) {
    try {
      const sql = neon(dbUrl)
      const pageViews = await sql`SELECT slug, count FROM page_views`
      pageViews.forEach((row) => {
        viewsBySlug[String(row.slug)] = Number(row.count) || 0
      })
    } catch (e) {
      console.error('Unable to load page views', e)
    }
  }

  return (
    <div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/homepage"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Homepage</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit hero, side card, sections, social links, and footer.
          </p>
        </Link>
        <Link
          href="/admin/blog"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Blog</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit blog labels and MDX posts.
          </p>
        </Link>
        <Link
          href="/admin/projects"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Projects</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Edit project labels and portfolio entries.
          </p>
        </Link>
        <Link
          href="/admin/notebook"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Notebook</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Configure the notebook repository, labels, and typography.
          </p>
        </Link>
        <Link
          href="/admin/custom-menu"
          className="surface-panel rounded-2xl p-4 transition hover:border-blue-500"
        >
          <span className="text-sm font-semibold">Custom Menu</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Add, hide, remove, and reorder navigation items.
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
        {posts.map((post) => (
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
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-xs text-neutral-400">
                {(viewsBySlug[post.slug] ?? 0).toLocaleString()} views
              </span>
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
