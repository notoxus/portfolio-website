import { BlogPosts } from 'app/components/posts'
import { FadeIn, StaggerContainer, StaggerItem } from 'app/components/FadeIn'
import { getHomeIntro } from 'lib/site-content'
import { getSiteSettings, type CustomHomeItem, type HomeSection } from 'lib/site-settings'
import { fontSizeClass, responsiveFontSizeClass } from 'lib/font-sizes'
import { PROJECT_ACCENT_STYLES } from 'lib/project-accents'
import { ProjectList } from './components/project-list'
import { SocialLinks } from './components/social-links'

function SectionHeading({ section }: { section: HomeSection }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <h2
        className={`${responsiveFontSizeClass(section.titleSize)} font-semibold tracking-tight text-neutral-950 dark:text-neutral-50`}
      >
        {section.title}
      </h2>
      {section.description && (
        <p
          className={`max-w-md ${fontSizeClass(section.descriptionSize)} leading-6 text-neutral-600 dark:text-neutral-400 sm:text-right`}
        >
          {section.description}
        </p>
      )}
    </div>
  )
}

function CustomItemContent({ item, index }: { item: CustomHomeItem; index: number }) {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="index-pill">{String(index + 1).padStart(2, '0')}</span>
        <h3
          className={`${responsiveFontSizeClass(item.titleSize)} font-semibold tracking-tight text-neutral-950 dark:text-neutral-50`}
        >
          {item.title}
        </h3>
        {item.label && (
          <span
            className={`rounded-full px-2.5 py-1 ${fontSizeClass(item.labelSize)} font-bold ${PROJECT_ACCENT_STYLES[item.accent]}`}
          >
            {item.label}
          </span>
        )}
      </div>
      {item.description && (
        <p
          className={`max-w-3xl ${fontSizeClass(item.descriptionSize)} leading-6 text-neutral-600 dark:text-neutral-400`}
        >
          {item.description}
        </p>
      )}
      {item.meta && (
        <p
          className={`mt-3 font-mono ${fontSizeClass(item.metaSize)} text-neutral-500 dark:text-neutral-500`}
        >
          {item.meta}
        </p>
      )}
    </>
  )
}

function CustomSection({ section }: { section: HomeSection }) {
  if (!section.items.length) {
    return (
      <div className="surface-panel rounded-2xl px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No items in this section yet.
      </div>
    )
  }

  return (
    <StaggerContainer className="glass-list">
      {section.items.map((item, index) => {
        const external = /^https?:\/\//.test(item.href)
        const className =
          'group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-neutral-200/80 px-4 py-4 transition-colors hover:border-blue-500/50 dark:border-neutral-800/80 sm:gap-5 sm:px-5 sm:py-6'

        return (
          <StaggerItem key={item.id} className={className}>
            {item.href ? (
              <a
                href={item.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="min-w-0"
              >
                <CustomItemContent item={item} index={index} />
              </a>
            ) : (
              <div className="min-w-0">
                <CustomItemContent item={item} index={index} />
              </div>
            )}
            {item.href && (
              <span className="arrow-box hidden sm:grid" aria-hidden="true">
                -&gt;
              </span>
            )}
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}

function HomepageSection({ section }: { section: HomeSection }) {
  return (
    <section>
      <SectionHeading section={section} />
      {section.type === 'projects' && (
        <ProjectList limit={section.limit} featuredOnly={section.featuredOnly} />
      )}
      {section.type === 'blog' && <BlogPosts limit={section.limit} />}
      {section.type === 'custom' && <CustomSection section={section} />}
    </section>
  )
}

export default async function Page() {
  const intro = await getHomeIntro()
  const settings = await getSiteSettings()
  const home = settings.home

  return (
    <section className="space-y-10 md:space-y-16">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-10">
        <FadeIn>
          <div
            className={`mb-5 flex items-center gap-2.5 ${fontSizeClass(settings.fontSizes.homeEyebrow)} text-neutral-600 dark:text-neutral-400`}
          >
            <span className="status-dot" />
            <span>{home.eyebrow}</span>
          </div>
          <h1
            className={`max-w-3xl ${responsiveFontSizeClass(settings.fontSizes.homeHeadline)} font-semibold leading-[1.05] tracking-tight text-neutral-950 dark:text-neutral-50`}
          >
            {home.headline}
          </h1>
          <div className="mt-4 sm:mt-6 lg:pr-6">
            <p
              className={`max-w-xl whitespace-pre-line text-justify ${responsiveFontSizeClass(settings.fontSizes.homeIntro)} leading-7 text-neutral-700 [text-wrap:pretty] dark:text-neutral-300 sm:leading-8`}
            >
              {intro}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={home.primaryCtaHref}
              className={`rounded-lg bg-blue-600 px-4 py-2 ${fontSizeClass(settings.fontSizes.homeCta)} font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500`}
            >
              {home.primaryCtaLabel}
            </a>
            <a
              href={home.secondaryCtaHref}
              className={`surface-panel rounded-lg px-4 py-2 ${fontSizeClass(settings.fontSizes.homeCta)} font-semibold text-neutral-900 transition hover:-translate-y-0.5 dark:text-neutral-100`}
            >
              {home.secondaryCtaLabel}
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <aside className="surface-panel relative overflow-hidden rounded-2xl">
            {home.skillGroups.map((group) => (
              <div
                key={group.label}
                className="border-b border-neutral-200/80 px-4 py-3.5 dark:border-neutral-800/80 sm:px-5"
              >
                <div className="mb-2">
                  <span
                    className={`${fontSizeClass(settings.fontSizes.skillGroupLabel)} font-black uppercase tracking-[0.14em] text-neutral-400`}
                  >
                    {group.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className={`rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 ${fontSizeClass(settings.fontSizes.skillTag)} font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="px-4 py-3.5 sm:px-5">
              <div className="mb-1.5">
                <span
                  className={`${fontSizeClass(settings.fontSizes.contactLabel)} font-black uppercase tracking-[0.14em] text-neutral-400`}
                >
                  {home.contactLabel}
                </span>
              </div>
              <p
                className={`${fontSizeClass(settings.fontSizes.contactDescription)} leading-5 text-neutral-600 dark:text-neutral-400`}
              >
                {home.contactDescription}
              </p>
              <div className="mt-3 flex justify-center">
                <SocialLinks links={settings.socialLinks} compact />
              </div>
            </div>
          </aside>
        </FadeIn>
      </section>

      {home.sections.map((section) => (
        <HomepageSection key={section.id} section={section} />
      ))}
    </section>
  )
}
