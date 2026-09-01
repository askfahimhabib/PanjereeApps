import { useMemo } from 'react'
import {
  Users,
  ChevronRight,
  FlaskConical,
  Palette,
  Calculator,
  LayoutGrid,
  PowerOff,
  Power,
  ArrowRight,
} from 'lucide-react'
import type { ClassItem } from '../types'
import { Link } from 'react-router-dom'
import { sectionStore } from '@/data/stores'

interface ClassGridProps {
  classes: ClassItem[]
  onToggleActive?: (classId: string) => void
}

export function ClassGrid({ classes, onToggleActive }: ClassGridProps) {
  const allSections = useMemo(() => sectionStore.getAll(), [])

  if (classes.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500 border-2 border-dashed border-zinc-200 rounded-3xl bg-white p-8">
        <LayoutGrid size={36} className="mx-auto mb-2 text-zinc-400 opacity-40" />
        <p className="text-sm font-bold text-zinc-700">No classes found.</p>
        <p className="text-xs text-zinc-400 mt-1">Create a new class to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {classes.map((cls) => {
        const attendance = cls.attendanceRate ?? 0
        const feeCollection = cls.feeCollectionRate ?? 0
        const inactive = !cls.isActive
        const classSections = allSections.filter(s => s.classId === cls.id)

        return (
          <div
            key={cls.id}
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
              inactive
                ? 'border-zinc-200 bg-zinc-100/70 opacity-60'
                : 'border-zinc-200/80 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5'
            }`}
          >
            {/* Top Card Area */}
            <div className="p-5 pb-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">{cls.name}</h3>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                      {cls.shift} Shift
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Session: <strong className="text-zinc-700">{cls.academicYear}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Toggle Active Button */}
                  {onToggleActive && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onToggleActive(cls.id)
                      }}
                      title={inactive ? 'Enable class' : 'Disable class'}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        inactive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      {inactive ? <Power size={14} /> : <PowerOff size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 mb-4">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Students</span>
                  <span className="text-sm font-extrabold text-zinc-900 flex items-center justify-center gap-1 mt-0.5">
                    <Users size={12} className="text-indigo-600" />
                    {cls.totalStudents}
                  </span>
                </div>
                <div className="text-center border-x border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Sections</span>
                  <span className="text-sm font-extrabold text-zinc-900 flex items-center justify-center gap-1 mt-0.5">
                    <LayoutGrid size={12} className="text-purple-600" />
                    {cls.totalSections}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Monthly Fee</span>
                  <span className="text-sm font-extrabold text-amber-700 mt-0.5 block">
                    {cls.feeMonthly ? `৳${cls.feeMonthly}` : '—'}
                  </span>
                </div>
              </div>

              {/* Interactive Section Pills (Clickable direct links to section) */}
              {classSections.length > 0 && !inactive && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Direct Section Hubs:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {classSections.map(sec => (
                      <Link
                        key={sec.id}
                        to={`/admin/classes/${cls.id}/sections/${sec.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-zinc-100 hover:bg-indigo-600 text-zinc-700 hover:text-white transition-all shadow-2xs"
                      >
                        <span>Sec {sec.name}</span>
                        <ArrowRight size={10} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance & Fee Mini Meters */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                {/* Attendance */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="font-semibold text-zinc-600">Attendance Rate</span>
                    <span
                      className={`font-bold font-mono ${
                        attendance >= 85 ? 'text-emerald-700' : attendance >= 75 ? 'text-amber-700' : 'text-rose-700'
                      }`}
                    >
                      {attendance}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        attendance >= 85 ? 'bg-emerald-500' : attendance >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${attendance}%` }}
                    />
                  </div>
                </div>

                {/* Fee Collection */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="font-semibold text-zinc-600">Fee Collection</span>
                    <span className="font-bold font-mono text-indigo-700">{feeCollection}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${feeCollection}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Group Badges */}
              {cls.hasGroups && cls.groups && cls.groups.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3.5 pt-2.5 border-t border-zinc-100">
                  {cls.groups.map(g => {
                    if (g.name === 'SCIENCE')
                      return (
                        <span key={g.id} className="inline-flex items-center text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                          <FlaskConical className="w-2.5 h-2.5 mr-1" /> Science
                        </span>
                      )
                    if (g.name === 'ARTS')
                      return (
                        <span key={g.id} className="inline-flex items-center text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">
                          <Palette className="w-2.5 h-2.5 mr-1" /> Arts
                        </span>
                      )
                    if (g.name === 'COMMERCE')
                      return (
                        <span key={g.id} className="inline-flex items-center text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                          <Calculator className="w-2.5 h-2.5 mr-1" /> Commerce
                        </span>
                      )
                    return null
                  })}
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-3 bg-zinc-50/80 border-t border-zinc-100">
              <Link
                to={`/admin/classes/${cls.id}`}
                className={`flex items-center justify-between w-full px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                  inactive
                    ? 'bg-zinc-200 text-zinc-500 pointer-events-none'
                    : 'bg-white hover:bg-indigo-600 border border-zinc-200 hover:border-indigo-600 text-zinc-800 hover:text-white'
                }`}
                tabIndex={inactive ? -1 : undefined}
              >
                <span>{inactive ? 'Class Disabled' : 'Open Class Dashboard'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
