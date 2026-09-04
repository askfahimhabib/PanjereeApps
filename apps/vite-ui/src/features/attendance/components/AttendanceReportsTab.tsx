import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Printer,
  Search,
  CheckCircle,
  Send,
} from 'lucide-react'
import { useAttendanceReports } from '../useAttendance'

export function AttendanceReportsTab() {
  const { atRisk, classSummaries } = useAttendanceReports()
  const [search, setSearch] = useState('')
  const [notifiedMap, setNotifiedMap] = useState<Record<string, boolean>>({})

  const filteredAtRisk = useMemo(() => {
    if (!search.trim()) return atRisk
    const q = search.toLowerCase()
    return atRisk.filter(
      s =>
        s.studentName.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.rollNumber.includes(q)
    )
  }, [atRisk, search])

  const handleNotifyGuardian = (studentId: string) => {
    setNotifiedMap(prev => ({ ...prev, [studentId]: true }))
    setTimeout(() => {
      setNotifiedMap(prev => ({ ...prev, [studentId]: false }))
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. At-Risk Attendance Monitor Alert Strip ───────────────────── */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-rose-950">
                  Low Attendance Warning Monitor (&lt; 75% Attendance)
                </h3>
                <span className="text-xs font-bold bg-rose-200/80 text-rose-900 px-2.5 py-0.5 rounded-full">
                  {atRisk.length} Students At Risk
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 font-medium leading-relaxed">
                Education board regulations require minimum 75% attendance for examination eligibility.
                Review students below threshold and issue official guardian notifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Warning List</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Class-Wise Attendance Heatmap Matrix ─────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-zinc-900">
              Institutional Class-Wise Attendance Performance
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Monthly consolidated attendance rate across all classes
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-xl border border-zinc-200">
            Current Session 2024-2025
          </span>
        </div>

        {/* Mobile View: Class Attendance Cards */}
        <div className="block sm:hidden divide-y divide-zinc-100">
          {classSummaries.map(summary => {
            const isHigh = summary.averageRate >= 85
            const isModerate = summary.averageRate >= 75 && summary.averageRate < 85

            return (
              <div key={summary.classId} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/admin/classes/${summary.classId}`}
                    className="font-bold text-zinc-900 text-sm hover:text-indigo-600"
                  >
                    {summary.className}
                  </Link>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isModerate
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isHigh ? 'Excellent' : isModerate ? 'Acceptable' : 'Attention Needed'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Avg Attendance</span>
                    <span className="font-bold font-mono text-zinc-900">{summary.averageRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${summary.averageRate}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500">
                  <span>Enrolled: <strong className="font-mono text-zinc-800">{summary.totalStudents}</strong></span>
                  {summary.atRiskCount > 0 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                      <AlertTriangle size={10} /> {summary.atRiskCount} at risk
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold text-[10px]">✓ 100% Eligible</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-zinc-500 font-bold uppercase tracking-wider text-left">
                <th className="px-6 py-3.5">Class Tier</th>
                <th className="px-4 py-3.5">Enrolled Students</th>
                <th className="px-4 py-3.5">Average Attendance Rate</th>
                <th className="px-4 py-3.5">At-Risk Count (&lt;75%)</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {classSummaries.map(summary => {
                const isHigh = summary.averageRate >= 85
                const isModerate = summary.averageRate >= 75 && summary.averageRate < 85

                return (
                  <tr key={summary.classId} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      <Link
                        to={`/admin/classes/${summary.classId}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {summary.className}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-bold text-zinc-700 font-mono">
                      {summary.totalStudents} Students
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                          <div
                            className={`h-full rounded-full ${
                              isHigh
                                ? 'bg-emerald-500'
                                : isModerate
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${summary.averageRate}%` }}
                          />
                        </div>
                        <span className="font-bold font-mono text-zinc-900">
                          {summary.averageRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {summary.atRiskCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px]">
                          <AlertTriangle size={11} /> {summary.atRiskCount} at risk
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-medium">— None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isModerate
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isHigh ? 'Excellent' : isModerate ? 'Acceptable' : 'Attention Needed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. At-Risk Students Detailed Roster ─────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-black text-zinc-900">
              Students Below 75% Attendance ({filteredAtRisk.length})
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Direct guardian contact and official warning broadcast
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student or class..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-colors"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {filteredAtRisk.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-bold text-zinc-800">All students meet attendance criteria!</p>
              <p className="text-xs text-zinc-400 mt-0.5">No students are currently below 75%.</p>
            </div>
          ) : (
            filteredAtRisk.map(student => {
              const isNotified = notifiedMap[student.studentId]

              return (
                <div
                  key={student.studentId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-4 hover:bg-zinc-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-sm flex items-center justify-center shrink-0">
                      #{student.rollNumber}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/students/${student.studentId}`}
                          className="text-sm font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate cursor-pointer"
                        >
                          {student.studentName}
                        </Link>
                        <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg">
                          {student.className} (Sec {student.sectionName})
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 mt-0.5">
                        Guardian: <strong className="text-zinc-700">{student.guardianName}</strong> · Phone:{' '}
                        <span className="font-mono text-zinc-700 font-bold">{student.guardianMobile || '01700-000000'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-zinc-100 md:border-0">
                    <div className="text-left md:text-right">
                      <p className="text-base font-black text-rose-700 font-mono leading-tight">
                        {student.attendanceRate}%
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {student.presentDays}/{student.totalSchoolDays} Days
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNotifyGuardian(student.studentId)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isNotified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                      }`}
                    >
                      {isNotified ? <CheckCircle size={13} /> : <Send size={13} />}
                      <span>{isNotified ? 'SMS Dispatched!' : 'Send Warning SMS'}</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
