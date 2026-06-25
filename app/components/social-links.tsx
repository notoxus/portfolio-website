import Image from 'next/image'

type SocialLink = {
  name: string
  href: string
  iconSrc: string
  iconClassName: string
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/notoxus._morales',
    iconSrc: '/images/social/instagram-clean.png',
    iconClassName: 'h-6 w-6',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/b%C3%B9i-v%C3%B5-ph%C6%B0%E1%BB%9Bc-th%E1%BB%8Bnh-7b80b531a/',
    iconSrc: '/images/social/linkedin-clean.png',
    iconClassName: 'h-6 w-6',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/notoxus',
    iconSrc: '/images/social/github.png',
    iconClassName: 'h-6 w-6',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@juosterben',
    iconSrc: '/images/social/youtube.png',
    iconClassName: 'h-5 w-7',
  },
]

function SocialIcon({ link }: { link: SocialLink }) {
  return (
    <Image
      src={link.iconSrc}
      alt=""
      width={32}
      height={32}
      className={`${link.iconClassName} object-contain`}
    />
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
