import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  BellRing,
} from 'lucide-react'
import type { DashboardAlert } from '../types'

interface DashboardActionAlertsProps {
  alerts: DashboardAlert[]
}

export function DashboardActionAlerts({
  alerts,
}: DashboardActionAlertsProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  const activeAlerts = alerts.filter(a => !dismissedIds.includes(a.id))
  if (activeAlerts.length === 0) return null

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id])
  }

  const alertStyles = {
    urgent: {
      bg: 'bg-rose-50/90 border-rose-200/80 text-rose-950',
      iconBg: 'bg-rose-100 text-rose-700',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      badge: 'bg-rose-200/60 text-rose-800',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-50/90 border-amber-200/80 text-amber-950',
      iconBg: 'bg-amber-100 text-amber-700',
      btn: 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold',
      badge: 'bg-amber-200/60 text-amber-900',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-sky-50/90 border-sky-200/80 text-sky-950',
      iconBg: 'bg-sky-100 text-sky-700',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white',
      badge: 'bg-sky-200/60 text-sky-800',
      icon: BellRing,
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200/80 text-emerald-950',
      iconBg: 'bg-emerald-100 text-emerald-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'bg-emerald-200/60 text-emerald-800',
      icon: CheckCircle2,
    },
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <BellRing size={13} className="text-amber-500" />
          <span>Priority Action Required ({activeAlerts.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeAlerts.map(alert => {
          const style = alertStyles[alert.type] || alertStyles.info
          const Icon = style.icon

          return (
            <div
              key={alert.id}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border ${style.bg} backdrop-blur-xs shadow-xs transition-all`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} mt-0.5`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold tracking-tight truncate">{alert.title}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${style.badge}`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-center">
                {alert.actionLabel && alert.actionLink && (
                  <Link
                    to={alert.actionLink}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shadow-xs ${style.btn}`}
                  >
                    <span>{alert.actionLabel}</span>
                    <ChevronRight size={12} />
                  </Link>
                )}

                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/5 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
