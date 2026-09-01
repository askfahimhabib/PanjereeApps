import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  CreditCard,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Receipt,
  Trash2,
} from 'lucide-react'
import type { PaymentRecord } from '@/features/payments/types'
import { formatCurrency, MONTH_NAMES } from '@/features/payments/types'
import type { ClassItem } from '../../types'
import { useDeletePayment } from '@/features/payments/hooks/usePayments'
import { useQueryClient } from '@tanstack/react-query'
import { paymentStore } from '@/data/stores'

interface FeeHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  classes: ClassItem[]
}

interface ClassFeeRow {
  classId: string
  className: string
  totalStudents: number
  paidCount: number
  collectedAmount: number
  payments: PaymentRecord[]
}

const buildMonths = () => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return {
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    }
  })
}

const MONTHS = buildMonths()

export function FeeHistoryModal({ isOpen, onClose, classes }: FeeHistoryModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  const qc = useQueryClient()
  const deletePayment = useDeletePayment()

  const handleDelete = (p: PaymentRecord) => {
    if (window.confirm(`Delete payment ${p.invoice_number} for ${p.student_name}? This cannot be undone.`)) {
      deletePayment.mutate(p.id, {
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
      })
    }
  }

  const { month, year } = MONTHS[selectedIdx]

  const rows = useMemo<ClassFeeRow[]>(() => {
    const payments = paymentStore.getWhere(
      p =>
        p.status !== 'REFUNDED' &&
        p.items.some(item => item.month === month && item.year === year),
    )

    return classes.map(cls => {
      const clsPayments = payments.filter(p => p.class_id === cls.id)
      const paidStudentIds = new Set(clsPayments.map(p => p.student_id))
      return {
        classId: cls.id,
        className: cls.name,
        totalStudents: cls.totalStudents,
        paidCount: paidStudentIds.size,
        collectedAmount: clsPayments.reduce((s, p) => s + p.total_amount, 0),
        payments: clsPayments,
      }
    })
  }, [classes, month, year])

  const totalCollected = rows.reduce((s, r) => s + r.collectedAmount, 0)
  const totalPaid = rows.reduce((s, r) => s + r.paidCount, 0)
  const totalStudents = rows.reduce((s, r) => s + r.totalStudents, 0)

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="p-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
            <CreditCard size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-900">Fee Collection History</h2>
            <p className="text-xs text-zinc-500 font-medium">Class-wise monthly fee collection breakdown</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Month Selector ──────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider shrink-0">Month:</span>
          <div className="flex gap-1.5 flex-wrap">
            {MONTHS.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedIdx(i)
                  setExpandedClass(null)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  i === selectedIdx
                    ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Summary Strip ───────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-b border-zinc-100 grid grid-cols-3 gap-3 bg-zinc-50/50">
          <div className="flex flex-col gap-0.5 rounded-2xl bg-white border border-zinc-200 p-3 shadow-2xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Collected</span>
            <span className="text-base sm:text-lg font-black text-amber-700">{formatCurrency(totalCollected)}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl bg-white border border-zinc-200 p-3 shadow-2xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Students Paid</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">
              {totalPaid}
              <span className="text-xs text-zinc-500 font-normal"> / {totalStudents}</span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-2xl bg-white border border-zinc-200 p-3 shadow-2xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Collection Rate</span>
            <span className="text-base sm:text-lg font-black text-indigo-700">
              {totalStudents > 0 ? Math.round((totalPaid / totalStudents) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* ── Class Rows ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2.5">
          {rows.map(row => {
            const rate = row.totalStudents > 0 ? Math.round((row.paidCount / row.totalStudents) * 100) : 0
            const due = row.totalStudents - row.paidCount
            const isExpanded = expandedClass === row.classId

            return (
              <div
                key={row.classId}
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs"
              >
                {/* Row Header */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left cursor-pointer"
                  onClick={() => setExpandedClass(isExpanded ? null : row.classId)}
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-indigo-700">
                      {row.className.replace(/[^0-9]/g, '').slice(0, 3) || row.className.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900">{row.className}</span>
                      <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-0.5">
                        <Users size={10} /> {row.totalStudents}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-zinc-600 shrink-0">{rate}%</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-700 font-mono">{formatCurrency(row.collectedAmount)}</p>
                    <div className="flex items-center gap-2 justify-end mt-0.5 text-[10px]">
                      <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                        <CheckCircle size={10} /> {row.paidCount}
                      </span>
                      {due > 0 && (
                        <span className="flex items-center gap-0.5 text-rose-600 font-semibold">
                          <XCircle size={10} /> {due}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-zinc-400 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded: Individual payment records */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 p-2">
                    {row.payments.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-500">
                        No payments recorded for this class in {MONTHS[selectedIdx].label}
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-100 bg-white rounded-xl border border-zinc-200">
                        {row.payments.map(p => (
                          <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors group">
                            <Receipt size={14} className="text-zinc-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">{p.student_name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">{p.invoice_number}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-emerald-700 font-mono">
                                {formatCurrency(p.total_amount)}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {new Date(p.paid_at).toLocaleDateString('en-BD', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              disabled={deletePayment.isPending}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                              title="Delete Payment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}
