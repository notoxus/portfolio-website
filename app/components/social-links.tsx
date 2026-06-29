import Image from 'next/image'

type SocialLink = {
  name: string
  href: string
  iconSrc?: string
  shortLabel?: string
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/notoxus._morales',
    iconSrc: '/images/social/instagram-clean.png',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/notoxus/',
    iconSrc: '/images/social/linkedin-clean.png',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/notoxus',
    iconSrc: '/images/social/github.png',
  },
  {
    name: 'TryHackMe',
    href: 'https://tryhackme.com/p/summerthinh3',
    shortLabel: 'THM',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@juosterben',
    iconSrc: '/images/social/youtube.png',
  },
]

function SocialIcon({ link }: { link: SocialLink }) {
  if (!link.iconSrc) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-red-500/15 font-mono text-[8px] font-black text-red-600 dark:text-red-400">
        {link.shortLabel ?? link.name.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center">
      <Image
        src={link.iconSrc}
        alt=""
        width={24}
        height={24}
        className="h-full w-full object-contain"
      />
    </span>
  )
}

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-wrap ${compact ? 'gap-2' : 'gap-2.5'}`}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.name}
          className={`surface-panel group inline-flex min-h-10 items-center justify-center rounded-lg transition hover:-translate-y-0.5 hover:border-blue-500 ${
            compact ? 'min-w-10 p-2' : 'gap-2 px-3 py-2'
          }`}
        >
          <SocialIcon link={link} />
          {!compact && (
            <span className="text-sm font-medium text-neutral-700 transition group-hover:text-neutral-950 dark:text-neutral-300 dark:group-hover:text-neutral-50">
              {link.name}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}
