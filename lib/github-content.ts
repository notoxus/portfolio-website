import { Octokit } from '@octokit/rest'

// Generic helper to commit an arbitrary text file to the GitHub repo.
// Used by site-content edits (e.g. homepage intro) following the same
// Git-as-CMS model as the blog Observer.
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
