import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Briefcase,
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Settings,
  DollarSign,
  Calendar,
  CreditCard,
  Printer,
  Edit,
  CalendarCheck,
} from 'lucide-react'
import { teacherStore } from '@/data/stores'
import {
  STATUS_LABELS,
  DESIGNATION_LABELS,
} from '../features/teachers/types'
import { BasicInfoTab }       from '../features/teachers/components/drawer-tabs/BasicInfoTab'
import { EmploymentTab }      from '../features/teachers/components/drawer-tabs/EmploymentTab'
import { AcademicTab }        from '../features/teachers/components/drawer-tabs/AcademicTab'
import { AssignmentTab }      from '../features/teachers/components/drawer-tabs/AssignmentTab'
import { TrainingTab }        from '../features/teachers/components/drawer-tabs/TrainingTab'
import { DocumentsTab }       from '../features/teachers/components/drawer-tabs/DocumentsTab'
import { ScrollableTabs }     from '@/components/ui/ScrollableTabs'
import { SystemTab }          from '../features/teachers/components/drawer-tabs/SystemTab'
import { SalaryHistoryTab }   from '../features/teachers/components/drawer-tabs/SalaryHistoryTab'
import { ScheduleRoutineTab } from '../features/teachers/components/drawer-tabs/ScheduleRoutineTab'
import { TeacherIdCardModal } from '../features/teachers/components/modals/TeacherIdCardModal'
import { useTeachers }        from '../features/teachers/useTeachers'
import { AddTeacherModal }    from '../features/teachers/components/AddTeacherModal'
import { useTeacherRoutine }  from '@/features/routines/hooks/useRoutine'
import { formatCurrency }     from '@/features/payments/types'
import { ProfileHeroBanner }  from '@/features/profile/components/ProfileHeroBanner'
import { ProfileKpiGrid, type ProfileKpiItem } from '@/features/profile/components/ProfileKpiGrid'
import { getTeacherFacultyMetrics } from '@/features/profile/utils/userProfileData'

const TABS = [
  { id: 'basic',      label: 'Overview & Bio',    icon: User },
  { id: 'schedule',   label: 'Class Routine',     icon: Calendar },
  { id: 'salary',     label: 'Salary & Payroll',  icon: DollarSign },
  { id: 'assignment', label: 'Assigned Classes',  icon: BookOpen },
  { id: 'employment', label: 'Employment',        icon: Briefcase },
  { id: 'academic',   label: 'Academic Profile',  icon: GraduationCap },
  { id: 'training',   label: 'Workshops & CPD',   icon: Award },
  { id: 'documents',  label: 'Documents',         icon: FileText },
  { id: 'system',     label: 'Account System',    icon: Settings },
  { id: 'idcard',     label: 'Faculty ID Card',   icon: CreditCard },
] as const

type TabId = (typeof TABS)[number]['id']

function getInitials(name?: string, fallback = 'TC'): string {
  if (!name) return fallback
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const inits = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return inits || fallback
}

