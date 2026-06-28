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
    default: 'Phuoc Thinh — Software Developer',
    template: '%s | Phuoc Thinh',
  },
  description:
    'Phuoc Thinh is a software developer who writes about web development, programming, and technology.',
  keywords: ['software developer', 'web development', 'Next.js', 'React', 'portfolio', 'blog'],
  authors: [{ name: 'Phuoc Thinh', url: baseUrl }],
  creator: 'Phuoc Thinh',
  openGraph: {
    title: 'Phuoc Thinh — Software Developer',
    description:
      'Phuoc Thinh is a software developer who writes about web development, programming, and technology.',
    url: baseUrl,
    siteName: 'Phuoc Thinh',
    locale: 'en_US',
    type: 'website',
    images: [{ url: `${baseUrl}/og?title=Phuoc+Thinh+%E2%80%94+Software+Developer`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phuoc Thinh — Software Developer',
    description:
      'Phuoc Thinh is a software developer who writes about web development, programming, and technology.',
    images: [`${baseUrl}/og?title=Phuoc+Thinh+%E2%80%94+Software+Developer`],
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
      className={cx(
        'text-black dark:text-white',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="min-h-screen antialiased">
        <SessionProviderWrapper>
          <main className="mx-auto flex min-w-0 max-w-5xl flex-auto flex-col px-5 py-7 md:px-8 lg:px-0">
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
