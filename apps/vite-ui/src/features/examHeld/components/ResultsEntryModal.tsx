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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">{exam.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter marks below · Default Total: <strong className="text-zinc-800">{exam.total_marks}</strong>
              {exam.pass_marks && <span> · Default Pass: <strong className="text-zinc-800">{exam.pass_marks}</strong></span>}
              <span className="ml-2 text-zinc-500">(per-subject marks override if set)</span>
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {/* Progress */}
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">{filledCells}/{totalCells} filled</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* No subjects warning */}
        {schedules.length === 0 && (
          <div className="flex items-center gap-2.5 mx-6 mt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex-shrink-0 font-medium">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>No subjects scheduled yet. Please configure a date-sheet first.</span>
          </div>
        )}

        {/* No students warning */}
        {schedules.length > 0 && students.length === 0 && (
          <div className="flex items-center gap-2.5 mx-6 mt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex-shrink-0 font-medium">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>No active students found for this class.</span>
          </div>
        )}

        {/* Saved notice */}
        {isSaved && (
          <div className="flex items-center gap-2 mx-6 mt-4 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex-shrink-0 font-semibold shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Results saved successfully — grades and ranks calculated automatically!</span>
          </div>
        )}

        {/* Body — subject-wise tables */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {Object.entries(bySubject).map(([subjectId, rows]) => {
            const subjectName = rows[0]?.subjectName ?? subjectId
            return (
              <div key={subjectId} className="bg-zinc-50/50 rounded-2xl border border-zinc-200/80 p-4">
                {/* Subject header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-indigo-900">{subjectName}</span>
                  {(() => {
                    const tm = effectiveTotalMarks(subjectId)
                    return tm !== exam.total_marks ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {tm} marks
                      </span>
                    ) : null
                  })()}
                  <div className="flex-1 h-px bg-zinc-200/80" />
                  <span className="text-xs font-semibold text-zinc-500 font-mono">Max: {effectiveTotalMarks(subjectId)}</span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[2.5rem_1fr_6rem_5rem_4.5rem_4.5rem] gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
                  <span>Roll</span>
                  <span>Student Name</span>
                  <span className="text-center">Marks</span>
                  <span className="text-center">Total</span>
                  <span className="text-center">Grade</span>
                  <span className="text-center">Absent</span>
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
                      ? GRADE_COLORS[gradeResult.grade] ?? 'text-zinc-600 bg-zinc-100'
                      : ''

                    return (
                      <div
                        key={`${row.studentId}-${subjectId}`}
                        className={`grid grid-cols-[2.5rem_1fr_6rem_5rem_4.5rem_4.5rem] gap-2 items-center px-3 py-2 rounded-xl transition-all ${
                          row.isAbsent
                            ? 'bg-rose-50/70 border border-rose-200'
                            : 'bg-white border border-zinc-200/80 hover:border-indigo-300'
                        }`}
                      >
                        {/* Roll */}
                        <span className="text-xs text-zinc-600 font-mono font-bold">{row.rollNumber}</span>

                        {/* Name */}
                        <span className="text-sm font-semibold text-zinc-900 truncate">{row.studentName}</span>

                        {/* Marks input */}
                        <input
                          type="number"
                          min={0}
                          max={effectiveTotalMarks(subjectId)}
                          disabled={row.isAbsent}
                          value={row.marks}
                          onChange={e => updateRow(row.studentId, subjectId, { marks: e.target.value })}
                          placeholder="—"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-sm text-zinc-900 text-center font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        />

                        {/* Total marks (static) */}
                        <span className="text-xs text-zinc-500 text-center font-mono font-medium">/ {effectiveTotalMarks(subjectId)}</span>

                        {/* Grade badge */}
                        <span className={`text-[11px] font-bold text-center px-2 py-0.5 rounded-md border mx-auto ${gradeColor || 'text-zinc-400 border-transparent'}`}>
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
                            className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              row.isAbsent
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'border-zinc-200 text-zinc-500 hover:border-rose-400 hover:text-rose-600 bg-white'
                            }`}
                            title="Toggle Absent Status"
                          >
                            {row.isAbsent ? 'ABS' : 'Mark ABS'}
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <p className="text-xs text-zinc-500">
            Grades & GPA are automatically calculated using the official Bangladesh Education Board system.
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200 transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveResults.isPending || students.length === 0 || schedules.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Save size={14} />
              {saveResults.isPending ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body
  )
}
