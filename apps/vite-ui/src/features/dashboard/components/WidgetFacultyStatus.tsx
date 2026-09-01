import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Check,
  X,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react'
import type { Teacher } from '@/features/teachers/types'
import type { LeaveRequest } from '@/features/leaves/useLeaves'
import { leaveStore } from '@/data/stores'

interface WidgetFacultyStatusProps {
  teachers: Teacher[]
  pendingLeaves: LeaveRequest[]
  onRefresh: () => void
}

export function WidgetFacultyStatus({
  teachers,
  pendingLeaves,
  onRefresh,
}: WidgetFacultyStatusProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleReviewLeave = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id)
    leaveStore.update(id, {
      status,
      reviewedBy: 'Principal / Admin',
    })
    setTimeout(() => {
      setProcessingId(null)
      onRefresh()
    }, 200)
  }

  // Department counts
  const departmentMap = new Map<string, number>()
  teachers.forEach(t => {
    const dept = t.department || 'General'
    departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1)
  })

  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Faculty & Staff Operations</h2>
              <p className="text-[11px] text-zinc-400">Department distribution & leave approvals</p>
            </div>
          </div>

          <Link
            to="/teachers"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            <span>Staff Directory</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Pending Leave Requests Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} className="text-amber-500" />
              <span>Pending Leave Approvals ({pendingLeaves.length})</span>
            </span>
            <Link to="/leaves" className="text-[11px] font-semibold text-emerald-600 hover:underline">
              Leave Manager
            </Link>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="py-5 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
              <UserCheck size={20} className="mx-auto mb-1 opacity-40 text-emerald-600" />
              <p className="text-xs font-semibold text-zinc-600">All leave requests reviewed</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 hide-scrollbar">
              {pendingLeaves.slice(0, 3).map(leave => (
                <div
                  key={leave.id}
                  className="p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{leave.applicantName}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {leave.fromDate} to {leave.toDate} ({leave.applicantType})
                    </p>
                    {leave.reason && (
                      <p className="text-[10px] text-zinc-400 truncate italic mt-0.5">
                        "{leave.reason}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleReviewLeave(leave.id, 'APPROVED')}
                      disabled={processingId === leave.id}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      title="Approve leave"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => handleReviewLeave(leave.id, 'REJECTED')}
                      disabled={processingId === leave.id}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition-all cursor-pointer disabled:opacity-50"
                      title="Reject leave"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Faculty by Department
            </span>
            <span className="text-[11px] font-bold text-zinc-700">{teachers.length} Active</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Array.from(departmentMap.entries()).map(([dept, count]) => (
              <span
                key={dept}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-semibold border border-zinc-200/60"
              >
                <span>{dept}</span>
                <span className="px-1 py-0.2 rounded bg-white text-zinc-900 text-[10px] font-bold shadow-xs">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500">
          Total Faculty: <strong className="text-zinc-900">{teachers.length}</strong>
        </span>
        <Link
          to="/leaves"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
        >
          <span>Attendance & Leaves</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
