import { useState, useMemo } from 'react'
import { X, BarChart3, Users, Trophy, TrendingUp, Eye, EyeOff, CheckCircle2, AlertCircle, Printer, FileText } from 'lucide-react'
import type { ExamHeld, ExamResult } from '../types'
import { GRADE_COLORS, EXAM_SCOPE_LABELS } from '../types'
import { useExamResults } from '../hooks/useExamResults'
import { usePublishResults } from '../hooks/useExamHeld'
import { printClassMarksheet } from '../utils/printClassMarksheet'
import { printStudentResultCard } from '../utils/printStudentResultCard'

interface Props {
  open: boolean
  exam: ExamHeld | null
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeOrder(g: string | null) {
  const order = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F']
  return order.indexOf(g ?? 'F')
}

// ─── Stat Mini Card ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50`}>
      <div className={`p-2 rounded-lg ${color} bg-current/10`}>
        <Icon size={15} className="opacity-80" />
      </div>
      <div>
        <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Grade Distribution Bar ───────────────────────────────────────────────────

function GradeDistribution({ results }: { results: ExamResult[] }) {
  const gradeKeys = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F']
  const total = results.filter(r => !r.is_absent).length || 1

  const counts = gradeKeys.reduce<Record<string, number>>((acc, g) => {
    acc[g] = results.filter(r => r.grade === g).length
    return acc
  }, {})

  const colorMap: Record<string, string> = {
    'A+': 'bg-emerald-500',
    'A':  'bg-green-500',
    'A-': 'bg-teal-500',
    'B':  'bg-blue-500',
    'C':  'bg-amber-500',
    'D':  'bg-orange-500',
    'F':  'bg-red-500',
  }

  return (
    <div className="space-y-1.5">
      {gradeKeys.map(g => {
        const count = counts[g] ?? 0
        const pct = Math.round((count / total) * 100)
        return (
          <div key={g} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-right text-slate-400 font-mono font-semibold">{g}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorMap[g]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-slate-500">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ResultSummaryModal({ open, exam, onClose }: Props) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [publishNotice, setPublishNotice] = useState<'published' | 'unpublished' | null>(null)

  const { data: allResults = [], isLoading } = useExamResults(open ? exam?.id ?? null : null)
  const publish = usePublishResults()

  const schedules = exam?.exam_held_schedules ?? []

  // Default to first subject on open
  const subjectId = activeSubject ?? schedules[0]?.subject_id ?? null

  // Effective total marks for active subject (schedule-level overrides exam-level)
  const effectiveTotalMarks = useMemo(() => {
    if (!subjectId) return exam?.total_marks ?? 100
    const sched = schedules.find(s => s.subject_id === subjectId)
    return sched?.total_marks ?? exam?.total_marks ?? 100
  }, [subjectId, schedules, exam?.total_marks])

  // Results for current subject tab
  const subjectResults = useMemo(
    () => allResults.filter(r => r.subject_id === subjectId),
    [allResults, subjectId]
  )

  // Stats for current subject
  const stats = useMemo(() => {
    const present = subjectResults.filter(r => !r.is_absent)
    const marks = present.map(r => r.marks_obtained ?? 0)
    const passed = present.filter(r => r.grade !== 'F' && r.grade !== null)
    const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0
    const highest = marks.length ? Math.max(...marks) : 0
    const lowest = marks.length ? Math.min(...marks) : 0
    const absentCount = subjectResults.filter(r => r.is_absent).length
    const topScorer = present.find(r => r.marks_obtained === highest)
    return { avg, highest, lowest, passCount: passed.length, absentCount, total: subjectResults.length, topScorer }
  }, [subjectResults])

  // Sort: roll number ascending
  const sortedRows = useMemo(
    () => [...subjectResults].sort((a, b) => {
      const ra = parseInt(a.roll_number) || 0
      const rb = parseInt(b.roll_number) || 0
      return ra - rb
    }),
    [subjectResults]
  )

  const handlePublishToggle = () => {
    if (!exam) return
    const next = !exam.result_published
    publish.mutate(
      { id: exam.id, published: next },
      {
        onSuccess: () => {
          setPublishNotice(next ? 'published' : 'unpublished')
          setTimeout(() => setPublishNotice(null), 3000)
        },
      }
    )
  }

  if (!open || !exam) return null

  const isPublished = exam.result_published

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh]">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-100 truncate">{exam.name}</h3>
              <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {EXAM_SCOPE_LABELS[exam.scope]}
              </span>
              {isPublished && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={9} />
                  Published
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Marks: <strong className="text-slate-300">{exam.total_marks}</strong>
              {exam.pass_marks && <span> · Pass: <strong className="text-slate-300">{exam.pass_marks}</strong></span>}
              <span className="ml-2">· {allResults.length} results entered</span>
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {/* Publish / Unpublish */}
            <button
              onClick={handlePublishToggle}
              disabled={publish.isPending || allResults.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isPublished
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
              {publish.isPending
                ? 'Saving...'
                : isPublished
                ? 'Unpublish'
                : 'Publish Results'}
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Publish notice ──────────────────────────────────────────────────── */}
        {publishNotice && (
          <div className={`flex items-center gap-2 mx-6 mt-3 px-4 py-2.5 rounded-xl text-sm flex-shrink-0 ${
            publishNotice === 'published'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
          }`}>
            {publishNotice === 'published' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {publishNotice === 'published'
              ? 'Results published! Students can now view their results.'
              : 'Results unpublished. Students can no longer view results.'}
          </div>
        )}

        {/* ── No results warning ──────────────────────────────────────────────── */}
        {!isLoading && allResults.length === 0 && (
          <div className="flex items-center gap-3 mx-6 mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex-shrink-0">
            <AlertCircle size={16} />
            No results entered yet. Use "Enter Results" to add marks first.
          </div>
        )}

        {/* ── Subject Tabs ────────────────────────────────────────────────────── */}
        {schedules.length > 1 && (
          <div className="flex gap-1 px-6 pt-4 overflow-x-auto flex-shrink-0">
            {schedules.map(s => {
              const name = s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id
              const isActive = (activeSubject ?? schedules[0]?.subject_id) === s.subject_id
              const subRes = allResults.filter(r => r.subject_id === s.subject_id)
              return (
                <button
                  key={s.subject_id}
                  onClick={() => setActiveSubject(s.subject_id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                      : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                  }`}
                >
                  {name}
                  <span className="ml-1.5 opacity-60">({subRes.length})</span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-800/60" />
              ))}
            </div>
          ) : subjectResults.length === 0 && allResults.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <BarChart3 size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No results for this subject yet</p>
            </div>
          ) : subjectResults.length > 0 ? (
            <div className="space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatCard icon={Users} label="Total Students" value={stats.total} color="text-blue-400" />
                <StatCard icon={CheckCircle2} label={`Passed (${stats.total ? Math.round((stats.passCount / (stats.total - stats.absentCount || 1)) * 100) : 0}%)`} value={stats.passCount} color="text-emerald-400" />
                <StatCard icon={TrendingUp} label="Avg Marks" value={stats.avg.toFixed(1)} color="text-purple-400" />
                <StatCard icon={Trophy} label="Highest" value={stats.highest} color="text-amber-400" />
              </div>

              {/* Top scorer */}
              {stats.topScorer && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <Trophy size={14} className="text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-300">
                    Top scorer: <strong>{stats.topScorer.student_name}</strong> (Roll {stats.topScorer.roll_number}) — {stats.topScorer.marks_obtained}/{exam.total_marks}
                  </p>
                </div>
              )}

              {/* Two-column layout: table + grade dist */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">

                {/* Result table */}
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                  {/* Column headers */}
                  <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_4.5rem_4rem_2rem] gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2 border-b border-slate-700/50">
                    <span>#</span>
                    <span>Student</span>
                    <span className="text-center">Marks</span>
                    <span className="text-center">/ {effectiveTotalMarks}</span>
                    <span className="text-center">Grade</span>
                    <span className="text-center">GPA</span>
                    <span />
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {sortedRows.map((row, idx) => {
                      const gradeColor = row.grade ? GRADE_COLORS[row.grade] ?? '' : ''
                      const isFail = row.grade === 'F' || row.is_absent
                      return (
                        <div
                          key={row.id}
                          className={`grid grid-cols-[2.5rem_1fr_5rem_5rem_4.5rem_4rem_2rem] gap-2 items-center px-4 py-2.5 transition-colors hover:bg-slate-800/40 ${
                            row.is_absent ? 'opacity-50' : isFail ? 'bg-red-500/3' : ''
                          }`}
                        >
                          <span className="text-xs font-mono text-slate-500">{row.roll_number}</span>
                          <span className="text-sm text-slate-200 truncate">{row.student_name}</span>
                          <span className="text-sm text-center font-mono font-medium text-slate-300">
                            {row.is_absent ? '—' : (row.marks_obtained ?? '—')}
                          </span>
                          <span className="text-xs text-center text-slate-600">/ {effectiveTotalMarks}</span>
                          <span className={`text-[11px] font-bold text-center px-1.5 py-0.5 rounded border mx-auto ${gradeColor || 'text-slate-600 border-transparent'}`}>
                            {row.is_absent ? 'ABS' : (row.grade ?? '—')}
                          </span>
                          <span className="text-xs text-center text-slate-400 font-mono">
                            {row.is_absent ? '—' : (row.gpa?.toFixed(2) ?? '—')}
                          </span>
                          {/* Per-student print button */}
                          <button
                            title="Print Result Card"
                            onClick={() => printStudentResultCard({
                              exam: exam!,
                              studentId: row.student_id,
                              studentName: row.student_name,
                              rollNumber: row.roll_number,
                              results: allResults.filter(r => r.student_id === row.student_id),
                            })}
                            className="flex items-center justify-center text-slate-600 hover:text-blue-400 transition-colors"
                          >
                            <FileText size={13} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Grade distribution */}
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Grade Distribution</p>
                  <GradeDistribution results={subjectResults} />
                  <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Absent</span>
                      <span className="text-red-400 font-medium">{stats.absentCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Lowest</span>
                      <span className="text-slate-300 font-mono">{stats.lowest}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Print Class Marksheet */}
            {allResults.length > 0 && (
              <button
                onClick={() => printClassMarksheet({ exam: exam!, results: allResults })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
              >
                <Printer size={13} />
                Print Marksheet
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-600">
              {isPublished
                ? '✅ Results are visible to students'
                : '🔒 Results are hidden from students'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
