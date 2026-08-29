import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import type { TeacherFormData } from '../../types'
import { Step1_BasicInfo }        from './Step1_BasicInfo'
import { Step2_ContactAddress }   from './Step2_ContactAddress'
import { Step3_Employment }       from './Step3_Employment'
import { Step4_Academic }         from './Step4_Academic'
import { Step5_Assignment }       from './Step5_Assignment'
import { Step6_Account }          from './Step6_Account'

interface Props {
  isOpen: boolean
  isEdit?: boolean
  onClose: () => void
  currentStep: number
  totalSteps: number
  formData: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
}

const STEPS = [
  { num: 1, label: 'Basic Info',    short: 'Basic'    },
  { num: 2, label: 'Contact',       short: 'Contact'  },
  { num: 3, label: 'Employment',    short: 'Job'      },
  { num: 4, label: 'Academic',      short: 'Academic' },
  { num: 5, label: 'Assignments',   short: 'Assign'   },
  { num: 6, label: 'Account',       short: 'Account'  },
]

function validateStep(step: number, data: TeacherFormData, isEdit: boolean): string | null {
  if (step === 1) {
    if (!data.firstName.trim()) return 'First name is required'
    if (!data.lastName.trim())  return 'Last name is required'
    if (!data.gender)           return 'Gender is required'
    if (!data.dateOfBirth)      return 'Date of birth is required'
  }
  if (step === 2) {
    if (!data.phone.trim())          return 'Phone number is required'
    if (!data.presentAddress.trim()) return 'Present address is required'
  }
  if (step === 3) {
    if (!data.joiningDate)        return 'Joining date is required'
    if (!data.employmentType)     return 'Employment type is required'
    if (!data.designation)        return 'Designation is required'
  }
  if (step === 6) {
    if (!isEdit && !data.password)                 return 'Password is required'
    if (data.password && data.password.length < 6) return 'Password must be at least 6 characters'
    if (data.password !== data.confirmPassword)    return 'Passwords do not match'
  }
  return null
}

export function AddTeacherModal({
  isOpen, isEdit = false, onClose, currentStep, totalSteps, formData, onChange, onNext, onPrev, onSubmit,
}: Props) {
  if (!isOpen) return null

  const error = validateStep(currentStep, formData, isEdit)

  function handleNext() {
    if (error) { alert(error); return }
    onNext()
  }

  function handleSubmit() {
    const err = validateStep(6, formData, isEdit)
    if (err) { alert(err); return }
    onSubmit()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white border border-zinc-100 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Step {currentStep} of {totalSteps}: {STEPS[currentStep - 1].label}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Progress Bar ──────────────────────────────────── */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > step.num
                      ? 'bg-[var(--color-primary)] text-white'
                      : currentStep === step.num
                      ? 'bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)]/30'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {currentStep > step.num ? <Check size={13} /> : step.num}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${
                    currentStep === step.num ? 'text-[var(--color-primary)]' : currentStep > step.num ? 'text-[var(--color-primary-dark)]' : 'text-zinc-400'
                  }`}>
                    {step.short}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${currentStep > step.num ? 'bg-[var(--color-primary)]/40' : 'bg-zinc-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Content (scrollable) ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentStep === 1 && <Step1_BasicInfo       data={formData} onChange={onChange} />}
          {currentStep === 2 && <Step2_ContactAddress  data={formData} onChange={onChange} />}
          {currentStep === 3 && <Step3_Employment      data={formData} onChange={onChange} />}
          {currentStep === 4 && <Step4_Academic        data={formData} onChange={onChange} />}
          {currentStep === 5 && <Step5_Assignment      data={formData} onChange={onChange} />}
          {currentStep === 6 && <Step6_Account         data={formData} onChange={onChange} isEdit={isEdit} />}
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50 shrink-0 rounded-b-2xl">
          <button
            onClick={onPrev}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-100"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 transition-colors">
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Check size={15} />
                {isEdit ? 'Save Changes' : 'Save Teacher'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
