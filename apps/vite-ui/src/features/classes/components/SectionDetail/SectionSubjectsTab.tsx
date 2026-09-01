import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react'
import type { Section } from '../../types'
import { subjectStore } from '@/data/stores'

interface SectionSubjectsTabProps {
  section: Section
}

export function SectionSubjectsTab({ section }: SectionSubjectsTabProps) {
  // Get all subjects assigned to this class
  const classSubjects = useMemo(() => {
    return subjectStore.getWhere(s => s.classId === section.classId)
  }, [section.classId])

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Curriculum & Subjects — {section.className}
            </h3>
            <p className="text-xs text-zinc-500">
              {classSubjects.length} subjects registered in this class curriculum
            </p>
          </div>
        </div>

        <Link
          to={`/subjects`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all"
        >
          <span>Subjects Module</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {classSubjects.map(subject => {
          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-zinc-200 p-4.5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                    Code: {subject.code}
                  </span>
                  {subject.paper && subject.paper !== 'NONE' && (
                    <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                      {subject.paper === 'FIRST' ? '1st Paper' : '2nd Paper'}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-zinc-900">{subject.name}</h4>
                {subject.nameBn && (
                  <p className="text-xs text-zinc-500 mt-0.5">{subject.nameBn}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-zinc-400" />
                  <span className="font-semibold text-zinc-800">
                    Total Marks: {subject.totalMarks} (Pass: {subject.passMarks})
                  </span>
                </div>

                {subject.groupName && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {subject.groupName}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
