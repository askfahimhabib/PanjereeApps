import { useState, useMemo, useEffect } from 'react'
import { studentStore as store } from '@/data/stores'
import type { Student, StudentType, StudentStatus, StudentFormData } from './types'
import { initialFormData } from './types'

const PAGE_SIZE = 10

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudentFilters {
  search: string
  type: StudentType | 'ALL'
  classId: string
  status: StudentStatus | 'ALL'
  isAlumni?: boolean
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStudents(initialIsAlumni: boolean = false) {
  const [students, setStudents]               = useState<Student[]>(() => store.getAll())
  const [filters, setFilters]                 = useState<StudentFilters>({ search: '', type: 'ALL', classId: '', status: 'ALL', isAlumni: initialIsAlumni })
  const [currentPage, setCurrentPage]         = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDrawerOpen, setIsDrawerOpen]       = useState(false)
  const [isModalOpen, setIsModalOpen]         = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [formData, setFormData]               = useState<StudentFormData>(initialFormData)
  const [currentStep, setCurrentStep]         = useState(1)

  // Sync state from store on mount (in case another tab wrote to it)
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
        s.fullNameBn.includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.rollNumber.includes(q) ||
        s.mobile.includes(q)

      const matchesType    = filters.type === 'ALL'    || s.type    === filters.type
      const matchesClass   = !filters.classId           || s.classId === filters.classId
      const matchesStatus  = filters.status === 'ALL'  || s.status  === filters.status
      
      const isAlumniStudent = ['PASSED', 'LEFT', 'SUSPENDED'].includes(s.status)
      const matchesAlumni = filters.isAlumni ? isAlumniStudent : !isAlumniStudent

      return matchesSearch && matchesType && matchesClass && matchesStatus && matchesAlumni
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
    setFilters({ search: '', type: 'ALL', classId: '', status: 'ALL', isAlumni: filters.isAlumni })
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

  // ── Modal / Wizard ─────────────────────────────────────────
  function openModal() {
    setEditingStudentId(null)
    setFormData(initialFormData)
    setCurrentStep(1)
    setIsModalOpen(true)
  }

  function openEditModal(student: Student) {
    setEditingStudentId(student.id)
    setFormData({
      fullNameEn: student.fullNameEn,
      fullNameBn: student.fullNameBn || '',
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup || '',
      religion: student.religion,
      nationality: student.nationality,
      type: student.type,
      classId: student.classId || '',
      sectionId: student.sectionId || '',
      groupId: student.groupId || '',
      shift: student.shift || '',
      batchId: student.batchId || '',
      targetExam: student.targetExam || '',
      version: student.version,
      session: student.session,
      admissionDate: student.admissionDate,
      admissionNumber: student.admissionNumber,
      previousSchool: student.previousSchool || '',
      status: student.status,
      mobile: student.mobile,
      whatsapp: student.whatsapp || '',
      email: student.email || '',
      presentAddress: student.presentAddress,
      permanentAddress: student.permanentAddress || '',
      sameAddress: student.presentAddress === (student.permanentAddress || ''),
      fatherName: student.father.name,
      fatherMobile: student.father.mobile,
      fatherOccupation: student.father.occupation,
      fatherNid: student.father.nid || '',
      motherName: student.mother.name,
      motherMobile: student.mother.mobile,
      motherOccupation: student.mother.occupation,
      hasGuardian: !!student.guardian,
      guardianName: student.guardian?.name || '',
      guardianRelation: student.guardian?.relation || '',
      guardianMobile: student.guardian?.mobile || '',
      guardianAddress: student.guardian?.address || '',
      emergencyContact: student.emergencyContact || '',
      username: student.username,
      password: '', // Leave blank when editing
      confirmPassword: '',
      loginStatus: student.loginStatus,
      customFields: student.customFields || [],
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

  function nextStep() { setCurrentStep(s => Math.min(s + 1, 4)) }
  function prevStep() { setCurrentStep(s => Math.max(s - 1, 1)) }

  // ── Submit ─────────────────────────────────────────────────
  function submitStudent() {
    const now = new Date().toISOString()

    const studentData: Partial<Student> = {
      updatedAt:          now,
      updatedBy:          'admin',
      fullNameEn:         formData.fullNameEn,
      fullNameBn:         formData.fullNameBn,
      gender:             formData.gender as Student['gender'],
      dateOfBirth:        formData.dateOfBirth,
      bloodGroup:         formData.bloodGroup || undefined,
      religion:           formData.religion,
      nationality:        formData.nationality,
      type:               formData.type as Student['type'],
      classId:            formData.classId || undefined,
      className:          formData.classId ? `Class ${formData.classId.replace('cls-', '')}` : undefined,
      sectionId:          formData.sectionId || undefined,
      sectionName:        formData.sectionId ? formData.sectionId.replace('sec-', '').toUpperCase() : undefined,
      groupId:            formData.groupId || undefined,
      shift:              formData.shift || undefined,
      batchId:            formData.batchId || undefined,
      targetExam:         formData.targetExam || undefined,
      version:            formData.version as Student['version'],
      session:            formData.session,
      admissionDate:      formData.admissionDate,
      admissionNumber:    formData.admissionNumber,
      previousSchool:     formData.previousSchool || undefined,
      status:             formData.status,
      mobile:             formData.mobile,
      whatsapp:           formData.whatsapp || undefined,
      email:              formData.email || undefined,
      presentAddress:     formData.presentAddress,
      permanentAddress:   formData.sameAddress ? formData.presentAddress : formData.permanentAddress || undefined,
      father: {
        name:       formData.fatherName,
        mobile:     formData.fatherMobile,
        occupation: formData.fatherOccupation,
        nid:        formData.fatherNid || undefined,
      },
      mother: {
        name:       formData.motherName,
        mobile:     formData.motherMobile,
        occupation: formData.motherOccupation,
      },
      guardian: formData.hasGuardian ? {
        name:     formData.guardianName,
        relation: formData.guardianRelation,
        mobile:   formData.guardianMobile,
        address:  formData.guardianAddress,
      } : undefined,
      emergencyContact: formData.emergencyContact || undefined,
      username:         formData.username,
      loginStatus:      formData.loginStatus,
      customFields:     formData.customFields.length > 0 ? formData.customFields : undefined,
    }

    if (editingStudentId) {
      // Update in store
      const updated = store.update(editingStudentId, studentData)
      setStudents(prev => prev.map(s => s.id === editingStudentId ? updated : s))
    } else {
      const allStudents = store.getAll()
      const newId = crypto.randomUUID()

      // ── Roll Number: Class + Section + Session scoped ──────
      const rollScope = allStudents.filter(s =>
        s.type === 'REGULAR' &&
        s.classId   === formData.classId &&
        s.sectionId === formData.sectionId &&
        s.session   === formData.session
      )
      const rollNumber = String(rollScope.length + 1).padStart(2, '0')

      // ── Registration Number: Class + Session scoped ─────────
      const classNum = formData.classId ? formData.classId.replace('cls-', '') : '0'
      const regScope = allStudents.filter(s =>
        s.type === 'REGULAR' &&
        s.classId === formData.classId &&
        s.session === formData.session
      )
      const regSeq = String(regScope.length + 1).padStart(3, '0')
      const registrationNumber = formData.type === 'REGULAR'
        ? `REG-${classNum}-${formData.session}-${regSeq}`
        : `REG-BATCH-${formData.session}-${String(allStudents.filter(s => s.type === 'EXAM_BATCH' && s.session === formData.session).length + 1).padStart(3, '0')}`

      // ── Student ID: global unique ──────────────────────────
      const year = new Date().getFullYear()
      const globalSeq = String(allStudents.filter(s => s.createdAt.startsWith(String(year))).length + 1).padStart(3, '0')

      const newStudent: Student = {
        ...studentData,
        id:                 newId,
        createdAt:          now,
        createdBy:          'admin',
        isArchived:         false,
        studentId:          `STU-${year}-${globalSeq}`,
        rollNumber,
        registrationNumber,
      } as Student

      // Insert in store and update state
      store.insert(newStudent)
      setStudents(prev => [newStudent, ...prev])
    }

    closeModal()
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
