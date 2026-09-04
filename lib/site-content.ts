import fs from 'fs'
import path from 'path'
import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'

const INTRO_FILE = path.join(process.cwd(), 'content', 'home-intro.md')

// Fallback used if the content file is missing (e.g. fresh clone)
const DEFAULT_INTRO =
  "Welcome to my portfolio. Here, I share my blog and notebook, documenting my educational journey. I'm a firm believer in interdisciplinary wisdom, so you'll also find me sharing fascinating breakthroughs in other fields here. Let's sit back, relax and enjoy the moment together!"

export const SITE_INTRO_CACHE_TAG = 'site-intro'

async function fromGitHub(): Promise<string | null> {
  const { GITHUB_TOKEN: token, GITHUB_OWNER: owner, GITHUB_REPO: repo } = process.env
  if (!token || !owner || !repo) return null

  try {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'content/home-intro.md',
    })
    if (Array.isArray(data) || data.type !== 'file') return null
    const raw = Buffer.from(data.content, 'base64').toString('utf-8').trim()
    return raw || DEFAULT_INTRO
  } catch {
    return null
  }
}

function fromFilesystem(): string {
  try {
    const raw = fs.readFileSync(INTRO_FILE, 'utf-8').trim()
    if (raw) return raw
  } catch {}
  return DEFAULT_INTRO
}

const loadIntro = unstable_cache(
  async (): Promise<string> => (await fromGitHub()) ?? fromFilesystem(),
  [SITE_INTRO_CACHE_TAG],
  { tags: [SITE_INTRO_CACHE_TAG], revalidate: 300 },
)

export async function getHomeIntro(): Promise<string> {
  return loadIntro()
}

export function getHomeIntroSync(): string {
  return fromFilesystem()
}
