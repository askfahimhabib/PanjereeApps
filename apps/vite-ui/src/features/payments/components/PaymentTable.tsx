import { useState } from 'react'
import { Printer, Eye, Search, Trash2, Receipt } from 'lucide-react'
import type { PaymentRecord, PaymentMethod, PaymentStatus } from '../types'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_STATUS_CONFIG,
  formatCurrency,
} from '../types'
import type { PaymentFilters } from '../hooks/usePayments'
import { useDeletePayment } from '../hooks/usePayments'
import { classStore } from '@/data/stores'
import { printInvoice } from '../utils/printInvoice'
import { InvoicePrintModal } from './InvoicePrintModal'

const mockClasses = classStore.getAll()

interface Props {
  records: PaymentRecord[]
  isLoading: boolean
  filters: PaymentFilters
  onFiltersChange: (f: PaymentFilters) => void
}

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
const STATUSES = Object.keys(PAYMENT_STATUS_CONFIG) as PaymentStatus[]

export function PaymentTable({ records, isLoading, filters, onFiltersChange }: Props) {
  const [previewRecord, setPreviewRecord] = useState<PaymentRecord | null>(null)
  const [search, setSearch] = useState('')
  const deletePayment = useDeletePayment()

  const handleDelete = (record: PaymentRecord) => {
    if (window.confirm(`Delete payment ${record.invoice_number} for ${record.student_name}? This cannot be undone.`)) {
      deletePayment.mutate(record.id)
    }
  }

  const setFilter = <K extends keyof PaymentFilters>(key: K, val: PaymentFilters[K]) =>
    onFiltersChange({ ...filters, [key]: val || undefined })

  const filtered = search.trim()
    ? records.filter(r =>
        r.student_name.toLowerCase().includes(search.toLowerCase()) ||
        r.roll_number.toLowerCase().includes(search.toLowerCase()) ||
        r.invoice_number.toLowerCase().includes(search.toLowerCase())
      )
    : records

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search student, roll number, invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class */}
          <select
            value={filters.class_id ?? ''}
            onChange={e => setFilter('class_id', e.target.value)}
            className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-700 focus:outline-none"
          >
            <option value="">All Classes</option>
            {mockClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Method */}
          <select
            value={filters.payment_method ?? ''}
            onChange={e => setFilter('payment_method', e.target.value as PaymentMethod)}
            className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-700 focus:outline-none"
          >
            <option value="">All Methods</option>
            {METHODS.map(m => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status ?? ''}
            onChange={e => setFilter('status', e.target.value as PaymentStatus)}
            className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-700 focus:outline-none"
          >
            <option value="">All Status</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          {filtered.length} Transaction{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table Surface */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Invoice No</th>
                <th className="px-4 py-3">Student Particulars</th>
                <th className="px-4 py-3 hidden md:table-cell">Fee Items</th>
                <th className="px-4 py-3 hidden lg:table-cell">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 rounded bg-zinc-100 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-zinc-400">
                        <Receipt size={36} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                        <p className="font-semibold text-zinc-700 text-sm">No Transactions Found</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Collect student fee to generate receipts</p>
                      </td>
                    </tr>
                  )
                : filtered.map(record => {
                    const statusCfg = PAYMENT_STATUS_CONFIG[record.status]
                    const paidDate = new Date(record.paid_at).toLocaleDateString('en-BD', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                    const itemSummary = record.items.map(it => it.label).join(', ')

                    return (
                      <tr key={record.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-lg whitespace-nowrap">
                            {record.invoice_number}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-zinc-900 text-xs">{record.student_name}</p>
                          <p className="text-zinc-500 text-[11px]">Roll {record.roll_number} · {record.class_name ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <p className="text-zinc-600 text-xs max-w-[180px] truncate" title={itemSummary}>
                            {itemSummary}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-zinc-700 font-medium text-xs flex items-center gap-1">
                            <span>{PAYMENT_METHOD_ICONS[record.payment_method]}</span>
                            <span>{PAYMENT_METHOD_LABELS[record.payment_method]}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono">
                          <p className="text-emerald-700 font-extrabold text-xs">{formatCurrency(record.total_amount)}</p>
                          {record.discount_amount > 0 && (
                            <p className="text-[10px] text-rose-500">- {formatCurrency(record.discount_amount)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500 text-xs whitespace-nowrap text-right hidden sm:table-cell">
                          {paidDate}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewRecord(record)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="View Invoice"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => printInvoice(record, 'DUAL_A4')}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Print Dual Receipt"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              disabled={deletePayment.isPending}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
                              title="Delete Payment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      <InvoicePrintModal
        open={!!previewRecord}
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />
    </div>
  )
}
