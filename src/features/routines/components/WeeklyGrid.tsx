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
    <div className="grid grid-cols-7 gap-3">
      {WEEKDAYS.map((day) => {
        const slots = (byDay[day] ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time))

        return (
          <div key={day} className="flex flex-col gap-2">
            {/* Day Header */}
            <div className="text-center py-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <p className="text-xs font-semibold text-slate-300 tracking-wide">{DAY_LABELS[day]}</p>
            </div>

            {/* Slots */}
            <div className="flex flex-col gap-2 min-h-[120px]">
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
                  onClick={() => onAddClick?.(day)}
                  className="w-full py-3 rounded-lg border border-dashed border-slate-700 text-slate-600 hover:border-blue-500/50 hover:text-blue-400 transition-all text-xl leading-none"
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
        w-full text-left p-3 rounded-lg border transition-all group relative
        ${isInactive
          ? 'border-amber-500/20 bg-amber-500/5 opacity-60'
          : `${cfg.border} ${cfg.bg} hover:brightness-110`
        }
        ${!readonly ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Subject + quick delete */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className={`text-xs font-semibold leading-snug flex-1 min-w-0 ${isInactive ? 'line-through text-slate-500' : 'text-slate-200'} ${slot.entry_type === 'OFF_DAY' ? 'text-center py-3' : ''}`}>
          {slot.entry_type === 'OFF_DAY' ? '🚫 Off Day' : (slot.subjects?.name_bn ?? slot.subjects?.name ?? '—')}
        </p>
        {!readonly && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this slot?')) onDelete()
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all flex-shrink-0 -mt-0.5"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {slot.entry_type !== 'OFF_DAY' && (
        <>
          {/* Teacher */}
          {slot.teachers && (
            <p className="text-[10px] text-slate-500 mb-2 truncate">
              {slot.teachers.full_name}
            </p>
          )}

          {/* Time */}
          <div className={`flex items-center gap-1 text-[10px] ${isInactive ? 'text-slate-600' : 'text-slate-400'}`}>
            <Clock size={10} />
            <span>{slot.start_time} – {slot.end_time}</span>
          </div>

          {/* Room */}
          {slot.room && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
              <MapPin size={10} />
              <span>{slot.room}</span>
            </div>
          )}
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
