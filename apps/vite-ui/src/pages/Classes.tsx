import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  GraduationCap,
  Layers,
} from 'lucide-react'
import { StatsCards } from '../features/classes/components/StatsCards'
import { ClassGrid } from '../features/classes/components/ClassGrid'
import { AddClassModal } from '../features/classes/components/modals/AddClassModal'
import { FeeHistoryModal } from '../features/classes/components/modals/FeeHistoryModal'
import { useClasses } from '../features/classes/useClasses'

export function Classes() {
  const { classes, stats, addClass, toggleClassActive } = useClasses()
  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const [isFeeHistoryOpen, setIsFeeHistoryOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [shiftFilter, setShiftFilter] = useState<string>('ALL')

  const activeClasses = classes.filter(c => c.isActive)
  const inactiveCount = classes.filter(c => !c.isActive).length
  const baseList = showAll ? classes : activeClasses

  // Filter by search & shift
  const displayClasses = useMemo(() => {
    return baseList.filter(cls => {
      const matchesSearch =
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.academicYear.includes(searchTerm)

      if (!matchesSearch) return false
      if (shiftFilter !== 'ALL' && cls.shift !== shiftFilter) return false
      return true
    })
  }, [baseList, searchTerm, shiftFilter])

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Classes & Curriculums
            </h1>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Session {classes[0]?.academicYear ?? new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Academic structure, section allocations, student rosters, and fee schedules
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Link to Class Rollover */}
          <Link
            to="/rollover"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all shadow-xs"
          >
            <GraduationCap size={15} className="text-indigo-600" />
            <span>Class Rollover</span>
          </Link>

          {/* Link to Subjects */}
          <Link
            to="/subjects"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all shadow-xs"
          >
            <BookOpen size={15} className="text-blue-600" />
            <span>Curriculum Subjects</span>
          </Link>

          {/* Add Class Button */}
          <button
            onClick={() => setIsAddClassOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* ── Stats Cards ───────────────────────────────────────────────────── */}
      <StatsCards
        totalClasses={stats.totalClasses}
        totalStudents={stats.totalStudents}
        totalSections={stats.totalSections}
        feeCollected={stats.feeCollected}
        onFeeCardClick={() => setIsFeeHistoryOpen(true)}
      />

      {/* ── Toolbar & Filter Bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search class by name (e.g. Class 9)..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Shift Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl p-1 text-xs">
            {(['ALL', 'MORNING', 'DAY'] as const).map((sh) => (
              <button
                key={sh}
                onClick={() => setShiftFilter(sh)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  shiftFilter === sh
                    ? 'bg-white shadow-xs text-indigo-700 font-bold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {sh === 'ALL' ? 'All Shifts' : `${sh.charAt(0) + sh.slice(1).toLowerCase()} Shift`}
              </button>
            ))}
          </div>

          {/* Active / All toggle */}
          {(inactiveCount > 0 || showAll) && (
            <button
              onClick={() => setShowAll(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showAll
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {showAll ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{showAll ? 'Showing All' : `Show Disabled (${inactiveCount})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Class Grid ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            Class Matrix ({displayClasses.length} {displayClasses.length === 1 ? 'Class' : 'Classes'})
          </h2>
        </div>

        <ClassGrid classes={displayClasses} onToggleActive={toggleClassActive} />
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onAdd={addClass}
      />

      <FeeHistoryModal
        isOpen={isFeeHistoryOpen}
        onClose={() => setIsFeeHistoryOpen(false)}
        classes={classes}
      />
    </div>
  )
}
