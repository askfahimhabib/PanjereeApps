import { Link } from 'react-router-dom'
import {
  Wallet,
  Scale,
  Zap,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import type { DashboardKpis, DueStudentSummary } from '../types'
import type { Student } from '@/features/students/types'

interface WidgetFinanceRadarProps {
  kpis: DashboardKpis
  topDueStudents: DueStudentSummary[]
  onCollectStudent: (student: Student) => void
  onOpenQuickCollect: () => void
}

export function WidgetFinanceRadar({
  kpis,
  topDueStudents,
  onCollectStudent,
  onOpenQuickCollect,
}: WidgetFinanceRadarProps) {
  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Finance & Fee Radar</h2>
              <p className="text-[11px] text-zinc-400">Monthly billing, expenses & student dues</p>
            </div>
          </div>

          <Link
            to="/finance"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            <span>Overview</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Financial Flow Summary Rows */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Fee Inflow</span>
              <TrendingUp size={13} className="text-emerald-600" />
            </div>
            <p className="text-base font-extrabold text-emerald-900 mt-1">
              ৳{kpis.collectedThisMonth.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {kpis.collectionRate}% of target billed
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Outflow</span>
              <TrendingDown size={13} className="text-rose-600" />
            </div>
            <p className="text-base font-extrabold text-rose-900 mt-1">
              ৳{(kpis.expensesThisMonth + kpis.salaryPaidThisMonth).toLocaleString()}
            </p>
            <p className="text-[10px] text-rose-700 font-medium mt-0.5">
              Expenses + Salaries
            </p>
          </div>
        </div>

        {/* Top Overdue Defaulters Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-rose-500" />
              <span>Top Overdue Students ({topDueStudents.length})</span>
            </h3>
            <Link
              to="/payments"
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              See All
            </Link>
          </div>

          {topDueStudents.length === 0 ? (
            <div className="py-6 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
              <p className="text-xs font-semibold text-emerald-700">No overdue dues!</p>
              <p className="text-[11px] text-zinc-400">All student accounts are up to date.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 hide-scrollbar">
              {topDueStudents.map(item => (
                <div
                  key={item.student.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {item.student.fullNameEn}
                      </p>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded shrink-0">
                        {item.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                      Roll: {item.student.rollNumber || '—'} {item.phone ? `• ${item.phone}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-rose-600">
                        ৳{item.totalDue.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-semibold text-zinc-400 uppercase">
                        Pending Due
                      </span>
                    </div>

                    <button
                      onClick={() => onCollectStudent(item.student)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
                      title={`Collect fee from ${item.student.fullNameEn}`}
                    >
                      <Zap size={11} />
                      <span>Collect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
        <button
          onClick={onOpenQuickCollect}
          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Wallet size={13} />
          <span>New Fee Collection</span>
        </button>

        <Link
          to="/salary"
          className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold text-center transition-colors"
        >
          Teacher Salaries
        </Link>
      </div>
    </div>
  )
}
