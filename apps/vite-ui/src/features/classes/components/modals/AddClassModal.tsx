import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, BookOpen, Sun, Moon, Clock, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import type { AddClassFormData } from '../../useClasses'
import type { ShiftType } from '../../types'

interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: AddClassFormData) => void
}

// Preset class options
const CLASS_PRESETS = [
  { label: 'Class 1',  numericName: 1,  name: 'Class 1' },
  { label: 'Class 2',  numericName: 2,  name: 'Class 2' },
  { label: 'Class 3',  numericName: 3,  name: 'Class 3' },
  { label: 'Class 4',  numericName: 4,  name: 'Class 4' },
  { label: 'Class 5',  numericName: 5,  name: 'Class 5' },
  { label: 'Class 6',  numericName: 6,  name: 'Class 6' },
  { label: 'Class 7',  numericName: 7,  name: 'Class 7' },
  { label: 'Class 8',  numericName: 8,  name: 'Class 8' },
  { label: 'Class 9',  numericName: 9,  name: 'Class 9',  hasGroups: true },
  { label: 'Class 10', numericName: 10, name: 'Class 10', hasGroups: true },
  { label: 'HSC 1st Year', numericName: 11, name: 'HSC 1st Year', hasGroups: true },
  { label: 'HSC 2nd Year', numericName: 12, name: 'HSC 2nd Year', hasGroups: true },
]

const CURRENT_YEAR = new Date().getFullYear()
const ACADEMIC_YEARS = [
  `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`,
  `${CURRENT_YEAR - 1}-${CURRENT_YEAR}`,
  `${CURRENT_YEAR + 1}-${CURRENT_YEAR + 2}`,
]

const SHIFTS: { value: ShiftType; label: string; icon: React.ReactNode }[] = [
  { value: 'MORNING', label: 'Morning', icon: <Sun size={14} /> },
  { value: 'DAY',     label: 'Day',     icon: <Clock size={14} /> },
  { value: 'EVENING', label: 'Evening', icon: <Moon size={14} /> },
]

const INITIAL: AddClassFormData = {
  name: '',
  numericName: 1,
  academicYear: ACADEMIC_YEARS[0],
  shift: 'DAY',
  hasGroups: false,
  feeMonthly: 0,
}

export function AddClassModal({ isOpen, onClose, onAdd }: AddClassModalProps) {
  const [form, setForm] = useState<AddClassFormData>(INITIAL)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AddClassFormData, string>>>({})

  if (!isOpen) return null

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Class name is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePresetSelect = (preset: typeof CLASS_PRESETS[number]) => {
    setSelectedPreset(preset.numericName)
    setForm(prev => ({
      ...prev,
      name: preset.name,
      numericName: preset.numericName,
      hasGroups: preset.hasGroups ?? false,
    }))
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validate()) return
    onAdd(form)
    setForm(INITIAL)
    setSelectedPreset(null)
    setShowAdvanced(false)
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setForm(INITIAL)
    setSelectedPreset(null)
    setShowAdvanced(false)
    setErrors({})
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">Add New Class</h2>
              <p className="text-xs text-zinc-500 font-medium">Select a class preset or configure custom level</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* ── Class Preset Picker ─────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Select Class Preset <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CLASS_PRESETS.map(preset => (
                <button
                  key={preset.numericName}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`relative py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedPreset === preset.numericName
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:bg-zinc-100'
                  }`}
                >
                  {preset.label}
                  {preset.hasGroups && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Has Groups" />
                  )}
                </button>
              ))}
            </div>
            {errors.name && <p className="text-rose-600 text-xs mt-1.5 font-semibold">{errors.name}</p>}

            {/* Custom name field */}
            <div className="mt-3.5">
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Or type a custom name:
              </label>
              <input
                type="text"
                placeholder="e.g. Play Group, KG, Alim..."
                value={form.name}
                onChange={e => {
                  setSelectedPreset(null)
                  setForm(prev => ({ ...prev, name: e.target.value }))
                  setErrors({})
                }}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>
          </div>

          {/* ── Shift ────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFTS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, shift: s.value }))}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    form.shift === s.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Academic Year ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Academic Year</label>
            <select
              value={form.academicYear}
              onChange={e => setForm(prev => ({ ...prev, academicYear: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            >
              {ACADEMIC_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* ── Has Groups toggle ─────────────────────────────────────────── */}
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
              form.hasGroups
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-zinc-50 border-zinc-200'
            }`}
            onClick={() => setForm(prev => ({ ...prev, hasGroups: !prev.hasGroups }))}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
              form.hasGroups ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 bg-white'
            }`}>
              {form.hasGroups && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900">
                <FlaskConical size={14} className="text-emerald-600" />
                <span>Enable Academic Streams (Groups)</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Enables Science / Arts / Commerce streams (typically Class 9 to 12)
              </p>
            </div>
          </div>

          {/* ── Advanced (Fee) ────────────────────────────────────────────── */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>Optional Monthly Tuition Fee</span>
            </button>
            {showAdvanced && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Monthly Tuition Fee (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  value={form.feeMonthly || ''}
                  onChange={e => setForm(prev => ({ ...prev, feeMonthly: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
          <p className="text-xs text-zinc-500 font-medium truncate max-w-[200px]">
            {form.name ? `Creating: ${form.name}` : 'No class selected'}
          </p>
          <div className="flex items-center gap-2">
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
              <span>Create Class</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
