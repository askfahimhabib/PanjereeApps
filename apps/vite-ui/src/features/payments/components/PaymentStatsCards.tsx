import { TrendingUp, Wallet, AlertTriangle, Receipt } from 'lucide-react'
import type { PaymentStats } from '../hooks/usePayments'
import { formatCurrency } from '../types'

interface Props {
  stats: PaymentStats | undefined
  isLoading: boolean
}

export function PaymentStatsCards({ stats, isLoading }: Props) {
  const cards = [
    {
      label: 'Collected This Month',
      value: stats ? formatCurrency(stats.collectedThisMonth) : '৳ —',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10',
    },
    {
      label: 'Collected This Year',
      value: stats ? formatCurrency(stats.collectedThisYear) : '৳ —',
      icon: Receipt,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'shadow-blue-500/10',
    },
    {
      label: 'Outstanding Dues',
      value: stats ? `${stats.unpaidDuesCount} entries` : '—',
      sub: stats && stats.unpaidDuesAmount > 0 ? formatCurrency(stats.unpaidDuesAmount) : undefined,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'shadow-rose-500/10',
    },
    {
      label: 'Total Transactions',
      value: stats ? String(stats.totalTransactions) : '—',
      icon: Wallet,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      glow: 'shadow-purple-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative rounded-2xl border ${card.border} ${card.bg} p-5 shadow-lg ${card.glow} overflow-hidden`}
        >
          {/* Background decoration */}
          <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${card.bg} opacity-40`} />

          <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${card.bg} border ${card.border} mb-3`}>
            <card.icon size={18} className={card.color} />
          </div>

          {isLoading ? (
            <div className="h-7 w-24 rounded-md bg-zinc-100 animate-pulse mb-1" />
          ) : (
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          )}
          {card.sub && <p className="text-xs text-zinc-600 mt-0.5">{card.sub} total</p>}
          <p className="text-xs text-zinc-600 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
