// ─── Report Filter Types ─────────────────────────────────────────────────────

export interface DateRange {
  from: string // YYYY-MM-DD
  to: string   // YYYY-MM-DD
}

export interface ReportFilter {
  dateRange: DateRange
  classId: string | null
  batchId: string | null
  studentId: string | null
}

// ─── Attendance Report ────────────────────────────────────────────────────────

export interface DailyAttendance {
  date: string        // YYYY-MM-DD
  present: number
  absent: number
  late: number
  total: number
}

export interface AttendanceSummary {
  totalDays: number
  avgPresent: number
  avgAbsent: number
  bestDay: string
  worstDay: string
  daily: DailyAttendance[]
  byClass: { className: string; presentPct: number }[]
}

// ─── Payment Report ───────────────────────────────────────────────────────────

export interface MonthlyCollection {
  month: number      // 1-12
  monthName: string
  year: number
  total: number
  count: number
}

export interface PaymentSummary {
  totalCollected: number
  totalTransactions: number
  avgPerTransaction: number
  topMethod: string
  monthly: MonthlyCollection[]
  byFeeType: { type: string; label: string; total: number }[]
}

// ─── Student Progress Report ──────────────────────────────────────────────────

export interface ExamProgress {
  examName: string
  examScope: string
  date: string
  subjectResults: { subject: string; marks: number; total: number; grade: string; gpa: number }[]
  avgGpa: number
  overallGrade: string
}

export interface StudentProgressSummary {
  studentId: string
  studentName: string
  className: string
  totalExams: number
  avgGpa: number
  bestGrade: string
  trend: 'UP' | 'DOWN' | 'STABLE'
  exams: ExamProgress[]
}
