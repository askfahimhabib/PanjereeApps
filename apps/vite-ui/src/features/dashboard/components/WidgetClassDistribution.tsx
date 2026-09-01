import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ArrowRight,
} from 'lucide-react'

interface ClassItemData {
  id: string
  name: string
  count: number
  percentage: number
  sectionCount: number
  capacity: number
  shift: string
}

interface BatchItemData {
  id: string
  name: string
  code: string
  studentCount: number
  maxStudents: number
  subjectName: string
}

interface WidgetClassDistributionProps {
  classBreakdown: ClassItemData[]
  batchBreakdown: BatchItemData[]
  totalStudents: number
}

const BAR_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-cyan-500',
]

export function WidgetClassDistribution({
  classBreakdown,
  batchBreakdown,
  totalStudents,
}: WidgetClassDistributionProps) {
  const [viewMode, setViewMode] = useState<'classes' | 'batches'>('classes')

  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Academic Strength & Capacity</h2>
              <p className="text-[11px] text-zinc-400">Class & batch student distribution</p>
            </div>
          </div>

          {/* Toggle Class / Batch */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setViewMode('classes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'classes'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Classes
            </button>
            <button
              onClick={() => setViewMode('batches')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'batches'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Batches
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'classes' ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {classBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No class enrollments found</p>
            ) : (
              classBreakdown.slice(0, 6).map((cls, idx) => {
                const color = BAR_COLORS[idx % BAR_COLORS.length]

                return (
                  <div key={cls.id} className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-zinc-200 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{cls.name}</span>
                        <span className="text-[10px] font-medium text-zinc-400">
                          ({cls.sectionCount} Sec • {cls.shift})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-zinc-800">{cls.count} Students</span>
                        <span className="text-[10px] font-bold text-zinc-400">({cls.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200/70 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${color}`}
                        style={{ width: `${cls.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {batchBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No active batches created</p>
            ) : (
              batchBreakdown.map(batch => {
                const fillPct = batch.maxStudents > 0 ? Math.round((batch.studentCount / batch.maxStudents) * 100) : 0

                return (
                  <div key={batch.id} className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-zinc-200 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{batch.name}</p>
                        <p className="text-[10px] text-zinc-400">{batch.subjectName}</p>
                      </div>
                      <span className="text-xs font-extrabold text-zinc-800">
                        {batch.studentCount} / {batch.maxStudents}
                      </span>
                    </div>

                    <div className="w-full bg-zinc-200/70 rounded-full h-1.5 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-300"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500">
          Total Enrolled: <strong className="text-zinc-900">{totalStudents}</strong>
        </span>
        <Link
          to={viewMode === 'classes' ? '/classes' : '/batches'}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
        >
          <span>{viewMode === 'classes' ? 'Manage Classes' : 'Manage Batches'}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
