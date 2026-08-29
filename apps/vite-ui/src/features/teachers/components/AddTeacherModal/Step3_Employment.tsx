import { UserCog, Star } from 'lucide-react'
import type { TeacherFormData, EmploymentType, EmploymentStatus, Designation, Department } from '../../types'
import { DESIGNATION_LABELS, DEPARTMENT_LABELS, EMPLOYMENT_TYPE_LABELS } from '../../types'

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls   = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls   = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-4'

const STATUSES: [EmploymentStatus, string][] = [
  ['ACTIVE',     'Active'],
  ['INACTIVE',   'Inactive'],
  ['ON_LEAVE',   'On Leave'],
  ['RESIGNED',   'Resigned'],
  ['TERMINATED', 'Terminated'],
]

export function Step3_Employment({ data, onChange }: Props) {
  const showExitFields = data.employmentStatus === 'RESIGNED' || data.employmentStatus === 'TERMINATED'

  return (
    <div className="space-y-5">
      {/* ── Teacher Category Toggle ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Regular */}
        <button
          type="button"
          onClick={() => onChange({ teacherCategory: 'REGULAR' })}
          className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
            data.teacherCategory === 'REGULAR'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-zinc-100 bg-zinc-50 hover:border-zinc-100'
          }`}
        >
          {data.teacherCategory === 'REGULAR' && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>
          )}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            data.teacherCategory === 'REGULAR' ? 'bg-emerald-600' : 'bg-zinc-100'
          }`}>
            <UserCog size={20} className="text-white" />
          </div>
          <div className="text-center">
            <p className={`font-semibold text-sm ${data.teacherCategory === 'REGULAR' ? 'text-emerald-300' : 'text-zinc-800'}`}>
              Regular Teacher
            </p>
            <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">
              Full-time / Part-time / Contractual permanent staff
            </p>
          </div>
        </button>

        {/* Guest */}
        <button
          type="button"
          onClick={() => onChange({ teacherCategory: 'GUEST' })}
          className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
            data.teacherCategory === 'GUEST'
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-zinc-100 bg-zinc-50 hover:border-zinc-100'
          }`}
        >
          {data.teacherCategory === 'GUEST' && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>
          )}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            data.teacherCategory === 'GUEST' ? 'bg-violet-600' : 'bg-zinc-100'
          }`}>
            <Star size={20} className="text-white" />
          </div>
          <div className="text-center">
            <p className={`font-semibold text-sm ${data.teacherCategory === 'GUEST' ? 'text-violet-300' : 'text-zinc-800'}`}>
              Guest Teacher
            </p>
            <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">
              Visiting expert — temporary or subject-specific
            </p>
          </div>
        </button>
      </div>

      {/* ── Main employment info ─────────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-amber-600/30 text-amber-400 rounded text-xs flex items-center justify-center font-bold">💼</span>
          Employment Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Joining Date <span className="text-red-400">*</span></label>
            <input type="date" value={data.joiningDate} onChange={e => onChange({ joiningDate: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Employment Type <span className="text-red-400">*</span></label>
            <select value={data.employmentType} onChange={e => onChange({ employmentType: e.target.value as EmploymentType | '' })} className={inputCls}>
              <option value="">Select Type</option>
              {(Object.entries(EMPLOYMENT_TYPE_LABELS) as [EmploymentType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Employment Status</label>
            <select value={data.employmentStatus} onChange={e => onChange({ employmentStatus: e.target.value as EmploymentStatus })} className={inputCls}>
              {STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Designation <span className="text-red-400">*</span></label>
            <select value={data.designation} onChange={e => onChange({ designation: e.target.value as Designation | '' })} className={inputCls}>
              <option value="">Select Designation</option>
              {(Object.entries(DESIGNATION_LABELS) as [Designation, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Department (Subject)</label>
            <select value={data.department} onChange={e => onChange({ department: e.target.value as Department | '' })} className={inputCls}>
              <option value="">Select Department</option>
              {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Exit info ─────────────────────────────────────── */}
      {showExitFields && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-red-300 flex items-center gap-2">
            ⚠️ Exit Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.employmentStatus === 'RESIGNED' && (
              <div>
                <label className={labelCls}>Resignation Date</label>
                <input type="date" value={data.resignationDate} onChange={e => onChange({ resignationDate: e.target.value })} className={inputCls} />
              </div>
            )}
            {data.employmentStatus === 'TERMINATED' && (
              <>
                <div>
                  <label className={labelCls}>Termination Date</label>
                  <input type="date" value={data.terminationDate} onChange={e => onChange({ terminationDate: e.target.value })} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Termination Reason</label>
                  <textarea
                    rows={2}
                    placeholder="Reason for termination..."
                    value={data.terminationReason}
                    onChange={e => onChange({ terminationReason: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
