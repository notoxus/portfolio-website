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
