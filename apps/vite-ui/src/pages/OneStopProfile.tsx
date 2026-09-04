import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  User,
  Shield,
  GraduationCap,
  Briefcase,
  Award,
  CalendarCheck,
  Wallet,
  BookOpen,
  Calendar,
  Lock,
  Activity,
  Printer,
  Sparkles,
  CreditCard,
  Zap,
  Edit,
  DollarSign,
  Users,
  School,
  ShieldCheck,
} from 'lucide-react'

// Stores & State
import { useAuthStore } from '../store/auth'
import { useProfileStore } from '../store/profile'
import { studentStore, teacherStore } from '@/data/stores'

// Dynamic Profile Engine
import {
  getStudentFinancialMetrics,
  getTeacherFacultyMetrics,
  getAdminInstitutionMetrics,
} from '@/features/profile/utils/userProfileData'

// Reusable Components
import { ProfileHeroBanner } from '@/features/profile/components/ProfileHeroBanner'
import { ProfileKpiGrid, type ProfileKpiItem } from '@/features/profile/components/ProfileKpiGrid'
import { AvatarUpload } from '@/features/profile/components/AvatarUpload'
import { PersonalInfoForm } from '@/features/profile/components/PersonalInfoForm'
import { PasswordChangeForm } from '@/features/profile/components/PasswordChangeForm'
import { ActivityLog } from '@/features/profile/components/ActivityLog'

// Tabs and Modals
import { ProfileTab as StudentBioTab } from '@/features/students/components/drawer-tabs/ProfileTab'
import { ResultsTab } from '@/features/students/components/drawer-tabs/ResultsTab'
import { AttendanceTab } from '@/features/students/components/drawer-tabs/AttendanceTab'
import { FeesTab } from '@/features/students/components/drawer-tabs/FeesTab'
import { StudentIdCardModal } from '@/features/students/components/modals/StudentIdCardModal'
import { StudentReportCardModal } from '@/features/students/components/modals/StudentReportCardModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'

// Teacher Tabs
import { BasicInfoTab as TeacherBioTab } from '@/features/teachers/components/drawer-tabs/BasicInfoTab'
import { ScheduleRoutineTab } from '@/features/teachers/components/drawer-tabs/ScheduleRoutineTab'
import { SalaryHistoryTab } from '@/features/teachers/components/drawer-tabs/SalaryHistoryTab'
import { AssignmentTab } from '@/features/teachers/components/drawer-tabs/AssignmentTab'
import { TeacherIdCardModal } from '@/features/teachers/components/modals/TeacherIdCardModal'

// Types
type ActiveRoleView = 'ADMIN' | 'TEACHER' | 'STUDENT'
type StudentTabKey = 'overview' | 'results' | 'attendance' | 'fees' | 'idcard'
type TeacherTabKey = 'overview' | 'routine' | 'salary' | 'classes' | 'idcard'
type AdminTabKey = 'info' | 'stats' | 'security' | 'activity'

function getInitials(name?: string, fallback = 'U'): string {
  if (!name) return fallback
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const inits = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return inits || fallback
}

