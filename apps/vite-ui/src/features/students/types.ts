// ============================================================
//  Student Module — TypeScript Definitions
//  Based on user's full data plan
// ============================================================

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'PASSED' | 'LEFT' | 'SUSPENDED'
export type StudentType   = 'REGULAR' | 'EXAM_BATCH'
export type StudentGroup  = 'SCIENCE' | 'ARTS' | 'COMMERCE'
export type StudentShift  = 'MORNING' | 'DAY'
export type StudentVersion = 'BANGLA' | 'ENGLISH'
export type Gender        = 'MALE' | 'FEMALE' | 'OTHER'
export type BloodGroup    = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type LoginStatus   = 'ACTIVE' | 'INACTIVE'
export type TargetExam    = 'SSC' | 'HSC'

// ── Reference Data ────────────────────────────────────────────
export interface ClassInfo {
  id: string
  name: string
}

export interface SectionInfo {
  id: string
  name: string
}

export interface BatchInfo {
  id: string
  name: string
  targetExam: TargetExam
}

// ── Sub-entities ───────────────────────────────────────────────
export interface FatherInfo {
  name: string
  mobile: string
  occupation: string
  nid?: string
}

export interface MotherInfo {
  name: string
  mobile: string
  occupation: string
}

export interface GuardianInfo {
  name: string
  relation: string
  mobile: string
  address: string
}

export interface StudentDocuments {
  birthCertificate?: string
  nid?: string
  studentPhoto?: string
  fatherNid?: string
  motherNid?: string
  transferCertificate?: string
  previousMarksheet?: string
  admissionFormPdf?: string
}

export interface CustomField {
  key: string
  value: string
}

// ── Main Student Entity ────────────────────────────────────────
export interface Student {
  // System Info
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  createdBy: string
  updatedBy: string
  isArchived: boolean

  // 1. Basic Identity
  studentId: string           // Auto-generated: STU-2026-001
  rollNumber: string
  registrationNumber: string
  fullNameEn: string
  fullNameBn?: string
  profilePhoto?: string
  gender: Gender
  dateOfBirth: string
  bloodGroup?: BloodGroup
  religion?: string
  nationality?: string

  // 2. Academic Info
  type: StudentType
  // ─ Regular Student fields
  classId?: string
  className?: string
  sectionId?: string
  sectionName?: string
  groupId?: StudentGroup
  shift?: StudentShift
  // ─ Exam Batch fields
  batchId?: string
  batchName?: string
  batchSectionId?: string
  batchSectionName?: string
  targetExam?: TargetExam | 'ADMISSION'
  schoolName?: string         // Original school/college for batch students
  
  // ─ Common academic
  version: StudentVersion
  session: string
  admissionDate: string
  admissionNumber?: string
  previousSchool?: string
  status: StudentStatus

  // 3. Contact Info
  mobile: string
  whatsapp?: string
  email?: string
  presentAddress: string
  permanentAddress?: string

  // 4. Parent / Guardian Info
  father: FatherInfo
  mother: MotherInfo
  guardian?: GuardianInfo
  emergencyContact?: string

  // 5. Auth Info (auto-generated in background)
  username?: string
  loginStatus: LoginStatus

  // 6. Documents & Custom
  documents?: StudentDocuments
  customFields?: CustomField[]
}

// ── Streamlined Form Data (2-Step Fast Flow) ──────────────────
export interface StudentFormData {
  // Track Type
  type: StudentType

  // Step 1 — Basic & Academic Info
  fullNameEn: string
  fullNameBn: string
  gender: Gender | ''
  dateOfBirth: string
  bloodGroup: BloodGroup | ''
  mobile: string
  email: string
  profilePhoto?: string

  // Regular Track
  classId: string
  className?: string
  sectionId: string
  sectionName?: string
  rollNumber: string
  groupId: StudentGroup | ''
  shift: StudentShift | ''

  // Exam Batch Track
  batchId: string
  batchName?: string
  batchSectionId?: string
  batchSectionName?: string
  targetExam: TargetExam | 'ADMISSION' | ''
  schoolName: string

  // Common Academic
  version: StudentVersion | ''
  session: string
  admissionDate: string
  admissionNumber: string
  status: StudentStatus

  // Step 2 — Parent & Address
  fatherName: string
  fatherMobile: string
  fatherOccupation: string
  motherName: string
  motherMobile: string
  motherOccupation: string
  hasGuardian: boolean
  guardianName: string
  guardianRelation: string
  guardianMobile: string
  presentAddress: string
  permanentAddress: string
  sameAddress: boolean
}

export const initialFormData: StudentFormData = {
  type: 'REGULAR',
  fullNameEn: '',
  fullNameBn: '',
  gender: 'MALE',
  dateOfBirth: '',
  bloodGroup: '',
  mobile: '',
  email: '',
  profilePhoto: '',

  classId: '',
  className: '',
  sectionId: '',
  sectionName: '',
  rollNumber: '',
  groupId: '',
  shift: 'DAY',

  batchId: '',
  batchName: '',
  batchSectionId: '',
  batchSectionName: '',
  targetExam: 'SSC',
  schoolName: '',

  version: 'BANGLA',
  session: new Date().getFullYear().toString(),
  admissionDate: new Date().toISOString().split('T')[0],
  admissionNumber: '',
  status: 'ACTIVE',

  fatherName: '',
  fatherMobile: '',
  fatherOccupation: '',
  motherName: '',
  motherMobile: '',
  motherOccupation: '',
  hasGuardian: false,
  guardianName: '',
  guardianRelation: '',
  guardianMobile: '',
  presentAddress: '',
  permanentAddress: '',
  sameAddress: true,
}

// ── Display Helpers ────────────────────────────────────────────
export const STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE:    'Active',
  INACTIVE:  'Inactive',
  PASSED:    'Passed',
  LEFT:      'Left',
  SUSPENDED: 'Suspended',
}

export const STATUS_COLORS: Record<StudentStatus, string> = {
  ACTIVE:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE:  'bg-zinc-100 text-zinc-600 border-zinc-200',
  PASSED:    'bg-blue-50 text-blue-700 border-blue-200',
  LEFT:      'bg-amber-50 text-amber-700 border-amber-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
}

export const GROUP_LABELS: Record<StudentGroup, string> = {
  SCIENCE:  'Science',
  ARTS:     'Arts',
  COMMERCE: 'Commerce',
}

export const GENDER_LABELS: Record<Gender, string> = {
  MALE:   'Male',
  FEMALE: 'Female',
  OTHER:  'Other',
}
