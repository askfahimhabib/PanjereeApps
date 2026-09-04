import { Search, X, School, GraduationCap, Star, Users } from 'lucide-react'
import type { TeacherFilters as FiltersType } from '../useTeachers'
import type { Designation, Department, EmploymentStatus } from '../types'
import { DESIGNATION_LABELS, DEPARTMENT_LABELS } from '../types'

interface Props {
  filters: FiltersType
  updateFilter: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void
  resetFilters: () => void
  totalResults: number
  stats?: {
    total: number
    regular: number
    guest: number
    classTeachers: number
    active: number
  }
}

export function TeacherFilters({ filters, updateFilter, resetFilters, totalResults, stats }: Props) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.teacherCategory !== 'ALL' ||
    filters.employmentStatus !== 'ALL' ||
    filters.department !== 'ALL' ||
    filters.designation !== 'ALL'

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
      {/* ── Segmented Track Tabs ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl max-w-full overflow-x-auto flex-nowrap shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => updateFilter('teacherCategory', 'ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.teacherCategory === 'ALL'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users size={14} className={filters.teacherCategory === 'ALL' ? 'text-indigo-600' : 'text-zinc-400'} />
            <span>All Faculty</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-100 text-zinc-600">
                {stats.total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateFilter('teacherCategory', 'REGULAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.teacherCategory === 'REGULAR'
                ? 'bg-white text-blue-900 shadow-2xs ring-1 ring-blue-500/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <School size={14} className={filters.teacherCategory === 'REGULAR' ? 'text-blue-600' : 'text-zinc-400'} />
            <span>Regular Faculty</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700">
                {stats.regular}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateFilter('teacherCategory', 'GUEST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.teacherCategory === 'GUEST'
                ? 'bg-white text-purple-900 shadow-2xs ring-1 ring-purple-500/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <GraduationCap size={14} className={filters.teacherCategory === 'GUEST' ? 'text-purple-600' : 'text-zinc-400'} />
            <span>Guest Faculty</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-50 text-purple-700">
                {stats.guest}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateFilter('teacherCategory', 'CLASS_TEACHER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.teacherCategory === 'CLASS_TEACHER'
                ? 'bg-white text-amber-900 shadow-2xs ring-1 ring-amber-500/20'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Star size={14} className={filters.teacherCategory === 'CLASS_TEACHER' ? 'text-amber-500 fill-amber-400' : 'text-zinc-400'} />
            <span>Class Teachers</span>
            {stats && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700">
                {stats.classTeachers}
              </span>
            )}
          </button>
        </div>

        {/* Live Filter Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900 font-bold">{totalResults}</strong> teachers
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
            placeholder="Search name, ID, phone, designation..."
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

        {/* Designation Filter */}
        <select
          value={filters.designation}
          onChange={e => updateFilter('designation', e.target.value as Designation | 'ALL')}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
        >
          <option value="ALL">All Designations (সকল পদবী)</option>
          {Object.entries(DESIGNATION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Department / Subject Filter */}
        <select
          value={filters.department}
          onChange={e => updateFilter('department', e.target.value as Department | 'ALL')}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
        >
          <option value="ALL">All Subjects (সকল বিষয়)</option>
          {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.employmentStatus}
          onChange={e => updateFilter('employmentStatus', e.target.value as EmploymentStatus | 'ALL')}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
        >
          <option value="ALL">All Status (সকল স্ট্যাটাস)</option>
          <option value="ACTIVE">Active (নিয়মিত কর্মরত)</option>
          <option value="ON_LEAVE">On Leave (ছুটিতে)</option>
          <option value="INACTIVE">Inactive (অনিয়মিত)</option>
          <option value="RESIGNED">Resigned (অব্যাহতিপ্রাপ্ত)</option>
        </select>
      </div>
    </div>
  )
}
