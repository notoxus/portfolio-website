import Link from 'next/link'
import AuthButton from './AuthButton'
import NavLinks from './NavLinks'

export function Navbar() {
  return (
    <aside className="mb-8 sm:mb-12 lg:mb-16 tracking-tight">
      <div className="lg:sticky lg:top-6 lg:z-20">
        <nav
          className="surface-panel flex flex-wrap items-center justify-between gap-y-4 rounded-2xl px-4 py-3"
          id="nav"
        >
          <Link href="/" className="order-1 group flex items-center gap-2.5 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-xs shadow-sm transition-colors group-hover:border-blue-500 dark:border-neutral-800 dark:bg-neutral-950">
              PT
            </span>
            <span className="text-neutral-900 dark:text-neutral-100">Phuoc Thinh</span>
          </Link>

          <div className="order-2 sm:order-3">
            <AuthButton
              adminUsername={process.env.ADMIN_GITHUB_USERNAME}
            />
          </div>

          <div className="order-3 sm:order-2 flex w-full sm:w-auto sm:flex-1 items-center gap-3">
            <div className="hidden h-5 w-px bg-neutral-200 dark:bg-neutral-800 sm:block" />
            <NavLinks />
          </div>
        </nav>
      </div>
    </aside>
  )
}
