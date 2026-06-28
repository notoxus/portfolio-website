'use client'

import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type Editor,
  type NodeViewProps,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExt from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useRef, useState } from 'react'
import { common, createLowlight } from 'lowlight'
import Toolbar from './Toolbar'
import EmbeddedMedia from '../EmbeddedMedia'
import { MarkdownBlockMath, MarkdownInlineMath } from './mathExtensions'
import {
  DEFAULT_EDITOR_SHORTCUTS,
  EDITOR_SHORTCUTS_STORAGE_KEY,
  matchesShortcut,
  type EditorShortcuts,
} from './shortcuts'

const lowlight = createLowlight(common)

/** Shows images and playable media inside the editor document. */
function MediaNodeView({ node, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper
      as="figure"
      data-media-node="true"
      className={selected ? 'is-selected' : ''}
    >
      <EmbeddedMedia
        src={node.attrs.previewSrc ?? node.attrs.src}
        alt={node.attrs.alt ?? ''}
      />
    </NodeViewWrapper>
  )
}

/** Adds the custom media preview to Tiptap image nodes. */
const MediaImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      previewSrc: {
        default: null,
        parseHTML: element => element.getAttribute('data-preview-src'),
        renderHTML: () => ({}),
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(MediaNodeView)
  },
})

interface Props {
  initialContent?: string
  onChange?: (markdown: string) => void
  placeholder?: string
}

/** Creates the Markdown editor and keeps its output synchronized. */
export default function RichTextEditor({
  initialContent = '',
  onChange,
  placeholder = 'Write your post here...',
}: Props) {
  const editorRef = useRef<Editor | null>(null)
  const shortcutsRef = useRef<EditorShortcuts>(DEFAULT_EDITOR_SHORTCUTS)
  const [shortcuts, setShortcuts] = useState<EditorShortcuts>(DEFAULT_EDITOR_SHORTCUTS)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      MediaImage,
      MarkdownBlockMath.configure({
        katexOptions: { displayMode: true, throwOnError: false },
        onClick: (node, pos) => {
          const latex = window.prompt('Edit display formula:', node.attrs.latex)?.trim()
          if (latex) {
            editorRef.current
              ?.chain()
              .setNodeSelection(pos)
              .updateBlockMath({ latex })
              .focus()
              .run()
          }
        },
      }),
      MarkdownInlineMath.configure({
        katexOptions: { displayMode: false, throwOnError: false },
        onClick: (node, pos) => {
          const latex = window.prompt('Edit inline formula:', node.attrs.latex)?.trim()
          if (latex) {
            editorRef.current
              ?.chain()
              .setNodeSelection(pos)
              .updateInlineMath({ latex })
              .focus()
              .run()
          }
        },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none min-h-[420px] p-4 focus:outline-none text-sm leading-relaxed',
      },
      handleKeyDown: (_view, event) => {
        const currentEditor = editorRef.current
        if (!currentEditor?.isActive('listItem')) return false

        if (matchesShortcut(event, shortcutsRef.current.increaseListLevel)) {
          event.preventDefault()
          currentEditor.commands.sinkListItem('listItem')
          return true
        }

        if (matchesShortcut(event, shortcutsRef.current.decreaseListLevel)) {
          event.preventDefault()
          currentEditor.commands.liftListItem('listItem')
          return true
        }

        if (event.key === 'Tab') {
          event.preventDefault()
          if (event.shiftKey) {
            currentEditor.commands.liftListItem('listItem')
          } else {
            currentEditor.commands.sinkListItem('listItem')
          }
          return true
        }

        return false
      },
    },
    onCreate({ editor }) {
      editorRef.current = editor
    },
    onUpdate({ editor }) {
      const storage = editor.storage as any
      const md: string = storage.markdown?.getMarkdown?.() ?? editor.getText()
      onChange?.(md)
    },
    onDestroy() {
      editorRef.current = null
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(EDITOR_SHORTCUTS_STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as Partial<EditorShortcuts>
      const next = {
        increaseListLevel:
          typeof parsed.increaseListLevel === 'string'
            ? parsed.increaseListLevel
            : DEFAULT_EDITOR_SHORTCUTS.increaseListLevel,
        decreaseListLevel:
          typeof parsed.decreaseListLevel === 'string'
            ? parsed.decreaseListLevel
            : DEFAULT_EDITOR_SHORTCUTS.decreaseListLevel,
      }

      shortcutsRef.current = next
      setShortcuts(next)
    } catch {
      window.localStorage.removeItem(EDITOR_SHORTCUTS_STORAGE_KEY)
    }
  }, [])

  const updateShortcuts = (next: EditorShortcuts) => {
    shortcutsRef.current = next
    setShortcuts(next)
    try {
      window.localStorage.setItem(EDITOR_SHORTCUTS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // The shortcuts still work for this editor session when storage is unavailable.
    }
  }

  // Load initial content when it changes (e.g. editing existing post)
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  return (
    <div className="relative rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950">
      <Toolbar editor={editor} shortcuts={shortcuts} onShortcutsChange={updateShortcuts} />
      <EditorContent editor={editor} />
    </div>
  )
}
