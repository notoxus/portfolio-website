import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_OWNER!
const REPO = process.env.GITHUB_REPO!
const COMMENT_LABEL = 'blog-comment'
const COMMENT_META_PREFIX = '<!-- portfolio-comment '
const COMMENT_META_SUFFIX = ' -->'

type CommentMeta = {
  login?: string
  avatar_url?: string
  html_url?: string
}

// GET /api/comments/[slug] - fetch comments for a post
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const session = await auth()
    const sessionLogin = getSessionLogin(session)
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
      data.map(c => {
        const parsed = parseComment(c.body ?? '')
        const userLogin = parsed.meta.login ?? c.user?.login ?? 'unknown'
        return {
          id: c.id,
          body: parsed.body,
          created_at: c.created_at,
          can_manage: canManageComment(sessionLogin, userLogin),
          user: {
            login: userLogin,
            avatar_url: parsed.meta.avatar_url ?? c.user?.avatar_url ?? '',
            html_url: parsed.meta.html_url ?? c.user?.html_url ?? '#',
          },
        }
      }),
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
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub comment token is not configured' }, { status: 500 })
    }

    const repoOctokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

    let issue = await findOrNullIssue(repoOctokit, slug)
    if (!issue) {
      issue = await createIssue(repoOctokit, slug)
    }

    await repoOctokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issue.number,
      body: serializeComment(body.trim(), {
        login: (session as any).login ?? session.user?.name ?? 'guest',
        avatar_url: (session as any).avatar ?? session.user?.image ?? undefined,
        html_url: (session as any).login ? `https://github.com/${(session as any).login}` : undefined,
      }),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Failed to post comment'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/comments/[slug] - update a comment owned by the current user or site admin
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  const sessionLogin = getSessionLogin(session)

  if (!sessionLogin) {
    return NextResponse.json({ error: 'Sign in with GitHub to edit comments' }, { status: 401 })
  }

  const { commentId, body } = await req.json().catch(() => ({}))
  if (!Number.isInteger(commentId)) {
    return NextResponse.json({ error: 'Comment id is required' }, { status: 400 })
  }
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
  }

  try {
    const octokit = createRepoOctokit()
    const comment = await getCommentInThread(octokit, slug, commentId)
    if (!comment) {
      return NextResponse.json({ error: 'Comment was not found' }, { status: 404 })
    }

    const parsed = parseComment(comment.body ?? '')
    const userLogin = parsed.meta.login ?? comment.user?.login ?? 'unknown'
    if (!canManageComment(sessionLogin, userLogin)) {
      return NextResponse.json({ error: 'You can only edit your own comments' }, { status: 403 })
    }
    const meta = parsed.meta.login
      ? parsed.meta
      : {
          login: userLogin,
          avatar_url: comment.user?.avatar_url,
          html_url: comment.user?.html_url,
        }

    await octokit.issues.updateComment({
      owner: OWNER,
      repo: REPO,
      comment_id: commentId,
      body: serializeComment(body.trim(), meta),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to edit comment'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/comments/[slug] - delete a comment owned by the current user or site admin
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  const sessionLogin = getSessionLogin(session)

  if (!sessionLogin) {
    return NextResponse.json({ error: 'Sign in with GitHub to delete comments' }, { status: 401 })
  }

  const { commentId } = await req.json().catch(() => ({}))
  if (!Number.isInteger(commentId)) {
    return NextResponse.json({ error: 'Comment id is required' }, { status: 400 })
  }

  try {
    const octokit = createRepoOctokit()
    const comment = await getCommentInThread(octokit, slug, commentId)
    if (!comment) {
      return NextResponse.json({ error: 'Comment was not found' }, { status: 404 })
    }

    const parsed = parseComment(comment.body ?? '')
    const userLogin = parsed.meta.login ?? comment.user?.login ?? 'unknown'
    if (!canManageComment(sessionLogin, userLogin)) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 })
    }

    await octokit.issues.deleteComment({
      owner: OWNER,
      repo: REPO,
      comment_id: commentId,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete comment'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function serializeComment(body: string, meta: CommentMeta) {
  return `${COMMENT_META_PREFIX}${JSON.stringify(meta)}${COMMENT_META_SUFFIX}\n\n${body}`
}

function parseComment(raw: string): { body: string; meta: CommentMeta } {
  if (!raw.startsWith(COMMENT_META_PREFIX)) {
    return { body: raw, meta: {} }
  }

  const end = raw.indexOf(COMMENT_META_SUFFIX)
  if (end === -1) {
    return { body: raw, meta: {} }
  }

  try {
    const json = raw.slice(COMMENT_META_PREFIX.length, end)
    const body = raw.slice(end + COMMENT_META_SUFFIX.length).replace(/^\s+/, '')
    return { body, meta: JSON.parse(json) as CommentMeta }
  } catch {
    return { body: raw, meta: {} }
  }
}

function getSessionLogin(session: unknown) {
  return (session as any)?.login as string | undefined
}

function canManageComment(sessionLogin: string | undefined, commentLogin: string) {
  return !!sessionLogin && (sessionLogin === commentLogin || sessionLogin === process.env.ADMIN_GITHUB_USERNAME)
}

function createRepoOctokit() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GitHub comment token is not configured')
  }

  return new Octokit({ auth: process.env.GITHUB_TOKEN })
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

async function getCommentInThread(octokit: Octokit, slug: string, commentId: number) {
  const issue = await findOrNullIssue(octokit, slug)
  if (!issue) return null

  const { data } = await octokit.issues.getComment({
    owner: OWNER,
    repo: REPO,
    comment_id: commentId,
  })

  if (!data.issue_url.endsWith(`/issues/${issue.number}`)) {
    return null
  }

  return data
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
