import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createStore } from '@/lib/localStore'
import type { ExamResult, CreateResultDto } from '../types'
import { calculateGrade } from '../types'

// ─── Store ────────────────────────────────────────────────────────────────────

const store = createStore<ExamResult>('exam_results')

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const resultKeys = {
  byExam: (examId: string) => ['exam-results', examId] as const,
}

// ─── Fetch results for a specific exam ───────────────────────────────────────

async function fetchResultsByExam(examHeldId: string): Promise<ExamResult[]> {
  return store.getWhere(r => r.exam_held_id === examHeldId)
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
    const existing = store.getWhere(
      r => r.exam_held_id === dto.exam_held_id
        && r.student_id === dto.student_id
        && r.subject_id === dto.subject_id
    )[0]

    if (existing) {
      store.update(existing.id, {
        marks_obtained: dto.marks_obtained,
        is_absent: dto.is_absent,
        grade: gradeResult.grade,
        gpa: gradeResult.gpa,
        updated_at: new Date().toISOString(),
      })
    } else {
      store.insert({
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
    },
  })
}

// ─── Get results for a student (for profile drawer) ──────────────────────────

export function getStudentResults(studentId: string): ExamResult[] {
  return store.getWhere(r => r.student_id === studentId)
}
