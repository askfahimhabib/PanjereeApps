import { Search, X } from 'lucide-react'
import { classStore } from '@/data/stores'
import type { StudentFilters } from '../useStudents'
import type { StudentType, StudentStatus } from '../types'

const MOCK_CLASSES = classStore.getAll()

interface Props {
  filters: StudentFilters
  updateFilter: <K extends keyof StudentFilters>(key: K, value: StudentFilters[K]) => void
  resetFilters: () => void
  totalResults: number
}

const inputCls = 'bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 transition-colors'

export function StudentFilters({ filters, updateFilter, resetFilters, totalResults }: Props) {
  const hasActiveFilters =
    filters.search || filters.type !== 'ALL' || filters.classId || filters.status !== 'ALL'

  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input
            type="text"
            placeholder="Search by name, ID, roll, mobile..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className={`${inputCls} pl-9 w-full`}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-800"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <select
          value={filters.type}
          onChange={e => updateFilter('type', e.target.value as StudentType | 'ALL')}
          className={inputCls}
        >
          <option value="ALL">All Types</option>
          <option value="REGULAR">Regular Student</option>
          <option value="EXAM_BATCH">Exam Batch</option>
        </select>

        {/* Class filter — only for regular type */}
        {filters.type !== 'EXAM_BATCH' && (
          <select
            value={filters.classId}
            onChange={e => updateFilter('classId', e.target.value)}
            className={inputCls}
          >
            <option value="">All Classes</option>
            {MOCK_CLASSES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={e => updateFilter('status', e.target.value as StudentStatus | 'ALL')}
          className={inputCls}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PASSED">Passed</option>
          <option value="LEFT">Left</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-zinc-600">
        Showing <span className="text-zinc-800 font-medium">{totalResults}</span> student{totalResults !== 1 ? 's' : ''}
        {hasActiveFilters && ' matching your filters'}
      </p>
    </div>
  )
}
