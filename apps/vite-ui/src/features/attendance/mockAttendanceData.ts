import type { AttendanceRecord, TeacherAttendanceRecord } from './types'
import { MOCK_STUDENTS, MOCK_TEACHERS } from '@/data/mockData'
import { subDays, format, isFriday, isSaturday } from 'date-fns'

function generateMockAttendance(): {
  studentAttendance: AttendanceRecord[]
  teacherAttendance: TeacherAttendanceRecord[]
} {
  const studentAttendance: AttendanceRecord[] = []
  const teacherAttendance: TeacherAttendanceRecord[] = []
  const now = new Date()

  // Generate 30 calendar days of attendance
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i)
    if (isFriday(d) || isSaturday(d)) continue // Skip weekend in Bangladesh (Fri & Sat)

    const dateStr = format(d, 'yyyy-MM-dd')
    const daySeed = d.getDate()

    // 1. Student Attendance
    for (const student of MOCK_STUDENTS) {
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' = 'PRESENT'

      // Intentional chronic absenteeism for specific students to test at-risk tracking
      if (student.id === '21') {
        // Tanvir Hasan: ~60% attendance
        status = (daySeed % 5 <= 1) ? 'ABSENT' : (daySeed % 7 === 0 ? 'LATE' : 'PRESENT')
      } else if (student.id === '17') {
        // Mizanur Rahman: ~65% attendance
        status = (daySeed % 3 === 0) ? 'ABSENT' : (daySeed % 5 === 0 ? 'LATE' : 'PRESENT')
      } else if (student.id === '10') {
        // Sumaiya Begum: ~70% attendance
        status = (daySeed % 3 === 1) ? 'ABSENT' : (daySeed % 4 === 0 ? 'LATE' : 'PRESENT')
      } else {
        // Normal students: 90%+ attendance
        const rand = (parseInt(student.id, 10) * 17 + daySeed * 13) % 100
        if (rand < 88) status = 'PRESENT'
        else if (rand < 94) status = 'LATE'
        else if (rand < 97) status = 'ABSENT'
        else status = 'LEAVE'
      }

      const timeIn =
        status === 'PRESENT'
          ? '08:15 AM'
          : status === 'LATE'
          ? '08:45 AM'
          : undefined

      studentAttendance.push({
        id: `att-${student.id}-${dateStr}`,
        studentId: student.id,
        studentName: student.fullNameEn,
        rollNumber: student.rollNumber,
        classId: student.classId || 'cls-10',
        sectionId: student.sectionId || 'sec-10-sci-a',
        date: dateStr,
        status,
        timeIn,
        lateMinutes: status === 'LATE' ? 30 : undefined,
        markedAt: `${dateStr}T08:30:00Z`,
        markedBy: 'Class Teacher',
      })
    }

    // 2. Teacher Attendance
    for (const teacher of MOCK_TEACHERS) {
      const tSeed = (parseInt(teacher.id.replace(/\D/g, '') || '1', 10) * 11 + daySeed * 7) % 100
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' = 'PRESENT'

      if (tSeed >= 95) {
        status = 'LEAVE'
      } else if (tSeed >= 90) {
        status = 'LATE'
      } else if (tSeed >= 86 && i !== 0) {
        status = 'ABSENT'
      } else {
        status = 'PRESENT'
      }

      teacherAttendance.push({
        id: `tch-att-${teacher.id}-${dateStr}`,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        department: teacher.department || 'Academic',
        designation: teacher.designation || 'Teacher',
        shift: 'DAY',
        date: dateStr,
        status,
        timeIn: status === 'PRESENT' ? '08:20 AM' : status === 'LATE' ? '08:50 AM' : undefined,
        timeOut: status === 'PRESENT' || status === 'LATE' ? '04:30 PM' : undefined,
        markedAt: `${dateStr}T08:30:00Z`,
        markedBy: 'Principal',
      })
    }
  }

  return { studentAttendance, teacherAttendance }
}

const mockData = generateMockAttendance()
export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = mockData.studentAttendance
export const MOCK_TEACHER_ATTENDANCE_RECORDS: TeacherAttendanceRecord[] = mockData.teacherAttendance
