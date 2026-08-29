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
  // 14. System Info
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  createdBy: string
  updatedBy: string
  isArchived: boolean

  // 1. Basic Info
  studentId: string           // Auto-generated: STU-2024-001
  rollNumber: string
  registrationNumber: string
  fullNameEn: string
  fullNameBn: string
  profilePhoto?: string
  gender: Gender
  dateOfBirth: string
  bloodGroup?: BloodGroup
  religion: string
  nationality: string

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
  targetExam?: TargetExam
  // ─ Common academic
  version: StudentVersion
  session: string
  admissionDate: string
  admissionNumber: string
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

  // 5. Auth Info (password hash never stored on frontend)
  username: string
  loginStatus: LoginStatus

  // 11. Documents
  documents?: StudentDocuments

  // 15. Custom Fields
  customFields?: CustomField[]
}

// ── Wizard Form Data (step-by-step) ──────────────────────────
export interface StudentFormData {
  // Step 1 — Basic + Academic
  fullNameEn: string
  fullNameBn: string
  gender: Gender | ''
  dateOfBirth: string
  bloodGroup: BloodGroup | ''
  religion: string
  nationality: string
  type: StudentType | ''
  classId: string
  sectionId: string
  groupId: StudentGroup | ''
  shift: StudentShift | ''
  batchId: string
  targetExam: TargetExam | ''
  version: StudentVersion | ''
  session: string
  admissionDate: string
  admissionNumber: string
  previousSchool: string
  status: StudentStatus

  // Step 2 — Contact + Parent
  mobile: string
  whatsapp: string
  email: string
  presentAddress: string
  permanentAddress: string
  sameAddress: boolean
  fatherName: string
  fatherMobile: string
  fatherOccupation: string
  fatherNid: string
  motherName: string
  motherMobile: string
  motherOccupation: string
  hasGuardian: boolean
  guardianName: string
  guardianRelation: string
  guardianMobile: string
  guardianAddress: string
  emergencyContact: string

  // Step 3 — Auth
  username: string
  password: string
  confirmPassword: string
  loginStatus: LoginStatus

  // Step 4 — Documents + Custom Fields
  customFields: CustomField[]
}

export const initialFormData: StudentFormData = {
  fullNameEn: '',
  fullNameBn: '',
  gender: '',
  dateOfBirth: '',
  bloodGroup: '',
  religion: 'Islam',
  nationality: 'Bangladeshi',
  type: '',
  classId: '',
  sectionId: '',
  groupId: '',
  shift: '',
  batchId: '',
  targetExam: '',
  version: '',
  session: new Date().getFullYear().toString(),
  admissionDate: new Date().toISOString().split('T')[0],
  admissionNumber: '',
  previousSchool: '',
  status: 'ACTIVE',
  mobile: '',
  whatsapp: '',
  email: '',
  presentAddress: '',
  permanentAddress: '',
  sameAddress: false,
  fatherName: '',
  fatherMobile: '',
  fatherOccupation: '',
  fatherNid: '',
  motherName: '',
  motherMobile: '',
  motherOccupation: '',
  hasGuardian: false,
  guardianName: '',
  guardianRelation: '',
  guardianMobile: '',
  guardianAddress: '',
  emergencyContact: '',
  username: '',
  password: '',
  confirmPassword: '',
  loginStatus: 'ACTIVE',
  customFields: [],
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
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE:  'bg-zinc-500/10 text-zinc-600 border-zinc-100/20',
  PASSED:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  LEFT:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
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
