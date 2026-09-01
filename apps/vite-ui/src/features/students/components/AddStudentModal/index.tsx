import { createPortal } from 'react-dom'
import { X, Check, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react'
import type { StudentFormData } from '../../types'
import { sectionStore } from '@/data/stores'
import { Step1_BasicAcademic } from './Step1_BasicAcademic'
import { Step2_ContactParent } from './Step2_ContactParent'

interface Props {
  isOpen: boolean
  isEdit?: boolean
  onClose: () => void
  currentStep: number
  formData: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: (addAnother?: boolean) => void
}

const STEPS = [
  { num: 1, label: 'Student & Academic Info', short: 'Academic' },
  { num: 2, label: 'Guardian & Address', short: 'Guardian' },
]

function validateStep(step: number, data: StudentFormData): string | null {
  if (step === 1) {
    if (!data.fullNameEn.trim()) return 'Full Name (English) is required'
    if (!data.mobile.trim()) return 'Student mobile number is required'
    if (data.type === 'REGULAR') {
      if (!data.classId) return 'Class is required for regular student'
      const existingSections = sectionStore.getWhere(s => s.classId === data.classId)
      if (existingSections.length > 0 && !data.sectionId) {
        return 'Please select a section for this class'
      }
    } else if (data.type === 'EXAM_BATCH') {
      if (!data.batchId) return 'Exam Batch is required'
    }
  }
  if (step === 2) {
    if (!data.fatherName.trim()) return "Father's name is required"
    if (!data.fatherMobile.trim()) return "Father's mobile number is required"
    if (!data.presentAddress.trim()) return 'Present address is required'
    if (data.hasGuardian) {
      if (!data.guardianName.trim()) return 'Guardian name is required'
      if (!data.guardianMobile.trim()) return 'Guardian mobile is required'
    }
  }
  return null
}

export function AddStudentModal({
  isOpen,
  isEdit = false,
  onClose,
  currentStep,
  formData,
  onChange,
  onNext,
  onPrev,
  onSubmit,
}: Props) {
  if (!isOpen) return null

  function handleNext() {
    const error = validateStep(currentStep, formData)
    if (error) {
      alert(error)
      return
    }
    onNext()
  }

  function handleSave(addAnother: boolean = false) {
    const err = validateStep(2, formData)
    if (err) {
      alert(err)
      return
    }
    onSubmit(addAnother)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <div>
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <UserPlus size={18} />
              </span>
              {isEdit ? 'Edit Student Profile' : 'New Student Admission'}
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Visual Stepper ──────────────────────────────── */}
        <div className="px-6 pt-3 pb-2 shrink-0 bg-white border-b border-zinc-100">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > step.num
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : currentStep === step.num
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-xs'
                        : 'bg-zinc-100 text-zinc-400'
                    }`}
                  >
                    {currentStep > step.num ? <Check size={14} strokeWidth={3} /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      currentStep === step.num
                        ? 'text-indigo-600'
                        : currentStep > step.num
                        ? 'text-emerald-700'
                        : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-all ${
                      currentStep > step.num ? 'bg-emerald-500' : 'bg-zinc-100'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentStep === 1 && <Step1_BasicAcademic data={formData} onChange={onChange} />}
          {currentStep === 2 && <Step2_ContactParent data={formData} onChange={onChange} />}
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 bg-zinc-50 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200/60 rounded-xl transition-colors cursor-pointer border border-zinc-200"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Next Step <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                    title="Save current student and quickly open form for next student with same class/batch"
                  >
                    <UserPlus size={14} />
                    Save & Add Another
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Check size={14} strokeWidth={3} />
                  {isEdit ? 'Save Changes' : 'Complete Admission'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
