export type FontSize = number

export const FONT_SIZE_MIN = 8
export const FONT_SIZE_MAX = 96

const LEGACY_FONT_SIZE_PIXELS: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
}

export type FontSizeSettings = {
  homeEyebrow: FontSize
  homeHeadline: FontSize
  homeIntro: FontSize
  homeCta: FontSize
  skillGroupLabel: FontSize
  skillTag: FontSize
  contactLabel: FontSize
  contactDescription: FontSize
  projectsEyebrow: FontSize
  projectsTitle: FontSize
  projectsDescription: FontSize
  projectTitle: FontSize
  projectKind: FontSize
  projectDescription: FontSize
  projectTech: FontSize
  blogEyebrow: FontSize
  blogTitle: FontSize
  blogDescription: FontSize
  postTitle: FontSize
  postSummary: FontSize
  postMeta: FontSize
  postBadge: FontSize
  docsTitle: FontSize
  docsDescription: FontSize
  docsFile: FontSize
  navigationLabel: FontSize
  footerTitle: FontSize
  footerDescription: FontSize
  socialLabel: FontSize
}

export const DEFAULT_FONT_SIZES: FontSizeSettings = {
  homeEyebrow: 14,
  homeHeadline: 48,
  homeIntro: 18,
  homeCta: 14,
  skillGroupLabel: 12,
  skillTag: 12,
  contactLabel: 12,
  contactDescription: 12,
  projectsEyebrow: 14,
  projectsTitle: 36,
  projectsDescription: 14,
  projectTitle: 20,
  projectKind: 12,
  projectDescription: 14,
  projectTech: 12,
  blogEyebrow: 14,
  blogTitle: 36,
  blogDescription: 14,
  postTitle: 18,
  postSummary: 14,
  postMeta: 12,
  postBadge: 12,
  docsTitle: 24,
  docsDescription: 16,
  docsFile: 14,
  navigationLabel: 14,
  footerTitle: 14,
  footerDescription: 14,
  socialLabel: 14,
}

export function normalizeFontSize(value: unknown, fallback: FontSize): FontSize {
  const migrated = typeof value === 'string' ? LEGACY_FONT_SIZE_PIXELS[value] ?? Number(value) : value
  if (typeof migrated !== 'number' || !Number.isFinite(migrated)) return fallback
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(migrated)))
}

export function normalizeFontSizes(value: unknown): FontSizeSettings {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return Object.fromEntries(
    Object.entries(DEFAULT_FONT_SIZES).map(([key, fallback]) => [
      key,
      normalizeFontSize(source[key], fallback),
    ]),
  ) as FontSizeSettings
}

export function fontSizeStyle(size: FontSize) {
  return { fontSize: `${normalizeFontSize(size, 14)}px` }
}

export function responsiveFontSizeStyle(size: FontSize) {
  const pixels = normalizeFontSize(size, 14)
  const minimum = Math.min(pixels, pixels >= 36 ? 30 : pixels)
  const fluid = Number(Math.max(1.5, pixels / 12).toFixed(3))
  return { fontSize: `clamp(${minimum}px, ${fluid}vw, ${pixels}px)` }
}
