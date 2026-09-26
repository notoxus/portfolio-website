import type { Editor } from '@tiptap/core'
import { BulletList, ListItem } from '@tiptap/extension-list'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type MarkdownIt from 'markdown-it'
import type { MarkdownSerializerState } from 'prosemirror-markdown'

export const BULLET_LIST_MARKERS = [
  { marker: '-', label: 'Dash' },
  { marker: '+', label: 'Plus' },
  { marker: '*', label: 'Star' },
] as const

export type BulletListMarker = (typeof BULLET_LIST_MARKERS)[number]['marker']

export const DEFAULT_BULLET_LIST_MARKER: BulletListMarker = '-'

type BulletListLocation = {
  node: ProseMirrorNode
  pos: number
  level: number
}

type BulletListStorage = {
  preferredMarker: BulletListMarker
}

/** Converts unknown node data into one of the three valid Markdown bullet markers. */
export function normalizeBulletListMarker(value: unknown): BulletListMarker {
  return value === '+' || value === '*' || value === '-' ? value : DEFAULT_BULLET_LIST_MARKER
}

/** Returns the deepest bullet-list node around the current selection. */
function findBulletList(editor: Editor): BulletListLocation | null {
  const { $from } = editor.state.selection
  let current: BulletListLocation | null = null
  let level = 0

  for (let depth = 1; depth <= $from.depth; depth += 1) {
    const node = $from.node(depth)
    if (node.type.name !== 'bulletList') continue

    level += 1
    current = { node, pos: $from.before(depth), level }
  }

  return current
}

function getBulletListStorage(editor: Editor) {
  return (editor.storage as unknown as Record<string, BulletListStorage>).bulletList
}

function rememberMarker(editor: Editor, marker: BulletListMarker) {
  const storage = getBulletListStorage(editor)
  if (storage) storage.preferredMarker = marker
}

/** Exposes one selection snapshot for the toolbar and keyboard controller. */
export function getBulletListState(editor: Editor) {
  const current = findBulletList(editor)
  const preferredMarker = normalizeBulletListMarker(
    current?.node.attrs.marker ?? getBulletListStorage(editor)?.preferredMarker,
  )

  return {
    active: Boolean(current),
    level: current?.level ?? 0,
    marker: preferredMarker,
  }
}

/** Updates only the innermost list, or creates/converts a list when needed. */
export function setBulletListMarker(editor: Editor, value: BulletListMarker) {
  const marker = normalizeBulletListMarker(value)
  rememberMarker(editor, marker)
  editor.commands.focus()

  let current = findBulletList(editor)
  if (!current) {
    const converted = editor.commands.toggleList('bulletList', 'listItem', false, { marker })
    if (!converted) return false
    current = findBulletList(editor)
  }

  if (!current || current.node.attrs.marker === marker) return Boolean(current)

  editor.view.dispatch(
    editor.state.tr.setNodeMarkup(current.pos, undefined, {
      ...current.node.attrs,
      marker,
    }),
  )
  return true
}

/** Toggles a bullet list while remembering the last explicitly selected marker. */
export function toggleCompositeBulletList(editor: Editor) {
  const current = findBulletList(editor)

  if (current) {
    rememberMarker(editor, normalizeBulletListMarker(current.node.attrs.marker))
    return editor.chain().focus().toggleList('bulletList', 'listItem').run()
  }

  return setBulletListMarker(editor, getBulletListState(editor).marker)
}

/** Determines which marker a list item should use after it is nested. */
function getSinkTargetMarker(editor: Editor) {
  const { $from, $to } = editor.state.selection
  const range = $from.blockRange(
    $to,
    node => node.childCount > 0 && node.firstChild?.type.name === 'listItem',
  )

  if (!range || range.parent.type.name !== 'bulletList' || range.startIndex === 0) return null

  const previousItem = range.parent.child(range.startIndex - 1)
  const nestedList = previousItem.lastChild

  return normalizeBulletListMarker(
    nestedList?.type === range.parent.type
      ? nestedList.attrs.marker
      : range.parent.attrs.marker,
  )
}

/** Runs list nesting commands and preserves the marker when a nested list is created. */
export function changeListLevel(editor: Editor, direction: 'increase' | 'decrease') {
  const targetMarker = direction === 'increase' ? getSinkTargetMarker(editor) : null
  const chain = editor.chain().focus()
  const changed =
    direction === 'increase'
      ? chain.sinkListItem('listItem').run()
      : chain.liftListItem('listItem').run()

  if (!changed) return false

  if (targetMarker && findBulletList(editor)) {
    setBulletListMarker(editor, targetMarker)
  } else {
    rememberMarker(editor, getBulletListState(editor).marker)
  }

  return true
}

/**
 * Bullet-list node used by the editor composite.
 *
 * It disables `- ` / `+ ` / `* ` input rules, stores the actual MDX marker on
 * each list node, and teaches the Markdown parser/serializer to round-trip it.
 */
export const CompositeBulletList = BulletList.extend({
  addAttributes() {
    return {
      marker: {
        default: DEFAULT_BULLET_LIST_MARKER,
        parseHTML: element => normalizeBulletListMarker(element.getAttribute('data-list-marker')),
        renderHTML: attributes => ({
          'data-list-marker': normalizeBulletListMarker(attributes.marker),
        }),
      },
    }
  },

  addInputRules() {
    return []
  },

  addKeyboardShortcuts() {
    return {}
  },

  addStorage() {
    return {
      preferredMarker: DEFAULT_BULLET_LIST_MARKER,
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          const marker = normalizeBulletListMarker(node.attrs.marker)
          state.renderList(node, '  ', () => `${marker} `)
        },
        parse: {
          setup(markdownIt: MarkdownIt) {
            markdownIt.renderer.rules.bullet_list_open = (tokens, index, options, _env, self) => {
              const marker = normalizeBulletListMarker(tokens[index].markup)
              tokens[index].attrSet('data-list-marker', marker)
              return self.renderToken(tokens, index, options)
            }
          },
        },
      },
    }
  },
})

/** Keeps list Enter behavior while giving all indent shortcuts to the composite. */
export const CompositeListItem = ListItem.extend({
  addKeyboardShortcuts() {
    const shortcuts = this.parent?.() ?? {}
    const { Tab: _tab, 'Shift-Tab': _shiftTab, ...rest } = shortcuts
    return rest
  },
})
