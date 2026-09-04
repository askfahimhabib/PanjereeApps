import { useState } from 'react'
import {
  Trophy,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { AcademicReportSummary } from '../types'
import { GRADE_COLORS } from '../../examHeld/types'

interface Props {
  data: AcademicReportSummary
  selectedExamId?: string | null
  onSelectExam?: (examId: string) => void
}

export function AcademicReportsTab({ data, selectedExamId, onSelectExam }: Props) {
  const [internalExamId, setInternalExamId] = useState<string | null>(
    selectedExamId || data.publishedExamsList[0]?.id || null
  )

  const currentExamId = selectedExamId !== undefined ? selectedExamId : internalExamId

  const handleExamChange = (id: string) => {
    setInternalExamId(id)
    if (onSelectExam) onSelectExam(id)
  }

  // If no published exams exist in the system yet
  if (!data.hasPublishedExams || !data.activeExamDetail) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-10 text-center shadow-xs max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No Published Examination Results</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
            There are currently {data.totalExamsHeld} examination(s) created in the system, but none have results officially published yet.
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-left text-xs text-zinc-600 space-y-2">
            <p className="font-semibold text-zinc-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-500" />
              How to view Academic Analytics here:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-500 pl-1">
              <li>Navigate to <strong className="text-zinc-700">Examinations &gt; Exam Held</strong>.</li>
              <li>Input subject marks for students using the Tabulation Sheet.</li>
              <li>Toggle <strong className="text-zinc-700">"Publish Results"</strong> to make marks active.</li>
              <li>Instant institutional pass rates, grade distributions, and merit lists will show up here.</li>
            </ol>
          </div>
          <div className="mt-6">
            <a
              href="/exam-held"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Manage Exam Schedules &amp; Marks</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    )
  }

  const exam = data.activeExamDetail

  return (
    <div className="space-y-6">
      {/* ── 1. Exam Selector & Target Banner ───────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900">{exam.examName}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Published
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Cohort: <strong className="text-zinc-700">{exam.targetName}</strong> · Date: {exam.date}
            </p>
          </div>
        </div>

        {/* Dropdown to switch exam */}
        {data.publishedExamsList.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Select Exam:</span>
            <select
              value={currentExamId || ''}
              onChange={(e) => handleExamChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 font-semibold focus:outline-none focus:border-zinc-400"
            >
              {data.publishedExamsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.targetName}) - {e.passRate}% Pass
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── 2. Top Academic Performance KPIs ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Examinees</span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{exam.totalExaminees}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Students evaluated</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Overall Pass Rate</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{exam.passRate}%</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {exam.passedCount} Passed · {exam.failedCount} Failed
          </p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Cohort Average GPA</span>
            <Award size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{exam.avgGpa.toFixed(2)}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Scale: 5.00 Maximum</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">A+ Achievers</span>
            <Trophy size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {exam.gradeDistribution.find((g) => g.grade === 'A+')?.count || 0}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Top tier students</p>
        </div>
      </div>

      {/* ── 3. Grade Distribution & Subject Performance ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Grade Distribution Chart */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Letter Grade Distribution</h4>
              <p className="text-xs text-zinc-500">Breakdown of students across GPA brackets</p>
            </div>
          </div>

          <div className="space-y-3">
            {exam.gradeDistribution.map((g) => (
              <div key={g.grade} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-7 text-center py-0.5 rounded text-[11px] font-bold border ${
                        GRADE_COLORS[g.grade] || 'text-zinc-600 border-zinc-200 bg-zinc-50'
                      }`}
                    >
                      {g.grade}
                    </span>
                    <span className="text-zinc-500 text-[11px]">GPA {g.gpa.toFixed(1)}</span>
                  </div>
                  <span className="font-bold text-zinc-800">
                    {g.count} <span className="text-[10px] text-zinc-400 font-normal">({g.percentage}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.grade === 'A+' || g.grade === 'A'
                        ? 'bg-emerald-500'
                        : g.grade === 'A-' || g.grade === 'B'
                        ? 'bg-blue-500'
                        : g.grade === 'C' || g.grade === 'D'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-wise Performance Table */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Subject-wise Performance &amp; Benchmark</h4>
              <p className="text-xs text-zinc-500">Average marks, pass percentages, and class highest scores</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">
              {exam.subjectAverages.length} Subjects
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] sm:min-w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
                <tr>
                  <th className="px-3.5 py-2.5">Subject</th>
                  <th className="px-3.5 py-2.5 text-center">Total Marks</th>
                  <th className="px-3.5 py-2.5 text-center">Class Avg</th>
                  <th className="px-3.5 py-2.5 text-center">Pass Rate</th>
                  <th className="px-3.5 py-2.5 text-right">Class Highest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {exam.subjectAverages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3.5 py-6 text-center text-zinc-400">
                      No subjects tabulated for this exam.
                    </td>
                  </tr>
                ) : (
                  exam.subjectAverages.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-3.5 py-2.5 font-semibold text-zinc-900">{sub.subjectName}</td>
                      <td className="px-3.5 py-2.5 text-center text-zinc-500 font-mono">{sub.totalMarks}</td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-zinc-800">
                        {sub.avgMarks}
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {' '}({Math.round((sub.avgMarks / sub.totalMarks) * 100)}%)
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] ${
                            sub.passPct >= 80
                              ? 'bg-emerald-50 text-emerald-700'
                              : sub.passPct >= 60
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {sub.passPct}%
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-indigo-600">
                        {sub.highestMarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 4. Official Top 10 Merit List ───────────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Official Exam Merit List &amp; Top Performers</h4>
              <p className="text-xs text-zinc-500">
                Top ranking students based on cumulative marks and overall GPA
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            Top {exam.meritToppers.length}
          </span>
        </div>

        {/* Mobile Merit Cards */}
        <div className="block sm:hidden space-y-3">
          {exam.meritToppers.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-xs bg-zinc-50 rounded-xl">
              No examinees ranked yet.
            </div>
          ) : (
            exam.meritToppers.map((t) => (
              <div key={t.studentId} className="p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        t.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : t.rank === 2
                          ? 'bg-zinc-300 text-zinc-900'
                          : t.rank === 3
                          ? 'bg-amber-700 text-amber-50'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {t.rank}
                    </span>
                    <div>
                      <h5 className="font-bold text-zinc-900 text-xs">{t.name}</h5>
                      <span className="text-[10px] text-zinc-400 font-mono">Roll: {t.rollNumber} · {t.className}</span>
                    </div>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                      GRADE_COLORS[t.grade] || 'text-zinc-700 bg-zinc-100 border-zinc-200'
                    }`}
                  >
                    Grade {t.grade}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Total Marks</span>
                    <span className="font-mono font-bold text-zinc-800">
                      {t.totalMarks} <span className="text-zinc-400 font-normal">/ {t.maxMarks}</span>
                      <span className="text-zinc-500 font-normal text-[11px]"> ({t.percentage}%)</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">GPA</span>
                    <span className="font-mono font-bold text-indigo-600 text-sm">
                      {t.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll &amp; Class</th>
                <th className="px-4 py-3 text-center">Marks Obtained</th>
                <th className="px-4 py-3 text-center">Percentage</th>
                <th className="px-4 py-3 text-center">GPA</th>
                <th className="px-4 py-3 text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {exam.meritToppers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    No examinees ranked yet.
                  </td>
                </tr>
              ) : (
                exam.meritToppers.map((t) => (
                    <tr key={t.studentId} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            t.rank === 1
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : t.rank === 2
                              ? 'bg-zinc-300 text-zinc-900'
                              : t.rank === 3
                              ? 'bg-amber-700 text-amber-50'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {t.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900">{t.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-zinc-700">Roll: {t.rollNumber}</span>
                        <span className="text-[10px] text-zinc-400 block">{t.className}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-zinc-800">
                        {t.totalMarks} <span className="text-zinc-400 font-normal">/ {t.maxMarks}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-zinc-800">
                        {t.percentage}%
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-600 font-mono">
                        {t.gpa.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] border ${
                            GRADE_COLORS[t.grade] || 'text-zinc-700 bg-zinc-100 border-zinc-200'
                          }`}
                        >
                          {t.grade}
                        </span>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
