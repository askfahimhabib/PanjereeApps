import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  studentWaiverStore,
  monthlyBillingStore,
  feeStructureStore,
  manualDueStore,
  studentStore,
  paymentStore,
} from '@/data/stores'
import type {
  StudentWaiver,
  MonthlyBillingRun,
  StudentFeeLedgerSummary,
  MonthLedgerCell,
  MonthPaymentStatus,
  ManualDue,
  FeeType,
} from '../types'
import { MONTH_NAMES_SHORT } from '../types'

export const billingKeys = {
  waivers: ['student_waivers'] as const,
  billingRuns: ['monthly_billing_runs'] as const,
  ledger: (studentId: string, year: number) => ['student_fee_ledger', studentId, year] as const,
  dailyRegister: (dateStr: string) => ['daily_cash_register', dateStr] as const,
}

// ─── Student Waivers ──────────────────────────────────────────────────────────

export function useStudentWaivers() {
  return useQuery({
    queryKey: billingKeys.waivers,
    queryFn: () => studentWaiverStore.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)),
    staleTime: 0,
  })
}

export function useCreateStudentWaiver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: Omit<StudentWaiver, 'id' | 'created_at'>) => {
      const waiver: StudentWaiver = {
        ...dto,
        id: `sw-${crypto.randomUUID().slice(0, 8)}`,
        created_at: new Date().toISOString(),
      }
      return studentWaiverStore.insert(waiver)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.waivers })
    },
  })
}

export function useDeleteStudentWaiver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      studentWaiverStore.remove(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.waivers })
    },
  })
}

// ─── Monthly Billing Runs & Automated Dues ────────────────────────────────────

export function useMonthlyBillingRuns() {
  return useQuery({
    queryKey: billingKeys.billingRuns,
    queryFn: () => monthlyBillingStore.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)),
    staleTime: 0,
  })
}

export interface GenerateMonthlyBillingDto {
  month: number
  year: number
  target_type: 'CLASS' | 'BATCH' | 'ALL'
  class_id?: string
  batch_id?: string
  fee_structure_id?: string
}

export function useGenerateMonthlyBilling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: GenerateMonthlyBillingDto) => {
      const allStudents = studentStore.getAll().filter(s => s.status === 'ACTIVE')
      const targetStudents = allStudents.filter(s => {
        if (dto.target_type === 'CLASS' && dto.class_id) {
          return s.classId === dto.class_id
        }
        if (dto.target_type === 'BATCH' && dto.batch_id) {
          return s.batchId === dto.batch_id
        }
        return true
      })

      if (targetStudents.length === 0) {
        throw new Error('No active students found for selected target criteria.')
      }

      // Find structure
      let structure = dto.fee_structure_id
        ? feeStructureStore.getOne(dto.fee_structure_id)
        : null

      if (!structure && dto.class_id) {
        structure = feeStructureStore.getWhere(f => f.class_id === dto.class_id && f.is_active)[0]
      }

      const feeItems = structure?.fee_items ?? [
        { id: 'fi-def-1', fee_type: 'TUITION' as FeeType, label: 'Monthly Tuition Fee', amount: 1500, frequency: 'MONTHLY' as const, due_day: 10 },
      ]

      const existingDues = manualDueStore.getAll()
      let generatedCount = 0
      let totalBilled = 0

      targetStudents.forEach(student => {
        feeItems.forEach(item => {
          // Check if already billed for this month/year/student/item
          const alreadyExists = existingDues.some(
            d => d.student_id === student.id &&
                 d.month === dto.month &&
                 d.year === dto.year &&
                 d.label === item.label
          )

          if (!alreadyExists) {
            const due: ManualDue = {
              id: crypto.randomUUID(),
              student_id: student.id,
              student_name: student.fullNameEn,
              roll_number: student.rollNumber,
              class_id: student.classId ?? null,
              batch_id: student.batchId ?? null,
              class_name: student.className ?? null,
              fee_type: item.fee_type,
              label: item.label,
              amount: item.amount,
              month: dto.month,
              year: dto.year,
              due_date: `${dto.year}-${String(dto.month).padStart(2, '0')}-${String(item.due_day || 10).padStart(2, '0')}`,
              note: `Automated Monthly Billing (${MONTH_NAMES_SHORT[dto.month - 1]} ${dto.year})`,
              is_paid: false,
              paid_payment_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            manualDueStore.insert(due)
            generatedCount++
            totalBilled += item.amount
          }
        })
      })

      // Record the billing run
      const billingRun: MonthlyBillingRun = {
        id: `mbr-${dto.year}-${String(dto.month).padStart(2, '0')}-${crypto.randomUUID().slice(0, 6)}`,
        month: dto.month,
        year: dto.year,
        target_type: dto.target_type,
        class_id: dto.class_id,
        class_name: targetStudents[0]?.className,
        batch_id: dto.batch_id,
        generated_count: generatedCount,
        total_billed_amount: totalBilled,
        fee_structure_id: structure?.id,
        created_by: 'Admin',
        created_at: new Date().toISOString(),
      }
      monthlyBillingStore.insert(billingRun)

      return billingRun
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manual-dues'] })
      qc.invalidateQueries({ queryKey: billingKeys.billingRuns })
      qc.invalidateQueries({ queryKey: ['payments', 'stats'] })
      qc.invalidateQueries({ queryKey: ['student_fee_ledger'] })
      qc.invalidateQueries({ queryKey: ['finance_overview'] })
    },
  })
}

