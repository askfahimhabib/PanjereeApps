import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save } from 'lucide-react'
import type { CreateExamHeldDto, ExamScope } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'
import { classStore } from '@/data/stores'

const mockClasses = classStore.getAll()

interface Props {
  open: boolean
  onClose: () => void
  onSave: (dto: CreateExamHeldDto) => void
  isSaving?: boolean
}

const SCOPES = Object.entries(EXAM_SCOPE_LABELS) as [ExamScope, string][]

const MOCK_BATCHES = [
  { id: 'bat1', name: 'SSC 2026 Batch' },
  { id: 'bat2', name: 'HSC 2026 Batch' },
]


export function ExamHeldModal({ open, onClose, onSave, isSaving }: Props) {
  const [form, setForm] = useState<Partial<CreateExamHeldDto>>({
    target_type: 'CLASS',
    scope: 'MONTHLY',
    total_marks: 100,
  })

  const set = <K extends keyof CreateExamHeldDto>(key: K, val: CreateExamHeldDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm({ target_type: 'CLASS', scope: 'MONTHLY', total_marks: 100 })
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.scope || !form.total_marks) return
    onSave(form as CreateExamHeldDto)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Create New Exam</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Subject-wise schedule can be added later</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Exam Name *</label>
            <input
              type="text"
              placeholder="e.g. Mid Term Exam 2026"
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Scope */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Exam Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {SCOPES.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('scope', val)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    form.scope === val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Target *</label>
            <div className="flex gap-2">
              {(['CLASS', 'BATCH'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('target_type', t)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    form.target_type === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  {t === 'CLASS' ? '🏫 Class' : '📚 Exam Batch'}
                </button>
              ))}
            </div>
          </div>

          {/* Class or Batch selector */}
          {form.target_type === 'CLASS' ? (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Select Class *</label>
              <select
                value={form.class_id ?? ''}
                onChange={(e) => set('class_id', e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                <option value="">— Select Class —</option>
                {mockClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Select Batch *</label>
              <select
                value={form.batch_id ?? ''}
                onChange={(e) => set('batch_id', e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                <option value="">— Select Batch —</option>
                {MOCK_BATCHES.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Total Marks *</label>
              <input
                type="number"
                min={1}
                value={form.total_marks ?? ''}
                onChange={(e) => set('total_marks', Number(e.target.value))}
                required
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Pass Marks</label>
              <input
                type="number"
                min={1}
                placeholder="Optional"
                value={form.pass_marks ?? ''}
                onChange={(e) => set('pass_marks', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Special Instructions</label>
            <textarea
              rows={2}
              placeholder="Instructions for students (optional)"
              value={form.instructions ?? ''}
              onChange={(e) => set('instructions', e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer mt-2"
          >
            <Save size={16} />
            {isSaving ? 'Creating...' : 'Create Exam'}
          </button>
        </form>
      </div>
    </div>
  , document.body
  )
}
