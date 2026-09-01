// ─── Enums ───────────────────────────────────────────────────────────────────

export type ExamScope = 'CLASS_TEST' | 'WEEKLY' | 'MONTHLY' | 'HALF_YEARLY' | 'ANNUAL' | 'BOARD' | 'MOCK_TEST'
export type ExamHeldStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED'

// ─── Models ──────────────────────────────────────────────────────────────────

export interface ExamHeld {
  id: string
  name: string
  scope: ExamScope
  status: ExamHeldStatus
  target_type: 'CLASS' | 'BATCH'
  class_id: string | null
  batch_id: string | null
  total_marks: number
  pass_marks: number | null
  instructions: string | null
  result_published: boolean
  created_by: string
  created_at: string
  updated_at: string

  // Joined
  classes?: { id: string; name: string }
  batches?: { id: string; name: string }
  exam_held_schedules?: ExamHeldSchedule[]
}

export interface ExamHeldSchedule {
  id: string
  exam_held_id: string
  subject_id: string
  date: string       // "YYYY-MM-DD"
  start_time: string // "09:00"
  end_time: string   // "12:00"
  room: string | null
  total_marks: number | null   // null = use exam-level total_marks
  pass_marks: number | null    // null = use exam-level pass_marks
  created_at: string

  // Joined
  subjects?: { id: string; name: string; name_bn: string | null }
}

// ─── Create DTOs ─────────────────────────────────────────────────────────────

export interface CreateExamHeldDto {
  name: string
  scope: ExamScope
  target_type: 'CLASS' | 'BATCH'
  class_id?: string
  batch_id?: string
  total_marks: number
  pass_marks?: number
  instructions?: string
}

