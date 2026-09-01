import {
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  CreditCard,
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
  const atRisk = withAttendance.filter(s => (s.attendanceRate ?? 100) < 75).length
  const good = withAttendance.filter(s => (s.attendanceRate ?? 0) >= 90).length

  // ── Fee stats ─────────────────────────────────────────────────────────────
  const paid = students.filter(s => s.feeStatus === 'PAID').length
  const due = students.filter(s => s.feeStatus === 'DUE').length
  const partial = students.filter(s => s.feeStatus === 'PARTIAL').length
  const total = students.length

  const attendanceTextColor =
    avgAttendance >= 90
      ? 'text-emerald-700'
      : avgAttendance >= 75
      ? 'text-amber-700'
      : 'text-rose-700'

  return (
    <div className="space-y-4">
      {/* ── Attendance Card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ClipboardCheck size={16} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Attendance Rate</h3>
          </div>
          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
            Section Avg
          </span>
        </div>

        {/* Big average */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-3xl font-black ${attendanceTextColor}`}>{avgAttendance}%</span>
          <span className="text-xs text-zinc-500 font-medium">regularity rate</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-100 rounded-full h-2 mb-3.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              avgAttendance >= 90 ? 'bg-emerald-500' : avgAttendance >= 75 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${avgAttendance}%` }}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <TrendingUp size={13} className="text-emerald-600" />
            <span>{good} above 90%</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
            <AlertTriangle size={13} className="text-rose-600" />
            <span>{atRisk} at risk (&lt;75%)</span>
          </div>
        </div>
      </div>

      {/* ── Fee Status Card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <CreditCard size={16} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Fee Clearance</h3>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-3.5">
          {new Date().toLocaleString('en-BD', { month: 'long', year: 'numeric' })} · Monthly Tuition
        </p>

        {/* Stacked bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden mb-3.5 bg-zinc-100">
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
              className="bg-rose-500 transition-all"
              style={{ width: `${(due / total) * 100}%` }}
              title={`Due: ${due}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle size={13} className="text-emerald-600" />
              <span>Paid</span>
            </div>
            <span className="text-zinc-900 font-bold font-mono">
              {paid} <span className="text-zinc-500 font-normal">({Math.round((paid / total) * 100)}%)</span>
            </span>
          </div>
          {partial > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <MinusCircle size={13} className="text-amber-600" />
                <span>Partial</span>
              </div>
              <span className="text-zinc-900 font-bold font-mono">
                {partial} <span className="text-zinc-500 font-normal">({Math.round((partial / total) * 100)}%)</span>
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <XCircle size={13} className="text-rose-600" />
              <span>Due Balance</span>
            </div>
            <span className="text-zinc-900 font-bold font-mono">
              {due} <span className="text-zinc-500 font-normal">({Math.round((due / total) * 100)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
