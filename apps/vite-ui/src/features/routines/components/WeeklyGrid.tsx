import { Clock, MapPin, Trash2 } from 'lucide-react'
import type { Routine, DayOfWeek } from '../types'
import { DAY_LABELS, WEEKDAYS, ENTRY_TYPE_CONFIG } from '../types'
import { groupByDay } from '../hooks/useRoutine'
import { RoutineEntryBadge } from './RoutineEntryBadge'

interface Props {
  routines: Routine[]
  onSlotClick?: (slot: Routine) => void
  onAddClick?: (day: DayOfWeek) => void
  onDeleteSlot?: (id: string) => void
  readonly?: boolean
}

export function WeeklyGrid({ routines, onSlotClick, onAddClick, onDeleteSlot, readonly = false }: Props) {
  const byDay = groupByDay(routines)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {WEEKDAYS.map((day) => {
        const slots = (byDay[day] ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time))

        return (
          <div key={day} className="flex flex-col gap-2.5 bg-zinc-50/50 p-2.5 rounded-2xl border border-zinc-200/60">
            {/* Day Header */}
            <div className="text-center py-2 px-1 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
              <p className="text-xs font-bold text-zinc-900 tracking-wide">{DAY_LABELS[day]}</p>
              <span className="text-[10px] font-mono text-zinc-400">
                {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
              </span>
            </div>

            {/* Slots */}
            <div className="flex flex-col gap-2 min-h-[140px]">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onClick={() => onSlotClick?.(slot)}
                  onDelete={onDeleteSlot ? () => onDeleteSlot(slot.id) : undefined}
                  readonly={readonly}
                />
              ))}

              {/* Add button */}
              {!readonly && (
                <button
                  type="button"
                  onClick={() => onAddClick?.(day)}
                  className="w-full py-3 rounded-xl border border-dashed border-zinc-300 text-zinc-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all text-lg leading-none cursor-pointer flex items-center justify-center font-bold"
                  title={`Add slot on ${DAY_LABELS[day]}`}
                >
                  +
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Single Slot Card ─────────────────────────────────────────────────────────

function SlotCard({ slot, onClick, onDelete, readonly }: { slot: Routine; onClick: () => void; onDelete?: () => void; readonly: boolean }) {
  const cfg = ENTRY_TYPE_CONFIG[slot.entry_type]
  const isInactive = !slot.is_active

  return (
    <div
      onClick={!readonly ? onClick : undefined}
      className={`
        w-full text-left p-3 rounded-xl border transition-all group relative shadow-2xs
        ${isInactive
          ? 'border-amber-200 bg-amber-50/50 opacity-60'
          : `${cfg.border} ${cfg.bg} hover:shadow-xs hover:border-indigo-300`
        }
        ${!readonly ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Subject + quick delete */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className={`text-xs font-bold leading-snug flex-1 min-w-0 ${isInactive ? 'line-through text-zinc-400' : 'text-zinc-900'} ${slot.entry_type === 'OFF_DAY' ? 'text-center py-4 font-bold text-rose-700' : ''}`}>
          {slot.entry_type === 'OFF_DAY' ? '🚫 Off Day' : (slot.subjects?.name_bn ?? slot.subjects?.name ?? '—')}
        </p>
        {!readonly && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this slot?')) onDelete()
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex-shrink-0 -mt-1 -mr-1 cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {slot.entry_type !== 'OFF_DAY' && (
        <>
          {/* Teacher */}
          {slot.teachers && (
            <p className="text-[11px] font-semibold text-zinc-600 mb-1.5 truncate">
              👨‍🏫 {slot.teachers.full_name}
            </p>
          )}

          {/* CT Topic details if present */}
          {slot.topic && (
            <div className="mb-1.5 p-1.5 rounded-lg bg-white/80 border border-amber-200/80 text-[10px] text-amber-900 font-medium leading-tight">
              📝 <strong className="font-semibold">Topic:</strong> {slot.topic}
              {slot.total_marks && <span className="ml-1 font-mono font-bold">({slot.total_marks}m)</span>}
            </div>
          )}

          {/* Time & Room */}
          <div className="flex items-center justify-between gap-1 flex-wrap text-[10px] font-medium text-zinc-500 pt-1 border-t border-zinc-200/40">
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-zinc-400" />
              <span className="font-mono">{slot.start_time}–{slot.end_time}</span>
            </div>
            {slot.room && (
              <div className="flex items-center gap-0.5 text-zinc-600">
                <MapPin size={10} className="text-zinc-400" />
                <span>{slot.room}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Badge */}
      <div className="mt-2">
        <RoutineEntryBadge
          type={slot.entry_type}
          isActive={slot.is_active}
          postponeNote={slot.postpone_note}
        />
      </div>
    </div>
  )
}
