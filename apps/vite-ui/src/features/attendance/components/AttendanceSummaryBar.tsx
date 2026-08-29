import { CheckCircle2, XCircle, Clock, Plane, Users } from 'lucide-react'
import type { AttendanceSummary } from '../types'

interface Props {
  summary: AttendanceSummary
  isSaved: boolean
}

export function AttendanceSummaryBar({ summary, isSaved }: Props) {
  const cards = [
    { label: 'Present', value: summary.present, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Absent',  value: summary.absent,  icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
    { label: 'Late',    value: summary.late,     icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
    { label: 'Leave',   value: summary.leave,    icon: Plane,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
    { label: 'Total',   value: summary.total,    icon: Users,        color: 'text-zinc-800',   bg: 'bg-zinc-50',      border: 'border-zinc-100' },
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`flex flex-col items-center py-3 px-2 rounded-xl border ${bg} ${border}`}
          >
            <Icon size={16} className={`${color} mb-1`} />
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className="text-[10px] text-zinc-600 mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Unmarked warning */}
      {summary.unmarked > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <Clock size={12} />
          <span><strong>{summary.unmarked}</strong> student{summary.unmarked > 1 ? 's' : ''} still unmarked — please mark before saving</span>
        </div>
      )}

      {/* Saved confirmation */}
      {isSaved && summary.unmarked === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle2 size={12} />
          Attendance saved successfully
        </div>
      )}
    </div>
  )
}
