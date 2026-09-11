import Image from 'next/image'
import { fontSizeClass, type FontSize } from 'lib/font-sizes'
import type { SocialIcon, SocialLink } from 'lib/site-settings'

const SOCIAL_ICON_SOURCES: Partial<Record<SocialIcon, string>> = {
  instagram: '/images/social/instagram-clean.png',
  linkedin: '/images/social/linkedin-clean.png',
  github: '/images/social/github.png',
  youtube: '/images/social/youtube.png',
}

function SocialIconView({ link }: { link: SocialLink }) {
  const iconSrc = SOCIAL_ICON_SOURCES[link.icon]

  if (!iconSrc) {
    const fallback =
      link.shortLabel ?? (link.icon === 'tryhackme' ? 'THM' : link.name.slice(0, 2).toUpperCase())

    return (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-red-500/15 font-mono text-[8px] font-black text-red-600 dark:text-red-400">
        {fallback}
      </span>
    )
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center">
      <Image
        src={iconSrc}
        alt=""
        width={24}
        height={24}
        className="h-full w-full object-contain"
      />
    </span>
  )
}

export function SocialLinks({
  links,
  compact = false,
  labelSize = 'sm',
}: {
  links: SocialLink[]
  compact?: boolean
  labelSize?: FontSize
}) {
  if (!links.length) return null

  return (
    <div className={`flex flex-wrap ${compact ? 'gap-2' : 'gap-2.5'}`}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.name}
          className={`surface-panel group inline-flex min-h-10 items-center justify-center rounded-lg transition hover:-translate-y-0.5 hover:border-blue-500 ${
            compact ? 'min-w-10 p-2' : 'gap-2 px-3 py-2'
          }`}
        >
          <SocialIconView link={link} />
          {!compact && (
            <span
              className={`${fontSizeClass(labelSize)} font-medium text-neutral-700 transition group-hover:text-neutral-950 dark:text-neutral-300 dark:group-hover:text-neutral-50`}
            >
              {link.name}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}
