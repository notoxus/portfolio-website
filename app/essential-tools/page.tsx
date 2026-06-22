import Link from 'next/link'

export const metadata = {
  title: 'Essential Tools',
  description: 'A collection of useful tools I build and maintain.',
}

type Tool = {
  href: string
  name: string
  description: string
  icon: string
  status?: 'live' | 'beta' | 'soon'
}

const tools: Tool[] = [
  {
    href: '/essential-tools/studyhub',
    name: 'Study Hub',
    description:
      'Watch videos with synced transcripts, instant translation, and a built-in dictionary - built for language learners.',
    icon: '\u{1F3AC}',
    status: 'beta',
  },
]

const statusStyles: Record<NonNullable<Tool['status']>, string> = {
  live: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  beta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  soon: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
}

export default function EssentialToolsPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-2 tracking-tighter">Essential Tools</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-sm">
        A growing collection of useful tools I build and maintain. More coming soon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col gap-3 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{tool.icon}</span>
              {tool.status && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles[tool.status]}`}
                >
                  {tool.status}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-base tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                {tool.description}
              </p>
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-blue-500 transition-colors mt-auto">
              Open tool &#8594;
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
