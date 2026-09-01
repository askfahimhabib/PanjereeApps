import { useState, useMemo, useEffect } from 'react'
import {
  calendarStore,
  routineStore,
  examStore,
  subjectStore,
  teacherStore,
  classStore,
  sectionStore,
  batchStore,
} from '@/data/stores'
import { subscribeStores } from '@/lib/localStore'
import { EXAM_SCOPE_LABELS } from '@/features/examHeld/types'
import type { DayOfWeek } from '@/features/routines/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CalendarEventType = 'HOLIDAY' | 'EVENT' | 'EXAM' | 'CLASS'
export type CalendarFilterType = 'ALL' | CalendarEventType

export interface CalendarEvent {
  id: string
  title: string
  date: string       // YYYY-MM-DD
  endDate?: string   // for multi-day events
  type: CalendarEventType
  source: 'CALENDAR' | 'EXAM_HELD' | 'ROUTINE' | 'SYSTEM_HOLIDAY'
  description?: string
  startTime?: string
  endTime?: string
  room?: string | null
  teacherName?: string | null
  subjectName?: string | null
  className?: string | null
  batchName?: string | null
  classId?: string | null
  batchId?: string | null
  examScope?: string | null
  examStatus?: string | null
  totalMarks?: number | null
  passMarks?: number | null
  isWeeklyHoliday?: boolean
  topic?: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isInRange(day: Date, from: string, to?: string) {
  const dayStr = formatDateStr(day)
  if (!to || from === to) {
    return dayStr === from
  }
  return dayStr >= from && dayStr <= to
}

const DOW_NAMES: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCalendar() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<Date | null>(now)
  const [filterType, setFilterType] = useState<CalendarFilterType>('ALL')
  const [filterClassId, setFilterClassId] = useState<string>('ALL')
  const [filterBatchId, setFilterBatchId] = useState<string>('ALL')
  const [studentScope, setStudentScope] = useState<{
    enabled: boolean
    classId?: string
    batchId?: string
  }>({ enabled: false })

  // Version counter to force re-render on any store changes
  const [storeVersion, setStoreVersion] = useState(0)

