import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  RefreshCw, AlertTriangle, X,
  CheckCircle, GraduationCap, Users, Loader2, ChevronRight,
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
const TO_YEAR   = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`

// Build promotion map: Class N → Class N+1, HSC 1st → HSC 2nd, HSC 2nd → Alumni
function getPromotionLabel(cls: ClassItem): { to: string; type: 'promote' | 'graduate' | 'hsc' } {
  const n = cls.numericName
  if (n === 12) return { to: 'Alumni (Graduated)', type: 'graduate' }
  if (n === 11) return { to: 'HSC 2nd Year', type: 'hsc' }
  if (n <= 10)  return { to: `Class ${n + 1}`, type: 'promote' }
  return { to: '—', type: 'promote' }
}

// Deterministic mock active student count
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
  const graduating  = classes.filter(c => c.numericName === 12).reduce((s, c) => s + getActiveStudents(c), 0)

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
    }, 2200)
  }

  // ── Step: Preview ──────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <Dialog onClose={handleClose}>
        <Header onClose={handleClose} title="Year Rollover" subtitle={`${FROM_YEAR} → ${TO_YEAR}`} />

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Session info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-600 mb-1">Current Session</p>
              <p className="text-lg font-bold text-zinc-800">{FROM_YEAR}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-zinc-600 mb-1">New Session</p>
              <p className="text-lg font-bold text-emerald-400">{TO_YEAR}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <Users size={18} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-zinc-600">Total Promoting</p>
                <p className="text-xl font-bold text-blue-300">{totalActive - graduating}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <GraduationCap size={18} className="text-purple-400 shrink-0" />
              <div>
                <p className="text-xs text-zinc-600">Graduating</p>
                <p className="text-xl font-bold text-purple-300">{graduating}</p>
              </div>
            </div>
          </div>

          {/* Class-by-class map */}
          {classes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">Promotion Map</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {classes.map(cls => {
                  const { to, type } = getPromotionLabel(cls)
                  const active = getActiveStudents(cls)
                  return (
                    <div
                      key={cls.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        type === 'graduate'
                          ? 'bg-purple-500/5 border border-purple-500/15'
                          : 'bg-white border border-zinc-100'
                      }`}
                    >
                      <span className="text-zinc-800 font-medium w-28 shrink-0 truncate">{cls.name}</span>
                      <ChevronRight size={13} className="text-zinc-800 shrink-0" />
                      <span className={`flex-1 ${
                        type === 'graduate' ? 'text-purple-400' :
                        type === 'hsc'     ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{to}</span>
                      <span className="text-xs text-zinc-600 shrink-0">{active} students</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-amber-400/90">
              <p className="font-semibold mb-1">Before you proceed</p>
              <p className="text-xs leading-relaxed opacity-80">
                Make sure all exam results are finalized. Students who failed can be manually held back after rollover. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <Footer>
          <button onClick={handleClose} className="btn-ghost">Cancel</button>
          <button
            onClick={() => setStep('confirm')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={15} /> Continue
          </button>
        </Footer>
      </Dialog>
    )
  }

  // ── Step: Confirm Checklist ────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <Dialog onClose={handleClose}>
        <Header onClose={handleClose} title="Confirm Rollover" subtitle="Please verify before proceeding" />

        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600">
            Check each item to confirm you're ready to run the rollover.
          </p>

          <div className="space-y-3">
            {([
              { key: 'examsGraded',       label: 'All final exams have been graded',         sub: 'Every subject result is entered into the system' },
              { key: 'resultsPublished',  label: 'Results are published and verified',        sub: 'Students and teachers have been notified' },
              { key: 'feesCleared',       label: 'Outstanding fees have been reviewed',       sub: 'Due payments are recorded for the new session' },
            ] as { key: keyof typeof checklist; label: string; sub: string }[]).map(item => (
              <div
                key={item.key}
                onClick={() => setChecklist(p => ({ ...p, [item.key]: !p[item.key] }))}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  checklist[item.key]
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-zinc-50 border-zinc-100 hover:border-zinc-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  checklist[item.key] ? 'bg-emerald-600 border-emerald-500' : 'border-zinc-100'
                }`}>
                  {checklist[item.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${checklist[item.key] ? 'text-emerald-300' : 'text-zinc-800'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>This will promote <strong>{totalActive - graduating}</strong> students and graduate <strong>{graduating}</strong>. This cannot be undone.</span>
          </div>
        </div>

        <Footer>
          <button onClick={() => setStep('preview')} className="btn-ghost">Back</button>
          <button
            onClick={handleProceed}
            disabled={!allChecked}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={15} /> Run Rollover
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
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
          </div>
          <div>
            <p className="text-lg font-semibold text-zinc-800 mb-1">Running Rollover...</p>
            <p className="text-sm text-zinc-600">Promoting {totalActive - graduating} students to new classes</p>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </Dialog>
    )
  }

  // ── Step: Done ────────────────────────────────────────────────────────────
  return (
    <Dialog onClose={handleClose}>
      <div className="p-12 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle size={28} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-zinc-800 mb-1">Rollover Complete!</p>
          <p className="text-sm text-zinc-600">
            <span className="text-emerald-400 font-medium">{totalActive - graduating}</span> students promoted &nbsp;·&nbsp;
            <span className="text-purple-400 font-medium">{graduating}</span> graduated to Alumni
          </p>
          <p className="text-xs text-zinc-600 mt-2">New session: <span className="text-zinc-800">{TO_YEAR}</span></p>
        </div>
        <button
          onClick={handleClose}
          className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Header({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-zinc-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <RefreshCw size={16} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100">
      {children}
    </div>
  , document.body
  )
}

