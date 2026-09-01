import { useState } from 'react'
import type { MonthlyFinancialSummary } from '../types'
import { formatCurrency } from '@/features/payments/types'
import { BarChart3, TrendingUp } from 'lucide-react'

interface FinanceComparisonChartProps {
  yearlyData: MonthlyFinancialSummary[]
  activeMonth: number
  year: number
  onSelectMonth?: (month: number) => void
}

export function FinanceComparisonChart({
  yearlyData,
  activeMonth,
  year,
  onSelectMonth,
}: FinanceComparisonChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyFinancialSummary | null>(null)

  // Find max value for scaling
  const maxVal = Math.max(
    ...yearlyData.map(d => Math.max(d.totalIncome, d.totalExpense, 10000)),
    50000
  )

  const chartHeight = 220

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <BarChart3 size={18} />
            </div>
            <h2 className="text-base font-bold text-zinc-900">
              Income vs. Expenditure Trend ({year})
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 ml-8">
            Monthly cash flow, teacher salaries, and operational costs breakdown
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-200" />
            <span>Total Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500 shadow-sm shadow-indigo-200" />
            <span>Teacher Salaries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-400 shadow-sm shadow-amber-200" />
            <span>Operational Bills</span>
          </div>
        </div>
      </div>

      {/* Chart Graphic Area */}
      <div className="relative pt-4 pb-2">
        {/* Hover Tooltip Box */}
        {hoveredMonth && (
          <div className="absolute top-0 right-4 z-20 bg-zinc-900 text-white rounded-xl px-4 py-2.5 shadow-xl border border-zinc-700 text-xs flex items-center gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400">
                {hoveredMonth.monthName} {hoveredMonth.year}
              </p>
              <p className="font-bold text-emerald-400 text-sm">
                Income: {formatCurrency(hoveredMonth.totalIncome)}
              </p>
            </div>
            <div className="border-l border-zinc-700 pl-3 space-y-0.5">
              <p className="text-indigo-300">
                Salary: {formatCurrency(hoveredMonth.salaryExpense)}
              </p>
              <p className="text-amber-300">
                Bills: {formatCurrency(hoveredMonth.operationalExpense)}
              </p>
              <p className={`font-semibold ${hoveredMonth.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Net: {hoveredMonth.netProfit >= 0 ? '+' : ''}{formatCurrency(hoveredMonth.netProfit)}
              </p>
            </div>
          </div>
        )}

        {/* Background Gridlines */}
        <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <div key={ratio} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">
                ৳{Math.round((maxVal * ratio) / 1000)}k
              </span>
              <div className="flex-1 border-b border-dashed border-zinc-200" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="ml-12 grid grid-cols-12 gap-1.5 sm:gap-3 items-end relative z-10" style={{ height: `${chartHeight}px` }}>
          {yearlyData.map((d) => {
            const incomeHeight = (d.totalIncome / maxVal) * (chartHeight - 30)
            const salaryHeight = (d.salaryExpense / maxVal) * (chartHeight - 30)
            const opExpHeight = (d.operationalExpense / maxVal) * (chartHeight - 30)
            const isCurrentSelected = d.month === activeMonth

            return (
              <div
                key={d.month}
                onMouseEnter={() => setHoveredMonth(d)}
                onMouseLeave={() => setHoveredMonth(null)}
                onClick={() => onSelectMonth?.(d.month)}
                className={`group flex flex-col items-center justify-end h-full cursor-pointer transition-all ${
                  isCurrentSelected ? 'scale-105' : 'hover:opacity-95'
                }`}
              >
                {/* Visual Bars Column */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                  {/* Income Bar (Green) */}
                  <div
                    style={{ height: `${Math.max(incomeHeight, 4)}px` }}
                    className={`w-1/2 rounded-t-md transition-all duration-300 ${
                      isCurrentSelected
                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                        : 'bg-emerald-400 group-hover:bg-emerald-500'
                    }`}
                  />

                  {/* Stacked Expenditure Bar (Salary + Op Expense) */}
                  <div className="w-1/2 flex flex-col justify-end">
                    {/* Operational expense (top portion) */}
                    {opExpHeight > 0 && (
                      <div
                        style={{ height: `${Math.max(opExpHeight, 2)}px` }}
                        className="w-full bg-amber-400 rounded-t-md group-hover:bg-amber-500 transition-colors"
                      />
                    )}
                    {/* Salary expense (bottom portion) */}
                    <div
                      style={{ height: `${Math.max(salaryHeight, 4)}px` }}
                      className={`w-full transition-all duration-300 ${
                        opExpHeight > 0 ? '' : 'rounded-t-md'
                      } ${
                        isCurrentSelected
                          ? 'bg-indigo-600 shadow-md shadow-indigo-600/30'
                          : 'bg-indigo-500 group-hover:bg-indigo-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Month Label */}
                <div className="pt-2 text-center w-full border-t border-zinc-100">
                  <span
                    className={`text-[11px] font-semibold block transition-colors ${
                      isCurrentSelected
                        ? 'text-emerald-700 font-bold underline underline-offset-4 decoration-2 decoration-emerald-500'
                        : 'text-zinc-500 group-hover:text-zinc-800'
                    }`}
                  >
                    {d.monthName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart Footer summary */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <TrendingUp size={13} className="text-emerald-600" />
          Click on any month to view its detailed breakdown and transactions
        </span>
        <span className="font-mono text-zinc-600">
          Showing 12-month financial distribution
        </span>
      </div>
    </div>
  )
}
