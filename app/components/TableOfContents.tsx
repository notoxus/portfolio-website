'use client'

import React, { useEffect, useState } from 'react'
import type { MenuNodeData } from 'lib/composite/menu-node'

export function extractHeadings(source: string): Array<{ id: string; text: string; level: number }> {
  // Extract H2 to H4 headings from markdown source
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const headings: Array<{ id: string; text: string; level: number }> = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length
    const rawText = match[2].trim()
    // Clean inline markdown links, bold, code
    const text = rawText
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim()

    if (!text) continue

    const id = text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/-+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}

function TOCItem({
  node,
  activeId,
  onSelect,
}: {
  node: MenuNodeData
  activeId: string
  onSelect: (id: string) => void
}) {
  const isActive = activeId === node.id

  return (
    <li className="my-1.5 list-none">
      <a
        href={node.href || `#${node.id}`}
        onClick={(e) => {
          e.preventDefault()
          onSelect(node.id)
        }}
        className={`block text-xs transition-colors py-1 ${
          node.level === 3 ? 'pl-3' : node.level === 4 ? 'pl-6' : 'pl-0'
        } ${
          isActive
            ? 'font-semibold text-blue-600 dark:text-blue-400 border-l-2 border-blue-600 dark:border-blue-400 -ml-[2px] pl-2'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
        }`}
      >
        {node.label}
      </a>
      {node.children && node.children.length > 0 && (
        <ul className="space-y-1 mt-0.5">
          {node.children.map((child) => (
            <TOCItem key={child.id} node={child} activeId={activeId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function TableOfContents({ tree }: { tree: MenuNodeData[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!tree || tree.length === 0) return

    // Flatten all IDs from the composite tree
    const collectIds = (nodes: MenuNodeData[]): string[] => {
      let ids: string[] = []
      for (const n of nodes) {
        ids.push(n.id)
        if (n.children) ids = ids.concat(collectIds(n.children))
      }
      return ids
    }

    const allIds = collectIds(tree)
    const elements = allIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -65% 0px', threshold: 0.1 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [tree])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveId(id)
      history.pushState(null, '', `#${id}`)
    }
  }

  if (!tree || tree.length === 0) return null

  return (
    <aside className="my-8 lg:my-0">
      {/* Mobile Accordion Toggle */}
      <div className="lg:hidden surface-panel rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300"
        >
          <span>Table of Contents</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <ul className="mt-3 border-t border-neutral-100 dark:border-neutral-800 pt-2 space-y-1">
            {tree.map((node) => (
              <TOCItem key={node.id} node={node} activeId={activeId} onSelect={scrollToSection} />
            ))}
          </ul>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-3">
          On this page
        </div>
        <ul className="space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 pl-2">
          {tree.map((node) => (
            <TOCItem key={node.id} node={node} activeId={activeId} onSelect={scrollToSection} />
          ))}
        </ul>
      </div>
    </aside>
  )
}
