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
  Phone,
  Mail,
  MapPin,
  Edit,
  DollarSign,
  Calendar,
  CreditCard,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Teacher } from '../features/teachers/types'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DESIGNATION_LABELS,
} from '../features/teachers/types'
import { BasicInfoTab }       from '../features/teachers/components/drawer-tabs/BasicInfoTab'
import { EmploymentTab }      from '../features/teachers/components/drawer-tabs/EmploymentTab'
import { AcademicTab }        from '../features/teachers/components/drawer-tabs/AcademicTab'
import { AssignmentTab }      from '../features/teachers/components/drawer-tabs/AssignmentTab'
import { TrainingTab }        from '../features/teachers/components/drawer-tabs/TrainingTab'
import { DocumentsTab }       from '../features/teachers/components/drawer-tabs/DocumentsTab'
import { SystemTab }          from '../features/teachers/components/drawer-tabs/SystemTab'
import { SalaryHistoryTab }   from '../features/teachers/components/drawer-tabs/SalaryHistoryTab'
import { ScheduleRoutineTab } from '../features/teachers/components/drawer-tabs/ScheduleRoutineTab'
import { TeacherIdCardModal } from '../features/teachers/components/modals/TeacherIdCardModal'
import { useTeachers }        from '../features/teachers/useTeachers'
import { AddTeacherModal }    from '../features/teachers/components/AddTeacherModal'
import { useTeacherRoutine }  from '@/features/routines/hooks/useRoutine'
import { teacherSalarySettingStore } from '@/data/stores'
import { formatCurrency }     from '@/features/payments/types'

const teacherStore = createStore<Teacher>('teachers')

const TABS = [
  { id: 'basic',      label: 'Overview & Bio',    icon: User },
  { id: 'salary',     label: 'Salary & Payroll',  icon: DollarSign },
  { id: 'schedule',   label: 'Class Routine',     icon: Calendar },
  { id: 'employment', label: 'Employment',        icon: Briefcase },
  { id: 'academic',   label: 'Academic Profile',  icon: GraduationCap },
  { id: 'assignment', label: 'Assigned Classes',  icon: BookOpen },
  { id: 'training',   label: 'Workshops & CPD',   icon: Award },
  { id: 'documents',  label: 'Documents',         icon: FileText },
  { id: 'system',     label: 'Account System',    icon: Settings },
] as const

