import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts } from 'app/blog/utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  const login = (session as any)?.login
  if (login !== process.env.ADMIN_GITHUB_USERNAME) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slug } = await params
  const post = (await getBlogPosts()).find(p => p.slug === slug)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ metadata: post.metadata, content: post.content })
}
