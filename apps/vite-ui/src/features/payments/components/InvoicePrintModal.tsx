import { X, Printer } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { PaymentRecord } from '../types'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_STATUS_CONFIG,
  MONTH_NAMES,
  formatCurrency,
} from '../types'
import { printInvoice } from '../utils/printInvoice'

interface Props {
  open: boolean
  record: PaymentRecord | null
  onClose: () => void
}

export function InvoicePrintModal({ open, record, onClose }: Props) {
  if (!open || !record) return null

  const paidDate = new Date(record.paid_at).toLocaleDateString('en-BD', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const statusCfg = PAYMENT_STATUS_CONFIG[record.status]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-100 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Invoice Preview</h3>
            <p className="text-xs text-zinc-600 mt-0.5">{record.invoice_number}</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-lg text-sm">

            {/* Header */}
            <div className="bg-white text-white px-6 py-5 text-center">
              <h4 className="text-lg font-black tracking-wider">PANJEREE COACHING CENTER</h4>
              <p className="text-[10px] text-zinc-600 mt-1">Official Fee Receipt</p>
            </div>

            <div className="bg-zinc-50 text-center py-2">
              <span className="text-xs font-bold text-blue-400 tracking-widest">{record.invoice_number}</span>
            </div>

            {/* Student Info */}
            <div className="px-5 py-4 border-b border-dashed border-zinc-100">
              <p className="text-base font-bold text-zinc-900">{record.student_name}</p>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-zinc-600">
                <span>Roll: <strong className="text-zinc-800">{record.roll_number}</strong></span>
                <span>Class: <strong className="text-zinc-800">{record.class_name ?? '—'}</strong></span>
                <span>Date: <strong className="text-zinc-800">{paidDate}</strong></span>
                <span>
                  Status:{' '}
                  <span className={`font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
                </span>
              </div>
            </div>

            {/* Fee Items */}
            <div className="px-5 py-4 border-b border-dashed border-zinc-100">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-3 font-semibold">Fee Details</p>
              <div className="space-y-2">
                {record.items.map((item, i) => {
                  const monthLabel = item.month ? MONTH_NAMES[item.month - 1] : ''
                  const period = monthLabel && item.year ? `${monthLabel} ${item.year}` : ''
                  return (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-zinc-800">{item.label}</p>
                        {period && <p className="text-[10px] text-zinc-600">{period}</p>}
                      </div>
                      <p className="text-xs font-bold text-zinc-900 whitespace-nowrap">{formatCurrency(item.amount)}</p>
                    </div>
                  )
                })}

                {record.discount_amount > 0 && (
                  <div className="flex justify-between items-start pt-2 border-t border-dashed border-zinc-100">
                    <div>
                      <p className="text-xs font-medium text-red-600">Discount / Waiver</p>
                      {record.waiver_reason && <p className="text-[10px] text-zinc-600">{record.waiver_reason}</p>}
                    </div>
                    <p className="text-xs font-bold text-red-600">- {formatCurrency(record.discount_amount)}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t-2 border-zinc-100">
                  <p className="text-sm font-black text-slate-900">Total Paid</p>
                  <p className="text-base font-black text-emerald-600">{formatCurrency(record.total_amount)}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="px-5 py-3 flex items-center justify-between bg-zinc-50">
              <span className="text-xs text-zinc-600">Payment via</span>
              <span className="text-xs font-bold text-zinc-800">
                {PAYMENT_METHOD_ICONS[record.payment_method]} {PAYMENT_METHOD_LABELS[record.payment_method]}
                {record.transaction_id && ` · ${record.transaction_id}`}
              </span>
            </div>

            {record.note && (
              <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                <p className="text-[10px] text-amber-700"><strong>Note:</strong> {record.note}</p>
              </div>
            )}

            {/* Signature */}
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div className="text-center pt-6 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-600">Student / Guardian</p>
              </div>
              <div className="text-center pt-6 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-600">Collector: {record.collected_by}</p>
              </div>
            </div>

            <div className="text-center pb-3">
              <p className="text-[9px] text-zinc-800 tracking-widest">PANJEREE COACHING CENTER · OFFICIAL RECEIPT</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-100 text-zinc-600 hover:text-white hover:border-zinc-100 text-sm transition-all"
          >
            Close
          </button>
          <button
            onClick={() => printInvoice(record)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
          >
            <Printer size={15} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  , document.body
  )
}
