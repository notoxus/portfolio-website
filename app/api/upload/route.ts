import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { commitBinaryFileToGitHub } from 'lib/github-content'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog')
const REPO_DIR = 'public/uploads/blog'

const MEDIA_TYPES: Record<string, { extension: string; kind: 'image' | 'video' }> = {
  'image/jpeg': { extension: '.jpg', kind: 'image' },
  'image/png': { extension: '.png', kind: 'image' },
  'image/gif': { extension: '.gif', kind: 'image' },
  'image/webp': { extension: '.webp', kind: 'image' },
  'image/avif': { extension: '.avif', kind: 'image' },
  'video/mp4': { extension: '.mp4', kind: 'video' },
  'video/webm': { extension: '.webm', kind: 'video' },
  'video/ogg': { extension: '.ogv', kind: 'video' },
  'video/quicktime': { extension: '.mov', kind: 'video' },
}

/** Checks whether the signed-in GitHub user can manage blog content. */
function isAdmin(login?: string) {
  return login === process.env.ADMIN_GITHUB_USERNAME
}

/** Creates a safe ASCII file name while keeping a readable stem. */
function createFileName(originalName: string, extension: string) {
  const stem = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'media'

  return `${Date.now()}-${stem}-${randomUUID().slice(0, 8)}${extension}`
}

/** Uploads an approved media file locally and to the GitHub repository. */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!isAdmin((session as any)?.login)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing media file' }, { status: 400 })
  }

  const mediaType = MEDIA_TYPES[file.type]
  if (!mediaType) {
    return NextResponse.json({ error: 'Unsupported media type' }, { status: 415 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File must be 4 MB or smaller' }, { status: 413 })
  }

  const fileName = createFileName(file.name, mediaType.extension)
  const repoPath = `${REPO_DIR}/${fileName}`
  const publicUrl = `/uploads/blog/${fileName}`
  const content = new Uint8Array(await file.arrayBuffer())

  let localSaved = false
  let localReason: string | undefined
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), content)
    localSaved = true
  } catch (error: any) {
    localReason = error?.message ?? 'Local file write failed'
  }

  let github: { synced: boolean; reason?: string; downloadUrl?: string }
  try {
    github = await commitBinaryFileToGitHub(
      repoPath,
      content,
      `chore(media): upload ${fileName}`,
    )
  } catch (error: any) {
    github = { synced: false, reason: error?.message ?? 'GitHub sync failed' }
  }

  if (!localSaved && !github.synced) {
    return NextResponse.json(
      { error: github.reason ?? localReason ?? 'Upload failed' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      url: publicUrl,
      previewUrl: github.downloadUrl ?? publicUrl,
      kind: mediaType.kind,
      localSaved,
      github,
    },
    { status: 201 },
  )
}
