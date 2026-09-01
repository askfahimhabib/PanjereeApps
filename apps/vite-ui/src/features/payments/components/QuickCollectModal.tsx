import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Zap,
  Receipt,
  MessageCircle,
  Users,
} from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'
import type {
  PaymentMethod,
  FeeType,
  PaymentRecord,
} from '../types'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  FEE_TYPE_LABELS,
  MONTH_NAMES_SHORT,
  formatCurrency,
} from '../types'
import { useFeeStructures } from '../hooks/useFeeStructures'
import { useCollectFee, useManualDues } from '../hooks/usePayments'
import { useStudentWaivers } from '../hooks/useBillingAndWaivers'
import { printInvoice, generateReceiptSmsText } from '../utils/printInvoice'

const studentStore = createStore<Student>('students')
const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]

interface QuickCollectModalProps {
  open: boolean
  preselectedStudent?: Student | null
  onClose: () => void
  onSuccess?: (payment: PaymentRecord) => void
}

interface DraftLineItem {
  id: string
  fee_type: FeeType
  label: string
  amount: number
  month: number | null
  year: number | null
}

export function QuickCollectModal({
  open,
  preselectedStudent,
  onClose,
  onSuccess,
}: QuickCollectModalProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('ALL')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [items, setItems] = useState<DraftLineItem[]>([])
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [waiverReason, setWaiverReason] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [transactionId, setTransactionId] = useState('')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  const [successPayment, setSuccessPayment] = useState<PaymentRecord | null>(null)
  const [copiedSms, setCopiedSms] = useState(false)

  const { data: structures = [] } = useFeeStructures()
  const { data: allDues = [] } = useManualDues()
  const { data: allWaivers = [] } = useStudentWaivers()
  const collectFee = useCollectFee()

  // All active students for lookup
  const activeStudents = useMemo(() => {
    return studentStore.getWhere(s => s.status === 'ACTIVE')
  }, [open])

  // Filtered students for quick picker
  const filteredStudents = useMemo(() => {
    return activeStudents.filter(s => {
      if (filterClass !== 'ALL' && s.classId !== filterClass) return false
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        return (
          s.fullNameEn.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          (s.studentId && s.studentId.toLowerCase().includes(q)) ||
          (s.mobile && s.mobile.includes(q)) ||
          (s.className && s.className.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [activeStudents, filterClass, search])

  // Active student dues
  const studentDues = useMemo(() => {
    if (!selectedStudent) return []
    return allDues.filter(d => d.student_id === selectedStudent.id && !d.is_paid)
  }, [selectedStudent, allDues])

  // Active student waiver
  const studentWaiver = useMemo(() => {
    if (!selectedStudent) return null
    return allWaivers.find(w => w.student_id === selectedStudent.id && w.is_active) || null
  }, [selectedStudent, allWaivers])

  // Applicable fee structure for class
  const classStructure = useMemo(() => {
    if (!selectedStudent) return null
    return structures.find(
      s => s.target_type === 'CLASS' && s.class_id === selectedStudent.classId && s.is_active
    ) || null
  }, [selectedStudent, structures])

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setSearch('')

    // Check if student has active dues
    const dues = allDues.filter(d => d.student_id === student.id && !d.is_paid)

    if (dues.length > 0) {
      // Auto-load unpaid dues
      setItems(
        dues.map(d => ({
          id: d.id,
          fee_type: d.fee_type,
          label: d.label,
          amount: d.amount,
          month: d.month,
          year: d.year,
        }))
      )
    } else {
      // Load current month structure or default tuition
      const struct = structures.find(s => s.class_id === student.classId && s.is_active)
      if (struct && struct.fee_items.length > 0) {
        setItems(
          struct.fee_items.map(it => ({
            id: crypto.randomUUID(),
            fee_type: it.fee_type,
            label: it.label,
            amount: it.amount,
            month: it.frequency === 'MONTHLY' ? currentMonth : null,
            year: currentYear,
          }))
        )
      } else {
        setItems([
          {
            id: crypto.randomUUID(),
            fee_type: 'TUITION',
            label: `Monthly Tuition Fee (${MONTH_NAMES_SHORT[currentMonth - 1]})`,
            amount: 1500,
            month: currentMonth,
            year: currentYear,
          },
        ])
      }
    }

    // Auto calculate waiver if present
    const waiver = allWaivers.find(w => w.student_id === student.id && w.is_active)
    if (waiver) {
      setWaiverReason(waiver.reason)
      if (waiver.waiver_type === 'PERCENTAGE') {
        const tuitionTotal = (dues.length > 0 ? dues : []).reduce(
          (s, d) => (d.fee_type === 'TUITION' || waiver.fee_type === 'ALL' ? s + d.amount : s),
          0
        ) || 1500
        setDiscountAmount(Math.round((tuitionTotal * waiver.value) / 100))
      } else {
        setDiscountAmount(waiver.value)
      }
    } else {
      setDiscountAmount(0)
      setWaiverReason('')
    }
  }

  // Handle preselected student or initial load
  useEffect(() => {
    if (open) {
      setSuccessPayment(null)
      if (preselectedStudent) {
        handleSelectStudent(preselectedStudent)
      } else {
        setSelectedStudent(null)
        setSearch('')
        setFilterClass('ALL')
        setItems([])
        setDiscountAmount(0)
        setWaiverReason('')
      }
    }
  }, [open, preselectedStudent])

  // Add line item
  const handleAddItem = (fee_type: FeeType = 'TUITION', customLabel?: string, amount = 1000) => {
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        fee_type,
        label: customLabel || `${FEE_TYPE_LABELS[fee_type]} (${MONTH_NAMES_SHORT[currentMonth - 1]})`,
        amount,
        month: currentMonth,
        year: currentYear,
      },
    ])
  }

  // Remove line item
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  // Update line item
  const handleUpdateItem = (id: string, field: keyof DraftLineItem, val: unknown) => {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, [field]: val } : it))
    )
  }

  const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
  const totalPayable = Math.max(0, subtotal - (Number(discountAmount) || 0))

  // Submit payment
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    if (items.length === 0) {
      alert('Please add at least one fee item.')
      return
    }

    const payload = {
      student_id: selectedStudent.id,
      student_name: selectedStudent.fullNameEn,
      roll_number: selectedStudent.rollNumber,
      class_id: selectedStudent.classId,
      batch_id: selectedStudent.batchId,
      class_name: selectedStudent.className,
      fee_structure_id: classStructure?.id,
      items: items.map(it => ({
        fee_type: it.fee_type,
        label: it.label,
        amount: Number(it.amount),
        month: it.month ? Number(it.month) : null,
        year: it.year ? Number(it.year) : null,
      })),
      discount_amount: Number(discountAmount) || 0,
      waiver_reason: waiverReason || undefined,
      payment_method: paymentMethod,
      transaction_id: transactionId || undefined,
      paid_at: new Date(paidAt).toISOString(),
      note: note || undefined,
    }

    collectFee.mutate(payload, {
      onSuccess: (saved) => {
        setSuccessPayment(saved)
        onSuccess?.(saved)
      },
      onError: (err: unknown) => {
        alert(err instanceof Error ? err.message : 'Payment collection failed.')
      }
    })
  }

  const handleCopySms = () => {
    if (!successPayment) return
    const text = generateReceiptSmsText(successPayment)
    navigator.clipboard.writeText(text)
    setCopiedSms(true)
    setTimeout(() => setCopiedSms(false), 2500)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 via-zinc-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-zinc-900 text-base">Quick Fee Collection Counter</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  POS Mode
                </span>
              </div>
              <p className="text-xs text-zinc-500">Fast 3-second student fee collection & dual-receipt printer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Modal View */}
        {successPayment ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Payment Collected Successfully!</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Receipt <strong>{successPayment.invoice_number}</strong> generated for {successPayment.student_name}
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-3">
                {formatCurrency(successPayment.total_amount)}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
              <button
                onClick={() => printInvoice(successPayment, 'DUAL_A4')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
              >
                <Printer size={15} />
                Print Dual Copy (A4)
              </button>

              <button
                onClick={() => printInvoice(successPayment, 'POS_80MM')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <Receipt size={15} />
                POS Slip (80mm)
              </button>

              <button
                onClick={handleCopySms}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all cursor-pointer"
              >
                {copiedSms ? <CheckCircle2 size={15} /> : <MessageCircle size={15} />}
                {copiedSms ? 'Copied SMS!' : 'Copy WhatsApp SMS'}
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setSuccessPayment(null)
                  setSelectedStudent(null)
                  setItems([])
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
              >
                + Collect Next Student Fee
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Close Counter
              </button>
            </div>
          </div>
        ) : (
          /* Collection Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
            {/* Step 1: Student Lookup & Quick Picker */}
            <div>
              <label className="block font-bold text-zinc-700 mb-1.5">
                Select Student (Roll / Name / Mobile / Class) <span className="text-red-500">*</span>
              </label>

              {!selectedStudent ? (
                <div className="space-y-2.5">
                  {/* Search Bar & Class Filter */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roll (e.g. 01), name, mobile..."
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                      />
                    </div>

                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-semibold text-zinc-800"
                    >
                      <option value="ALL">All Classes</option>
                      <option value="cls-6">Class 6</option>
                      <option value="cls-7">Class 7</option>
                      <option value="cls-8">Class 8</option>
                      <option value="cls-9">Class 9</option>
                      <option value="cls-10">Class 10</option>
                    </select>
                  </div>

                  {/* Quick Student Grid List */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-2 max-h-52 overflow-y-auto divide-y divide-zinc-100">
                    {filteredStudents.length === 0 ? (
                      <div className="p-6 text-center text-zinc-400">
                        <Users size={24} className="mx-auto mb-1 opacity-40" />
                        <p className="font-semibold text-xs">No active students found matching search</p>
                      </div>
                    ) : (
                      filteredStudents.slice(0, 10).map((s) => {
                        const sDues = allDues.filter(d => d.student_id === s.id && !d.is_paid)
                        const dueAmount = sDues.reduce((sum, d) => sum + d.amount, 0)

                        return (
                          <div
                            key={s.id}
                            onClick={() => handleSelectStudent(s)}
                            className="p-2.5 hover:bg-emerald-50/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                {s.rollNumber}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-900 group-hover:text-emerald-800">{s.fullNameEn}</p>
                                <p className="text-[11px] text-zinc-500">
                                  {s.className || 'Class'} {s.sectionName ? `• Sec ${s.sectionName}` : ''} • Mob: {s.mobile || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              {dueAmount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                  Due: {formatCurrency(dueAmount)}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Select ↵
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* Selected Student Profile Banner */
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-zinc-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      {selectedStudent.rollNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-900 text-sm">{selectedStudent.fullNameEn}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                          {selectedStudent.className}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        ID: <span className="font-mono text-zinc-700">{selectedStudent.id}</span>
                        {selectedStudent.sectionName && ` • Sec ${selectedStudent.sectionName}`}
                        {studentWaiver && (
                          <span className="ml-2 px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                            🎁 {studentWaiver.waiver_type === 'PERCENTAGE' ? `${studentWaiver.value}% Waiver` : `৳${studentWaiver.value} Off`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null)
                      setItems([])
                    }}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:underline cursor-pointer"
                  >
                    Change Student
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Line Items & Dues */}
            {selectedStudent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 text-xs">Fee Particulars & Line Items</span>

                  <div className="flex items-center gap-2">
                    {studentDues.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setItems(
                            studentDues.map(d => ({
                              id: d.id,
                              fee_type: d.fee_type,
                              label: d.label,
                              amount: d.amount,
                              month: d.month,
                              year: d.year,
                            }))
                          )
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        ⚡ Load {studentDues.length} Backlog Dues
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddItem('TUITION')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Fee Item
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="px-3 py-2">Item / Purpose</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2 text-center">Month</th>
                        <th className="px-3 py-2 text-right">Amount (৳)</th>
                        <th className="px-2 py-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {items.map((it) => (
                        <tr key={it.id} className="hover:bg-zinc-50/70">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              required
                              value={it.label}
                              onChange={(e) => handleUpdateItem(it.id, 'label', e.target.value)}
                              className="w-full px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={it.fee_type}
                              onChange={(e) => handleUpdateItem(it.id, 'fee_type', e.target.value as FeeType)}
                              className="px-2 py-1 border border-zinc-200 rounded-lg text-[11px] bg-white"
                            >
                              {Object.entries(FEE_TYPE_LABELS).map(([k, lbl]) => (
                                <option key={k} value={k}>
                                  {lbl}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <select
                              value={it.month || ''}
                              onChange={(e) => handleUpdateItem(it.id, 'month', e.target.value ? Number(e.target.value) : null)}
                              className="px-2 py-1 border border-zinc-200 rounded-lg text-[11px] bg-white text-center"
                            >
                              <option value="">N/A</option>
                              {MONTH_NAMES_SHORT.map((mName, i) => (
                                <option key={mName} value={i + 1}>
                                  {mName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              required
                              min={0}
                              value={it.amount}
                              onChange={(e) => handleUpdateItem(it.id, 'amount', Number(e.target.value))}
                              className="w-24 px-2 py-1 border border-zinc-200 rounded-lg text-xs font-mono font-bold text-right bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.id)}
                              className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary Bar */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-2.5">
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Subtotal Items</span>
                    <span className="font-mono font-bold text-zinc-800">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-rose-600">
                    <div className="flex items-center gap-2">
                      <span>Waiver / Discount</span>
                      <input
                        type="text"
                        value={waiverReason}
                        onChange={(e) => setWaiverReason(e.target.value)}
                        placeholder="Reason (e.g. Merit, Sibling)..."
                        className="px-2 py-0.5 border border-zinc-200 rounded text-[11px] bg-white w-44"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>- ৳</span>
                      <input
                        type="number"
                        min={0}
                        max={subtotal}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-right border border-rose-200 rounded-lg bg-white text-xs font-mono font-bold text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-200 pt-2 text-sm font-bold text-zinc-900">
                    <span>Net Amount to Collect</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">
                      {formatCurrency(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Payment Method & Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-xs text-zinc-800"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {PAYMENT_METHOD_ICONS[m]} {PAYMENT_METHOD_LABELS[m]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paidAt}
                      onChange={(e) => setPaidAt(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-medium"
                    />
                  </div>

                  {paymentMethod !== 'CASH' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-zinc-700 mb-1">Transaction ID / TrxID (Optional)</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 9N39K109A2"
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-zinc-700 mb-1">Remarks / Counter Note</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Paid at counter by student's father"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={collectFee.isPending || items.length === 0}
                    className="flex-1 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {collectFee.isPending ? 'Processing...' : `Confirm & Collect ${formatCurrency(totalPayable)}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
