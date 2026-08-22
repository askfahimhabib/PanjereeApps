import { useState, useEffect, useMemo } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import type { Routine, DayOfWeek, RoutineEntryType, CreateRoutineDto } from '../types'
import { DAY_LABELS, WEEKDAYS } from '../types'
import { MOCK_SUBJECTS, MOCK_TEACHERS as TEACHER_LIST } from '@/features/teachers/mockData'

interface Props {
  open: boolean
  classId?: string
  batchId?: string
  prefillDay?: DayOfWeek
  editing?: Routine | null
  onClose: () => void
  onSave: (dto: CreateRoutineDto) => void
  onDelete?: (id: string) => void
  isSaving?: boolean
}

// Simplified teacher list for the dropdown
const MOCK_TEACHERS = TEACHER_LIST.map(t => ({ id: t.id, full_name: t.fullName }))

const ENTRY_TYPES: { value: RoutineEntryType; label: string }[] = [
  { value: 'CLASS', label: '📘 Class' },
  { value: 'CLASS_EXAM', label: '📝 Class Test' },
  { value: 'OFF_DAY', label: '🚫 Off Day' },
]

export function RoutineSlotModal({ open, classId, batchId, prefillDay, editing, onClose, onSave, onDelete, isSaving }: Props) {
  const [form, setForm] = useState<Partial<CreateRoutineDto>>({
    entry_type: 'CLASS',
    target_type: classId ? 'CLASS' : 'BATCH',
    class_id: classId,
    batch_id: batchId,
  })

  // Dynamically filter subjects based on the active classId
  const classSubjects = useMemo(() => {
    const activeClassId = classId ?? form.class_id
    if (!activeClassId) return MOCK_SUBJECTS
    const filtered = MOCK_SUBJECTS.filter(s => s.classes.includes(activeClassId))
    return filtered.length > 0 ? filtered : MOCK_SUBJECTS
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
      })
    } else {
      setForm({
        entry_type: 'CLASS',
        target_type: classId ? 'CLASS' : 'BATCH',
        class_id: classId,
        batch_id: batchId,
        day: prefillDay,
      })
    }
  }, [editing, prefillDay, classId, batchId])

  const set = <K extends keyof CreateRoutineDto>(key: K, val: CreateRoutineDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.entry_type === 'OFF_DAY') {
      onSave({ ...form, start_time: '00:00', end_time: '23:59' } as CreateRoutineDto)
      return
    }
    if (!form.start_time || !form.end_time) return
    onSave(form as CreateRoutineDto)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            {editing ? 'Update Slot' : 'Add New Slot'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Entry Type */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
            <div className="flex gap-2">
              {ENTRY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('entry_type', t.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                    form.entry_type === t.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Day</label>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('day', d)}
                  className={`py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                    form.day === d
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {DAY_LABELS[d].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Conditionally hide other fields if OFF_DAY */}
          {form.entry_type !== 'OFF_DAY' && (
            <>
              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
                <select
                  value={form.subject_id ?? ''}
                  onChange={(e) => set('subject_id', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Subject</option>
                  {classSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Teacher</label>
                <select
                  value={form.teacher_id ?? ''}
                  onChange={(e) => set('teacher_id', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Teacher</option>
                  {MOCK_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Start</label>
                  <input
                    type="time"
                    value={form.start_time ?? ''}
                    onChange={(e) => set('start_time', e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">End</label>
                  <input
                    type="time"
                    value={form.end_time ?? ''}
                    onChange={(e) => set('end_time', e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Room (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Room 101"
                  value={form.room ?? ''}
                  onChange={(e) => set('room', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {editing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this slot?')) {
                    onDelete(editing.id)
                    onClose()
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition-all"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : editing ? 'Update Slot' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
