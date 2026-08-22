import { useState, useMemo } from 'react'
import { CalendarDays, Save, CheckCheck, ChevronDown } from 'lucide-react'
import { mockSections } from '@/features/classes/mockData'
import { createStore } from '@/lib/localStore'
import { useAttendance, buildSummary, todayString } from '@/features/attendance/useAttendance'
import { AttendanceRow } from '@/features/attendance/components/AttendanceRow'
import { AttendanceSummaryBar } from '@/features/attendance/components/AttendanceSummaryBar'
import type { AttendanceStatus } from '@/features/attendance/types'
import type { Student } from '@/features/students/types'
import type { ClassItem } from '@/features/classes/types'

const studentStore = createStore<Student>('students')
const classStore   = createStore<ClassItem>('classes')

// ─── Quick-fill statuses ──────────────────────────────────────
const QUICK_FILL: { label: string; status: AttendanceStatus; color: string }[] = [
  { label: 'All Present',  status: 'PRESENT', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'All Absent',   status: 'ABSENT',  color: 'bg-red-600 hover:bg-red-700' },
]

export function Attendance() {
  // Load only active classes from store (fallback to mockData defaults)
  const activeClasses = useMemo(() => {
    const stored = classStore.getAll().map(c => ({ isActive: true, ...c } as ClassItem & { isActive: boolean }))
    return stored.length > 0 ? stored.filter(c => c.isActive !== false) : []
  }, [])

  const [selectedClassId,   setSelectedClassId]   = useState<string>(activeClasses[0]?.id ?? '')
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [date, setDate]                           = useState<string>(todayString())
  const [isSaved, setIsSaved]                     = useState(false)

  // Sections for the selected class
  const classSections = useMemo(
    () => mockSections.filter(s => s.classId === selectedClassId),
    [selectedClassId]
  )

  // Auto-select first section when class changes
  const activeSectionId = selectedSectionId || classSections[0]?.id || ''

  // Students for this class+section (ACTIVE only)
  const sectionStudents = useMemo(() => {
    return studentStore
      .getWhere(s => s.classId === selectedClassId && s.status === 'ACTIVE')
      .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
  }, [selectedClassId, activeSectionId])

  const studentIds = useMemo(() => sectionStudents.map(s => s.id), [sectionStudents])

  // Attendance hook
  const { draft, markStudent, markAll, saveDraft } = useAttendance(
    selectedClassId,
    activeSectionId,
    date
  )

  const summary = buildSummary(draft, sectionStudents.length)

  const handleSave = () => {
    // Build proper records with student names before saving
    const nameMap: Record<string, { name: string; roll: string }> = {}
    for (const s of sectionStudents) nameMap[s.id] = { name: s.fullNameEn, roll: s.rollNumber }

    saveDraft(studentIds, 'Teacher')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    setSelectedSectionId('')
    setIsSaved(false)
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-slate-400 mt-1 text-sm">Daily student attendance tracking</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
          <CalendarDays size={16} className="text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setIsSaved(false) }}
            className="bg-transparent text-sm text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Class Selector ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex-shrink-0">Class:</span>
        <div className="flex gap-1.5 flex-wrap">
          {activeClasses.map((c) => (
            <button
              key={c.id}
              onClick={() => handleClassChange(c.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                selectedClassId === c.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section Selector (if multiple sections exist) ────── */}
      {classSections.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex-shrink-0">Section:</span>
          <div className="flex gap-1.5">
            {classSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => { setSelectedSectionId(sec.id); setIsSaved(false) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  activeSectionId === sec.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Section {sec.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Card ────────────────────────────────────────── */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {activeClasses.find(c => c.id === selectedClassId)?.name}
              {classSections.length > 0 && ` — Section ${classSections.find(s => s.id === activeSectionId)?.name ?? classSections[0]?.name ?? ''}`}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {sectionStudents.length} active students · {new Date(date).toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Quick fill + Save */}
          <div className="flex items-center gap-2">
            {QUICK_FILL.map(qf => (
              <button
                key={qf.status}
                onClick={() => { markAll(qf.status, studentIds); setIsSaved(false) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all ${qf.color}`}
              >
                <CheckCheck size={13} />
                {qf.label}
              </button>
            ))}
            <button
              onClick={handleSave}
              disabled={sectionStudents.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
            >
              <Save size={13} />
              Save
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/30">
          <AttendanceSummaryBar summary={summary} isSaved={isSaved} />
        </div>

        {/* Student List */}
        <div className="p-4 space-y-2">
          {sectionStudents.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500">
              <ChevronDown size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No active students found for this class.</p>
              <p className="text-xs text-slate-600 mt-1">Add students from the Students module first.</p>
            </div>
          ) : (
            sectionStudents.map(student => (
              <AttendanceRow
                key={student.id}
                studentId={student.id}
                rollNumber={student.rollNumber}
                fullNameEn={student.fullNameEn}
                fullNameBn={student.fullNameBn}
                status={draft[student.id]}
                onChange={(id, status) => { markStudent(id, status); setIsSaved(false) }}
              />
            ))
          )}
        </div>

        {/* Sticky footer save button for long lists */}
        {sectionStudents.length > 8 && (
          <div className="sticky bottom-0 px-5 py-3 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm flex justify-end">
            <button
              onClick={handleSave}
              disabled={sectionStudents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
            >
              <Save size={15} />
              Save Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
