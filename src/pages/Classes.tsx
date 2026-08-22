import { useState } from 'react'
import { Plus, RefreshCw, Download, Eye, EyeOff } from 'lucide-react'
import { StatsCards } from '../features/classes/components/StatsCards'
import { ClassGrid } from '../features/classes/components/ClassGrid'
import { RolloverModal } from '../features/classes/components/modals/RolloverModal'
import { AddClassModal } from '../features/classes/components/modals/AddClassModal'
import { FeeHistoryModal } from '../features/classes/components/modals/FeeHistoryModal'
import { useClasses } from '../features/classes/useClasses'

export function Classes() {
  const { classes, stats, addClass, toggleClassActive } = useClasses()
  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const [isRolloverOpen, setIsRolloverOpen] = useState(false)
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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Classes Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all classes, sections, and groups</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Download size={17} />
            Export
          </button>
          <button
            onClick={() => setIsRolloverOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-sm font-medium transition-colors"
          >
            <RefreshCw size={17} />
            Year Rollover
          </button>
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
          <h2 className="text-base font-semibold text-slate-300">
            Academic Session: {classes[0]?.academicYear ?? '—'}
            <span className="ml-2 text-sm text-slate-500 font-normal">
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
                  ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-300 hover:border-slate-600'
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

      <RolloverModal
        isOpen={isRolloverOpen}
        onClose={() => setIsRolloverOpen(false)}
        classes={classes}
        onConfirm={(_from, _to) => {
          setIsRolloverOpen(false)
        }}
      />

      <FeeHistoryModal
        isOpen={isFeeHistoryOpen}
        onClose={() => setIsFeeHistoryOpen(false)}
        classes={classes}
      />
    </div>
  )
}

