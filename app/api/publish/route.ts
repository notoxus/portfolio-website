import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { blogPublisher } from 'lib/observers'
import type { BlogPostData, BlogEvent } from 'lib/observers'
import fs from 'fs'
import path from 'path'

const POSTS_DIR = path.join(process.cwd(), 'app', 'blog', 'posts')

function isAdmin(login?: string) {
  return login === process.env.ADMIN_GITHUB_USERNAME
}

// POST /api/publish - save MDX locally + trigger Observer chain (GitHub sync, etc.)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session as any).login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { slug, content, metadata, event = 'POST_CREATED' } = body as {
    slug: string
    content: string
    metadata: BlogPostData['metadata']
    event?: BlogEvent
  }

  if (!slug || !content || !metadata?.title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Sanitize slug
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')

  // Build frontmatter + content
  const mdxLines = [
    '---',
    `title: '${metadata.title.replace(/'/g, "\\'")}'`,
    `publishedAt: '${metadata.publishedAt}'`,
    `summary: '${metadata.summary.replace(/'/g, "\\'")}'`,
  ]
  if (metadata.category) mdxLines.push(`category: '${metadata.category}'`)
  if (metadata.image) mdxLines.push(`image: '${metadata.image}'`)
  mdxLines.push('---', '', content)
  const mdxContent = mdxLines.join('\n')

  if (event === 'POST_DELETED') {
    const filePath = path.join(POSTS_DIR, `${safeSlug}.mdx`)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } else {
    // Write to local filesystem (for dev; in production Vercel is read-only but Observer syncs to GitHub)
    try {
      fs.mkdirSync(POSTS_DIR, { recursive: true })
      fs.writeFileSync(path.join(POSTS_DIR, `${safeSlug}.mdx`), mdxContent, 'utf-8')
    } catch {
      // Ignore write errors in serverless environments - GitHub sync handles persistence
    }
  }

  // Trigger Observer chain
  const postData: BlogPostData = { slug: safeSlug, content, metadata }
  const results = await blogPublisher.notify(event, postData)

  return NextResponse.json({ ok: true, slug: safeSlug, observers: results })
}

// GET /api/publish - list active observers (debug)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session as any).login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ observers: blogPublisher.getObservers() })
}
