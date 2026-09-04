'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ReactNode, useRef } from 'react'

gsap.registerPlugin(useGSAP)

type GsapRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/**
 * A small, reusable entrance animation for client-rendered page sections.
 * GSAP's context (provided by useGSAP) reverts the animation on unmount.
 */
export function GsapReveal({
  children,
  className,
  delay = 0.08,
  y = 36,
}: GsapRevealProps) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const element = scope.current
      if (!element) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(element, { autoAlpha: 1, y: 0 })
        return
      }

      gsap.fromTo(
        element,
        { autoAlpha: 0, y, scale: 0.985 },
        {
          autoAlpha: 1,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
        },
      )
    },
    { scope },
  )

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  )
}
