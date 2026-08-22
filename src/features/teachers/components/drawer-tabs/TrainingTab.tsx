import { BookOpen, Award, ExternalLink } from 'lucide-react'
import type { Teacher } from '../../types'
import { TRAINING_CATEGORY_LABELS } from '../../types'

interface Props { teacher: Teacher }

const CATEGORY_COLORS: Record<string, string> = {
  PEDAGOGY:         'bg-blue-500/10 text-blue-400 border-blue-500/20',
  TECHNOLOGY:       'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SUBJECT_SPECIFIC: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MANAGEMENT:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  OTHER:            'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export function TrainingTab({ teacher }: Props) {
  if (teacher.trainings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <BookOpen size={36} className="text-slate-600" />
        <p className="text-slate-400">No training records available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
        <Award size={14} /> Training History ({teacher.trainings.length})
      </h4>

      {teacher.trainings.map(t => (
        <div key={t.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-slate-200">{t.name}</p>
              <p className="text-sm text-slate-400 mt-0.5">{t.provider}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.OTHER}`}>
              {TRAINING_CATEGORY_LABELS[t.category]}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span>📅 {t.startDate} → {t.endDate}</span>
            <span>⏱ Duration: {t.duration}</span>
          </div>

          {t.certificateUrl && (
            <a
              href={t.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={12} /> View Certificate
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
