import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, ClipboardList,
  TrendingUp, CheckCircle2, AlertCircle, Clock,
  ArrowRight, CalendarDays, Send, Wallet,
} from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'
import type { Teacher } from '@/features/teachers/types'
import type { ExamHeld } from '@/features/examHeld/types'
import type { AttendanceRecord } from '@/features/attendance/types'
import type { ClassItem } from '@/features/classes/types'
import type { PaymentRecord } from '@/features/payments/types'
import { EXAM_STATUS_CONFIG, EXAM_SCOPE_LABELS } from '@/features/examHeld/types'
import { format, parseISO, isToday } from 'date-fns'

// ─── Direct store reads (no hooks — avoids re-render complexity) ──────────────
const studentStore    = createStore<Student>('students')
const teacherStore    = createStore<Teacher>('teachers')
const examStore       = createStore<ExamHeld>('exam_held')
const attendanceStore = createStore<AttendanceRecord>('attendance')
const classStore      = createStore<ClassItem>('classes')
const paymentStore    = createStore<PaymentRecord>('payments')

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, to,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  to?: string
}) {
  const inner = (
    <div className={`
      relative p-5 rounded-2xl border bg-slate-900/60 border-slate-700
      hover:border-slate-600 transition-all group overflow-hidden
    `}>
      {/* Glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${color.replace('text-', 'bg-')}`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-slate-800 ${color}`}>
          <Icon size={18} />
        </div>
        {to && <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />}
      </div>

      <p className="text-3xl font-bold text-slate-100 mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </div>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const data = useMemo(() => {
    const students  = studentStore.getAll()
    const teachers  = teacherStore.getAll()
    const exams     = examStore.getAll()
    const attendance = attendanceStore.getAll()

    // Students
    const activeStudents  = students.filter(s => s.status === 'ACTIVE')
    const maleStudents    = activeStudents.filter(s => s.gender === 'MALE').length
    const femaleStudents  = activeStudents.filter(s => s.gender === 'FEMALE').length

    // Teachers
    const activeTeachers = teachers.filter(t => t.employmentStatus === 'ACTIVE')

    // Today's attendance
    const todayStr = new Date().toISOString().split('T')[0]
    const todayRecords = attendance.filter(r => r.date === todayStr)
    const todayPresent = todayRecords.filter(r => r.status === 'PRESENT').length
    const todayTotal   = todayRecords.length
    const attendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : null

    // Exams
    const upcomingExams  = exams.filter(e => e.status === 'SCHEDULED' || e.status === 'ONGOING')
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .slice(0, 5)
    const completedExams = exams.filter(e => e.status === 'COMPLETED').length

    // Classes (active only from store)
    const allClasses = classStore.getAll().map(c => ({ isActive: true, ...c } as ClassItem & { isActive: boolean }))
    const activeClasses = allClasses.filter(c => c.isActive !== false)

    // Class breakdown (top 6 by student count)
    const classBreakdown = activeClasses
      .map(c => ({
        name: c.name,
        count: activeStudents.filter(s => s.classId === c.id).length,
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Payment — collected this month
    const now = new Date()
    const thisMonth = now.getMonth() + 1
    const thisYear  = now.getFullYear()
    const collectedThisMonth = paymentStore
      .getWhere(p => {
        if (p.status === 'REFUNDED') return false
        const d = new Date(p.paid_at)
        return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear
      })
      .reduce((sum, p) => sum + p.total_amount, 0)

    // Recent attendance days
    const recentDates = [...new Set(attendance.map(r => r.date))]
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 7)

    // Published Results
    const publishedResults = exams.filter(e => e.result_published)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 4)

    return {
      totalStudents: activeStudents.length,
      maleStudents, femaleStudents,
      totalTeachers: activeTeachers.length,
      totalClasses: activeClasses.length,
      collectedThisMonth,
      attendanceRate, todayPresent, todayTotal,
      upcomingExams, completedExams,
      classBreakdown,
      recentDates,
      publishedResults,
    }
  }, [])

  const today = format(new Date(), 'EEEE, d MMMM yyyy')

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm flex items-center gap-1.5">
            <CalendarDays size={13} />
            {today}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Active Students"
          value={data.totalStudents}
          sub={`${data.maleStudents} Male · ${data.femaleStudents} Female`}
          icon={Users}
          color="text-blue-400"
          to="/students"
        />
        <StatCard
          label="Active Teachers"
          value={data.totalTeachers}
          sub="All departments"
          icon={GraduationCap}
          color="text-emerald-400"
          to="/teachers"
        />
        <StatCard
          label="Today's Attendance"
          value={data.attendanceRate !== null ? `${data.attendanceRate}%` : '—'}
          sub={data.todayTotal > 0
            ? `${data.todayPresent} present of ${data.todayTotal} marked`
            : 'Not taken yet today'}
          icon={CheckCircle2}
          color="text-amber-400"
          to="/attendance"
        />
        <StatCard
          label="Total Classes"
          value={data.totalClasses}
          sub={`${data.completedExams} exams completed`}
          icon={BookOpen}
          color="text-purple-400"
          to="/classes"
        />
        <StatCard
          label="Fees Collected"
          value={`৳${data.collectedThisMonth.toLocaleString()}`}
          sub="This month"
          icon={Wallet}
          color="text-emerald-500"
          to="/payments"
        />
      </div>

      {/* ── Second row: Class breakdown + Upcoming Exams ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Class Student Breakdown */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Students by Class</h2>
            <Link to="/classes" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {data.classBreakdown.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-600">
              <Users size={28} className="mb-2 opacity-40" />
              <p className="text-xs">No students enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.classBreakdown.map(cls => {
                const pct = data.totalStudents > 0
                  ? Math.round((cls.count / data.totalStudents) * 100)
                  : 0
                return (
                  <div key={cls.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{cls.name}</span>
                      <span className="text-xs font-semibold text-slate-300">{cls.count} <span className="text-slate-600 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Upcoming Exams</h2>
            <Link to="/exam-held" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {data.upcomingExams.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-600">
              <ClipboardList size={28} className="mb-2 opacity-40" />
              <p className="text-xs">No upcoming exams</p>
              <Link to="/exam-held" className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                + Create Exam
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.upcomingExams.map(exam => {
                const cfg = EXAM_STATUS_CONFIG[exam.status]
                const target = exam.classes?.name ?? exam.batches?.name ?? '—'
                const schedules = exam.exam_held_schedules ?? []
                const nextDate = schedules
                  .map(s => s.date)
                  .filter(Boolean)
                  .sort()[0]

                return (
                  <div
                    key={exam.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{exam.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {EXAM_SCOPE_LABELS[exam.scope]} · {target}
                        {nextDate && <span className="ml-2 text-slate-600">· {format(parseISO(nextDate), 'dd MMM')}</span>}
                      </p>
                    </div>
                    {schedules.length > 0 && (
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{schedules.length} sub.</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Links ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Take Attendance', desc: 'Mark today\'s attendance', to: '/attendance', icon: CheckCircle2, color: 'text-amber-400 border-amber-500/20 hover:bg-amber-500/5' },
          { label: 'Manage Exams',    desc: 'Schedule & results',        to: '/exam-held', icon: ClipboardList, color: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/5' },
          { label: 'Class Routines',  desc: 'Weekly timetable',          to: '/routines',  icon: CalendarDays,  color: 'text-blue-400 border-blue-500/20 hover:bg-blue-500/5' },
          { label: 'Add Student',     desc: 'Enroll new student',        to: '/students',  icon: Users,         color: 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/5' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 p-4 rounded-xl border bg-slate-900/40 transition-all ${link.color}`}
          >
            <link.icon size={18} className="flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200">{link.label}</p>
              <p className="text-[11px] text-slate-500 truncate">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      {/* ── Published Results ─────────────────────────── */}
      {data.publishedResults.length > 0 && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send size={15} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-300">Published Results</h2>
            </div>
            <Link to="/exam-held" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.publishedResults.map(exam => {
              const target = exam.classes?.name ?? exam.batches?.name ?? '—'
              return (
                <div
                  key={exam.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                >
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{exam.name}</p>
                    <p className="text-[11px] text-slate-500">{EXAM_SCOPE_LABELS[exam.scope]} · {target}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex-shrink-0">
                    Published
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
