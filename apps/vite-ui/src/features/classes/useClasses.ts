import { useState, useMemo } from 'react'
import type { ClassItem, ShiftType } from './types'
import { classStore, paymentStore, sectionStore, groupStore } from '@/data/stores'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AddClassFormData {
  name: string
  numericName: number
  academicYear: string
  shift: ShiftType
  hasGroups: boolean
  feeMonthly: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateClassId(): string {
  return `cls-custom-${Date.now()}`
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useClasses() {
  const [baseClasses, setClasses] = useState<ClassItem[]>(() =>
    // Migrate old records that predate the isActive field — default to true
    classStore.getAll().map(c => ({ ...c, isActive: c.isActive ?? true }))
  )

  // Dynamically compute stats for each class
  const classes = useMemo(() => {
    const allStudentsRaw = localStorage.getItem('lms_store_students')
    const allStudents: Array<{ id?: string; classId?: string; attendanceRate?: number }> =
      allStudentsRaw ? JSON.parse(allStudentsRaw) : []

    // Current month's paid student IDs per class — from real payment records
    const now = new Date()
    const thisMonth = now.getMonth() + 1
    const thisYear  = now.getFullYear()

    const paidThisMonth = paymentStore.getWhere(p =>
      p.status !== 'REFUNDED' &&
      p.items.some(item =>
        item.fee_type === 'TUITION' &&
        item.month === thisMonth &&
        item.year  === thisYear
      )
    )

    // Build a Set of student IDs who have paid tuition this month
    const paidStudentIds = new Set(paidThisMonth.map(p => p.student_id))

    // Also compute total collected per class (all time, current month)
    const collectedThisMonthByClass = new Map<string, number>()
    paidThisMonth.forEach(p => {
      if (p.class_id) {
        const prev = collectedThisMonthByClass.get(p.class_id) ?? 0
        collectedThisMonthByClass.set(p.class_id, prev + p.total_amount)
      }
    })

    return baseClasses.map(cls => {
      const classStudents = allStudents.filter(s => s.classId === cls.id)
      const totalStudents = classStudents.length
      const totalSections = sectionStore.getWhere(s => s.classId === cls.id).length

      const classGroups = groupStore.getWhere(g => g.classId === cls.id)
      const totalGroups = classGroups.length

      // Real fee collection rate from payment records
      const paidCount = classStudents.filter(s => s.id && paidStudentIds.has(s.id)).length
      const feeCollectionRate = totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0

      const attendanceRate = totalStudents > 0
        ? Math.round(classStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / totalStudents)
        : 0

      return {
        ...cls,
        totalStudents,
        totalSections,
        totalGroups: cls.hasGroups ? totalGroups : undefined,
        attendanceRate,
        feeCollectionRate,
        groups: cls.hasGroups ? classGroups.map(g => ({ id: g.id, name: g.name })) : undefined,
      }
    })
  }, [baseClasses])

  // ── Stats ─────────────────────────────────────────────────────────────────
  // Real total collected this month across all classes
  const now = new Date()
  const thisMonth = now.getMonth() + 1
  const thisYear  = now.getFullYear()
  const totalCollectedThisMonth = paymentStore
    .getWhere(p => {
      if (p.status === 'REFUNDED') return false
      const d = new Date(p.paid_at)
      return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((sum, p) => sum + p.total_amount, 0)

  const stats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((s, c) => s + c.totalStudents, 0),
    totalSections: classes.reduce((s, c) => s + c.totalSections, 0),
    feeCollected: totalCollectedThisMonth,
  }

  // ── Add Class ─────────────────────────────────────────────────────────────
  function addClass(formData: AddClassFormData) {
    const newClass: ClassItem = {
      id: generateClassId(),
      name: formData.name,
      numericName: formData.numericName,
      academicYear: formData.academicYear,
      shift: formData.shift,
      hasGroups: formData.hasGroups,
      totalStudents: 0,
      totalSections: 0,
      totalGroups: formData.hasGroups ? 0 : undefined,
      feeMonthly: formData.feeMonthly || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    classStore.insert(newClass)
    setClasses(prev => [...prev, newClass])
  }

  // ── Toggle Active ─────────────────────────────────────────────────────────
  function toggleClassActive(classId: string) {
    const cls = baseClasses.find(c => c.id === classId)
    if (!cls) return
    const updated = classStore.update(classId, { isActive: !cls.isActive })
    setClasses(prev => prev.map(c => c.id === classId ? updated : c))
  }

  // ── Delete Class ──────────────────────────────────────────────────────────
  function deleteClass(classId: string) {
    classStore.remove(classId)
    setClasses(prev => prev.filter(c => c.id !== classId))
  }

  return {
    classes,
    stats,
    addClass,
    toggleClassActive,
    deleteClass,
  }
}
