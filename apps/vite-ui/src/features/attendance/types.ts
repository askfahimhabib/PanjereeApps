// ============================================================
//  Attendance Module — TypeScript Definitions
// ============================================================

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string   // denormalized for quick display
  rollNumber: string
  classId: string
  sectionId: string
  date: string          // YYYY-MM-DD
  status: AttendanceStatus
  note?: string
  markedAt: string      // ISO timestamp
  markedBy: string      // teacher/admin id or name
}

// ─── Display Helpers ──────────────────────────────────────────

export const STATUS_CONFIG: Record<AttendanceStatus, {
  label: string
  shortLabel: string
  color: string
  bg: string
  border: string
  btnActive: string
}> = {
  PRESENT: {
    label: 'Present',
    shortLabel: 'P',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    btnActive: 'bg-emerald-500 text-white border-emerald-500',
  },
  ABSENT: {
    label: 'Absent',
    shortLabel: 'A',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    btnActive: 'bg-red-500 text-white border-red-500',
  },
  LATE: {
    label: 'Late',
    shortLabel: 'L',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    btnActive: 'bg-amber-500 text-white border-amber-500',
  },
  LEAVE: {
    label: 'Leave',
    shortLabel: 'LV',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    btnActive: 'bg-blue-500 text-white border-blue-500',
  },
}

export const ALL_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE']

// ─── Summary ─────────────────────────────────────────────────

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  leave: number
  unmarked: number
}
