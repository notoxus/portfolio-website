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
    tech: 'Java 21 / Maven / Chrome Extension / yt-dlp / FFmpeg',
    description:
      'A cross-platform desktop app that captures HLS/DASH streams through a generated Chrome extension, queues downloads, and packages yt-dlp and FFmpeg workflows behind one interface.',
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
    id: 'gym-tracking',
    title: 'Gym Tracking',
    kind: 'Java coursework',
    accent: 'amber',
    tech: 'Java 21 / Gradle / Gson / JUnit',
    description:
      'A Java coursework project with goal-based workout suggestions, set-by-set logs, nutrition lookup, progress charts, and separate user and admin workflows. An Android interface rebuild is planned after the current assessment.',
    link: 'https://github.com/notoxus/oop-design-project',
    featured: true,
  },
  {
    id: 'yoshi-pdf',
    title: 'Yoshi PDF',
    kind: 'OCR prototype',
    accent: 'green',
    tech: 'Java 17 / Maven / PDFBox / Tesseract',
    description:
      'An early-stage PDF viewer and OCR utility for experimenting with Tesseract-based text extraction from long documents.',
    link: 'https://github.com/notoxus/yoshiPDF',
    featured: false,
  },
  {
    id: 'useful-script',
    title: 'Useful Script',
    kind: 'Automation',
    accent: 'green',
    tech: 'Bash / Batch / Shell',
    description:
      'A small collection of Bash, Batch, and shell experiments created to remove repetitive setup and workflow steps.',
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
