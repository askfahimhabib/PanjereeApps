import { useState, useCallback, useMemo } from 'react'
import type { ClassItem, Section, ClassGroup } from './types'
import { classStore, sectionStore, studentStore } from '@/data/stores'
import { groupStore } from '@/data/stores'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AddSectionFormData {
  name: string
  capacity: number
  classTeacherId: string
  classTeacherName: string
}

export interface UpdateFeeFormData {
  feeMonthly: number
  feeAdmission: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSectionId(classId: string, name: string): string {
  return `sec-${classId}-${name.toLowerCase()}-${Date.now()}`
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useClassDetail(classId: string | undefined) {
  const [baseClasses, setClasses] = useState<ClassItem[]>(() => classStore.getAll())
  const [baseSections, setSections] = useState<Section[]>(() => sectionStore.getAll())
  const [refreshKey, setRefreshKey] = useState(0) // Used to force re-computation when students mutate
  
  // Dynamically compute group stats based on MOCK_STUDENTS and baseSections
  const groups: ClassGroup[] = useMemo(() => {
    return groupStore.getWhere(g => g.classId === classId).map(g => {
      const groupStudents = studentStore.getWhere(s => s.classId === classId && s.groupId === g.name)
      const groupSections = baseSections.filter(s => s.classId === classId && s.groupId === g.id)
      
      return {
        ...g,
        totalStudents: groupStudents.length,
        totalSections: groupSections.length,
      }
    })
  }, [classId, baseSections, refreshKey])

  // Dynamically compute section stats based on MOCK_STUDENTS
  const sections = useMemo(() => {
    return baseSections.map(sec => {
      const secStudents = studentStore.getWhere(s => {
        if (s.classId !== sec.classId) return false
        if (sec.groupId && s.groupId?.toUpperCase() !== sec.groupName?.toUpperCase()) return false
        
        return s.sectionId === sec.id || s.sectionName === sec.name
      })
      
      const totalStudents = secStudents.length
      const maleCount = secStudents.filter(s => s.gender === 'MALE').length
      const femaleCount = secStudents.filter(s => s.gender === 'FEMALE').length
      
      const paidStudents = secStudents.filter(s => (s as any).feeStatus === 'PAID').length
      const feeCollectionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0
      
      const attendanceRate = totalStudents > 0
        ? Math.round(secStudents.reduce((sum, s) => sum + ((s as any).attendanceRate || 0), 0) / totalStudents)
        : 0

      return {
        ...sec,
        totalStudents,
        maleCount,
        femaleCount,
        attendanceRate,
        feeCollectionRate,
      }
    })
  }, [baseSections, refreshKey])

  // ── Derived data ──────────────────────────────────────────────────────────
  const baseClassData = baseClasses.find(c => c.id === classId) ?? null

  const classStudents = useMemo(() => {
    if (!classId) return []
    return studentStore.getWhere(s => s.classId === classId).map(s => ({
      id: s.id,
      roll: parseInt(s.rollNumber) || 0,
      rollPrefix: s.sectionName ? `${s.className || ''} ${s.sectionName}` : (s.className || ''),
      studentId: s.studentId,
      fullNameEn: s.fullNameEn,
      fullNameBn: s.fullNameBn || '',
      gender: s.gender,
      attendanceRate: Math.floor(Math.random() * 30) + 70,
      feeStatus: (Math.random() > 0.2 ? 'PAID' : 'DUE') as 'PAID' | 'DUE' | 'PARTIAL',
      status: (s.status === 'ACTIVE' ? 'ACTIVE' : (s.status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE')) as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
      sectionId: s.sectionId,
      sectionName: s.sectionName,
    }))
  }, [classId, refreshKey])

  const classData = useMemo(() => {
    if (!baseClassData || !classId) return null
    const totalStudents = classStudents.length
    const totalSections = sections.filter(s => s.classId === classId).length
    
    return {
      ...baseClassData,
      totalStudents,
      totalSections,
    }
  }, [baseClassData, classId, sections, classStudents])

  const classSections = sections.filter(
    s => s.classId === classId && !s.groupId
  )

  const getGroupSections = useCallback(
    (groupId: string) => sections.filter(s => s.groupId === groupId),
    [sections]
  )

  const getGroupStudents = useCallback(
    (groupId: string) => {
      const group = groupStore.getWhere(g => g.id === groupId)[0]
      if (!group) return []
      return classStudents.filter(s => {
        const student = studentStore.getWhere(ms => ms.id === s.id)[0]
        return student?.groupId === group.name
      })
    },
    [classStudents]
  )

  // ── Add Section ───────────────────────────────────────────────────────────
  const addSection = useCallback(
    (formData: AddSectionFormData, groupId?: string, groupName?: string) => {
      if (!classId || !classData) return

      const newSection: Section = {
        id: generateSectionId(classId, formData.name),
        classId,
        className: classData.name,
        groupId,
        groupName,
        name: formData.name.toUpperCase(),
        capacity: formData.capacity,
        totalStudents: 0,
        maleCount: 0,
        femaleCount: 0,
        classTeacherId: formData.classTeacherId || undefined,
        classTeacherName: formData.classTeacherName || undefined,
        status: 'ACTIVE',
        isRollFrozen: false,
        shift: classData.shift,
        academicYear: classData.academicYear,
      }

      // Check if this is the first section being added to this class (or group)
      const existingSections = sectionStore.getWhere(s => s.classId === classId && s.groupId === groupId)
      const isFirstSection = existingSections.length === 0

      if (isFirstSection) {
        // Move all students in this class/group to this new section automatically
        studentStore.getWhere(student => student.classId === classId).forEach(student => {
          if (!groupId || student.groupId === groupName) {
            studentStore.update(student.id, { sectionId: newSection.id, sectionName: newSection.name })
          }
        })
      }

      sectionStore.insert(newSection)
      setSections(prev => [...prev, newSection])

      // Update class total sections count
      setClasses(prev =>
        prev.map(c =>
          c.id === classId
            ? { ...c, totalSections: c.totalSections + 1 }
            : c
        )
      )
    },
    [classId, classData]
  )

  // ── Delete Section ────────────────────────────────────────────────────────
  const deleteSection = useCallback(
    (sectionId: string) => {
      setSections(prev => prev.filter(s => s.id !== sectionId))

      if (classId) {
        setClasses(prev =>
          prev.map(c =>
            c.id === classId
              ? { ...c, totalSections: Math.max(0, c.totalSections - 1) }
              : c
          )
        )
      }
    },
    [classId]
  )

  // ── Update Fee ────────────────────────────────────────────────────────────
  const updateFee = useCallback(
    (formData: UpdateFeeFormData) => {
      if (!classId) return
      setClasses(prev =>
        prev.map(c =>
          c.id === classId
            ? { ...c, feeMonthly: formData.feeMonthly }
            : c
        )
      )
    },
    [classId]
  )

  // ── Edit / Delete Class ───────────────────────────────────────────────────
  const editClass = useCallback((data: { name: string; shift: import('./types').ShiftType }) => {
    if (!classId) return
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...data } : c))
  }, [classId])

  const deleteClass = useCallback(() => {
    if (!classId) return
    setClasses(prev => prev.filter(c => c.id !== classId))
  }, [classId])

  // ── Toggle Roll Freeze (used in SectionDetail) ────────────────────────────
  const toggleRollFreeze = useCallback((sectionId: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, isRollFrozen: !s.isRollFrozen } : s
      )
    )
  }, [])

  // ── Assign Student to Section ─────────────────────────────────────────────
  const assignStudentToSection = useCallback((studentId: string, toSectionId: string) => {
    const section = sectionStore.getWhere(s => s.id === toSectionId)[0]
    if (!section) return

    const existing = studentStore.getWhere(s => s.id === studentId)[0]
    if (existing) {
      studentStore.update(studentId, { sectionId: section.id, sectionName: section.name })
      setRefreshKey(prev => prev + 1) // Force re-render
    }
  }, [])

  return {
    classData,
    classSections,
    groups,
    getGroupSections,
    addSection,
    deleteSection,
    updateFee,
    editClass,
    deleteClass,
    toggleRollFreeze,
    sections,
    classStudents,
    getGroupStudents,
    assignStudentToSection,
  }
}
