import { useState, useMemo } from 'react'
import { createStore } from '@/lib/localStore'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CalendarEventType = 'HOLIDAY' | 'EVENT' | 'EXAM'

export interface CalendarEvent {
  id: string
  title: string
  date: string       // YYYY-MM-DD
  endDate?: string   // for multi-day events
  type: CalendarEventType
  description?: string
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'ev-001', title: 'Eid-ul-Adha', date: '2025-06-06', endDate: '2025-06-08', type: 'HOLIDAY', description: 'National Holiday' },
  { id: 'ev-002', title: 'Annual Sports Day', date: '2025-08-15', type: 'EVENT', description: 'School ground' },
  { id: 'ev-003', title: 'Half-yearly Exams Start', date: '2025-08-20', endDate: '2025-08-28', type: 'EXAM', description: 'At 10 AM' },
  { id: 'ev-004', title: 'Independence Day', date: '2025-03-26', type: 'HOLIDAY', description: 'National Holiday' },
  { id: 'ev-005', title: 'Annual Exam', date: '2025-11-15', endDate: '2025-11-25', type: 'EXAM', description: 'Annual Assessment' },
  { id: 'ev-006', title: 'Victory Day', date: '2025-12-16', type: 'HOLIDAY', description: 'National Holiday' },
  { id: 'ev-007', title: 'Foundation Day', date: '2025-09-10', type: 'EVENT', description: '25th Anniversary of School' },
]

// ── Store ─────────────────────────────────────────────────────────────────────

const calendarStore = createStore<CalendarEvent>('calendar-events')
calendarStore.seed(MOCK_EVENTS)

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function isInRange(day: Date, from: string, to?: string) {
  const d = day.getTime()
  const f = new Date(from).getTime()
  const t = to ? new Date(to).getTime() : f
  return d >= f && d <= t
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCalendar() {
  const now = new Date()
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [events, setEvents]       = useState<CalendarEvent[]>(() => calendarStore.getAll())
  const [selectedDay, setSelectedDay]   = useState<Date | null>(null)
  const [filterType, setFilterType]     = useState<CalendarEventType | 'ALL'>('ALL')

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const calDays: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]

  // Events for this month
  const monthEvents = useMemo(() =>
    events.filter(e => {
      const d = new Date(e.date)
      return (d.getFullYear() === viewYear && d.getMonth() === viewMonth) ||
             (e.endDate && new Date(e.endDate).getFullYear() === viewYear && new Date(e.endDate).getMonth() === viewMonth)
    }), [events, viewYear, viewMonth])

  // Upcoming events (sorted by date, filtered by type)
  const upcomingEvents = useMemo(() =>
    events
      .filter(e => new Date(e.date) >= now && (filterType === 'ALL' || e.type === filterType))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8),
  [events, filterType]) // eslint-disable-line react-hooks/exhaustive-deps

  const getEventsForDay = (day: Date) => monthEvents.filter(e => isInRange(day, e.date, e.endDate))
  const selectedDayEvents = selectedDay ? events.filter(e => isInRange(selectedDay, e.date, e.endDate)) : []

  const addEvent = (ev: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = { ...ev, id: `ev-${Date.now()}` }
    calendarStore.insert(newEv)
    setEvents(prev => [...prev, newEv])
  }

  const deleteEvent = (id: string) => {
    calendarStore.remove(id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return {
    now, viewYear, viewMonth,
    calDays, events,
    selectedDay, setSelectedDay,
    selectedDayEvents,
    filterType, setFilterType,
    monthEvents, upcomingEvents,
    prevMonth, nextMonth,
    getEventsForDay,
    addEvent, deleteEvent,
  }
}
