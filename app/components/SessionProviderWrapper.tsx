'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './ThemeProvider'
import { SFXProvider } from './SFXProvider'

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SFXProvider>
          {children}
        </SFXProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
