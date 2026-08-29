import { Plus, Trash2 } from 'lucide-react'
import type { TeacherFormData, TeachingLevel, QualificationForm, CertificationForm, ExperienceForm } from '../../types'
import { TEACHING_LEVEL_LABELS } from '../../types'
import { subjectStore } from '@/data/stores'

const MOCK_SUBJECTS = subjectStore.getAll()

interface Props {
  data: TeacherFormData
  onChange: (partial: Partial<TeacherFormData>) => void
}

const inputCls   = 'w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg py-2 px-3 text-sm text-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls   = 'block text-xs font-medium text-zinc-600 mb-1.5'
const sectionCls = 'bg-white border border-zinc-100 rounded-xl p-5 space-y-4'
const sectionTitleCls = 'text-sm font-semibold text-zinc-800 flex items-center gap-2'

function updateAt<T>(arr: T[], idx: number, update: Partial<T>): T[] {
  return arr.map((item, i) => (i === idx ? { ...item, ...update } : item))
}

export function Step4_Academic({ data, onChange }: Props) {
  // ── Qualifications ─────────────────────────────────────
  function addQual() {
    onChange({ qualifications: [...data.qualifications, { degree: '', subject: '', institution: '', university: '', result: '', passingYear: '' }] })
  }
  function removeQual(idx: number) {
    onChange({ qualifications: data.qualifications.filter((_, i) => i !== idx) })
  }
  function updateQual(idx: number, partial: Partial<QualificationForm>) {
    onChange({ qualifications: updateAt(data.qualifications, idx, partial) })
  }

  // ── Certifications ──────────────────────────────────────
  function addCert() {
    onChange({ certifications: [...data.certifications, { name: '', issuer: '', year: '' }] })
  }
  function removeCert(idx: number) {
    onChange({ certifications: data.certifications.filter((_, i) => i !== idx) })
  }
  function updateCert(idx: number, partial: Partial<CertificationForm>) {
    onChange({ certifications: updateAt(data.certifications, idx, partial) })
  }

  // ── Experience ──────────────────────────────────────────
  function addExp() {
    onChange({ previousExperience: [...data.previousExperience, { organization: '', designation: '', fromYear: '', toYear: '' }] })
  }
  function removeExp(idx: number) {
    onChange({ previousExperience: data.previousExperience.filter((_, i) => i !== idx) })
  }
  function updateExp(idx: number, partial: Partial<ExperienceForm>) {
    onChange({ previousExperience: updateAt(data.previousExperience, idx, partial) })
  }

  // ── Teaching subjects toggle ────────────────────────────
  function toggleSubject(subjectName: string) {
    const current = data.teachingSubjects
    onChange({
      teachingSubjects: current.includes(subjectName)
        ? current.filter(s => s !== subjectName)
        : [...current, subjectName],
    })
  }

  // ── Teaching levels toggle ──────────────────────────────
  function toggleLevel(level: TeachingLevel) {
    const current = data.teachingLevels
    onChange({
      teachingLevels: current.includes(level)
        ? current.filter(l => l !== level)
        : [...current, level],
    })
  }

  return (
    <div className="space-y-5">
      {/* Qualifications */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleCls}>🎓 Educational Qualifications</h3>
          <button onClick={addQual} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-500/20 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {data.qualifications.map((q, idx) => (
            <div key={idx} className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-medium">Qualification #{idx + 1}</span>
                {data.qualifications.length > 1 && (
                  <button onClick={() => removeQual(idx)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Degree</label>
                  <input type="text" placeholder="e.g. M.Sc., B.Ed., PhD" value={q.degree} onChange={e => updateQual(idx, { degree: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Subject / Major</label>
                  <input type="text" placeholder="e.g. Mathematics" value={q.subject} onChange={e => updateQual(idx, { subject: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Institution</label>
                  <input type="text" placeholder="College/University name" value={q.institution} onChange={e => updateQual(idx, { institution: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>University / Board</label>
                  <input type="text" placeholder="e.g. University of Dhaka" value={q.university} onChange={e => updateQual(idx, { university: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Result / CGPA</label>
                  <input type="text" placeholder="e.g. First Class / 3.8" value={q.result} onChange={e => updateQual(idx, { result: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Passing Year</label>
                  <input type="number" placeholder="e.g. 2005" min="1980" max="2030" value={q.passingYear} onChange={e => updateQual(idx, { passingYear: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleCls}>🏅 Certifications</h3>
          <button onClick={addCert} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        {data.certifications.length === 0
          ? <p className="text-xs text-zinc-600 italic">No certifications added. Click Add to add one.</p>
          : (
            <div className="space-y-3">
              {data.certifications.map((c, idx) => (
                <div key={idx} className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-600 font-medium">Certificate #{idx + 1}</span>
                    <button onClick={() => removeCert(idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={13} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Certificate Name</label>
                      <input type="text" placeholder="e.g. B.Ed." value={c.name} onChange={e => updateCert(idx, { name: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Year</label>
                      <input type="number" placeholder="2010" min="1980" max="2030" value={c.year} onChange={e => updateCert(idx, { year: e.target.value })} className={inputCls} />
                    </div>
                    <div className="col-span-3">
                      <label className={labelCls}>Issued By</label>
                      <input type="text" placeholder="e.g. National University" value={c.issuer} onChange={e => updateCert(idx, { issuer: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Specialization */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>⭐ Specialization</h3>
        <textarea
          rows={2}
          placeholder="e.g. Higher Mathematics, Trigonometry, Calculus..."
          value={data.specialization}
          onChange={e => onChange({ specialization: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Teaching Subjects */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>📚 Teaching Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {MOCK_SUBJECTS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSubject(s.name)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                data.teachingSubjects.includes(s.name)
                  ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                  : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-100'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Teaching Levels */}
      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>🏫 Teaching Levels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(TEACHING_LEVEL_LABELS) as [TeachingLevel, string][]).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleLevel(k)}
              className={`text-xs px-3 py-2 rounded-lg border text-left transition-all ${
                data.teachingLevels.includes(k)
                  ? 'bg-cyan-600/20 border-cyan-500/60 text-cyan-300'
                  : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Previous Experience */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleCls}>💼 Previous Experience</h3>
          <button onClick={addExp} className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        {data.previousExperience.length === 0
          ? <p className="text-xs text-zinc-600 italic">No previous experience added.</p>
          : (
            <div className="space-y-3">
              {data.previousExperience.map((e, idx) => (
                <div key={idx} className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-600 font-medium">Experience #{idx + 1}</span>
                    <button onClick={() => removeExp(idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={13} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Organization</label>
                      <input type="text" placeholder="School / Institute name" value={e.organization} onChange={ev => updateExp(idx, { organization: ev.target.value })} className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Designation</label>
                      <input type="text" placeholder="e.g. Assistant Teacher" value={e.designation} onChange={ev => updateExp(idx, { designation: ev.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>From Year</label>
                      <input type="number" placeholder="2010" min="1970" max="2030" value={e.fromYear} onChange={ev => updateExp(idx, { fromYear: ev.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>To Year</label>
                      <input type="number" placeholder="2022 (blank = present)" min="1970" max="2030" value={e.toYear} onChange={ev => updateExp(idx, { toYear: ev.target.value })} className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
