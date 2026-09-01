// ─── Finance Types ─────────────────────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE'

export type TransactionCategory =
  | 'STUDENT_FEE'
  | 'TEACHER_SALARY'
  | 'OPERATIONAL_EXPENSE'
  | 'OTHER_INCOME'
  | 'OTHER_EXPENSE'

export type FinancePaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'CHEQUE' | 'OTHER'

// ─── Unified Transaction Record ───────────────────────────────────────────────

export interface FinanceTransaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  title: string
  amount: number
  date: string                // YYYY-MM-DD or ISO
  month: number               // 1 - 12
  year: number                // e.g. 2026
  payment_method: FinancePaymentMethod
  reference_id?: string       // payment_id, salary_record_id, or expense_id
  reference_type?: 'PAYMENT' | 'SALARY' | 'EXPENSE' | 'MANUAL'
  invoice_no?: string         // INV-2026-0001, SAL-2026-08-01, EXP-2026-0001
  party_name: string          // Student name, Teacher name, or Vendor/Payee
  party_id?: string
  party_role?: string         // "Student (Class 10)", "Teacher (Senior Teacher)", "Vendor", etc.
  notes?: string
  created_at: string
}

// ─── Expense Record ───────────────────────────────────────────────────────────

export interface ExpenseCategoryItem {
  id: string
  name: string
  icon: string
  color: string               // Tailwind color name or hex
  description?: string
  is_custom?: boolean
}

export interface ExpenseRecord {
  id: string
  invoice_no: string          // e.g. EXP-2026-0001
  title: string
  category_id: string
  category_name: string
  amount: number
  date: string                // YYYY-MM-DD
  month: number
  year: number
  vendor_name: string         // e.g. "DESCO / DPDC", "Dhaka Paper Mart", "IT Support"
  payment_method: FinancePaymentMethod
  receipt_no?: string         // Physical receipt/memo number
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateExpenseDto {
  title: string
  category_id: string
  amount: number
  date: string
  vendor_name: string
  payment_method: FinancePaymentMethod
  receipt_no?: string
  notes?: string
}

// ─── Teacher Salary Setting (Individual Salary Profile) ───────────────────────

export interface TeacherSalarySetting {
  id: string
  teacher_id: string
  teacher_name: string
  designation: string
  department?: string
  base_salary: number
  house_allowance: number
  medical_allowance: number
  special_allowance: number
  provident_fund_deduction: number
  tax_deduction: number
  other_deduction: number
  payment_method: FinancePaymentMethod
  bank_name?: string
  account_number?: string
  effective_from: string      // YYYY-MM-DD
  notes?: string
  is_active: boolean
  updated_at: string
}

export interface UpdateTeacherSalarySettingDto {
  teacher_id: string
  base_salary: number
  house_allowance?: number
  medical_allowance?: number
  special_allowance?: number
  provident_fund_deduction?: number
  tax_deduction?: number
  other_deduction?: number
  payment_method?: FinancePaymentMethod
  bank_name?: string
  account_number?: string
  notes?: string
}

// ─── Overview & Summary Types ─────────────────────────────────────────────────

export interface MonthlyFinancialSummary {
  month: number
  year: number
  monthName: string
  totalIncome: number
  salaryExpense: number
  operationalExpense: number
  totalExpense: number
  netProfit: number
  collectionRate?: number
}

export interface FinanceOverviewStats {
  totalIncome: number
  totalExpense: number
  totalSalaryPaid: number
  totalOperationalExpense: number
  netBalance: number
  pendingStudentDues: number
  pendingSalaryPayable: number
  transactionCount: number
  incomeGrowthPct: number
  expenseGrowthPct: number
}

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryItem[] = [
  { id: 'cat-util', name: 'Utility & Bills (Electricity, Water, Gas)', icon: 'Zap', color: 'amber', description: 'Electric bills, water supply, internet & gas bills' },
  { id: 'cat-maint', name: 'Maintenance & Repairs', icon: 'Wrench', color: 'orange', description: 'Campus repair, electrical, plumbing & painting' },
  { id: 'cat-stationery', name: 'Stationery & Office Supplies', icon: 'FileText', color: 'blue', description: 'Exam papers, office stationery, printing materials' },
  { id: 'cat-transport', name: 'Transport & Fuel', icon: 'Bus', color: 'cyan', description: 'School bus maintenance, driver allowance & fuel' },
  { id: 'cat-events', name: 'Events & Functions', icon: 'PartyPopper', color: 'purple', description: 'Sports day, cultural events, exams & ceremonies' },
  { id: 'cat-lab', name: 'Books & Lab Equipment', icon: 'FlaskConical', color: 'emerald', description: 'Science lab chemicals, apparatus & library books' },
  { id: 'cat-software', name: 'Software & IT Infrastructure', icon: 'Laptop', color: 'indigo', description: 'Hosting, domain, SMS gateway & software fees' },
  { id: 'cat-misc', name: 'Miscellaneous & Refreshments', icon: 'Coffee', color: 'rose', description: 'Staff refreshments, guest entertainment, emergency expenses' },
]

export function generateExpenseInvoiceNo(): string {
  const year = new Date().getFullYear()
  const key = `lms_expense_inv_counter_${year}`
  const current = parseInt(localStorage.getItem(key) ?? '0', 10)
  const next = current + 1
  localStorage.setItem(key, String(next))
  return `EXP-${year}-${String(next).padStart(4, '0')}`
}
