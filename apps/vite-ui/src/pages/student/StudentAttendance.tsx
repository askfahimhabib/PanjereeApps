import { useState, useMemo } from 'react'
import {
  CalendarCheck,
  FileText,
  Plus,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { leaveStore, attendanceStore } from '@/data/stores'
import { ApplyLeaveModal } from '@/features/student-portal/components/ApplyLeaveModal'

export function StudentAttendance() {
  const { student } = useStudentSession()
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Current Month State
  const [currentMonthDate] = useState(new Date())

  // Real attendance logs for this student
  const studentAttendanceLogs = useMemo(() => {
    return attendanceStore.getAll().filter((r) => r.studentId === student.id)
  }, [student.id, refreshKey])

  // Map of date string 'YYYY-MM-DD' -> status
  const attendanceDateMap = useMemo(() => {
    const map = new Map<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'>()
    for (const log of studentAttendanceLogs) {
      if (log.date) {
        map.set(log.date, log.status)
      }
    }
    return map
  }, [studentAttendanceLogs])

  // Leave records strictly for this student (Fixed data leakage)
  const studentLeaves = useMemo(() => {
    const all = leaveStore.getAll()
    return all.filter((l) => l.applicantId === student.id)
  }, [student.id, refreshKey])

  // Approved leave dates for this student
  const approvedLeaves = useMemo(() => {
    return studentLeaves.filter((l) => l.status === 'APPROVED')
  }, [studentLeaves])

  // Generate days in current month from real records
  const daysInMonth = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const totalDays = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const days = []
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d)
      const dayOfWeek = dateObj.getDay()
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Bangladesh Fri & Sat weekend

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isCoveredByApprovedLeave = approvedLeaves.some(
        (l) => dateStr >= l.fromDate && dateStr <= l.toDate
      )

      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'WEEKEND' | 'FUTURE' | 'UNRECORDED' = 'UNRECORDED'
      if (dateObj > today) {
        status = 'FUTURE'
      } else if (isWeekend) {
        status = 'WEEKEND'
      } else if (attendanceDateMap.has(dateStr)) {
        status = attendanceDateMap.get(dateStr)!
      } else if (isCoveredByApprovedLeave) {
        status = 'LEAVE'
      } else {
        status = 'UNRECORDED'
      }

      days.push({
        day: d,
        date: dateObj,
        status,
      })
    }
    return days
  }, [currentMonthDate, attendanceDateMap, approvedLeaves])

  // Aggregate stats strictly based on recorded past days
  const stats = useMemo(() => {
    const pastDays = daysInMonth.filter((d) => d.status !== 'FUTURE' && d.status !== 'WEEKEND')
    const recordedDays = pastDays.filter((d) => d.status !== 'UNRECORDED')
    const present = recordedDays.filter((d) => d.status === 'PRESENT').length
    const late = recordedDays.filter((d) => d.status === 'LATE').length
    const absent = recordedDays.filter((d) => d.status === 'ABSENT').length
    const leave = recordedDays.filter((d) => d.status === 'LEAVE').length
    const total = recordedDays.length
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100

    return { total, present, late, absent, leave, percentage, unrecordedCount: pastDays.length - total }
  }, [daysInMonth])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="text-emerald-500" size={22} />
            Attendance & Leaves (উপস্থিতি ও ছুটির আবেদন)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track daily check-in logs and submit online leave requests for {student.fullNameEn}
          </p>
        </div>

        <button
          onClick={() => setLeaveModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus size={15} />
          Apply for Leave
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500">Attendance Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.percentage}%</div>
          <span className="text-[11px] text-zinc-400">Total {stats.total} working days</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500">Days Present (উপস্থিত)</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stats.present}</div>
          <span className="text-[11px] text-emerald-600 font-medium">On-time check-ins</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500">Days Absent (অনুপস্থিত)</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{stats.absent}</div>
          <span className="text-[11px] text-zinc-400">Requires leave note</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500">Late Arrivals (বিলম্ব)</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.late}</div>
          <span className="text-[11px] text-zinc-400">After 09:15 AM</span>
        </div>
      </div>

      {/* Monthly Attendance Calendar Heatmap */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-white text-base">
            Attendance Log for {currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h3>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" /> Weekend
            </span>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 pt-2">
          {daysInMonth.map((item) => {
            const isPresent = item.status === 'PRESENT'
            const isLate = item.status === 'LATE'
            const isWeekend = item.status === 'WEEKEND'
            const isFuture = item.status === 'FUTURE'
            const isUnrecorded = item.status === 'UNRECORDED'

            return (
              <div
                key={item.day}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between h-18 ${
                  isFuture
                    ? 'bg-zinc-50/40 dark:bg-zinc-900/40 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-60'
                    : isWeekend
                    ? 'bg-zinc-100/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                    : isUnrecorded
                    ? 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400'
                    : isPresent
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : isLate
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/30 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-bold">{item.day}</span>
                  <span className="opacity-70">
                    {item.date.toLocaleString('en-US', { weekday: 'narrow' })}
                  </span>
                </div>
                <div className="text-[10px] font-bold mt-1 uppercase">
                  {isFuture ? '—' : isWeekend ? 'Fri' : isUnrecorded ? 'Off' : isPresent ? 'P' : isLate ? 'Late' : 'Abs'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leave Application Status Tracker */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-purple-500" size={18} />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Leave Requests & Approvals (ছুটির আবেদন বিবরণী)
            </h3>
          </div>
          <span className="text-xs text-zinc-500">{studentLeaves.length} record(s)</span>
        </div>

        {studentLeaves.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            No leave requests submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {studentLeaves.map((leave) => (
              <div key={leave.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">
                      {leave.reason}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        leave.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : leave.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Duration: <span className="font-mono text-zinc-700 dark:text-zinc-300">{leave.fromDate}</span> to{' '}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{leave.toDate}</span>
                    {leave.reviewNote && (
                      <span className="ml-2 text-rose-500">Note: {leave.reviewNote}</span>
                    )}
                  </p>
                </div>

                <span className="text-[11px] text-zinc-400 font-mono">
                  Applied: {leave.appliedAt ? leave.appliedAt.split('T')[0] : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        student={student}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
