import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  salaryStore,
  teacherStore,
  teacherSalarySettingStore,
  financeTransactionStore,
} from '@/data/stores'
import { MONTH_NAMES } from '@/features/payments/types'
import type { TeacherSalarySetting, UpdateTeacherSalarySettingDto, FinancePaymentMethod } from '@/features/finance/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SalaryStatus = 'PAID' | 'UNPAID' | 'PARTIAL'

export interface TeacherSalaryRecord {
  id: string
  teacherId: string
  teacherName: string
  designation: string
  department?: string
  month: number
  year: number
  baseSalary: number
  bonus: number
  deduction: number
  houseAllowance?: number
  medicalAllowance?: number
  paidAmount: number
  status: SalaryStatus
  paymentMethod?: FinancePaymentMethod
  paidDate?: string
  notes?: string
}

// ── Auto Generate Records for a Month from Settings ───────────────────────────

function syncMonthRecords(month: number, year: number) {
  const currentRecords = salaryStore.getAll()
  const monthRecords = currentRecords.filter(r => r.month === month && r.year === year)
  const existingTeacherIds = new Set(monthRecords.map(r => r.teacherId))

  const allTeachers = teacherStore.getAll()
  const allSettings = teacherSalarySettingStore.getAll()
  const settingsMap = new Map(allSettings.map(s => [s.teacher_id, s]))

  let hasAdded = false

  allTeachers.forEach(teacher => {
    if (!existingTeacherIds.has(teacher.id)) {
      const setting = settingsMap.get(teacher.id)
      const baseSalary = setting ? setting.base_salary : 20000
      const bonus = setting ? (setting.house_allowance + setting.medical_allowance + setting.special_allowance) : 2000
      const deduction = setting ? (setting.provident_fund_deduction + setting.tax_deduction + setting.other_deduction) : 0

      const newRecord: TeacherSalaryRecord = {
        id: `sal-${year}-${String(month).padStart(2, '0')}-${teacher.id}`,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        designation: (teacher.designation || 'ASSISTANT_TEACHER').replace(/_/g, ' '),
        department: teacher.department,
        month,
        year,
        baseSalary,
        bonus,
        deduction,
        houseAllowance: setting?.house_allowance ?? 0,
        medicalAllowance: setting?.medical_allowance ?? 0,
        paidAmount: 0,
        status: 'UNPAID',
        paymentMethod: setting?.payment_method ?? 'BANK',
        notes: '',
      }

      salaryStore.insert(newRecord)
      hasAdded = true
    }
  })

  return hasAdded
}

import { useSearchParams } from 'react-router-dom'

export function useTeacherSalary() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | 'ALL'>('ALL')
  const [records, setRecords] = useState<TeacherSalaryRecord[]>(() => {
    syncMonthRecords(now.getMonth() + 1, now.getFullYear())
    return salaryStore.getAll()
  })

  // Ensure current month records exist
  useEffect(() => {
    syncMonthRecords(month, year)
    setRecords(salaryStore.getAll())
  }, [month, year])

  // Refresh records listener
  const refreshRecords = useCallback(() => {
    setRecords(salaryStore.getAll())
  }, [])

  useEffect(() => {
    const unsubscribe = salaryStore.subscribe(refreshRecords)
    return () => unsubscribe()
  }, [refreshRecords])

  const filtered = useMemo(() =>
    records.filter(r =>
      r.month === month && r.year === year &&
      (statusFilter === 'ALL' || r.status === statusFilter) &&
      (!search ||
        r.teacherName.toLowerCase().includes(search.toLowerCase()) ||
        r.designation.toLowerCase().includes(search.toLowerCase()) ||
        (r.department && r.department.toLowerCase().includes(search.toLowerCase()))
      )
    ), [records, month, year, search, statusFilter])

  const stats = useMemo(() => {
    const monthSet = records.filter(r => r.month === month && r.year === year)
    return {
      total: monthSet.length,
      paid: monthSet.filter(r => r.status === 'PAID').length,
      unpaid: monthSet.filter(r => r.status === 'UNPAID').length,
      partial: monthSet.filter(r => r.status === 'PARTIAL').length,
      totalAmount: monthSet.reduce((a, r) => a + r.baseSalary + r.bonus - r.deduction, 0),
      paidAmount: monthSet.reduce((a, r) => a + r.paidAmount, 0),
      remainingAmount: monthSet.reduce((a, r) => {
        const net = r.baseSalary + r.bonus - r.deduction
        return a + Math.max(0, net - r.paidAmount)
      }, 0),
    }
  }, [records, month, year])

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const markAsPaid = (
    record: TeacherSalaryRecord,
    paidAmount: number,
    notes: string,
    paymentMethod: FinancePaymentMethod = 'BANK',
    updatedBonus?: number,
    updatedDeduction?: number
  ) => {
    const bonus = updatedBonus !== undefined ? updatedBonus : record.bonus
    const deduction = updatedDeduction !== undefined ? updatedDeduction : record.deduction
    const net = record.baseSalary + bonus - deduction
    const status: SalaryStatus = paidAmount >= net ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
    const paidDate = new Date().toISOString().split('T')[0]

    const updated = salaryStore.update(record.id, {
      bonus,
      deduction,
      paidAmount,
      status,
      notes,
      paymentMethod,
      paidDate,
    })

    // Log or sync transaction in central Finance
    if (paidAmount > 0) {
      const txId = `tx-sal-${record.id}`
      const existingTx = financeTransactionStore.getOne(txId) || financeTransactionStore.getWhere(t => t.reference_id === record.id)[0]
      const invoiceNo = `SAL-${record.year}-${String(record.month).padStart(2, '0')}-${record.teacherId}`

      const txPayload = {
        type: 'EXPENSE' as const,
        category: 'TEACHER_SALARY' as const,
        title: `Salary Disbursal - ${record.teacherName} (${MONTH_NAMES[record.month - 1]} ${record.year})`,
        amount: paidAmount,
        date: paidDate,
        month: record.month,
        year: record.year,
        payment_method: paymentMethod,
        reference_id: record.id,
        reference_type: 'SALARY' as const,
        invoice_no: invoiceNo,
        party_name: record.teacherName,
        party_id: record.teacherId,
        party_role: `Teacher (${record.designation})`,
        notes: notes || undefined,
        created_at: new Date().toISOString(),
      }

      if (existingTx) {
        financeTransactionStore.update(existingTx.id, txPayload)
      } else {
        financeTransactionStore.insert({
          id: txId,
          ...txPayload,
        })
      }
    }

    setRecords(prev => prev.map(r => r.id === record.id ? updated : r))
  }

  const generateSheet = () => {
    syncMonthRecords(month, year)
    setRecords(salaryStore.getAll())
  }

  return {
    month, year, search, statusFilter,
    setMonth, setYear, setSearch, setStatusFilter,
    prevMonth, nextMonth,
    records, filtered, stats,
    markAsPaid, generateSheet,
  }
}

