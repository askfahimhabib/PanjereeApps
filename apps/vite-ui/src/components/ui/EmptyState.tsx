import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon
  /** Main heading */
  title: string
  /** Supporting description text */
  description?: string
  /** Optional CTA button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * EmptyState — Unified empty state component used across all pages.
 * Replaces ad-hoc empty states in Dashboard, Attendance, Notices, Payments etc.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const sizes = {
    sm: { wrapper: 'py-10', icon: 28, title: 'text-sm', desc: 'text-xs' },
    md: { wrapper: 'py-16', icon: 36, title: 'text-sm', desc: 'text-xs' },
    lg: { wrapper: 'py-24', icon: 44, title: 'text-base', desc: 'text-sm' },
  }
  const s = sizes[size]

  return (
    <div className={`flex flex-col items-center justify-center ${s.wrapper} text-center`}>
      <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
        <Icon size={s.icon} className="text-zinc-300" strokeWidth={1.5} />
      </div>
      <p className={`font-semibold text-zinc-500 ${s.title}`}>{title}</p>
      {description && (
        <p className={`text-zinc-400 mt-1 max-w-[260px] leading-relaxed ${s.desc}`}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm shadow-green-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
