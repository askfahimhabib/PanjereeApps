import type { AttendanceSummary, PaymentSummary, StudentProgressSummary } from './types'
import { MONTH_NAMES_SHORT } from '../payments/types'

// ─── Attendance Mock Data ─────────────────────────────────────────────────────

function genDailyAttendance() {
  const days: AttendanceSummary['daily'] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) continue // skip Fri/Sat
    const total = 85 + Math.floor(Math.random() * 10)
    const absent = Math.floor(Math.random() * 15)
    const late = Math.floor(Math.random() * 5)
    const present = total - absent - late
    days.push({
      date: d.toISOString().split('T')[0],
      present,
      absent,
      late,
      total,
    })
  }
  return days
}

const daily = genDailyAttendance()
const avgPresent = Math.round(daily.reduce((s, d) => s + d.present, 0) / daily.length)
const avgAbsent = Math.round(daily.reduce((s, d) => s + d.absent, 0) / daily.length)

export const MOCK_ATTENDANCE_SUMMARY: AttendanceSummary = {
  totalDays: daily.length,
  avgPresent,
  avgAbsent,
  bestDay: daily.sort((a, b) => b.present - a.present)[0]?.date ?? '',
  worstDay: daily.sort((a, b) => a.present - b.present)[0]?.date ?? '',
  daily: genDailyAttendance(), // re-generate in order
  byClass: [
    { className: 'Class 10', presentPct: 91 },
    { className: 'Class 9',  presentPct: 87 },
    { className: 'Class 11', presentPct: 85 },
    { className: 'Class 8',  presentPct: 88 },
    { className: 'Class 12', presentPct: 83 },
    { className: 'SSC Batch 2025', presentPct: 94 },
    { className: 'HSC Batch 2025', presentPct: 90 },
  ],
}

// ─── Payment Mock Data ────────────────────────────────────────────────────────

export const MOCK_PAYMENT_SUMMARY: PaymentSummary = {
  totalCollected: 485000,
  totalTransactions: 312,
  avgPerTransaction: 1554,
  topMethod: 'CASH',
  monthly: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES_SHORT[i],
    year: 2024,
    total: 30000 + Math.floor(Math.random() * 30000),
    count: 20 + Math.floor(Math.random() * 20),
  })),
  byFeeType: [
    { type: 'TUITION',     label: 'Tuition Fee',    total: 320000 },
    { type: 'EXAM',        label: 'Exam Fee',        total: 68000  },
    { type: 'ADMISSION',   label: 'Admission Fee',   total: 45000  },
    { type: 'DEVELOPMENT', label: 'Development Fee', total: 32000  },
    { type: 'TRANSPORT',   label: 'Transport Fee',   total: 12000  },
    { type: 'LIBRARY',     label: 'Library Fee',     total: 8000   },
  ],
}

// ─── Student Progress Mock Data ───────────────────────────────────────────────

export const MOCK_STUDENT_PROGRESS: StudentProgressSummary[] = [
  {
    studentId: '1',
    studentName: 'Rahim Uddin',
    className: 'Class 10',
    totalExams: 4,
    avgGpa: 4.25,
    bestGrade: 'A+',
    trend: 'UP',
    exams: [
      {
        examName: 'Monthly Test – January',
        examScope: 'MONTHLY',
        date: '2024-01-25',
        subjectResults: [
          { subject: 'Bangla', marks: 72, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'English', marks: 65, total: 100, grade: 'A-', gpa: 3.50 },
          { subject: 'Math', marks: 80, total: 100, grade: 'A+', gpa: 5.00 },
        ],
        avgGpa: 4.17,
        overallGrade: 'A',
      },
      {
        examName: 'Monthly Test – February',
        examScope: 'MONTHLY',
        date: '2024-02-25',
        subjectResults: [
          { subject: 'Bangla', marks: 78, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'English', marks: 70, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'Math', marks: 85, total: 100, grade: 'A+', gpa: 5.00 },
        ],
        avgGpa: 4.33,
        overallGrade: 'A',
      },
      {
        examName: 'Monthly Test – March',
        examScope: 'MONTHLY',
        date: '2024-03-25',
        subjectResults: [
          { subject: 'Bangla', marks: 82, total: 100, grade: 'A+', gpa: 5.00 },
          { subject: 'English', marks: 75, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'Math', marks: 88, total: 100, grade: 'A+', gpa: 5.00 },
        ],
        avgGpa: 4.67,
        overallGrade: 'A+',
      },
      {
        examName: 'Half-Yearly Exam 2024',
        examScope: 'HALF_YEARLY',
        date: '2024-06-15',
        subjectResults: [
          { subject: 'Bangla', marks: 85, total: 100, grade: 'A+', gpa: 5.00 },
          { subject: 'English', marks: 79, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'Math', marks: 90, total: 100, grade: 'A+', gpa: 5.00 },
          { subject: 'Science', marks: 76, total: 100, grade: 'A', gpa: 4.00 },
        ],
        avgGpa: 4.50,
        overallGrade: 'A+',
      },
    ],
  },
  {
    studentId: '2',
    studentName: 'Sadia Islam',
    className: 'Class 10',
    totalExams: 4,
    avgGpa: 3.80,
    bestGrade: 'A',
    trend: 'STABLE',
    exams: [
      {
        examName: 'Monthly Test – January',
        examScope: 'MONTHLY',
        date: '2024-01-25',
        subjectResults: [
          { subject: 'Bangla', marks: 65, total: 100, grade: 'A-', gpa: 3.50 },
          { subject: 'English', marks: 70, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'Math', marks: 60, total: 100, grade: 'A-', gpa: 3.50 },
        ],
        avgGpa: 3.67,
        overallGrade: 'A-',
      },
      {
        examName: 'Half-Yearly Exam 2024',
        examScope: 'HALF_YEARLY',
        date: '2024-06-15',
        subjectResults: [
          { subject: 'Bangla', marks: 70, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'English', marks: 72, total: 100, grade: 'A', gpa: 4.00 },
          { subject: 'Math', marks: 68, total: 100, grade: 'A-', gpa: 3.50 },
          { subject: 'Science', marks: 71, total: 100, grade: 'A', gpa: 4.00 },
        ],
        avgGpa: 3.88,
        overallGrade: 'A',
      },
    ],
  },
]
