import { Users, GraduationCap, BookOpen, UserCheck, TrendingUp } from 'lucide-react'

interface Props {
  total: number
  regular: number
  examBatch: number
  active: number
}

export function StatsCards({ total, regular, examBatch, active }: Props) {
  const regularPct = total > 0 ? Math.round((regular / total) * 100) : 0
  const examPct = total > 0 ? Math.round((examBatch / total) * 100) : 0
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Students */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Total Students
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {total}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 group-hover:scale-105 transition-transform">
            <Users size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1 font-medium text-blue-600">
            <TrendingUp size={12} /> Total Enrolled
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">100%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: '100%' }} />
        </div>
      </div>

      {/* 2. Regular Students */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Regular Students
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {regular}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 group-hover:scale-105 transition-transform">
            <GraduationCap size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
            {regularPct}% share
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{regular} of {total}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${regularPct}%` }} />
        </div>
      </div>

      {/* 3. Exam Batch */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Exam Batch
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {examBatch}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 group-hover:scale-105 transition-transform">
            <BookOpen size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/60">
            {examPct}% share
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{examBatch} of {total}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${examPct}%` }} />
        </div>
      </div>

      {/* 4. Active Students */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Active Students
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {active}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 group-hover:scale-105 transition-transform">
            <UserCheck size={20} />
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activePct}% active
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{active} of {total}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${activePct}%` }} />
        </div>
      </div>
    </div>
  )
}
