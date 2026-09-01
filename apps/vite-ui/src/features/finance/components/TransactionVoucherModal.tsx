import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, ArrowDownRight, ArrowUpRight, School } from 'lucide-react'
import type { FinanceTransaction } from '../types'
import { formatCurrency, MONTH_NAMES } from '@/features/payments/types'

interface TransactionVoucherModalProps {
  transaction: FinanceTransaction | null
  onClose: () => void
}

export function TransactionVoucherModal({
  transaction: tx,
  onClose,
}: TransactionVoucherModalProps) {
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
          <h1>Estudy International Model Academy</h1>
          <p>Uttara Model Town, Sector 4, Dhaka-1230 • Contact: +880 1700-000000</p>
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
              <th style="text-align: right;">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${tx.title}</strong>
                <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
                  Accounting Period: ${MONTH_NAMES[tx.month - 1]} ${tx.year}
                  ${tx.notes ? ` • Note: ${tx.notes}` : ''}
                </div>
              </td>
              <td style="text-align: right; font-weight: 700; font-family: monospace; font-size: 13px;">
                ${formatCurrency(tx.amount)}
              </td>
            </tr>
            <tr class="total-row">
              <td style="text-align: right; font-weight: 700;">Total Amount:</td>
              <td style="text-align: right; font-weight: 800; font-family: monospace; font-size: 14px; color: ${isIncome ? '#047857' : '#0f172a'};">
                ${formatCurrency(tx.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div>
            <div class="sig-line"></div>
            <p>Received / Prepared By</p>
          </div>
          <div>
            <div class="sig-line"></div>
            <p>Accounts Officer / Principal</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150"
      >
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isIncome
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {isIncome ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
              {isIncome ? 'Money Receipt (Credit)' : 'Payment Voucher (Debit)'}
            </span>
            <span className="text-xs font-mono font-semibold text-zinc-500 hidden sm:inline">
              {tx.invoice_no ?? tx.id.slice(0, 10)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              <Printer size={13} /> Print Memo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Official Voucher Document Content (Scrollable) ── */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-xs text-zinc-800">
          {/* Institution Header */}
          <div className="text-center pb-4 border-b-2 border-zinc-800">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-600 text-white mb-1.5 shadow-md">
              <School size={20} />
            </div>
            <h1 className="text-lg font-black text-zinc-900 tracking-tight uppercase">
              Estudy International Model Academy
            </h1>
            <p className="text-[11px] text-zinc-500">
              Uttara Model Town, Sector 4, Dhaka-1230 • Contact: +880 1700-000000
            </p>
            <div className="inline-block mt-2 px-3.5 py-0.5 rounded-full border border-zinc-300 bg-zinc-50 text-[10px] font-extrabold uppercase tracking-widest text-zinc-800">
              {isIncome ? 'Official Money Receipt' : 'Official Debit Voucher'}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3.5 bg-zinc-50/80 p-3.5 rounded-2xl border border-zinc-100 text-xs">
            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-semibold">Voucher / Invoice No</p>
              <p className="font-mono font-bold text-zinc-900 text-xs mt-0.5">
                {tx.invoice_no ?? `VCH-${tx.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-[10px] uppercase font-semibold">Transaction Date</p>
              <p className="font-bold text-zinc-900 text-xs mt-0.5">{tx.date}</p>
            </div>

            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-semibold">{isIncome ? 'Received From' : 'Paid To'}</p>
              <p className="font-bold text-zinc-900 text-xs mt-0.5">{tx.party_name}</p>
              {tx.party_role && <p className="text-[10px] text-zinc-500">{tx.party_role}</p>}
            </div>

            <div className="text-right">
              <p className="text-zinc-400 text-[10px] uppercase font-semibold">Payment Mode</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-800 font-semibold font-mono text-[11px]">
                {tx.payment_method}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="text-left px-4 py-2.5">Description / Purpose</th>
                  <th className="text-right px-4 py-2.5">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-bold text-zinc-900">{tx.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Accounting Period: {MONTH_NAMES[tx.month - 1]} {tx.year}
                      {tx.notes ? ` • Note: ${tx.notes}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-xs text-zinc-900">
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-zinc-50/90 border-t-2 border-zinc-200 font-bold">
                <tr>
                  <td className="px-4 py-2.5 text-right text-zinc-600">Total Net Amount:</td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono font-extrabold text-sm ${
                      isIncome ? 'text-emerald-700' : 'text-zinc-900'
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures Area */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs text-zinc-500">
            <div>
              <div className="border-t border-dashed border-zinc-300 pt-1.5 w-32 mx-auto" />
              <p className="font-semibold text-[10px]">Received / Prepared By</p>
            </div>
            <div>
              <div className="border-t border-dashed border-zinc-300 pt-1.5 w-32 mx-auto" />
              <p className="font-semibold text-[10px]">Accounts Officer / Principal</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
