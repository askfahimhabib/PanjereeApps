import { useState } from 'react'
import {
  School,
  UserCheck,
  MapPin,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings'

export function InstitutionIdentityForm() {
  const settings = useSettingsStore()
  const [form, setForm] = useState({
    schoolName: settings.schoolName,
    schoolNameBn: settings.schoolNameBn,
    eiinNumber: settings.eiinNumber,
    regNumber: settings.regNumber,
    affiliationBoard: settings.affiliationBoard,
    establishedYear: settings.establishedYear,
    tagline: settings.tagline,
    principalName: settings.principalName,
    principalDesignation: settings.principalDesignation,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    currencySymbol: settings.currencySymbol,
    timezone: settings.timezone,
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settings.updateSchoolInfo(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Basic Legal Identity ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <School size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Official Institution Name & Accreditation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Institution Name (English) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. Panjeree Model High School & College"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              প্রতিষ্ঠানের নাম (বাংলা)
            </label>
            <input
              type="text"
              name="schoolNameBn"
              value={form.schoolNameBn}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="যেমন: পাঞ্জেরী মডেল হাই স্কুল এন্ড কলেজ"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              EIIN Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="eiinNumber"
              value={form.eiinNumber}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. 108452"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Education Board / Affiliation
            </label>
            <select
              name="affiliationBoard"
              value={form.affiliationBoard}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer font-medium"
            >
              <option value="Dhaka Education Board">Dhaka Education Board</option>
              <option value="Chittagong Education Board">Chittagong Education Board</option>
              <option value="Rajshahi Education Board">Rajshahi Education Board</option>
              <option value="Comilla Education Board">Comilla Education Board</option>
              <option value="Jessore Education Board">Jessore Education Board</option>
              <option value="Madrasah Education Board">Madrasah Education Board</option>
              <option value="Technical Education Board (BTEB)">Technical Education Board (BTEB)</option>
              <option value="Cambridge International (CIE)">Cambridge International (CIE)</option>
              <option value="Edexcel / Pearson">Edexcel / Pearson</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Established Year
            </label>
            <input
              type="text"
              name="establishedYear"
              value={form.establishedYear}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. 2005"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Motto / Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. Excellence in Academic Discipline"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Executive Leadership ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Head of Institution & Authorized Signatory
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Principal / Headmaster Name
            </label>
            <input
              type="text"
              name="principalName"
              value={form.principalName}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. Professor Md. Rafiqul Islam"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Official Designation
            </label>
            <input
              type="text"
              name="principalDesignation"
              value={form.principalDesignation}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. Principal & Head of Institution"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Contact & Campus Location ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-amber-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Campus Address & Contact Hotline
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Official Campus Address (Printed on Invoices & Transcripts)
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. Plot 14, Sector 7, Uttara Model Town, Dhaka-1230"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Helpline Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                placeholder="+880 1711-234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                placeholder="info@panjereemodel.edu.bd"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Official Website
              </label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                placeholder="www.panjereemodel.edu.bd"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            Institution details saved successfully!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Changes apply across all printable headers</span>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save Institution Profile
        </button>
      </div>
    </form>
  )
}
