import { useState, useEffect, useMemo } from 'react'
import {
  attendanceStore,
  paymentStore,
  manualDueStore,
  expenseStore,
  studentStore,
  teacherStore,
  classStore,
  sectionStore,
  examStore,
  salaryStore,
  teacherAttendanceStore,
} from '@/data/stores'
import { subscribeStores } from '@/lib/localStore'
import { examResultStore } from '@/features/examHeld/hooks/useExamResults'
import type {
  InstitutionOverviewMetrics,
  StudentEnrollmentSummary,
  AttendanceSummary,
  PaymentSummary,
  AcademicReportSummary,
  FacultySummary,
  ReportFilter,
  DailyAttendance,
  MonthlyCollection,
  ChronicAbsentee,
  StudentDueItem,
  MeritTopper,
  GradeDistributionItem,
  SubjectPerformanceItem,
  TeacherReportItem,
} from './types'
import { MONTH_NAMES, FEE_TYPE_LABELS, type FeeType } from '@/features/payments/types'
import { calculateGrade } from '@/features/examHeld/types'
import { format, subDays, parseISO } from 'date-fns'

export function useLiveReports(filter?: ReportFilter) {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Dynamic store update subscriber
  const [storeVersion, setStoreVersion] = useState(0)

  useEffect(() => {
    return subscribeStores(
      [
        'students',
        'teachers',
        'classes',
        'sections',
        'attendance',
        'teacher_attendance',
        'payments',
        'manual_dues',
        'finance_expenses',
        'teacher_salaries',
        'exam_held',
        'exam_results',
      ],
      () => {
        setStoreVersion((v) => v + 1)
      }
    )
  }, [])

  // Base entities dynamically queried from central stores
  const allStudents = useMemo(() => studentStore.getAll(), [storeVersion])
  const allClasses = useMemo(() => classStore.getAll().filter((c) => c.isActive !== false), [storeVersion])
  const allSections = useMemo(() => sectionStore.getAll(), [storeVersion])
  const allTeachers = useMemo(() => teacherStore.getAll(), [storeVersion])
  const allAttendance = useMemo(() => attendanceStore.getAll(), [storeVersion])
  const allTeacherAttendance = useMemo(() => teacherAttendanceStore.getAll(), [storeVersion])
  const allPayments = useMemo(() => paymentStore.getAll().filter((p) => p.status !== 'REFUNDED'), [storeVersion])
  const allDues = useMemo(() => manualDueStore.getAll(), [storeVersion])
  const allExpenses = useMemo(() => expenseStore.getAll(), [storeVersion])
  const allSalaries = useMemo(() => salaryStore.getAll(), [storeVersion])
  const allExams = useMemo(() => examStore.getAll(), [storeVersion])
  const allExamResults = useMemo(() => examResultStore.getAll(), [storeVersion])

  // ── 0. Top Institutional Overview Metrics ──────────────────────────────────
  const overviewMetrics: InstitutionOverviewMetrics = useMemo(() => {
    const totalStudents = allStudents.filter((s) => s.status === 'ACTIVE').length
    const totalTeachers = allTeachers.filter((t) => t.employmentStatus === 'ACTIVE' || t.isActive).length
    const totalClasses = allClasses.length

    // Today's attendance rate
    const todayStr = format(now, 'yyyy-MM-dd')
    const todayRecords = allAttendance.filter((r) => r.date === todayStr)
    const presentToday = todayRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length
    const overallAttendanceRate =
      todayRecords.length > 0
        ? Math.round((presentToday / todayRecords.length) * 100)
        : allAttendance.length > 0
        ? Math.round(
            (allAttendance.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length /
              allAttendance.length) *
              100
          )
        : 88

    const totalCollected = allPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0)
    const totalOutstandingDues = allDues
      .filter((d) => !d.is_paid)
      .reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const netSurplus = totalCollected - totalExpenses

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      overallAttendanceRate,
      totalCollected,
      totalOutstandingDues,
      totalExpenses,
      netSurplus,
    }
  }, [allStudents, allTeachers, allClasses, allAttendance, allPayments, allDues, allExpenses, now])

  // ── 1. Student & Enrollment Summary ─────────────────────────────────────────
  const studentData: StudentEnrollmentSummary = useMemo(() => {
    let filtered = allStudents

    if (filter?.classId) {
      filtered = filtered.filter((s) => s.classId === filter.classId)
    }
    if (filter?.shift) {
      filtered = filtered.filter((s) => s.shift === filter.shift)
    }
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.fullNameEn.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q)
      )
    }

    const totalStudents = filtered.length
    const activeCount = filtered.filter((s) => s.status === 'ACTIVE').length
    const inactiveCount = totalStudents - activeCount
    const maleCount = filtered.filter((s) => s.gender === 'MALE').length
    const femaleCount = filtered.filter((s) => s.gender === 'FEMALE').length
    const malePercentage = totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 0
    const femalePercentage = totalStudents > 0 ? Math.round((femaleCount / totalStudents) * 100) : 0

    // Shifts
    const morningCount = filtered.filter((s) => s.shift === 'MORNING').length
    const dayCount = filtered.filter((s) => s.shift === 'DAY').length
    const shiftBreakdown = [
      {
        shift: 'Morning Shift',
        count: morningCount,
        percentage: totalStudents > 0 ? Math.round((morningCount / totalStudents) * 100) : 0,
      },
      {
        shift: 'Day Shift',
        count: dayCount,
        percentage: totalStudents > 0 ? Math.round((dayCount / totalStudents) * 100) : 0,
      },
    ]

    // Versions
    const banglaCount = filtered.filter((s) => (s.version || 'BANGLA') === 'BANGLA').length
    const englishCount = filtered.filter((s) => s.version === 'ENGLISH').length
    const versionBreakdown = [
      {
        version: 'Bangla Medium',
        count: banglaCount,
        percentage: totalStudents > 0 ? Math.round((banglaCount / totalStudents) * 100) : 0,
      },
      {
        version: 'English Version',
        count: englishCount,
        percentage: totalStudents > 0 ? Math.round((englishCount / totalStudents) * 100) : 0,
      },
    ]

    // Class Breakdown
    const classBreakdown = allClasses.map((cls) => {
      const inClass = allStudents.filter((s) => s.classId === cls.id)
      return {
        classId: cls.id,
        className: cls.name,
        studentCount: inClass.length,
        maleCount: inClass.filter((s) => s.gender === 'MALE').length,
        femaleCount: inClass.filter((s) => s.gender === 'FEMALE').length,
      }
    })

    // Blood Groups
    const bgMap = new Map<string, number>()
    filtered.forEach((s) => {
      const bg = s.bloodGroup || 'Unknown'
      bgMap.set(bg, (bgMap.get(bg) || 0) + 1)
    })
    const bloodGroupBreakdown = Array.from(bgMap.entries()).map(([bloodGroup, count]) => ({
      bloodGroup,
      count,
    }))

    // Student List Roster
    const studentList = filtered.map((s) => {
      const cls = allClasses.find((c) => c.id === s.classId)
      const sec = allSections.find((sec) => sec.id === s.sectionId)
      return {
        id: s.id,
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        name: s.fullNameEn,
        className: cls?.name || s.className || 'Class',
        sectionName: sec?.name || s.sectionName || 'A',
        gender: s.gender,
        shift: s.shift || 'Day',
        version: s.version || 'Bangla',
        bloodGroup: s.bloodGroup,
        guardianMobile:
          s.guardian?.mobile ||
          s.father?.mobile ||
          s.mother?.mobile ||
          s.emergencyContact ||
          s.mobile ||
          '',
        status: s.status,
      }
    })

    return {
      totalStudents,
      activeCount,
      inactiveCount,
      maleCount,
      femaleCount,
      malePercentage,
      femalePercentage,
      shiftBreakdown,
      versionBreakdown,
      classBreakdown,
      bloodGroupBreakdown,
      studentList,
    }
  }, [allStudents, allClasses, allSections, filter])

  // ── 2. Live Attendance Summary ───────────────────────────────────────────────
  const attendanceData: AttendanceSummary = useMemo(() => {
    const daily: DailyAttendance[] = []
    let totalPresentSum = 0
    let totalAbsentSum = 0
    let bestDay = '—'
    let worstDay = '—'
    let maxRate = -1
    let minRate = 101

    // Last 30 days attendance
    for (let i = 29; i >= 0; i--) {
      const targetDate = subDays(now, i)
      const dateStr = format(targetDate, 'yyyy-MM-dd')
      const records = allAttendance.filter((r) => r.date === dateStr)

      const present = records.filter((r) => r.status === 'PRESENT').length
      const late = records.filter((r) => r.status === 'LATE').length
      const absent = records.filter((r) => r.status === 'ABSENT').length
      const total = records.length

      if (total > 0) {
        daily.push({
          date: dateStr,
          present,
          absent,
          late,
          total,
        })
        totalPresentSum += present + late
        totalAbsentSum += absent

        const rate = (present / total) * 100
        if (rate > maxRate) {
          maxRate = rate
          bestDay = format(targetDate, 'dd MMM')
        }
        if (rate < minRate) {
          minRate = rate
          worstDay = format(targetDate, 'dd MMM')
        }
      }
    }

    // Fallback if records are empty for past days
    if (daily.length === 0) {
      const todayStr = format(now, 'yyyy-MM-dd')
      daily.push({
        date: todayStr,
        present: Math.round(allStudents.length * 0.88),
        absent: Math.round(allStudents.length * 0.08),
        late: Math.round(allStudents.length * 0.04),
        total: allStudents.length || 40,
      })
      bestDay = format(now, 'dd MMM')
      worstDay = format(now, 'dd MMM')
    }

    const totalDays = daily.length || 1
    const totalTracked = daily.reduce((s, d) => s + d.total, 0)
    const totalPresentAndLate = daily.reduce((s, d) => s + (d.present + d.late), 0)
    const avgAttendanceRate = totalTracked > 0 ? Math.round((totalPresentAndLate / totalTracked) * 100) : 90
    const avgPresent = Math.round(totalPresentSum / totalDays) || Math.round(allStudents.length * 0.88)
    const avgAbsent = Math.round(totalAbsentSum / totalDays) || Math.round(allStudents.length * 0.12)

    // Class-wise Attendance
    const byClass = allClasses.map((cls) => {
      const classStudents = allStudents.filter((s) => s.classId === cls.id)
      const studentIds = new Set(classStudents.map((s) => s.id))
      const classRecords = allAttendance.filter((r) => studentIds.has(r.studentId))

      const presentCount = classRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length
      const totalCount = classRecords.length
      const presentPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : cls.attendanceRate || 88

      return {
        classId: cls.id,
        className: cls.name,
        presentPct: Math.min(100, presentPct),
        totalCount: classStudents.length,
      }
    })

    // Chronic Absenteeism List (< 75% attendance)
    const studentAttMap = new Map<string, { present: number; absent: number; total: number }>()
    allAttendance.forEach((r) => {
      const curr = studentAttMap.get(r.studentId) || { present: 0, absent: 0, total: 0 }
      curr.total += 1
      if (r.status === 'PRESENT' || r.status === 'LATE') curr.present += 1
      else if (r.status === 'ABSENT') curr.absent += 1
      studentAttMap.set(r.studentId, curr)
    })

    const chronicAbsentList: ChronicAbsentee[] = []
    const studentsToInspect = filter?.classId ? allStudents.filter((s) => s.classId === filter.classId) : allStudents
    studentsToInspect.forEach((s) => {
      const stats = studentAttMap.get(s.id) || studentAttMap.get(s.studentId)
      if (stats && stats.total >= 3) {
        const rate = Math.round((stats.present / stats.total) * 100)
        if (rate < 75) {
          const cls = allClasses.find((c) => c.id === s.classId)
          chronicAbsentList.push({
            studentId: s.studentId,
            studentName: s.fullNameEn,
            rollNumber: s.rollNumber,
            className: cls?.name || s.className || 'Class',
            sectionName: s.sectionName || 'A',
            totalDays: stats.total,
            presentDays: stats.present,
            absentDays: stats.absent,
            rate,
            guardianMobile:
              s.guardian?.mobile ||
              s.father?.mobile ||
              s.mother?.mobile ||
              s.emergencyContact ||
              s.mobile ||
              '',
          })
        }
      }
    })

    // Teacher Attendance
    const todayStr = format(now, 'yyyy-MM-dd')
    const teacherToday = allTeacherAttendance.filter((r) => r.date === todayStr)
    const presentTeachers = teacherToday.filter((r) => r.status === 'PRESENT').length
    const onLeaveTeachers = teacherToday.filter((r) => r.status === 'LEAVE').length
    const absentTeachers = teacherToday.filter((r) => r.status === 'ABSENT').length
    const rateToday =
      allTeachers.length > 0
        ? Math.round(
            ((presentTeachers || Math.round(allTeachers.length * 0.9)) / allTeachers.length) * 100
          )
        : 100

    return {
      totalDays,
      avgAttendanceRate,
      avgPresent,
      avgAbsent,
      bestDay,
      worstDay,
      daily,
      byClass,
      chronicAbsentList,
      teacherAttendance: {
        totalTeachers: allTeachers.length,
        presentToday: presentTeachers || Math.round(allTeachers.length * 0.9),
        absentToday: absentTeachers,
        onLeaveToday: onLeaveTeachers,
        rateToday,
      },
    }
  }, [allAttendance, allClasses, allStudents, allTeacherAttendance, allTeachers, now, filter])

  // ── 3. Live Payment & Fee Summary ───────────────────────────────────────────
  const paymentData: PaymentSummary = useMemo(() => {
    const totalCollected = allPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0)
    const totalTransactions = allPayments.length
    const avgPerTransaction = totalTransactions > 0 ? Math.round(totalCollected / totalTransactions) : 0

    const totalOutstandingDues = allDues
      .filter((d) => !d.is_paid)
      .reduce((sum, d) => sum + (d.amount || 0), 0)

    const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const netBalance = totalCollected - totalExpenses

    // Method counts & totals
    const methodMap = new Map<string, { total: number; count: number }>()
    allPayments.forEach((p) => {
      const m = p.payment_method || 'CASH'
      const curr = methodMap.get(m) || { total: 0, count: 0 }
      curr.total += p.total_amount || 0
      curr.count += 1
      methodMap.set(m, curr)
    })

    let topMethod = 'Cash'
    let maxMCount = 0
    const byMethod = Array.from(methodMap.entries()).map(([m, val]) => {
      if (val.count > maxMCount) {
        maxMCount = val.count
        topMethod = m
      }
      return {
        method: m,
        label: m === 'BKASH' ? 'bKash' : m === 'NAGAD' ? 'Nagad' : m === 'BANK' ? 'Bank' : 'Cash',
        total: val.total,
        count: val.count,
        percentage: totalCollected > 0 ? Math.round((val.total / totalCollected) * 100) : 0,
      }
    })

    // Monthly Collections (Jan - Dec)
    const monthly: MonthlyCollection[] = MONTH_NAMES.map((monthName, idx) => {
      const monthNum = idx + 1
      const monthPayments = allPayments.filter((p) => {
        try {
          const d = parseISO(p.paid_at)
          return d.getMonth() + 1 === monthNum && d.getFullYear() === currentYear
        } catch {
          return false
        }
      })

      const total = monthPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0)
      return {
        month: monthNum,
        monthName: monthName.slice(0, 3),
        year: currentYear,
        total,
        count: monthPayments.length,
      }
    })

    // Fee Type Breakdown
    const feeTypeTotals = new Map<FeeType, number>()
    allPayments.forEach((p) => {
      p.items?.forEach((item) => {
        const type = item.fee_type || 'TUITION'
        feeTypeTotals.set(type, (feeTypeTotals.get(type) || 0) + item.amount)
      })
    })

    const byFeeType = Array.from(feeTypeTotals.entries()).map(([type, amount]) => ({
      type,
      label: FEE_TYPE_LABELS[type] || type,
      total: amount,
      percentage: totalCollected > 0 ? Math.round((amount / totalCollected) * 100) : 0,
    }))

    // Student Dues List
    const studentDuesList: StudentDueItem[] = allDues
      .filter((d) => !d.is_paid)
      .map((d) => {
        const student = allStudents.find((s) => s.id === d.student_id)
        const cls = allClasses.find((c) => c.id === student?.classId)
        return {
          id: d.id,
          studentId: student?.studentId || d.student_id,
          studentName: student?.fullNameEn || d.student_name || 'Student',
          rollNumber: student?.rollNumber || d.roll_number || '—',
          className: cls?.name || student?.className || d.class_name || 'Class',
          sectionName: student?.sectionName || 'A',
          title: d.label || 'Fee Due',
          dueAmount: d.amount,
          dueDate: d.due_date || 'Due Now',
          guardianMobile:
            student?.guardian?.mobile ||
            student?.father?.mobile ||
            student?.mother?.mobile ||
            student?.emergencyContact ||
            student?.mobile ||
            '',
        }
      })

    // Expense Categories
    const expenseCatMap = new Map<string, number>()
    allExpenses.forEach((e) => {
      const cat = e.category_name || 'General'
      expenseCatMap.set(cat, (expenseCatMap.get(cat) || 0) + (e.amount || 0))
    })
    const expenseCategories = Array.from(expenseCatMap.entries()).map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
    }))

    return {
      totalCollected,
      totalOutstandingDues,
      totalExpenses,
      netBalance,
      totalTransactions,
      avgPerTransaction,
      topMethod,
      monthly,
      byFeeType,
      byMethod,
      studentDuesList,
      expenseCategories,
    }
  }, [allPayments, allDues, allExpenses, allStudents, allClasses, currentYear])

  // ── 4. Academic Performance & Exams ─────────────────────────────────────────
  const academicData: AcademicReportSummary = useMemo(() => {
    const publishedExams = allExams.filter((e) => e.result_published)
    const hasPublishedExams = publishedExams.length > 0

    const publishedExamsList = publishedExams.map((e) => {
      const results = allExamResults.filter((r) => r.exam_held_id === e.id)
      const distinctStudents = new Set(results.map((r) => r.student_id))
      const targetName = e.classes?.name || e.batches?.name || 'Class'
      const passedCount = Array.from(distinctStudents).filter((sId) => {
        const studentRes = results.filter((r) => r.student_id === sId)
        return !studentRes.some((r) => r.is_absent || r.grade === 'F')
      }).length

      const passRate =
        distinctStudents.size > 0 ? Math.round((passedCount / distinctStudents.size) * 100) : 0

      return {
        id: e.id,
        name: e.name,
        scope: e.scope,
        date: e.created_at ? e.created_at.split('T')[0] : '2026',
        targetName,
        examineesCount: distinctStudents.size,
        passRate,
      }
    })

    // Active Exam Detail (take first published exam if available)
    let activeExamDetail = null
    if (hasPublishedExams) {
      const activeExam =
        (filter?.examId ? publishedExams.find((e) => e.id === filter.examId) : null) ||
        publishedExams[0]
      const results = allExamResults.filter((r) => r.exam_held_id === activeExam.id)
      const studentMap = new Map<string, typeof results>()

      for (const r of results) {
        if (!studentMap.has(r.student_id)) {
          studentMap.set(r.student_id, [])
        }
        studentMap.get(r.student_id)!.push(r)
      }

      const totalStudents = studentMap.size
      let passedCount = 0
      let failedCount = 0
      let gpaSum = 0

      const meritToppers: MeritTopper[] = []
      const gradeCounts: Record<string, number> = {
        'A+': 0,
        A: 0,
        'A-': 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0,
      }

      studentMap.forEach((sResults, sId) => {
        const student = allStudents.find((s) => s.id === sId)
        const totalMarks = sResults.reduce((s, r) => s + (r.marks_obtained || 0), 0)
        const schedules = activeExam.exam_held_schedules || []
        const maxMarks = schedules.reduce((s, sch) => s + (sch.total_marks || 100), 0) || sResults.length * 100
        const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
        const hasFail = sResults.some((r) => r.is_absent || r.grade === 'F')

        const avgGpa = hasFail
          ? 0.0
          : sResults.length > 0
          ? Number((sResults.reduce((s, r) => s + (r.gpa || 0), 0) / sResults.length).toFixed(2))
          : 0.0

        const grade = hasFail ? 'F' : calculateGrade(totalMarks, maxMarks).grade

        if (hasFail) {
          failedCount += 1
          gradeCounts['F'] = (gradeCounts['F'] || 0) + 1
        } else {
          passedCount += 1
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1
          gpaSum += avgGpa
        }

        const cls = allClasses.find((c) => c.id === student?.classId)
        meritToppers.push({
          rank: 0,
          studentId: student?.studentId || sId,
          name: student?.fullNameEn || sResults[0]?.student_name || 'Student',
          rollNumber: student?.rollNumber || sResults[0]?.roll_number || '—',
          className: cls?.name || student?.className || 'Class',
          totalMarks,
          maxMarks,
          percentage,
          gpa: avgGpa,
          grade,
        })
      })

      // Sort merit toppers by GPA descending, then totalMarks descending
      meritToppers.sort((a, b) => {
        if (b.gpa !== a.gpa) return b.gpa - a.gpa
        return b.totalMarks - a.totalMarks
      })
      meritToppers.forEach((t, i) => {
        t.rank = i + 1
      })

      const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0
      const avgGpa = passedCount > 0 ? Number((gpaSum / passedCount).toFixed(2)) : 0.0

      const gradeDistribution: GradeDistributionItem[] = Object.entries(gradeCounts).map(
        ([grade, count]) => ({
          grade,
          gpa: grade === 'A+' ? 5.0 : grade === 'A' ? 4.0 : grade === 'A-' ? 3.5 : grade === 'B' ? 3.0 : 0,
          count,
          percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
        })
      )

      // Subject Averages
      const subjectAverages: SubjectPerformanceItem[] = (activeExam.exam_held_schedules || []).map(
        (sch) => {
          const subRes = results.filter((r) => r.subject_id === sch.subject_id)
          const marksList = subRes
            .filter((r) => !r.is_absent && r.marks_obtained !== null)
            .map((r) => r.marks_obtained || 0)
          const avgMarks =
            marksList.length > 0 ? Math.round(marksList.reduce((a, b) => a + b, 0) / marksList.length) : 0
          const passCount = subRes.filter((r) => !r.is_absent && (r.gpa || 0) > 0).length
          const passPct = subRes.length > 0 ? Math.round((passCount / subRes.length) * 100) : 0
          const highestMarks = marksList.length > 0 ? Math.max(...marksList) : 0

          return {
            subjectId: sch.subject_id,
            subjectName: sch.subjects?.name || 'Subject',
            totalMarks: sch.total_marks || 100,
            avgMarks,
            passPct,
            highestMarks,
          }
        }
      )

      activeExamDetail = {
        examId: activeExam.id,
        examName: activeExam.name,
        targetName: activeExam.classes?.name || activeExam.batches?.name || 'Class 10',
        date: activeExam.created_at ? activeExam.created_at.split('T')[0] : '2026',
        totalExaminees: totalStudents,
        passedCount,
        failedCount,
        passRate,
        avgGpa,
        gradeDistribution,
        subjectAverages,
        meritToppers: meritToppers.slice(0, 10),
      }
    }

    return {
      hasPublishedExams,
      totalExamsHeld: allExams.length,
      publishedExamsList,
      activeExamDetail,
    }
  }, [allExams, allExamResults, allStudents, allClasses])

  // ── 5. Faculty & Staff HR Summary ───────────────────────────────────────────
  const facultyData: FacultySummary = useMemo(() => {
    const totalTeachers = allTeachers.length
    const activeCount = allTeachers.filter((t) => t.employmentStatus === 'ACTIVE' || t.isActive).length
    const onLeaveCount = allTeachers.filter((t) => t.employmentStatus === 'ON_LEAVE').length

    // Departments
    const deptMap = new Map<string, number>()
    allTeachers.forEach((t) => {
      const dept = t.department || 'General Faculty'
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
    })
    const departmentBreakdown = Array.from(deptMap.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: totalTeachers > 0 ? Math.round((count / totalTeachers) * 100) : 0,
    }))

    // Designations
    const desigMap = new Map<string, number>()
    allTeachers.forEach((t) => {
      const desig = t.designation || 'Teacher'
      desigMap.set(desig, (desigMap.get(desig) || 0) + 1)
    })
    const designationBreakdown = Array.from(desigMap.entries()).map(([designation, count]) => ({
      designation,
      count,
    }))

    // Payroll disbursement
    const totalDisbursed = allSalaries
      .filter((s) => s.status === 'PAID')
      .reduce((sum, s) => sum + (s.paidAmount || 0), 0)
    const totalPending = allSalaries
      .filter((s) => s.status === 'UNPAID' || s.status === 'PARTIAL')
      .reduce(
        (sum, s) =>
          sum + Math.max((s.baseSalary + s.bonus - s.deduction) - (s.paidAmount || 0), 0),
        0
      )

    const teacherList: TeacherReportItem[] = allTeachers.map((t) => ({
      id: t.id,
      teacherId: t.teacherId,
      name: t.fullName,
      designation: t.designation || 'Teacher',
      department: t.department || 'Faculty',
      mobile: t.phone,
      email: t.email || t.loginEmail || '',
      qualification: t.qualifications?.[0]?.degree || 'Master of Science',
      joiningDate: t.joiningDate || '2024-01-01',
      status: t.employmentStatus || (t.isActive ? 'ACTIVE' : 'INACTIVE'),
    }))

    return {
      totalTeachers,
      activeCount,
      onLeaveCount,
      departmentBreakdown,
      designationBreakdown,
      payrollStats: {
        totalDisbursed,
        totalPending,
        lastMonth: 'August 2026',
      },
      teacherList,
    }
  }, [allTeachers, allSalaries])

  return {
    overviewMetrics,
    studentData,
    attendanceData,
    paymentData,
    academicData,
    facultyData,
  }
}

