import { BlogPosts } from 'app/components/posts'
import Link from 'next/link'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Blog</h1>
      <nav className="mb-4">
        <Link href="https://vercel.com" className="text-blue-500 hover:underline">
          Vercel
        </Link>
      </nav>
      <BlogPosts />
    </section>
  )
}
