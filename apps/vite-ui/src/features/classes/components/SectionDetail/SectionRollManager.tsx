import { useState } from 'react'
import {
  Sparkles,
  Lock,
  LockOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface SectionRollManagerProps {
  isFrozen: boolean
  onToggleFreeze: () => void
  onOpenSmartRoll: () => void
}

export function SectionRollManager({
  isFrozen,
  onToggleFreeze,
  onOpenSmartRoll,
}: SectionRollManagerProps) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = () => {
    onToggleFreeze()
    setConfirming(false)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Roll Number Hub
        </h3>
        {isFrozen ? (
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            Frozen
          </span>
        ) : (
          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            Editable
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Automated exam merit, alphabetical & roll swap management.
      </p>

      {/* Status banner */}
      <div
        className={`rounded-xl p-3 text-xs flex items-start gap-2.5 mb-4 ${
          isFrozen
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}
      >
        {isFrozen ? (
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
        ) : (
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        )}
        <div>
          <p className="font-bold leading-tight">
            {isFrozen ? 'Roll numbers are locked' : 'Rolls are customizable'}
          </p>
          <p className="text-[11px] opacity-85 mt-0.5">
            {isFrozen
              ? 'Rolls finalized for exams. Unfreeze to make changes.'
              : 'Auto-assign by exam marks, names, or swap before exams.'}
          </p>
        </div>
      </div>

      {/* Confirmation prompt */}
      {confirming && (
        <div className="mb-3.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
          <p className="text-zinc-900 font-bold mb-1">
            {isFrozen ? 'Unfreeze roll numbers?' : 'Freeze & finalize rolls?'}
          </p>
          <p className="text-zinc-500 text-[11px] mb-3">
            {isFrozen
              ? 'This will allow editing roll numbers again.'
              : 'Roll numbers will be locked to prevent accidental changes during exams.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${
                isFrozen ? 'bg-zinc-700 hover:bg-zinc-800' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Yes, {isFrozen ? 'Unfreeze' : 'Freeze'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* Open Smart Roll Modal Button */}
        <button
          disabled={isFrozen}
          onClick={onOpenSmartRoll}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Smart Roll Engine</span>
        </button>

        {/* Toggle Freeze */}
        <button
          onClick={() => setConfirming(true)}
          disabled={confirming}
          className={`flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isFrozen
              ? 'bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
          }`}
        >
          {isFrozen ? (
            <>
              <LockOpen className="w-3.5 h-3.5" />
              <span>Unfreeze Rolls</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Freeze & Finalize Rolls</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
