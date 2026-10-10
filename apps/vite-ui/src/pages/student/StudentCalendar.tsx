import { useState, useMemo } from 'react'
import {
  CalendarDays,
  Sparkles,
  Flag,
  PartyPopper,
  BookOpen,
} from 'lucide-react'
import { calendarStore, examStore } from '@/data/stores'

export function StudentCalendar() {
  const [filterType, setFilterType] = useState<'ALL' | 'HOLIDAY' | 'EXAM' | 'EVENT'>('ALL')

  // Load real calendar events and exam schedules from stores
  const displayEvents = useMemo(() => {
    const rawEvents = calendarStore.getAll()
    const exams = examStore.getAll()

    const list: Array<{
      id: string
      title: string
      date: string
      type: 'HOLIDAY' | 'EXAM' | 'EVENT'
      desc: string
    }> = []

    // Map academic calendar events from calendarStore
    for (const ev of rawEvents) {
      const evType = String(ev.type || '').toUpperCase()
      const normalizedType: 'HOLIDAY' | 'EXAM' | 'EVENT' =
        evType === 'HOLIDAY' ? 'HOLIDAY' : evType === 'EXAM' ? 'EXAM' : 'EVENT'

      const dateDisplay =
        ev.endDate && ev.endDate !== ev.date
          ? `${ev.date} to ${ev.endDate}`
          : ev.date || 'Upcoming'

      list.push({
        id: ev.id,
        title: ev.title,
        date: dateDisplay,
        type: normalizedType,
        desc:
          ev.description ||
          (normalizedType === 'HOLIDAY' ? 'Official Institutional Holiday' : 'Academic Calendar Milestone'),
      })
    }

    // Include published or upcoming exams from examStore
    for (const ex of exams) {
      if (!list.some((l) => l.title.toLowerCase().includes(ex.name.toLowerCase()))) {
        const schedules = ex.exam_held_schedules || []
        const firstDate = schedules[0]?.date
        const lastDate = schedules[schedules.length - 1]?.date
        const dateDisplay = firstDate
          ? (lastDate && lastDate !== firstDate ? `${firstDate} to ${lastDate}` : firstDate)
          : 'Academic Session 2026'

        list.push({
          id: ex.id,
          title: ex.name,
          date: dateDisplay,
          type: 'EXAM',
          desc: `${ex.scope || 'Assessment'} • Full Marks ${ex.total_marks || 100}`,
        })
      }
    }

    if (filterType !== 'ALL') {
      return list.filter((e) => e.type === filterType)
    }

    return list
  }, [filterType])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-indigo-500" size={22} />
            Academic Calendar & Events (অ্যাকাডেমিক ক্যালেন্ডার)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Official institutional holidays, examination periods, and events for 2026
          </p>
        </div>

        {/* Milestone Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold self-start sm:self-auto">
          <Sparkles size={14} />
          <span>Next Vacation: March 26</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          All Dates & Milestones
        </button>

        <button
          onClick={() => setFilterType('HOLIDAY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'HOLIDAY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          Holidays (ছুটি)
        </button>

        <button
          onClick={() => setFilterType('EXAM')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'EXAM'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          Exams (পরীক্ষা)
        </button>

        <button
          onClick={() => setFilterType('EVENT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'EVENT'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          Events (ইভেন্ট)
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {displayEvents.map((ev) => {
          const isHoliday = ev.type === 'HOLIDAY'
          const isExam = ev.type === 'EXAM'

          return (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isHoliday
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : isExam
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {isHoliday ? <PartyPopper size={20} /> : isExam ? <BookOpen size={20} /> : <Flag size={20} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isHoliday
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : isExam
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {ev.type}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {ev.desc}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {ev.date}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
