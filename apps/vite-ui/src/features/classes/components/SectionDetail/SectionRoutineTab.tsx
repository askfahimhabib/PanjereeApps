import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, BookOpen, User, ExternalLink } from 'lucide-react'
import type { Section } from '../../types'
import { routineStore, subjectStore, teacherStore } from '@/data/stores'
import type { Routine, DayOfWeek } from '@/features/routines/types'
import { DAY_LABELS } from '@/features/routines/types'

interface SectionRoutineTabProps {
  section: Section
}

const ORDERED_DAYS: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY']

export function SectionRoutineTab({ section }: SectionRoutineTabProps) {
  // Fetch routines for this class & section
  const sectionRoutines = useMemo(() => {
    return routineStore.getWhere(r => {
      return r.class_id === section.classId
    })
  }, [section.classId])

  // Get subjects and teachers for fast name lookups
  const subjectsMap = useMemo(() => {
    const map = new Map<string, string>()
    subjectStore.getAll().forEach(s => map.set(s.id, s.name))
    return map
  }, [])

  const teachersMap = useMemo(() => {
    const map = new Map<string, string>()
    teacherStore.getAll().forEach(t => map.set(t.id, t.fullName))
    return map
  }, [])

  // Group routines by day
  const routinesByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, Routine[]> = {
      SUNDAY: [],
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
    }

    sectionRoutines.forEach(r => {
      if (r.day && grouped[r.day]) {
        grouped[r.day].push(r)
      }
    })

    // Sort periods by start time
    Object.keys(grouped).forEach(day => {
      grouped[day as DayOfWeek].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    return grouped
  }, [sectionRoutines])

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Weekly Routine — {section.className} ({section.name})
            </h3>
            <p className="text-xs text-zinc-500">
              Assigned subject periods, teachers, and classroom schedule
            </p>
          </div>
        </div>

        <Link
          to={`/routines`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all"
        >
          <span>Manage Master Routine</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Routine Timetable Cards */}
      <div className="grid grid-cols-1 gap-4">
        {ORDERED_DAYS.map(day => {
          const dayRoutines = routinesByDay[day] || []
          return (
            <div key={day} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    {DAY_LABELS[day]}
                  </h4>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  {dayRoutines.length > 0 ? `${dayRoutines.length} Periods Scheduled` : 'No Classes Scheduled'}
                </span>
              </div>

              <div className="p-4">
                {dayRoutines.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dayRoutines.map((routine, idx) => {
                      const subjectName = (routine.subject_id ? subjectsMap.get(routine.subject_id) : null) || routine.subjects?.name || 'Subject'
                      const teacherName = (routine.teacher_id ? teachersMap.get(routine.teacher_id) : null) || routine.teachers?.full_name || 'Teacher'

                      return (
                        <div
                          key={routine.id || idx}
                          className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium mb-1.5">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              <Clock size={11} /> {routine.start_time} - {routine.end_time}
                            </span>
                            <span className="font-semibold text-zinc-600">Period {idx + 1}</span>
                          </div>

                          <div className="font-bold text-sm text-zinc-900 mt-1 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-indigo-600 shrink-0" />
                            <span className="truncate">{subjectName}</span>
                          </div>

                          <div className="text-xs text-zinc-600 mt-1.5 flex items-center gap-1.5">
                            <User size={13} className="text-zinc-400 shrink-0" />
                            <span className="truncate font-medium">{teacherName}</span>
                          </div>

                          {routine.room && (
                            <div className="mt-2 text-[10px] font-semibold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md inline-block">
                              Room: {routine.room}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic py-2">No periods assigned for this day.</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
