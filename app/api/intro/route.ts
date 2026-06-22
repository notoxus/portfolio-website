import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getHomeIntro } from 'lib/site-content'
import { commitFileToGitHub } from 'lib/github-content'
import fs from 'fs'
import path from 'path'

const INTRO_PATH = path.join(process.cwd(), 'content', 'home-intro.md')
const REPO_PATH = 'content/home-intro.md'

function isAdmin(login?: string) {
  return login === process.env.ADMIN_GITHUB_USERNAME
}

// GET /api/intro - return the current intro text (admin only)
export async function GET() {
  const session = await auth()
  if (!isAdmin((session as any)?.login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ content: getHomeIntro() })
}

// POST /api/intro - save intro text locally + commit to GitHub (admin only)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!isAdmin((session as any)?.login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content } = await req.json()
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const text = content.trim() + '\n'

  // Best-effort local write (works in dev; serverless FS is read-only)
  try {
    fs.mkdirSync(path.dirname(INTRO_PATH), { recursive: true })
    fs.writeFileSync(INTRO_PATH, text, 'utf-8')
  } catch {}

  const github = await commitFileToGitHub(REPO_PATH, text, 'docs(home): update intro')

  return NextResponse.json({ ok: true, github })
}
