import { Octokit } from '@octokit/rest'

/** Commits one UTF-8 text file to the configured GitHub repository. */
export async function commitFileToGitHub(
  filePath: string,
  content: string,
  message: string,
): Promise<{ synced: boolean; reason?: string }> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    return { synced: false, reason: 'GitHub env vars not configured' }
  }

  const octokit = new Octokit({ auth: token })

  // Look up the current file SHA (required by the API to update an existing file)
  let sha: string | undefined
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: filePath })
    if (!Array.isArray(data)) sha = data.sha
  } catch {}

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    ...(sha ? { sha } : {}),
  })

  return { synced: true }
}

/** Commits one binary asset to the configured GitHub repository. */
export async function commitBinaryFileToGitHub(
  filePath: string,
  content: Uint8Array,
  message: string,
): Promise<{ synced: boolean; reason?: string; downloadUrl?: string }> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    return { synced: false, reason: 'GitHub env vars not configured' }
  }

  const octokit = new Octokit({ auth: token })

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content: Buffer.from(content).toString('base64'),
  })

  return {
    synced: true,
    downloadUrl: data.content?.download_url ?? undefined,
  }
}
