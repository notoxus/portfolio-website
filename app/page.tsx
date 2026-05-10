import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Phuoc Thinh Portfolio
      </h1>
      <p className="mb-4">
        {`Welcome to my portfolio. Here, I share my blog and notebook, documenting my educational journey. I'm a firm believer in interdisciplinary wisdom, so you'll also find me sharing fascinating breakthroughs in other fields here\nLet's sit back, relax and enjoy the moment together!`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
