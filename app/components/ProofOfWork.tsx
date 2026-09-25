import { getProofOfWorkStats } from 'lib/proof-of-work'

export function ProofOfWork() {
  const stats = getProofOfWorkStats()

  return (
    <div className="surface-panel rounded-2xl p-6 font-mono text-xs border border-neutral-300 dark:border-neutral-700 my-8 relative overflow-hidden">
      {/* Loading pane */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="w-1/3 bg-blue-500"></div>
        <div className="w-1/6 bg-emerald-500"></div>
        <div className="w-1/2 bg-neutral-600 dark:bg-neutral-700"></div>
      </div>

      {/* Small header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[10px]">
          // ENGINEERING SIGNAL
        </span>
        <div className="flex space-x-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-400/80"></div>
        </div>
      </div>

      {/* Header */}
      <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50 mb-2">
        Public evidence of maintainer-grade execution
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-xs">
        systems engineering / coding agents / production reliability
      </p>

      {/* GitHub Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {stats.upstream_merges}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            UPSTREAM MERGES
          </p>
          <p className="text-[11px] text-neutral-500">
            public external pull requests
          </p>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {stats.tool_stars}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            TOOL STARS
          </p>
          <p className="text-[11px] text-neutral-500">
            across maintained OpenCode tools
          </p>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {stats.public_contributions}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            PUBLIC CONTRIBUTIONS
          </p>
          <p className="text-[11px] text-neutral-500">
            trailing twelve months
          </p>
        </div>
      </div>
    </div>
  )
}