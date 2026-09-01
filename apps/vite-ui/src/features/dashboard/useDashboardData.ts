import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  studentStore,
  teacherStore,
  classStore,
  sectionStore,
  batchStore,
  attendanceStore,
  teacherAttendanceStore,
  leaveStore,
  routineStore,
  examStore,
  paymentStore,
  manualDueStore,
  monthlyBillingStore,
  expenseStore,
  salaryStore,
  noticeStore,
  calendarStore,
} from '@/data/stores'
import type { DashboardKpis, DueStudentSummary, TodayRoutineSlot } from './types'
import type { DayOfWeek } from '@/features/routines/types'
import { format, parseISO, subDays, differenceInDays, isFuture, isToday } from 'date-fns'

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

export function useDashboardData() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick(t => t + 1), [])

  // Auto re-fetch on window focus
  useEffect(() => {
    const handleFocus = () => refresh()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refresh])

  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const currentDayOfWeek = DAY_MAP[now.getDay()] || 'SUNDAY'

  const dashboardState = useMemo(() => {
    // ── 1. Students & Classes ──────────────────────────────────
    const allStudents = studentStore.getAll()
    const activeStudents = allStudents.filter(s => s.status === 'ACTIVE')
    const maleStudents = activeStudents.filter(s => s.gender === 'MALE').length
    const femaleStudents = activeStudents.filter(s => s.gender === 'FEMALE').length

    const allClasses = classStore.getAll().filter(c => c.isActive !== false)
    const allSections = sectionStore.getAll()
    const allBatches = batchStore.getAll().filter(b => b.status === 'ONGOING' || b.status === 'UPCOMING')

    const capacityTotal = allSections.reduce((sum, s) => sum + (s.capacity || 40), 0) || (allClasses.length * 45)
    const capacityUtilization = capacityTotal > 0 ? Math.min(100, Math.round((activeStudents.length / capacityTotal) * 100)) : 0

    // Recent Admissions (this month)
    const newAdmissionsThisMonth = activeStudents.filter(s => {
      if (!s.admissionDate) return false
      try {
        const d = parseISO(s.admissionDate)
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      } catch {
        return false
      }
    }).length

    // Class Breakdown
    const classBreakdown = allClasses.map(cls => {
      const count = activeStudents.filter(s => s.classId === cls.id).length
      const classSections = allSections.filter(sec => sec.classId === cls.id)
      const sectionCount = classSections.length || 1
      const totalCap = classSections.reduce((sum, s) => sum + (s.capacity || 45), 0) || 45
      return {
        id: cls.id,
        name: cls.name,
        count,
        percentage: activeStudents.length > 0 ? Math.round((count / activeStudents.length) * 100) : 0,
        sectionCount,
        capacity: totalCap,
        shift: cls.shift || 'DAY',
      }
    }).sort((a, b) => b.count - a.count)

    // Batch Breakdown
    const batchBreakdown = allBatches.map(b => ({
      id: b.id,
      name: b.name,
      code: b.examName,
      studentCount: b.totalStudents || 0,
      maxStudents: (b.sections || []).reduce((sum, sec) => sum + (sec.capacity || 30), 0) || 30,
      subjectName: `${b.examName} Batch (${b.examYear})`,
    }))

    // ── 2. Teachers & Leaves ──────────────────────────────────
    const allTeachers = teacherStore.getAll()
    const activeTeachers = allTeachers.filter(t => t.employmentStatus === 'ACTIVE')
    const allLeaves = leaveStore.getAll()

    const pendingLeaves = allLeaves.filter(l => l.status === 'PENDING')
    const approvedLeavesToday = allLeaves.filter(l => {
      if (l.status !== 'APPROVED') return false
      return l.fromDate <= todayStr && l.toDate >= todayStr
    })

    const teachersOnLeaveToday = approvedLeavesToday.filter(l => l.applicantType === 'TEACHER').length
    const teachersOnDutyToday = Math.max(0, activeTeachers.length - teachersOnLeaveToday)

    // ── 3. Attendance Pulse ───────────────────────────────────
    const allAttendance = attendanceStore.getAll()
    const todayStudentRecords = allAttendance.filter(r => r.date === todayStr)
    const todayPresentCount = todayStudentRecords.filter(r => r.status === 'PRESENT').length
    const todayAbsentCount = todayStudentRecords.filter(r => r.status === 'ABSENT').length
    const todayLateCount = todayStudentRecords.filter(r => r.status === 'LATE').length
    const todayTotalCount = todayStudentRecords.length
    const todayAttendanceRate = todayTotalCount > 0 ? Math.round(((todayPresentCount + todayLateCount) / todayTotalCount) * 100) : null

    // Teacher Attendance
    const allTeacherAttendance = teacherAttendanceStore.getAll()
    const todayTeacherRecords = allTeacherAttendance.filter(r => r.date === todayStr)
    const todayTeacherPresentCount = todayTeacherRecords.filter(r => r.status === 'PRESENT' || r.status === 'HALF_DAY').length
    const todayTeacherTotalCount = todayTeacherRecords.length || activeTeachers.length
    const todayTeacherAttendanceRate = todayTeacherRecords.length > 0 
      ? Math.round((todayTeacherPresentCount / todayTeacherRecords.length) * 100)
      : (activeTeachers.length > 0 ? Math.round((teachersOnDutyToday / activeTeachers.length) * 100) : 100)

    // 7-day attendance trend
    const sevenDayAttendanceTrend = Array.from({ length: 7 }, (_, i) => {
      const targetDate = subDays(now, 6 - i)
      const dateStr = format(targetDate, 'yyyy-MM-dd')
      const dayLabel = format(targetDate, 'EEE')
      const records = allAttendance.filter(r => r.date === dateStr)
      const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length
      const total = records.length
      const rate = total > 0 ? Math.round((present / total) * 100) : (i === 6 ? (todayAttendanceRate ?? 88) : 85 + (i * 2) % 12)
      return {
        dayLabel,
        date: dateStr,
        presentRate: rate,
        presentCount: present || Math.round((activeStudents.length * rate) / 100),
        totalCount: total || activeStudents.length,
      }
    })

    // ── 4. Finance & Cash Flow ────────────────────────────────
    const allPayments = paymentStore.getAll()
    const allManualDues = manualDueStore.getAll()
    const allBillings = monthlyBillingStore.getAll()
    const allExpenses = expenseStore.getAll()
    const allSalaries = salaryStore.getAll()

    // Monthly fees collected
    const currentMonthPayments = allPayments.filter(p => {
      if (p.status === 'REFUNDED') return false
      try {
        const d = parseISO(p.paid_at)
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      } catch {
        return false
      }
    })
    const collectedThisMonth = currentMonthPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0)

    // Monthly billing run
    const currentMonthBilling = allBillings.find(b => b.month === currentMonth && b.year === currentYear)
    const billedThisMonth = currentMonthBilling?.total_billed_amount || (activeStudents.length * 1800)
    const collectionRate = billedThisMonth > 0 ? Math.min(100, Math.round((collectedThisMonth / billedThisMonth) * 100)) : 0

    // Outstanding Dues
    const pendingDuesList = allManualDues.filter(d => !d.is_paid)
    const totalPendingDues = pendingDuesList.reduce((sum, d) => sum + (d.amount || 0), 0)

    // Top Defaulter Students with calculated dues
    const studentDueMap = new Map<string, { totalDue: number; lastPaid?: string }>()
    pendingDuesList.forEach(d => {
      const remaining = d.amount || 0
      if (remaining <= 0) return
      const existing = studentDueMap.get(d.student_id) || { totalDue: 0 }
      studentDueMap.set(d.student_id, {
        totalDue: existing.totalDue + remaining,
        lastPaid: d.created_at,
      })
    })

    const topDueStudents: DueStudentSummary[] = []
    studentDueMap.forEach((val, studentId) => {
      const st = allStudents.find(s => s.id === studentId)
      if (st && st.status === 'ACTIVE') {
        const cls = allClasses.find(c => c.id === st.classId)
        const sec = allSections.find(s => s.id === st.sectionId)
        topDueStudents.push({
          student: st,
          totalDue: val.totalDue,
          lastPaidDate: val.lastPaid,
          phone: st.mobile,
          guardianPhone: st.guardian?.mobile || st.father?.mobile || st.mobile,
          className: cls?.name ?? 'Class ' + st.classId,
          sectionName: sec?.name ?? '',
        })
      }
    })
    topDueStudents.sort((a, b) => b.totalDue - a.totalDue)

    // Expenses this month
    const currentMonthExpenses = allExpenses.filter(e => {
      try {
        const d = parseISO(e.date)
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      } catch {
        return false
      }
    })
    const expensesThisMonth = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    // Teacher salaries this month
    const currentMonthSalaries = allSalaries.filter(s => s.month === currentMonth && s.year === currentYear)
    const salaryPaidThisMonth = currentMonthSalaries.reduce((sum, s) => sum + (s.paidAmount || 0), 0)
    const salaryTotalThisMonth = currentMonthSalaries.reduce((sum, s) => sum + ((s.baseSalary || 0) + (s.bonus || 0) - (s.deduction || 0)), 0)

    // Net Cash Flow / Surplus
    const netSurplusThisMonth = collectedThisMonth - (expensesThisMonth + salaryPaidThisMonth)

    // ── 5. Routines & Today's Schedule ────────────────────────
    const allRoutines = routineStore.getAll().filter(r => r.is_active !== false)
    
    // Sort routines by time
    const todayRoutines: TodayRoutineSlot[] = allRoutines
      .filter(r => r.day === currentDayOfWeek)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
      .map(routine => {
        const currentHourMin = format(now, 'HH:mm')
        let periodStatus: 'past' | 'ongoing' | 'upcoming' = 'upcoming'
        if (routine.start_time && routine.end_time) {
          if (currentHourMin >= routine.start_time && currentHourMin <= routine.end_time) {
            periodStatus = 'ongoing'
          } else if (currentHourMin > routine.end_time) {
            periodStatus = 'past'
          }
        }
        return { routine, periodStatus }
      })

    // ── 6. Exams & Results ────────────────────────────────────
    const allExams = examStore.getAll()
    const upcomingExams = allExams
      .filter(e => e.status === 'SCHEDULED' || e.status === 'ONGOING')
      .map(exam => {
        const schedules = exam.exam_held_schedules ?? []
        const sortedDates = schedules.map(s => s.date).filter(Boolean).sort()
        const nextDateStr = sortedDates[0] || exam.created_at.split('T')[0]
        let daysUntil = 0
        try {
          daysUntil = differenceInDays(parseISO(nextDateStr), now)
        } catch {
          daysUntil = 0
        }
        return {
          ...exam,
          nextDateStr,
          daysUntil,
          totalSchedules: schedules.length,
          targetName: exam.classes?.name ?? exam.batches?.name ?? 'All Students',
        }
      })
      .sort((a, b) => (a.nextDateStr || '').localeCompare(b.nextDateStr || ''))

    const publishedResults = allExams
      .filter(e => e.result_published)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 5)

    // ── 7. Notices & Announcements ────────────────────────────
    const allNotices = noticeStore.getAll()
    const activeNotices = allNotices
      .filter(n => n.isPublished !== false)
      .sort((a, b) => {
        const priorityOrder = { URGENT: 0, IMPORTANT: 1, NORMAL: 2 }
        const pa = priorityOrder[a.priority] ?? 2
        const pb = priorityOrder[b.priority] ?? 2
        if (pa !== pb) return pa - pb
        return b.publishedAt.localeCompare(a.publishedAt)
      })

    // ── 8. Academic Calendar Events ───────────────────────────
    const allCalendarEvents = calendarStore.getAll()
    const upcomingEvents = allCalendarEvents
      .filter(e => {
        try {
          const d = parseISO(e.date)
          return isFuture(d) || isToday(d)
        } catch {
          return true
        }
      })
      .map(ev => {
        let daysUntil = 0
        try {
          daysUntil = differenceInDays(parseISO(ev.date), now)
        } catch {
          daysUntil = 0
        }
        return { ...ev, daysUntil }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)

    // ── 9. Dynamic System Alerts ──────────────────────
    const alerts = []
    if (topDueStudents.length > 0) {
      alerts.push({
        id: 'alt-dues',
        type: 'warning' as const,
        title: `${topDueStudents.length} Students with Overdue Fees`,
        message: `Total ৳${totalPendingDues.toLocaleString()} pending in tuition and fees. Top due: ${topDueStudents[0]?.student.fullNameEn} (৳${topDueStudents[0]?.totalDue.toLocaleString()}).`,
        actionLabel: 'Collect Fees',
        actionLink: '/payments',
      })
    }
    if (pendingLeaves.length > 0) {
      alerts.push({
        id: 'alt-leaves',
        type: 'urgent' as const,
        title: `${pendingLeaves.length} Pending Leave Applications`,
        message: `Faculty & student leave requests awaiting principal approval.`,
        actionLabel: 'Review Leaves',
        actionLink: '/leaves',
      })
    }
    if (upcomingExams.length > 0 && (upcomingExams[0]?.daysUntil ?? 0) <= 5) {
      const ex = upcomingExams[0]
      alerts.push({
        id: 'alt-exam',
        type: 'info' as const,
        title: `Exam Alert: ${ex.name}`,
        message: `Scheduled ${ex.daysUntil === 0 ? 'Today' : `in ${ex.daysUntil} day(s)`} for ${ex.targetName}.`,
        actionLabel: 'Exam Routine',
        actionLink: '/exam-held',
      })
    }
    if (todayTotalCount === 0) {
      alerts.push({
        id: 'alt-attendance',
        type: 'urgent' as const,
        title: `Today's Attendance Pending`,
        message: `Student morning attendance register has not been finalized yet for today.`,
        actionLabel: 'Take Attendance',
        actionLink: '/attendance',
      })
    }

    const kpis: DashboardKpis = {
      totalStudents: activeStudents.length,
      maleStudents,
      femaleStudents,
      capacityTotal,
      capacityUtilization,
      newAdmissionsThisMonth,
      totalTeachers: activeTeachers.length,
      teachersOnDutyToday,
      teachersOnLeaveToday,
      pendingLeaveCount: pendingLeaves.length,
      todayAttendanceRate,
      todayPresentCount,
      todayAbsentCount,
      todayLateCount,
      todayTotalCount,
      todayTeacherAttendanceRate,
      todayTeacherPresentCount,
      todayTeacherTotalCount,
      sevenDayAttendanceTrend,
      collectedThisMonth,
      billedThisMonth,
      collectionRate,
      totalPendingDues,
      defaulterStudentsCount: topDueStudents.length,
      expensesThisMonth,
      salaryPaidThisMonth,
      salaryTotalThisMonth,
      netSurplusThisMonth,
      totalClasses: allClasses.length,
      totalBatches: allBatches.length,
      upcomingExamsCount: upcomingExams.length,
      completedExamsCount: allExams.filter(e => e.status === 'COMPLETED').length,
    }

    return {
      kpis,
      classBreakdown,
      batchBreakdown,
      topDueStudents: topDueStudents.slice(0, 5),
      todayRoutines,
      allRoutines,
      upcomingExams: upcomingExams.slice(0, 5),
      publishedResults,
      activeNotices: activeNotices.slice(0, 5),
      upcomingEvents,
      alerts,
      activeTeachers,
      approvedLeavesToday,
      pendingLeaves,
      currentDayOfWeek,
    }
  }, [tick, todayStr, currentMonth, currentYear, currentDayOfWeek])

  return {
    ...dashboardState,
    refresh,
  }
}
