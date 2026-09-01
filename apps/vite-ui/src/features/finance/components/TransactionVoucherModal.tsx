import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, ArrowDownRight, ArrowUpRight, School } from 'lucide-react'
import type { FinanceTransaction } from '../types'
import { formatCurrency } from '@/features/payments/types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface TransactionVoucherModalProps {
  transaction: FinanceTransaction | null
  onClose: () => void
}

export function TransactionVoucherModal({
  transaction: tx,
  onClose,
}: TransactionVoucherModalProps) {
  const inst = getInstitutionInfo()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (tx) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tx, onClose])

  if (!tx) return null

  const isIncome = tx.type === 'INCOME'

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=750')
    if (!printWindow) {
      window.print()
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher - ${tx.invoice_no ?? tx.id}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A5 landscape; margin: 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { padding: 15px; color: #1e293b; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { font-size: 11px; color: #64748b; margin-top: 3px; }
          .badge { display: inline-block; margin-top: 8px; padding: 3px 12px; border-radius: 9999px; border: 1px solid #cbd5e1; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
          .grid-item p.label { color: #64748b; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .grid-item p.val { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .total-row { background: #f8fafc; font-weight: 800; border-top: 2px solid #cbd5e1; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; text-align: center; font-size: 11px; color: #475569; }
          .sig-line { border-top: 1px dashed #94a3b8; width: 160px; margin: 0 auto 6px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${inst.name}</h1>
          ${inst.nameBn ? `<p style="font-weight:600; color:#475569; font-size:11px;">${inst.nameBn}</p>` : ''}
          <p>${inst.address} • Contact: ${inst.phone} • EIIN: ${inst.eiin}</p>
          <div class="badge">${isIncome ? 'Official Money Receipt' : 'Official Debit Voucher'}</div>
        </div>

        <div class="grid">
          <div class="grid-item">
            <p class="label">Voucher / Invoice No</p>
            <p class="val">${tx.invoice_no ?? `VCH-${tx.id.slice(0, 8).toUpperCase()}`}</p>
          </div>
          <div class="grid-item" style="text-align: right;">
            <p class="label">Transaction Date</p>
            <p class="val">${tx.date}</p>
          </div>
          <div class="grid-item">
            <p class="label">${isIncome ? 'Received From' : 'Paid To'}</p>
            <p class="val">${tx.party_name}</p>
            ${tx.party_role ? `<p style="font-size: 10px; color: #64748b;">${tx.party_role}</p>` : ''}
          </div>
          <div class="grid-item" style="text-align: right;">
            <p class="label">Payment Mode</p>
            <p class="val">${tx.payment_method}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Particulars & Purpose</th>
              <th style="text-align: right;">Amount (${inst.currencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${tx.title}</strong>
                <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
                  Category: ${tx.category.toUpperCase()} • Session: ${inst.session}
                </div>
                ${tx.notes ? `<div style="font-size: 11px; color: #475569; margin-top: 4px;">${tx.notes}</div>` : ''}
              </td>
              <td style="text-align: right; font-weight: 700; font-family: monospace; font-size: 13px;">
                ${inst.currencySymbol} ${tx.amount.toLocaleString()}
              </td>
            </tr>
            <tr class="total-row">
              <td>Total Amount ${isIncome ? 'Received' : 'Disbursed'}</td>
              <td style="text-align: right; color: ${isIncome ? '#059669' : '#dc2626'}; font-family: monospace; font-size: 14px;">
                ${inst.currencySymbol} ${tx.amount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div>
            <div class="sig-line"></div>
            <p>Prepared By / Cashier</p>
          </div>
          <div>
            <div class="sig-line"></div>
            <p>${inst.principalDesignation}</p>
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                isIncome ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
              }`}
            >
              {isIncome ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                {isIncome ? 'Official Money Receipt' : 'Official Debit Voucher'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {tx.invoice_no ?? `VCH-${tx.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
            >
              <Printer size={13} /> Print Voucher
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Voucher Preview Content */}
        <div className="p-6 space-y-6">
          {/* Institutional Header Box */}
          <div className="text-center pb-4 border-b border-dashed border-zinc-200">
            <div className="flex items-center justify-center gap-1.5 text-zinc-800 mb-0.5">
              <School size={16} className="text-indigo-600" />
              <h4 className="font-extrabold text-sm uppercase tracking-wide">{inst.name}</h4>
            </div>
            <p className="text-[11px] text-zinc-500">{inst.address} • Phone: {inst.phone}</p>
          </div>

          {/* Key-Value Matrix */}
          <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                {isIncome ? 'Received From' : 'Paid To'}
              </span>
              <span className="font-bold text-zinc-900 text-sm mt-0.5 block">{tx.party_name}</span>
              {tx.party_role && <span className="text-[11px] text-zinc-500">{tx.party_role}</span>}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Transaction Date
              </span>
              <span className="font-semibold text-zinc-800 text-xs mt-0.5 block">{tx.date}</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-200/80 text-zinc-700">
                {tx.payment_method}
              </span>
            </div>
          </div>

          {/* Itemized Detail */}
          <div className="border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="bg-zinc-50/80 px-4 py-2.5 border-b border-zinc-200 flex justify-between text-[11px] font-bold text-zinc-600 uppercase">
              <span>Purpose & Particulars</span>
              <span>Amount</span>
            </div>
            <div className="p-4 flex justify-between items-start">
              <div>
                <p className="font-bold text-zinc-900 text-xs">{tx.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Category: <span className="font-medium text-zinc-700 capitalize">{tx.category}</span>
                </p>
                {tx.notes && (
                  <p className="text-[11px] text-zinc-600 mt-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    {tx.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-zinc-900">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            </div>

            <div className="bg-zinc-50/50 px-4 py-3 border-t border-zinc-200 flex justify-between items-center">
              <span className="text-xs font-extrabold text-zinc-900">Total Net Amount</span>
              <span
                className={`text-base font-black font-mono ${
                  isIncome ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatCurrency(tx.amount)}
              </span>
            </div>
          </div>

          {/* Voucher Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs text-zinc-500">
            <div>
              <div className="w-32 border-t border-zinc-300 mx-auto mb-1" />
              <span>Cashier / Accounts Officer</span>
            </div>
            <div>
              <div className="w-32 border-t border-zinc-300 mx-auto mb-1" />
              <span>{inst.principalDesignation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
