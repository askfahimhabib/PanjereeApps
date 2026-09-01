import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Section, SectionStudent, RollAssignStrategy } from './types'
import { sectionStore, studentStore, examStore } from '@/data/stores'
import { examResultStore } from '@/features/examHeld/hooks/useExamResults'
import {
  deriveStudentFeeStatus,
  deriveStudentAttendanceRate,
  deriveStudentExamPerformance,
} from '@/features/payments/utils/feeStatus'

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
  const [sections, setSections] = useState<Section[]>(() => sectionStore.getAll())
  const [refreshKey, setRefreshKey] = useState(0)

  const section = useMemo(() => {
    return sections.find(s => s.id === sectionId) ?? null
  }, [sections, sectionId])

  const initialStudents: SectionStudent[] = useMemo(() => {
    if (!section) return []
    return studentStore.getWhere(s => {
      if (s.classId !== section.classId) return false
      if (section.groupId && s.groupId?.toUpperCase() !== section.groupName?.toUpperCase()) return false
      return s.sectionId === section.id || s.sectionName === section.name
    }).map(s => {
      const perf = deriveStudentExamPerformance(s.id)
      const validStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' =
        s.status === 'ACTIVE' ? 'ACTIVE' : s.status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE'

      return {
        id: s.id,
        roll: parseInt(s.rollNumber) || 0,
        rollPrefix: (s.className || '') + ' ' + (s.sectionName || ''),
        studentId: s.studentId,
        fullNameEn: s.fullNameEn,
        fullNameBn: s.fullNameBn || '',
        gender: s.gender,
        profilePhoto: s.profilePhoto,
        attendanceRate: deriveStudentAttendanceRate(s.id),
        feeStatus: deriveStudentFeeStatus(s.id),
        status: validStatus,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        groupId: s.groupId,
        mobile: s.mobile,
        guardianPhone: s.guardian?.mobile || s.father?.mobile || s.mother?.mobile,
        admissionDate: s.admissionDate,
        latestGpa: perf.latestGpa,
        latestGrade: perf.latestGrade,
      }
    }).sort((a, b) => a.roll - b.roll)
  }, [section, refreshKey])

  const [students, setStudents] = useState<SectionStudent[]>(initialStudents)

  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  // Same-class sections excluding current (for transfer)
  const availableSections = useMemo(() => {
    return sections.filter(s => s.classId === section?.classId && s.id !== sectionId)
  }, [sections, section?.classId, sectionId])

  // Available Exams for this section's class
  const classExams = useMemo(() => {
    if (!section) return []
    return examStore.getWhere(e => e.class_id === section.classId || e.target_type === 'CLASS')
  }, [section])

  // ── Toggle Roll Freeze ────────────────────────────────────────────────────
  const toggleRollFreeze = useCallback(() => {
    if (!sectionId) return
    const current = sectionStore.getWhere(s => s.id === sectionId)[0]
    if (!current) return
    const nextVal = !current.isRollFrozen
    sectionStore.update(sectionId, { isRollFrozen: nextVal })
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, isRollFrozen: nextVal } : s))
    )
  }, [sectionId])

  // ── Auto-assign Roll Numbers ──────────────────────────────────────────────
  const autoAssignRolls = useCallback((strategy: RollAssignStrategy, selectedExamId?: string) => {
    if (!section || section.isRollFrozen) return

    const currentList = [...students]

    if (strategy === 'ALPHABETICAL') {
      currentList.sort((a, b) => a.fullNameEn.localeCompare(b.fullNameEn))
    } else if (strategy === 'ADMISSION_DATE') {
      currentList.sort((a, b) => (a.admissionDate || '').localeCompare(b.admissionDate || ''))
    } else if (strategy === 'EXAM_MERIT') {
      // Calculate scores for each student
      const examId = selectedExamId || classExams[0]?.id
      const scoreMap = new Map<string, number>()
      if (examId) {
        const examResults = examResultStore.getWhere(r => r.exam_held_id === examId)
        examResults.forEach(r => {
          const prev = scoreMap.get(r.student_id) || 0
          scoreMap.set(r.student_id, prev + (r.marks_obtained || 0))
        })
      }
      currentList.sort((a, b) => {
        const scoreA = scoreMap.get(a.id) || (a.latestGpa ? a.latestGpa * 100 : 0)
        const scoreB = scoreMap.get(b.id) || (b.latestGpa ? b.latestGpa * 100 : 0)
        return scoreB - scoreA
      })
    }

    // Apply new serial rolls 1, 2, 3...
    currentList.forEach((s, index) => {
      const newRoll = index + 1
      studentStore.update(s.id, { rollNumber: String(newRoll).padStart(2, '0') })
    })

    setRefreshKey(k => k + 1)
  }, [section, students, classExams])

  // ── Swap Student Rolls ────────────────────────────────────────────────────
  const swapStudentRolls = useCallback((studentId1: string, studentId2: string) => {
    if (!section || section.isRollFrozen) return
    const s1 = students.find(s => s.id === studentId1)
    const s2 = students.find(s => s.id === studentId2)
    if (!s1 || !s2) return

    const roll1 = s1.roll
    const roll2 = s2.roll

    studentStore.update(s1.id, { rollNumber: String(roll2).padStart(2, '0') })
    studentStore.update(s2.id, { rollNumber: String(roll1).padStart(2, '0') })

    setRefreshKey(k => k + 1)
  }, [section, students])

  // ── Set Manual Roll ───────────────────────────────────────────────────────
  const setManualRoll = useCallback((studentId: string, newRoll: number) => {
    if (!section || section.isRollFrozen) return
    studentStore.update(studentId, { rollNumber: String(newRoll).padStart(2, '0') })
    setRefreshKey(k => k + 1)
  }, [section])

  // ── Transfer Student ──────────────────────────────────────────────────────
  const transferStudent = useCallback((studentId: string, toSectionId: string) => {
    const toSection = sectionStore.getWhere(s => s.id === toSectionId)[0]
    if (!toSection) return

    studentStore.update(studentId, {
      sectionId: toSection.id,
      sectionName: toSection.name,
    })

    setRefreshKey(k => k + 1)
  }, [])

  // ── Edit Section ──────────────────────────────────────────────────────────
  const editSection = useCallback((formData: EditSectionFormData) => {
    if (!sectionId) return
    sectionStore.update(sectionId, {
      name: formData.name.toUpperCase(),
      capacity: formData.capacity,
      classTeacherId: formData.classTeacherId || undefined,
      classTeacherName: formData.classTeacherName || undefined,
      status: formData.status,
    })
    setSections(sectionStore.getAll())
  }, [sectionId])

  return {
    section,
    students,
    availableSections,
    classExams,
    toggleRollFreeze,
    autoAssignRolls,
    swapStudentRolls,
    setManualRoll,
    editSection,
    transferStudent,
  }
}

