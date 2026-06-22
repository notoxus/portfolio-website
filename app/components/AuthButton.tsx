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
  authConfigured = true,
}: {
  adminUsername?: string
  authConfigured?: boolean
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <span className="text-sm text-neutral-400">...</span>
  }

  // GitHub OAuth App not set up yet: avoid redirecting to a broken GitHub 404
  if (!session?.user && !authConfigured) {
    return (
      <button
        onClick={() =>
          alert(
            'GitHub sign-in is not configured yet.\n\nCreate a GitHub OAuth App and set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in .env.local, then restart the dev server.',
          )
        }
        title="GitHub OAuth not configured"
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 text-sm font-medium cursor-help"
      >
        Sign in (setup needed)
      </button>
    )
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
      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-sm font-medium hover:opacity-85 transition-opacity"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
      Sign in
    </button>
  )
}
