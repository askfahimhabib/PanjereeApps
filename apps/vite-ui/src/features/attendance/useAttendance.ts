import { useState, useMemo, useCallback } from 'react'
import { createStore } from '@/lib/localStore'
import type { AttendanceRecord, AttendanceStatus, AttendanceSummary } from './types'

// ─── Store ────────────────────────────────────────────────────

const store = createStore<AttendanceRecord>('attendance')

// ─── Helpers ─────────────────────────────────────────────────

export function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Hook ─────────────────────────────────────────────────────

/**
 * useAttendance(classId, sectionId, date)
 *
 * Manages attendance for a specific class+section on a specific date.
 * `draft` holds unsaved changes; call saveDraft() to persist.
 */
export function useAttendance(classId: string, sectionId: string, date: string) {

  // Load existing saved records for this class+section+date
  const saved = useMemo(() => {
    if (!classId || !sectionId || !date) return []
    return store.getWhere(
      r => r.classId === classId && r.sectionId === sectionId && r.date === date
    )
  }, [classId, sectionId, date])

  // Draft map: studentId → status (unsaved changes)
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {}
    for (const r of saved) map[r.studentId] = r.status
    return map
  })

  // When classId/sectionId/date changes, reload draft from saved
  const [prevKey, setPrevKey] = useState(`${classId}|${sectionId}|${date}`)
  const currentKey = `${classId}|${sectionId}|${date}`
  if (prevKey !== currentKey) {
    setPrevKey(currentKey)
    const map: Record<string, AttendanceStatus> = {}
    const fresh = store.getWhere(
      r => r.classId === classId && r.sectionId === sectionId && r.date === date
    )
    for (const r of fresh) map[r.studentId] = r.status
    setDraft(map)
  }

  // Mark a single student's status in the draft
  const markStudent = useCallback((studentId: string, status: AttendanceStatus) => {
    setDraft(prev => ({ ...prev, [studentId]: status }))
  }, [])

  // Mark ALL students with the same status at once (quick-fill)
  const markAll = useCallback((status: AttendanceStatus, studentIds: string[]) => {
    setDraft(() => {
      const map: Record<string, AttendanceStatus> = {}
      for (const id of studentIds) map[id] = status
      return map
    })
  }, [])

  // Persist draft to localStore (upsert per student)
  const saveDraft = useCallback((
    studentIds: string[],
    markerName: string = 'Teacher'
  ) => {
    for (const studentId of studentIds) {
      const status = draft[studentId]
      if (!status) continue

      const existing = store.getWhere(
        r => r.classId === classId && r.sectionId === sectionId
          && r.date === date && r.studentId === studentId
      )[0]

      if (existing) {
        store.update(existing.id, { status, markedAt: new Date().toISOString() })
      } else {
        store.insert({
          id: crypto.randomUUID(),
          studentId,
          studentName: '',      // caller should pass a proper name — filled in page
          rollNumber: '',
          classId,
          sectionId,
          date,
          status,
          markedAt: new Date().toISOString(),
          markedBy: markerName,
        })
      }
    }
  }, [classId, sectionId, date, draft])

  return { draft, markStudent, markAll, saveDraft }
}

// ─── Summary helper (pure) ────────────────────────────────────

export function buildSummary(
  draft: Record<string, AttendanceStatus>,
  totalStudents: number
): AttendanceSummary {
  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 }
  for (const status of Object.values(draft)) counts[status]++
  return {
    total: totalStudents,
    present: counts.PRESENT,
    absent: counts.ABSENT,
    late: counts.LATE,
    leave: counts.LEAVE,
    unmarked: totalStudents - Object.keys(draft).length,
  }
}

// ─── Student attendance stats (for profile/drawer) ───────────

export function getStudentAttendanceStats(studentId: string) {
  const records = store.getWhere(r => r.studentId === studentId)
  const total = records.length
  if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, rate: 0 }
  const present = records.filter(r => r.status === 'PRESENT').length
  const absent  = records.filter(r => r.status === 'ABSENT').length
  const late    = records.filter(r => r.status === 'LATE').length
  return { total, present, absent, late, rate: Math.round((present / total) * 100) }
}
