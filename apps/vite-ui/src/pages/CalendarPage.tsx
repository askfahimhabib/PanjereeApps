import { useState, useMemo } from 'react'
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sun,
  BookOpen,
  Trophy,
  Clock,
  MapPin,
  User,
  Sparkles,
  Layers,
  CalendarCheck,
  CheckCircle2,
  Download,
} from 'lucide-react'
import {
  useCalendar,
  isSameDay,
  formatDateStr,
  type CalendarEventType,
  type CalendarFilterType,
} from '@/features/calendar/useCalendar'
import { classStore } from '@/data/stores'
import { exportEventsToICal } from '@/features/calendar/icalExport'

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<
  CalendarEventType,
  {
    label: string
    labelBn: string
    bg: string
    lightBg: string
    text: string
    border: string
    icon: typeof Sun
    dotBg: string
  }
> = {
  HOLIDAY: {
    label: 'Holiday',
    labelBn: 'ছুটি',
    bg: 'bg-rose-100 text-rose-800 border-rose-200',
    lightBg: 'bg-rose-50/80',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: Sun,
    dotBg: 'bg-rose-500',
  },
  EXAM: {
    label: 'Exam / CT',
    labelBn: 'পরীক্ষা',
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    lightBg: 'bg-amber-50/80',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Trophy,
    dotBg: 'bg-amber-500',
  },
  CLASS: {
    label: 'Routine',
    labelBn: 'ক্লাস রুটিন',
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    lightBg: 'bg-blue-50/80',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: BookOpen,
    dotBg: 'bg-blue-500',
  },
  EVENT: {
    label: 'Event',
    labelBn: 'ইভেন্ট',
    bg: 'bg-purple-100 text-purple-800 border-purple-200',
    lightBg: 'bg-purple-50/80',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: CalendarDays,
    dotBg: 'bg-purple-500',
  },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_BN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// ── Main Page Component ───────────────────────────────────────────────────────

export function CalendarPage() {
  const {
    now,
    viewYear,
    viewMonth,
    calDays,
    selectedDay,
    setSelectedDay,
    selectedDayEvents,
    filterType,
    setFilterType,
    filterClassId,
    setFilterClassId,
    studentScope,
    setStudentScope,
    events,
    upcomingEvents,
    typeCounts,
    prevMonth,
    nextMonth,
    goToToday,
    goToDate,
    getEventsForDay,
    addEvent,
    deleteEvent,
  } = useCalendar()

  const [addModal, setAddModal] = useState(false)

  // Classes for filter dropdown
  const classesList = useMemo(() => {
    return classStore.getAll().filter((c) => c.isActive !== false)
  }, [])

  // Categorize events for the selected day
  const selectedHolidays = selectedDayEvents.filter((e) => e.type === 'HOLIDAY')
  const selectedExams = selectedDayEvents.filter((e) => e.type === 'EXAM')
  const selectedClasses = selectedDayEvents.filter((e) => e.type === 'CLASS')
  const selectedEvents = selectedDayEvents.filter((e) => e.type === 'EVENT')

  const isSelectedFriday = selectedDay?.getDay() === 5

  const handleExportICal = () => {
    exportEventsToICal(events, `panjeree_calendar_${viewYear}_${viewMonth + 1}.ics`)
  }

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            Academic Calendar
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Synchronized Class Routine, Exams, Class Tests &amp; Holidays (Friday Weekly Off)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Persona Scope Toggle */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setStudentScope({ enabled: false })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !studentScope.enabled
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All School
            </button>
            <button
              type="button"
              onClick={() => setStudentScope({ enabled: true, classId: 'cls-10', batchId: 'batch-ssc-2024' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                studentScope.enabled
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Student View (Class 10 + SSC Batch)
            </button>
          </div>

          {/* Class Filter Dropdown (visible when in Admin mode) */}
          {!studentScope.enabled && (
            <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
              <Layers size={14} className="text-zinc-400" />
              <select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                aria-label="Filter events by class"
                className="bg-transparent font-semibold text-zinc-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export to iCal (.ics) */}
          <button
            onClick={handleExportICal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 shadow-2xs transition-all cursor-pointer"
            title="Download .ics file to import into Google Calendar or Apple Calendar"
          >
            <Download size={14} className="text-indigo-600" />
            <span>Export iCal</span>
          </button>

          {/* Jump to Today */}
          <button
            onClick={goToToday}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 shadow-2xs transition-all"
          >
            <CalendarCheck size={14} className="text-emerald-600" />
            Today
          </button>

          {/* New Event Button */}
          <button
            onClick={() => setAddModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* ── Type Filter Pills ─────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="pill-tab-container overflow-x-auto max-w-full">
          {(['ALL', 'HOLIDAY', 'EXAM', 'CLASS', 'EVENT'] as const).map((t) => {
            const count = typeCounts[t] ?? 0
            const isActive = filterType === t
            const cfg = t !== 'ALL' ? TYPE_CFG[t as CalendarEventType] : null

            return (
              <button
                key={t}
                onClick={() => setFilterType(t as CalendarFilterType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive ? 'pill-tab-active' : 'pill-tab-inactive'
                }`}
              >
                {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dotBg}`} />}
                <span>
                  {t === 'ALL'
                    ? 'All'
                    : t === 'HOLIDAY'
                    ? 'Holidays (Fri Off)'
                    : t === 'CLASS'
                    ? 'Class Routine'
                    : cfg?.label}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-200/70 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sync Indicator Notice */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-lg">
          <Sparkles size={12} className="text-emerald-600" />
          <span>Live Synced from Routine &amp; Exams</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Calendar Grid (2 Cols) ────────────────────────── */}
        <div className="lg:col-span-2 card-surface overflow-hidden border border-zinc-200/80 shadow-sm flex flex-col">
          {/* Month Header Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-white">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <h2 className="font-bold text-zinc-900 text-lg tracking-tight">
                {MONTHS_BN[viewMonth]} {viewYear}
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">
                {MONTHS_BN[viewMonth]} {viewYear} Academic Schedule
              </p>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-200/70 bg-zinc-50/60">
            {DAYS.map((d, i) => {
              const isFriday = i === 5 // 5 = Friday
              return (
                <div
                  key={d}
                  className={`py-2.5 text-center text-xs font-bold transition-colors ${
                    isFriday
                      ? 'text-rose-600 bg-rose-50/70 border-b-2 border-rose-300'
                      : 'text-zinc-600'
                  }`}
                >
                  <span>{d}</span>
                  {isFriday && (
                    <span className="block text-[9px] font-normal text-rose-500 -mt-0.5">
                      Holiday
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 flex-1 bg-zinc-100/40 gap-[1px]">
            {calDays.map((day, i) => {
              if (!day) {
                return (
                  <div
                    key={i}
                    className="min-h-[105px] bg-zinc-50/40 p-1.5 border-b border-r border-zinc-100"
                  />
                )
              }

              const dayEvents = getEventsForDay(day)
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              const isToday = isSameDay(day, now)
              const isFriday = day.getDay() === 5

              // Counts by type on this day
              const examCount = dayEvents.filter((e) => e.type === 'EXAM').length
              const classCount = dayEvents.filter((e) => e.type === 'CLASS').length
              const hasHoliday = isFriday || dayEvents.some((e) => e.type === 'HOLIDAY')

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[56px] sm:min-h-[105px] p-1 sm:p-1.5 cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/90 ring-2 ring-emerald-500/50 z-10'
                      : isFriday
                      ? 'bg-rose-50/35 hover:bg-rose-50/60'
                      : 'bg-white hover:bg-zinc-50'
                  }`}
                >
                  {/* Top Bar: Day Number & Holiday Tag */}
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-transform ${
                        isToday
                          ? 'bg-[var(--color-primary)] text-white shadow-xs scale-105'
                          : isFriday
                          ? 'text-rose-600 font-extrabold'
                          : 'text-zinc-800'
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    {isFriday && (
                      <span className="text-[8px] sm:text-[9px] font-semibold text-rose-600 bg-rose-100/70 px-1 py-0.2 rounded leading-none">
                        Off
                      </span>
                    )}
                  </div>

                  {/* Desktop Event Badges */}
                  <div className="hidden sm:block space-y-0.5 flex-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = TYPE_CFG[ev.type]
                      return (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-medium px-1 py-0.5 rounded truncate border ${cfg.bg} transition-all`}
                          title={`${ev.title} ${ev.startTime ? '(' + ev.startTime + ')' : ''}`}
                        >
                          {ev.startTime && <span className="font-semibold mr-0.5">{ev.startTime}</span>}
                          {ev.title}
                        </div>
                      )
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-semibold text-zinc-500 px-1 pt-0.5">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Mobile Compact Dots Indicator */}
                  <div className="flex sm:hidden items-center justify-center gap-1 py-0.5 mt-auto">
                    {dayEvents.slice(0, 3).map((ev, idx) => {
                      const cfg = TYPE_CFG[ev.type]
                      return (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg}`}
                          title={ev.title}
                        />
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    )}
                  </div>

                  {/* Desktop Day bottom indicators */}
                  {(examCount > 0 || classCount > 0 || hasHoliday) && (
                    <div className="hidden sm:flex items-center gap-1 pt-1 mt-auto">
                      {hasHoliday && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Holiday" />}
                      {examCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Exam scheduled" />}
                      {classCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Classes scheduled" />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Sidebar (Selected Day Details & Upcoming) ─────── */}
        <div className="space-y-4">
          {/* Selected Day Drawer */}
          {selectedDay && (
            <div className="card-surface overflow-hidden border border-zinc-200 shadow-sm">
              {/* Drawer Header */}
              <div
                className={`px-4 py-3 border-b border-zinc-200 flex items-center justify-between ${
                  isSelectedFriday ? 'bg-rose-50/80 text-rose-900' : 'bg-emerald-50/80 text-emerald-900'
                }`}
              >
                <div>
                  <p className="font-bold text-sm">
                    {selectedDay.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {isSelectedFriday ? 'Weekly Holiday (শুক্রবার)' : 'Working Academic Day'}
                  </p>
                </div>
                {isSelectedFriday && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-md">
                    Weekend
                  </span>
                )}
              </div>

              <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
                {/* 1. Friday Weekly Holiday Banner */}
                {isSelectedFriday && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900">
                    <div className="w-8 h-8 rounded-lg bg-rose-200/70 flex items-center justify-center shrink-0">
                      <Sun size={18} className="text-rose-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Weekly Holiday (সাপ্তাহিক ছুটি)</h4>
                      <p className="text-xs text-rose-700 mt-0.5">
                        School and regular classes are closed on Friday.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Public / Calendar Holidays */}
                {selectedHolidays.filter((h) => !h.isWeeklyHoliday).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sun size={13} className="text-rose-600" />
                      Holidays
                    </p>
                    {selectedHolidays
                      .filter((h) => !h.isWeeklyHoliday)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-start justify-between gap-2 p-3 rounded-xl bg-rose-50/50 border border-rose-200"
                        >
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{ev.title}</p>
                            {ev.description && (
                              <p className="text-xs text-zinc-600 mt-0.5">{ev.description}</p>
                            )}
                          </div>
                          {ev.source === 'CALENDAR' && (
                            <button
                              onClick={() => deleteEvent(ev.id)}
                              className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Delete event"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* 3. Scheduled Exams */}
                {selectedExams.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy size={13} className="text-amber-600" />
                      Scheduled Exams ({selectedExams.length})
                    </p>
                    <div className="space-y-2">
                      {selectedExams.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-zinc-800 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-bold text-zinc-900">{ex.title}</p>
                            {ex.examScope ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                {ex.examScope}
                              </span>
                            ) : ex.source === 'ROUTINE' ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                Class Test
                              </span>
                            ) : null}
                          </div>

                          {ex.topic && (
                            <p className="text-xs font-semibold text-amber-900 bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                              📝 Topic: {ex.topic}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-zinc-600 flex-wrap">
                            {ex.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} className="text-amber-600" />
                                {ex.startTime} – {ex.endTime}
                              </span>
                            )}
                            {ex.room && (
                              <span className="flex items-center gap-1">
                                <MapPin size={11} className="text-amber-600" />
                                {ex.room}
                              </span>
                            )}
                            {ex.totalMarks !== undefined && ex.totalMarks !== null && (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-800">
                                Marks: {ex.totalMarks} {ex.passMarks ? `(Pass: ${ex.passMarks})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Class Routine Slots */}
                {selectedClasses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={13} className="text-blue-600" />
                      Class Routine ({selectedClasses.length} Slots)
                    </p>
                    <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden bg-white">
                      {selectedClasses
                        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                        .map((cls) => (
                          <div key={cls.id} className="p-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors">
                            <div className="w-12 text-center shrink-0 pt-0.5">
                              <span className="text-[11px] font-bold text-blue-600 block">
                                {cls.startTime}
                              </span>
                              <span className="text-[10px] text-zinc-400 block">{cls.endTime}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">
                                {cls.subjectName || cls.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 truncate">
                                {cls.className && <span>{cls.className}</span>}
                                {cls.teacherName && (
                                  <span className="flex items-center gap-1 text-zinc-600">
                                    <User size={10} /> {cls.teacherName}
                                  </span>
                                )}
                                {cls.room && (
                                  <span className="flex items-center gap-1 text-zinc-600">
                                    <MapPin size={10} /> {cls.room}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 5. Special Events */}
                {selectedEvents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-purple-600" />
                      Events
                    </p>
                    {selectedEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-start justify-between gap-2 p-3 rounded-xl bg-purple-50/60 border border-purple-200"
                      >
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{ev.title}</p>
                          {ev.description && (
                            <p className="text-xs text-zinc-600 mt-0.5">{ev.description}</p>
                          )}
                        </div>
                        {ev.source === 'CALENDAR' && (
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Delete event"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isSelectedFriday &&
                  selectedHolidays.length === 0 &&
                  selectedExams.length === 0 &&
                  selectedClasses.length === 0 &&
                  selectedEvents.length === 0 && (
                    <div className="text-center py-8 text-zinc-400">
                      <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30 text-emerald-500" />
                      <p className="text-sm font-medium">No special events or routine for this day</p>
                      <button
                        onClick={() => setAddModal(true)}
                        className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
                      >
                        + Add an event on this day
                      </button>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Upcoming Events Box */}
          <div className="card-surface overflow-hidden border border-zinc-200 shadow-sm">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
              <p className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                <CalendarDays size={15} className="text-emerald-600" />
                Upcoming Schedule
              </p>
              <span className="text-[11px] font-semibold text-zinc-500">
                {upcomingEvents.length} items
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-400">No upcoming events</div>
            ) : (
              <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto">
                {upcomingEvents.map((ev) => {
                  const cfg = TYPE_CFG[ev.type]
                  const Icon = cfg.icon
                  const d = new Date(ev.date)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => goToDate(d)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 border`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{ev.title}</p>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <span>
                            {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          {ev.startTime && <span>· {ev.startTime}</span>}
                          {ev.className && <span>· {ev.className}</span>}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-4">
            <p className="text-xs font-bold text-zinc-700 mb-2.5">Calendar Legend</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Friday Weekly Off</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Public Holidays</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Exams &amp; Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Class Routine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>School Events</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Event Modal ─────────────────────────────────── */}
      {addModal && (
        <AddEventModal
          initialDate={selectedDay ? formatDateStr(selectedDay) : undefined}
          onClose={() => setAddModal(false)}
          onSave={(ev) => {
            addEvent(ev)
            setAddModal(false)
          }}
        />
      )}
    </div>
  )
}

// ── Add Event Modal ───────────────────────────────────────────────────────────

function AddEventModal({
  initialDate,
  onClose,
  onSave,
}: {
  initialDate?: string
  onClose: () => void
  onSave: (ev: {
    title: string
    date: string
    endDate?: string
    type: 'HOLIDAY' | 'EVENT' | 'EXAM'
    description?: string
  }) => void
}) {
  const [form, setForm] = useState({
    title: '',
    date: initialDate || formatDateStr(new Date()),
    endDate: '',
    type: 'HOLIDAY' as 'HOLIDAY' | 'EVENT' | 'EXAM',
    description: '',
  })

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarDays size={18} />
            </div>
            <h2 className="font-bold text-zinc-900">Add Academic Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (form.title && form.date) onSave(form)
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Event Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Annual Sports Day or Special Holiday"
              required
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['HOLIDAY', 'EXAM', 'EVENT'] as const).map((t) => {
                const cfg = TYPE_CFG[t]
                const Icon = cfg.icon
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      form.type === t
                        ? `${cfg.bg} ring-2 ring-current/20`
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <Icon size={14} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                End Date (Multi-day)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                min={form.date}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Description (Optional)
            </label>
            <input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. Venue, timing details or instructions..."
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-xl hover:brightness-105 shadow-md shadow-emerald-500/20 transition-all"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
