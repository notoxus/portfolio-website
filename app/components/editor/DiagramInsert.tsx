'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import ToolbarButton from './ToolbarButton'

const DIAGRAM_TEMPLATES = {
  flowchart: 'flowchart TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Done]\n  B -->|No| A',
  sequence: 'sequenceDiagram\n  User->>App: Request\n  App-->>User: Response',
  class: 'classDiagram\n  class User {\n    +String name\n    +login()\n  }',
  state: 'stateDiagram-v2\n  [*] --> Active\n  Active --> [*]',
}

type DiagramType = keyof typeof DIAGRAM_TEMPLATES

/** Opens a form that inserts an editable Mermaid code block. */
export default function DiagramInsert({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<DiagramType>('flowchart')
  const [source, setSource] = useState(DIAGRAM_TEMPLATES.flowchart)
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

  // Replace the editor selection with a Mermaid fenced-code node.
  const insert = (event: React.FormEvent) => {
    event.preventDefault()
    const chart = source.trim()
    if (!chart) return

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'codeBlock',
          attrs: { language: 'mermaid' },
          content: [{ type: 'text', text: chart }],
        },
        { type: 'paragraph' },
      ])
      .run()

    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        onClick={() => setOpen(value => !value)}
        active={open}
        title="Insert Mermaid diagram"
      >
        <span aria-hidden="true">&#8644;</span>
      </ToolbarButton>

      {open && (
        <form
          onSubmit={insert}
          onMouseDown={event => event.stopPropagation()}
          className="absolute right-0 top-full z-30 mt-2 w-80 rounded-md border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="mb-3 text-xs font-semibold text-neutral-800 dark:text-neutral-100">
            Insert diagram
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              <span>Template</span>
              <select
                value={type}
                onChange={event => {
                  const next = event.target.value as DiagramType
                  setType(next)
                  setSource(DIAGRAM_TEMPLATES[next])
                }}
                className="h-9 rounded border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence</option>
                <option value="class">Class</option>
                <option value="state">State</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              <span>Mermaid</span>
              <textarea
                required
                rows={8}
                value={source}
                onChange={event => setSource(event.target.value)}
                className="resize-y rounded border border-neutral-200 bg-white px-2.5 py-2 font-mono text-xs leading-relaxed text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
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
