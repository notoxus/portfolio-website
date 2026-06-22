import { Octokit } from '@octokit/rest'
import type { BlogObserver, BlogEvent, BlogPostData } from './blog-publisher'

// Concrete Observer: syncs MDX files to GitHub repo
export class GitHubSyncObserver implements BlogObserver {
  readonly name = 'GitHubSync'
  private octokit: Octokit
  private owner: string
  private repo: string

  constructor() {
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    this.owner = process.env.GITHUB_OWNER!
    this.repo = process.env.GITHUB_REPO!
  }

  async update(event: BlogEvent, post: BlogPostData): Promise<void> {
    const filePath = `app/blog/posts/${post.slug}.mdx`

    if (event === 'POST_DELETED') {
      await this.deleteFile(filePath, post.metadata.title)
      return
    }

    const content = this.buildMDX(post)
    await this.upsertFile(filePath, content, event, post.metadata.title)
  }

  private async getFileSHA(path: string): Promise<string | undefined> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      })
      if (!Array.isArray(data)) return data.sha
    } catch {}
    return undefined
  }

  private async upsertFile(path: string, content: string, event: BlogEvent, title: string) {
    const sha = await this.getFileSHA(path)
    const encoded = Buffer.from(content, 'utf-8').toString('base64')
    const message = event === 'POST_CREATED'
      ? `feat(blog): add "${title}"`
      : `docs(blog): update "${title}"`

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: encoded,
      ...(sha ? { sha } : {}),
    })
  }

  private async deleteFile(path: string, title: string) {
    const sha = await this.getFileSHA(path)
    if (!sha) return
    await this.octokit.repos.deleteFile({
      owner: this.owner,
      repo: this.repo,
      path,
      message: `chore(blog): delete "${title}"`,
      sha,
    })
  }

  private buildMDX(post: BlogPostData): string {
    const { title, publishedAt, summary, category, image } = post.metadata
    const lines = [
      '---',
      `title: '${title.replace(/'/g, "\\'")}'`,
      `publishedAt: '${publishedAt}'`,
      `summary: '${summary.replace(/'/g, "\\'")}'`,
    ]
    if (category) lines.push(`category: '${category}'`)
    if (image) lines.push(`image: '${image}'`)
    lines.push('---', '', post.content)
    return lines.join('\n')
  }
}
