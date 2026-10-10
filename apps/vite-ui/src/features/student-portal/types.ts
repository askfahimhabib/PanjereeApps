export type StudentRoleType = 'REGULAR' | 'EXAM_BATCH' | 'DUAL'

export interface StudentPersona {
  id: string
  studentId: string
  fullNameEn: string
  fullNameBn?: string
  rollNumber: string
  registrationNumber?: string
  roleType: StudentRoleType
  classId?: string
  className?: string
  sectionId?: string
  sectionName?: string
  groupId?: string
  groupName?: string
  batchId?: string
  batchName?: string
  batchSectionName?: string
  avatar?: string
  mobile?: string
  email?: string
  bloodGroup?: string
  gender?: string
  fatherName?: string
  motherName?: string
  guardianMobile?: string
  address?: string
  admissionDate?: string
}

export type PaymentChannel = 'BKASH' | 'NAGAD' | 'ROCKET' | 'CASH' | 'CARD'

export interface OnlinePaymentPayload {
  studentId: string
  amount: number
  channel: PaymentChannel
  feeType: string
  month?: string
  year?: number
  transactionId?: string
  senderNumber?: string
  receivedBy?: string
  cashCounterNote?: string
}

export interface StudentLeaveApplication {
  studentId: string
  fromDate: string
  toDate: string
  reason: string
  category: 'SICK' | 'URGENT_FAMILY' | 'ACADEMIC' | 'OTHER'
  attachmentUrl?: string
}
