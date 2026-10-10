import { useEffect, useState, useRef } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type ToastItem } from '@/store/toast'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: {
    container: 'border-emerald-500/30 bg-white dark:bg-zinc-900 shadow-emerald-500/10 text-zinc-900 dark:text-zinc-100',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
    progress: 'bg-emerald-500',
    title: 'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    container: 'border-rose-500/30 bg-white dark:bg-zinc-900 shadow-rose-500/10 text-zinc-900 dark:text-zinc-100',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60',
    progress: 'bg-rose-500',
    title: 'text-rose-800 dark:text-rose-300',
  },
  warning: {
    container: 'border-amber-500/30 bg-white dark:bg-zinc-900 shadow-amber-500/10 text-zinc-900 dark:text-zinc-100',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60',
    progress: 'bg-amber-500',
    title: 'text-amber-800 dark:text-amber-300',
  },
  info: {
    container: 'border-sky-500/30 bg-white dark:bg-zinc-900 shadow-sky-500/10 text-zinc-900 dark:text-zinc-100',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60',
    progress: 'bg-sky-500',
    title: 'text-sky-800 dark:text-sky-300',
  },
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const duration = item.duration ?? 3800
  const [isPaused, setIsPaused] = useState(false)
  const [remaining, setRemaining] = useState(duration)
  const startRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const IconComponent = ICONS[item.type]
  const style = STYLES[item.type]

  useEffect(() => {
    if (isPaused) return

    startRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      onDismiss(item.id)
    }, remaining)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPaused, remaining, item.id, onDismiss])

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const elapsed = Date.now() - startRef.current
    setRemaining((prev) => Math.max(0, prev - elapsed))
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        pointer-events-auto relative w-full sm:w-[380px] max-w-[94vw]
        overflow-hidden rounded-2xl border shadow-xl
        p-3.5 sm:p-4 transition-all duration-300 ease-out
        animate-in fade-in slide-in-from-top-4 sm:slide-in-from-top-2
        ${style.container}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${style.iconBg}`}>
          <IconComponent size={18} strokeWidth={2.2} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {item.title && (
            <p className={`text-xs font-bold leading-tight mb-0.5 ${style.title}`}>
              {item.title}
            </p>
          )}
          <p className="text-[13px] font-medium leading-snug break-words text-zinc-700 dark:text-zinc-200">
            {item.message}
          </p>

          {item.action && (
            <button
              onClick={() => {
                item.action?.onClick()
                onDismiss(item.id)
              }}
              className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {item.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(item.id)}
          aria-label="Close notification"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
        <div
          className={`h-full ${style.progress} transition-all`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

/**
 * Global Toaster component.
 * Mount this once in App.tsx.
 */
export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      tabIndex={-1}
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[99999] flex flex-col items-end gap-2.5 pointer-events-none max-w-full"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={removeToast} />
      ))}
    </div>
  )
}
