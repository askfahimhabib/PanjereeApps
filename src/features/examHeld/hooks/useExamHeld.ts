import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/lib/supabase'
import { createStore } from '@/lib/localStore'
import type { ExamHeld, CreateExamHeldDto, CreateScheduleDto } from '../types'
import type { Routine } from '@/features/routines/types'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const examHeldKeys = {
  all: ['exam-held'] as const,
  detail: (id: string) => ['exam-held', id] as const,
}

// ─── Local Store (replace with Supabase when ready) ──────────────────────────

const store = createStore<ExamHeld>('exam_held')
const routineStore = createStore<Routine>('routines')

// ─── One-time Migration: sync existing exam schedules → routines ──────────────
// Called on Routines page mount to backfill any exams created before
// the auto-sync logic was added.

export function syncExamSchedulesToRoutines() {
  const allExams = store.getAll()

  for (const exam of allExams) {
    const schedules = exam.exam_held_schedules ?? []
    if (schedules.length === 0) continue

    // Check if routines already exist for this exam
    const existing = routineStore.getWhere(r => r.source_exam_held_id === exam.id)

    // Build a set of already-synced schedule dates+subjects to avoid duplicates
    const syncedKeys = new Set(existing.map(r => `${r.specific_date}_${r.subject_id}`))

    for (const s of schedules) {
      const key = `${s.date}_${s.subject_id}`
      if (syncedKeys.has(key)) continue  // already synced, skip

      const routineEntry: Routine = {
        id: crypto.randomUUID(),
        target_type: exam.target_type,
        class_id: exam.class_id,
        section_id: null,
        batch_id: exam.batch_id,
        entry_type: 'FORMAL_EXAM',
        subject_id: s.subject_id,
        teacher_id: null,
        day: null,
        specific_date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room,
        source_exam_held_id: exam.id,
        is_active: true,
        postpone_note: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subjects: s.subjects ?? {
          id: s.subject_id,
          name: s.subject_id,
          name_bn: null,
        },
      }
      routineStore.insert(routineEntry)
    }
  }
}

// ─── Fetch All ExamHeld ───────────────────────────────────────────────────────

async function fetchExamHelds(): Promise<ExamHeld[]> {
  // TODO: replace with Supabase when tables are ready
  // const { data, error } = await supabase
  //   .from('exam_held')
  //   .select(`*, classes (id, name), batches (id, name), exam_held_schedules (*, subjects (id, name, name_bn))`)
  //   .order('created_at', { ascending: false })
  // if (error) throw error
  // return data as ExamHeld[]
  return store.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function useExamHelds() {
  return useQuery({
    queryKey: examHeldKeys.all,
    queryFn: fetchExamHelds,
    staleTime: 0,
  })
}

// ─── Fetch Single ExamHeld ────────────────────────────────────────────────────

async function fetchExamHeld(id: string): Promise<ExamHeld> {
  // TODO: replace with Supabase when tables are ready
  const found = store.getOne(id)
  if (!found) throw new Error('Exam not found')
  return found
}

export function useExamHeld(id: string | null) {
  return useQuery({
    queryKey: examHeldKeys.detail(id ?? ''),
    queryFn: () => fetchExamHeld(id!),
    enabled: !!id,
    staleTime: 0,
  })
}

// ─── Create ExamHeld ──────────────────────────────────────────────────────────

async function createExamHeld(dto: CreateExamHeldDto): Promise<ExamHeld> {
  // TODO: replace with Supabase when tables are ready
  // const { data: { user } } = await supabase.auth.getUser()
  // const { data, error } = await supabase.from('exam_held').insert({ ...dto, created_by: user?.id }).select().single()
  // if (error) throw error
  // return data as ExamHeld
  const newExam: ExamHeld = {
    id: crypto.randomUUID(),
    ...dto,
    class_id: dto.class_id ?? null,
    batch_id: dto.batch_id ?? null,
    pass_marks: dto.pass_marks ?? null,
    instructions: dto.instructions ?? null,
    status: 'SCHEDULED',
    result_published: false,
    created_by: 'local-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exam_held_schedules: [],
    // class/batch names will be resolved in the component from dropdown selection
    classes: dto.class_id ? { id: dto.class_id, name: dto.class_id } : undefined,
    batches: dto.batch_id ? { id: dto.batch_id, name: dto.batch_id } : undefined,
  }
  return store.insert(newExam)
}

export function useCreateExamHeld() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExamHeld,
    onSuccess: () => qc.invalidateQueries({ queryKey: examHeldKeys.all }),
  })
}

// ─── Update ExamHeld Status ───────────────────────────────────────────────────

