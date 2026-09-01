import { useState } from 'react'
import {
  Coins,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useDailyCashRegister } from '../hooks/useBillingAndWaivers'
import { formatCurrency } from '../types'

export function DailyCashRegisterCard() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const { data: register } = useDailyCashRegister(selectedDate)

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const total = register?.totalCollected ?? 0
  const cash = register?.cashCollected ?? 0
  const bkash = register?.bkashCollected ?? 0
  const nagad = register?.nagadCollected ?? 0
  const bank = register?.bankCollected ?? 0

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Coins size={18} className="text-amber-500" />
            Daily Cash Counter & Closing Register
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit log of cash in drawer, mobile wallet payments & bank collections
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl p-1">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-zinc-800 focus:outline-none px-1 cursor-pointer"
          />
          <button
            onClick={handleNextDay}
            className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Breakdown KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Total Day Collection
          </span>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatCurrency(total)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {register?.transactionCount ?? 0} receipts issued
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
            💵 Cash In Drawer
          </span>
          <p className="text-xl font-extrabold text-zinc-900 font-mono mt-1">
            {formatCurrency(cash)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Physical currency</p>
        </div>

        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-pink-800 uppercase tracking-wider flex items-center gap-1">
            📱 bKash / Nagad
          </span>
          <p className="text-xl font-extrabold text-pink-700 font-mono mt-1">
            {formatCurrency(bkash + nagad)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Mobile wallets</p>
        </div>

        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
            🏦 Bank Transfer
          </span>
          <p className="text-xl font-extrabold text-blue-700 font-mono mt-1">
            {formatCurrency(bank)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Direct deposit</p>
        </div>
      </div>

      {/* Class-wise Breakdown Pills */}
      {register && register.classBreakdown.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 space-y-2">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Class-wise Collection Distribution ({selectedDate})
          </p>
          <div className="flex flex-wrap gap-2">
            {register.classBreakdown.map((cb) => (
              <div
                key={cb.class_name}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-center gap-2"
              >
                <span className="font-bold text-zinc-800">{cb.class_name}</span>
                <span className="font-mono font-extrabold text-emerald-700">{formatCurrency(cb.amount)}</span>
                <span className="text-[10px] text-zinc-400">({cb.count} txs)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
