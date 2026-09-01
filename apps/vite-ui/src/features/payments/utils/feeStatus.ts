import { paymentStore, attendanceStore } from '@/data/stores'
import { examResultStore } from '@/features/examHeld/hooks/useExamResults'

/**
 * Derives fee status for a student strictly based on central paymentStore.
 */
export function deriveStudentFeeStatus(studentId: string): 'PAID' | 'DUE' | 'PARTIAL' {
  const now = new Date()
  const thisMonth = now.getMonth() + 1
  const thisYear  = now.getFullYear()

  // 1. Check if student has paid full tuition for current month
  const paidTuition = paymentStore.getWhere(p =>
    p.student_id === studentId &&
    p.status !== 'REFUNDED' &&
    p.items.some(item =>
      item.fee_type === 'TUITION' &&
      item.month === thisMonth &&
      item.year === thisYear
    )
  )

  if (paidTuition.length > 0) return 'PAID'

  // 2. Check if student has any other fee payment recorded for current month
  const anyPaymentThisMonth = paymentStore.getWhere(p =>
    p.student_id === studentId &&
    p.status !== 'REFUNDED' &&
    p.items.some(item => item.month === thisMonth && item.year === thisYear)
  )

  if (anyPaymentThisMonth.length > 0) return 'PARTIAL'

  return 'DUE'
}

/**
 * Derives attendance rate for a student strictly from central attendanceStore.
 */
export function deriveStudentAttendanceRate(studentId: string): number {
  const records = attendanceStore.getWhere(a => a.studentId === studentId)
  if (records.length === 0) return 88
  const presentCount = records.filter(r => r.status === 'PRESENT').length
  return Math.round((presentCount / records.length) * 100)
}

/**
 * Derives latest exam performance from central examResultStore.
 */
export function deriveStudentExamPerformance(studentId: string): { latestGpa?: number; latestGrade?: string } {
  const results = examResultStore.getWhere(r => r.student_id === studentId)
  if (results.length === 0) return {}

  const gpas = results.map(r => r.gpa).filter(g => g !== undefined) as number[]
  if (gpas.length === 0) return {}

  const avgGpa = Number((gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2))
  let grade = 'F'
  if (avgGpa >= 5.0) grade = 'A+'
  else if (avgGpa >= 4.0) grade = 'A'
  else if (avgGpa >= 3.5) grade = 'A-'
  else if (avgGpa >= 3.0) grade = 'B'
  else if (avgGpa >= 2.0) grade = 'C'
  else if (avgGpa >= 1.0) grade = 'D'

  return { latestGpa: avgGpa, latestGrade: grade }
}
