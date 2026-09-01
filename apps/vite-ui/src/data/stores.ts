// ============================================================
//  CENTRAL STORES — src/data/stores.ts
//  ─────────────────────────────────────────────────────────
//  Single point for ALL data access.
//
//  ⚡ DATABASE SWAP:
//  When you're ready to connect a real database (e.g. Supabase),
//  replace `createStore` calls in this file with your DB client.
//  All hooks and components import from here — nothing else
//  needs to change.
//
//  Pattern for Supabase swap (example):
//    import { createSupabaseStore } from '@/lib/supabaseStore'
//    export const studentStore = createSupabaseStore<Student>('students')
// ============================================================

import { createStore }               from '@/lib/localStore'

// ── Types ────────────────────────────────────────────────────
import type { Student }              from '@/features/students/types'
import type { Teacher }              from '@/features/teachers/types'
import type { ClassItem, Section, ClassGroup } from '@/features/classes/types'
import type { Batch }                from '@/features/batches/types'
import type { Subject }              from '@/features/subjects/types'
import type { LeaveRequest }         from '@/features/leaves/useLeaves'
import type { TeacherSalaryRecord }  from '@/features/teachers/salary/useTeacherSalary'
import type { Routine }              from '@/features/routines/types'
import type { ExamHeld }             from '@/features/examHeld/types'
import type { PaymentRecord, ManualDue, FeeStructure, StudentWaiver, MonthlyBillingRun } from '@/features/payments/types'
import type { AttendanceRecord, TeacherAttendanceRecord, TeacherLeaveBalance } from '@/features/attendance/types'
import type { Notice }               from '@/features/notices/types'
import type { RawCalendarEvent }     from './mockData'
import type {
  ExpenseCategoryItem,
  ExpenseRecord,
  FinanceTransaction,
  TeacherSalarySetting,
} from '@/features/finance/types'

// ── Seed Data ────────────────────────────────────────────────
import {
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_CLASSES,
  MOCK_SECTIONS,
  MOCK_BATCHES,
  MOCK_SUBJECTS,
  MOCK_GROUPS,
  MOCK_LEAVES,
  MOCK_SALARIES,
  MOCK_ROUTINES,
  MOCK_EXAMS,
  MOCK_CALENDAR_EVENTS,
} from './mockData'

import {
  MOCK_TEACHER_SALARY_SETTINGS,
  MOCK_EXPENSES,
  MOCK_FINANCE_TRANSACTIONS,
} from '@/features/finance/mockFinanceData'
import { DEFAULT_EXPENSE_CATEGORIES } from '@/features/finance/types'
import {
  MOCK_FEE_STRUCTURES,
  MOCK_STUDENT_WAIVERS,
  MOCK_MONTHLY_BILLINGS,
  MOCK_PAYMENTS,
  MOCK_MANUAL_DUES,
} from '@/features/payments/mockPaymentData'

// ─────────────────────────────────────────────────────────────
//  Store instances
//  Each store is a singleton — all hooks share the same store.
// ─────────────────────────────────────────────────────────────

export const studentStore              = createStore<Student>('students')
export const teacherStore              = createStore<Teacher>('teachers')
export const classStore                = createStore<ClassItem>('classes')
export const sectionStore              = createStore<Section>('sections')
export const batchStore                = createStore<Batch>('batches')
export const subjectStore              = createStore<Subject>('subjects')
export const groupStore                = createStore<ClassGroup>('groups-mgmt')
export const leaveStore                = createStore<LeaveRequest>('leaves')
export const salaryStore               = createStore<TeacherSalaryRecord>('teacher_salaries')
export const teacherSalarySettingStore = createStore<TeacherSalarySetting>('teacher_salary_settings')
export const routineStore              = createStore<Routine>('routines')
export const examStore                 = createStore<ExamHeld>('exam_held')
export const calendarStore             = createStore<RawCalendarEvent>('calendar-events')
export const paymentStore              = createStore<PaymentRecord>('payments')
export const manualDueStore            = createStore<ManualDue>('manual_dues')
export const feeStructureStore         = createStore<FeeStructure>('fee_structures')
export const studentWaiverStore        = createStore<StudentWaiver>('student_waivers')
export const monthlyBillingStore       = createStore<MonthlyBillingRun>('monthly_billings')
export const attendanceStore           = createStore<AttendanceRecord>('attendance')
export const teacherAttendanceStore    = createStore<TeacherAttendanceRecord>('teacher_attendance')
export const teacherLeaveBalanceStore  = createStore<TeacherLeaveBalance>('teacher_leave_balances')
export const noticeStore               = createStore<Notice>('notices')
export const expenseStore              = createStore<ExpenseRecord>('finance_expenses')
export const expenseCategoryStore      = createStore<ExpenseCategoryItem>('finance_expense_categories')
export const financeTransactionStore   = createStore<FinanceTransaction>('finance_transactions')

// ─────────────────────────────────────────────────────────────
//  Seed  (runs once per store if empty)
// ─────────────────────────────────────────────────────────────

studentStore.seed(MOCK_STUDENTS)
teacherStore.seed(MOCK_TEACHERS)
classStore.seed(MOCK_CLASSES)
sectionStore.seed(MOCK_SECTIONS)
batchStore.seed(MOCK_BATCHES)
if (subjectStore.getAll().length < 25) {
  subjectStore.clear()
  subjectStore.seed(MOCK_SUBJECTS)
} else {
  subjectStore.seed(MOCK_SUBJECTS)
}
groupStore.seed(MOCK_GROUPS)
leaveStore.seed(MOCK_LEAVES)
salaryStore.seed(MOCK_SALARIES)
teacherSalarySettingStore.seed(MOCK_TEACHER_SALARY_SETTINGS)
routineStore.seed(MOCK_ROUTINES)
examStore.seed(MOCK_EXAMS)
calendarStore.seed(MOCK_CALENDAR_EVENTS)
paymentStore.seed(MOCK_PAYMENTS)
manualDueStore.seed(MOCK_MANUAL_DUES)
feeStructureStore.seed(MOCK_FEE_STRUCTURES)
studentWaiverStore.seed(MOCK_STUDENT_WAIVERS)
monthlyBillingStore.seed(MOCK_MONTHLY_BILLINGS)
expenseCategoryStore.seed(DEFAULT_EXPENSE_CATEGORIES)
expenseStore.seed(MOCK_EXPENSES)
financeTransactionStore.seed(MOCK_FINANCE_TRANSACTIONS)


