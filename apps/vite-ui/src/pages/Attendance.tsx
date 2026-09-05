import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users,
  Briefcase,
  Calendar,
  FileBarChart2,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react'
import { useAttendanceHubKPI, todayString } from '@/features/attendance/useAttendance'
import { StudentAttendanceTab } from '@/features/attendance/components/StudentAttendanceTab'
import { TeacherAttendanceTab } from '@/features/attendance/components/TeacherAttendanceTab'
import { StudentLeavesTab } from '@/features/attendance/components/StudentLeavesTab'
import { TeacherLeavesTab } from '@/features/attendance/components/TeacherLeavesTab'
import { AttendanceReportsTab } from '@/features/attendance/components/AttendanceReportsTab'
import { ScrollableTabs } from '@/components/ui/ScrollableTabs'

type AttendanceTabType =
  | 'student-attendance'
  | 'teacher-attendance'
  | 'student-leaves'
  | 'teacher-leaves'
  | 'reports'

export function Attendance() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = (searchParams.get('tab') as AttendanceTabType) || 'student-attendance'
  const [activeTab, setActiveTab] = useState<AttendanceTabType>(tabParam)
  const today = todayString()

  // Sync state with URL params
  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as AttendanceTabType)
    }
  }, [searchParams])

  const handleTabChange = (tab: AttendanceTabType) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Master KPI data for top cards
  const kpi = useAttendanceHubKPI(today)

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Master Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
              Institutional Command Hub
            </span>
            <span className="text-xs text-zinc-400 font-medium">Academic Session 2024-2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Attendance & Leaves Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Unified register for daily student roll-calls, faculty attendance, approved leaves, and eligibility audit
          </p>
        </div>
      </div>

      {/* ── 2. Top Executive Summary Metrics Strip (এক নজরে সার্বিক মেট্রিক্স) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Today Student Attendance Rate */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Today&apos;s Attendance Rate
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {kpi.todayAttendanceRate}%
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                ({kpi.todayStudentsPresent}/{kpi.todayStudentsTotal} Students)
              </span>
            </div>
            <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${Math.min(100, kpi.todayAttendanceRate)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Card 2: Students Absent / On Leave */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Students Absent / Leave
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-700 font-mono">
                {kpi.todayStudentsAbsent}
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {kpi.todayStudentsOnLeave} on leave
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-medium">
              Guardian SMS alert available for all absentees
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Users size={22} />
          </div>
        </div>

        {/* Card 3: Teachers Presence */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Faculty Presence Today
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-zinc-900 font-mono">
                {kpi.todayTeachersPresent}/{kpi.todayTeachersTotal}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Present</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-medium">
              {kpi.todayTeachersOnLeave} faculty on approved leave
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Briefcase size={22} />
          </div>
        </div>

        {/* Card 4: Pending Leave Requests */}
        <div
          onClick={() => handleTabChange('student-leaves')}
          className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              Pending Leave Reviews
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-700 font-mono">
                {kpi.pendingLeavesCount}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-medium">
              Click to view &amp; approve applications
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* ── 3. Main Navigation Tab Pills ─────────────────────────────────── */}
      <ScrollableTabs className="w-full border-b border-zinc-200 pb-1" trackClassName="gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('student-attendance')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'student-attendance'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Users size={16} />
          <span>Student Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('teacher-attendance')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'teacher-attendance'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Briefcase size={16} />
          <span>Teacher &amp; Staff Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('student-leaves')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'student-leaves'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Calendar size={16} />
          <span>Student Leaves</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('teacher-leaves')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'teacher-leaves'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Award size={16} />
          <span>Faculty Leaves &amp; Balance</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('reports')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <FileBarChart2 size={16} />
          <span>Reports &amp; At-Risk Analytics</span>
        </button>
      </ScrollableTabs>

      {/* ── 4. Active Tab Content ────────────────────────────────────────── */}
      <div>
        {activeTab === 'student-attendance' && <StudentAttendanceTab />}
        {activeTab === 'teacher-attendance' && <TeacherAttendanceTab />}
        {activeTab === 'student-leaves' && <StudentLeavesTab />}
        {activeTab === 'teacher-leaves' && <TeacherLeavesTab />}
        {activeTab === 'reports' && <AttendanceReportsTab />}
      </div>
    </div>
  )
}
