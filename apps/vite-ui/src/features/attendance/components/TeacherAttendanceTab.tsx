import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCheck,
  Save,
  Search,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { teacherStore } from '@/data/stores'
import { useTeacherAttendance, todayString } from '../useAttendance'
import { TEACHER_STATUS_CONFIG, type TeacherAttendanceStatus } from '../types'

const TEACHER_STATUS_LIST: TeacherAttendanceStatus[] = [
  'PRESENT',
  'LATE',
  'ABSENT',
  'LEAVE',
  'HALF_DAY',
]

export function TeacherAttendanceTab() {
  const [date, setDate] = useState<string>(todayString())
  const [search, setSearch] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const teachers = useMemo(() => {
    return teacherStore.getWhere(t => t.isActive !== false)
  }, [])

  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return teachers
    const q = search.toLowerCase()
    return teachers.filter(
      t =>
        t.fullName.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q))
    )
  }, [teachers, search])

  const teacherIds = useMemo(() => teachers.map(t => t.id), [teachers])

  const {
    draft,
    timeInMap,
    timeOutMap,
    approvedTeacherLeaves,
    markTeacher,
    markAllTeachers,
    saveTeacherDraft,
  } = useTeacherAttendance(date)

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, LATE: 0, ABSENT: 0, LEAVE: 0, HALF_DAY: 0 }
    for (const status of Object.values(draft)) {
      if (counts[status] !== undefined) counts[status]++
    }
    const marked = counts.PRESENT + counts.LATE + counts.ABSENT + counts.LEAVE + counts.HALF_DAY
    return {
      total: teachers.length,
      present: counts.PRESENT,
      late: counts.LATE,
      absent: counts.ABSENT,
      leave: counts.LEAVE,
      halfDay: counts.HALF_DAY,
      unmarked: Math.max(0, teachers.length - marked),
    }
  }, [draft, teachers.length])

  const handleSave = () => {
    const list = teachers.map(t => ({
      id: t.id,
      fullName: t.fullName,
      department: t.department,
      designation: t.designation,
    }))
    saveTeacherDraft(list, 'Principal')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Top Controls Bar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              markAllTeachers('PRESENT', teacherIds)
              setIsSaved(false)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={() => {
              markAllTeachers('ABSENT', teacherIds)
              setIsSaved(false)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
            <CalendarDays size={15} className="text-zinc-500" />
            <input
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value)
                setIsSaved(false)
              }}
              className="bg-transparent text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Metric Counters ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-3.5 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Faculty</p>
          <p className="text-lg font-black text-zinc-900">{summary.total}</p>
        </div>
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present</p>
          <p className="text-lg font-black text-emerald-800">{summary.present}</p>
        </div>
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Late</p>
          <p className="text-lg font-black text-amber-800">{summary.late}</p>
        </div>
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent</p>
          <p className="text-lg font-black text-rose-800">{summary.absent}</p>
        </div>
        <div className="p-3.5 bg-indigo-50 border border-indigo-200/80 rounded-2xl">
          <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">On Leave</p>
          <p className="text-lg font-black text-indigo-800">{summary.leave}</p>
        </div>
        <div className="p-3.5 bg-purple-50 border border-purple-200/80 rounded-2xl">
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Half Day</p>
          <p className="text-lg font-black text-purple-800">{summary.halfDay}</p>
        </div>
      </div>

      {/* ── 3. Teacher Attendance Roster ────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
        {/* Table Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-black text-zinc-900">Faculty Daily Attendance & Punch Register</h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {filteredTeachers.length} Faculty Members Listed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search teacher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                isSaved ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {isSaved ? <CheckCheck size={14} /> : <Save size={14} />}
              <span>{isSaved ? 'Saved!' : 'Save Register'}</span>
            </button>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-100">
          {filteredTeachers.map(teacher => {
            const currentStatus = draft[teacher.id] || 'PRESENT'
            const approvedLeave = approvedTeacherLeaves.find(l => l.applicantId === teacher.id)
            const timeIn = timeInMap[teacher.id] || '08:25 AM'
            const timeOut = timeOutMap[teacher.id] || '04:30 PM'

            return (
              <div
                key={teacher.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 hover:bg-zinc-50/80 transition-colors"
              >
                {/* Teacher Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0">
                    {teacher.fullName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/teachers/${teacher.id}`}
                        className="text-sm font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate cursor-pointer"
                      >
                        {teacher.fullName}
                      </Link>
                      {approvedLeave && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                          Approved Leave: {approvedLeave.reason}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                      {teacher.designation || 'Lecturer'} · Department: {teacher.department || 'General'}
                    </p>
                  </div>
                </div>

                {/* Timing & Punch Info */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium">
                    <Clock size={13} className="text-zinc-500" />
                    <span>In: {timeIn}</span>
                    <span className="text-zinc-300">|</span>
                    <span>Out: {timeOut}</span>
                  </div>

                  {/* Status Button Chips */}
                  <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
                    {TEACHER_STATUS_LIST.map(status => {
                      const cfg = TEACHER_STATUS_CONFIG[status]
                      const isSelected = currentStatus === status
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            markTeacher(teacher.id, status)
                            setIsSaved(false)
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? cfg.btnActive
                              : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-zinc-600 font-semibold">
              Live Faculty Register: {summary.present} present · {summary.late} late · {summary.leave} on leave · {summary.absent} absent
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            {summary.present + summary.late}/{summary.total} On Duty
          </span>
        </div>
      </div>
    </div>
  )
}
