import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createStore } from '@/lib/localStore'
import type { ExamResult, CreateResultDto } from '../types'
import { calculateGrade } from '../types'

// ─── Store ────────────────────────────────────────────────────────────────────

export const examResultStore = createStore<ExamResult>('exam_results')

// ─── Seed Exam Results for Published Exam 001 (Half Yearly 2026, Class 10) ────
export const SEED_EXAM_RESULTS: ExamResult[] = [
  // 1. Rahim Uddin (Roll 01) -> Total 445/500, GPA 5.00, Grade A+
  { id: 'res-1-003', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 94, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-1-101', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 90, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-02T14:00:00Z', updated_at: '2026-09-02T14:00:00Z' },
  { id: 'res-1-102', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 88, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-06T14:00:00Z', updated_at: '2026-09-06T14:00:00Z' },
  { id: 'res-1-002', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 85, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-09T14:00:00Z', updated_at: '2026-09-09T14:00:00Z' },
  { id: 'res-1-001', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 88, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-13T14:00:00Z', updated_at: '2026-09-13T14:00:00Z' },

  // 2. Sadia Islam (Roll 02) -> Total 425/500, GPA 5.00, Grade A+
  { id: 'res-2-003', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 88, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-2-101', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 84, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-02T14:00:00Z', updated_at: '2026-09-02T14:00:00Z' },
  { id: 'res-2-102', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 86, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-06T14:00:00Z', updated_at: '2026-09-06T14:00:00Z' },
  { id: 'res-2-002', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 82, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-09T14:00:00Z', updated_at: '2026-09-09T14:00:00Z' },
  { id: 'res-2-001', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 85, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-09-13T14:00:00Z', updated_at: '2026-09-13T14:00:00Z' },

  // 3. Sumaiya Begum (Roll 03) -> Total 385/500, GPA 4.00, Grade A
  { id: 'res-10-003', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '03', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 78, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-10-101', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '03', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 74, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-09-02T14:00:00Z', updated_at: '2026-09-02T14:00:00Z' },
  { id: 'res-10-102', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '03', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 76, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-09-06T14:00:00Z', updated_at: '2026-09-06T14:00:00Z' },
  { id: 'res-10-002', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '03', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 79, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-09-09T14:00:00Z', updated_at: '2026-09-09T14:00:00Z' },
  { id: 'res-10-001', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '03', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 78, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-09-13T14:00:00Z', updated_at: '2026-09-13T14:00:00Z' },

  // 4. Tanvir Hasan (Roll 04) -> Total 333/500, GPA 3.60, Grade A-
  { id: 'res-21-003', exam_held_id: 'exam-001', student_id: '21', student_name: 'Tanvir Hasan', roll_number: '04', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 68, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-21-101', exam_held_id: 'exam-001', student_id: '21', student_name: 'Tanvir Hasan', roll_number: '04', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 65, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-09-02T14:00:00Z', updated_at: '2026-09-02T14:00:00Z' },
  { id: 'res-21-102', exam_held_id: 'exam-001', student_id: '21', student_name: 'Tanvir Hasan', roll_number: '04', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 62, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-09-06T14:00:00Z', updated_at: '2026-09-06T14:00:00Z' },
  { id: 'res-21-002', exam_held_id: 'exam-001', student_id: '21', student_name: 'Tanvir Hasan', roll_number: '04', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 66, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-09-09T14:00:00Z', updated_at: '2026-09-09T14:00:00Z' },
  { id: 'res-21-001', exam_held_id: 'exam-001', student_id: '21', student_name: 'Tanvir Hasan', roll_number: '04', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 72, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-09-13T14:00:00Z', updated_at: '2026-09-13T14:00:00Z' },

  // 5. Mizanur Rahman (Roll 05) -> Total 290/500, GPA 3.10, Grade B
  { id: 'res-22-003', exam_held_id: 'exam-001', student_id: '22', student_name: 'Mizanur Rahman', roll_number: '05', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 58, is_absent: false, grade: 'B', gpa: 3.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-22-101', exam_held_id: 'exam-001', student_id: '22', student_name: 'Mizanur Rahman', roll_number: '05', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 54, is_absent: false, grade: 'B', gpa: 3.0, created_at: '2026-09-02T14:00:00Z', updated_at: '2026-09-02T14:00:00Z' },
  { id: 'res-22-102', exam_held_id: 'exam-001', student_id: '22', student_name: 'Mizanur Rahman', roll_number: '05', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 56, is_absent: false, grade: 'B', gpa: 3.0, created_at: '2026-09-06T14:00:00Z', updated_at: '2026-09-06T14:00:00Z' },
  { id: 'res-22-002', exam_held_id: 'exam-001', student_id: '22', student_name: 'Mizanur Rahman', roll_number: '05', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 58, is_absent: false, grade: 'B', gpa: 3.0, created_at: '2026-09-09T14:00:00Z', updated_at: '2026-09-09T14:00:00Z' },
  { id: 'res-22-001', exam_held_id: 'exam-001', student_id: '22', student_name: 'Mizanur Rahman', roll_number: '05', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 64, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-09-13T14:00:00Z', updated_at: '2026-09-13T14:00:00Z' },
]

if (examResultStore.getAll().length === 0) {
  examResultStore.seed(SEED_EXAM_RESULTS)
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const resultKeys = {
  byExam: (examId: string) => ['exam-results', examId] as const,
  all: ['exam-results'] as const,
}

// ─── Fetch results for a specific exam ───────────────────────────────────────

async function fetchResultsByExam(examHeldId: string): Promise<ExamResult[]> {
  return examResultStore.getWhere((r) => r.exam_held_id === examHeldId)
}

export function useExamResults(examHeldId: string | null) {
  return useQuery({
    queryKey: resultKeys.byExam(examHeldId ?? ''),
    queryFn: () => fetchResultsByExam(examHeldId!),
    enabled: !!examHeldId,
    staleTime: 0,
  })
}

// ─── Save (upsert) results for an exam ───────────────────────────────────────

async function saveResults({
  results,
}: {
  examHeldId: string
  results: CreateResultDto[]
}): Promise<void> {
  for (const r of results) {
    const total = 100 // default or from schedule
    const { grade, gpa } =
      r.marks_obtained !== null && !r.is_absent
        ? calculateGrade(r.marks_obtained, total)
        : { grade: r.is_absent ? 'F' : null, gpa: r.is_absent ? 0 : null }

    const existing = examResultStore.getWhere(
      (item) =>
        item.exam_held_id === r.exam_held_id &&
        item.student_id === r.student_id &&
        item.subject_id === r.subject_id
    )

    if (existing.length > 0) {
      examResultStore.update(existing[0].id, {
        marks_obtained: r.marks_obtained,
        is_absent: r.is_absent,
        grade,
        gpa,
        updated_at: new Date().toISOString(),
      })
    } else {
      examResultStore.insert({
        id: crypto.randomUUID(),
        exam_held_id: r.exam_held_id,
        student_id: r.student_id,
        student_name: r.student_name,
        roll_number: r.roll_number,
        subject_id: r.subject_id,
        subject_name: r.subject_name,
        marks_obtained: r.marks_obtained,
        is_absent: r.is_absent,
        grade,
        gpa,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }
}

export function useSaveResults(examHeldId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      results: CreateResultDto[]
      totalMarks?: number
      subjectMarksMap?: Record<string, number>
      examHeldId?: string
    }) =>
      saveResults({
        examHeldId: vars.examHeldId || examHeldId || '',
        results: vars.results,
      }),
    onSuccess: (_, vars) => {
      const id = vars.examHeldId || examHeldId
      if (id) qc.invalidateQueries({ queryKey: resultKeys.byExam(id) })
      qc.invalidateQueries({ queryKey: resultKeys.all })
    },
  })
}

export const useSaveExamResults = useSaveResults

// ─── Get results for a student (for profile drawer) ──────────────────────────

export function getStudentResults(studentId: string): ExamResult[] {
  return examResultStore.getWhere((r) => r.student_id === studentId)
}
