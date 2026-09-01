import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  User,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import type { Routine, DayOfWeek } from '@/features/routines/types'
import { format } from 'date-fns'

interface WidgetTodayRoutineProps {
  routines: Routine[]
  currentDayOfWeek: DayOfWeek
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'SUNDAY', label: 'Sun' },
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
]

export function WidgetTodayRoutine({
  routines,
  currentDayOfWeek,
}: WidgetTodayRoutineProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentDayOfWeek)
  const now = new Date()
  const currentTimeStr = format(now, 'HH:mm')

  const filteredRoutines = routines
    .filter(r => r.day === selectedDay && r.is_active !== false)
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
              <CalendarDays size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Today's Class Timetable</h2>
              <p className="text-[11px] text-zinc-400">Live routine schedule & periods</p>
            </div>
          </div>

          <Link
            to="/routines"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
          >
            <span>Full Routine</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-50 border border-zinc-200/80 rounded-xl mb-4 overflow-x-auto hide-scrollbar">
          {DAYS.map(day => {
            const isSelected = selectedDay === day.key
            const isToday = currentDayOfWeek === day.key
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={`flex-1 min-w-[42px] py-1.5 rounded-lg text-xs font-bold transition-all text-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60'
                }`}
              >
                <span>{day.label}</span>
                {isToday && (
                  <span className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Period List */}
        {filteredRoutines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-400 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <CalendarDays size={28} className="mb-2 opacity-30" />
            <p className="text-xs font-semibold text-zinc-600">No classes scheduled for {selectedDay}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Weekend or off-session period</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 hide-scrollbar">
            {filteredRoutines.map((routine, idx) => {
              const isOngoing =
                selectedDay === currentDayOfWeek &&
                currentTimeStr >= (routine.start_time || '') &&
                currentTimeStr <= (routine.end_time || '')

              const isPast =
                selectedDay === currentDayOfWeek &&
                currentTimeStr > (routine.end_time || '')

              const targetLabel = routine.classes?.name ?? routine.batches?.name ?? 'Class'
              const subjectName = routine.subjects?.name ?? 'Subject'
              const subjectBn = routine.subjects?.name_bn
              const teacherName = routine.teachers?.full_name ?? 'Faculty'

              return (
                <div
                  key={routine.id || idx}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                    isOngoing
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs ring-1 ring-purple-200'
                      : isPast
                      ? 'bg-zinc-50/70 border-zinc-200/60 opacity-65'
                      : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Time Pill */}
                    <div
                      className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg text-center shrink-0 ${
                        isOngoing ? 'bg-purple-600 text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <span className="text-[11px] font-bold font-mono leading-none">
                        {routine.start_time || '00:00'}
                      </span>
                      <span className="text-[9px] opacity-75 leading-none mt-0.5">
                        {routine.end_time || '00:00'}
                      </span>
                    </div>

                    {/* Subject & Teacher Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-zinc-900 truncate">{subjectName}</p>
                        {subjectBn && (
                          <span className="text-[10px] text-zinc-400 hidden sm:inline truncate">
                            ({subjectBn})
                          </span>
                        )}
                        {isOngoing && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-800 text-[9px] font-extrabold animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1 truncate">
                          <User size={11} className="text-zinc-400 shrink-0" />
                          <span className="truncate">{teacherName}</span>
                        </span>
                        {routine.room && (
                          <span className="flex items-center gap-1 shrink-0 text-zinc-400">
                            <MapPin size={11} />
                            <span>{routine.room}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Class Badge */}
                  <span className="shrink-0 px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 font-bold text-[10px] border border-zinc-200/60">
                    {targetLabel}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{filteredRoutines.length} classes scheduled</span>
        <span className="text-zinc-500 font-medium">Session 2024-2025</span>
      </div>
    </div>
  )
}
