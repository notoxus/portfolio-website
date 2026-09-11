import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  getFeaturedProjects,
  getProjects,
  type Project,
} from 'lib/projects'
import { PROJECT_ACCENT_STYLES } from 'lib/project-accents'
import { StaggerContainer, StaggerItem } from 'app/components/FadeIn'
import { getSiteSettings } from 'lib/site-settings'
import { fontSizeStyle, responsiveFontSizeStyle } from 'lib/font-sizes'

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}

function ProjectAnchor({
  project,
  children,
}: {
  project: Project
  children: ReactNode
}) {
  const className = 'min-w-0 flex-1'

  if (isExternalLink(project.link)) {
    return (
      <a href={project.link} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={project.link} className={className}>
      {children}
    </Link>
  )
}

export async function ProjectList({
  limit,
  featuredOnly = false,
  searchQuery = '',
}: {
  limit?: number
  featuredOnly?: boolean
  searchQuery?: string
}) {
  const allProjects = featuredOnly ? await getFeaturedProjects(limit) : await getProjects()
  const settings = await getSiteSettings()
  let projects = typeof limit === 'number' ? allProjects.slice(0, limit) : allProjects

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tech.toLowerCase().includes(q) ||
        p.kind.toLowerCase().includes(q)
    )
  }

  if (projects.length === 0) {
    return (
      <div className="surface-panel rounded-2xl px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No projects found matching "{searchQuery}".
      </div>
    )
  }

  return (
    <StaggerContainer className="glass-list">
      {projects.map((project, index) => (
        <StaggerItem
          key={project.title}
          className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-neutral-200/80 px-4 py-4 transition-colors hover:border-blue-500/50 dark:border-neutral-800/80 sm:gap-5 sm:px-5 sm:py-6"
        >
          <ProjectAnchor project={project}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="index-pill">{String(index + 1).padStart(2, '0')}</span>
              <h3 style={responsiveFontSizeStyle(settings.fontSizes.projectTitle)} className="font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                {project.title}
              </h3>
              <span
                style={fontSizeStyle(settings.fontSizes.projectKind)}
                className={`rounded-full px-2.5 py-1 font-bold ${
                  PROJECT_ACCENT_STYLES[project.accent ?? 'green']
                }`}
              >
                {project.kind}
              </span>
            </div>
            <p style={fontSizeStyle(settings.fontSizes.projectDescription)} className="max-w-3xl leading-6 text-neutral-600 dark:text-neutral-400">
              {project.description}
            </p>
            <p style={fontSizeStyle(settings.fontSizes.projectTech)} className="mt-3 font-mono text-neutral-500 dark:text-neutral-500">
              {project.tech}
            </p>
          </ProjectAnchor>
          <div className="flex flex-shrink-0 items-center gap-2">
            {isExternalLink(project.link) ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-box hidden sm:grid"
                aria-label={`open ${project.title}`}
              >
                -&gt;
              </a>
            ) : (
              <Link href={project.link} className="arrow-box hidden sm:grid" aria-label={`open ${project.title}`}>
                -&gt;
              </Link>
            )}
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
