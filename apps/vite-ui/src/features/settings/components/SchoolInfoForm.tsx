import { useState } from 'react'
import { Save, School, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings'

export function SchoolInfoForm() {
  const settings = useSettingsStore()
  const [form, setForm] = useState({
    schoolName: settings.schoolName,
    schoolNameBn: settings.schoolNameBn,
    tagline: settings.tagline,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    settings.updateSchoolInfo(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const changed = JSON.stringify(form) !== JSON.stringify({
    schoolName: settings.schoolName,
    schoolNameBn: settings.schoolNameBn,
    tagline: settings.tagline,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
  })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* School Name EN */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <School size={12} /> School Name (English)
          </label>
          <input
            value={form.schoolName}
            onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        {/* School Name BN */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">School Name (বাংলা)</label>
          <input
            value={form.schoolNameBn}
            onChange={e => setForm(f => ({ ...f, schoolNameBn: e.target.value }))}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        {/* Tagline */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Tagline / Motto</label>
          <input
            value={form.tagline}
            onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            placeholder="e.g. Excellence in Education"
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        {/* Address */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={12} /> Address
          </label>
          <textarea
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            rows={2}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>
        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={12} /> Phone
          </label>
          <input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} /> Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        {/* Website */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={12} /> Website
          </label>
          <input
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!changed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          Save Changes
        </button>
        {saved && (
          <span className="text-xs text-emerald-400 font-medium animate-fadeIn">✓ Saved successfully</span>
        )}
      </div>
    </div>
  )
}
