import { BlogPosts } from 'app/components/posts'
import { getHomeIntro } from 'lib/site-content'
import AdminEditLink from 'app/components/AdminEditLink'

export default function Page() {
  const intro = getHomeIntro()
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Phuoc Thinh Portfolio
      </h1>
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="whitespace-pre-line">{intro}</p>
        <AdminEditLink href="/admin/intro" label="edit intro" adminUsername={adminUsername} />
      </div>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
