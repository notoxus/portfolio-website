export const PROJECT_ACCENTS = [
  'green',
  'amber',
  'blue',
  'violet',
  'rose',
  'cyan',
  'slate',
] as const

export type ProjectAccent = (typeof PROJECT_ACCENTS)[number]

export const PROJECT_ACCENT_LABELS: Record<ProjectAccent, string> = {
  green: 'Green',
  amber: 'Amber',
  blue: 'Blue',
  violet: 'Violet',
  rose: 'Rose',
  cyan: 'Cyan',
  slate: 'Slate',
}

export const PROJECT_ACCENT_STYLES: Record<ProjectAccent, string> = {
  green: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  violet: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  cyan: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  slate: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
}
