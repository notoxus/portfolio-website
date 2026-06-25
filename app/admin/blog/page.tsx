import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { getSiteSettings } from 'lib/site-settings'
import BlogSettingsForm from './blog-settings-form'

export default function AdminBlogPage() {
  const settings = getSiteSettings()
  const posts = getBlogPosts().sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Blog content</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage labels and MDX posts from one place.
          </p>
        </div>
        <Link
          href="/admin/new-post"
          className="inline-flex w-fit rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-neutral-100 dark:text-black"
        >
          + New post
        </Link>
      </div>

      <BlogSettingsForm settings={settings} />

      <section className="surface-panel rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold">Posts ({posts.length})</h3>
          <Link
            href="/blog"
            target="_blank"
            className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            view blog &#8599;
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
          {posts.map((post) => (
            <div key={post.slug} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{post.metadata.title}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {post.metadata.category && <>{post.metadata.category} &middot; </>}
                  {formatDate(post.metadata.publishedAt, false)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  view &#8599;
                </Link>
                <Link
                  href={`/admin/edit/${post.slug}`}
                  className="text-xs text-blue-500 transition-colors hover:text-blue-700 dark:hover:text-blue-300"
                >
                  edit
                </Link>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">No posts yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
