import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Receipt,
  Calendar,
  Building,
  FileText,
  Plus,
} from 'lucide-react'
import { useExpenseCategories, useCreateExpense, useUpdateExpense } from '../hooks/useExpenses'
import type { ExpenseRecord, FinancePaymentMethod } from '../types'

interface AddExpenseModalProps {
  open: boolean
  editingExpense?: ExpenseRecord | null
  onClose: () => void
  onOpenManageCategories?: () => void
}

export function AddExpenseModal({
  open,
  editingExpense,
  onClose,
  onOpenManageCategories,
}: AddExpenseModalProps) {
  const { data: categories = [] } = useExpenseCategories()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [vendorName, setVendorName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<FinancePaymentMethod>('CASH')
  const [receiptNo, setReceiptNo] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title)
      setCategoryId(editingExpense.category_id)
      setAmount(editingExpense.amount)
      setDate(editingExpense.date)
      setVendorName(editingExpense.vendor_name)
      setPaymentMethod(editingExpense.payment_method)
      setReceiptNo(editingExpense.receipt_no ?? '')
      setNotes(editingExpense.notes ?? '')
    } else {
      setTitle('')
      setCategoryId(categories[0]?.id ?? 'cat-util')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setVendorName('')
      setPaymentMethod('CASH')
      setReceiptNo('')
      setNotes('')
    }
  }, [editingExpense, open, categories])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount || Number(amount) <= 0 || !categoryId) {
      alert('Please fill in title, amount, and category.')
      return
    }

    if (editingExpense) {
      updateExpense.mutate(
        {
          id: editingExpense.id,
          dto: {
            title,
            category_id: categoryId,
            amount: Number(amount),
            date,
            vendor_name: vendorName || 'General Payee',
            payment_method: paymentMethod,
            receipt_no: receiptNo,
            notes,
          },
        },
        {
          onSuccess: () => onClose(),
        }
      )
    } else {
      createExpense.mutate(
        {
          title,
          category_id: categoryId,
          amount: Number(amount),
          date,
          vendor_name: vendorName || 'General Payee',
          payment_method: paymentMethod,
          receipt_no: receiptNo,
          notes,
        },
        {
          onSuccess: () => onClose(),
        }
      )
    }
  }

  const isSaving = createExpense.isPending || updateExpense.isPending

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">
                {editingExpense ? 'Edit Expense Record' : 'Add Expense / Bill'}
              </h2>
              <p className="text-xs text-zinc-500">Record institutional expenditure & bills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Title / Description */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">
              Expense Title / Purpose <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electricity Bill August, Exam Paper Printing"
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm"
              />
            </div>
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Amount (৳) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold font-mono">৳</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Category & Quick Add */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-700">
                Expense Category <span className="text-red-500">*</span>
              </label>
              {onOpenManageCategories && (
                <button
                  type="button"
                  onClick={onOpenManageCategories}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={11} /> New Category
                </button>
              )}
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-zinc-800"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Name & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Paid To / Vendor Name
              </label>
              <div className="relative">
                <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. DPDC, Dhaka Stationery"
                  className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as FinancePaymentMethod)}
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
              >
                <option value="CASH">Cash 💵</option>
                <option value="BANK">Bank Transfer 🏦</option>
                <option value="BKASH">bKash 📱</option>
                <option value="NAGAD">Nagad 📱</option>
                <option value="ROCKET">Rocket 📱</option>
                <option value="CHEQUE">Cheque 📝</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Receipt / Memo Ref */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">
              Receipt / Physical Memo No. (Optional)
            </label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              placeholder="e.g. DPDC-88491, Cash-Memo-104"
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details or remarks..."
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save & Record'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
