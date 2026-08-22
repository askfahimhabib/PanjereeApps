import { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import type { StudentFormData } from '../../types'

interface Props {
  data: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
}

const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5'
const sectionCls = 'bg-slate-900/40 border border-slate-700/50 rounded-xl p-5 space-y-4'

function generateUsername(fullName: string): string {
  const parts = fullName.trim().toLowerCase().split(' ')
  const base  = parts[0] + (parts[1]?.[0] || '')
  const year  = new Date().getFullYear().toString().slice(-2)
  return base + year
}

function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: '', width: '0%' }
  let score = 0
  if (password.length >= 8)            score++
  if (/[A-Z]/.test(password))          score++
  if (/[0-9]/.test(password))          score++
  if (/[^A-Za-z0-9]/.test(password))  score++
  if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    width: '25%' }
  if (score === 2) return { label: 'Fair',   color: 'bg-amber-500',  width: '50%' }
  if (score === 3) return { label: 'Good',   color: 'bg-blue-500',   width: '75%' }
  return                { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
}

export function Step3_Auth({ data, onChange }: Props) {
  const [showPw, setShowPw]     = useState(false)
  const [showConfPw, setShowConfPw] = useState(false)

  // Auto-suggest username when name changes
  useEffect(() => {
    if (data.fullNameEn && !data.username) {
      onChange({ username: generateUsername(data.fullNameEn) })
    }
  }, [])

  const strength      = getPasswordStrength(data.password)
  const pwMatch       = data.password === data.confirmPassword && data.confirmPassword !== ''
  const pwMismatch    = data.confirmPassword !== '' && data.password !== data.confirmPassword

  return (
    <div className="space-y-5">
      {/* ── Login Credentials ─────────────────────────── */}
      <div className={sectionCls}>
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4">
          <span className="w-5 h-5 bg-blue-600/30 text-blue-400 rounded text-xs flex items-center justify-center font-bold">🔐</span>
          Login Credentials
        </h3>

        {/* Username */}
        <div>
          <label className={labelCls}>Username <span className="text-red-400">*</span></label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="auto-generated"
              value={data.username}
              onChange={e => onChange({ username: e.target.value.toLowerCase().replace(/\s/g, '') })}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange({ username: generateUsername(data.fullNameEn) })}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors shrink-0"
              title="Re-generate username"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Auto-generated from student's name. Can be changed.</p>
        </div>

        {/* Password */}
        <div>
          <label className={labelCls}>Password <span className="text-red-400">*</span></label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={data.password}
                onChange={e => onChange({ password: e.target.value })}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const pw = generatePassword()
                onChange({ password: pw, confirmPassword: pw })
              }}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors shrink-0 text-xs whitespace-nowrap"
            >
              Auto
            </button>
          </div>

          {/* Password strength bar */}
          {data.password && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Strength: <span className="text-slate-300">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className={labelCls}>Confirm Password <span className="text-red-400">*</span></label>
          <div className="relative">
            <input
              type={showConfPw ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={data.confirmPassword}
              onChange={e => onChange({ confirmPassword: e.target.value })}
              className={`${inputCls} pr-10 ${pwMismatch ? 'border-red-500/60' : pwMatch ? 'border-emerald-500/60' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showConfPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {pwMismatch && <p className="text-xs text-red-400 mt-1">Passwords do not match</p>}
          {pwMatch    && <p className="text-xs text-emerald-400 mt-1">Passwords match ✓</p>}
        </div>
      </div>

      {/* ── Login Status ──────────────────────────────── */}
      <div className={sectionCls}>
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Login Access</h3>
        <div className="flex gap-3">
          {[
            { value: 'ACTIVE', label: '✅ Active (can login)', color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' },
            { value: 'INACTIVE', label: '⛔ Inactive (blocked)', color: 'border-slate-600 bg-slate-700/50 text-slate-400' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ loginStatus: opt.value as StudentFormData['loginStatus'] })}
              className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                data.loginStatus === opt.value ? opt.color : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Active: Student can log in to their account. Inactive: Login will be blocked.
        </p>
      </div>

      {/* Info box */}
      <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <div className="text-blue-400 text-lg shrink-0">ℹ️</div>
        <div>
          <p className="text-xs text-blue-300 font-medium mb-0.5">Password Security</p>
          <p className="text-xs text-slate-400">
            Passwords are stored encrypted. Share credentials with the student via WhatsApp or printed slip.
            Student can change their password after first login.
          </p>
        </div>
      </div>
    </div>
  )
}
