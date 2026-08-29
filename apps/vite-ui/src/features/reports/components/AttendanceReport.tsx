import { useMemo } from 'react'
import { Users, TrendingDown, Calendar, Activity } from 'lucide-react'
import type { AttendanceSummary } from '../types'

interface Props {
  data: AttendanceSummary
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
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

function AttendanceHeatmap({ daily }: { daily: AttendanceSummary['daily'] }) {
  const maxTotal = Math.max(...daily.map(d => d.total), 1)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Daily Attendance (Last 30 Days)</h4>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/20 inline-block" />Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />High</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 h-32 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
        {daily.map((d, i) => {
          const presentPct = d.total > 0 ? (d.present / d.total) * 100 : 0
          const absentPct  = d.total > 0 ? (d.absent / d.total) * 100 : 0
          const height = Math.round((d.total / maxTotal) * 100)
          return (
            <div
              key={i}
              className="group flex-1 flex flex-col justify-end relative"
              style={{ minWidth: '6px' }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-100 border border-zinc-100 text-[10px] text-zinc-800 rounded-lg px-2 py-1.5 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <p className="font-semibold">{d.date}</p>
                <p className="text-emerald-400">Present: {d.present} ({Math.round(presentPct)}%)</p>
                <p className="text-red-400">Absent: {d.absent} ({Math.round(absentPct)}%)</p>
                {d.late > 0 && <p className="text-amber-400">Late: {d.late}</p>}
              </div>

              {/* Stack bar */}
              <div className="flex flex-col gap-px" style={{ height: `${height}%` }}>
                <div
                  className="bg-red-500/70 rounded-t-sm transition-all"
                  style={{ height: `${absentPct}%` }}
                />
                <div
                  className="bg-emerald-500 rounded-sm flex-1 transition-all"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* X-axis labels every 5 days */}
      <div className="flex gap-1 px-3">
        {daily.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {i % 5 === 0 && (
              <span className="text-[9px] text-zinc-800">
                {d.date.slice(5)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ClassAttendanceTable({ byClass }: { byClass: AttendanceSummary['byClass'] }) {
  const sorted = [...byClass].sort((a, b) => b.presentPct - a.presentPct)

  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Attendance by Class</h4>
      </div>
      <div className="divide-y divide-slate-800/60">
        {sorted.map((cls, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <span className="text-sm text-zinc-800 min-w-[120px]">{cls.className}</span>
            <div className="flex-1 h-2 bg-zinc-50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  cls.presentPct >= 90 ? 'bg-emerald-500' :
                  cls.presentPct >= 80 ? 'bg-blue-500' :
                  cls.presentPct >= 70 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${cls.presentPct}%` }}
              />
            </div>
            <span className={`text-sm font-bold w-12 text-right ${
              cls.presentPct >= 90 ? 'text-emerald-400' :
              cls.presentPct >= 80 ? 'text-blue-400' :
              cls.presentPct >= 70 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {cls.presentPct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AttendanceReport({ data }: Props) {
  const avgPresentPct = useMemo(
    () => Math.round((data.avgPresent / (data.avgPresent + data.avgAbsent)) * 100),
    [data]
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Calendar} label="School Days" value={data.totalDays} color="text-blue-400" />
        <StatCard icon={Users} label="Avg Present / Day" value={data.avgPresent} color="text-emerald-400" />
        <StatCard icon={TrendingDown} label="Avg Absent / Day" value={data.avgAbsent} color="text-red-400" />
        <StatCard icon={Activity} label="Avg Attendance Rate" value={`${avgPresentPct}%`} color="text-purple-400" />
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4">
        <AttendanceHeatmap daily={data.daily} />
      </div>

      {/* Class table */}
      <ClassAttendanceTable byClass={data.byClass} />
    </div>
  )
}
