import { useState, useRef, useEffect } from 'react'
import { Calendar, BookOpen, ChevronDown, Trash2, FileSpreadsheet, Eye, EyeOff, CheckCircle2, Award, Ticket } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { ExamHeld } from '../types'
import { EXAM_SCOPE_LABELS, EXAM_STATUS_CONFIG } from '../types'
import { usePublishResults } from '../hooks/useExamHeld'
import { printBatchAdmitCards } from '../utils/printBatchAdmitCards'

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
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)

  const cfg = EXAM_STATUS_CONFIG[exam.status]
  const schedules = exam.exam_held_schedules ?? []
  const target = exam.classes?.name ?? exam.batches?.name ?? '—'
  const publishMutation = usePublishResults()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false)
      }
    }
    if (statusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [statusMenuOpen])

  const handlePublishToggle = () => {
    publishMutation.mutate({ id: exam.id, published: !exam.result_published })
  }

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Top stripe by status */}
        <div className={`h-1.5 w-full ${cfg.stripe}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-zinc-900 leading-snug mb-1 truncate">
                {exam.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer hover:opacity-90 ${cfg.bg} ${cfg.color} ${cfg.border}`}
                  title="Click to change status"
                >
                  <span>{cfg.label}</span>
                  <ChevronDown size={10} />
                </button>
                <span className="text-[10px] text-zinc-600 font-semibold bg-zinc-100 px-2 py-0.5 rounded-full">
                  {EXAM_SCOPE_LABELS[exam.scope]}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="text-[10px] text-zinc-700 font-semibold flex items-center gap-1">
                  <BookOpen size={11} className="text-indigo-600" />
                  {target}
                </span>
                {exam.result_published && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Published
                  </span>
                )}
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={() => onDelete(exam.id)}
              className="text-zinc-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 cursor-pointer"
              title="Delete Exam"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-zinc-50 border border-zinc-200/70 rounded-xl p-2.5 text-center">
              <p className="text-base font-black text-zinc-900 font-mono">{exam.total_marks}</p>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Marks</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200/70 rounded-xl p-2.5 text-center">
              <p className="text-base font-black text-indigo-700 font-mono">{schedules.length}</p>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Subjects Set</p>
            </div>
          </div>

          {/* Schedule Preview */}
          {schedules.length > 0 ? (
            <div className="space-y-1.5 mb-4 bg-zinc-50/70 p-3 rounded-xl border border-zinc-200/70">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Date-Sheet Preview</span>
                <span className="text-indigo-600 font-semibold">{schedules.length} Papers</span>
              </div>
              {schedules.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-800 font-medium truncate max-w-[140px]">
                    {s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id}
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px] flex-shrink-0 flex items-center gap-1">
                    <Calendar size={11} className="text-zinc-400" />
                    {s.date ? format(parseISO(s.date), 'dd MMM') : '—'}
                  </span>
                </div>
              ))}
              {schedules.length > 3 && (
                <p className="text-[10px] text-zinc-500 font-semibold pt-0.5">
                  + {schedules.length - 3} more subjects scheduled
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
              <Calendar size={14} className="text-amber-600 flex-shrink-0" />
              <span>No subjects scheduled yet. Click below to add routine.</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 space-y-2">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Schedule Button */}
          <button
            onClick={() => onSchedule(exam)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-xs font-bold border border-zinc-200/60 transition-all cursor-pointer"
          >
            <Calendar size={13} className="text-zinc-600" />
            <span>{schedules.length > 0 ? 'Date-Sheet' : 'Set Routine'}</span>
          </button>

          {/* Admit Cards Button */}
          <button
            onClick={() => printBatchAdmitCards({ exam })}
            disabled={schedules.length === 0}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-purple-200/70"
            title="Print Admit Cards for all enrolled students"
          >
            <Ticket size={13} className="text-purple-600" />
            <span>Admit Cards</span>
          </button>
        </div>

        {/* Tabulation Matrix & Results Action */}
        <div className="flex gap-2">
          <button
            onClick={() => onEnterResults(exam)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>Tabulation & Marks</span>
          </button>

          <button
            onClick={() => onViewSummary(exam)}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold border border-zinc-200/60 transition-all cursor-pointer"
            title="View Performance Summary & Merit"
          >
            <Award size={15} />
          </button>

          {/* Publish Toggle Button */}
          <button
            onClick={handlePublishToggle}
            disabled={publishMutation.isPending}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              exam.result_published
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={exam.result_published ? 'Unpublish Results' : 'Publish Results to Students'}
          >
            {exam.result_published ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Click-based Status Dropdown */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-500 font-medium">Lifecycle Status:</span>
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => setStatusMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${cfg.bg} ${cfg.color} ${cfg.border}`}
              >
                {cfg.label} <ChevronDown size={11} className={`transition-transform duration-200 ${statusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusMenuOpen && (
                <div className="absolute bottom-full right-0 mb-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-50 min-w-[150px] p-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 mb-1">
                    Select Status
                  </div>
                  {STATUS_FLOW.map((s) => {
                    const c = EXAM_STATUS_CONFIG[s]
                    const isCurrent = exam.status === s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          onStatusChange(exam.id, s)
                          setStatusMenuOpen(false)
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-zinc-50 transition-colors font-semibold cursor-pointer flex items-center justify-between ${
                          isCurrent ? `${c.color} ${c.bg} font-bold` : 'text-zinc-700'
                        }`}
                      >
                        <span>{c.label}</span>
                        {isCurrent && <CheckCircle2 size={12} className={c.color} />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


