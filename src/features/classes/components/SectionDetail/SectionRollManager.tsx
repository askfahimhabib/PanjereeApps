import { useState } from 'react'
import { Settings2, ArrowDownAZ, Lock, LockOpen, CheckCircle, AlertCircle } from 'lucide-react'

interface SectionRollManagerProps {
  isFrozen: boolean
  onToggleFreeze: () => void
  onAutoAssign: () => void
}

export function SectionRollManager({ isFrozen, onToggleFreeze, onAutoAssign }: SectionRollManagerProps) {
  const [confirming, setConfirming] = useState(false)
  const [autoAssigned, setAutoAssigned] = useState(false)

  const handleToggleClick = () => {
    if (isFrozen) {
      // Unfreeze — ask for confirmation
      setConfirming(true)
    } else {
      // Freeze — ask for confirmation
      setConfirming(true)
    }
  }

  const handleConfirm = () => {
    onToggleFreeze()
    setConfirming(false)
  }

  const handleAutoAssign = () => {
    onAutoAssign()
    setAutoAssigned(true)
    setTimeout(() => setAutoAssigned(false), 2000)
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
        <Settings2 className="w-4 h-4 text-blue-400" />
        Roll Management
      </h3>
      <p className="text-xs text-slate-500 mb-4">Manage student roll numbers for this section.</p>

      {/* Status banner */}
      <div className={`rounded-lg p-3 text-sm flex items-start gap-2 mb-4 ${
        isFrozen
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
      }`}>
        {isFrozen
          ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        }
        <div>
          <p className="font-medium leading-tight">
            {isFrozen ? 'Roll numbers are frozen' : 'Rolls not finalized'}
          </p>
          <p className="text-xs opacity-75 mt-0.5">
            {isFrozen
              ? 'Rolls finalized for exams. Unfreeze to make changes.'
              : 'Finalize and freeze rolls before scheduling exams.'}
          </p>
        </div>
      </div>

      {/* Confirmation prompt */}
      {confirming && (
        <div className="mb-3 p-3 bg-slate-700/60 border border-slate-600 rounded-lg text-sm">
          <p className="text-slate-200 font-medium mb-2">
            {isFrozen ? 'Unfreeze roll numbers?' : 'Freeze & finalize roll numbers?'}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            {isFrozen
              ? 'This will allow roll edits again. Exams using these rolls may be affected.'
              : 'Roll numbers will be locked for this section. Students cannot be reordered.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${
                isFrozen ? 'bg-slate-600 hover:bg-slate-500' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              Yes, {isFrozen ? 'Unfreeze' : 'Freeze'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          disabled={isFrozen || autoAssigned}
          onClick={handleAutoAssign}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            autoAssigned
              ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
              : isFrozen
              ? 'opacity-40 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300'
          }`}
        >
          {autoAssigned ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <ArrowDownAZ className="w-4 h-4" />
          )}
          {autoAssigned ? 'Rolls Assigned!' : 'Auto-assign Alphabetically'}
        </button>

        <button
          onClick={handleToggleClick}
          disabled={confirming}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isFrozen
              ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
          }`}
        >
          {isFrozen ? (
            <><LockOpen className="w-4 h-4" /> Unfreeze Rolls</>
          ) : (
            <><Lock className="w-4 h-4" /> Freeze & Finalize Rolls</>
          )}
        </button>
      </div>
    </div>
  )
}