async function updateExamHeldStatus({ id, status }: { id: string; status: ExamHeld['status'] }) {
  // TODO: replace with Supabase when tables are ready
  // const { error } = await supabase.from('exam_held').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  // if (error) throw error
  store.update(id, { status, updated_at: new Date().toISOString() })
}

export function useUpdateExamHeldStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateExamHeldStatus,
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: examHeldKeys.all })
      qc.invalidateQueries({ queryKey: examHeldKeys.detail(id) })
    },
  })
}

// ─── Delete ExamHeld ──────────────────────────────────────────────────────────

async function deleteExamHeld(id: string) {
  // TODO: replace with Supabase when tables are ready
  // const { error } = await supabase.from('exam_held').delete().eq('id', id)
  // if (error) throw error
  store.remove(id)
  // Cascade: remove synced FORMAL_EXAM routine entries (Supabase handles this via FK CASCADE)
  const linked = routineStore.getWhere(r => r.source_exam_held_id === id)
  for (const r of linked) routineStore.remove(r.id)
}

export function useDeleteExamHeld() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExamHeld,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: examHeldKeys.all })
      qc.invalidateQueries({ queryKey: ['routines'] })
    },
  })
}

// ─── Publish / Unpublish Results ─────────────────────────────────────────────

async function publishResults({ id, published }: { id: string; published: boolean }) {
  store.update(id, { result_published: published, updated_at: new Date().toISOString() })
}

export function usePublishResults() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: publishResults,
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: examHeldKeys.all })
      qc.invalidateQueries({ queryKey: examHeldKeys.detail(id) })
    },
  })
}

// The DB trigger will auto-sync these into routines table

async function saveSchedules({
  examHeldId,
  schedules,
}: {
  examHeldId: string
  schedules: CreateScheduleDto[]
}) {
  // TODO: replace with Supabase when tables are ready (DB trigger handles routine sync)
  // const { error: delError } = await supabase.from('exam_held_schedules').delete().eq('exam_held_id', examHeldId)
  // if (delError) throw delError
  // if (schedules.length === 0) return
  // const { error } = await supabase.from('exam_held_schedules').insert(schedules.map(s => ({ ...s, exam_held_id: examHeldId })))
  // if (error) throw error
  const existing = store.getOne(examHeldId)
  if (!existing) throw new Error('Exam not found')

  const newSchedules = schedules.map(s => ({
    id: crypto.randomUUID(),
    exam_held_id: examHeldId,
    subject_id: s.subject_id,
    date: s.date,
    start_time: s.start_time,
    end_time: s.end_time,
    room: s.room ?? null,
    total_marks: s.total_marks ?? null,
    pass_marks: s.pass_marks ?? null,
    created_at: new Date().toISOString(),
    subjects: {
      id: s.subject_id,
      name: s.subject_name ?? s.subject_id,   // use human-readable name if available
      name_bn: null,
    },
  }))

  store.update(examHeldId, {
    updated_at: new Date().toISOString(),
    exam_held_schedules: newSchedules,
  })

  // ── Local "DB trigger": sync exam schedules → routines store ───────────────
  // In production, Supabase handles this via a DB trigger on exam_held_schedules.
  // Locally we replicate the same behaviour manually.

  // 1. Delete all existing FORMAL_EXAM routine entries for this exam
  const oldEntries = routineStore.getWhere(r => r.source_exam_held_id === examHeldId)
  for (const old of oldEntries) {
    routineStore.remove(old.id)
  }

  // 2. Insert fresh FORMAL_EXAM routine entries for each schedule
  for (const s of newSchedules) {
    const routineEntry: Routine = {
      id: crypto.randomUUID(),
      target_type: existing.target_type,
      class_id: existing.class_id,
      section_id: null,
      batch_id: existing.batch_id,
      entry_type: 'FORMAL_EXAM',
      subject_id: s.subject_id,
      teacher_id: null,
      day: null,                      // exam entries use specific_date, not day
      specific_date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      room: s.room,
      source_exam_held_id: examHeldId,
      is_active: true,
      postpone_note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Carry joined subject info so the UI can display the name immediately
      subjects: s.subjects,
    }
    routineStore.insert(routineEntry)
  }
}

export function useSaveSchedules(examHeldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (schedules: CreateScheduleDto[]) =>
      saveSchedules({ examHeldId, schedules }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: examHeldKeys.detail(examHeldId) })
      qc.invalidateQueries({ queryKey: ['routines'] })
      qc.invalidateQueries({ queryKey: examHeldKeys.all })
    },
  })
}
