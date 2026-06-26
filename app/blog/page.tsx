import { BlogPosts } from 'app/components/posts'
import AdminEditLink from 'app/components/AdminEditLink'
import { getSiteSettings } from 'lib/site-settings'

export const metadata = {
  title: 'Blog',
  description:
    'Articles and notes by Phuoc Thinh on web development, programming, and technology.',
  openGraph: {
    title: 'Blog — Phuoc Thinh',
    description:
      'Articles and notes by Phuoc Thinh on web development, programming, and technology.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Phuoc Thinh',
    description:
      'Articles and notes by Phuoc Thinh on web development, programming, and technology.',
  },
}

export default function Page() {
  const settings = getSiteSettings()
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME

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
      <BlogPosts />
    </section>
  )
}
