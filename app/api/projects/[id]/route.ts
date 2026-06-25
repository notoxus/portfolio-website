import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { commitFileToGitHub } from 'lib/github-content'
import { getProjects, type Project } from 'lib/projects'
import fs from 'fs'
import path from 'path'

const PROJECTS_PATH = path.join(process.cwd(), 'content', 'projects.json')
const REPO_PATH = 'content/projects.json'

function isAdmin(login?: string) {
  return login === process.env.ADMIN_GITHUB_USERNAME
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeProject(value: any, currentId: string): Project {
  return {
    id: currentId,
    title: typeof value?.title === 'string' ? value.title.trim() : '',
    kind: typeof value?.kind === 'string' ? value.kind.trim() : '',
    accent: value?.accent === 'amber' ? 'amber' : 'green',
    tech: typeof value?.tech === 'string' ? value.tech.trim() : '',
    description: typeof value?.description === 'string' ? value.description.trim() : '',
    link: typeof value?.link === 'string' ? value.link.trim() : '',
    featured: value?.featured === true,
  }
}

function validateProject(project: Project) {
  return !!(
    project.id &&
    project.title &&
    project.kind &&
    project.tech &&
    project.description &&
    project.link
  )
}

async function saveProjects(projects: Project[], message: string) {
  const content = JSON.stringify(projects, null, 2) + '\n'

  let localSaved = false
  let localReason: string | undefined
  try {
    fs.mkdirSync(path.dirname(PROJECTS_PATH), { recursive: true })
    fs.writeFileSync(PROJECTS_PATH, content, 'utf-8')
    localSaved = true
  } catch (err: any) {
    localReason = err?.message ?? 'Local file write failed'
  }

  let github: { synced: boolean; reason?: string }
  try {
    github = await commitFileToGitHub(REPO_PATH, content, message)
  } catch (err: any) {
    github = { synced: false, reason: err?.message ?? 'GitHub sync failed' }
  }

  return { github, localSaved, localReason }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!isAdmin((session as any)?.login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const project = getProjects().find((item) => item.id === id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!isAdmin((session as any)?.login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const projects = getProjects()
  const index = projects.findIndex((item) => item.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const { project } = await req.json().catch(() => ({}))
  const normalized = normalizeProject(project, slugify(id))
  if (!validateProject(normalized)) {
    return NextResponse.json({ error: 'All project fields are required' }, { status: 400 })
  }

  const nextProjects = [...projects]
  nextProjects[index] = normalized
  const result = await saveProjects(nextProjects, `chore(projects): update ${normalized.title}`)
  if (!result.localSaved && !result.github.synced) {
    return NextResponse.json(
      { error: result.github.reason ?? result.localReason ?? 'Save failed', ...result },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, project: normalized, ...result })
}
