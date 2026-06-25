import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: { scope: 'read:user user:email public_repo' },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      if (profile) {
        token.login = (profile as any).login
        token.avatar = (profile as any).avatar_url
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      ;(session as any).accessToken = token.accessToken
      ;(session as any).login = token.login
      ;(session as any).avatar = token.avatar
      session.user.image = session.user.image ?? (token.avatar as string | undefined)
      return session
    },
  },
})
