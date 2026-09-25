import fs from 'fs'
import path from 'path'

export interface ProofOfWorkData {
  upstream_merges: number
  tool_stars: number
  public_contributions: number
}

export function getProofOfWorkStats(): ProofOfWorkData {
  const filePath = path.join(process.cwd(), 'content/proof-of-work.json')
  
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileData)
  }

  // Fallback with illustration
  return {
    upstream_merges: 42,
    tool_stars: 128,
    public_contributions: 540,
  }
}