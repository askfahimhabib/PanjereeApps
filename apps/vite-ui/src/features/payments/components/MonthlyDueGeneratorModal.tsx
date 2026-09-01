import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react'
import { useClasses } from '@/features/classes/useClasses'
import { useFeeStructures } from '../hooks/useFeeStructures'
import { useGenerateMonthlyBilling, useMonthlyBillingRuns } from '../hooks/useBillingAndWaivers'
import { MONTH_NAMES, formatCurrency } from '../types'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'
import type { ClassItem } from '@/features/classes/types'

const studentStore = createStore<Student>('students')

interface MonthlyDueGeneratorModalProps {
  open: boolean
  onClose: () => void
}

export function MonthlyDueGeneratorModal({ open, onClose }: MonthlyDueGeneratorModalProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [year, setYear] = useState<number>(currentYear)
  const [targetClassId, setTargetClassId] = useState<string>('cls-8')

  const { classes = [] } = useClasses()
  const { data: structures = [] } = useFeeStructures()
  const { data: pastRuns = [] } = useMonthlyBillingRuns()
  const generateBilling = useGenerateMonthlyBilling()

  const [resultMessage, setResultMessage] = useState<string | null>(null)

  // Target class students count
  const targetStudents = useMemo(() => {
    return studentStore.getWhere(s => s.classId === targetClassId && s.status === 'ACTIVE')
  }, [targetClassId])

  // Matched fee structure
  const matchedStructure = useMemo(() => {
    return structures.find(s => s.target_type === 'CLASS' && s.class_id === targetClassId && s.is_active)
  }, [structures, targetClassId])

  const feeItems = matchedStructure?.fee_items ?? [
    { id: 'def-1', fee_type: 'TUITION' as const, label: 'Monthly Tuition Fee', amount: 1500, frequency: 'MONTHLY' as const, due_day: 10 },
  ]

  const totalPerStudent = feeItems.reduce((s, it) => s + it.amount, 0)
  const estimatedClassTotal = targetStudents.length * totalPerStudent

  // Check if already billed
  const isAlreadyBilled = useMemo(() => {
    return pastRuns.some(r => r.month === month && r.year === year && r.class_id === targetClassId)
  }, [pastRuns, month, year, targetClassId])

  if (!open) return null

  const handleGenerate = () => {
    generateBilling.mutate(
      {
        month,
        year,
        target_type: 'CLASS',
        class_id: targetClassId,
        fee_structure_id: matchedStructure?.id,
      },
      {
        onSuccess: (run) => {
          setResultMessage(
            `Successfully generated ${run.generated_count} fee dues totaling ${formatCurrency(run.total_billed_amount)} for ${targetStudents[0]?.className || 'Class'} (${MONTH_NAMES[month - 1]} ${year})!`
          )
        },
        onError: (err: unknown) => {
          alert(err instanceof Error ? err.message : 'Failed to generate billing.')
        },
      }
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-base">Automated Monthly Billing</h2>
              <p className="text-xs text-zinc-500">1-Click class-wide fee dues generator & scheduler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {resultMessage ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <p className="font-bold text-zinc-900 text-sm">{resultMessage}</p>
              <button
                onClick={() => {
                  setResultMessage(null)
                  onClose()
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Select Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Billing Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-xs text-zinc-800"
                  >
                    {MONTH_NAMES.map((mName, i) => (
                      <option key={mName} value={i + 1}>
                        {mName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-xs text-zinc-800"
                  >
                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Class Selector */}
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Target Class</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 font-semibold text-xs text-zinc-900"
                >
                  {classes.map((c: ClassItem) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({studentStore.getWhere(s => s.classId === c.id && s.status === 'ACTIVE').length} Students)
                    </option>
                  ))}
                </select>
              </div>

              {/* Duplicate Warning if already billed */}
              {isAlreadyBilled && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">Already Generated Once</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      A billing run for this class in {MONTH_NAMES[month - 1]} {year} was previously recorded. Running again will only bill new students who do not yet have dues.
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Preview Box */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl p-4 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-600" />
                    Active Students in Class
                  </span>
                  <span className="font-mono font-bold text-sm text-indigo-950">
                    {targetStudents.length} Students
                  </span>
                </div>

                <div className="border-t border-indigo-200/50 pt-2 space-y-1">
                  <p className="text-[11px] font-semibold text-zinc-600">Attached Fee Structure:</p>
                  <p className="text-xs font-bold text-zinc-900">
                    {matchedStructure?.name || 'Default Tuition Rate'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {feeItems.map((fi) => (
                      <span key={fi.id} className="px-2 py-0.5 bg-white rounded-md text-[10px] font-semibold text-zinc-700 border border-zinc-200">
                        {fi.label}: {formatCurrency(fi.amount)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-indigo-200/50 pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800">Estimated Total Billing</span>
                  <span className="text-lg font-extrabold text-indigo-950 font-mono">
                    {formatCurrency(estimatedClassTotal)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generateBilling.isPending || targetStudents.length === 0}
                  className="flex-1 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {generateBilling.isPending ? 'Generating Dues...' : 'Generate Dues'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
