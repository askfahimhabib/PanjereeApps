import { Calendar, Clock, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Routine } from '../types'
import { RoutineEntryBadge } from './RoutineEntryBadge'

interface Props {
  routines: Routine[]
  emptyMessage?: string
  onSlotClick?: (routine: Routine) => void
}

export function ExamDateList({ routines, emptyMessage = 'No exam schedule found', onSlotClick }: Props) {
  const sorted = [...routines].sort((a, b) => {
    if (!a.specific_date || !b.specific_date) return 0
    return a.specific_date.localeCompare(b.specific_date)
  })

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
        <Calendar size={40} className="mb-3 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  // Group by month
  const byMonth: Record<string, Routine[]> = {}
  for (const r of sorted) {
    const month = r.specific_date ? r.specific_date.slice(0, 7) : 'N/A'
    if (!byMonth[month]) byMonth[month] = []
    byMonth[month].push(r)
  }

  return (
    <div className="space-y-6">
      {Object.entries(byMonth).map(([month, items]) => (
        <div key={month}>
          {/* Month label */}
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 pl-1">
            {month !== 'N/A'
              ? format(parseISO(month + '-01'), 'MMMM yyyy')
              : 'Date not set'
            }
          </p>

          <div className="space-y-2">
            {items.map((r) => (
              <ExamRow key={r.id} routine={r} onClick={onSlotClick ? () => onSlotClick(r) : undefined} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Single Row ───────────────────────────────────────────────────────────────

function ExamRow({ routine, onClick }: { routine: Routine; onClick?: () => void }) {
  const isInactive = !routine.is_active
  const dateLabel = routine.specific_date
    ? format(parseISO(routine.specific_date), 'dd MMM yyyy, EEEE')
    : '—'

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${isInactive
          ? 'border-amber-500/20 bg-amber-500/5 opacity-70'
          : onClick
            ? 'border-zinc-100 bg-zinc-50 hover:border-purple-500/40 hover:bg-purple-500/5'
            : 'border-zinc-100 bg-zinc-50'
        }
      `}>
      {/* Date Column */}
      <div className={`flex-shrink-0 w-20 text-center py-2 px-1 rounded-lg ${isInactive ? 'bg-zinc-50' : 'bg-white'}`}>
        {routine.specific_date ? (
          <>
            <p className="text-xl font-bold text-zinc-800 leading-none">
              {format(parseISO(routine.specific_date), 'dd')}
            </p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              {format(parseISO(routine.specific_date), 'MMM')}
            </p>
          </>
        ) : (
          <p className="text-xs text-zinc-600">—</p>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm mb-1 ${isInactive ? 'line-through text-zinc-600' : 'text-zinc-800'}`}>
          {routine.subjects?.name_bn ?? routine.subjects?.name ?? 'Subject not set'}
        </p>
        <p className="text-xs text-zinc-600">{dateLabel}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-zinc-600">
            <Clock size={11} />
            {routine.start_time} – {routine.end_time}
          </span>
          {routine.room && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-600">
              <MapPin size={11} />
              {routine.room}
            </span>
          )}
        </div>
      </div>

      {/* Badge */}
      <RoutineEntryBadge
        type={routine.entry_type}
        isActive={routine.is_active}
        postponeNote={routine.postpone_note}
        size="md"
      />
    </div>
  )
}
