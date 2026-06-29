import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'
import fs from 'fs'
import path from 'path'

export type BlogLanguage = 'vi' | 'en'

export type PostMetadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  category?: string
  language?: BlogLanguage
}

export type BlogPost = {
  metadata: PostMetadata
  slug: string
  content: string
}

export const BLOG_CACHE_TAG = 'blog-posts'

function parseFrontmatter(raw: string): { metadata: PostMetadata; content: string } {
  const match = /---\s*([\s\S]*?)\s*---/.exec(raw)
  const block = match![1]
  const content = raw.replace(/---\s*([\s\S]*?)\s*---/, '').trim()
  const metadata: Partial<PostMetadata> = {}

  block.trim().split('\n').forEach(line => {
    const [key, ...rest] = line.split(': ')
    const value = rest.join(': ').trim().replace(/^['"](.*)['"]$/, '$1')
    ;(metadata as Record<string, string>)[key.trim()] = value
  })

  return { metadata: metadata as PostMetadata, content }
}

async function fromGitHub(): Promise<BlogPost[] | null> {
  const { GITHUB_TOKEN: token, GITHUB_OWNER: owner, GITHUB_REPO: repo } = process.env
  if (!token || !owner || !repo) return null

  const octokit = new Octokit({ auth: token })

  try {
    const { data: listing } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'app/blog/posts',
    })
    if (!Array.isArray(listing)) return null

    const posts = await Promise.all(
      listing
        .filter(f => f.type === 'file' && f.name.endsWith('.mdx'))
        .map(async (file): Promise<BlogPost | null> => {
          try {
            const { data } = await octokit.repos.getContent({ owner, repo, path: file.path })
            if (Array.isArray(data) || data.type !== 'file') return null
            const raw = Buffer.from(data.content, 'base64').toString('utf-8')
            const { metadata, content } = parseFrontmatter(raw)
            return { metadata, slug: file.name.replace('.mdx', ''), content }
          } catch {
            return null
          }
        }),
    )

    return posts.filter((p): p is BlogPost => p !== null)
  } catch {
    return null
  }
}

function fromFilesystem(): BlogPost[] {
  const dir = path.join(process.cwd(), 'app', 'blog', 'posts')
  try {
    return fs
      .readdirSync(dir)
      .filter(f => path.extname(f) === '.mdx')
      .map(file => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
        const { metadata, content } = parseFrontmatter(raw)
        return { metadata, slug: path.basename(file, '.mdx'), content }
      })
  } catch {
    return []
  }
}

// Cached loader: GitHub API first, filesystem fallback.
// Tag 'blog-posts' lets publish/edit routes bust this cache on-demand.
// 5-minute revalidate as a safety net in case revalidateTag is missed.
const loadPosts = unstable_cache(
  async (): Promise<BlogPost[]> => (await fromGitHub()) ?? fromFilesystem(),
  [BLOG_CACHE_TAG],
  { tags: [BLOG_CACHE_TAG], revalidate: 300 },
)

export async function getBlogPosts(): Promise<BlogPost[]> {
  return loadPosts()
}
