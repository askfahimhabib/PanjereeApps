import { Users, ChevronRight, FlaskConical, Palette, Calculator, LayoutGrid, TrendingUp, PowerOff, Power } from 'lucide-react'
import type { ClassItem } from '../types'
import { Link } from 'react-router-dom'

interface ClassGridProps {
  classes: ClassItem[]
  onToggleActive?: (classId: string) => void
}

export function ClassGrid({ classes, onToggleActive }: ClassGridProps) {
  if (classes.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-100 rounded-xl">
        No classes found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {classes.map((cls) => {
        const attendance = cls.attendanceRate ?? 0
        const feeCollection = cls.feeCollectionRate ?? 0
        const inactive = !cls.isActive

        return (
          <div
            key={cls.id}
            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
              inactive
                ? 'border-zinc-100 bg-white opacity-50 grayscale-[30%]'
                : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-50 hover:border-zinc-100 hover:shadow-lg hover:shadow-blue-900/20'
            }`}
          >
            {/* Inactive overlay label */}
            {inactive && (
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-zinc-100 text-[10px] font-semibold text-zinc-600">
                <PowerOff size={9} />
                Disabled
              </div>
            )}

            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className={inactive ? 'mt-5' : ''}>
                  <h3 className="text-lg font-bold text-zinc-900">{cls.name}</h3>
                  <span className="text-xs text-zinc-600">{cls.academicYear} · {cls.shift}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {cls.hasGroups && !inactive && (
                    <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-blue-500/20">
                      <FlaskConical className="w-3 h-3" /> Groups
                    </div>
                  )}
                  {/* Toggle active button */}
                  {onToggleActive && (
                    <button
                      onClick={(e) => { e.preventDefault(); onToggleActive(cls.id) }}
                      title={inactive ? 'Enable class' : 'Disable class'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        inactive
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-zinc-100 bg-white text-zinc-600 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10'
                      }`}
                    >
                      {inactive ? <Power size={13} /> : <PowerOff size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mb-3">
                <div className="flex items-center gap-1 text-xs text-zinc-600">
                  <Users className="w-3.5 h-3.5 text-zinc-600" />
                  {cls.totalStudents}
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-600">
                  <LayoutGrid className="w-3.5 h-3.5 text-zinc-600" />
                  {cls.totalSections} sections
                </div>
                {cls.feeMonthly && (
                  <div className="ml-auto text-xs text-amber-400 font-medium">
                    ৳{cls.feeMonthly}/mo
                  </div>
                )}
              </div>

              {/* Mini attendance bar */}
              <div className="mb-1.5">
                <div className="flex justify-between items-center text-[11px] text-zinc-600 mb-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} />
                    Attendance
                  </div>
                  <span className={`font-medium ${
                    attendance >= 85 ? 'text-emerald-400' :
                    attendance >= 75 ? 'text-amber-400' : 'text-red-400'
                  }`}>{attendance}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      attendance >= 85 ? 'bg-emerald-500' :
                      attendance >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${attendance}%` }}
                  />
                </div>
              </div>

              {/* Fee collection bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-[11px] text-zinc-600 mb-1">
                  <span>Fee collected</span>
                  <span className={`font-medium ${
                    feeCollection >= 85 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>{feeCollection}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      feeCollection >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${feeCollection}%` }}
                  />
                </div>
              </div>

              {/* Groups */}
              {cls.hasGroups && cls.groups && cls.groups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4 pt-3 border-t border-zinc-100">
                  {cls.groups.map(g => {
                    if (g.name === 'SCIENCE') return (
                      <span key={g.id} className="inline-flex items-center text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                        <FlaskConical className="w-2.5 h-2.5 mr-1" /> Science
                      </span>
                    )
                    if (g.name === 'ARTS') return (
                      <span key={g.id} className="inline-flex items-center text-[11px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                        <Palette className="w-2.5 h-2.5 mr-1" /> Arts
                      </span>
                    )
                    if (g.name === 'COMMERCE') return (
                      <span key={g.id} className="inline-flex items-center text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        <Calculator className="w-2.5 h-2.5 mr-1" /> Commerce
                      </span>
                    )
                    return null
                  })}
                </div>
              )}

              <Link
                to={`/admin/classes/${cls.id}`}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inactive
                    ? 'bg-zinc-50 text-zinc-800 pointer-events-none'
                    : 'bg-zinc-100 hover:bg-blue-600 text-zinc-800 hover:text-white group-hover:bg-blue-600 group-hover:text-white'
                }`}
                onClick={inactive ? (e) => e.preventDefault() : undefined}
                tabIndex={inactive ? -1 : undefined}
              >
                {inactive ? 'Class Disabled' : 'View Details'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

