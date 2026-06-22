import fs from 'fs'
import path from 'path'

const INTRO_FILE = path.join(process.cwd(), 'content', 'home-intro.md')

// Fallback used if the content file is missing (e.g. fresh clone)
const DEFAULT_INTRO =
  "Welcome to my portfolio. Here, I share my blog and notebook, documenting my educational journey. I'm a firm believer in interdisciplinary wisdom, so you'll also find me sharing fascinating breakthroughs in other fields here. Let's sit back, relax and enjoy the moment together!"

export function getHomeIntro(): string {
  try {
    const raw = fs.readFileSync(INTRO_FILE, 'utf-8').trim()
    if (raw) return raw
  } catch {}
  return DEFAULT_INTRO
}
