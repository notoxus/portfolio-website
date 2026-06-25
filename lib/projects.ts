import fs from 'fs'
import path from 'path'

export type Project = {
  id: string
  title: string
  kind: string
  accent?: 'green' | 'amber'
  tech: string
  description: string
  link: string
  featured?: boolean
}

const PROJECTS_FILE = path.join(process.cwd(), 'content', 'projects.json')

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'video-downloader',
    title: 'Video Downloader',
    kind: 'Desktop app',
    accent: 'green',
    tech: 'Java / Maven / HTTP / Gson',
    description:
      'A desktop app that gets video and playlist URLs from most websites, with practical capture workflows for everyday use.',
    link: 'https://github.com/notoxus/video-downloader',
    featured: true,
  },
  {
    id: 'study-hub',
    title: 'Study Hub',
    kind: 'Learning tool',
    accent: 'amber',
    tech: 'Next.js / TypeScript / YouTube Transcript',
    description:
      'A focused study interface for synced transcripts, instant translation, dictionary lookup, and language learning workflows.',
    link: '/essential-tools/studyhub',
    featured: true,
  },
  {
    id: 'yoshi-pdf',
    title: 'Yoshi PDF',
    kind: 'Utility',
    accent: 'green',
    tech: 'Java / Maven / Tesseract',
    description:
      'PDF handling experiments with OCR-oriented tooling and document processing ideas.',
    link: 'https://github.com/notoxus/yoshiPDF',
    featured: true,
  },
  {
    id: 'gym-tracking',
    title: 'Gym Tracking',
    kind: 'Android app',
    accent: 'amber',
    tech: 'Java / Gradle / Android',
    description:
      'An Android fitness tracking app focused on practical daily logging and object-oriented design patterns.',
    link: 'https://github.com/notoxus/oop-design-project',
  },
  {
    id: 'useful-script',
    title: 'Useful Script',
    kind: 'Automation',
    accent: 'green',
    tech: 'Bash / Batch / Shell',
    description:
      'Small automation scripts for reducing repetitive setup and workflow friction.',
    link: 'https://github.com/notoxus/UsefulScript',
  },
]

function isProject(value: any): value is Project {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.kind === 'string' &&
    typeof value.tech === 'string' &&
    typeof value.description === 'string' &&
    typeof value.link === 'string' &&
    (typeof value.featured === 'undefined' || typeof value.featured === 'boolean') &&
    (!value.accent || value.accent === 'green' || value.accent === 'amber')
  )
}

export function getProjects(): Project[] {
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isProject)) {
      return parsed
    }
  } catch {}

  return DEFAULT_PROJECTS
}

export function getFeaturedProjects(limit = 3): Project[] {
  const projects = getProjects()
  const featuredProjects = projects.filter((project) => project.featured)

  return (featuredProjects.length ? featuredProjects : projects).slice(0, limit)
}
