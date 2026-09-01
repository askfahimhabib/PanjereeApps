import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Send,
  ArrowRight,
  TrendingUp,
  GraduationCap,
} from 'lucide-react'
import type { DashboardKpis } from '../types'

interface WidgetAttendancePulseProps {
  kpis: DashboardKpis
  onOpenAbsentSms?: () => void
}

export function WidgetAttendancePulse({
  kpis,
  onOpenAbsentSms,
}: WidgetAttendancePulseProps) {
  const rate = kpis.todayAttendanceRate ?? 0
  const trend = kpis.sevenDayAttendanceTrend

  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Attendance Pulse & Trends</h2>
              <p className="text-[11px] text-zinc-400">Real-time daily presence & 7-day radar</p>
            </div>
          </div>

          <Link
            to="/attendance"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
          >
            <span>Take Register</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Today's Presence Pills */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-extrabold text-emerald-700">{kpis.todayPresentCount}</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Present</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-extrabold text-amber-700">{kpis.todayLateCount}</span>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Late</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-100 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-extrabold text-rose-700">{kpis.todayAbsentCount}</span>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">Absent</span>
          </div>
        </div>

        {/* 7-Day Trend Visual Bars */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp size={13} className="text-emerald-600" />
              <span>7-Day Attendance Rate</span>
            </span>
            <span className="font-bold text-zinc-900">{rate > 0 ? `${rate}% Today` : 'Awaiting sync'}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-2 px-1">
            {trend.map((day, idx) => {
              const isToday = idx === trend.length - 1
              const heightPct = Math.max(15, day.presentRate)
              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-bold text-zinc-400 group-hover:text-zinc-700 transition-colors">
                    {day.presentRate}%
                  </span>
                  <div className="w-full bg-zinc-100 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isToday
                          ? 'bg-amber-500 group-hover:bg-amber-600'
                          : 'bg-emerald-500 group-hover:bg-emerald-600 opacity-80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.dayLabel}: ${day.presentRate}% (${day.presentCount}/${day.totalCount})`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isToday ? 'text-amber-700 font-extrabold' : 'text-zinc-500'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Teacher Attendance Snapshot */}
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <GraduationCap size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">Faculty Attendance</p>
              <p className="text-[11px] text-zinc-500">
                {kpis.teachersOnDutyToday} of {kpis.totalTeachers} teachers active
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {kpis.todayTeacherAttendanceRate}%
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
        <Link
          to="/attendance"
          className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold text-center transition-colors cursor-pointer"
        >
          Open Register
        </Link>

        {onOpenAbsentSms && (
          <button
            onClick={onOpenAbsentSms}
            className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            title="Send SMS notification to absent students"
          >
            <Send size={12} />
            <span>Absent SMS</span>
          </button>
        )}
      </div>
    </div>
  )
}
