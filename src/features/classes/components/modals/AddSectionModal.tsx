import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { AddSectionFormData } from '../../useClassDetail'

// Mock teachers — later replace with real useTeachers() data
const MOCK_TEACHERS = [
  { id: 'tch-1', name: 'Md. Rahim Uddin' },
  { id: 'tch-2', name: 'Fatema Begum' },
  { id: 'tch-3', name: 'Abdus Salam' },
  { id: 'tch-4', name: 'Nusrat Jahan' },
  { id: 'tch-5', name: 'Kamal Hossain' },
]

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
    const teacher = MOCK_TEACHERS.find(t => t.id === id)
    setForm(prev => ({
      ...prev,
      classTeacherId: id,
      classTeacherName: teacher?.name ?? '',
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Section</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              For {className}{groupName ? ` · ${groupName}` : ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Section Name <span className="text-red-400">*</span>
              <span className="text-slate-500 font-normal ml-1">(e.g. A, B, Padma, Meghna)</span>
            </label>
            <input
              type="text"
              placeholder="A"
              value={form.name}
              onChange={e => {
                setForm(prev => ({ ...prev, name: e.target.value }))
                setError('')
              }}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Max Capacity
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.capacity}
              onChange={e =>
                setForm(prev => ({ ...prev, capacity: Number(e.target.value) }))
              }
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Class Teacher */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Class Teacher <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <select
              value={form.classTeacherId}
              onChange={e => handleTeacherChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select a teacher...</option>
              {MOCK_TEACHERS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      </div>
    </div>
  )
}
