import type { StudentFormData, StudentStatus } from '../../types'

interface Props {
  data: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
}

const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors'
const labelCls = 'block text-xs font-bold text-zinc-700 mb-1'

export function Step2_ContactParent({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* ── 1. Parents Information ───────────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
          Parents Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Father */}
          <div>
            <label className={labelCls}>Father's Name (পিতার নাম) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Abdul Karim"
              value={data.fatherName}
              onChange={e => onChange({ fatherName: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Father's Mobile <span className="text-red-500">*</span></label>
            <input
              type="tel"
              placeholder="018XX-XXXXXX"
              value={data.fatherMobile}
              onChange={e => onChange({ fatherMobile: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Father's Occupation</label>
            <input
              type="text"
              placeholder="e.g. Businessman / Govt. Officer"
              value={data.fatherOccupation}
              onChange={e => onChange({ fatherOccupation: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* Mother */}
          <div>
            <label className={labelCls}>Mother's Name (মাতার নাম)</label>
            <input
              type="text"
              placeholder="e.g. Fatema Begum"
              value={data.motherName}
              onChange={e => onChange({ motherName: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Mother's Mobile</label>
            <input
              type="tel"
              placeholder="019XX-XXXXXX"
              value={data.motherMobile}
              onChange={e => onChange({ motherMobile: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Mother's Occupation</label>
            <input
              type="text"
              placeholder="e.g. Homemaker / Teacher"
              value={data.motherOccupation}
              onChange={e => onChange({ motherOccupation: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Alternate Guardian Checkbox */}
        <div className="pt-2 border-t border-zinc-200/50">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={data.hasGuardian}
              onChange={e => onChange({ hasGuardian: e.target.checked })}
              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Assign Separate Local / Legal Guardian (আইনগত অভিভাবক)</span>
          </label>

          {data.hasGuardian && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 bg-white border border-zinc-200 rounded-xl">
              <div>
                <label className={labelCls}>Guardian Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Kamal Hossain"
                  value={data.guardianName}
                  onChange={e => onChange({ guardianName: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Uncle / Brother"
                  value={data.guardianRelation}
                  onChange={e => onChange({ guardianRelation: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Guardian Mobile <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="017XX-XXXXXX"
                  value={data.guardianMobile}
                  onChange={e => onChange({ guardianMobile: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Residential Address ───────────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
          Residential Address & Status
        </h3>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>Present Address (বর্তমান ঠিকানা) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="House, Road, Area, Thana, District (যেমন: বাড়ি ১২, মিরপুর ১০, ঢাকা)"
              value={data.presentAddress}
              onChange={e => onChange({ presentAddress: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600 mb-2">
              <input
                type="checkbox"
                checked={data.sameAddress}
                onChange={e => onChange({ sameAddress: e.target.checked })}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>Permanent address is same as present address</span>
            </label>

            {!data.sameAddress && (
              <div>
                <label className={labelCls}>Permanent Address (স্থায়ী ঠিকানা)</label>
                <input
                  type="text"
                  placeholder="Village, Post Office, Upazila, District"
                  value={data.permanentAddress}
                  onChange={e => onChange({ permanentAddress: e.target.value })}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200/50">
            <div>
              <label className={labelCls}>Student Status</label>
              <select
                value={data.status}
                onChange={e => onChange({ status: e.target.value as StudentStatus })}
                className={inputCls}
              >
                <option value="ACTIVE">Active (নিয়মিত অধ্যয়নরত)</option>
                <option value="INACTIVE">Inactive (অনিয়মিত)</option>
                <option value="LEFT">Left (ছাড়পত্র প্রাপ্ত)</option>
                <option value="PASSED">Passed / Alumni (উত্তীর্ণ)</option>
                <option value="SUSPENDED">Suspended (স্থগিত)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Student Email (Optional)</label>
              <input
                type="email"
                placeholder="student@example.com"
                value={data.email}
                onChange={e => onChange({ email: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
