'use client'

import type { CSSProperties } from 'react'
import type { SiteSettings } from 'lib/site-settings'
import { fontSizeStyle, responsiveFontSizeStyle } from 'lib/font-sizes'
import { FadeIn } from './FadeIn'
import { SocialLinks } from './social-links'

export function HomeHero({ settings, intro }: { settings: SiteSettings; intro: string }) {
  const home = settings.home
  const panel = home.panelLayout
  const heroStyle = {
    '--hero-panel-width': `${panel.widthPercent}%`,
    '--hero-panel-min-height': `${panel.minHeightPx}px`,
    '--hero-panel-offset-x': `${panel.offsetXPx}px`,
    '--hero-panel-offset-y': `${panel.offsetYPx}px`,
  } as CSSProperties

  return (
    <section
      className="hero-grid"
      data-panel-side={panel.side}
      data-panel-align={panel.verticalAlign}
      style={heroStyle}
    >
      <FadeIn className="hero-copy">
        <div
          style={fontSizeStyle(settings.fontSizes.homeEyebrow)}
          className="mb-5 flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400"
        >
          <span className="status-dot" />
          <span>{home.eyebrow}</span>
        </div>
        <h1
          style={responsiveFontSizeStyle(settings.fontSizes.homeHeadline)}
          className="max-w-3xl font-semibold leading-[1.05] tracking-tight text-neutral-950 dark:text-neutral-50"
        >
          {home.headline}
        </h1>
        <div className="mt-4 sm:mt-6 lg:pr-6">
          <p
            style={responsiveFontSizeStyle(settings.fontSizes.homeIntro)}
            className="max-w-xl whitespace-pre-line text-justify leading-7 text-neutral-700 [text-wrap:pretty] dark:text-neutral-300 sm:leading-8"
          >
            {intro}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={home.primaryCtaHref}
            style={fontSizeStyle(settings.fontSizes.homeCta)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            {home.primaryCtaLabel}
          </a>
          <a
            href={home.secondaryCtaHref}
            style={fontSizeStyle(settings.fontSizes.homeCta)}
            className="surface-panel rounded-lg px-4 py-2 font-semibold text-neutral-900 transition hover:-translate-y-0.5 dark:text-neutral-100"
          >
            {home.secondaryCtaLabel}
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.16} className="hero-panel-column">
        <div className="hero-panel-shell">
          <aside className="surface-panel hero-panel relative overflow-hidden rounded-2xl">
            {home.skillGroups.map((group, groupIndex) => (
              <div
                key={`${group.label}-${groupIndex}`}
                className="border-b border-neutral-200/80 px-4 py-3.5 dark:border-neutral-800/80 sm:px-5"
              >
                <div className="mb-2">
                  <span
                    style={fontSizeStyle(settings.fontSizes.skillGroupLabel)}
                    className="font-black uppercase tracking-[0.14em] text-neutral-400"
                  >
                    {group.label}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {group.items.map((item, itemIndex) => (
                    <span
                      key={`${item}-${itemIndex}`}
                      style={fontSizeStyle(settings.fontSizes.skillTag)}
                      className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
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
                  style={fontSizeStyle(settings.fontSizes.contactLabel)}
                  className="font-black uppercase tracking-[0.14em] text-neutral-400"
                >
                  {home.contactLabel}
                </span>
              </div>
              <p
                style={fontSizeStyle(settings.fontSizes.contactDescription)}
                className="leading-5 text-neutral-600 dark:text-neutral-400"
              >
                {home.contactDescription}
              </p>
              <div className="mt-3 flex justify-center">
                <SocialLinks links={settings.socialLinks} compact />
              </div>
            </div>
          </aside>
        </div>
      </FadeIn>
    </section>
  )
}
