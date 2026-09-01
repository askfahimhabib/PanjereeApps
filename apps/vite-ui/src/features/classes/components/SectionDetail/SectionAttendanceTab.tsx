import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
} from 'lucide-react'
import type { Section, SectionStudent } from '../../types'
import { attendanceStore } from '@/data/stores'

interface SectionAttendanceTabProps {
  section: Section
  students: SectionStudent[]
}

export function SectionAttendanceTab({ section, students }: SectionAttendanceTabProps) {
  const today = new Date().toISOString().split('T')[0]
  
  // Find today's attendance records for students in this section
  const todayAttendance = useMemo(() => {
    const studentIds = new Set(students.map(s => s.id))
    return attendanceStore.getWhere(a => a.date === today && studentIds.has(a.studentId))
  }, [students, today])

  const todayPresentCount = todayAttendance.filter(a => a.status === 'PRESENT').length
  const todayAbsentCount = todayAttendance.filter(a => a.status === 'ABSENT').length
  const isAttendanceTakenToday = todayAttendance.length > 0
  const todayRate = isAttendanceTakenToday
    ? Math.round((todayPresentCount / (todayPresentCount + todayAbsentCount || 1)) * 100)
    : Math.round(students.reduce((sum, s) => sum + (s.attendanceRate || 85), 0) / (students.length || 1))

  // Risk students (< 75% attendance)
  const atRiskStudents = useMemo(() => {
    return students.filter(s => (s.attendanceRate || 0) < 75)
  }, [students])

  return (
    <div className="space-y-5">
      {/* Today's Live Attendance Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900">
                Today's Section Attendance: <span className="text-emerald-700">{todayRate}%</span>
              </h3>
              {isAttendanceTakenToday ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live Recorded
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Estimated Average
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/attendance`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            <span>Take Today's Attendance</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Average Attendance</p>
            <p className="text-xl font-black text-emerald-700">{todayRate}%</p>
            <p className="text-[11px] text-zinc-500">Regular Section Metric</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Under 75% Attendance</p>
            <p className="text-xl font-black text-amber-700">{atRiskStudents.length} Students</p>
            <p className="text-[11px] text-zinc-500">Board Exam Risk</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Enrolled</p>
            <p className="text-xl font-black text-indigo-700">{students.length}</p>
            <p className="text-[11px] text-zinc-500">Capacity: {section.capacity}</p>
          </div>
        </div>
      </div>

      {/* At-Risk Warning Box */}
      {atRiskStudents.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
            <AlertTriangle size={16} className="text-amber-600" />
            <span>Attendance Risk Warning ({atRiskStudents.length} Students &lt; 75%)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed mb-3">
            The following students have less than 75% attendance. According to Bangladesh education board regulations, students with under 75% attendance are categorized as non-collegiate or discollegiate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {atRiskStudents.map(student => (
              <div
                key={student.id}
                className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-900">
                    Roll {student.roll}: {student.fullNameEn}
                  </div>
                  <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                    Attendance: {student.attendanceRate}%
                  </div>
                </div>
                {student.guardianPhone && (
                  <a
                    href={`tel:${student.guardianPhone}`}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-600 transition-colors"
                    title={`Call Guardian: ${student.guardianPhone}`}
                  >
                    <PhoneCall size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Roster Attendance Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            All Student Attendance Summary ({students.length} Students)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="py-3 px-4 text-center font-bold w-16">Roll</th>
                <th className="py-3 px-4 text-left font-bold">Student</th>
                <th className="py-3 px-4 text-left font-bold">Student ID</th>
                <th className="py-3 px-4 text-center font-bold">Attendance Rate</th>
                <th className="py-3 px-4 text-center font-bold">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {students.map(student => {
                const rate = student.attendanceRate ?? 80
                const isWarning = rate < 75
                return (
                  <tr key={student.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-indigo-700">
                      #{String(student.roll).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-4">
                      <Link
                        to={`/students/${student.id}`}
                        className="font-semibold text-zinc-900 hover:text-indigo-600 hover:underline block"
                        title="View student profile"
                      >
                        {student.fullNameEn}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">
                      {student.studentId}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-zinc-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rate >= 85 ? 'bg-emerald-500' : rate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className={`font-bold font-mono ${rate >= 75 ? 'text-zinc-800' : 'text-rose-600'}`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {isWarning ? (
                        <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-md text-[10px]">
                          Discollegiate (&lt;75%)
                        </span>
                      ) : rate >= 90 ? (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-md text-[10px]">
                          Excellent (Collegiate)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium rounded-md text-[10px]">
                          Regular
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
