// ─── Enums ───────────────────────────────────────────────────────────────────

export type FeeType =
  | 'TUITION'
  | 'ADMISSION'
  | 'EXAM'
  | 'TRANSPORT'
  | 'LIBRARY'
  | 'DEVELOPMENT'
  | 'OTHER'

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'OTHER'
export type PaymentStatus = 'PAID' | 'WAIVED' | 'REFUNDED'
export type FeeFrequency = 'MONTHLY' | 'ONE_TIME' | 'YEARLY'
export type ReceiptPrintMode = 'DUAL_A4' | 'POS_80MM'

// ─── Student Waiver & Scholarship ─────────────────────────────────────────────

export interface StudentWaiver {
  id: string
  student_id: string
  student_name: string
  roll_number: string
  class_name?: string
  waiver_type: 'PERCENTAGE' | 'FIXED'
  value: number          // e.g. 50 (for 50%) or 500 (for ৳500)
  fee_type: FeeType | 'ALL'
  reason: string         // e.g. "Merit Scholarship", "Sibling Discount", "Need Based"
  is_active: boolean
  created_at: string
}

// ─── Automated Monthly Billing Record ─────────────────────────────────────────

export interface MonthlyBillingRun {
  id: string
  month: number
  year: number
  target_type: 'CLASS' | 'BATCH' | 'ALL'
  class_id?: string
  class_name?: string
  batch_id?: string
  batch_name?: string
  generated_count: number
  total_billed_amount: number
  fee_structure_id?: string
  created_by: string
  created_at: string
}

// ─── Student Fee Ledger ───────────────────────────────────────────────────────

export type MonthPaymentStatus = 'PAID' | 'DUE' | 'PARTIAL' | 'UNBILLED'

export interface MonthLedgerCell {
  month: number
  year: number
  status: MonthPaymentStatus
  billed_amount: number
  paid_amount: number
  discount_amount: number
  due_amount: number
  payment_ids: string[]
  due_ids: string[]
  invoice_numbers: string[]
}

export interface StudentFeeLedgerSummary {
  student_id: string
  student_name: string
  roll_number: string
  class_name: string
  section_name?: string
  total_billed: number
  total_paid: number
  total_discount: number
  total_due: number
  advance_balance: number
  months: MonthLedgerCell[]
}

// ─── Fee Structure ────────────────────────────────────────────────────────────

export interface FeeStructureItem {
  id: string
  fee_type: FeeType
  label: string          // e.g. "Tuition Fee"
  amount: number
  frequency: FeeFrequency
  due_day: number | null // day of month for MONTHLY fees (e.g. 5 = due on 5th)
}

export interface FeeStructure {
  id: string
  name: string
  target_type: 'CLASS' | 'BATCH'
  class_id: string | null
  batch_id: string | null
  fee_items: FeeStructureItem[]
  is_active: boolean
  created_at: string
  updated_at: string

  // Denormalized for display
  class_name?: string | null
  batch_name?: string | null
}

// ─── Payment Record ───────────────────────────────────────────────────────────

export interface PaymentLineItem {
  fee_type: FeeType
  label: string
  amount: number
  month: number | null  // 1-12, null for ONE_TIME/YEARLY
  year: number | null
}

export interface PaymentRecord {
  id: string
  invoice_number: string   // e.g. INV-2026-0001
  student_id: string
  student_name: string
  roll_number: string
  class_id: string | null
  batch_id: string | null
  class_name: string | null
  fee_structure_id: string | null

  // Multiple fee types in one invoice
  items: PaymentLineItem[]

  // Totals
  subtotal: number
  discount_amount: number
  waiver_reason: string | null
  total_amount: number     // subtotal - discount_amount

  payment_method: PaymentMethod
  transaction_id: string | null
  paid_at: string          // ISO date string
  collected_by: string
  note: string | null
  status: PaymentStatus
  created_at: string
  updated_at: string
}

// ─── Manual Due ───────────────────────────────────────────────────────────────

export interface ManualDue {
  id: string
  student_id: string
  student_name: string
  roll_number: string
  class_id: string | null
  batch_id: string | null
  class_name: string | null
  fee_type: FeeType
  label: string
  amount: number
  month: number | null   // 1-12
  year: number | null
  due_date: string | null
  note: string | null
  is_paid: boolean
  paid_payment_id: string | null
  created_at: string
  updated_at: string
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateFeeStructureDto {
  name: string
  target_type: 'CLASS' | 'BATCH'
  class_id?: string
  batch_id?: string
  class_name?: string
  batch_name?: string
  fee_items: Omit<FeeStructureItem, 'id'>[]
}

export interface CollectPaymentDto {
  student_id: string
  student_name: string
  roll_number: string
  class_id?: string
  batch_id?: string
  class_name?: string
  fee_structure_id?: string
  items: PaymentLineItem[]
  discount_amount: number
  waiver_reason?: string
  payment_method: PaymentMethod
  transaction_id?: string
  paid_at: string
  note?: string
}

export interface CreateManualDueDto {
  student_id: string
  student_name: string
  roll_number: string
  class_id?: string
  batch_id?: string
  class_name?: string
  fee_type: FeeType
  label: string
  amount: number
  month?: number
  year?: number
  due_date?: string
  note?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  TUITION:     'Tuition Fee',
  ADMISSION:   'Admission Fee',
  EXAM:        'Exam Fee',
  TRANSPORT:   'Transport Fee',
  LIBRARY:     'Library Fee',
  DEVELOPMENT: 'Development Fee',
  OTHER:       'Other',
}

export const FEE_TYPE_ICONS: Record<FeeType, string> = {
  TUITION:     '📚',
  ADMISSION:   '🎓',
  EXAM:        '📝',
  TRANSPORT:   '🚌',
  LIBRARY:     '📖',
  DEVELOPMENT: '🏗️',
  OTHER:       '💼',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH:   'Cash',
  BKASH:  'bKash',
  NAGAD:  'Nagad',
  ROCKET: 'Rocket',
  BANK:   'Bank Transfer',
  OTHER:  'Other',
}

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  CASH:   '💵',
  BKASH:  '📱',
  NAGAD:  '📱',
  ROCKET: '📱',
  BANK:   '🏦',
  OTHER:  '💳',
}

export const FEE_FREQUENCY_LABELS: Record<FeeFrequency, string> = {
  MONTHLY:  'Monthly',
  ONE_TIME: 'One-Time',
  YEARLY:   'Yearly',
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; border: string }> = {
  PAID:     { label: 'Paid',     color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  WAIVED:   { label: 'Waived',   color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  REFUNDED: { label: 'Refunded', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const counterKey = `lms_inv_counter_${year}`
  const current = parseInt(localStorage.getItem(counterKey) ?? '0', 10)
  const next = current + 1
  localStorage.setItem(counterKey, String(next))
  return `INV-${year}-${String(next).padStart(4, '0')}`
}

export function formatCurrency(amount: number): string {
  return `৳ ${amount.toLocaleString('en-BD')}`
}

