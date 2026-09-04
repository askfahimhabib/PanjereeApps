import type { AttendanceSummary, PaymentSummary } from './types'

export const MOCK_ATTENDANCE_SUMMARY: AttendanceSummary = {
  totalDays: 0,
  avgAttendanceRate: 0,
  avgPresent: 0,
  avgAbsent: 0,
  bestDay: '',
  worstDay: '',
  daily: [],
  byClass: [],
  chronicAbsentList: [],
  teacherAttendance: {
    totalTeachers: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    rateToday: 0,
  },
}

export const MOCK_PAYMENT_SUMMARY: PaymentSummary = {
  totalCollected: 0,
  totalOutstandingDues: 0,
  totalExpenses: 0,
  netBalance: 0,
  totalTransactions: 0,
  avgPerTransaction: 0,
  topMethod: 'CASH',
  monthly: [],
  byFeeType: [],
  byMethod: [],
  studentDuesList: [],
  expenseCategories: [],
}
