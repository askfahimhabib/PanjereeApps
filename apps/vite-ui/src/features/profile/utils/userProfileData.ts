import {
  studentStore,
  teacherStore,
  routineStore,
  manualDueStore,
  paymentStore,
  attendanceStore,
  teacherAttendanceStore,
  teacherSalarySettingStore,
  examStore,
} from '@/data/stores'
import { examResultStore } from '@/features/examHeld/hooks/useExamResults'
import type { ExamResult } from '@/features/examHeld/types'

// Clean up any previously created synthetic entries or old seeds from local storage
if (typeof window !== 'undefined') {
  try {
    const rawExam = localStorage.getItem('lms_store_exam_results')
    if (
      rawExam &&
      (rawExam.includes('syn-') ||
        rawExam.includes('res-1-') ||
        rawExam.includes('res-2-') ||
        rawExam.includes('res-10-') ||
        rawExam.includes('res-21-') ||
        rawExam.includes('res-22-') ||
        rawExam.includes('exam-001'))
    ) {
      localStorage.removeItem('lms_store_exam_results')
    }
    const rawAtt = localStorage.getItem('lms_store_attendance')
    if (rawAtt && rawAtt.includes('att-syn-')) {
      const parsed = JSON.parse(rawAtt) as any[]
      const cleaned = parsed.filter((p) => !p.id.startsWith('att-syn-'))
      localStorage.setItem('lms_store_attendance', JSON.stringify(cleaned))
    }
  } catch {
    // ignore
  }
}

// ── Helper: Grade Calculation ──────────────────────────────────
export function getGradeFromGpa(gpa: number): string {
  if (gpa >= 5.0) return 'A+'
  if (gpa >= 4.0) return 'A'
  if (gpa >= 3.5) return 'A-'
  if (gpa >= 3.0) return 'B'
  if (gpa >= 2.0) return 'C'
  if (gpa >= 1.0) return 'D'
  return 'F'
}

// ── 1. Student Academic & Exam Results ─────────────────────────
export interface StudentAcademicSummary {
  hasResults: boolean
  gpa: number
  grade: string
  standingText: string
  totalMarksObtained: number
  totalMarksPossible: number
  percentage: number
  totalExams: number
  passedExams: number
  examHistory: {
    examId: string
    examName: string
    date: string
    totalMarks: number
    obtainedMarks: number
    percentage: number
    gpa: number
    grade: string
    status: 'PASSED' | 'FAILED'
    results: ExamResult[]
  }[]
}

export function getStudentAcademicMetrics(studentId: string): StudentAcademicSummary {
  const results = examResultStore.getWhere(r => r.student_id === studentId)
  const allExams = examStore.getAll()

  if (results.length === 0) {
    return {
      hasResults: false,
      gpa: 0,
      grade: '—',
      standingText: 'Not Published Yet',
      totalMarksObtained: 0,
      totalMarksPossible: 0,
      percentage: 0,
      totalExams: 0,
      passedExams: 0,
      examHistory: [],
    }
  }

  // Group by exam
  const examMap = new Map<string, ExamResult[]>()
  for (const r of results) {
    if (!examMap.has(r.exam_held_id)) {
      examMap.set(r.exam_held_id, [])
    }
    examMap.get(r.exam_held_id)!.push(r)
  }

  const examHistory = Array.from(examMap.entries()).map(([examId, resList]) => {
    const exam = allExams.find(e => e.id === examId)
    const presentList = resList.filter(r => !r.is_absent && r.marks_obtained !== null)
    const totalObtained = presentList.reduce((sum, r) => sum + (r.marks_obtained ?? 0), 0)
    const schedules = exam?.exam_held_schedules ?? []
    const totalPossible = schedules.reduce((sum, s) => sum + (s.total_marks ?? 100), 0) || (resList.length * 100)
    const percentage = totalPossible > 0 ? Number(((totalObtained / totalPossible) * 100).toFixed(1)) : 0
    const hasFail = resList.some(r => r.is_absent || r.grade === 'F')
    const gpaSum = resList.reduce((sum, r) => sum + (r.gpa ?? 0), 0)
    const avgGpa = resList.length > 0 ? (hasFail ? 0.0 : Number((gpaSum / resList.length).toFixed(2))) : 0.0
    const grade = hasFail ? 'F' : getGradeFromGpa(avgGpa)

    return {
      examId,
      examName: exam?.name || 'Semester Examination',
      date: exam?.created_at
        ? new Date(exam.created_at).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' })
        : '2026',
      totalMarks: totalPossible,
      obtainedMarks: totalObtained,
      percentage,
      gpa: avgGpa,
      grade,
      status: hasFail ? ('FAILED' as const) : ('PASSED' as const),
      results: resList,
    }
  })

  const totalPossible = examHistory.reduce((s, e) => s + e.totalMarks, 0)
  const totalObtained = examHistory.reduce((s, e) => s + e.obtainedMarks, 0)
  const totalPercentage = totalPossible > 0 ? Number(((totalObtained / totalPossible) * 100).toFixed(1)) : 0
  const avgCumulativeGpa =
    examHistory.length > 0
      ? Number((examHistory.reduce((s, e) => s + e.gpa, 0) / examHistory.length).toFixed(2))
      : 0.0

  const overallGrade = getGradeFromGpa(avgCumulativeGpa)
  const standingText =
    avgCumulativeGpa >= 4.8 ? 'Top Tier Distinction (A+)'
    : avgCumulativeGpa >= 4.0 ? 'High Honors (A)'
    : avgCumulativeGpa >= 3.5 ? 'Good Standing (A-)'
    : 'Standard Progress'

  return {
    hasResults: true,
    gpa: avgCumulativeGpa,
    grade: overallGrade,
    standingText,
    totalMarksObtained: totalObtained,
    totalMarksPossible: totalPossible,
    percentage: totalPercentage,
    totalExams: examHistory.length,
    passedExams: examHistory.filter(e => e.status === 'PASSED').length,
    examHistory,
  }
}

