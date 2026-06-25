import './global.css'
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
    default: 'Phuoc Thinh Portfolio',
    template: '%s | Phuoc Thinh Portfolio',
  },
  description: 'This is my portfolio.',
  openGraph: {
    title: 'My Portfolio',
    description: 'This is my portfolio.',
    url: baseUrl,
    siteName: 'My Portfolio',
    locale: 'en_US',
    type: 'website',
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

const cx = (...classes) => classes.filter(Boolean).join(' ')

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
