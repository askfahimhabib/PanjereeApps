import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type React from 'react'
import {
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { ExamHeld, ExamResult, StudentTabulationRow, SubjectScore } from '../types'
import {
  calculateGrade,
  calculateStudentOverallResult,
  assignMeritRanks,
  GRADE_COLORS,
} from '../types'
import { useSaveResults } from '../hooks/useExamResults'
import { studentStore } from '@/data/stores'
import { printStudentResultCard } from '../utils/printStudentResultCard'

interface Props {
  exam: ExamHeld
  existingResults: ExamResult[]
  onPrintSingle?: (studentId: string) => void
  onComputedRowsChange?: (rows: StudentTabulationRow[]) => void
}

export function TabulationMatrixSheet({
  exam,
  existingResults,
  onComputedRowsChange,
}: Props) {
  const schedules = useMemo(() => exam.exam_held_schedules ?? [], [exam.exam_held_schedules])
  const saveMutation = useSaveResults(exam.id)

  // 1. Load active students for this class or batch
  const enrolledStudents = useMemo(() => {
    if (exam.target_type === 'CLASS' && exam.class_id) {
      return studentStore
        .getWhere((s) => s.classId === exam.class_id && s.status === 'ACTIVE')
        .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
    }
    if (exam.target_type === 'BATCH' && exam.batch_id) {
      return studentStore
        .getWhere((s) => s.batchId === exam.batch_id && s.status === 'ACTIVE')
        .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
    }
    return []
  }, [exam.target_type, exam.class_id, exam.batch_id])

  // 2. Local draft grid state: Map of studentId -> subjectId -> { marks: string, isAbsent: boolean }
  const [gridData, setGridData] = useState<Record<string, Record<string, { marks: string; isAbsent: boolean }>>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'INCOMPLETE'>('ALL')

  // Initialize draft grid data from existingResults or blanks
  useEffect(() => {
    if (enrolledStudents.length === 0 || schedules.length === 0) return

    const initialGrid: Record<string, Record<string, { marks: string; isAbsent: boolean }>> = {}

    for (const student of enrolledStudents) {
      initialGrid[student.id] = {}
      for (const sch of schedules) {
        const existing = existingResults.find(
          (r) => r.student_id === student.id && r.subject_id === sch.subject_id
        )
        initialGrid[student.id][sch.subject_id] = {
          marks: existing?.marks_obtained != null ? String(existing.marks_obtained) : '',
          isAbsent: existing?.is_absent ?? false,
        }
      }
    }

    setGridData(initialGrid)
    setIsDirty(false)
  }, [enrolledStudents, schedules, existingResults])

  // Helper: total and pass marks for a subject
  const getSubjectMeta = useCallback((subjectId: string) => {
    const sch = schedules.find((s) => s.subject_id === subjectId)
    return {
      totalMarks: sch?.total_marks ?? exam.total_marks ?? 100,
      passMarks: sch?.pass_marks ?? exam.pass_marks ?? 33,
      name: sch?.subjects?.name_bn ?? sch?.subjects?.name ?? subjectId,
    }
  }, [schedules, exam.total_marks, exam.pass_marks])

  // 3. Compute live student tabulation rows
  const computedRows: StudentTabulationRow[] = useMemo(() => {
    const rawRows: StudentTabulationRow[] = enrolledStudents.map((student) => {
      const studentGrid = gridData[student.id] || {}
      const scores: Record<string, SubjectScore> = {}

      for (const sch of schedules) {
        const meta = getSubjectMeta(sch.subject_id)
        const cell = studentGrid[sch.subject_id] || { marks: '', isAbsent: false }
        const numMarks = cell.marks.trim() === '' ? null : Number(cell.marks)

        let grade: string | null = null
        let gpa: number | null = null

        if (cell.isAbsent) {
          grade = 'F'
          gpa = 0.0
        } else if (numMarks !== null && !isNaN(numMarks)) {
          const res = calculateGrade(numMarks, meta.totalMarks)
          grade = res.grade
          gpa = res.gpa
        }

        scores[sch.subject_id] = {
          subjectId: sch.subject_id,
          subjectName: meta.name,
          totalMarks: meta.totalMarks,
          passMarks: meta.passMarks,
          marks: numMarks,
          isAbsent: cell.isAbsent,
          grade,
          gpa,
        }
      }

      const overall = calculateStudentOverallResult(scores)

      return {
        studentId: student.id,
        studentName: student.fullNameEn,
        studentNameBn: student.fullNameBn,
        rollNumber: student.rollNumber,
        sectionName: student.sectionName || 'A',
        scores,
        ...overall,
      }
    })

    const ranked = assignMeritRanks(rawRows)
    return ranked
  }, [enrolledStudents, gridData, schedules, getSubjectMeta])

  // Propagate computed rows to parent for printing / analytics
  useEffect(() => {
    if (onComputedRowsChange) {
      onComputedRowsChange(computedRows)
    }
  }, [computedRows, onComputedRowsChange])

  // 4. Input update handler
  const handleCellChange = (studentId: string, subjectId: string, value: string) => {
    setGridData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          marks: value,
          isAbsent: false,
        },
      },
    }))
    setIsDirty(true)
  }

  const toggleAbsent = (studentId: string, subjectId: string) => {
    setGridData((prev) => {
      const current = prev[studentId]?.[subjectId] || { marks: '', isAbsent: false }
      const nextAbsent = !current.isAbsent
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subjectId]: {
            marks: nextAbsent ? '' : current.marks,
            isAbsent: nextAbsent,
          },
        },
      }
    })
    setIsDirty(true)
  }

  // 5. Keyboard Navigation (Arrow Keys, Enter to go down, Tab to go right)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    subjectIndex: number
  ) => {
    let nextStudentIdx = studentIndex
    let nextSubjectIdx = subjectIndex

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault()
      nextStudentIdx = Math.min(filteredRows.length - 1, studentIndex + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      nextStudentIdx = Math.max(0, studentIndex - 1)
    } else if (e.key === 'ArrowRight') {
      if (e.currentTarget.selectionStart === e.currentTarget.value.length) {
        nextSubjectIdx = Math.min(schedules.length - 1, subjectIndex + 1)
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.currentTarget.selectionStart === 0) {
        nextSubjectIdx = Math.max(0, subjectIndex - 1)
      }
    }

    if (nextStudentIdx !== studentIndex || nextSubjectIdx !== subjectIndex) {
      const nextStudent = filteredRows[nextStudentIdx]
      const nextSchedule = schedules[nextSubjectIdx]
      if (nextStudent && nextSchedule) {
        const key = `${nextStudent.studentId}__${nextSchedule.subject_id}`
        inputRefs.current[key]?.focus()
        inputRefs.current[key]?.select()
      }
    }
  }

  // 6. Save handler
  const handleSaveAll = () => {
    const resultsToSave: {
      exam_held_id: string
      student_id: string
      student_name: string
      roll_number: string
      subject_id: string
      subject_name: string
      marks_obtained: number | null
      is_absent: boolean
    }[] = []

    for (const student of enrolledStudents) {
      for (const sch of schedules) {
        const cell = gridData[student.id]?.[sch.subject_id] || { marks: '', isAbsent: false }
        const meta = getSubjectMeta(sch.subject_id)
        resultsToSave.push({
          exam_held_id: exam.id,
          student_id: student.id,
          student_name: student.fullNameEn,
          roll_number: student.rollNumber,
          subject_id: sch.subject_id,
          subject_name: meta.name,
          marks_obtained: cell.isAbsent ? null : cell.marks.trim() === '' ? null : Number(cell.marks),
          is_absent: cell.isAbsent,
        })
      }
    }

    const subjectMarksMap: Record<string, number> = {}
    for (const s of schedules) {
      subjectMarksMap[s.subject_id] = s.total_marks ?? exam.total_marks ?? 100
    }

    saveMutation.mutate(
      {
        results: resultsToSave,
        totalMarks: exam.total_marks ?? 100,
        subjectMarksMap,
      },
      {
        onSuccess: () => {
          setIsDirty(false)
          setSaveSuccessNotice(true)
          setTimeout(() => setSaveSuccessNotice(false), 3500)
        },
      }
    )
  }

  // Quick Auto Fill with Sample Marks
  const handleQuickFillSample = () => {
    if (!confirm('This will fill realistic mock marks for all blank cells in this exam. Proceed?')) return
    const newGrid = { ...gridData }
    for (const student of enrolledStudents) {
      if (!newGrid[student.id]) newGrid[student.id] = {}
      for (const sch of schedules) {
        const current = newGrid[student.id][sch.subject_id]
        if (!current || (current.marks === '' && !current.isAbsent)) {
          const max = sch.total_marks ?? exam.total_marks ?? 100
          // Generate 55-95 marks
          const randomMarks = Math.min(max, Math.max(35, Math.floor(max * (0.55 + Math.random() * 0.4))))
          newGrid[student.id][sch.subject_id] = {
            marks: String(randomMarks),
            isAbsent: false,
          }
        }
      }
    }
    setGridData(newGrid)
    setIsDirty(true)
  }

  // Filtered rows for display
  const sections = useMemo(() => {
    const s = new Set(enrolledStudents.map((st) => st.sectionName || 'A'))
    return ['ALL', ...Array.from(s)]
  }, [enrolledStudents])

  const filteredRows = useMemo(() => {
    return computedRows.filter((row) => {
      // 1. Search Query
      const matchesSearch =
        row.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.rollNumber.includes(searchQuery)

      // 2. Section
      const matchesSection = sectionFilter === 'ALL' || row.sectionName === sectionFilter

      // 3. Status
      let matchesStatus = true
      const hasUnentered = Object.values(row.scores).some((s) => s.marks === null && !s.isAbsent)
      if (statusFilter === 'PASSED') matchesStatus = row.isPass
      if (statusFilter === 'FAILED') matchesStatus = !row.isPass && !hasUnentered
      if (statusFilter === 'INCOMPLETE') matchesStatus = hasUnentered

      return matchesSearch && matchesSection && matchesStatus
    })
  }, [computedRows, searchQuery, sectionFilter, statusFilter])

  // Stats calculation
  const stats = useMemo(() => {
    const total = computedRows.length
    const passed = computedRows.filter((r) => r.isPass).length
    const failed = computedRows.filter((r) => !r.isPass && r.totalObtained > 0).length
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
    const topScorer = [...computedRows].sort((a, b) => b.totalObtained - a.totalObtained)[0]

    return { total, passed, failed, passRate, topScorer }
  }, [computedRows])

  if (schedules.length === 0) {
    return (
      <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center text-amber-800">
        <AlertCircle size={36} className="mx-auto mb-2 text-amber-500" />
        <h4 className="font-bold text-base">No Subjects Scheduled Yet</h4>
        <p className="text-sm text-amber-700 mt-1 max-w-md mx-auto">
          Please add subjects and dates to this exam in the Exam Management page before entering marks.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Top Action & Filter Bar ─────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search & Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-900"
            />
          </div>

          {/* Section filter */}
          {sections.length > 2 && (
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl p-1 text-xs">
              <span className="text-[10px] text-zinc-600 px-1 font-semibold uppercase">Sec:</span>
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                    sectionFilter === sec
                      ? 'bg-white shadow-xs text-indigo-700'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          )}

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl p-1 text-xs">
            {(['ALL', 'PASSED', 'FAILED', 'INCOMPLETE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-white shadow-xs text-indigo-700'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'PASSED' ? 'Passed' : st === 'FAILED' ? 'Failed' : 'Pending'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick actions & Save */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleQuickFillSample}
            title="Auto-fill blank marks for testing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-semibold hover:bg-zinc-50 hover:text-zinc-900 transition-all cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span className="hidden sm:inline">Auto Fill</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saveMutation.isPending || !isDirty}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isDirty
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
                : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            {saveMutation.isPending ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Tabulation results and grades saved successfully!
        </div>
      )}

      {/* ── Interactive Spreadsheet Table ─────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              {/* Top header row */}
              <tr className="bg-zinc-900 text-white text-[11px] uppercase tracking-wider font-semibold border-b border-zinc-800">
                <th className="py-3 px-3 w-12 text-center sticky left-0 z-20 bg-zinc-900">Roll</th>
                <th className="py-3 px-3 min-w-[160px] sticky left-12 z-20 bg-zinc-900">Student Name</th>
                <th className="py-3 px-2 w-12 text-center">Sec</th>
                {schedules.map((sch) => {
                  const meta = getSubjectMeta(sch.subject_id)
                  return (
                    <th key={sch.subject_id} className="py-3 px-2 text-center min-w-[90px] border-l border-zinc-800">
                      <div className="truncate max-w-[110px] mx-auto" title={meta.name}>
                        {meta.name}
                      </div>
                      <div className="text-[9px] text-zinc-400 font-normal">Max: {meta.totalMarks}</div>
                    </th>
                  )
                })}
                <th className="py-3 px-3 text-center min-w-[70px] border-l border-zinc-800 bg-zinc-950/80">Total</th>
                <th className="py-3 px-3 text-center min-w-[75px] bg-zinc-950/80">GPA</th>
                <th className="py-3 px-3 text-center min-w-[65px] bg-zinc-950/80">Grade</th>
                <th className="py-3 px-3 text-center min-w-[65px] bg-zinc-950/80">Rank</th>
                <th className="py-3 px-2 text-center w-10 bg-zinc-950/80"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={schedules.length + 7}
                    className="py-12 text-center text-zinc-600 font-medium"
                  >
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, studentIdx) => {
                  const isPass = row.isPass
                  const gradeColor = GRADE_COLORS[row.grade] || 'text-zinc-600 bg-zinc-100'

                  return (
                    <tr
                      key={row.studentId}
                      className={`hover:bg-indigo-50/40 transition-colors ${
                        !isPass && row.totalObtained > 0 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Roll */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-700 sticky left-0 z-10 bg-white group-hover:bg-indigo-50/40 border-r border-zinc-100">
                        {row.rollNumber}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-3 font-semibold text-zinc-900 sticky left-12 z-10 bg-white border-r border-zinc-100 truncate max-w-[160px]">
                        {row.studentName}
                      </td>

                      {/* Section */}
                      <td className="py-2.5 px-2 text-center text-zinc-600 font-medium">
                        {row.sectionName}
                      </td>

                      {/* Subject Mark Inputs */}
                      {schedules.map((sch, subjectIdx) => {
                        const score = row.scores[sch.subject_id]
                        const meta = getSubjectMeta(sch.subject_id)
                        const cellState = gridData[row.studentId]?.[sch.subject_id] || { marks: '', isAbsent: false }
                        const inputKey = `${row.studentId}__${sch.subject_id}`
                        const isInvalid =
                          cellState.marks !== '' &&
                          !cellState.isAbsent &&
                          (Number(cellState.marks) > meta.totalMarks || Number(cellState.marks) < 0)
                        const isSubjectFail = score && score.grade === 'F' && !score.isAbsent && score.marks !== null

                        return (
                          <td
                            key={sch.subject_id}
                            className={`py-1.5 px-2 text-center border-l border-zinc-100 ${
                              cellState.isAbsent
                                ? 'bg-rose-50/60'
                                : isSubjectFail
                                ? 'bg-rose-50/30'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {cellState.isAbsent ? (
                                <button
                                  type="button"
                                  onClick={() => toggleAbsent(row.studentId, sch.subject_id)}
                                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500 text-white cursor-pointer hover:bg-rose-600"
                                  title="Click to remove absent status"
                                >
                                  ABS
                                </button>
                              ) : (
                                <>
                                  <input
                                    ref={(el) => {
                                      inputRefs.current[inputKey] = el
                                    }}
                                    type="number"
                                    min={0}
                                    max={meta.totalMarks}
                                    value={cellState.marks}
                                    placeholder="—"
                                    onChange={(e) =>
                                      handleCellChange(row.studentId, sch.subject_id, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(e, studentIdx, subjectIdx)}
                                    className={`w-14 text-center py-1 px-1 rounded-lg text-xs font-mono font-bold border transition-all focus:outline-none focus:ring-2 ${
                                      isInvalid
                                        ? 'border-rose-500 bg-rose-50 text-rose-700 ring-rose-500/20'
                                        : isSubjectFail
                                        ? 'border-rose-300 bg-white text-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
                                        : cellState.marks !== ''
                                        ? 'border-zinc-300 bg-white text-zinc-900 font-bold focus:border-indigo-600 focus:ring-indigo-500/20'
                                        : 'border-zinc-200 bg-zinc-50/50 text-zinc-400 focus:border-indigo-600 focus:bg-white'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleAbsent(row.studentId, sch.subject_id)}
                                    className="text-[9px] font-bold text-zinc-400 hover:text-rose-600 px-1 py-0.5 rounded transition-colors"
                                    title="Mark as absent"
                                  >
                                    A
                                  </button>
                                </>
                              )}
                            </div>
                            {/* Small grade pill */}
                            {score && score.grade && !cellState.isAbsent && score.marks !== null && (
                              <div className="text-[9px] font-bold text-zinc-600 mt-0.5">
                                {score.grade}
                              </div>
                            )}
                          </td>
                        )
                      })}

                      {/* Total Marks */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-900 border-l border-zinc-200 bg-zinc-50/60">
                        {row.totalObtained}
                        <span className="text-[10px] text-zinc-600 block font-normal">
                          /{row.totalPossible}
                        </span>
                      </td>

                      {/* GPA */}
                      <td className="py-2.5 px-3 text-center font-mono font-extrabold text-zinc-900 bg-zinc-50/60">
                        {row.gpa > 0 ? row.gpa.toFixed(2) : isPass ? '0.00' : <span className="text-rose-600">0.00</span>}
                      </td>

                      {/* Overall Grade */}
                      <td className="py-2.5 px-3 text-center bg-zinc-50/60">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${gradeColor}`}
                        >
                          {row.grade}
                        </span>
                      </td>

                      {/* Merit Rank */}
                      <td className="py-2.5 px-3 text-center font-bold bg-zinc-50/60">
                        {row.rank ? (
                          <span
                            className={`inline-flex items-center justify-center gap-1 font-mono ${
                              row.rank === 1
                                ? 'text-amber-600 font-extrabold'
                                : row.rank <= 3
                                ? 'text-indigo-600 font-bold'
                                : 'text-zinc-700'
                            }`}
                          >
                            {row.rank === 1 && <Trophy size={11} className="text-amber-500" />}
                            #{row.rank}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Single print button */}
                      <td className="py-2.5 px-2 text-center bg-zinc-50/60">
                        <button
                          onClick={() =>
                            printStudentResultCard({
                              exam,
                              studentId: row.studentId,
                              studentName: row.studentName,
                              rollNumber: row.rollNumber,
                              results: existingResults.filter((r) => r.student_id === row.studentId),
                            })
                          }
                          title="Print individual student result card"
                          className="p-1 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom helper footnote */}
        <div className="px-4 py-3 bg-zinc-50/80 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-zinc-800">Keyboard shortcuts:</span>
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">Enter</kbd> Down ·{' '}
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">Tab</kbd> Right ·{' '}
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">Arrow Keys</kbd> Navigate
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Pass: <strong className="text-emerald-700">{stats.passed}</strong> · Fail:{' '}
              <strong className="text-rose-700">{stats.failed}</strong> · Pass Rate:{' '}
              <strong className="text-indigo-700">{stats.passRate}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