// ── 2. Student Attendance Metrics ──────────────────────────────
export interface StudentAttendanceSummary {
  hasRecords: boolean
  rate: number
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  leaveDays: number
  statusText: string
  records: any[]
}

export function getStudentAttendanceMetrics(studentId: string): StudentAttendanceSummary {
  const records = attendanceStore.getWhere(r => r.studentId === studentId)

  if (records.length === 0) {
    return {
      hasRecords: false,
      rate: 0,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      statusText: 'No Attendance Logged Yet',
      records: [],
    }
  }

  const totalDays = records.length
  const presentDays = records.filter(r => r.status === 'PRESENT').length
  const absentDays = records.filter(r => r.status === 'ABSENT').length
  const lateDays = records.filter(r => r.status === 'LATE').length
  const leaveDays = records.filter(r => r.status === 'LEAVE').length

  const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  const statusText =
    rate >= 90 ? 'Outstanding Attendance'
    : rate >= 75 ? 'Regular Attendance'
    : 'Attendance Below Target'

  return {
    hasRecords: true,
    rate,
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    leaveDays,
    statusText,
    records,
  }
}

// ── 3. Student Financial & Fee Metrics ─────────────────────────
export interface StudentFinancialSummary {
  totalBilled: number
  totalPaid: number
  totalDue: number
  status: 'CLEARED' | 'DUE' | 'PARTIAL'
  statusLabel: string
}

export function getStudentFinancialMetrics(studentId: string): StudentFinancialSummary {
  const unpaidDues = manualDueStore.getWhere(d => d.student_id === studentId && !d.is_paid)
  const totalDue = unpaidDues.reduce((sum, d) => sum + d.amount, 0)

  const payments = paymentStore.getWhere(p => p.student_id === studentId && p.status !== 'REFUNDED')
  const totalPaid = payments.reduce((sum, p) => sum + p.total_amount, 0)
  const totalBilled = totalPaid + totalDue

  const status = totalDue === 0 ? 'CLEARED' : totalPaid > 0 ? 'PARTIAL' : 'DUE'
  const statusLabel =
    status === 'CLEARED' ? 'Cleared ✓'
    : `৳${totalDue.toLocaleString()} Due`

  return {
    totalBilled,
    totalPaid,
    totalDue,
    status,
    statusLabel,
  }
}

// ── 4. Teacher Faculty Metrics ─────────────────────────────────
export interface TeacherFacultySummary {
  weeklyRoutineCount: number
  baseSalary: number
  attendanceRate: number
  assignedDept: string
  designationText: string
  totalClasses: number
}

export function getTeacherFacultyMetrics(teacherId: string): TeacherFacultySummary {
  const teacher = teacherStore.getOne(teacherId) || teacherStore.getAll().find(t => t.id === teacherId)
  const routines = routineStore.getWhere(r => r.teacher_id === teacherId)
  const salarySetting = teacherSalarySettingStore.getAll().find(s => s.teacher_id === teacherId)
  const attRecords = teacherAttendanceStore.getWhere(r => r.teacherId === teacherId)

  const baseSalary = salarySetting?.base_salary || 28000
  const attendanceRate =
    attRecords.length > 0
      ? Math.round((attRecords.filter(r => r.status === 'PRESENT').length / attRecords.length) * 100)
      : 98

  return {
    weeklyRoutineCount: routines.length > 0 ? routines.length : 0,
    baseSalary,
    attendanceRate,
    assignedDept: teacher?.department?.replace(/_/g, ' ') || 'General Faculty',
    designationText: teacher?.designation?.replace(/_/g, ' ') || 'Faculty Member',
    totalClasses: routines.length > 0 ? new Set(routines.map(r => r.class_id)).size : 0,
  }
}

// ── 5. Admin Institutional Metrics ────────────────────────────
export interface AdminInstitutionalSummary {
  totalStudents: number
  activeTeachers: number
  totalRevenue: number
  overallAttendanceToday: number
  academicYear: string
  systemRole: string
}

export function getAdminInstitutionMetrics(): AdminInstitutionalSummary {
  const students = studentStore.getAll()
  const teachers = teacherStore.getAll()
  const allPayments = paymentStore.getAll().filter(p => p.status !== 'REFUNDED')
  const totalRevenue = allPayments.reduce((sum, p) => sum + p.total_amount, 0)

  return {
    totalStudents: students.length,
    activeTeachers: teachers.length,
    totalRevenue,
    overallAttendanceToday: 94,
    academicYear: '2026 Academic Year',
    systemRole: 'Super Administrator',
  }
}
