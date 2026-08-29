import { useState, useMemo } from 'react'
import { BarChart3, ChevronDown, Trophy, CheckCircle2, Clock, XCircle, Eye, EyeOff, Printer, FileText, TrendingUp, Users, AlertCircle, BookOpen } from 'lucide-react'
import { useExamHelds, usePublishResults } from '../features/examHeld/hooks/useExamHeld'
import { useExamResults } from '../features/examHeld/hooks/useExamResults'
import type { ExamHeld, ExamResult } from '../features/examHeld/types'
import { EXAM_SCOPE_LABELS, GRADE_COLORS } from '../features/examHeld/types'
import { printClassMarksheet } from '../features/examHeld/utils/printClassMarksheet'
import { printStudentResultCard } from '../features/examHeld/utils/printStudentResultCard'

// ─── Grade Colors ─────────────────────────────────────────────────────────────
const GRADE_BG_MAP: Record<string, string> = {
  'A+': 'bg-emerald-500', 'A': 'bg-green-500', 'A-': 'bg-teal-500',
  'B': 'bg-blue-500', 'C': 'bg-amber-500', 'D': 'bg-orange-500', 'F': 'bg-red-500',
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-current/10 ${color}`}>
        <Icon size={16} className="opacity-80" />
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
        <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function GradeBar({ results }: { results: ExamResult[] }) {
  const grades = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F']
  const total = results.filter(r => !r.is_absent).length || 1
  const counts = grades.reduce<Record<string, number>>((acc, g) => {
    acc[g] = results.filter(r => r.grade === g).length
    return acc
  }, {})

  return (
    <div className="space-y-2">
      {grades.map(g => {
        const count = counts[g] ?? 0
        const pct = Math.round((count / total) * 100)
        return (
          <div key={g} className="flex items-center gap-3 text-xs">
            <span className="w-6 text-right text-zinc-600 font-mono font-bold">{g}</span>
            <div className="flex-1 h-2.5 bg-zinc-50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${GRADE_BG_MAP[g]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 text-right text-zinc-600 font-mono">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Results Content (for selected exam) ─────────────────────────────────────
function ExamResultContent({ exam }: { exam: ExamHeld }) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [publishNotice, setPublishNotice] = useState<'published' | 'unpublished' | null>(null)
  const { data: allResults = [], isLoading } = useExamResults(exam.id)
  const publish = usePublishResults()

  const schedules = exam.exam_held_schedules ?? []
  const subjectId = activeSubject ?? schedules[0]?.subject_id ?? null

  const effectiveTotalMarks = useMemo(() => {
    if (!subjectId) return exam.total_marks
    const sched = schedules.find(s => s.subject_id === subjectId)
    return sched?.total_marks ?? exam.total_marks
  }, [subjectId, schedules, exam.total_marks])

  const subjectResults = useMemo(
    () => allResults.filter(r => r.subject_id === subjectId),
    [allResults, subjectId]
  )

  const sortedRows = useMemo(
    () => [...subjectResults].sort((a, b) => (parseInt(a.roll_number) || 0) - (parseInt(b.roll_number) || 0)),
    [subjectResults]
  )

  const stats = useMemo(() => {
    const present = subjectResults.filter(r => !r.is_absent)
    const marks = present.map(r => r.marks_obtained ?? 0)
    const passed = present.filter(r => r.grade !== 'F' && r.grade !== null)
    const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0
    const highest = marks.length ? Math.max(...marks) : 0
    const absentCount = subjectResults.filter(r => r.is_absent).length
    return { avg, highest, passCount: passed.length, absentCount, total: subjectResults.length }
  }, [subjectResults])

  const handlePublishToggle = () => {
    const next = !exam.result_published
    publish.mutate({ id: exam.id, published: next }, {
      onSuccess: () => {
        setPublishNotice(next ? 'published' : 'unpublished')
        setTimeout(() => setPublishNotice(null), 3000)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Students" value={stats.total} color="text-blue-400" />
        <StatCard icon={CheckCircle2} label="Passed" value={stats.passCount} color="text-emerald-400" />
        <StatCard icon={TrendingUp} label="Avg Marks" value={stats.avg.toFixed(1)} color="text-purple-400" />
        <StatCard icon={Trophy} label="Highest" value={stats.highest} color="text-amber-400" />
      </div>

      {/* ── Publish notice ───────────────────────────────────── */}
      {publishNotice && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
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

      {/* ── No results ───────────────────────────────────────── */}
      {!isLoading && allResults.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle size={16} />
          No results entered yet. Use "Enter Results" from the Exams page to add marks first.
        </div>
      )}

      {/* ── Subject Tabs ─────────────────────────────────────── */}
      {schedules.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {schedules.map(s => {
            const name = s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id
            const isActive = (activeSubject ?? schedules[0]?.subject_id) === s.subject_id
            const cnt = allResults.filter(r => r.subject_id === s.subject_id).length
            return (
              <button
                key={s.subject_id}
                onClick={() => setActiveSubject(s.subject_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                {name} <span className="opacity-60 ml-1">({cnt})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Main grid: table + grade dist ────────────────────── */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-zinc-50" />)}
        </div>
      ) : subjectResults.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">
          {/* Results Table */}
          <div className="rounded-xl border border-zinc-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_6rem_5rem_5rem_4rem_2.5rem] gap-2 items-center px-4 py-3 bg-zinc-50 border-b border-zinc-100">
              {['Roll', 'Student', 'Marks', `/ ${effectiveTotalMarks}`, 'Grade', 'GPA', ''].map((h, i) => (
                <span key={i} className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-center first:text-left">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-slate-800/60">
              {sortedRows.map(row => {
                const gradeColor = row.grade ? GRADE_COLORS[row.grade] ?? '' : ''
                const isFail = row.grade === 'F' || row.is_absent
                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[3rem_1fr_6rem_5rem_5rem_4rem_2.5rem] gap-2 items-center px-4 py-3 hover:bg-zinc-50 transition-colors ${
                      row.is_absent ? 'opacity-50' : isFail ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <span className="text-xs font-mono text-zinc-600">{row.roll_number}</span>
                    <span className="text-sm text-zinc-800 truncate font-medium">{row.student_name}</span>
                    <span className="text-sm text-center font-mono font-bold text-zinc-800">
                      {row.is_absent ? '—' : (row.marks_obtained ?? '—')}
                    </span>
                    <span className="text-xs text-center text-zinc-800">/ {effectiveTotalMarks}</span>
                    <span className={`text-[11px] font-bold text-center px-1.5 py-0.5 rounded border mx-auto ${gradeColor || 'text-zinc-800 border-transparent'}`}>
                      {row.is_absent ? 'ABS' : (row.grade ?? '—')}
                    </span>
                    <span className="text-xs text-center text-zinc-600 font-mono">
                      {row.is_absent ? '—' : (row.gpa?.toFixed(2) ?? '—')}
                    </span>
                    <button
                      title="Print Result Card"
                      onClick={() => printStudentResultCard({
                        exam,
                        studentId: row.student_id,
                        studentName: row.student_name,
                        rollNumber: row.roll_number,
                        results: allResults.filter(r => r.student_id === row.student_id),
                      })}
                      className="flex items-center justify-center text-zinc-800 hover:text-blue-400 transition-colors"
                    >
                      <FileText size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grade Distribution sidebar */}
          <div className="space-y-4">
            <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-4">Grade Distribution</p>
              <GradeBar results={subjectResults} />
              <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                {[
                  { label: 'Absent', value: stats.absentCount, color: 'text-red-400' },
                  { label: 'Pass Rate', value: `${stats.total ? Math.round((stats.passCount / Math.max(stats.total - stats.absentCount, 1)) * 100) : 0}%`, color: 'text-emerald-400' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-zinc-600">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Actions</p>
              <button
                onClick={handlePublishToggle}
                disabled={publish.isPending || allResults.length === 0}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 ${
                  exam.result_published
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {exam.result_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish Results</>}
              </button>
              {allResults.length > 0 && (
                <button
                  onClick={() => printClassMarksheet({ exam, results: allResults })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-zinc-100 text-zinc-600 hover:text-white hover:border-zinc-100 transition-all"
                >
                  <Printer size={14} /> Print Marksheet
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ─── Exam Selector Card ───────────────────────────────────────────────────────
function ExamSelectorCard({ exam, isSelected, onClick }: { exam: ExamHeld; isSelected: boolean; onClick: () => void }) {
  const scheduleCount = exam.exam_held_schedules?.length ?? 0
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'bg-indigo-600/15 border-indigo-500/40 ring-1 ring-indigo-500/20'
          : 'bg-zinc-50 border-zinc-100 hover:border-zinc-100 hover:bg-zinc-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-800 truncate">{exam.name}</p>
          <p className="text-xs text-zinc-600 mt-0.5">
            {exam.target_type === 'CLASS' ? exam.classes?.name : exam.batches?.name}
            {' · '}{scheduleCount} subject{scheduleCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
            {EXAM_SCOPE_LABELS[exam.scope]}
          </span>
          {exam.result_published && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
              <CheckCircle2 size={8} /> Published
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ExamResultsPage() {
  const { data: exams = [], isLoading } = useExamHelds()
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [scopeFilter, setScopeFilter] = useState<string>('ALL')
  const [selectorOpen, setSelectorOpen] = useState(false)

  const completedExams = useMemo(() => exams.filter(e => e.status === 'COMPLETED'), [exams])

  const scopeOptions = useMemo(() => {
    const scopes = [...new Set(completedExams.map(e => e.scope))]
    return ['ALL', ...scopes]
  }, [completedExams])

  const filteredExams = useMemo(() =>
    scopeFilter === 'ALL' ? completedExams : completedExams.filter(e => e.scope === scopeFilter),
    [completedExams, scopeFilter]
  )

  const selectedExam = completedExams.find(e => e.id === selectedExamId) ?? filteredExams[0] ?? null

  // Overview stats
  const totalPublished = completedExams.filter(e => e.result_published).length

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Exam Results</h1>
          <p className="text-sm text-zinc-600 mt-1">View, publish and print results for completed exams</p>
        </div>
      </div>

      {/* ── Overview Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Completed Exams" value={completedExams.length} color="text-indigo-400" />
        <StatCard icon={CheckCircle2} label="Results Published" value={totalPublished} color="text-emerald-400" />
        <StatCard icon={Clock} label="Awaiting Publish" value={completedExams.length - totalPublished} color="text-amber-400" />
        <StatCard icon={XCircle} label="Exams Remaining" value={exams.filter(e => e.status !== 'COMPLETED').length} color="text-red-400" />
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-zinc-50" />)}
        </div>
      ) : completedExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-800">
          <BarChart3 size={56} className="mb-4 opacity-20" />
          <p className="text-base font-medium text-zinc-600">No completed exams yet</p>
          <p className="text-sm text-zinc-800 mt-1">Mark an exam as "Completed" from the Exams page to see results here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">

          {/* ── Left: Exam Selector ───────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Select Exam</h3>
              {/* Mobile toggle */}
              <button
                className="xl:hidden flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-800"
                onClick={() => setSelectorOpen(p => !p)}
              >
                {selectedExam?.name ?? 'Choose'} <ChevronDown size={12} />
              </button>
            </div>

            {/* Scope filter pills */}
            {scopeOptions.length > 2 && (
              <div className="flex flex-wrap gap-1.5">
                {scopeOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => setScopeFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      scopeFilter === s
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                        : 'border-zinc-100 text-zinc-600 hover:border-zinc-100 hover:text-zinc-600'
                    }`}
                  >
                    {s === 'ALL' ? `All (${completedExams.length})` : EXAM_SCOPE_LABELS[s as keyof typeof EXAM_SCOPE_LABELS]}
                  </button>
                ))}
              </div>
            )}

            <div className={`space-y-2 ${selectorOpen ? '' : 'hidden xl:block'}`}>
              {filteredExams.map(exam => (
                <ExamSelectorCard
                  key={exam.id}
                  exam={exam}
                  isSelected={exam.id === (selectedExamId ?? filteredExams[0]?.id)}
                  onClick={() => { setSelectedExamId(exam.id); setSelectorOpen(false) }}
                />
              ))}
              {filteredExams.length === 0 && (
                <p className="text-sm text-zinc-800 text-center py-8">No exams for this filter</p>
              )}
            </div>
          </div>

          {/* ── Right: Results Panel ─────────────────────────── */}
          <div>
            {selectedExam ? (
              <div className="space-y-5">
                {/* Selected exam header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{selectedExam.name}</h2>
                    <p className="text-sm text-zinc-600 mt-0.5">
                      {EXAM_SCOPE_LABELS[selectedExam.scope]}
                      {' · '}
                      {selectedExam.target_type === 'CLASS'
                        ? `Class: ${selectedExam.classes?.name ?? selectedExam.class_id}`
                        : `Batch: ${selectedExam.batches?.name ?? selectedExam.batch_id}`}
                      {' · '}Total: {selectedExam.total_marks} marks
                    </p>
                  </div>
                  {selectedExam.result_published ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Eye size={12} /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-100 text-zinc-600">
                      <EyeOff size={12} /> Draft
                    </span>
                  )}
                </div>
                <ExamResultContent exam={selectedExam} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-800">
                <BarChart3 size={40} className="mb-3 opacity-20" />
                <p className="text-sm">Select an exam from the left to view results</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
