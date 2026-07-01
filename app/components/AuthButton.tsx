'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [errored, setErrored] = useState(false)
  const initial = (name ?? '?').charAt(0).toUpperCase()

  if (!src || errored) {
    return (
      <span className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-neutral-300 dark:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
        {initial}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={name ?? 'avatar'}
      width={26}
      height={26}
      className="rounded-full"
      unoptimized
      onError={() => setErrored(true)}
    />
  )
}

export default function AuthButton({
  adminUsername,
}: {
  adminUsername?: string
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null
  }

  if (session?.user) {
    const isAdmin = (session as any).login === adminUsername

    return (
      <div className="flex items-center gap-2.5">
        {/* Admin-only: small white "+" to open the editor */}
        {isAdmin && (
          <Link
            href="/admin/new-post"
            title="Write a new post"
            className="flex items-center justify-center w-7 h-7 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-lg leading-none font-light hover:scale-110 transition-transform"
          >
            +
          </Link>
        )}
        <Avatar src={session.user.image} name={session.user.name} />
        <button
          onClick={() => signOut()}
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
    >
      Sign in
    </button>
  )
}
