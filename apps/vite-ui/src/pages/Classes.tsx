import { useState } from 'react'
import { Plus, Eye, EyeOff } from 'lucide-react'
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

  const activeClasses   = classes.filter(c => c.isActive)
  const inactiveCount   = classes.filter(c => !c.isActive).length
  const displayClasses  = showAll ? classes : activeClasses

  return (
    <div className="space-y-5">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Classes Overview</h1>
          <p className="text-sm text-zinc-600 mt-1">Manage all classes, sections, and groups</p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setIsAddClassOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
          >
            <Plus size={17} />
            Add Class
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

      {/* ── Class Grid ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-800">
            Academic Session: {classes[0]?.academicYear ?? '—'}
            <span className="ml-2 text-sm text-zinc-600 font-normal">
              ({showAll ? classes.length : activeClasses.length} classes
              {!showAll && inactiveCount > 0 && `, ${inactiveCount} hidden`})
            </span>
          </h2>

          {/* Active / All toggle — only show when there are disabled classes */}
          {(inactiveCount > 0 || showAll) && (
            <button
              onClick={() => setShowAll(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showAll
                  ? 'bg-zinc-100 border-zinc-100 text-zinc-800 hover:bg-slate-600'
                  : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:text-zinc-800 hover:border-zinc-100'
              }`}
            >
              {showAll ? <Eye size={13} /> : <EyeOff size={13} />}
              {showAll ? 'Showing All' : `Show Disabled (${inactiveCount})`}
            </button>
          )}
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

