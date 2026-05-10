'use client'

import { useState, useEffect } from 'react'

function FileNode({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const toggleFolder = async () => {
    if (item.type !== 'dir') return
    
    const nextState = !isOpen
    setIsOpen(nextState)

    // Chỉ load dữ liệu nếu mở ra và chưa có dữ liệu sẵn
    if (nextState && children.length === 0) {
      setIsLoading(true)
      setError(false)
      try {
        const res = await fetch(`https://api.github.com/repos/CSerVN/my-note-book/contents/${item.path}`)
        
        if (!res.ok) throw new Error('API Error')
        
        const data = await res.json()
        
        // GitHub API trả về mảng nếu là folder, trả về object nếu là file
        if (Array.isArray(data)) {
          setChildren(data.sort((a: any, b: any) => (a.type === 'dir' ? -1 : 1)))
        } else {
          setChildren([])
        }
      } catch (err) {
        console.error("Fetch Data Error:", err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
  }
  const extension = item.type === 'file' 
  ? item.name.split('.').pop()?.toUpperCase() 
  : '';
  // Link tải file raw
  const rawUrl = `https://raw.githubusercontent.com/CSerVN/my-note-book/main/${item.path}`

  return (
    <div className="flex flex-col">
      <div 
        className="flex items-center justify-between px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 transition-colors group cursor-pointer"
        onClick={toggleFolder}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg select-none">
            {item.type === 'dir' ? (isOpen ? '📂' : '📁') : '📄'}
          </span>
          <span className="text-neutral-700 dark:text-neutral-300 font-mono text-sm truncate max-w-[200px] md:max-w-xs">
            {item.name}
          </span>
        </div>

        {item.type === 'file' && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          {/* Cột Extension - Nhìn như một cái nhãn kỹ thuật */}
          <span className="hidden md:block text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-bold tracking-wider">
            {extension}
          </span>

          {/* Nút Download chính */}
          <a 
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-200 dark:bg-neutral-800 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 shadow-sm"
          >
          DOWNLOAD RAW ⬇
        </a>
        </div>
          )}
        </div>

      {/* Hiển thị nội dung con */}
      {isOpen && (
        <div className="ml-6 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10">
          {isLoading && <div className="px-4 py-2 text-xs text-neutral-400 animate-pulse">Loading...</div>}
          {error && <div className="px-4 py-2 text-xs text-red-500">Failed to load. Limit reached?</div>}
          {!isLoading && !error && children.map((child: any) => (
            <FileNode key={child.sha} item={child} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NotebookPage() {
  const [rootFiles, setRootFiles] = useState<any[]>([])
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    fetch('https://api.github.com/repos/CSerVN/my-note-book/contents')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setRootFiles(data.sort((a: any, b: any) => (a.type === 'dir' ? -1 : 1)))
        }
      })
      .catch(() => setRootFiles([]))
  }, [])

  // Ngăn chặn lỗi Hydration của Next.js
  if (!hasMounted) return null

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Notebook</h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-400">
        Interactive explorer with direct raw access to my GitHub assets.
      </p>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-black">
        {rootFiles.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 font-mono text-sm animate-pulse">
            Connecting to GitHub API...
          </div>
        ) : (
          rootFiles.map((file: any) => (
            <FileNode key={file.sha} item={file} />
          ))
        )}
      </div>
    </section>
  )
}