type TabId = (typeof TABS)[number]['id']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarGradient(id: string) {
  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-rose-600 to-red-600',
    'from-cyan-600 to-blue-600',
  ]
  return gradients[id.charCodeAt(id.length - 1) % gradients.length]
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

  const handleEditSubmit = useCallback(() => {
    submitTeacher()
    setRefreshKey(k => k + 1)
  }, [submitTeacher])

  // Salary information
  const salarySetting = useMemo(() => {
    if (!teacher) return null
    return teacherSalarySettingStore.getAll().find(s => s.teacher_id === teacher.id)
  }, [teacher])

  const baseSalary = salarySetting?.base_salary || 25000

  const handleWhatsApp = () => {
    const contactNumber = teacher?.phone || teacher?.whatsapp
    if (!contactNumber) {
      alert('No contact phone available for teacher.')
      return
    }
    const cleanNumber = contactNumber.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`}?text=Assalamu%20Alaikum,%20Teacher%20${encodeURIComponent(teacher?.fullName ?? '')}.`
    window.open(url, '_blank')
  }

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

  const gradient = getAvatarGradient(teacher.id)

  return (
    <>
      <div className="space-y-6 pb-12">
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

        {/* ── Hero Profile Master Card ──────────────────── */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className={`h-36 bg-gradient-to-r ${gradient} relative overflow-hidden flex items-end p-6`}>
            <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
            <div className="relative z-10 flex items-center justify-between w-full text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-300" />
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                  Estudy International Model Academy • Faculty Profile
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                Teacher ID: {teacher.teacherId}
              </span>
            </div>
          </div>

          <div className="px-8 pb-6">
            {/* Avatar & Quick Action Bar Row */}
            <div className="flex flex-wrap items-end justify-between -mt-12 mb-6 gap-4">
              {/* Avatar */}
              <div className="flex items-end gap-5">
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white shrink-0 overflow-hidden`}>
                  {teacher.profilePhoto ? (
                    <img src={teacher.profilePhoto} alt={teacher.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(teacher.fullName)
                  )}
                </div>

                <div className="mb-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-black text-zinc-900">{teacher.fullName}</h1>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[teacher.employmentStatus]}`}>
                      {STATUS_LABELS[teacher.employmentStatus]}
                    </span>
                  </div>
                  {teacher.nameBangla && (
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{teacher.nameBangla}</p>
                  )}
                  <p className="text-xs text-indigo-900 font-bold mt-1">
                    {DESIGNATION_LABELS[teacher.designation]} • Dept: <span className="text-zinc-700 font-medium">{deptName}</span> • ID: <span className="font-mono text-zinc-600">{teacher.teacherId}</span>
                  </p>
                </div>
              </div>

              {/* 1-Click Fast Action Speed Bar */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <button
                  onClick={() => setActiveTab('salary')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
                >
                  <DollarSign size={14} /> Pay Slip & Salary
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <Calendar size={14} className="text-indigo-600" /> Class Routine
                </button>

                <button
                  onClick={() => setIdCardOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <CreditCard size={14} className="text-indigo-600" /> Faculty ID Card
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                  title="WhatsApp Direct Message"
                >
                  <MessageCircle size={14} className="text-emerald-600" /> WhatsApp
                </button>

                <button
                  onClick={() => openEditModal(teacher)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-all text-xs font-bold cursor-pointer"
                >
                  <Edit size={13} /> Edit
                </button>
              </div>
            </div>

            {/* ── Live KPI Summary Strip ───────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Monthly Compensation</p>
                <p className="text-sm font-extrabold text-indigo-900 font-mono mt-0.5">
                  {formatCurrency(baseSalary)}
                </p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Weekly Class Load</p>
                <p className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5">
                  {teacherRoutines.length} {teacherRoutines.length === 1 ? 'Period' : 'Periods'} / Wk
                </p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Monthly Attendance</p>
                <p className="text-sm font-extrabold text-blue-700 font-mono mt-0.5">
                  98% Logged
                </p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Blood Group</p>
                <p className="text-sm font-extrabold text-rose-600 mt-0.5">{teacher.bloodGroup || 'A+'}</p>
              </div>
            </div>

            {/* Contact Details Quick Row */}
            <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
              {teacher.phone && (
                <a href={`tel:${teacher.phone}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-medium">
                  <Phone size={13} className="text-zinc-400" /> {teacher.phone}
                </a>
              )}
              {teacher.email && (
                <a href={`mailto:${teacher.email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-medium">
                  <Mail size={13} className="text-zinc-400" /> {teacher.email}
                </a>
              )}
              {teacher.presentAddress && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin size={13} className="text-zinc-400" /> {teacher.presentAddress}
                </span>
              )}
              {teacher.joiningDate && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Briefcase size={13} className="text-zinc-400" /> Joined: {teacher.joiningDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Segmented Tab Navigation ───────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-zinc-200/80 rounded-2xl p-1.5 shadow-xs overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Active Tab Content Container ───────────────── */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs">
          {activeTab === 'basic'      && <BasicInfoTab teacher={teacher} />}
          {activeTab === 'salary'     && <SalaryHistoryTab teacher={teacher} />}
          {activeTab === 'schedule'   && <ScheduleRoutineTab teacher={teacher} />}
          {activeTab === 'employment' && <EmploymentTab teacher={teacher} />}
          {activeTab === 'academic'   && <AcademicTab teacher={teacher} />}
          {activeTab === 'assignment' && <AssignmentTab teacher={teacher} />}
          {activeTab === 'training'   && <TrainingTab teacher={teacher} />}
          {activeTab === 'documents'  && <DocumentsTab teacher={teacher} />}
          {activeTab === 'system'     && <SystemTab teacher={teacher} />}
        </div>
      </div>

      {/* ── Teacher ID Card Modal ──────────────────────── */}
      <TeacherIdCardModal
        open={idCardOpen}
        teacher={teacher}
        onClose={() => setIdCardOpen(false)}
      />

      {/* ── Edit Teacher Modal ─────────────────────────── */}
      <AddTeacherModal
        isOpen={isModalOpen}
        isEdit={!!editingTeacherId}
        onClose={closeModal}
        currentStep={currentStep}
        formData={formData}
        onChange={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        onSubmit={handleEditSubmit}
      />
    </>
  )
}
