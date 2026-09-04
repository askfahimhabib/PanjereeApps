import { useState, useMemo } from 'react'
import {
  Users,
  UserCheck,
  Heart,
  Search,
  Phone,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import type { StudentEnrollmentSummary } from '../types'

interface Props {
  data: StudentEnrollmentSummary
}

export function StudentReportsTab({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('ALL')
  const [selectedShift, setSelectedShift] = useState<string>('ALL')

  // Filtered student roster
  const filteredStudents = useMemo(() => {
    return data.studentList.filter((s) => {
      const matchesSearch =
        !searchTerm.trim() ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesClass = selectedClass === 'ALL' || s.className === selectedClass
      const matchesShift = selectedShift === 'ALL' || s.shift === selectedShift

      return matchesSearch && matchesClass && matchesShift
    })
  }, [data.studentList, searchTerm, selectedClass, selectedShift])

  // Unique class names for local filter
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>()
    data.studentList.forEach((s) => {
      if (s.className) set.add(s.className)
    })
    return Array.from(set).sort()
  }, [data.studentList])

  return (
    <div className="space-y-6">
      {/* ── 1. Top Executive Headcount KPIs ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 mt-2">{data.totalStudents}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{data.activeCount} Active</span>
            {data.inactiveCount > 0 && <span className="text-zinc-400">· {data.inactiveCount} Inactive</span>}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Gender Ratio</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-zinc-900">{data.maleCount}M</span>
            <span className="text-zinc-400 font-normal">/</span>
            <span className="text-2xl font-bold text-zinc-900">{data.femaleCount}F</span>
          </div>
          {/* Progress split */}
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2 flex overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${data.malePercentage}%` }} />
            <div className="bg-pink-500 h-full" style={{ width: `${data.femalePercentage}%` }} />
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Shift Distribution</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {data.shiftBreakdown.map((s) => (
              <div key={s.shift} className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-medium">{s.shift}</span>
                <span className="font-bold text-zinc-900">{s.count} <span className="text-[10px] text-zinc-400 font-normal">({s.percentage}%)</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Curriculum Version</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {data.versionBreakdown.map((v) => (
              <div key={v.version} className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-medium">{v.version}</span>
                <span className="font-bold text-zinc-900">{v.count} <span className="text-[10px] text-zinc-400 font-normal">({v.percentage}%)</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Active Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {data.totalStudents > 0 ? Math.round((data.activeCount / data.totalStudents) * 100) : 0}%
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Operational Student Health</p>
        </div>
      </div>

      {/* ── 2. Class Breakdown & Blood Group Directory ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Class distribution progress bars */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Class-wise Enrollment & Capacity</h3>
              <p className="text-xs text-zinc-500">Student count and gender representation across classes</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">
              {data.classBreakdown.length} Classes
            </span>
          </div>

          <div className="space-y-3.5">
            {data.classBreakdown.map((c) => {
              const pct = data.totalStudents > 0 ? Math.round((c.studentCount / data.totalStudents) * 100) : 0
              return (
                <div key={c.classId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">{c.className}</span>
                      <span className="text-[11px] text-zinc-400">
                        ({c.maleCount} Boys, {c.femaleCount} Girls)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{c.studentCount} students</span>
                      <span className="text-[11px] text-zinc-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                      style={{
                        width: c.studentCount > 0 ? `${(c.maleCount / c.studentCount) * pct}%` : '0%',
                      }}
                      title={`Boys: ${c.maleCount}`}
                    />
                    <div
                      className="h-full bg-pink-500 rounded-r-full transition-all duration-500"
                      style={{
                        width: c.studentCount > 0 ? `${(c.femaleCount / c.studentCount) * pct}%` : '0%',
                      }}
                      title={`Girls: ${c.femaleCount}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Blood group tags */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900">Blood Group Roster</h3>
              <Heart size={16} className="text-rose-500" />
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Emergency readiness blood group matrix of enrolled students
            </p>

            <div className="grid grid-cols-2 gap-2">
              {data.bloodGroupBreakdown.map((b) => (
                <div
                  key={b.bloodGroup}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100"
                >
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {b.bloodGroup}
                  </span>
                  <span className="text-xs font-bold text-zinc-800">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800">
            <strong>Emergency Contact Notice:</strong> Full medical dossiers are linked with guardian emergency numbers.
          </div>
        </div>
      </div>

      {/* ── 3. Filterable Student Directory Ledger ───────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Enrolled Student Directory</h3>
            <p className="text-xs text-zinc-500">
              Showing {filteredStudents.length} of {data.studentList.length} total students
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, ID, roll..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Day">Day</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-zinc-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No students match the selected filters.
            </div>
          ) : (
            filteredStudents.map((s) => (
              <div key={s.id} className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-xs truncate">{s.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {s.studentId} • Roll #{s.rollNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-50/70 p-2 rounded-xl border border-zinc-100">
                  <span className="font-medium text-zinc-800">{s.className} (Sec {s.sectionName})</span>
                  <span>• {s.shift}</span>
                  <span className="capitalize">• {s.gender}</span>
                  {s.bloodGroup && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded ml-auto">
                      {s.bloodGroup}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-50">
                  <span className="text-zinc-400 text-[10px]">Guardian:</span>
                  {s.guardianMobile ? (
                    <a
                      href={`tel:${s.guardianMobile}`}
                      className="inline-flex items-center gap-1 font-mono text-zinc-700 hover:text-indigo-600 text-xs font-medium"
                    >
                      <Phone size={12} className="text-emerald-600" />
                      <span>{s.guardianMobile}</span>
                    </a>
                  ) : (
                    <span className="text-zinc-300 text-[10px]">No phone</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">ID & Roll</th>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Shift & Version</th>
                <th className="px-4 py-3">Gender & Blood</th>
                <th className="px-4 py-3">Guardian Mobile</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center text-[11px]">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{s.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-700">
                      <div>{s.studentId}</div>
                      <div className="text-[10px] text-zinc-400">Roll: {s.rollNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800">
                      <div>{s.className}</div>
                      <div className="text-[10px] text-zinc-400 font-normal">Section {s.sectionName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{s.shift}</div>
                      <div className="text-[10px] text-zinc-400">{s.version}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="capitalize">{s.gender}</div>
                      {s.bloodGroup && (
                        <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                          {s.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.guardianMobile ? (
                        <a
                          href={`tel:${s.guardianMobile}`}
                          className="inline-flex items-center gap-1 font-mono text-zinc-700 hover:text-blue-600"
                        >
                          <Phone size={11} className="text-zinc-400" />
                          {s.guardianMobile}
                        </a>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
