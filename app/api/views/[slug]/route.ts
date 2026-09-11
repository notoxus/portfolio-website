import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const p = await params
    const slug = p.slug
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL!
    const sql = neon(dbUrl)
    
    await sql`
      INSERT INTO page_views (slug, count)
      VALUES (${slug}, 1)
      ON CONFLICT (slug)
      DO UPDATE SET count = page_views.count + 1
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error updating views' }, { status: 500 })
  }
}
