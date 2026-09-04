import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCheck,
  XCircle,
  Save,
  Users,
  Search,
  Printer,
  MessageSquare,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { classStore, sectionStore, studentStore } from '@/data/stores'
import { useAttendance, buildSummary, todayString } from '../useAttendance'
import { STATUS_CONFIG, ALL_STATUSES } from '../types'
import { AbsentSmsModal } from './AbsentSmsModal'
import { PrintableRegisterModal } from './PrintableRegisterModal'

export function StudentAttendanceTab() {
  const activeClasses = useMemo(() => {
    return classStore.getAll().filter(c => c.isActive !== false)
  }, [])

  const [selectedClassId, setSelectedClassId] = useState<string>(activeClasses[0]?.id ?? 'cls-10')
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [date, setDate] = useState<string>(todayString())
  const [search, setSearch] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Sections for chosen class
  const classSections = useMemo(
    () => sectionStore.getWhere(s => s.classId === selectedClassId),
    [selectedClassId]
  )

  const activeSectionId = selectedSectionId || classSections[0]?.id || ''
  const currentClass = activeClasses.find(c => c.id === selectedClassId)
  const currentSection = classSections.find(s => s.id === activeSectionId) || classSections[0]

  // Students for this class + section (sorted by roll)
  const sectionStudents = useMemo(() => {
    return studentStore
      .getWhere(s => {
        if (s.classId !== selectedClassId || s.status !== 'ACTIVE') return false
        if (activeSectionId && s.sectionId !== activeSectionId && s.sectionName !== currentSection?.name) {
          // If student has a matching sectionId or sectionName
          return s.sectionId === activeSectionId || s.sectionName === currentSection?.name
        }
        return true
      })
      .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
  }, [selectedClassId, activeSectionId, currentSection])

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return sectionStudents
    const q = search.toLowerCase()
    return sectionStudents.filter(
      s =>
        s.fullNameEn.toLowerCase().includes(q) ||
        (s.fullNameBn && s.fullNameBn.includes(q)) ||
        s.rollNumber.includes(q) ||
        s.studentId.toLowerCase().includes(q)
    )
  }, [sectionStudents, search])

  const studentIds = useMemo(() => sectionStudents.map(s => s.id), [sectionStudents])

  // Attendance Hook
  const {
    draft,
    timeInMap,
    approvedLeaves,
    holiday,
    markStudent,
    markAll,
    clearAll,
    saveDraft,
  } = useAttendance(selectedClassId, activeSectionId, date)

  const summary = buildSummary(draft, sectionStudents.length)

  // Absent students for SMS broadcast
  const absentStudents = useMemo(() => {
    return sectionStudents
      .filter(s => draft[s.id] === 'ABSENT')
      .map(s => ({
        id: s.id,
        name: s.fullNameEn,
        roll: s.rollNumber,
        guardianPhone: s.mobile || s.father?.mobile || s.mother?.mobile,
      }))
  }, [sectionStudents, draft])

  const handleSave = () => {
    const studentList = sectionStudents.map(s => ({
      id: s.id,
      fullNameEn: s.fullNameEn,
      rollNumber: s.rollNumber,
      classId: selectedClassId,
      sectionId: activeSectionId,
    }))
    saveDraft(studentList, 'Admin Teacher')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleSetToday = () => {
    setDate(todayString())
    setIsSaved(false)
  }

  const handleSetYesterday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().split('T')[0])
    setIsSaved(false)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Class & Section Picker Header ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-4">
        {/* Class Chips Strip */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              1. Select Class
            </label>
            <span className="text-xs text-zinc-500 font-medium">
              Showing active academic classes
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {activeClasses.map(c => {
              const isSelected = selectedClassId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedClassId(c.id)
                    setSelectedSectionId('')
                    setIsSaved(false)
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.hasGroups && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Stream
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section Chips + Date Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-zinc-100">
          {/* Section Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider shrink-0 mr-1">
              Section:
            </span>
            {classSections.length === 0 ? (
              <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-xl border border-zinc-200">
                General Section
              </span>
            ) : (
              classSections.map(sec => {
                const isSelected = activeSectionId === sec.id
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(sec.id)
                      setIsSaved(false)
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-2xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    Section {sec.name}
                    {sec.groupName ? ` (${sec.groupName})` : ''}
                  </button>
                )
              })
            )}
          </div>

          {/* Date Picker + Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={handleSetToday}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  date === todayString() ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleSetYesterday}
                className="px-2.5 py-1 text-xs font-bold rounded-lg text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer"
              >
                Yesterday
              </button>
            </div>

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
      </div>

      {/* Holiday Notification Banner (if any) */}
      {holiday && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                School Holiday: {holiday.title}
              </p>
              <p className="text-[11px] text-amber-700">
                {holiday.description || 'Academic activities are officially paused on this date.'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full">
            Holiday
          </span>
        </div>
      )}

      {/* ── 2. Batch Toolbar & Live Counters ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                markAll('PRESENT', studentIds)
                setIsSaved(false)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <CheckCheck size={14} />
              <span>Mark All Present</span>
            </button>

            <button
              type="button"
              onClick={() => {
                markAll('ABSENT', studentIds)
                setIsSaved(false)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs shadow-rose-600/20 transition-all cursor-pointer"
            >
              <XCircle size={14} />
              <span>Mark All Absent</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearAll(studentIds)
                setIsSaved(false)
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
              title="Reset markings"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <div className="h-5 w-px bg-zinc-200 hidden sm:block mx-1" />

            <button
              type="button"
              onClick={() => setIsSmsModalOpen(true)}
              disabled={absentStudents.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 text-xs font-bold transition-all cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Absent SMS ({absentStudents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              disabled={sectionStudents.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Sheet</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, roll, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        {/* Live Counters Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4 border-t border-zinc-100">
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Enrolled</p>
            <p className="text-lg font-black text-zinc-900">{summary.total}</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present</p>
            <p className="text-lg font-black text-emerald-800">{summary.present}</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Late</p>
            <p className="text-lg font-black text-amber-800">{summary.late}</p>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent</p>
            <p className="text-lg font-black text-rose-800">{summary.absent}</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl">
            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">On Leave</p>
            <p className="text-lg font-black text-indigo-800">{summary.leave}</p>
          </div>
          <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rate</p>
            <p className="text-lg font-black text-indigo-700">{summary.attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* ── 3. Student Attendance Table ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
        {/* Table Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-black text-zinc-900">
              {currentClass?.name} {currentSection ? `— Section ${currentSection.name}` : ''} Roster
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {filteredStudents.length} Students Listed · Click student name to view detailed profile
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={sectionStudents.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
            }`}
          >
            {isSaved ? <CheckCheck size={15} /> : <Save size={15} />}
            <span>{isSaved ? 'Saved to Register!' : 'Save Register'}</span>
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-100">
          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Users size={36} className="mx-auto mb-2 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-700">No students found in this roster</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Verify section selection or add students in the Students module.
              </p>
            </div>
          ) : (
            filteredStudents.map(student => {
              const currentStatus = draft[student.id]
              const approvedLeave = approvedLeaves.find(l => l.applicantId === student.id)
              const timeIn = timeInMap[student.id]

              return (
                <div
                  key={student.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-zinc-50/80 transition-colors"
                >
                  {/* Student Identity */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 font-black text-xs font-mono text-zinc-700 flex items-center justify-center shrink-0">
                      #{student.rollNumber}
                    </span>

                    <Link
                      to={`/students/${student.id}`}
                      className="min-w-0 group flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate">
                          {student.fullNameEn}
                        </p>
                        {approvedLeave && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                            Approved Leave ({approvedLeave.reason})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                        ID: {student.studentId} · Guardian: {student.mobile || student.father?.mobile || '01700-000000'}
                      </p>
                    </Link>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center gap-2 w-full md:w-auto md:shrink-0 justify-between md:justify-end">
                    {/* Status Pill Buttons */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 flex-1 md:flex-initial">
                      {ALL_STATUSES.map(status => {
                        const cfg = STATUS_CONFIG[status]
                        const isSelected = currentStatus === status
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              markStudent(student.id, status)
                              setIsSaved(false)
                            }}
                            className={`px-3 py-2 md:py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                              isSelected
                                ? cfg.btnActive
                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                            }`}
                          >
                            {cfg.shortLabel}
                          </button>
                        )
                      })}
                    </div>

                    {/* Time In Pill */}
                    {currentStatus === 'LATE' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-xl shrink-0">
                        <Clock size={12} />
                        {timeIn || '08:40 AM'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer live status summary bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-zinc-600 font-semibold">
              Live Register: {summary.present} present, {summary.late} late, {summary.absent} absent, {summary.leave} on leave
              {summary.unmarked > 0 && <span className="text-amber-600 ml-1">({summary.unmarked} unmarked)</span>}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            {summary.attendanceRate}% Attendance Rate
          </span>
        </div>
      </div>

      {/* ── 4. Modals ────────────────────────────────────────────────────── */}
      <AbsentSmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        className={currentClass?.name || 'Class'}
        sectionName={currentSection?.name || 'A'}
        date={date}
        absentStudents={absentStudents}
      />

      <PrintableRegisterModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        className={currentClass?.name || 'Class'}
        sectionName={currentSection?.name || 'A'}
        date={date}
        students={sectionStudents.map(s => ({
          id: s.id,
          name: s.fullNameEn,
          nameBn: s.fullNameBn,
          roll: s.rollNumber,
          gender: s.gender,
        }))}
        draft={draft}
      />
    </div>
  )
}
