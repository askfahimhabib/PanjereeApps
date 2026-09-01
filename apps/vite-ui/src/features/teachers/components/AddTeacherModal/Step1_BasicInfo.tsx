import type { TeacherFormData, Gender, BloodGroup } from '../../types'

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors'
const labelCls = 'block text-xs font-bold text-zinc-700 mb-1'

export function Step1_BasicInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* ── 1. Teacher Identity ────────────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
          Teacher Personal Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Full Name (English) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Mohammad Shafiqul Islam"
              value={data.fullName}
              onChange={e => onChange({ fullName: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Full Name (বাংলা)</label>
            <input
              type="text"
              placeholder="যেমন: মোহাম্মদ শফিকুল ইসলাম"
              value={data.nameBangla}
              onChange={e => onChange({ nameBangla: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Gender <span className="text-red-500">*</span></label>
            <select
              value={data.gender}
              onChange={e => onChange({ gender: e.target.value as Gender })}
              className={inputCls}
            >
              <option value="MALE">Male (পুরুষ)</option>
              <option value="FEMALE">Female (নারী)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Date of Birth</label>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={e => onChange({ dateOfBirth: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Blood Group</label>
            <select
              value={data.bloodGroup}
              onChange={e => onChange({ bloodGroup: e.target.value as BloodGroup })}
              className={inputCls}
            >
              <option value="">Select Blood Group</option>
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>National ID (NID) Number</label>
            <input
              type="text"
              placeholder="e.g. 19901234567890"
              value={data.nidNumber || ''}
              onChange={e => onChange({ nidNumber: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── 2. Contact & Address ───────────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
          Contact & Residential Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              placeholder="017XX-XXXXXX"
              value={data.phone}
              onChange={e => onChange({ phone: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Email Address (Optional)</label>
            <input
              type="email"
              placeholder="teacher@example.com"
              value={data.email}
              onChange={e => onChange({ email: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Present Address (বর্তমান ঠিকানা) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="House, Road, Area, Thana, District (যেমন: বাড়ি ১৫, রোড ৪, ধানমন্ডি, ঢাকা)"
              value={data.presentAddress}
              onChange={e => onChange({ presentAddress: e.target.value })}
              className={inputCls}
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}
