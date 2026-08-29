import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ExamHeld, ExamResult } from '../types'
import { calculateGrade, GRADE_COLORS } from '../types'
import { useSaveResults } from '../hooks/useExamResults'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'

const studentStore = createStore<Student>('students')

interface Props {
  open: boolean
  exam: ExamHeld | null
  existingResults: ExamResult[]
  onClose: () => void
}

// Draft row per student per subject
interface DraftRow {
  studentId: string
  studentName: string
  rollNumber: string
  subjectId: string
  subjectName: string
  marks: string   // string for input control
  isAbsent: boolean
}

export function ResultsEntryModal({ open, exam, existingResults, onClose }: Props) {
  const [draft, setDraft] = useState<DraftRow[]>([])
  const [isSaved, setIsSaved] = useState(false)

  const saveResults = useSaveResults(exam?.id ?? '')

  // Students for this exam's class (ACTIVE)
  const students = useMemo(() => {
    if (!exam?.class_id) return []
    return studentStore
      .getWhere(s => s.classId === exam.class_id && s.status === 'ACTIVE')
      .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
  }, [exam?.class_id])

  const schedules = exam?.exam_held_schedules ?? []

  // Helper: effective total marks for a subject (schedule-level overrides exam-level)
  const effectiveTotalMarks = (subjectId: string) => {
    const sched = schedules.find(s => s.subject_id === subjectId)
    return sched?.total_marks ?? exam?.total_marks ?? 100
  }

  // Build initial draft from existing results or blank
  useEffect(() => {
    if (!exam || students.length === 0 || schedules.length === 0) return

    const rows: DraftRow[] = []
    for (const student of students) {
      for (const sched of schedules) {
        const existing = existingResults.find(
          r => r.student_id === student.id && r.subject_id === sched.subject_id
        )
        rows.push({
          studentId: student.id,
          studentName: student.fullNameEn,
          rollNumber: student.rollNumber,
          subjectId: sched.subject_id,
          subjectName: sched.subjects?.name_bn ?? sched.subjects?.name ?? sched.subject_id,
          marks: existing?.marks_obtained != null ? String(existing.marks_obtained) : '',
          isAbsent: existing?.is_absent ?? false,
        })
      }
    }
    setDraft(rows)
    setIsSaved(false)
  }, [exam?.id, students.length, existingResults.length])

  const updateRow = (studentId: string, subjectId: string, patch: Partial<DraftRow>) => {
    setDraft(prev => prev.map(r =>
      r.studentId === studentId && r.subjectId === subjectId ? { ...r, ...patch } : r
    ))
  }

  const handleSave = () => {
    if (!exam) return
    saveResults.mutate({
      results: draft.map(r => ({
        exam_held_id: exam.id,
        student_id: r.studentId,
        student_name: r.studentName,
        roll_number: r.rollNumber,
        subject_id: r.subjectId,
        subject_name: r.subjectName,
        marks_obtained: r.isAbsent ? null : (r.marks === '' ? null : Number(r.marks)),
        is_absent: r.isAbsent,
      })),
      // Pass per-subject marks map so useExamResults can grade correctly
      subjectMarksMap: Object.fromEntries(
        schedules.map(s => [s.subject_id, s.total_marks ?? exam.total_marks])
      ),
      totalMarks: exam.total_marks,
    }, {
      onSuccess: () => {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      },
    })
  }

  if (!open || !exam) return null

  // Group draft rows by subject for a subject-first layout
  const bySubject: Record<string, DraftRow[]> = {}
  for (const row of draft) {
    if (!bySubject[row.subjectId]) bySubject[row.subjectId] = []
    bySubject[row.subjectId].push(row)
  }

  const totalCells = draft.length
  const filledCells = draft.filter(r => r.isAbsent || r.marks !== '').length

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white border border-zinc-100 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">{exam.name}</h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Enter marks below · Default Total: <strong className="text-zinc-800">{exam.total_marks}</strong>
              {exam.pass_marks && <span> · Default Pass: <strong className="text-zinc-800">{exam.pass_marks}</strong></span>}
              <span className="ml-2 text-zinc-800">(per-subject marks override if set)</span>
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {/* Progress */}
            <span className="text-xs text-zinc-600">{filledCells}/{totalCells} filled</span>
            <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* No subjects warning */}
        {schedules.length === 0 && (
          <div className="flex items-center gap-3 mx-6 mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex-shrink-0">
            <AlertCircle size={16} />
            No subjects scheduled yet. Please create a schedule first.
          </div>
        )}

        {/* No students warning */}
        {schedules.length > 0 && students.length === 0 && (
          <div className="flex items-center gap-3 mx-6 mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex-shrink-0">
            <AlertCircle size={16} />
            No active students found for this class.
          </div>
        )}

        {/* Saved notice */}
        {isSaved && (
          <div className="flex items-center gap-2 mx-6 mt-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex-shrink-0">
            <CheckCircle2 size={15} />
            Results saved successfully — grades calculated automatically
          </div>
        )}

        {/* Body — subject-wise tables */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {Object.entries(bySubject).map(([subjectId, rows]) => {
            const subjectName = rows[0]?.subjectName ?? subjectId
            return (
              <div key={subjectId}>
                {/* Subject header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-purple-300">{subjectName}</span>
                  {(() => {
                    const tm = effectiveTotalMarks(subjectId)
                    return tm !== exam.total_marks ? (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        {tm} marks
                      </span>
                    ) : null
                  })()}
                  <div className="flex-1 h-px bg-zinc-50" />
                  <span className="text-[10px] text-zinc-800">/ {effectiveTotalMarks(subjectId)}</span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[2rem_1fr_5rem_5rem_4rem_4rem] gap-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-1">
                  <span>#</span>
                  <span>Student</span>
                  <span>Marks</span>
                  <span>/ {effectiveTotalMarks(subjectId)}</span>
                  <span>Grade</span>
                  <span>Absent</span>
                </div>

                {/* Student rows */}
                <div className="space-y-1.5">
                  {rows.map(row => {
                    const subTotalMarks = effectiveTotalMarks(subjectId)
                    const numMarks = row.marks === '' ? null : Number(row.marks)
                    const gradeResult = row.isAbsent || numMarks === null
                      ? null
                      : calculateGrade(numMarks, subTotalMarks)
                    const gradeColor = gradeResult
                      ? GRADE_COLORS[gradeResult.grade] ?? 'text-zinc-600'
                      : ''

                    return (
                      <div
                        key={`${row.studentId}-${subjectId}`}
                        className={`grid grid-cols-[2rem_1fr_5rem_5rem_4rem_4rem] gap-2 items-center px-3 py-2 rounded-lg transition-all ${
                          row.isAbsent
                            ? 'bg-red-500/5 border border-red-500/20'
                            : 'bg-white border border-zinc-100'
                        }`}
                      >
                        {/* Roll */}
                        <span className="text-xs text-zinc-600 font-mono">{row.rollNumber}</span>

                        {/* Name */}
                        <span className="text-sm text-zinc-800 truncate">{row.studentName}</span>

                        {/* Marks input */}
                        <input
                          type="number"
                          min={0}
                          max={effectiveTotalMarks(subjectId)}
                          disabled={row.isAbsent}
                          value={row.marks}
                          onChange={e => updateRow(row.studentId, subjectId, { marks: e.target.value })}
                          placeholder="—"
                          className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1 text-sm text-zinc-800 text-center focus:outline-none focus:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        />

                        {/* Total marks (static) */}
                        <span className="text-xs text-zinc-800 text-center">/ {effectiveTotalMarks(subjectId)}</span>

                        {/* Grade badge */}
                        <span className={`text-[11px] font-bold text-center px-1.5 py-0.5 rounded border ${gradeColor || 'text-zinc-800 border-transparent'}`}>
                          {row.isAbsent ? 'ABS' : gradeResult?.grade ?? '—'}
                        </span>

                        {/* Absent toggle */}
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => updateRow(row.studentId, subjectId, {
                              isAbsent: !row.isAbsent,
                              marks: !row.isAbsent ? '' : row.marks,
                            })}
                            className={`w-6 h-6 rounded-md border text-xs font-bold transition-all ${
                              row.isAbsent
                                ? 'bg-red-500 border-red-500 text-white'
                                : 'border-zinc-100 text-zinc-800 hover:border-red-500/50'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          <p className="text-xs text-zinc-600">
            Grades are calculated automatically using the BD grading system (A+ to F)
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:text-white border border-zinc-100 hover:border-zinc-100 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saveResults.isPending || students.length === 0 || schedules.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
            >
              <Save size={15} />
              {saveResults.isPending ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body
  )
}
