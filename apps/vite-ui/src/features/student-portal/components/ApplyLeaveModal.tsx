import { useState } from 'react'
import { X, Calendar, CheckCircle2 } from 'lucide-react'
import { leaveStore } from '@/data/stores'
import type { StudentPersona } from '../types'

interface ApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  student: StudentPersona
  onSuccess?: () => void
}

export function ApplyLeaveModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: ApplyLeaveModalProps) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [category, setCategory] = useState<'SICK' | 'URGENT_FAMILY' | 'ACADEMIC' | 'OTHER'>('SICK')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromDate || !toDate || !reason.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const newLeave = {
        id: `leave-${Date.now()}`,
        applicantId: student.id,
        applicantName: student.fullNameEn,
        applicantType: 'STUDENT' as const,
        className: student.className || 'Class 10',
        fromDate,
        toDate,
        reason: `[${category}] ${reason.trim()}`,
        status: 'PENDING' as const,
        appliedAt: new Date().toISOString(),
      }

      leaveStore.insert(newLeave)
      setIsSubmitting(false)
      setIsSuccess(true)
      if (onSuccess) onSuccess()
    }, 600)
  }

  const handleClose = () => {
    setIsSuccess(false)
    setReason('')
    setFromDate('')
    setToDate('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
              Apply for Leave (ছুটির আবেদন)
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Leave Application Submitted!</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Your application has been submitted to the class teacher and administration for review.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Leave Category / ছুটির ধরন
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-100"
              >
                <option value="SICK">Medical / Sick Leave (অসুস্থতা)</option>
                <option value="URGENT_FAMILY">Urgent Family Matter (পারিবারিক কারণ)</option>
                <option value="ACADEMIC">Academic / Competition (শিক্ষা বা প্রতিযোগিতা)</option>
                <option value="OTHER">Other / অন্যান্য</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  From Date (হতে)
                </label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  To Date (পর্যন্ত)
                </label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Reason / ছুটির কারণ
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ছুটির স্পষ্ট কারণ লিখুন (e.g. ভাইরাল জ্বরের কারণে ডাক্তারের পরামর্শে বিশ্রাম)..."
                className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application (আবেদন জমা দিন)'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
