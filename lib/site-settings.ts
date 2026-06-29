import fs from 'fs'
import path from 'path'

export type SiteSettings = {
  home: {
    eyebrow: string
    headline: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel: string
    secondaryCtaHref: string
    programmingLanguagesLabel: string
    programmingLanguagesItems: string[]
    frameworksToolsLabel: string
    frameworksToolsItems: string[]
    technicalSkillsLabel: string
    technicalSkillsItems: string[]
    languageLabel: string
    languageItems: string[]
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
    eyebrow: 'Cybersecurity & Ethical Hacking · SysAdmin / DevSecOps',
    headline: 'Where I share my blog, my work and case study',
    primaryCtaLabel: 'View projects',
    primaryCtaHref: '/projects',
    secondaryCtaLabel: 'Read notes',
    secondaryCtaHref: '/blog',
    programmingLanguagesLabel: 'Programming Language',
    programmingLanguagesItems: ['Java', 'TypeScript', 'C++'],
    frameworksToolsLabel: 'Frameworks & Tools',
    frameworksToolsItems: ['Next.js', 'Maven', 'GitHub Actions'],
    technicalSkillsLabel: 'Technical skills',
    technicalSkillsItems: ['System Design', 'Automation', 'Technical Writing'],
    languageLabel: 'Language',
    languageItems: ['English'],
    contactLabel: 'Contact',
    contactDescription:
      'Open to thoughtful collaboration, tool ideas, and practical software problems.',
    featuredTitle: 'Featured work',
    featuredDescription:
      'Project entries as compact case studies, with enough context to scan.',
    latestTitle: 'Latest notes',
    latestDescription:
      'Writing about software patterns, systems, and things worth remembering.',
  },
  projectsPage: {
    eyebrow: 'Selected build log',
    title: 'Projects',
    description:
      'Compact notes on the tools, experiments, and applications I keep shaping.',
  },
  blogPage: {
    eyebrow: 'Notes and essays',
    title: 'Blog',
    description:
      'Small writeups about programming, systems, learning, and design patterns.',
  },
  footer: {
    title: 'Contact',
    description: 'Social links and places I keep active.',
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
      programmingLanguagesLabel: asString(
        value?.home?.programmingLanguagesLabel ?? value?.home?.focusLabel,
        defaults.home.programmingLanguagesLabel,
      ),
      programmingLanguagesItems: asStringArray(
        value?.home?.programmingLanguagesItems ?? value?.home?.focusItems,
        defaults.home.programmingLanguagesItems,
      ),
      frameworksToolsLabel: asString(
        value?.home?.frameworksToolsLabel,
        defaults.home.frameworksToolsLabel,
      ),
      frameworksToolsItems: asStringArray(
        value?.home?.frameworksToolsItems,
        defaults.home.frameworksToolsItems,
      ),
      technicalSkillsLabel: asString(
        value?.home?.technicalSkillsLabel,
        defaults.home.technicalSkillsLabel,
      ),
      technicalSkillsItems: asStringArray(
        value?.home?.technicalSkillsItems,
        defaults.home.technicalSkillsItems,
      ),
      languageLabel: asString(value?.home?.languageLabel, defaults.home.languageLabel),
      languageItems: asStringArray(value?.home?.languageItems, defaults.home.languageItems),
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
