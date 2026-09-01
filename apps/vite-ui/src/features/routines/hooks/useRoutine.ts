import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/lib/supabase'
import { routineStore as store, subjectStore, teacherStore, classStore, sectionStore, batchStore } from '@/data/stores'
import type { Routine, CreateRoutineDto, DayOfWeek } from '../types'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const routineKeys = {
  all: ['routines'] as const,
  byClass: (classId: string) => ['routines', 'class', classId] as const,
  byBatch: (batchId: string) => ['routines', 'batch', batchId] as const,
  byTeacher: (teacherId: string) => ['routines', 'teacher', teacherId] as const,
}

export function enrichRoutine(r: Routine): Routine {
  const sub = r.subject_id ? subjectStore.getOne(r.subject_id) : undefined
  const tch = r.teacher_id ? teacherStore.getOne(r.teacher_id) : undefined
  const cls = r.class_id ? classStore.getOne(r.class_id) : undefined
  const sec = r.section_id ? sectionStore.getOne(r.section_id) : undefined
  const btc = r.batch_id ? batchStore.getOne(r.batch_id) : undefined

  return {
    ...r,
    subjects: r.subjects ?? (sub ? { id: sub.id, name: sub.name, name_bn: sub.nameBn ?? null } : undefined),
    teachers: r.teachers ?? (tch ? { id: tch.id, full_name: tch.fullName } : undefined),
    classes: r.classes ?? (cls ? { id: cls.id, name: cls.name } : undefined),
    sections: r.sections ?? (sec ? { id: sec.id, name: sec.name } : undefined),
    batches: r.batches ?? (btc ? { id: btc.id, name: btc.name } : undefined),
  }
}

// ─── Fetch All Routines ───────────────────────────────────────────────────────

export function useAllRoutines() {
  return useQuery({
    queryKey: routineKeys.all,
    queryFn: () => store.getAll().map(enrichRoutine),
    staleTime: 0,
  })
}

// ─── Fetch Routines by Class ──────────────────────────────────────────────────

async function fetchClassRoutine(classId: string): Promise<Routine[]> {
  const items = store.getWhere(r => r.class_id === classId && r.target_type === 'CLASS')
  return items.map(enrichRoutine)
}

export function useClassRoutine(classId: string | null) {
  return useQuery({
    queryKey: routineKeys.byClass(classId ?? ''),
    queryFn: () => fetchClassRoutine(classId!),
    enabled: !!classId,
    staleTime: 0,
  })
}

// ─── Fetch Routines by Teacher (Real-time Sync) ───────────────────────────────

export async function fetchTeacherRoutine(teacherId: string): Promise<Routine[]> {
  const teacher = teacherStore.getOne(teacherId)
  const items = store.getWhere(r => {
    if (r.teacher_id === teacherId) return true
    if (teacher) {
      if (r.teacher_id === teacher.id || r.teacher_id === teacher.teacherId || r.teacher_id === teacher.employeeId) return true
      if (r.teachers?.id === teacher.id || (teacher.fullName && r.teachers?.full_name?.toLowerCase() === teacher.fullName.toLowerCase())) return true
    }
    return false
  })
  return items.map(enrichRoutine)
}

export function useTeacherRoutine(teacherId: string | null) {
  return useQuery({
    queryKey: routineKeys.byTeacher(teacherId ?? ''),
    queryFn: () => fetchTeacherRoutine(teacherId!),
    enabled: !!teacherId,
    staleTime: 0,
  })
}

// ─── Fetch Routines by Batch ──────────────────────────────────────────────────

async function fetchBatchRoutine(batchId: string): Promise<Routine[]> {
  const items = store.getWhere(r => r.batch_id === batchId)
  return items.map(enrichRoutine)
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
  const sub = dto.subject_id ? subjectStore.getOne(dto.subject_id) : undefined
  const tch = dto.teacher_id ? teacherStore.getOne(dto.teacher_id) : undefined
  const cls = dto.class_id ? classStore.getOne(dto.class_id) : undefined
  const sec = dto.section_id ? sectionStore.getOne(dto.section_id) : undefined

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
    subjects: sub ? { id: sub.id, name: sub.name, name_bn: sub.nameBn ?? null } : undefined,
    teachers: tch ? { id: tch.id, full_name: tch.fullName } : undefined,
    classes: cls ? { id: cls.id, name: cls.name } : undefined,
    sections: sec ? { id: sec.id, name: sec.name } : undefined,
  }
  return store.insert(newSlot)
}

export function useCreateRoutine(classId?: string, batchId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRoutineSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: routineKeys.all })
      if (classId) qc.invalidateQueries({ queryKey: routineKeys.byClass(classId) })
      if (batchId) qc.invalidateQueries({ queryKey: routineKeys.byBatch(batchId) })
    },
  })
}

// ─── Update Routine Slot ──────────────────────────────────────────────────────

async function updateRoutineSlot({ id, ...dto }: Partial<CreateRoutineDto> & { id: string }): Promise<Routine> {
  const sub = dto.subject_id ? subjectStore.getOne(dto.subject_id) : undefined
  const tch = dto.teacher_id ? teacherStore.getOne(dto.teacher_id) : undefined
  const cls = dto.class_id ? classStore.getOne(dto.class_id) : undefined
  const sec = dto.section_id ? sectionStore.getOne(dto.section_id) : undefined

  return store.update(id, {
    ...dto,
    updated_at: new Date().toISOString(),
    ...(sub ? { subjects: { id: sub.id, name: sub.name, name_bn: sub.nameBn ?? null } } : {}),
    ...(tch ? { teachers: { id: tch.id, full_name: tch.fullName } } : {}),
    ...(cls ? { classes: { id: cls.id, name: cls.name } } : {}),
    ...(sec ? { sections: { id: sec.id, name: sec.name } } : {}),
  })
}

export function useUpdateRoutine(classId?: string, batchId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateRoutineSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: routineKeys.all })
      if (classId) qc.invalidateQueries({ queryKey: routineKeys.byClass(classId) })
      if (batchId) qc.invalidateQueries({ queryKey: routineKeys.byBatch(batchId) })
    },
  })
}

// ─── Delete Routine Slot ──────────────────────────────────────────────────────

async function deleteRoutineSlot(id: string) {
  store.remove(id)
}

export function useDeleteRoutine(classId?: string, batchId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRoutineSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: routineKeys.all })
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
