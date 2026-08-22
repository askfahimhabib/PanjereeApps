// ============================================================
//  Teacher Module — TypeScript Definitions
//  All fields from the full teacher data plan
// ============================================================

// ── Core Enums / Unions ────────────────────────────────────
export type TeacherCategory  = 'REGULAR' | 'GUEST'
export type EmploymentType   = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTUAL' | 'VISITING'
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED'
export type AccountStatus    = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type Gender           = 'MALE' | 'FEMALE' | 'OTHER'
export type BloodGroup       = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type Religion         = 'ISLAM' | 'HINDUISM' | 'CHRISTIANITY' | 'BUDDHISM' | 'OTHER'
export type MaritalStatus    = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
export type AssignmentType   = 'PRIMARY' | 'SECONDARY' | 'ADDITIONAL'
export type TeacherRole      = 'ADMIN' | 'HEAD_TEACHER' | 'ASSISTANT_TEACHER'
export type TrainingCategory = 'PEDAGOGY' | 'TECHNOLOGY' | 'SUBJECT_SPECIFIC' | 'MANAGEMENT' | 'OTHER'
export type DocumentType     = 'NID' | 'BIRTH_CERT' | 'DEGREE_CERT' | 'EXPERIENCE_LETTER' | 'PHOTO' | 'SIGNATURE' | 'OTHER'
export type TeachingLevel    = 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SECONDARY' | 'HIGHER_SECONDARY'
export type Division         = 'DHAKA' | 'CHITTAGONG' | 'RAJSHAHI' | 'KHULNA' | 'SYLHET' | 'BARISAL' | 'RANGPUR' | 'MYMENSINGH'

export type Designation =
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ASSISTANT_HEADMASTER'
  | 'SENIOR_TEACHER'
  | 'ASSISTANT_TEACHER'
  | 'JUNIOR_TEACHER'
  | 'LAB_TEACHER'
  | 'PT_TEACHER'
  | 'ICT_TEACHER'
  | 'LIBRARY_TEACHER'
  | 'RELIGIOUS_TEACHER'
  | 'ARTS_TEACHER'

// Department = Subject-based per Bangladesh curriculum Class 5-12
export type Department =
  | 'BANGLA'
  | 'BANGLA_1ST_PAPER'
  | 'BANGLA_2ND_PAPER'
  | 'ENGLISH'
  | 'ENGLISH_1ST_PAPER'
  | 'ENGLISH_2ND_PAPER'
  | 'MATHEMATICS'
  | 'SCIENCE'
  | 'PHYSICS'
  | 'PHYSICS_1ST_PAPER'
  | 'PHYSICS_2ND_PAPER'
  | 'CHEMISTRY'
  | 'CHEMISTRY_1ST_PAPER'
  | 'CHEMISTRY_2ND_PAPER'
  | 'BIOLOGY'
  | 'BIOLOGY_1ST_PAPER'
  | 'BIOLOGY_2ND_PAPER'
  | 'HIGHER_MATH'
  | 'HIGHER_MATH_1ST_PAPER'
  | 'HIGHER_MATH_2ND_PAPER'
  | 'SOCIAL_SCIENCE'
  | 'BANGLADESH_WORLD'
  | 'HISTORY'
  | 'HISTORY_1ST_PAPER'
  | 'HISTORY_2ND_PAPER'
  | 'GEOGRAPHY'
  | 'GEOGRAPHY_1ST_PAPER'
  | 'GEOGRAPHY_2ND_PAPER'
  | 'CIVICS'
  | 'CIVICS_1ST_PAPER'
  | 'CIVICS_2ND_PAPER'
  | 'ECONOMICS'
  | 'ECONOMICS_1ST_PAPER'
  | 'ECONOMICS_2ND_PAPER'
  | 'ACCOUNTING'
  | 'ACCOUNTING_1ST_PAPER'
  | 'ACCOUNTING_2ND_PAPER'
  | 'BUSINESS_STUDIES'
  | 'FINANCE_BANKING'
  | 'FINANCE_BANKING_1ST_PAPER'
  | 'FINANCE_BANKING_2ND_PAPER'
  | 'BUSINESS_ORGANIZATION'
  | 'BUSINESS_ORGANIZATION_1ST_PAPER'
  | 'BUSINESS_ORGANIZATION_2ND_PAPER'
  | 'ISLAMIC_STUDIES'
  | 'ISLAMIC_STUDIES_1ST_PAPER'
  | 'ISLAMIC_STUDIES_2ND_PAPER'
  | 'HINDU_STUDIES'
  | 'ICT'
  | 'PHYSICAL_EDUCATION'
  | 'ARTS_CRAFTS'
  | 'AGRICULTURE'
  | 'AGRICULTURE_1ST_PAPER'
  | 'AGRICULTURE_2ND_PAPER'
  | 'HOME_SCIENCE'
  | 'HOME_SCIENCE_1ST_PAPER'
  | 'HOME_SCIENCE_2ND_PAPER'

