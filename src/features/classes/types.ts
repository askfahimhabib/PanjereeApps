import type { Gender } from '../students/types'

// ============================================================
//  Classes Module — TypeScript Definitions
// ============================================================

export type ShiftType = 'MORNING' | 'DAY' | 'EVENING'
export type SectionStatus = 'ACTIVE' | 'INACTIVE'
export type ClassGroupType = 'SCIENCE' | 'ARTS' | 'COMMERCE'

export interface ClassItem {
  id: string
  name: string
  numericName: number
  academicYear: string
  shift: ShiftType
  hasGroups: boolean
  totalStudents: number
  totalSections: number
  totalGroups?: number
  feeMonthly?: number
  attendanceRate?: number
  feeCollectionRate?: number
  isActive: boolean      // false = archived/hidden from active view
  createdAt: string
  groups?: { id: string; name: ClassGroupType }[]
}

export interface ClassGroup {
  id: string
  classId: string
  className: string
  name: ClassGroupType
  totalStudents: number
  totalSections: number
}

export interface Section {
  id: string
  classId: string
  className: string
  groupId?: string
  groupName?: string
  name: string
  capacity: number
  totalStudents: number
  maleCount: number
  femaleCount: number
  classTeacherId?: string
  classTeacherName?: string
  status: SectionStatus
  isRollFrozen: boolean
  shift: ShiftType
  academicYear: string
  attendanceRate?: number
  feeCollectionRate?: number
}

export interface SectionStudent {
  id: string
  roll: number
  rollPrefix: string // e.g. 9A
  studentId: string
  fullNameEn: string
  fullNameBn: string
  gender: Gender
  profilePhoto?: string
  attendanceRate?: number
  feeStatus?: 'PAID' | 'DUE' | 'PARTIAL'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  sectionId?: string
  sectionName?: string
}
