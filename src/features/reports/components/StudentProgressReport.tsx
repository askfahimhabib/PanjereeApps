import { useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus, BookOpen, BarChart3 } from 'lucide-react'
import type { StudentProgressSummary } from '../types'
import { GRADE_COLORS } from '../../examHeld/types'

interface Props {
  students: StudentProgressSummary[]
}

const GRADE_BG_MAP: Record<string, string> = {
  'A+': 'bg-emerald-500', 'A': 'bg-green-500', 'A-': 'bg-teal-500',
  'B': 'bg-blue-500', 'C': 'bg-amber-500', 'D': 'bg-orange-500', 'F': 'bg-red-500',
}

function TrendIcon({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) {
  if (trend === 'UP') return <TrendingUp size={14} className="text-emerald-400" />
  if (trend === 'DOWN') return <TrendingDown size={14} className="text-red-400" />
  return <Minus size={14} className="text-slate-400" />
}

function GpaTimeline({ exams }: { exams: StudentProgressSummary['exams'] }) {
  if (exams.length === 0) return null
  const max = 5
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">GPA Trend</p>
      <div className="relative flex items-end gap-3 h-16">
        {/* Baseline at 3.0 */}
        <div className="absolute left-0 right-0 border-t border-dashed border-slate-700/60" style={{ bottom: `${(3 / max) * 100}%` }}>
          <span className="absolute right-0 -top-3 text-[9px] text-slate-600">3.0</span>
        </div>
        {exams.map((exam, i) => {
          const heightPct = Math.round((exam.avgGpa / max) * 100)
          return (
            <div key={i} className="group flex-1 flex flex-col items-center gap-1 relative">
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-700 border border-slate-600 text-[10px] text-slate-200 rounded-lg px-2 py-1.5 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <p className="font-semibold text-xs">{exam.examName}</p>
                <p className="text-emerald-400">GPA: {exam.avgGpa.toFixed(2)}</p>
                <p className="text-slate-400">Grade: {exam.overallGrade}</p>
              </div>
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${GRADE_BG_MAP[exam.overallGrade] ?? 'bg-slate-500'}`}
                style={{ height: `${heightPct}%`, minHeight: '4px' }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-3">
        {exams.map((exam, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-[9px] text-slate-600 truncate">{exam.examName.split('–')[0].trim()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExamDetailRow({ exam }: { exam: StudentProgressSummary['exams'][0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <BookOpen size={13} className="text-slate-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-200">{exam.examName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{exam.date} · {exam.subjectResults.length} subjects</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${GRADE_COLORS[exam.overallGrade] ?? 'text-slate-400 border-slate-700'}`}>
            {exam.overallGrade}
          </span>
          <span className="text-xs text-slate-400 font-mono">{exam.avgGpa.toFixed(2)} GPA</span>
          <span className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>
      {open && (
        <div className="divide-y divide-slate-800/60">
          {exam.subjectResults.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_5rem_4rem_4rem] gap-2 items-center px-4 py-2.5 text-sm">
              <span className="text-slate-300">{s.subject}</span>
              <span className="text-slate-400 text-center font-mono">{s.marks}/{s.total}</span>
              <span className="text-slate-500 text-center text-xs">
                {Math.round((s.marks / s.total) * 100)}%
              </span>
              <span className={`text-[11px] font-bold text-center px-1.5 py-0.5 rounded border mx-auto ${GRADE_COLORS[s.grade] ?? 'text-slate-500 border-slate-700'}`}>
                {s.grade}
              </span>
              <span className="text-xs text-slate-500 text-center font-mono">{s.gpa.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StudentProgressCard({ student, isSelected, onClick }: {
  student: StudentProgressSummary
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'bg-purple-600/15 border-purple-500/40 ring-1 ring-purple-500/20'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{student.studentName}</p>
          <p className="text-xs text-slate-500">{student.className}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrendIcon trend={student.trend} />
          <span className="text-xs font-bold text-slate-300">{student.avgGpa.toFixed(2)}</span>
        </div>
      </div>
    </button>
  )
}

export function StudentProgressReport({ students }: Props) {
  const [selectedId, setSelectedId] = useState<string>(students[0]?.studentId ?? '')
  const selected = students.find(s => s.studentId === selectedId) ?? students[0]

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600">
        <BarChart3 size={40} className="mb-3 opacity-20" />
        <p className="text-sm">No student progress data available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">
      {/* Student list */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Students</p>
        {students.map(s => (
          <StudentProgressCard
            key={s.studentId}
            student={s}
            isSelected={s.studentId === selectedId}
            onClick={() => setSelectedId(s.studentId)}
          />
        ))}
      </div>

      {/* Selected student detail */}
      {selected && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-100">{selected.studentName}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{selected.className} · {selected.totalExams} exams</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{selected.avgGpa.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg GPA</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-sm font-bold text-slate-200">{selected.bestGrade}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendIcon trend={selected.trend} />
                <span className="text-xs text-slate-400">{selected.trend}</span>
              </div>
            </div>
          </div>

          {/* GPA Timeline */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4">
            <GpaTimeline exams={selected.exams} />
          </div>

          {/* Exam breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Exam History</p>
            {selected.exams.map((exam, i) => (
              <ExamDetailRow key={i} exam={exam} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
