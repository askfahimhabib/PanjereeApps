import { useState, useEffect, useMemo } from 'react'
import { Plus, Printer, BarChart2, GraduationCap, Target, Users, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useClassRoutine,
  useBatchRoutine,
  useAllRoutines,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
} from '@/features/routines/hooks/useRoutine'
import { WeeklyGrid } from '@/features/routines/components/WeeklyGrid'
import { RoutineSlotModal } from '@/features/routines/components/RoutineSlotModal'
import { syncExamSchedulesToRoutines } from '@/features/examHeld/hooks/useExamHeld'
import { classStore, batchStore, teacherStore } from '@/data/stores'
import { printRoutine } from '@/features/routines/utils/printRoutine'
import type { Routine, DayOfWeek, CreateRoutineDto, RoutineTargetType } from '@/features/routines/types'

export function Routines() {
  const [activeStream, setActiveStream] = useState<RoutineTargetType>('CLASS')

  const activeClasses = useMemo(() =>
    classStore.getAll().filter(c => c.isActive !== false)
  , [])

  const activeBatches = useMemo(() =>
    batchStore.getAll()
  , [])

  const [selectedClassId, setSelectedClassId] = useState<string>(activeClasses[0]?.id ?? 'cls-10')
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeBatches[0]?.id ?? '')

  const [modalOpen, setModalOpen] = useState(false)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [prefillDay, setPrefillDay] = useState<DayOfWeek | undefined>()
  const [editing, setEditing] = useState<Routine | null>(null)

  const qc = useQueryClient()

  useEffect(() => {
    syncExamSchedulesToRoutines()
    qc.invalidateQueries({ queryKey: ['routines'] })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Queries for active selection
  const { data: classRoutines = [], isLoading: loadingClass } = useClassRoutine(
    activeStream === 'CLASS' ? selectedClassId : null
  )

  const { data: batchRoutines = [], isLoading: loadingBatch } = useBatchRoutine(
    activeStream === 'BATCH' ? selectedBatchId : null
  )

  const { data: allRoutines = [] } = useAllRoutines()

  const currentRoutines = activeStream === 'CLASS'
    ? classRoutines.filter(r => r.entry_type !== 'FORMAL_EXAM')
    : batchRoutines

  const isLoading = activeStream === 'CLASS' ? loadingClass : loadingBatch

  // Mutations
  const create = useCreateRoutine(
    activeStream === 'CLASS' ? selectedClassId : undefined,
    activeStream === 'BATCH' ? selectedBatchId : undefined
  )
  const update = useUpdateRoutine(
    activeStream === 'CLASS' ? selectedClassId : undefined,
    activeStream === 'BATCH' ? selectedBatchId : undefined
  )
  const remove = useDeleteRoutine(
    activeStream === 'CLASS' ? selectedClassId : undefined,
    activeStream === 'BATCH' ? selectedBatchId : undefined
  )

  const openAdd = (day?: DayOfWeek) => {
    setEditing(null)
    setPrefillDay(day)
    setModalOpen(true)
  }

  const openEdit = (slot: Routine) => {
    setEditing(slot)
    setPrefillDay(undefined)
    setModalOpen(true)
  }

  const handleSave = (dto: CreateRoutineDto) => {
    if (editing) {
      update.mutate({ id: editing.id, ...dto }, { onSuccess: () => setModalOpen(false) })
    } else {
      create.mutate(dto, { onSuccess: () => setModalOpen(false) })
    }
  }

  // Active target label
  const selectedTargetName = useMemo(() => {
    if (activeStream === 'CLASS') {
      return activeClasses.find(c => c.id === selectedClassId)?.name ?? 'Class'
    }
    return activeBatches.find(b => b.id === selectedBatchId)?.name ?? 'Batch'
  }, [activeStream, selectedClassId, selectedBatchId, activeClasses, activeBatches])

  const handlePrint = () => {
    printRoutine({
      title: `${selectedTargetName} - Weekly Routine Schedule`,
      subtitle: activeStream === 'CLASS' ? 'Academic Regular Schedule & Class Tests' : 'Special Exam Batch Test Routine',
      routines: currentRoutines,
    })
  }

  // Teacher Workload statistics
  const teacherWorkload = useMemo(() => {
    const counts: Record<string, { name: string; count: number; subjects: Set<string> }> = {}
    const teachers = teacherStore.getAll()

    for (const t of teachers) {
      counts[t.id] = { name: t.fullName, count: 0, subjects: new Set() }
    }

    for (const r of allRoutines) {
      if (r.is_active && r.teacher_id && r.entry_type !== 'OFF_DAY') {
        if (!counts[r.teacher_id]) {
          counts[r.teacher_id] = { name: r.teachers?.full_name ?? 'Teacher', count: 0, subjects: new Set() }
        }
        counts[r.teacher_id].count++
        if (r.subjects?.name) {
          counts[r.teacher_id].subjects.add(r.subjects.name)
        }
      }
    }

    return Object.values(counts).sort((a, b) => b.count - a.count)
  }, [allRoutines])

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            Routine Management
          </h1>
          <p className="text-zinc-500 mt-0.5 text-sm">
            Manage weekly schedules, class tests, and exam batch routines
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Teacher Workload Modal Button */}
          <button
            type="button"
            onClick={() => setAnalyticsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer shadow-2xs"
          >
            <BarChart2 size={14} className="text-indigo-600" />
            <span>Teacher Workload</span>
          </button>

          {/* Print Routine */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={currentRoutines.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer shadow-2xs disabled:opacity-40"
          >
            <Printer size={14} className="text-zinc-600" />
            <span>Print Routine</span>
          </button>

          {/* Add Slot */}
          <button
            type="button"
            onClick={() => openAdd()}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* ── Stream Switcher (Academic Classes vs Exam Batches) ─ */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveStream('CLASS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStream === 'CLASS'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <GraduationCap size={15} />
            <span>Academic Classes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStream('BATCH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStream === 'BATCH'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Target size={15} />
            <span>Exam Batches</span>
          </button>
        </div>

        {/* Quick info badge */}
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Regular Class
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Class Test (CT)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Off Day
          </span>
        </div>
      </div>

      {/* ── Sub-Selector: Classes or Batches ───────────────────── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">
          {activeStream === 'CLASS' ? 'Select Class:' : 'Select Batch:'}
        </span>
        <div className="pill-tab-container flex-nowrap">
          {activeStream === 'CLASS' ? (
            activeClasses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClassId(c.id)}
                className={selectedClassId === c.id ? 'pill-tab-active' : 'pill-tab-inactive'}
              >
                {c.name}
              </button>
            ))
          ) : (
            activeBatches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBatchId(b.id)}
                className={selectedBatchId === b.id ? 'pill-tab-active' : 'pill-tab-inactive'}
              >
                {b.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Weekly Routine Grid ─────────────────────────────────── */}
      {isLoading ? (
        <RoutineSkeleton />
      ) : (
        <WeeklyGrid
          routines={currentRoutines}
          onSlotClick={openEdit}
          onAddClick={openAdd}
          onDeleteSlot={(id) => remove.mutate(id)}
        />
      )}

      {/* ── Routine Slot Modal ─────────────────────────────────── */}
      <RoutineSlotModal
        open={modalOpen}
        classId={activeStream === 'CLASS' ? selectedClassId : undefined}
        batchId={activeStream === 'BATCH' ? selectedBatchId : undefined}
        targetType={activeStream}
        prefillDay={prefillDay}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={(id) => remove.mutate(id, { onSuccess: () => setModalOpen(false) })}
        isSaving={create.isPending || update.isPending}
      />

      {/* ── Teacher Workload Analytics Modal ───────────────────── */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-zinc-900">Teacher Weekly Workload Analytics</h3>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-zinc-500">
                Weekly class periods assigned to each teacher across all classes and exam batches:
              </p>

              <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {teacherWorkload.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-50/60 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-900 truncate">{t.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {t.subjects.size > 0 ? Array.from(t.subjects).join(', ') : 'No subjects assigned yet'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pl-4 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-indigo-600">{t.count}</span>
                        <span className="text-xs text-zinc-400 ml-1">periods/wk</span>
                      </div>
                      <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min((t.count / 25) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setAnalyticsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function RoutineSkeleton() {
  return (
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
  )
}

