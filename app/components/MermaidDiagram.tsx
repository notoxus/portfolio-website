'use client'

import { useEffect, useId, useRef, useState } from 'react'

/** Renders one Mermaid definition as a responsive SVG diagram. */
export default function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderId = `mermaid-${useId().replace(/:/g, '')}`
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Load Mermaid only on pages that contain a diagram.
    const render = async () => {
      try {
        await document.fonts?.ready
        const { default: mermaid } = await import('mermaid')
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: dark ? 'dark' : 'default',
        })

        const { svg } = await mermaid.render(renderId, chart)
        if (cancelled || !containerRef.current) return

        containerRef.current.innerHTML = svg
        setError(false)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    void render()

    return () => {
      cancelled = true
      containerRef.current?.replaceChildren()
    }
  }, [chart, renderId])

  if (error) {
    return (
      <pre className="mermaid-error">
        <code>{chart}</code>
      </pre>
    )
  }

  return <div ref={containerRef} className="mermaid-diagram" aria-label="Mermaid diagram" />
}
