import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useClassRoutine, useCreateRoutine, useUpdateRoutine, useDeleteRoutine } from '@/features/routines/hooks/useRoutine'
import { WeeklyGrid } from '@/features/routines/components/WeeklyGrid'
import { RoutineSlotModal } from '@/features/routines/components/RoutineSlotModal'
import { syncExamSchedulesToRoutines } from '@/features/examHeld/hooks/useExamHeld'
import { createStore } from '@/lib/localStore'
import type { ClassItem } from '@/features/classes/types'
import type { Routine, DayOfWeek, CreateRoutineDto } from '@/features/routines/types'

const classStore = createStore<ClassItem>('classes')

export function Routines() {
  const activeClasses = useMemo(() =>
    classStore.getAll()
      .map(c => ({ isActive: true, ...c } as ClassItem & { isActive: boolean }))
      .filter(c => c.isActive !== false)
  , [])

  const [selectedClassId, setSelectedClassId] = useState<string>(activeClasses[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const [prefillDay, setPrefillDay] = useState<DayOfWeek | undefined>()
  const [editing, setEditing] = useState<Routine | null>(null)

  const qc = useQueryClient()

  // Backfill any exam schedules that were created before the auto-sync logic,
  // then invalidate so React Query re-fetches with the fresh routines store data.
  useEffect(() => {
    syncExamSchedulesToRoutines()
    qc.invalidateQueries({ queryKey: ['routines'] })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: routines = [], isLoading } = useClassRoutine(selectedClassId)

  // Only show class-type entries in the weekly grid
  const classRoutines = routines.filter((r) => r.entry_type !== 'FORMAL_EXAM')

  const create = useCreateRoutine(selectedClassId)
  const update = useUpdateRoutine(selectedClassId)
  const remove = useDeleteRoutine(selectedClassId)

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Routines</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage weekly class schedules</p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-lg shadow-blue-500/20"
        >
          <Plus size={17} />
          Add Slot
        </button>
      </div>

      {/* Class Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex-shrink-0">Class:</span>
        <div className="flex gap-1.5 flex-wrap">
          {activeClasses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                selectedClassId === c.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <RoutineSkeleton />
      ) : (
        <WeeklyGrid
          routines={classRoutines}
          onSlotClick={openEdit}
          onAddClick={openAdd}
          onDeleteSlot={(id) => remove.mutate(id)}
        />
      )}

      {/* Modal */}
      <RoutineSlotModal
        open={modalOpen}
        classId={selectedClassId}
        prefillDay={prefillDay}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={(id) => remove.mutate(id, { onSuccess: () => setModalOpen(false) })}
        isSaving={create.isPending || update.isPending}
      />
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function RoutineSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-9 rounded-lg bg-slate-800" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="h-24 rounded-lg bg-slate-800/60" />
          ))}
        </div>
      ))}
    </div>
  )
}
