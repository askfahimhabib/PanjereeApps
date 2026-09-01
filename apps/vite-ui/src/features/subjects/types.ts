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
  // ─── CLASS 6 ───────────────────────────────────────────────────────────────
  { id: 's-001', classId: 'cls-6', className: 'Class 6', name: 'Bangla 1st Paper',     nameBn: 'বাংলা ১ম পত্র (সাহিত্য)',            code: '101', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-008', classId: 'cls-6', className: 'Class 6', name: 'Bangla 2nd Paper',     nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-002', classId: 'cls-6', className: 'Class 6', name: 'English 1st Paper',    nameBn: 'ইংরেজি ১ম পত্র',                     code: '107', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-009', classId: 'cls-6', className: 'Class 6', name: 'English 2nd Paper',    nameBn: 'ইংরেজি ২য় পত্র (Grammar & Comp)',    code: '108', paper: 'SECOND', totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-003', classId: 'cls-6', className: 'Class 6', name: 'Mathematics',          nameBn: 'গণিত',                                code: '109', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-004', classId: 'cls-6', className: 'Class 6', name: 'Science',              nameBn: 'সাধারণ বিজ্ঞান',                      code: '127', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-005', classId: 'cls-6', className: 'Class 6', name: 'BGS',                  nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',             code: '150', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-006', classId: 'cls-6', className: 'Class 6', name: 'Islam & Moral Edu',    nameBn: 'ইসলাম ও নৈতিক শিক্ষা',                code: '111', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-007', classId: 'cls-6', className: 'Class 6', name: 'ICT',                  nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',            code: '154', paper: 'NONE',   totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-010', classId: 'cls-6', className: 'Class 6', name: 'Agriculture Studies',  nameBn: 'কৃষিশিক্ষা',                         code: '134', paper: 'NONE',   totalMarks: 50,  passMarks: 17, isOptional: true,  createdAt: '2024-01-01' },

  // ─── CLASS 7 ───────────────────────────────────────────────────────────────
  { id: 's-701', classId: 'cls-7', className: 'Class 7', name: 'Bangla 1st Paper',     nameBn: 'বাংলা ১ম পত্র (সাহিত্য)',            code: '101', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-702', classId: 'cls-7', className: 'Class 7', name: 'Bangla 2nd Paper',     nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-703', classId: 'cls-7', className: 'Class 7', name: 'English 1st Paper',    nameBn: 'ইংরেজি ১ম পত্র',                     code: '107', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-704', classId: 'cls-7', className: 'Class 7', name: 'English 2nd Paper',    nameBn: 'ইংরেজি ২য় পত্র',                     code: '108', paper: 'SECOND', totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-705', classId: 'cls-7', className: 'Class 7', name: 'Mathematics',          nameBn: 'গণিত',                                code: '109', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-706', classId: 'cls-7', className: 'Class 7', name: 'Science',              nameBn: 'সাধারণ বিজ্ঞান',                      code: '127', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-707', classId: 'cls-7', className: 'Class 7', name: 'BGS',                  nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',             code: '150', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-708', classId: 'cls-7', className: 'Class 7', name: 'Islam & Moral Edu',    nameBn: 'ইসলাম ও নৈতিক শিক্ষা',                code: '111', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-709', classId: 'cls-7', className: 'Class 7', name: 'ICT',                  nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',            code: '154', paper: 'NONE',   totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },

  // ─── CLASS 8 ───────────────────────────────────────────────────────────────
  { id: 's-801', classId: 'cls-8', className: 'Class 8', name: 'Bangla 1st Paper',     nameBn: 'বাংলা ১ম পত্র (সাহিত্য কণিকা)',      code: '101', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-802', classId: 'cls-8', className: 'Class 8', name: 'Bangla 2nd Paper',     nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-803', classId: 'cls-8', className: 'Class 8', name: 'English 1st Paper',    nameBn: 'ইংরেজি ১ম পত্র',                     code: '107', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-804', classId: 'cls-8', className: 'Class 8', name: 'English 2nd Paper',    nameBn: 'ইংরেজি ২য় পত্র',                     code: '108', paper: 'SECOND', totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-805', classId: 'cls-8', className: 'Class 8', name: 'Mathematics',          nameBn: 'গণিত',                                code: '109', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-806', classId: 'cls-8', className: 'Class 8', name: 'Science',              nameBn: 'সাধারণ বিজ্ঞান',                      code: '127', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-807', classId: 'cls-8', className: 'Class 8', name: 'BGS',                  nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',             code: '150', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-808', classId: 'cls-8', className: 'Class 8', name: 'Islam & Moral Edu',    nameBn: 'ইসলাম ও নৈতিক শিক্ষা',                code: '111', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-809', classId: 'cls-8', className: 'Class 8', name: 'ICT',                  nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',            code: '154', paper: 'NONE',   totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },

  // ─── CLASS 9 ───────────────────────────────────────────────────────────────
  { id: 's-901', classId: 'cls-9', className: 'Class 9', name: 'Bangla 1st Paper',     nameBn: 'বাংলা ১ম পত্র (সাহিত্য)',            code: '101', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-902', classId: 'cls-9', className: 'Class 9', name: 'Bangla 2nd Paper',     nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-903', classId: 'cls-9', className: 'Class 9', name: 'English 1st Paper',    nameBn: 'ইংরেজি ১ম পত্র',                     code: '107', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-904', classId: 'cls-9', className: 'Class 9', name: 'English 2nd Paper',    nameBn: 'ইংরেজি ২য় পত্র (Grammar & Comp)',    code: '108', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-905', classId: 'cls-9', className: 'Class 9', name: 'General Mathematics', nameBn: 'সাধারণ গণিত',                         code: '109', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-906', classId: 'cls-9', className: 'Class 9', name: 'Islam & Moral Edu',    nameBn: 'ইসলাম ও নৈতিক শিক্ষা',                code: '111', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-907', classId: 'cls-9', className: 'Class 9', name: 'ICT',                  nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',            code: '154', paper: 'NONE',   totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-101', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-sci', groupName: 'SCIENCE', name: 'Physics',                  nameBn: 'পদার্থবিজ্ঞান',            code: '136', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-102', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-sci', groupName: 'SCIENCE', name: 'Chemistry',                nameBn: 'রসায়ন',                   code: '137', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-103', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-sci', groupName: 'SCIENCE', name: 'Biology',                  nameBn: 'জীববিজ্ঞান',                code: '138', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-104', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-sci', groupName: 'SCIENCE', name: 'Higher Math',              nameBn: 'উচ্চতর গণিত',               code: '126', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: true,  createdAt: '2024-01-01' },
  { id: 's-910', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-sci', groupName: 'SCIENCE', name: 'BGS',                      nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',     code: '150', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-201', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-com', groupName: 'COMMERCE', name: 'Accounting',               nameBn: 'হিসাববিজ্ঞান',              code: '146', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-202', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-com', groupName: 'COMMERCE', name: 'Business Entrepreneurship', nameBn: 'ব্যবসায় উদ্যোগ',           code: '143', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-203', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-com', groupName: 'COMMERCE', name: 'Finance & Banking',        nameBn: 'ফিন্যান্স ও ব্যাংকিং',      code: '152', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-920', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-art', groupName: 'ARTS', name: 'History of Bangladesh',      nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', code: '153', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-921', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-art', groupName: 'ARTS', name: 'Geography & Environment',    nameBn: 'ভূগোল ও পরিবেশ',            code: '110', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-922', classId: 'cls-9', className: 'Class 9', groupId: 'grp-9-art', groupName: 'ARTS', name: 'Civics & Citizenship',        nameBn: 'পৌরনীতি ও নাগরিকতা',         code: '140', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },

  // ─── CLASS 10 ──────────────────────────────────────────────────────────────
  { id: 's-1001', classId: 'cls-10', className: 'Class 10', name: 'Bangla 1st Paper',     nameBn: 'বাংলা ১ম পত্র (সাহিত্য)',            code: '101', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1002', classId: 'cls-10', className: 'Class 10', name: 'Bangla 2nd Paper',     nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1003', classId: 'cls-10', className: 'Class 10', name: 'English 1st Paper',    nameBn: 'ইংরেজি ১ম পত্র',                     code: '107', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1004', classId: 'cls-10', className: 'Class 10', name: 'English 2nd Paper',    nameBn: 'ইংরেজি ২য় পত্র (Grammar & Comp)',    code: '108', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1005', classId: 'cls-10', className: 'Class 10', name: 'General Mathematics', nameBn: 'সাধারণ গণিত',                         code: '109', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1006', classId: 'cls-10', className: 'Class 10', name: 'Islam & Moral Edu',    nameBn: 'ইসলাম ও নৈতিক শিক্ষা',                code: '111', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1007', classId: 'cls-10', className: 'Class 10', name: 'ICT',                  nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',            code: '154', paper: 'NONE',   totalMarks: 50,  passMarks: 17, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1011', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-sci', groupName: 'SCIENCE', name: 'Physics',                  nameBn: 'পদার্থবিজ্ঞান',            code: '136', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1012', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-sci', groupName: 'SCIENCE', name: 'Chemistry',                nameBn: 'রসায়ন',                   code: '137', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1013', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-sci', groupName: 'SCIENCE', name: 'Biology',                  nameBn: 'জীববিজ্ঞান',                code: '138', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1014', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-sci', groupName: 'SCIENCE', name: 'Higher Math',              nameBn: 'উচ্চতর গণিত',               code: '126', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: true,  createdAt: '2024-01-01' },
  { id: 's-1015', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-sci', groupName: 'SCIENCE', name: 'BGS',                      nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',     code: '150', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1021', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-com', groupName: 'COMMERCE', name: 'Accounting',               nameBn: 'হিসাববিজ্ঞান',              code: '146', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1022', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-com', groupName: 'COMMERCE', name: 'Business Entrepreneurship', nameBn: 'ব্যবসায় উদ্যোগ',           code: '143', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1023', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-com', groupName: 'COMMERCE', name: 'Finance & Banking',        nameBn: 'ফিন্যান্স ও ব্যাংকিং',      code: '152', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1031', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-art', groupName: 'ARTS', name: 'History of Bangladesh',      nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', code: '153', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1032', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-art', groupName: 'ARTS', name: 'Geography & Environment',    nameBn: 'ভূগোল ও পরিবেশ',            code: '110', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1033', classId: 'cls-10', className: 'Class 10', groupId: 'grp-10-art', groupName: 'ARTS', name: 'Civics & Citizenship',        nameBn: 'পৌরনীতি ও নাগরিকতা',         code: '140', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },

  // ─── CLASS 11 (HSC 1st Year) ──────────────────────────────────────────────
  { id: 's-1101', classId: 'cls-11', className: 'HSC 1st Year', name: 'Bangla 1st Paper',  nameBn: 'বাংলা ১ম পত্র (সাহিত্য)',          code: '101', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1102', classId: 'cls-11', className: 'HSC 1st Year', name: 'Bangla 2nd Paper',  nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1103', classId: 'cls-11', className: 'HSC 1st Year', name: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র',                   code: '107', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1104', classId: 'cls-11', className: 'HSC 1st Year', name: 'English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র',                   code: '108', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-1105', classId: 'cls-11', className: 'HSC 1st Year', name: 'ICT',               nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',          code: '275', paper: 'NONE',   totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-301', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Physics 1st Paper',      nameBn: 'পদার্থবিজ্ঞান ১ম পত্র',       code: '174', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-302', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Physics 2nd Paper',      nameBn: 'পদার্থবিজ্ঞান ২য় পত্র',       code: '175', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-303', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Chemistry 1st Paper',    nameBn: 'রসায়ন ১ম পত্র',              code: '176', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-304', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Chemistry 2nd Paper',    nameBn: 'রসায়ন ২য় পত্র',              code: '177', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-305', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Biology 1st (Botany)',   nameBn: 'উদ্ভিদবিজ্ঞান ১ম পত্র',       code: '178', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-306', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Biology 2nd (Zoology)',  nameBn: 'প্রাণিবিজ্ঞান ২য় পত্র',       code: '179', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-307', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Higher Math 1st Paper',  nameBn: 'উচ্চতর গণিত ১ম পত্র',         code: '265', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: true,  createdAt: '2024-01-01' },
  { id: 's-308', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-sci', groupName: 'SCIENCE', name: 'Higher Math 2nd Paper',  nameBn: 'উচ্চতর গণিত ২য় পত্র',         code: '266', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: true,  createdAt: '2024-01-01' },
  { id: 's-311', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-com', groupName: 'COMMERCE', name: 'Accounting 1st Paper',      nameBn: 'হিসাববিজ্ঞান ১ম পত্র',        code: '253', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-312', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-com', groupName: 'COMMERCE', name: 'Accounting 2nd Paper',      nameBn: 'হিসাববিজ্ঞান ২য় পত্র',        code: '254', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-313', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-com', groupName: 'COMMERCE', name: 'Business Org & Mgt 1st',    nameBn: 'ব্যবসায় সংগঠন ১ম পত্র',      code: '277', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-314', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-com', groupName: 'COMMERCE', name: 'Business Org & Mgt 2nd',    nameBn: 'ব্যবসায় সংগঠন ২য় পত্র',      code: '278', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-315', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-com', groupName: 'COMMERCE', name: 'Finance & Banking 1st',     nameBn: 'ফিন্যান্স ও ব্যাংকিং ১ম পত্র', code: '292', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-316', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-com', groupName: 'COMMERCE', name: 'Finance & Banking 2nd',     nameBn: 'ফিন্যান্স ও ব্যাংকিং ২য় পত্র', code: '293', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-321', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-art', groupName: 'ARTS', name: 'Civics & Good Gov 1st',        nameBn: 'পৌরনীতি ও সুশাসন ১ম পত্র',   code: '269', paper: 'FIRST',  totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
  { id: 's-322', classId: 'cls-11', className: 'HSC 1st Year', groupId: 'grp-11-art', groupName: 'ARTS', name: 'Civics & Good Gov 2nd',        nameBn: 'পৌরনীতি ও সুশাসন ২য় পত্র',   code: '270', paper: 'SECOND', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2024-01-01' },
]
