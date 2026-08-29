import type { TeacherFormData, Division } from '../../types'
import { DIVISION_LABELS } from '../../types'

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls   = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls   = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-4'

export function Step2_ContactAddress({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* Contact */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-blue-600/30 text-blue-400 rounded text-xs flex items-center justify-center font-bold">📞</span>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Phone Number <span className="text-red-400">*</span></label>
            <input type="tel" placeholder="01711-XXXXXX" value={data.phone} onChange={e => onChange({ phone: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Alternative Phone</label>
            <input type="tel" placeholder="01811-XXXXXX" value={data.alternativePhone} onChange={e => onChange({ alternativePhone: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="email" placeholder="name@school.edu.bd" value={data.email} onChange={e => onChange({ email: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number</label>
            <input type="tel" placeholder="01711-XXXXXX" value={data.whatsapp} onChange={e => onChange({ whatsapp: e.target.value })} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-emerald-600/30 text-emerald-400 rounded text-xs flex items-center justify-center font-bold">📍</span>
          Address
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Present Address <span className="text-red-400">*</span></label>
            <textarea
              rows={2}
              placeholder="House, Road, Area, City..."
              value={data.presentAddress}
              onChange={e => onChange({ presentAddress: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* Same address toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.sameAddress}
              onChange={e => onChange({
                sameAddress: e.target.checked,
                permanentAddress: e.target.checked ? data.presentAddress : data.permanentAddress,
              })}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-xs text-zinc-600">Permanent address same as present</span>
          </label>

          {!data.sameAddress && (
            <div>
              <label className={labelCls}>Permanent Address</label>
              <textarea
                rows={2}
                placeholder="Village, Post Office, District..."
                value={data.permanentAddress}
                onChange={e => onChange({ permanentAddress: e.target.value })}
                className={inputCls}
              />
            </div>
          )}

          {/* BD specific fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Division</label>
              <select value={data.division} onChange={e => onChange({ division: e.target.value as Division | '' })} className={inputCls}>
                <option value="">Select Division</option>
                {(Object.entries(DIVISION_LABELS) as [Division, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>District</label>
              <input type="text" placeholder="e.g. Dhaka" value={data.district} onChange={e => onChange({ district: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Upazila / Thana</label>
              <input type="text" placeholder="e.g. Mirpur" value={data.upazila} onChange={e => onChange({ upazila: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Area</label>
              <input type="text" placeholder="e.g. Mirpur-10" value={data.area} onChange={e => onChange({ area: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Postal Code</label>
              <input type="text" placeholder="e.g. 1216" value={data.postalCode} onChange={e => onChange({ postalCode: e.target.value })} className={inputCls} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
