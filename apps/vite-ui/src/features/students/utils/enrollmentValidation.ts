import { studentStore } from '@/data/stores'
import type { Student, StudentFormData } from '../types'

export interface EnrollmentConflict {
  hasConflict: boolean
  message?: string
  field?: 'mobile' | 'admissionNumber' | 'rollNumber'
  conflictingStudent?: Student
}

/**
 * Checks whether the student has any duplicate enrollment conflicts:
 * 1. Mobile number conflict: If another student already has this phone number.
 *    - Enforces: ONE student cannot be enrolled in multiple regular classes.
 * 2. Admission Number conflict: If admission number already exists.
 * 3. Roll Number conflict: If the roll number is already taken in the same Class + Section + Session.
 */
export function checkEnrollmentConflicts(
  data: StudentFormData,
  editingStudentId?: string | null
): EnrollmentConflict {
  const allStudents = studentStore.getAll()

  // 1. Mobile number duplicate check (clean non-digits)
  const cleanPhone = (p: string) => (p || '').replace(/\D/g, '')
  const inputPhone = cleanPhone(data.mobile)

  if (inputPhone && inputPhone.length >= 10) {
    const existingSamePhone = allStudents.find(s =>
      s.id !== editingStudentId &&
      s.status === 'ACTIVE' &&
      cleanPhone(s.mobile) === inputPhone
    )

    if (existingSamePhone) {
      if (existingSamePhone.type === 'REGULAR') {
        return {
          hasConflict: true,
          field: 'mobile',
          conflictingStudent: existingSamePhone,
          message: `এই শিক্ষার্থী (${existingSamePhone.fullNameEn}) ইতিমধ্যেই ${existingSamePhone.className || 'একটি শ্রেণিতে'} (রোল ${existingSamePhone.rollNumber}) ভর্তি আছেন। একই শিক্ষার্থী একাধিক শ্রেণিতে ভর্তি হতে পারবেন না।`,
        }
      } else {
        return {
          hasConflict: true,
          field: 'mobile',
          conflictingStudent: existingSamePhone,
          message: `এই শিক্ষার্থী (${existingSamePhone.fullNameEn}) ইতিমধ্যেই '${existingSamePhone.batchName || 'ব্যাচে'}' ভর্তি আছেন।`,
        }
      }
    }
  }

  // 2. Admission Number duplicate check
  if (data.admissionNumber && data.admissionNumber.trim()) {
    const cleanAdm = data.admissionNumber.trim().toLowerCase()
    const existingSameAdm = allStudents.find(s =>
      s.id !== editingStudentId &&
      s.admissionNumber &&
      s.admissionNumber.trim().toLowerCase() === cleanAdm
    )

    if (existingSameAdm) {
      return {
        hasConflict: true,
        field: 'admissionNumber',
        conflictingStudent: existingSameAdm,
        message: `ভর্তি নম্বর '${data.admissionNumber}' ইতিমধ্যেই '${existingSameAdm.fullNameEn}' (${existingSameAdm.className || existingSameAdm.batchName})-এর জন্য নিবন্ধিত রয়েছে।`,
      }
    }
  }

  // 3. Roll Number duplicate check in the same Class + Section + Session
  if (data.type === 'REGULAR' && data.classId && data.rollNumber && data.rollNumber.trim()) {
    const inputRoll = data.rollNumber.trim()
    const existingSameRoll = allStudents.find(s =>
      s.id !== editingStudentId &&
      s.type === 'REGULAR' &&
      s.status === 'ACTIVE' &&
      s.classId === data.classId &&
      (data.sectionId ? s.sectionId === data.sectionId : true) &&
      s.session === data.session &&
      s.rollNumber === inputRoll
    )

    if (existingSameRoll) {
      const secName = data.sectionName || (existingSameRoll.sectionName ? `সেকশন ${existingSameRoll.sectionName}` : '')
      return {
        hasConflict: true,
        field: 'rollNumber',
        conflictingStudent: existingSameRoll,
        message: `রোল '${inputRoll}' ইতিমধ্যেই ${secName ? secName + '-এ ' : ''}'${existingSameRoll.fullNameEn}'-এর জন্য নির্ধারিত রয়েছে। অনুগ্রহ করে ভিন্ন একটি রোল নম্বর দিন।`,
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Calculates the next available unique roll number in the given class, section, session
 */
export function getNextAvailableRoll(
  classId: string,
  sectionId?: string,
  session?: string,
  excludeStudentId?: string | null
): string {
  if (!classId) return '01'
  const allStudents = studentStore.getAll()
  const targetSession = session || new Date().getFullYear().toString()

  const occupiedRolls = new Set(
    allStudents
      .filter(s =>
        s.id !== excludeStudentId &&
        s.type === 'REGULAR' &&
        s.status === 'ACTIVE' &&
        s.classId === classId &&
        (sectionId ? s.sectionId === sectionId : true) &&
        s.session === targetSession
      )
      .map(s => parseInt(s.rollNumber, 10))
      .filter(r => !isNaN(r) && r > 0)
  )

  let nextRoll = 1
  while (occupiedRolls.has(nextRoll)) {
    nextRoll++
  }

  return String(nextRoll).padStart(2, '0')
}
