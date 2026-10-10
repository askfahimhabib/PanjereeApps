import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  Award,
  Wallet,
  Bell,
  Clock,
  ArrowRight,
  Sparkles,
  CreditCard,
  ChevronRight,
  FileText,
  Calendar,
  MapPin,
  User,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import {
  routineStore,
  examStore,
  attendanceStore,
  manualDueStore,
  noticeStore,
  calendarStore,
} from '@/data/stores'
import { examResultStore } from '@/features/examHeld/hooks/useExamResults'
import { PaymentCheckoutModal } from '@/features/student-portal/components/PaymentCheckoutModal'
import { ApplyLeaveModal } from '@/features/student-portal/components/ApplyLeaveModal'
import { subscribeStores } from '@/lib/localStore'
import { getEffectiveStudentAvatar } from '@/lib/studentAvatar'

export function StudentDashboard() {
  const { student } = useStudentSession()
  const navigate = useNavigate()

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    return subscribeStores(
      ['students', 'attendance', 'routines', 'manual_dues', 'exam_held', 'exam_results', 'calendar-events'],
      () => setRefreshKey((k) => k + 1)
    )
  }, [])

  // 1. Real Dues & Fee calculation (No fake 1500 fallback!)
  const totalDues = useMemo(() => {
    const studentDues = manualDueStore
      .getAll()
      .filter((d) => d.student_id === student.id && !d.is_paid)
    return studentDues.reduce((sum, d) => sum + (d.amount || 0), 0)
  }, [student.id, refreshKey])

  // 2. Real Attendance metrics from attendanceStore
  const attendanceStats = useMemo(() => {
    const allRecords = attendanceStore.getAll()
    const studentLogs = allRecords.filter((r) => r.studentId === student.id)
    const presentCount = studentLogs.filter((r) => r.status === 'PRESENT').length
    const lateCount = studentLogs.filter((r) => r.status === 'LATE').length
    const totalDays = studentLogs.length
    const percentage = totalDays > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalDays) * 100) : 100
    return { present: presentCount, totalDays: totalDays > 0 ? totalDays : 0, percentage }
  }, [student.id, refreshKey])

  // 3. Today's Class & Routine Schedule (Filtered by current weekday)
  const todaySchedule = useMemo(() => {
    const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
    const todayDayName = WEEKDAYS[new Date().getDay()]

    const routines = routineStore.getAll()
    const classOrBatchRoutines = routines.filter((r) => {
      // 1. Regular class routines: check class and matching section
      if (student.classId && r.class_id === student.classId) {
        if (r.section_id && student.sectionId && r.section_id !== student.sectionId) {
          return false
        }
        return true
      }
      // 2. Exam batch routines
      if (student.batchId && (
        r.batch_id === student.batchId ||
        (student.batchId === 'bat-001' && r.batch_id === 'batch-ssc-2024') ||
        (student.batchId === 'batch-ssc-2024' && r.batch_id === 'bat-001')
      )) {
        return true
      }
      return false
    })

    // Filter by today's day
    let matches = classOrBatchRoutines.filter((r) => r.day === todayDayName)
    const isWeekend = todayDayName === 'FRIDAY' || matches.length === 0
    const displayDay = isWeekend ? 'SUNDAY' : todayDayName

    // If today is Friday or weekend, display Sunday routine as preview
    if (matches.length === 0) {
      matches = classOrBatchRoutines.filter((r) => r.day === 'SUNDAY')
    }

    return matches.slice(0, 4).map((m, idx) => ({
      id: m.id || `ts-${idx}`,
      subjectName: m.subjects?.name || 'Class Subject',
      startTime: m.start_time,
      endTime: m.end_time,
      teacherName: m.teachers?.full_name || 'Subject Teacher',
      room: m.room || 'Room 301',
      dayLabel: displayDay,
      isToday: !isWeekend,
    }))
  }, [student.classId, student.batchId, student.sectionId, refreshKey])

  // 4. Latest Exam & Results calculated strictly from PUBLISHED exams
  const latestExamInfo = useMemo(() => {
    const publishedExams = examStore.getAll().filter((e) => e.result_published)
    const publishedExamIds = new Set(publishedExams.map((e) => e.id))

    // Only consider results for exams that are officially published by admin!
    const studentResults = examResultStore
      .getWhere((r) => r.student_id === student.id && publishedExamIds.has(r.exam_held_id))

    if (studentResults.length > 0) {
      const examId = studentResults[0].exam_held_id
      const matchingExam = publishedExams.find((e) => e.id === examId)
      const currentExamResults = studentResults.filter((r) => r.exam_held_id === examId)

      const totalMarksObtained = currentExamResults.reduce((sum, r) => sum + (r.marks_obtained || 0), 0)
      const totalMarksPossible = currentExamResults.length * 100
      const validGpaResults = currentExamResults.filter((r) => typeof r.gpa === 'number')
      const avgGpa = validGpaResults.length > 0
        ? (validGpaResults.reduce((sum, r) => sum + (r.gpa || 0), 0) / validGpaResults.length).toFixed(2)
        : '5.00'

      const numGpa = Number(avgGpa)
      const grade = numGpa >= 5.0 ? 'A+' : numGpa >= 4.0 ? 'A' : numGpa >= 3.5 ? 'A-' : numGpa >= 3.0 ? 'B' : 'Pass'

      return {
        title: matchingExam ? matchingExam.name : 'Terminal Examination',
        gpa: avgGpa,
        grade,
        totalMarks: `${totalMarksObtained} / ${totalMarksPossible}`,
        hasResults: true,
      }
    }

    const latestExam = publishedExams[0]
    return {
      title: latestExam ? latestExam.name : 'Model Test & Assessment',
      gpa: '—',
      grade: 'Pending',
      totalMarks: 'Pending Publication',
      hasResults: false,
    }
  }, [student.id, refreshKey])

  // 5. Dynamic Upcoming Exam Milestone
  const upcomingMilestone = useMemo(() => {
    const exams = examStore.getAll().filter((e) => e.status !== 'COMPLETED')
    const calEvents = calendarStore.getAll()
    const nextExam = exams[0]
    if (nextExam) {
      return {
        title: nextExam.name,
        desc: `${nextExam.scope || 'Terminal Exam'} scheduled in routine`,
      }
    }
    const nextEvent = calEvents[0]
    if (nextEvent) {
      return {
        title: nextEvent.title,
        desc: `${nextEvent.type || 'Academic Event'} • Upcoming`,
      }
    }
    return {
      title: 'Model Test Examination 2026',
      desc: 'Special Assessment Exam Preparation',
    }
  }, [refreshKey])

  // 6. Recent Notices (Secured against staff/teacher circular leakage)
  const recentNotices = useMemo(() => {
    const notices = noticeStore.getAll().filter((n) => n.isPublished)
    const filtered = notices.filter((n) => {
      // Must be intended for students or everyone
      if (n.target !== 'ALL' && n.target !== 'STUDENTS') return false
      // If class-specific, ensure it matches student's class
      if (n.targetClassId && student.classId && n.targetClassId !== student.classId) {
        return false
      }
      return true
    })
    return filtered.slice(0, 2)
  }, [student.classId, refreshKey])

  const currentHour = new Date().getHours()
  let greeting = 'Good morning'
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon'
  else if (currentHour >= 17) greeting = 'Good evening'

  const todayFormatted = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. PREMIUM HERO GREETING BANNER (Aligned with Admin Dashboard Hero)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/10">
        {/* Glow blobs */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 h-56 w-56 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1 border-2 border-white/20 shadow-lg shrink-0 overflow-hidden flex items-center justify-center backdrop-blur-md">
              <img
                src={getEffectiveStudentAvatar(student)}
                alt={student.fullNameEn}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/20">
                  <Calendar size={12} className="text-emerald-300" />
                  {todayFormatted}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold border border-amber-300/30">
                  <Sparkles size={11} />
                  Session 2026
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
                {greeting}, <span className="text-emerald-200">{student.fullNameEn}!</span>
              </h1>
              
              <div className="flex items-center gap-2 flex-wrap text-xs text-emerald-100/90 font-medium">
                <span className="bg-emerald-900/40 px-2.5 py-0.5 rounded-lg border border-emerald-400/30 font-semibold">
                  {student.className ? `${student.className}` : student.batchName}
                  {student.sectionName ? ` • Sec: ${student.sectionName}` : ''}
                </span>
                <span>Roll: <strong className="text-white font-mono">{student.rollNumber}</strong></span>
                {student.groupName && <span>• Group: {student.groupName}</span>}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Hub */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-auto shrink-0">
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all duration-200 border border-white/20 backdrop-blur-md shadow-xs cursor-pointer hover:scale-[1.02]"
            >
              <FileText size={15} />
              <span>Apply Leave</span>
            </button>

            <button
              onClick={() => navigate('/student/profile')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all duration-200 shadow-md shadow-amber-400/20 cursor-pointer hover:scale-[1.02]"
            >
              <CreditCard size={15} className="fill-zinc-950" />
              <span>Digital ID Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CRISP KPI METRIC CARDS (Aligned with Admin .card-surface design)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Card */}
        <div className="card-surface p-5 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700/60 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Attendance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {attendanceStats.percentage}%
              </span>
              <span className="text-xs text-zinc-400">
                ({attendanceStats.present}/{attendanceStats.totalDays} Days)
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${attendanceStats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* GPA Standing Card */}
        <div className="card-surface p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700/60 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Academic Standing</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {latestExamInfo.hasResults ? `GPA ${latestExamInfo.gpa}` : 'Result Pending'}
              </span>
              <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                latestExamInfo.grade === 'A+' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                latestExamInfo.grade === 'A' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                'bg-zinc-100 text-zinc-700 dark:bg-slate-800 dark:text-zinc-300'
              }`}>
                {latestExamInfo.grade}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 truncate">
              {latestExamInfo.title}
            </p>
          </div>
        </div>

        {/* Total Dues Card */}
        <div className="card-surface p-5 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700/60 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pending Dues</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                ৳{totalDues.toLocaleString()}
              </span>
              {totalDues > 0 ? (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Pay Now
                </button>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                  Cleared ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              {totalDues > 0 ? 'bKash / Nagad / In-Cash' : 'All academic fees up to date'}
            </p>
          </div>
        </div>

        {/* Notices Card */}
        <div className="card-surface p-5 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-700/60 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Announcements</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bell size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {recentNotices.length}
              </span>
              <span className="text-xs text-zinc-400">Circulars Active</span>
            </div>
            <Link
              to="/student/notices"
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-flex items-center gap-1"
            >
              Notice Board <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN SECTION: TODAY'S TIMELINE & QUICK SERVICES
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Schedule Timeline */}
        <div className="lg:col-span-2 card-surface p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-slate-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Today's Class Schedule</h3>
                <p className="text-[11px] text-zinc-400">Live period timetable</p>
              </div>
            </div>

            <Link
              to="/student/routine"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Weekly Routine <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {todaySchedule.map((slot, index) => {
              const isFirst = index === 0
              return (
                <div
                  key={slot.id || index}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isFirst
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-zinc-50/60 dark:bg-slate-800/30 border-zinc-200/60 dark:border-slate-800/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isFirst
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-slate-700 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                          {slot.subjectName}
                        </h4>
                        {isFirst && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Next Up
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {slot.teacherName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {slot.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span className="text-[10px] text-zinc-400">Duration: 45 min</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Exam & Quick Links */}
        <div className="space-y-5">
          
          {/* Upcoming Exam Milestone */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Calendar size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Exam Milestone</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {upcomingMilestone.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {upcomingMilestone.desc}
              </p>
            </div>
            <Link
              to="/student/routine"
              className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              Check Exam Routine →
            </Link>
          </div>

          {/* Quick Actions List */}
          <div className="card-surface p-5 space-y-3">
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Quick Actions</h4>
            
            <div className="space-y-1.5">
              <Link
                to="/student/routine"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-emerald-600" />
                  <span>Weekly Routine</span>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </Link>

              <Link
                to="/student/results"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Award size={15} className="text-blue-600" />
                  <span>Marksheet & Report Card</span>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </Link>

              <button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet size={15} className="text-amber-600" />
                  <span>Fee Payment (Online / Cash)</span>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentCheckoutModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        studentId={student.id}
        studentName={student.fullNameEn}
        studentRoll={student.rollNumber}
        classId={student.classId}
        batchId={student.batchId}
        className={student.className}
        dueAmount={totalDues}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {/* Leave Application Modal */}
      <ApplyLeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        student={student}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
