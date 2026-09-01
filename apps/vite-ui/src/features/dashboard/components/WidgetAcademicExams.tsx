import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Trophy,
  ArrowRight,
} from 'lucide-react'
import type { ExamHeld } from '@/features/examHeld/types'
import { EXAM_SCOPE_LABELS } from '@/features/examHeld/types'
import { format, parseISO } from 'date-fns'

interface WidgetAcademicExamsProps {
  upcomingExams: (ExamHeld & {
    nextDateStr?: string
    daysUntil?: number
    totalSchedules?: number
    targetName?: string
  })[]
  publishedResults: ExamHeld[]
}

export function WidgetAcademicExams({
  upcomingExams,
  publishedResults,
}: WidgetAcademicExamsProps) {
  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Examinations & Results</h2>
              <p className="text-[11px] text-zinc-400">Scheduled tests & published marksheets</p>
            </div>
          </div>

          <Link
            to="/exam-held"
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            <span>All Exams</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Upcoming Exams List */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Upcoming Schedule ({upcomingExams.length})
            </span>
            <Link to="/exam-held" className="text-[11px] font-semibold text-sky-600 hover:underline">
              Create Exam
            </Link>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="py-6 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
              <ClipboardList size={24} className="mx-auto mb-1.5 opacity-30" />
              <p className="text-xs font-semibold text-zinc-600">No active exams scheduled</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 hide-scrollbar">
              {upcomingExams.map(exam => {
                const target = exam.targetName || 'All'
                const days = exam.daysUntil ?? 0

                let dateFormatted = ''
                if (exam.nextDateStr) {
                  try {
                    dateFormatted = format(parseISO(exam.nextDateStr), 'dd MMM yyyy')
                  } catch {
                    dateFormatted = exam.nextDateStr
                  }
                }

                return (
                  <div
                    key={exam.id}
                    className="p-3 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs transition-all flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-zinc-900 truncate">{exam.name}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 shrink-0">
                          {EXAM_SCOPE_LABELS[exam.scope] || exam.scope}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                        <span className="font-semibold text-zinc-700">{target}</span>
                        <span>•</span>
                        <span>{exam.totalSchedules || 1} Subject(s)</span>
                        {dateFormatted && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-500">{dateFormatted}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          days === 0
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : days <= 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-50 text-sky-700 border border-sky-100'
                        }`}
                      >
                        {days === 0 ? 'Today' : `In ${days} day(s)`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Published Results */}
        {publishedResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Trophy size={12} className="text-amber-500" />
                <span>Recent Published Results</span>
              </span>
              <Link to="/exam-results" className="text-[11px] font-semibold text-sky-600 hover:underline">
                View Marksheets
              </Link>
            </div>

            <div className="space-y-1.5">
              {publishedResults.slice(0, 3).map(exam => {
                const target = exam.classes?.name ?? exam.batches?.name ?? 'Students'
                return (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-50/70 border border-zinc-200/60 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-800 truncate">{exam.name}</p>
                      <p className="text-[10px] text-zinc-400">{target}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                      Published
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
        <Link
          to="/exam-held"
          className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold text-center transition-colors shadow-xs"
        >
          Schedule Examination
        </Link>
        <Link
          to="/exam-results"
          className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold text-center transition-colors"
        >
          Results Ledger
        </Link>
      </div>
    </div>
  )
}
