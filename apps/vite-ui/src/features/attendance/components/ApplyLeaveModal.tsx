import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Plus, CheckCircle } from 'lucide-react'
import { studentStore, teacherStore, leaveStore } from '@/data/stores'
import type { LeaveApplicantType } from '@/features/leaves/useLeaves'

interface ApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  defaultType?: LeaveApplicantType
  onSuccess?: () => void
}

export function ApplyLeaveModal({
  isOpen,
  onClose,
  defaultType = 'STUDENT',
  onSuccess,
}: ApplyLeaveModalProps) {
  const [applicantType, setApplicantType] = useState<LeaveApplicantType>(defaultType)
  const [selectedId, setSelectedId] = useState('')
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
  const [leaveCategory, setLeaveCategory] = useState('Medical')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const students = studentStore.getWhere(s => s.status === 'ACTIVE')
  const teachers = teacherStore.getWhere(t => t.isActive !== false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) {
      setError('Please select an applicant.')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the leave application.')
      return
    }

    let applicantName = ''
    let designation = ''
    let className = ''

    if (applicantType === 'STUDENT') {
      const s = students.find(item => item.id === selectedId)
      applicantName = s?.fullNameEn || 'Student'
      className = `${s?.className || 'Class'} (Sec ${s?.sectionName || 'A'}, Roll ${s?.rollNumber || '01'})`
    } else {
      const t = teachers.find(item => item.id === selectedId)
      applicantName = t?.fullName || 'Teacher'
      designation = t?.designation || 'Faculty'
    }

    leaveStore.insert({
      id: crypto.randomUUID(),
      applicantId: selectedId,
      applicantName,
      applicantType,
      designation: applicantType === 'TEACHER' ? designation : undefined,
      className: applicantType === 'STUDENT' ? className : undefined,
      fromDate,
      toDate,
      reason: `${leaveCategory}: ${reason}`,
      status: 'APPROVED', // Direct entry by admin/faculty is pre-approved
      reviewedBy: 'Admin',
      appliedAt: new Date().toISOString(),
    })

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onSuccess?.()
      onClose()
    }, 700)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">Record Leave Application</h2>
              <p className="text-xs text-zinc-500 font-medium">Log official student or faculty leave</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Applicant Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Applicant Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setApplicantType('STUDENT')
                  setSelectedId('')
                  setError('')
                }}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  applicantType === 'STUDENT'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Student Leave
              </button>
              <button
                type="button"
                onClick={() => {
                  setApplicantType('TEACHER')
                  setSelectedId('')
                  setError('')
                }}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  applicantType === 'TEACHER'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Teacher / Staff Leave
              </button>
            </div>
          </div>

          {/* Applicant Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Select {applicantType === 'STUDENT' ? 'Student' : 'Teacher / Staff'} <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedId}
              onChange={e => {
                setSelectedId(e.target.value)
                setError('')
              }}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            >
              <option value="">
                — Select {applicantType === 'STUDENT' ? 'Student from roster' : 'Teacher / Staff'} —
              </option>
              {applicantType === 'STUDENT'
                ? students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullNameEn} — {s.className} (Sec {s.sectionName || 'A'}, Roll #{s.rollNumber})
                    </option>
                  ))
                : teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.designation || 'Teacher'}, {t.department || 'General'})
                    </option>
                  ))}
            </select>
          </div>

          {/* Leave Category */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Medical / Sick', 'Casual / Family', 'Emergency'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setLeaveCategory(cat)}
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    leaveCategory === cat
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Reason / Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => {
                setReason(e.target.value)
                setError('')
              }}
              placeholder="e.g. Severe fever under doctor observation..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-rose-600 text-xs font-bold">{error}</p>}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                submitted ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {submitted ? <CheckCircle size={15} /> : <Plus size={15} />}
              <span>{submitted ? 'Recorded!' : 'Save Leave Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
