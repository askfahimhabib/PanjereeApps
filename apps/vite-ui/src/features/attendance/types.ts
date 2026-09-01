// ============================================================
//  Attendance & Leaves Module — TypeScript Definitions
// ============================================================

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'
export type TeacherAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY'

// ─── Student Daily Attendance Record ───────────────────────────
export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string // denormalized for quick display
  rollNumber: string
  classId: string
  sectionId: string
  date: string // YYYY-MM-DD
  status: AttendanceStatus
  timeIn?: string // e.g. "08:15 AM"
  lateMinutes?: number
  note?: string
  leaveReason?: string
  markedAt: string // ISO timestamp
  markedBy: string // teacher/admin id or name
}

// ─── Teacher Daily Attendance Record ───────────────────────────
export interface TeacherAttendanceRecord {
  id: string
  teacherId: string
  teacherName: string
  teacherPhoto?: string
  department: string
  designation: string
  shift: 'MORNING' | 'DAY' | 'EVENING'
  date: string // YYYY-MM-DD
  status: TeacherAttendanceStatus
  timeIn?: string // e.g. "08:25 AM"
  timeOut?: string // e.g. "04:30 PM"
  lateMinutes?: number
  note?: string
  markedAt: string
  markedBy: string
}

// ─── Teacher Annual Leave Balance ──────────────────────────────
export interface TeacherLeaveBalance {
  id: string
  teacherId: string
  casualLeaveTotal: number // e.g. 14
  casualLeaveUsed: number
  sickLeaveTotal: number // e.g. 14
  sickLeaveUsed: number
  earnedLeaveTotal: number // e.g. 10
  earnedLeaveUsed: number
}

// ─── At-Risk Low Attendance Student ────────────────────────────
export interface AtRiskStudent {
  studentId: string
  studentName: string
  rollNumber: string
  classId: string
  className: string
  sectionId: string
  sectionName: string
  totalSchoolDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  leaveDays: number
  attendanceRate: number // percentage
  guardianName?: string
  guardianMobile?: string
}

// ─── Display Helpers ───────────────────────────────────────────
export const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string
    shortLabel: string
    color: string
    bg: string
    border: string
    btnActive: string
    badgeCls: string
  }
> = {
  PRESENT: {
    label: 'Present',
    shortLabel: 'P',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    btnActive: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  ABSENT: {
    label: 'Absent',
    shortLabel: 'A',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    btnActive: 'bg-rose-600 text-white border-rose-600 shadow-xs',
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  LATE: {
    label: 'Late',
    shortLabel: 'L',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    btnActive: 'bg-amber-500 text-white border-amber-500 shadow-xs',
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  LEAVE: {
    label: 'Leave',
    shortLabel: 'LV',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    btnActive: 'bg-indigo-600 text-white border-indigo-600 shadow-xs',
    badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
}

export const TEACHER_STATUS_CONFIG: Record<
  TeacherAttendanceStatus,
  {
    label: string
    color: string
    bg: string
    border: string
    btnActive: string
  }
> = {
  PRESENT: {
    label: 'Present',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    btnActive: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
  },
  LATE: {
    label: 'Late',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    btnActive: 'bg-amber-500 text-white border-amber-500 shadow-xs',
  },
  ABSENT: {
    label: 'Absent',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    btnActive: 'bg-rose-600 text-white border-rose-600 shadow-xs',
  },
  LEAVE: {
    label: 'On Leave',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    btnActive: 'bg-indigo-600 text-white border-indigo-600 shadow-xs',
  },
  HALF_DAY: {
    label: 'Half Day',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    btnActive: 'bg-purple-600 text-white border-purple-600 shadow-xs',
  },
}

export const ALL_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE']

// ─── Summary Metrics ───────────────────────────────────────────
export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  leave: number
  unmarked: number
  attendanceRate: number // percentage
}

export interface AttendanceHubKPI {
  todayAttendanceRate: number
  todayStudentsPresent: number
  todayStudentsTotal: number
  todayStudentsAbsent: number
  todayStudentsOnLeave: number
  todayTeachersPresent: number
  todayTeachersTotal: number
  todayTeachersOnLeave: number
  pendingLeavesCount: number
}
