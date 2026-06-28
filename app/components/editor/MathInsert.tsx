'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import ToolbarButton from './ToolbarButton'

type MathType = 'inline' | 'block'

/** Opens a form that inserts an inline or display LaTeX formula. */
export default function MathInsert({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [latex, setLatex] = useState('')
  const [type, setType] = useState<MathType>('inline')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    // Close the form when the user clicks outside it.
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // Insert the formula as a real Tiptap math node.
  const insert = (event: React.FormEvent) => {
    event.preventDefault()
    const value = latex.trim()
    if (!value) return

    if (type === 'block') {
      editor.chain().focus().insertBlockMath({ latex: value }).run()
    } else {
      editor.chain().focus().insertInlineMath({ latex: value }).run()
    }

    setLatex('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        onClick={() => setOpen(value => !value)}
        active={open}
        title="Insert LaTeX formula"
      >
        <span aria-hidden="true">&#8721;</span>
      </ToolbarButton>

      {open && (
        <form
          onSubmit={insert}
          onMouseDown={event => event.stopPropagation()}
          className="absolute right-0 top-full z-30 mt-2 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="mb-3 text-xs font-semibold text-neutral-800 dark:text-neutral-100">
            Insert formula
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              <span>LaTeX</span>
              <textarea
                required
                rows={3}
                value={latex}
                onChange={event => setLatex(event.target.value)}
                placeholder="E = mc^2"
                className="resize-y rounded border border-neutral-200 bg-white px-2.5 py-2 font-mono text-xs text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              <span>Layout</span>
              <select
                value={type}
                onChange={event => setType(event.target.value as MathType)}
                className="h-9 rounded border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                <option value="inline">Inline</option>
                <option value="block">Display block</option>
              </select>
            </label>
            <button
              type="submit"
              className="h-9 rounded bg-neutral-900 px-3 text-xs font-medium text-white hover:opacity-80 dark:bg-neutral-100 dark:text-black"
            >
              Insert
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