// ── Sub-interfaces ─────────────────────────────────────────

export interface TeacherQualification {
  id: string
  degree: string
  subject: string
  institution: string
  university: string
  result: string
  passingYear: number
}

export interface TeacherCertification {
  id: string
  name: string
  issuer: string
  year: number
  certificateUrl?: string
}

export interface PreviousExperience {
  id: string
  organization: string
  designation: string
  fromYear: number
  toYear?: number
  duration: string
}

/** Cross-module: consumed by Routine, Attendance, Salary, Exam, Leave */
export interface TeacherAssignment {
  id: string
  academicYear: string
  classId: string
  className: string
  sectionId?: string
  sectionName?: string
  subjectId: string
  subjectName: string
  assignmentType: AssignmentType
  isClassTeacher: boolean
}

export interface TeacherTraining {
  id: string
  name: string
  provider: string
  category: TrainingCategory
  startDate: string
  endDate: string
  duration: string
  certificateUrl?: string
}

export interface TeacherDocument {
  id: string
  type: DocumentType
  name: string
  url: string
  uploadedAt: string
}

// ── Main Teacher Interface ─────────────────────────────────
export interface Teacher {
  // ── System Metadata ──────────────────────────────────────
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt?: string
  isActive: boolean

  // ── Section 1: Basic Information ─────────────────────────
  teacherId: string           // Auto: TCH-2024-001
  employeeId: string          // Manual: EMP-001
  fullName: string
  firstName: string
  lastName: string
  nameBangla?: string
  profilePhoto?: string
  gender: Gender
  dateOfBirth: string
  bloodGroup?: BloodGroup
  nationality: string
  nidNumber?: string
  birthCertificateNumber?: string
  maritalStatus?: MaritalStatus
  religion?: Religion
  signatureUrl?: string

  // ── Section 2: Contact Information ───────────────────────
  phone: string
  alternativePhone?: string
  email?: string
  whatsapp?: string

  // ── Section 3: Address ────────────────────────────────────
  presentAddress: string
  permanentAddress?: string
  division?: Division
  district?: string
  upazila?: string
  area?: string
  postalCode?: string

  // ── Section 4: Employment ────────────────────────────────────
  teacherCategory: TeacherCategory  // REGULAR | GUEST
  joiningDate: string
  employmentType: EmploymentType
  employmentStatus: EmploymentStatus
  designation: Designation
  department?: Department
  resignationDate?: string
  terminationDate?: string
  terminationReason?: string

  // ── Section 5: Academic / Professional ───────────────────
  qualifications: TeacherQualification[]
  certifications: TeacherCertification[]
  specialization?: string
  teachingSubjects: string[]
  teachingLevels: TeachingLevel[]
  previousExperience: PreviousExperience[]

  // ── Section 6: Teaching Assignments ──────────────────────
  assignments: TeacherAssignment[]

  // ── Section 7: Training ───────────────────────────────────
  trainings: TeacherTraining[]

  // ── Section 8: Documents ──────────────────────────────────
  documents: TeacherDocument[]

  // ── Section 9: System / Account ──────────────────────────
  userId?: string
  username?: string
  loginEmail?: string
  loginPhone?: string
  accountStatus: AccountStatus
  role: TeacherRole
  permissions?: string[]
  lastLogin?: string
}

// ── Lightweight reference type for other modules ───────────
/** Import this in Routine, Attendance, Salary, Exam, Leave modules */
export interface TeacherRef {
  id: string
  teacherId: string
  fullName: string
  nameBangla?: string
  teacherCategory: TeacherCategory
  designation: Designation
  department?: Department
  employmentStatus: EmploymentStatus
  phone: string
  profilePhoto?: string
  assignments: TeacherAssignment[]
}

// ── Form Sub-types ─────────────────────────────────────────
export interface QualificationForm {
  degree: string
  subject: string
  institution: string
  university: string
  result: string
  passingYear: string
}

export interface CertificationForm {
  name: string
  issuer: string
  year: string
}

export interface ExperienceForm {
  organization: string
  designation: string
  fromYear: string
  toYear: string
}

export interface AssignmentForm {
  academicYear: string
  classId: string
  sectionId: string
  subjectId: string
  assignmentType: AssignmentType | ''
  isClassTeacher: boolean
}

