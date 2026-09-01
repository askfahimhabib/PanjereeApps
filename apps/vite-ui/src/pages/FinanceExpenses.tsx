import { useState } from 'react'
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Pencil,
  Printer,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react'
import {
  useExpenses,
  useExpenseCategories,
  useDeleteExpense,
  type ExpenseFilters,
} from '@/features/finance/hooks/useExpenses'
import { AddExpenseModal } from '@/features/finance/components/AddExpenseModal'
import { ManageCategoriesModal } from '@/features/finance/components/ManageCategoriesModal'
import { TransactionVoucherModal } from '@/features/finance/components/TransactionVoucherModal'
import type { ExpenseRecord, FinanceTransaction } from '@/features/finance/types'
import { MONTH_NAMES, formatCurrency } from '@/features/payments/types'

export function FinanceExpenses() {
  const now = new Date()
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [year, setYear] = useState<number>(now.getFullYear())
  const [isAllMonths, setIsAllMonths] = useState(false)
  const [categoryId, setCategoryId] = useState('ALL')
  const [search, setSearch] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<FinanceTransaction | null>(null)

  const filters: ExpenseFilters = {
    month: isAllMonths ? undefined : month,
    year,
    category_id: categoryId,
    search,
  }

  const { data: expenses = [], isLoading } = useExpenses(filters)
  const { data: categories = [] } = useExpenseCategories()
  const deleteExpense = useDeleteExpense()

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Institutional Expenses</h1>
          <p className="text-zinc-500 mt-1 text-sm flex items-center gap-1.5">
            <Receipt size={14} className="text-rose-600" />
            Track utility bills, campus maintenance, supplies, lab equipment & operational costs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <Tag size={14} className="text-purple-600" />
            Manage Categories
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={14} />
            Print Report
          </button>

          <button
            onClick={() => {
              setEditingExpense(null)
              setAddModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus size={15} />
            + Record Expense
          </button>
        </div>
      </div>

      {/* ── Month & Filter Selector Bar ────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              disabled={isAllMonths}
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-32">
              <p className="font-bold text-zinc-900 text-base leading-tight">
                {isAllMonths ? `All Months` : MONTH_NAMES[month - 1]}
              </p>
              <p className="text-xs text-zinc-500">{year}</p>
            </div>
            <button
              disabled={isAllMonths}
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => setIsAllMonths(!isAllMonths)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isAllMonths
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            {isAllMonths ? '✓ Showing Entire Year' : 'Show Full Year'}
          </button>
        </div>

        <div className="h-8 w-px bg-zinc-200 hidden md:block" />

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses, vendors, memos..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-w-[200px]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Total Recorded Spent</span>
          <p className="text-2xl font-extrabold text-zinc-900 font-mono tracking-tight mt-1">
            {formatCurrency(totalExpenseAmount)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {expenses.length} invoices & expense vouchers
          </p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Highest Single Bill</span>
          <p className="text-2xl font-extrabold text-zinc-900 font-mono tracking-tight mt-1">
            {formatCurrency(highestExpense)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Peak individual expense</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Active Categories</span>
          <p className="text-2xl font-extrabold text-zinc-900 font-mono tracking-tight mt-1">
            {categories.length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Predefined and custom tracking categories</p>
        </div>
      </div>

      {/* ── Expenses Table ─────────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-400">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-30 text-zinc-400" />
              <p className="font-bold text-zinc-700 text-sm">No Expense Records Found</p>
              <p className="text-xs text-zinc-400 mt-1">Add your utility bills, repairs, or supplies to start tracking</p>
              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
              >
                + Add First Expense
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Expense / Invoice</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Vendor / Payee</th>
                  <th className="px-4 py-3 text-center">Payment Mode</th>
                  <th className="px-4 py-3 text-right">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Title & Invoice */}
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-zinc-900">{e.title}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-500 font-semibold">{e.invoice_no}</span>
                        {e.receipt_no && <span>• Memo: {e.receipt_no}</span>}
                        {e.notes && <span>• {e.notes}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200/60 truncate max-w-[180px]">
                        {e.category_name}
                      </span>
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-3.5 font-medium text-zinc-800">
                      {e.vendor_name}
                    </td>

                    {/* Payment Mode */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 font-mono text-[11px] text-zinc-700">
                        {e.payment_method}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-right font-medium text-zinc-600">
                      {e.date}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-sm text-rose-600">
                      {formatCurrency(e.amount)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            setSelectedVoucher({
                              id: `vch-${e.id}`,
                              type: 'EXPENSE',
                              category: 'OPERATIONAL_EXPENSE',
                              title: e.title,
                              amount: e.amount,
                              date: e.date,
                              month: e.month,
                              year: e.year,
                              payment_method: e.payment_method,
                              invoice_no: e.invoice_no,
                              party_name: e.vendor_name,
                              party_role: e.category_name,
                              notes: e.notes,
                              created_at: e.created_at,
                            })
                          }
                          title="View / Print Debit Voucher Memo"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Receipt size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingExpense(e)
                            setAddModalOpen(true)
                          }}
                          title="Edit"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete expense "${e.title}"?`)) {
                              deleteExpense.mutate(e.id)
                            }
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <AddExpenseModal
        open={addModalOpen}
        editingExpense={editingExpense}
        onClose={() => {
          setAddModalOpen(false)
          setEditingExpense(null)
        }}
        onOpenManageCategories={() => setCategoryModalOpen(true)}
      />

      <ManageCategoriesModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />

      {selectedVoucher && (
        <TransactionVoucherModal
          transaction={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  )
}
