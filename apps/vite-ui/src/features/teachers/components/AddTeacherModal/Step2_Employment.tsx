import { useMemo } from 'react'
import type {
  TeacherFormData,
  Designation,
  Department,
  EmploymentType,
} from '../../types'
import {
  DESIGNATION_LABELS,
  DEPARTMENT_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from '../../types'
import { classStore, sectionStore } from '@/data/stores'
import { School, GraduationCap, Star } from 'lucide-react'

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors'
const labelCls = 'block text-xs font-bold text-zinc-700 mb-1'

export function Step2_Employment({ data, onChange }: Props) {
  const classes = useMemo(() => classStore.getAll().filter(c => c.isActive ?? true), [])
  const sections = useMemo(() => {
    if (!data.classTeacherClassId) return []
    return sectionStore.getWhere(s => s.classId === data.classTeacherClassId)
  }, [data.classTeacherClassId])

  return (
    <div className="space-y-5">
      {/* ── 1. Category Switcher (Regular vs Guest) ─────────────────────── */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5">
          Faculty Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              onChange({
                teacherCategory: 'REGULAR',
                employmentType: 'FULL_TIME',
              })
            }
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              data.teacherCategory === 'REGULAR'
                ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <School size={16} className={data.teacherCategory === 'REGULAR' ? 'text-blue-600' : 'text-zinc-400'} />
            <span>🏫 Regular School Faculty</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                teacherCategory: 'GUEST',
                employmentType: 'PART_TIME',
                isClassTeacher: false,
              })
            }
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              data.teacherCategory === 'GUEST'
                ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-xs ring-2 ring-purple-500/20'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <GraduationCap size={16} className={data.teacherCategory === 'GUEST' ? 'text-purple-600' : 'text-zinc-400'} />
            <span>🎓 Guest / Coaching Faculty</span>
          </button>
        </div>
      </div>

      {/* ── 2. Designation & Department ─────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
          Designation & Academic Subject
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Designation (পদবী) <span className="text-red-500">*</span></label>
            <select
              value={data.designation}
              onChange={e => onChange({ designation: e.target.value as Designation })}
              className={inputCls}
              required
            >
              {Object.entries(DESIGNATION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Department / Primary Subject (মূল বিষয়) <span className="text-red-500">*</span></label>
            <select
              value={data.department}
              onChange={e => onChange({ department: e.target.value as Department })}
              className={inputCls}
              required
            >
              {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Employment Type (চুক্তির ধরন) <span className="text-red-500">*</span></label>
            <select
              value={data.employmentType}
              onChange={e => onChange({ employmentType: e.target.value as EmploymentType })}
              className={inputCls}
            >
              {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Joining Date (যোগদানের তারিখ) <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={data.joiningDate}
              onChange={e => onChange({ joiningDate: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Base Monthly Salary / Remuneration (BDT)</label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={data.baseSalary || ''}
              onChange={e => onChange({ baseSalary: parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Highest Educational Qualification</label>
            <input
              type="text"
              placeholder="e.g. M.Sc in Mathematics (DU)"
              value={data.highestDegree}
              onChange={e => onChange({ highestDegree: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── 3. Class Teacher Role (Optional for Regular Faculty) ────────── */}
      {data.teacherCategory === 'REGULAR' && (
        <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800">
            <input
              type="checkbox"
              checked={data.isClassTeacher}
              onChange={e => onChange({ isClassTeacher: e.target.checked })}
              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="flex items-center gap-1 text-amber-900 font-extrabold">
              <Star size={14} className="text-amber-500 fill-amber-400" />
              Assign as Designated Class Teacher (শ্রেণি শিক্ষক)
            </span>
          </label>

          {data.isClassTeacher && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className={labelCls}>Class Teacher for Class <span className="text-red-500">*</span></label>
                <select
                  value={data.classTeacherClassId}
                  onChange={e => onChange({ classTeacherClassId: e.target.value, classTeacherSectionId: '' })}
                  className={inputCls}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Section</label>
                <select
                  value={data.classTeacherSectionId}
                  onChange={e => onChange({ classTeacherSectionId: e.target.value })}
                  className={inputCls}
                  disabled={!data.classTeacherClassId}
                >
                  <option value="">
                    {sections.length > 0 ? 'Select Section' : 'No Specific Section / All'}
                  </option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>
                      Section {s.name} {s.groupName ? `(${s.groupName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
