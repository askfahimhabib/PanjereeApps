import { Plus, X, FileText } from 'lucide-react'
import type { StudentFormData, CustomField } from '../../types'

interface Props {
  data: StudentFormData
  onChange: (partial: Partial<StudentFormData>) => void
}

const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-medium text-slate-400 mb-1'
const sectionCls = 'bg-slate-900/40 border border-slate-700/50 rounded-xl p-5'

const DOCUMENT_FIELDS: { key: keyof StudentFormData['customFields'] extends never ? never : string; label: string; hint: string }[] = [
  { key: 'birthCertificate',  label: 'Birth Certificate',      hint: 'PDF or JPG, max 2MB' },
  { key: 'nid',               label: 'NID (if available)',      hint: 'PDF or JPG, max 2MB' },
  { key: 'studentPhoto',      label: 'Student Photo',           hint: 'JPG/PNG, max 1MB' },
  { key: 'fatherNid',         label: "Father's NID",            hint: 'PDF or JPG, max 2MB' },
  { key: 'motherNid',         label: "Mother's NID",            hint: 'PDF or JPG, max 2MB' },
  { key: 'transferCertificate', label: 'Transfer Certificate',  hint: 'PDF, max 2MB' },
  { key: 'previousMarksheet', label: 'Previous Marksheet',      hint: 'PDF or JPG, max 2MB' },
  { key: 'admissionFormPdf',  label: 'Admission Form (PDF)',    hint: 'PDF, max 5MB' },
]

export function Step4_Documents({ data, onChange }: Props) {
  function addCustomField() {
    onChange({ customFields: [...data.customFields, { key: '', value: '' }] })
  }

  function updateCustomField(index: number, field: Partial<CustomField>) {
    const updated = data.customFields.map((cf, i) => i === index ? { ...cf, ...field } : cf)
    onChange({ customFields: updated })
  }

  function removeCustomField(index: number) {
    onChange({ customFields: data.customFields.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-5">
      {/* ── Document Uploads ──────────────────────────── */}
      <div className={sectionCls}>
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-1">
          <FileText size={16} className="text-slate-400" />
          Document Uploads
        </h3>
        <p className="text-xs text-slate-500 mb-4">All documents are optional. Can be uploaded later from student profile.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DOCUMENT_FIELDS.map(doc => (
            <div key={doc.key}>
              <label className={labelCls}>{doc.label}</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 border-dashed rounded-lg py-2 px-3 cursor-pointer hover:border-blue-500/50 transition-colors group">
                  <span className="text-slate-500 group-hover:text-blue-400 transition-colors text-lg">📎</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Choose file</p>
                    <p className="text-xs text-slate-600">{doc.hint}</p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Custom Fields ─────────────────────────────── */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Custom Fields</h3>
            <p className="text-xs text-slate-500 mt-0.5">Add any extra info for this student</p>
          </div>
          <button
            type="button"
            onClick={addCustomField}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus size={13} />
            Add Field
          </button>
        </div>

        {data.customFields.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-sm">No custom fields yet</p>
            <p className="text-xs mt-1">e.g. SSC GPA, College Name, Facebook Link</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.customFields.map((cf, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Field name (e.g. SSC GPA)"
                  value={cf.key}
                  onChange={e => updateCustomField(idx, { key: e.target.value })}
                  className={`${inputCls} flex-1`}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={cf.value}
                  onChange={e => updateCustomField(idx, { value: e.target.value })}
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(idx)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-xs text-slate-500 w-full">Suggestions:</p>
          {['SSC GPA', 'College Name', 'Coaching Source', 'Facebook Link', 'Extra Note'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ customFields: [...data.customFields, { key: s, value: '' }] })}
              className="text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full px-3 py-1 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary note */}
      <div className="flex gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
        <div className="text-emerald-400 text-lg shrink-0">✅</div>
        <div>
          <p className="text-xs text-emerald-300 font-medium mb-0.5">Almost done!</p>
          <p className="text-xs text-slate-400">
            Documents and custom fields can be added or updated later from the student's profile page.
            Click <strong className="text-slate-200">Save Student</strong> to create the record.
          </p>
        </div>
      </div>
    </div>
  )
}
