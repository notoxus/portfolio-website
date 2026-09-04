import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const REPO_OWNER = process.env.GITHUB_OWNER || 'notoxus'
const REPO_NAME = 'my-note-book'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subPath = searchParams.get('path') || ''

  // Sanitize path to prevent directory traversal
  const cleanPath = subPath.replace(/\.\./g, '').replace(/^\/+/, '')

  try {
    const token = process.env.GITHUB_TOKEN
    const octokit = new Octokit(token ? { auth: token } : {})

    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: cleanPath,
    })

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    console.error('[notebook proxy error]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch notebook directory' },
      { status: error?.status || 500 },
    )
  }
}
