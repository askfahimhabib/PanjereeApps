import type { Student } from '@/features/students/types'
import type { Routine } from '@/features/routines/types'

export type DashboardTab = 'all' | 'academic' | 'finance' | 'staff'

export interface DashboardKpis {
  // Students
  totalStudents: number
  maleStudents: number
  femaleStudents: number
  capacityTotal: number
  capacityUtilization: number
  newAdmissionsThisMonth: number

  // Teachers & Staff
  totalTeachers: number
  teachersOnDutyToday: number
  teachersOnLeaveToday: number
  pendingLeaveCount: number

  // Attendance
  todayAttendanceRate: number | null
  todayPresentCount: number
  todayAbsentCount: number
  todayLateCount: number
  todayTotalCount: number
  todayTeacherAttendanceRate: number | null
  todayTeacherPresentCount: number
  todayTeacherTotalCount: number
  sevenDayAttendanceTrend: {
    dayLabel: string
    date: string
    presentRate: number
    presentCount: number
    totalCount: number
  }[]

  // Finance
  collectedThisMonth: number
  billedThisMonth: number
  collectionRate: number
  totalPendingDues: number
  defaulterStudentsCount: number
  expensesThisMonth: number
  salaryPaidThisMonth: number
  salaryTotalThisMonth: number
  netSurplusThisMonth: number

  // Academic
  totalClasses: number
  totalBatches: number
  upcomingExamsCount: number
  completedExamsCount: number
}

export interface DueStudentSummary {
  student: Student
  totalDue: number
  lastPaidDate?: string
  phone?: string
  guardianPhone?: string
  className?: string
  sectionName?: string
}

export interface TodayRoutineSlot {
  routine: Routine
  periodStatus: 'past' | 'ongoing' | 'upcoming'
  timeRemainingOrElapsed?: string
}

export interface DashboardAlert {
  id: string
  type: 'urgent' | 'warning' | 'info' | 'success'
  title: string
  message: string
  actionLabel?: string
  actionLink?: string
  onActionClick?: () => void
}
