'use client'

import { useEditorState, type Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { isHlsSource, isVideoSource, normalizeMediaSource } from '../EmbeddedMedia'
import {
  DEFAULT_EDITOR_SHORTCUTS,
  shortcutFromKeyboardEvent,
  type EditorShortcuts,
} from './shortcuts'
import DiagramInsert from './DiagramInsert'
import {
  BULLET_LIST_MARKERS,
  changeListLevel,
  getBulletListState,
  setBulletListMarker,
  toggleCompositeBulletList,
} from './listComposite'
import MathInsert from './MathInsert'
import { uploadMediaFile } from './mediaUpload'
import SymbolInsert from './SymbolInsert'
import ToolbarButton from './ToolbarButton'

interface Props {
  editor: Editor | null
  shortcuts: EditorShortcuts
  onShortcutsChange: (shortcuts: EditorShortcuts) => void
}

/** Renders a divider between toolbar command groups. */
function Sep() {
  return <span className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-0.5 self-center" />
}

/** Selects the real marker stored on the active Markdown bullet-list node. */
function BulletListMenu({
  editor,
  shortcut,
}: {
  editor: Editor
  shortcut: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => getBulletListState(currentEditor),
  })

  useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex items-center">
      <ToolbarButton
        onClick={() => toggleCompositeBulletList(editor)}
        active={listState.active}
        title={`Toggle ${listState.marker} list${shortcut ? ` (${shortcut})` : ''}`}
      >
        <span aria-hidden="true" className="font-mono">{listState.marker}&#8801;</span>
      </ToolbarButton>
      <button
        type="button"
        aria-label="Choose Markdown list marker"
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseDown={event => {
          event.preventDefault()
          setOpen(value => !value)
        }}
        className={`grid h-8 w-5 place-items-center rounded text-xs transition-colors ${
          open
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
            : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
        }`}
        title="Choose Markdown list marker"
      >
        <span aria-hidden="true">&#9662;</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-40 rounded-md border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {BULLET_LIST_MARKERS.map(option => (
            <button
              key={option.marker}
              type="button"
              role="menuitemradio"
              aria-checked={listState.marker === option.marker}
              onMouseDown={event => {
                event.preventDefault()
                setBulletListMarker(editor, option.marker)
                setOpen(false)
              }}
              className={`flex h-9 w-full items-center gap-2 rounded px-2 text-left text-xs ${
                listState.marker === option.marker
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <span aria-hidden="true" className="w-5 text-center font-mono text-sm leading-none">
                {option.marker}
              </span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Lets the user record custom shortcuts for list indentation. */
function ShortcutSettings({
  shortcuts,
  onChange,
}: {
  shortcuts: EditorShortcuts
  onChange: (shortcuts: EditorShortcuts) => void
}) {
  const [open, setOpen] = useState(false)
  const [recording, setRecording] = useState<keyof EditorShortcuts | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const setShortcut = (action: keyof EditorShortcuts, value: string) => {
    const next = { ...shortcuts, [action]: value }

    for (const otherAction of Object.keys(next) as (keyof EditorShortcuts)[]) {
      if (otherAction !== action && next[otherAction] === value) next[otherAction] = ''
    }

    onChange(next)
  }

  const recorder = (action: keyof EditorShortcuts, label: string) => (
    <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
      <span>{label}</span>
      <input
        readOnly
        value={recording === action ? 'Press shortcut...' : shortcuts[action] || 'Not set'}
        onFocus={() => setRecording(action)}
        onBlur={() => setRecording(null)}
        onKeyDown={(event) => {
          event.preventDefault()
          event.stopPropagation()

          if (event.key === 'Escape') {
            event.currentTarget.blur()
            return
          }

          if (event.key === 'Backspace' || event.key === 'Delete') {
            setShortcut(action, '')
            event.currentTarget.blur()
            return
          }

          const shortcut = shortcutFromKeyboardEvent(event.nativeEvent)
          if (!shortcut) return

          setShortcut(action, shortcut)
          event.currentTarget.blur()
        }}
        className="h-9 rounded border border-neutral-200 bg-white px-2.5 font-mono text-xs text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
    </label>
  )

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        onClick={() => setOpen(value => !value)}
        active={open}
        title="Keyboard shortcuts"
      >
        <span aria-hidden="true">&#9000;</span>
      </ToolbarButton>

      {open && (
        <div
          onMouseDown={event => event.stopPropagation()}
          className="absolute left-0 top-full z-30 mt-2 w-64 rounded-md border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">List shortcuts</span>
            <button
              type="button"
              onClick={() => onChange(DEFAULT_EDITOR_SHORTCUTS)}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Reset
            </button>
          </div>
          <div className="grid gap-3">
            {recorder('toggleBulletList', 'Toggle bullet list')}
            {recorder('increaseListLevel', 'Increase level')}
            {recorder('decreaseListLevel', 'Decrease level')}
          </div>
        </div>
      )}
    </div>
  )
}

type MediaType = 'auto' | 'image' | 'video' | 'hls'
type MediaSourceMode = 'url' | 'upload'

/** Inserts an image, GIF, video, or HLS source into the editor. */
function MediaInsert({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [sourceMode, setSourceMode] = useState<MediaSourceMode>('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<MediaType>('auto')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // Uploads a local file or inserts the provided media URL.
  const insert = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setUploading(true)

    try {
      let src = normalizeMediaSource(url.trim())
      let previewSrc: string | undefined
      let resolvedType: MediaType = type

      if (sourceMode === 'upload') {
        if (!file) throw new Error('Choose a media file first')
        const result = await uploadMediaFile(file)

        src = result.url
        previewSrc = result.previewUrl
        resolvedType = result.kind
      } else if (!src) {
        throw new Error('Enter a media URL')
      }

      if (resolvedType === 'auto') {
        resolvedType = isHlsSource(src) ? 'hls' : isVideoSource(src) ? 'video' : 'image'
      }

      const alt = resolvedType === 'hls' ? 'hls' : resolvedType === 'video' ? 'video' : ''
      editor
        .chain()
        .focus()
        .insertContent({ type: 'image', attrs: { src, alt, previewSrc } })
        .run()

      setUrl('')
      setFile(null)
      setType('auto')
      setOpen(false)
    } catch (error: any) {
      setError(error?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        onClick={() => setOpen(value => !value)}
        active={open}
        title="Insert image, GIF, video, or HLS stream"
      >
        <span aria-hidden="true">&#9654;</span>
      </ToolbarButton>

      {open && (
        <form
          onSubmit={insert}
          onMouseDown={event => event.stopPropagation()}
          className="absolute left-0 top-full z-30 mt-2 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="mb-3 text-xs font-semibold text-neutral-800 dark:text-neutral-100">
            Insert media
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 rounded border border-neutral-200 p-0.5 dark:border-neutral-700">
              {(['url', 'upload'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={sourceMode === mode}
                  onClick={() => {
                    setSourceMode(mode)
                    setError('')
                  }}
                  className={`h-8 rounded text-xs font-medium capitalize ${
                    sourceMode === mode
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {sourceMode === 'url' ? (
              <>
                <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <span>URL</span>
                  <input
                    type="text"
                    inputMode="url"
                    required
                    value={url}
                    onChange={event => setUrl(event.target.value)}
                    placeholder="https://..."
                    className="h-9 rounded border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                </label>
                <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Type</span>
                  <select
                    value={type}
                    onChange={event => setType(event.target.value as MediaType)}
                    className="h-9 rounded border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  >
                    <option value="auto">Auto detect</option>
                    <option value="image">Image / GIF</option>
                    <option value="video">Video</option>
                    <option value="hls">HLS (.m3u8)</option>
                  </select>
                </label>
              </>
            ) : (
              <label className="grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                <span>File (max 4 MB)</span>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={event => setFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-neutral-500 file:mr-3 file:rounded file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-medium dark:file:bg-neutral-800"
                />
              </label>
            )}

            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={uploading}
              className="h-9 rounded bg-neutral-900 px-3 text-xs font-medium text-white hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-black"
            >
              {uploading ? 'Uploading...' : sourceMode === 'upload' ? 'Upload and insert' : 'Insert'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/** Renders all formatting and insertion controls for the editor. */
export default function Toolbar({ editor, shortcuts, onShortcutsChange }: Props) {
  if (!editor) return null

  const inList = editor.isActive('listItem')
  const canDecreaseListLevel = inList && editor.can().liftListItem('listItem')
  const canIncreaseListLevel = inList && editor.can().sinkListItem('listItem')

  // Adds or removes the link mark around the current selection.
  const addLink = () => {
    const url = window.prompt('URL:')
    if (url === null) return
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900">
      {/* Text style */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
        `c`
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
        &#9646;
      </ToolbarButton>

      <Sep />

      {/* Headings */}
      {([1, 2, 3, 4] as const).map((level) => (
        <ToolbarButton
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          active={editor.isActive('heading', { level })}
          title={`Heading ${level}`}
        >
          H{level}
        </ToolbarButton>
      ))}

      <Sep />

      {/* Lists + structure */}
      <BulletListMenu editor={editor} shortcut={shortcuts.toggleBulletList} />
      <SymbolInsert editor={editor} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
        1&#8801;
      </ToolbarButton>
      <ToolbarButton
        onClick={() => changeListLevel(editor, 'decrease')}
        disabled={!canDecreaseListLevel}
        title={`Decrease list level${shortcuts.decreaseListLevel ? ` (${shortcuts.decreaseListLevel})` : ''}`}
      >
        <span aria-hidden="true">&#8226;&#8592;</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => changeListLevel(editor, 'increase')}
        disabled={!canIncreaseListLevel}
        title={`Increase list level${shortcuts.increaseListLevel ? ` (${shortcuts.increaseListLevel})` : ''}`}
      >
        <span aria-hidden="true">&#8594;&#8226;</span>
      </ToolbarButton>
      <ShortcutSettings shortcuts={shortcuts} onChange={onShortcutsChange} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        &#10077;
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
        {'</>'}
      </ToolbarButton>

      <Sep />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
        &#8676;
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
        &#8596;
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
        &#8677;
      </ToolbarButton>

      <Sep />

      {/* Insert */}
      <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Insert link">
        &#128279;
      </ToolbarButton>
      <MediaInsert editor={editor} />
      <MathInsert editor={editor} />
      <DiagramInsert editor={editor} />
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">
        &#8213;
      </ToolbarButton>

      <Sep />

      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo (Ctrl+Z)">
        &#8617;
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo (Ctrl+Y)">
        &#8618;
      </ToolbarButton>
    </div>
  )
}
