import { useState, useMemo } from 'react'
import {
  Search,
  UserCircle,
  ArrowRightLeft,
  AlertTriangle,
  Award,
  Phone,
  Filter,
} from 'lucide-react'
import type { SectionStudent } from '../../types'
import { Link } from 'react-router-dom'

interface SectionStudentTableProps {
  students: SectionStudent[]
  onTransfer?: (student: SectionStudent) => void
}

export function SectionStudentTable({
  students,
  onTransfer,
}: SectionStudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [feeFilter, setFeeFilter] = useState<string>('ALL')
  const [attendanceFilter, setAttendanceFilter] = useState<string>('ALL')
  const [genderFilter, setGenderFilter] = useState<string>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search
      const matchSearch =
        student.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.roll).includes(searchTerm) ||
        `${student.rollPrefix}-${student.roll}`.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      // Fee filter
      if (feeFilter !== 'ALL' && student.feeStatus !== feeFilter) return false

      // Attendance filter
      if (attendanceFilter === 'LOW' && (student.attendanceRate ?? 80) >= 75) return false
      if (attendanceFilter === 'REGULAR' && (student.attendanceRate ?? 80) < 75) return false

      // Gender filter
      if (genderFilter !== 'ALL' && student.gender !== genderFilter) return false

      return true
    })
  }, [students, searchTerm, feeFilter, attendanceFilter, genderFilter])

  const getFeeStatusBadge = (status?: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-block text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            Paid
          </span>
        )
      case 'PARTIAL':
        return (
          <span className="inline-block text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            Partial
          </span>
        )
      case 'DUE':
        return (
          <span className="inline-block text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
            Due
          </span>
        )
      default:
        return null
    }
  }

  const getAttendanceBadge = (rate?: number) => {
    if (rate === undefined) return <span className="text-zinc-400 font-mono">—</span>
    if (rate < 75) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <AlertTriangle size={11} className="text-rose-600" />
          {rate}%
        </span>
      )
    }
    if (rate >= 90) {
      return (
        <span className="font-bold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          {rate}%
        </span>
      )
    }
    return (
      <span className="font-medium text-[11px] text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
        {rate}%
      </span>
    )
  }

  return (
    <div className="bg-white shadow-xs border border-zinc-200 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-50/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by name, ID or roll..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-2xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-zinc-500 font-medium">
            Showing <strong>{filteredStudents.length}</strong> of {students.length}
          </span>
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              showFilters || feeFilter !== 'ALL' || attendanceFilter !== 'ALL' || genderFilter !== 'ALL'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Bar */}
      {showFilters && (
        <div className="p-3 bg-zinc-50/90 border-b border-zinc-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-600">Fee Status:</span>
            <select
              value={feeFilter}
              onChange={e => setFeeFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-800 font-medium text-xs focus:outline-none"
            >
              <option value="ALL">All Fees</option>
              <option value="PAID">Paid Only</option>
              <option value="DUE">Due Only</option>
              <option value="PARTIAL">Partial Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-600">Attendance:</span>
            <select
              value={attendanceFilter}
              onChange={e => setAttendanceFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-800 font-medium text-xs focus:outline-none"
            >
              <option value="ALL">All Attendance</option>
              <option value="LOW">Low (&lt;75% Alert)</option>
              <option value="REGULAR">Regular (≥75%)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-600">Gender:</span>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-800 font-medium text-xs focus:outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Boys Only</option>
              <option value="FEMALE">Girls Only</option>
            </select>
          </div>

          {(feeFilter !== 'ALL' || attendanceFilter !== 'ALL' || genderFilter !== 'ALL') && (
            <button
              onClick={() => {
                setFeeFilter('ALL')
                setAttendanceFilter('ALL')
                setGenderFilter('ALL')
              }}
              className="text-xs font-semibold text-rose-600 hover:underline ml-auto cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
            <tr>
              <th className="text-center px-3 py-3 font-bold uppercase tracking-wider w-14">Roll</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Student Profile</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider hidden md:table-cell">ID & Contact</th>
              <th className="text-center px-3 py-3 font-bold uppercase tracking-wider hidden lg:table-cell">Gender</th>
              <th className="text-center px-3 py-3 font-bold uppercase tracking-wider">Exam GPA</th>
              <th className="text-center px-3 py-3 font-bold uppercase tracking-wider">Attendance</th>
              <th className="text-center px-3 py-3 font-bold uppercase tracking-wider">Fee</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-zinc-50/80 transition-colors group"
                >
                  {/* Roll number */}
                  <td className="px-3 py-3 text-center font-mono font-bold text-indigo-700 whitespace-nowrap">
                    #{String(student.roll).padStart(2, '0')}
                  </td>

                  {/* Student Name and Photo (Clickable to open profile directly) */}
                  <td className="px-4 py-3">
                    <Link
                      to={`/students/${student.id}`}
                      className="flex items-center gap-3 group/profile hover:opacity-90 transition-opacity cursor-pointer"
                      title="Click to view full student profile"
                    >
                      <div className="h-9 w-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 group-hover/profile:ring-2 group-hover/profile:ring-indigo-500/30 transition-all">
                        {student.profilePhoto ? (
                          <img src={student.profilePhoto} alt={student.fullNameEn} className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle className="h-6 w-6 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 group-hover/profile:text-indigo-600 group-hover/profile:underline transition-colors flex items-center gap-1">
                          <span>{student.fullNameEn}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-normal">{student.fullNameBn || '—'}</div>
                      </div>
                    </Link>
                  </td>

                  {/* ID and Guardian Contact */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="font-mono font-medium text-zinc-800">{student.studentId}</div>
                    {student.guardianPhone ? (
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="text-zinc-400" />
                        <span>{student.guardianPhone}</span>
                      </div>
                    ) : null}
                  </td>

                  {/* Gender */}
                  <td className="px-3 py-3 text-center text-zinc-700 capitalize hidden lg:table-cell">
                    {student.gender.toLowerCase()}
                  </td>

                  {/* Latest Exam GPA & Grade */}
                  <td className="px-3 py-3 text-center">
                    {student.latestGpa !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        <Award size={12} className="text-indigo-600" />
                        {student.latestGpa.toFixed(2)} ({student.latestGrade})
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-mono">—</span>
                    )}
                  </td>

                  {/* Attendance Rate */}
                  <td className="px-3 py-3 text-center">
                    {getAttendanceBadge(student.attendanceRate)}
                  </td>

                  {/* Fee Status */}
                  <td className="px-3 py-3 text-center">
                    {getFeeStatusBadge(student.feeStatus)}
                  </td>

                  {/* Actions: Always visible, clean Transfer Section action */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      {onTransfer ? (
                        <button
                          type="button"
                          onClick={() => onTransfer(student)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                          title="Transfer student to another section"
                        >
                          <ArrowRightLeft size={12} className="text-purple-600" />
                          <span>Transfer</span>
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                  No students found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
