// ============================================================
//  Subjects Module — TypeScript Definitions
// ============================================================

export type SubjectPaper = 'FIRST' | 'SECOND' | 'NONE'
export type ClassGroupType = 'SCIENCE' | 'ARTS' | 'COMMERCE'

export interface Subject {
  id: string
  classId: string
  className: string
  groupId?: string
  groupName?: ClassGroupType
  name: string
  nameBn: string
  code: string
  paper: SubjectPaper
  totalMarks: number
  passMarks: number
  isOptional: boolean
  createdAt: string
}

export interface SubjectFormData {
  classId: string
  groupId?: string
  name: string
  nameBn: string
  code: string
  paper: SubjectPaper
  totalMarks: number
  passMarks: number
  isOptional: boolean
}

export const PAPER_LABELS: Record<SubjectPaper, string> = {
  FIRST: '1st Paper',
  SECOND: '2nd Paper',
  NONE: 'N/A',
}

export const CLASS_GROUP_LABELS: Record<ClassGroupType, string> = {
  SCIENCE: 'Science',
  ARTS: 'Arts',
  COMMERCE: 'Commerce',
}

// ── Mock subjects per class ───────────────────────────────────────────────────
export const MOCK_SUBJECTS: Subject[] = [
  // Class 6 (General)
  { id: 's-001', classId: 'cls-6', className: 'Class 6', name: 'Bangla 1st', nameBn: 'Bangla 1st', code: 'BN1', paper: 'FIRST', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-002', classId: 'cls-6', className: 'Class 6', name: 'English 1st', nameBn: 'English 1st', code: 'EN1', paper: 'FIRST', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-003', classId: 'cls-6', className: 'Class 6', name: 'Mathematics', nameBn: 'Mathematics', code: 'MTH', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-004', classId: 'cls-6', className: 'Class 6', name: 'Science', nameBn: 'Science', code: 'SCI', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-005', classId: 'cls-6', className: 'Class 6', name: 'Social Science', nameBn: 'Social Science', code: 'SS', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-006', classId: 'cls-6', className: 'Class 6', name: 'Religion', nameBn: 'Religion', code: 'REL', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-007', classId: 'cls-6', className: 'Class 6', name: 'ICT', nameBn: 'ICT', code: 'ICT', paper: 'NONE', totalMarks: 50, passMarks: 17, isOptional: false, createdAt: '2024-01-01' },

  // Class 9 Science
  { id: 's-101', classId: 'cls-9', className: 'Class 9', groupId: 'grp-sci-9', groupName: 'SCIENCE', name: 'Physics', nameBn: 'Physics', code: 'PHY', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-102', classId: 'cls-9', className: 'Class 9', groupId: 'grp-sci-9', groupName: 'SCIENCE', name: 'Chemistry', nameBn: 'Chemistry', code: 'CHM', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-103', classId: 'cls-9', className: 'Class 9', groupId: 'grp-sci-9', groupName: 'SCIENCE', name: 'Biology', nameBn: 'Biology', code: 'BIO', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-104', classId: 'cls-9', className: 'Class 9', groupId: 'grp-sci-9', groupName: 'SCIENCE', name: 'Higher Math', nameBn: 'Higher Math', code: 'HMT', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: true, createdAt: '2024-01-01' },

  // Class 9 Commerce
  { id: 's-201', classId: 'cls-9', className: 'Class 9', groupId: 'grp-com-9', groupName: 'COMMERCE', name: 'Accounting', nameBn: 'Accounting', code: 'ACC', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-202', classId: 'cls-9', className: 'Class 9', groupId: 'grp-com-9', groupName: 'COMMERCE', name: 'Business Studies', nameBn: 'Business Studies', code: 'BST', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-203', classId: 'cls-9', className: 'Class 9', groupId: 'grp-com-9', groupName: 'COMMERCE', name: 'Finance & Banking', nameBn: 'Finance & Banking', code: 'FIN', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },

  // Class 11 Science (Papers)
  { id: 's-301', classId: 'cls-11', className: 'Class 11', groupId: 'grp-sci-11', groupName: 'SCIENCE', name: 'Physics 1st', nameBn: 'Physics 1st', code: 'PHY1', paper: 'FIRST', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-302', classId: 'cls-11', className: 'Class 11', groupId: 'grp-sci-11', groupName: 'SCIENCE', name: 'Physics 2nd', nameBn: 'Physics 2nd', code: 'PHY2', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-303', classId: 'cls-11', className: 'Class 11', groupId: 'grp-sci-11', groupName: 'SCIENCE', name: 'Chemistry 1st', nameBn: 'Chemistry 1st', code: 'CHM1', paper: 'FIRST', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-304', classId: 'cls-11', className: 'Class 11', groupId: 'grp-sci-11', groupName: 'SCIENCE', name: 'Chemistry 2nd', nameBn: 'Chemistry 2nd', code: 'CHM2', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
]
