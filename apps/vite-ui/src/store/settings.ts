import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WeeklyHolidayConfig = 'FRIDAY_SATURDAY' | 'FRIDAY_ONLY' | 'SUNDAY_ONLY'
export type GradingScaleType = 'NCTB_SECONDARY' | 'PRIMARY' | 'CAMBRIDGE'
export type LateFeePolicyType = 'NONE' | 'FIXED_MONTHLY' | 'DAILY_INCREMENT'
export type ReceiptPrintFormat = 'A4_INVOICE' | 'THERMAL_POS'
export type UserRolePersona = 'SUPER_ADMIN' | 'ACCOUNTANT' | 'TEACHER' | 'STUDENT_GUARDIAN'

export interface SettingsState {
  // ── 1. Institution Identity & Legal Profile ──────────────────────────────────
  schoolName: string
  schoolNameBn: string
  eiinNumber: string
  regNumber: string
  affiliationBoard: string
  establishedYear: string
  principalName: string
  principalDesignation: string
  principalSignatureUrl: string
  tagline: string
  logoUrl: string
  monogramUrl: string
  address: string
  phone: string
  email: string
  website: string
  currencySymbol: string
  currencyCode: string
  dateFormat: string
  timezone: string

  // ── 2. Academic Session & Timetable ──────────────────────────────────────────
  currentSession: string
  sessionList: string[]
  sessionStartMonth: number  // 1 = January, 7 = July
  weeklyHolidays: WeeklyHolidayConfig
  studentIdPrefix: string
  teacherIdPrefix: string
  autoRollGeneration: boolean

  // ── 3. Examination & Grading Policy ──────────────────────────────────────────
  gradingScale: GradingScaleType
  minPassPercentage: number
  fourthSubjectBonusThreshold: number
  autoFailOnCompulsoryFail: boolean
  marksheetShowPrincipalSign: boolean
  marksheetExaminerTitle: string

  // ── 4. Fees, Finance & Late Fine Automation ──────────────────────────────────
  feeDueCutoffDay: number  // e.g. 10th of every month
  lateFeePolicy: LateFeePolicyType
  lateFeeFixedAmount: number
  lateFeeDailyAmount: number
  invoicePrefix: string
  supportedPaymentMethods: string[]
  merchantBkash: string
  merchantNagad: string
  bankAccountDetails: string
  receiptTermsFooter: string

  // ── 5. Attendance & Timing Rules ─────────────────────────────────────────────
  shiftStartTime: string
  shiftEndTime: string
  lateGraceMinutes: number
  absentCutoffMinutes: number
  examMinAttendancePct: number
  autoApplyApprovedLeaves: boolean
  teacherCasualLeaveQuota: number
  teacherMedicalLeaveQuota: number

  // ── 6. SMS Gateway & Notifications ───────────────────────────────────────────
  smsGatewayProvider: string
  smsApiKey: string
  smsSenderId: string
  autoSmsAbsentAlert: boolean
  autoSmsFeeReceipt: boolean
  autoSmsDueReminder: boolean
  autoSmsResultPublished: boolean
  smsTemplateAbsent: string
  smsTemplatePayment: string
  smsTemplateDue: string

  // ── 7. Roles & Permissions Simulator ────────────────────────────────────────
  activeRole: UserRolePersona

  // ── 8. Appearance & Print ───────────────────────────────────────────────────
  primaryColor: string
  accentColor: string
  receiptPrintFormat: ReceiptPrintFormat
  showWatermarkOnDocs: boolean

  // ── Actions ──────────────────────────────────────────────────────────────────
  updateSchoolInfo: (data: Partial<SettingsState>) => void
  updateSession: (data: Partial<SettingsState>) => void
  updateAcademicSession: (data: Partial<SettingsState>) => void
  updateGradingPolicy: (data: Partial<SettingsState>) => void
  updateFinanceSettings: (data: Partial<SettingsState>) => void
  updateAttendanceRules: (data: Partial<SettingsState>) => void
  updateSmsSettings: (data: Partial<SettingsState>) => void
  updateRolePersona: (role: UserRolePersona) => void
  updateAppearance: (data: Partial<SettingsState>) => void
  resetToDefaults: () => void
}

const DEFAULTS: Omit<
  SettingsState,
  | 'updateSchoolInfo'
  | 'updateSession'
  | 'updateAcademicSession'
  | 'updateGradingPolicy'
  | 'updateFinanceSettings'
  | 'updateAttendanceRules'
  | 'updateSmsSettings'
  | 'updateRolePersona'
  | 'updateAppearance'
  | 'resetToDefaults'
