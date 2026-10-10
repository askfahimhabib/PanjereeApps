import { useState, useMemo, useEffect } from 'react'
import {
  Award,
  Printer,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { examStore } from '@/data/stores'
import { examResultStore } from '@/features/examHeld/hooks/useExamResults'
import { subscribeStores } from '@/lib/localStore'
import { getInstitutionInfo } from '@/lib/institutionInfo'
import { printStudentResultCard } from '@/features/examHeld/utils/printStudentResultCard'

export function StudentResults() {
  const { student } = useStudentSession()
  const inst = getInstitutionInfo()
  const [, setTick] = useState(0)

  useEffect(() => {
    return subscribeStores(['exam_results', 'exam_held'], () => {
      setTick((t) => t + 1)
    })
  }, [])

  // Published exams scoped to this student's class/batch or where student has results
  const publishedExams = useMemo(() => {
    const all = examStore.getAll()
    const published = all.filter((e) => e.result_published)
    const studentResultRecords = examResultStore.getWhere((r) => r.student_id === student.id)
    const studentExamIds = new Set(studentResultRecords.map((r) => r.exam_held_id))

    const scoped = published.filter((e) => {
      if (studentExamIds.has(e.id)) return true
      if (student.classId && e.class_id === student.classId) return true
      if (student.batchId && (
        e.batch_id === student.batchId ||
        (student.batchId === 'bat-001' && e.batch_id === 'batch-ssc-2024') ||
        (student.batchId === 'batch-ssc-2024' && e.batch_id === 'bat-001')
      )) return true
      if (e.classes && student.className && e.classes.name.toLowerCase() === student.className.toLowerCase()) return true
      return false
    })

    return scoped
  }, [student.id, student.classId, student.batchId, student.className])

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return publishedExams[0]?.id || ''
  })

  // Ensure selected exam stays valid if published exams change
  useEffect(() => {
    if (publishedExams.length > 0 && !publishedExams.some((e) => e.id === selectedExamId)) {
      setSelectedExamId(publishedExams[0].id)
    }
  }, [publishedExams, selectedExamId])

  // Selected Exam Object
  const selectedExam = useMemo(() => {
    return examStore.getOne(selectedExamId) || publishedExams[0]
  }, [selectedExamId, publishedExams])

  // Results for the logged-in student in the selected exam
  const studentResults = useMemo(() => {
    return examResultStore.getWhere(
      (r) => r.student_id === student.id && r.exam_held_id === selectedExamId
    )
  }, [student.id, selectedExamId])

  // Calculate student overall performance in this exam
  const metrics = useMemo(() => {
    if (studentResults.length === 0) {
      return {
        hasResults: false,
        totalObtained: 0,
        totalFullMarks: 0,
        percentage: 0,
        gpa: '0.00',
        grade: 'N/A',
        isPass: false,
        standing: 'N/A',
      }
    }

    const totalObtained = studentResults.reduce((acc, r) => acc + (r.marks_obtained || 0), 0)
    const totalFullMarks = studentResults.length * 100
    const percentage = totalFullMarks > 0 ? Math.round((totalObtained / totalFullMarks) * 100) : 0

    const validGpas = studentResults.filter((r) => typeof r.gpa === 'number')
    const hasFail = studentResults.some((r) => r.grade === 'F' || r.is_absent)
    const avgGpa = validGpas.length > 0
      ? (validGpas.reduce((acc, r) => acc + (r.gpa || 0), 0) / validGpas.length).toFixed(2)
      : '0.00'

    const finalGpa = hasFail ? '0.00' : avgGpa
    const numGpa = Number(finalGpa)
    const grade = hasFail
      ? 'F'
      : numGpa >= 5.0
      ? 'A+'
      : numGpa >= 4.0
      ? 'A'
      : numGpa >= 3.5
      ? 'A-'
      : numGpa >= 3.0
      ? 'B'
      : numGpa >= 2.0
      ? 'C'
      : numGpa >= 1.0
      ? 'D'
      : 'F'

    // Compute rank within this exam
    const allExamResults = examResultStore.getWhere((r) => r.exam_held_id === selectedExamId)
    const studentTotalsMap = new Map<string, number>()
    for (const r of allExamResults) {
      studentTotalsMap.set(r.student_id, (studentTotalsMap.get(r.student_id) || 0) + (r.marks_obtained || 0))
    }
    const sorted = Array.from(studentTotalsMap.entries()).sort((a, b) => b[1] - a[1])
    const rankIndex = sorted.findIndex(([sId]) => sId === student.id)
    const rankNumber = rankIndex + 1
    const standing =
      rankIndex !== -1
        ? `${rankNumber}${rankNumber === 1 ? 'st' : rankNumber === 2 ? 'nd' : rankNumber === 3 ? 'rd' : 'th'} Position`
        : 'Participated'

    return {
      hasResults: true,
      totalObtained,
      totalFullMarks,
      percentage,
      gpa: finalGpa,
      grade,
      isPass: !hasFail && numGpa >= 1.0,
      standing,
    }
  }, [studentResults, selectedExamId, student.id])

  // Progress Trajectory data for all exams
  const trajectoryPoints = useMemo(() => {
    return publishedExams.map((e, idx) => {
      const resultsForExam = examResultStore.getWhere(
        (r) => r.student_id === student.id && r.exam_held_id === e.id
      )
      const validGpas = resultsForExam.filter((r) => typeof r.gpa === 'number')
      const gpa = validGpas.length > 0
        ? validGpas.reduce((acc, r) => acc + (r.gpa || 0), 0) / validGpas.length
        : 0

      const x = 70 + idx * 260
      // Scale GPA (0 to 5) to Y (100 to 20)
      const y = Math.max(20, Math.min(100, Math.round(100 - (gpa / 5.0) * 80)))
      return {
        examName: e.name || `Exam ${idx + 1}`,
        gpa,
        x,
        y,
        hasResults: resultsForExam.length > 0,
      }
    })
  }, [publishedExams, student.id])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Award className="text-blue-500" size={22} />
            Academic Results & Marksheet (পরীক্ষার ফলাফল)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Exam marksheets, grade reports, and GPA performance for {student.fullNameEn}
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedExam && studentResults.length > 0) {
              printStudentResultCard({
                exam: selectedExam,
                studentId: student.id,
                studentName: student.fullNameEn,
                rollNumber: student.rollNumber,
                results: studentResults,
              })
            } else {
              window.print()
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Printer size={15} />
          Print Marksheet
        </button>
      </div>

      {/* Term Selector Tabs or Empty State */}
      {publishedExams.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award size={24} />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No Published Examination Results Found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Official terminal assessment results for {student.fullNameEn} ({student.className || student.batchName}) have not been published by administration yet.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {publishedExams.map((exam) => {
          const isSelected = selectedExamId === exam.id
          return (
            <button
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
              }`}
            >
              <span>{exam.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              }`}>
                {exam.result_published ? 'Published' : 'Upcoming'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Overview Cards (GPA, Total Marks, Position) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-xs font-medium text-blue-100">Overall Grade Point Average</span>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                {metrics.hasResults ? metrics.gpa : '—'}
              </span>
              <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-md">
                Grade {metrics.hasResults ? metrics.grade : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-blue-100/80 mt-1">
              Scale of 5.00 • {metrics.hasResults ? (metrics.isPass ? 'Passed with Distinction' : 'Academic Retake Required') : 'Result under evaluation'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Marks Obtained</span>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {metrics.hasResults ? metrics.totalObtained : '—'}
              </span>
              <span className="text-xs text-zinc-400">
                {metrics.hasResults ? `/ ${metrics.totalFullMarks} Full Marks` : ''}
              </span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {metrics.hasResults ? `Percentage: ${metrics.percentage}%` : 'Evaluation in progress'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Class Standing / Rank</span>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {metrics.hasResults ? metrics.standing : '—'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Merit List Rank in {student.className || 'Class 10'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status & Remarks</span>
          <div className="mt-3">
            <div className={`flex items-center gap-1.5 font-bold text-base ${
              metrics.hasResults && metrics.isPass
                ? 'text-emerald-600'
                : metrics.hasResults
                ? 'text-rose-600'
                : 'text-amber-600'
            }`}>
              {metrics.hasResults ? (
                metrics.isPass ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />
              ) : (
                <FileQuestion size={20} />
              )}
              <span>
                {metrics.hasResults ? (metrics.isPass ? 'PROMOTED / PASSED' : 'RETAKE / FAILED') : 'AWAITING PUBLICATION'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {metrics.hasResults
                ? (metrics.isPass ? 'Remark: Satisfactory progress' : 'Remark: Requires improvement in subjects')
                : 'Tabulation sheet in preparation'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Subject-wise Marksheet Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Subject Marksheet & Grade Breakdown
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Official score distribution for {selectedExam?.name || 'Selected Examination'}
            </p>
          </div>
        </div>

        {studentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Subject ID</th>
                  <th className="py-3 px-4 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Full Marks</th>
                  <th className="py-3 px-4 text-center">Letter Grade</th>
                  <th className="py-3 px-4 text-center">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {studentResults.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.subject_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500">
                      {item.subject_id}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {item.is_absent ? (
                        <span className="text-rose-600">ABSENT</span>
                      ) : (
                        item.marks_obtained
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                      100
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                        item.grade === 'A+'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : item.grade === 'A'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : item.grade === 'F'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {item.grade || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-blue-600 dark:text-blue-400">
                      {item.gpa !== null && item.gpa !== undefined ? item.gpa.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center space-y-2">
            <FileQuestion size={36} className="mx-auto text-zinc-400" />
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              No results published yet for this examination
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Evaluation papers are currently being reviewed by the examination committee. Published grades will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Performance Trajectory Graph (Pure SVG Area Graph with Gradient) */}
      {trajectoryPoints.some((p) => p.hasResults) && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={18} />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                GPA Trajectory & Academic Growth (অগ্রগতি চার্ট)
              </h3>
            </div>
            <span className="text-xs text-zinc-400">Session {inst.session}</span>
          </div>

          <div className="w-full overflow-hidden pt-2">
            <svg viewBox="0 0 700 120" className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid horizontal lines */}
              <line x1="0" y1="20" x2="700" y2="20" stroke="#88888820" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="700" y2="60" stroke="#88888820" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="#88888820" strokeDasharray="3 3" />

              {/* Area line stroke */}
              {trajectoryPoints.length > 1 && (
                <path
                  d={trajectoryPoints.reduce(
                    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  )}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Data Points with Markers */}
              {trajectoryPoints.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="6" fill="#3b82f6" className="drop-shadow-md" />
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill="#3b82f6"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {pt.hasResults ? pt.gpa.toFixed(2) : '—'}
                  </text>
                  <text
                    x={pt.x}
                    y={118}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {pt.examName}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

