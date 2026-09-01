import { useState, useMemo } from 'react'
import {
  GraduationCap,
  Target,
  Sparkles,
  Printer,
  Clock,
  MapPin,
  FileText,
} from 'lucide-react'
import { useClassRoutine, useBatchRoutine } from '@/features/routines/hooks/useRoutine'
import { WeeklyGrid } from '@/features/routines/components/WeeklyGrid'
import { ExamDateList } from '@/features/routines/components/ExamDateList'
import { printRoutine } from '@/features/routines/utils/printRoutine'
import type { DayOfWeek } from '@/features/routines/types'
import { WEEKDAYS, DAY_LABELS } from '@/features/routines/types'

// Mock student personas for previewing roles
interface StudentPersona {
  id: string
  name: string
  roll: string
  role: 'REGULAR' | 'EXAM_BATCH' | 'DUAL'
  classId?: string
  className?: string
  batchId?: string
  batchName?: string
}

const PERSONAS: StudentPersona[] = [
  {
    id: 'st-dual',
    name: 'Nayeem Hasan (You)',
    roll: '1001',
    role: 'DUAL',
    classId: 'cls-10',
    className: 'Class 10',
    batchId: 'batch-ssc-2024',
    batchName: 'SSC Batch 2024 (Model Test)',
  },
  {
    id: 'st-reg',
    name: 'Sumaiya Akter',
    roll: '1002',
    role: 'REGULAR',
    classId: 'cls-10',
    className: 'Class 10',
  },
  {
    id: 'st-batch',
    name: 'Farhan Kabir',
    roll: '2001',
    role: 'EXAM_BATCH',
    batchId: 'batch-ssc-2024',
    batchName: 'SSC Batch 2024 (Model Test)',
  },
]

