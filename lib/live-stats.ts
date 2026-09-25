import fs from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'content', 'live-stats.json')

export type LiveStats = {
  tryhackme: {
    rank: string | number
    completed_rooms: number
    streak: number
  }
  last_updated: string
}

export function getLiveStats(): LiveStats {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {}

  return {
    tryhackme: { rank: '---', completed_rooms: 0, streak: 0 },
    last_updated: 'Local fallback'
  }
}