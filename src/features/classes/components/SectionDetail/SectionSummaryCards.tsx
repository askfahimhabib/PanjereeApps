import {
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  XCircle,
  MinusCircle,
} from 'lucide-react'
import type { SectionStudent } from '../../types'

interface SectionSummaryCardsProps {
  students: SectionStudent[]
}

export function SectionSummaryCards({ students }: SectionSummaryCardsProps) {
  if (students.length === 0) return null

  // ── Attendance stats ──────────────────────────────────────────────────────
  const withAttendance = students.filter(s => s.attendanceRate !== undefined)
  const avgAttendance =
    withAttendance.length > 0
      ? Math.round(
          withAttendance.reduce((sum, s) => sum + (s.attendanceRate ?? 0), 0) /
            withAttendance.length
        )
      : 0
  const atRisk    = withAttendance.filter(s => (s.attendanceRate ?? 100) < 75).length
  const good      = withAttendance.filter(s => (s.attendanceRate ?? 0) >= 90).length

  // ── Fee stats ─────────────────────────────────────────────────────────────
  const paid    = students.filter(s => s.feeStatus === 'PAID').length
  const due     = students.filter(s => s.feeStatus === 'DUE').length
  const partial = students.filter(s => s.feeStatus === 'PARTIAL').length
  const total   = students.length

  const attendanceColor =
    avgAttendance >= 90 ? 'text-emerald-400' :
    avgAttendance >= 75 ? 'text-amber-400' :
    'text-red-400'

  const attendanceBg =
    avgAttendance >= 90 ? 'from-emerald-600/15 to-emerald-900/5 border-emerald-500/20' :
    avgAttendance >= 75 ? 'from-amber-600/15 to-amber-900/5 border-amber-500/20' :
    'from-red-600/15 to-red-900/5 border-red-500/20'

  return (
    <div className="space-y-3">
      {/* ── Attendance Card ─────────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-gradient-to-br ${attendanceBg} p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck size={15} className={attendanceColor} />
          <h3 className="text-sm font-semibold text-slate-200">Attendance</h3>
        </div>

        {/* Big average */}
        <div className="flex items-end gap-2 mb-3">
          <span className={`text-3xl font-bold ${attendanceColor}`}>{avgAttendance}%</span>
          <span className="text-xs text-slate-500 mb-1">class average</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-3">
          <div
            className={`h-1.5 rounded-full transition-all ${
              avgAttendance >= 90 ? 'bg-emerald-500' :
              avgAttendance >= 75 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${avgAttendance}%` }}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <TrendingUp size={11} />
            <span>{good} above 90%</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <AlertTriangle size={11} />
            <span>{atRisk} at risk</span>
          </div>
        </div>
      </div>

      {/* ── Fee Status Card ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={15} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Fee Status</h3>
          <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Live</span>
        </div>
        <p className="text-[10px] text-slate-600 mb-3">
          {new Date().toLocaleString('en-BD', { month: 'long', year: 'numeric' })} · Tuition
        </p>

        {/* Stacked bar */}
        <div className="flex h-2 rounded-full overflow-hidden mb-3 bg-slate-700/50">
          {paid > 0 && (
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(paid / total) * 100}%` }}
              title={`Paid: ${paid}`}
            />
          )}
          {partial > 0 && (
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(partial / total) * 100}%` }}
              title={`Partial: ${partial}`}
            />
          )}
          {due > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(due / total) * 100}%` }}
              title={`Due: ${due}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle size={11} />
              <span>Paid</span>
            </div>
            <span className="text-slate-300 font-medium">
              {paid} <span className="text-slate-500 font-normal">({Math.round((paid/total)*100)}%)</span>
            </span>
          </div>
          {partial > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-400">
                <MinusCircle size={11} />
                <span>Partial</span>
              </div>
              <span className="text-slate-300 font-medium">
                {partial} <span className="text-slate-500 font-normal">({Math.round((partial/total)*100)}%)</span>
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-red-400">
              <XCircle size={11} />
              <span>Due</span>
            </div>
            <span className="text-slate-300 font-medium">
              {due} <span className="text-slate-500 font-normal">({Math.round((due/total)*100)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
