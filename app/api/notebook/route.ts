import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { getSiteSettings } from 'lib/site-settings'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subPath = searchParams.get('path') || ''

  // Sanitize path to prevent directory traversal
  const cleanPath = subPath.replace(/\.\./g, '').replace(/^\/+/, '')

  try {
    const settings = await getSiteSettings()
    const notebook = settings.notebookPage
    const token = process.env.GITHUB_TOKEN
    const octokit = new Octokit(token ? { auth: token } : {})

    const { data } = await octokit.repos.getContent({
      owner: notebook.owner,
      repo: notebook.repo,
      path: cleanPath,
      ref: notebook.branch,
    })

    return NextResponse.json(cleanPath ? data : {
      items: data,
      notebook,
      fontSizes: {
        title: settings.fontSizes.notebookTitle,
        description: settings.fontSizes.notebookDescription,
        file: settings.fontSizes.notebookFile,
      },
    }, {
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
