import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  CalendarCheck,
  Wallet,
  Award,
  AlertTriangle,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Zap,
  CreditCard,
  MessageCircle,
  Printer,
  Sparkles,
} from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Student } from '../features/students/types'
import { STATUS_LABELS, STATUS_COLORS, GROUP_LABELS } from '../features/students/types'
import { ProfileTab } from '../features/students/components/drawer-tabs/ProfileTab'
import { AttendanceTab } from '../features/students/components/drawer-tabs/AttendanceTab'
import { FeesTab } from '../features/students/components/drawer-tabs/FeesTab'
import { ResultsTab } from '../features/students/components/drawer-tabs/ResultsTab'
import { DisciplinaryTab } from '../features/students/components/drawer-tabs/DisciplinaryTab'
import { CommunicationTab } from '../features/students/components/drawer-tabs/CommunicationTab'
import { StudentIdCardModal } from '../features/students/components/modals/StudentIdCardModal'
import { StudentReportCardModal } from '../features/students/components/modals/StudentReportCardModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import { useStudents } from '../features/students/useStudents'
import { AddStudentModal } from '../features/students/components/AddStudentModal'
import { manualDueStore } from '@/data/stores'

const studentStore = createStore<Student>('students')

type TabKey = 'profile' | 'attendance' | 'fees' | 'results' | 'disciplinary' | 'logs'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'profile',      label: 'Overview & Bio', icon: User },
  { key: 'fees',         label: 'Fees & Ledger',  icon: Wallet },
  { key: 'attendance',   label: 'Attendance',     icon: CalendarCheck },
  { key: 'results',      label: 'Academic Results', icon: Award },
  { key: 'disciplinary', label: 'Discipline',     icon: AlertTriangle },
  { key: 'logs',         label: 'Activity Logs',  icon: History },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarGradient(id: string) {
  const gradients = [
    'from-emerald-600 to-teal-600',
    'from-indigo-600 to-blue-600',
    'from-purple-600 to-pink-600',
    'from-amber-600 to-orange-600',
    'from-rose-600 to-red-600',
    'from-cyan-600 to-blue-600',
  ]
  return gradients[id.charCodeAt(id.length - 1) % gradients.length]
}

