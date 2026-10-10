import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { studentStore } from '@/data/stores'
import type { Student } from '@/features/students/types'
import type { StudentPersona, StudentRoleType } from '../types'
import {
  STICKER_ROBOT_CYAN,
  STICKER_CAT_COSMO,
  STICKER_FOX_SMART,
  STICKER_ROCKET_STAR,
  getEffectiveStudentAvatar,
} from '@/lib/studentAvatar'

const STORAGE_KEY = 'lms_student_portal_persona_id'

// Standard seed personas mapped directly to system student IDs for realistic data flow
const DEFAULT_PRESET_PERSONAS: StudentPersona[] = [
  {
    id: '1',
    studentId: 'STU-2024-001',
    fullNameEn: 'Rahim Uddin',
    fullNameBn: 'রহিম উদ্দিন',
    rollNumber: '01',
    registrationNumber: 'REG-2024-001',
    roleType: 'REGULAR',
    classId: 'cls-10',
    className: 'Class 10',
    sectionId: 'sec-10-sci-a',
    sectionName: 'Science - A',
    groupId: 'SCIENCE',
    groupName: 'Science',
    avatar: STICKER_ROBOT_CYAN,
    mobile: '01711-234567',
    email: 'rahim@example.com',
    bloodGroup: 'B+',
    gender: 'MALE',
    fatherName: 'Abdul Karim',
    motherName: 'Fatema Begum',
    guardianMobile: '01811-234567',
    address: 'House 12, Mirpur-10, Dhaka-1216',
    admissionDate: '2024-01-01',
  },
  {
    id: '10',
    studentId: 'STU-2024-010',
    fullNameEn: 'Sumaiya Begum',
    fullNameBn: 'সুমাইয়া বেগম',
    rollNumber: '03',
    registrationNumber: 'REG-2024-010',
    roleType: 'REGULAR',
    classId: 'cls-10',
    className: 'Class 10',
    sectionId: 'sec-10-sci-a',
    sectionName: 'Science - A',
    groupId: 'SCIENCE',
    groupName: 'Science',
    avatar: STICKER_CAT_COSMO,
    mobile: '01911-987654',
    email: 'sumaiya@example.com',
    bloodGroup: 'O+',
    gender: 'FEMALE',
    fatherName: 'Aminul Haque',
    motherName: 'Salma Khatun',
    guardianMobile: '01711-223344',
    address: 'Sector #7, Uttara, Dhaka',
    admissionDate: '2024-01-12',
  },
  {
    id: '21',
    studentId: 'STU-2024-021',
    fullNameEn: 'Tanvir Hasan',
    fullNameBn: 'তানভীর হাসান',
    rollNumber: '04',
    registrationNumber: 'REG-2024-021',
    roleType: 'REGULAR',
    classId: 'cls-10',
    className: 'Class 10',
    sectionId: 'sec-10-sci-a',
    sectionName: 'Science - A',
    groupId: 'SCIENCE',
    groupName: 'Science',
    avatar: STICKER_FOX_SMART,
    mobile: '01815-667788',
    email: 'tanvir@example.com',
    bloodGroup: 'A+',
    gender: 'MALE',
    fatherName: 'Md. Nazrul Islam',
    motherName: 'Rehana Begum',
    guardianMobile: '01812-345678',
    address: 'Mirpur-10, Block C, Dhaka',
    admissionDate: '2024-01-01',
  },
  {
    id: 'persona-batch-1',
    studentId: 'STU-2026-201',
    fullNameEn: 'Farhan Kabir',
    fullNameBn: 'ফারহান কবির',
    rollNumber: '2001',
    registrationNumber: 'REG-2026-9901',
    roleType: 'EXAM_BATCH',
    batchId: 'bat-001',
    batchName: 'SSC Special Batch 2025 (Model Test)',
    batchSectionName: 'Section Bravo',
    avatar: STICKER_ROCKET_STAR,
    mobile: '01815-998877',
    email: 'farhan.kabir@coaching.edu.bd',
    bloodGroup: 'A+',
    gender: 'MALE',
    fatherName: 'Dr. Shah Alam Kabir',
    motherName: 'Rehana Parveen',
    guardianMobile: '01912-334455',
    address: 'Mirpur-10, Block C, Dhaka',
    admissionDate: '2025-11-01',
  },
]

const OVERRIDES_STORAGE_KEY = 'lms_student_portal_persona_overrides'
const PREFERENCES_STORAGE_KEY = 'lms_student_portal_preferences'

export interface StudentPreferences {
  smsGateAttendance: boolean
  smsExamResults: boolean
  smsFeeReminders: boolean
  smsRoutineChanges: boolean
  smsLanguage: 'BN' | 'EN'
  preferredSmsRecipient: 'FATHER' | 'MOTHER' | 'BOTH'
  themeMode: 'light' | 'dark' | 'system'
  routineStartDay: 'SATURDAY' | 'SUNDAY'
  leaderboardVisible: boolean
  phoneVisibleToClass: boolean
  portalPin?: string
}

