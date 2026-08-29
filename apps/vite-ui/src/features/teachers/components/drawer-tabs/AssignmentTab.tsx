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
        <BookOpen size={36} className="text-zinc-800" />
        <p className="text-zinc-600">No teaching assignments yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {years.map(year => (
        <div key={year} className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
            Academic Year: <span className="text-zinc-800">{year}</span>
          </h4>
          <div className="space-y-2">
            {byYear[year].map(a => (
              <div
                key={a.id}
                className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg p-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                    <BookOpen size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{a.subjectName}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
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
                      : 'bg-zinc-500/10 text-zinc-600 border-zinc-100/20'
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
