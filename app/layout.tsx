import './global.css'
import 'katex/dist/katex.min.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import SessionProviderWrapper from './components/SessionProviderWrapper'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Phuoc Thinh — Cybersecurity Learner & SysAdmin / DevSecOps',
    template: '%s | Phuoc Thinh',
  },
  description:
    'Phuoc Thinh is a cybersecurity, Linux, and DevSecOps learner who shares practical projects, labs, and technical blog posts.',
  keywords: ['cybersecurity', 'ethical hacking', 'sysadmin', 'devsecops', 'portfolio', 'blog', 'TryHackMe'],
  authors: [{ name: 'Phuoc Thinh', url: baseUrl }],
  creator: 'Phuoc Thinh',
  openGraph: {
    title: 'Phuoc Thinh — Cybersecurity Learner & SysAdmin / DevSecOps',
    description:
      'Phuoc Thinh is a cybersecurity, Linux, and DevSecOps learner who shares practical projects, labs, and technical blog posts.',
    url: baseUrl,
    siteName: 'Phuoc Thinh',
    locale: 'en_US',
    type: 'website',
    images: [{ url: `${baseUrl}/og?title=Phuoc+Thinh+%E2%80%94+Cybersecurity+%26+DevSecOps`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phuoc Thinh — Cybersecurity Learner & SysAdmin / DevSecOps',
    description:
      'Phuoc Thinh is a cybersecurity, Linux, and DevSecOps learner who shares practical projects, labs, and technical blog posts.',
    images: [`${baseUrl}/og?title=Phuoc+Thinh+%E2%80%94+Cybersecurity+%26+DevSecOps`],
  },
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/** Joins optional CSS class names into one string. */
const cx = (...classes) => classes.filter(Boolean).join(' ')

/** Renders the shared page shell for every route. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cx(
        'text-black dark:text-white',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="min-h-screen antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('portfolio-theme');if(!t){t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}if(t==='dark')document.documentElement.classList.add('dark');var b=localStorage.getItem('portfolio-bg-preset');if(b&&b!=='default')document.documentElement.classList.add('bg-preset-'+b)}catch(e){}})()`,
          }}
        />
        <SessionProviderWrapper>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">
            Skip to content
          </a>
          <main id="main-content" className="mx-auto flex min-w-0 max-w-5xl flex-auto flex-col px-4 py-5 sm:px-5 sm:py-7 md:px-8 lg:px-0">
            <Navbar />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
