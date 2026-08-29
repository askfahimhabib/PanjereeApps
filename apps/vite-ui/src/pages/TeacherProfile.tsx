import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Briefcase, GraduationCap, BookOpen, Award, FileText, Settings, Phone, Mail, MapPin, Edit } from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Teacher } from '../features/teachers/types'
import { STATUS_LABELS, STATUS_COLORS, DESIGNATION_LABELS, DEPARTMENT_LABELS, EMPLOYMENT_TYPE_LABELS, TEACHER_CATEGORY_COLORS } from '../features/teachers/types'
import { BasicInfoTab } from '../features/teachers/components/drawer-tabs/BasicInfoTab'
import { EmploymentTab } from '../features/teachers/components/drawer-tabs/EmploymentTab'
import { AcademicTab } from '../features/teachers/components/drawer-tabs/AcademicTab'
import { AssignmentTab } from '../features/teachers/components/drawer-tabs/AssignmentTab'
import { TrainingTab } from '../features/teachers/components/drawer-tabs/TrainingTab'
import { DocumentsTab } from '../features/teachers/components/drawer-tabs/DocumentsTab'
import { SystemTab } from '../features/teachers/components/drawer-tabs/SystemTab'
import { useTeachers } from '../features/teachers/useTeachers'
import { AddTeacherModal } from '../features/teachers/components/AddTeacherModal'

const teacherStore = createStore<Teacher>('teachers')

const TABS = [
  { id: 'basic', label: 'Overview', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'assignment', label: 'Assignments', icon: BookOpen },
  { id: 'training', label: 'Training', icon: Award },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'system', label: 'System', icon: Settings },
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

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="text-sm font-medium text-zinc-800 mt-0.5">{value || '—'}</p>
    </div>
  )
}

export function TeacherProfile() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    isModalOpen, openEditModal, closeModal,
    formData, updateFormData,
    currentStep, nextStep, prevStep, TOTAL_STEPS,
    submitTeacher, editingTeacherId,
  } = useTeachers()

  const teacher = useMemo(
    () => teacherStore.getOne(teacherId ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacherId, refreshKey]
  )

  const handleEditSubmit = useCallback(() => {
    submitTeacher()
    setRefreshKey(k => k + 1)
  }, [submitTeacher])

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-800">
        <User size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium text-zinc-600">Teacher not found</p>
        <button onClick={() => navigate('/teachers')} className="mt-4 flex items-center gap-2 text-sm text-indigo-400 hover:underline">
          <ArrowLeft size={14} /> Back to Teachers
        </button>
      </div>
    )
  }

  const gradient = getAvatarGradient(teacher.id)

  return (
    <>
      <div className="space-y-6">
      {/* ── Back button ─────────────────────────────── */}
      <button
        onClick={() => navigate('/teachers')}
        className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-800 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Teachers
      </button>

      {/* ── Hero Card ────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className={`h-28 bg-gradient-to-r ${gradient} opacity-20`} />

        <div className="px-6 pb-5">
          {/* Avatar + actions row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-slate-900 shrink-0 overflow-hidden`}>
              {teacher.profilePhoto
                ? <img src={teacher.profilePhoto} alt={teacher.fullName} className="w-full h-full object-cover" />
                : getInitials(teacher.fullName)
              }
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => openEditModal(teacher)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-zinc-100 text-zinc-600 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
              >
                <Edit size={13} /> Edit
              </button>
            </div>
          </div>

          {/* Name + badges */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{teacher.fullName}</h1>
              {teacher.nameBangla && <p className="text-sm text-zinc-600 mt-0.5">{teacher.nameBangla}</p>}
              <p className="text-sm text-zinc-600 mt-1">{DESIGNATION_LABELS[teacher.designation]}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[teacher.employmentStatus]}`}>
                {STATUS_LABELS[teacher.employmentStatus]}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${TEACHER_CATEGORY_COLORS[teacher.teacherCategory]}`}>
                {teacher.teacherCategory === 'REGULAR' ? 'Regular' : 'Guest'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 text-zinc-800 border border-zinc-100">
                {EMPLOYMENT_TYPE_LABELS[teacher.employmentType]}
              </span>
              {teacher.department && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {DEPARTMENT_LABELS[teacher.department]}
                </span>
              )}
            </div>
          </div>

          {/* Quick info chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <InfoChip label="Teacher ID" value={teacher.teacherId} />
            <InfoChip label="Designation" value={DESIGNATION_LABELS[teacher.designation]} />
            <InfoChip label="Join Date" value={teacher.joiningDate ?? '—'} />
            <InfoChip label="Experience" value={teacher.previousExperience?.length ? `${teacher.previousExperience.length} prev. role(s)` : '—'} />
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-zinc-100 text-sm text-zinc-600">
            <a href={`tel:${teacher.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
              <Phone size={13} /> {teacher.phone}
            </a>
            {teacher.email && (
              <a href={`mailto:${teacher.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <Mail size={13} /> {teacher.email}
              </a>
            )}
            {teacher.presentAddress && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {teacher.presentAddress}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-green-200'
                : 'text-zinc-500 hover:text-zinc-800'
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6">
        {activeTab === 'basic' && <BasicInfoTab teacher={teacher} />}
        {activeTab === 'employment' && <EmploymentTab teacher={teacher} />}
        {activeTab === 'academic' && <AcademicTab teacher={teacher} />}
        {activeTab === 'assignment' && <AssignmentTab teacher={teacher} />}
        {activeTab === 'training' && <TrainingTab teacher={teacher} />}
        {activeTab === 'documents' && <DocumentsTab teacher={teacher} />}
        {activeTab === 'system' && <SystemTab teacher={teacher} />}
      </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────── */}
      <AddTeacherModal
        isOpen={isModalOpen}
        isEdit={!!editingTeacherId}
        onClose={closeModal}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        formData={formData}
        onChange={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        onSubmit={handleEditSubmit}
      />
    </>
  )
}
