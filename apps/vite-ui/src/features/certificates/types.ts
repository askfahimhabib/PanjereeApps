// ============================================================
//  Certificates Module — TypeScript Definitions
// ============================================================

export type CertificateType = 'GRADUATION' | 'TESTIMONIAL' | 'TRANSFER' | 'MERIT'
export type CertificateTheme = 'GOLD' | 'EMERALD' | 'BURGUNDY' | 'SAPPHIRE'

export interface CertificateData {
  id: string
  certificateType: CertificateType
  theme: CertificateTheme
  
  // Student Info
  studentId: string
  studentNameEn: string
  studentNameBn?: string
  fatherName: string
  motherName: string
  studentIdCode: string
  regNumber: string
  rollNumber: string
  classOrBatch: string
  group?: string
  session: string
  gpa: string
  conduct: string
  
  // Certificate Metadata
  certificateNo: string
  issueDate: string
  
  // Institution Info
  institutionName: string
  institutionTagline: string
  institutionAddress: string
  
  // Signatures
  principalName: string
  principalTitle: string
  teacherName: string
  teacherTitle: string
  
  // Options
  customRemarks?: string
  showBengali: boolean
}

export const CERTIFICATE_TYPES: { type: CertificateType; label: string; labelBn: string; title: string; subtitle: string }[] = [
  {
    type: 'GRADUATION',
    label: 'Graduation / Completion',
    labelBn: 'সমাপ্তি / স্নাতক সনদ',
    title: 'CERTIFICATE OF GRADUATION',
    subtitle: 'This is proudly presented for successful completion of academic curriculum',
  },
  {
    type: 'TESTIMONIAL',
    label: 'Testimonial & Character',
    labelBn: 'প্রশংসাপত্র ও চারিত্রিক সনদ',
    title: 'TESTIMONIAL CERTIFICATE',
    subtitle: 'Official institutional testimonial of academic performance & conduct',
  },
  {
    type: 'MERIT',
    label: 'Merit & Excellence',
    labelBn: 'কৃতিত্ব ও মেধা সনদ',
    title: 'CERTIFICATE OF MERIT',
    subtitle: 'In recognition of outstanding academic brilliance & exemplary dedication',
  },
  {
    type: 'TRANSFER',
    label: 'Transfer Certificate (TC)',
    labelBn: 'ছাড়পত্র / টিসি',
    title: 'TRANSFER CERTIFICATE',
    subtitle: 'Official institutional release and transfer accreditation document',
  },
]

export const CERTIFICATE_THEMES: {
  theme: CertificateTheme
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  badgeBg: string
  borderColor: string
}[] = [
  {
    theme: 'GOLD',
    name: 'Royal Gold & Navy',
    primaryColor: '#0f172a',
    secondaryColor: '#d97706',
    accentColor: '#f59e0b',
    badgeBg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    borderColor: '#b45309',
  },
  {
    theme: 'EMERALD',
    name: 'Academic Emerald & Gold',
    primaryColor: '#064e3b',
    secondaryColor: '#059669',
    accentColor: '#10b981',
    badgeBg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#047857',
  },
  {
    theme: 'BURGUNDY',
    name: 'Imperial Crimson & Gold',
    primaryColor: '#4c0519',
    secondaryColor: '#9f1239',
    accentColor: '#e11d48',
    badgeBg: 'linear-gradient(135deg, #f43f5e 0%, #881337 100%)',
    borderColor: '#881337',
  },
  {
    theme: 'SAPPHIRE',
    name: 'Modern Sapphire & Slate',
    primaryColor: '#1e3a8a',
    secondaryColor: '#2563eb',
    accentColor: '#3b82f6',
    badgeBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#1d4ed8',
  },
]
