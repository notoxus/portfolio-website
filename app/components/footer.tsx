import { SocialLinks } from './social-links'
import { getSiteSettings } from 'lib/site-settings'

export default function Footer() {
  const settings = getSiteSettings()

  return (
    <footer
      id="contact"
      className="mt-14 mb-8 border-t border-neutral-200/80 pt-6 dark:border-neutral-800/80 sm:mt-20 sm:mb-10 sm:pt-8"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 pr-4 sm:pr-8">
          <p className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
            {settings.footer.title}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
            {settings.footer.description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <SocialLinks />
        </div>
      </div>
      <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-500">
        &copy; {new Date().getFullYear()} by Phuoc Thinh. All rights reserved.
      </p>
    </footer>
  )
}
