import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  CircleDashed,
} from 'lucide-react'
import { useStudentFeeLedger } from '../hooks/useBillingAndWaivers'
import { MONTH_NAMES, formatCurrency, type MonthPaymentStatus } from '../types'
import type { Student } from '@/features/students/types'

interface StudentFeeStatementModalProps {
  student: Student | null
  open: boolean
  onClose: () => void
  onCollectDue?: (student: Student) => void
}

const STATUS_BADGE: Record<MonthPaymentStatus, { label: string; bg: string; icon: typeof CheckCircle2 }> = {
  PAID:     { label: 'Paid',     bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  DUE:      { label: 'Due',      bg: 'bg-rose-50 text-rose-700 border-rose-200',         icon: AlertCircle  },
  PARTIAL:  { label: 'Partial',  bg: 'bg-amber-50 text-amber-700 border-amber-200',       icon: Clock        },
  UNBILLED: { label: 'Unbilled', bg: 'bg-zinc-50 text-zinc-400 border-zinc-200',         icon: CircleDashed },
}

export function StudentFeeStatementModal({
  student,
  open,
  onClose,
  onCollectDue,
}: StudentFeeStatementModalProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear())

  const { data: ledger, isLoading } = useStudentFeeLedger(student?.id ?? null, year)

  if (!open || !student) return null

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-zinc-200 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100 bg-zinc-50/70 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center print:hidden">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-base">Student Financial Ledger & Statement</h2>
              <p className="text-xs text-zinc-500">
                {student.fullNameEn} • Roll: <span className="font-mono font-bold text-zinc-700">{student.rollNumber}</span> • {student.className}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
            >
              <Printer size={13} /> Print Statement
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Year Navigator */}
          <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYear(y => y - 1)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-extrabold text-zinc-900 text-sm font-mono">{year} Academic Cycle</span>
              <button
                onClick={() => setYear(y => y + 1)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {ledger && ledger.total_due > 0 && (
              <button
                onClick={() => {
                  onClose()
                  onCollectDue?.(student)
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                ⚡ Collect Due {formatCurrency(ledger.total_due)}
              </button>
            )}
          </div>

          {/* KPI Summary Cards */}
          {ledger && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Billed</span>
                <p className="text-base font-extrabold text-zinc-900 font-mono mt-0.5">
                  {formatCurrency(ledger.total_billed)}
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Paid</span>
                <p className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
                  {formatCurrency(ledger.total_paid)}
                </p>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Total Waivers</span>
                <p className="text-base font-extrabold text-purple-700 font-mono mt-0.5">
                  {formatCurrency(ledger.total_discount)}
                </p>
              </div>

              <div className={`rounded-2xl p-3.5 border ${ledger.total_due > 0 ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-100'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${ledger.total_due > 0 ? 'text-rose-700' : 'text-zinc-500'}`}>
                  Current Due Balance
                </span>
                <p className={`text-base font-extrabold font-mono mt-0.5 ${ledger.total_due > 0 ? 'text-rose-700' : 'text-zinc-700'}`}>
                  {formatCurrency(ledger.total_due)}
                </p>
              </div>
            </div>
          )}

          {/* 12-Month Grid Table */}
          <div className="border border-zinc-200 rounded-2xl overflow-x-auto shadow-xs bg-white">
            <table className="w-full min-w-[580px] sm:min-w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Month</th>
                  <th className="px-4 py-2.5 text-right">Billed</th>
                  <th className="px-4 py-2.5 text-right">Paid</th>
                  <th className="px-4 py-2.5 text-right">Waiver</th>
                  <th className="px-4 py-2.5 text-right">Due Balance</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Invoice / Trx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-400">Loading ledger data...</td>
                  </tr>
                ) : !ledger || ledger.months.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-400">No records found for {year}</td>
                  </tr>
                ) : (
                  ledger.months.map((m) => {
                    const cfg = STATUS_BADGE[m.status]
                    const Icon = cfg.icon

                    return (
                      <tr key={m.month} className="hover:bg-zinc-50/70">
                        <td className="px-4 py-2.5 font-bold text-zinc-900">
                          {MONTH_NAMES[m.month - 1]}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-700">
                          {m.billed_amount > 0 ? formatCurrency(m.billed_amount) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">
                          {m.paid_amount > 0 ? formatCurrency(m.paid_amount) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-purple-700">
                          {m.discount_amount > 0 ? `-${formatCurrency(m.discount_amount)}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-600">
                          {m.due_amount > 0 ? formatCurrency(m.due_amount) : '৳ 0'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg}`}>
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[11px] text-zinc-500">
                          {m.invoice_numbers.length > 0 ? m.invoice_numbers.join(', ') : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
