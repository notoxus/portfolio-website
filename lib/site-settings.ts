import fs from 'fs'
import path from 'path'
import { Octokit } from '@octokit/rest'
import { unstable_cache } from 'next/cache'
import {
  DEFAULT_FONT_SIZES,
  normalizeFontSizes,
  isFontSize,
  type FontSize,
  type FontSizeSettings,
} from 'lib/font-sizes'
import { PROJECT_ACCENTS, type ProjectAccent } from 'lib/project-accents'

export type SkillGroup = {
  label: string
  items: string[]
}

export const SOCIAL_ICON_OPTIONS = [
  'instagram',
  'linkedin',
  'github',
  'tryhackme',
  'youtube',
  'website',
] as const

export type SocialIcon = (typeof SOCIAL_ICON_OPTIONS)[number]

export type SocialLink = {
  id: string
  name: string
  href: string
  icon: SocialIcon
  shortLabel?: string
}

export type HomeSectionType = 'projects' | 'blog' | 'custom'

export type CustomHomeItem = {
  id: string
  title: string
  label: string
  description: string
  meta: string
  href: string
  accent: ProjectAccent
  titleSize: FontSize
  labelSize: FontSize
  descriptionSize: FontSize
  metaSize: FontSize
}

export type HomeSection = {
  id: string
  type: HomeSectionType
  title: string
  description: string
  titleSize: FontSize
  descriptionSize: FontSize
  limit: number
  featuredOnly: boolean
  items: CustomHomeItem[]
}

export type SiteSettings = {
  socialLinks: SocialLink[]
  fontSizes: FontSizeSettings
  home: {
    eyebrow: string
    headline: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel: string
    secondaryCtaHref: string
    skillGroups: SkillGroup[]
    contactLabel: string
    contactDescription: string
    sections: HomeSection[]
  }
  projectsPage: {
    eyebrow: string
    title: string
    description: string
  }
  blogPage: {
    eyebrow: string
    title: string
    description: string
  }
  footer: {
    title: string
    description: string
  }
}

const SETTINGS_FILE = path.join(process.cwd(), 'content', 'site-settings.json')

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  socialLinks: [
    {
      id: 'instagram',
      name: 'Instagram',
      href: 'https://www.instagram.com/notoxus._morales',
      icon: 'instagram',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/notoxus/',
      icon: 'linkedin',
    },
    {
      id: 'github',
      name: 'GitHub',
      href: 'https://github.com/notoxus',
      icon: 'github',
    },
    {
      id: 'tryhackme',
      name: 'TryHackMe',
      href: 'https://tryhackme.com/p/summerthinh3',
      icon: 'tryhackme',
      shortLabel: 'THM',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      href: 'https://www.youtube.com/@juosterben',
      icon: 'youtube',
    },
  ],
  fontSizes: DEFAULT_FONT_SIZES,
  home: {
    eyebrow: 'DevOps & Cybersecurity learner',
    headline: 'I build practical tools and document what I learn.',
    primaryCtaLabel: 'View projects',
    primaryCtaHref: '/projects',
    secondaryCtaLabel: 'Read my blog',
    secondaryCtaHref: '/blog',
    skillGroups: [
      {
        label: 'DevOps & Linux',
        items: ['Linux', 'Docker', 'Infrastructure'],
      },
      {
        label: 'Security & Networking',
        items: ['Networking', 'Security labs', 'System hardening'],
      },
      {
        label: 'Automation & Tooling',
        items: ['Bash', 'Git', 'Technical writing'],
      },
    ],
    contactLabel: 'Open to',
    contactDescription: 'Projects and knowledge-sharing collaborations.',
    sections: [
      {
        id: 'featured-work',
        type: 'projects',
        title: 'Featured work',
        description:
          'Selected projects that best represent what I build and how I approach problems.',
        titleSize: '2xl',
        descriptionSize: 'sm',
        limit: 3,
        featuredOnly: true,
        items: [],
      },
      {
        id: 'recent-writing',
        type: 'blog',
        title: 'Recent writing',
        description: 'Notes from my work with Linux, networking, security, and software.',
        titleSize: '2xl',
        descriptionSize: 'sm',
        limit: 3,
        featuredOnly: false,
        items: [],
      },
    ],
  },
  projectsPage: {
    eyebrow: 'Selected work',
    title: 'Projects',
    description:
      'Tools and applications I use to practice systems thinking, automation, and software design.',
  },
  blogPage: {
    eyebrow: 'Learning in public',
    title: 'Blog',
    description:
      'Vietnamese and English write-ups on networking, Linux, security fundamentals, and software design.',
  },
  footer: {
    title: "Let's connect",
    description: 'The easiest way to reach me is through LinkedIn or the platforms below.',
  },
}

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
}

