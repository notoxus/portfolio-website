import { getBlogPosts } from 'app/blog/utils'
import Link from 'next/link'
import Image from 'next/image'
import { neon } from '@neondatabase/serverless'

export default async function AdminDashboard() {
  const posts = (await getBlogPosts()).sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  )

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL!
  let viewersBySlug: Record<string, { github_login: string; avatar_url: string }[]> = {}
  if (dbUrl) {
    try {
      const sql = neon(dbUrl)
      // Safely check if table exists or just query and catch error
      const viewers = await sql`SELECT slug, github_login, avatar_url FROM post_viewers ORDER BY viewed_at DESC`
      viewers.forEach(v => {
        if (!viewersBySlug[v.slug]) viewersBySlug[v.slug] = []
        viewersBySlug[v.slug].push(v as any)
      })
    } catch (e) {
      console.error('Table might not exist yet or connection error', e)
    }
  }

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
        {posts.map(post => {
          const viewers = viewersBySlug[post.slug] || []
          return (
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
                {viewers.length > 0 && (
                  <div className="flex -space-x-2 mr-2">
                    {viewers.slice(0, 5).map((viewer) => (
                      <div key={viewer.github_login} title={viewer.github_login} className="relative z-0 hover:z-10 transition-transform hover:scale-110">
                        {viewer.avatar_url ? (
                          <Image
                            src={viewer.avatar_url}
                            alt={viewer.github_login}
                            width={24}
                            height={24}
                            className="rounded-full border border-white dark:border-neutral-900"
                            unoptimized
                          />
                        ) : (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 text-[10px] font-semibold border border-white dark:border-neutral-900 text-neutral-700 dark:text-neutral-200">
                            {viewer.github_login.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                    {viewers.length > 5 && (
                      <div className="relative z-0 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium border border-white dark:border-neutral-900 text-neutral-600 dark:text-neutral-300">
                        +{viewers.length - 5}
                      </div>
                    )}
                  </div>
                )}
                
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
          )
        })}

        {posts.length === 0 && (
          <p className="text-sm text-neutral-400 py-8 text-center">No posts yet.</p>
        )}
      </div>
    </div>
  )
}
