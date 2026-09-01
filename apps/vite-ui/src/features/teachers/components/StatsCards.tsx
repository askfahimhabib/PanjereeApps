import { Users, School, GraduationCap, Star, TrendingUp } from 'lucide-react'

interface Stats {
  total: number
  regular: number
  guest: number
  classTeachers: number
  active: number
}

interface Props {
  stats: Stats
}

export function StatsCards({ stats }: Props) {
  const regularPct = stats.total > 0 ? Math.round((stats.regular / stats.total) * 100) : 0
  const guestPct = stats.total > 0 ? Math.round((stats.guest / stats.total) * 100) : 0
  const ctPct = stats.total > 0 ? Math.round((stats.classTeachers / stats.total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Faculty */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Total Faculty
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {stats.total}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 group-hover:scale-105 transition-transform">
            <Users size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1 font-medium text-indigo-600">
            <TrendingUp size={12} /> Total Teaching Staff
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">100%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: '100%' }} />
        </div>
      </div>

      {/* 2. Regular Faculty */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Regular Staff
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {stats.regular}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 group-hover:scale-105 transition-transform">
            <School size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
            {regularPct}% share
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{stats.regular} of {stats.total}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${regularPct}%` }} />
        </div>
      </div>

      {/* 3. Guest Faculty */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Guest Faculty
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {stats.guest}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 group-hover:scale-105 transition-transform">
            <GraduationCap size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/60">
            {guestPct}% share
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{stats.guest} of {stats.total}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${guestPct}%` }} />
        </div>
      </div>

      {/* 4. Class Teachers */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Class Teachers
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {stats.classTeachers}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 group-hover:scale-105 transition-transform">
            <Star size={20} className="fill-amber-400 text-amber-500" />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
            {ctPct}% assigned
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{stats.classTeachers} teachers</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${ctPct}%` }} />
        </div>
      </div>
    </div>
  )
}
