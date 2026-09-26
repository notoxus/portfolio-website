import { BlogPosts } from 'app/components/posts'
import { StaggerContainer, StaggerItem } from 'app/components/FadeIn'
import { HomeHero } from 'app/components/HomeHero'
import { ProofOfWork } from 'app/components/ProofOfWork'
import { getHomeIntro } from 'lib/site-content'
import { getSiteSettings, type CustomHomeItem, type HomeSection } from 'lib/site-settings'
import { fontSizeStyle, responsiveFontSizeStyle } from 'lib/font-sizes'
import { PROJECT_ACCENT_STYLES } from 'lib/project-accents'
import { ProjectList } from './components/project-list'

function SectionHeading({ section }: { section: HomeSection }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <h2
        style={responsiveFontSizeStyle(section.titleSize)}
        className="font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
      >
        {section.title}
      </h2>
      {section.description && (
        <p
          style={fontSizeStyle(section.descriptionSize)}
          className="max-w-md leading-6 text-neutral-600 dark:text-neutral-400 sm:text-right"
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
          style={responsiveFontSizeStyle(item.titleSize)}
          className="font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
        >
          {item.title}
        </h3>
        {item.label && (
          <span
            style={fontSizeStyle(item.labelSize)}
            className={`rounded-full px-2.5 py-1 font-bold ${PROJECT_ACCENT_STYLES[item.accent]}`}
          >
            {item.label}
          </span>
        )}
      </div>
      {item.description && (
        <p
          style={fontSizeStyle(item.descriptionSize)}
          className="max-w-3xl leading-6 text-neutral-600 dark:text-neutral-400"
        >
          {item.description}
        </p>
      )}
      {item.meta && (
        <p
          style={fontSizeStyle(item.metaSize)}
          className="mt-3 font-mono text-neutral-500 dark:text-neutral-500"
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
    <section className="space-y-8 sm:space-y-12 md:space-y-16">
      {/* Terminal Hero */}
      <HomeHero settings={settings} intro={intro} />

      {/* Proof of Work */}
      <ProofOfWork />

      {/* Github contribution */}
      <div className="surface-panel rounded-2xl p-6 text-center space-y-4">
        <p className="font-mono text-xs text-neutral-500"># github contribution matrix</p>
      
        <img 
          src="/snake.svg" 
          alt="GitHub Contribution Matrix" 
          className="mx-auto max-w-full h-auto dark:invert opacity-90" 
        />
        {/* Loading pane */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden my-3 relative">
          <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full animate-[pacman-progress_6s_ease-in-out_infinite]"></div>
        </div>
      </div>

      {/* Dynamic section */}
      {home.sections.map((section) => (
        <HomepageSection key={section.id} section={section} />
      ))}
    </section>
  )
}