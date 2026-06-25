import Link from 'next/link'
import { getProjects } from 'lib/projects'
import { getSiteSettings } from 'lib/site-settings'
import ProjectSettingsForm from './project-settings-form'

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}

export default function AdminProjectsPage() {
  const settings = getSiteSettings()
  const projects = getProjects()
  const featuredCount = projects.filter((project) => project.featured).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Project content</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage project labels and portfolio entries from one place.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex w-fit rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-neutral-100 dark:text-black"
        >
          + New project
        </Link>
      </div>

      <ProjectSettingsForm settings={settings} />

      <section className="surface-panel rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold">Projects ({projects.length})</h3>
          <Link
            href="/projects"
            target="_blank"
            className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            view projects &#8599;
          </Link>
        </div>
        <p className="mb-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          {featuredCount} pinned. Featured work shows up to three pinned projects in this order.
        </p>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
          {projects.map((project) => (
            <div key={project.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{project.title}</p>
                  {project.featured && (
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-300">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  {project.kind} &middot; {project.tech}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {isExternalLink(project.link) ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    view &#8599;
                  </a>
                ) : (
                  <Link
                    href={project.link}
                    target="_blank"
                    className="text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    view &#8599;
                  </Link>
                )}
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="text-xs text-blue-500 transition-colors hover:text-blue-700 dark:hover:text-blue-300"
                >
                  edit
                </Link>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">No projects yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
