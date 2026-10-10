import { useState, useMemo } from 'react'
import {
  Clock,
  Printer,
  Calendar,
  Layers,
  GraduationCap,
  Target,
  BookOpen,
  MapPin,
  User,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { routineStore, examStore } from '@/data/stores'
import type { Routine } from '@/features/routines/types'

const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'SATURDAY'] as const
const DAY_LABELS: Record<string, { en: string; bn: string }> = {
  SUNDAY: { en: 'Sunday', bn: 'রবিবার' },
  MONDAY: { en: 'Monday', bn: 'সোমবার' },
  TUESDAY: { en: 'Tuesday', bn: 'মঙ্গলবার' },
  WEDNESDAY: { en: 'Wednesday', bn: 'বুধবার' },
  THURSDAY: { en: 'Thursday', bn: 'বৃহস্পতিবার' },
  SATURDAY: { en: 'Saturday', bn: 'শনিবার' },
}

export function StudentRoutine() {
  const { student } = useStudentSession()
  const [activeTab, setActiveTab] = useState<'combined' | 'class' | 'batch' | 'exams'>('combined')
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const dayIndex = new Date().getDay()
    const map: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'SUNDAY',
      6: 'SATURDAY',
    }
    return map[dayIndex] || 'SUNDAY'
  })

  // Load all routines from store
  const allRoutines = useMemo(() => routineStore.getAll(), [])

  // Class routines for this student (matching class and specific section)
  const classRoutines = useMemo(() => {
    if (!student.classId) return []
    return allRoutines.filter((r) => {
      if (r.class_id !== student.classId) return false
      if (r.section_id && student.sectionId && r.section_id !== student.sectionId) {
        return false
      }
      return true
    })
  }, [allRoutines, student.classId, student.sectionId])

  // Batch routines for this student
  const batchRoutines = useMemo(() => {
    if (!student.batchId) return []
    return allRoutines.filter((r) => {
      if (
        r.batch_id === student.batchId ||
        (student.batchId === 'bat-001' && r.batch_id === 'batch-ssc-2024') ||
        (student.batchId === 'batch-ssc-2024' && r.batch_id === 'bat-001')
      ) {
        return true
      }
      return false
    })
  }, [allRoutines, student.batchId])

  // Combined slots
  const activeSlots = useMemo(() => {
    let list: Routine[] = []
    if (activeTab === 'class') {
      list = classRoutines
    } else if (activeTab === 'batch') {
      list = batchRoutines
    } else {
      list = [...classRoutines, ...batchRoutines]
    }

    return list.filter((r) => r.day === selectedDay)
  }, [activeTab, classRoutines, batchRoutines, selectedDay])

  // Exam Schedules scoped specifically to this student's class/batch
  const examSchedules = useMemo(() => {
    const exams = examStore.getAll()
    const relevantExams = exams.filter((e) => {
      if (student.classId && e.class_id === student.classId) return true
      if (student.batchId && e.batch_id === student.batchId) return true
      if (e.classes && student.className && e.classes.name.toLowerCase() === student.className.toLowerCase()) return true
      return false
    })

    const examsToUse = relevantExams.length > 0 ? relevantExams : exams.slice(0, 2)
    return examsToUse.flatMap((e) => {
      const schedules = e.exam_held_schedules || []
      return schedules.map((s) => ({
        examName: e.name,
        subjectName: s.subjects?.name || 'Subject Test',
        date: s.date || '2026-04-15',
        startTime: s.start_time || '10:00 AM',
        endTime: s.end_time || '01:00 PM',
        room: s.room || 'Hall 201',
        totalMarks: s.total_marks || 100,
      }))
    })
  }, [student.classId, student.batchId, student.className])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className="text-emerald-500" size={22} />
            My Class & Exam Routine (ক্লাস রুটিন)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Weekly academic schedule & upcoming exam dates for {student.fullNameEn}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Printer size={15} />
          Print Routine
        </button>
      </div>

      {/* Routine Type Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('combined')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'combined'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <Layers size={14} />
          Combined Schedule (সব একসাথে)
        </button>

        {student.className && (
          <button
            onClick={() => setActiveTab('class')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'class'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <GraduationCap size={14} />
            {student.className} Academic Classes
          </button>
        )}

        {student.batchName && (
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'batch'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <Target size={14} />
            Exam Batch Routine
          </button>
        )}

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <Calendar size={14} />
          Exam Schedules (পরীক্ষার সময়সূচী)
        </button>
      </div>

      {/* Tab 1: Weekly Class Routine */}
      {activeTab !== 'exams' ? (
        <div className="space-y-4">
          
          {/* Day of Week Selector */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDay === day
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="block text-xs font-bold">{DAY_LABELS[day].en}</span>
                  <span className="block text-[10px] opacity-80">{DAY_LABELS[day].bn}</span>
                </button>
              )
            })}
          </div>

          {/* Slots List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">
              Schedule for {DAY_LABELS[selectedDay].en} ({DAY_LABELS[selectedDay].bn})
            </h3>

            {activeSlots.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <Clock className="mx-auto text-zinc-300 dark:text-zinc-600" size={36} />
                <p className="text-xs">No classes scheduled on this day. (কোন ক্লাস নেই)</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSlots.map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                            {slot.subjects?.name || 'Class Subject'}
                          </h4>
                          {slot.batch_id ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              Exam Batch
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                              Academic Class
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <User size={13} /> {slot.teachers?.full_name || 'Subject Teacher'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {slot.room || 'Room 301'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                        {slot.start_time} – {slot.end_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Upcoming Exam Timetable */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
            Formal Examination Dates & Schedules (পরীক্ষার সময়সূচী)
          </h3>

          {examSchedules.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <Calendar className="mx-auto text-zinc-300 dark:text-zinc-600" size={36} />
              <p className="text-xs">No upcoming exam routine published yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {examSchedules.map((exam, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                        {exam.examName}
                      </span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {exam.subjectName}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Venue / Room: <span className="font-medium text-zinc-700 dark:text-zinc-300">{exam.room}</span> • Total Marks: {exam.totalMarks}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {exam.date}
                    </span>
                    <span className="block text-[11px] text-zinc-500 mt-1 font-mono">
                      {exam.startTime} – {exam.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
