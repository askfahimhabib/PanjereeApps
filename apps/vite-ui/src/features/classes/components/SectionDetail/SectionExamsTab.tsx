import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertOctagon,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import type { SectionStudent } from '../../types'
import { useExamResults } from '@/features/examHeld/hooks/useExamResults'
import type { ExamHeld } from '@/features/examHeld/types'

interface SectionExamsTabProps {
  students: SectionStudent[]
  classExams: ExamHeld[]
}

export function SectionExamsTab({ students, classExams }: SectionExamsTabProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>(classExams[0]?.id || '')

  const currentExam = useMemo(() => {
    return classExams.find(e => e.id === selectedExamId) || classExams[0] || null
  }, [classExams, selectedExamId])

  const { data: rawResults = [] } = useExamResults(currentExam?.id ?? null)

  // Compute merit rows for students in this section
  const sectionMeritList = useMemo(() => {
    const studentIdSet = new Set(students.map(s => s.id))
    const relevantResults = rawResults.filter(r => studentIdSet.has(r.student_id))

    return students.map(student => {
      const studentResults = relevantResults.filter(r => r.student_id === student.id)
      const totalMarksObtained = studentResults.reduce((sum, r) => sum + (r.marks_obtained || 0), 0)
      const gpas = studentResults.map(r => r.gpa).filter(g => g !== undefined) as number[]
      
      const hasFail = studentResults.some(r => r.grade === 'F' || r.is_absent)
      const avgGpa = gpas.length > 0 ? Number((gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)) : (student.latestGpa ?? 0)
      
      let finalGrade = 'F'
      if (!hasFail) {
        if (avgGpa >= 5.0) finalGrade = 'A+'
        else if (avgGpa >= 4.0) finalGrade = 'A'
        else if (avgGpa >= 3.5) finalGrade = 'A-'
        else if (avgGpa >= 3.0) finalGrade = 'B'
        else if (avgGpa >= 2.0) finalGrade = 'C'
        else if (avgGpa >= 1.0) finalGrade = 'D'
      }

      return {
        student,
        totalMarks: totalMarksObtained,
        gpa: avgGpa,
        grade: finalGrade,
        isPass: !hasFail && avgGpa > 0,
        subjectsCount: studentResults.length,
      }
    }).sort((a, b) => {
      if (b.gpa !== a.gpa) return b.gpa - a.gpa
      if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks
      return a.student.roll - b.student.roll
    })
  }, [students, rawResults])

  // Grade Counts
  const gradeCounts = useMemo(() => {
    const counts = { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
    sectionMeritList.forEach(row => {
      if (counts[row.grade as keyof typeof counts] !== undefined) {
        counts[row.grade as keyof typeof counts]++
      } else {
        counts['F']++
      }
    })
    return counts
  }, [sectionMeritList])

  const passedCount = sectionMeritList.filter(r => r.isPass).length
  const passRate = sectionMeritList.length > 0 ? Math.round((passedCount / sectionMeritList.length) * 100) : 0
  const topper = sectionMeritList[0]
  const avgSectionGpa = sectionMeritList.length > 0 
    ? (sectionMeritList.reduce((sum, r) => sum + r.gpa, 0) / sectionMeritList.length).toFixed(2) 
    : '0.00'

  if (classExams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-500">
        <Trophy size={40} className="mx-auto mb-3 text-zinc-400 opacity-50" />
        <h3 className="text-base font-bold text-zinc-800">No Exams Scheduled for This Class</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Create and schedule term or monthly exams in the Exams module to see live tabulation.
        </p>
        <Link
          to="/exams/held"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all"
        >
          <span>Create New Exam</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Exam Selector Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Exam Tabulation:</span>
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {classExams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.scope})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Grade-wise rankings, BD board GPA serial, and subject breakdown
            </p>
          </div>
        </div>

        {currentExam && (
          <Link
            to={`/exams/results?examId=${currentExam.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
          >
            <FileSpreadsheet size={14} />
            <span>Full Marksheet Matrix</span>
            <ExternalLink size={12} className="ml-0.5" />
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Section Topper */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">1st Rank Topper</p>
            <p className="text-sm font-bold text-zinc-900 truncate">
              {topper?.student.fullNameEn ?? '—'}
            </p>
            <p className="text-xs font-bold text-amber-600">
              GPA {topper?.gpa.toFixed(2) ?? '0.00'} ({topper?.grade})
            </p>
          </div>
        </div>

        {/* Card 2: Average GPA */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Section Avg GPA</p>
            <p className="text-lg font-extrabold text-indigo-700">{avgSectionGpa}</p>
            <p className="text-[11px] text-zinc-500">Out of 5.00</p>
          </div>
        </div>

        {/* Card 3: Pass Rate */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-lg font-extrabold text-emerald-700">{passRate}%</p>
            <p className="text-[11px] text-zinc-500">{passedCount} of {sectionMeritList.length} Passed</p>
          </div>
        </div>

        {/* Card 4: Failed Count */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <AlertOctagon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Failed Students</p>
            <p className="text-lg font-extrabold text-rose-700">
              {sectionMeritList.length - passedCount}
            </p>
            <p className="text-[11px] text-zinc-500">Needs Remedial Attention</p>
          </div>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs">
        <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
          BD Board Grade Distribution
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
          {Object.entries(gradeCounts).map(([grade, count]) => {
            const isF = grade === 'F'
            return (
              <div
                key={grade}
                className={`p-2.5 rounded-xl border ${
                  isF
                    ? count > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                    : count > 0 ? 'bg-indigo-50/60 border-indigo-200 text-indigo-800' : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                }`}
              >
                <div className="text-xs font-black">{grade}</div>
                <div className="text-base font-extrabold mt-0.5">{count}</div>
                <div className="text-[9px] opacity-75">Students</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Merit List Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Section Merit Ranking List ({sectionMeritList.length})
          </h4>
          <span className="text-[11px] text-zinc-500">Ranked by GPA & Marks</span>
        </div>

        {/* Mobile Merit List Cards */}
        <div className="block sm:hidden divide-y divide-zinc-100">
          {sectionMeritList.map((row, index) => {
            const rank = index + 1
            return (
              <div key={row.student.id} className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs shrink-0 ${
                        rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : rank === 2
                          ? 'bg-slate-200 text-zinc-700 border border-zinc-300'
                          : rank === 3
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/students/${row.student.id}`}
                        className="font-bold text-zinc-900 hover:text-indigo-600 block text-xs truncate"
                      >
                        {row.student.fullNameEn}
                      </Link>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Roll #{String(row.student.roll).padStart(2, '0')} • {row.student.studentId}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                      row.grade === 'A+'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : row.grade === 'F'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {row.grade} ({row.gpa > 0 ? row.gpa.toFixed(2) : '0.00'})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-50">
                  <span className="text-zinc-500">
                    Marks: <strong className="font-mono text-zinc-800">{row.totalMarks > 0 ? row.totalMarks : '—'}</strong>
                  </span>
                  {row.isPass ? (
                    <span className="text-emerald-700 font-bold text-[11px]">Passed</span>
                  ) : (
                    <span className="text-rose-600 font-bold text-[11px]">Failed</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="py-3 px-4 text-center font-bold w-16">Merit Rank</th>
                <th className="py-3 px-4 text-center font-bold w-16">Roll</th>
                <th className="py-3 px-4 text-left font-bold">Student</th>
                <th className="py-3 px-4 text-center font-bold">Marks Obtained</th>
                <th className="py-3 px-4 text-center font-bold">GPA</th>
                <th className="py-3 px-4 text-center font-bold">Grade</th>
                <th className="py-3 px-4 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sectionMeritList.map((row, index) => {
                const rank = index + 1
                return (
                  <tr key={row.student.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : rank === 2
                            ? 'bg-slate-200 text-zinc-700 border border-zinc-300'
                            : rank === 3
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-indigo-700">
                      #{String(row.student.roll).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-4">
                      <Link
                        to={`/students/${row.student.id}`}
                        className="font-semibold text-zinc-900 hover:text-indigo-600 hover:underline block"
                        title="View student profile"
                      >
                        {row.student.fullNameEn}
                      </Link>
                      <div className="text-[10px] text-zinc-500 font-mono">{row.student.studentId}</div>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-medium text-zinc-800">
                      {row.totalMarks > 0 ? row.totalMarks : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-indigo-700">
                      {row.gpa > 0 ? row.gpa.toFixed(2) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          row.grade === 'A+'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.grade === 'F'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.isPass ? (
                        <span className="text-emerald-700 font-bold text-[11px]">Passed</span>
                      ) : (
                        <span className="text-rose-600 font-bold text-[11px]">Failed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
