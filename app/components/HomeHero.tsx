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
          className="mb-4 sm:mb-5 flex items-center gap-2.5 font-mono text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 overflow-x-auto"
        >
          <span className="font-bold text-green-600 dark:text-green-500 shrink-0">root@notoxus:~$</span>
          <span className="border-r-2 border-neutral-400 pr-1 animate-pulse truncate">
            whoami --role="{home.eyebrow}"
          </span>
        </div>
        
        <h1
          style={responsiveFontSizeStyle(settings.fontSizes.homeHeadline)}
          className="max-w-3xl font-semibold leading-[1.1] sm:leading-[1.05] tracking-tight text-neutral-950 dark:text-neutral-50 text-2xl sm:text-4xl"
        >
          <span className="font-mono text-blue-600 dark:text-blue-500 font-bold mr-2">{'>'}</span>
          {home.headline}
        </h1>
        
        <div className="mt-4 sm:mt-6 lg:pr-6">
          <p
            style={responsiveFontSizeStyle(settings.fontSizes.homeIntro)}
            className="max-w-xl whitespace-pre-line text-justify leading-6 sm:leading-8 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base"
          >
            {intro}
          </p>
        </div>
        
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 font-mono">
          <a
            href={home.primaryCtaHref}
            style={fontSizeStyle(settings.fontSizes.homeCta)}
            className="rounded bg-green-600/10 border border-green-600/30 px-3.5 sm:px-4 py-2 font-semibold text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-600/20 dark:text-green-400 text-xs sm:text-sm"
          >
            [ {home.primaryCtaLabel} ]
          </a>
          <a
            href={home.secondaryCtaHref}
            style={fontSizeStyle(settings.fontSizes.homeCta)}
            className="surface-panel rounded px-3.5 sm:px-4 py-2 font-semibold text-neutral-900 transition hover:-translate-y-0.5 dark:text-neutral-100 text-xs sm:text-sm"
          >
            ./{home.secondaryCtaLabel.toLowerCase().replace(/\s+/g, '-')}
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.16} className="hero-panel-column">
        <div className="hero-panel-shell">
          <aside className="surface-panel hero-panel relative overflow-hidden rounded-xl border border-neutral-300 bg-white/50 font-mono shadow-xl dark:border-neutral-700 dark:bg-black/40">
            
            {/* Header htop chuẩn nguyên bản */}
            <div className="flex items-center gap-2 border-b border-neutral-200/80 bg-neutral-100/50 px-4 py-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/50 sm:px-5">
              <div className="h-3 w-3 rounded-full bg-red-500 opacity-80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500 opacity-80" />
              <div className="h-3 w-3 rounded-full bg-green-500 opacity-80" />
              <span className="ml-2 text-xs font-semibold text-neutral-500">
                htop / system-status
              </span>
            </div>

            {home.skillGroups.map((group, groupIndex) => (
              <div
                key={`${group.label}-${groupIndex}`}
                className="border-b border-neutral-200/80 px-4 py-3.5 dark:border-neutral-800/80 sm:px-5"
              >
                <div className="mb-2">
                  <span
                    style={fontSizeStyle(settings.fontSizes.skillGroupLabel)}
                    className="font-bold text-neutral-500 dark:text-neutral-400"
                  >
                    # {group.label.toLowerCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {group.items.map((item, itemIndex) => (
                    <span
                      key={`${item}-${itemIndex}`}
                      style={fontSizeStyle(settings.fontSizes.skillTag)}
                      className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 dark:border-blue-400/20 dark:text-blue-300"
                    >
                      <span className="text-blue-400 dark:text-blue-500 opacity-70 mr-1">●</span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="px-4 py-4 sm:px-5">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span
                  style={fontSizeStyle(settings.fontSizes.contactLabel)}
                  className="font-bold text-neutral-500 dark:text-neutral-400"
                >
                  {home.contactLabel.toLowerCase()}
                </span>
              </div>
              <p
                style={fontSizeStyle(settings.fontSizes.contactDescription)}
                className="leading-5 text-neutral-600 dark:text-neutral-400 mb-4"
              >
                {home.contactDescription}
              </p>
              <div className="flex justify-start">
                <SocialLinks links={settings.socialLinks} compact />
              </div>
            </div>
          </aside>
        </div>
      </FadeIn>
    </section>
  )
}