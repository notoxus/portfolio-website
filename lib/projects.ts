import fs from 'fs'
import path from 'path'
import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'
import bundledProjects from '../content/projects.json'

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

const BUNDLED_PROJECTS = bundledProjects.filter(isProject) as Project[]

export const PROJECTS_CACHE_TAG = 'projects-data'

async function fromGitHub(): Promise<Project[] | null> {
  const { GITHUB_TOKEN: token, GITHUB_OWNER: owner, GITHUB_REPO: repo } = process.env
  if (!token || !owner || !repo) return null

  try {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'content/projects.json',
    })
    if (Array.isArray(data) || data.type !== 'file') return null
    const raw = Buffer.from(data.content, 'base64').toString('utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isProject)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function fromFilesystem(): Project[] {
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isProject)) {
      return parsed
    }
  } catch {}

  return BUNDLED_PROJECTS
}

const loadProjects = unstable_cache(
  async (): Promise<Project[]> => (await fromGitHub()) ?? fromFilesystem(),
  [PROJECTS_CACHE_TAG],
  { tags: [PROJECTS_CACHE_TAG], revalidate: 300 },
)

export async function getProjects(): Promise<Project[]> {
  return loadProjects()
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects()
  const featuredProjects = projects.filter((project) => project.featured)

  return (featuredProjects.length ? featuredProjects : projects).slice(0, limit)
}
