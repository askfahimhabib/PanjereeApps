import { useMemo } from 'react'
import type { StudentFormData, StudentGroup, StudentShift, StudentVersion, Gender, BloodGroup, TargetExam } from '../../types'
import { classStore, sectionStore, batchStore } from '@/data/stores'
import { GraduationCap, BookOpen } from 'lucide-react'

interface Props {
  data: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
}

const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors'
const labelCls = 'block text-xs font-bold text-zinc-700 mb-1'

export function Step1_BasicAcademic({ data, onChange }: Props) {
  const classes = useMemo(() => classStore.getAll().filter(c => c.isActive ?? true), [])
  const batches = useMemo(() => batchStore.getAll().filter(b => b.status === 'ONGOING' || !b.status), [])

  const selectedClass = useMemo(() => classes.find(c => c.id === data.classId), [classes, data.classId])
  const classSections = useMemo(() => {
    if (!data.classId) return []
    return sectionStore.getWhere(s => s.classId === data.classId)
  }, [data.classId])

  const needsGroup = selectedClass ? selectedClass.numericName >= 9 || selectedClass.hasGroups : false

  return (
    <div className="space-y-5">
      {/* ── Track Switcher (Regular vs Exam Batch) ────────────────────────── */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5">
          Admission Track <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ type: 'REGULAR', batchId: '', schoolName: '' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              data.type === 'REGULAR'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <GraduationCap size={16} className={data.type === 'REGULAR' ? 'text-indigo-600' : 'text-zinc-400'} />
            <span>🎒 Regular School Student</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ type: 'EXAM_BATCH', classId: '', sectionId: '', groupId: '' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              data.type === 'EXAM_BATCH'
                ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-xs ring-2 ring-purple-500/20'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <BookOpen size={16} className={data.type === 'EXAM_BATCH' ? 'text-purple-600' : 'text-zinc-400'} />
            <span>📚 Coaching / Exam Batch</span>
          </button>
        </div>
      </div>

      {/* ── 1. Core Identity ────────────────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
          Student Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Full Name (English) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Rahim Uddin"
              value={data.fullNameEn}
              onChange={e => onChange({ fullNameEn: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Full Name (বাংলা)</label>
            <input
              type="text"
              placeholder="যেমন: রহিম উদ্দিন"
              value={data.fullNameBn}
              onChange={e => onChange({ fullNameBn: e.target.value })}
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
              <option value="MALE">Male (ছাত্র)</option>
              <option value="FEMALE">Female (ছাত্রী)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              placeholder="017XX-XXXXXX"
              value={data.mobile}
              onChange={e => onChange({ mobile: e.target.value })}
              className={inputCls}
              required
            />
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
        </div>
      </div>

      {/* ── 2. Academic Placement ────────────────────────────────────────── */}
      <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
          Academic Allocation ({data.type === 'REGULAR' ? 'Regular Class' : 'Exam Batch'})
        </h3>

        {/* Regular Fields */}
        {data.type === 'REGULAR' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Class <span className="text-red-500">*</span></label>
              <select
                value={data.classId}
                onChange={e => {
                  const cId = e.target.value
                  const c = classes.find(item => item.id === cId)
                  onChange({
                    classId: cId,
                    className: c?.name || '',
                    sectionId: '',
                    groupId: '',
                  })
                }}
                className={inputCls}
                required
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                Section {classSections.length > 0 ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-zinc-400 font-normal">(No Section)</span>
                )}
              </label>
              <select
                value={data.sectionId}
                onChange={e => {
                  const sId = e.target.value
                  const s = classSections.find(sec => sec.id === sId)
                  onChange({
                    sectionId: sId,
                    sectionName: s?.name || '',
                  })
                }}
                className={inputCls}
                disabled={!data.classId}
              >
                <option value="">
                  {classSections.length > 0 ? 'Select Section' : 'No Section / Default'}
                </option>
                {classSections.map(s => (
                  <option key={s.id} value={s.id}>
                    Section {s.name} {s.groupName ? `(${s.groupName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Roll Number</label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={data.rollNumber}
                onChange={e => onChange({ rollNumber: e.target.value })}
                className={inputCls}
              />
            </div>

            {needsGroup && (
              <div>
                <label className={labelCls}>Academic Group <span className="text-red-500">*</span></label>
                <select
                  value={data.groupId}
                  onChange={e => onChange({ groupId: e.target.value as StudentGroup })}
                  className={inputCls}
                  required
                >
                  <option value="">Select Group</option>
                  <option value="SCIENCE">Science (বিজ্ঞান)</option>
                  <option value="ARTS">Humanities / Arts (মানবিক)</option>
                  <option value="COMMERCE">Business / Commerce (ব্যবসায়)</option>
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>Shift</label>
              <select
                value={data.shift}
                onChange={e => onChange({ shift: e.target.value as StudentShift })}
                className={inputCls}
              >
                <option value="DAY">Day Shift (দিবা)</option>
                <option value="MORNING">Morning Shift (প্রভাতি)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Medium / Version</label>
              <select
                value={data.version}
                onChange={e => onChange({ version: e.target.value as StudentVersion })}
                className={inputCls}
              >
                <option value="BANGLA">Bangla Medium</option>
                <option value="ENGLISH">English Version</option>
              </select>
            </div>
          </div>
        )}

        {/* Exam Batch Fields */}
        {data.type === 'EXAM_BATCH' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Exam Batch <span className="text-red-500">*</span></label>
              <select
                value={data.batchId}
                onChange={e => {
                  const bId = e.target.value
                  const b = batches.find(item => item.id === bId)
                  onChange({
                    batchId: bId,
                    batchName: b?.name || '',
                    targetExam: (b?.examName as TargetExam) || 'SSC',
                  })
                }}
                className={inputCls}
                required
              >
                <option value="">Select Exam Batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.examName} {b.examYear})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Target Exam</label>
              <select
                value={data.targetExam}
                onChange={e => onChange({ targetExam: e.target.value as TargetExam })}
                className={inputCls}
              >
                <option value="SSC">SSC Candidate</option>
                <option value="HSC">HSC Candidate</option>
                <option value="ADMISSION">University / Medical Admission</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Original School / College Name</label>
              <input
                type="text"
                placeholder="e.g. Dhaka Residential Model College"
                value={data.schoolName}
                onChange={e => onChange({ schoolName: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Batch Roll / Serial</label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={data.rollNumber}
                onChange={e => onChange({ rollNumber: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Academic Session */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-200/50">
          <div>
            <label className={labelCls}>Academic Session</label>
            <input
              type="text"
              placeholder="e.g. 2026"
              value={data.session}
              onChange={e => onChange({ session: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Admission Date</label>
            <input
              type="date"
              value={data.admissionDate}
              onChange={e => onChange({ admissionDate: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
