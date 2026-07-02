import Link from 'next/link'
import type { ReactNode } from 'react'
import { getFeaturedProjects, getProjects, type Project } from 'lib/projects'
import { StaggerContainer, StaggerItem } from 'app/components/FadeIn'

const tagStyles = {
  green: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}

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

export function ProjectList({
  limit,
  featuredOnly = false,
  searchQuery = '',
}: {
  limit?: number
  featuredOnly?: boolean
  searchQuery?: string
}) {
  const allProjects = featuredOnly ? getFeaturedProjects(limit) : getProjects()
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
              <h3 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-xl">
                {project.title}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  tagStyles[project.accent ?? 'green']
                }`}
              >
                {project.kind}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {project.description}
            </p>
            <p className="mt-3 font-mono text-xs text-neutral-500 dark:text-neutral-500">
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
