import Link from 'next/link'
import AuthButton from './AuthButton'

const navItems = {
  '/': { name: 'home' },
  '/blog': { name: 'blog' },
  '/projects': { name: 'projects' },
  '/notebook': { name: 'notebook' },
  '/essential-tools': { name: 'tools' },
}

export function Navbar() {
  return (
    <aside className="mb-16 tracking-tight">
      <div className="lg:sticky lg:top-6 lg:z-20">
        <nav
          className="surface-panel flex flex-col gap-4 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          id="nav"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-xs shadow-sm transition-colors group-hover:border-blue-500 dark:border-neutral-800 dark:bg-neutral-950">
                PT
              </span>
              <span className="text-neutral-900 dark:text-neutral-100">Phuoc Thinh</span>
            </Link>
            <div className="hidden h-5 w-px bg-neutral-200 dark:bg-neutral-800 sm:block" />
            <div className="flex flex-row flex-wrap gap-1 text-sm text-neutral-500 dark:text-neutral-400">
            {Object.entries(navItems).map(([path, { name }]) => (
              <Link
                key={path}
                href={path}
                className="rounded-lg px-2.5 py-1.5 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              >
                {name}
              </Link>
            ))}
            </div>
          </div>

          <AuthButton
            adminUsername={process.env.ADMIN_GITHUB_USERNAME}
            authConfigured={!!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)}
          />
        </nav>
      </div>
    </aside>
  )
}
