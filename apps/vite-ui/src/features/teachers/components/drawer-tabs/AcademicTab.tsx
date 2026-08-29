import { GraduationCap, Award, BookOpen, Star, Briefcase } from 'lucide-react'
import type { Teacher } from '../../types'
import { TEACHING_LEVEL_LABELS } from '../../types'

interface Props { teacher: Teacher }

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-zinc-600 italic">{message}</p>
}

export function AcademicTab({ teacher }: Props) {
  return (
    <div className="space-y-6">
      {/* Qualifications */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <GraduationCap size={14} /> Educational Qualifications
        </h4>
        {teacher.qualifications.length === 0
          ? <EmptyState message="No qualifications added." />
          : (
            <div className="space-y-3">
              {teacher.qualifications.map(q => (
                <div key={q.id} className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-zinc-800">{q.degree} — {q.subject}</p>
                      <p className="text-sm text-zinc-600 mt-0.5">{q.institution}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{q.university}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-emerald-400 font-medium">{q.result}</p>
                      <p className="text-xs text-zinc-600 mt-1">{q.passingYear}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <Award size={14} /> Certifications
        </h4>
        {teacher.certifications.length === 0
          ? <EmptyState message="No certifications added." />
          : (
            <div className="flex flex-wrap gap-2">
              {teacher.certifications.map(c => (
                <div key={c.id} className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                  <p className="text-sm text-purple-300 font-medium">{c.name}</p>
                  <p className="text-xs text-zinc-600">{c.issuer} · {c.year}</p>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Specialization */}
      {teacher.specialization && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
            <Star size={14} /> Specialization
          </h4>
          <p className="text-sm text-zinc-800">{teacher.specialization}</p>
        </div>
      )}

      {/* Teaching Subjects */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <BookOpen size={14} /> Teaching Subjects
        </h4>
        {teacher.teachingSubjects.length === 0
          ? <EmptyState message="No subjects assigned." />
          : (
            <div className="flex flex-wrap gap-2">
              {teacher.teachingSubjects.map(s => (
                <span key={s} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs px-3 py-1.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
      </div>

      {/* Teaching Levels */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2">
          Teaching Levels
        </h4>
        {teacher.teachingLevels.length === 0
          ? <EmptyState message="No teaching levels specified." />
          : (
            <div className="flex flex-wrap gap-2">
              {teacher.teachingLevels.map(l => (
                <span key={l} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs px-3 py-1.5 rounded-full font-medium">
                  {TEACHING_LEVEL_LABELS[l]}
                </span>
              ))}
            </div>
          )}
      </div>

      {/* Previous Experience */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <Briefcase size={14} /> Previous Experience
        </h4>
        {teacher.previousExperience.length === 0
          ? <EmptyState message="No previous experience recorded." />
          : (
            <div className="space-y-3">
              {teacher.previousExperience.map(e => (
                <div key={e.id} className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg p-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{e.organization}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{e.designation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-800">{e.fromYear} — {e.toYear || 'Present'}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{e.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
