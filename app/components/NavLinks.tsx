'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = {
  '/': { name: 'home' },
  '/blog': { name: 'blog' },
  '/projects': { name: 'projects' },
  '/notebook': { name: 'notebook' },
  '/essential-tools': { name: 'tools' },
}

export default function NavLinks() {
  const pathname = usePathname()

  function isActive(path: string) {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="flex flex-row flex-wrap gap-1 text-sm text-neutral-500 dark:text-neutral-400">
      {Object.entries(navItems).map(([path, { name }]) => (
        <Link
          key={path}
          href={path}
          className={`rounded-lg px-2.5 py-1.5 font-medium transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 ${
            isActive(path) ? 'nav-link-active' : ''
          }`}
        >
          {name}
        </Link>
      ))}
    </div>
  )
}
