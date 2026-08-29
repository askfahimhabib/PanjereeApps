import { Plus, Trash2, Star } from 'lucide-react'
import type { TeacherFormData, AssignmentType, AssignmentForm } from '../../types'
import { classStore, sectionStore, subjectStore } from '@/data/stores'

const MOCK_CLASSES  = classStore.getAll()
const MOCK_SECTIONS = sectionStore.getAll().map(s => ({ id: s.id, name: s.name, classId: s.classId }))
const MOCK_SUBJECTS = subjectStore.getAll()

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls   = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls   = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i))

const ASSIGNMENT_TYPES: [AssignmentType, string][] = [
  ['PRIMARY',    'Primary'],
  ['SECONDARY',  'Secondary'],
  ['ADDITIONAL', 'Additional'],
]

function updateAt<T>(arr: T[], idx: number, update: Partial<T>): T[] {
  return arr.map((item, i) => (i === idx ? { ...item, ...update } : item))
}

export function Step5_Assignment({ data, onChange }: Props) {
  function addAssignment() {
    onChange({
      assignments: [
        ...data.assignments,
        { academicYear: String(CURRENT_YEAR), classId: '', sectionId: '', subjectId: '', assignmentType: '', isClassTeacher: false },
      ],
    })
  }

  function removeAssignment(idx: number) {
    onChange({ assignments: data.assignments.filter((_, i) => i !== idx) })
  }

  function updateAssignment(idx: number, partial: Partial<AssignmentForm>) {
    onChange({ assignments: updateAt(data.assignments, idx, partial) })
  }

  // Filter subjects by selected class
  function getSubjectsForClass(classId: string) {
    if (!classId) return MOCK_SUBJECTS
    return MOCK_SUBJECTS.filter(s => s.classes.includes(classId))
  }

  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
              📚 Teaching Assignments
            </h3>
            <p className="text-xs text-zinc-600 mt-1">Assign which classes and subjects this teacher will teach this year.</p>
          </div>
          <button
            onClick={addAssignment}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-500/20 transition-colors shrink-0"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        <div className="space-y-4">
          {data.assignments.map((a, idx) => (
            <div key={idx} className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-semibold">Assignment #{idx + 1}</span>
                {data.assignments.length > 1 && (
                  <button onClick={() => removeAssignment(idx)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Academic Year</label>
                  <select
                    value={a.academicYear}
                    onChange={e => updateAssignment(idx, { academicYear: e.target.value })}
                    className={inputCls}
                  >
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Class</label>
                  <select
                    value={a.classId}
                    onChange={e => updateAssignment(idx, { classId: e.target.value, subjectId: '' })}
                    className={inputCls}
                  >
                    <option value="">Select Class</option>
                    {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Section</label>
                  <select
                    value={a.sectionId}
                    onChange={e => updateAssignment(idx, { sectionId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">All Sections</option>
                    {MOCK_SECTIONS.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <label className={labelCls}>Subject</label>
                  <select
                    value={a.subjectId}
                    onChange={e => updateAssignment(idx, { subjectId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Select Subject</option>
                    {getSubjectsForClass(a.classId).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Assignment Type</label>
                  <select
                    value={a.assignmentType}
                    onChange={e => updateAssignment(idx, { assignmentType: e.target.value as AssignmentType | '' })}
                    className={inputCls}
                  >
                    <option value="">Select Type</option>
                    {ASSIGNMENT_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Class teacher toggle */}
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <button
                  type="button"
                  onClick={() => updateAssignment(idx, { isClassTeacher: !a.isClassTeacher })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    a.isClassTeacher
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                  }`}
                >
                  <Star size={12} />
                  {a.isClassTeacher ? 'Class Teacher ✓' : 'Make Class Teacher'}
                </button>
              </label>
            </div>
          ))}
        </div>
      </div>

      {data.assignments.length === 0 && (
        <div className="text-center py-8 text-zinc-600 text-sm">
          No assignments added. Click "Add" to assign classes and subjects.
        </div>
      )}
    </div>
  )
}
