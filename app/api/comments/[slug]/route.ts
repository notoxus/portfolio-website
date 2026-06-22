import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_OWNER!
const REPO = process.env.GITHUB_REPO!
const COMMENT_LABEL = 'blog-comment'

// GET /api/comments/[slug] - fetch comments for a post
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    const issue = await findOrNullIssue(octokit, slug)
    if (!issue) return NextResponse.json([])

    const { data } = await octokit.issues.listComments({
      owner: OWNER,
      repo: REPO,
      issue_number: issue.number,
      per_page: 100,
    })

    return NextResponse.json(
      data.map(c => ({
        id: c.id,
        body: c.body ?? '',
        created_at: c.created_at,
        user: {
          login: c.user?.login ?? 'unknown',
          avatar_url: c.user?.avatar_url ?? '',
          html_url: c.user?.html_url ?? '#',
        },
      })),
    )
  } catch (err) {
    console.error('GET comments error:', err)
    return NextResponse.json([])
  }
}

// POST /api/comments/[slug] - create a comment (requires GitHub OAuth session)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Sign in with GitHub to comment' }, { status: 401 })
  }

  const { body } = await req.json()
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
  }

  try {
    // Use the commenter's own OAuth token - comment appears under their account
    const userOctokit = new Octokit({ auth: session.accessToken })
    // Use repo token for finding/creating the issue (in case the repo is private)
    const repoOctokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

    let issue = await findOrNullIssue(repoOctokit, slug)
    if (!issue) {
      issue = await createIssue(repoOctokit, slug)
    }

    await userOctokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issue.number,
      body: body.trim(),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Failed to post comment'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function findOrNullIssue(octokit: Octokit, slug: string) {
  const { data } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    labels: COMMENT_LABEL,
    state: 'open',
    per_page: 100,
  })
  return data.find(i => i.title === `blog:${slug}`) ?? null
}

async function createIssue(octokit: Octokit, slug: string) {
  const { data } = await octokit.issues.create({
    owner: OWNER,
    repo: REPO,
    title: `blog:${slug}`,
    labels: [COMMENT_LABEL],
    body: `Comments thread for blog post \`${slug}\`. Do not close or edit manually.`,
  })
  return data
}
