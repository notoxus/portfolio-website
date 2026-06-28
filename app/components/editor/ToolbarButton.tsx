'use client'

type Props = {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

/** Renders one reusable icon button in the editor toolbar. */
export default function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(event) => {
        event.preventDefault()
        if (!disabled) onClick()
      }}
      title={title}
      className={`inline-grid h-8 min-w-8 place-items-center rounded px-2 text-xs font-mono transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
          : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}