export function StudentRoutine() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('st-dual')
  const persona = PERSONAS.find(p => p.id === selectedPersonaId) ?? PERSONAS[0]

  const [activeTab, setActiveTab] = useState<'combined' | 'class' | 'batch' | 'exams'>('combined')

  // Queries
  const { data: classRoutines = [], isLoading: loadingClass } = useClassRoutine(
    persona.classId ?? null
  )

  const { data: batchRoutines = [], isLoading: loadingBatch } = useBatchRoutine(
    persona.batchId ?? null
  )

  const isLoading = (persona.classId ? loadingClass : false) || (persona.batchId ? loadingBatch : false)

  // Split academic regular class vs terminal exams
  const academicClassSlots = useMemo(() =>
    classRoutines.filter((r) => r.entry_type !== 'FORMAL_EXAM')
  , [classRoutines])

  const terminalExamSlots = useMemo(() =>
    classRoutines.filter((r) => r.entry_type === 'FORMAL_EXAM')
  , [classRoutines])

  // Combined slots
  const combinedSlots = useMemo(() => {
    return [...academicClassSlots, ...batchRoutines]
  }, [academicClassSlots, batchRoutines])

  // Today's Date & Day calculation
  const todayDOWIndex = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const todayDOW = WEEKDAYS[todayDOWIndex] as DayOfWeek

  // Active slots for today
  const todaySlots = useMemo(() => {
    const activeList = persona.role === 'EXAM_BATCH'
      ? batchRoutines
      : persona.role === 'REGULAR'
      ? academicClassSlots
      : combinedSlots

    return activeList
      .filter((r) => r.is_active && r.day === todayDOW && r.entry_type !== 'OFF_DAY')
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [persona.role, batchRoutines, academicClassSlots, combinedSlots, todayDOW])

  // Print helper
  const handlePrint = () => {
    printRoutine({
      title: `${persona.name} (${persona.className ?? ''}${persona.batchName ? ' • ' + persona.batchName : ''})`,
      subtitle: `Personal Routine Schedule • Roll: ${persona.roll}`,
      routines: activeTab === 'class'
        ? academicClassSlots
        : activeTab === 'batch'
        ? batchRoutines
        : activeTab === 'exams'
        ? terminalExamSlots
        : combinedSlots,
    })
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            My Class &amp; Exam Routine
          </h1>
          <p className="text-zinc-500 mt-0.5 text-sm flex items-center gap-2 flex-wrap">
            {persona.className && (
              <span className="flex items-center gap-1 font-semibold text-zinc-700">
                <GraduationCap size={15} className="text-indigo-600" />
                {persona.className}
              </span>
            )}
            {persona.batchName && (
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <Target size={14} className="text-amber-600" />
                {persona.batchName}
              </span>
            )}
            <span className="text-zinc-400">· Roll {persona.roll}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Persona Switcher for Preview */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl text-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">View as:</span>
            {PERSONAS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPersonaId(p.id)
                  if (p.role === 'EXAM_BATCH') setActiveTab('batch')
                  else if (p.role === 'REGULAR') setActiveTab('class')
                  else setActiveTab('combined')
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPersonaId === p.id
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {p.role === 'DUAL' ? 'Dual-Enrolled' : p.role === 'EXAM_BATCH' ? 'Exam Batch' : 'Regular Class'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer shadow-2xs"
          >
            <Printer size={14} className="text-zinc-600" />
            <span>Print Schedule</span>
          </button>
        </div>
      </div>

      {/* ── Today's Live Class Timeline Widget ───────────────── */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-indigo-700/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
              <Clock size={20} className="text-indigo-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Today&apos;s Class Timeline
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {DAY_LABELS[todayDOW]}
                </span>
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                {todaySlots.length > 0
                  ? `You have ${todaySlots.length} scheduled periods today`
                  : 'No scheduled classes today (Enjoy your off day!)'}
              </p>
            </div>
          </div>
        </div>

        {todaySlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {todaySlots.map((slot, idx) => {
              const isCT = slot.entry_type === 'CLASS_EXAM'
              const subName = slot.subjects?.name_bn ?? slot.subjects?.name ?? 'Subject'
              const isBatchSlot = slot.target_type === 'BATCH'

              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCT
                      ? 'bg-amber-500/15 border-amber-400/30 text-amber-100'
                      : isBatchSlot
                      ? 'bg-purple-500/15 border-purple-400/30 text-purple-100'
                      : 'bg-white/10 border-white/15 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-200">
                      Period #{idx + 1}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isCT
                        ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                        : isBatchSlot
                        ? 'bg-purple-400/30 text-purple-200 border border-purple-400/40'
                        : 'bg-indigo-400/30 text-indigo-100'
                    }`}>
                      {isCT ? 'Class Test' : isBatchSlot ? 'Exam Batch' : 'Regular Class'}
                    </span>
                  </div>

                  <p className="text-sm font-bold truncate text-white">{subName}</p>

                  {slot.topic && (
                    <p className="text-[10px] text-amber-200 mt-0.5 truncate">
                      📝 {slot.topic}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-indigo-200 mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock size={11} />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                    {slot.room && (
                      <div className="flex items-center gap-0.5 text-indigo-100 font-medium">
                        <MapPin size={10} />
                        <span>{slot.room}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-indigo-300 text-xs">
            🎉 No classes scheduled for {DAY_LABELS[todayDOW]}.
          </div>
        )}
      </div>

      {/* ── Routine Stream View Switcher ─────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl flex-wrap">
          {persona.role === 'DUAL' && (
            <button
              type="button"
              onClick={() => setActiveTab('combined')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'combined'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Combined Schedule ({combinedSlots.length})</span>
            </button>
          )}

          {persona.classId && (
            <button
              type="button"
              onClick={() => setActiveTab('class')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'class'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <GraduationCap size={15} />
              <span>Class Routine ({academicClassSlots.length})</span>
            </button>
          )}

          {persona.batchId && (
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Target size={15} />
              <span>Exam Batch ({batchRoutines.length})</span>
            </button>
          )}

          {terminalExamSlots.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <FileText size={14} />
              <span>Terminal Exams ({terminalExamSlots.length})</span>
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Class
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Class Test
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Exam
          </span>
        </div>
      </div>

      {/* ── Content Grid ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-3 animate-pulse">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-9 rounded-xl bg-zinc-100" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-24 rounded-xl bg-zinc-100" />
              ))}
            </div>
          ))}
        </div>
      ) : activeTab === 'exams' ? (
        <ExamDateList
          routines={terminalExamSlots}
          emptyMessage="No terminal exam date-sheet published for your class yet."
        />
      ) : activeTab === 'batch' ? (
        <WeeklyGrid routines={batchRoutines} readonly />
      ) : activeTab === 'class' ? (
        <WeeklyGrid routines={academicClassSlots} readonly />
      ) : (
        <WeeklyGrid routines={combinedSlots} readonly />
      )}
    </div>
  )
}
