import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Plus, Trash2, CheckCircle2, Printer, ChevronRight, ChevronLeft } from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'
import type {
  CollectPaymentDto,
  PaymentMethod,
  PaymentLineItem,
  PaymentRecord,
  FeeType,
} from '../types'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  FEE_TYPE_LABELS,
  MONTH_NAMES,
  formatCurrency,
} from '../types'
import { useFeeStructures } from '../hooks/useFeeStructures'
import { useCollectFee } from '../hooks/usePayments'
import { printInvoice } from '../utils/printInvoice'

const studentStore = createStore<Student>('students')

const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]

interface Props {
  open: boolean
  preselectedStudent?: Student | null
  onClose: () => void
}

interface DraftLineItem {
  id: string
  fee_type: FeeType
  label: string
  amount: string
  month: string
  year: string
}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

function blankLineItem(): DraftLineItem {
  return {
    id: crypto.randomUUID(),
    fee_type: 'TUITION',
    label: 'Tuition Fee',
    amount: '',
    month: String(currentMonth),
    year: String(currentYear),
  }
}

export function CollectFeeModal({ open, preselectedStudent, onClose }: Props) {
  const [step, setStep] = useState(1) // 1: Student, 2: Fees, 3: Payment
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([blankLineItem()])
  const [discountAmount, setDiscountAmount] = useState('')
  const [waiverReason, setWaiverReason] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [transactionId, setTransactionId] = useState('')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [lastRecord, setLastRecord] = useState<PaymentRecord | null>(null)
  const [successStep, setSuccessStep] = useState(false)

  const collectFee = useCollectFee()
  const { data: structures = [] } = useFeeStructures()

  // Search students
  const studentResults = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q || q.length < 2) return []
    return studentStore
      .getWhere(s =>
        s.status === 'ACTIVE' && (
          s.fullNameEn.toLowerCase().includes(q) ||
          s.fullNameBn?.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q)
        )
      )
      .slice(0, 8)
  }, [search])

  // Load fee structure when student selected
  useEffect(() => {
    if (!selectedStudent) return
    const struct = structures.find(s =>
      s.target_type === 'CLASS' &&
      s.class_id === selectedStudent.classId &&
      s.is_active
    )
    if (struct && struct.fee_items.length > 0) {
      setLineItems(
        struct.fee_items.map(fi => ({
          id: crypto.randomUUID(),
          fee_type: fi.fee_type,
          label: fi.label,
          amount: String(fi.amount),
          month: String(currentMonth),
          year: String(currentYear),
        }))
      )
    } else {
      setLineItems([blankLineItem()])
    }
  }, [selectedStudent?.id])

  // Preselect student
  useEffect(() => {
    if (open && preselectedStudent) {
      setSelectedStudent(preselectedStudent)
      setStep(2)
    }
  }, [open, preselectedStudent])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1)
      setSearch('')
      setSelectedStudent(null)
      setLineItems([blankLineItem()])
      setDiscountAmount('')
      setWaiverReason('')
      setPaymentMethod('CASH')
      setTransactionId('')
      setPaidAt(new Date().toISOString().split('T')[0])
      setNote('')
      setSuccessStep(false)
      setLastRecord(null)
    }
  }, [open])

  const updateItem = (id: string, patch: Partial<DraftLineItem>) =>
    setLineItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))

  const removeItem = (id: string) =>
    setLineItems(prev => prev.filter(it => it.id !== id))

  const subtotal = lineItems.reduce((s, it) => s + (Number(it.amount) || 0), 0)
  const discount = Number(discountAmount) || 0
  const totalAmount = Math.max(0, subtotal - discount)

  const handleSubmit = () => {
    if (!selectedStudent) return

    const struct = structures.find(s =>
      s.target_type === 'CLASS' && s.class_id === selectedStudent.classId && s.is_active
    )

    const dto: CollectPaymentDto = {
      student_id: selectedStudent.id,
      student_name: selectedStudent.fullNameEn,
      roll_number: selectedStudent.rollNumber,
      class_id: selectedStudent.classId,
      class_name: selectedStudent.className,
      fee_structure_id: struct?.id,
      items: lineItems.map<PaymentLineItem>(it => ({
        fee_type: it.fee_type,
        label: it.label,
        amount: Number(it.amount) || 0,
        month: it.month ? Number(it.month) : null,
        year: it.year ? Number(it.year) : null,
      })),
      discount_amount: discount,
      waiver_reason: waiverReason || undefined,
      payment_method: paymentMethod,
      transaction_id: transactionId || undefined,
      paid_at: paidAt,
      note: note || undefined,
    }

    collectFee.mutate(dto, {
      onSuccess: (record) => {
        setLastRecord(record)
        setSuccessStep(true)
      },
    })
  }

  if (!open) return null

  const STEPS = ['Student', 'Fee Items', 'Payment']

  // ── Success Screen ───────────────────────────────────────────────────────────
  if (successStep && lastRecord) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white border border-zinc-100 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-1">Payment Collected!</h3>
          <p className="text-zinc-600 text-sm mb-1">{lastRecord.student_name}</p>
          <p className="text-xs text-zinc-600 mb-4">{lastRecord.invoice_number}</p>
          <p className="text-3xl font-black text-emerald-400 mb-6">{formatCurrency(lastRecord.total_amount)}</p>
          <div className="flex gap-3">
            <button
              onClick={() => printInvoice(lastRecord)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all text-sm font-medium"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-slate-600 text-zinc-800 text-sm font-medium transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    , document.body
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-100 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Collect Fee</h3>
            {selectedStudent && (
              <p className="text-xs text-emerald-400 mt-0.5">{selectedStudent.fullNameEn} · Roll {selectedStudent.rollNumber}</p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-6 py-3 border-b border-zinc-100 gap-2 flex-shrink-0">
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const isActive = step === stepNum
            const isDone = step > stepNum
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  isDone ? 'bg-emerald-600 border-emerald-600 text-white' :
                  isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                  'border-zinc-100 text-zinc-800'
                }`}>
                  {isDone ? '✓' : stepNum}
                </div>
                <span className={`text-xs ${isActive ? 'text-zinc-800' : isDone ? 'text-emerald-400' : 'text-zinc-800'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-zinc-100 mx-1" />}
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Step 1: Student ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Search Student</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Name, Roll No, or Student ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Results */}
              {studentResults.length > 0 && (
                <div className="space-y-1.5">
                  {studentResults.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedStudent(s); setSearch('') }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-50 hover:bg-white border border-zinc-100 hover:border-emerald-500/30 rounded-xl text-left transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm flex-shrink-0">
                        {s.fullNameEn.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800">{s.fullNameEn}</p>
                        <p className="text-xs text-zinc-600">Roll {s.rollNumber} · {s.className ?? s.classId}</p>
                      </div>
                      <ChevronRight size={14} className="text-zinc-800" />
                    </button>
                  ))}
                </div>
              )}

              {search.length >= 2 && studentResults.length === 0 && (
                <p className="text-center text-zinc-800 text-sm py-6">No active students found</p>
              )}

              {selectedStudent && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
                    {selectedStudent.fullNameEn.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-300">{selectedStudent.fullNameEn}</p>
                    <p className="text-xs text-emerald-500">Roll {selectedStudent.rollNumber} · {selectedStudent.className ?? selectedStudent.classId}</p>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Fee Items ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-600">Fee items for this invoice</p>
                <button
                  onClick={() => setLineItems(prev => [...prev, blankLineItem()])}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, idx) => (
                  <div key={item.id} className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-600">Item {idx + 1}</span>
                      {lineItems.length > 1 && (
                        <button onClick={() => removeItem(item.id)} className="text-zinc-800 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-600 mb-1">Fee Type</label>
                        <select
                          value={item.fee_type}
                          onChange={e => updateItem(item.id, {
                            fee_type: e.target.value as FeeType,
                            label: FEE_TYPE_LABELS[e.target.value as FeeType],
                          })}
                          className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                          {(Object.keys(FEE_TYPE_LABELS) as FeeType[]).map(k => (
                            <option key={k} value={k}>{FEE_TYPE_LABELS[k]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-600 mb-1">Amount (৳)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.amount}
                          onChange={e => updateItem(item.id, { amount: e.target.value })}
                          placeholder="0"
                          className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-zinc-600 mb-1">Label</label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={e => updateItem(item.id, { label: e.target.value })}
                          className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-600 mb-1">Month</label>
                        <select
                          value={item.month}
                          onChange={e => updateItem(item.id, { month: e.target.value })}
                          className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">—</option>
                          {MONTH_NAMES.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-600 mb-1">Year</label>
                        <input
                          type="number"
                          value={item.year}
                          onChange={e => updateItem(item.id, { year: e.target.value })}
                          placeholder={String(currentYear)}
                          className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount / Waiver */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-amber-300">Discount / Waiver (optional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1">Discount Amount (৳)</label>
                    <input
                      type="number"
                      min={0}
                      max={subtotal}
                      value={discountAmount}
                      onChange={e => setDiscountAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1">Reason</label>
                    <input
                      type="text"
                      value={waiverReason}
                      onChange={e => setWaiverReason(e.target.value)}
                      placeholder="e.g. Merit scholarship"
                      className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Discount</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-emerald-400 pt-1 border-t border-zinc-100">
                  <span>Total Payable</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment Method ───────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-2">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-zinc-100 text-zinc-600 hover:border-zinc-100'
                      }`}
                    >
                      <span className="text-base">{PAYMENT_METHOD_ICONS[method]}</span>
                      {PAYMENT_METHOD_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'CASH' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. BKD2026XXXX"
                    className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Payment Date</label>
                <input
                  type="date"
                  value={paidAt}
                  onChange={e => setPaidAt(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Note (optional)</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Any additional remarks..."
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Final Summary */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold mb-2">Confirm Payment</p>
                <div className="space-y-1 text-xs text-zinc-800">
                  <div className="flex justify-between"><span>Student</span><span className="font-medium">{selectedStudent?.fullNameEn}</span></div>
                  <div className="flex justify-between"><span>Items</span><span>{lineItems.length} item(s)</span></div>
                  <div className="flex justify-between"><span>Method</span><span>{PAYMENT_METHOD_ICONS[paymentMethod]} {PAYMENT_METHOD_LABELS[paymentMethod]}</span></div>
                  <div className="flex justify-between pt-1 border-t border-emerald-500/20 text-base font-black text-emerald-400">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-zinc-600 hover:text-white border border-zinc-100 hover:border-zinc-100 transition-all"
          >
            <ChevronLeft size={15} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && !selectedStudent) ||
                (step === 2 && (lineItems.length === 0 || lineItems.some(it => !it.amount || Number(it.amount) <= 0)))
              }
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={collectFee.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold transition-all"
            >
              <CheckCircle2 size={15} />
              {collectFee.isPending ? 'Processing...' : 'Confirm & Collect'}
            </button>
          )}
        </div>
      </div>
    </div>
  , document.body
  )
}
