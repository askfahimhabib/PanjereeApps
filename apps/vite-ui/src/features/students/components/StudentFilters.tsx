import { useMemo } from 'react'
import { Search, X, GraduationCap, BookOpen, Users } from 'lucide-react'
import { classStore, batchStore } from '@/data/stores'
import type { StudentFilters as FiltersType } from '../useStudents'
import type { StudentStatus } from '../types'

interface Props {
  filters: FiltersType
  updateFilter: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void
  resetFilters: () => void
  totalResults: number
  stats?: {
    total: number
    regular: number
    examBatch: number
  }
}

export function StudentFilters({ filters, updateFilter, resetFilters, totalResults, stats }: Props) {
  const classes = useMemo(() => classStore.getAll().filter(c => c.isActive ?? true), [])
  const batches = useMemo(() => batchStore.getAll(), [])

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.type !== 'ALL' ||
    Boolean(filters.classId) ||
    Boolean(filters.batchId) ||
    filters.feeStatus !== 'ALL' ||
    filters.status !== 'ALL'

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
      {/* ── Segmented Track Tabs ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl max-w-full overflow-x-auto flex-nowrap shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              updateFilter('type', 'ALL')
              updateFilter('classId', '')
              updateFilter('batchId', '')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              filters.type === 'ALL'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users size={14} className={filters.type === 'ALL' ? 'text-indigo-600' : 'text-zinc-400'} />
            <span>All Students</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-100 text-zinc-600">
                {stats.total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              updateFilter('type', 'REGULAR')
              updateFilter('batchId', '')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              filters.type === 'REGULAR'
                ? 'bg-white text-indigo-900 shadow-2xs ring-1 ring-indigo-500/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <GraduationCap size={14} className={filters.type === 'REGULAR' ? 'text-indigo-600' : 'text-zinc-400'} />
            <span>Regular School</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-700">
                {stats.regular}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              updateFilter('type', 'EXAM_BATCH')
              updateFilter('classId', '')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              filters.type === 'EXAM_BATCH'
                ? 'bg-white text-purple-900 shadow-2xs ring-1 ring-purple-500/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <BookOpen size={14} className={filters.type === 'EXAM_BATCH' ? 'text-purple-600' : 'text-zinc-400'} />
            <span>Exam Batches</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-50 text-purple-700">
                {stats.examBatch}
              </span>
            )}
          </button>
        </div>

        {/* Live Filter Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900 font-bold">{totalResults}</strong> students
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Controls Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
          <input
            type="text"
            placeholder="Search name, ID, roll, mobile..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Dynamic Class or Batch Filter */}
        {filters.type !== 'EXAM_BATCH' ? (
          <select
            value={filters.classId}
            onChange={e => updateFilter('classId', e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
          >
            <option value="">All Classes (সকল ক্লাস)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : (
          <select
            value={filters.batchId}
            onChange={e => updateFilter('batchId', e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors cursor-pointer"
          >
            <option value="">All Batches (সকল ব্যাচ)</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        {/* Fee Status Filter */}
        <select
          value={filters.feeStatus}
          onChange={e => updateFilter('feeStatus', e.target.value as FiltersType['feeStatus'])}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
        >
          <option value="ALL">All Fee Status (সব ফি স্ট্যাটাস)</option>
          <option value="PAID">Paid (পরিশোধিত)</option>
          <option value="DUE">Due (বকেয়া)</option>
          <option value="PARTIAL">Partial (আংশিক পরিশোধ)</option>
        </select>

        {/* Student Status */}
        <select
          value={filters.status}
          onChange={e => updateFilter('status', e.target.value as StudentStatus | 'ALL')}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
        >
          <option value="ALL">All Status (সকল শিক্ষার্থী)</option>
          <option value="ACTIVE">Active (নিয়মিত)</option>
          <option value="INACTIVE">Inactive (অনিয়মিত)</option>
          <option value="PASSED">Passed (উত্তীর্ণ)</option>
          <option value="LEFT">Left (ছাড়পত্র প্রাপ্ত)</option>
          <option value="SUSPENDED">Suspended (স্থগিত)</option>
        </select>
      </div>
    </div>
  )
}
