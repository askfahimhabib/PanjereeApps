import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { TeacherFormData, TeacherRole, AccountStatus } from '../../types'

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
  isEdit?: boolean
}

const inputCls   = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls   = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-4'

const ROLES: [TeacherRole, string][] = [
  ['ADMIN',             'Admin'],
  ['HEAD_TEACHER',      'Head Teacher'],
  ['ASSISTANT_TEACHER', 'Assistant Teacher'],
]

const ACCOUNT_STATUSES: [AccountStatus, string][] = [
  ['ACTIVE',    'Active'],
  ['INACTIVE',  'Inactive'],
  ['SUSPENDED', 'Suspended'],
]

export function Step6_Account({ data, onChange, isEdit = false }: Props) {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="space-y-5">
      {/* Login credentials */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-blue-600/30 text-blue-400 rounded text-xs flex items-center justify-center font-bold">🔑</span>
          Login Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Username</label>
            <input
              type="text"
              placeholder="e.g. shafiqul.islam"
              value={data.username}
              onChange={e => onChange({ username: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Login Email</label>
            <input
              type="email"
              placeholder="name@school.edu.bd"
              value={data.loginEmail}
              onChange={e => onChange({ loginEmail: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Login Phone</label>
            <input
              type="tel"
              placeholder="01711-XXXXXX"
              value={data.loginPhone}
              onChange={e => onChange({ loginPhone: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-3 pt-1">
          <div>
            <label className={labelCls}>
              Password {!isEdit && <span className="text-red-400">*</span>}
              {isEdit && <span className="text-zinc-600 font-normal"> (leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={data.password}
                onChange={e => onChange({ password: e.target.value })}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-800"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={data.confirmPassword}
                onChange={e => onChange({ confirmPassword: e.target.value })}
                className={`${inputCls} pr-10 ${
                  data.confirmPassword && data.password !== data.confirmPassword
                    ? 'border-red-500/60'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-800"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {data.confirmPassword && data.password !== data.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>
      </div>

      {/* Role & Access */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-purple-600/30 text-purple-400 rounded text-xs flex items-center justify-center font-bold">🛡️</span>
          Role & Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Role</label>
            <select
              value={data.role}
              onChange={e => onChange({ role: e.target.value as TeacherRole })}
              className={inputCls}
            >
              {ROLES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Account Status</label>
            <select
              value={data.accountStatus}
              onChange={e => onChange({ accountStatus: e.target.value as AccountStatus })}
              className={inputCls}
            >
              {ACCOUNT_STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Role description */}
        <div className="mt-2 p-3 bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg">
          {data.role === 'ADMIN' && (
            <p className="text-xs text-amber-300">⚠️ <strong>Admin:</strong> Full access — can manage everything including settings, salary, and all data.</p>
          )}
          {data.role === 'HEAD_TEACHER' && (
            <p className="text-xs text-blue-300">📋 <strong>Head Teacher:</strong> Can manage teachers, classes, routines, exams, and results.</p>
          )}
          {data.role === 'ASSISTANT_TEACHER' && (
            <p className="text-xs text-zinc-800">📝 <strong>Assistant Teacher:</strong> Can take attendance, enter results, and view their assigned classes.</p>
          )}
        </div>
      </div>
    </div>
  )
}