  useEffect(() => {
    const unsub = subscribeStores(
      ['calendar-events', 'routines', 'exam_held', 'classes', 'subjects', 'teachers', 'batches'],
      () => setStoreVersion((v) => v + 1)
    )
    return unsub
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(today)
  }

  const goToDate = (d: Date) => {
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
    setSelectedDay(d)
  }

  // Days in current viewed month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const calDays: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]

  // ── Compute all synchronized calendar events for the viewed month ─────────────
  const allEvents = useMemo(() => {
    const items: CalendarEvent[] = []

    // 1. Static & User-added Calendar Holidays/Events
    const rawCalendarEvents = calendarStore.getAll()
    for (const ev of rawCalendarEvents) {
      items.push({
        id: ev.id,
        title: ev.title,
        date: ev.date,
        endDate: ev.endDate,
        type: ev.type,
        source: 'CALENDAR',
        description: ev.description,
      })
    }

    // 2. Automatic Weekly Friday Holidays for every Friday in the viewed month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d)
      if (dateObj.getDay() === 5) {
        // 5 = Friday in JS Date
        const dateStr = formatDateStr(dateObj)
        items.push({
          id: `fri-holiday-${dateStr}`,
          title: 'Weekly Holiday',
          date: dateStr,
          type: 'HOLIDAY',
          source: 'SYSTEM_HOLIDAY',
          description: 'Friday Weekly Holiday (সাপ্তাহিক ছুটি)',
          isWeeklyHoliday: true,
        })
      }
    }

    // 3. Exam Held & Scheduled Exams from examStore
    const allExams = examStore.getAll()
    for (const exam of allExams) {
      const schedules = exam.exam_held_schedules || []
      const className =
        exam.classes?.name ||
        (exam.class_id ? classStore.getOne(exam.class_id)?.name : null)
      const batchName =
        exam.batches?.name ||
        (exam.batch_id ? batchStore.getOne(exam.batch_id)?.name : null)
      const targetLabel = className || batchName || 'All Students'

      for (const s of schedules) {
        if (!s.date) continue
        const subjectObj = s.subjects?.name
          ? s.subjects
          : subjectStore.getOne(s.subject_id)
        const subjectName = subjectObj?.name || s.subject_id

        items.push({
          id: `exam-schedule-${s.id || exam.id + '-' + s.subject_id}`,
          title: `${exam.name}: ${subjectName}`,
          date: s.date,
          type: 'EXAM',
          source: 'EXAM_HELD',
          description: `${EXAM_SCOPE_LABELS[exam.scope] || exam.scope} • ${targetLabel}${
            s.room ? ' • Room: ' + s.room : ''
          }`,
          startTime: s.start_time,
          endTime: s.end_time,
          room: s.room,
          subjectName,
          className,
          batchName,
          classId: exam.class_id,
          batchId: exam.batch_id,
          examScope: exam.scope,
          examStatus: exam.status,
          totalMarks: s.total_marks ?? exam.total_marks,
          passMarks: s.pass_marks ?? exam.pass_marks,
        })
      }
    }

    // 4. Class Routines & Class Tests from routineStore
    const allRoutines = routineStore.getAll()
    for (const r of allRoutines) {
      if (!r.is_active) continue

      const subjectObj = r.subjects?.name ? r.subjects : (r.subject_id ? subjectStore.getOne(r.subject_id) : undefined)
      const subjectName = subjectObj?.name || ''
      const teacherObj = (r.teachers ?? (r.teacher_id ? teacherStore.getOne(r.teacher_id) : undefined)) as { fullName?: string; full_name?: string } | undefined
      const teacherName = teacherObj?.fullName || teacherObj?.full_name || null
      const classObj = r.classes?.name ? r.classes : (r.class_id ? classStore.getOne(r.class_id) : undefined)
      const className = classObj?.name || null
      const batchObj = r.batch_id ? batchStore.getOne(r.batch_id) : undefined
      const batchName = batchObj?.name || null
      const sectionObj = r.sections?.name ? r.sections : (r.section_id ? sectionStore.getOne(r.section_id) : undefined)
      const sectionName = sectionObj?.name || null

      // If specific date formal exam
      if (r.specific_date) {
        // Only include if not duplicate of ExamHeld schedule
        const isDup = items.some(
          (it) => it.date === r.specific_date && it.subjectName === subjectName
        )
        if (!isDup) {
          items.push({
            id: `routine-exam-${r.id}`,
            title: `${r.entry_type === 'CLASS_EXAM' ? 'Class Test' : 'Exam'}: ${subjectName}`,
            date: r.specific_date,
            type: 'EXAM',
            source: 'ROUTINE',
            description: `${className || batchName || ''}${r.room ? ' • ' + r.room : ''}`,
            startTime: r.start_time,
            endTime: r.end_time,
            room: r.room,
            subjectName,
            className,
            batchName,
            classId: r.class_id,
            batchId: r.batch_id,
          })
        }
        continue
      }

      // If recurring weekly day
      if (r.day) {
        const dowIndex = DOW_NAMES.indexOf(r.day)
        if (dowIndex === -1) continue

        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
          const dateObj = new Date(viewYear, viewMonth, dayNum)
          if (dateObj.getDay() === dowIndex) {
            const dateStr = formatDateStr(dateObj)

            if (r.entry_type === 'OFF_DAY') {
              // Only add if not Friday (Friday is already weekly holiday)
              if (dowIndex !== 5) {
                items.push({
                  id: `routine-off-${r.id}-${dateStr}`,
                  title: `Off Day (${className || 'School'})`,
                  date: dateStr,
                  type: 'HOLIDAY',
                  source: 'ROUTINE',
                  description: `No classes for ${className || 'students'}`,
                  className,
                  classId: r.class_id,
                  batchId: r.batch_id,
                })
              }
            } else if (r.entry_type === 'CLASS_EXAM') {
              items.push({
                id: `routine-test-${r.id}-${dateStr}`,
                title: `CT: ${subjectName} (${className || batchName || 'Class'})`,
                date: dateStr,
                type: 'EXAM',
                source: 'ROUTINE',
                description: `${className || batchName || ''}${sectionName ? ' Sec ' + sectionName : ''}${
                  r.room ? ' • ' + r.room : ''
                }${teacherName ? ' • ' + teacherName : ''}${r.topic ? ' • Topic: ' + r.topic : ''}`,
                startTime: r.start_time,
                endTime: r.end_time,
                room: r.room,
                teacherName,
                subjectName,
                className,
                batchName,
                classId: r.class_id,
                batchId: r.batch_id,
                topic: r.topic,
                totalMarks: r.total_marks,
              })
            } else {
              items.push({
                id: `routine-cls-${r.id}-${dateStr}`,
                title: `${subjectName} (${className || batchName || 'Class'})`,
                date: dateStr,
                type: 'CLASS',
                source: 'ROUTINE',
                description: `${className || batchName || ''}${sectionName ? ' (' + sectionName + ')' : ''}${
                  teacherName ? ' • ' + teacherName : ''
                }${r.room ? ' • ' + r.room : ''}`,
                startTime: r.start_time,
                endTime: r.end_time,
                room: r.room,
                teacherName,
                subjectName,
                className,
                batchName,
                classId: r.class_id,
                batchId: r.batch_id,
              })
            }
          }
        }
      }
    }

    return items
  }, [viewYear, viewMonth, daysInMonth, storeVersion])

  // Filter events by Type, Class, Batch, and Student Persona Scope
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      // Type Filter
      if (filterType !== 'ALL' && ev.type !== filterType) {
        return false
      }

      // Student Scope Restriction (if student mode active)
      if (studentScope.enabled) {
        const isGeneral = !ev.classId && !ev.batchId
        const matchesClass = Boolean(studentScope.classId && ev.classId === studentScope.classId)
        const matchesBatch = Boolean(studentScope.batchId && ev.batchId === studentScope.batchId)
        if (!isGeneral && !matchesClass && !matchesBatch) {
          return false
        }
      } else {
        // Admin Class Filter
        if (filterClassId !== 'ALL') {
          if (ev.classId && ev.classId !== filterClassId) {
            return false
          }
        }
        // Admin Batch Filter
        if (filterBatchId !== 'ALL') {
          if (ev.batchId && ev.batchId !== filterBatchId) {
            return false
          }
        }
      }

      return true
    })
  }, [allEvents, filterType, filterClassId, filterBatchId, studentScope])

  // Events for viewed month
  const monthEvents = useMemo(() => {
    return filteredEvents.filter((e) => {
      const d = new Date(e.date)
      return (
        (d.getFullYear() === viewYear && d.getMonth() === viewMonth) ||
        (e.endDate &&
          new Date(e.endDate).getFullYear() === viewYear &&
          new Date(e.endDate).getMonth() === viewMonth)
      )
    })
  }, [filteredEvents, viewYear, viewMonth])

  // Upcoming events (starting today onwards, sorted by date)
  const upcomingEvents = useMemo(() => {
    const todayStr = formatDateStr(now)
    return filteredEvents
      .filter((e) => {
        return (e.endDate || e.date) >= todayStr
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10)
  }, [filteredEvents, now])

  const getEventsForDay = (day: Date) => {
    return monthEvents.filter((e) => isInRange(day, e.date, e.endDate))
  }

  const selectedDayEvents = selectedDay
    ? filteredEvents.filter((e) => isInRange(selectedDay, e.date, e.endDate))
    : []

  const addEvent = (ev: {
    title: string
    date: string
    endDate?: string
    type: 'HOLIDAY' | 'EVENT' | 'EXAM'
    description?: string
  }) => {
    const newEv = {
      ...ev,
      id: `ev-${Date.now()}`,
    }
    calendarStore.insert(newEv)
    setStoreVersion((v) => v + 1)
  }

  const deleteEvent = (id: string) => {
    calendarStore.remove(id)
    setStoreVersion((v) => v + 1)
  }

  // Count summaries for tabs
  const typeCounts = useMemo(() => {
    const counts = { ALL: 0, HOLIDAY: 0, EXAM: 0, CLASS: 0, EVENT: 0 }
    for (const ev of filteredEvents) {
      counts.ALL++
      counts[ev.type] = (counts[ev.type] || 0) + 1
    }
    return counts
  }, [filteredEvents])

  return {
    now,
    viewYear,
    viewMonth,
    calDays,
    events: filteredEvents,
    allEvents,
    selectedDay,
    setSelectedDay,
    selectedDayEvents,
    filterType,
    setFilterType,
    filterClassId,
    setFilterClassId,
    filterBatchId,
    setFilterBatchId,
    studentScope,
    setStudentScope,
    monthEvents,
    upcomingEvents,
    typeCounts,
    prevMonth,
    nextMonth,
    goToToday,
    goToDate,
    getEventsForDay,
    addEvent,
    deleteEvent,
  }
}