export function TeacherProfile() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [refreshKey, setRefreshKey] = useState(0)
  const [idCardOpen, setIdCardOpen] = useState(false)

  const {
    isModalOpen, openEditModal, closeModal,
    formData, updateFormData,
    currentStep, nextStep, prevStep,
    submitTeacher, editingTeacherId,
  } = useTeachers()

  const teacher = useMemo(() => {
    if (!teacherId) return undefined
    const direct = teacherStore.getOne(teacherId)
    if (direct) return direct
    return teacherStore.getAll().find(
      t =>
        t.id === teacherId ||
        t.teacherId?.toLowerCase() === teacherId.toLowerCase() ||
        t.employeeId?.toLowerCase() === teacherId.toLowerCase()
    )
  }, [teacherId, refreshKey])

  const { data: teacherRoutines = [] } = useTeacherRoutine(teacherId ?? '')

  const metrics = useMemo(() => {
    return teacher ? getTeacherFacultyMetrics(teacher.id) : null
  }, [teacher, refreshKey])

  const handleEditSubmit = useCallback(() => {
    submitTeacher()
    setRefreshKey(k => k + 1)
  }, [submitTeacher])

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-800">
        <User size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium text-zinc-600">Teacher not found</p>
        <button
          onClick={() => navigate('/teachers')}
          className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Teachers
        </button>
      </div>
    )
  }

  const deptName = teacher.department
    ? teacher.department.replace(/_/g, ' ')
    : (teacher.specialization || 'General')

  const designationText = DESIGNATION_LABELS[teacher.designation] || 'Faculty Member'

  // Teacher KPIs
  const teacherKpis: ProfileKpiItem[] = [
    {
      title: 'Monthly Compensation',
      value: metrics ? formatCurrency(metrics.baseSalary) : '৳28,000',
      subtitle: 'Base Salary + Allowances',
      icon: DollarSign,
    },
    {
      title: 'Weekly Teaching Load',
      value: `${teacherRoutines.length} ${teacherRoutines.length === 1 ? 'Period' : 'Periods'} / Wk`,
      subtitle: 'Active Scheduled Timetable',
      icon: Calendar,
    },
    {
      title: 'Faculty Attendance',
      value: metrics ? `${metrics.attendanceRate}% Logged` : '98%',
      subtitle: 'Verified Staff Attendance',
      icon: CalendarCheck,
    },
    {
      title: 'Department & Specialty',
      value: deptName,
      subtitle: designationText,
      icon: BookOpen,
    },
  ]

  return (
    <>
      <div className="space-y-6 pb-14">
        {/* ── Top Back & Breadcrumb Bar ─────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/teachers')}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Faculty Directory
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Faculty 360° Management Hub
            </span>
          </div>
        </div>

        {/* ── Hero Profile Master Card (Fixed Avatar Overlap via ProfileHeroBanner) ── */}
        <ProfileHeroBanner
          fullName={teacher.fullName}
          banglaName={teacher.nameBangla}
          subtitle={`${designationText} · Dept of ${deptName}`}
          avatarUrl={teacher.profilePhoto}
          initials={getInitials(teacher.fullName, 'TC')}
          roleBadgeText={`Faculty · ${deptName}`}
          roleColor="bg-indigo-50 text-indigo-800 border-indigo-200"
          statusText={STATUS_LABELS[teacher.employmentStatus] || 'Active'}
          statusVariant={teacher.employmentStatus === 'ACTIVE' ? 'success' : 'warning'}
          sessionText="Academic Year 2026"
          metaChips={[
            { label: 'Teacher ID', value: teacher.teacherId || teacher.id, isMono: true, highlight: true },
            { label: 'Designation', value: designationText },
            { label: 'Department', value: deptName },
            { label: 'Type', value: teacher.employmentType || 'Permanent' },
            { label: 'Joined', value: teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString('en-BD') : '2024' },
          ]}
          contacts={{
            mobile: teacher.phone,
            email: teacher.email,
            whatsapp: teacher.whatsapp || teacher.phone,
            location: teacher.presentAddress,
          }}
          primaryAction={{
            label: 'Pay Slip & Salary',
            icon: DollarSign,
            onClick: () => setActiveTab('salary'),
          }}
          secondaryActions={[
            {
              label: 'Class Routine',
              icon: Calendar,
              onClick: () => setActiveTab('schedule'),
              color: 'text-indigo-600',
            },
            {
              label: 'Faculty ID Card',
              icon: CreditCard,
              onClick: () => setIdCardOpen(true),
              color: 'text-zinc-700',
            },
            {
              label: 'Edit Profile',
              icon: Edit,
              onClick: () => openEditModal(teacher),
              color: 'text-zinc-600',
            },
          ]}
        />

        {/* ── Dynamic KPI Summary Strip ───────────────────── */}
        <ProfileKpiGrid items={teacherKpis} />

        {/* ── Tab Navigation Bar ──────────────────────────── */}
        <ScrollableTabs className="w-full" trackClassName="bg-white border border-zinc-200/90 rounded-2xl p-1.5 shadow-xs gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                {tab.label}
              </button>
            )
          })}
        </ScrollableTabs>

        {/* ── Tab Content Panels ──────────────────────────── */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm">
          {activeTab === 'basic'      && <BasicInfoTab teacher={teacher} />}
          {activeTab === 'schedule'   && <ScheduleRoutineTab teacher={teacher} />}
          {activeTab === 'salary'     && <SalaryHistoryTab teacher={teacher} />}
          {activeTab === 'assignment' && <AssignmentTab teacher={teacher} />}
          {activeTab === 'employment' && <EmploymentTab teacher={teacher} />}
          {activeTab === 'academic'   && <AcademicTab teacher={teacher} />}
          {activeTab === 'training'   && <TrainingTab teacher={teacher} />}
          {activeTab === 'documents'  && <DocumentsTab teacher={teacher} />}
          {activeTab === 'system'     && <SystemTab teacher={teacher} />}
          {activeTab === 'idcard'     && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                <CreditCard size={32} />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900">Faculty Smart Credential Card</h3>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-6">
                Official institution identification card for {teacher.fullName}.
              </p>
              <button
                onClick={() => setIdCardOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
              >
                <Printer size={15} /> Launch Faculty ID Preview & Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TeacherIdCardModal
        open={idCardOpen}
        teacher={teacher}
        onClose={() => setIdCardOpen(false)}
      />

      <AddTeacherModal
        isOpen={isModalOpen}
        isEdit={!!editingTeacherId}
        onClose={closeModal}
        onSubmit={handleEditSubmit}
        formData={formData}
        onChange={updateFormData}
        currentStep={currentStep}
        onNext={nextStep}
        onPrev={prevStep}
      />
    </>
  )
}
