import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const p = await params
    const slug = p.slug
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL!
    const sql = neon(dbUrl)
    const rows = await sql`SELECT count FROM page_views WHERE slug = ${slug}`
    return NextResponse.json({ count: rows[0]?.count || 0 })
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const p = await params
    const slug = p.slug
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL!
    const sql = neon(dbUrl)
    
    const result = await sql`
      INSERT INTO page_views (slug, count)
      VALUES (${slug}, 1)
      ON CONFLICT (slug)
      DO UPDATE SET count = page_views.count + 1
      RETURNING count
    `

    // Log the viewer if they are authenticated
    try {
      const session = await auth()
      if (session?.user) {
        const login = (session as any).login || session.user.name || 'unknown'
        const avatar = session.user.image || ''
        await sql`
          INSERT INTO post_viewers (slug, github_login, avatar_url)
          VALUES (${slug}, ${login}, ${avatar})
          ON CONFLICT (slug, github_login) DO NOTHING
        `
      }
    } catch (viewerError) {
      console.error('Failed to log viewer:', viewerError)
      // We don't throw here to ensure the view count is still returned
    }
    
    return NextResponse.json({ count: result[0].count })
  } catch (error) {
    return NextResponse.json({ error: 'Error updating views' }, { status: 500 })
  }
}
