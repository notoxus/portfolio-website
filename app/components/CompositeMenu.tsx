'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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

  return (
    <aside className="md:w-56 flex-shrink-0">
      <h2 className="font-bold text-xl mb-8 tracking-tighter uppercase text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      <nav className="flex flex-col gap-7">
        {tree.map(node => (
          <MenuNode key={node.id} node={node} currentPath={pathname} />
        ))}
      </nav>
    </aside>
  )
}
