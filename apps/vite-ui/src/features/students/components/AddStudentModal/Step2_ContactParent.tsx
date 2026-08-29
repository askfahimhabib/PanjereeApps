import { useEffect } from 'react'
import type { StudentFormData } from '../../types'

interface Props {
  data: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
}

const inputCls = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-4'

export function Step2_ContactParent({ data, onChange }: Props) {
  // Auto-fill permanent address when sameAddress is toggled
  useEffect(() => {
    if (data.sameAddress) {
      onChange({ permanentAddress: data.presentAddress })
    }
  }, [data.sameAddress, data.presentAddress])

  return (
    <div className="space-y-5">
      {/* ── Contact Information ───────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-emerald-600/30 text-emerald-400 rounded text-xs flex items-center justify-center font-bold">3</span>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Student Mobile <span className="text-red-400">*</span></label>
            <input type="tel" placeholder="01XXXXXXXXX" value={data.mobile} onChange={e => onChange({ mobile: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number</label>
            <input type="tel" placeholder="01XXXXXXXXX" value={data.whatsapp} onChange={e => onChange({ whatsapp: e.target.value })} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Email</label>
            <input type="email" placeholder="student@example.com" value={data.email} onChange={e => onChange({ email: e.target.value })} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Present Address <span className="text-red-400">*</span></label>
            <textarea
              rows={2}
              placeholder="House, Road, Area, District"
              value={data.presentAddress}
              onChange={e => onChange({ presentAddress: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelCls} mb-0`}>Permanent Address</label>
              <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.sameAddress}
                  onChange={e => onChange({ sameAddress: e.target.checked })}
                  className="w-3.5 h-3.5 rounded accent-blue-600"
                />
                Same as present address
              </label>
            </div>
            <textarea
              rows={2}
              placeholder="Village, Upazila, District"
              value={data.permanentAddress}
              onChange={e => onChange({ permanentAddress: e.target.value })}
              disabled={data.sameAddress}
              className={`${inputCls} resize-none disabled:opacity-50`}
            />
          </div>
        </div>
      </div>

      {/* ── Father Information ────────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-amber-600/30 text-amber-400 rounded text-xs flex items-center justify-center font-bold">4</span>
          Father's Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Father's Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="Full name" value={data.fatherName} onChange={e => onChange({ fatherName: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Father's Mobile <span className="text-red-400">*</span></label>
            <input type="tel" placeholder="01XXXXXXXXX" value={data.fatherMobile} onChange={e => onChange({ fatherMobile: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Occupation</label>
            <input type="text" placeholder="e.g. Businessman" value={data.fatherOccupation} onChange={e => onChange({ fatherOccupation: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>NID Number (Optional)</label>
            <input type="text" placeholder="17-digit NID" value={data.fatherNid} onChange={e => onChange({ fatherNid: e.target.value })} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Mother Information ────────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-pink-600/30 text-pink-400 rounded text-xs flex items-center justify-center font-bold">5</span>
          Mother's Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Mother's Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="Full name" value={data.motherName} onChange={e => onChange({ motherName: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Mother's Mobile</label>
            <input type="tel" placeholder="01XXXXXXXXX" value={data.motherMobile} onChange={e => onChange({ motherMobile: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Occupation</label>
            <input type="text" placeholder="e.g. Housewife" value={data.motherOccupation} onChange={e => onChange({ motherOccupation: e.target.value })} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Guardian (Optional) ───────────────────────── */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${sectionTitleCls} mb-0`}>
            <span className="w-5 h-5 bg-cyan-600/30 text-cyan-400 rounded text-xs flex items-center justify-center font-bold">6</span>
            Guardian Information
          </h3>
          <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasGuardian}
              onChange={e => onChange({ hasGuardian: e.target.checked })}
              className="w-3.5 h-3.5 rounded accent-blue-600"
            />
            Add guardian
          </label>
        </div>

        {data.hasGuardian && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Guardian's Name</label>
              <input type="text" placeholder="Full name" value={data.guardianName} onChange={e => onChange({ guardianName: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Relation</label>
              <input type="text" placeholder="e.g. Uncle, Aunt" value={data.guardianRelation} onChange={e => onChange({ guardianRelation: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mobile</label>
              <input type="tel" placeholder="01XXXXXXXXX" value={data.guardianMobile} onChange={e => onChange({ guardianMobile: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input type="text" placeholder="Guardian's address" value={data.guardianAddress} onChange={e => onChange({ guardianAddress: e.target.value })} className={inputCls} />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className={labelCls}>Emergency Contact</label>
          <input type="tel" placeholder="Emergency phone number" value={data.emergencyContact} onChange={e => onChange({ emergencyContact: e.target.value })} className={inputCls} />
        </div>
      </div>
    </div>
  )
}
