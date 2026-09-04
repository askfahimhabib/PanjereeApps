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
import { createSupabaseStore }       from '@/lib/supabaseStore'
import { isSupabaseConfigured }      from '@/lib/supabase'

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
import {
  MOCK_ATTENDANCE_RECORDS,
  MOCK_TEACHER_ATTENDANCE_RECORDS,
} from '@/features/attendance/mockAttendanceData'

// ─────────────────────────────────────────────────────────────
//  Store Factory (Local vs Supabase)
//  Auto-detects active Supabase credentials in .env
// ─────────────────────────────────────────────────────────────

export const USE_SUPABASE = isSupabaseConfigured()

function storeFactory<T extends { id: string }>(key: string) {
  if (USE_SUPABASE) {
    return createSupabaseStore<T>(key)
  }
  return createStore<T>(key)
}

// ─────────────────────────────────────────────────────────────
//  Store instances
//  Each store is a singleton — all hooks share the same store.
// ─────────────────────────────────────────────────────────────

export const studentStore              = storeFactory<Student>('students')
export const teacherStore              = storeFactory<Teacher>('teachers')
export const classStore                = storeFactory<ClassItem>('classes')
export const sectionStore              = storeFactory<Section>('sections')
export const batchStore                = storeFactory<Batch>('batches')
export const subjectStore              = storeFactory<Subject>('subjects')
export const groupStore                = storeFactory<ClassGroup>('groups-mgmt')
export const leaveStore                = storeFactory<LeaveRequest>('leaves')
export const salaryStore               = storeFactory<TeacherSalaryRecord>('teacher_salaries')
export const teacherSalarySettingStore = storeFactory<TeacherSalarySetting>('teacher_salary_settings')
export const routineStore              = storeFactory<Routine>('routines')
export const examStore                 = storeFactory<ExamHeld>('exam_held')
export const calendarStore             = storeFactory<RawCalendarEvent>('calendar-events')
export const paymentStore              = storeFactory<PaymentRecord>('payments')
export const manualDueStore            = storeFactory<ManualDue>('manual_dues')
export const feeStructureStore         = storeFactory<FeeStructure>('fee_structures')
export const studentWaiverStore        = storeFactory<StudentWaiver>('student_waivers')
export const monthlyBillingStore       = storeFactory<MonthlyBillingRun>('monthly_billings')
export const attendanceStore           = storeFactory<AttendanceRecord>('attendance')
export const teacherAttendanceStore    = storeFactory<TeacherAttendanceRecord>('teacher_attendance')
export const teacherLeaveBalanceStore  = storeFactory<TeacherLeaveBalance>('teacher_leave_balances')
export const noticeStore               = storeFactory<Notice>('notices')
export const expenseStore              = storeFactory<ExpenseRecord>('finance_expenses')
export const expenseCategoryStore      = storeFactory<ExpenseCategoryItem>('finance_expense_categories')
export const financeTransactionStore   = storeFactory<FinanceTransaction>('finance_transactions')

// ─────────────────────────────────────────────────────────────
//  Seed  (runs once per store if empty, unless database is purged)
// ─────────────────────────────────────────────────────────────

const isPurged = typeof window !== 'undefined' && localStorage.getItem('lms_db_purged') === 'true'

if (!isPurged) {
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
  if (paymentStore.getAll().length < 20) {
    paymentStore.clear()
    paymentStore.seed(MOCK_PAYMENTS)
  }
  manualDueStore.seed(MOCK_MANUAL_DUES)
  feeStructureStore.seed(MOCK_FEE_STRUCTURES)
  studentWaiverStore.seed(MOCK_STUDENT_WAIVERS)
  monthlyBillingStore.seed(MOCK_MONTHLY_BILLINGS)
  const ATTENDANCE_SEED_VERSION = 'att_seed_v3'
  if (localStorage.getItem('lms_att_version') !== ATTENDANCE_SEED_VERSION || attendanceStore.getAll().length < 350) {
    attendanceStore.clear()
    attendanceStore.seed(MOCK_ATTENDANCE_RECORDS)
    teacherAttendanceStore.clear()
    teacherAttendanceStore.seed(MOCK_TEACHER_ATTENDANCE_RECORDS)
    localStorage.setItem('lms_att_version', ATTENDANCE_SEED_VERSION)
  }
  expenseCategoryStore.seed(DEFAULT_EXPENSE_CATEGORIES)
  expenseStore.seed(MOCK_EXPENSES)
  financeTransactionStore.seed(MOCK_FINANCE_TRANSACTIONS)

  // Ensure exam-001 is published and has results
  const ex001 = examStore.getOne('exam-001')
  if (ex001 && !ex001.result_published) {
    examStore.update('exam-001', { result_published: true, status: 'COMPLETED' })
  }
}

// ─────────────────────────────────────────────────────────────
//  Master Admin Reset Utilities
// ─────────────────────────────────────────────────────────────

const ALL_STORE_INSTANCES = [
  studentStore,
  teacherStore,
  classStore,
  sectionStore,
  batchStore,
  subjectStore,
  groupStore,
  leaveStore,
  salaryStore,
  teacherSalarySettingStore,
  routineStore,
  examStore,
  calendarStore,
  paymentStore,
  manualDueStore,
  feeStructureStore,
  studentWaiverStore,
  monthlyBillingStore,
  attendanceStore,
  teacherAttendanceStore,
  teacherLeaveBalanceStore,
  noticeStore,
  expenseStore,
  expenseCategoryStore,
  financeTransactionStore,
]

/**
 * Master Admin Database Purge:
 * Wipes ALL records across all 25 modules to create a completely clean,
 * empty slate for real school data entry.
 */
export function purgeAllDatabase() {
  if (typeof window === 'undefined') return
  localStorage.setItem('lms_db_purged', 'true')
  ALL_STORE_INSTANCES.forEach((s) => s.clear())
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith('lms_store_') || k.startsWith('store_')) {
      localStorage.setItem(k, '[]')
    }
  })
  window.dispatchEvent(new CustomEvent('lms_store_updated', { detail: {} }))
}

/**
 * Master Admin Factory Reset:
 * Restores fresh institutional demo records.
 */
export function factoryResetDatabase() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('lms_db_purged')
  localStorage.removeItem('lms_att_version')
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith('lms_') || k.startsWith('store_')) {
      localStorage.removeItem(k)
    }
  })
}



