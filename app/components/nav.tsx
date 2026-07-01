import Link from 'next/link'
import AuthButton from './AuthButton'
import NavLinks from './NavLinks'

export function Navbar() {
  return (
    <aside className="mb-10 sm:mb-16 tracking-tight">
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
            <NavLinks />
          </div>

          <AuthButton
            adminUsername={process.env.ADMIN_GITHUB_USERNAME}
          />
        </nav>
      </div>
    </aside>
  )
}
