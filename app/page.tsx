import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`Welcome to my portfolio. In there, I'll share my Welcome to my portfolio. Here, I share my blog and notebook, documenting my educational journey. Let's sit back, relax and enjoy the moment together!`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
