import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Users } from 'lucide-react'
import type { AddSectionFormData } from '../../useClassDetail'
import { teacherStore } from '@/data/stores'

const INITIAL: AddSectionFormData = {
  name: '',
  capacity: 45,
  classTeacherId: '',
  classTeacherName: '',
}

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  classId?: string
  className?: string
  groupId?: string
  groupName?: string
  onAdd: (data: AddSectionFormData, groupId?: string, groupName?: string) => void
}

export function AddSectionModal({
  isOpen,
  onClose,
  className,
  groupId,
  groupName,
  onAdd,
}: AddSectionModalProps) {
  const [form, setForm] = useState<AddSectionFormData>(INITIAL)
  const [error, setError] = useState('')

  const teachers = useMemo(() => teacherStore.getAll(), [])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError('Section name is required.')
      return
    }
    onAdd(form, groupId, groupName)
    setForm(INITIAL)
    setError('')
    onClose()
  }

  const handleClose = () => {
    setForm(INITIAL)
    setError('')
    onClose()
  }

  const handleTeacherChange = (id: string) => {
    const teacher = teachers.find(t => t.id === id)
    setForm(prev => ({
      ...prev,
      classTeacherId: id,
      classTeacherName: teacher?.fullName ?? '',
    }))
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-black text-zinc-900">Add New Section</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Creating section for <strong className="text-zinc-800">{className}</strong>
              {groupName ? ` · ${groupName}` : ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Section Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Section Name <span className="text-rose-500">*</span>
              <span className="text-zinc-400 font-normal lowercase ml-1">(e.g. A, B, Padma, Meghna)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. A"
              value={form.name}
              onChange={e => {
                setForm(prev => ({ ...prev, name: e.target.value }))
                setError('')
              }}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              autoFocus
            />
            {error && <p className="text-rose-600 text-xs mt-1 font-semibold">{error}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Maximum Student Capacity
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={120}
                value={form.capacity}
                onChange={e =>
                  setForm(prev => ({ ...prev, capacity: Number(e.target.value) }))
                }
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
              <Users size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          {/* Class Teacher */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Assigned Class Teacher <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={form.classTeacherId}
                onChange={e => handleTeacherChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              >
                <option value="">Select a teacher...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.designation || 'Teacher'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Section</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
