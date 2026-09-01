import { Link } from 'react-router-dom'
import {
  Bell,
  BellRing,
  Plus,
  ArrowRight,
  Pin,
} from 'lucide-react'
import type { Notice } from '@/features/notices/types'
import { TARGET_LABELS } from '@/features/notices/types'
import { format, parseISO } from 'date-fns'

interface WidgetNoticesBoardProps {
  notices: Notice[]
  onOpenCreateNotice: () => void
}

export function WidgetNoticesBoard({
  notices,
  onOpenCreateNotice,
}: WidgetNoticesBoardProps) {
  const priorityBadges = {
    URGENT: 'bg-rose-100 text-rose-800 border-rose-200',
    IMPORTANT: 'bg-amber-100 text-amber-900 border-amber-200',
    NORMAL: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  }

  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600">
              <BellRing size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Campus Notice Board</h2>
              <p className="text-[11px] text-zinc-400">Institutional circulars & announcements</p>
            </div>
          </div>

          <button
            onClick={onOpenCreateNotice}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
          >
            <Plus size={13} />
            <span>Post</span>
          </button>
        </div>

        {/* Notices list */}
        {notices.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
            <Bell size={24} className="mx-auto mb-1 opacity-30" />
            <p className="text-xs font-semibold text-zinc-600">No active notices</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {notices.map(notice => {
              let dateStr = ''
              try {
                dateStr = format(parseISO(notice.publishedAt), 'dd MMM yyyy')
              } catch {
                dateStr = notice.publishedAt
              }

              const badgeClass = priorityBadges[notice.priority] || priorityBadges.NORMAL
              const isUrgent = notice.priority === 'URGENT'

              return (
                <div
                  key={notice.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isUrgent
                      ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                      : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isUrgent && <Pin size={12} className="text-rose-500 shrink-0" />}
                      <p className="text-xs font-bold text-zinc-900 truncate">{notice.title}</p>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase shrink-0 ${badgeClass}`}
                    >
                      {notice.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                    {notice.body}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-1.5 border-t border-zinc-100">
                    <span>Target: <strong className="text-zinc-600 font-semibold">{TARGET_LABELS[notice.target] || notice.target}</strong></span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">
          Showing {notices.length} active announcements
        </span>
        <Link
          to="/notices"
          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
        >
          <span>All Notices</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
