import { useState } from 'react'
import {
  Scale,
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinanceOverview, useDeleteFinanceTransaction } from '@/features/finance/hooks/useFinance'
import { FinanceStatsCards } from '@/features/finance/components/FinanceStatsCards'
import { FinanceComparisonChart } from '@/features/finance/components/FinanceComparisonChart'
import { ExpenseBreakdownChart } from '@/features/finance/components/ExpenseBreakdownChart'
import { TransactionHistoryTable } from '@/features/finance/components/TransactionHistoryTable'
import { AddExpenseModal } from '@/features/finance/components/AddExpenseModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import { MONTH_NAMES } from '@/features/payments/types'

export function FinanceOverview() {
  const navigate = useNavigate()
  const now = new Date()
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [year, setYear] = useState<number>(now.getFullYear())
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly')

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [collectFeeModalOpen, setCollectFeeModalOpen] = useState(false)

  const { data, isLoading } = useFinanceOverview(month, year)
  const deleteTx = useDeleteFinanceTransaction()

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

  const stats = data?.stats
  const yearlySeries = data?.yearlySeries ?? []
  const expenseBreakdown = data?.expenseBreakdown ?? []
  const annualTotals = data?.annualTotals

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Finance & Accounting</h1>
          <p className="text-zinc-500 mt-1 text-sm flex items-center gap-1.5">
            <Scale size={14} className="text-emerald-600" />
            Central financial overview • Income, teacher salaries, operational expenses & cash flow
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={14} />
            Print Statement
          </button>

          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <ArrowUpRight size={14} />
            + Record Expense
          </button>

          <button
            onClick={() => setCollectFeeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus size={15} />
            + Collect Fee
          </button>
        </div>
      </div>

      {/* ── Month Selector & Period Toggle ─────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-36">
              <p className="font-bold text-zinc-900 text-base leading-tight">
                {viewMode === 'annual' ? `${year} Annual` : MONTH_NAMES[month - 1]}
              </p>
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

          <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Monthly Cycle
            </button>
            <button
              onClick={() => setViewMode('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'annual'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Yearly Summary
            </button>
          </div>
        </div>

        {/* Shortcut links */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <button
            onClick={() => navigate('/payments')}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            💳 Student Fees
          </button>
          <button
            onClick={() => navigate('/salary')}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            💰 Teacher Salaries
          </button>
          <button
            onClick={() => navigate('/finance/expenses')}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            🧾 All Expenses
          </button>
        </div>
      </div>

      {/* ── Key Metrics Cards ─────────────────────────────────── */}
      <FinanceStatsCards
        stats={
          viewMode === 'annual' && annualTotals
            ? {
                totalIncome: annualTotals.annualIncome,
                totalExpense: annualTotals.annualExpense,
                totalSalaryPaid: annualTotals.annualSalary,
                totalOperationalExpense: annualTotals.annualOpExp,
                netBalance: annualTotals.annualNetProfit,
                pendingStudentDues: stats?.pendingStudentDues ?? 0,
                pendingSalaryPayable: stats?.pendingSalaryPayable ?? 0,
                transactionCount: stats?.transactionCount ?? 0,
                incomeGrowthPct: 0,
                expenseGrowthPct: 0,
              }
            : stats
        }
        isLoading={isLoading}
        monthName={MONTH_NAMES[month - 1]}
        year={year}
        isAnnual={viewMode === 'annual'}
      />

      {/* ── Interactive Charts Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinanceComparisonChart
            yearlyData={yearlySeries}
            activeMonth={month}
            year={year}
            onSelectMonth={(m) => {
              setMonth(m)
              setViewMode('monthly')
            }}
          />
        </div>

        <div className="lg:col-span-1">
          <ExpenseBreakdownChart
            breakdown={expenseBreakdown}
            totalExpense={stats?.totalExpense ?? 0}
            monthName={MONTH_NAMES[month - 1]}
            year={year}
          />
        </div>
      </div>

      {/* ── Unified Transaction History ───────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
              Unified Transaction Ledger
            </h2>
            <p className="text-xs text-zinc-500">
              Real-time audit log of fee collections, teacher salary payouts, and operational expenses
            </p>
          </div>
        </div>

        <TransactionHistoryTable
          transactions={data?.monthTxs ?? []}
          isLoading={isLoading}
          onDelete={(id) => deleteTx.mutate(id)}
        />
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />

      <QuickCollectModal
        open={collectFeeModalOpen}
        onClose={() => setCollectFeeModalOpen(false)}
      />
    </div>
  )
}
