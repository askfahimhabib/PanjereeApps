import { useState } from 'react'
import { Search, SlidersHorizontal, UserCircle, ExternalLink, ArrowRight } from 'lucide-react'
import type { SectionStudent } from '../../types'
import { Link } from 'react-router-dom'

interface SectionStudentTableProps {
  students: SectionStudent[]
  onTransfer?: (student: SectionStudent) => void
}

export function SectionStudentTable({ students, onTransfer }: SectionStudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students.filter(
    (student) =>
      student.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.rollPrefix}-${student.roll}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFeeStatusBadge = (status?: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-block text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Paid</span>
      case 'PARTIAL':
        return <span className="inline-block text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Partial</span>
      case 'DUE':
        return <span className="inline-block text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Due</span>
      default:
        return null
    }
  }

  const getAttendanceColor = (rate?: number) => {
    if (rate === undefined) return 'text-slate-400'
    if (rate >= 90) return 'text-emerald-400'
    if (rate >= 75) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search by name, ID or roll..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{filteredStudents.length} students</span>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead className="bg-slate-900/60 border-b border-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-24">Roll</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Student</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Student ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Gender</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Attend%</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Fee</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors group"
                >
                  <td className="px-4 py-3 text-sm font-mono font-medium text-blue-300 whitespace-nowrap">
                    {student.rollPrefix ? `${student.rollPrefix}-` : ''}{String(student.roll).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {student.profilePhoto ? (
                          <img src={student.profilePhoto} alt={student.fullNameEn} className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{student.fullNameEn}</div>
                        <div className="text-xs text-slate-500">{student.fullNameBn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell">{student.studentId}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 capitalize hidden lg:table-cell">
                    {student.gender.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-sm text-center hidden md:table-cell">
                    <span className={`font-medium ${getAttendanceColor(student.attendanceRate)}`}>
                      {student.attendanceRate !== undefined ? `${student.attendanceRate}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getFeeStatusBadge(student.feeStatus)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onTransfer && (
                        <button
                          onClick={() => onTransfer(student)}
                          className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Transfer to another section"
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}
                      <Link
                        to={`/admin/students/${student.studentId}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-700/60 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors"
                        title="View profile"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  No students found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