// ── Hook: Teacher Individual Salary Settings ──────────────────────────────────

export function useTeacherSalarySettings() {
  const [settings, setSettings] = useState<TeacherSalarySetting[]>(() => {
    const allSettings = teacherSalarySettingStore.getAll()
    const teachers = teacherStore.getAll()
    const settingsMap = new Map(allSettings.map(s => [s.teacher_id, s]))

    // Merge any missing teacher with a default config
    teachers.forEach(t => {
      if (!settingsMap.has(t.id)) {
        const newSetting: TeacherSalarySetting = {
          id: `tss-${t.id}`,
          teacher_id: t.id,
          teacher_name: t.fullName,
          designation: (t.designation || 'ASSISTANT_TEACHER').replace(/_/g, ' '),
          department: t.department,
          base_salary: 22000,
          house_allowance: 3000,
          medical_allowance: 1200,
          special_allowance: 0,
          provident_fund_deduction: 1000,
          tax_deduction: 0,
          other_deduction: 0,
          payment_method: 'BANK',
          effective_from: '2024-01-01',
          is_active: true,
          updated_at: new Date().toISOString(),
        }
        teacherSalarySettingStore.insert(newSetting)
      }
    })

    return teacherSalarySettingStore.getAll()
  })

  const refreshSettings = useCallback(() => {
    setSettings(teacherSalarySettingStore.getAll())
  }, [])

  useEffect(() => {
    const unsubscribe = teacherSalarySettingStore.subscribe(refreshSettings)
    return () => unsubscribe()
  }, [refreshSettings])

  const saveSetting = (dto: UpdateTeacherSalarySettingDto) => {
    const existing = teacherSalarySettingStore.getWhere(s => s.teacher_id === dto.teacher_id)[0]
    const teacher = teacherStore.getOne(dto.teacher_id)
    const teacherName = teacher ? teacher.fullName : 'Teacher'
    const designation = teacher ? (teacher.designation || 'ASSISTANT_TEACHER').replace(/_/g, ' ') : 'Teacher'
    const department = teacher?.department

    if (existing) {
      teacherSalarySettingStore.update(existing.id, {
        ...dto,
        updated_at: new Date().toISOString(),
      })
    } else {
      const newSetting: TeacherSalarySetting = {
        id: `tss-${dto.teacher_id}`,
        teacher_id: dto.teacher_id,
        teacher_name: teacherName,
        designation,
        department,
        base_salary: dto.base_salary,
        house_allowance: dto.house_allowance ?? 0,
        medical_allowance: dto.medical_allowance ?? 0,
        special_allowance: dto.special_allowance ?? 0,
        provident_fund_deduction: dto.provident_fund_deduction ?? 0,
        tax_deduction: dto.tax_deduction ?? 0,
        other_deduction: dto.other_deduction ?? 0,
        payment_method: dto.payment_method ?? 'BANK',
        bank_name: dto.bank_name,
        account_number: dto.account_number,
        effective_from: new Date().toISOString().split('T')[0],
        notes: dto.notes,
        is_active: true,
        updated_at: new Date().toISOString(),
      }
      teacherSalarySettingStore.insert(newSetting)
    }

    refreshSettings()
  }

  return {
    settings,
    saveSetting,
    refreshSettings,
  }
}

// ── Hook: Teacher Salary History ──────────────────────────────────────────────

export function useTeacherSalaryHistory(teacherId?: string) {
  const [history, setHistory] = useState<TeacherSalaryRecord[]>(() => {
    const all = salaryStore.getAll().sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })
    return teacherId ? all.filter(r => r.teacherId === teacherId) : all
  })

  useEffect(() => {
    const refresh = () => {
      const all = salaryStore.getAll().sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year
        return b.month - a.month
      })
      setHistory(teacherId ? all.filter(r => r.teacherId === teacherId) : all)
    }
    const unsubscribe = salaryStore.subscribe(refresh)
    return () => unsubscribe()
  }, [teacherId])

  return history
}
