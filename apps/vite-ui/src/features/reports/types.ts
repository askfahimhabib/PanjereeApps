// ─── Report Filter Types ─────────────────────────────────────────────────────

export interface DateRange {
  from: string // YYYY-MM-DD
  to: string   // YYYY-MM-DD
}

export interface ReportFilter {
  dateRange?: DateRange
  classId: string | null
  shift: string | null
  searchQuery: string
  examId?: string | null
}

// ─── Top Institution Summary Metrics ─────────────────────────────────────────

export interface InstitutionOverviewMetrics {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  overallAttendanceRate: number
  totalCollected: number
  totalOutstandingDues: number
  totalExpenses: number
  netSurplus: number
}

// ─── 1. Student & Enrollment Report ──────────────────────────────────────────

export interface StudentReportItem {
  id: string
  studentId: string
  rollNumber: string
  name: string
  className: string
  sectionName: string
  gender: string
  shift: string
  version: string
  bloodGroup?: string
  guardianMobile?: string
  status: string
}

export interface StudentEnrollmentSummary {
  totalStudents: number
  activeCount: number
  inactiveCount: number
  maleCount: number
  femaleCount: number
  malePercentage: number
  femalePercentage: number
  shiftBreakdown: { shift: string; count: number; percentage: number }[]
  versionBreakdown: { version: string; count: number; percentage: number }[]
  classBreakdown: { classId: string; className: string; studentCount: number; maleCount: number; femaleCount: number }[]
  bloodGroupBreakdown: { bloodGroup: string; count: number }[]
  studentList: StudentReportItem[]
}

// ─── 2. Attendance Report ─────────────────────────────────────────────────────

export interface DailyAttendance {
  date: string        // YYYY-MM-DD
  present: number
  absent: number
  late: number
  total: number
}

export interface ChronicAbsentee {
  studentId: string
  studentName: string
  rollNumber: string
  className: string
  sectionName: string
  totalDays: number
  presentDays: number
  absentDays: number
  rate: number
  guardianMobile?: string
}

export interface AttendanceSummary {
  totalDays: number
  avgAttendanceRate: number
  avgPresent: number
  avgAbsent: number
  bestDay: string
  worstDay: string
  daily: DailyAttendance[]
  byClass: { classId: string; className: string; presentPct: number; totalCount: number }[]
  chronicAbsentList: ChronicAbsentee[]
  teacherAttendance: {
    totalTeachers: number
    presentToday: number
    absentToday: number
    onLeaveToday: number
    rateToday: number
  }
}

// ─── 3. Payment & Financial Report ───────────────────────────────────────────

export interface MonthlyCollection {
  month: number      // 1-12
  monthName: string
  year: number
  total: number
  count: number
}

export interface StudentDueItem {
  id: string
  studentId: string
  studentName: string
  rollNumber: string
  className: string
  sectionName: string
  title: string
  dueAmount: number
  dueDate: string
  guardianMobile?: string
}

export interface PaymentSummary {
  totalCollected: number
  totalOutstandingDues: number
  totalExpenses: number
  netBalance: number
  totalTransactions: number
  avgPerTransaction: number
  topMethod: string
  monthly: MonthlyCollection[]
  byFeeType: { type: string; label: string; total: number; percentage: number }[]
  byMethod: { method: string; label: string; total: number; count: number; percentage: number }[]
  studentDuesList: StudentDueItem[]
  expenseCategories: { category: string; total: number; percentage: number }[]
}

// ─── 4. Academic & Examination Report ────────────────────────────────────────

export interface GradeDistributionItem {
  grade: string
  gpa: number
  count: number
  percentage: number
}

export interface MeritTopper {
  rank: number
  studentId: string
  name: string
  rollNumber: string
  className: string
  totalMarks: number
  maxMarks: number
  percentage: number
  gpa: number
  grade: string
}

export interface SubjectPerformanceItem {
  subjectId: string
  subjectName: string
  totalMarks: number
  avgMarks: number
  passPct: number
  highestMarks: number
}

export interface ExamReportDetail {
  examId: string
  examName: string
  targetName: string
  date: string
  totalExaminees: number
  passedCount: number
  failedCount: number
  passRate: number
  avgGpa: number
  gradeDistribution: GradeDistributionItem[]
  subjectAverages: SubjectPerformanceItem[]
  meritToppers: MeritTopper[]
}

export interface AcademicReportSummary {
  hasPublishedExams: boolean
  totalExamsHeld: number
  publishedExamsList: {
    id: string
    name: string
    scope: string
    date: string
    targetName: string
    examineesCount: number
    passRate: number
  }[]
  activeExamDetail: ExamReportDetail | null
}

// ─── 5. Faculty & Staff HR Report ────────────────────────────────────────────

export interface TeacherReportItem {
  id: string
  teacherId: string
  name: string
  designation: string
  department: string
  mobile: string
  email: string
  qualification: string
  joiningDate: string
  status: string
}

export interface FacultySummary {
  totalTeachers: number
  activeCount: number
  onLeaveCount: number
  departmentBreakdown: { department: string; count: number; percentage: number }[]
  designationBreakdown: { designation: string; count: number }[]
  payrollStats: {
    totalDisbursed: number
    totalPending: number
    lastMonth: string
  }
  teacherList: TeacherReportItem[]
}

