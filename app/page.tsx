import { BlogPosts } from 'app/components/posts'
import { getHomeIntro } from 'lib/site-content'
import { ProjectList } from './components/project-list'
import { SocialLinks } from './components/social-links'
import { getSiteSettings } from 'lib/site-settings'

const practiceItems = [
  {
    label: 'Hands-on security',
    description:
      'Practicing enumeration, web security, and defensive thinking through guided labs and write-ups.',
    href: 'https://tryhackme.com/p/summerthinh3',
    linkLabel: 'View TryHackMe profile',
  },
  {
    label: 'Systems & automation',
    description:
      'Using Linux, Bash, and small utilities to reduce repetitive work and make workflows easier to inspect.',
    href: 'https://github.com/notoxus',
    linkLabel: 'Explore my GitHub',
  },
  {
    label: 'Learning in public',
    description:
      'Turning networking, Linux, and software-design lessons into practical blog posts in Vietnamese and English.',
    href: '/blog',
    linkLabel: 'Read the blog',
  },
]

export default function Page() {
  const intro = getHomeIntro()
  const settings = getSiteSettings()
  const home = settings.home


  return (
    <section className="space-y-10 md:space-y-16">
      <section className="grid gap-6 lg:gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div>
          <div className="mb-5 flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="status-dot" />
            <span>{home.eyebrow}</span>
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold leading-none tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl md:text-5xl lg:text-7xl">
            {home.headline}
          </h1>
          <div className="mt-4 flex items-start justify-between gap-3 sm:mt-6">
            <p className="max-w-2xl whitespace-pre-line text-sm leading-7 text-neutral-700 dark:text-neutral-300 sm:text-base sm:leading-8 md:text-lg">
              {intro}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={home.primaryCtaHref}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              {home.primaryCtaLabel}
            </a>
            <a
              href={home.secondaryCtaHref}
              className="surface-panel rounded-lg px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5 dark:text-neutral-100"
            >
              {home.secondaryCtaLabel}
            </a>
          </div>
        </div>

        <aside className="surface-panel relative overflow-hidden rounded-2xl">
          {home.skillGroups.map((group) => (
            <div
              key={group.label}
              className="border-b border-neutral-200/80 p-5 dark:border-neutral-800/80"
            >
              <div className="mb-3">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
                  {group.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="p-5">
            <div className="mb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
                {home.contactLabel}
              </span>
            </div>
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {home.contactDescription}
            </p>
            <div className="mt-4">
              <SocialLinks compact />
            </div>
          </div>
        </aside>
      </section>

      <section aria-labelledby="practice-title">
        <div className="mb-6 max-w-2xl">
          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-500">How I learn</p>
          <h2
            id="practice-title"
            className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
          >
            Focus, practice, and proof of work
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {practiceItems.map((item) => {
            const external = item.href.startsWith('http')

            return (
              <a
                key={item.label}
                href={item.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="surface-panel group flex flex-col rounded-2xl p-4 transition hover:-translate-y-1 hover:border-blue-500 sm:min-h-52 sm:p-5"
              >
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                  {item.label}
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
                <span className="mt-auto pt-6 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {item.linkLabel} <span aria-hidden="true">→</span>
                </span>
              </a>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            {home.featuredTitle}
          </h2>
          <div className="max-w-md sm:text-right">
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {home.featuredDescription}
            </p>
          </div>
        </div>
        <ProjectList limit={3} featuredOnly />
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            {home.latestTitle}
          </h2>
          <p className="max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-right">
            {home.latestDescription}
          </p>
        </div>
        <BlogPosts limit={3} />
      </section>
    </section>
  )
}
