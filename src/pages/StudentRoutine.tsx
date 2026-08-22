import { useState } from 'react'
import { Calendar, GraduationCap, BookOpen } from 'lucide-react'
import { useClassRoutine, useBatchRoutine } from '@/features/routines/hooks/useRoutine'
import { WeeklyGrid } from '@/features/routines/components/WeeklyGrid'
import { ExamDateList } from '@/features/routines/components/ExamDateList'

// In real app, get from auth store / user context
const MOCK_STUDENT = {
  role: 'REGULAR_STUDENT' as const, // or 'EXAM_BATCH_STUDENT'
  class_id: 'cls1',
  class_name: 'Class 10',
  batch_id: null as string | null,
  batch_name: null as string | null,
}

export function StudentRoutine() {
  const isRegular = MOCK_STUDENT.role === 'REGULAR_STUDENT'
  const [activeView, setActiveView] = useState<'weekly' | 'exams'>('weekly')

  // Regular student: loads full class routine (all sections)
  const { data: classRoutines = [], isLoading: loadingClass } = useClassRoutine(
    isRegular ? MOCK_STUDENT.class_id : null
  )

  // Exam batch student: loads only FORMAL_EXAM for their batch
  const { data: batchRoutines = [], isLoading: loadingBatch } = useBatchRoutine(
    !isRegular ? MOCK_STUDENT.batch_id : null
  )

  const isLoading = isRegular ? loadingClass : loadingBatch

  // Split for regular student
  const classSlots = classRoutines.filter((r) => r.entry_type !== 'FORMAL_EXAM')
  const examSlots = classRoutines.filter((r) => r.entry_type === 'FORMAL_EXAM')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Routine</h1>
        <p className="text-slate-400 mt-1 text-sm flex items-center gap-2">
          {isRegular ? (
            <><GraduationCap size={14} /> {MOCK_STUDENT.class_name} — Weekly class &amp; exam schedule</>
          ) : (
            <><BookOpen size={14} /> {MOCK_STUDENT.batch_name} — Exam schedule</>
          )}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500/50" />
          Class
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/50" />
          Class Test
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-purple-500/30 border border-purple-500/50" />
          Exam
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-900/40 border border-amber-700/40" />
          Postponed / Cancelled
        </span>
      </div>

      {/* View toggle — only for regular students */}
      {isRegular && (
        <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl w-fit border border-slate-700">
          <button
            onClick={() => setActiveView('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'weekly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar size={14} />
            Weekly Classes
          </button>
          <button
            onClick={() => setActiveView('exams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'exams' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            Exam Schedule
            {examSlots.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[10px]">
                {examSlots.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <StudentRoutineSkeleton isRegular={isRegular} />
      ) : isRegular ? (
        activeView === 'weekly' ? (
          <WeeklyGrid routines={classSlots} readonly />
        ) : (
          <ExamDateList
            routines={examSlots}
            emptyMessage="No exam schedule has been set for this class."
          />
        )
      ) : (
        // Exam batch student
        <ExamDateList
          routines={batchRoutines}
          emptyMessage="No exam schedule has been set for your batch."
        />
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StudentRoutineSkeleton({ isRegular }: { isRegular: boolean }) {
  if (isRegular) {
    return (
      <div className="grid grid-cols-5 gap-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-9 rounded-lg bg-slate-800" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-20 rounded-lg bg-slate-800/60" />
            ))}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-slate-800/50" />
      ))}
    </div>
  )
}
