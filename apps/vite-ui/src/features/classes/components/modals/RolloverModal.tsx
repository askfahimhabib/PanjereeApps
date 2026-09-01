import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle,
  GraduationCap,
  Users,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import type { ClassItem } from '../../types'

interface RolloverModalProps {
  isOpen: boolean
  onClose: () => void
  classes?: ClassItem[]
  onConfirm?: (fromYear: string, toYear: string) => void
}

type Step = 'preview' | 'confirm' | 'processing' | 'done'

const CURRENT_YEAR = new Date().getFullYear()
const FROM_YEAR = `${CURRENT_YEAR - 1}-${CURRENT_YEAR}`
const TO_YEAR = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`

// Build promotion map: Class N → Class N+1, HSC 1st → HSC 2nd, HSC 2nd → Alumni
function getPromotionLabel(cls: ClassItem): { to: string; type: 'promote' | 'graduate' | 'hsc' } {
  const n = cls.numericName
  if (n === 12) return { to: 'Alumni (Graduated)', type: 'graduate' }
  if (n === 11) return { to: 'HSC 2nd Year', type: 'hsc' }
  if (n <= 10) return { to: `Class ${n + 1}`, type: 'promote' }
  return { to: '—', type: 'promote' }
}

function getActiveStudents(cls: ClassItem): number {
  const seed = cls.id.charCodeAt(cls.id.length - 1)
  return Math.max(5, cls.totalStudents - ((seed * 3) % 15))
}

export function RolloverModal({ isOpen, onClose, classes = [], onConfirm }: RolloverModalProps) {
  const [step, setStep] = useState<Step>('preview')
  const [checklist, setChecklist] = useState({
    examsGraded: false,
    resultsPublished: false,
    feesCleared: false,
  })

  if (!isOpen) return null

  const allChecked = Object.values(checklist).every(Boolean)
  const totalActive = classes.reduce((s, c) => s + getActiveStudents(c), 0)
  const graduating = classes
    .filter(c => c.numericName === 12)
    .reduce((s, c) => s + getActiveStudents(c), 0)

  const handleClose = () => {
    setStep('preview')
    setChecklist({ examsGraded: false, resultsPublished: false, feesCleared: false })
    onClose()
  }

  const handleProceed = () => {
    setStep('processing')
    setTimeout(() => {
      onConfirm?.(FROM_YEAR, TO_YEAR)
      setStep('done')
    }, 2000)
  }

  // ── Step: Preview ──────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <Dialog onClose={handleClose}>
        <Header onClose={handleClose} title="Academic Session Rollover" subtitle={`${FROM_YEAR} → ${TO_YEAR}`} />

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Session info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Current Session</p>
              <p className="text-base font-black text-zinc-900">{FROM_YEAR}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Target Session</p>
              <p className="text-base font-black text-emerald-700">{TO_YEAR}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Promoting</p>
                <p className="text-lg font-black text-indigo-700">{totalActive - graduating}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-purple-50 border border-purple-100 rounded-2xl">
              <div className="p-2 bg-purple-600 text-white rounded-xl">
                <GraduationCap size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Graduating</p>
                <p className="text-lg font-black text-purple-700">{graduating}</p>
              </div>
            </div>
          </div>

          {/* Class-by-class map */}
          {classes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Promotion Mapping</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {classes.map(cls => {
                  const { to, type } = getPromotionLabel(cls)
                  const active = getActiveStudents(cls)
                  return (
                    <div
                      key={cls.id}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                        type === 'graduate'
                          ? 'bg-purple-50 border-purple-200 text-purple-900'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    >
                      <span className="w-28 shrink-0 truncate">{cls.name}</span>
                      <ChevronRight size={13} className="text-zinc-400 shrink-0" />
                      <span
                        className={`flex-1 font-bold ${
                          type === 'graduate'
                            ? 'text-purple-700'
                            : type === 'hsc'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {to}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 shrink-0">{active} students</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-zinc-700">
              <p className="font-bold text-zinc-900 mb-1">Before you proceed</p>
              <p className="text-zinc-600 leading-relaxed font-medium">
                Make sure all semester grades and fee invoices are reviewed. Students can be retained or re-assigned individually after bulk promotion.
              </p>
            </div>
          </div>
        </div>

        <Footer>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Continue</span>
          </button>
        </Footer>
      </Dialog>
    )
  }

  // ── Step: Confirm Checklist ────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <Dialog onClose={handleClose}>
        <Header onClose={handleClose} title="Verify Prerequisites" subtitle="Confirm completion of rollover checklist" />

        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            Please check each requirement to verify readiness for promoting all students to next academic year.
          </p>

          <div className="space-y-2.5">
            {(
              [
                {
                  key: 'examsGraded',
                  label: 'All final exam results submitted',
                  sub: 'Marks & grades recorded in the Exam Results module',
                },
                {
                  key: 'resultsPublished',
                  label: 'Report cards generated & verified',
                  sub: 'Parents & students have received performance updates',
                },
                {
                  key: 'feesCleared',
                  label: 'Session dues and clearance audited',
                  sub: 'Monthly billing ledgers ready for rollover',
                },
              ] as { key: keyof typeof checklist; label: string; sub: string }[]
            ).map(item => (
              <div
                key={item.key}
                onClick={() => setChecklist(p => ({ ...p, [item.key]: !p[item.key] }))}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  checklist[item.key]
                    ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checklist[item.key]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-zinc-300 bg-white'
                  }`}
                >
                  {checklist[item.key] && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-xs font-bold ${checklist[item.key] ? 'text-emerald-900' : 'text-zinc-900'}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-800 flex gap-2.5 font-medium">
            <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>
              This batch operation will advance <strong>{totalActive - graduating}</strong> students and transition{' '}
              <strong>{graduating}</strong> to Alumni status.
            </span>
          </div>
        </div>

        <Footer>
          <button
            onClick={() => setStep('preview')}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            disabled={!allChecked}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Execute Rollover</span>
          </button>
        </Footer>
      </Dialog>
    )
  }

  // ── Step: Processing ──────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <Dialog onClose={() => {}}>
        <div className="p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Loader2 size={32} className="animate-spin" />
          </div>
          <div>
            <p className="text-base font-black text-zinc-900 mb-1">Executing Session Rollover...</p>
            <p className="text-xs text-zinc-500 font-medium">
              Updating grade records & moving {totalActive - graduating} students to next academic tier
            </p>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2 mt-2 overflow-hidden border border-zinc-200">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '65%' }} />
          </div>
        </div>
      </Dialog>
    )
  }

  // ── Step: Done ────────────────────────────────────────────────────────────
  return (
    <Dialog onClose={handleClose}>
      <div className="p-10 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <CheckCircle size={32} />
        </div>
        <div>
          <p className="text-base font-black text-zinc-900 mb-1">Rollover Completed Successfully!</p>
          <p className="text-xs text-zinc-600 font-medium">
            <span className="text-emerald-700 font-bold">{totalActive - graduating}</span> students promoted &nbsp;·&nbsp;
            <span className="text-purple-700 font-bold">{graduating}</span> archived to Alumni
          </p>
          <p className="text-xs text-zinc-500 mt-2 font-medium">
            Active Session: <strong className="text-zinc-900">{TO_YEAR}</strong>
          </p>
        </div>
        <button
          onClick={handleClose}
          className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          Done
        </button>
      </div>
    </Dialog>
  )
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {children}
      </div>
    </div>,
    document.body
  )
}

function Header({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700">
          <RefreshCw size={18} />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
      >
        <X size={18} />
      </button>
    </div>
  )
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
      {children}
    </div>
  )
}
