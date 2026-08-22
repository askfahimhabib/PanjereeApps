import { useState, useEffect } from 'react'
import { X, Save, Pencil } from 'lucide-react'
import type { Section } from '../../types'
import type { EditSectionFormData } from '../../useSectionDetail'

const MOCK_TEACHERS = [
  { id: 'tch-1', name: 'Md. Rahim Uddin' },
  { id: 'tch-2', name: 'Fatema Begum' },
  { id: 'tch-3', name: 'Abdus Salam' },
  { id: 'tch-4', name: 'Nusrat Jahan' },
  { id: 'tch-5', name: 'Kamal Hossain' },
]

interface EditSectionModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section | null
  onSave: (data: EditSectionFormData) => void
}

const inputCls =
  'w-full px-3 py-2.5 bg-slate-800 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

export function EditSectionModal({ isOpen, onClose, section, onSave }: EditSectionModalProps) {
  const [form, setForm] = useState<EditSectionFormData>({
    name: '',
    capacity: 45,
    classTeacherId: '',
    classTeacherName: '',
    status: 'ACTIVE',
  })
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})

  useEffect(() => {
    if (section && isOpen) {
      setForm({
        name: section.name,
        capacity: section.capacity,
        classTeacherId: section.classTeacherId ?? '',
        classTeacherName: section.classTeacherName ?? '',
        status: section.status,
      })
      setSaved(false)
      setErrors({})
    }
  }, [section, isOpen])

  if (!isOpen || !section) return null

  const validate = (): boolean => {
    if (!form.name.trim()) {
      setErrors({ name: 'Section name is required.' })
      return false
    }
    setErrors({})
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(form)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 700)
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Pencil size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Edit Section</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {section.className}{section.groupName ? ` · ${section.groupName}` : ''} — Section {section.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Section Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => {
                setForm(prev => ({ ...prev, name: e.target.value }))
                setErrors({})
              }}
              className={inputCls}
              placeholder="e.g. A, B, Padma"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Capacity</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.capacity}
              onChange={e => setForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
              className={inputCls}
            />
            <p className="text-xs text-slate-500 mt-1">
              Current students: <span className="text-slate-300">{section.totalStudents}</span>
            </p>
          </div>

          {/* Class Teacher */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Class Teacher</label>
            <select
              value={form.classTeacherId}
              onChange={e => handleTeacherChange(e.target.value)}
              className={inputCls}
            >
              <option value="">— No class teacher —</option>
              {MOCK_TEACHERS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['ACTIVE', 'INACTIVE'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setForm(prev => ({ ...prev, status: s }))}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.status === s
                      ? s === 'ACTIVE'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {s === 'ACTIVE' ? '✓ Active' : '✗ Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all ${
              saved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
