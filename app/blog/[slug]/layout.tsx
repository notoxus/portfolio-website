import { getBlogPosts } from 'app/blog/utils'
import { BlogMenuBuilder } from 'lib/composite/menu-node'
import CompositeMenu from 'app/components/CompositeMenu'

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  const allPosts = getBlogPosts()
  // Composite pattern: builds a category tree from flat post list
  const menuTree = BlogMenuBuilder.fromPosts(allPosts)

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <CompositeMenu tree={menuTree} title="Blog" />

      <main className="flex-1 min-w-0 pb-20">
        {children}
      </main>
    </div>
  )
}
