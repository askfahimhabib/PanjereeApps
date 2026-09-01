import { PieChart } from 'lucide-react'
import type { CategoryBreakdownItem } from '../hooks/useFinance'
import { formatCurrency } from '@/features/payments/types'

interface ExpenseBreakdownChartProps {
  breakdown: CategoryBreakdownItem[]
  totalExpense: number
  monthName: string
  year: number
}

const CATEGORY_COLORS = [
  'bg-indigo-500',
  'bg-amber-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-orange-500',
]

export function ExpenseBreakdownChart({
  breakdown,
  totalExpense,
  monthName,
  year,
}: ExpenseBreakdownChartProps) {
  if (breakdown.length === 0 || totalExpense === 0) {
    return (
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center py-10">
        <PieChart size={36} className="text-zinc-300 mb-2" />
        <p className="text-sm font-semibold text-zinc-700">No Expenses Recorded</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          No salary or operational expenses for {monthName} {year}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <PieChart size={18} className="text-rose-500" />
            Expense Breakdown
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Spending distribution for {monthName} {year}
          </p>
        </div>
        <span className="text-sm font-extrabold text-zinc-900 font-mono">
          {formatCurrency(totalExpense)}
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-zinc-100 p-0.5 gap-0.5 shadow-inner">
        {breakdown.map((item, idx) => (
          <div
            key={item.category}
            style={{ width: `${Math.max(item.percentage, 2)}%` }}
            className={`h-full rounded-sm ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} transition-all duration-300`}
            title={`${item.category}: ${formatCurrency(item.amount)} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-2.5 pt-1">
        {breakdown.map((item, idx) => (
          <div key={item.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} shrink-0`} />
              <span className="text-zinc-700 font-medium truncate">{item.category}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-semibold text-zinc-900 font-mono">{formatCurrency(item.amount)}</span>
              <span className="text-zinc-400 font-medium w-8 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