function asSkillGroups(value: unknown, fallback: SkillGroup[]): SkillGroup[] {
  if (!Array.isArray(value)) return fallback

  return value
    .map((group): SkillGroup | null => {
      const label = asString(group?.label, '')
      const items = asStringArray(group?.items, [])
      if (!label && !items.length) return null
      return { label, items }
    })
    .filter((group): group is SkillGroup => group !== null)
}

function asSocialLinks(value: unknown, fallback: SocialLink[]): SocialLink[] {
  if (!Array.isArray(value)) return fallback

  return value
    .map((link, index): SocialLink | null => {
      if (!link || typeof link !== 'object') return null
      const source = link as Record<string, unknown>
      const icon =
        typeof source.icon === 'string' &&
        SOCIAL_ICON_OPTIONS.includes(source.icon as SocialIcon)
          ? (source.icon as SocialIcon)
          : 'website'
      const name = asString(source.name, '')
      const href = asString(source.href, '')
      if (!name || !href) return null

      return {
        id: asString(source.id, `${icon}-${index + 1}`),
        name,
        href,
        icon,
        ...(typeof source.shortLabel === 'string' && source.shortLabel.trim()
          ? { shortLabel: source.shortLabel.trim().slice(0, 6) }
          : {}),
      }
    })
    .filter((link): link is SocialLink => link !== null)
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asFontSize(value: unknown, fallback: FontSize): FontSize {
  return isFontSize(value) ? value : fallback
}

function asCustomItems(value: unknown): CustomHomeItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index): CustomHomeItem | null => {
      if (!item || typeof item !== 'object') return null
      const source = item as Record<string, unknown>
      const title = asString(source.title, '')
      if (!title) return null

      return {
        id: asString(source.id, `custom-item-${index + 1}`),
        title,
        label: asOptionalString(source.label),
        description: asOptionalString(source.description),
        meta: asOptionalString(source.meta),
        href: asOptionalString(source.href),
        accent:
          typeof source.accent === 'string' &&
          PROJECT_ACCENTS.includes(source.accent as ProjectAccent)
            ? (source.accent as ProjectAccent)
            : 'blue',
        titleSize: asFontSize(source.titleSize, 'xl'),
        labelSize: asFontSize(source.labelSize, 'xs'),
        descriptionSize: asFontSize(source.descriptionSize, 'sm'),
        metaSize: asFontSize(source.metaSize, 'xs'),
      }
    })
    .filter((item): item is CustomHomeItem => item !== null)
}

