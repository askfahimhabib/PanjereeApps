import { useState } from 'react'
import { Wallet, Receipt, CreditCard, Printer, Plus, AlertTriangle, Trash2 } from 'lucide-react'
import type { Student } from '../../types'
import { useStudentPayments, useStudentManualDues, useDeletePayment, paymentKeys } from '@/features/payments/hooks/usePayments'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS, PAYMENT_STATUS_CONFIG, MONTH_NAMES, formatCurrency } from '@/features/payments/types'
import { InvoicePrintModal } from '@/features/payments/components/InvoicePrintModal'
import { CollectFeeModal } from '@/features/payments/components/CollectFeeModal'
import type { PaymentRecord } from '@/features/payments/types'
import { useQueryClient } from '@tanstack/react-query'

export function FeesTab({ student }: { student: Student }) {
  const { data: payments = [], isLoading: paymentsLoading } = useStudentPayments(student.id)
  const { data: manualDues = [] } = useStudentManualDues(student.id)

  const [viewRecord, setViewRecord] = useState<PaymentRecord | null>(null)
  const [collectOpen, setCollectOpen] = useState(false)

  const qc = useQueryClient()
  const deletePayment = useDeletePayment()

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

      {/* Financial Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">Total Billed</span>
          <span className="text-xl font-bold text-slate-200">{formatCurrency(totalBilled)}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs text-emerald-500/70 font-medium">Total Paid</span>
          <span className="text-xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</span>
        </div>
        <div className={`p-4 rounded-xl flex flex-col gap-1 ${
          totalDue > 0
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-slate-900/50 border border-slate-700/50'
        }`}>
          <span className={`text-xs font-medium ${totalDue > 0 ? 'text-red-500/70' : 'text-slate-400'}`}>Total Due</span>
          <span className={`text-xl font-bold ${totalDue > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {formatCurrency(totalDue)}
          </span>
        </div>
      </div>

      {/* Manual Dues Alert */}
      {unpaidDues.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-300">Outstanding Dues</p>
            {unpaidDues.map(due => {
              const period = due.month ? `${MONTH_NAMES[due.month - 1]}${due.year ? ` ${due.year}` : ''}` : ''
              return (
                <p key={due.id} className="text-xs text-amber-400/70 mt-0.5">
                  • {due.label}{period ? ` (${period})` : ''} — {formatCurrency(due.amount)}
                </p>
              )
            })}
          </div>
          <button
            onClick={() => setCollectOpen(true)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-colors"
          >
            Collect Now
          </button>
        </div>
      )}

      {/* Payment History */}
      <div className="border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-slate-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Payment History</h4>
          </div>
          <button
            onClick={() => setCollectOpen(true)}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <Plus size={12} /> Collect Fee
          </button>
        </div>

        {paymentsLoading ? (
          <div className="divide-y divide-slate-700/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-32" />
                  <div className="h-2.5 bg-slate-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600">
            <Wallet size={28} className="mb-2 opacity-30" />
            <p className="text-xs">No payment records yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {payments.map(payment => {
              const statusCfg = PAYMENT_STATUS_CONFIG[payment.status]
              const paidDate = new Date(payment.paid_at).toLocaleDateString('en-BD', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
              const itemSummary = payment.items.map(it => {
                const period = it.month ? ` (${MONTH_NAMES[it.month - 1]})` : ''
                return it.label + period
              }).join(', ')

              return (
                <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{PAYMENT_METHOD_ICONS[payment.payment_method]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 truncate max-w-[160px]" title={itemSummary}>
                        {itemSummary}
                      </p>
                      <p className="text-xs text-slate-500">
                        {paidDate} · {PAYMENT_METHOD_LABELS[payment.payment_method]}
                        {payment.transaction_id && ` · ${payment.transaction_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${statusCfg.color}`}>
                        {payment.status === 'REFUNDED' ? '- ' : '+ '}{formatCurrency(payment.total_amount)}
                      </p>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{payment.invoice_number}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewRecord(payment)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700 transition-all"
                      title="View/Print Invoice"
                    >
                      <Printer size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(payment)}
                      disabled={deletePayment.isPending}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      title="Delete Payment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <InvoicePrintModal
        open={!!viewRecord}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
      <CollectFeeModal
        open={collectOpen}
        preselectedStudent={student}
        onClose={() => setCollectOpen(false)}
      />
    </div>
  )
}
