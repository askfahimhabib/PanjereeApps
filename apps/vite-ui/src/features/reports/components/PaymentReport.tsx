import { Wallet, TrendingUp, Receipt, CreditCard } from 'lucide-react'
import type { PaymentSummary } from '../types'
import { formatCurrency } from '../../payments/types'

interface Props {
  data: PaymentSummary
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-current/10 ${color}`}>
        <Icon size={16} className="opacity-80" />
      </div>
      <div>
        <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
        <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function MonthlyBarChart({ monthly }: { monthly: PaymentSummary['monthly'] }) {
  const maxTotal = Math.max(...monthly.map(m => m.total), 1)

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Monthly Collection (2024)</h4>
      <div className="flex items-end gap-2 h-40">
        {monthly.map((m, i) => {
          const heightPct = Math.round((m.total / maxTotal) * 100)
          return (
            <div key={i} className="group flex-1 flex flex-col items-center gap-1.5 relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-100 border border-zinc-100 text-[10px] text-zinc-800 rounded-lg px-2.5 py-2 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <p className="font-semibold text-emerald-400">{formatCurrency(m.total)}</p>
                <p className="text-zinc-600">{m.count} transactions</p>
              </div>
              {/* Bar */}
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-700 hover:from-emerald-500 hover:to-emerald-300"
                style={{ height: `${heightPct}%`, minHeight: '4px' }}
              />
              {/* Label */}
              <span className="text-[9px] text-zinc-600">{m.monthName}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeeTypeBreakdown({ byFeeType }: { byFeeType: PaymentSummary['byFeeType'] }) {
  const total = byFeeType.reduce((s, f) => s + f.total, 0)
  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500']

  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Revenue by Fee Type</h4>
      </div>

      {/* Stacked pill bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex h-3 rounded-full overflow-hidden gap-px">
          {byFeeType.map((f, i) => {
            const pct = Math.round((f.total / total) * 100)
            return (
              <div
                key={i}
                className={`${colors[i % colors.length]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${f.label}: ${pct}%`}
              />
            )
          })}
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {byFeeType.map((f, i) => {
          const pct = Math.round((f.total / total) * 100)
          return (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                <span className="text-sm text-zinc-800">{f.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-800">{formatCurrency(f.total)}</p>
                <p className="text-[10px] text-zinc-600">{pct}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PaymentReport({ data }: Props) {
  const methodLabel: Record<string, string> = {
    CASH: 'Cash', BKASH: 'bKash', NAGAD: 'Nagad', BANK: 'Bank', OTHER: 'Other',
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Total Collected" value={formatCurrency(data.totalCollected)} color="text-emerald-400" />
        <StatCard icon={Receipt} label="Transactions" value={data.totalTransactions.toString()} color="text-blue-400" />
        <StatCard icon={TrendingUp} label="Avg per Transaction" value={formatCurrency(data.avgPerTransaction)} color="text-purple-400" />
        <StatCard icon={CreditCard} label="Top Method" value={methodLabel[data.topMethod] ?? data.topMethod} color="text-amber-400" />
      </div>

      {/* Monthly Chart */}
      <MonthlyBarChart monthly={data.monthly} />

      {/* Fee type breakdown */}
      <FeeTypeBreakdown byFeeType={data.byFeeType} />
    </div>
  )
}
