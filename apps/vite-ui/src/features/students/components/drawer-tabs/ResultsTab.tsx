import { useState, useMemo } from 'react'
import { Award, Printer, Sparkles, BookOpen } from 'lucide-react'
import type { Student } from '../../types'
import { StudentReportCardModal } from '../modals/StudentReportCardModal'
import { getStudentResults } from '@/features/examHeld/hooks/useExamResults'
import { examStore } from '@/data/stores'
import { printStudentResultCard } from '@/features/examHeld/utils/printStudentResultCard'
import { calculateGrade } from '@/features/examHeld/types'

export function ResultsTab({ student }: { student: Student }) {
  const [reportCardOpen, setReportCardOpen] = useState(false)

  // Fetch real stored exam results for this student
  const studentResults = useMemo(() => getStudentResults(student.id), [student.id])
  const allExams = useMemo(() => examStore.getAll(), [])

  // Group by exam
  const examResultsGrouped = useMemo(() => {
    const map = new Map<string, typeof studentResults>()
    for (const r of studentResults) {
      if (!map.has(r.exam_held_id)) {
        map.set(r.exam_held_id, [])
      }
      map.get(r.exam_held_id)!.push(r)
    }

    return Array.from(map.entries()).map(([examId, results]) => {
      const exam = allExams.find((e) => e.id === examId)
      const present = results.filter((r) => !r.is_absent && r.marks_obtained !== null)
      const totalObtained = present.reduce((sum, r) => sum + (r.marks_obtained ?? 0), 0)
      const schedules = exam?.exam_held_schedules ?? []
      const totalPossible = schedules.reduce((sum, s) => sum + (s.total_marks ?? exam?.total_marks ?? 100), 0) || (results.length * 100)
      const percentage = totalPossible > 0 ? Number(((totalObtained / totalPossible) * 100).toFixed(1)) : 0
      const hasFail = results.some((r) => r.is_absent || r.grade === 'F')
      const avgGpa = results.length > 0
        ? hasFail
          ? 0.0
          : Number((results.reduce((sum, r) => sum + (r.gpa ?? 0), 0) / results.length).toFixed(2))
        : 0.0

      const overallGrade = calculateGrade(totalObtained, totalPossible).grade

      return {
        examId,
        exam,
        examName: exam?.name ?? 'Semester Examination',
        date: exam?.created_at ? new Date(exam.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '2026',
        totalMarks: totalPossible,
        obtainedMarks: totalObtained,
        percentage,
        gpa: avgGpa,
        grade: hasFail ? 'F' : overallGrade,
        status: hasFail ? 'FAILED' : 'PASSED',
        results,
      }
    })
  }, [studentResults, allExams])

  // Overall student GPA across all exams
  const overallStanding = useMemo(() => {
    if (examResultsGrouped.length === 0) {
      return { gpa: 0, grade: '—', text: 'No exam results published yet' }
    }
    const sum = examResultsGrouped.reduce((acc, e) => acc + e.gpa, 0)
    const avg = Number((sum / examResultsGrouped.length).toFixed(2))
    return {
      gpa: avg,
      grade: avg >= 4.0 ? 'A+' : avg >= 3.5 ? 'A' : avg >= 3.0 ? 'B' : 'Pass',
      text: avg >= 4.0 ? 'Top Standing' : 'Regular Progress',
    }
  }, [examResultsGrouped])

  return (
    <div className="space-y-4">
      {/* ── Academic GPA Summary Card ─────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" /> Academic Standing (2026)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black font-mono">
              {overallStanding.gpa > 0 ? `GPA ${overallStanding.gpa.toFixed(2)}` : 'GPA —'}
            </h3>
            <span className="text-xs text-indigo-200 font-semibold">({overallStanding.grade} Standing)</span>
          </div>
          <p className="text-[11px] text-indigo-200 mt-1">
            Enrolled Class: <strong className="text-white">{student.className}</strong> · Roll:{' '}
            <strong className="text-white">{student.rollNumber}</strong>
          </p>
        </div>

        <button
          onClick={() => setReportCardOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm cursor-pointer"
        >
          <Printer size={13} /> Print Summary
        </button>
      </div>

      {/* ── Exam List ─────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-indigo-600" />
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Exam Results History</h4>
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {examResultsGrouped.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
              No exam results entered for this student yet. Marks entered in the Exam Results module will appear here automatically.
            </div>
          ) : (
            examResultsGrouped.map((res, i) => (
              <div key={i} className="p-4 hover:bg-zinc-50/70 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-zinc-900 text-xs">{res.examName}</h5>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        res.status === 'PASSED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Obtained: <span className="font-bold text-zinc-800 font-mono">{res.obtainedMarks}/{res.totalMarks}</span> ({res.percentage}%) · Date: <span className="font-semibold text-zinc-700">{res.date}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-extrabold text-sm font-mono text-zinc-900">
                      {res.gpa > 0 ? `GPA ${res.gpa.toFixed(2)}` : 'GPA 0.00'}
                    </p>
                    <p
                      className={`text-[10px] font-bold ${
                        res.grade === 'F' ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      Grade: {res.grade}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (res.exam) {
                        printStudentResultCard({
                          exam: res.exam,
                          studentId: student.id,
                          studentName: student.fullNameEn,
                          rollNumber: student.rollNumber,
                          results: res.results,
                        })
                      } else {
                        setReportCardOpen(true)
                      }
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Print Result Card"
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <StudentReportCardModal
        open={reportCardOpen}
        student={student}
        onClose={() => setReportCardOpen(false)}
      />
    </div>
  )
}

