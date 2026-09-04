import { useState, useMemo } from 'react'
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Phone,
  Search,
  ArrowDownRight,
} from 'lucide-react'
import type { PaymentSummary } from '../types'
import { formatCurrency } from '../../payments/types'

interface Props {
  data: PaymentSummary
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  bgColor,
}: {
  icon: React.ElementType
  label: string
  value: string
  subtext?: string
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
      <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 mt-0.5">{value}</p>
        {subtext && <p className="text-[11px] text-zinc-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  )
}

function MonthlyBarChart({ monthly }: { monthly: PaymentSummary['monthly'] }) {
  const maxTotal = Math.max(...monthly.map((m) => m.total), 1)

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Monthly Revenue Collections</h4>
          <p className="text-xs text-zinc-500">Collected tuition, admission, and institutional fees by month</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">
          Current Year
        </span>
      </div>

      <div className="flex items-end gap-2.5 h-44 pt-6 px-2">
        {monthly.map((m, i) => {
          const heightPct = Math.max(Math.round((m.total / maxTotal) * 100), 6)
          return (
            <div key={i} className="group flex-1 flex flex-col items-center gap-2 relative h-full justify-end cursor-pointer">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[11px] rounded-lg px-2.5 py-2 whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <p className="font-bold text-emerald-400">{formatCurrency(m.total)}</p>
                <p className="text-zinc-300">{m.count} transactions</p>
                <p className="text-zinc-400 text-[10px]">{m.monthName} {m.year}</p>
              </div>

              {/* Bar */}
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                style={{ height: `${heightPct}%` }}
              />

              {/* Label */}
              <span className="text-[10px] font-semibold text-zinc-500">{m.monthName.slice(0, 3)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeeTypeBreakdown({ byFeeType }: { byFeeType: PaymentSummary['byFeeType'] }) {
  const total = byFeeType.reduce((s, f) => s + f.total, 0)
  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-purple-500',
  ]

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/70">
        <h4 className="text-sm font-bold text-zinc-900">Revenue by Fee Category</h4>
        <p className="text-xs text-zinc-500">Breakdown of fee heads collected across the institution</p>
      </div>

      {/* Stacked pill bar */}
      <div className="p-4 border-b border-zinc-100">
        <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-zinc-100">
          {byFeeType.map((f, i) => {
            const pct = total > 0 ? (f.total / total) * 100 : 0
            if (pct <= 0) return null
            return (
              <div
                key={f.type}
                className={`${colors[i % colors.length]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${f.label}: ${Math.round(pct)}%`}
              />
            )
          })}
        </div>
      </div>

      <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
        {byFeeType.map((f, i) => {
          const pct = total > 0 ? Math.round((f.total / total) * 100) : 0
          return (
            <div key={f.type} className="flex items-center justify-between px-5 py-2.5 hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                <span className="text-xs font-semibold text-zinc-800">{f.label}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-900">{formatCurrency(f.total)}</p>
                <p className="text-[10px] text-zinc-500">{pct}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PaymentMethodsAndExpenses({
  byMethod,
  expenseCategories,
}: {
  byMethod: PaymentSummary['byMethod']
  expenseCategories: PaymentSummary['expenseCategories']
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Payment Methods */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-zinc-900 mb-1">Collection by Channel</h4>
        <p className="text-xs text-zinc-500 mb-4">Payment gateways & cash intake distribution</p>

        <div className="space-y-3">
          {byMethod.map((m) => (
            <div key={m.method} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">{m.label}</span>
                <span className="font-bold text-zinc-900">
                  {formatCurrency(m.total)}{' '}
                  <span className="text-[10px] text-zinc-400 font-normal">({m.percentage}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-zinc-900 mb-1">Expenditure Breakdown</h4>
        <p className="text-xs text-zinc-500 mb-4">Operational costs and teacher payroll allocations</p>

        <div className="space-y-3">
          {expenseCategories.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No expenses recorded for this period.</p>
          ) : (
            expenseCategories.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">{c.category}</span>
                  <span className="font-bold text-zinc-900">
                    {formatCurrency(c.total)}{' '}
                    <span className="text-[10px] text-zinc-400 font-normal">({c.percentage}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StudentOutstandingDuesTable({ list }: { list: PaymentSummary['studentDuesList'] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const q = searchTerm.toLowerCase().trim()
      if (!q) return true
      return (
        item.studentName.toLowerCase().includes(q) ||
        item.studentId.toLowerCase().includes(q) ||
        item.rollNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q)
      )
    })
  }, [list, searchTerm])

  const totalFilteredDue = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + curr.dueAmount, 0)
  }, [filtered])

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Student Outstanding Dues & Arrears Ledger</h4>
            <p className="text-xs text-zinc-500">
              Unpaid student fees requiring follow-up ({filtered.length} dues · Total: {formatCurrency(totalFilteredDue)})
            </p>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, fee, class..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      {/* Mobile View: Dues Cards */}
      <div className="block sm:hidden divide-y divide-zinc-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No outstanding student dues found.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 text-xs truncate">{item.studentName}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {item.studentId} • Roll #{item.rollNumber}
                  </p>
                </div>
                <span className="font-mono font-bold text-xs text-amber-700 shrink-0">
                  {formatCurrency(item.dueAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 bg-zinc-50/70 p-2 rounded-xl border border-zinc-100">
                <span className="truncate">{item.className} - Sec {item.sectionName}</span>
                <span className="font-medium text-zinc-700 truncate">{item.title}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-50">
                <span className="text-zinc-400 font-mono text-[10px]">Due: {item.dueDate}</span>
                {item.guardianMobile ? (
                  <a
                    href={`tel:${item.guardianMobile}`}
                    className="inline-flex items-center gap-1 text-zinc-700 hover:text-indigo-600 font-medium text-xs"
                  >
                    <Phone size={12} className="text-emerald-600" />
                    <span>{item.guardianMobile}</span>
                  </a>
                ) : (
                  <span className="text-zinc-300 text-[10px]">No phone</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Full Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">ID & Roll</th>
              <th className="px-4 py-3">Class / Section</th>
              <th className="px-4 py-3">Fee Title</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Due Amount</th>
              <th className="px-4 py-3">Guardian Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                  No outstanding student dues found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{item.studentName}</td>
                  <td className="px-4 py-3 font-mono text-zinc-700">
                    <div>{item.studentId}</div>
                    <div className="text-[10px] text-zinc-400">Roll: {item.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {item.className} - Sec {item.sectionName}
                  </td>
                  <td className="px-4 py-3 text-zinc-800 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono">{item.dueDate}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-700">
                    {formatCurrency(item.dueAmount)}
                  </td>
                  <td className="px-4 py-3">
                    {item.guardianMobile ? (
                      <a
                        href={`tel:${item.guardianMobile}`}
                        className="inline-flex items-center gap-1 font-mono text-zinc-800 hover:text-blue-600"
                      >
                        <Phone size={11} className="text-zinc-400" />
                        {item.guardianMobile}
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PaymentReport({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* 1. Top Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={Wallet}
          label="Total Collected"
          value={formatCurrency(data.totalCollected)}
          subtext={`${data.totalTransactions} transactions`}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={AlertCircle}
          label="Outstanding Dues"
          value={formatCurrency(data.totalOutstandingDues)}
          subtext={`${data.studentDuesList.length} pending items`}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Total Expenditures"
          value={formatCurrency(data.totalExpenses)}
          subtext="Operational expenses & payroll"
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Net Financial Balance"
          value={formatCurrency(data.netBalance)}
          subtext={data.netBalance >= 0 ? 'Surplus cash flow' : 'Deficit'}
          color={data.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}
          bgColor={data.netBalance >= 0 ? 'bg-blue-50' : 'bg-red-50'}
        />
      </div>

      {/* 2. Monthly Collection & Revenue by Fee Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <MonthlyBarChart monthly={data.monthly} />
        </div>
        <div>
          <FeeTypeBreakdown byFeeType={data.byFeeType} />
        </div>
      </div>

      {/* 3. Payment Methods & Expenses */}
      <PaymentMethodsAndExpenses
        byMethod={data.byMethod}
        expenseCategories={data.expenseCategories}
      />

      {/* 4. Student Outstanding Dues Ledger */}
      <StudentOutstandingDuesTable list={data.studentDuesList} />
    </div>
  )
}
