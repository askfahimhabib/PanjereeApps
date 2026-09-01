import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Clock,
} from 'lucide-react'
import type { FinanceOverviewStats } from '../types'
import { formatCurrency } from '@/features/payments/types'

interface FinanceStatsCardsProps {
  stats?: FinanceOverviewStats
  isLoading?: boolean
  monthName: string
  year: number
  isAnnual?: boolean
}

export function FinanceStatsCards({
  stats,
  isLoading,
  monthName,
  year,
  isAnnual = false,
}: FinanceStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-zinc-100 p-5 animate-pulse shadow-sm" />
        ))}
      </div>
    )
  }

  const isNetPositive = stats.netBalance >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ── Total Income ─────────────────────────────────── */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full blur-xl group-hover:bg-emerald-100/70 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Income</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <ArrowDownRight size={18} />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-zinc-900 tracking-tight font-mono">
          {formatCurrency(stats.totalIncome)}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
          <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md text-[11px]">
            <TrendingUp size={11} className="mr-0.5" />
            {isAnnual ? `${year} Total` : `${monthName} Collections`}
          </span>
          <span className="text-zinc-400">• Student fees & receipts</span>
        </div>
      </div>

      {/* ── Total Expenditure ────────────────────────────── */}
      <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-50 rounded-full blur-xl group-hover:bg-rose-100/70 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Total Spent</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-zinc-900 tracking-tight font-mono">
          {formatCurrency(stats.totalExpense)}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
          <span className="text-indigo-600 font-medium">
            Salaries: {formatCurrency(stats.totalSalaryPaid)}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-amber-600 font-medium">
            Bills: {formatCurrency(stats.totalOperationalExpense)}
          </span>
        </div>
      </div>

      {/* ── Net Balance / Profit ─────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-xl transition-colors pointer-events-none ${
          isNetPositive ? 'bg-emerald-50/60' : 'bg-rose-50/60'
        }`} />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Net Cash Flow</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isNetPositive
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <Scale size={18} />
          </div>
        </div>
        <p className={`text-2xl font-extrabold tracking-tight font-mono ${
          isNetPositive ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {isNetPositive ? '+' : ''}{formatCurrency(stats.netBalance)}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${
            isNetPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {isNetPositive ? 'Surplus Balance' : 'Deficit Period'}
          </span>
          <span className="text-zinc-400">Income minus expenses</span>
        </div>
      </div>

      {/* ── Pending Dues & Payables ──────────────────────── */}
      <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full blur-xl group-hover:bg-amber-100/70 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending & Payables</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-zinc-900 tracking-tight font-mono">
          {formatCurrency(stats.pendingStudentDues + stats.pendingSalaryPayable)}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-amber-700 font-medium" title="Uncollected Student Fees">
            Due Fees: {formatCurrency(stats.pendingStudentDues)}
          </span>
          <span className="text-purple-700 font-medium" title="Unpaid Teacher Salaries">
            Due Salary: {formatCurrency(stats.pendingSalaryPayable)}
          </span>
        </div>
      </div>
    </div>
  )
}
