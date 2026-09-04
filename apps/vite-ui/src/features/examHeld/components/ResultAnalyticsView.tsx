import { useMemo } from 'react'
import {
  Trophy,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react'
import type { ExamHeld, StudentTabulationRow } from '../types'

interface Props {
  exam: ExamHeld
  students: StudentTabulationRow[]
}

const GRADE_BAR_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500',
  'A':  'bg-green-500',
  'A-': 'bg-teal-500',
  'B':  'bg-blue-500',
  'C':  'bg-amber-500',
  'D':  'bg-orange-500',
  'F':  'bg-rose-500',
}

export function ResultAnalyticsView({ exam, students }: Props) {
  const schedules = useMemo(() => exam.exam_held_schedules ?? [], [exam.exam_held_schedules])

  // 1. Grade Distribution
  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
    students.forEach((s) => {
      if (s.grade && dist[s.grade] !== undefined) {
        dist[s.grade]++
      }
    })
    return dist
  }, [students])


  // 2. Summary stats
  const stats = useMemo(() => {
    const total = students.length || 1
    const passed = students.filter((s) => s.isPass).length
    const failed = students.filter((s) => !s.isPass && s.totalObtained > 0).length
    const passRate = Math.round((passed / total) * 100)

    const presentStudents = students.filter((s) => s.totalObtained > 0)
    const avgGpa = presentStudents.length
      ? presentStudents.reduce((sum, s) => sum + s.gpa, 0) / presentStudents.length
      : 0
    const avgMarks = presentStudents.length
      ? presentStudents.reduce((sum, s) => sum + s.totalObtained, 0) / presentStudents.length
      : 0

    const topScorer = [...students].sort((a, b) => b.totalObtained - a.totalObtained)[0]

    return { total: students.length, passed, failed, passRate, avgGpa, avgMarks, topScorer }
  }, [students])

  // 3. Top 10 Merit List
  const top10Merit = useMemo(() => {
    return students
      .filter((s) => s.isPass)
      .slice(0, 10)
  }, [students])

  // 4. Subject-wise Analysis
  const subjectAnalytics = useMemo(() => {
    return schedules.map((sch) => {
      const name = sch.subjects?.name_bn ?? sch.subjects?.name ?? sch.subject_id
      const totalMarks = sch.total_marks ?? exam.total_marks ?? 100
      const passMarks = sch.pass_marks ?? exam.pass_marks ?? 33

      let appeared = 0
      let passed = 0
      let failed = 0
      let totalObtainedSum = 0
      let highest = 0

      students.forEach((stu) => {
        const score = stu.scores[sch.subject_id]
        if (score && score.marks !== null && !score.isAbsent) {
          appeared++
          totalObtainedSum += score.marks
          if (score.marks >= passMarks) passed++
          else failed++
          if (score.marks > highest) highest = score.marks
        }
      })

      const passRate = appeared > 0 ? Math.round((passed / appeared) * 100) : 0
      const avg = appeared > 0 ? Math.round(totalObtainedSum / appeared) : 0

      return {
        subjectId: sch.subject_id,
        name,
        totalMarks,
        passMarks,
        appeared,
        passed,
        failed,
        passRate,
        avg,
        highest,
      }
    })
  }, [schedules, students, exam.total_marks, exam.pass_marks])

  // 5. Weak Students Spotlight (students failed in 1+ subjects)
  const weakStudents = useMemo(() => {
    return students.filter((s) => !s.isPass && s.failedCount > 0)
  }, [students])

  return (
    <div className="space-y-6">
      {/* ── Key Performance Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Rate */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 font-mono">{stats.passRate}%</div>
            <div className="text-[11px] text-zinc-500 font-medium">
              Pass Rate ({stats.passed}/{stats.total})
            </div>
          </div>
        </div>

        {/* Class Average GPA */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 font-mono">
              {stats.avgGpa.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Class Average GPA</div>
          </div>
        </div>

        {/* Highest Scorer */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Trophy size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-zinc-900 truncate">
              {stats.topScorer ? stats.topScorer.studentName : '—'}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              Top Scorer ({stats.topScorer?.totalObtained ?? 0} marks)
            </div>
          </div>
        </div>

        {/* Failed Students */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
            <XCircle size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-700 font-mono">{stats.failed}</div>
            <div className="text-[11px] text-zinc-500 font-medium">Unsuccessful Students</div>
          </div>
        </div>
      </div>

      {/* ── Top 10 Merit List & Grade Distribution Grid ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top 10 Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <h3 className="font-bold text-sm text-zinc-900">Top 10 Merit List</h3>
            </div>
            <span className="text-xs text-zinc-500 font-medium">{top10Merit.length} students</span>
          </div>

          <div className="divide-y divide-zinc-100 flex-1">
            {top10Merit.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No passed students found to rank yet.
              </div>
            ) : (
              top10Merit.map((stu, idx) => {
                return (
                  <div
                    key={stu.studentId}
                    className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono shadow-xs ${
                          idx === 0
                            ? 'bg-amber-500 text-white'
                            : idx === 1
                            ? 'bg-slate-400 text-white'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-zinc-900">{stu.studentName}</div>
                        <div className="text-[11px] text-zinc-500">
                          Roll: <span className="font-mono font-semibold">{stu.rollNumber}</span> · Section: {stu.sectionName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold text-zinc-900 font-mono">
                          {stu.totalObtained}/{stu.totalPossible}
                        </div>
                        <div className="text-[10px] text-zinc-500">{stu.percentage}%</div>
                      </div>

                      <div className="text-right min-w-[50px]">
                        <div className="text-xs font-extrabold text-indigo-700 font-mono">
                          GPA {stu.gpa.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700">{stu.grade}</div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Grade Distribution */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-zinc-900">Grade Breakdown</h3>
            </div>

            <div className="space-y-2.5">
              {Object.entries(gradeDistribution).map(([grade, count]) => {
                const total = students.length || 1
                const pct = Math.round((count / total) * 100)
                const barColor = GRADE_BAR_COLORS[grade] || 'bg-zinc-400'

                return (
                  <div key={grade} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-700">
                      <span>Grade {grade}</span>
                      <span className="font-mono text-zinc-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Grading Rule:</span>
            <span className="font-semibold text-zinc-800">BD Education Board</span>
          </div>
        </div>
      </div>

      {/* ── Subject-Wise Performance Breakdown ─────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" />
          <h3 className="font-bold text-sm text-zinc-900">Subject Performance Analysis</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] sm:min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-200/80 text-[11px] text-zinc-500 uppercase font-semibold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center">Appeared</th>
                <th className="py-3 px-3 text-center">Pass Rate</th>
                <th className="py-3 px-3 text-center">Class Average</th>
                <th className="py-3 px-3 text-center">Highest Score</th>
                <th className="py-3 px-3 text-center">Failed Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {subjectAnalytics.map((sub) => (
                <tr key={sub.subjectId} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-900">{sub.name}</td>
                  <td className="py-3 px-3 text-center text-zinc-600 font-mono">{sub.appeared}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                        sub.passRate >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.passRate >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.passRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-zinc-800 font-mono">
                    {sub.avg} <span className="text-[10px] text-zinc-400 font-normal">/{sub.totalMarks}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700 font-mono">
                    {sub.highest}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sub.failed > 0 ? (
                      <span className="font-bold text-rose-600 font-mono">{sub.failed}</span>
                    ) : (
                      <span className="text-zinc-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Weak Students Spotlight ───────────────────────────────── */}
      {weakStudents.length > 0 && (
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-rose-600" />
            <h3 className="font-bold text-sm text-rose-950">Students Requiring Special Attention</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
              {weakStudents.length} Students
            </span>
          </div>
          <p className="text-xs text-rose-700 mb-4">
            The following students have failed in one or more subjects and need remedial tutoring or parent counseling.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakStudents.map((stu) => {
              const failedSubjects = Object.values(stu.scores).filter(
                (s) => s.grade === 'F' || s.isAbsent
              )

              return (
                <div
                  key={stu.studentId}
                  className="bg-white border border-rose-200 rounded-xl p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-zinc-500">#{stu.rollNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      Failed in {stu.failedCount} {stu.failedCount === 1 ? 'subject' : 'subjects'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 mt-1">{stu.studentName}</h4>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Section {stu.sectionName}</div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex flex-wrap gap-1">
                    {failedSubjects.map((fs) => (
                      <span
                        key={fs.subjectId}
                        className="text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded"
                      >
                        {fs.subjectName}: {fs.isAbsent ? 'Absent' : fs.marks}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
