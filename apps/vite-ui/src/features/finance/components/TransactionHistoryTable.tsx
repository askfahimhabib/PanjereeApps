import { useState } from 'react'
import {
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Receipt,
} from 'lucide-react'
import type { FinanceTransaction, TransactionType, TransactionCategory } from '../types'
import { formatCurrency } from '@/features/payments/types'
import { TransactionVoucherModal } from './TransactionVoucherModal'

interface TransactionHistoryTableProps {
  transactions: FinanceTransaction[]
  isLoading?: boolean
  onDelete?: (id: string) => void
  showMonthFilter?: boolean
}

export function TransactionHistoryTable({
  transactions,
  isLoading,
  onDelete,
}: TransactionHistoryTableProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'ALL'>('ALL')
  const [selectedTx, setSelectedTx] = useState<FinanceTransaction | null>(null)

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false
    if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.party_name.toLowerCase().includes(q) ||
        (tx.invoice_no && tx.invoice_no.toLowerCase().includes(q)) ||
        (tx.party_role && tx.party_role.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Control Bar ───────────────────────────────────────── */}
      <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, memo, purpose..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>

          {/* Type Filter Pill */}
          <div className="flex bg-zinc-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                typeFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('INCOME')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                typeFilter === 'INCOME' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-600 hover:text-emerald-700'
              }`}
            >
              <ArrowDownRight size={12} /> Income
            </button>
            <button
              onClick={() => setTypeFilter('EXPENSE')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                typeFilter === 'EXPENSE' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-600 hover:text-rose-700'
              }`}
            >
              <ArrowUpRight size={12} /> Spent
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TransactionCategory | 'ALL')}
            className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-white font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Categories</option>
            <option value="STUDENT_FEE">Student Fees</option>
            <option value="TEACHER_SALARY">Teacher Salaries</option>
            <option value="OPERATIONAL_EXPENSE">Operational Expenses</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          Showing <span className="font-bold text-zinc-800">{filtered.length}</span> transaction{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Transactions Table & Mobile Cards ────────────────── */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400">
          <p className="text-sm font-semibold text-zinc-600">Loading transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-400">
          <Receipt size={40} className="mx-auto mb-3 opacity-30 text-zinc-400" />
          <p className="text-sm font-semibold text-zinc-700">No Transactions Found</p>
          <p className="text-xs text-zinc-400 mt-1">Try adjusting your search or filter options</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="block sm:hidden divide-y divide-zinc-100">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'INCOME'
              return (
                <div
                  key={tx.id}
                  className="p-4 space-y-2.5 active:bg-zinc-50/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedTx(tx)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {isIncome ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 text-sm truncate">{tx.title}</p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {tx.party_name}
                          {tx.party_role && <span className="text-zinc-400"> • {tx.party_role}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <p className="text-[10px] text-zinc-400 font-medium">{tx.date}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] pt-1 border-t border-zinc-50">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          tx.category === 'STUDENT_FEE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : tx.category === 'TEACHER_SALARY'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}
                      >
                        {tx.category === 'STUDENT_FEE'
                          ? 'Student Fee'
                          : tx.category === 'TEACHER_SALARY'
                          ? 'Teacher Salary'
                          : 'Operational'}
                      </span>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono font-medium text-[10px]">
                        {tx.payment_method}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                      >
                        <Receipt size={12} />
                        Voucher
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction record?')) {
                              onDelete(tx.id)
                            }
                          }}
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Transaction / Purpose</th>
                  <th className="px-4 py-3">Party / Recipient</th>
                  <th className="px-4 py-3 text-center">Category</th>
                  <th className="px-4 py-3 text-center">Method</th>
                  <th className="px-4 py-3 text-right">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((tx) => {
                  const isIncome = tx.type === 'INCOME'
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      {/* Title & Memo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {isIncome ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate max-w-xs">{tx.title}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                              <span className="font-mono text-zinc-500">{tx.invoice_no ?? tx.id.slice(0, 8)}</span>
                              {tx.notes && <span>• {tx.notes}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Party Name */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-800">{tx.party_name}</p>
                        {tx.party_role && <p className="text-[11px] text-zinc-400">{tx.party_role}</p>}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tx.category === 'STUDENT_FEE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : tx.category === 'TEACHER_SALARY'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                          }`}
                        >
                          {tx.category === 'STUDENT_FEE'
                            ? 'Student Fee'
                            : tx.category === 'TEACHER_SALARY'
                            ? 'Teacher Salary'
                            : 'Operational'}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono font-medium text-[11px]">
                          {tx.payment_method}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-right font-medium text-zinc-600">
                        {tx.date}
                      </td>

                      {/* Amount (+/-) */}
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-sm">
                        <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            title="View / Print Voucher Memo"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          >
                            <Receipt size={14} />
                          </button>
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this transaction record?')) {
                                  onDelete(tx.id)
                                }
                              }}
                              title="Delete"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Voucher Memo Modal */}
      {selectedTx && (
        <TransactionVoucherModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  )
}
