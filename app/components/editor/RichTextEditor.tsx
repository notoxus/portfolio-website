'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExt from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'
import Toolbar from './Toolbar'

interface Props {
  initialContent?: string
  onChange?: (markdown: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  initialContent = '',
  onChange,
  placeholder = 'Write your post here...',
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      ImageExt,
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
    },
    onUpdate({ editor }) {
      const storage = editor.storage as any
      const md: string = storage.markdown?.getMarkdown?.() ?? editor.getText()
      onChange?.(md)
    },
    immediatelyRender: false,
  })

  // Load initial content when it changes (e.g. editing existing post)
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
