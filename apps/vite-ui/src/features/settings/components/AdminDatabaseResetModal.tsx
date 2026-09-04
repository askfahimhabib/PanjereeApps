import { useState } from 'react'
import {
  AlertTriangle,
  X,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Database,
  Users,
  Wallet,
  ClipboardList,
} from 'lucide-react'
import { purgeAllDatabase, factoryResetDatabase } from '@/data/stores'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type ResetMode = 'PURGE_BLANK' | 'FACTORY_SEED'

export function AdminDatabaseResetModal({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<ResetMode>('PURGE_BLANK')
  const [confirmInput, setConfirmInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const isConfirmed = confirmInput.trim().toUpperCase() === 'RESET'

  const handleExecute = () => {
    if (!isConfirmed) return
    setIsProcessing(true)

    try {
      if (mode === 'PURGE_BLANK') {
        purgeAllDatabase()
        setSuccessMsg('Entire database successfully purged! System is now a clean blank slate.')
      } else {
        factoryResetDatabase()
        setSuccessMsg('System reset to factory demo records successfully!')
      }

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      alert(`Reset failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-rose-950">Master Database Reset</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-800 tracking-wider">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-rose-700 font-medium">Irreversible system-wide database operation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-rose-400 hover:text-rose-700 hover:bg-rose-100/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-zinc-900">{successMsg}</p>
              <p className="text-xs text-zinc-500">Refreshing application in a moment...</p>
            </div>
          ) : (
            <>
              {/* Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 p-1 bg-zinc-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('PURGE_BLANK')
                    setConfirmInput('')
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'PURGE_BLANK'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Trash2 size={13} />
                  <span>Wipe All (Blank Slate)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FACTORY_SEED')
                    setConfirmInput('')
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'FACTORY_SEED'
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <RotateCcw size={13} />
                  <span>Factory Re-seed</span>
                </button>
              </div>

              {/* Mode Description Card */}
              {mode === 'PURGE_BLANK' ? (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-900 text-xs font-black">
                    <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                    <span>Clean Blank Database (নতুন স্কুলের জন্য সম্পূর্ণ ফাঁকা)</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    This will permanently delete ALL records from the entire database across all 25 modules. The database will become 100% empty and clean, ready for real school onboarding.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-200/60 text-[11px] text-rose-700 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} /> Students & Teachers (0)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet size={12} /> Fee Ledgers & Cash (৳0)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClipboardList size={12} /> Attendance & Leaves (0)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Database size={12} /> Classes & Routines (0)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-black">
                    <RotateCcw size={15} className="text-amber-600 shrink-0" />
                    <span>Factory Reset to Clean Demo Records (ডেমো ডাটায় রিসেট)</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    This will discard all local modifications and re-populate the application with fresh, standardized Bangladeshi institution demo records.
                  </p>
                </div>
              )}

              {/* Safety Confirmation Input */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                  <span>To confirm this operation, type <strong className="text-rose-600 font-mono tracking-wider">RESET</strong> below:</span>
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type RESET"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!successMsg && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={!isConfirmed || isProcessing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center gap-2 ${
                isConfirmed && !isProcessing
                  ? mode === 'PURGE_BLANK'
                    ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-rose-600/20'
                    : 'bg-zinc-900 hover:bg-black cursor-pointer'
                  : 'bg-zinc-300 cursor-not-allowed opacity-60'
              }`}
            >
              {mode === 'PURGE_BLANK' ? <Trash2 size={14} /> : <RotateCcw size={14} />}
              <span>{isProcessing ? 'Processing Reset...' : mode === 'PURGE_BLANK' ? 'Wipe Entire Database' : 'Reset to Demo Seed'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
