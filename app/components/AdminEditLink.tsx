'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

// Renders an inline "edit" affordance only when the admin is signed in.
export default function AdminEditLink({
  href,
  label = 'edit',
  adminUsername,
}: {
  href: string
  label?: string
  adminUsername?: string
}) {
  const { data: session } = useSession()
  const isAdmin = (session as any)?.login === adminUsername

  if (!isAdmin) return null

  return (
    <Link
      href={href}
      className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex-shrink-0"
      title={label}
      aria-label={label}
    >
      &#9998;
    </Link>
  )
}
