import { Eye, Trash2, ChevronLeft, ChevronRight, Phone, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Student } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../types'
import { createStore } from '@/lib/localStore'
import type { PaymentRecord } from '@/features/payments/types'

const paymentStore = createStore<PaymentRecord>('payments')

const NOW = new Date()
const THIS_MONTH = NOW.getMonth() + 1
const THIS_YEAR  = NOW.getFullYear()

function getFeeStatus(studentId: string): 'PAID' | 'PARTIAL' | 'DUE' | null {
  const records = paymentStore.getWhere(
    p => p.student_id === studentId &&
         p.status !== 'REFUNDED' &&
         p.items.some(i => i.fee_type === 'TUITION' && i.month === THIS_MONTH && i.year === THIS_YEAR)
  )
  if (records.length === 0) return 'DUE'
  const total = records.reduce((s, p) => s + p.total_amount, 0)
  // If any record exists, consider PAID (PARTIAL would need fee structure data)
  return total > 0 ? 'PAID' : 'DUE'
}

interface Props {
  students: Student[]
  currentPage: number
  totalPages: number
  totalResults: number
  onPageChange: (page: number) => void
  onView: (student: Student) => void
  onDelete: (id: string) => void
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    'bg-blue-600', 'bg-purple-600', 'bg-emerald-600',
    'bg-amber-600', 'bg-pink-600', 'bg-cyan-600',
    'bg-indigo-600', 'bg-rose-600',
  ]
  const index = id.charCodeAt(id.length - 1) % colors.length
  return colors[index]
}

function getAcademicLabel(student: Student) {
  if (student.type === 'REGULAR') {
    const parts = [student.className, student.sectionName].filter(Boolean).join(' - ')
    const group = student.groupId ? ` (${student.groupId.charAt(0) + student.groupId.slice(1).toLowerCase()})` : ''
    return parts + group
  }
  return student.batchName || '—'
}

export function StudentTable({
  students, currentPage, totalPages, totalResults, onPageChange, onView, onDelete,
}: Props) {
  const navigate = useNavigate()

  if (students.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-300 font-medium mb-1">No students found</p>
          <p className="text-slate-500 text-sm">Try adjusting your filters or add a new student</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900/60 border-b border-slate-700/50">
            <tr>
              <th className="px-4 py-3.5 text-slate-400 font-medium">#</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Student</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Type</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Class / Batch</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Roll</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Mobile</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium">Fee</th>
              <th className="px-4 py-3.5 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {students.map((student, idx) => {
              const rowNum = ((currentPage - 1) * 10) + idx + 1
              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-700/20 transition-colors group cursor-pointer"
                  onClick={() => onView(student)}
                >
                  {/* # */}
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{rowNum}</td>

                  {/* Student name + ID */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(student.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {getInitials(student.fullNameEn)}
                      </div>
                      <div className="min-w-0 flex items-center justify-between flex-1 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/students/${student.id}`) }}
                              className="font-medium text-slate-200 hover:text-indigo-400 transition-colors flex items-center gap-1 truncate group"
                              title="View Full Profile"
                            >
                              {student.fullNameEn}
                              <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                            </button>
                            <a
                              href={`tel:${student.mobile}`}
                              onClick={e => e.stopPropagation()}
                              className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors"
                              title={`Call ${student.mobile}`}
                            >
                              <Phone size={14} />
                            </a>
                          </div>
                          <p className="text-xs text-slate-500">{student.studentId}</p>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3.5">
                    {student.type === 'REGULAR' ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Regular
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Exam Batch
                      </span>
                    )}
                  </td>

                  {/* Class / Batch */}
                  <td className="px-4 py-3.5 text-slate-400 text-xs">
                    {getAcademicLabel(student)}
                  </td>

                  {/* Roll */}
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                    {student.rollNumber}
                  </td>

                  {/* Mobile */}
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{student.mobile}</td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_COLORS[student.status]}`}>
                      {STATUS_LABELS[student.status]}
                    </span>
                  </td>

                  {/* Fee Status */}
                  <td className="px-4 py-3.5">
                    {student.status === 'ACTIVE' ? (() => {
                      const fs = getFeeStatus(student.id)
                      if (fs === 'PAID')    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={10}/>Paid</span>
                      if (fs === 'PARTIAL') return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={10}/>Partial</span>
                      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><XCircle size={10}/>Due</span>
                    })() : <span className="text-slate-600 text-xs">—</span>}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 transition-opacity">
                      <button
                        onClick={() => onView(student)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${student.fullNameEn}?`)) onDelete(student.id)
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete student"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages} · {totalResults} students
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700/50 rounded-md transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 text-xs rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700/50 rounded-md transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
