import { Eye, Trash2, ChevronLeft, ChevronRight, Phone, MessageSquare, ExternalLink, Star, Copy, Check, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Teacher } from '../types'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DESIGNATION_LABELS,
  DEPARTMENT_LABELS,
} from '../types'
import {
  getTeacherWorkload,
  getTeacherTodayLeaveStatus,
  getTeacherClassTeacherAssignment,
  getTeacherCurrentMonthSalary,
} from '../utils/teacherSync'

interface Props {
  teachers: Teacher[]
  currentPage: number
  totalPages: number
  totalResults: number
  onPageChange: (page: number) => void
  onView: (teacher: Teacher) => void
  onDelete: (id: string) => void
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    'bg-indigo-600', 'bg-blue-600', 'bg-purple-600',
    'bg-emerald-600', 'bg-rose-600', 'bg-amber-600',
    'bg-teal-600', 'bg-cyan-600',
  ]
  const index = id.charCodeAt(id.length - 1) % colors.length
  return colors[index]
}

export function TeacherTable({
  teachers,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  onView,
  onDelete,
}: Props) {
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyToClipboard(text: string, id: string, e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function handleWhatsApp(teacher: Teacher, e: React.MouseEvent) {
    e.stopPropagation()
    const cleanNumber = teacher.phone.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`}?text=Assalamu%20Alaikum%20${encodeURIComponent(teacher.fullName)},%20regarding%20school%20schedule%20update.`
    window.open(url, '_blank')
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-2xs">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-zinc-800 mb-1">No faculty members found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          No teacher matches the selected filter criteria. Try resetting filters or onboard a new teacher.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden">
      {/* ── Mobile Card List View (Phones & Small Devices: Native App Style) ── */}
      <div className="block md:hidden divide-y divide-zinc-100">
        {teachers.map((teacher) => {
          const workload = getTeacherWorkload(teacher.id)
          const leaveStatus = getTeacherTodayLeaveStatus(teacher.id)
          const ctAssignment = getTeacherClassTeacherAssignment(teacher)
          const salaryStatus = getTeacherCurrentMonthSalary(teacher.id)

          return (
            <div
              key={teacher.id}
              onClick={() => onView(teacher)}
              className="p-3.5 hover:bg-zinc-50/90 active:bg-zinc-100 transition-colors cursor-pointer space-y-2.5"
            >
              {/* Top Row: Avatar, Name, Workload & Leave Status */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${getAvatarColor(teacher.id)} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs`}
                  >
                    {teacher.profilePhoto ? (
                      <img
                        src={teacher.profilePhoto}
                        alt={teacher.fullName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      getInitials(teacher.fullName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        navigate(`/teachers/${teacher.id}`)
                      }}
                      className="font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate text-xs text-left"
                    >
                      {teacher.fullName}
                    </button>
                    {teacher.nameBangla && (
                      <p className="text-[10px] text-zinc-400 font-medium truncate leading-tight">
                        {teacher.nameBangla}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ID: {teacher.teacherId}
                      </span>
                      <button
                        onClick={e => copyToClipboard(teacher.teacherId, teacher.id, e)}
                        className="p-0.5 text-zinc-400 hover:text-zinc-600"
                        title="Copy ID"
                      >
                        {copiedId === teacher.id ? (
                          <Check size={10} className="text-emerald-600" />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status & Workload Badge */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {leaveStatus.isOnLeave ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      On Leave
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Present
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {workload.weeklyClasses} classes/wk
                  </span>
                </div>
              </div>

              {/* Middle Row: Designation, Dept, Class Teacher assignment */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-medium">
                  {DESIGNATION_LABELS[teacher.designation] || teacher.designation}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 font-medium">
                  {(teacher.department && DEPARTMENT_LABELS[teacher.department]) || teacher.department || 'General'}
                </span>

                {ctAssignment.isClassTeacher && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    Class Teacher: {ctAssignment.classLabel}
                  </span>
                )}

                {salaryStatus === 'PAID' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold ml-auto">
                    <CheckCircle2 size={10} /> Salary Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold ml-auto">
                    <Clock size={10} /> Salary Due
                  </span>
                )}
              </div>

              {/* Bottom Row: Contact & Actions Strip */}
              <div
                className="flex items-center justify-between pt-2 border-t border-zinc-100"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  {teacher.phone && (
                    <a
                      href={`tel:${teacher.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-indigo-600 text-xs font-mono font-medium"
                    >
                      <Phone size={11} className="text-zinc-400" />
                      {teacher.phone}
                    </a>
                  )}
                  {teacher.phone && (
                    <a
                      href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageSquare size={13} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onView(teacher)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Profile"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/teachers/salary?search=${encodeURIComponent(teacher.fullName)}`)}
                    className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="View Salary Desk"
                  >
                    <CreditCard size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete faculty record for ${teacher.fullName}?`)) {
                        onDelete(teacher.id)
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop Table View (Kept 100% Intact for Large Screens) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left min-w-[780px]">
          <thead className="bg-zinc-50/80 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-3.5 py-3 w-10 text-center">#</th>
              <th className="px-3.5 py-3 min-w-[210px]">Faculty Member & Load</th>
              <th className="px-3.5 py-3 min-w-[160px]">Designation & Role</th>
              <th className="px-3.5 py-3 min-w-[130px]">Subject / Dept</th>
              <th className="px-3.5 py-3 min-w-[140px]">Contact & WhatsApp</th>
              <th className="px-3.5 py-3 min-w-[110px] text-center">Status & Salary</th>
              <th className="px-3.5 py-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {teachers.map((teacher, idx) => {
              const rowNum = (currentPage - 1) * 10 + idx + 1
              const workload = getTeacherWorkload(teacher.id)
              const leaveStatus = getTeacherTodayLeaveStatus(teacher.id)
              const ctAssignment = getTeacherClassTeacherAssignment(teacher)
              const salaryStatus = getTeacherCurrentMonthSalary(teacher.id)

              return (
                <tr
                  key={teacher.id}
                  onClick={() => onView(teacher)}
                  className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-3.5 py-2.5 text-center text-zinc-400 font-mono font-medium align-top pt-3">
                    {rowNum}
                  </td>

                  <td className="px-3.5 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl ${getAvatarColor(teacher.id)} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-xs mt-0.5`}
                      >
                        {teacher.profilePhoto ? (
                          <img
                            src={teacher.profilePhoto}
                            alt={teacher.fullName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          getInitials(teacher.fullName)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            navigate(`/teachers/${teacher.id}`)
                          }}
                          className="font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate flex items-center gap-1 group/link text-xs max-w-[180px]"
                        >
                          {teacher.fullName}
                          <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-70 transition-opacity" />
                        </button>
                        {teacher.nameBangla && (
                          <div className="text-[10px] text-zinc-500 font-medium truncate max-w-[180px] leading-tight mt-0.5">
                            {teacher.nameBangla}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                            {teacher.teacherId}
                          </span>
                          <button
                            onClick={e => copyToClipboard(teacher.teacherId, teacher.id, e)}
                            className="p-0.5 text-zinc-300 hover:text-zinc-600 rounded transition-colors cursor-pointer"
                          >
                            {copiedId === teacher.id ? (
                              <Check size={10} className="text-emerald-600" />
                            ) : (
                              <Copy size={10} />
                            )}
                          </button>
                        </div>

                        {/* Mini Workload Progress Bar */}
                        <div
                          className="mt-1.5 flex items-center gap-1.5 max-w-[170px]"
                          title={`${workload.weeklyClasses} classes/week (Standard: 25) • Today: ${workload.todayClasses} classes`}
                        >
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                workload.weeklyClasses > 22
                                  ? 'bg-rose-500'
                                  : workload.weeklyClasses > 12
                                  ? 'bg-indigo-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(Math.round((workload.weeklyClasses / 25) * 100), 100)}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-zinc-500 shrink-0">
                            {workload.weeklyClasses}/25 cls
                          </span>
                          {workload.todayClasses > 0 && (
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 shrink-0">
                              Today: {workload.todayClasses}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Designation & Role */}
                  <td className="px-3.5 py-2.5 align-top pt-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate max-w-[140px]">{DESIGNATION_LABELS[teacher.designation] || teacher.designation}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            teacher.teacherCategory === 'REGULAR'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {teacher.teacherCategory === 'REGULAR' ? 'Regular' : 'Guest'}
                        </span>
                      </div>

                      {ctAssignment.isClassTeacher && (
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/80 w-fit">
                          <Star size={9} className="text-amber-500 fill-amber-400" />
                          <span>Class Teacher: {ctAssignment.classLabel}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Subject / Dept */}
                  <td className="px-3.5 py-2.5 align-top pt-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200 text-[11px] inline-block max-w-[140px] truncate" title={teacher.department}>
                        {teacher.department ? (DEPARTMENT_LABELS[teacher.department] || teacher.department) : 'General'}
                      </span>
                      <div className="text-[10px] text-zinc-400 font-medium">
                        Joined: {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString('en-GB') : '—'}
                      </div>
                    </div>
                  </td>

                  {/* Contact & WhatsApp */}
                  <td className="px-3.5 py-2.5 align-top pt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="space-y-0.5 min-w-0">
                        <a
                          href={`tel:${teacher.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="font-mono text-zinc-800 hover:text-indigo-600 transition-colors text-[11px] font-semibold flex items-center gap-1 truncate"
                        >
                          <Phone size={10} className="text-zinc-400 shrink-0" />
                          {teacher.phone}
                        </a>
                        {teacher.email && (
                          <div className="text-[10px] text-zinc-400 truncate max-w-[110px]">
                            {teacher.email}
                          </div>
                        )}
                      </div>

                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        onClick={e => handleWhatsApp(teacher, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60 shadow-2xs shrink-0 cursor-pointer"
                        title={`Message ${teacher.fullName} on WhatsApp`}
                      >
                        <MessageSquare size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Status & Salary */}
                  <td className="px-3.5 py-2.5 text-center align-top pt-3">
                    <div className="space-y-1 flex flex-col items-center">
                      {/* Attendance / Leave */}
                      {leaveStatus.isOnLeave ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> On Leave
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            STATUS_COLORS[teacher.employmentStatus] || 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {STATUS_LABELS[teacher.employmentStatus] || teacher.employmentStatus}
                        </span>
                      )}

                      {/* Salary */}
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          salaryStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        Salary: {salaryStatus}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3.5 py-2.5 text-right align-top pt-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View 360° Profile"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/teachers/salary?search=${encodeURIComponent(teacher.fullName)}`)}
                        className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="View Salary Desk"
                      >
                        <CreditCard size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete faculty record for ${teacher.fullName}?`)) {
                            onDelete(teacher.id)
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Faculty Member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Responsive Pagination ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
          <p className="text-xs text-zinc-500 font-medium text-center sm:text-left">
            Page <strong className="text-zinc-800 font-bold">{currentPage}</strong> of <strong className="text-zinc-800 font-bold">{totalPages}</strong> · <span className="font-mono">{totalResults}</span> total faculty members
          </p>
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
