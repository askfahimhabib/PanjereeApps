import { useMemo } from 'react'
import { CheckCircle2, XCircle, Clock, MinusCircle, TrendingUp, CalendarCheck } from 'lucide-react'
import type { Student } from '../../types'
import { attendanceStore } from '@/data/stores'
import type { AttendanceStatus } from '@/features/attendance/types'

const STATUS_CFG: Record<AttendanceStatus, { icon: React.ElementType; color: string; badge: string; label: string }> = {
  PRESENT: {
    icon: CheckCircle2,
    color: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Present',
  },
  ABSENT: {
    icon: XCircle,
    color: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    label: 'Absent',
  },
  LATE: {
    icon: Clock,
    color: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Late',
  },
  LEAVE: {
    icon: MinusCircle,
    color: 'text-blue-700',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    label: 'Approved Leave',
  },
}

export function AttendanceTab({ student }: { student: Student }) {
  const records = useMemo(() => {
    return attendanceStore
      .getWhere(r => r.studentId === student.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [student.id])

  const total = records.length
  const present = records.filter(r => r.status === 'PRESENT').length
  const absent = records.filter(r => r.status === 'ABSENT').length
  const late = records.filter(r => r.status === 'LATE').length
  const leave = records.filter(r => r.status === 'LEAVE').length
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* ── Metric Summary Strip ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200/90 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Total Logged</p>
          <p className="text-2xl font-black text-zinc-900 font-mono mt-1">{total} Days</p>
          <p className="text-xs text-zinc-600 mt-0.5 font-medium">Recorded sessions</p>
        </div>

        <div className="bg-white border border-zinc-200/90 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Present</p>
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
          </div>
          <p className="text-2xl font-black text-emerald-800 font-mono mt-1">{present} Days</p>
          <p className="text-xs text-emerald-800 mt-0.5 font-medium">On-time attendance</p>
        </div>

        <div className="bg-white border border-zinc-200/90 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Absent</p>
            <span className="w-2 h-2 rounded-full bg-rose-700" />
          </div>
          <p className="text-2xl font-black text-rose-800 font-mono mt-1">{absent} Days</p>
          <p className="text-xs text-rose-800 mt-0.5 font-medium">Unexcused missed</p>
        </div>

        <div className="bg-white border border-zinc-200/90 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Late / Leave</p>
            <span className="w-2 h-2 rounded-full bg-amber-700" />
          </div>
          <p className="text-2xl font-black text-amber-800 font-mono mt-1">{late + leave} Days</p>
          <p className="text-xs text-amber-800 mt-0.5 font-medium">{late} late · {leave} leave</p>
        </div>
      </div>

      {/* ── Overall Presence Rate Bar ──────────────────────────── */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
            <TrendingUp size={15} className="text-emerald-700" />
            <span>Academic Attendance Performance</span>
          </div>
          <span className={`text-sm font-extrabold font-mono ${rate >= 80 ? 'text-emerald-800' : rate >= 60 ? 'text-amber-800' : 'text-zinc-600'}`}>
            {total > 0 ? `${rate}% Cumulative Rate` : 'No Record Logged Yet'}
          </span>
        </div>

        <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              rate >= 80 ? 'bg-emerald-700' : rate >= 60 ? 'bg-amber-700' : 'bg-rose-700'
            }`}
            style={{ width: `${Math.max(total > 0 ? rate : 0, 0)}%` }}
          />
        </div>
      </div>

      {/* ── Attendance Log Table / Empty State ─────────────────── */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Daily Attendance Log Record
          </h4>
          <span className="text-xs text-zinc-600 font-medium">
            Student: <strong className="text-zinc-900">{student.fullNameEn}</strong> (Roll {student.rollNumber})
          </span>
        </div>

        {records.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600 mb-3">
              <CalendarCheck size={24} />
            </div>
            <h5 className="text-sm font-bold text-zinc-900">No Attendance Records Yet</h5>
            <p className="text-xs text-zinc-600 max-w-sm mt-1">
              Roll-call attendance taken for {student.className} (Section {student.sectionName || 'A'}) in the Daily Attendance module will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
            {records.map(r => {
              const cfg = STATUS_CFG[r.status] || STATUS_CFG.PRESENT
              const Icon = cfg.icon
              const d = new Date(r.date)

              return (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${cfg.badge}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {d.toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {r.timeIn && (
                        <p className="text-[11px] text-zinc-600 mt-0.5">In-time: {r.timeIn}</p>
                      )}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
