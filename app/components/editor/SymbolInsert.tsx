'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import ToolbarButton from './ToolbarButton'

const SYMBOLS = [
  { value: '•', label: 'Bullet' },
  { value: '◦', label: 'Hollow bullet' },
  { value: '▪', label: 'Square' },
  { value: '‣', label: 'Triangle' },
  { value: '→', label: 'Arrow' },
  { value: '✓', label: 'Check' },
  { value: '✦', label: 'Star' },
  { value: '—', label: 'Dash' },
] as const

/** Inserts a literal Unicode symbol without creating a Markdown list. */
export default function SymbolInsert({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('•')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const insert = (symbol: string) => {
    editor.chain().focus().insertContent(`${symbol} `).run()
    setSelectedSymbol(symbol)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        onClick={() => setOpen(value => !value)}
        active={open}
        title="Insert symbol"
      >
        <span aria-hidden="true" className="font-mono">{selectedSymbol}</span>
      </ToolbarButton>

      {open && (
        <div
          role="menu"
          aria-label="Symbols"
          className="absolute left-0 top-full z-30 mt-2 grid w-48 grid-cols-2 gap-1 rounded-md border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {SYMBOLS.map(symbol => (
            <button
              key={symbol.value}
              type="button"
              role="menuitem"
              onMouseDown={event => {
                event.preventDefault()
                insert(symbol.value)
              }}
              className="flex h-9 items-center gap-2 rounded px-2 text-left text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              title={`Insert ${symbol.label.toLowerCase()}`}
            >
              <span aria-hidden="true" className="w-5 text-center font-mono text-sm">
                {symbol.value}
              </span>
              <span>{symbol.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
