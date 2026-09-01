import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, Trash2, AlertTriangle, GraduationCap, Target } from 'lucide-react'
import type { Routine, DayOfWeek, RoutineEntryType, CreateRoutineDto, RoutineTargetType } from '../types'
import { DAY_LABELS, WEEKDAYS } from '../types'
import { subjectStore, teacherStore, classStore, sectionStore, batchStore, routineStore } from '@/data/stores'
import { checkRoutineClash } from '../utils/routineClashDetection'

const MOCK_SUBJECTS = subjectStore.getAll()
const TEACHER_LIST  = teacherStore.getAll()
const CLASSES_LIST  = classStore.getAll().filter(c => c.isActive !== false)
const BATCHES_LIST  = batchStore.getAll()

interface Props {
  open: boolean
  classId?: string
  batchId?: string
  targetType?: RoutineTargetType
  prefillDay?: DayOfWeek
  editing?: Routine | null
  onClose: () => void
  onSave: (dto: CreateRoutineDto) => void
  onDelete?: (id: string) => void
  isSaving?: boolean
}

// Simplified teacher list for dropdown
const MOCK_TEACHERS = TEACHER_LIST.map(t => ({ id: t.id, full_name: t.fullName }))

const ENTRY_TYPES: { value: RoutineEntryType; label: string }[] = [
  { value: 'CLASS', label: '📘 Regular Class' },
  { value: 'CLASS_EXAM', label: '📝 Class Test (CT)' },
  { value: 'OFF_DAY', label: '🚫 Off Day' },
]

