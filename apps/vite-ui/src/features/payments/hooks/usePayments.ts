import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentStore, manualDueStore } from '@/data/stores'
import {
  generateInvoiceNumber,
  type PaymentRecord,
  type ManualDue,
  type CollectPaymentDto,
  type CreateManualDueDto,
} from '../types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const paymentKeys = {
  all: ['payments'] as const,
  student: (id: string) => ['payments', 'student', id] as const,
  stats: ['payments', 'stats'] as const,
  dues: ['manual-dues'] as const,
  studentDues: (id: string) => ['manual-dues', 'student', id] as const,
}

// ─── Payment Filters ──────────────────────────────────────────────────────────

export interface PaymentFilters {
  class_id?: string
  month?: number
  year?: number
  fee_type?: string
  payment_method?: string
  status?: string
  student_id?: string
}

// ─── Fetch Payments ───────────────────────────────────────────────────────────

function fetchPayments(filters?: PaymentFilters): PaymentRecord[] {
  // TODO: replace with Supabase
  let records = paymentStore.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at))

  if (filters?.class_id)        records = records.filter(r => r.class_id === filters.class_id)
  if (filters?.status)          records = records.filter(r => r.status === filters.status)
  if (filters?.payment_method)  records = records.filter(r => r.payment_method === filters.payment_method)
  if (filters?.student_id)      records = records.filter(r => r.student_id === filters.student_id)
  if (filters?.month || filters?.year) {
    records = records.filter(r =>
      r.items.some(item =>
        (!filters.month || item.month === filters.month) &&
        (!filters.year  || item.year  === filters.year)
      )
    )
  }
  if (filters?.fee_type) {
    records = records.filter(r => r.items.some(item => item.fee_type === filters.fee_type))
  }

  return records
}

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: [...paymentKeys.all, filters],
    queryFn: () => fetchPayments(filters),
    staleTime: 0,
  })
}

export function useStudentPayments(studentId: string | null) {
  return useQuery({
    queryKey: paymentKeys.student(studentId ?? ''),
    queryFn: () => fetchPayments({ student_id: studentId! }),
    enabled: !!studentId,
    staleTime: 0,
  })
}

// ─── Payment Stats ────────────────────────────────────────────────────────────

export interface PaymentStats {
  collectedThisMonth: number
  collectedThisYear: number
  unpaidDuesCount: number
  unpaidDuesAmount: number
  totalTransactions: number
}

function fetchPaymentStats(): PaymentStats {
  const now = new Date()
  const thisMonth = now.getMonth() + 1
  const thisYear = now.getFullYear()

  const allPayments = paymentStore.getAll()
  const paidPayments = allPayments.filter(p => p.status !== 'REFUNDED')

  const collectedThisMonth = paidPayments
    .filter(p => {
      const d = new Date(p.paid_at)
      return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((sum, p) => sum + p.total_amount, 0)

  const collectedThisYear = paidPayments
    .filter(p => new Date(p.paid_at).getFullYear() === thisYear)
    .reduce((sum, p) => sum + p.total_amount, 0)

  const unpaidDues = manualDueStore.getAll().filter(d => !d.is_paid)

  return {
    collectedThisMonth,
    collectedThisYear,
    unpaidDuesCount: unpaidDues.length,
    unpaidDuesAmount: unpaidDues.reduce((sum, d) => sum + d.amount, 0),
    totalTransactions: allPayments.length,
  }
}

export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats,
    queryFn: fetchPaymentStats,
    staleTime: 0,
  })
}

// ─── Collect Payment ──────────────────────────────────────────────────────────

function collectPayment(dto: CollectPaymentDto): PaymentRecord {
  // TODO: replace with Supabase
  const subtotal = dto.items.reduce((sum, item) => sum + item.amount, 0)
  const discount = dto.discount_amount ?? 0
  const totalAmount = Math.max(0, subtotal - discount)

  const record: PaymentRecord = {
    id: crypto.randomUUID(),
    invoice_number: generateInvoiceNumber(),
    student_id: dto.student_id,
    student_name: dto.student_name,
    roll_number: dto.roll_number,
    class_id: dto.class_id ?? null,
    batch_id: dto.batch_id ?? null,
    class_name: dto.class_name ?? null,
    fee_structure_id: dto.fee_structure_id ?? null,
    items: dto.items,
    subtotal,
    discount_amount: discount,
    waiver_reason: dto.waiver_reason ?? null,
    total_amount: totalAmount,
    payment_method: dto.payment_method,
    transaction_id: dto.transaction_id ?? null,
    paid_at: dto.paid_at,
    collected_by: 'Admin',
    note: dto.note ?? null,
    status: discount > 0 && totalAmount === 0 ? 'WAIVED' : 'PAID',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return paymentStore.insert(record)
}

export function useCollectFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: paymentKeys.stats })
      qc.invalidateQueries({ queryKey: paymentKeys.dues })
    },
  })
}

// ─── Manual Dues ──────────────────────────────────────────────────────────────

function fetchManualDues(studentId?: string): ManualDue[] {
  // TODO: replace with Supabase
  const all = manualDueStore.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at))
  if (studentId) return all.filter(d => d.student_id === studentId)
  return all
}

export function useManualDues() {
  return useQuery({
    queryKey: paymentKeys.dues,
    queryFn: () => fetchManualDues(),
    staleTime: 0,
  })
}

export function useStudentManualDues(studentId: string | null) {
  return useQuery({
    queryKey: paymentKeys.studentDues(studentId ?? ''),
    queryFn: () => fetchManualDues(studentId!),
    enabled: !!studentId,
    staleTime: 0,
  })
}

// ─── Create Manual Due ────────────────────────────────────────────────────────

function createManualDue(dto: CreateManualDueDto): ManualDue {
  // TODO: replace with Supabase
  const due: ManualDue = {
    id: crypto.randomUUID(),
    student_id: dto.student_id,
    student_name: dto.student_name,
    roll_number: dto.roll_number,
    class_id: dto.class_id ?? null,
    batch_id: dto.batch_id ?? null,
    class_name: dto.class_name ?? null,
    fee_type: dto.fee_type,
    label: dto.label,
    amount: dto.amount,
    month: dto.month ?? null,
    year: dto.year ?? null,
    due_date: dto.due_date ?? null,
    note: dto.note ?? null,
    is_paid: false,
    paid_payment_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return manualDueStore.insert(due)
}

export function useCreateManualDue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createManualDue,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.dues })
      qc.invalidateQueries({ queryKey: paymentKeys.stats })
    },
  })
}

// ─── Mark Manual Due as Paid ──────────────────────────────────────────────────

function markDuePaid({ dueId, paymentId }: { dueId: string; paymentId: string }): ManualDue {
  return manualDueStore.update(dueId, {
    is_paid: true,
    paid_payment_id: paymentId,
    updated_at: new Date().toISOString(),
  })
}

export function useMarkDuePaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markDuePaid,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.dues })
      qc.invalidateQueries({ queryKey: paymentKeys.stats })
    },
  })
}

// ─── Delete Manual Due ────────────────────────────────────────────────────────

export function useDeleteManualDue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => { manualDueStore.remove(id) },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.dues })
      qc.invalidateQueries({ queryKey: paymentKeys.stats })
    },
  })
}

// ─── Delete Payment Record ────────────────────────────────────────────────────

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => { paymentStore.remove(id) },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: paymentKeys.stats })
    },
  })
}
