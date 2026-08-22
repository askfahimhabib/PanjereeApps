import { useState, useEffect } from 'react'
import { Calculator, X, Save } from 'lucide-react'
import type { ClassItem } from '../../types'
import type { UpdateFeeFormData } from '../../useClassDetail'

interface SetFeeModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassItem | null
  onSave: (data: UpdateFeeFormData) => void
}

export function SetFeeModal({ isOpen, onClose, classData, onSave }: SetFeeModalProps) {
  const [form, setForm] = useState<UpdateFeeFormData>({
    feeMonthly: 500,
    feeAdmission: 2500,
  })
  const [saved, setSaved] = useState(false)

  // Sync with classData when it changes or modal opens
  useEffect(() => {
    if (classData) {
      setForm({
        feeMonthly: classData.feeMonthly ?? 500,
        feeAdmission: 2500,
      })
    }
    setSaved(false)
  }, [classData, isOpen])

  if (!isOpen || !classData) return null

  const handleSave = () => {
    onSave(form)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              Fee Structure
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">For {classData.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Monthly Tuition Fee (৳)
            </label>
            <input
              type="number"
              min={0}
              value={form.feeMonthly}
              onChange={e => setForm(prev => ({ ...prev, feeMonthly: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Admission / Session Fee (৳)
            </label>
            <input
              type="number"
              min={0}
              value={form.feeAdmission}
              onChange={e => setForm(prev => ({ ...prev, feeAdmission: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Preview */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Annual Estimate</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monthly × 12</span>
              <span className="text-slate-200 font-medium">৳ {(form.feeMonthly * 12).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Session Fee</span>
              <span className="text-slate-200 font-medium">৳ {form.feeAdmission.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-slate-300">Total / Year</span>
              <span className="text-amber-400">৳ {(form.feeMonthly * 12 + form.feeAdmission).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
              saved ? 'bg-emerald-600' : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Fee Structure'}
          </button>
        </div>
      </div>
    </div>
  )
}
