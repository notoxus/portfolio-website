import { describe, it, expect } from 'vitest'
import {
  BlogMenuBuilder,
  MenuCategory,
  MenuLeaf,
  extractHeadings,
} from './menu-node'

describe('extractHeadings', () => {
  it('extracts H2–H4 and ignores H1', () => {
    const source = '# Title\n\n## Intro\n\n### Details\n\n#### Nitty gritty\n'
    const headings = extractHeadings(source)

    expect(headings.map(h => h.text)).toEqual([
      'Intro',
      'Details',
      'Nitty gritty',
    ])

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
      {
        slug: 'a',
        metadata: {
          title: 'A',
          category: 'Linux',
        },
      },
      {
        slug: 'b',
        metadata: {
          title: 'B',
        },
      },
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