'use client'

import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
        active
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-0.5 self-center" />
}

export default function Toolbar({ editor }: Props) {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL:')
    if (url === null) return
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
      {/* Text style */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <em>I</em>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
        <span className="underline">U</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <span className="line-through">S</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
        `c`
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
        &#9646;
      </Btn>

      <Sep />

      {/* Headings */}
      {([1, 2, 3, 4] as const).map((level) => (
        <Btn
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          active={editor.isActive('heading', { level })}
          title={`Heading ${level}`}
        >
          H{level}
        </Btn>
      ))}

      <Sep />

      {/* Lists + structure */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
        &#8226;&#8801;
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
        1&#8801;
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        &#10077;
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
        {'</>'}
      </Btn>

      <Sep />

      {/* Alignment */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
        &#8676;
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
        &#8596;
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
        &#8677;
      </Btn>

      <Sep />

      {/* Insert */}
      <Btn onClick={addLink} active={editor.isActive('link')} title="Insert link">
        &#128279;
      </Btn>
      <Btn onClick={addImage} active={false} title="Insert image">
        &#128444;
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">
        &#8213;
      </Btn>

      <Sep />

      {/* History */}
      <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo (Ctrl+Z)">
        &#8617;
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo (Ctrl+Y)">
        &#8618;
      </Btn>
    </div>
  )
}
