import { useState } from 'react'
import { ClipboardList, CheckCircle2, XCircle, Clock, Search, User, Calendar, MessageSquare, X } from 'lucide-react'
import { useLeaves, type LeaveStatus, type LeaveApplicantType, type LeaveRequest } from '@/features/leaves/useLeaves'

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<LeaveStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  PENDING:  { label: 'Pending',  bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', bg: 'bg-red-100',   text: 'text-red-700',   icon: XCircle },
}

function daysBetween(from: string, to: string) {
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1)
}

// ── Component ────────────────────────────────────────────────────────────────

export function Leaves() {
  const {
    filtered, stats,
    tab, setTab,
    typeFilter, setTypeFilter,
    search, setSearch,
    updateLeave,
  } = useLeaves()

  const [reviewModal, setReviewModal] = useState<{ record: LeaveRequest; action: 'APPROVED' | 'REJECTED' } | null>(null)

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Leave Management</h1>
        <p className="text-sm text-zinc-500 mt-1">Review leave applications from teachers and students</p>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {([['PENDING', 'Pending', stats.pending, 'bg-amber-50', 'text-amber-700'],
           ['APPROVED', 'Approved', stats.approved, 'bg-green-50', 'text-green-700'],
           ['REJECTED', 'Rejected', stats.rejected, 'bg-red-50', 'text-red-700']] as const).map(([key, label, val, bg, text]) => (
          <button key={key} onClick={() => setTab(key as LeaveStatus)}
            className={`${bg} border rounded-2xl p-4 text-left transition-all ${tab === key ? 'border-current ring-2 ring-current/20' : 'border-zinc-100'}`}>
            <p className={`text-2xl font-bold ${text}`}>{val}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or reason..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
        </div>
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
          {(['ALL', 'TEACHER', 'STUDENT'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${typeFilter === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
              {t === 'ALL' ? 'All' : t === 'TEACHER' ? 'Teacher' : 'Student'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
          {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button key={s} onClick={() => setTab(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${tab === s ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
              {s === 'ALL' ? 'All' : STATUS_CFG[s as LeaveStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Leave Cards ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl p-12 text-center shadow-sm">
          <ClipboardList size={36} className="mx-auto mb-3 text-zinc-200" />
          <p className="font-semibold text-zinc-700">No leave applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const cfg = STATUS_CFG[r.status]
            const StatusIcon = cfg.icon
            const days = daysBetween(r.fromDate, r.toDate)
            return (
              <div key={r.id} className="bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${r.applicantType === 'TEACHER' ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                    {r.applicantName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900">{r.applicantName}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${r.applicantType === 'TEACHER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {r.applicantType === 'TEACHER' ? 'Teacher' : 'Student'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{r.designation ?? r.className}</p>

                    <div className="flex items-center gap-4 mt-2 flex-wrap text-sm">
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <Calendar size={13} className="text-zinc-400" />
                        <span>{new Date(r.fromDate).toLocaleDateString('en-GB')} — {new Date(r.toDate).toLocaleDateString('en-GB')}</span>
                        <span className="font-semibold text-zinc-800">({days} days)</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 mt-2">
                      <MessageSquare size={13} className="text-zinc-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-zinc-600">{r.reason}</p>
                    </div>

                    {r.reviewNote && (
                      <p className="text-xs text-red-600 mt-1.5 italic">Reason for rejection: {r.reviewNote}</p>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon size={11} />
                      {cfg.label}
                    </span>
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1.5 mt-1">
                        <button onClick={() => setReviewModal({ record: r, action: 'APPROVED' })}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button onClick={() => setReviewModal({ record: r, action: 'REJECTED' })}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Review Modal ──────────────────────────────────── */}
      {reviewModal && (
        <ReviewModal
          record={reviewModal.record}
          action={reviewModal.action}
          onClose={() => setReviewModal(null)}
          onConfirm={(id, note) => { updateLeave(id, reviewModal.action, note); setReviewModal(null) }}
        />
      )}
    </div>
  )
}

// ── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({ record: r, action, onClose, onConfirm }: {
  record: LeaveRequest
  action: 'APPROVED' | 'REJECTED'
  onClose: () => void
  onConfirm: (id: string, note: string) => void
}) {
  const [note, setNote] = useState('')
  const isReject = action === 'REJECTED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">{isReject ? 'Reject Application' : 'Approve Application'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-zinc-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-zinc-800">{r.applicantName}</p>
            <p className="text-zinc-500 mt-1">{r.fromDate} — {r.toDate}</p>
            <p className="text-zinc-600 mt-1">{r.reason}</p>
          </div>
          {isReject && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Reason for rejection *</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Enter reason..."
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none resize-none" />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancel</button>
            <button
              onClick={() => { if (!isReject || note.trim()) onConfirm(r.id, note) }}
              disabled={isReject && !note.trim()}
              className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${isReject ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
