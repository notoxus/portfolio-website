'use client'

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  activeColor?: string;
}

export default function ToggleSwitch({ checked, onChange, label, activeColor = '#3b82f6' }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: checked
            ? activeColor
            : 'rgb(156 163 175)', // neutral-400
          position: 'relative',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.25s',
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          transition: 'left 0.25s',
        }} />
      </button>
    </div>
  );
}