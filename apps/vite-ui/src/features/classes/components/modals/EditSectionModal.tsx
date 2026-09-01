import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, Pencil, CheckCircle } from 'lucide-react'
import type { Section } from '../../types'
import type { EditSectionFormData } from '../../useSectionDetail'
import { teacherStore } from '@/data/stores'

interface EditSectionModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section | null
  onSave: (data: EditSectionFormData) => void
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors'

export function EditSectionModal({ isOpen, onClose, section, onSave }: EditSectionModalProps) {
  const [teachers] = useState(() => teacherStore.getAll())
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
    const teacher = teachers.find(t => t.id === id)
    setForm(prev => ({
      ...prev,
      classTeacherId: id,
      classTeacherName: teacher?.fullName ?? '',
    }))
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700">
              <Pencil size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">Edit Section</h2>
              <p className="text-xs text-zinc-500 font-medium">
                {section.className}
                {section.groupName ? ` · ${section.groupName}` : ''} — Section {section.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
            {errors.name && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Max Capacity
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.capacity}
              onChange={e => setForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
              className={inputCls}
            />
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">
              Current enrolled students:{' '}
              <strong className="text-zinc-800">{section.totalStudents}</strong>
            </p>
          </div>

          {/* Class Teacher */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Class Teacher
            </label>
            <select
              value={form.classTeacherId}
              onChange={e => handleTeacherChange(e.target.value)}
              className={inputCls}
            >
              <option value="">— No class teacher assigned —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['ACTIVE', 'INACTIVE'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, status: s }))}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    form.status === s
                      ? s === 'ACTIVE'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-700 border-zinc-700 text-white shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {s === 'ACTIVE' ? '✓ Active' : '✗ Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
              saved
                ? 'bg-emerald-600 shadow-emerald-500/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
            }`}
          >
            {saved ? <CheckCircle size={15} /> : <Save size={15} />}
            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
