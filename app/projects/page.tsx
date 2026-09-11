import { ProjectList } from 'app/components/project-list'
import { getSiteSettings } from 'lib/site-settings'
import { fontSizeClass, responsiveFontSizeClass } from 'lib/font-sizes'

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

import SearchInput from 'app/components/SearchInput'

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const settings = await getSiteSettings()

  const params = await searchParams
  const q = params.q

  return (
    <section>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`mb-2 ${fontSizeClass(settings.fontSizes.projectsEyebrow)} text-neutral-500 dark:text-neutral-500`}>
            {settings.projectsPage.eyebrow}
          </p>
          <div>
            <h1 className={`${responsiveFontSizeClass(settings.fontSizes.projectsTitle)} font-semibold tracking-tight text-neutral-950 dark:text-neutral-50`}>
              {settings.projectsPage.title}
            </h1>
          </div>
        </div>
        <div className="max-w-md sm:text-right">
          <p className={`${fontSizeClass(settings.fontSizes.projectsDescription)} leading-6 text-neutral-600 dark:text-neutral-400`}>
            {settings.projectsPage.description}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <SearchInput placeholder="Search projects by title, tech, or kind..." />
      </div>

      <ProjectList searchQuery={q} />
    </section>
  )
}
