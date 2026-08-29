import type { RoutineEntryType } from '../types'
import { ENTRY_TYPE_CONFIG } from '../types'

interface Props {
  type: RoutineEntryType
  isActive?: boolean
  postponeNote?: string | null
  size?: 'sm' | 'md'
}

export function RoutineEntryBadge({ type, isActive = true, postponeNote, size = 'sm' }: Props) {
  const cfg = ENTRY_TYPE_CONFIG[type]
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  if (!isActive) {
    const note = postponeNote ?? 'Postponed'
    return (
      <span className={`inline-flex items-center gap-1 ${px} rounded-full font-medium border bg-amber-500/10 text-amber-400 border-amber-500/30`}>
        ⚠ {note}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center ${px} rounded-full font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}