export function OneStopProfile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const adminProfile = useProfileStore()

  // All Available Students & Teachers for selector
  const allStudents = useMemo(() => studentStore.getAll(), [])
  const allTeachers = useMemo(() => teacherStore.getAll(), [])

  // Active Role State (defaults to current user role, or query param)
  const initialRole = (searchParams.get('role')?.toUpperCase() as ActiveRoleView) || user?.role || 'ADMIN'
  const [activeRole, setActiveRole] = useState<ActiveRoleView>(initialRole)

  // Selected Student ID for Student View
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    searchParams.get('studentId') || allStudents[0]?.id || '1'
  )

  // Selected Teacher ID for Teacher View
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    searchParams.get('teacherId') || allTeachers[0]?.id || 't-001'
  )

  // Tab States
  const [studentTab, setStudentTab] = useState<StudentTabKey>('overview')
  const [teacherTab, setTeacherTab] = useState<TeacherTabKey>('overview')
  const [adminTab, setAdminTab] = useState<AdminTabKey>('info')

  // Modals
  const [idCardOpen, setIdCardOpen] = useState(false)
  const [reportCardOpen, setReportCardOpen] = useState(false)
  const [quickCollectOpen, setQuickCollectOpen] = useState(false)
  const [teacherIdCardOpen, setTeacherIdCardOpen] = useState(false)

  // Current Student Entity from student list
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === selectedStudentId) || allStudents[0]
  }, [allStudents, selectedStudentId])

  // Current Teacher Entity
  const currentTeacher = useMemo(() => {
    return allTeachers.find(t => t.id === selectedTeacherId) || allTeachers[0]
  }, [allTeachers, selectedTeacherId])

  // Dynamic Metrics Derivations
  const studentFinance = useMemo(() => {
    return currentStudent ? getStudentFinancialMetrics(currentStudent.id) : null
  }, [currentStudent])

  const teacherMetrics = useMemo(() => {
    return currentTeacher ? getTeacherFacultyMetrics(currentTeacher.id) : null
  }, [currentTeacher])

  const adminMetrics = useMemo(() => {
    return getAdminInstitutionMetrics()
  }, [])

  // Helper to change role preview
  const handleRoleChange = (role: ActiveRoleView) => {
    setActiveRole(role)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('role', role)
    setSearchParams(newParams, { replace: true })
  }

  // ── Render Role Selector Bar ──────────────────────────────────────────
  const renderRoleSwitcherToolbar = () => (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Role Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
        <button
          onClick={() => handleRoleChange('ADMIN')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeRole === 'ADMIN'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Shield size={14} className={activeRole === 'ADMIN' ? 'text-indigo-600' : 'text-zinc-400'} />
          Admin Hub
        </button>

        <button
          onClick={() => handleRoleChange('TEACHER')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeRole === 'TEACHER'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Briefcase size={14} className={activeRole === 'TEACHER' ? 'text-indigo-600' : 'text-zinc-400'} />
          Teacher View
        </button>

        <button
          onClick={() => handleRoleChange('STUDENT')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeRole === 'STUDENT'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <GraduationCap size={14} className={activeRole === 'STUDENT' ? 'text-indigo-600' : 'text-zinc-400'} />
          Student View
        </button>
      </div>

      {/* Target User Switcher for Preview */}
      <div className="flex items-center gap-2">
        {activeRole === 'STUDENT' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Preview Student:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullNameEn} (Roll {s.rollNumber} · {s.className})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeRole === 'TEACHER' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Preview Faculty:</span>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {allTeachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.designation?.replace(/_/g, ' ') || 'Teacher'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 px-2 py-1 bg-zinc-50 rounded-lg border border-zinc-100">
          <Sparkles size={12} className="text-amber-500" />
          <span>Role-Adaptive Profile Hub</span>
        </div>
      </div>
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────
  // 1. STUDENT VIEW
  // ──────────────────────────────────────────────────────────────────────
  const renderStudentView = () => {
    if (!currentStudent) return null

    // 4 Executive State Cards strictly derived from actual student list data
    const studentKpis: ProfileKpiItem[] = [
      {
        title: 'Class & Section',
        value: `${currentStudent.className || 'Class 10'} · Sec ${currentStudent.sectionName || 'A'}`,
        subtitle: `Roll: ${currentStudent.rollNumber} · ${currentStudent.type === 'REGULAR' ? 'Regular Track' : 'Exam Batch'}`,
        icon: GraduationCap,
        badge: currentStudent.status === 'ACTIVE' ? 'Active' : undefined,
      },
      {
        title: 'Curriculum & Shift',
        value: `${currentStudent.groupId || 'General'}`,
        subtitle: `${currentStudent.shift ? currentStudent.shift.charAt(0) + currentStudent.shift.slice(1).toLowerCase() : 'Morning'} Shift · ${currentStudent.version ? currentStudent.version.charAt(0) + currentStudent.version.slice(1).toLowerCase() + ' Medium' : 'Bangla'}`,
        icon: BookOpen,
      },
      {
        title: 'Student ID & Reg',
        value: currentStudent.studentId || currentStudent.id,
        subtitle: `Reg: ${currentStudent.registrationNumber || currentStudent.studentId} · Session ${currentStudent.session || '2024'}`,
        icon: CreditCard,
      },
      {
        title: 'Account Ledger',
        value: studentFinance?.status === 'CLEARED' ? 'Cleared ✓' : `৳${studentFinance?.totalDue.toLocaleString()} Due`,
        subtitle: studentFinance?.status === 'CLEARED' ? 'No pending dues' : 'Tuition payment pending',
        icon: Wallet,
        badge: studentFinance?.status === 'CLEARED' ? 'Cleared' : 'Due',
      },
    ]

    const academicLabel =
      currentStudent.type === 'REGULAR'
        ? [currentStudent.className, currentStudent.sectionName && `Section ${currentStudent.sectionName}`, currentStudent.groupId].filter(Boolean).join(' · ')
        : [currentStudent.batchName, currentStudent.targetExam && `Target: ${currentStudent.targetExam}`].filter(Boolean).join(' · ')

    const studentTabs: { id: StudentTabKey; label: string; icon: React.ElementType }[] = [
      { id: 'overview',   label: 'Overview & Bio', icon: User },
      { id: 'results',    label: 'Academic Results', icon: Award },
      { id: 'attendance', label: 'Attendance & Log', icon: CalendarCheck },
      { id: 'fees',       label: 'Fees & Invoices', icon: Wallet },
      { id: 'idcard',     label: 'Digital ID Card', icon: CreditCard },
    ]

    return (
      <div className="space-y-6">
        {/* Hero Header Banner */}
        <ProfileHeroBanner
          fullName={currentStudent.fullNameEn}
          banglaName={currentStudent.fullNameBn}
          subtitle={`${academicLabel} · Session: ${currentStudent.session || '2024'}`}
          avatarUrl={currentStudent.profilePhoto}
          initials={getInitials(currentStudent.fullNameEn, 'ST')}
          roleBadgeText={`Student · ${currentStudent.className || 'Class 10'}`}
          roleColor="bg-emerald-50 text-emerald-800 border-emerald-200"
          statusText={currentStudent.status || 'Active'}
          statusVariant="success"
          sessionText={`Session: ${currentStudent.session || '2024'}`}
          metaChips={[
            { label: 'Class', value: currentStudent.className || 'Class 10', highlight: true },
            { label: 'Section', value: currentStudent.sectionName || 'A' },
            { label: 'Roll No', value: currentStudent.rollNumber, isMono: true },
            { label: 'Student ID', value: currentStudent.studentId || currentStudent.id, isMono: true },
            { label: 'Blood Group', value: currentStudent.bloodGroup || 'Not Specified' },
            { label: 'Shift', value: currentStudent.shift || 'Morning' },
          ]}
          contacts={{
            mobile: currentStudent.mobile || currentStudent.father?.mobile,
            email: currentStudent.email,
            whatsapp: currentStudent.whatsapp || currentStudent.mobile,
            location: currentStudent.presentAddress,
          }}
          primaryAction={{
            label: 'Collect Fee',
            icon: Zap,
            onClick: () => setQuickCollectOpen(true),
          }}
          secondaryActions={[
            {
              label: 'Student ID Card',
              icon: CreditCard,
              onClick: () => setStudentTab('idcard'),
              color: 'text-indigo-600',
            },
            {
              label: 'Report Card',
              icon: Printer,
              onClick: () => setReportCardOpen(true),
              color: 'text-zinc-700',
            },
          ]}
        />

        {/* Executive State Cards */}
        <ProfileKpiGrid items={studentKpis} />

        {/* Tab Navigation Bar */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-1.5 shadow-xs flex items-center overflow-x-auto scrollbar-none gap-1">
          {studentTabs.map(tab => {
            const Icon = tab.icon
            const isActive = studentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStudentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-6 shadow-sm">
          {studentTab === 'overview' && (
            <StudentBioTab student={currentStudent} />
          )}

          {studentTab === 'results' && (
            <ResultsTab student={currentStudent} />
          )}

          {studentTab === 'attendance' && (
            <AttendanceTab student={currentStudent} />
          )}

          {studentTab === 'fees' && (
            <FeesTab student={currentStudent} />
          )}

          {studentTab === 'idcard' && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="max-w-md w-full bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                <div className="w-full max-w-[320px] rounded-2xl border-2 border-slate-900 overflow-hidden bg-white shadow-md mb-6">
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <School size={16} />
                      <h4 className="text-xs font-black uppercase tracking-wider">Estudy Model Academy</h4>
                    </div>
                    <p className="text-[9px] text-emerald-200 uppercase tracking-widest font-semibold">Official Student Identity Card</p>
                  </div>

                  <div className="p-4 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-3 border-emerald-700 bg-zinc-100 flex items-center justify-center text-emerald-800 text-xl font-black shadow-sm overflow-hidden mb-2">
                      {currentStudent.profilePhoto ? (
                        <img src={currentStudent.profilePhoto} alt={currentStudent.fullNameEn} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(currentStudent.fullNameEn)
                      )}
                    </div>

                    <h5 className="text-sm font-black text-zinc-900">{currentStudent.fullNameEn}</h5>
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 my-1">
                      {currentStudent.className} · Roll {currentStudent.rollNumber}
                    </span>

                    <table className="w-full text-[11px] text-left mt-2 border-t border-zinc-100 pt-2">
                      <tbody>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Student ID:</td>
                          <td className="py-0.5 font-bold font-mono text-zinc-900 text-right">{currentStudent.studentId}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Blood Group:</td>
                          <td className="py-0.5 font-bold font-mono text-rose-600 text-right">{currentStudent.bloodGroup || 'Not Specified'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Guardian Phone:</td>
                          <td className="py-0.5 font-bold font-mono text-zinc-900 text-right">{currentStudent.father?.mobile || currentStudent.mobile}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Academic Session:</td>
                          <td className="py-0.5 font-bold font-mono text-zinc-900 text-right">{currentStudent.session || '2024'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-zinc-100 px-4 py-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-200">
                    <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-600" /> Verified Record</span>
                    <span className="font-mono">VALID 2024-2025</span>
                  </div>
                </div>

                <button
                  onClick={() => setIdCardOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
                >
                  <Printer size={15} /> Print High-Res Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <StudentIdCardModal
          open={idCardOpen}
          student={currentStudent}
          onClose={() => setIdCardOpen(false)}
        />

        <StudentReportCardModal
          open={reportCardOpen}
          student={currentStudent}
          onClose={() => setReportCardOpen(false)}
        />

        <QuickCollectModal
          open={quickCollectOpen}
          preselectedStudent={currentStudent}
          onClose={() => setQuickCollectOpen(false)}
        />
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────
  // 2. TEACHER VIEW
  // ──────────────────────────────────────────────────────────────────────
  const renderTeacherView = () => {
    if (!currentTeacher) return null

    const teacherKpis: ProfileKpiItem[] = [
      {
        title: 'Monthly Compensation',
        value: teacherMetrics ? `৳${teacherMetrics.baseSalary.toLocaleString()}` : '৳28,000',
        subtitle: 'Base Salary + Allowance',
        icon: DollarSign,
      },
      {
        title: 'Weekly Teaching Load',
        value: `${teacherMetrics?.weeklyRoutineCount || 0} Periods / Wk`,
        subtitle: 'Classroom Schedule Allocation',
        icon: Calendar,
      },
      {
        title: 'Faculty Attendance',
        value: `${teacherMetrics?.attendanceRate || 98}% Logged`,
        subtitle: 'Academic Year Presence',
        icon: CalendarCheck,
      },
      {
        title: 'Department & Role',
        value: teacherMetrics?.assignedDept || 'General',
        subtitle: teacherMetrics?.designationText || 'Faculty Member',
        icon: BookOpen,
      },
    ]

    const teacherTabs: { id: TeacherTabKey; label: string; icon: React.ElementType }[] = [
      { id: 'overview', label: 'Faculty Bio', icon: User },
      { id: 'routine',  label: 'Class Routine', icon: Calendar },
      { id: 'salary',   label: 'Salary & Payroll', icon: DollarSign },
      { id: 'classes',  label: 'Assigned Classes', icon: BookOpen },
      { id: 'idcard',   label: 'Faculty ID Card', icon: CreditCard },
    ]

    return (
      <div className="space-y-6">
        {/* Hero Header Banner */}
        <ProfileHeroBanner
          fullName={currentTeacher.fullName}
          banglaName={currentTeacher.nameBangla}
          subtitle={`${teacherMetrics?.designationText || 'Senior Lecturer'} · Dept of ${teacherMetrics?.assignedDept || 'Faculty'}`}
          avatarUrl={currentTeacher.profilePhoto}
          initials={getInitials(currentTeacher.fullName, 'TC')}
          roleBadgeText={`Faculty · ${teacherMetrics?.assignedDept || 'General'}`}
          roleColor="bg-indigo-50 text-indigo-800 border-indigo-200"
          statusText={currentTeacher.employmentStatus || 'Active'}
          statusVariant="success"
          sessionText="Session 2026"
          metaChips={[
            { label: 'Teacher ID', value: currentTeacher.teacherId || currentTeacher.id, isMono: true, highlight: true },
            { label: 'Designation', value: currentTeacher.designation?.replace(/_/g, ' ') || 'Lecturer' },
            { label: 'Department', value: teacherMetrics?.assignedDept || 'General' },
            { label: 'Type', value: currentTeacher.employmentType || 'Permanent' },
          ]}
          contacts={{
            mobile: currentTeacher.phone,
            email: currentTeacher.email,
            whatsapp: currentTeacher.whatsapp || currentTeacher.phone,
            location: currentTeacher.presentAddress,
          }}
          primaryAction={{
            label: 'Faculty ID Card',
            icon: CreditCard,
            onClick: () => setTeacherIdCardOpen(true),
          }}
          secondaryActions={[
            {
              label: 'Class Routine',
              icon: Calendar,
              onClick: () => setTeacherTab('routine'),
              color: 'text-indigo-600',
            },
            {
              label: 'Pay Slip',
              icon: DollarSign,
              onClick: () => setTeacherTab('salary'),
              color: 'text-emerald-600',
            },
          ]}
        />

        {/* Executive State Cards */}
        <ProfileKpiGrid items={teacherKpis} />

        {/* Tab Navigation Bar */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-1.5 shadow-xs flex items-center overflow-x-auto scrollbar-none gap-1">
          {teacherTabs.map(tab => {
            const Icon = tab.icon
            const isActive = teacherTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTeacherTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-6 shadow-sm">
          {teacherTab === 'overview' && (
            <TeacherBioTab teacher={currentTeacher} />
          )}

          {teacherTab === 'routine' && (
            <ScheduleRoutineTab teacher={currentTeacher} />
          )}

          {teacherTab === 'salary' && (
            <SalaryHistoryTab teacher={currentTeacher} />
          )}

          {teacherTab === 'classes' && (
            <AssignmentTab teacher={currentTeacher} />
          )}

          {teacherTab === 'idcard' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                <CreditCard size={32} />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900">Faculty Smart Identity Card</h3>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-6">
                Official institution credential badge for {currentTeacher.fullName}.
              </p>
              <button
                onClick={() => setTeacherIdCardOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
              >
                <Printer size={15} /> Launch Faculty ID Preview & Print
              </button>
            </div>
          )}
        </div>

        <TeacherIdCardModal
          open={teacherIdCardOpen}
          teacher={currentTeacher}
          onClose={() => setTeacherIdCardOpen(false)}
        />
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────
  // 3. ADMIN VIEW
  // ──────────────────────────────────────────────────────────────────────
  const renderAdminView = () => {
    const adminKpis: ProfileKpiItem[] = [
      {
        title: 'Enrolled Students',
        value: `${adminMetrics.totalStudents} Students`,
        subtitle: 'All Classes & Academic Branches',
        icon: GraduationCap,
      },
      {
        title: 'Faculty & Staff',
        value: `${adminMetrics.activeTeachers} Faculty`,
        subtitle: '100% Positions Active',
        icon: Users,
      },
      {
        title: 'Institutional Collections',
        value: `৳${adminMetrics.totalRevenue.toLocaleString()}`,
        subtitle: 'Total Completed Payments',
        icon: Wallet,
      },
      {
        title: 'System Access',
        value: 'Super Admin',
        subtitle: 'Full System Control & Audit',
        icon: Shield,
      },
    ]

    const adminTabs: { id: AdminTabKey; label: string; icon: React.ElementType }[] = [
      { id: 'info',     label: 'Personal Information', icon: User },
      { id: 'stats',    label: 'Command Center', icon: Activity },
      { id: 'security', label: 'Security & Password', icon: Lock },
      { id: 'activity', label: 'Recent Activity Log', icon: Activity },
    ]

    return (
      <div className="space-y-6">
        {/* Hero Header Banner */}
        <ProfileHeroBanner
          fullName={adminProfile.fullName || 'Institutional Administrator'}
          subtitle={`Administrator · ${adminProfile.email}`}
          avatarUrl={adminProfile.avatarUrl}
          initials={getInitials(adminProfile.fullName, 'AD')}
          roleBadgeText="Super Admin"
          roleColor="bg-purple-50 text-purple-800 border-purple-200"
          statusText="System Active"
          statusVariant="success"
          sessionText="Session 2026"
          metaChips={[
            { label: 'Role', value: adminProfile.role || 'Super Admin', highlight: true },
            { label: 'Email', value: adminProfile.email },
            { label: 'Privileges', value: 'Root / Full Access' },
            { label: '2FA', value: 'Configured' },
          ]}
          contacts={{
            mobile: adminProfile.phone,
            email: adminProfile.email,
            location: 'Dhaka Central Campus Administrative Wing',
          }}
          primaryAction={{
            label: 'System Audit Log',
            icon: Activity,
            onClick: () => setAdminTab('activity'),
          }}
          secondaryActions={[
            {
              label: 'Edit Info',
              icon: Edit,
              onClick: () => setAdminTab('info'),
              color: 'text-indigo-600',
            },
            {
              label: 'Change Password',
              icon: Lock,
              onClick: () => setAdminTab('security'),
              color: 'text-amber-600',
            },
          ]}
        />

        {/* Executive State Cards */}
        <ProfileKpiGrid items={adminKpis} />

        {/* Tab Navigation Bar */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1">
          {adminTabs.map(tab => {
            const Icon = tab.icon
            const isActive = adminTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {adminTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <User size={16} className="text-indigo-600" /> Account Avatar
                </h3>
                <AvatarUpload />
              </div>
              <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Edit size={16} className="text-indigo-600" /> Personal & Contact Details
                </h3>
                <PersonalInfoForm />
              </div>
            </div>
          )}

          {adminTab === 'stats' && (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">Institutional Command Center</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Real-time telemetry across academic branches and faculty.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  All Systems Operational
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <p className="text-xs font-semibold text-zinc-500">Student Enrollment</p>
                  <p className="text-xl font-black text-zinc-900 font-mono mt-1">{adminMetrics.totalStudents} Students</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">Across all regular & batch classes</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <p className="text-xs font-semibold text-zinc-500">Teaching Staff</p>
                  <p className="text-xl font-black text-zinc-900 font-mono mt-1">{adminMetrics.activeTeachers} Faculty</p>
                  <p className="text-[11px] text-indigo-700 font-medium mt-1">Full-time & specialist lecturers</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <p className="text-xs font-semibold text-zinc-500">Total Collections</p>
                  <p className="text-xl font-black text-zinc-900 font-mono mt-1">৳{adminMetrics.totalRevenue.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">Audited and reconciled</p>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'security' && (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm max-w-2xl">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Lock size={16} className="text-indigo-600" /> Account Security & Password
              </h3>
              <PasswordChangeForm />
            </div>
          )}

          {adminTab === 'activity' && (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-indigo-600" /> Recent Administrative Activity Log
              </h3>
              <ActivityLog />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Role Switcher Bar ──────────────────────────── */}
      {renderRoleSwitcherToolbar()}

      {/* ── Role Specific Content ──────────────────────────── */}
      {activeRole === 'STUDENT' && renderStudentView()}
      {activeRole === 'TEACHER' && renderTeacherView()}
      {activeRole === 'ADMIN' && renderAdminView()}
    </div>
  )
}
