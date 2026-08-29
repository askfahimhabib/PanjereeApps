import { useMemo, useState } from 'react'
import { Calendar, CheckCircle2, XCircle, Clock, MinusCircle, TrendingUp } from 'lucide-react'
import type { Student } from '../../types'
import { createStore } from '@/lib/localStore'
import type { AttendanceRecord, AttendanceStatus } from '@/features/attendance/types'

const attendanceStore = createStore<AttendanceRecord>('attendance')

const STATUS_CFG: Record<AttendanceStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  PRESENT: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Present' },
  ABSENT:  { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         label: 'Absent'  },
  LATE:    { icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     label: 'Late'    },
  LEAVE:   { icon: MinusCircle,  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       label: 'Leave'   },
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function AttendanceTab({ student }: { student: Student }) {
  const [view, setView] = useState<'recent' | 'monthly'>('recent')

  const records = useMemo(() =>
    attendanceStore
      .getWhere(r => r.studentId === student.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [student.id]
  )

  // Overall stats
  const total   = records.length
  const present = records.filter(r => r.status === 'PRESENT').length
  const absent  = records.filter(r => r.status === 'ABSENT').length
  const late    = records.filter(r => r.status === 'LATE').length
  const leave   = records.filter(r => r.status === 'LEAVE').length
  const rate    = total > 0 ? Math.round((present / total) * 100) : 0

  // Month-wise breakdown (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const mr = records.filter(r => r.date.startsWith(monthStr))
      const p = mr.filter(r => r.status === 'PRESENT').length
      const a = mr.filter(r => r.status === 'ABSENT').length
      const l = mr.filter(r => r.status === 'LATE').length
      const t = mr.length
      return { label: MONTH_NAMES[d.getMonth()], total: t, present: p, absent: a, late: l,
               rate: t > 0 ? Math.round((p / t) * 100) : null }
    })
  }, [records])

  const recentRecords = records.slice(0, 30)

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white border border-zinc-100 p-3 rounded-xl flex flex-col items-center">
          <span className="text-2xl font-bold text-zinc-800">{total}</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mt-0.5">Total</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex flex-col items-center">
          <span className="text-2xl font-bold text-emerald-400">{present}</span>
          <span className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-semibold mt-0.5">Present</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex flex-col items-center">
          <span className="text-2xl font-bold text-red-400">{absent}</span>
          <span className="text-[10px] text-red-500/70 uppercase tracking-wider font-semibold mt-0.5">Absent</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-col items-center">
          <span className="text-2xl font-bold text-amber-400">{late}</span>
          <span className="text-[10px] text-amber-500/70 uppercase tracking-wider font-semibold mt-0.5">Late</span>
        </div>
      </div>

      {/* Rate Bar */}
      <div className="bg-white border border-zinc-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <TrendingUp size={12} />
            <span>Overall Attendance Rate</span>
          </div>
          <span className={`text-sm font-bold ${rate >= 75 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {total > 0 ? `${rate}%` : '—'}
          </span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${rate}%` }}
          />
        </div>
        {leave > 0 && <p className="text-[10px] text-blue-400/70 mt-1.5">{leave} day(s) on approved leave</p>}
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 p-1 bg-white rounded-lg border border-zinc-100">
        {(['recent', 'monthly'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === v ? 'bg-zinc-100 text-zinc-800' : 'text-zinc-600 hover:text-zinc-800'
            }`}>
            {v === 'recent' ? 'Recent Records' : 'Monthly Summary'}
          </button>
        ))}
      </div>

      {/* Recent Records */}
      {view === 'recent' && (
        <div className="border border-zinc-100 rounded-xl overflow-hidden">
          {recentRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
              <Calendar size={28} className="mb-2 opacity-40" />
              <p className="text-sm">No attendance records yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
              {recentRecords.map(r => {
                const cfg = STATUS_CFG[r.status]
                const Icon = cfg.icon
                const d = new Date(r.date)
                return (
                  <div key={r.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon size={14} className={cfg.color} />
                      <p className="text-xs font-medium text-zinc-800">
                        {d.toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Monthly Summary */}
      {view === 'monthly' && (
        <div className="border border-zinc-100 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {monthlyData.map((m, i) => (
              <div key={i} className="px-4 py-3 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-800">{m.label}</span>
                  <span className={`text-xs font-bold ${
                    m.rate === null ? 'text-zinc-800' :
                    m.rate >= 75 ? 'text-emerald-400' : m.rate >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>{m.rate !== null ? `${m.rate}%` : '—'}</span>
                </div>
                {m.total > 0 ? (
                  <>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-1.5">
                      <div className={`h-1.5 rounded-full ${m.rate! >= 75 ? 'bg-emerald-500' : m.rate! >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                           style={{ width: `${m.rate}%` }} />
                    </div>
                    <div className="flex gap-3 text-[10px] text-zinc-600">
                      <span className="text-emerald-400/70">✓ {m.present}P</span>
                      <span className="text-red-400/70">✗ {m.absent}A</span>
                      {m.late > 0 && <span className="text-amber-400/70">~ {m.late}L</span>}
                      <span className="ml-auto">{m.total} days recorded</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-zinc-800">No records this month</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
