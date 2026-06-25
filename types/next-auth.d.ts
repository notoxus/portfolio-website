import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    login?: string
    avatar?: string
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface JWT {
    accessToken?: string
    login?: string
    avatar?: string
  }
}
