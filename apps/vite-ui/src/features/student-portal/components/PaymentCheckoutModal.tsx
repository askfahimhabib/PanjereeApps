import { useState } from 'react'
import {
  X,
  CheckCircle2,
  Copy,
  Printer,
  ArrowRight,
  Banknote,
} from 'lucide-react'
import { paymentStore, manualDueStore, financeTransactionStore } from '@/data/stores'
import type { PaymentChannel } from '../types'
import type { PaymentRecord } from '@/features/payments/types'
import type { FinanceTransaction, FinancePaymentMethod } from '@/features/finance/types'
import { getInstitutionInfo } from '@/lib/institutionInfo'
import { printInvoice } from '@/features/payments/utils/printInvoice'

interface PaymentCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: string
  studentName: string
  studentRoll: string
  classId?: string | null
  batchId?: string | null
  className?: string
  dueAmount: number
  feeTitle?: string
  onSuccess?: () => void
}

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentRoll,
  classId,
  batchId,
  className,
  dueAmount,
  feeTitle = 'Tuition & Academic Fee',
  onSuccess,
}: PaymentCheckoutModalProps) {
  const inst = getInstitutionInfo()
  const [channel, setChannel] = useState<PaymentChannel>('BKASH')
  const [payAmount, setPayAmount] = useState<number>(dueAmount > 0 ? dueAmount : 1500)
  const [senderNumber, setSenderNumber] = useState('01712-345678')
  const [trxId, setTrxId] = useState('')
  const [cashNote, setCashNote] = useState('Accounts Counter Room 102')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successReceipt, setSuccessReceipt] = useState<PaymentRecord | null>(null)
  const [, setCopiedText] = useState(false)

  // Keep payAmount in sync if dueAmount changes
  useState(() => {
    if (dueAmount > 0) setPayAmount(dueAmount)
  })

  if (!isOpen) return null

  const handlePayNow = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      const generatedTrx =
        channel === 'CASH'
          ? `CASH-REC-${Math.floor(100000 + Math.random() * 900000)}`
          : trxId || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      const invoiceNum = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`
      const paymentDate = new Date().toISOString()
      const dateObj = new Date(paymentDate)
      const numAmount = Number(payAmount)

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        invoice_number: invoiceNum,
        student_id: studentId,
        student_name: studentName,
        roll_number: studentRoll,
        class_id: classId || null,
        batch_id: batchId || null,
        class_name: className || 'Class 10',
        fee_structure_id: null,
        items: [
          {
            fee_type: 'TUITION',
            label: feeTitle,
            amount: numAmount,
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear(),
          },
        ],
        subtotal: numAmount,
        discount_amount: 0,
        waiver_reason: null,
        total_amount: numAmount,
        payment_method: channel === 'CASH' ? 'CASH' : channel === 'BKASH' ? 'BKASH' : channel === 'NAGAD' ? 'NAGAD' : 'OTHER',
        transaction_id: generatedTrx,
        paid_at: paymentDate,
        collected_by: channel === 'CASH' ? 'Accounts Desk (In-Person)' : 'Student Portal Payment Gateway',
        note: channel === 'CASH' ? `Office Cash Deposit: ${cashNote}` : `Online student checkout via ${channel}`,
        status: 'PAID',
        created_at: paymentDate,
        updated_at: paymentDate,
      }

      // 1. Add to central payment store
      paymentStore.insert(newPayment)

      // 2. Add to central finance transactions (ensures Admin Finance Overview & Cash Register includes this revenue)
      const finTx: FinanceTransaction = {
        id: crypto.randomUUID(),
        type: 'INCOME',
        category: 'STUDENT_FEE',
        title: `Student Portal Fee: ${feeTitle} - ${studentName}`,
        amount: numAmount,
        date: paymentDate.split('T')[0],
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
        payment_method: (channel === 'CASH' ? 'CASH' : channel === 'BKASH' ? 'BKASH' : channel === 'NAGAD' ? 'NAGAD' : 'OTHER') as FinancePaymentMethod,
        reference_id: newPayment.id,
        reference_type: 'PAYMENT',
        invoice_no: invoiceNum,
        party_name: studentName,
        party_id: studentId,
        party_role: `Student (Roll ${studentRoll}${className ? `, ${className}` : ''})`,
        notes: `Online Checkout via ${channel}`,
        created_at: paymentDate,
      }
      financeTransactionStore.insert(finTx)

      // 3. Clear unpaid dues accurately based on the paid amount
      let remainingCredit = numAmount
      const unpaidDues = manualDueStore.getAll().filter((d) => d.student_id === studentId && !d.is_paid)
      for (const due of unpaidDues) {
        if (remainingCredit <= 0) break
        if (remainingCredit >= due.amount) {
          // Full payment of this due line
          remainingCredit -= due.amount
          manualDueStore.update(due.id, {
            is_paid: true,
            paid_payment_id: newPayment.id,
            updated_at: new Date().toISOString(),
          })
        } else {
          // Partial payment: deduct from due amount
          const updatedDueAmount = due.amount - remainingCredit
          remainingCredit = 0
          manualDueStore.update(due.id, {
            amount: updatedDueAmount,
            updated_at: new Date().toISOString(),
          })
        }
      }

      setIsSubmitting(false)
      setSuccessReceipt(newPayment)
      if (onSuccess) onSuccess()
    }, 800)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              ৳
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
                {successReceipt ? 'Payment Receipt & Voucher' : 'Fee Payment & Checkout'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {studentName} (Roll: {studentRoll})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {successReceipt ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                {successReceipt.payment_method === 'CASH' ? 'Cash Voucher Generated!' : 'Payment Completed Successfully!'}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {successReceipt.payment_method === 'CASH'
                  ? 'Office accounts token recorded. Please retain this receipt for verification.'
                  : 'Your fee has been verified and updated in institutional records.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500">Invoice No:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{successReceipt.invoice_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500">Transaction / Token:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{successReceipt.transaction_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500">Amount Paid:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">৳{successReceipt.total_amount.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500">Method:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {successReceipt.payment_method === 'CASH' ? '💵 In-Cash (Office Desk)' : successReceipt.payment_method}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Date & Time:</span>
                <span className="text-zinc-700 dark:text-zinc-300">{new Date().toLocaleString('en-GB')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => successReceipt && printInvoice(successReceipt)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-medium text-xs transition-colors"
              >
                <Printer size={15} />
                Print Voucher
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount details */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
              <div>
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 block">{feeTitle}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Class: {className || 'Class 10'}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Total Payable</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳{payAmount.toLocaleString()} BDT
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Including In-Cash!) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Select Payment Channel / মাধ্যম নির্বাচন করুন
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('BKASH')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-medium ${
                    channel === 'BKASH'
                      ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-sm">🌸</span>
                  bKash
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('NAGAD')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-medium ${
                    channel === 'NAGAD'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-sm">⚡</span>
                  Nagad
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('ROCKET')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-medium ${
                    channel === 'ROCKET'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-sm">🚀</span>
                  Rocket
                </button>

                {/* USER EXPLICIT REQUEST: "in cash o rakho" */}
                <button
                  type="button"
                  onClick={() => setChannel('CASH')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-medium ${
                    channel === 'CASH'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs ring-1 ring-emerald-500'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Banknote size={18} className="text-emerald-500 mb-0.5" />
                  In Cash
                </button>
              </div>
            </div>

            {/* Dynamic Details based on Channel */}
            {channel === 'CASH' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <Banknote className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      অফিস কাউন্টারে সরাসরি ক্যাশ পেমেন্ট (Pay In-Cash)
                    </h4>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                      প্রতিষ্ঠানের হিসাব শাখা / ক্যাশ কাউন্টারে সরাসরি টাকা জমা দিয়ে এই ভাউচার বা মানি রিসিটটি সিল করিয়ে নিন।
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                    Cash Deposit Note / কাউন্টার বিবরণ:
                  </label>
                  <input
                    type="text"
                    value={cashNote}
                    onChange={(e) => setCashNote(e.target.value)}
                    placeholder="e.g. Accounts Desk Room 102"
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const merchantNumber = channel === 'BKASH' ? (inst.merchantBkash || '01711-000000') : channel === 'NAGAD' ? (inst.merchantNagad || '01811-000000') : (inst.phone || '01700-112233')
                  const cleanMerchant = merchantNumber.replace(/[^0-9]/g, '')
                  return (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                        <span>Merchant/Agent Wallet ({channel}):</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-zinc-900 dark:text-white">{merchantNumber}</span>
                          <button
                            onClick={() => handleCopy(cleanMerchant)}
                            className="text-zinc-400 hover:text-emerald-500 transition-colors"
                            title="Copy Number"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Send Money / Payment reference: <span className="font-bold text-emerald-600">{studentRoll}</span>
                      </p>
                    </div>
                  )
                })()}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                      Sender Mobile / প্রেরক নম্বর
                    </label>
                    <input
                      type="text"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. 9J2K1L8M"
                      className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-100 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                channel === 'CASH'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : channel === 'BKASH'
                  ? 'bg-pink-600 hover:bg-pink-700'
                  : channel === 'NAGAD'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <span>
                    {channel === 'CASH' ? 'Confirm In-Cash Deposit' : `Pay ৳${payAmount.toLocaleString()} via ${channel}`}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
