import { useState } from 'react'
import {
  Wallet,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  SlidersHorizontal,
  History,
  Sparkles,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import {
  useTeacherSalary,
  useTeacherSalarySettings,
  useTeacherSalaryHistory,
  type TeacherSalaryRecord,
  type SalaryStatus,
} from '@/features/teachers/salary/useTeacherSalary'
import { SalarySetupTab } from '@/features/teachers/salary/SalarySetupTab'
import { SalaryHistoryTab } from '@/features/teachers/salary/SalaryHistoryTab'
import { MONTH_NAMES, formatCurrency } from '@/features/payments/types'
import type { FinancePaymentMethod } from '@/features/finance/types'

type TabType = 'monthly' | 'setup' | 'history'

const STATUS_CFG: Record<SalaryStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  PAID:    { label: 'Paid',    bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
  UNPAID:  { label: 'Unpaid',  bg: 'bg-rose-50 text-rose-700 border border-rose-200',   text: 'text-rose-700',   icon: XCircle },
  PARTIAL: { label: 'Partial', bg: 'bg-amber-50 text-amber-700 border border-amber-200', text: 'text-amber-700', icon: Clock },
}

export function TeacherSalary() {
  const [activeTab, setActiveTab] = useState<TabType>('monthly')

  const {
    month,
    year,
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
    prevMonth,
    nextMonth,
    filtered,
    stats,
    markAsPaid,
    generateSheet,
  } = useTeacherSalary()

  const { settings, saveSetting } = useTeacherSalarySettings()
  const history = useTeacherSalaryHistory()

  const [payModal, setPayModal] = useState<TeacherSalaryRecord | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const TABS = [
    { key: 'monthly' as TabType, label: 'Monthly Disbursal', icon: Wallet },
    { key: 'setup' as TabType, label: 'Salary Structure Setup', icon: SlidersHorizontal },
    { key: 'history' as TabType, label: 'Payment Ledger & History', icon: History },
  ]

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Teacher Salaries</h1>
          <p className="text-zinc-500 mt-1 text-sm flex items-center gap-1.5">
            <DollarSign size={14} className="text-indigo-600" />
            Manage monthly salary sheets, individual salary structures & disbursement ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'monthly' && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 border border-zinc-200 bg-white text-zinc-700 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
            >
              <Printer size={15} />
              Print Sheet
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────── */}
      <div className="pill-tab-container w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab 1: Monthly Disbursal ──────────────────────────── */}
      {activeTab === 'monthly' && (
        <div className="space-y-5">
          {/* Month Selector Bar */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center min-w-36">
                <p className="font-bold text-zinc-900 text-lg leading-tight">{MONTH_NAMES[month - 1]}</p>
                <p className="text-xs text-zinc-500">{year}</p>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teacher or designation..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SalaryStatus | 'ALL')}
                className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-700"
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <button
              onClick={generateSheet}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
              title="Sync / regenerate all teacher records for this month"
            >
              <Sparkles size={13} /> Sync Monthly Records
            </button>
          </div>

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Paid Teachers', value: stats.paid, color: 'text-emerald-600', bg: 'bg-emerald-50/70 border-emerald-100' },
              { label: 'Unpaid Teachers', value: stats.unpaid, color: 'text-rose-600', bg: 'bg-rose-50/70 border-rose-100' },
              { label: 'Partial Paid', value: stats.partial, color: 'text-amber-600', bg: 'bg-amber-50/70 border-amber-100' },
              { label: `Total Payable (৳)`, value: formatCurrency(stats.totalAmount), color: 'text-indigo-600', bg: 'bg-indigo-50/70 border-indigo-100' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border rounded-2xl p-4 shadow-sm`}>
                <p className={`text-2xl font-extrabold ${s.color} font-mono tracking-tight`}>{s.value}</p>
                <p className="text-xs text-zinc-600 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Salary Table & Mobile Cards */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-16 text-center text-zinc-400">
                <Wallet size={40} className="mx-auto mb-3 opacity-30 text-zinc-400" />
                <p className="font-bold text-zinc-700 text-sm">No Salary Records for {MONTH_NAMES[month - 1]} {year}</p>
                <button
                  onClick={generateSheet}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  Generate {MONTH_NAMES[month - 1]} Sheet
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="block md:hidden divide-y divide-zinc-100">
                  {filtered.map((r) => {
                    const net = r.baseSalary + r.bonus - r.deduction
                    const cfg = STATUS_CFG[r.status]
                    const StatusIcon = cfg.icon

                    return (
                      <div key={r.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                              {r.teacherName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-zinc-900 text-sm truncate">{r.teacherName}</p>
                              <p className="text-[11px] text-zinc-500 truncate">{r.designation}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${cfg.bg}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </span>
                        </div>

                        {/* Salary breakdown badges */}
                        <div className="grid grid-cols-2 gap-2 bg-zinc-50/70 p-2.5 rounded-xl text-xs border border-zinc-100">
                          <div>
                            <span className="text-[10px] text-zinc-400 font-medium">Net Payable</span>
                            <p className="font-mono font-bold text-zinc-900 text-sm">{formatCurrency(net)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 font-medium">Paid So Far</span>
                            <p className="font-mono font-bold text-emerald-700 text-sm">
                              {r.paidAmount > 0 ? formatCurrency(r.paidAmount) : '৳ 0'}
                            </p>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-zinc-200/50 flex flex-wrap items-center justify-between text-[11px] text-zinc-500">
                            <span>Base: <strong className="font-mono text-zinc-700">{formatCurrency(r.baseSalary)}</strong></span>
                            {r.bonus > 0 && <span className="text-emerald-600">Bonus: +{formatCurrency(r.bonus)}</span>}
                            {r.deduction > 0 && <span className="text-rose-600">Ded: -{formatCurrency(r.deduction)}</span>}
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-1">
                          {r.status !== 'PAID' ? (
                            <button
                              onClick={() => setPayModal(r)}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl transition-all shadow-xs shadow-emerald-500/20 cursor-pointer"
                            >
                              <DollarSign size={14} />
                              Disburse Salary
                            </button>
                          ) : (
                            <button
                              onClick={() => setPayModal(r)}
                              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                            >
                              View / Adjust Disbursal
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3">Teacher</th>
                        <th className="px-4 py-3 text-right">Base Salary</th>
                        <th className="px-4 py-3 text-right">Bonus / Allowance</th>
                        <th className="px-4 py-3 text-right">Deductions</th>
                        <th className="px-4 py-3 text-right">Net Payable</th>
                        <th className="px-4 py-3 text-right">Paid So Far</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {filtered.map((r) => {
                        const net = r.baseSalary + r.bonus - r.deduction
                        const cfg = STATUS_CFG[r.status]
                        const StatusIcon = cfg.icon

                        return (
                          <tr key={r.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                                  {r.teacherName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-900">{r.teacherName}</p>
                                  <p className="text-[11px] text-zinc-500">{r.designation}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-right font-mono text-zinc-700">
                              {formatCurrency(r.baseSalary)}
                            </td>

                            <td className="px-4 py-3.5 text-right font-mono text-emerald-600">
                              {r.bonus > 0 ? `+${formatCurrency(r.bonus)}` : '—'}
                            </td>

                            <td className="px-4 py-3.5 text-right font-mono text-rose-600">
                              {r.deduction > 0 ? `-${formatCurrency(r.deduction)}` : '—'}
                            </td>

                            <td className="px-4 py-3.5 text-right font-mono font-bold text-zinc-900">
                              {formatCurrency(net)}
                            </td>

                            <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                              {r.paidAmount > 0 ? formatCurrency(r.paidAmount) : '৳ 0'}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg}`}>
                                <StatusIcon size={11} />
                                {cfg.label}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              {r.status !== 'PAID' ? (
                                <button
                                  onClick={() => setPayModal(r)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shadow-emerald-500/20 cursor-pointer"
                                >
                                  <DollarSign size={13} />
                                  Disburse
                                </button>
                              ) : (
                                <button
                                  onClick={() => setPayModal(r)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 hover:underline cursor-pointer"
                                >
                                  View / Adjust
                                </button>
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
        </div>
      )}

      {/* ── Tab 2: Salary Setup (Configurations) ──────────────── */}
      {activeTab === 'setup' && (
        <SalarySetupTab settings={settings} onSaveSetting={saveSetting} />
      )}

      {/* ── Tab 3: Salary History ─────────────────────────────── */}
      {activeTab === 'history' && (
        <SalaryHistoryTab history={history} />
      )}

      {/* ── Pay Disbursal Modal ───────────────────────────────── */}
      {payModal && (
        <PaySalaryModal
          record={payModal}
          onClose={() => setPayModal(null)}
          onSave={(r, amt, notes, method, bonus, deduction) => {
            markAsPaid(r, amt, notes, method, bonus, deduction)
            setPayModal(null)
          }}
        />
      )}
    </div>
  )
}

// ── Enhanced Pay Modal ────────────────────────────────────────────────────────
function PaySalaryModal({
  record: r,
  onClose,
  onSave,
}: {
  record: TeacherSalaryRecord
  onClose: () => void
  onSave: (
    r: TeacherSalaryRecord,
    amount: number,
    notes: string,
    method: FinancePaymentMethod,
    bonus?: number,
    deduction?: number
  ) => void
}) {
  const [bonus, setBonus] = useState(r.bonus)
  const [deduction, setDeduction] = useState(r.deduction)
  const net = r.baseSalary + bonus - deduction
  const remaining = Math.max(0, net - r.paidAmount)

  const [amount, setAmount] = useState<number>(remaining)
  const [paymentMethod, setPaymentMethod] = useState<FinancePaymentMethod>(r.paymentMethod ?? 'BANK')
  const [notes, setNotes] = useState(r.notes ?? '')

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Disburse Salary</h2>
              <p className="text-xs text-zinc-500">
                {r.teacherName} • <span className="font-medium">{r.designation}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4 text-xs">
          {/* Salary Breakdown Summary Card */}
          <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 border border-zinc-100">
            <div className="flex justify-between text-zinc-600">
              <span>Base Salary</span>
              <span className="font-mono font-medium">{formatCurrency(r.baseSalary)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span>Bonus / Allowance</span>
              <div className="flex items-center gap-1">
                <span>+</span>
                <input
                  type="number"
                  min={0}
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-right border border-zinc-200 rounded-md bg-white text-xs font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-rose-600">
              <span>Deductions</span>
              <div className="flex items-center gap-1">
                <span>-</span>
                <input
                  type="number"
                  min={0}
                  value={deduction}
                  onChange={(e) => setDeduction(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-right border border-zinc-200 rounded-md bg-white text-xs font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-sm text-zinc-900">
              <span>Net Payable</span>
              <span className="font-mono">{formatCurrency(net)}</span>
            </div>
            {r.paidAmount > 0 && (
              <div className="flex justify-between text-amber-600 font-medium pt-1">
                <span>Paid Previously</span>
                <span className="font-mono">{formatCurrency(r.paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Remaining Balance</span>
              <span className="font-mono">{formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">
              Disbursal Amount (৳) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold font-mono">৳</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={remaining > 0 ? remaining : undefined}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as FinancePaymentMethod)}
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-800"
            >
              <option value="BANK">Bank Transfer 🏦</option>
              <option value="BKASH">bKash 📱</option>
              <option value="NAGAD">Nagad 📱</option>
              <option value="ROCKET">Rocket 📱</option>
              <option value="CASH">Cash 💵</option>
              <option value="CHEQUE">Cheque 📝</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">Notes / Reference Memo</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Disbursed via Bank Transfer Ref #9921..."
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(r, r.paidAmount + amount, notes, paymentMethod, bonus, deduction)}
              className="flex-1 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Confirm Disbursal
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