export function RoutineSlotModal({
  open,
  classId,
  batchId,
  targetType = 'CLASS',
  prefillDay,
  editing,
  onClose,
  onSave,
  onDelete,
  isSaving,
}: Props) {
  const [form, setForm] = useState<Partial<CreateRoutineDto>>({
    entry_type: 'CLASS',
    target_type: targetType,
    class_id: classId ?? CLASSES_LIST[0]?.id,
    batch_id: batchId ?? BATCHES_LIST[0]?.id,
  })

  // Dynamic subjects based on class or batch
  const classSubjects = useMemo(() => {
    const activeClassId = form.class_id ?? classId
    if (!activeClassId) return MOCK_SUBJECTS
    const filtered = MOCK_SUBJECTS.filter(s => s.classId === activeClassId)
    return filtered.length > 0 ? filtered : MOCK_SUBJECTS
  }, [classId, form.class_id])

  // Sections for selected class
  const classSections = useMemo(() => {
    const activeClassId = form.class_id ?? classId
    if (!activeClassId) return []
    return sectionStore.getWhere(s => s.classId === activeClassId)
  }, [classId, form.class_id])

  // Populate when editing
  useEffect(() => {
    if (editing) {
      setForm({
        entry_type: editing.entry_type,
        target_type: editing.target_type,
        class_id: editing.class_id ?? undefined,
        batch_id: editing.batch_id ?? undefined,
        section_id: editing.section_id ?? undefined,
        subject_id: editing.subject_id ?? undefined,
        teacher_id: editing.teacher_id ?? undefined,
        day: editing.day ?? undefined,
        specific_date: editing.specific_date ?? undefined,
        start_time: editing.start_time,
        end_time: editing.end_time,
        room: editing.room ?? undefined,
        topic: editing.topic ?? undefined,
        total_marks: editing.total_marks ?? undefined,
      })
    } else {
      setForm({
        entry_type: targetType === 'BATCH' ? 'CLASS_EXAM' : 'CLASS',
        target_type: targetType,
        class_id: classId ?? CLASSES_LIST[0]?.id,
        batch_id: batchId ?? BATCHES_LIST[0]?.id,
        day: prefillDay ?? 'SUNDAY',
        start_time: targetType === 'BATCH' ? '14:00' : '09:00',
        end_time: targetType === 'BATCH' ? '16:00' : '09:45',
        room: targetType === 'BATCH' ? 'Exam Hall 1' : 'Room 101',
      })
    }
  }, [editing, prefillDay, classId, batchId, targetType])

  const set = <K extends keyof CreateRoutineDto>(key: K, val: CreateRoutineDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  // Real-time Clash Detection
  const clashes = useMemo(() => {
    if (!open || form.entry_type === 'OFF_DAY') return []
    const allRoutines = routineStore.getAll()
    return checkRoutineClash(form, allRoutines, editing?.id)
  }, [open, form, editing?.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.entry_type === 'OFF_DAY') {
      onSave({
        ...form,
        start_time: '00:00',
        end_time: '23:59',
        target_type: form.target_type ?? targetType,
      } as CreateRoutineDto)
      return
    }
    if (!form.start_time || !form.end_time) return
    onSave({
      ...form,
      target_type: form.target_type ?? targetType,
    } as CreateRoutineDto)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              {editing ? 'Update Routine Slot' : 'Add New Routine Slot'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {form.target_type === 'CLASS' ? 'Academic Class Schedule' : 'Exam Batch Schedule'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Type Toggle */}
          {!classId && !batchId && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Schedule Category</label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => set('target_type', 'CLASS')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.target_type === 'CLASS'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <GraduationCap size={15} />
                  Academic Class
                </button>
                <button
                  type="button"
                  onClick={() => set('target_type', 'BATCH')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.target_type === 'BATCH'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Target size={15} />
                  Exam Batch
                </button>
              </div>
            </div>
          )}

          {/* Academic Class & Section Selection */}
          {form.target_type === 'CLASS' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Class</label>
                <select
                  value={form.class_id ?? ''}
                  onChange={(e) => set('class_id', e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  {CLASSES_LIST.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Section (Optional)</label>
                <select
                  value={form.section_id ?? ''}
                  onChange={(e) => set('section_id', e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="">All Sections</option>
                  {classSections.map((s) => (
                    <option key={s.id} value={s.id}>Section {s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Exam Batch</label>
              <select
                value={form.batch_id ?? ''}
                onChange={(e) => set('batch_id', e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                {BATCHES_LIST.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.examName})</option>
                ))}
              </select>
            </div>
          )}

          {/* Entry Type */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Slot Type</label>
            <div className="flex gap-2">
              {ENTRY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('entry_type', t.value)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    form.entry_type === t.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Day of Week</label>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('day', d)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    form.day === d
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {DAY_LABELS[d].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Conditionally hide subject/teacher fields if OFF_DAY */}
          {form.entry_type !== 'OFF_DAY' && (
            <>
              {/* Subject & Teacher */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Subject</label>
                  <select
                    value={form.subject_id ?? ''}
                    onChange={(e) => set('subject_id', e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="">Select Subject</option>
                    {classSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.nameBn ? `${s.name} (${s.nameBn})` : s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Teacher</label>
                  <select
                    value={form.teacher_id ?? ''}
                    onChange={(e) => set('teacher_id', e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="">Select Teacher</option>
                    {MOCK_TEACHERS.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific for Class Test (CT) */}
              {form.entry_type === 'CLASS_EXAM' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <span>📝 Class Test Details</span>
                  </div>
                  <div className="grid grid-cols-[1fr_100px] gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Topic / Syllabus</label>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 3: Force & Laws"
                        value={form.topic ?? ''}
                        onChange={(e) => set('topic', e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Total Marks</label>
                      <input
                        type="number"
                        placeholder="25"
                        min="1"
                        max="100"
                        value={form.total_marks ?? ''}
                        onChange={(e) => set('total_marks', parseInt(e.target.value) || undefined)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Time & Room */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Start</label>
                  <input
                    type="time"
                    value={form.start_time ?? ''}
                    onChange={(e) => set('start_time', e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-center font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">End</label>
                  <input
                    type="time"
                    value={form.end_time ?? ''}
                    onChange={(e) => set('end_time', e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-center font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Room</label>
                  <input
                    type="text"
                    placeholder="Room 101"
                    value={form.room ?? ''}
                    onChange={(e) => set('room', e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Clash Warning Alert ────────────────────────────────────────── */}
          {clashes.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <span>Scheduling Conflict Detected!</span>
              </div>
              {clashes.map((c, i) => (
                <p key={i} className="text-xs text-rose-800 pl-5">
                  • {c.message}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-zinc-100">
            {editing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this slot?')) {
                    onDelete(editing.id)
                    onClose()
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : editing ? 'Update Slot' : 'Save Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  , document.body
  )
}

