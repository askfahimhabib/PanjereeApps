import type { ClassItem, ClassGroup, Section, SectionStudent } from './types'

export const mockClasses: ClassItem[] = Array.from({ length: 12 }, (_, i) => {
  const numericName = i + 1
  const hasGroups = numericName >= 9
  
  return {
    id: `cls-${numericName}`,
    name: numericName > 10 ? (numericName === 11 ? 'HSC 1st Year' : 'HSC 2nd Year') : `Class ${numericName}`,
    numericName,
    academicYear: '2024-2025',
    shift: 'DAY',
    hasGroups,
    totalStudents: numericName === 8 ? 20 : 0,
    totalSections: hasGroups ? 3 : 1,
    totalGroups: hasGroups ? 3 : undefined,
    feeMonthly: 500 + (numericName * 100),
    attendanceRate: 70 + ((numericName * 7) % 25),
    feeCollectionRate: 60 + ((numericName * 11) % 35),
    isActive: true,
    createdAt: new Date().toISOString(),
  }
})

export const mockGroups: ClassGroup[] = [
  { id: 'grp-9-sci', classId: 'cls-9', className: 'Class 9', name: 'SCIENCE', totalStudents: 0, totalSections: 1 },
  { id: 'grp-9-art', classId: 'cls-9', className: 'Class 9', name: 'ARTS', totalStudents: 0, totalSections: 0 },
  { id: 'grp-9-com', classId: 'cls-9', className: 'Class 9', name: 'COMMERCE', totalStudents: 0, totalSections: 0 },
  { id: 'grp-10-sci', classId: 'cls-10', className: 'Class 10', name: 'SCIENCE', totalStudents: 0, totalSections: 0 },
  { id: 'grp-10-art', classId: 'cls-10', className: 'Class 10', name: 'ARTS', totalStudents: 0, totalSections: 0 },
  { id: 'grp-10-com', classId: 'cls-10', className: 'Class 10', name: 'COMMERCE', totalStudents: 0, totalSections: 0 },
  { id: 'grp-11-sci', classId: 'cls-11', className: 'HSC 1st Year', name: 'SCIENCE', totalStudents: 0, totalSections: 0 },
  { id: 'grp-11-art', classId: 'cls-11', className: 'HSC 1st Year', name: 'ARTS', totalStudents: 0, totalSections: 0 },
  { id: 'grp-11-com', classId: 'cls-11', className: 'HSC 1st Year', name: 'COMMERCE', totalStudents: 0, totalSections: 0 },
  { id: 'grp-12-sci', classId: 'cls-12', className: 'HSC 2nd Year', name: 'SCIENCE', totalStudents: 0, totalSections: 0 },
  { id: 'grp-12-art', classId: 'cls-12', className: 'HSC 2nd Year', name: 'ARTS', totalStudents: 0, totalSections: 0 },
  { id: 'grp-12-com', classId: 'cls-12', className: 'HSC 2nd Year', name: 'COMMERCE', totalStudents: 0, totalSections: 0 },
]

export const mockSections: Section[] = [
  {
    id: 'sec-8-a',
    classId: 'cls-8',
    className: 'Class 8',
    name: 'A',
    capacity: 45,
    totalStudents: 20,
    maleCount: 12,
    femaleCount: 8,
    classTeacherId: 'tch-1',
    classTeacherName: 'Md. Rahim Uddin',
    status: 'ACTIVE',
    isRollFrozen: true,
    shift: 'DAY',
    academicYear: '2024-2025',
    attendanceRate: 85,
    feeCollectionRate: 90,
  },
  {
    id: 'sec-9-sci-a',
    classId: 'cls-9',
    className: 'Class 9',
    groupId: 'grp-9-sci',
    groupName: 'Science',
    name: 'A',
    capacity: 40,
    totalStudents: 0,
    maleCount: 0,
    femaleCount: 0,
    classTeacherId: 'tch-2',
    classTeacherName: 'Fatema Begum',
    status: 'ACTIVE',
    isRollFrozen: false,
    shift: 'DAY',
    academicYear: '2024-2025',
    attendanceRate: 72,
    feeCollectionRate: 65,
  }
]

const NAMES = [
  ['Md. Arif Hossain', 'মো. আরিফ হোসেন', 'MALE'],
  ['Fatema Begum', 'ফাতেমা বেগম', 'FEMALE'],
  ['Kamal Uddin', 'কামাল উদ্দিন', 'MALE'],
  ['Nusrat Jahan', 'নুসরাত জাহান', 'FEMALE'],
  ['Rahim Mia', 'রহিম মিয়া', 'MALE'],
  ['Sumaiya Akter', 'সুমাইয়া আক্তার', 'FEMALE'],
  ['Jamal Hossain', 'জামাল হোসেন', 'MALE'],
  ['Sharmin Akter', 'শারমিন আক্তার', 'FEMALE'],
  ['Imran Khan', 'ইমরান খান', 'MALE'],
  ['Roksana Parvin', 'রোকসানা পারভিন', 'FEMALE'],
  ['Sohel Rana', 'সোহেল রানা', 'MALE'],
  ['Mim Akter', 'মিম আক্তার', 'FEMALE'],
  ['Sabbir Ahmed', 'সাব্বির আহমেদ', 'MALE'],
  ['Tania Islam', 'তানিয়া ইসলাম', 'FEMALE'],
  ['Rakib Hasan', 'রাকিব হাসান', 'MALE'],
  ['Jahidul Islam', 'জাহিদুল ইসলাম', 'MALE'],
  ['Sadia Afrin', 'সাদিয়া আফরিন', 'FEMALE'],
  ['Mahmudur Rahman', 'মাহমুদুর রহমান', 'MALE'],
  ['Lamiya Hossain', 'লামিয়া হোসেন', 'FEMALE'],
  ['Kazi Nabil', 'কাজী নাবিল', 'MALE'],
] as const

const FEE_STATUS: ('PAID' | 'PARTIAL' | 'DUE')[] = [
  'PAID', 'PAID', 'PAID', 'PARTIAL', 'DUE',
  'PAID', 'PAID', 'DUE', 'PARTIAL', 'PAID',
  'PAID', 'DUE', 'PAID', 'PARTIAL', 'PAID',
  'PAID', 'DUE', 'PAID', 'PAID', 'PARTIAL',
]

const ATTENDANCE = [95, 88, 72, 91, 85, 68, 93, 78, 55, 97, 82, 90, 76, 63, 88, 92, 80, 96, 75, 89]

export const mockSectionStudents: SectionStudent[] = NAMES.map(([en, bn, gender], i) => ({
  id: `stu-${i + 1}`,
  roll: i + 1,
  rollPrefix: '8A',
  studentId: `STU-2024-${String(i + 1).padStart(3, '0')}`,
  fullNameEn: en,
  fullNameBn: bn,
  gender: gender as 'MALE' | 'FEMALE',
  attendanceRate: ATTENDANCE[i],
  feeStatus: FEE_STATUS[i],
  status: 'ACTIVE',
}))
