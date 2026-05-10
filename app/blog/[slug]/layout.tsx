import { getBlogPosts } from 'app/blog/utils'
import Link from 'next/link'

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  let allPosts = getBlogPosts()

  // Nhóm bài viết theo chuyên mục (Category)
  // Mình ép kiểu 'acc' là Record để TypeScript không báo lỗi 'unknown' nữa
  const groupedPosts = allPosts.reduce((acc: Record<string, any[]>, post) => {
    const category = post.metadata.category || 'Others'
    if (!acc[category]) acc[category] = []
    acc[category].push(post)
    return acc
  }, {})

  return (
    <div className="flex flex-col md:flex-row gap-10">
      {/* Sidebar bên trái */}
      <aside className="md:w-56 flex-shrink-0">
        <h2 className="font-bold text-xl mb-8 tracking-tighter uppercase text-neutral-900 dark:text-neutral-100">
          Blog
        </h2>
        <nav className="flex flex-col gap-8">
          {Object.entries(groupedPosts).map(([category, posts]) => (
            <div key={category} className="flex flex-col">
              <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4">
                {category}
              </h3>
              <div className="flex flex-col gap-3 border-l-2 border-neutral-100 dark:border-neutral-800 ml-1 pl-5">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                  >
                    {post.metadata.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Nội dung bài viết bên phải */}
      <main className="flex-1 min-w-0 pb-20">
        {children}
      </main>
    </div>
  )
}