export const DEFAULT_STUDENT_PREFERENCES: StudentPreferences = {
  smsGateAttendance: true,
  smsExamResults: true,
  smsFeeReminders: true,
  smsRoutineChanges: true,
  smsLanguage: 'BN',
  preferredSmsRecipient: 'FATHER',
  themeMode: 'system',
  routineStartDay: 'SATURDAY',
  leaderboardVisible: true,
  phoneVisibleToClass: false,
  portalPin: '1234',
}

export interface StudentSessionContextValue {
  student: StudentPersona
  allPersonas: StudentPersona[]
  selectPersona: (personaId: string) => void
  updateProfile: (updates: Partial<StudentPersona>) => void
  preferences: StudentPreferences
  updatePreferences: (updates: Partial<StudentPreferences>) => void
  isRegular: boolean
  isExamBatch: boolean
  isDual: boolean
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null)

function useStudentSessionState(): StudentSessionContextValue {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored !== 'persona-dual-1' && stored !== 'persona-regular-1') {
      return stored
    }
    return DEFAULT_PRESET_PERSONAS[0].id
  })

  // Persona Overrides stored in localStorage
  const [overrides, setOverrides] = useState<Record<string, Partial<StudentPersona>>>(() => {
    try {
      const stored = localStorage.getItem(OVERRIDES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Preferences stored in localStorage
  const [preferences, setPreferences] = useState<StudentPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
      return stored ? { ...DEFAULT_STUDENT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_STUDENT_PREFERENCES
    } catch {
      return DEFAULT_STUDENT_PREFERENCES
    }
  })

  const [storeTick, setStoreTick] = useState(0)

  // Subscribe to studentStore updates to dynamically sync personas
  useEffect(() => {
    return studentStore.subscribe(() => setStoreTick((t) => t + 1))
  }, [])

  // Listen to cross-component and cross-tab synchronization events
  useEffect(() => {
    const handleCustomSync = (e: Event) => {
      const custom = e as CustomEvent<{ type: string; id?: string; data?: any }>
      if (!custom.detail) return

      if (custom.detail.type === 'persona' && custom.detail.id) {
        setSelectedPersonaId(custom.detail.id)
      } else if (custom.detail.type === 'overrides' && custom.detail.data) {
        setOverrides(custom.detail.data)
      } else if (custom.detail.type === 'preferences' && custom.detail.data) {
        setPreferences(custom.detail.data)
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setSelectedPersonaId(e.newValue)
      } else if (e.key === OVERRIDES_STORAGE_KEY && e.newValue) {
        try {
          setOverrides(JSON.parse(e.newValue))
        } catch {}
      } else if (e.key === PREFERENCES_STORAGE_KEY && e.newValue) {
        try {
          setPreferences({ ...DEFAULT_STUDENT_PREFERENCES, ...JSON.parse(e.newValue) })
        } catch {}
      }
    }

    window.addEventListener('lms_student_session_sync', handleCustomSync)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('lms_student_session_sync', handleCustomSync)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Also include students from studentStore if available
  const allPersonas = useMemo(() => {
    const storeStudents: Student[] = studentStore.getAll()
    const convertedFromStore: StudentPersona[] = storeStudents.map((s) => {
      let roleType: StudentRoleType = 'REGULAR'
      if (s.type === 'EXAM_BATCH') {
        roleType = s.classId ? 'DUAL' : 'EXAM_BATCH'
      }

      // Format class name nicely
      let formattedClassName = s.className
      if (!formattedClassName && s.classId) {
        const num = s.classId.replace('cls-', '')
        formattedClassName = !isNaN(Number(num))
          ? (Number(num) > 10 ? (Number(num) === 11 ? 'HSC 1st Year' : 'HSC 2nd Year') : `Class ${num}`)
          : s.classId
      }

      // Format group name nicely
      const rawGroup = String(s.groupId || '')
      let formattedGroupName: string | undefined = s.groupId
      if (rawGroup === 'SCIENCE') formattedGroupName = 'Science'
      else if (rawGroup === 'ARTS' || rawGroup === 'HUMANITIES') formattedGroupName = 'Humanities'
      else if (rawGroup === 'COMMERCE' || rawGroup === 'BUSINESS') formattedGroupName = 'Business Studies'

      return {
        id: s.id,
        studentId: s.studentId || `STU-${s.id}`,
        fullNameEn: s.fullNameEn || 'Unknown Student',
        fullNameBn: s.fullNameBn,
        rollNumber: s.rollNumber || '01',
        registrationNumber: s.registrationNumber,
        roleType,
        classId: s.classId,
        className: formattedClassName,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        groupId: s.groupId,
        groupName: formattedGroupName,
        batchId: s.batchId,
        batchName: s.batchName,
        avatar: getEffectiveStudentAvatar({
          avatar: (s as any).avatar || s.profilePhoto,
          id: s.id,
          studentId: s.studentId,
          fullNameEn: s.fullNameEn,
        }),
        mobile: s.mobile,
        email: s.email,
        bloodGroup: s.bloodGroup,
        gender: s.gender,
        fatherName: s.father?.name,
        motherName: s.mother?.name,
        guardianMobile: s.father?.mobile || s.mother?.mobile,
        address: s.presentAddress,
        admissionDate: s.admissionDate,
      }
    })

    // Combine preset personas with store students, avoiding duplicated IDs
    const combined = [...DEFAULT_PRESET_PERSONAS]
    for (const p of convertedFromStore) {
      if (!combined.some((c) => c.id === p.id)) {
        combined.push(p)
      }
    }

    // Apply any local user edits/overrides to personas and sanitize avatars
    return combined.map((persona) => {
      const merged = overrides[persona.id] ? { ...persona, ...overrides[persona.id] } : persona
      return {
        ...merged,
        avatar: getEffectiveStudentAvatar(merged),
      }
    })
  }, [overrides, storeTick])

  const currentStudent = useMemo(() => {
    const match = allPersonas.find((p) => p.id === selectedPersonaId)
    return match || allPersonas[0] || DEFAULT_PRESET_PERSONAS[0]
  }, [allPersonas, selectedPersonaId])

  const selectPersona = useCallback((personaId: string) => {
    setSelectedPersonaId(personaId)
    try {
      localStorage.setItem(STORAGE_KEY, personaId)
      window.dispatchEvent(
        new CustomEvent('lms_student_session_sync', {
          detail: { type: 'persona', id: personaId },
        })
      )
    } catch (e) {
      console.warn('Failed to persist persona:', e)
    }
  }, [])

  const updateProfile = useCallback(
    (updates: Partial<StudentPersona>) => {
      setOverrides((prev) => {
        const next = {
          ...prev,
          [currentStudent.id]: {
            ...(prev[currentStudent.id] || {}),
            ...updates,
          },
        }
        try {
          localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(next))
          window.dispatchEvent(
            new CustomEvent('lms_student_session_sync', {
              detail: { type: 'overrides', data: next },
            })
          )
        } catch (e) {
          console.warn('Failed to persist overrides:', e)
        }
        return next
      })

      // If matching ID in studentStore, sync it back to the main app store
      try {
        const existingInStore = studentStore.getOne(currentStudent.id)
        if (existingInStore) {
          studentStore.update(currentStudent.id, {
            ...(updates.fullNameEn ? { fullNameEn: updates.fullNameEn } : {}),
            ...(updates.fullNameBn ? { fullNameBn: updates.fullNameBn } : {}),
            ...(updates.mobile ? { mobile: updates.mobile } : {}),
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.bloodGroup ? { bloodGroup: updates.bloodGroup as any } : {}),
            ...(updates.address ? { presentAddress: updates.address } : {}),
            ...(updates.avatar !== undefined ? { profilePhoto: updates.avatar } : {}),
            ...(updates.fatherName !== undefined || updates.guardianMobile !== undefined
              ? {
                  father: {
                    name: updates.fatherName ?? existingInStore.father?.name ?? '',
                    mobile: updates.guardianMobile ?? existingInStore.father?.mobile ?? '',
                    occupation: existingInStore.father?.occupation ?? '',
                  },
                  guardian: {
                    name: updates.fatherName ?? existingInStore.guardian?.name ?? '',
                    relation: existingInStore.guardian?.relation ?? 'Father',
                    mobile: updates.guardianMobile ?? existingInStore.guardian?.mobile ?? '',
                    address: updates.address ?? existingInStore.guardian?.address ?? '',
                  },
                }
              : {}),
            ...(updates.motherName !== undefined
              ? {
                  mother: {
                    name: updates.motherName,
                    mobile: existingInStore.mother?.mobile ?? '',
                    occupation: existingInStore.mother?.occupation ?? '',
                  },
                }
              : {}),
          })
        }
      } catch (e) {
        console.warn('Could not sync to studentStore:', e)
      }
    },
    [currentStudent.id]
  )

  const updatePreferences = useCallback((updates: Partial<StudentPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next))
        window.dispatchEvent(
          new CustomEvent('lms_student_session_sync', {
            detail: { type: 'preferences', data: next },
          })
        )
      } catch (e) {
        console.warn('Failed to persist preferences:', e)
      }
      return next
    })
  }, [])

  return {
    student: currentStudent,
    allPersonas,
    selectPersona,
    updateProfile,
    preferences,
    updatePreferences,
    isRegular: currentStudent.roleType === 'REGULAR' || currentStudent.roleType === 'DUAL',
    isExamBatch: currentStudent.roleType === 'EXAM_BATCH' || currentStudent.roleType === 'DUAL',
    isDual: currentStudent.roleType === 'DUAL',
  }
}

export function StudentSessionProvider({ children }: { children: React.ReactNode }) {
  const session = useStudentSessionState()
  return React.createElement(StudentSessionContext.Provider, { value: session }, children)
}

export function useStudentSession(): StudentSessionContextValue {
  const context = useContext(StudentSessionContext)
  if (context) {
    return context
  }
  return useStudentSessionState()
}
