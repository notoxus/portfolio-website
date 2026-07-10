import { getBlogPosts } from 'app/blog/utils'

export const baseUrl = 'https://phuocthinh.is-a.dev'

export default async function sitemap() {
  let blogs = (await getBlogPosts()).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/blog', '/projects', '/notebook', '/essential-tools', '/essential-tools/studyhub'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
