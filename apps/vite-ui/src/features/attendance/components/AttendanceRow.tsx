import { STATUS_CONFIG, ALL_STATUSES } from '../types'
import type { AttendanceStatus } from '../types'

interface Props {
  studentId: string
  rollNumber: string
  fullNameEn: string
  fullNameBn: string
  status: AttendanceStatus | undefined
  onChange: (studentId: string, status: AttendanceStatus) => void
}

export function AttendanceRow({
  studentId, rollNumber, fullNameEn, fullNameBn, status, onChange,
}: Props) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
      ${status
        ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].border}`
        : 'bg-zinc-50 border-zinc-100'
      }
    `}>
      {/* Roll */}
      <span className="w-8 text-center text-sm font-bold text-zinc-600 flex-shrink-0">
        {rollNumber}
      </span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 truncate">{fullNameEn}</p>
        <p className="text-xs text-zinc-600 truncate">{fullNameBn}</p>
      </div>

      {/* Status badge */}
      {status && (
        <span className={`text-xs font-medium ${STATUS_CONFIG[status].color} flex-shrink-0 hidden sm:block`}>
          {STATUS_CONFIG[status].label}
        </span>
      )}

      {/* Toggle buttons */}
      <div className="flex gap-1 flex-shrink-0">
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(studentId, s)}
            title={STATUS_CONFIG[s].label}
            className={`
              w-8 h-8 rounded-lg text-xs font-bold border transition-all
              ${status === s
                ? STATUS_CONFIG[s].btnActive
                : 'border-zinc-100 text-zinc-600 hover:border-zinc-100 hover:text-zinc-800 bg-white'
              }
            `}
          >
            {STATUS_CONFIG[s].shortLabel}
          </button>
        ))}
      </div>
    </div>
  )
}
