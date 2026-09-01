import { useMemo } from 'react'
import { Calendar, Clock, MapPin, Sparkles, BookOpen } from 'lucide-react'
import type { Teacher } from '../../types'
import { useTeacherRoutine } from '@/features/routines/hooks/useRoutine'
import { DAY_LABELS, type DayOfWeek } from '@/features/routines/types'

const ORDERED_DAYS: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'SATURDAY']

export function ScheduleRoutineTab({ teacher }: { teacher: Teacher }) {
  const { data: routines = [], isLoading } = useTeacherRoutine(teacher.id)

  // Live computed metrics from real synchronized routines
  const totalPeriods = routines.length

  const uniqueClassesCount = useMemo(() => {
    const set = new Set<string>()
    routines.forEach(r => {
      if (r.classes?.name) set.add(r.classes.name)
      else if (r.class_id) set.add(r.class_id)
    })
    return set.size
  }, [routines])

  const activeDaysCount = useMemo(() => {
    const set = new Set<string>()
    routines.forEach(r => {
      if (r.day) set.add(r.day)
    })
    return set.size
  }, [routines])

  return (
    <div className="space-y-4">
      {/* ── Real-time Routine KPI Strip ───────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-zinc-200/80 p-3.5 rounded-2xl flex flex-col gap-1 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-medium">Weekly Class Load</span>
          <span className="text-base font-extrabold text-indigo-700 font-mono">
            {totalPeriods} {totalPeriods === 1 ? 'Period' : 'Periods'} / Wk
          </span>
        </div>

        <div className="bg-white border border-zinc-200/80 p-3.5 rounded-2xl flex flex-col gap-1 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-medium">Unique Classes</span>
          <span className="text-base font-extrabold text-emerald-700 font-mono">
            {uniqueClassesCount > 0 ? `${uniqueClassesCount} Classes` : 'No Class'}
          </span>
        </div>

        <div className="bg-white border border-zinc-200/80 p-3.5 rounded-2xl flex flex-col gap-1 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-medium">Active Teaching Days</span>
          <span className="text-base font-extrabold text-zinc-800 font-mono">
            {activeDaysCount} Days / Wk
          </span>
        </div>
      </div>

      {/* ── Live Synchronized Timetable Matrix ────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-indigo-600" />
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Assigned Timetable & Routine (Live Sync)
            </h4>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} /> Real-time Sync
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Loading assigned timetable...
          </div>
        ) : routines.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <BookOpen size={36} className="mx-auto mb-2 text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-700">No classes assigned to this teacher yet</p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
              Assign slots in Routines & Timetables to automatically sync this schedule.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {ORDERED_DAYS.map((day) => {
              const daySlots = routines
                .filter(r => r.day === day)
                .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

              if (daySlots.length === 0) return null

              return (
                <div key={day} className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/70 border border-zinc-100">
                  <div className="w-14 py-1.5 text-center font-bold text-xs bg-indigo-50 text-indigo-800 rounded-xl shrink-0 border border-indigo-100 shadow-xs">
                    {DAY_LABELS[day] || day}
                  </div>

                  <div className="flex-1 flex flex-wrap gap-2.5">
                    {daySlots.map((slot) => {
                      const subjectName = slot.subjects?.name || 'Subject'
                      const className = slot.classes?.name || 'Class'
                      const sectionName = slot.sections?.name ? `(${slot.sections.name})` : ''

                      return (
                        <div
                          key={slot.id}
                          className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200/90 shadow-xs flex items-center gap-3 text-xs hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center gap-1 font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            <Clock size={11} />
                            {slot.start_time} - {slot.end_time}
                          </div>

                          <div>
                            <p className="font-extrabold text-zinc-900 text-xs">
                              {subjectName}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                {className} {sectionName}
                              </span>
                              {slot.room && (
                                <span className="flex items-center gap-0.5 text-zinc-400">
                                  <MapPin size={9} /> {slot.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
