import type { FeeStructure, StudentWaiver, MonthlyBillingRun, PaymentRecord, ManualDue, FeeType } from './types'

export const MOCK_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 'fs-cls-8',
    name: 'Class 8 Standard Monthly Fee Structure',
    target_type: 'CLASS',
    class_id: 'cls-8',
    batch_id: null,
    class_name: 'Class 8',
    batch_name: null,
    fee_items: [
      { id: 'fi-8-1', fee_type: 'TUITION', label: 'Monthly Tuition Fee', amount: 1300, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-8-2', fee_type: 'EXAM', label: 'Monthly Evaluation & Exam Fee', amount: 400, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-8-3', fee_type: 'LIBRARY', label: 'Library & Computer Lab Fee', amount: 150, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-8-4', fee_type: 'DEVELOPMENT', label: 'Campus Development Fee', amount: 150, frequency: 'MONTHLY', due_day: 10 },
    ],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'fs-cls-9',
    name: 'Class 9 Secondary Academic Structure',
    target_type: 'CLASS',
    class_id: 'cls-9',
    batch_id: null,
    class_name: 'Class 9',
    batch_name: null,
    fee_items: [
      { id: 'fi-9-1', fee_type: 'TUITION', label: 'Monthly Tuition Fee', amount: 1600, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-9-2', fee_type: 'EXAM', label: 'Term Assessment Fee', amount: 500, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-9-3', fee_type: 'DEVELOPMENT', label: 'Lab & Campus Maintenance', amount: 250, frequency: 'MONTHLY', due_day: 10 },
    ],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'fs-cls-10',
    name: 'Class 10 SSC Candidate Package',
    target_type: 'CLASS',
    class_id: 'cls-10',
    batch_id: null,
    class_name: 'Class 10',
    batch_name: null,
    fee_items: [
      { id: 'fi-10-1', fee_type: 'TUITION', label: 'Monthly Tuition & Coaching Fee', amount: 1800, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-10-2', fee_type: 'EXAM', label: 'Model Test & Test Paper Prep', amount: 700, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-10-3', fee_type: 'OTHER', label: 'Special Guide & Sheet Fee', amount: 300, frequency: 'MONTHLY', due_day: 10 },
    ],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'fs-cls-6',
    name: 'Class 6 Foundation Structure',
    target_type: 'CLASS',
    class_id: 'cls-6',
    batch_id: null,
    class_name: 'Class 6',
    batch_name: null,
    fee_items: [
      { id: 'fi-6-1', fee_type: 'TUITION', label: 'Monthly Tuition Fee', amount: 1100, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-6-2', fee_type: 'EXAM', label: 'Monthly Assessment Fee', amount: 300, frequency: 'MONTHLY', due_day: 10 },
    ],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'fs-cls-7',
    name: 'Class 7 Standard Fee Structure',
    target_type: 'CLASS',
    class_id: 'cls-7',
    batch_id: null,
    class_name: 'Class 7',
    batch_name: null,
    fee_items: [
      { id: 'fi-7-1', fee_type: 'TUITION', label: 'Monthly Tuition Fee', amount: 1200, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-7-2', fee_type: 'EXAM', label: 'Monthly Assessment Fee', amount: 350, frequency: 'MONTHLY', due_day: 10 },
      { id: 'fi-7-3', fee_type: 'LIBRARY', label: 'Library & Activity Fee', amount: 150, frequency: 'MONTHLY', due_day: 10 },
    ],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const MOCK_STUDENT_WAIVERS: StudentWaiver[] = [
  {
    id: 'sw-1',
    student_id: 'std-8-01',
    student_name: 'Rahim Ahmed',
    roll_number: '01',
    class_name: 'Class 8',
    waiver_type: 'PERCENTAGE',
    value: 50,
    fee_type: 'TUITION',
    reason: 'Academic Merit Scholarship (Top 1 in class)',
    is_active: true,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'sw-2',
    student_id: 'std-8-04',
    student_name: 'Tanvir Hossain',
    roll_number: '04',
    class_name: 'Class 8',
    waiver_type: 'FIXED',
    value: 400,
    fee_type: 'ALL',
    reason: 'Sibling Concession (Brother studying in Class 10)',
    is_active: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'sw-3',
    student_id: 'std-8-07',
    student_name: 'Sadia Sultana',
    roll_number: '07',
    class_name: 'Class 8',
    waiver_type: 'PERCENTAGE',
    value: 100,
    fee_type: 'TUITION',
    reason: 'Full Free-Studentship (Special Quota)',
    is_active: true,
    created_at: '2026-02-01T00:00:00Z',
  },
]

export const MOCK_MONTHLY_BILLINGS: MonthlyBillingRun[] = [
  {
    id: 'mbr-2026-08-cls8',
    month: 8,
    year: 2026,
    target_type: 'CLASS',
    class_id: 'cls-8',
    class_name: 'Class 8',
    generated_count: 20,
    total_billed_amount: 40000,
    fee_structure_id: 'fs-cls-8',
    created_by: 'Admin',
    created_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 'mbr-2026-07-cls8',
    month: 7,
    year: 2026,
    target_type: 'CLASS',
    class_id: 'cls-8',
    class_name: 'Class 8',
    generated_count: 20,
    total_billed_amount: 40000,
    fee_structure_id: 'fs-cls-8',
    created_by: 'Admin',
    created_at: '2026-07-01T09:00:00Z',
  },
]

const NOW = new Date()
const THIS_MONTH = NOW.getMonth() + 1
const THIS_YEAR  = NOW.getFullYear()

function generateYearlyMockPayments(): PaymentRecord[] {
  const records: PaymentRecord[] = []
  let inv = 1

  const students = [
    { id: '1', name: 'Rahim Uddin', roll: '01', classId: 'cls-10', className: 'Class 10', fsId: 'fs-cls-10', tuition: 1800 },
    { id: '2', name: 'Sadia Islam', roll: '02', classId: 'cls-10', className: 'Class 10', fsId: 'fs-cls-10', tuition: 1800 },
    { id: '3', name: 'Abdur Rahim', roll: '01', classId: 'cls-9', className: 'Class 9', fsId: 'fs-cls-9', tuition: 1600 },
    { id: '4', name: 'Farzana Akhter', roll: '02', classId: 'cls-9', className: 'Class 9', fsId: 'fs-cls-9', tuition: 1600 },
    { id: '5', name: 'Mehedi Hasan', roll: '01', classId: 'cls-8', className: 'Class 8', fsId: 'fs-cls-8', tuition: 1300 },
    { id: '6', name: 'Tanjina Khatun', roll: '02', classId: 'cls-8', className: 'Class 8', fsId: 'fs-cls-8', tuition: 1300 },
    { id: '7', name: 'Sabbir Ahmed', roll: '01', classId: 'cls-7', className: 'Class 7', fsId: 'fs-cls-7', tuition: 1100 },
    { id: '8', name: 'Lamia Islam', roll: '01', classId: 'cls-6', className: 'Class 6', fsId: 'fs-cls-6', tuition: 1000 },
  ]

  const methods = ['BKASH', 'CASH', 'NAGAD', 'BANK'] as const

  for (let m = 1; m <= THIS_MONTH; m++) {
    for (const st of students) {
      const items: { fee_type: FeeType; label: string; amount: number; month: number; year: number }[] = [
        { fee_type: 'TUITION', label: `${st.className} Monthly Tuition`, amount: st.tuition, month: m, year: THIS_YEAR }
      ]
      if (m === 1) {
        items.push({ fee_type: 'ADMISSION', label: 'Session Admission Fee', amount: 2500, month: m, year: THIS_YEAR })
      } else if (m === 4 || m === 6 || m === 8) {
        items.push({ fee_type: 'EXAM', label: 'Term Examination & Assessment Fee', amount: 500, month: m, year: THIS_YEAR })
      }

      const total = items.reduce((s, i) => s + i.amount, 0)
      const method = methods[(parseInt(st.id, 10) + m) % methods.length]
      const payDay = 5 + (parseInt(st.id, 10) % 15)
      const paidDate = new Date(THIS_YEAR, m - 1, payDay, 10 + (m % 5), 15).toISOString()

      records.push({
        id: `pay-${THIS_YEAR}-${String(inv).padStart(4, '0')}`,
        invoice_number: `INV-${THIS_YEAR}-${String(inv).padStart(4, '0')}`,
        student_id: st.id,
        student_name: st.name,
        roll_number: st.roll,
        class_id: st.classId,
        batch_id: null,
        class_name: st.className,
        fee_structure_id: st.fsId,
        items,
        subtotal: total,
        discount_amount: 0,
        waiver_reason: null,
        total_amount: total,
        payment_method: method,
        transaction_id: method === 'CASH' ? null : `TRX${m}${st.id}98214`,
        paid_at: paidDate,
        collected_by: method === 'CASH' ? 'Accounts Desk' : 'Online Gateway',
        note: null,
        status: 'PAID',
        created_at: paidDate,
        updated_at: paidDate,
      })
      inv++
    }
  }

  return records
}

export const MOCK_PAYMENTS: PaymentRecord[] = generateYearlyMockPayments()

export const MOCK_MANUAL_DUES: ManualDue[] = [
  {
    id: 'due-001',
    student_id: '10',
    student_name: 'Sumaiya Begum',
    roll_number: '03',
    class_id: 'cls-10',
    batch_id: null,
    class_name: 'Class 10',
    fee_type: 'TUITION',
    label: 'Class 10 Monthly Tuition Fee',
    amount: 1800,
    month: THIS_MONTH,
    year: THIS_YEAR,
    due_date: `${THIS_YEAR}-${String(THIS_MONTH).padStart(2, '0')}-10`,
    note: 'Monthly billing due',
    is_paid: false,
    paid_payment_id: null,
    created_at: new Date(THIS_YEAR, THIS_MONTH - 1, 1).toISOString(),
    updated_at: new Date(THIS_YEAR, THIS_MONTH - 1, 1).toISOString(),
  },
  {
    id: 'due-002',
    student_id: '21',
    student_name: 'Tanvir Hasan',
    roll_number: '04',
    class_id: 'cls-10',
    batch_id: null,
    class_name: 'Class 10',
    fee_type: 'TUITION',
    label: 'Class 10 Monthly Tuition Fee',
    amount: 1800,
    month: THIS_MONTH,
    year: THIS_YEAR,
    due_date: `${THIS_YEAR}-${String(THIS_MONTH).padStart(2, '0')}-10`,
    note: 'Monthly billing due',
    is_paid: false,
    paid_payment_id: null,
    created_at: new Date(THIS_YEAR, THIS_MONTH - 1, 1).toISOString(),
    updated_at: new Date(THIS_YEAR, THIS_MONTH - 1, 1).toISOString(),
  },
  {
    id: 'due-003',
    student_id: '17',
    student_name: 'Mizanur Rahman',
    roll_number: '01',
    class_id: 'cls-10',
    batch_id: null,
    class_name: 'Class 10',
    fee_type: 'TUITION',
    label: 'Class 10 Commerce Tuition Fee',
    amount: 1800,
    month: THIS_MONTH,
    year: THIS_YEAR,
    due_date: `${THIS_YEAR}-${String(THIS_MONTH).padStart(2, '0')}-10`,
    note: 'Monthly billing due',
    is_paid: false,
    paid_payment_id: null,
    created_at: new Date(THIS_YEAR, THIS_MONTH - 1, 1).toISOString(),
    updated_at: new Date(THIS_YEAR, THIS_MONTH - 1, 1).toISOString(),
  },
]

