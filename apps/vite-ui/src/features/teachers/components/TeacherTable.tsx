import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, BookOpen, Phone, UserCircle2, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Teacher } from '../types'
import {
  STATUS_LABELS, STATUS_COLORS, DESIGNATION_LABELS, EMPLOYMENT_TYPE_LABELS,
  DEPARTMENT_LABELS, TEACHER_CATEGORY_COLORS,
} from '../types'

interface Props {
  teachers: Teacher[]
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
  onView: (t: Teacher) => void
  onEdit: (t: Teacher) => void
  onDelete: (id: string) => void
}

function Avatar({ teacher }: { teacher: Teacher }) {
  if (teacher.profilePhoto) {
    return <img src={teacher.profilePhoto} alt={teacher.fullName} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-600" />
  }
  const initials = (teacher.firstName[0] || '') + (teacher.lastName[0] || '')
  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-cyan-600']
  const color  = colors[parseInt(teacher.id) % colors.length]
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-700 shrink-0`}>
      {initials}
    </div>
  )
}

export function TeacherTable({ teachers, currentPage, totalPages, onPageChange, onView, onEdit, onDelete }: Props) {
  const navigate = useNavigate()
  if (teachers.length === 0) {
    return (
      <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
        <UserCircle2 size={40} className="text-zinc-800" />
        <p className="text-zinc-600 font-medium">No teachers found</p>
        <p className="text-sm text-zinc-600">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white border-b border-zinc-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Teacher</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Designation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {teachers.map(teacher => (
              <tr
                key={teacher.id}
                className="hover:bg-zinc-50 transition-colors cursor-pointer"
                onClick={() => onView(teacher)}
              >
                {/* ── Teacher name + photo + ID ─────────────── */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar teacher={teacher} />
                    <div className="min-w-0">
                      {/* Name */}
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/teachers/${teacher.id}`) }}
                        className="font-medium text-zinc-800 hover:text-indigo-400 transition-colors leading-tight flex items-center gap-1 group"
                        title="View Full Profile"
                      >
                        {teacher.fullName}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      </button>
                      {/* Bengali name — smaller */}
                      {teacher.nameBangla && (
                        <p className="text-xs text-zinc-600 mt-0.5 truncate">{teacher.nameBangla}</p>
                      )}
                      {/* Teacher ID — small monospace */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/15 px-1.5 py-0.5 rounded leading-none">
                          {teacher.teacherId}
                        </span>
                        {/* Regular / Guest badge */}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border leading-none ${TEACHER_CATEGORY_COLORS[teacher.teacherCategory]}`}>
                          {teacher.teacherCategory === 'REGULAR' ? 'Regular' : 'Guest'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Designation & Type */}
                <td className="px-4 py-3">
                  <p className="text-zinc-800 text-sm">{DESIGNATION_LABELS[teacher.designation]}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{EMPLOYMENT_TYPE_LABELS[teacher.employmentType]}</p>
                </td>

                {/* Department */}
                <td className="px-4 py-3">
                  {teacher.department ? (
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-purple-400 shrink-0" />
                      <span className="text-zinc-600 text-xs">{DEPARTMENT_LABELS[teacher.department]}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-800 text-xs">—</span>
                  )}
                </td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-zinc-600" />
                    <span className="text-zinc-600 text-xs font-mono">{teacher.phone}</span>
                  </div>
                  {teacher.email && (
                    <p className="text-xs text-zinc-800 mt-0.5 truncate max-w-[160px]">{teacher.email}</p>
                  )}
                </td>

                {/* Status badge */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[teacher.employmentStatus]}`}>
                    {STATUS_LABELS[teacher.employmentStatus]}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onView(teacher)}
                      className="p-1.5 text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(teacher)}
                      className="p-1.5 text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${teacher.fullName}?`)) onDelete(teacher.id)
                      }}
                      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-100"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-zinc-600">
            Page <span className="text-zinc-800 font-medium">{currentPage}</span> of{' '}
            <span className="text-zinc-800 font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-100"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
