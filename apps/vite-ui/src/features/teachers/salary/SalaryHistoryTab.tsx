import { useState } from 'react'
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
} from 'lucide-react'
import type { TeacherSalaryRecord, SalaryStatus } from './useTeacherSalary'
import { formatCurrency, MONTH_NAMES } from '@/features/payments/types'
import { TransactionVoucherModal } from '@/features/finance/components/TransactionVoucherModal'
import type { FinanceTransaction } from '@/features/finance/types'

interface SalaryHistoryTabProps {
  history: TeacherSalaryRecord[]
}

const STATUS_CFG: Record<SalaryStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  PAID:    { label: 'Paid',    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
  UNPAID:  { label: 'Unpaid',  bg: 'bg-rose-50 text-rose-700 border-rose-200',   text: 'text-rose-700',   icon: XCircle },
  PARTIAL: { label: 'Partial', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', icon: Clock },
}

export function SalaryHistoryTab({ history }: SalaryHistoryTabProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | 'ALL'>('ALL')
  const [selectedVoucher, setSelectedVoucher] = useState<FinanceTransaction | null>(null)

  const filtered = history.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.teacherName.toLowerCase().includes(q) ||
      r.designation.toLowerCase().includes(q) ||
      (r.department && r.department.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teacher, designation, memo notes..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'PAID' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-600'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('PARTIAL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'PARTIAL' ? 'bg-white text-amber-700 shadow-xs' : 'text-zinc-600'
              }`}
            >
              Partial
            </button>
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Total <span className="font-bold text-zinc-800">{filtered.length}</span> Records in Ledger
        </span>
      </div>

      {/* History Table & Mobile Cards */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-zinc-400">
            <Receipt size={36} className="mx-auto mb-2 opacity-30 text-zinc-400" />
            <p className="text-sm font-semibold text-zinc-700">No Salary Records Found</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block sm:hidden divide-y divide-zinc-100">
              {filtered.map((r) => {
                const net = r.baseSalary + r.bonus - r.deduction
                const cfg = STATUS_CFG[r.status]
                const StatusIcon = cfg.icon

                return (
                  <div key={r.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          {MONTH_NAMES[r.month - 1]} {r.year}
                        </span>
                        <p className="font-bold text-zinc-900 text-sm mt-0.5">{r.teacherName}</p>
                        <p className="text-[11px] text-zinc-500">{r.designation}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${cfg.bg}`}>
                        <StatusIcon size={11} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-50/80 p-2.5 rounded-xl text-xs border border-zinc-100">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-medium">Net Payable</span>
                        <p className="font-mono font-semibold text-zinc-700">{formatCurrency(net)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-medium">Paid Amount</span>
                        <p className="font-mono font-bold text-emerald-600 text-sm">{formatCurrency(r.paidAmount)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-50 text-[11px]">
                      <span className="text-zinc-400">Date: {r.paidDate ?? '—'}</span>
                      {r.paidAmount > 0 && (
                        <button
                          onClick={() =>
                            setSelectedVoucher({
                              id: `vch-${r.id}`,
                              type: 'EXPENSE',
                              category: 'TEACHER_SALARY',
                              title: `Salary Disbursal - ${r.teacherName}`,
                              amount: r.paidAmount,
                              date: r.paidDate ?? `${r.year}-${String(r.month).padStart(2, '0')}-05`,
                              month: r.month,
                              year: r.year,
                              payment_method: r.paymentMethod ?? 'BANK',
                              invoice_no: `SAL-${r.year}-${String(r.month).padStart(2, '0')}-${r.teacherId}`,
                              party_name: r.teacherName,
                              party_role: `Teacher (${r.designation})`,
                              notes: r.notes,
                              created_at: new Date().toISOString(),
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <Receipt size={13} />
                          Voucher Memo
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Month / Year</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3 text-right">Net Payable</th>
                    <th className="px-4 py-3 text-right">Paid Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Disbursal Date</th>
                    <th className="px-4 py-3 text-center">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map((r) => {
                    const net = r.baseSalary + r.bonus - r.deduction
                    const cfg = STATUS_CFG[r.status]
                    const StatusIcon = cfg.icon

                    return (
                      <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                        {/* Month & Year */}
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-zinc-900 block">
                            {MONTH_NAMES[r.month - 1]} {r.year}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            ID: {r.id}
                          </span>
                        </td>

                        {/* Teacher */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-zinc-800">{r.teacherName}</p>
                          <p className="text-[11px] text-zinc-500">{r.designation}</p>
                        </td>

                        {/* Net Payable */}
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-zinc-700">
                          {formatCurrency(net)}
                        </td>

                        {/* Paid Amount */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-emerald-600">
                          {formatCurrency(r.paidAmount)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-right text-zinc-600 font-medium">
                          {r.paidDate ?? '—'}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-center">
                          {r.paidAmount > 0 ? (
                            <button
                              onClick={() =>
                                setSelectedVoucher({
                                  id: `vch-${r.id}`,
                                  type: 'EXPENSE',
                                  category: 'TEACHER_SALARY',
                                  title: `Salary Disbursal - ${r.teacherName}`,
                                  amount: r.paidAmount,
                                  date: r.paidDate ?? `${r.year}-${String(r.month).padStart(2, '0')}-05`,
                                  month: r.month,
                                  year: r.year,
                                  payment_method: r.paymentMethod ?? 'BANK',
                                  invoice_no: `SAL-${r.year}-${String(r.month).padStart(2, '0')}-${r.teacherId}`,
                                  party_name: r.teacherName,
                                  party_role: `Teacher (${r.designation})`,
                                  notes: r.notes,
                                  created_at: new Date().toISOString(),
                                })
                              }
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="View / Print Salary Voucher"
                            >
                              <Receipt size={15} />
                            </button>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Voucher Modal */}
      {selectedVoucher && (
        <TransactionVoucherModal
          transaction={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  )
}
