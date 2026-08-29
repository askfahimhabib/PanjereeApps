import { useState } from 'react'
import { Plus, X, ChevronLeft, ChevronRight, CalendarDays, Sun, BookOpen, Trophy } from 'lucide-react'
import {
  useCalendar,
  isSameDay,
  type CalendarEvent,
  type CalendarEventType,
} from '@/features/calendar/useCalendar'

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<CalendarEventType, { label: string; bg: string; text: string; border: string; icon: typeof Sun; dotBg: string }> = {
  HOLIDAY: { label: 'Holiday', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: Sun,          dotBg: 'bg-red-500' },
  EVENT:   { label: 'Event',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   icon: CalendarDays, dotBg: 'bg-blue-500' },
  EXAM:    { label: 'Exam',    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Trophy,       dotBg: 'bg-orange-500' },
}

const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_BN = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ── Component ────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const {
    now, viewYear, viewMonth,
    calDays,
    selectedDay, setSelectedDay,
    selectedDayEvents,
    filterType, setFilterType,
    upcomingEvents,
    prevMonth, nextMonth,
    getEventsForDay,
    addEvent, deleteEvent,
  } = useCalendar()

  const [addModal, setAddModal] = useState(false)

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Academic Calendar</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage holidays, exams and special events</p>
        </div>
        <button onClick={() => setAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-teal-500/20 shrink-0">
          <Plus size={17} />
          New Event
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Calendar Grid ────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"><ChevronLeft size={18} /></button>
            <h2 className="font-bold text-zinc-900 text-lg">{MONTHS_BN[viewMonth]} {viewYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-zinc-100">
            {DAYS.map(d => (
              <div key={d} className={`py-2 text-center text-xs font-bold ${d === 'Fri' ? 'text-green-600' : d === 'Sat' ? 'text-red-500' : 'text-zinc-500'}`}>{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {calDays.map((day, i) => {
              if (!day) return <div key={i} className="h-20 border-b border-r border-zinc-50" />
              const dayEvents = getEventsForDay(day)
              const isToday   = isSameDay(day, now)
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              const isFriday   = day.getDay() === 5
              const isSaturday = day.getDay() === 6

              return (
                <div key={i} onClick={() => setSelectedDay(day)}
                  className={`h-20 border-b border-r border-zinc-50 p-1.5 cursor-pointer transition-colors hover:bg-zinc-50 ${isSelected ? 'bg-teal-50' : ''} ${isFriday ? 'bg-green-50/30' : ''} ${isSaturday ? 'bg-red-50/30' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isToday ? 'bg-teal-600 text-white' : isFriday ? 'text-green-600' : isSaturday ? 'text-red-500' : 'text-zinc-700'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => {
                      const cfg = TYPE_CFG[ev.type]
                      return (
                        <div key={ev.id} className={`text-[9px] font-medium px-1 py-0.5 rounded truncate ${cfg.bg} ${cfg.text}`}>
                          {ev.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && <div className="text-[9px] text-zinc-400 px-1">+{dayEvents.length - 2}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Selected day events */}
          {selectedDay && (
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 bg-teal-50">
                <p className="font-bold text-teal-800 text-sm">
                  {selectedDay.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              {selectedDayEvents.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-400">No events found</div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {selectedDayEvents.map(ev => {
                    const cfg = TYPE_CFG[ev.type]
                    const Icon = cfg.icon
                    return (
                      <div key={ev.id} className="flex items-start gap-3 p-4">
                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={14} className={cfg.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-800 text-sm">{ev.title}</p>
                          {ev.description && <p className="text-xs text-zinc-500 mt-0.5">{ev.description}</p>}
                        </div>
                        <button onClick={() => deleteEvent(ev.id)} className="p-1 rounded text-zinc-300 hover:text-red-500 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming events */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
              <p className="font-bold text-zinc-900 text-sm">Upcoming Events</p>
              <div className="flex gap-1">
                {(['ALL', 'HOLIDAY', 'EVENT', 'EXAM'] as const).map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all ${filterType === t ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-700'}`}>
                    {t === 'ALL' ? 'All' : TYPE_CFG[t as CalendarEventType].label}
                  </button>
                ))}
              </div>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-400">No upcoming events</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {upcomingEvents.map(ev => {
                  const cfg = TYPE_CFG[ev.type]
                  const Icon = cfg.icon
                  const d = new Date(ev.date)
                  return (
                    <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={15} className={cfg.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{ev.title}</p>
                        <p className="text-[11px] text-zinc-500">
                          {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {ev.endDate && ` — ${new Date(ev.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs font-bold text-zinc-700 mb-3">Legend</p>
            <div className="space-y-2">
              {(Object.keys(TYPE_CFG) as CalendarEventType[]).map(t => {
                const cfg = TYPE_CFG[t]
                return (
                  <div key={t} className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotBg}`} />
                    <span className="text-xs text-zinc-600">{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Modal ─────────────────────────────────────── */}
      {addModal && <AddEventModal onClose={() => setAddModal(false)} onSave={ev => { addEvent(ev); setAddModal(false) }} />}
    </div>
  )
}

// ── Add Event Modal ───────────────────────────────────────────────────────────

function AddEventModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (ev: Omit<CalendarEvent, 'id'>) => void
}) {
  const [form, setForm] = useState({ title: '', date: '', endDate: '', type: 'HOLIDAY' as CalendarEventType, description: '' })
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <CalendarDays size={18} className="text-teal-600" />
            </div>
            <h2 className="font-bold text-zinc-900">Add New Event</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (form.title && form.date) onSave(form) }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Event Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Annual Exam"
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_CFG) as CalendarEventType[]).map(t => {
                const cfg = TYPE_CFG[t]
                const Icon = cfg.icon
                return (
                  <button key={t} type="button" onClick={() => set('type', t)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.type === t ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-current/20` : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}>
                    <Icon size={15} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Start Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.date}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Description</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional..."
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
