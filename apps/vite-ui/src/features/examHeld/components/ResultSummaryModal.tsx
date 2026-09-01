import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
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

// ─── Stat Mini Card ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  bg: string
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
      <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-black font-mono leading-none text-zinc-900">{value}</p>
        <p className="text-[11px] font-semibold text-zinc-500 mt-1">{label}</p>
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
    'F':  'bg-rose-500',
  }

  return (
    <div className="space-y-2">
      {gradeKeys.map(g => {
        const count = counts[g] ?? 0
        const pct = Math.round((count / total) * 100)
        return (
          <div key={g} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-right text-zinc-700 font-mono font-bold">{g}</span>
            <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorMap[g]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-zinc-500 font-mono text-[11px]">{count}</span>
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-150">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-zinc-900 truncate">{exam.name}</h3>
              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                {EXAM_SCOPE_LABELS[exam.scope]}
              </span>
              {isPublished && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} />
                  Published
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Total Marks: <strong className="text-zinc-800">{exam.total_marks}</strong>
              {exam.pass_marks && <span> · Pass: <strong className="text-zinc-800">{exam.pass_marks}</strong></span>}
              <span className="ml-2">· {allResults.length} marks entries loaded</span>
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {/* Publish / Unpublish */}
            <button
              type="button"
              onClick={handlePublishToggle}
              disabled={publish.isPending || allResults.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isPublished
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
              {publish.isPending
                ? 'Saving...'
                : isPublished
                ? 'Unpublish'
                : 'Publish Results'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Publish notice ──────────────────────────────────────────────────── */}
        {publishNotice && (
          <div className={`flex items-center gap-2 mx-6 mt-4 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-xs flex-shrink-0 ${
            publishNotice === 'published'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}>
            {publishNotice === 'published' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {publishNotice === 'published'
              ? 'Results published! Students can now view their marks in student portal.'
              : 'Results unpublished. Result details are now hidden from students.'}
          </div>
        )}

        {/* ── No results warning ──────────────────────────────────────────────── */}
        {!isLoading && allResults.length === 0 && (
          <div className="flex items-center gap-2.5 mx-6 mt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex-shrink-0 font-medium">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>No results entered yet. Use &ldquo;Tabulation & Marks&rdquo; to add marks first.</span>
          </div>
        )}

        {/* ── Subject Tabs ────────────────────────────────────────────────────── */}
        {schedules.length > 1 && (
          <div className="flex gap-1.5 px-6 pt-4 overflow-x-auto flex-shrink-0 border-b border-zinc-100 pb-2">
            {schedules.map(s => {
              const name = s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id
              const isActive = (activeSubject ?? schedules[0]?.subject_id) === s.subject_id
              const subRes = allResults.filter(r => r.subject_id === s.subject_id)
              return (
                <button
                  key={s.subject_id}
                  type="button"
                  onClick={() => setActiveSubject(s.subject_id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {name}
                  <span className={`ml-1.5 text-[10px] font-mono ${isActive ? 'text-indigo-100' : 'text-zinc-400'}`}>
                    ({subRes.length})
                  </span>
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
                <div key={i} className="h-10 rounded-xl bg-zinc-100" />
              ))}
            </div>
          ) : subjectResults.length === 0 && allResults.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <BarChart3 size={32} className="mb-3 opacity-40 text-zinc-400" />
              <p className="text-sm font-semibold">No results entered for this subject yet</p>
            </div>
          ) : subjectResults.length > 0 ? (
            <div className="space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Users} label="Total Students" value={stats.total} color="text-blue-700" bg="bg-blue-100" />
                <StatCard icon={CheckCircle2} label={`Passed (${stats.total ? Math.round((stats.passCount / (stats.total - stats.absentCount || 1)) * 100) : 0}%)`} value={stats.passCount} color="text-emerald-700" bg="bg-emerald-100" />
                <StatCard icon={TrendingUp} label="Avg Marks" value={stats.avg.toFixed(1)} color="text-indigo-700" bg="bg-indigo-100" />
                <StatCard icon={Trophy} label="Highest Marks" value={stats.highest} color="text-amber-700" bg="bg-amber-100" />
              </div>

              {/* Top scorer */}
              {stats.topScorer && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200/80">
                  <Trophy size={16} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-900 font-medium">
                    Top scorer in this subject: <strong className="font-bold">{stats.topScorer.student_name}</strong> (Roll {stats.topScorer.roll_number}) — <span className="font-mono font-bold text-amber-950">{stats.topScorer.marks_obtained}</span>/{effectiveTotalMarks}
                  </p>
                </div>
              )}

              {/* Two-column layout: table + grade dist */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">

                {/* Result table */}
                <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-xs">
                  {/* Column headers */}
                  <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_4.5rem_4rem_2.5rem] gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-4 py-3 bg-zinc-50 border-b border-zinc-200/80">
                    <span>Roll</span>
                    <span>Student</span>
                    <span className="text-center">Marks</span>
                    <span className="text-center">Total</span>
                    <span className="text-center">Grade</span>
                    <span className="text-center">GPA</span>
                    <span />
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {sortedRows.map((row) => {
                      const gradeColor = row.grade ? GRADE_COLORS[row.grade] ?? 'text-zinc-600 bg-zinc-100' : ''
                      const isFail = row.grade === 'F' || row.is_absent
                      return (
                        <div
                          key={row.id}
                          className={`grid grid-cols-[2.5rem_1fr_5rem_5rem_4.5rem_4rem_2.5rem] gap-2 items-center px-4 py-2.5 transition-colors hover:bg-zinc-50 ${
                            row.is_absent ? 'opacity-60 bg-zinc-50/40' : isFail ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <span className="text-xs font-mono font-bold text-zinc-600">{row.roll_number}</span>
                          <span className="text-sm font-semibold text-zinc-900 truncate">{row.student_name}</span>
                          <span className="text-sm text-center font-mono font-bold text-zinc-900">
                            {row.is_absent ? '—' : (row.marks_obtained ?? '—')}
                          </span>
                          <span className="text-xs text-center font-mono text-zinc-500">/ {effectiveTotalMarks}</span>
                          <span className={`text-[10px] font-bold text-center px-2 py-0.5 rounded-md border mx-auto ${gradeColor || 'text-zinc-400 border-transparent'}`}>
                            {row.is_absent ? 'ABS' : (row.grade ?? '—')}
                          </span>
                          <span className="text-xs text-center font-bold text-zinc-700 font-mono">
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
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Grade distribution */}
                <div className="bg-zinc-50/70 rounded-2xl border border-zinc-200/80 p-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Grade Distribution</p>
                  <GradeDistribution results={subjectResults} />
                  <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Absent:</span>
                      <span className="text-rose-600 font-bold font-mono">{stats.absentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Lowest Mark:</span>
                      <span className="text-zinc-800 font-mono font-bold">{stats.lowest}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Print Class Marksheet */}
            {allResults.length > 0 && (
              <button
                type="button"
                onClick={() => printClassMarksheet({ exam: exam!, results: allResults })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-all cursor-pointer shadow-xs"
              >
                <Printer size={14} className="text-indigo-600" />
                <span>Print Marksheet</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-zinc-500 font-medium hidden sm:block">
              {isPublished
                ? '✅ Results are visible to students'
                : '🔒 Results are hidden from students'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body
  )
}
