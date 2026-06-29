import { ProjectList } from 'app/components/project-list'
import AdminEditLink from 'app/components/AdminEditLink'
import { getSiteSettings } from 'lib/site-settings'

export const metadata = {
  title: 'Projects',
  description:
    'Tools and applications by Phuoc Thinh, built to practice systems thinking, automation, and software design.',
  openGraph: {
    title: 'Projects — Phuoc Thinh',
    description:
      'Tools and applications by Phuoc Thinh, built to practice systems thinking, automation, and software design.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects — Phuoc Thinh',
    description:
      'Tools and applications by Phuoc Thinh, built to practice systems thinking, automation, and software design.',
  },
}

export default function ProjectsPage() {
  const settings = getSiteSettings()
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME

  return (
    <section>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-500">
            {settings.projectsPage.eyebrow}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
              {settings.projectsPage.title}
            </h1>
            <AdminEditLink href="/admin/projects" label="edit projects" adminUsername={adminUsername} />
          </div>
        </div>
        <div className="max-w-md sm:text-right">
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {settings.projectsPage.description}
          </p>
        </div>
      </div>

      <ProjectList />
    </section>
  )
}
