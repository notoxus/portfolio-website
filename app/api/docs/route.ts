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
    const docs = settings.docsPage
    const token = process.env.GITHUB_TOKEN
    const octokit = new Octokit(token ? { auth: token } : {})

    const { data } = await octokit.repos.getContent({
      owner: docs.owner,
      repo: docs.repo,
      path: cleanPath,
      ref: docs.branch,
    })

    return NextResponse.json(cleanPath ? data : {
      items: data,
      docs,
      fontSizes: {
        title: settings.fontSizes.docsTitle,
        description: settings.fontSizes.docsDescription,
        file: settings.fontSizes.docsFile,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    console.error('[docs proxy error]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch docs directory' },
      { status: error?.status || 500 },
    )
  }
}
