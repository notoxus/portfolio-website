export type EditorShortcuts = {
  increaseListLevel: string
  decreaseListLevel: string
}

export const DEFAULT_EDITOR_SHORTCUTS: EditorShortcuts = {
  increaseListLevel: 'Ctrl+]',
  decreaseListLevel: 'Ctrl+[',
}

export const EDITOR_SHORTCUTS_STORAGE_KEY = 'blog-editor-shortcuts'

type ShortcutEvent = Pick<
  KeyboardEvent,
  'altKey' | 'code' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
>

const CODE_KEYS: Record<string, string> = {
  BracketLeft: '[',
  BracketRight: ']',
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Minus: '-',
  Equal: '=',
  Space: 'Space',
}

/** Converts a keyboard event into a stable shortcut label. */
export function shortcutFromKeyboardEvent(event: ShortcutEvent) {
  if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) return null

  let key = CODE_KEYS[event.code]

  if (!key && event.code.startsWith('Key')) key = event.code.slice(3)
  if (!key && event.code.startsWith('Digit')) key = event.code.slice(5)
  if (!key) key = event.key.length === 1 ? event.key.toUpperCase() : event.key

  const modifiers: string[] = []
  if (event.ctrlKey) modifiers.push('Ctrl')
  if (event.altKey) modifiers.push('Alt')
  if (event.shiftKey) modifiers.push('Shift')
  if (event.metaKey) modifiers.push('Meta')

  const canBeUsedWithoutModifier = key === 'Tab' || /^F\d{1,2}$/.test(key)
  if (modifiers.length === 0 && !canBeUsedWithoutModifier) return null

  return [...modifiers, key].join('+')
}

/** Checks whether a keyboard event matches a saved shortcut. */
export function matchesShortcut(event: ShortcutEvent, shortcut: string) {
  return Boolean(shortcut) && shortcutFromKeyboardEvent(event) === shortcut
}
