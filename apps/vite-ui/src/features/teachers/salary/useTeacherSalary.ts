import { useState, useMemo } from 'react'
import { salaryStore } from '@/data/stores'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SalaryStatus = 'PAID' | 'UNPAID' | 'PARTIAL'

export interface TeacherSalaryRecord {
  id: string
  teacherId: string
  teacherName: string
  designation: string
  month: number
  year: number
  baseSalary: number
  bonus: number
  deduction: number
  paidAmount: number
  status: SalaryStatus
  paidDate?: string
  notes?: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTeacherSalary() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState<TeacherSalaryRecord[]>(() => salaryStore.getAll())

  const filtered = useMemo(() =>
    records.filter(r =>
      r.month === month && r.year === year &&
      (!search || r.teacherName.includes(search) || r.designation.includes(search))
    ), [records, month, year, search])

  const stats = useMemo(() => ({
    total:   filtered.length,
    paid:    filtered.filter(r => r.status === 'PAID').length,
    unpaid:  filtered.filter(r => r.status === 'UNPAID').length,
    partial: filtered.filter(r => r.status === 'PARTIAL').length,
    totalAmount:  filtered.reduce((a, r) => a + r.baseSalary + r.bonus - r.deduction, 0),
    paidAmount:   filtered.reduce((a, r) => a + r.paidAmount, 0),
  }), [filtered])

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const markAsPaid = (record: TeacherSalaryRecord, paidAmount: number, notes: string) => {
    const net = record.baseSalary + record.bonus - record.deduction
    const status: SalaryStatus = paidAmount >= net ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
    const updated = salaryStore.update(record.id, {
      paidAmount,
      status,
      notes,
      paidDate: new Date().toISOString().split('T')[0],
    })
    setRecords(prev => prev.map(r => r.id === record.id ? updated : r))
  }

  return {
    month, year, search,
    setSearch, prevMonth, nextMonth,
    filtered, stats,
    markAsPaid,
  }
}
