import { Users, ChevronRight, GraduationCap, Trash2, ClipboardCheck, DollarSign, AlertTriangle } from 'lucide-react'
import type { Section } from '../../types'
import { Link } from 'react-router-dom'

interface SectionListProps {
  sections: Section[]
  onDelete?: (sectionId: string) => void
}

function AttendanceMini({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    pct >= 75 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20'
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${color}`}>
      <ClipboardCheck size={10} />
      {pct}%
    </div>
  )
}

function FeeMini({ paidPct, duePct }: { paidPct: number; duePct: number }) {
  const hasDue = duePct > 15
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${
      hasDue
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }`}>
      <DollarSign size={10} />
      {paidPct}% paid
    </div>
  )
}

export function SectionList({ sections, onDelete }: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center p-10 text-slate-400 border border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
        No sections added yet. Click &ldquo;Add Section&rdquo; to create one.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => {
        const attendance = section.attendanceRate ?? 0
        const paidPct = section.feeCollectionRate ?? 0
        const duePct = Math.max(0, 100 - paidPct)
        
        const fillPct = section.capacity > 0
          ? (section.totalStudents / section.capacity)
          : 0

        return (
          <div
            key={section.id}
            className="group overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-300"
          >
            <div className="p-5">
              {/* ── Header ───────────────────────────────────────────── */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                    {section.name}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">Section {section.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {section.classTeacherName ?? 'No Class Teacher'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {section.isRollFrozen && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Frozen
                    </span>
                  )}
                  {section.status === 'INACTIVE' && (
                    <span className="text-xs bg-slate-600/40 text-slate-400 border border-slate-600/40 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete Section ${section.name}?`)) onDelete(section.id)
                      }}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Capacity ─────────────────────────────────────────── */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-300">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span className="text-xs">Students</span>
                  </div>
                  <span className={`text-xs font-medium ${fillPct > 0.9 ? 'text-red-400' : 'text-slate-200'}`}>
                    {section.totalStudents} / {section.capacity}
                  </span>
                </div>

                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      section.totalStudents === 0 ? 'bg-slate-600' :
                      fillPct > 0.9 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, fillPct * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Boys: {section.maleCount}</span>
                  <span>Girls: {section.femaleCount}</span>
                </div>
              </div>

              {/* ── Mini Stats ───────────────────────────────────────── */}
              <div className="flex items-center gap-1.5 mb-4">
                <AttendanceMini pct={attendance} />
                <FeeMini paidPct={paidPct} duePct={duePct} />
                {attendance < 75 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium text-red-400 bg-red-500/10 border-red-500/20">
                    <AlertTriangle size={10} />
                    At Risk
                  </div>
                )}
              </div>

              {/* ── CTA ──────────────────────────────────────────────── */}
              <Link
                to={`/admin/classes/${section.classId}/sections/${section.id}`}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-blue-600 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200"
              >
                View Roll List
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
