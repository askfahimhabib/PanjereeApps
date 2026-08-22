import { useState, useMemo } from 'react'
import { MOCK_TEACHERS } from './mockData'
import { createStore } from '@/lib/localStore'
import type { Teacher, TeacherFilters, TeacherFormData, TeacherRef } from './types'
import { initialFormData } from './types'

const PAGE_SIZE = 10

// ─── Persistent Store (seed once from mockData if empty) ─────────────────────

const store = createStore<Teacher>('teachers')
store.seed(MOCK_TEACHERS)

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
  const TOTAL_STEPS = 6

  // ── Derived stats ──────────────────────────────────────
  const stats = useMemo(() => ({
    total:    teachers.length,
    regular:  teachers.filter(t => t.teacherCategory === 'REGULAR').length,
    guest:    teachers.filter(t => t.teacherCategory === 'GUEST').length,
    active:   teachers.filter(t => t.employmentStatus === 'ACTIVE').length,
    onLeave:  teachers.filter(t => t.employmentStatus === 'ON_LEAVE').length,
    fullTime: teachers.filter(t => t.employmentType === 'FULL_TIME').length,
  }), [teachers])

  // ── Filtered teachers ──────────────────────────────────
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = filters.search.toLowerCase()
      const matchesSearch =
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        (t.nameBangla || '').includes(q) ||
        t.teacherId.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        (t.email || '').toLowerCase().includes(q)

      const matchesCategory   = filters.teacherCategory === 'ALL' || t.teacherCategory === filters.teacherCategory
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
    setFilters({ search: '', teacherCategory: 'ALL', employmentType: 'ALL', employmentStatus: 'ALL', department: 'ALL', designation: 'ALL' })
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

  // ── Modal / Wizard ─────────────────────────────────────
  function openModal() {
    setEditingTeacherId(null)
    setFormData(initialFormData)
    setCurrentStep(1)
    setIsModalOpen(true)
  }

  function openEditModal(teacher: Teacher) {
    setEditingTeacherId(teacher.id)
    setFormData({
      profilePhoto:          teacher.profilePhoto || '',
      employeeId:            teacher.employeeId,
      firstName:             teacher.firstName,
      lastName:              teacher.lastName,
      fullName:              teacher.fullName,
      nameBangla:            teacher.nameBangla || '',
      gender:                teacher.gender,
      dateOfBirth:           teacher.dateOfBirth,
      bloodGroup:            teacher.bloodGroup || '',
      nationality:           teacher.nationality,
      nidNumber:             teacher.nidNumber || '',
      birthCertificateNumber: teacher.birthCertificateNumber || '',
      maritalStatus:         teacher.maritalStatus || '',
      religion:              teacher.religion || 'ISLAM',
      signatureUrl:          teacher.signatureUrl || '',
      phone:                 teacher.phone,
      alternativePhone:      teacher.alternativePhone || '',
      email:                 teacher.email || '',
      whatsapp:              teacher.whatsapp || '',
      presentAddress:        teacher.presentAddress,
      permanentAddress:      teacher.permanentAddress || '',
      sameAddress:           teacher.presentAddress === (teacher.permanentAddress || ''),
      division:              teacher.division || '',
      district:              teacher.district || '',
      upazila:               teacher.upazila || '',
      area:                  teacher.area || '',
      postalCode:            teacher.postalCode || '',
      joiningDate:           teacher.joiningDate,
      teacherCategory:       teacher.teacherCategory,
      employmentType:        teacher.employmentType,
      employmentStatus:      teacher.employmentStatus,
      designation:           teacher.designation,
      department:            teacher.department || '',
      resignationDate:       teacher.resignationDate || '',
      terminationDate:       teacher.terminationDate || '',
      terminationReason:     teacher.terminationReason || '',
      qualifications: teacher.qualifications.length > 0
        ? teacher.qualifications.map(q => ({
            degree: q.degree, subject: q.subject, institution: q.institution,
            university: q.university, result: q.result, passingYear: String(q.passingYear),
          }))
        : [{ degree: '', subject: '', institution: '', university: '', result: '', passingYear: '' }],
      certifications: teacher.certifications.map(c => ({ name: c.name, issuer: c.issuer, year: String(c.year) })),
      specialization:    teacher.specialization || '',
      teachingSubjects:  teacher.teachingSubjects,
      teachingLevels:    teacher.teachingLevels,
      previousExperience: teacher.previousExperience.map(e => ({
        organization: e.organization, designation: e.designation,
        fromYear: String(e.fromYear), toYear: String(e.toYear || ''),
      })),
      assignments: teacher.assignments.length > 0
        ? teacher.assignments.map(a => ({
            academicYear: a.academicYear, classId: a.classId, sectionId: a.sectionId || '',
            subjectId: a.subjectId, assignmentType: a.assignmentType, isClassTeacher: a.isClassTeacher,
          }))
        : [{ academicYear: String(new Date().getFullYear()), classId: '', sectionId: '', subjectId: '', assignmentType: '', isClassTeacher: false }],
      username:      teacher.username || '',
      loginEmail:    teacher.loginEmail || '',
      loginPhone:    teacher.loginPhone || '',
      password:      '',
      confirmPassword: '',
      role:          teacher.role,
      accountStatus: teacher.accountStatus,
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
  function submitTeacher() {
    const now = new Date().toISOString()
    const year = new Date().getFullYear()

    // Map form qualifications → Teacher qualifications
    const qualifications = formData.qualifications
      .filter(q => q.degree.trim())
      .map((q, i) => ({
        id: `q-${Date.now()}-${i}`,
        degree: q.degree,
        subject: q.subject,
        institution: q.institution,
        university: q.university,
        result: q.result,
        passingYear: parseInt(q.passingYear) || 0,
      }))

    const certifications = formData.certifications
      .filter(c => c.name.trim())
      .map((c, i) => ({
        id: `c-${Date.now()}-${i}`,
        name: c.name,
        issuer: c.issuer,
        year: parseInt(c.year) || 0,
      }))

    const previousExperience = formData.previousExperience
      .filter(e => e.organization.trim())
      .map((e, i) => {
        const from = parseInt(e.fromYear) || 0
        const to   = parseInt(e.toYear) || undefined
        return {
          id: `exp-${Date.now()}-${i}`,
          organization: e.organization,
          designation: e.designation,
          fromYear: from,
          toYear: to,
          duration: to ? `${to - from} years` : `${year - from}+ years`,
        }
      })

    const assignments = formData.assignments
      .filter(a => a.classId && a.subjectId && a.assignmentType)
      .map((a, i) => {
        const cls = ['5','6','7','8','9','10','11','12'].find(c => a.classId === `cls-${c}`)
        return {
          id: `asgn-${Date.now()}-${i}`,
          academicYear: a.academicYear,
          classId: a.classId,
          className: cls ? `Class ${cls}` : a.classId,
          sectionId: a.sectionId || undefined,
          sectionName: a.sectionId ? a.sectionId.replace('sec-', '').toUpperCase() : undefined,
          subjectId: a.subjectId,
          subjectName: a.subjectId,  // will be resolved to proper name in real API
          assignmentType: a.assignmentType as import('./types').AssignmentType,
          isClassTeacher: a.isClassTeacher,
        }
      })

    const teacherData: Partial<Teacher> = {
      updatedAt:             now,
      updatedBy:             'admin',
      profilePhoto:          formData.profilePhoto || undefined,
      employeeId:            formData.employeeId,
      firstName:             formData.firstName,
      lastName:              formData.lastName,
      fullName:              formData.fullName || `${formData.firstName} ${formData.lastName}`.trim(),
      nameBangla:            formData.nameBangla || undefined,
      gender:                formData.gender as Teacher['gender'],
      dateOfBirth:           formData.dateOfBirth,
      bloodGroup:            formData.bloodGroup || undefined,
      nationality:           formData.nationality,
      nidNumber:             formData.nidNumber || undefined,
      birthCertificateNumber: formData.birthCertificateNumber || undefined,
      maritalStatus:         formData.maritalStatus || undefined,
      religion:              formData.religion || undefined,
      signatureUrl:          formData.signatureUrl || undefined,
      phone:                 formData.phone,
      alternativePhone:      formData.alternativePhone || undefined,
      email:                 formData.email || undefined,
      whatsapp:              formData.whatsapp || undefined,
      presentAddress:        formData.presentAddress,
      permanentAddress:      formData.sameAddress ? formData.presentAddress : formData.permanentAddress || undefined,
      division:              formData.division || undefined,
      district:              formData.district || undefined,
      upazila:               formData.upazila || undefined,
      area:                  formData.area || undefined,
      postalCode:            formData.postalCode || undefined,
      joiningDate:           formData.joiningDate,
      employmentType:        formData.employmentType as Teacher['employmentType'],
      teacherCategory:       formData.teacherCategory,
      employmentStatus:      formData.employmentStatus,
      designation:           formData.designation as Teacher['designation'],
      department:            formData.department || undefined,
      resignationDate:       formData.resignationDate || undefined,
      terminationDate:       formData.terminationDate || undefined,
      terminationReason:     formData.terminationReason || undefined,
      qualifications,
      certifications,
      specialization:        formData.specialization || undefined,
      teachingSubjects:      formData.teachingSubjects,
      teachingLevels:        formData.teachingLevels,
      previousExperience,
      assignments,
      trainings:             [],
      documents:             [],
      username:              formData.username || undefined,
      loginEmail:            formData.loginEmail || undefined,
      loginPhone:            formData.loginPhone || undefined,
      accountStatus:         formData.accountStatus,
      role:                  formData.role,
    }

    if (editingTeacherId) {
      const updated = store.update(editingTeacherId, teacherData)
      setTeachers(prev => prev.map(t => t.id === editingTeacherId ? updated : t))
    } else {
      const allTeachers = store.getAll()
      const newId    = crypto.randomUUID()
      const seq      = String(allTeachers.filter(t => t.createdAt.startsWith(String(year))).length + 1).padStart(3, '0')
      const empSeq   = String(allTeachers.length + 1).padStart(3, '0')

      const newTeacher: Teacher = {
        ...teacherData,
        id:         newId,
        createdAt:  now,
        createdBy:  'admin',
        isActive:   true,
        teacherId:  `TCH-${year}-${seq}`,
        employeeId: formData.employeeId || `EMP-${empSeq}`,
      } as Teacher

      store.insert(newTeacher)
      setTeachers(prev => [newTeacher, ...prev])
    }

    closeModal()
  }

  // ── Delete ─────────────────────────────────────────────
  function deleteTeacher(id: string) {
    store.remove(id)
    setTeachers(prev => prev.filter(t => t.id !== id))
    if (selectedTeacher?.id === id) closeDrawer()
  }

  // ── Cross-module exports ────────────────────────────────
  /** Use this in Routine, Attendance, Salary, Exam, Leave modules */
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
