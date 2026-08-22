import { useState, useEffect, useMemo } from 'react'
import { X, Plus, Trash2, Save, RefreshCw } from 'lucide-react'
import type { ExamHeld, CreateScheduleDto } from '../types'
import { MOCK_SUBJECTS } from '@/features/teachers/mockData'

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
    const filtered = MOCK_SUBJECTS.filter((s) => s.classes.includes(exam.class_id!))
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{exam.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set subject-wise exam dates and times.
              After saving, they will automatically be added to the routine.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-4">
            <X size={20} />
          </button>
        </div>

        {/* Sync notice */}
        <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex-shrink-0">
          <RefreshCw size={12} className="flex-shrink-0" />
          Saving will automatically add entries as <strong className="font-semibold">FORMAL_EXAM</strong> in the Routine.
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_130px_80px_80px_70px_70px_60px_36px] gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
              <span>Subject</span>
              <span>Date</span>
              <span>Start</span>
              <span>End</span>
              <span>Marks</span>
              <span>Pass</span>
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
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full"
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
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full"
                />

                {/* Start Time */}
                <input
                  type="time"
                  value={row.start_time}
                  onChange={(e) => updateRow(row._key, { start_time: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full"
                />

                {/* End Time */}
                <input
                  type="time"
                  value={row.end_time}
                  onChange={(e) => updateRow(row._key, { end_time: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full"
                />

                {/* Total Marks */}
                <input
                  type="number"
                  min={1}
                  placeholder={String(exam.total_marks)}
                  value={row.total_marks ?? ''}
                  onChange={(e) => updateRow(row._key, { total_marks: e.target.value === '' ? null : Number(e.target.value) })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 w-full text-center"
                />

                {/* Pass Marks */}
                <input
                  type="number"
                  min={0}
                  placeholder={exam.pass_marks ? String(exam.pass_marks) : '33%'}
                  value={row.pass_marks ?? ''}
                  onChange={(e) => updateRow(row._key, { pass_marks: e.target.value === '' ? null : Number(e.target.value) })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 w-full text-center"
                />

                {/* Room */}
                <input
                  type="text"
                  placeholder="Room"
                  value={row.room ?? ''}
                  onChange={(e) => updateRow(row._key, { room: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 w-full"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeRow(row._key)}
                  disabled={rows.length === 1}
                  className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center"
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
            className="mt-4 flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus size={14} />
            Add Another Subject
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800 flex-shrink-0">
          <p className="text-xs text-slate-500">
            {rows.filter((r) => r.subject_id && r.date).length} / {rows.length} subjects filled
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
            >
              <Save size={15} />
              {isSaving ? 'Saving...' : 'Save + Add to Routine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
