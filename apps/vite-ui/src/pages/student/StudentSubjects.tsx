import { useMemo } from 'react'
import { BookOpen, User } from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { subjectStore, routineStore, teacherStore } from '@/data/stores'

export function StudentSubjects() {
  const { student } = useStudentSession()

  // Load subjects from store matching student's class and group
  const enrolledSubjects = useMemo(() => {
    const allSubjects = subjectStore.getAll()
    const allRoutines = routineStore.getAll()
    const allTeachers = teacherStore.getAll()

    // Filter subjects for student's class
    const targetClassId = student.classId || 'cls-10'
    let matchingSubjects = allSubjects.filter((s) => s.classId === targetClassId)

    // Filter by group if student has a specific group (e.g. SCIENCE, ARTS, COMMERCE)
    if (student.groupId && matchingSubjects.some((s) => s.groupId === student.groupId)) {
      matchingSubjects = matchingSubjects.filter(
        (s) => !s.groupId || s.groupId === student.groupId || s.groupId === 'COMMON'
      )
    }

    if (matchingSubjects.length === 0) {
      matchingSubjects = allSubjects.slice(0, 8)
    }

    // Map teacher from routines or teachers
    return matchingSubjects.map((s) => {
      const routineMatch = allRoutines.find(
        (r) => r.class_id === targetClassId && r.subject_id === s.id && r.teacher_id
      )
      let teacherName = 'Assigned Department Faculty'
      if (routineMatch && routineMatch.teachers?.full_name) {
        teacherName = routineMatch.teachers.full_name
      } else if (routineMatch && routineMatch.teacher_id) {
        const teacher = allTeachers.find((t) => t.id === routineMatch.teacher_id)
        if (teacher) teacherName = teacher.fullName
      }

      const isPracticalSubject =
        s.name.toLowerCase().includes('physics') ||
        s.name.toLowerCase().includes('chemistry') ||
        s.name.toLowerCase().includes('biology') ||
        s.name.toLowerCase().includes('higher math') ||
        s.name.toLowerCase().includes('ict')

      const totalMarks = s.totalMarks || 100
      const marksPractical = isPracticalSubject ? 25 : 0
      const marksMCQ = isPracticalSubject ? 25 : totalMarks === 100 ? 30 : 0
      const marksCQ = totalMarks - marksMCQ - marksPractical

      return {
        id: s.id,
        name: s.name,
        nameBn: s.nameBn,
        code: s.code || '101',
        paper: s.paper || 'NONE',
        type: s.isOptional ? 'OPTIONAL_4TH' : s.groupId ? 'ELECTIVE' : 'COMPULSORY',
        teacherName,
        marksCQ,
        marksMCQ,
        marksPractical,
      }
    })
  }, [student.classId, student.groupId])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-teal-500" size={22} />
            My Enrolled Subjects & Syllabus (পাঠ্য বিষয়সমূহ)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Curriculum, assigned teachers, and marks distribution for {student.fullNameEn} ({student.className || 'Class 10'})
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
          Total {enrolledSubjects.length} Subjects
        </span>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolledSubjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  Code: {subject.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  subject.type === 'OPTIONAL_4TH'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : subject.type === 'ELECTIVE'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}>
                  {subject.type === 'OPTIONAL_4TH' ? '4th Subject' : subject.type}
                </span>
              </div>

              <h4 className="font-bold text-base text-zinc-900 dark:text-white mt-2.5">
                {subject.name}
              </h4>
              
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                <User size={13} className="text-teal-600" />
                <span>Teacher: <span className="font-medium text-zinc-800 dark:text-zinc-200">{subject.teacherName}</span></span>
              </div>
            </div>

            {/* Marks Distribution pill */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-1">Marks Distribution:</span>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  CQ: {subject.marksCQ}
                </span>
                {subject.marksMCQ > 0 && (
                  <span className="px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    MCQ: {subject.marksMCQ}
                  </span>
                )}
                {subject.marksPractical > 0 && (
                  <span className="px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Prac: {subject.marksPractical}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
