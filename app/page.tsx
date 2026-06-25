import { BlogPosts } from 'app/components/posts'
import { getHomeIntro } from 'lib/site-content'
import AdminEditLink from 'app/components/AdminEditLink'
import { ProjectList } from './components/project-list'
import { SocialLinks } from './components/social-links'
import { getSiteSettings } from 'lib/site-settings'

export default function Page() {
  const intro = getHomeIntro()
  const settings = getSiteSettings()
  const home = settings.home
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME

  return (
    <section className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div>
          <div className="mb-5 flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="status-dot" />
            <span>{home.eyebrow}</span>
            <AdminEditLink href="/admin/site-settings" label="edit homepage labels" adminUsername={adminUsername} />
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-tight text-neutral-950 dark:text-neutral-50 md:text-7xl">
            {home.headline}
          </h1>
          <div className="mt-6 flex items-start justify-between gap-3">
            <p className="max-w-2xl whitespace-pre-line text-base leading-8 text-neutral-700 dark:text-neutral-300 md:text-lg">
              {intro}
            </p>
            <AdminEditLink href="/admin/intro" label="edit intro" adminUsername={adminUsername} />
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
            <AdminEditLink href="/admin/site-settings" label="edit home buttons" adminUsername={adminUsername} />
          </div>
        </div>

        <aside className="surface-panel relative overflow-hidden rounded-2xl">
          <div className="absolute right-4 top-4 z-10">
            <AdminEditLink href="/admin/site-settings" label="edit side panel" adminUsername={adminUsername} />
          </div>
          <div className="border-b border-neutral-200/80 p-5 dark:border-neutral-800/80">
            <div className="mb-3 pr-8">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
                {home.programmingLanguagesLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {home.programmingLanguagesItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="border-b border-neutral-200/80 p-5 dark:border-neutral-800/80">
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
                {home.frameworksToolsLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {home.frameworksToolsItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="border-b border-neutral-200/80 p-5 dark:border-neutral-800/80">
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
                {home.technicalSkillsLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {home.technicalSkillsItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="border-b border-neutral-200/80 p-5 dark:border-neutral-800/80">
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
                {home.languageLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {home.languageItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
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

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
              {home.featuredTitle}
            </h2>
            <AdminEditLink href="/admin/projects" label="edit featured projects" adminUsername={adminUsername} />
          </div>
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
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
              {home.latestTitle}
            </h2>
            <AdminEditLink href="/admin/blog" label="edit latest notes" adminUsername={adminUsername} />
          </div>
          <p className="max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-right">
            {home.latestDescription}
          </p>
        </div>
        <BlogPosts limit={3} />
      </section>
    </section>
  )
}
