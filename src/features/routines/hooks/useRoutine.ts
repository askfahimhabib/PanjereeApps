import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/lib/supabase'
import { createStore } from '@/lib/localStore'
import type { Routine, CreateRoutineDto, DayOfWeek } from '../types'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const routineKeys = {
  all: ['routines'] as const,
  byClass: (classId: string) => ['routines', 'class', classId] as const,
  byBatch: (batchId: string) => ['routines', 'batch', batchId] as const,
}

// ─── Local Store (replace with Supabase when ready) ──────────────────────────

const store = createStore<Routine>('routines')

// ─── Fetch Routines by Class ──────────────────────────────────────────────────

async function fetchClassRoutine(classId: string): Promise<Routine[]> {
  // TODO: replace with Supabase when tables are ready
  // const { data, error } = await supabase
  //   .from('routines')
  //   .select(`*, subjects (id, name, name_bn), teachers (id, full_name), sections (id, name)`)
  //   .eq('class_id', classId)
  //   .eq('target_type', 'CLASS')
  //   .eq('is_active', true)
  //   .order('start_time', { ascending: true })
  // if (error) throw error
  // return data as Routine[]
  return store.getWhere(r => r.class_id === classId && r.target_type === 'CLASS')
}

export function useClassRoutine(classId: string | null) {
  return useQuery({
    queryKey: routineKeys.byClass(classId ?? ''),
    queryFn: () => fetchClassRoutine(classId!),
    enabled: !!classId,
    staleTime: 0,
  })
}

// ─── Fetch Routines by Batch ──────────────────────────────────────────────────

async function fetchBatchRoutine(batchId: string): Promise<Routine[]> {
  // TODO: replace with Supabase when tables are ready
  // const { data, error } = await supabase
  //   .from('routines')
  //   .select(`*, subjects (id, name, name_bn), teachers (id, full_name)`)
  //   .eq('batch_id', batchId)
  //   .eq('target_type', 'BATCH')
  //   .eq('entry_type', 'FORMAL_EXAM')
  //   .order('specific_date', { ascending: true })
  // if (error) throw error
  // return data as Routine[]
  return store.getWhere(r => r.batch_id === batchId && r.entry_type === 'FORMAL_EXAM')
}

export function useBatchRoutine(batchId: string | null) {
  return useQuery({
    queryKey: routineKeys.byBatch(batchId ?? ''),
    queryFn: () => fetchBatchRoutine(batchId!),
    enabled: !!batchId,
    staleTime: 0,
  })
}

// ─── Create Routine Slot ──────────────────────────────────────────────────────

async function createRoutineSlot(dto: CreateRoutineDto): Promise<Routine> {
  // TODO: replace with Supabase when tables are ready
  // const { data, error } = await supabase.from('routines').insert(dto).select().single()
  // if (error) throw error
  // return data as Routine
  const newSlot: Routine = {
    id: crypto.randomUUID(),
    ...dto,
    class_id: dto.class_id ?? null,
    section_id: dto.section_id ?? null,
    batch_id: dto.batch_id ?? null,
    subject_id: dto.subject_id ?? null,
    teacher_id: dto.teacher_id ?? null,
    day: dto.day ?? null,
    specific_date: dto.specific_date ?? null,
    room: dto.room ?? null,
    source_exam_held_id: null,
    is_active: true,
    postpone_note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return store.insert(newSlot)
}

export function useCreateRoutine(classId?: string, batchId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRoutineSlot,
    onSuccess: () => {
      if (classId) qc.invalidateQueries({ queryKey: routineKeys.byClass(classId) })
      if (batchId) qc.invalidateQueries({ queryKey: routineKeys.byBatch(batchId) })
    },
  })
}

// ─── Update Routine Slot ──────────────────────────────────────────────────────

async function updateRoutineSlot({ id, ...dto }: Partial<CreateRoutineDto> & { id: string }): Promise<Routine> {
  // TODO: replace with Supabase when tables are ready
  // const { data, error } = await supabase.from('routines').update({ ...dto, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  // if (error) throw error
  // return data as Routine
  return store.update(id, { ...dto, updated_at: new Date().toISOString() })
}

export function useUpdateRoutine(classId?: string, batchId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateRoutineSlot,
    onSuccess: () => {
      if (classId) qc.invalidateQueries({ queryKey: routineKeys.byClass(classId) })
      if (batchId) qc.invalidateQueries({ queryKey: routineKeys.byBatch(batchId) })
    },
  })
}

// ─── Delete Routine Slot ──────────────────────────────────────────────────────

async function deleteRoutineSlot(id: string) {
  // TODO: replace with Supabase when tables are ready
  // const { error } = await supabase.from('routines').delete().eq('id', id).is('source_exam_held_id', null)
  // if (error) throw error
  store.remove(id)
}

export function useDeleteRoutine(classId?: string, batchId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRoutineSlot,
    onSuccess: (_, id) => {
      if (classId) qc.invalidateQueries({ queryKey: routineKeys.byClass(classId) })
      if (batchId) qc.invalidateQueries({ queryKey: routineKeys.byBatch(batchId) })
    },
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Group routines by day for WeeklyGrid */
export function groupByDay(routines: Routine[]): Record<DayOfWeek, Routine[]> {
  const map: Record<string, Routine[]> = {}
  for (const r of routines) {
    if (r.day) {
      if (!map[r.day]) map[r.day] = []
      map[r.day].push(r)
    }
  }
  return map as Record<DayOfWeek, Routine[]>
}
