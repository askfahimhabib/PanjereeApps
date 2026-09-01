import { routineStore, leaveStore, salaryStore, sectionStore, classStore } from '@/data/stores'
import type { Teacher } from '../types'
import type { DayOfWeek } from '@/features/routines/types'

const DAY_MAP: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export interface TeacherWorkloadInfo {
  weeklyClasses: number
  todayClasses: number
  assignedSubjects: string[]
}

/**
 * Derives real-time weekly class workload from routineStore
 */
export function getTeacherWorkload(teacherId: string): TeacherWorkloadInfo {
  if (!teacherId) return { weeklyClasses: 0, todayClasses: 0, assignedSubjects: [] }

  const todayIndex = new Date().getDay()
  const todayDayName = DAY_MAP[todayIndex]

  const activeRoutines = routineStore.getWhere(
    r => Boolean((r.teacher_id === teacherId || r.teachers?.id === teacherId) && r.is_active !== false)
  )

  const weeklyClasses = activeRoutines.filter(r => r.entry_type === 'CLASS' || !r.entry_type).length
  const todayClasses = activeRoutines.filter(r => r.day === todayDayName && (r.entry_type === 'CLASS' || !r.entry_type)).length

  // Collect distinct subject names
  const subjectNames = Array.from(
    new Set(
      activeRoutines
        .map(r => r.subjects?.name)
        .filter((name): name is string => Boolean(name))
    )
  )

  return {
    weeklyClasses,
    todayClasses,
    assignedSubjects: subjectNames,
  }
}

/**
 * Checks if teacher is on approved leave today
 */
export function getTeacherTodayLeaveStatus(teacherId: string): { isOnLeave: boolean; reason?: string } {
  if (!teacherId) return { isOnLeave: false }

  const todayStr = new Date().toISOString().split('T')[0]
  const leaves = leaveStore.getWhere(
    l => l.applicantId === teacherId && l.applicantType === 'TEACHER' && l.status === 'APPROVED' && l.fromDate <= todayStr && l.toDate >= todayStr
  )

  if (leaves.length > 0) {
    return { isOnLeave: true, reason: leaves[0].reason }
  }

  return { isOnLeave: false }
}

/**
 * Checks if teacher is an assigned Class Teacher for any section
 */
export function getTeacherClassTeacherAssignment(teacher: Teacher): {
  isClassTeacher: boolean
  classLabel?: string
} {
  // Check in teacher assignments
  const ctAssignment = teacher.assignments?.find(a => a.isClassTeacher)
  if (ctAssignment) {
    const cls = classStore.getOne(ctAssignment.classId)
    const sec = ctAssignment.sectionId ? sectionStore.getOne(ctAssignment.sectionId) : null
    const label = `${cls?.name || 'Class'} ${sec?.name ? `(${sec.name})` : ''}`
    return { isClassTeacher: true, classLabel: label.trim() }
  }

  // Also check sectionStore directly
  const ownedSection = sectionStore.getAll().find(s => (s as unknown as { classTeacherId?: string }).classTeacherId === teacher.id)
  if (ownedSection) {
    const cls = classStore.getOne(ownedSection.classId)
    return { isClassTeacher: true, classLabel: `${cls?.name || 'Class'} (${ownedSection.name})` }
  }

  return { isClassTeacher: false }
}

/**
 * Derives current month salary payment status from salaryStore
 */
export function getTeacherCurrentMonthSalary(teacherId: string): 'PAID' | 'PENDING' {
  if (!teacherId) return 'PENDING'

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const record = salaryStore.getAll().find(
    s => s.teacherId === teacherId && s.month === currentMonth && s.year === currentYear && s.status === 'PAID'
  )

  return record ? 'PAID' : 'PENDING'
}
