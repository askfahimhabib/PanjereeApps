import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Section, SectionStudent } from './types'
import { mockSections } from './mockData'
import { MOCK_STUDENTS } from '../students/mockData'
import { createStore } from '@/lib/localStore'
import type { PaymentRecord } from '@/features/payments/types'

// ─── Payment store (read-only, for fee status lookup) ────────────────────────
const paymentStore = createStore<PaymentRecord>('payments')

/**
 * Derives fee status for a student based on real payment records.
 * - PAID   : has a non-refunded payment in the current month
 * - PARTIAL: has a manual-due entry that is partially covered (future)
 * - DUE    : no payment found this month
 */
function deriveFeeStatus(studentId: string): 'PAID' | 'DUE' | 'PARTIAL' {
  const now = new Date()
  const thisMonth = now.getMonth() + 1
  const thisYear  = now.getFullYear()

  const paid = paymentStore.getWhere(p =>
    p.student_id === studentId &&
    p.status !== 'REFUNDED' &&
    p.items.some(item =>
      item.fee_type === 'TUITION' &&
      item.month === thisMonth &&
      item.year  === thisYear
    )
  )

  if (paid.length > 0) return 'PAID'

  // Check if any non-tuition payment was made this month (partial coverage)
  const anyThisMonth = paymentStore.getWhere(p =>
    p.student_id === studentId &&
    p.status !== 'REFUNDED' &&
    p.items.some(item => item.month === thisMonth && item.year === thisYear)
  )
  if (anyThisMonth.length > 0) return 'PARTIAL'

  return 'DUE'
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EditSectionFormData {
  name: string
  capacity: number
  classTeacherId: string
  classTeacherName: string
  status: 'ACTIVE' | 'INACTIVE'
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSectionDetail(sectionId: string | undefined) {
  const [sections, setSections] = useState<Section[]>(mockSections)
  const section = sections.find(s => s.id === sectionId) ?? null

  const initialStudents: SectionStudent[] = useMemo(() => {
    if (!section) return []
    // Match students dynamically from MOCK_STUDENTS by classId and sectionName
    return MOCK_STUDENTS.filter(s => {
      if (s.classId !== section.classId) return false
      // If the section belongs to a group, ensure the student is also in that group
      if (section.groupId && s.groupId?.toUpperCase() !== section.groupName?.toUpperCase()) return false
      return s.sectionId === section.id || s.sectionName === section.name
    }).map(s => ({
      id: s.id,
      roll: parseInt(s.rollNumber) || 0,
      rollPrefix: (s.className || '') + ' ' + (s.sectionName || ''),
      studentId: s.studentId,
      fullNameEn: s.fullNameEn,
      fullNameBn: s.fullNameBn || '',
      gender: s.gender,
      attendanceRate: Math.floor(Math.random() * 30) + 70, // Mock attendance 70-100
      feeStatus: deriveFeeStatus(s.id), // Real: derived from payment records for current month
      status: s.status === 'ACTIVE' ? 'ACTIVE' : (s.status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE'),
      sectionId: s.sectionId,
      sectionName: s.sectionName,
    }))
  }, [section])

  const [students, setStudents] = useState<SectionStudent[]>(initialStudents)

  // Re-sync if initialStudents changes (e.g. section ID changes)
  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  // Same-class sections excluding current (for transfer)
  const availableSections = sections.filter(
    s => s.classId === section?.classId && s.id !== sectionId
  )

  // ── Toggle Roll Freeze ────────────────────────────────────────────────────
  const toggleRollFreeze = useCallback(() => {
    if (!sectionId) return
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, isRollFrozen: !s.isRollFrozen } : s
      )
    )
  }, [sectionId])

  // ── Auto-assign Roll Numbers ──────────────────────────────────────────────
  const autoAssignRolls = useCallback(() => {
    // In real app this would update student roll numbers
    // For now just a no-op that can be wired later
    console.log('Auto-assigning rolls alphabetically for section:', sectionId)
  }, [sectionId])

  // ── Transfer Student ──────────────────────────────────────────────────────
  const transferStudent = useCallback(
    (studentId: string, toSectionId: string) => {
      // Remove student from current section list
      setStudents(prev => prev.filter(s => s.id !== studentId))

      // Update student counts on both sections
      setSections(prev =>
        prev.map(s => {
          if (s.id === sectionId)
            return { ...s, totalStudents: Math.max(0, s.totalStudents - 1) }
          if (s.id === toSectionId)
            return { ...s, totalStudents: s.totalStudents + 1 }
          return s
        })
      )
    },
    [sectionId]
  )

  // ── Edit Section ──────────────────────────────────────────────────────────
  const editSection = useCallback(
    (formData: EditSectionFormData) => {
      if (!sectionId) return
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                name: formData.name.toUpperCase(),
                capacity: formData.capacity,
                classTeacherId: formData.classTeacherId || undefined,
                classTeacherName: formData.classTeacherName || undefined,
                status: formData.status,
              }
            : s
        )
      )
    },
    [sectionId]
  )

  return {
    section,
    students,
    availableSections,
    toggleRollFreeze,
    autoAssignRolls,
    editSection,
    transferStudent,
  }
}
