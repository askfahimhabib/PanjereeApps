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

const inputCls =
  'w-full px-3 py-2.5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl text-sm text-zinc-800 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20">
              <BookOpen size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add New Class</h2>
              <p className="text-xs text-zinc-600 mt-0.5">Select a class and configure settings</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* ── Class Preset Picker ─────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-2">
              Select Class <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CLASS_PRESETS.map(preset => (
                <button
                  key={preset.numericName}
                  onClick={() => handlePresetSelect(preset)}
                  className={`relative py-2.5 px-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedPreset === preset.numericName
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-zinc-50 border-zinc-100 text-zinc-800 hover:border-blue-500/50 hover:text-white'
                  }`}
                >
                  {preset.label}
                  {preset.hasGroups && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-slate-900" title="Has Groups (Science/Arts/Commerce)" />
                  )}
                </button>
              ))}
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}

            {/* Custom name field */}
            <div className="mt-3">
              <label className="block text-xs text-zinc-600 mb-1">
                Or type a custom name
              </label>
              <input
                type="text"
                placeholder="e.g. Play Group, KG, Dakhil..."
                value={form.name}
                onChange={e => {
                  setSelectedPreset(null)
                  setForm(prev => ({ ...prev, name: e.target.value }))
                  setErrors({})
                }}
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Shift ────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-2">Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setForm(prev => ({ ...prev, shift: s.value }))}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.shift === s.value
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                      : 'bg-zinc-50 border-zinc-100 text-zinc-800 hover:border-indigo-500/50 hover:text-white'
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Academic Year ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-2">Academic Year</label>
            <select
              value={form.academicYear}
              onChange={e => setForm(prev => ({ ...prev, academicYear: e.target.value }))}
              className={inputCls}
            >
              {ACADEMIC_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* ── Has Groups toggle ─────────────────────────────────────────── */}
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
              form.hasGroups
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-zinc-50 border-zinc-100'
            }`}
            onClick={() => setForm(prev => ({ ...prev, hasGroups: !prev.hasGroups }))}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              form.hasGroups ? 'bg-emerald-600 border-emerald-500' : 'border-zinc-100'
            }`}>
              {form.hasGroups && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical size={14} className="text-emerald-400" />
                <span className="text-sm font-medium text-zinc-800">Has Academic Groups</span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                Enable for Science / Arts / Commerce divisions (typically Class 9+)
              </p>
            </div>
          </div>

          {/* ── Advanced (Fee) ────────────────────────────────────────────── */}
          <div>
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Advanced Settings
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                    Monthly Tuition Fee (৳) <span className="text-zinc-600 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.feeMonthly || ''}
                    onChange={e => setForm(prev => ({ ...prev, feeMonthly: Number(e.target.value) }))}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100 bg-white">
          <p className="text-xs text-zinc-600">
            {selectedPreset
              ? `Selected: ${form.name}`
              : form.name
              ? `Custom: ${form.name}`
              : 'No class selected'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-zinc-100 text-zinc-800 hover:bg-zinc-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
            >
              <Plus size={15} />
              Add Class
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body
  )
}
