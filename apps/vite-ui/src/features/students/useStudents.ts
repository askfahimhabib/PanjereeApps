import { useState, useMemo, useEffect } from 'react'
import { studentStore as store, classStore, sectionStore, batchStore } from '@/data/stores'
import type { Student, StudentType, StudentStatus, StudentFormData } from './types'
import { initialFormData } from './types'
import { deriveStudentFeeStatus } from '@/features/payments/utils/feeStatus'

const PAGE_SIZE = 10

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudentFilters {
  search: string
  type: StudentType | 'ALL'
  classId: string
  batchId: string
  feeStatus: 'ALL' | 'PAID' | 'DUE' | 'PARTIAL'
  status: StudentStatus | 'ALL'
  isAlumni?: boolean
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStudents(initialIsAlumni: boolean = false) {
  const [students, setStudents]               = useState<Student[]>(() => store.getAll())
  const [filters, setFilters]                 = useState<StudentFilters>({
    search: '',
    type: 'ALL',
    classId: '',
    batchId: '',
    feeStatus: 'ALL',
    status: 'ALL',
    isAlumni: initialIsAlumni,
  })
  const [currentPage, setCurrentPage]         = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDrawerOpen, setIsDrawerOpen]       = useState(false)
  const [isModalOpen, setIsModalOpen]         = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [formData, setFormData]               = useState<StudentFormData>(initialFormData)
  const [currentStep, setCurrentStep]         = useState(1)

  // Sync state from store on mount
  useEffect(() => {
    setStudents(store.getAll())
  }, [])

  // ── Derived stats ──────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     students.length,
    regular:   students.filter(s => s.type === 'REGULAR').length,
    examBatch: students.filter(s => s.type === 'EXAM_BATCH').length,
    active:    students.filter(s => s.status === 'ACTIVE').length,
  }), [students])

  // ── Filtered students ──────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = filters.search.toLowerCase()
      const matchesSearch =
        !q ||
        s.fullNameEn.toLowerCase().includes(q) ||
        (s.fullNameBn && s.fullNameBn.includes(q)) ||
        s.studentId.toLowerCase().includes(q) ||
        s.rollNumber.includes(q) ||
        s.mobile.includes(q) ||
        (s.schoolName && s.schoolName.toLowerCase().includes(q)) ||
        (s.className && s.className.toLowerCase().includes(q)) ||
        (s.batchName && s.batchName.toLowerCase().includes(q))

      const matchesType    = filters.type === 'ALL' || s.type === filters.type
      const matchesClass   = !filters.classId || s.classId === filters.classId
      const matchesBatch   = !filters.batchId || s.batchId === filters.batchId
      const matchesStatus  = filters.status === 'ALL' || s.status === filters.status

      const feeStatus = deriveStudentFeeStatus(s.id)
      const matchesFee     = filters.feeStatus === 'ALL' || feeStatus === filters.feeStatus

      const isAlumniStudent = ['PASSED', 'LEFT', 'SUSPENDED'].includes(s.status)
      const matchesAlumni  = filters.isAlumni ? isAlumniStudent : !isAlumniStudent

      return matchesSearch && matchesType && matchesClass && matchesBatch && matchesFee && matchesStatus && matchesAlumni
    })
  }, [students, filters])

  // ── Pagination ─────────────────────────────────────────────
  const totalPages        = Math.ceil(filteredStudents.length / PAGE_SIZE)
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredStudents.slice(start, start + PAGE_SIZE)
  }, [filteredStudents, currentPage])

  // ── Filter helpers ─────────────────────────────────────────
  function updateFilter<K extends keyof StudentFilters>(key: K, value: StudentFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  function resetFilters() {
    setFilters({
      search: '',
      type: 'ALL',
      classId: '',
      batchId: '',
      feeStatus: 'ALL',
      status: 'ALL',
      isAlumni: filters.isAlumni,
    })
    setCurrentPage(1)
  }

  // ── Drawer ─────────────────────────────────────────────────
  function openDrawer(student: Student) {
    setSelectedStudent(student)
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedStudent(null), 300)
  }

  // ── Modal / Stepper ────────────────────────────────────────
  function openModal(defaultType?: StudentType) {
    setEditingStudentId(null)
    setFormData({
      ...initialFormData,
      type: defaultType || 'REGULAR',
    })
    setCurrentStep(1)
    setIsModalOpen(true)
  }

  function openEditModal(student: Student) {
    setEditingStudentId(student.id)
    setFormData({
      type: student.type || 'REGULAR',
      fullNameEn: student.fullNameEn,
      fullNameBn: student.fullNameBn || '',
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup || '',
      mobile: student.mobile,
      email: student.email || '',
      profilePhoto: student.profilePhoto || '',

      classId: student.classId || '',
      className: student.className || '',
      sectionId: student.sectionId || '',
      sectionName: student.sectionName || '',
      rollNumber: student.rollNumber || '',
      groupId: student.groupId || '',
      shift: student.shift || 'DAY',

      batchId: student.batchId || '',
      batchName: student.batchName || '',
      batchSectionId: student.batchSectionId || '',
      batchSectionName: student.batchSectionName || '',
      targetExam: student.targetExam || 'SSC',
      schoolName: student.schoolName || '',

      version: student.version || 'BANGLA',
      session: student.session || new Date().getFullYear().toString(),
      admissionDate: student.admissionDate || new Date().toISOString().split('T')[0],
      admissionNumber: student.admissionNumber || '',
      status: student.status || 'ACTIVE',

      fatherName: student.father?.name || '',
      fatherMobile: student.father?.mobile || '',
      fatherOccupation: student.father?.occupation || '',
      motherName: student.mother?.name || '',
      motherMobile: student.mother?.mobile || '',
      motherOccupation: student.mother?.occupation || '',
      hasGuardian: !!student.guardian,
      guardianName: student.guardian?.name || '',
      guardianRelation: student.guardian?.relation || '',
      guardianMobile: student.guardian?.mobile || '',
      presentAddress: student.presentAddress || '',
      permanentAddress: student.permanentAddress || '',
      sameAddress: !student.permanentAddress || student.presentAddress === student.permanentAddress,
    })
    setCurrentStep(1)
    setIsModalOpen(true)
    closeDrawer()
  }

  function closeModal() {
    setIsModalOpen(false)
    setFormData(initialFormData)
    setCurrentStep(1)
    setEditingStudentId(null)
  }

  function updateFormData(partial: Partial<StudentFormData>) {
    setFormData(prev => ({ ...prev, ...partial }))
  }

  function nextStep() { setCurrentStep(s => Math.min(s + 1, 2)) }
  function prevStep() { setCurrentStep(s => Math.max(s - 1, 1)) }

  // ── Submit ─────────────────────────────────────────────────
  function submitStudent(addAnother: boolean = false) {
    const now = new Date().toISOString()

    // Resolve class & batch names
    const matchedClass = formData.classId ? classStore.getOne(formData.classId) : null
    const matchedSection = formData.sectionId ? sectionStore.getOne(formData.sectionId) : null
    const matchedBatch = formData.batchId ? batchStore.getOne(formData.batchId) : null

    const studentData: Partial<Student> = {
      updatedAt:          now,
      updatedBy:          'admin',
      fullNameEn:         formData.fullNameEn.trim(),
      fullNameBn:         formData.fullNameBn.trim() || undefined,
      gender:             formData.gender as Student['gender'],
      dateOfBirth:        formData.dateOfBirth,
      bloodGroup:         formData.bloodGroup || undefined,
      type:               formData.type,
      profilePhoto:       formData.profilePhoto || undefined,

      // Regular
      classId:            formData.type === 'REGULAR' ? formData.classId : undefined,
      className:          formData.type === 'REGULAR' ? (matchedClass?.name || formData.className) : undefined,
      sectionId:          formData.type === 'REGULAR' ? formData.sectionId : undefined,
      sectionName:        formData.type === 'REGULAR' ? (matchedSection?.name || formData.sectionName) : undefined,
      groupId:            formData.type === 'REGULAR' ? (formData.groupId || undefined) : undefined,
      shift:              formData.type === 'REGULAR' ? (formData.shift || undefined) : undefined,

      // Batch
      batchId:            formData.type === 'EXAM_BATCH' ? formData.batchId : undefined,
      batchName:          formData.type === 'EXAM_BATCH' ? (matchedBatch?.name || formData.batchName) : undefined,
      targetExam:         formData.type === 'EXAM_BATCH' ? (formData.targetExam || undefined) : undefined,
      schoolName:         formData.type === 'EXAM_BATCH' ? formData.schoolName : undefined,

      // Common
      version:            formData.version as Student['version'] || 'BANGLA',
      session:            formData.session,
      admissionDate:      formData.admissionDate,
      admissionNumber:    formData.admissionNumber || undefined,
      status:             formData.status,
      mobile:             formData.mobile.trim(),
      email:              formData.email.trim() || undefined,
      presentAddress:     formData.presentAddress.trim(),
      permanentAddress:   formData.sameAddress ? formData.presentAddress.trim() : formData.permanentAddress.trim() || undefined,

      father: {
        name:       formData.fatherName.trim(),
        mobile:     formData.fatherMobile.trim(),
        occupation: formData.fatherOccupation.trim(),
      },
      mother: {
        name:       formData.motherName.trim(),
        mobile:     formData.motherMobile.trim(),
        occupation: formData.motherOccupation.trim(),
      },
      guardian: formData.hasGuardian ? {
        name:     formData.guardianName.trim(),
        relation: formData.guardianRelation.trim(),
        mobile:   formData.guardianMobile.trim(),
        address:  formData.presentAddress.trim(),
      } : undefined,

      username:         formData.fullNameEn.toLowerCase().replace(/\s+/g, '') + (formData.rollNumber || '1'),
      loginStatus:      'ACTIVE',
    }

    if (editingStudentId) {
      const updated = store.update(editingStudentId, studentData)
      setStudents(prev => prev.map(s => s.id === editingStudentId ? updated : s))
      closeModal()
    } else {
      const allStudents = store.getAll()
      const newId = `std-${Date.now()}`
      const year = new Date().getFullYear()

      // Calculate roll
      let finalRoll = formData.rollNumber.trim()
      if (!finalRoll) {
        if (formData.type === 'REGULAR') {
          const rollScope = allStudents.filter(s =>
            s.type === 'REGULAR' &&
            s.classId === formData.classId &&
            (formData.sectionId ? s.sectionId === formData.sectionId : true) &&
            s.session === formData.session
          )
          finalRoll = String(rollScope.length + 1).padStart(2, '0')
        } else {
          const batchScope = allStudents.filter(s =>
            s.type === 'EXAM_BATCH' &&
            s.batchId === formData.batchId &&
            s.session === formData.session
          )
          finalRoll = String(batchScope.length + 1).padStart(2, '0')
        }
      }

      // Registration Number
      const regSeq = String(allStudents.length + 1).padStart(3, '0')
      const registrationNumber = formData.type === 'REGULAR'
        ? `REG-${formData.classId ? formData.classId.replace('cls-', '') : 'GEN'}-${formData.session}-${regSeq}`
        : `REG-BATCH-${formData.session}-${regSeq}`

      const globalSeq = String(allStudents.length + 1).padStart(3, '0')

      const newStudent: Student = {
        ...studentData,
        id:                 newId,
        createdAt:          now,
        updatedAt:          now,
        createdBy:          'admin',
        updatedBy:          'admin',
        isArchived:         false,
        studentId:          `STU-${year}-${globalSeq}`,
        rollNumber:         finalRoll,
        registrationNumber,
      } as Student

      store.insert(newStudent)
      setStudents(prev => [newStudent, ...prev])

      if (addAnother) {
        // Fast next student: keep Class/Section/Batch, increment roll, clear personal
        const nextRollNum = parseInt(finalRoll, 10)
        const nextRoll = isNaN(nextRollNum) ? '' : String(nextRollNum + 1).padStart(2, '0')

        setFormData(prev => ({
          ...prev,
          fullNameEn: '',
          fullNameBn: '',
          mobile: '',
          email: '',
          dateOfBirth: '',
          rollNumber: nextRoll,
          fatherName: '',
          fatherMobile: '',
          fatherOccupation: '',
          motherName: '',
          motherMobile: '',
          guardianName: '',
          guardianMobile: '',
        }))
        setCurrentStep(1)
      } else {
        closeModal()
      }
    }
  }

  // ── Delete student ─────────────────────────────────────────
  function deleteStudent(id: string) {
    store.remove(id)
    setStudents(prev => prev.filter(s => s.id !== id))
    if (selectedStudent?.id === id) closeDrawer()
  }

  // ── Promote students ───────────────────────────────────────
  function promoteStudents(studentIds: string[], targetClassId: string, targetSession: string) {
    setStudents(prev => prev.map(s => {
      if (studentIds.includes(s.id)) {
        const updated = {
          ...s,
          classId: targetClassId,
          className: `Class ${targetClassId.replace('cls-', '')}`,
          session: targetSession,
          updatedAt: new Date().toISOString()
        } as Student
        store.update(s.id, updated)
        return updated
      }
      return s
    }))
  }

  return {
    // Data
    students, filteredStudents, paginatedStudents, stats,
    // Filters
    filters, updateFilter, resetFilters,
    // Pagination
    currentPage, setCurrentPage, totalPages,
    // Drawer
    selectedStudent, isDrawerOpen, openDrawer, closeDrawer,
    // Modal
    isModalOpen, openModal, openEditModal, closeModal,
    editingStudentId,
    formData, updateFormData, currentStep, nextStep, prevStep,
    submitStudent,
    // Actions
    deleteStudent,
    promoteStudents,
  }
}

