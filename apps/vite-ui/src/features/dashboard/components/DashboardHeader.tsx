import { useState, useEffect } from 'react'
import {
  Sparkles,
  Zap,
  Receipt,
  BellPlus,
  Calendar,
  Layers,
  GraduationCap,
  Scale,
  Users,
  Clock,
} from 'lucide-react'
import type { DashboardTab } from '../types'
import { format } from 'date-fns'

interface DashboardHeaderProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  onOpenQuickCollect: () => void
  onOpenAddExpense: () => void
  onOpenCreateNotice: () => void
}

export function DashboardHeader({
  activeTab,
  onTabChange,
  onOpenQuickCollect,
  onOpenAddExpense,
  onOpenCreateNotice,
}: DashboardHeaderProps) {
  const [timeStr, setTimeStr] = useState(() => format(new Date(), 'hh:mm:ss a'))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(format(new Date(), 'hh:mm:ss a'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentHour = new Date().getHours()
  let greeting = 'Good morning'
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon'
  else if (currentHour >= 17) greeting = 'Good evening'

  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy')

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All-in-One Overview', icon: Layers },
    { id: 'academic', label: 'Academic & Routine', icon: GraduationCap },
    { id: 'finance', label: 'Finance Radar', icon: Scale },
    { id: 'staff', label: 'Faculty & Attendance', icon: Users },
  ]

  return (
    <div className="space-y-4">
      {/* ── Top Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/10">
        {/* Background glow & decorative shapes */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting & Date */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/20">
                <Calendar size={13} className="text-emerald-300" />
                {todayFormatted}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/40 text-[11px] font-mono text-emerald-200 border border-emerald-400/30">
                <Clock size={12} />
                {timeStr}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-semibold border border-amber-300/30">
                <Sparkles size={11} />
                Session 2024-2025
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
              {greeting}, <span className="text-emerald-200">Administrator!</span>
            </h1>
            <p className="text-sm md:text-base text-emerald-100/90 font-normal leading-relaxed">
              Institutional Command Center • Live attendance, daily period schedule, fee collections, and staff duties in real-time.
            </p>
          </div>

          {/* Quick Action Buttons Hub */}
          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
            <button
              onClick={onOpenQuickCollect}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all duration-200 shadow-md shadow-amber-400/20 hover:scale-[1.02] cursor-pointer"
              title="Collect fees from student"
            >
              <Zap size={15} className="fill-zinc-950" />
              <span>Quick Collect Fee</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold border border-white/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              title="Record campus operational expense"
            >
              <Receipt size={14} className="text-rose-300" />
              <span>Record Expense</span>
            </button>

            <button
              onClick={onOpenCreateNotice}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold border border-white/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              title="Publish circular notice"
            >
              <BellPlus size={14} className="text-amber-300" />
              <span>Post Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Perspective Filter Tabs ── */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 hide-scrollbar">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-zinc-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Live Sync</span>
        </div>
      </div>
    </div>
  )
}
