import { Calendar, BookOpen, ChevronDown, Trash2, ClipboardEdit, BarChart3, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { ExamHeld } from '../types'
import { EXAM_SCOPE_LABELS, EXAM_STATUS_CONFIG } from '../types'

interface Props {
  exam: ExamHeld
  onStatusChange: (id: string, status: ExamHeld['status']) => void
  onDelete: (id: string) => void
  onSchedule: (exam: ExamHeld) => void
  onEnterResults: (exam: ExamHeld) => void
  onViewSummary: (exam: ExamHeld) => void
}

const STATUS_FLOW: ExamHeld['status'][] = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'POSTPONED', 'CANCELLED']

export function ExamHeldCard({ exam, onStatusChange, onDelete, onSchedule, onEnterResults, onViewSummary }: Props) {
  const cfg = EXAM_STATUS_CONFIG[exam.status]
  const schedules = exam.exam_held_schedules ?? []
  const target = exam.classes?.name ?? exam.batches?.name ?? '—'

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group">
      {/* Top stripe by status */}
      <div className={`h-1 w-full ${cfg.bg} ${cfg.border}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 leading-snug mb-1 truncate">
              {exam.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
              </span>
              <span className="text-[10px] text-slate-500">
                {EXAM_SCOPE_LABELS[exam.scope]}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <BookOpen size={10} />
                {target}
              </span>
              {exam.result_published && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 size={9} />
                  Published
                </span>
              )}
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(exam.id)}
            className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-900/60 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-200">{exam.total_marks}</p>
            <p className="text-[10px] text-slate-500">Total Marks</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-200">{schedules.length}</p>
            <p className="text-[10px] text-slate-500">Subjects Set</p>
          </div>
        </div>

        {/* Schedule Preview */}
        {schedules.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {schedules.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate">{s.subjects?.name_bn ?? s.subjects?.name}</span>
                <span className="text-slate-500 flex-shrink-0 ml-2 flex items-center gap-1">
                  <Calendar size={10} />
                  {s.date ? format(parseISO(s.date), 'dd MMM yyyy') : '—'}
                </span>
              </div>
            ))}
            {schedules.length > 3 && (
              <p className="text-[10px] text-slate-600 pl-0.5">+ {schedules.length - 3} more...</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-col">
          {/* Row 1: Schedule + Results */}
          <div className="flex gap-2">
            {/* Schedule button */}
            <button
              onClick={() => onSchedule(exam)}
              className="flex-1 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition-all"
            >
              {schedules.length > 0 ? '📅 Update Schedule' : '📅 Create Schedule'}
            </button>

            {/* Enter Results button — shown when exam has schedules */}
            {schedules.length > 0 && (
              <button
                onClick={() => onEnterResults(exam)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-600/30 transition-all"
              >
                <ClipboardEdit size={13} />
                Results
              </button>
            )}

            {/* View Summary button — shown when exam has schedules */}
            {schedules.length > 0 && (
              <button
                onClick={() => onViewSummary(exam)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-600/30 transition-all"
              >
                <BarChart3 size={13} />
                Summary
              </button>
            )}
          </div>

          {/* Status change */}
          <div className="relative group/status">
            <button className={`flex items-center gap-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.label} <ChevronDown size={12} />
            </button>
            <div className="absolute bottom-full right-0 mb-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover/status:block z-20 min-w-[120px]">
              {STATUS_FLOW.map((s) => {
                const c = EXAM_STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(exam.id, s)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${exam.status === s ? `${c.color} font-semibold` : 'text-slate-400'}`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