> = {
  // 1. Identity
  schoolName: 'Panjeree Model High School & College',
  schoolNameBn: 'পাঞ্জেরী মডেল হাই স্কুল এন্ড কলেজ',
  eiinNumber: '108452',
  regNumber: 'REG-DH-2012/849',
  affiliationBoard: 'Dhaka Education Board',
  establishedYear: '2005',
  principalName: 'Professor Md. Rafiqul Islam',
  principalDesignation: 'Principal & Head of Institution',
  principalSignatureUrl: '',
  tagline: 'Excellence in Academic Discipline & Moral Values',
  logoUrl: '',
  monogramUrl: '',
  address: 'Plot 14, Sector 7, Uttara Model Town, Dhaka-1230',
  phone: '+880 1711-234567, +880 2-8956789',
  email: 'info@panjereemodel.edu.bd',
  website: 'www.panjereemodel.edu.bd',
  currencySymbol: '৳',
  currencyCode: 'BDT',
  dateFormat: 'DD-MM-YYYY',
  timezone: 'Asia/Dhaka',

  // 2. Academic Session
  currentSession: '2026',
  sessionList: ['2024', '2025', '2026', '2026-2027'],
  sessionStartMonth: 1,
  weeklyHolidays: 'FRIDAY_SATURDAY',
  studentIdPrefix: 'PM-26-',
  teacherIdPrefix: 'TCH-',
  autoRollGeneration: true,

  // 3. Grading Policy
  gradingScale: 'NCTB_SECONDARY',
  minPassPercentage: 33,
  fourthSubjectBonusThreshold: 2.0,
  autoFailOnCompulsoryFail: true,
  marksheetShowPrincipalSign: true,
  marksheetExaminerTitle: 'Controller of Examinations',

  // 4. Finance & Late Fine
  feeDueCutoffDay: 10,
  lateFeePolicy: 'FIXED_MONTHLY',
  lateFeeFixedAmount: 50,
  lateFeeDailyAmount: 5,
  invoicePrefix: 'INV-2026-',
  supportedPaymentMethods: ['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK_TRANSFER'],
  merchantBkash: '01711-000000 (Merchant)',
  merchantNagad: '01811-000000 (Merchant)',
  bankAccountDetails: 'Dutch-Bangla Bank Ltd | A/C: 115.120.98765 | Uttara Branch',
  receiptTermsFooter: 'Fees once paid are non-refundable. Please preserve this money receipt for future academic clearance.',

  // 5. Attendance
  shiftStartTime: '08:00',
  shiftEndTime: '14:00',
  lateGraceMinutes: 15,
  absentCutoffMinutes: 90,
  examMinAttendancePct: 75,
  autoApplyApprovedLeaves: true,
  teacherCasualLeaveQuota: 14,
  teacherMedicalLeaveQuota: 10,

  // 6. SMS Gateway
  smsGatewayProvider: 'Greenweb SMS Gateway BD',
  smsApiKey: 'gw_live_89f7a9d20c3b4e18',
  smsSenderId: 'PANJEREE',
  autoSmsAbsentAlert: true,
  autoSmsFeeReceipt: true,
  autoSmsDueReminder: true,
  autoSmsResultPublished: true,
  smsTemplateAbsent: 'Dear Guardian, your ward {student_name} (Roll: {roll}, {class}) was absent today ({date}). Please contact school office if unexcused.',
  smsTemplatePayment: 'Payment Received: ৳{amount} for {student_name} ({class}). Invoice #{invoice_no}. Thank you, Panjeree Model School.',
  smsTemplateDue: 'Notice: Monthly fee ৳{due} for {student_name} ({class}) is pending. Please clear dues by {due_date} to avoid late fee.',

  // 7. Roles Persona
  activeRole: 'SUPER_ADMIN',

  // 8. Appearance & Print
  primaryColor: '#4f46e5',
  accentColor: '#059669',
  receiptPrintFormat: 'A4_INVOICE',
  showWatermarkOnDocs: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      updateSchoolInfo(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateSession(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateAcademicSession(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateGradingPolicy(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateFinanceSettings(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateAttendanceRules(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateSmsSettings(data) {
        set((state) => ({ ...state, ...data }))
      },

      updateRolePersona(role) {
        set({ activeRole: role })
      },

      updateAppearance(data) {
        set((state) => ({ ...state, ...data }))
      },

      resetToDefaults() {
        set((state) => ({ ...state, ...DEFAULTS }))
      },
    }),
    { name: 'lms-institution-settings' }
  )
)
