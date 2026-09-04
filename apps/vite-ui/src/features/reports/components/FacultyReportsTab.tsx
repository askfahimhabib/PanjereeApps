import { useState, useMemo } from 'react'
import {
  Users,
  UserCheck,
  Briefcase,
  Mail,
  Phone,
  Search,
  Building2,
  Wallet,
  Clock,
} from 'lucide-react'
import type { FacultySummary } from '../types'
import { formatCurrency } from '../../payments/types'

interface Props {
  data: FacultySummary
}

export function FacultyReportsTab({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('ALL')

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return data.teacherList.filter((t) => {
      const matchesSearch =
        !searchTerm.trim() ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDept = selectedDept === 'ALL' || t.department === selectedDept

      return matchesSearch && matchesDept
    })
  }, [data.teacherList, searchTerm, selectedDept])

  const departments = useMemo(() => {
    return data.departmentBreakdown.map((d) => d.department)
  }, [data.departmentBreakdown])

  return (
    <div className="space-y-6">
      {/* ── 1. Top HR & Faculty KPIs ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Faculty</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 mt-2">{data.totalTeachers}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Teaching &amp; academic staff</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Active On Duty</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{data.activeCount}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Available for class allocation</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">On Leave</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{data.onLeaveCount}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Authorized absence / sick leave</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Disbursed Payroll</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-xl font-bold text-zinc-900 mt-2">{formatCurrency(data.payrollStats.totalDisbursed)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Completed salary disbursements</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Pending Payroll</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-600 mt-2">{formatCurrency(data.payrollStats.totalPending)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Awaiting disbursement</p>
        </div>
      </div>

      {/* ── 2. Department Breakdown & Designation Hierarchy ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department breakdown */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Departmental Distribution</h4>
              <p className="text-xs text-zinc-500">Teacher placement by academic departments</p>
            </div>
            <Building2 size={16} className="text-zinc-400" />
          </div>

          <div className="space-y-3">
            {data.departmentBreakdown.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">{dept.department}</span>
                  <span className="font-bold text-zinc-900">
                    {dept.count} <span className="text-[10px] text-zinc-400 font-normal">({dept.percentage}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Designation breakdown */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Designation &amp; Rank Breakdown</h4>
              <p className="text-xs text-zinc-500">Hierarchy of faculty positions</p>
            </div>
            <Briefcase size={16} className="text-zinc-400" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {data.designationBreakdown.map((des) => (
              <div
                key={des.designation}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-zinc-700 truncate" title={des.designation}>
                  {des.designation}
                </span>
                <p className="text-lg font-bold text-zinc-900 mt-1">{des.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Faculty Directory Table ───────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Faculty &amp; Staff Directory</h4>
            <p className="text-xs text-zinc-500">
              Showing {filteredFaculty.length} of {data.teacherList.length} staff members
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teacher, role..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-zinc-100">
          {filteredFaculty.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No faculty members found matching your search.
            </div>
          ) : (
            filteredFaculty.map((t) => (
              <div key={t.id} className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-xs truncate">{t.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {t.teacherId} • {t.designation}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] bg-zinc-50/70 p-2 rounded-xl border border-zinc-100 text-zinc-600">
                  <span className="font-medium text-zinc-800">{t.department}</span>
                  {t.qualification && <span className="text-zinc-500">{t.qualification}</span>}
                  {t.joiningDate && <span className="text-[10px] text-zinc-400 font-mono ml-auto">Joined: {t.joiningDate}</span>}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-50">
                  {t.mobile ? (
                    <a
                      href={`tel:${t.mobile}`}
                      className="inline-flex items-center gap-1 font-mono text-zinc-700 hover:text-indigo-600 text-xs font-medium"
                    >
                      <Phone size={12} className="text-emerald-600" />
                      <span>{t.mobile}</span>
                    </a>
                  ) : (
                    <span className="text-zinc-300 text-[10px]">No mobile</span>
                  )}

                  {t.email && (
                    <a
                      href={`mailto:${t.email}`}
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-indigo-600 truncate max-w-[160px]"
                    >
                      <Mail size={11} className="text-zinc-400" />
                      <span>{t.email}</span>
                    </a>
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
                <th className="px-4 py-3">Faculty Name</th>
                <th className="px-4 py-3">Teacher ID &amp; Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Joining Date</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    No faculty members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{t.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-zinc-700 block">{t.teacherId}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{t.designation}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800">{t.department}</td>
                    <td className="px-4 py-3 text-zinc-600">{t.qualification}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {t.mobile && (
                          <a
                            href={`tel:${t.mobile}`}
                            className="flex items-center gap-1 font-mono text-zinc-700 hover:text-blue-600"
                          >
                            <Phone size={10} className="text-zinc-400" />
                            {t.mobile}
                          </a>
                        )}
                        {t.email && (
                          <a
                            href={`mailto:${t.email}`}
                            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-blue-600 truncate max-w-[150px]"
                          >
                            <Mail size={10} className="text-zinc-400" />
                            {t.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">{t.joiningDate}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {t.status}
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
