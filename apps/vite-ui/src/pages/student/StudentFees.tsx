import { useState, useMemo } from 'react'
import {
  Wallet,
  CreditCard,
  Printer,
  Clock,
  Receipt,
  Percent,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { paymentStore, manualDueStore } from '@/data/stores'
import { PaymentCheckoutModal } from '@/features/student-portal/components/PaymentCheckoutModal'
import { printInvoice } from '@/features/payments/utils/printInvoice'

export function StudentFees() {
  const { student } = useStudentSession()
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Payments made strictly by this student (Safe against cross-class roll number collisions)
  const studentPayments = useMemo(() => {
    const all = paymentStore.getAll()
    return all.filter((p) => {
      if (p.student_id === student.id) return true
      if (p.roll_number === student.rollNumber) {
        if (student.className && p.class_name && p.class_name.toLowerCase() === student.className.toLowerCase()) return true
        if (student.classId && p.class_id === student.classId) return true
      }
      return false
    })
  }, [student.id, student.rollNumber, student.className, student.classId, refreshKey])

  // Real Dues
  const pendingDues = useMemo(() => {
    const dues = manualDueStore.getAll().filter((d) => d.student_id === student.id && !d.is_paid)
    return dues.reduce((acc, d) => acc + (d.amount || 0), 0)
  }, [student.id, refreshKey])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-emerald-500" size={22} />
            Fees & Payment Invoices (ফি ও পেমেন্ট বিবরণী)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monthly tuition, model test fees, bKash / Nagad / In-Cash payments for {student.fullNameEn}
          </p>
        </div>

        {pendingDues > 0 ? (
          <button
            onClick={() => setCheckoutModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-md self-start sm:self-auto"
          >
            <CreditCard size={15} />
            Pay Fee Now (৳{pendingDues.toLocaleString()})
          </button>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold self-start sm:self-auto">
            All Academic Fees Cleared ✓
          </span>
        )}
      </div>

      {/* Dues Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Due Card */}
        <div className={`${
          pendingDues > 0
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-emerald-600 to-teal-700'
        } text-white rounded-2xl p-5 shadow-md flex flex-col justify-between`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                {pendingDues > 0 ? 'Current Outstanding Due' : 'Account Clearance Status'}
              </span>
              <span className="p-1.5 rounded-lg bg-white/20">
                <Clock size={16} />
              </span>
            </div>
            <div className="text-3xl font-extrabold mt-3">
              ৳{pendingDues.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20 text-xs text-white/90">
            <span>{pendingDues > 0 ? 'Due Month: March 2026' : 'No Overdue Invoices'}</span>
            {pendingDues > 0 && (
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="px-3 py-1 bg-white text-amber-800 rounded-lg font-bold text-[11px] hover:bg-amber-50 transition-colors"
              >
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Payment Channels Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Accepted Payment Channels
            </span>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 font-bold text-xs border border-pink-500/20">
                🌸 bKash
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 font-bold text-xs border border-orange-500/20">
                ⚡ Nagad
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xs border border-purple-500/20">
                🚀 Rocket
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs border border-emerald-500/20">
                💵 Office Cash Desk
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            Instant digital receipt issued upon payment confirmation
          </p>
        </div>

        {/* Waiver / Institutional Discount */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Merit Scholarship / Waiver
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Percent size={16} />
              </span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              Standard General Rate
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {student.className || 'Class 10'} Tuition Fee Structure
          </p>
        </div>
      </div>

      {/* Payment History / Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="text-emerald-500" size={18} />
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Payment Receipts & Transaction Ledger (জমা ভাউচার)
            </h3>
          </div>
          <span className="text-xs text-zinc-400">{studentPayments.length} transaction(s)</span>
        </div>

        {studentPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Invoice / Receipt</th>
                  <th className="py-3.5 px-4">Date Paid</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Transaction / Token</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {studentPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {pay.invoice_number || 'INV-001'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString('en-GB') : '2026-02-05'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        pay.payment_method === 'CASH'
                          ? 'text-emerald-600'
                          : pay.payment_method === 'BKASH'
                          ? 'text-pink-600'
                          : pay.payment_method === 'NAGAD'
                          ? 'text-orange-600'
                          : 'text-purple-600'
                      }`}>
                        {pay.payment_method === 'CASH' ? '💵 In-Cash Counter' : pay.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                      {pay.transaction_id || 'TXN-DIRECT'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                      ৳{pay.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => printInvoice(pay)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Print Voucher Receipt"
                      >
                        <Printer size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-400 text-xs">
            No payment transaction records found for this student.
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        studentId={student.id}
        studentName={student.fullNameEn}
        studentRoll={student.rollNumber}
        classId={student.classId}
        batchId={student.batchId}
        className={student.className}
        dueAmount={pendingDues}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
