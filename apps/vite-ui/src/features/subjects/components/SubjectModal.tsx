import { useState } from 'react'
import { X, BookOpen, Hash, FileText } from 'lucide-react'
import type { Subject, SubjectFormData, SubjectPaper, ClassGroupType } from '../types'
import { PAPER_LABELS } from '../types'

interface Props {
  isOpen: boolean
  editing: Subject | null
  onClose: () => void
  onSave: (data: SubjectFormData) => void
}

const CLASSES = [
  { id: 'cls-1', label: 'Class 1' }, { id: 'cls-2', label: 'Class 2' },
  { id: 'cls-3', label: 'Class 3' }, { id: 'cls-4', label: 'Class 4' },
  { id: 'cls-5', label: 'Class 5' }, { id: 'cls-6', label: 'Class 6' },
  { id: 'cls-7', label: 'Class 7' }, { id: 'cls-8', label: 'Class 8' },
  { id: 'cls-9', label: 'Class 9–10 (SSC)' },
  { id: 'cls-11', label: 'Class 11–12 (HSC)' },
]

const GROUPS: { id: string; label: string; name: ClassGroupType }[] = [
  { id: 'grp-sci', label: 'Science', name: 'SCIENCE' },
  { id: 'grp-arts', label: 'Arts', name: 'ARTS' },
  { id: 'grp-com', label: 'Commerce', name: 'COMMERCE' },
]

const PAPERS: SubjectPaper[] = ['NONE', 'FIRST', 'SECOND']

export function SubjectModal({ isOpen, editing, onClose, onSave }: Props) {
  const [form, setForm] = useState<SubjectFormData>(() =>
    editing
      ? {
          classId: editing.classId,
          groupId: editing.groupId,
          name: editing.name,
          nameBn: editing.nameBn,
          code: editing.code,
          paper: editing.paper,
          totalMarks: editing.totalMarks,
          passMarks: editing.passMarks,
          isOptional: editing.isOptional,
        }
      : {
          classId: 'cls-6',
          groupId: undefined,
          name: '',
          nameBn: '',
          code: '',
          paper: 'NONE',
          totalMarks: 100,
          passMarks: 33,
          isOptional: false,
        }
  )

  if (!isOpen) return null

  const showGroups = form.classId === 'cls-9' || form.classId === 'cls-11'

  const set = <K extends keyof SubjectFormData>(key: K, val: SubjectFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <BookOpen size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-[15px]">
                {editing ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <p className="text-xs text-zinc-400">Define curriculum subjects</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Class + Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Class *</label>
              <select
                value={form.classId}
                onChange={e => set('classId', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Group {showGroups ? '*' : <span className="text-zinc-400">(optional)</span>}
              </label>
              <select
                value={form.groupId ?? ''}
                onChange={e => set('groupId', e.target.value || undefined)}
                disabled={!showGroups}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 disabled:opacity-40"
              >
                <option value="">All Groups</option>
                {GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Subject Name (EN) *</label>
              <div className="relative">
                <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Subject Name (BN)</label>
              <input
                value={form.nameBn}
                onChange={e => set('nameBn', e.target.value)}
                placeholder="e.g. Physics"
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>
          </div>

          {/* Code + Paper */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Subject Code *</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="e.g. PHY"
                  maxLength={8}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Paper</label>
              <div className="flex gap-1.5">
                {PAPERS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('paper', p)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                      form.paper === p
                        ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-violet-300'
                    }`}
                  >
                    {PAPER_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Total Marks</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={form.totalMarks}
                  onChange={e => set('totalMarks', Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Pass Marks</label>
              <input
                type="number"
                min={0}
                value={form.passMarks}
                onChange={e => set('passMarks', Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>
          </div>

          {/* Optional toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
            <input
              type="checkbox"
              checked={form.isOptional}
              onChange={e => set('isOptional', e.target.checked)}
              className="w-4 h-4 accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium text-zinc-800">Optional Subject</p>
              <p className="text-xs text-zinc-500">Students can opt out of this subject</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20">
              {editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
