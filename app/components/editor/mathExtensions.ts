import { BlockMath, InlineMath } from '@tiptap/extension-mathematics'

const INLINE_MATH_PATTERN = /(^|[^\\$])\$(?!\$)(?!\d+\$)([^$\n]+?)\$(?!\$|\d)/g
const BLOCK_MATH_PATTERN = /^\s*\$\$\s*([\s\S]+?)\s*\$\$\s*$/

/** Converts display-math paragraphs from Markdown into Tiptap math nodes. */
function parseBlockMath(root: HTMLElement) {
  root.querySelectorAll('p').forEach((paragraph) => {
    const match = paragraph.textContent?.match(BLOCK_MATH_PATTERN)
    const latex = match?.[1]?.trim()
    if (!latex) return

    const math = document.createElement('div')
    math.dataset.type = 'block-math'
    math.dataset.latex = latex
    paragraph.replaceWith(math)
  })
}

/** Converts inline dollar syntax from Markdown into Tiptap math nodes. */
function parseInlineMath(root: HTMLElement) {
  const textNodes: Text[] = []

  // Collect first because replacing nodes changes the live DOM tree.
  const collectTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text)
      return
    }

    if (node instanceof HTMLElement && node.closest('pre, code, [data-type$="-math"]')) {
      return
    }

    node.childNodes.forEach(collectTextNodes)
  }

  collectTextNodes(root)

  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? ''
    const matches = [...text.matchAll(INLINE_MATH_PATTERN)]
    if (matches.length === 0) return

    const fragment = document.createDocumentFragment()
    let cursor = 0

    matches.forEach((match) => {
      const start = match.index ?? 0
      const prefix = match[1]
      const latex = match[2].trim()

      fragment.append(document.createTextNode(text.slice(cursor, start) + prefix))

      const math = document.createElement('span')
      math.dataset.type = 'inline-math'
      math.dataset.latex = latex
      fragment.append(math)

      cursor = start + match[0].length
    })

    fragment.append(document.createTextNode(text.slice(cursor)))
    textNode.replaceWith(fragment)
  })
}

/** Stores block math as standard double-dollar Markdown. */
export const MarkdownBlockMath = BlockMath.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(`$$\n${node.attrs.latex}\n$$`)
          state.closeBlock(node)
        },
        parse: { updateDOM: parseBlockMath },
      },
    }
  },
})

/** Stores inline math as standard single-dollar Markdown. */
export const MarkdownInlineMath = InlineMath.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(`$${node.attrs.latex}$`)
        },
        parse: { updateDOM: parseInlineMath },
      },
    }
  },
})
