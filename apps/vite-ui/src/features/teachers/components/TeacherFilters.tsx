import { Search, X, SlidersHorizontal } from 'lucide-react'
import type { TeacherFilters, EmploymentType, EmploymentStatus, Department, Designation, TeacherCategory } from '../types'
import {
  DESIGNATION_LABELS, DEPARTMENT_LABELS, EMPLOYMENT_TYPE_LABELS, STATUS_LABELS
} from '../types'

interface Props {
  filters: TeacherFilters
  onUpdate: <K extends keyof TeacherFilters>(key: K, value: TeacherFilters[K]) => void
  onReset: () => void
  total: number
  filtered: number
}

const selectCls = 'bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 transition-colors'

const CATEGORIES: [TeacherCategory, string, string][] = [
  ['REGULAR', 'Regular',      'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'],
  ['GUEST',   'Guest Teacher','bg-violet-500/10 text-violet-300 border-violet-500/30'],
]

export function TeacherFiltersBar({ filters, onUpdate, onReset, total, filtered }: Props) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.teacherCategory !== 'ALL' ||
    filters.employmentType !== 'ALL' ||
    filters.employmentStatus !== 'ALL' ||
    filters.department !== 'ALL' ||
    filters.designation !== 'ALL'

  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 space-y-3">
      {/* ── Category Toggle Tabs ──────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate('teacherCategory', 'ALL')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            filters.teacherCategory === 'ALL'
              ? 'bg-white shadow-sm border-zinc-100 text-zinc-900'
              : 'bg-transparent border-zinc-100 text-zinc-600 hover:border-zinc-100'
          }`}
        >
          All ({total})
        </button>
        {CATEGORIES.map(([key, label, colorCls]) => (
          <button
            key={key}
            onClick={() => onUpdate('teacherCategory', key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              filters.teacherCategory === key
                ? colorCls
                : 'bg-transparent border-zinc-100 text-zinc-600 hover:border-zinc-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Search + Dropdowns ───────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input
            type="text"
            placeholder="Name, ID, phone, email..."
            value={filters.search}
            onChange={e => onUpdate('search', e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 pl-9 pr-4 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <select
          value={filters.employmentType}
          onChange={e => onUpdate('employmentType', e.target.value as EmploymentType | 'ALL')}
          className={selectCls}
        >
          <option value="ALL">All Types</option>
          {(Object.entries(EMPLOYMENT_TYPE_LABELS) as [EmploymentType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={filters.employmentStatus}
          onChange={e => onUpdate('employmentStatus', e.target.value as EmploymentStatus | 'ALL')}
          className={selectCls}
        >
          <option value="ALL">All Status</option>
          {(Object.entries(STATUS_LABELS) as [EmploymentStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={filters.department}
          onChange={e => onUpdate('department', e.target.value as Department | 'ALL')}
          className={selectCls}
        >
          <option value="ALL">All Departments</option>
          {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={filters.designation}
          onChange={e => onUpdate('designation', e.target.value as Designation | 'ALL')}
          className={selectCls}
        >
          <option value="ALL">All Designations</option>
          {(Object.entries(DESIGNATION_LABELS) as [Designation, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <X size={14} /> Reset
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <SlidersHorizontal size={12} />
        <span>
          Showing <span className="text-zinc-800 font-medium">{filtered}</span> of{' '}
          <span className="text-zinc-800 font-medium">{total}</span> teachers
        </span>
      </div>
    </div>
  )
}
