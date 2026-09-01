import {
  TrendingUp,
  Coins,
  AlertTriangle,
  Award,
  ChevronRight,
} from 'lucide-react'
import type { PaymentStats } from '../hooks/usePayments'
import { formatCurrency } from '../types'
import { useDailyCashRegister, useStudentWaivers } from '../hooks/useBillingAndWaivers'

interface Props {
  stats: PaymentStats | undefined
  isLoading: boolean
  activeTab?: string
  onSelectTab?: (tab: 'transactions' | 'cash_register' | 'ledgers' | 'dues' | 'waivers' | 'structures') => void
}

export function PaymentStatsCards({ stats, isLoading, onSelectTab }: Props) {
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: todayRegister } = useDailyCashRegister(todayStr)
  const { data: waivers = [] } = useStudentWaivers()

  const todayTotal = todayRegister?.totalCollected ?? 0
  const todayCash = todayRegister?.cashCollected ?? 0
  const unpaidCount = stats?.unpaidDuesCount ?? 0
  const unpaidAmount = stats?.unpaidDuesAmount ?? 0
  const monthCollected = stats?.collectedThisMonth ?? 0
  const activeWaiversCount = waivers.filter(w => w.is_active).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* KPI 1: Today's Collection & Drawer */}
      <div
        onClick={() => onSelectTab?.('cash_register')}
        className="group relative bg-white hover:bg-emerald-50/40 border border-zinc-200/90 hover:border-emerald-300 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Coins size={19} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Today's Collection</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {isLoading ? (
              <div className="h-5 w-20 bg-zinc-100 animate-pulse rounded mt-0.5" />
            ) : (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-extrabold text-zinc-900 font-mono">
                  {formatCurrency(todayTotal)}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  (Cash: {formatCurrency(todayCash)})
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={15} className="text-zinc-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* KPI 2: Outstanding Dues & Defaulters */}
      <div
        onClick={() => onSelectTab?.('dues')}
        className="group relative bg-white hover:bg-rose-50/40 border border-zinc-200/90 hover:border-rose-300 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle size={19} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Unpaid Dues Balance</span>
            {isLoading ? (
              <div className="h-5 w-20 bg-zinc-100 animate-pulse rounded mt-0.5" />
            ) : (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-extrabold text-rose-600 font-mono">
                  {formatCurrency(unpaidAmount)}
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {unpaidCount} Defaulters
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={15} className="text-zinc-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* KPI 3: This Month's Income */}
      <div
        onClick={() => onSelectTab?.('transactions')}
        className="group relative bg-white hover:bg-indigo-50/40 border border-zinc-200/90 hover:border-indigo-300 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp size={19} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Month Collection</span>
            {isLoading ? (
              <div className="h-5 w-20 bg-zinc-100 animate-pulse rounded mt-0.5" />
            ) : (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-extrabold text-zinc-900 font-mono">
                  {formatCurrency(monthCollected)}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  ({stats?.totalTransactions ?? 0} txs)
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={15} className="text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* KPI 4: Active Scholarships & Waivers */}
      <div
        onClick={() => onSelectTab?.('waivers')}
        className="group relative bg-white hover:bg-purple-50/40 border border-zinc-200/90 hover:border-purple-300 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award size={19} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Active Waivers</span>
            {isLoading ? (
              <div className="h-5 w-20 bg-zinc-100 animate-pulse rounded mt-0.5" />
            ) : (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-extrabold text-purple-700 font-mono">
                  {activeWaiversCount} Students
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  Scholarships
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={15} className="text-zinc-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  )
}
