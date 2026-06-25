'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { MenuNodeData } from 'lib/composite/menu-node'

interface Props {
  tree: MenuNodeData[]
  title?: string
}

function MenuNode({ node, currentPath }: { node: MenuNodeData; currentPath: string }) {
  const [open, setOpen] = useState(true)

  if (node.children && node.children.length > 0) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setOpen(o => !o)}
          className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors text-left"
        >
          <span>{open ? <>&#9662;</> : <>&#9656;</>}</span>
          {node.label}
        </button>
        {open && (
          <div className="flex flex-col gap-2.5 border-l-2 border-neutral-100 dark:border-neutral-800 ml-1 pl-4">
            {node.children.map(child => (
              <MenuNode key={child.id} node={child} currentPath={currentPath} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const isActive = currentPath === node.href
  return (
    <Link
      href={node.href ?? '#'}
      className={`text-sm transition-all duration-200 ${
        isActive
          ? 'text-neutral-900 dark:text-neutral-100 font-medium'
          : 'text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      {node.label}
    </Link>
  )
}

export default function CompositeMenu({ tree, title = 'Blog' }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('portfolio-blog-menu-collapsed')
    if (stored) {
      setCollapsed(stored === 'true')
      return
    }

    setCollapsed(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem('portfolio-blog-menu-collapsed', String(next))
      return next
    })
  }

  return (
    <aside
      className={`surface-panel self-start rounded-2xl p-4 transition-all md:sticky md:top-28 ${
        collapsed ? 'md:w-44' : 'md:w-64'
      }`}
    >
      <div className={`flex gap-3 ${collapsed ? 'flex-col items-start' : 'items-center justify-between'}`}>
        <h2 className="font-bold text-xl tracking-tighter uppercase text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-blue-400"
        >
          {collapsed ? 'Show menu' : 'Hide'}
        </button>
      </div>

      {!collapsed && (
        <nav className="mt-8 flex flex-col gap-7">
          {tree.map(node => (
            <MenuNode key={node.id} node={node} currentPath={pathname} />
          ))}
        </nav>
      )}
    </aside>
  )
}
