import type { TeacherFormData, Gender, BloodGroup, Religion, MaritalStatus } from '../../types'

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls    = 'w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls    = 'block text-xs font-medium text-slate-400 mb-1.5'
const sectionCls  = 'bg-slate-900/40 border border-slate-700/50 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4'

// Sync firstName + lastName → fullName
function syncFullName(
  first: string, last: string,
  onChange: (p: Partial<TeacherFormData>) => void,
  key: 'firstName' | 'lastName',
  value: string,
) {
  const updated = key === 'firstName'
    ? { firstName: value, fullName: `${value} ${last}`.trim() }
    : { lastName: value, fullName: `${first} ${value}`.trim() }
  onChange(updated)
}

export function Step1_BasicInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* ── Basic Information ──────────────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-blue-600/30 text-blue-400 rounded text-xs flex items-center justify-center font-bold">1</span>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Shafiqul"
              value={data.firstName}
              onChange={e => syncFullName(data.firstName, data.lastName, onChange, 'firstName', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Last Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Islam"
              value={data.lastName}
              onChange={e => syncFullName(data.firstName, data.lastName, onChange, 'lastName', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Name (English)</label>
            <input
              type="text"
              placeholder="Auto-generated from First + Last"
              value={data.fullName}
              onChange={e => onChange({ fullName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Name (Bengali / বাংলা নাম)</label>
            <input
              type="text"
              placeholder="যেমন: মো. শফিকুল ইসলাম"
              value={data.nameBangla}
              onChange={e => onChange({ nameBangla: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Employee ID</label>
            <input
              type="text"
              placeholder="EMP-001 (auto if blank)"
              value={data.employeeId}
              onChange={e => onChange({ employeeId: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Gender <span className="text-red-400">*</span></label>
            <select value={data.gender} onChange={e => onChange({ gender: e.target.value as Gender | '' })} className={inputCls}>
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date of Birth <span className="text-red-400">*</span></label>
            <input type="date" value={data.dateOfBirth} onChange={e => onChange({ dateOfBirth: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Blood Group</label>
            <select value={data.bloodGroup} onChange={e => onChange({ bloodGroup: e.target.value as BloodGroup | '' })} className={inputCls}>
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Marital Status</label>
            <select value={data.maritalStatus} onChange={e => onChange({ maritalStatus: e.target.value as MaritalStatus | '' })} className={inputCls}>
              <option value="">Select Status</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Religion</label>
            <select value={data.religion} onChange={e => onChange({ religion: e.target.value as Religion | '' })} className={inputCls}>
              <option value="">Select Religion</option>
              <option value="ISLAM">Islam</option>
              <option value="HINDUISM">Hinduism</option>
              <option value="CHRISTIANITY">Christianity</option>
              <option value="BUDDHISM">Buddhism</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Nationality</label>
            <input type="text" value={data.nationality} onChange={e => onChange({ nationality: e.target.value })} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Identity Documents ──────────────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-purple-600/30 text-purple-400 rounded text-xs flex items-center justify-center font-bold">2</span>
          Identity Documents
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>NID Number</label>
            <input type="text" placeholder="13 or 17 digit NID" value={data.nidNumber} onChange={e => onChange({ nidNumber: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Birth Certificate Number</label>
            <input type="text" placeholder="Birth certificate no." value={data.birthCertificateNumber} onChange={e => onChange({ birthCertificateNumber: e.target.value })} className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  )
}
