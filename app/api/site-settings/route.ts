import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { commitFileToGitHub } from 'lib/github-content'
import { getSiteSettings, normalizeSiteSettings } from 'lib/site-settings'
import fs from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(process.cwd(), 'content', 'site-settings.json')
const REPO_PATH = 'content/site-settings.json'

function isAdmin(login?: string) {
  return login === process.env.ADMIN_GITHUB_USERNAME
}

export async function GET() {
  const session = await auth()
  if (!isAdmin((session as any)?.login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ settings: getSiteSettings() })
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!isAdmin((session as any)?.login)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { settings } = await req.json().catch(() => ({}))
    const normalized = normalizeSiteSettings(settings)
    const content = JSON.stringify(normalized, null, 2) + '\n'

    let localSaved = false
    let localReason: string | undefined
    try {
      fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true })
      fs.writeFileSync(SETTINGS_PATH, content, 'utf-8')
      localSaved = true
    } catch (err: any) {
      localReason = err?.message ?? 'Local file write failed'
    }

    let github: { synced: boolean; reason?: string }
    try {
      github = await commitFileToGitHub(
        REPO_PATH,
        content,
        'chore(content): update site settings',
      )
    } catch (err: any) {
      github = { synced: false, reason: err?.message ?? 'GitHub sync failed' }
    }

    if (!localSaved && !github.synced) {
      return NextResponse.json(
        { error: github.reason ?? localReason ?? 'Save failed', github, localSaved, localReason },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, settings: normalized, github, localSaved, localReason })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Save failed' }, { status: 500 })
  }
}