export interface CreateScheduleDto {
  subject_id: string
  subject_name?: string     // human-readable name, used to populate routines.subjects
  date: string
  start_time: string
  end_time: string
  room?: string
  total_marks?: number | null  // null = use exam-level total_marks
  pass_marks?: number | null   // null = use exam-level pass_marks
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const EXAM_SCOPE_LABELS: Record<ExamScope, string> = {
  CLASS_TEST: 'Class Test',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  HALF_YEARLY: 'Half Yearly',
  ANNUAL: 'Annual',
  BOARD: 'Board Exam',
  MOCK_TEST: 'Mock Test',
}

export const EXAM_STATUS_CONFIG: Record<ExamHeldStatus, { label: string; color: string; bg: string; border: string; stripe: string }> = {
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', stripe: 'bg-blue-500' },
  ONGOING: { label: 'Ongoing', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', stripe: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-200', stripe: 'bg-zinc-400' },
  POSTPONED: { label: 'Postponed', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', stripe: 'bg-amber-500' },
  CANCELLED: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', stripe: 'bg-rose-500' },
}

// ─── Exam Results ─────────────────────────────────────────────────────────────

export interface ExamResult {
  id: string
  exam_held_id: string
  student_id: string
  student_name: string      // denormalized
  roll_number: string
  subject_id: string
  subject_name: string      // denormalized
  marks_obtained: number | null
  is_absent: boolean
  grade: string | null      // A+, A, A-, B+, B, C, D, F
  gpa: number | null
  created_at: string
  updated_at: string
}

export interface CreateResultDto {
  exam_held_id: string
  student_id: string
  student_name: string
  roll_number: string
  subject_id: string
  subject_name: string
  marks_obtained: number | null
  is_absent: boolean
}

// ─── BD Grading System ────────────────────────────────────────────────────────

export const BD_GRADE_TABLE: { min: number; max: number; grade: string; gpa: number }[] = [
  { min: 80, max: 100, grade: 'A+', gpa: 5.00 },
  { min: 70, max: 79.99,  grade: 'A',  gpa: 4.00 },
  { min: 60, max: 69.99,  grade: 'A-', gpa: 3.50 },
  { min: 50, max: 59.99,  grade: 'B',  gpa: 3.00 },
  { min: 40, max: 49.99,  grade: 'C',  gpa: 2.00 },
  { min: 33, max: 39.99,  grade: 'D',  gpa: 1.00 },
  { min: 0,  max: 32.99,  grade: 'F',  gpa: 0.00 },
]

export function calculateGrade(marksObtained: number, totalMarks: number): { grade: string; gpa: number } {
  if (totalMarks <= 0) return { grade: 'F', gpa: 0 }
  const pct = (marksObtained / totalMarks) * 100
  const row = BD_GRADE_TABLE.find(r => pct >= r.min && pct <= (r.max + 0.01))
  return row ? { grade: row.grade, gpa: row.gpa } : { grade: 'F', gpa: 0 }
}

export function gpaToGrade(gpa: number): string {
  if (gpa >= 5.0) return 'A+'
  if (gpa >= 4.0) return 'A'
  if (gpa >= 3.5) return 'A-'
  if (gpa >= 3.0) return 'B'
  if (gpa >= 2.0) return 'C'
  if (gpa >= 1.0) return 'D'
  return 'F'
}

export const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'A':  'text-green-700 bg-green-50 border-green-200',
  'A-': 'text-teal-700 bg-teal-50 border-teal-200',
  'B':  'text-blue-700 bg-blue-50 border-blue-200',
  'C':  'text-amber-700 bg-amber-50 border-amber-200',
  'D':  'text-orange-700 bg-orange-50 border-orange-200',
  'F':  'text-rose-700 bg-rose-50 border-rose-200',
}

// ─── Tabulation & Merit System Types ───────────────────────────────────────────

export interface SubjectScore {
  subjectId: string
  subjectName: string
  totalMarks: number
  passMarks: number
  marks: number | null
  isAbsent: boolean
  grade: string | null
  gpa: number | null
}

export interface StudentTabulationRow {
  studentId: string
  studentName: string
  studentNameBn?: string
  rollNumber: string
  sectionName?: string
  groupName?: string
  scores: Record<string, SubjectScore> // key is subjectId
  totalObtained: number
  totalPossible: number
  percentage: number
  gpa: number
  grade: string
  isPass: boolean
  failedCount: number
  absentCount: number
  rank?: number
}

export interface ResultAnalyticsSummary {
  totalStudents: number
  passedStudents: number
  failedStudents: number
  passRate: number
  averageGpa: number
  averageMarks: number
  highestMarks: number
  highestGpa: number
  gradeDistribution: Record<string, number>
  subjectWiseStats: {
    subjectId: string
    subjectName: string
    totalMarks: number
    passMarks: number
    appeared: number
    passed: number
    failed: number
    absent: number
    passRate: number
    averageMarks: number
    highestMarks: number
  }[]
}

/**
 * Calculates overall GPA & Grade from a student's subject scores.
 * Rule: If any subject has Grade 'F' or isAbsent, overall GPA = 0.00 and Grade = 'F'.
 * Otherwise, GPA = average of all subjects' GPA, and Grade is looked up from gpaToGrade.
 */
export function calculateStudentOverallResult(
  scores: Record<string, SubjectScore>
): {
  totalObtained: number
  totalPossible: number
  percentage: number
  gpa: number
  grade: string
  isPass: boolean
  failedCount: number
  absentCount: number
} {
  const scoreList = Object.values(scores)
  if (scoreList.length === 0) {
    return {
      totalObtained: 0,
      totalPossible: 0,
      percentage: 0,
      gpa: 0,
      grade: '—',
      isPass: false,
      failedCount: 0,
      absentCount: 0,
    }
  }

  let totalObtained = 0
  let totalPossible = 0
  let totalGpaSum = 0
  let failedCount = 0
  let absentCount = 0
  let evaluatedSubjectsCount = 0

  for (const s of scoreList) {
    totalPossible += s.totalMarks
    if (s.isAbsent) {
      absentCount++
      failedCount++
    } else if (s.marks !== null) {
      totalObtained += s.marks
      evaluatedSubjectsCount++
      if (s.grade === 'F' || (s.marks < s.passMarks)) {
        failedCount++
      }
      totalGpaSum += s.gpa ?? 0
    }
  }

  const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0

  // If student failed or was absent in any subject, overall GPA is 0.00
  const isPass = failedCount === 0 && absentCount === 0 && evaluatedSubjectsCount === scoreList.length
  let finalGpa = 0
  let finalGrade = 'F'

  if (isPass && scoreList.length > 0) {
    finalGpa = Number((totalGpaSum / scoreList.length).toFixed(2))
    if (finalGpa > 5.0) finalGpa = 5.0
    finalGrade = gpaToGrade(finalGpa)
  } else if (evaluatedSubjectsCount === 0 && absentCount === 0) {
    finalGrade = '—'
    finalGpa = 0
  }

  return {
    totalObtained,
    totalPossible,
    percentage: Number(percentage.toFixed(2)),
    gpa: finalGpa,
    grade: finalGrade,
    isPass,
    failedCount,
    absentCount,
  }
}

/**
 * Assigns class merit ranks (1st, 2nd, 3rd...)
 * Sorting order:
 * 1. isPass (Passed students first)
 * 2. GPA descending
 * 3. Total marks obtained descending
 * 4. Roll number ascending
 */
export function assignMeritRanks(rows: StudentTabulationRow[]): StudentTabulationRow[] {
  const sorted = [...rows].sort((a, b) => {
    // 1. Pass status
    if (a.isPass !== b.isPass) return a.isPass ? -1 : 1
    // 2. GPA
    if (b.gpa !== a.gpa) return b.gpa - a.gpa
    // 3. Total Obtained Marks
    if (b.totalObtained !== a.totalObtained) return b.totalObtained - a.totalObtained
    // 4. Roll Number
    const rollA = parseInt(a.rollNumber) || 99999
    const rollB = parseInt(b.rollNumber) || 99999
    return rollA - rollB
  })

  return sorted.map((row, index) => ({
    ...row,
    rank: row.isPass ? index + 1 : undefined,
  }))
}

