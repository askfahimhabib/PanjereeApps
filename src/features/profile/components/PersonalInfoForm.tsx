import { useState } from 'react'
import { Save, User, Mail, Phone } from 'lucide-react'
import { useProfileStore } from '../../../store/profile'

export function PersonalInfoForm() {
  const profile = useProfileStore()
  const [form, setForm] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
  })
  const [saved, setSaved] = useState(false)

  const changed = form.fullName !== profile.fullName || form.email !== profile.email || form.phone !== profile.phone

  const handleSave = () => {
    profile.updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} /> Full Name
          </label>
          <input
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} /> Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={12} /> Phone
          </label>
          <input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Role — read only */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
        <div className="flex items-center gap-3 bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-2.5">
          <span className="text-sm text-slate-400">{profile.role}</span>
          <span className="ml-auto text-[10px] text-slate-600 italic">Read-only</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!changed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={14} /> Save Changes
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium animate-fadeIn">✓ Profile updated</span>}
      </div>
    </div>
  )
}
