import { useState } from 'react'
import { Wallet, Receipt, Printer, Trash2, Zap } from 'lucide-react'
import type { Student } from '../../types'
import {
  useStudentPayments,
  useStudentManualDues,
  useDeletePayment,
  paymentKeys,
} from '@/features/payments/hooks/usePayments'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CONFIG,
  MONTH_NAMES_SHORT,
  formatCurrency,
} from '@/features/payments/types'
import { InvoicePrintModal } from '@/features/payments/components/InvoicePrintModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import type { PaymentRecord } from '@/features/payments/types'
import { useQueryClient } from '@tanstack/react-query'
import { calculateStudentFeeLedger } from '@/features/payments/hooks/useBillingAndWaivers'
import { printInvoice } from '@/features/payments/utils/printInvoice'

export function FeesTab({ student }: { student: Student }) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const { data: payments = [] } = useStudentPayments(student.id)
  const { data: manualDues = [] } = useStudentManualDues(student.id)

  const [viewRecord, setViewRecord] = useState<PaymentRecord | null>(null)
  const [quickCollectOpen, setQuickCollectOpen] = useState(false)

  const qc = useQueryClient()
  const deletePayment = useDeletePayment()

  const studentLedger = calculateStudentFeeLedger(student.id, currentYear)

  const handleDelete = (payment: PaymentRecord) => {
    if (window.confirm(`Delete payment ${payment.invoice_number}? This cannot be undone.`)) {
      deletePayment.mutate(payment.id, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: paymentKeys.student(student.id) })
        },
      })
    }
  }

  const totalPaid = payments
    .filter(p => p.status !== 'REFUNDED')
    .reduce((sum, p) => sum + p.total_amount, 0)

  const unpaidDues = manualDues.filter(d => !d.is_paid)
  const totalDue = unpaidDues.reduce((sum, d) => sum + d.amount, 0)
  const totalBilled = totalPaid + totalDue

  return (
    <div className="space-y-5">
      {/* ── Financial KPI Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-zinc-200/80 p-3.5 rounded-2xl flex flex-col gap-1 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-medium">Total Billed</span>
          <span className="text-base font-extrabold text-zinc-900 font-mono">{formatCurrency(totalBilled)}</span>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-2xl flex flex-col gap-1 shadow-xs">
          <span className="text-[11px] text-emerald-700 font-bold">Total Paid</span>
          <span className="text-base font-extrabold text-emerald-800 font-mono">{formatCurrency(totalPaid)}</span>
        </div>
        <div
          className={`p-3.5 rounded-2xl flex flex-col gap-1 shadow-xs border ${
            totalDue > 0
              ? 'bg-rose-50/80 border-rose-200 text-rose-800'
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-700'
          }`}
        >
          <span className={`text-[11px] font-bold ${totalDue > 0 ? 'text-rose-700' : 'text-zinc-500'}`}>
            Total Due
          </span>
          <span className="text-base font-extrabold font-mono">
            {formatCurrency(totalDue)}
          </span>
        </div>
      </div>

      {/* ── Quick Action Trigger ──────────────────────────────── */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white flex items-center justify-between shadow-md shadow-emerald-600/20">
        <div>
          <h4 className="font-bold text-sm">Instant Fee Collection Desk</h4>
          <p className="text-[11px] text-emerald-100 mt-0.5">
            {totalDue > 0
              ? `Outstanding due of ${formatCurrency(totalDue)} pending`
              : 'All dues cleared for current billing cycle'}
          </p>
        </div>
        <button
          onClick={() => setQuickCollectOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all shadow-sm cursor-pointer"
        >
          <Zap size={14} /> Quick Collect
        </button>
      </div>

      {/* ── 12-Month Annual Payment Matrix ─────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Wallet size={14} className="text-emerald-600" />
            {currentYear} Monthly Payment Ledger
          </h4>
          <span className="text-[10px] text-zinc-400 font-medium">12-Month Matrix</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {studentLedger?.months.map((m) => {
            const isCurrent = m.month === currentMonth
            const monthName = MONTH_NAMES_SHORT[m.month - 1]
            let badgeBg = 'bg-zinc-100 text-zinc-500 border-zinc-200'
            if (m.status === 'PAID') badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
            else if (m.status === 'DUE') badgeBg = 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
            else if (m.status === 'PARTIAL') badgeBg = 'bg-amber-50 text-amber-700 border-amber-200 font-bold'

            return (
              <div
                key={m.month}
                className={`p-2 rounded-xl border text-center relative transition-all ${
                  isCurrent ? 'ring-2 ring-emerald-500/40 bg-emerald-50/20' : 'bg-white border-zinc-100'
                }`}
              >
                <p className="text-[10px] font-bold text-zinc-600">{monthName}</p>
                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] border ${badgeBg}`}>
                  {m.status}
                </span>
                {m.paid_amount > 0 && (
                  <p className="text-[9px] font-mono text-zinc-700 mt-1 font-bold">
                    ৳{m.paid_amount}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Payment Invoices List ──────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/80 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-zinc-500" />
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Payment Records ({payments.length})
            </h4>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            <Receipt size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
            <p className="text-xs font-semibold text-zinc-600">No payment receipts found</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Collect fee to generate first receipt</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {payments.map((p) => {
              const statusCfg = PAYMENT_STATUS_CONFIG[p.status]
              const dateStr = new Date(p.paid_at).toLocaleDateString('en-BD', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div key={p.id} className="p-3.5 hover:bg-zinc-50/70 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                        {p.invoice_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[11px] text-zinc-400">{dateStr}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1 truncate">
                      {p.items.map((it) => it.label).join(', ')} • Mode: {PAYMENT_METHOD_LABELS[p.payment_method]}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono">
                      <p className="font-extrabold text-xs text-emerald-700">{formatCurrency(p.total_amount)}</p>
                      {p.discount_amount > 0 && (
                        <p className="text-[9px] text-rose-500">- {formatCurrency(p.discount_amount)}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => printInvoice(p, 'DUAL_A4')}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Print Receipt"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Receipt"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick POS Modal */}
      <QuickCollectModal
        open={quickCollectOpen}
        preselectedStudent={student}
        onClose={() => setQuickCollectOpen(false)}
      />

      <InvoicePrintModal
        open={!!viewRecord}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
    </div>
  )
}