export function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [refreshKey, setRefreshKey] = useState(0)

  // Action Modals
  const [idCardOpen, setIdCardOpen] = useState(false)
  const [reportCardOpen, setReportCardOpen] = useState(false)
  const [quickCollectOpen, setQuickCollectOpen] = useState(false)

  const {
    isModalOpen, openEditModal, closeModal,
    formData, updateFormData,
    currentStep, nextStep, prevStep,
    submitStudent, editingStudentId,
    deleteStudent,
  } = useStudents()

  const student = useMemo(() => {
    if (!studentId) return undefined
    const direct = studentStore.getOne(studentId)
    if (direct) return direct
    return studentStore.getAll().find(
      s =>
        s.id === studentId ||
        s.studentId?.toLowerCase() === studentId.toLowerCase() ||
        s.registrationNumber?.toLowerCase() === studentId.toLowerCase()
    )
  }, [studentId, refreshKey])

  const handleEditSubmit = useCallback(() => {
    submitStudent()
    setRefreshKey(k => k + 1)
  }, [submitStudent])

  const handleDelete = useCallback(() => {
    if (!student) return
    if (confirm(`Delete ${student.fullNameEn}? This cannot be undone.`)) {
      deleteStudent(student.id)
      navigate('/students')
    }
  }, [student, deleteStudent, navigate])

  // Live total dues
  const totalDue = useMemo(() => {
    if (!student) return 0
    const dues = manualDueStore.getAll().filter(d => d.student_id === student.id && !d.is_paid)
    return dues.reduce((sum, d) => sum + d.amount, 0)
  }, [student, refreshKey])

  const guardianPhone = student?.father?.mobile || student?.mobile

  const handleWhatsApp = () => {
    if (!guardianPhone) {
      alert('No guardian phone number available.')
      return
    }
    const cleanNumber = guardianPhone.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`}?text=Assalamu%20Alaikum,%20regarding%20student%20${encodeURIComponent(student?.fullNameEn ?? '')}%20from%20Estudy%20Academy.`
    window.open(url, '_blank')
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-800">
        <User size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium text-zinc-600">Student not found</p>
        <button
          onClick={() => navigate('/students')}
          className="mt-4 flex items-center gap-2 text-sm text-emerald-600 hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Students
        </button>
      </div>
    )
  }

  const academicLabel = student.type === 'REGULAR'
    ? [student.className, student.sectionName && `Section ${student.sectionName}`, student.groupId && GROUP_LABELS[student.groupId]].filter(Boolean).join(' · ')
    : [student.batchName, student.targetExam && `Target: ${student.targetExam}`, student.schoolName && `School: ${student.schoolName}`].filter(Boolean).join(' · ')

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* ── Top Back & Breadcrumb Bar ─────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Student Directory
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Student 360° Academic Profile
            </span>
          </div>
        </div>

        {/* ── Hero Profile Master Card ──────────────────── */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className={`h-36 bg-gradient-to-r ${getAvatarGradient(student.id)} relative overflow-hidden flex items-end p-6`}>
            <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
            <div className="relative z-10 flex items-center justify-between w-full text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-300" />
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                  Estudy International Model Academy • Profile Hub
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                Session: {student.session || '2024-2025'}
              </span>
            </div>
          </div>

          <div className="px-8 pb-6">
            {/* Avatar & Quick Action Bar Row */}
            <div className="flex flex-wrap items-end justify-between -mt-12 mb-6 gap-4">
              {/* Avatar */}
              <div className="flex items-end gap-5">
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getAvatarGradient(student.id)} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white shrink-0 overflow-hidden`}>
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt={student.fullNameEn} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(student.fullNameEn)
                  )}
                </div>

                <div className="mb-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-black text-zinc-900">{student.fullNameEn}</h1>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[student.status]}`}>
                      {STATUS_LABELS[student.status]}
                    </span>
                  </div>
                  {student.fullNameBn && (
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{student.fullNameBn}</p>
                  )}
                  <p className="text-xs text-emerald-800 font-bold mt-1">
                    {academicLabel} • Roll: <span className="font-mono text-zinc-900">{student.rollNumber}</span> • ID: <span className="font-mono text-zinc-600">{student.studentId}</span>
                  </p>
                </div>
              </div>

              {/* 1-Click Fast Action Speed Bar */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <button
                  onClick={() => setQuickCollectOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
                >
                  <Zap size={14} /> Collect Fee
                </button>

                <button
                  onClick={() => setIdCardOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <CreditCard size={14} className="text-indigo-600" /> Student ID Card
                </button>

                <button
                  onClick={() => setReportCardOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <Printer size={14} /> Report Card
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                  title="WhatsApp Guardian"
                >
                  <MessageCircle size={14} className="text-emerald-600" /> WhatsApp
                </button>

                <button
                  onClick={() => openEditModal(student)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-all text-xs font-bold cursor-pointer"
                >
                  <Edit size={13} /> Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Delete Student"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* ── Live KPI Summary Strip ───────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Attendance Standing</p>
                <p className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5">96% Present</p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Account Dues</p>
                <p className={`text-sm font-extrabold font-mono mt-0.5 ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {totalDue > 0 ? `৳${totalDue} Pending` : 'Cleared ✓'}
                </p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Academic Standing</p>
                <p className="text-sm font-extrabold text-indigo-700 font-mono mt-0.5">GPA 4.93 (A+)</p>
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Blood Group</p>
                <p className="text-sm font-extrabold text-rose-600 mt-0.5">{student.bloodGroup || 'B+'}</p>
              </div>
            </div>

            {/* Contact Details Quick Row */}
            <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
              {student.mobile && (
                <a href={`tel:${student.mobile}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors font-medium">
                  <Phone size={13} className="text-zinc-400" /> {student.mobile}
                </a>
              )}
              {student.email && (
                <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors font-medium">
                  <Mail size={13} className="text-zinc-400" /> {student.email}
                </a>
              )}
              {student.presentAddress && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin size={13} className="text-zinc-400" /> {student.presentAddress}
                </span>
              )}
              {student.admissionDate && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar size={13} className="text-zinc-400" /> Admitted: {student.admissionDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Segmented Tab Navigation ───────────────────── */}
        <div className="flex items-center gap-1.5 bg-white border border-zinc-200/80 rounded-2xl p-1.5 shadow-xs overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
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
          {activeTab === 'profile'      && <ProfileTab student={student} />}
          {activeTab === 'fees'         && <FeesTab student={student} />}
          {activeTab === 'attendance'   && <AttendanceTab student={student} />}
          {activeTab === 'results'      && <ResultsTab student={student} />}
          {activeTab === 'disciplinary' && <DisciplinaryTab student={student} />}
          {activeTab === 'logs'         && <CommunicationTab student={student} />}
        </div>
      </div>

      {/* ── Modals & Document Generators ───────────────── */}
      <StudentIdCardModal
        open={idCardOpen}
        student={student}
        onClose={() => setIdCardOpen(false)}
      />

      <StudentReportCardModal
        open={reportCardOpen}
        student={student}
        onClose={() => setReportCardOpen(false)}
      />

      <QuickCollectModal
        open={quickCollectOpen}
        preselectedStudent={student}
        onClose={() => setQuickCollectOpen(false)}
      />

      {/* Edit Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        isEdit={!!editingStudentId}
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
