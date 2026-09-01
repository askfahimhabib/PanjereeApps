import { useState } from 'react'
import { AlertTriangle, Plus, Trash2, DollarSign, Check } from 'lucide-react'
import type { FeeType, CreateManualDueDto } from '../types'
import { FEE_TYPE_LABELS, FEE_TYPE_ICONS, MONTH_NAMES, formatCurrency } from '../types'
import { useManualDues, useCreateManualDue, useDeleteManualDue } from '../hooks/usePayments'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'

const studentStore = createStore<Student>('students')
const currentYear = new Date().getFullYear()

interface AddDueFormState {
  student_id: string
  fee_type: FeeType
  label: string
  amount: string
  month: string
  year: string
  due_date: string
  note: string
}

const emptyForm = (): AddDueFormState => ({
  student_id: '',
  fee_type: 'TUITION',
  label: 'Tuition Fee',
  amount: '',
  month: String(new Date().getMonth() + 1),
  year: String(currentYear),
  due_date: '',
  note: '',
})

interface Props {
  onCollect: (student: Student) => void
}

export function DueStudentsList({ onCollect }: Props) {
  const { data: dues = [], isLoading } = useManualDues()
  const createDue = useCreateManualDue()
  const deleteDue = useDeleteManualDue()

  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<AddDueFormState>(emptyForm())
  const [studentSearch, setStudentSearch] = useState('')

  const setF = <K extends keyof AddDueFormState>(k: K, v: AddDueFormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const studentResults = studentSearch.length >= 2
    ? studentStore.getWhere(s =>
        s.status === 'ACTIVE' && (
          s.fullNameEn.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
        )
      ).slice(0, 5)
    : []

  const selectedStudent = form.student_id
    ? studentStore.getOne(form.student_id)
    : null

  const handleAddDue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    const dto: CreateManualDueDto = {
      student_id: selectedStudent.id,
      student_name: selectedStudent.fullNameEn,
      roll_number: selectedStudent.rollNumber,
      class_id: selectedStudent.classId,
      class_name: selectedStudent.className,
      fee_type: form.fee_type,
      label: form.label,
      amount: Number(form.amount),
      month: form.month ? Number(form.month) : undefined,
      year: form.year ? Number(form.year) : undefined,
      due_date: form.due_date || undefined,
      note: form.note || undefined,
    }
    createDue.mutate(dto, {
      onSuccess: () => {
        setForm(emptyForm())
        setStudentSearch('')
        setShowAddForm(false)
      },
    })
  }

  const unpaidDues = dues.filter(d => !d.is_paid)
  const paidDues = dues.filter(d => d.is_paid)

  const getStudent = (studentId: string) => studentStore.getOne(studentId)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-400" />
          <span className="text-sm font-semibold text-zinc-800">
            Manual Dues
            <span className="ml-2 text-xs text-rose-400 font-normal">({unpaidDues.length} unpaid)</span>
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
        >
          <Plus size={13} /> Add Due Entry
        </button>
      </div>

      {/* Add Due Form */}
      {showAddForm && (
        <form onSubmit={handleAddDue} className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-800">Add Manual Due Entry</p>

          {/* Student Search */}
          <div>
            <label className="block text-[10px] text-zinc-600 mb-1">Student *</label>
            <input
              type="text"
              placeholder="Search by name or roll..."
              value={selectedStudent ? selectedStudent.fullNameEn : studentSearch}
              onChange={e => {
                setStudentSearch(e.target.value)
                if (form.student_id) setF('student_id', '')
              }}
              className="w-full bg-white border border-zinc-100 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
            />
            {studentResults.length > 0 && !form.student_id && (
              <div className="mt-1 border border-zinc-100 rounded-md overflow-hidden">
                {studentResults.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setF('student_id', s.id); setStudentSearch('') }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-800 hover:bg-zinc-50 text-left transition-colors"
                  >
                    <span className="font-medium">{s.fullNameEn}</span>
                    <span className="text-zinc-600">Roll {s.rollNumber} · {s.className}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Fee Type</label>
              <select
                value={form.fee_type}
                onChange={e => setF('fee_type', e.target.value as FeeType)}
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              >
                {(Object.keys(FEE_TYPE_LABELS) as FeeType[]).map(k => (
                  <option key={k} value={k}>{FEE_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setF('label', e.target.value)}
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Amount (৳) *</label>
              <input
                type="number" min={1} required
                value={form.amount}
                onChange={e => setF('amount', e.target.value)}
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Month</label>
              <select
                value={form.month}
                onChange={e => setF('month', e.target.value)}
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              >
                <option value="">—</option>
                {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={e => setF('year', e.target.value)}
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Due Date (optional)</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setF('due_date', e.target.value)}
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Note</label>
              <input
                type="text"
                value={form.note}
                onChange={e => setF('note', e.target.value)}
                placeholder="Optional..."
                className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 rounded-lg border border-zinc-100 text-zinc-600 text-xs hover:border-zinc-100 transition-all">Cancel</button>
            <button type="submit" disabled={createDue.isPending || !form.student_id || !form.amount}
              className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold transition-all">
              {createDue.isPending ? 'Adding...' : 'Add Due Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Due List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-50 animate-pulse" />
          ))}
        </div>
      ) : unpaidDues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-800">
          <Check size={36} className="mb-2 text-emerald-600/30" />
          <p className="text-sm">No outstanding manual dues</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unpaidDues.map(due => {
            const student = getStudent(due.student_id)
            const periodLabel = due.month ? `${MONTH_NAMES[due.month - 1]}${due.year ? ` ${due.year}` : ''}` : ''
            const isOverdue = due.due_date && new Date(due.due_date) < new Date()
            return (
              <div
                key={due.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  isOverdue
                    ? 'bg-rose-500/5 border-rose-500/20'
                    : 'bg-zinc-50 border-zinc-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 text-sm">
                  {FEE_TYPE_ICONS[due.fee_type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-800 truncate">{due.student_name}</p>
                    <span className="text-[10px] text-zinc-600">Roll {due.roll_number}</span>
                    {isOverdue && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full">Overdue</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">
                    {due.label}{periodLabel ? ` · ${periodLabel}` : ''}
                    {due.note && <span className="text-zinc-800"> · {due.note}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-sm font-bold text-rose-400">{formatCurrency(due.amount)}</p>
                  {student && (
                    <button
                      onClick={() => onCollect(student)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-all"
                    >
                      <DollarSign size={11} /> Collect
                    </button>
                  )}
                  <button
                    onClick={() => deleteDue.mutate(due.id)}
                    className="p-1.5 rounded-lg text-zinc-800 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Remove due entry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paid dues collapsed section */}
      {paidDues.length > 0 && (
        <p className="text-xs text-zinc-800 text-center">
          + {paidDues.length} paid due entr{paidDues.length !== 1 ? 'ies' : 'y'} (hidden)
        </p>
      )}
    </div>
  )
}
