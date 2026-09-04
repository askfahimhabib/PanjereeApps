import { Eye, Trash2, ChevronLeft, ChevronRight, Phone, CheckCircle2, Clock, XCircle, ExternalLink, Award, Copy, Check, GraduationCap, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Student } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../types'
import { deriveStudentFeeStatus } from '@/features/payments/utils/feeStatus'

interface Props {
  students: Student[]
  currentPage: number
  totalPages: number
  totalResults: number
  onPageChange: (page: number) => void
  onView: (student: Student) => void
  onDelete: (id: string) => void
  onCertificate?: (student: Student) => void
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600',
    'bg-blue-600', 'bg-rose-600', 'bg-amber-600',
    'bg-teal-600', 'bg-cyan-600',
  ]
  const index = id.charCodeAt(id.length - 1) % colors.length
  return colors[index]
}

export function StudentTable({
  students,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  onView,
  onDelete,
  onCertificate,
}: Props) {
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyToClipboard(text: string, id: string, e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (students.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-2xs">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-zinc-800 mb-1">No students found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          No student matches the current filter criteria. Try resetting filters or enroll a new student.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden">
      {/* ── Mobile Card List View (Phones & Small Devices: Native App Style) ── */}
      <div className="block sm:hidden divide-y divide-zinc-100">
        {students.map((student, idx) => {
          const rowNum = (currentPage - 1) * 10 + idx + 1
          const feeStatus = deriveStudentFeeStatus(student.id)

          return (
            <div
              key={student.id}
              onClick={() => onView(student)}
              className="p-3.5 hover:bg-zinc-50/90 active:bg-zinc-100 transition-colors cursor-pointer space-y-2.5"
            >
              {/* Header: Avatar, Name & Roll/Status Badges */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${getAvatarColor(student.id)} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs`}
                  >
                    {student.profilePhoto ? (
                      <img
                        src={student.profilePhoto}
                        alt={student.fullNameEn}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      getInitials(student.fullNameEn)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          navigate(`/students/${student.id}`)
                        }}
                        className="font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate text-xs text-left"
                      >
                        {student.fullNameEn}
                      </button>
                    </div>
                    {student.fullNameBn && (
                      <p className="text-[10px] text-zinc-400 font-medium truncate leading-tight">
                        {student.fullNameBn}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ID: {student.studentId}
                      </span>
                      <button
                        onClick={e => copyToClipboard(student.studentId, student.id, e)}
                        className="p-0.5 text-zinc-400 hover:text-zinc-600"
                        title="Copy ID"
                      >
                        {copiedId === student.id ? (
                          <Check size={10} className="text-emerald-600" />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Roll & Status Badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono font-bold text-[11px] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200">
                    #{student.rollNumber || rowNum}
                  </span>
                  <span
                    className={`px-2 py-0.2 text-[9px] font-bold rounded-full border ${
                      STATUS_COLORS[student.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {STATUS_LABELS[student.status] || student.status}
                  </span>
                </div>
              </div>

              {/* Middle Row: Academic Track & Fee Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                {student.type === 'REGULAR' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                    <GraduationCap size={11} className="text-indigo-600" />
                    {student.className || 'Class'} {student.sectionName ? `· Sec ${student.sectionName}` : ''}
                    {student.groupId ? ` (${student.groupId})` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 font-medium">
                    <BookOpen size={11} className="text-purple-600" />
                    {student.batchName || 'Batch'} {student.targetExam ? `· ${student.targetExam}` : ''}
                  </span>
                )}

                {student.status === 'ACTIVE' && (
                  feeStatus === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      <CheckCircle2 size={10} /> Paid
                    </span>
                  ) : feeStatus === 'PARTIAL' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                      <Clock size={10} /> Partial
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]">
                      <XCircle size={10} /> Fee Due
                    </span>
                  )
                )}

                {student.mobile && (
                  <a
                    href={`tel:${student.mobile}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-indigo-600 text-[10px] font-mono ml-auto"
                  >
                    <Phone size={10} className="text-zinc-400" />
                    {student.mobile}
                  </a>
                )}
              </div>

              {/* Bottom Quick Action Strip */}
              <div
                className="flex items-center justify-between pt-2 border-t border-zinc-100"
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onView(student)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Eye size={12} /> View Profile
                </button>

                <div className="flex items-center gap-1">
                  {onCertificate && (
                    <button
                      type="button"
                      onClick={() => onCertificate(student)}
                      className="p-1.5 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Certificate"
                    >
                      <Award size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${student.fullNameEn}?`)) {
                        onDelete(student.id)
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
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-50/80 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3.5 w-12 text-center">#</th>
              <th className="px-4 py-3.5">Student Identity</th>
              <th className="px-4 py-3.5">Academic Track</th>
              <th className="px-4 py-3.5 text-center">Roll</th>
              <th className="px-4 py-3.5">Guardian & Phone</th>
              <th className="px-4 py-3.5 text-center">Status</th>
              <th className="px-4 py-3.5 text-center">Fee Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {students.map((student, idx) => {
              const rowNum = (currentPage - 1) * 10 + idx + 1
              const feeStatus = deriveStudentFeeStatus(student.id)

              return (
                <tr
                  key={student.id}
                  onClick={() => onView(student)}
                  className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                >
                  {/* # */}
                  <td className="px-4 py-3 text-center text-zinc-400 font-mono font-medium">
                    {rowNum}
                  </td>

                  {/* Student Identity */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${getAvatarColor(student.id)} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs`}
                      >
                        {student.profilePhoto ? (
                          <img
                            src={student.profilePhoto}
                            alt={student.fullNameEn}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          getInitials(student.fullNameEn)
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            navigate(`/students/${student.id}`)
                          }}
                          className="font-bold text-zinc-900 hover:text-indigo-600 transition-colors truncate flex items-center gap-1 group/link text-xs max-w-[180px]"
                          title="View Full Profile"
                        >
                          {student.fullNameEn}
                          <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-70 transition-opacity" />
                        </button>
                        {student.fullNameBn && (
                          <div className="text-[10px] text-zinc-500 font-medium truncate max-w-[180px] leading-tight mt-0.5">
                            {student.fullNameBn}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                            {student.studentId}
                          </span>
                          <button
                            onClick={e => copyToClipboard(student.studentId, student.id, e)}
                            className="p-0.5 text-zinc-300 hover:text-zinc-600 rounded transition-colors cursor-pointer"
                            title="Copy Student ID"
                          >
                            {copiedId === student.id ? (
                              <Check size={10} className="text-emerald-600" />
                            ) : (
                              <Copy size={10} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Academic Track */}
                  <td className="px-4 py-3">
                    {student.type === 'REGULAR' ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900">
                            {student.className || 'Class —'}
                          </span>
                          {student.sectionName && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                              Sec {student.sectionName}
                            </span>
                          )}
                          {student.groupId && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              {student.groupId}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {student.shift ? `${student.shift} Shift` : 'Day Shift'} · {student.session}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200/60 text-[11px]">
                            {student.batchName || 'Exam Batch'}
                          </span>
                          {student.targetExam && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                              {student.targetExam}
                            </span>
                          )}
                        </div>
                        {student.schoolName && (
                          <div className="text-[11px] text-zinc-500 truncate max-w-[200px]" title={student.schoolName}>
                            🏫 {student.schoolName}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Roll No */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-bold text-xs bg-zinc-100 text-zinc-800 px-2 py-1 rounded-lg border border-zinc-200">
                      {student.rollNumber || '—'}
                    </span>
                  </td>

                  {/* Guardian & Phone */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="font-medium text-zinc-800 truncate max-w-[160px]">
                        {student.guardian?.name || student.father?.name || student.mother?.name || '—'}
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <a
                          href={`tel:${student.mobile}`}
                          onClick={e => e.stopPropagation()}
                          className="hover:text-indigo-600 transition-colors font-mono text-[11px] flex items-center gap-1"
                        >
                          <Phone size={11} className="text-zinc-400" />
                          {student.mobile}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Student Status */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        STATUS_COLORS[student.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {STATUS_LABELS[student.status] || student.status}
                    </span>
                  </td>

                  {/* Fee Status */}
                  <td className="px-4 py-3 text-center">
                    {student.status === 'ACTIVE' ? (
                      feeStatus === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Paid
                        </span>
                      ) : feeStatus === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={11} /> Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                          <XCircle size={11} /> Due
                        </span>
                      )
                    ) : (
                      <span className="text-zinc-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onCertificate && (
                        <button
                          type="button"
                          onClick={() => onCertificate(student)}
                          className="p-1.5 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Generate Certificate"
                        >
                          <Award size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onView(student)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View Profile"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${student.fullNameEn}?`)) {
                            onDelete(student.id)
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
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
            Page <strong className="text-zinc-800 font-bold">{currentPage}</strong> of <strong className="text-zinc-800 font-bold">{totalPages}</strong> · <span className="font-mono">{totalResults}</span> total students
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
