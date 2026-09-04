import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Trash2,
  Search,
  Award,
  CheckCircle2,
  X,
} from 'lucide-react'
import {
  useStudentWaivers,
  useCreateStudentWaiver,
  useDeleteStudentWaiver,
} from '../hooks/useBillingAndWaivers'
import type { FeeType } from '../types'
import { FEE_TYPE_LABELS } from '../types'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'

const studentStore = createStore<Student>('students')

export function StudentWaiversTab() {
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { data: waivers = [], isLoading } = useStudentWaivers()
  const deleteWaiver = useDeleteStudentWaiver()

  const filtered = waivers.filter((w) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      w.student_name.toLowerCase().includes(q) ||
      w.roll_number.toLowerCase().includes(q) ||
      w.reason.toLowerCase().includes(q) ||
      (w.class_name && w.class_name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Award size={20} className="text-amber-400" />
            Student Scholarships & Fee Waivers
          </h3>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Configure permanent merit scholarships, sibling discounts, or special quotas. Discounts are automatically applied during POS fee collection.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> + New Waiver / Scholarship
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, reason..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <span className="text-xs text-zinc-500 font-medium">
          {filtered.length} Active Waiver{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-400">Loading waivers...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <Award size={36} className="mx-auto opacity-30 text-zinc-400" />
              <p className="font-bold text-zinc-700 text-sm">No Student Waivers Found</p>
              <p className="text-xs text-zinc-400">Add merit or sibling scholarships for specific students</p>
            </div>
          ) : (
            <>
              {/* ── Mobile Card List View ── */}
              <div className="block sm:hidden divide-y divide-zinc-100">
                {filtered.map((w) => (
                  <div key={w.id} className="p-3.5 space-y-2.5 hover:bg-zinc-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {w.roll_number}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 text-xs truncate">{w.student_name}</p>
                          <p className="text-[11px] text-zinc-500">{w.class_name || 'Class'}</p>
                        </div>
                      </div>

                      <span className="font-bold text-purple-700 font-mono text-xs bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-lg shrink-0">
                        {w.waiver_type === 'PERCENTAGE' ? `${w.value}% OFF` : `৳ ${w.value.toLocaleString('en-BD')} FLAT`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[10px] font-semibold">
                        {w.fee_type === 'ALL' ? 'All Fee Items' : FEE_TYPE_LABELS[w.fee_type]}
                      </span>
                      {w.reason && (
                        <span className="text-zinc-500 text-[11px] truncate max-w-[180px]">
                          • {w.reason}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100">
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} /> Active
                      </span>

                      <button
                        onClick={() => {
                          if (confirm(`Delete waiver for ${w.student_name}?`)) {
                            deleteWaiver.mutate(w.id)
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Waiver"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop Table View ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-4 py-3">Waiver / Discount</th>
                      <th className="px-4 py-3">Applicable On</th>
                      <th className="px-4 py-3">Scholarship Category / Reason</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filtered.map((w) => (
                      <tr key={w.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                              {w.roll_number}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900">{w.student_name}</p>
                              <p className="text-[11px] text-zinc-500">{w.class_name || 'Class'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-purple-700 font-mono text-sm">
                          {w.waiver_type === 'PERCENTAGE' ? `${w.value}% OFF` : `৳ ${w.value.toLocaleString('en-BD')} FLAT`}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-semibold">
                            {w.fee_type === 'ALL' ? 'All Fee Items' : FEE_TYPE_LABELS[w.fee_type]}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-zinc-700 font-medium">
                          {w.reason}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Delete waiver for ${w.student_name}?`)) {
                                deleteWaiver.mutate(w.id)
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Waiver"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <AddStudentWaiverModal onClose={() => setAddModalOpen(false)} />
      )}
    </div>
  )
}

function AddStudentWaiverModal({ onClose }: { onClose: () => void }) {
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [waiverType, setWaiverType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [value, setValue] = useState<number>(50)
  const [feeType, setFeeType] = useState<FeeType | 'ALL'>('TUITION')
  const [reason, setReason] = useState('Merit Scholarship (Top performer in exam)')

  const createWaiver = useCreateStudentWaiver()

  const studentMatches = studentSearch.length >= 1
    ? studentStore.getWhere(s =>
        s.status === 'ACTIVE' &&
        (s.fullNameEn.toLowerCase().includes(studentSearch.toLowerCase()) ||
         s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()))
      ).slice(0, 5)
    : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    createWaiver.mutate(
      {
        student_id: selectedStudent.id,
        student_name: selectedStudent.fullNameEn,
        roll_number: selectedStudent.rollNumber,
        class_name: selectedStudent.className,
        waiver_type: waiverType,
        value: Number(value),
        fee_type: feeType,
        reason: reason.trim(),
        is_active: true,
      },
      {
        onSuccess: () => onClose(),
      }
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-purple-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Award size={16} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Add Student Waiver / Scholarship</h3>
              <p className="text-[11px] text-zinc-500">Configure recurring fee discounts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Student Selector */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Select Student *</label>
            {!selectedStudent ? (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Type roll or name..."
                  className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
                />
                {studentMatches.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-20 divide-y divide-zinc-100">
                    {studentMatches.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudent(s)
                          setStudentSearch('')
                        }}
                        className="p-2.5 hover:bg-purple-50 cursor-pointer flex justify-between items-center"
                      >
                        <span className="font-bold text-zinc-900">{s.fullNameEn} (Roll {s.rollNumber})</span>
                        <span className="text-[10px] text-zinc-500">{s.className}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900">{selectedStudent.fullNameEn}</p>
                  <p className="text-[11px] text-zinc-500">Roll {selectedStudent.rollNumber} • {selectedStudent.className}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Waiver Type & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Discount Type</label>
              <select
                value={waiverType}
                onChange={(e) => setWaiverType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat Amount (৳)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                {waiverType === 'PERCENTAGE' ? 'Discount Rate (%)' : 'Discount Amount (৳)'} *
              </label>
              <input
                type="number"
                required
                min={1}
                max={waiverType === 'PERCENTAGE' ? 100 : 50000}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Applicable Fee Type */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Applicable On</label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value as FeeType | 'ALL')}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
            >
              <option value="TUITION">Tuition Fee Only</option>
              <option value="ALL">All Fee Items</option>
              <option value="EXAM">Exam Fee Only</option>
              <option value="ADMISSION">Admission Fee</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Reason / Scholarship Category *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Merit scholarship, Sibling discount..."
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWaiver.isPending || !selectedStudent}
              className="flex-1 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Save Waiver
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
