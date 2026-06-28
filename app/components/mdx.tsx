import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import katex from 'katex'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import EmbeddedMedia from './EmbeddedMedia'
import MermaidDiagram from './MermaidDiagram'

/** Renders the custom table data used by older blog posts. */
function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

/** Uses Next.js links for local URLs and safe new tabs for external URLs. */
function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

/** Renders an explicit MDX Image component with rounded corners. */
function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

/** Adds syntax highlighting to normal fenced code blocks. */
function Code({ children, ...props }) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

/** Renders one display formula from a fenced math block. */
function MathBlock({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  })

  return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Routes math and Mermaid fences to their visual renderers. */
function Pre({ children, ...props }) {
  if (React.isValidElement(children)) {
    const childProps = children.props as { children?: React.ReactNode; className?: string }
    const language = childProps.className?.replace(/^language-/, '')
    const source = String(childProps.children ?? '').replace(/\n$/, '')

    if (language === 'mermaid') return <MermaidDiagram chart={source} />
    if (language === 'math') return <MathBlock latex={source} />
  }

  return <pre {...props}>{children}</pre>
}

/** Creates stable anchor IDs for blog headings. */
function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

/** Creates a heading component with a clickable anchor. */
function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  img: EmbeddedMedia,
  a: CustomLink,
  code: Code,
  pre: Pre,
  Table,
}

/** Renders blog Markdown with math, diagrams, and custom components. */
export function CustomMDX(props) {
  const options = {
    ...props.options,
    mdxOptions: {
      ...props.options?.mdxOptions,
      remarkPlugins: [...(props.options?.mdxOptions?.remarkPlugins ?? []), remarkMath],
      rehypePlugins: [...(props.options?.mdxOptions?.rehypePlugins ?? []), rehypeKatex],
    },
  }

  return (
    <MDXRemote
      {...props}
      options={options}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
