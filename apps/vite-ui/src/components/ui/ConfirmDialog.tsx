import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Dialog title */
  title: string
  /** Description / warning text */
  description?: string
  /** Confirm button label (default: "Delete") */
  confirmLabel?: string
  /** Confirm button variant */
  variant?: 'danger' | 'warning' | 'primary'
  /** Loading state while action is in progress */
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * ConfirmDialog — Custom confirmation dialog.
 * Replaces browser confirm() calls throughout the app.
 *
 * Usage:
 * ```tsx
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="Delete this record?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 *   variant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  const variantStyles = {
    danger: {
      icon: <Trash2 size={20} className="text-red-500" />,
      iconBg: 'bg-red-50 border-red-100',
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200',
    },
    warning: {
      icon: <AlertTriangle size={20} className="text-amber-500" />,
      iconBg: 'bg-amber-50 border-amber-100',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    },
    primary: {
      icon: <AlertTriangle size={20} className="text-blue-500" />,
      iconBg: 'bg-blue-50 border-blue-100',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    },
  }

  const vs = variantStyles[variant]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl border border-zinc-100 animate-[scale-in_0.15s_ease-out]"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className={`p-2.5 rounded-xl border ${vs.iconBg}`}>
            {vs.icon}
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <h3 id="confirm-title" className="text-base font-bold text-zinc-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 ${vs.btn}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  , document.body
  )
}