function asHomeSections(value: unknown, legacyHome: any): HomeSection[] {
  const legacyFallback: HomeSection[] = DEFAULT_SITE_SETTINGS.home.sections.map((section) => {
    if (section.type === 'projects') {
      return {
        ...section,
        title: asString(legacyHome?.featuredTitle, section.title),
        description: asString(legacyHome?.featuredDescription, section.description),
      }
    }
    if (section.type === 'blog') {
      return {
        ...section,
        title: asString(legacyHome?.latestTitle, section.title),
        description: asString(legacyHome?.latestDescription, section.description),
      }
    }
    return section
  })

  if (!Array.isArray(value)) return legacyFallback

  return value
    .map((section, index): HomeSection | null => {
      if (!section || typeof section !== 'object') return null
      const source = section as Record<string, unknown>
      const type: HomeSectionType =
        source.type === 'projects' || source.type === 'blog' || source.type === 'custom'
          ? source.type
          : 'custom'
      const rawLimit = typeof source.limit === 'number' ? source.limit : Number(source.limit)

      return {
        id: asString(source.id, `home-section-${index + 1}`),
        type,
        title: asString(source.title, 'Untitled section'),
        description: asOptionalString(source.description),
        titleSize: asFontSize(source.titleSize, '2xl'),
        descriptionSize: asFontSize(source.descriptionSize, 'sm'),
        limit: Number.isFinite(rawLimit) ? Math.min(12, Math.max(1, Math.round(rawLimit))) : 3,
        featuredOnly: source.featuredOnly === true,
        items: type === 'custom' ? asCustomItems(source.items) : [],
      }
    })
    .filter((section): section is HomeSection => section !== null)
}

export function normalizeSiteSettings(value: any): SiteSettings {
  const defaults = DEFAULT_SITE_SETTINGS

  return {
    socialLinks: asSocialLinks(value?.socialLinks, defaults.socialLinks),
    fontSizes: normalizeFontSizes(value?.fontSizes),
    home: {
      eyebrow: asString(value?.home?.eyebrow, defaults.home.eyebrow),
      headline: asString(value?.home?.headline, defaults.home.headline),
      primaryCtaLabel: asString(value?.home?.primaryCtaLabel, defaults.home.primaryCtaLabel),
      primaryCtaHref: asString(value?.home?.primaryCtaHref, defaults.home.primaryCtaHref),
      secondaryCtaLabel: asString(value?.home?.secondaryCtaLabel, defaults.home.secondaryCtaLabel),
      secondaryCtaHref: asString(value?.home?.secondaryCtaHref, defaults.home.secondaryCtaHref),
      skillGroups: asSkillGroups(value?.home?.skillGroups, defaults.home.skillGroups),
      contactLabel: asString(value?.home?.contactLabel, defaults.home.contactLabel),
      contactDescription: asString(value?.home?.contactDescription, defaults.home.contactDescription),
      sections: asHomeSections(value?.home?.sections, value?.home),
    },
    projectsPage: {
      eyebrow: asString(value?.projectsPage?.eyebrow, defaults.projectsPage.eyebrow),
      title: asString(value?.projectsPage?.title, defaults.projectsPage.title),
      description: asString(value?.projectsPage?.description, defaults.projectsPage.description),
    },
    blogPage: {
      eyebrow: asString(value?.blogPage?.eyebrow, defaults.blogPage.eyebrow),
      title: asString(value?.blogPage?.title, defaults.blogPage.title),
      description: asString(value?.blogPage?.description, defaults.blogPage.description),
    },
    footer: {
      title: asString(value?.footer?.title, defaults.footer.title),
      description: asString(value?.footer?.description, defaults.footer.description),
    },
  }
}

export const SITE_SETTINGS_CACHE_TAG = 'site-settings'

async function fromGitHub(): Promise<SiteSettings | null> {
  const { GITHUB_TOKEN: token, GITHUB_OWNER: owner, GITHUB_REPO: repo } = process.env
  if (!token || !owner || !repo) return null

  try {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'content/site-settings.json',
    })
    if (Array.isArray(data) || data.type !== 'file') return null
    const raw = Buffer.from(data.content, 'base64').toString('utf-8')
    return normalizeSiteSettings(JSON.parse(raw))
  } catch {
    return null
  }
}

function fromFilesystem(): SiteSettings {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8')
    return normalizeSiteSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}

const loadSettings = unstable_cache(
  async (): Promise<SiteSettings> => (await fromGitHub()) ?? fromFilesystem(),
  [SITE_SETTINGS_CACHE_TAG],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 300 },
)

export async function getSiteSettings(): Promise<SiteSettings> {
  if (process.env.NODE_ENV !== 'production') return fromFilesystem()
  return loadSettings()
}
