import { Activity } from 'lucide-react'
import { useProfileStore } from '../../../store/profile'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ActivityLog() {
  const { activityLog } = useProfileStore()

  return (
    <div className="space-y-1">
      {activityLog.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-600">
          <Activity size={28} className="mb-2 opacity-30" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-slate-800/60">
          {activityLog.map((entry, i) => (
            <div key={entry.id} className={`flex items-start gap-3 py-3 ${i === 0 ? '' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Activity size={11} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">{entry.action}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{timeAgo(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
