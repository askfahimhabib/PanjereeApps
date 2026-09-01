import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createStore } from '@/lib/localStore'
import type { ExamResult, CreateResultDto } from '../types'
import { calculateGrade } from '../types'

// ─── Store ────────────────────────────────────────────────────────────────────

export const examResultStore = createStore<ExamResult>('exam_results')

// ─── Seed initial mock results for exam-001 if empty ──────────────────────────
const SEED_EXAM_RESULTS: ExamResult[] = [
  // Student 1 (Rahim Uddin, Roll 01, cls-10)
  { id: 'res-1-1', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 88, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-1-2', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 82, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-1-3', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 78, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-1-4', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 74, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-1-5', exam_held_id: 'exam-001', student_id: '1', student_name: 'Rahim Uddin', roll_number: '01', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 80, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },

  // Student 2 (Sadia Islam, Roll 02, cls-10)
  { id: 'res-2-1', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 94, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-2-2', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 91, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-2-3', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 85, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-2-4', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 88, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-2-5', exam_held_id: 'exam-001', student_id: '2', student_name: 'Sadia Islam', roll_number: '02', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 86, is_absent: false, grade: 'A+', gpa: 5.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },

  // Student 10 (Sumaiya Begum, Roll 10, cls-10)
  { id: 'res-10-1', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '10', subject_id: 's-003', subject_name: 'Mathematics', marks_obtained: 65, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-10-2', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '10', subject_id: 's-101', subject_name: 'Physics', marks_obtained: 58, is_absent: false, grade: 'B', gpa: 3.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-10-3', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '10', subject_id: 's-102', subject_name: 'Chemistry', marks_obtained: 62, is_absent: false, grade: 'A-', gpa: 3.5, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-10-4', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '10', subject_id: 's-002', subject_name: 'English 1st', marks_obtained: 70, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
  { id: 'res-10-5', exam_held_id: 'exam-001', student_id: '10', student_name: 'Sumaiya Begum', roll_number: '10', subject_id: 's-001', subject_name: 'Bangla 1st', marks_obtained: 72, is_absent: false, grade: 'A', gpa: 4.0, created_at: '2026-08-30T14:00:00Z', updated_at: '2026-08-30T14:00:00Z' },
]

examResultStore.seed(SEED_EXAM_RESULTS)

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const resultKeys = {
  byExam: (examId: string) => ['exam-results', examId] as const,
  all: ['exam-results'] as const,
}

// ─── Fetch results for a specific exam ───────────────────────────────────────

async function fetchResultsByExam(examHeldId: string): Promise<ExamResult[]> {
  return examResultStore.getWhere(r => r.exam_held_id === examHeldId)
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
  totalMarks,
  subjectMarksMap = {},
}: {
  results: CreateResultDto[]
  totalMarks: number
  subjectMarksMap?: Record<string, number>
}) {
  for (const dto of results) {
    // Resolve effective total marks: per-subject override or exam-level fallback
    const effectiveTotal = subjectMarksMap[dto.subject_id] ?? totalMarks

    // Calculate grade
    const gradeResult = dto.is_absent || dto.marks_obtained === null
      ? { grade: 'F', gpa: 0 }
      : calculateGrade(dto.marks_obtained, effectiveTotal)

    // Check if result already exists (same exam + student + subject)
    const existing = examResultStore.getWhere(
      r => r.exam_held_id === dto.exam_held_id
        && r.student_id === dto.student_id
        && r.subject_id === dto.subject_id
    )[0]

    if (existing) {
      examResultStore.update(existing.id, {
        marks_obtained: dto.marks_obtained,
        is_absent: dto.is_absent,
        grade: gradeResult.grade,
        gpa: gradeResult.gpa,
        updated_at: new Date().toISOString(),
      })
    } else {
      examResultStore.insert({
        id: crypto.randomUUID(),
        ...dto,
        grade: gradeResult.grade,
        gpa: gradeResult.gpa,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }
}

export function useSaveResults(examHeldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveResults,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultKeys.byExam(examHeldId) })
      qc.invalidateQueries({ queryKey: resultKeys.all })
    },
  })
}

// ─── Get results for a student (for profile drawer) ──────────────────────────

export function getStudentResults(studentId: string): ExamResult[] {
  return examResultStore.getWhere(r => r.student_id === studentId)
}

