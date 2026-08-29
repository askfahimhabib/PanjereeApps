import { useState } from 'react'
import { Printer, Eye, Search, Trash2 } from 'lucide-react'
import type { PaymentRecord, PaymentMethod, PaymentStatus } from '../types'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_STATUS_CONFIG,
  MONTH_NAMES,
  formatCurrency,
} from '../types'
import type { PaymentFilters } from '../hooks/usePayments'
import { useDeletePayment } from '../hooks/usePayments'
import { classStore } from '@/data/stores'

const mockClasses = classStore.getAll()
import { printInvoice } from '../utils/printInvoice'
import { InvoicePrintModal } from './InvoicePrintModal'

interface Props {
  records: PaymentRecord[]
  isLoading: boolean
  filters: PaymentFilters
  onFiltersChange: (f: PaymentFilters) => void
}

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
const STATUSES = Object.keys(PAYMENT_STATUS_CONFIG) as PaymentStatus[]
const currentYear = new Date().getFullYear()

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
    <>
      {/* Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search student, roll, invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Class */}
        <select
          value={filters.class_id ?? ''}
          onChange={e => setFilter('class_id', e.target.value)}
          className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Classes</option>
          {mockClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Month */}
        <select
          value={filters.month ?? ''}
          onChange={e => setFilter('month', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Months</option>
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>

        {/* Year */}
        <select
          value={filters.year ?? ''}
          onChange={e => setFilter('year', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Years</option>
          {[currentYear, currentYear - 1, currentYear - 2].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Method */}
        <select
          value={filters.payment_method ?? ''}
          onChange={e => setFilter('payment_method', e.target.value)}
          className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Methods</option>
          {METHODS.map(m => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
        </select>

        {/* Status */}
        <select
          value={filters.status ?? ''}
          onChange={e => setFilter('status', e.target.value)}
          className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{PAYMENT_STATUS_CONFIG[s].label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider whitespace-nowrap">Invoice</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden lg:table-cell">Method</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-zinc-50 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-zinc-800 text-sm">
                        No transactions found
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
                      <tr key={record.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-blue-400 whitespace-nowrap">
                          {record.invoice_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-zinc-800 font-medium text-xs">{record.student_name}</p>
                          <p className="text-zinc-600 text-[10px]">Roll {record.roll_number} · {record.class_name ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-zinc-600 text-xs max-w-[160px] truncate" title={itemSummary}>
                            {itemSummary}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-zinc-600 text-xs">
                            {PAYMENT_METHOD_ICONS[record.payment_method]} {PAYMENT_METHOD_LABELS[record.payment_method]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-emerald-400 font-bold text-sm">{formatCurrency(record.total_amount)}</p>
                          {record.discount_amount > 0 && (
                            <p className="text-[10px] text-amber-400">- {formatCurrency(record.discount_amount)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap hidden sm:table-cell">
                          {paidDate}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewRecord(record)}
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50 transition-all"
                              title="View Invoice"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => printInvoice(record)}
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                              title="Print Invoice"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              disabled={deletePayment.isPending}
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
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

      {/* Row count */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-zinc-800 text-right">
          Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== records.length && ` (filtered from ${records.length})`}
        </p>
      )}

      <InvoicePrintModal
        open={!!previewRecord}
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />
    </>
  )
}
