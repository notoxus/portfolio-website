import Link from 'next/link'

async function getGitHubTree() {
  const res = await fetch('https://api.github.com/repos/CSerVN/my-note-book/contents', {
    next: { revalidate: 3600 } 
  })
  
  if (!res.ok) {
    return []
  }
  return res.json()
}

export const metadata = {
  title: 'Notebook',
  description: 'My notebook and collection books will appear here.',
}

export default async function NotebookPage() {
  const files = await getGitHubTree()

  const sortedFiles = files.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name)
    return a.type === 'dir' ? -1 : 1
  })

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Notebook</h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-400">
        Live directory tree synced directly from my GitHub repository.
      </p>

      {/* File Explorer Frame */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden font-mono text-sm">
        {sortedFiles.length === 0 ? (
          <div className="p-4 text-neutral-500">Loading or not found folder...</div>
        ) : (
          sortedFiles.map((file) => (
            <a
              key={file.sha}
              href={file.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors last:border-0"
            >
              <span className="text-lg">
                {file.type === 'dir' ? '📁' : '📄'}
              </span>
              <span className="text-neutral-700 dark:text-neutral-300 hover:text-blue-500 transition-colors">
                {file.name}
              </span>
            </a>
          ))
        )}
      </div>
    </section>
  )
}