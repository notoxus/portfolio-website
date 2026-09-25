'use client'

import { useState } from 'react'

export function SystemControlCenter() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="surface-panel rounded-2xl p-5 font-mono text-xs border border-neutral-300 dark:border-neutral-700 my-6">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center space-x-2">
          <span className="text-green-600 dark:text-green-400 font-bold">root@notoxus:~#</span>
          <span className="text-neutral-700 dark:text-neutral-300">sys-diagnostics --interactive</span>
        </div>
        <div className="flex items-center space-x-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
          <span className="text-[10px] uppercase">{isExpanded ? '[Collapse]' : '[Expand details]'}</span>
          <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            -&gt;
          </span>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <div className="bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 text-[10px] mb-1">OS KERNEL</p>
          <p className="font-bold text-neutral-900 dark:text-neutral-100">NixOS 24.11</p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 text-[10px] mb-1">EDITOR</p>
          <p className="font-bold text-blue-600 dark:text-blue-400">VSCodium</p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 text-[10px] mb-1">SHELL</p>
          <p className="font-bold text-amber-600 dark:text-amber-400">Zsh + Fish</p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 text-[10px] mb-1">UPTIME</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400">99.9% Up</p>
        </div>
      </div>

      {/* Expand */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-3 animate-fadeIn">
          <div className="bg-neutral-900 text-green-400 p-3 rounded-xl overflow-x-auto text-[11px]">
            <p className="text-neutral-500"># Active Security & AI Modules Pipeline</p>
            <p>&gt; docker-containerization: active (v27.x)</p>
            <p>&gt; llm-agent-workflows: synchronized</p>
            <p>&gt; security-operations: monitoring ports [22, 80, 443]</p>
          </div>
          <p className="text-neutral-500 text-[11px] italic">
            * All telemetry streams are securely localized within container environments.
          </p>
        </div>
      )}
    </div>
  )
}