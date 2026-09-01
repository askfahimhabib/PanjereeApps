import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2, Save, RefreshCw } from 'lucide-react'
import type { ExamHeld, CreateScheduleDto } from '../types'
import { subjectStore } from '@/data/stores'

const MOCK_SUBJECTS = subjectStore.getAll()

interface Props {
  open: boolean
  exam: ExamHeld | null
  onClose: () => void
  onSave: (schedules: CreateScheduleDto[]) => void
  isSaving?: boolean
}


type Row = Omit<CreateScheduleDto, 'subject_id'> & { subject_id: string; _key: number }

let _key = 0
const newRow = (): Row => ({
  _key: ++_key,
  subject_id: '',
  date: '',
  start_time: '09:00',
  end_time: '12:00',
  room: '',
  total_marks: null,
  pass_marks: null,
})

export function SubjectSchedulePicker({ open, exam, onClose, onSave, isSaving }: Props) {
  const [rows, setRows] = useState<Row[]>([newRow()])

  // Filter subjects by the exam's class — falls back to all subjects if class_id not set or no match
  const classSubjects = useMemo(() => {
    if (!exam?.class_id) return MOCK_SUBJECTS
    const filtered = MOCK_SUBJECTS.filter((s) => s.classId === exam.class_id!)
    return filtered.length > 0 ? filtered : MOCK_SUBJECTS
  }, [exam?.class_id])

  // Pre-fill from existing schedules when editing
  useEffect(() => {
    if (exam?.exam_held_schedules && exam.exam_held_schedules.length > 0) {
      setRows(
        exam.exam_held_schedules.map((s) => ({
          _key: ++_key,
          subject_id: s.subject_id,
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
          room: s.room ?? '',
          total_marks: s.total_marks ?? null,
          pass_marks: s.pass_marks ?? null,
        }))
      )
    } else {
      setRows([newRow()])
    }
  }, [exam])

  const addRow = () => setRows((r) => [...r, newRow()])
  const removeRow = (key: number) => setRows((r) => r.filter((x) => x._key !== key))
  const updateRow = (key: number, patch: Partial<Row>) =>
    setRows((r) => r.map((x) => (x._key === key ? { ...x, ...patch } : x)))

  const handleSave = () => {
    const valid = rows.filter((r) => r.subject_id && r.date && r.start_time && r.end_time)
    onSave(valid.map(({ _key: _k, ...rest }) => ({
      ...rest,
      subject_name: classSubjects.find((s) => s.id === rest.subject_id)?.name ?? rest.subject_id,
    })))
  }

  if (!open || !exam) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">{exam.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Set subject-wise exam dates and times.
              After saving, they will automatically be added to the routine.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors ml-4 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sync notice */}
        <div className="mx-6 mt-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex-shrink-0 font-medium">
          <RefreshCw size={13} className="flex-shrink-0 text-indigo-600" />
          <span>Saving will automatically synchronize entries into the official Routine schedule.</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_130px_80px_80px_70px_70px_60px_36px] gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">
              <span>Subject</span>
              <span>Date</span>
              <span>Start</span>
              <span>End</span>
              <span className="text-center">Marks</span>
              <span className="text-center">Pass</span>
              <span>Room</span>
              <span />
            </div>

            {rows.map((row) => (
              <div
                key={row._key}
                className="grid grid-cols-[1fr_130px_80px_80px_70px_70px_60px_36px] gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200"
              >
                {/* Subject */}
                <select
                  value={row.subject_id}
                  onChange={(e) => updateRow(row._key, { subject_id: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full cursor-pointer"
                >
                  <option value="">— Subject —</option>
                  {classSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                {/* Date */}
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => updateRow(row._key, { date: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full"
                />

                {/* Start Time */}
                <input
                  type="time"
                  value={row.start_time}
                  onChange={(e) => updateRow(row._key, { start_time: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full text-center"
                />

                {/* End Time */}
                <input
                  type="time"
                  value={row.end_time}
                  onChange={(e) => updateRow(row._key, { end_time: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full text-center"
                />

                {/* Total Marks */}
                <input
                  type="number"
                  min={1}
                  placeholder={String(exam.total_marks)}
                  value={row.total_marks ?? ''}
                  onChange={(e) => updateRow(row._key, { total_marks: e.target.value === '' ? null : Number(e.target.value) })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-1.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full text-center font-mono font-bold"
                />

                {/* Pass Marks */}
                <input
                  type="number"
                  min={0}
                  placeholder={exam.pass_marks ? String(exam.pass_marks) : '33%'}
                  value={row.pass_marks ?? ''}
                  onChange={(e) => updateRow(row._key, { pass_marks: e.target.value === '' ? null : Number(e.target.value) })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-1.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full text-center font-mono"
                />

                {/* Room */}
                <input
                  type="text"
                  placeholder="Room"
                  value={row.room ?? ''}
                  onChange={(e) => updateRow(row._key, { room: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-2 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-full"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeRow(row._key)}
                  disabled={rows.length === 1}
                  className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  title="Remove subject"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Row */}
          <button
            type="button"
            onClick={addRow}
            className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-50 border border-dashed border-indigo-200 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Another Subject</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <p className="text-xs text-zinc-500 font-medium">
            {rows.filter((r) => r.subject_id && r.date).length} of {rows.length} subjects configured
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save & Sync Routine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body
  )
}
