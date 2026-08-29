import { Briefcase, Calendar, Building2, AlertTriangle, UserCog, Star } from 'lucide-react'
import type { Teacher } from '../../types'
import {
  DESIGNATION_LABELS, DEPARTMENT_LABELS, EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS, STATUS_COLORS, TEACHER_CATEGORY_LABELS, TEACHER_CATEGORY_COLORS,
} from '../../types'

interface Props { teacher: Teacher }

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="text-sm text-zinc-800 font-medium">{value}</p>
    </div>
  )
}

function yearsOfService(joining: string): string {
  const diff = Date.now() - new Date(joining).getTime()
  const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000))
  const months = Math.floor((diff % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000))
  if (years === 0) return `${months} months`
  return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} months` : ''}`
}

export function EmploymentTab({ teacher }: Props) {
  const isTerminated = teacher.employmentStatus === 'TERMINATED'
  const isResigned   = teacher.employmentStatus === 'RESIGNED'

  return (
    <div className="space-y-6">
      {/* Status banner for special statuses */}
      {(isTerminated || isResigned) && (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
          isTerminated ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'
        }`}>
          <AlertTriangle size={16} className={isTerminated ? 'text-red-400' : 'text-orange-400'} />
          <div>
            <p className={`text-sm font-medium ${isTerminated ? 'text-red-300' : 'text-orange-300'}`}>
              {isTerminated ? 'Teacher Terminated' : 'Teacher Resigned'}
            </p>
            {isTerminated && teacher.terminationReason && (
              <p className="text-xs text-red-400/80 mt-1">Reason: {teacher.terminationReason}</p>
            )}
          </div>
        </div>
      )}

      {/* Main employment info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2">
          Employment Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <p className="text-xs text-zinc-600">Teacher Category</p>
            <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${TEACHER_CATEGORY_COLORS[teacher.teacherCategory]}`}>
              {teacher.teacherCategory === 'REGULAR' ? <UserCog size={11} /> : <Star size={11} />}
              {TEACHER_CATEGORY_LABELS[teacher.teacherCategory]}
            </span>
          </div>

          <div>
            <p className="text-xs text-zinc-600">Employment Status</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[teacher.employmentStatus]}`}>
              {STATUS_LABELS[teacher.employmentStatus]}
            </span>
          </div>
          <InfoRow label="Employment Type" value={EMPLOYMENT_TYPE_LABELS[teacher.employmentType]} />

          <div className="flex items-start gap-2">
            <Briefcase size={14} className="text-zinc-600 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-600">Designation</p>
              <p className="text-sm text-zinc-800 font-medium">{DESIGNATION_LABELS[teacher.designation]}</p>
            </div>
          </div>

          {teacher.department && (
            <div className="flex items-start gap-2">
              <Building2 size={14} className="text-zinc-600 mt-0.5" />
              <div>
                <p className="text-xs text-zinc-600">Department</p>
                <p className="text-sm text-zinc-800 font-medium">{DEPARTMENT_LABELS[teacher.department]}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-zinc-600 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-600">Joining Date</p>
              <p className="text-sm text-zinc-800 font-medium">{teacher.joiningDate}</p>
              <p className="text-xs text-zinc-600 mt-0.5">Service: {yearsOfService(teacher.joiningDate)}</p>
            </div>
          </div>

          <InfoRow label="Employee ID" value={teacher.employeeId} />
        </div>
      </div>

      {/* Exit info */}
      {(teacher.resignationDate || teacher.terminationDate) && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2">
            Exit Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teacher.resignationDate && (
              <InfoRow label="Resignation Date" value={teacher.resignationDate} />
            )}
            {teacher.terminationDate && (
              <InfoRow label="Termination Date" value={teacher.terminationDate} />
            )}
            {teacher.terminationReason && (
              <div className="sm:col-span-2">
                <p className="text-xs text-zinc-600">Termination Reason</p>
                <p className="text-sm text-red-400">{teacher.terminationReason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
