import fs from 'fs'
import path from 'path'

export interface ProofOfWorkData {
  upstream_merges: number
  tool_stars: number
  public_contributions: number | null
  public_repos: number
  followers: number
}

export function getProofOfWorkStats(): ProofOfWorkData {
  const filePath = path.join(process.cwd(), 'content/proof-of-work.json')

  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileData)
  }

  // Local fallback
  return {
    upstream_merges: 0,
    tool_stars: 0,
    public_contributions: null,
    public_repos: 0,
    followers: 0,
  }
}