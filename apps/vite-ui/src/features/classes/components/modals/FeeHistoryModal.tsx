import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  MinusCircle,
  Receipt,
  Trash2,
} from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { PaymentRecord } from '@/features/payments/types'
import { formatCurrency, MONTH_NAMES } from '@/features/payments/types'
import type { ClassItem } from '../../types'
import { useDeletePayment } from '@/features/payments/hooks/usePayments'
import { useQueryClient } from '@tanstack/react-query'

const paymentStore = createStore<PaymentRecord>('payments')

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-100 bg-white shadow-2xl shadow-black/60">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <DollarSign size={18} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Fee Collection History</h2>
            <p className="text-xs text-zinc-600">Class-wise breakdown by month</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Month Selector ──────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-zinc-100 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-zinc-600 shrink-0">Month:</span>
          <div className="flex gap-1.5 flex-wrap">
            {MONTHS.map((m, i) => (
              <button
                key={i}
                onClick={() => { setSelectedIdx(i); setExpandedClass(null) }}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  i === selectedIdx
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-100 hover:text-zinc-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Summary Strip ───────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-zinc-100 grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-0.5 rounded-xl bg-amber-500/8 border border-amber-500/15 px-4 py-2.5">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Total Collected</span>
            <span className="text-lg font-bold text-amber-300">{formatCurrency(totalCollected)}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-4 py-2.5">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Students Paid</span>
            <span className="text-lg font-bold text-emerald-300">
              {totalPaid}
              <span className="text-xs text-zinc-600 font-normal"> / {totalStudents}</span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl bg-blue-500/8 border border-blue-500/15 px-4 py-2.5">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Collection Rate</span>
            <span className="text-lg font-bold text-blue-300">
              {totalStudents > 0 ? Math.round((totalPaid / totalStudents) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* ── Class Rows ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {rows.map(row => {
            const rate = row.totalStudents > 0 ? Math.round((row.paidCount / row.totalStudents) * 100) : 0
            const due = row.totalStudents - row.paidCount
            const isExpanded = expandedClass === row.classId

            return (
              <div
                key={row.classId}
                className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden"
              >
                {/* Row Header — clickable to expand */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
                  onClick={() => setExpandedClass(isExpanded ? null : row.classId)}
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-zinc-800">
                      {row.className.replace(/[^0-9]/g, '').slice(0, 3) || row.className.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-800">{row.className}</span>
                      <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                        <Users size={9} /> {row.totalStudents}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-600 shrink-0">{rate}%</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-amber-300">{formatCurrency(row.collectedAmount)}</p>
                    <div className="flex items-center gap-2 justify-end mt-0.5 text-[10px]">
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <CheckCircle size={9} /> {row.paidCount}
                      </span>
                      {due > 0 && (
                        <span className="flex items-center gap-0.5 text-red-400">
                          <XCircle size={9} /> {due}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-zinc-800 shrink-0">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>

                {/* Expanded: individual payment records */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-white">
                    {row.payments.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-6 text-zinc-800">
                        <MinusCircle size={20} />
                        <p className="text-xs">No payments recorded for this class</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800">
                        {row.payments.map(p => (
                          <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50 transition-colors group">
                            <Receipt size={13} className="text-zinc-800 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-zinc-800 truncate">{p.student_name}</p>
                              <p className="text-[10px] text-zinc-800">{p.invoice_number}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-semibold text-emerald-400">
                                {formatCurrency(p.total_amount)}
                              </p>
                              <p className="text-[10px] text-zinc-800">
                                {new Date(p.paid_at).toLocaleDateString('en-BD', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(p)}
                              disabled={deletePayment.isPending}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-800 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40 shrink-0"
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

          {rows.length > 0 && rows.every(r => r.payments.length === 0) && (
            <div className="flex flex-col items-center gap-3 py-12 text-zinc-800">
              <DollarSign size={32} className="opacity-30" />
              <p className="text-sm">No fee collections recorded for {MONTHS[selectedIdx].label}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  , document.body
  )
}
