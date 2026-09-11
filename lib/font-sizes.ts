export const FONT_SIZE_OPTIONS = [
  { value: 'xs', label: 'text-xs' },
  { value: 'sm', label: 'text-sm' },
  { value: 'base', label: 'text-base' },
  { value: 'lg', label: 'text-lg' },
  { value: 'xl', label: 'text-xl' },
  { value: '2xl', label: 'text-2xl' },
  { value: '3xl', label: 'text-3xl' },
  { value: '4xl', label: 'text-4xl' },
  { value: '5xl', label: 'text-5xl' },
  { value: '6xl', label: 'text-6xl' },
] as const

export type FontSize = (typeof FONT_SIZE_OPTIONS)[number]['value']

export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
}

export const RESPONSIVE_FONT_SIZE_CLASSES: Record<FontSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl',
  '2xl': 'text-xl sm:text-2xl',
  '3xl': 'text-2xl sm:text-3xl',
  '4xl': 'text-2xl sm:text-3xl md:text-4xl',
  '5xl': 'text-3xl sm:text-4xl lg:text-5xl',
  '6xl': 'text-3xl sm:text-5xl lg:text-6xl',
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
  footerTitle: FontSize
  footerDescription: FontSize
  socialLabel: FontSize
}

export const DEFAULT_FONT_SIZES: FontSizeSettings = {
  homeEyebrow: 'sm',
  homeHeadline: '5xl',
  homeIntro: 'lg',
  homeCta: 'sm',
  skillGroupLabel: 'xs',
  skillTag: 'xs',
  contactLabel: 'xs',
  contactDescription: 'xs',
  projectsEyebrow: 'sm',
  projectsTitle: '4xl',
  projectsDescription: 'sm',
  projectTitle: 'xl',
  projectKind: 'xs',
  projectDescription: 'sm',
  projectTech: 'xs',
  blogEyebrow: 'sm',
  blogTitle: '4xl',
  blogDescription: 'sm',
  postTitle: 'lg',
  postSummary: 'sm',
  postMeta: 'xs',
  postBadge: 'xs',
  footerTitle: 'sm',
  footerDescription: 'sm',
  socialLabel: 'sm',
}

export function isFontSize(value: unknown): value is FontSize {
  return FONT_SIZE_OPTIONS.some((option) => option.value === value)
}

export function normalizeFontSizes(value: unknown): FontSizeSettings {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return Object.fromEntries(
    Object.entries(DEFAULT_FONT_SIZES).map(([key, fallback]) => [
      key,
      isFontSize(source[key]) ? source[key] : fallback,
    ]),
  ) as FontSizeSettings
}

export function fontSizeClass(size: FontSize) {
  return FONT_SIZE_CLASSES[size]
}

export function responsiveFontSizeClass(size: FontSize) {
  return RESPONSIVE_FONT_SIZE_CLASSES[size]
}
