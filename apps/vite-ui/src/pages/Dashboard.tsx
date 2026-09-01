import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, ClipboardList,
  CheckCircle2, ArrowRight, CalendarDays, Wallet,
} from 'lucide-react'
import {
  studentStore,
  teacherStore,
  examStore,
  attendanceStore,
  classStore,
  paymentStore,
} from '@/data/stores'
import { EXAM_SCOPE_LABELS } from '@/features/examHeld/types'
import { format, parseISO } from 'date-fns'

// ─── Color Maps to prevent Tailwind purging ───────────────────────────────────
const STAT_COLORS: Record<string, { bg: string, text: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  orange:  { bg: 'bg-amber-50',   text: 'text-amber-700' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700' },
}

const LIST_COLORS = [
  { bar: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  { bar: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700' },
  { bar: 'bg-indigo-500',  bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { bar: 'bg-purple-500',  bg: 'bg-purple-50',  text: 'text-purple-700' },
  { bar: 'bg-pink-500',    bg: 'bg-pink-50',    text: 'text-pink-700' },
]

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, colorKey, to,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  colorKey: string
  to?: string
}) {
  const color = STAT_COLORS[colorKey] || STAT_COLORS.blue

  const inner = (
    <div className="card-surface p-5 hover:shadow-md transition-all duration-200 group flex flex-col justify-between h-full relative overflow-hidden">
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.bg} ${color.text}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        {to && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-700 transition-colors">
            <ArrowRight size={13} />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-2xl font-bold text-zinc-900 tracking-tight mb-0.5">{value}</p>
        <p className="text-xs font-semibold text-zinc-500">{label}</p>
        {sub && <p className="text-[11px] text-zinc-400 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  )

  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const data = useMemo(() => {
    const students  = studentStore.getAll()
    const teachers  = teacherStore.getAll()
    const exams     = examStore.getAll()
    const attendance = attendanceStore.getAll()

    const activeStudents  = students.filter(s => s.status === 'ACTIVE')
    const maleStudents    = activeStudents.filter(s => s.gender === 'MALE').length
    const femaleStudents  = activeStudents.filter(s => s.gender === 'FEMALE').length
    const activeTeachers = teachers.filter(t => t.employmentStatus === 'ACTIVE')

    const todayStr = new Date().toISOString().split('T')[0]
    const todayRecords = attendance.filter(r => r.date === todayStr)
    const todayPresent = todayRecords.filter(r => r.status === 'PRESENT').length
    const todayTotal   = todayRecords.length
    const attendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : null

    const upcomingExams  = exams.filter(e => e.status === 'SCHEDULED' || e.status === 'ONGOING')
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .slice(0, 5)
    const completedExams = exams.filter(e => e.status === 'COMPLETED').length

    const activeClasses = classStore.getAll().filter(c => c.isActive !== false)

    const classBreakdown = activeClasses
      .map(c => ({
        name: c.name,
        count: activeStudents.filter(s => s.classId === c.id).length,
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

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
      publishedResults,
    }
  }, [])

  const today = format(new Date(), 'MMMM d, yyyy')

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* ── LEFT COLUMN ── */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Banner */}
        <div className="bg-[var(--color-primary)] rounded-[28px] p-8 md:p-10 text-white shadow-lg shadow-green-500/15 relative overflow-hidden flex flex-col justify-center min-h-[180px]">
          <div className="relative z-10 max-w-xl">
            <p className="text-emerald-50 mb-1 font-medium">{today}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to your Dashboard!</h1>
            <p className="text-emerald-50 text-sm md:text-base leading-relaxed max-w-md">
              You have {data.upcomingExams.length} upcoming exams and {data.todayPresent} students present today. Keep up the great work!
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-full hidden md:block">
            <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute right-20 bottom-[-20px] w-32 h-32 bg-[#3ab579] rounded-full blur-xl" />
          </div>
        </div>

        {/* Stats Grid — 5 cards, symmetric layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            label="Active Students"
            value={data.totalStudents}
            sub={`${data.maleStudents} Male · ${data.femaleStudents} Female`}
            icon={Users}
            colorKey="blue"
            to="/students"
          />
          <StatCard
            label="Active Teachers"
            value={data.totalTeachers}
            sub="All departments"
            icon={GraduationCap}
            colorKey="emerald"
            to="/teachers"
          />
          <StatCard
            label="Today's Attendance"
            value={data.attendanceRate !== null ? `${data.attendanceRate}%` : '—'}
            sub={data.todayTotal > 0 ? `${data.todayPresent} present` : 'Not taken yet'}
            icon={CheckCircle2}
            colorKey="orange"
            to="/attendance"
          />
          <StatCard
            label="Total Classes"
            value={data.totalClasses}
            sub={`${data.completedExams} exams completed`}
            icon={BookOpen}
            colorKey="purple"
            to="/classes"
          />
          <StatCard
            label="Fees Collected"
            value={`৳${data.collectedThisMonth.toLocaleString()}`}
            sub="This month"
            icon={Wallet}
            colorKey="indigo"
            to="/payments"
          />
        </div>

        {/* Students by Class */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-zinc-900">Students by Class</h2>
            <Link to="/classes" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">See all</Link>
          </div>

          {data.classBreakdown.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-400">
              <Users size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No students enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.classBreakdown.map((cls, idx) => {
                const pct = data.totalStudents > 0 ? Math.round((cls.count / data.totalStudents) * 100) : 0
                const color = LIST_COLORS[idx % LIST_COLORS.length]

                return (
                  <div key={cls.name} className="flex items-center gap-4 p-3.5 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-xs transition-all bg-white">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg} ${color.text} flex-shrink-0`}>
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                      <p className="text-sm font-bold text-zinc-900">{cls.name}</p>
                      <p className="text-[11px] font-medium text-zinc-400">Class Size</p>
                    </div>
                    <div className="flex items-center gap-3 md:gap-5">
                      <span className="text-xs font-bold text-zinc-700 w-10 text-right">{pct}%</span>
                      <div className="hidden sm:block w-24 md:w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color.bar} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center gap-1 w-12 justify-end">
                        <Users size={13} className="text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-800">{cls.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="space-y-6">
        
        {/* Quick Links styled as action buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Attendance', to: '/attendance', icon: CheckCircle2, bg: 'bg-amber-50', text: 'text-amber-700' },
            { label: 'Exams',      to: '/exam-held',  icon: ClipboardList, bg: 'bg-purple-50', text: 'text-purple-700' },
            { label: 'Routine',    to: '/routines',   icon: CalendarDays,  bg: 'bg-blue-50', text: 'text-blue-700' },
            { label: 'Add Student',to: '/students',   icon: Users,         bg: 'bg-emerald-50', text: 'text-emerald-700' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl ${link.bg} border border-zinc-200/60 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 group`}
            >
              <link.icon size={20} className={`${link.text} mb-1.5 group-hover:scale-110 transition-transform duration-200`} />
              <span className={`text-xs font-bold ${link.text}`}>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Upcoming Exams */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-zinc-900">Upcoming Exams</h2>
            <Link to="/exam-held" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">See all</Link>
          </div>

          {data.upcomingExams.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-400">
              <ClipboardList size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No upcoming exams</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingExams.map((exam, idx) => {
                const target = exam.classes?.name ?? exam.batches?.name ?? '—'
                const schedules = exam.exam_held_schedules ?? []
                const nextDate = schedules.map(s => s.date).filter(Boolean).sort()[0]
                const color = LIST_COLORS[idx % LIST_COLORS.length]

                return (
                  <div key={exam.id} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-200 hover:shadow-md transition-all bg-white">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.bg} ${color.text} flex-shrink-0`}>
                      <ClipboardList size={20} />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[14px] font-bold text-zinc-900 leading-tight">{exam.name}</p>
                      <p className="text-[12px] font-medium text-zinc-400 mt-1">
                        {EXAM_SCOPE_LABELS[exam.scope]} • {target}
                      </p>
                      {nextDate && (
                        <p className="text-[11px] font-semibold text-zinc-400 mt-1">
                          {format(parseISO(nextDate), 'd MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Published Results */}
        {data.publishedResults.length > 0 && (
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Published Results</h2>
              <Link to="/exam-held" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">See all</Link>
            </div>
            
            <div className="space-y-3">
              {data.publishedResults.map(exam => {
                const target = exam.classes?.name ?? exam.batches?.name ?? '—'
                return (
                  <div key={exam.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:shadow-md transition-all bg-white">
                    <div>
                      <p className="text-[14px] font-bold text-zinc-900">{exam.name}</p>
                      <p className="text-[12px] font-medium text-zinc-400 mt-0.5">{target}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                      Ready
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
