import { useState } from 'react'
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { useProfileStore } from '../../../store/profile'

interface PasswordFieldProps {
  label: string
  field: 'current' | 'newPass' | 'confirm'
  value: string
  placeholder?: string
  showText: boolean
  onChange: (val: string) => void
  onToggleShow: () => void
}

function PasswordField({
  label,
  value,
  placeholder,
  showText,
  onChange,
  onToggleShow,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={showText ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border rounded-2xl px-4 py-2.5 pr-10 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-800 transition-colors"
        >
          {showText ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

export function PasswordChangeForm() {
  const { changePassword } = useProfileStore()
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const rules = [
    { label: 'At least 8 characters', ok: form.newPass.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(form.newPass) },
    { label: 'Passwords match', ok: form.newPass === form.confirm && form.confirm.length > 0 },
  ]
  const allValid = rules.every(r => r.ok) && form.current.length > 0

  const handleSubmit = () => {
    const ok = changePassword(form.current, form.newPass)
    if (ok) {
      setStatus('success')
      setForm({ current: '', newPass: '', confirm: '' })
      setTimeout(() => setStatus('idle'), 4000)
    } else {
      setStatus('error')
      setErrorMsg('Current password is incorrect.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <PasswordField
        label="Current Password"
        field="current"
        value={form.current}
        showText={show.current}
        placeholder="Enter current password"
        onChange={val => setForm(f => ({ ...f, current: val }))}
        onToggleShow={() => setShow(s => ({ ...s, current: !s.current }))}
      />
      <PasswordField
        label="New Password"
        field="newPass"
        value={form.newPass}
        showText={show.newPass}
        placeholder="Enter new password"
        onChange={val => setForm(f => ({ ...f, newPass: val }))}
        onToggleShow={() => setShow(s => ({ ...s, newPass: !s.newPass }))}
      />
      <PasswordField
        label="Confirm New Password"
        field="confirm"
        value={form.confirm}
        showText={show.confirm}
        placeholder="Confirm new password"
        onChange={val => setForm(f => ({ ...f, confirm: val }))}
        onToggleShow={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
      />

      {/* Password rules */}
      {form.newPass.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {rules.map(rule => (
            <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.ok ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {rule.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} className="opacity-40" />}
              {rule.label}
            </div>
          ))}
        </div>
      )}

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle2 size={14} /> Password changed successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <XCircle size={14} /> {errorMsg}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allValid || status !== 'idle'}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Lock size={14} /> Change Password
      </button>
    </div>
  )
}
