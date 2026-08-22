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

export const EXAM_STATUS_CONFIG: Record<ExamHeldStatus, { label: string; color: string; bg: string; border: string }> = {
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  ONGOING: { label: 'Ongoing', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  COMPLETED: { label: 'Completed', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  POSTPONED: { label: 'Postponed', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
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

const BD_GRADE_TABLE: { min: number; max: number; grade: string; gpa: number }[] = [
  { min: 80, max: 100, grade: 'A+', gpa: 5.00 },
  { min: 70, max: 79,  grade: 'A',  gpa: 4.00 },
  { min: 60, max: 69,  grade: 'A-', gpa: 3.50 },
  { min: 50, max: 59,  grade: 'B',  gpa: 3.00 },
  { min: 40, max: 49,  grade: 'C',  gpa: 2.00 },
  { min: 33, max: 39,  grade: 'D',  gpa: 1.00 },
  { min: 0,  max: 32,  grade: 'F',  gpa: 0.00 },
]

export function calculateGrade(marksObtained: number, totalMarks: number): { grade: string; gpa: number } {
  const pct = (marksObtained / totalMarks) * 100
  const row = BD_GRADE_TABLE.find(r => pct >= r.min && pct <= r.max)
  return row ? { grade: row.grade, gpa: row.gpa } : { grade: 'F', gpa: 0 }
}

export const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'A':  'text-green-400 bg-green-500/10 border-green-500/30',
  'A-': 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  'B':  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'C':  'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'D':  'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'F':  'text-red-400 bg-red-500/10 border-red-500/30',
}