// ── Wizard Form Data (6-step) ──────────────────────────────
export interface TeacherFormData {
  // Step 1 — Basic Info
  profilePhoto: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  nameBangla: string
  gender: Gender | ''
  dateOfBirth: string
  bloodGroup: BloodGroup | ''
  nationality: string
  nidNumber: string
  birthCertificateNumber: string
  maritalStatus: MaritalStatus | ''
  religion: Religion | ''
  signatureUrl: string

  // Step 2 — Contact & Address
  phone: string
  alternativePhone: string
  email: string
  whatsapp: string
  presentAddress: string
  permanentAddress: string
  sameAddress: boolean
  division: Division | ''
  district: string
  upazila: string
  area: string
  postalCode: string

  // Step 3 — Employment
  teacherCategory: TeacherCategory
  joiningDate: string
  employmentType: EmploymentType | ''
  employmentStatus: EmploymentStatus
  designation: Designation | ''
  department: Department | ''
  resignationDate: string
  terminationDate: string
  terminationReason: string

  // Step 4 — Academic & Professional
  qualifications: QualificationForm[]
  certifications: CertificationForm[]
  specialization: string
  teachingSubjects: string[]
  teachingLevels: TeachingLevel[]
  previousExperience: ExperienceForm[]

  // Step 5 — Teaching Assignments
  assignments: AssignmentForm[]

  // Step 6 — Account Setup
  username: string
  loginEmail: string
  loginPhone: string
  password: string
  confirmPassword: string
  role: TeacherRole
  accountStatus: AccountStatus
}

const currentYear = new Date().getFullYear()

export const initialFormData: TeacherFormData = {
  profilePhoto: '',
  employeeId: '',
  firstName: '',
  lastName: '',
  fullName: '',
  nameBangla: '',
  gender: '',
  dateOfBirth: '',
  bloodGroup: '',
  nationality: 'Bangladeshi',
  nidNumber: '',
  birthCertificateNumber: '',
  maritalStatus: '',
  religion: 'ISLAM',
  signatureUrl: '',
  phone: '',
  alternativePhone: '',
  email: '',
  whatsapp: '',
  presentAddress: '',
  permanentAddress: '',
  sameAddress: false,
  division: '',
  district: '',
  upazila: '',
  area: '',
  postalCode: '',
  teacherCategory: 'REGULAR',
  joiningDate: new Date().toISOString().split('T')[0],
  employmentType: '',
  employmentStatus: 'ACTIVE',
  designation: '',
  department: '',
  resignationDate: '',
  terminationDate: '',
  terminationReason: '',
  qualifications: [{ degree: '', subject: '', institution: '', university: '', result: '', passingYear: '' }],
  certifications: [],
  specialization: '',
  teachingSubjects: [],
  teachingLevels: [],
  previousExperience: [],
  assignments: [{ academicYear: String(currentYear), classId: '', sectionId: '', subjectId: '', assignmentType: '', isClassTeacher: false }],
  username: '',
  loginEmail: '',
  loginPhone: '',
  password: '',
  confirmPassword: '',
  role: 'ASSISTANT_TEACHER',
  accountStatus: 'ACTIVE',
}

// ── Filters ────────────────────────────────────────────
export interface TeacherFilters {
  search: string
  teacherCategory: TeacherCategory | 'ALL'
  employmentType: EmploymentType | 'ALL'
  employmentStatus: EmploymentStatus | 'ALL'
  department: Department | 'ALL'
  designation: Designation | 'ALL'
}

// ── Display Helpers ────────────────────────────────────────────
export const TEACHER_CATEGORY_LABELS: Record<TeacherCategory, string> = {
  REGULAR: 'Regular Teacher',
  GUEST:   'Guest Teacher',
}

