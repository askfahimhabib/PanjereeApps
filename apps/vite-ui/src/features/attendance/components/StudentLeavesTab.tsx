import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  ClipboardList,
  MessageSquare,
  X,
  Check,
} from 'lucide-react'
import { leaveStore } from '@/data/stores'
import type { LeaveRequest, LeaveStatus } from '@/features/leaves/useLeaves'
import { ApplyLeaveModal } from './ApplyLeaveModal'
import { ScrollableTabs } from '@/components/ui/ScrollableTabs'

const STATUS_CFG: Record<
  LeaveStatus,
  { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }
> = {
  PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
}

function daysBetween(from: string, to: string) {
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1)
}

export function StudentLeavesTab() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [tab, setTab] = useState<LeaveStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [reviewModal, setReviewModal] = useState<{ record: LeaveRequest; action: 'APPROVED' | 'REJECTED' } | null>(null)

  const studentLeaves = useMemo(() => {
    return leaveStore
      .getWhere(l => l.applicantType === 'STUDENT')
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  }, [refreshKey])

  const filteredLeaves = useMemo(() => {
    return studentLeaves.filter(r => {
      if (tab !== 'ALL' && r.status !== tab) return false
      if (search) {
        const q = search.toLowerCase()
        if (!r.applicantName.toLowerCase().includes(q) && !r.reason.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [studentLeaves, tab, search])

  const stats = useMemo(() => {
    return {
      all: studentLeaves.length,
      pending: studentLeaves.filter(r => r.status === 'PENDING').length,
      approved: studentLeaves.filter(r => r.status === 'APPROVED').length,
      rejected: studentLeaves.filter(r => r.status === 'REJECTED').length,
    }
  }, [studentLeaves])

  const handleUpdateStatus = (id: string, status: LeaveStatus, note?: string) => {
    leaveStore.update(id, {
      status,
      reviewNote: note,
      reviewedBy: 'Academic Admin',
    })
    setRefreshKey(k => k + 1)
    setReviewModal(null)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Top Action & Filter Bar ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <ScrollableTabs className="max-w-full" trackClassName="gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => {
            const isSelected = tab === s
            const count =
              s === 'ALL'
                ? stats.all
                : s === 'PENDING'
                ? stats.pending
                : s === 'APPROVED'
                ? stats.approved
                : stats.rejected

            return (
              <button
                key={s}
                type="button"
                onClick={() => setTab(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                }`}
              >
                <span>{s === 'ALL' ? 'All Applications' : STATUS_CFG[s].label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-200/70 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </ScrollableTabs>

        {/* Search & Apply Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus size={15} />
            <span>Apply Student Leave</span>
          </button>
        </div>
      </div>

      {/* ── 2. Student Leave Records List ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="text-sm font-black text-zinc-900">
            Student Leave Applications ({filteredLeaves.length})
          </h3>
          <p className="text-xs text-zinc-500 font-medium">
            Approved leaves automatically mark students as &ldquo;On Leave&rdquo; in daily registers
          </p>
        </div>

        <div className="divide-y divide-zinc-100">
          {filteredLeaves.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <ClipboardList size={36} className="mx-auto mb-2 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-700">No student leave applications found</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                New applications will appear here for verification and approval.
              </p>
            </div>
          ) : (
            filteredLeaves.map(leave => {
              const cfg = STATUS_CFG[leave.status]
              const StatusIcon = cfg.icon
              const days = daysBetween(leave.fromDate, leave.toDate)

              return (
                <div
                  key={leave.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:bg-zinc-50/80 transition-colors"
                >
                  {/* Student Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">
                      {leave.applicantName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/students/${leave.applicantId}`}
                          className="text-sm font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate cursor-pointer"
                        >
                          {leave.applicantName}
                        </Link>
                        <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg">
                          {leave.className || 'Class Record'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-400" />
                          <span className="font-semibold text-zinc-800">
                            {new Date(leave.fromDate).toLocaleDateString('en-BD', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            —{' '}
                            {new Date(leave.toDate).toLocaleDateString('en-BD', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="font-bold text-indigo-700">({days} {days === 1 ? 'day' : 'days'})</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 mt-2 text-xs">
                        <MessageSquare size={13} className="text-zinc-400 mt-0.5 shrink-0" />
                        <p className="text-zinc-700 font-medium">Reason: {leave.reason}</p>
                      </div>

                      {leave.reviewNote && (
                        <p className="text-xs text-rose-600 mt-1 italic font-medium">
                          Note: {leave.reviewNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      <StatusIcon size={13} />
                      <span>{cfg.label}</span>
                    </span>

                    {leave.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReviewModal({ record: leave, action: 'APPROVED' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewModal({ record: leave, action: 'REJECTED' })}
                          className="flex items-center gap-1 px-3 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── 3. Apply Student Leave Modal ─────────────────────────────────── */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        defaultType="STUDENT"
        onSuccess={() => setRefreshKey(k => k + 1)}
      />

      {/* ── 4. Review Confirmation Modal ─────────────────────────────────── */}
      {reviewModal && (
        <ReviewDialog
          record={reviewModal.record}
          action={reviewModal.action}
          onClose={() => setReviewModal(null)}
          onConfirm={(id, note) => handleUpdateStatus(id, reviewModal.action, note)}
        />
      )}
    </div>
  )
}

function ReviewDialog({
  record,
  action,
  onClose,
  onConfirm,
}: {
  record: LeaveRequest
  action: 'APPROVED' | 'REJECTED'
  onClose: () => void
  onConfirm: (id: string, note?: string) => void
}) {
  const [note, setNote] = useState('')
  const isReject = action === 'REJECTED'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900 text-sm">
            {isReject ? 'Reject Leave Request' : 'Approve Leave Request'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-zinc-900">{record.applicantName}</p>
            <p className="text-zinc-500">
              {record.fromDate} to {record.toDate}
            </p>
            <p className="text-zinc-700 font-medium">{record.reason}</p>
          </div>

          {isReject && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Mandatory examination schedule..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-colors resize-none"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(record.id, note)}
              disabled={isReject && !note.trim()}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40 shadow-md cursor-pointer ${
                isReject ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isReject ? 'Confirm Reject' : 'Confirm Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
