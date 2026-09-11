'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavigationItem } from 'lib/site-settings'
import { fontSizeStyle, type FontSize } from 'lib/font-sizes'

export default function NavLinks({ items, fontSize }: { items: NavigationItem[]; fontSize: FontSize }) {
  const pathname = usePathname()

  function isActive(path: string) {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="flex flex-row flex-wrap gap-1 text-sm text-neutral-500 dark:text-neutral-400">
      {items.filter((item) => item.visible).map((item) => (
        <Link
          key={item.id}
          href={item.href}
          style={fontSizeStyle(fontSize)}
          className={`rounded-lg px-2.5 py-1.5 font-medium transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 ${
            isActive(item.href) ? 'nav-link-active' : ''
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