export const TEACHER_CATEGORY_COLORS: Record<TeacherCategory, string> = {
  REGULAR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  GUEST:   'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

export const STATUS_LABELS: Record<EmploymentStatus, string> = {
  ACTIVE:      'Active',
  INACTIVE:    'Inactive',
  ON_LEAVE:    'On Leave',
  RESIGNED:    'Resigned',
  TERMINATED:  'Terminated',
}

export const STATUS_COLORS: Record<EmploymentStatus, string> = {
  ACTIVE:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE:    'bg-slate-500/10 text-slate-400 border-slate-500/20',
  ON_LEAVE:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESIGNED:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  TERMINATED:  'bg-red-500/10 text-red-400 border-red-500/20',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME:    'Full Time',
  PART_TIME:    'Part Time',
  CONTRACTUAL:  'Contractual',
  VISITING:     'Visiting',
}

export const DESIGNATION_LABELS: Record<Designation, string> = {
  PRINCIPAL:            'Principal',
  VICE_PRINCIPAL:       'Vice Principal',
  ASSISTANT_HEADMASTER: 'Assistant Headmaster',
  SENIOR_TEACHER:       'Senior Teacher',
  ASSISTANT_TEACHER:    'Assistant Teacher',
  JUNIOR_TEACHER:       'Junior Teacher',
  LAB_TEACHER:          'Lab Teacher',
  PT_TEACHER:           'PT Teacher',
  ICT_TEACHER:          'ICT Teacher',
  LIBRARY_TEACHER:      'Library Teacher',
  RELIGIOUS_TEACHER:    'Religious Studies Teacher',
  ARTS_TEACHER:         'Arts Teacher',
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  BANGLA:               'বাংলা (Bangla)',
  BANGLA_1ST_PAPER:     'বাংলা ১ম পত্র (Bangla 1st Paper)',
  BANGLA_2ND_PAPER:     'বাংলা ২য় পত্র (Bangla 2nd Paper)',
  ENGLISH:              'ইংরেজি (English)',
  ENGLISH_1ST_PAPER:    'ইংরেজি ১ম পত্র (English 1st Paper)',
  ENGLISH_2ND_PAPER:    'ইংরেজি ২য় পত্র (English 2nd Paper)',
  MATHEMATICS:          'গণিত (Mathematics)',
  SCIENCE:              'বিজ্ঞান (Science)',
  PHYSICS:              'পদার্থবিজ্ঞান (Physics)',
  PHYSICS_1ST_PAPER:    'পদার্থবিজ্ঞান ১ম পত্র (Physics 1st Paper)',
  PHYSICS_2ND_PAPER:    'পদার্থবিজ্ঞান ২য় পত্র (Physics 2nd Paper)',
  CHEMISTRY:            'রসায়ন (Chemistry)',
  CHEMISTRY_1ST_PAPER:  'রসায়ন ১ম পত্র (Chemistry 1st Paper)',
  CHEMISTRY_2ND_PAPER:  'রসায়ন ২য় পত্র (Chemistry 2nd Paper)',
  BIOLOGY:              'জীববিজ্ঞান (Biology)',
  BIOLOGY_1ST_PAPER:    'জীববিজ্ঞান ১ম পত্র (Biology 1st Paper)',
  BIOLOGY_2ND_PAPER:    'জীববিজ্ঞান ২য় পত্র (Biology 2nd Paper)',
  HIGHER_MATH:          'উচ্চতর গণিত (Higher Math)',
  HIGHER_MATH_1ST_PAPER:'উচ্চতর গণিত ১ম পত্র (Higher Math 1st Paper)',
  HIGHER_MATH_2ND_PAPER:'উচ্চতর গণিত ২য় পত্র (Higher Math 2nd Paper)',
  SOCIAL_SCIENCE:       'সমাজ বিজ্ঞান (Social Science)',
  BANGLADESH_WORLD:     'বাংলাদেশ ও বিশ্বপরিচয় (BGS)',
  HISTORY:              'ইতিহাস (History)',
  HISTORY_1ST_PAPER:    'ইতিহাস ১ম পত্র (History 1st Paper)',
  HISTORY_2ND_PAPER:    'ইতিহাস ২য় পত্র (History 2nd Paper)',
  GEOGRAPHY:            'ভূগোল (Geography)',
  GEOGRAPHY_1ST_PAPER:  'ভূগোল ১ম পত্র (Geography 1st Paper)',
  GEOGRAPHY_2ND_PAPER:  'ভূগোল ২য় পত্র (Geography 2nd Paper)',
  CIVICS:               'পৌরনীতি (Civics)',
  CIVICS_1ST_PAPER:     'পৌরনীতি ১ম পত্র (Civics 1st Paper)',
  CIVICS_2ND_PAPER:     'পৌরনীতি ২য় পত্র (Civics 2nd Paper)',
  ECONOMICS:            'অর্থনীতি (Economics)',
  ECONOMICS_1ST_PAPER:  'অর্থনীতি ১ম পত্র (Economics 1st Paper)',
  ECONOMICS_2ND_PAPER:  'অর্থনীতি ২য় পত্র (Economics 2nd Paper)',
  ACCOUNTING:           'হিসাববিজ্ঞান (Accounting)',
  ACCOUNTING_1ST_PAPER: 'হিসাববিজ্ঞান ১ম পত্র (Accounting 1st Paper)',
  ACCOUNTING_2ND_PAPER: 'হিসাববিজ্ঞান ২য় পত্র (Accounting 2nd Paper)',
  BUSINESS_STUDIES:     'ব্যবসায় শিক্ষা (Business Studies)',
  FINANCE_BANKING:      'ফিন্যান্স ও ব্যাংকিং (Finance & Banking)',
  FINANCE_BANKING_1ST_PAPER: 'ফিন্যান্স ১ম পত্র (Finance 1st Paper)',
  FINANCE_BANKING_2ND_PAPER: 'ফিন্যান্স ২য় পত্র (Finance 2nd Paper)',
  BUSINESS_ORGANIZATION:'ব্যবসায় সংগঠন (Business Org.)',
  BUSINESS_ORGANIZATION_1ST_PAPER:'ব্যবসায় সংগঠন ১ম পত্র (Business Org. 1st Paper)',
  BUSINESS_ORGANIZATION_2ND_PAPER:'ব্যবসায় সংগঠন ২য় পত্র (Business Org. 2nd Paper)',
  ISLAMIC_STUDIES:      'ইসলাম ধর্ম শিক্ষা (Islamic Studies)',
  ISLAMIC_STUDIES_1ST_PAPER: 'ইসলাম শিক্ষা ১ম পত্র (Islamic Studies 1st Paper)',
  ISLAMIC_STUDIES_2ND_PAPER: 'ইসলাম শিক্ষা ২য় পত্র (Islamic Studies 2nd Paper)',
  HINDU_STUDIES:        'হিন্দু ধর্ম শিক্ষা (Hindu Studies)',
  ICT:                  'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
  PHYSICAL_EDUCATION:   'শারীরিক শিক্ষা (PE)',
  ARTS_CRAFTS:          'চারু ও কারুকলা (Arts & Crafts)',
  AGRICULTURE:          'কৃষিশিক্ষা (Agriculture)',
  AGRICULTURE_1ST_PAPER:'কৃষিশিক্ষা ১ম পত্র (Agriculture 1st Paper)',
  AGRICULTURE_2ND_PAPER:'কৃষিশিক্ষা ২য় পত্র (Agriculture 2nd Paper)',
  HOME_SCIENCE:         'গার্হস্থ্য বিজ্ঞান (Home Science)',
  HOME_SCIENCE_1ST_PAPER:'গার্হস্থ্য বিজ্ঞান ১ম পত্র (Home Science 1st Paper)',
  HOME_SCIENCE_2ND_PAPER:'গার্হস্থ্য বিজ্ঞান ২য় পত্র (Home Science 2nd Paper)',
}

export const TEACHING_LEVEL_LABELS: Record<TeachingLevel, string> = {
  PRIMARY:           'Primary (Class 5-6)',
  JUNIOR_SECONDARY:  'Junior Secondary (Class 7-8)',
  SECONDARY:         'Secondary (Class 9-10 / SSC)',
  HIGHER_SECONDARY:  'Higher Secondary (Class 11-12 / HSC)',
}

export const ROLE_LABELS: Record<TeacherRole, string> = {
  ADMIN:             'Admin',
  HEAD_TEACHER:      'Head Teacher',
  ASSISTANT_TEACHER: 'Assistant Teacher',
}

export const TRAINING_CATEGORY_LABELS: Record<TrainingCategory, string> = {
  PEDAGOGY:         'Pedagogy',
  TECHNOLOGY:       'Technology',
  SUBJECT_SPECIFIC: 'Subject Specific',
  MANAGEMENT:       'Management',
  OTHER:            'Other',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  NID:               'National ID (NID)',
  BIRTH_CERT:        'Birth Certificate',
  DEGREE_CERT:       'Degree Certificate',
  EXPERIENCE_LETTER: 'Experience Letter',
  PHOTO:             'Profile Photo',
  SIGNATURE:         'Signature',
  OTHER:             'Other Document',
}

export const DIVISION_LABELS: Record<Division, string> = {
  DHAKA:      'ঢাকা (Dhaka)',
  CHITTAGONG: 'চট্টগ্রাম (Chittagong)',
  RAJSHAHI:   'রাজশাহী (Rajshahi)',
  KHULNA:     'খুলনা (Khulna)',
  SYLHET:     'সিলেট (Sylhet)',
  BARISAL:    'বরিশাল (Barisal)',
  RANGPUR:    'রংপুর (Rangpur)',
  MYMENSINGH: 'ময়মনসিংহ (Mymensingh)',
}

export const GENDER_LABELS: Record<Gender, string> = {
  MALE:   'Male',
  FEMALE: 'Female',
  OTHER:  'Other',
}

export const ACCOUNT_STATUS_COLORS: Record<AccountStatus, string> = {
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
}
