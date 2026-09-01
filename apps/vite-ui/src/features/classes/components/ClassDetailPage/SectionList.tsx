import {
  Users,
  ChevronRight,
  GraduationCap,
  Trash2,
  ClipboardCheck,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import type { Section } from '../../types'
import { Link } from 'react-router-dom'

interface SectionListProps {
  sections: Section[]
  onDelete?: (sectionId: string) => void
}

function AttendanceMini({ pct }: { pct: number }) {
  const color =
    pct >= 90
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : pct >= 75
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200'
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${color}`}>
      <ClipboardCheck size={12} />
      <span>{pct}% Att.</span>
    </div>
  )
}

function FeeMini({ paidPct }: { paidPct: number }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11px] font-bold">
      <CreditCard size={12} />
      <span>{paidPct}% Fee</span>
    </div>
  )
}

export function SectionList({ sections, onDelete }: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center p-12 text-zinc-500 border-2 border-dashed border-zinc-200 rounded-3xl bg-white">
        No sections added yet. Click &ldquo;Add Section&rdquo; to create one.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => {
        const attendance = section.attendanceRate ?? 82
        const paidPct = section.feeCollectionRate ?? 88

        const fillPct =
          section.capacity > 0 ? section.totalStudents / section.capacity : 0

        return (
          <div
            key={section.id}
            className="group overflow-hidden rounded-3xl border border-zinc-200/80 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="p-5">
              {/* ── Header ───────────────────────────────────────────── */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg">
                    {section.name}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900">
                      Section {section.name}
                    </h3>
                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[130px]">
                        {section.classTeacherName ?? 'No Class Teacher'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {section.isRollFrozen && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                      Roll Frozen
                    </span>
                  )}
                  {section.status === 'INACTIVE' && (
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 border border-zinc-200 font-bold px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete Section ${section.name}?`))
                          onDelete(section.id)
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Capacity & Student Counts ─────────────────────────── */}
              <div className="space-y-1.5 mb-3.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-zinc-700 font-semibold">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    <span>Enrolled Students</span>
                  </div>
                  <span
                    className={`font-bold font-mono ${
                      fillPct > 0.9 ? 'text-rose-600' : 'text-zinc-900'
                    }`}
                  >
                    {section.totalStudents} / {section.capacity}
                  </span>
                </div>

                <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      section.totalStudents === 0
                        ? 'bg-zinc-300'
                        : fillPct > 0.9
                        ? 'bg-rose-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, fillPct * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-zinc-500 font-medium pt-1">
                  <span>Boys: <strong className="text-zinc-700">{section.maleCount}</strong></span>
                  <span>Girls: <strong className="text-zinc-700">{section.femaleCount}</strong></span>
                </div>
              </div>

              {/* ── Mini Stats Badges ─────────────────────────────────── */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <AttendanceMini pct={attendance} />
                <FeeMini paidPct={paidPct} />
                {attendance < 75 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold text-rose-700 bg-rose-50 border-rose-200">
                    <AlertTriangle size={11} />
                    <span>At Risk</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer CTA ────────────────────────────────────────── */}
            <div className="p-3 bg-zinc-50/80 border-t border-zinc-100">
              <Link
                to={`/admin/classes/${section.classId}/sections/${section.id}`}
                className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-white hover:bg-indigo-600 border border-zinc-200 hover:border-indigo-600 text-zinc-800 hover:text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Open Section Command Hub</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
