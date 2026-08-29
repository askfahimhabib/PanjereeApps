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
import type { ClassItem, Section }   from '@/features/classes/types'
import type { Batch }                from '@/features/batches/types'
import type { Subject }              from '@/features/subjects/types'
import type { GroupRecord }          from '@/features/groups/useGroups'
import type { LeaveRequest }         from '@/features/leaves/useLeaves'
import type { TeacherSalaryRecord }  from '@/features/teachers/salary/useTeacherSalary'
import type { Routine }              from '@/features/routines/types'
import type { ExamHeld }             from '@/features/examHeld/types'
import type { PaymentRecord, ManualDue } from '@/features/payments/types'
import type { AttendanceRecord }     from '@/features/attendance/types'
import type { Notice }               from '@/features/notices/types'

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
} from './mockData'

// ─────────────────────────────────────────────────────────────
//  Store instances
//  Each store is a singleton — all hooks share the same store.
// ─────────────────────────────────────────────────────────────

export const studentStore   = createStore<Student>('students')
export const teacherStore   = createStore<Teacher>('teachers')
export const classStore     = createStore<ClassItem>('classes')
export const sectionStore   = createStore<Section>('sections')
export const batchStore     = createStore<Batch>('batches')
export const subjectStore   = createStore<Subject>('subjects')
export const groupStore     = createStore<GroupRecord>('groups-mgmt')
export const leaveStore     = createStore<LeaveRequest>('leaves')
export const salaryStore    = createStore<TeacherSalaryRecord>('teacher_salaries')
export const routineStore   = createStore<Routine>('routines')
export const examStore      = createStore<ExamHeld>('exam_held')
export const paymentStore   = createStore<PaymentRecord>('payments')
export const manualDueStore = createStore<ManualDue>('manual_dues')
export const attendanceStore = createStore<AttendanceRecord>('attendance')
export const noticeStore    = createStore<Notice>('notices')

// ─────────────────────────────────────────────────────────────
//  Seed  (runs once per store if empty)
// ─────────────────────────────────────────────────────────────

studentStore.seed(MOCK_STUDENTS)
teacherStore.seed(MOCK_TEACHERS)
classStore.seed(MOCK_CLASSES)
sectionStore.seed(MOCK_SECTIONS)
batchStore.seed(MOCK_BATCHES)
subjectStore.seed(MOCK_SUBJECTS)
groupStore.seed(MOCK_GROUPS)
leaveStore.seed(MOCK_LEAVES)
salaryStore.seed(MOCK_SALARIES)
// routineStore, examStore, paymentStore, manualDueStore,
// attendanceStore, noticeStore → start empty (user-created data only)
