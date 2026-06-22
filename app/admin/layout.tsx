import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/api/auth/signin')
  }

  const login = (session as any).login
  if (login !== process.env.ADMIN_GITHUB_USERNAME) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="text-neutral-500 text-sm">
          Signed in as <strong>{login}</strong>, but this area is restricted to the site owner.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <h1 className="font-bold tracking-tighter text-lg">Admin</h1>
        <span className="text-xs text-neutral-400">Logged in as {login}</span>
      </div>
      {children}
    </div>
  )
}
