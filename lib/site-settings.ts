import fs from 'fs'
import path from 'path'

export type SkillGroup = {
  label: string
  items: string[]
}

export type SiteSettings = {
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
    featuredTitle: string
    featuredDescription: string
    latestTitle: string
    latestDescription: string
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
  home: {
    eyebrow: 'Cybersecurity learner · SysAdmin / DevSecOps',
    headline: 'I build practical tools, study how systems break, and document what I learn.',
    primaryCtaLabel: 'Explore my work',
    primaryCtaHref: '/projects',
    secondaryCtaLabel: 'Read my blog',
    secondaryCtaHref: '/blog',
    skillGroups: [
      {
        label: 'Systems & Security',
        items: ['Linux', 'Kali Linux', 'Network fundamentals', 'Web security labs'],
      },
      {
        label: 'Build & Deliver',
        items: ['Automation', 'Git', 'Maven / Gradle', 'Technical writing'],
      },
      {
        label: 'Language',
        items: ['Vietnamese', 'English'],
      },
    ],
    contactLabel: 'Open to',
    contactDescription:
      'Security projects, automation ideas, and knowledge-sharing collaborations.',
    featuredTitle: 'Featured work',
    featuredDescription:
      'Selected projects with the problem, implementation, and skills they helped me practice.',
    latestTitle: 'Latest blog posts',
    latestDescription:
      'Vietnamese and English blog posts on networking, Linux, security fundamentals, and software design.',
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
  return typeof value === 'string' && value.trim() ? value : fallback
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback
  const items = value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  )
  return items.length ? items : fallback
}

function asSkillGroups(value: unknown, fallback: SkillGroup[]): SkillGroup[] {
  if (Array.isArray(value)) {
    const groups = value
      .map((group): SkillGroup | null => {
        const label = asString(group?.label, '')
        const items = asStringArray(group?.items, [])
        if (!label && !items.length) return null
        return { label, items }
      })
      .filter((group): group is SkillGroup => group !== null)
    if (groups.length) return groups
  }
  return fallback
}

export function normalizeSiteSettings(value: any): SiteSettings {
  const defaults = DEFAULT_SITE_SETTINGS

  return {
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
      featuredTitle: asString(value?.home?.featuredTitle, defaults.home.featuredTitle),
      featuredDescription: asString(
        value?.home?.featuredDescription,
        defaults.home.featuredDescription,
      ),
      latestTitle: asString(value?.home?.latestTitle, defaults.home.latestTitle),
      latestDescription: asString(value?.home?.latestDescription, defaults.home.latestDescription),
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

export function getSiteSettings(): SiteSettings {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8')
    return normalizeSiteSettings(JSON.parse(raw))
  } catch {}

  return DEFAULT_SITE_SETTINGS
}
