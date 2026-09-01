import { BookOpen, Users, LayoutGrid, DollarSign, ArrowUpRight, History } from 'lucide-react'

interface StatsCardsProps {
  totalClasses: number
  totalStudents: number
  totalSections: number
  feeCollected: number
  onFeeCardClick?: () => void
}

export function StatsCards({
  totalClasses,
  totalStudents,
  totalSections,
  feeCollected,
  onFeeCardClick,
}: StatsCardsProps) {
  const formatMoney = (v: number) => {
    if (v === 0) return '৳ 0'
    if (v < 1000) return `৳ ${v.toLocaleString('en-BD')}`
    if (v < 100000) return `৳ ${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
    return `৳ ${(v / 100000).toFixed(1).replace(/\.0$/, '')}L`
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Classes */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Total Classes
          </p>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">{totalClasses}</p>
          <p className="text-xs text-zinc-500 font-medium mt-1">Active Curriculums</p>
        </div>
      </div>

      {/* Total Students */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Total Students
          </p>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Users size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">{totalStudents}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Enrolled Across Classes</p>
        </div>
      </div>

      {/* Total Sections */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-purple-200 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Total Sections
          </p>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <LayoutGrid size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">{totalSections}</p>
          <p className="text-xs text-purple-600 font-semibold mt-1">Classroom Groups</p>
        </div>
      </div>

      {/* Collected This Month */}
      <div
        onClick={onFeeCardClick}
        className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Fee This Month
          </p>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">{formatMoney(feeCollected)}</p>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
            <History size={12} />
            <span>View Fee Structure</span>
            <ArrowUpRight size={12} />
          </div>
        </div>
      </div>
    </div>
  )
}
