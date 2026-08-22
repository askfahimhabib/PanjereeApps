import { BookOpen, Star } from 'lucide-react'
import type { Teacher } from '../../types'

interface Props { teacher: Teacher }

export function AssignmentTab({ teacher }: Props) {
  const byYear = teacher.assignments.reduce<Record<string, typeof teacher.assignments>>((acc, a) => {
    if (!acc[a.academicYear]) acc[a.academicYear] = []
    acc[a.academicYear].push(a)
    return acc
  }, {})

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  if (teacher.assignments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <BookOpen size={36} className="text-slate-600" />
        <p className="text-slate-400">No teaching assignments yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {years.map(year => (
        <div key={year} className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            Academic Year: <span className="text-slate-200">{year}</span>
          </h4>
          <div className="space-y-2">
            {byYear[year].map(a => (
              <div
                key={a.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                    <BookOpen size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{a.subjectName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.className}
                      {a.sectionName && ` · Section ${a.sectionName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                    a.assignmentType === 'PRIMARY'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : a.assignmentType === 'SECONDARY'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {a.assignmentType}
                  </span>
                  {a.isClassTeacher && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      <Star size={10} /> Class Teacher
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
