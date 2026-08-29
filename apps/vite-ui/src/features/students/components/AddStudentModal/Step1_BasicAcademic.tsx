import type { StudentFormData, StudentGroup, StudentShift, StudentVersion, StudentStatus } from '../../types'
import { classStore, sectionStore, batchStore } from '@/data/stores'

const MOCK_CLASSES   = classStore.getAll()
const MOCK_SECTIONS  = sectionStore.getAll().map(s => ({ id: s.id, name: s.name }))
const MOCK_BATCHES   = batchStore.getAll().map(b => ({ id: b.id, name: b.name, targetExam: b.examName }))
const GROUP_CLASSES  = ['cls-9', 'cls-10', 'cls-11', 'cls-12']

interface Props {
  data: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
}

const inputCls = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-4'

// Generate session years dynamically from 10 years ago to 20 years in the future
const currentYear = new Date().getFullYear()
const SESSION_YEARS = Array.from({ length: 31 }, (_, i) => (currentYear - 10 + i).toString()).reverse()

export function Step1_BasicAcademic({ data, onChange }: Props) {
  const needsGroup = GROUP_CLASSES.includes(data.classId)

  return (
    <div className="space-y-5">
      {/* ── Basic Information ─────────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-blue-600/30 text-blue-400 rounded text-xs flex items-center justify-center font-bold">1</span>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name (English) <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Rahim Uddin"
              value={data.fullNameEn}
              onChange={e => onChange({ fullNameEn: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Full Name (Bangla)</label>
            <input
              type="text"
              placeholder="যেমন: রহিম উদ্দিন"
              value={data.fullNameBn}
              onChange={e => onChange({ fullNameBn: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Gender <span className="text-red-400">*</span></label>
            <select value={data.gender} onChange={e => onChange({ gender: e.target.value as StudentFormData['gender'] })} className={inputCls}>
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date of Birth <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={e => onChange({ dateOfBirth: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Blood Group</label>
            <select value={data.bloodGroup} onChange={e => onChange({ bloodGroup: e.target.value as StudentFormData['bloodGroup'] })} className={inputCls}>
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Religion <span className="text-red-400">*</span></label>
            <select value={data.religion} onChange={e => onChange({ religion: e.target.value })} className={inputCls}>
              <option value="Islam">Islam</option>
              <option value="Hinduism">Hinduism</option>
              <option value="Christianity">Christianity</option>
              <option value="Buddhism">Buddhism</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Nationality <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={data.nationality}
              onChange={e => onChange({ nationality: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Academic Information ──────────────────────── */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>
          <span className="w-5 h-5 bg-purple-600/30 text-purple-400 rounded text-xs flex items-center justify-center font-bold">2</span>
          Academic Information
        </h3>

        {/* Student Type toggle */}
        <div>
          <label className={labelCls}>Student Type <span className="text-red-400">*</span></label>
          <div className="flex gap-3">
            {[
              { value: 'REGULAR', label: '🎒 Regular Student' },
              { value: 'EXAM_BATCH', label: '📚 Exam Batch' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ type: opt.value as StudentFormData['type'], classId: '', sectionId: '', groupId: '', batchId: '' })}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  data.type === opt.value
                    ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                    : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Regular Student fields */}
        {data.type === 'REGULAR' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Class <span className="text-red-400">*</span></label>
              <select
                value={data.classId}
                onChange={e => onChange({ classId: e.target.value, groupId: '', sectionId: '' })}
                className={inputCls}
              >
                <option value="">Select Class</option>
                {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Section <span className="text-red-400">*</span></label>
              <select value={data.sectionId} onChange={e => onChange({ sectionId: e.target.value })} className={inputCls}>
                <option value="">Select Section</option>
                {MOCK_SECTIONS.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </select>
            </div>
            {needsGroup && (
              <div>
                <label className={labelCls}>Group <span className="text-red-400">*</span></label>
                <select value={data.groupId} onChange={e => onChange({ groupId: e.target.value as StudentGroup })} className={inputCls}>
                  <option value="">Select Group</option>
                  <option value="SCIENCE">Science</option>
                  <option value="ARTS">Arts</option>
                  <option value="COMMERCE">Commerce</option>
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>Shift <span className="text-red-400">*</span></label>
              <select value={data.shift} onChange={e => onChange({ shift: e.target.value as StudentShift })} className={inputCls}>
                <option value="">Select Shift</option>
                <option value="MORNING">Morning</option>
                <option value="DAY">Day</option>
              </select>
            </div>
          </div>
        )}

        {/* Exam Batch fields */}
        {data.type === 'EXAM_BATCH' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Batch <span className="text-red-400">*</span></label>
              <select value={data.batchId} onChange={e => onChange({ batchId: e.target.value })} className={inputCls}>
                <option value="">Select Batch</option>
                {MOCK_BATCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Version <span className="text-red-400">*</span></label>
            <select value={data.version} onChange={e => onChange({ version: e.target.value as StudentVersion })} className={inputCls}>
              <option value="">Select Version</option>
              <option value="BANGLA">Bangla Medium</option>
              <option value="ENGLISH">English Medium</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Academic Session <span className="text-red-400">*</span></label>
            <select value={data.session} onChange={e => onChange({ session: e.target.value })} className={inputCls}>
              <option value="">Select Session</option>
              {SESSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Admission Date <span className="text-red-400">*</span></label>
            <input type="date" value={data.admissionDate} onChange={e => onChange({ admissionDate: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Admission Number</label>
            <input type="text" placeholder="ADM-2024-001" value={data.admissionNumber} onChange={e => onChange({ admissionNumber: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Previous School</label>
            <input type="text" placeholder="School name" value={data.previousSchool} onChange={e => onChange({ previousSchool: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Status <span className="text-red-400">*</span></label>
            <select value={data.status} onChange={e => onChange({ status: e.target.value as StudentStatus })} className={inputCls}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="LEFT">Left</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
