import { useState, useMemo, useEffect } from 'react'
import { teacherStore as store, classStore, sectionStore } from '@/data/stores'
import type { Teacher, TeacherFormData, TeacherRef, TeacherCategory, EmploymentType, EmploymentStatus, Department, Designation } from './types'
import { initialFormData } from './types'
import { getTeacherClassTeacherAssignment } from './utils/teacherSync'

const PAGE_SIZE = 10

export interface TeacherFilters {
  search: string
  teacherCategory: TeacherCategory | 'ALL' | 'CLASS_TEACHER'
  employmentType: EmploymentType | 'ALL'
  employmentStatus: EmploymentStatus | 'ALL'
  department: Department | 'ALL'
  designation: Designation | 'ALL'
}

export function useTeachers() {
  const [teachers, setTeachers]                 = useState<Teacher[]>(() => store.getAll())
  const [filters, setFilters]                   = useState<TeacherFilters>({
    search: '',
    teacherCategory: 'ALL',
    employmentType: 'ALL',
    employmentStatus: 'ALL',
    department: 'ALL',
    designation: 'ALL',
  })
  const [currentPage, setCurrentPage]           = useState(1)
  const [selectedTeacher, setSelectedTeacher]   = useState<Teacher | null>(null)
  const [isDrawerOpen, setIsDrawerOpen]         = useState(false)
  const [isModalOpen, setIsModalOpen]           = useState(false)
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null)
  const [formData, setFormData]                 = useState<TeacherFormData>(initialFormData)
  const [currentStep, setCurrentStep]           = useState(1)
  const TOTAL_STEPS = 2

  // Sync state from store on mount
  useEffect(() => {
    setTeachers(store.getAll())
  }, [])

  // ── Derived stats ──────────────────────────────────────
  const stats = useMemo(() => ({
    total:          teachers.length,
    regular:        teachers.filter(t => t.teacherCategory === 'REGULAR').length,
    guest:          teachers.filter(t => t.teacherCategory === 'GUEST').length,
    classTeachers:  teachers.filter(t => getTeacherClassTeacherAssignment(t).isClassTeacher).length,
    active:         teachers.filter(t => t.employmentStatus === 'ACTIVE').length,
    onLeave:        teachers.filter(t => t.employmentStatus === 'ON_LEAVE').length,
    fullTime:       teachers.filter(t => t.employmentType === 'FULL_TIME').length,
  }), [teachers])

  // ── Filtered teachers ──────────────────────────────────
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = filters.search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        (t.nameBangla && t.nameBangla.includes(q)) ||
        t.teacherId.toLowerCase().includes(q) ||
        (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
        t.phone.includes(q) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q))

      let matchesCategory = true
      if (filters.teacherCategory === 'CLASS_TEACHER') {
        matchesCategory = getTeacherClassTeacherAssignment(t).isClassTeacher
      } else if (filters.teacherCategory !== 'ALL') {
        matchesCategory = t.teacherCategory === filters.teacherCategory
      }

      const matchesType       = filters.employmentType === 'ALL'   || t.employmentType   === filters.employmentType
      const matchesStatus     = filters.employmentStatus === 'ALL' || t.employmentStatus === filters.employmentStatus
      const matchesDepartment = filters.department === 'ALL'       || t.department        === filters.department
      const matchesDesig      = filters.designation === 'ALL'      || t.designation       === filters.designation

      return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesDepartment && matchesDesig
    })
  }, [teachers, filters])

  // ── Pagination ─────────────────────────────────────────
  const totalPages        = Math.ceil(filteredTeachers.length / PAGE_SIZE)
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTeachers.slice(start, start + PAGE_SIZE)
  }, [filteredTeachers, currentPage])

  // ── Filter helpers ─────────────────────────────────────
  function updateFilter<K extends keyof TeacherFilters>(key: K, value: TeacherFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  function resetFilters() {
    setFilters({
      search: '',
      teacherCategory: 'ALL',
      employmentType: 'ALL',
      employmentStatus: 'ALL',
      department: 'ALL',
      designation: 'ALL',
    })
    setCurrentPage(1)
  }

  // ── Drawer ─────────────────────────────────────────────
  function openDrawer(teacher: Teacher) {
    setSelectedTeacher(teacher)
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedTeacher(null), 300)
  }

  // ── Modal / Stepper ────────────────────────────────────
  function openModal(defaultCategory?: TeacherCategory) {
    setEditingTeacherId(null)
    setFormData({
      ...initialFormData,
      teacherCategory: defaultCategory || 'REGULAR',
    })
    setCurrentStep(1)
    setIsModalOpen(true)
  }

  function openEditModal(teacher: Teacher) {
    setEditingTeacherId(teacher.id)
    const ctInfo = teacher.assignments?.find(a => a.isClassTeacher)
    const highestQ = teacher.qualifications?.[0]

    setFormData({
      teacherCategory:       teacher.teacherCategory || 'REGULAR',
      fullName:              teacher.fullName,
      nameBangla:            teacher.nameBangla || '',
      gender:                teacher.gender || 'MALE',
      phone:                 teacher.phone,
      email:                 teacher.email || '',
      dateOfBirth:           teacher.dateOfBirth || '',
      bloodGroup:            teacher.bloodGroup || '',
      presentAddress:        teacher.presentAddress || '',
      permanentAddress:      teacher.permanentAddress || '',
      nidNumber:             teacher.nidNumber || '',
      profilePhoto:          teacher.profilePhoto || '',

      designation:           teacher.designation || 'ASSISTANT_TEACHER',
      department:            teacher.department || 'MATHEMATICS',
      employmentType:        teacher.employmentType || 'FULL_TIME',
      employmentStatus:      teacher.employmentStatus || 'ACTIVE',
      joiningDate:           teacher.joiningDate || new Date().toISOString().split('T')[0],
      baseSalary:            25000,
      highestDegree:         highestQ ? `${highestQ.degree} in ${highestQ.subject} (${highestQ.university || highestQ.institution})` : '',

      isClassTeacher:        Boolean(ctInfo),
      classTeacherClassId:   ctInfo?.classId || '',
      classTeacherSectionId: ctInfo?.sectionId || '',
    })
    setCurrentStep(1)
    setIsModalOpen(true)
    closeDrawer()
  }

  function closeModal() {
    setIsModalOpen(false)
    setFormData(initialFormData)
    setCurrentStep(1)
    setEditingTeacherId(null)
  }

  function updateFormData(partial: Partial<TeacherFormData>) {
    setFormData(prev => ({ ...prev, ...partial }))
  }

  function nextStep() { setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS)) }
  function prevStep() { setCurrentStep(s => Math.max(s - 1, 1)) }

  // ── Submit ─────────────────────────────────────────────
  function submitTeacher(addAnother: boolean = false) {
    const now = new Date().toISOString()
    const year = new Date().getFullYear()

    const assignments = []
    if (formData.isClassTeacher && formData.classTeacherClassId) {
      const cls = classStore.getOne(formData.classTeacherClassId)
      const sec = formData.classTeacherSectionId ? sectionStore.getOne(formData.classTeacherSectionId) : null
      assignments.push({
        id: `asgn-${Date.now()}`,
        academicYear: String(year),
        classId: formData.classTeacherClassId,
        className: cls?.name || `Class ${formData.classTeacherClassId.replace('cls-', '')}`,
        sectionId: formData.classTeacherSectionId || undefined,
        sectionName: sec?.name || undefined,
        subjectId: formData.department || 'GENERAL',
        subjectName: formData.department || 'General',
        assignmentType: 'PRIMARY' as const,
        isClassTeacher: true,
      })
    }

    const qualifications = formData.highestDegree ? [{
      id: `q-${Date.now()}`,
      degree: formData.highestDegree,
      subject: formData.department || 'General',
      institution: 'Recognized University / Board',
      university: 'National University',
      result: 'First Class',
      passingYear: year - 5,
    }] : []

    const nameParts = formData.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName  = nameParts.slice(1).join(' ') || ''

    const teacherData: Partial<Teacher> = {
      updatedAt:             now,
      updatedBy:             'admin',
      profilePhoto:          formData.profilePhoto || undefined,
      firstName,
      lastName,
      fullName:              formData.fullName.trim(),
      nameBangla:            formData.nameBangla.trim() || undefined,
      gender:                formData.gender as Teacher['gender'],
      dateOfBirth:           formData.dateOfBirth,
      bloodGroup:            formData.bloodGroup || undefined,
      nationality:           'Bangladeshi',
      nidNumber:             formData.nidNumber?.trim() || undefined,
      phone:                 formData.phone.trim(),
      email:                 formData.email.trim() || undefined,
      presentAddress:        formData.presentAddress.trim(),
      permanentAddress:      formData.permanentAddress?.trim() || formData.presentAddress.trim(),
      joiningDate:           formData.joiningDate,
      employmentType:        formData.employmentType as Teacher['employmentType'],
      teacherCategory:       formData.teacherCategory,
      employmentStatus:      formData.employmentStatus,
      designation:           formData.designation as Teacher['designation'],
      department:            formData.department || undefined,
      qualifications,
      certifications:        [],
      teachingSubjects:      formData.department ? [formData.department] : [],
      teachingLevels:        ['SECONDARY', 'HIGHER_SECONDARY'],
      previousExperience:    [],
      assignments,
      trainings:             [],
      documents:             [],
      username:              formData.fullName.toLowerCase().replace(/\s+/g, '') + (Math.floor(Math.random() * 900) + 100),
      loginPhone:            formData.phone.trim(),
      loginEmail:            formData.email.trim() || undefined,
      accountStatus:         'ACTIVE',
      role:                  formData.designation === 'PRINCIPAL' || formData.designation === 'VICE_PRINCIPAL' ? 'ADMIN' : 'ASSISTANT_TEACHER',
    }

    if (editingTeacherId) {
      const updated = store.update(editingTeacherId, teacherData)
      setTeachers(prev => prev.map(t => t.id === editingTeacherId ? updated : t))
      closeModal()
    } else {
      const allTeachers = store.getAll()
      const newId    = `tch-${Date.now()}`
      const seq      = String(allTeachers.length + 1).padStart(3, '0')

      const newTeacher: Teacher = {
        ...teacherData,
        id:         newId,
        createdAt:  now,
        createdBy:  'admin',
        isActive:   true,
        teacherId:  `TCH-${year}-${seq}`,
        employeeId: `EMP-${seq}`,
      } as Teacher

      store.insert(newTeacher)
      setTeachers(prev => [newTeacher, ...prev])

      if (addAnother) {
        setFormData(prev => ({
          ...prev,
          fullName: '',
          nameBangla: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          nidNumber: '',
          presentAddress: '',
          highestDegree: '',
          isClassTeacher: false,
          classTeacherClassId: '',
          classTeacherSectionId: '',
        }))
        setCurrentStep(1)
      } else {
        closeModal()
      }
    }
  }

  // ── Delete ─────────────────────────────────────────────
  function deleteTeacher(id: string) {
    store.remove(id)
    setTeachers(prev => prev.filter(t => t.id !== id))
    if (selectedTeacher?.id === id) closeDrawer()
  }

  // ── Cross-module exports ────────────────────────────────
  function getTeacherRef(id: string): TeacherRef | undefined {
    const t = teachers.find(t => t.id === id)
    if (!t) return undefined
    return {
      id: t.id, teacherId: t.teacherId, fullName: t.fullName,
      nameBangla: t.nameBangla, teacherCategory: t.teacherCategory,
      designation: t.designation, department: t.department,
      employmentStatus: t.employmentStatus,
      phone: t.phone, profilePhoto: t.profilePhoto, assignments: t.assignments,
    }
  }

  function getActiveTeachers(): TeacherRef[] {
    return teachers
      .filter(t => t.employmentStatus === 'ACTIVE')
      .map(t => ({
        id: t.id, teacherId: t.teacherId, fullName: t.fullName,
        nameBangla: t.nameBangla, teacherCategory: t.teacherCategory,
        designation: t.designation, department: t.department,
        employmentStatus: t.employmentStatus,
        phone: t.phone, profilePhoto: t.profilePhoto, assignments: t.assignments,
      }))
  }

  function getTeachersBySubject(subjectId: string): TeacherRef[] {
    return teachers
      .filter(t => t.assignments.some(a => a.subjectId === subjectId))
      .map(t => ({
        id: t.id, teacherId: t.teacherId, fullName: t.fullName,
        nameBangla: t.nameBangla, teacherCategory: t.teacherCategory,
        designation: t.designation, department: t.department,
        employmentStatus: t.employmentStatus,
        phone: t.phone, profilePhoto: t.profilePhoto, assignments: t.assignments,
      }))
  }

  return {
    // Data
    teachers, filteredTeachers, paginatedTeachers, stats,
    // Filters
    filters, updateFilter, resetFilters,
    // Pagination
    currentPage, setCurrentPage, totalPages,
    // Drawer
    selectedTeacher, isDrawerOpen, openDrawer, closeDrawer,
    // Modal
    isModalOpen, openModal, openEditModal, closeModal,
    editingTeacherId, formData, updateFormData,
    currentStep, nextStep, prevStep, TOTAL_STEPS,
    submitTeacher,
    // Actions
    deleteTeacher,
    // Cross-module
    getTeacherRef, getActiveTeachers, getTeachersBySubject,
  }
}
