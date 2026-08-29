import { useState, useMemo } from 'react'
import {
  ClipboardCheck, Eye, EyeOff, BarChart3, ClipboardList,
  CheckCircle2, Clock, AlertCircle, Trophy,
} from 'lucide-react'
import type { ExamHeld } from '../types'
import { EXAM_SCOPE_LABELS, EXAM_STATUS_CONFIG } from '../types'
import { useExamHelds } from '../hooks/useExamHeld'
import { ResultSummaryModal } from './ResultSummaryModal'

// ─── Stat Mini Card ───────────────────────────────────────────────────────────
function MiniStat({
  label, value, color, icon: Icon,
}: { label: string; value: number | string; color: string; icon: React.ElementType }) {
  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-current/10 ${color}`}>
        <Icon size={16} className="opacity-80" />
      </div>
      <div>
        <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
        <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

// ─── Grade Distribution Pill Bar ─────────────────────────────────────────────
function MiniGradeBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  const grades = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F']
  const colorMap: Record<string, string> = {
    'A+': 'bg-emerald-500', 'A': 'bg-green-500', 'A-': 'bg-teal-500',
    'B': 'bg-blue-500', 'C': 'bg-amber-500', 'D': 'bg-orange-500', 'F': 'bg-red-500',
  }
  if (total === 0) return <span className="text-xs text-zinc-800">No results</span>

  return (
    <div className="flex items-center gap-0.5 h-2 w-full rounded-full overflow-hidden">
      {grades.map(g => {
        const count = counts[g] ?? 0
        const pct = Math.round((count / total) * 100)
        if (pct === 0) return null
        return (
          <div
            key={g}
            className={`h-full ${colorMap[g]} transition-all`}
            style={{ width: `${pct}%` }}
            title={`${g}: ${count}`}
          />
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ExamResultsTab() {
  const { data: exams = [], isLoading } = useExamHelds()
  const [summaryExam, setSummaryExam] = useState<ExamHeld | null>(null)
  const [scopeFilter, setScopeFilter] = useState<string>('ALL')

  // Only show COMPLETED exams (only they'd have results)
  const completedExams = useMemo(
    () => exams.filter(e => e.status === 'COMPLETED'),
    [exams]
  )

  const scopeOptions = useMemo(() => {
    const scopes = [...new Set(completedExams.map(e => e.scope))]
    return ['ALL', ...scopes]
  }, [completedExams])

  const filtered = useMemo(() =>
    scopeFilter === 'ALL'
      ? completedExams
      : completedExams.filter(e => e.scope === scopeFilter),
    [completedExams, scopeFilter]
  )

  // Summary stats
  const totalPublished = completedExams.filter(e => e.result_published).length
  const totalUnpublished = completedExams.length - totalPublished

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-zinc-50" />
        ))}
      </div>
    )
  }

  if (completedExams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-800">
        <BarChart3 size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">No completed exams yet</p>
        <p className="text-xs text-zinc-800 mt-1">
          Mark an exam as "Completed" from the Exams tab to see results here
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">

        {/* ── Overview Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={ClipboardCheck} label="Completed Exams" value={completedExams.length} color="text-purple-400" />
          <MiniStat icon={CheckCircle2} label="Results Published" value={totalPublished} color="text-emerald-400" />
          <MiniStat icon={Clock} label="Awaiting Publish" value={totalUnpublished} color="text-amber-400" />
          <MiniStat icon={Trophy} label="Unique Subjects" value={[...new Set(completedExams.flatMap(e => e.exam_held_schedules?.map(s => s.subject_id) ?? []))].length} color="text-blue-400" />
        </div>

        {/* ── Scope Filter ───────────────────────────────────────────────── */}
        {scopeOptions.length > 2 && (
          <div className="flex items-center gap-2 flex-wrap">
            {scopeOptions.map(scope => (
              <button
                key={scope}
                onClick={() => setScopeFilter(scope)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  scopeFilter === scope
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                    : 'border-zinc-100 text-zinc-600 hover:border-zinc-100 hover:text-zinc-600'
                }`}
              >
                {scope === 'ALL' ? `All (${completedExams.length})` : EXAM_SCOPE_LABELS[scope as keyof typeof EXAM_SCOPE_LABELS]}
              </button>
            ))}
          </div>
        )}

        {/* ── Exams Table ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_100px_100px_120px_140px] gap-3 items-center px-5 py-3 bg-zinc-50 border-b border-zinc-100">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Exam Name</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-center">Scope</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-center">Subjects</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-center">Grade Dist.</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-right">Actions</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-800/60">
            {filtered.map(exam => {
              const scheduleCount = exam.exam_held_schedules?.length ?? 0
              const isPublished = exam.result_published

              // Mock grade distribution (will be real when results are loaded)
              const gradePlaceholder = { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }

              return (
                <div
                  key={exam.id}
                  className="grid grid-cols-[1fr_100px_100px_120px_140px] gap-3 items-center px-5 py-4 hover:bg-zinc-50 transition-colors"
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{exam.name}</p>
                      {isPublished && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 size={8} />
                          Published
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5 truncate">
                      {exam.target_type === 'CLASS'
                        ? `Class: ${exam.classes?.name ?? exam.class_id ?? '—'}`
                        : `Batch: ${exam.batches?.name ?? exam.batch_id ?? '—'}`
                      }
                      {' · '}Total: {exam.total_marks} marks
                    </p>
                  </div>

                  {/* Scope */}
                  <div className="text-center">
                    <span className="text-[10px] font-semibold text-zinc-600 bg-white border border-zinc-100 px-2 py-0.5 rounded-md">
                      {EXAM_SCOPE_LABELS[exam.scope]}
                    </span>
                  </div>

                  {/* Subjects count */}
                  <div className="text-center">
                    <span className="text-sm font-bold text-zinc-800">{scheduleCount}</span>
                    <span className="text-xs text-zinc-800 ml-0.5">subj.</span>
                  </div>

                  {/* Grade distribution bar (placeholder until results modal loads) */}
                  <div className="px-2">
                    {scheduleCount > 0 ? (
                      <MiniGradeBar counts={gradePlaceholder} total={0} />
                    ) : (
                      <span className="text-xs text-zinc-800 italic">No schedule</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {/* Publish status badge */}
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border transition-all ${
                      isPublished
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-zinc-600 bg-zinc-50 border-zinc-100'
                    }`}>
                      {isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                      {isPublished ? 'Live' : 'Draft'}
                    </span>

                    {/* View Summary */}
                    <button
                      onClick={() => setSummaryExam(exam)}
                      title="View Result Summary"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/15 border border-purple-500/30 text-purple-400 hover:bg-purple-600/25 transition-all"
                    >
                      <BarChart3 size={12} />
                      Results
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* No results for filter */}
        {filtered.length === 0 && completedExams.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-800">
            <AlertCircle size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No exams found for selected scope</p>
          </div>
        )}

        {/* Info note for non-completed exams */}
        {exams.length > completedExams.length && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-zinc-100">
            <ClipboardList size={14} className="text-zinc-600 flex-shrink-0" />
            <p className="text-xs text-zinc-600">
              {exams.length - completedExams.length} exam{exams.length - completedExams.length !== 1 ? 's' : ''} not shown (not yet completed). 
              Mark exams as <strong className="text-zinc-600">Completed</strong> from the Exams tab to see results here.
            </p>
          </div>
        )}
      </div>

      {/* Result Summary Modal */}
      <ResultSummaryModal
        open={!!summaryExam}
        exam={summaryExam}
        onClose={() => setSummaryExam(null)}
      />
    </>
  )
}
