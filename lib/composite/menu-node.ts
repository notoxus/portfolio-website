import { describe, it, expect } from 'vitest'

describe('extractHeadings', () => {
  it('extracts H2–H4 and ignores H1', () => {
    const source = '# Title\n\n## Intro\n\n### Details\n\n#### Nitty gritty\n'
    const headings = extractHeadings(source)
    expect(headings.map(h => h.text)).toEqual(['Intro', 'Details', 'Nitty gritty'])
    expect(headings.map(h => h.level)).toEqual([2, 3, 4])
  })

  it('strips inline markdown syntax before slugging', () => {
    const [h] = extractHeadings('## Some **bold** heading')
    expect(h.text).toBe('Some bold heading')
    expect(h.id).toBe('some-bold-heading')
  })

  it('strips links but keeps the link text', () => {
    const [h] = extractHeadings('## See [the docs](https://example.com)')
    expect(h.text).toBe('See the docs')
  })

  it('skips headings that are empty after cleanup', () => {
    expect(extractHeadings('## ****')).toHaveLength(0)
  })
})

describe('BlogMenuBuilder.headingsTOC', () => {
  it('nests headings under the nearest shallower heading', () => {
    const tree = BlogMenuBuilder.headingsTOC([
      { id: 'a', text: 'A', level: 2 },
      { id: 'b', text: 'B', level: 3 },
      { id: 'c', text: 'C', level: 2 },
    ])
    expect(tree).toHaveLength(2)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children![0].id).toBe('b')
    expect(tree[1].children).toBeUndefined()
  })

  it('handles a level jump from 2 straight to 4', () => {
    const tree = BlogMenuBuilder.headingsTOC([
      { id: 'a', text: 'A', level: 2 },
      { id: 'b', text: 'B', level: 4 },
    ])
    expect(tree[0].children![0].id).toBe('b')
  })
})

describe('BlogMenuBuilder.fromPosts', () => {
  it('groups posts by category, defaulting to Others', () => {
    const tree = BlogMenuBuilder.fromPosts([
      { slug: 'a', metadata: { title: 'A', category: 'Linux' } },
      { slug: 'b', metadata: { title: 'B' } },
    ])
    const labels = tree.map(c => c.label).sort()
    expect(labels).toEqual(['Linux', 'Others'])
  })
})

describe('MenuCategory', () => {
  it('deduplicates children by id', () => {
    const cat = new MenuCategory('cat', 'Cat')
    const leaf = new MenuLeaf('x', 'X', '/x')
    cat.add(leaf).add(leaf)
    expect(cat.getChildren()).toHaveLength(1)
  })

  it('removes a child by id', () => {
    const cat = new MenuCategory('cat', 'Cat')
    cat.add(new MenuLeaf('x', 'X', '/x'))
    cat.remove('x')
    expect(cat.getChildren()).toHaveLength(0)
  })
})
export interface MenuNodeData {
  id: string
  label: string
  href?: string
  level: number
  children?: MenuNodeData[]
}

// Component interface
export interface MenuComponent {
  readonly id: string
  readonly label: string
  render(): MenuNodeData
}

// Leaf node - a single blog post link
export class MenuLeaf implements MenuComponent {
  constructor(
    public readonly id: string,
    public readonly label: string,
    private readonly href: string,
    private readonly level: number = 2,
  ) {}

  render(): MenuNodeData {
    return { id: this.id, label: this.label, href: this.href, level: this.level }
  }
}

// Composite node - a category that holds children
export class MenuCategory implements MenuComponent {
  private children: MenuComponent[] = []

  constructor(
    public readonly id: string,
    public readonly label: string,
    private readonly level: number = 1,
  ) {}

  add(child: MenuComponent): this {
    if (!this.children.find(c => c.id === child.id)) {
      this.children.push(child)
    }
    return this
  }

  remove(id: string): this {
    this.children = this.children.filter(c => c.id !== id)
    return this
  }

  getChildren(): MenuComponent[] {
    return [...this.children]
  }

  render(): MenuNodeData {
    return {
      id: this.id,
      label: this.label,
      level: this.level,
      children: this.children.map(c => c.render()),
    }
  }
}

// Builder helper - constructs the composite tree from flat post list
export class BlogMenuBuilder {
  static fromPosts(
    posts: Array<{ slug: string; metadata: { title: string; category?: string } }>,
  ): MenuNodeData[] {
    const categories = new Map<string, MenuCategory>()

    for (const post of posts) {
      const cat = post.metadata.category || 'Others'
      if (!categories.has(cat)) {
        categories.set(cat, new MenuCategory(cat, cat, 1))
      }
      categories.get(cat)!.add(
        new MenuLeaf(post.slug, post.metadata.title, `/blog/${post.slug}`, 2),
      )
    }

    return Array.from(categories.values()).map(c => c.render())
  }

  // Extract flat heading TOC from MDX headings for in-page navigation
  static headingsTOC(
    headings: Array<{ id: string; text: string; level: number }>,
  ): MenuNodeData[] {
    const root: MenuNodeData[] = []
    const stack: MenuNodeData[] = []

    for (const h of headings) {
      const node: MenuNodeData = { id: h.id, label: h.text, href: `#${h.id}`, level: h.level, children: [] }

      while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
        stack.pop()
      }

      if (stack.length === 0) {
        root.push(node)
      } else {
        const parent = stack[stack.length - 1]
        if (!parent.children) parent.children = []
        parent.children.push(node)
      }
      stack.push(node)
    }

    return root
  }
}

export function extractHeadings(source: string): Array<{ id: string; text: string; level: number }> {
  // Extract H2 to H4 headings from markdown source
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const headings: Array<{ id: string; text: string; level: number }> = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length
    const rawText = match[2].trim()
    // Clean inline markdown links, bold, code
    const text = rawText
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim()

    if (!text) continue

    const id = text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/-+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}