// ─── Student Fee Ledger (12-Month Grid Reconciler) ────────────────────────────

export function calculateStudentFeeLedger(studentId: string, year: number): StudentFeeLedgerSummary | null {
  const student = studentStore.getOne(studentId)
  if (!student) return null

  const allPayments = paymentStore.getAll().filter(p => p.student_id === studentId && p.status !== 'REFUNDED')
  const allDues = manualDueStore.getAll().filter(d => d.student_id === studentId && (d.year === year || !d.year))

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const months: MonthLedgerCell[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const mDues = allDues.filter(d => d.month === m)
    const mPayments = allPayments.filter(p => p.items.some(it => it.month === m && (it.year === year || !it.year)))

    const billed_amount = mDues.reduce((sum, d) => sum + d.amount, 0)
    const paid_amount = mPayments.reduce((sum, p) => {
      const monthItems = p.items.filter(it => it.month === m && (it.year === year || !it.year))
      return sum + monthItems.reduce((s, it) => s + it.amount, 0)
    }, 0)
    const discount_amount = mPayments.reduce((sum, p) => sum + (p.discount_amount || 0), 0)

    const isPaid = mDues.length > 0 ? mDues.every(d => d.is_paid) : paid_amount > 0

    let status: MonthPaymentStatus = 'UNBILLED'
    if (billed_amount > 0 || paid_amount > 0) {
      if (isPaid || paid_amount >= billed_amount && billed_amount > 0) {
        status = 'PAID'
      } else if (paid_amount > 0) {
        status = 'PARTIAL'
      } else {
        status = 'DUE'
      }
    } else if (year < currentYear || (year === currentYear && m <= currentMonth)) {
      status = 'UNBILLED'
    }

    const due_amount = Math.max(0, billed_amount - paid_amount)

    return {
      month: m,
      year,
      status,
      billed_amount,
      paid_amount,
      discount_amount,
      due_amount,
      payment_ids: mPayments.map(p => p.id),
      due_ids: mDues.map(d => d.id),
      invoice_numbers: mPayments.map(p => p.invoice_number),
    }
  })

  const total_billed = months.reduce((s, m) => s + m.billed_amount, 0)
  const total_paid = months.reduce((s, m) => s + m.paid_amount, 0)
  const total_discount = months.reduce((s, m) => s + m.discount_amount, 0)
  const total_due = months.reduce((s, m) => s + m.due_amount, 0)

  return {
    student_id: student.id,
    student_name: student.fullNameEn,
    roll_number: student.rollNumber,
    class_name: student.className || 'Class',
    section_name: student.sectionName,
    total_billed,
    total_paid,
    total_discount,
    total_due,
    advance_balance: Math.max(0, total_paid - total_billed),
    months,
  }
}

export function useStudentFeeLedger(studentId: string | null, year: number) {
  return useQuery({
    queryKey: billingKeys.ledger(studentId ?? '', year),
    queryFn: () => (studentId ? calculateStudentFeeLedger(studentId, year) : null),
    enabled: !!studentId,
    staleTime: 0,
  })
}

// ─── Daily Cash Register ──────────────────────────────────────────────────────

export interface DailyCashRegisterSummary {
  date: string
  totalCollected: number
  cashCollected: number
  bkashCollected: number
  nagadCollected: number
  rocketCollected: number
  bankCollected: number
  otherCollected: number
  transactionCount: number
  classBreakdown: { class_name: string; amount: number; count: number }[]
  payments: import('../types').PaymentRecord[]
}

export function fetchDailyCashRegister(dateStr: string): DailyCashRegisterSummary {
  const allPayments = paymentStore.getAll()
  const dayPayments = allPayments.filter(p => p.paid_at.startsWith(dateStr) && p.status !== 'REFUNDED')

  let cash = 0, bkash = 0, nagad = 0, rocket = 0, bank = 0, other = 0
  const classMap: Record<string, { amount: number; count: number }> = {}

  dayPayments.forEach(p => {
    if (p.payment_method === 'CASH') cash += p.total_amount
    else if (p.payment_method === 'BKASH') bkash += p.total_amount
    else if (p.payment_method === 'NAGAD') nagad += p.total_amount
    else if (p.payment_method === 'ROCKET') rocket += p.total_amount
    else if (p.payment_method === 'BANK') bank += p.total_amount
    else other += p.total_amount

    const cName = p.class_name || 'General'
    if (!classMap[cName]) classMap[cName] = { amount: 0, count: 0 }
    classMap[cName].amount += p.total_amount
    classMap[cName].count += 1
  })

  const classBreakdown = Object.entries(classMap).map(([class_name, stats]) => ({
    class_name,
    amount: stats.amount,
    count: stats.count,
  })).sort((a, b) => b.amount - a.amount)

  return {
    date: dateStr,
    totalCollected: cash + bkash + nagad + rocket + bank + other,
    cashCollected: cash,
    bkashCollected: bkash,
    nagadCollected: nagad,
    rocketCollected: rocket,
    bankCollected: bank,
    otherCollected: other,
    transactionCount: dayPayments.length,
    classBreakdown,
    payments: dayPayments,
  }
}

export function useDailyCashRegister(dateStr: string) {
  return useQuery({
    queryKey: billingKeys.dailyRegister(dateStr),
    queryFn: () => fetchDailyCashRegister(dateStr),
    staleTime: 0,
  })
}
