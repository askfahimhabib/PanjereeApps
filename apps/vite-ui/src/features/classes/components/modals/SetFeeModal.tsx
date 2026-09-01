import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    }, 700)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">Fee Structure</h2>
              <p className="text-xs text-zinc-500 font-medium">Configuring fee for {classData.name}</p>
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
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Monthly Tuition Fee (৳)
            </label>
            <input
              type="number"
              min={0}
              value={form.feeMonthly}
              onChange={e => setForm(prev => ({ ...prev, feeMonthly: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Admission / Session Fee (৳)
            </label>
            <input
              type="number"
              min={0}
              value={form.feeAdmission}
              onChange={e => setForm(prev => ({ ...prev, feeAdmission: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
            />
          </div>

          {/* Preview */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Annual Collection Estimate</p>
            <div className="flex justify-between">
              <span className="text-zinc-600">Monthly Tuition (× 12)</span>
              <span className="text-zinc-900 font-bold font-mono">৳ {(form.feeMonthly * 12).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Admission / Session Fee</span>
              <span className="text-zinc-900 font-bold font-mono">৳ {form.feeAdmission.toLocaleString()}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold">
              <span className="text-zinc-900">Total Yearly per Student</span>
              <span className="text-amber-700 font-mono text-sm">৳ {(form.feeMonthly * 12 + form.feeAdmission).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
              saved ? 'bg-emerald-600' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
            }`}
          >
            <Save size={15} />
            <span>{saved ? 'Saved!' : 'Save Fee Structure'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
