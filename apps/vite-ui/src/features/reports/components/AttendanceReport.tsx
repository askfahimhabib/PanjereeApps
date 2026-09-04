import React, { useMemo } from 'react'
import {
  Users,
  TrendingDown,
  Calendar,
  Activity,
  AlertTriangle,
  Phone,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { AttendanceSummary } from '../types'

interface Props {
  data: AttendanceSummary
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  bgColor,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
      <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 mt-0.5">{value}</p>
        {subtext && <p className="text-[11px] text-zinc-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  )
}

function AttendanceHeatmap({ daily }: { daily: AttendanceSummary['daily'] }) {
  const maxTotal = Math.max(...daily.map((d) => d.total), 1)

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Daily Attendance Trends</h4>
          <p className="text-xs text-zinc-500">Student presence vs absenteeism breakdown over the last 30 recorded days</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-400" /> Absent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" /> Late
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-36 bg-zinc-50/80 rounded-xl p-3.5 border border-zinc-100 overflow-x-auto">
        {daily.map((d, i) => {
          const presentPct = d.total > 0 ? (d.present / d.total) * 100 : 0
          const absentPct = d.total > 0 ? (d.absent / d.total) * 100 : 0
          const height = Math.max(Math.round((d.total / maxTotal) * 100), 12)

          return (
            <div
              key={i}
              className="group flex-1 min-w-[8px] flex flex-col justify-end relative h-full cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[11px] rounded-lg px-2.5 py-2 whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <p className="font-semibold">{d.date}</p>
                <p className="text-emerald-400">Present: {d.present} ({Math.round(presentPct)}%)</p>
                <p className="text-red-400">Absent: {d.absent} ({Math.round(absentPct)}%)</p>
                {d.late > 0 && <p className="text-amber-400">Late: {d.late}</p>}
                <p className="text-zinc-400 text-[10px]">Total: {d.total}</p>
              </div>

              {/* Stacked bar */}
              <div className="flex flex-col gap-0.5 w-full" style={{ height: `${height}%` }}>
                <div
                  className="bg-red-400/85 rounded-t-xs transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${absentPct}%` }}
                />
                <div
                  className="bg-emerald-500 rounded-b-xs flex-1 transition-all duration-300 group-hover:brightness-110"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* X-axis labels every 5 days */}
      <div className="flex gap-1.5 px-3.5">
        {daily.map((d, i) => (
          <div key={i} className="flex-1 text-center min-w-[8px]">
            {i % 5 === 0 && (
              <span className="text-[10px] text-zinc-500 font-mono">
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
  const sorted = useMemo(() => [...byClass].sort((a, b) => b.presentPct - a.presentPct), [byClass])

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Attendance by Class</h4>
          <p className="text-xs text-zinc-500">Average student presence rates categorized by academic class</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">
          {byClass.length} Classes
        </span>
      </div>
      <div className="divide-y divide-zinc-100 p-2">
        {sorted.map((cls, i) => (
          <div key={i} className="flex items-center gap-4 px-3 py-2.5 hover:bg-zinc-50/50 rounded-xl transition-colors">
            <span className="text-xs font-semibold text-zinc-800 min-w-[130px]">{cls.className}</span>
            <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  cls.presentPct >= 90
                    ? 'bg-emerald-500'
                    : cls.presentPct >= 80
                    ? 'bg-blue-500'
                    : cls.presentPct >= 70
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${cls.presentPct}%` }}
              />
            </div>
            <span
              className={`text-xs font-bold w-14 text-right ${
                cls.presentPct >= 90
                  ? 'text-emerald-600'
                  : cls.presentPct >= 80
                  ? 'text-blue-600'
                  : cls.presentPct >= 70
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {cls.presentPct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeacherAttendanceCard({ data }: { data: AttendanceSummary['teacherAttendance'] }) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-zinc-900">Faculty & Staff Attendance</h4>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Today
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-4">Real-time presence tracking for teaching and admin staff</p>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-semibold uppercase text-zinc-500">Present</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold text-emerald-600">{data.presentToday}</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-semibold uppercase text-zinc-500">Absent</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold text-red-600">{data.absentToday}</span>
              <TrendingDown size={16} className="text-red-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-semibold uppercase text-zinc-500">On Leave</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold text-amber-600">{data.onLeaveToday}</span>
              <Clock size={16} className="text-amber-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-semibold uppercase text-zinc-500">Faculty Rate</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-bold text-zinc-900">{data.rateToday}%</span>
              <Activity size={16} className="text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
        <span>Total Faculty: <strong className="text-zinc-800">{data.totalTeachers}</strong></span>
        <span>Institutional Staff Health: <strong className="text-emerald-600 font-bold">Good</strong></span>
      </div>
    </div>
  )
}

function ChronicAbsenteeismTable({ list }: { list: AttendanceSummary['chronicAbsentList'] }) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-red-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Chronic Absenteeism Watchlist (&lt;75% Attendance)</h4>
            <p className="text-xs text-zinc-500">
              Students needing immediate academic and pastoral intervention
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
          {list.length} Students At Risk
        </span>
      </div>

      {/* Mobile Cards View */}
      <div className="block sm:hidden divide-y divide-zinc-100">
        {list.length === 0 ? (
          <div className="p-8 text-center text-emerald-600 text-xs font-medium">
            Excellent! No students currently fall below the 75% chronic absenteeism threshold.
          </div>
        ) : (
          list.map((s) => (
            <div key={s.studentId} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 text-xs truncate">{s.studentName}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {s.studentId} • Roll #{s.rollNumber}
                  </p>
                </div>
                <span className="inline-block font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs shrink-0">
                  {s.rate}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-zinc-50/70 p-2 rounded-xl border border-zinc-100 text-zinc-600">
                <span>{s.className} - Sec {s.sectionName}</span>
                <span>
                  <strong className="text-emerald-600 font-bold">{s.presentDays}P</strong> /{' '}
                  <strong className="text-red-600 font-bold">{s.absentDays}A</strong> of {s.totalDays}d
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-50">
                <span className="text-zinc-400 text-[10px]">Guardian:</span>
                {s.guardianMobile ? (
                  <a
                    href={`tel:${s.guardianMobile}`}
                    className="inline-flex items-center gap-1 font-mono text-zinc-700 hover:text-indigo-600 text-xs font-medium"
                  >
                    <Phone size={12} className="text-emerald-600" />
                    <span>{s.guardianMobile}</span>
                  </a>
                ) : (
                  <span className="text-zinc-300 text-[10px]">No phone</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">ID & Roll</th>
              <th className="px-4 py-3">Class / Section</th>
              <th className="px-4 py-3">Total Recorded Days</th>
              <th className="px-4 py-3">Present / Absent</th>
              <th className="px-4 py-3">Attendance Rate</th>
              <th className="px-4 py-3">Guardian Mobile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-emerald-600 font-medium">
                  Excellent! No students currently fall below the 75% chronic absenteeism threshold.
                </td>
              </tr>
            ) : (
              list.map((s) => (
                <tr key={s.studentId} className="hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{s.studentName}</td>
                  <td className="px-4 py-3 font-mono text-zinc-700">
                    <div>{s.studentId}</div>
                    <div className="text-[10px] text-zinc-400">Roll: {s.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {s.className} - Sec {s.sectionName}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{s.totalDays} days</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-600 font-bold">{s.presentDays} P</span> /{' '}
                    <span className="text-red-600 font-bold">{s.absentDays} A</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                      {s.rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.guardianMobile ? (
                      <a
                        href={`tel:${s.guardianMobile}`}
                        className="inline-flex items-center gap-1 font-mono text-zinc-800 hover:text-blue-600"
                      >
                        <Phone size={11} className="text-zinc-400" />
                        {s.guardianMobile}
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AttendanceReport({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* 1. Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={Calendar}
          label="School Days Recorded"
          value={data.totalDays}
          subtext="Academic calendar tracking"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Activity}
          label="Avg Attendance Rate"
          value={`${data.avgAttendanceRate}%`}
          subtext="Across all classes"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={Users}
          label="Avg Present / Day"
          value={data.avgPresent}
          subtext="Students attending daily"
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          icon={TrendingDown}
          label="Avg Absent / Day"
          value={data.avgAbsent}
          subtext="Daily absenteeism rate"
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* 2. Heatmap & Daily Trends */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
        <AttendanceHeatmap daily={data.daily} />
      </div>

      {/* 3. Class Table & Faculty Attendance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ClassAttendanceTable byClass={data.byClass} />
        </div>
        <div>
          <TeacherAttendanceCard data={data.teacherAttendance} />
        </div>
      </div>

      {/* 4. Chronic Absenteeism List */}
      <ChronicAbsenteeismTable list={data.chronicAbsentList} />
    </div>
  )
}
