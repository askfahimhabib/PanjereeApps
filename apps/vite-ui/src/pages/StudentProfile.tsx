import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  CalendarCheck,
  Wallet,
  Award,
  CreditCard,
  Printer,
  Zap,
  Edit,
  GraduationCap,
  BookOpen,
  School,
  ShieldCheck,
} from 'lucide-react'
import { studentStore } from '@/data/stores'
import { STATUS_LABELS, GROUP_LABELS } from '../features/students/types'
import { ProfileTab } from '../features/students/components/drawer-tabs/ProfileTab'
import { AttendanceTab } from '../features/students/components/drawer-tabs/AttendanceTab'
import { FeesTab } from '../features/students/components/drawer-tabs/FeesTab'
import { ResultsTab } from '../features/students/components/drawer-tabs/ResultsTab'
import { StudentIdCardModal } from '../features/students/components/modals/StudentIdCardModal'
import { StudentReportCardModal } from '../features/students/components/modals/StudentReportCardModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import { useStudents } from '../features/students/useStudents'
import { AddStudentModal } from '../features/students/components/AddStudentModal'
import { ProfileHeroBanner } from '@/features/profile/components/ProfileHeroBanner'
import { ProfileKpiGrid, type ProfileKpiItem } from '@/features/profile/components/ProfileKpiGrid'
import { getStudentFinancialMetrics } from '@/features/profile/utils/userProfileData'

type TabKey = 'profile' | 'results' | 'attendance' | 'fees' | 'idcard'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'profile',    label: 'Overview & Bio', icon: User },
  { key: 'results',    label: 'Academic Results', icon: Award },
  { key: 'attendance', label: 'Attendance & Log', icon: CalendarCheck },
  { key: 'fees',       label: 'Fees & Invoices', icon: Wallet },
  { key: 'idcard',     label: 'Digital ID Card', icon: CreditCard },
]

function getInitials(name?: string, fallback = 'ST'): string {
  if (!name) return fallback
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const inits = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return inits || fallback
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

  // Financial status directly from stores
  const financialMetrics = useMemo(() => {
    return student ? getStudentFinancialMetrics(student.id) : null
  }, [student, refreshKey])

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

  const academicLabel =
    student.type === 'REGULAR'
      ? [student.className, student.sectionName && `Section ${student.sectionName}`, student.groupId && GROUP_LABELS[student.groupId]].filter(Boolean).join(' · ')
      : [student.batchName, student.targetExam && `Target: ${student.targetExam}`, student.schoolName && `School: ${student.schoolName}`].filter(Boolean).join(' · ')

  // 4 Executive State Cards directly from this student's actual student list data
  const studentKpis: ProfileKpiItem[] = [
    {
      title: 'Class & Section',
      value: `${student.className || 'Class 10'} · Sec ${student.sectionName || 'A'}`,
      subtitle: `Roll: ${student.rollNumber} · ${student.type === 'REGULAR' ? 'Regular Track' : 'Exam Batch'}`,
      icon: GraduationCap,
      badge: student.status === 'ACTIVE' ? 'Active' : undefined,
    },
    {
      title: 'Curriculum & Shift',
      value: `${student.groupId ? (GROUP_LABELS[student.groupId] || student.groupId) : 'General'}`,
      subtitle: `${student.shift ? student.shift.charAt(0) + student.shift.slice(1).toLowerCase() : 'Morning'} Shift · ${student.version ? student.version.charAt(0) + student.version.slice(1).toLowerCase() + ' Medium' : 'Bangla'}`,
      icon: BookOpen,
    },
    {
      title: 'Student ID & Reg',
      value: student.studentId || student.id,
      subtitle: `Reg: ${student.registrationNumber || student.studentId} · Session ${student.session || '2024'}`,
      icon: CreditCard,
    },
    {
      title: 'Account Ledger',
      value: financialMetrics?.status === 'CLEARED' ? 'Cleared ✓' : `৳${financialMetrics?.totalDue.toLocaleString()} Due`,
      subtitle: financialMetrics?.status === 'CLEARED' ? 'No pending dues' : 'Tuition payment pending',
      icon: Wallet,
      badge: financialMetrics?.status === 'CLEARED' ? 'Cleared' : 'Due',
    },
  ]

  return (
    <>
      <div className="space-y-6 pb-14">
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

        {/* ── Hero Profile Master Card (Fixed Avatar Overlap via ProfileHeroBanner) ── */}
        <ProfileHeroBanner
          fullName={student.fullNameEn}
          banglaName={student.fullNameBn}
          subtitle={`${academicLabel} · Session: ${student.session || '2024'}`}
          avatarUrl={student.profilePhoto}
          initials={getInitials(student.fullNameEn, 'ST')}
          roleBadgeText={`Student · ${student.className || 'Class 10'}`}
          roleColor="bg-emerald-50 text-emerald-800 border-emerald-200"
          statusText={STATUS_LABELS[student.status] || 'Active'}
          statusVariant={student.status === 'ACTIVE' ? 'success' : 'warning'}
          sessionText={`Session: ${student.session || '2024'}`}
          metaChips={[
            { label: 'Class', value: student.className || 'Class 10', highlight: true },
            { label: 'Section', value: student.sectionName || 'A' },
            { label: 'Roll No', value: student.rollNumber, isMono: true },
            { label: 'Student ID', value: student.studentId || student.id, isMono: true },
            { label: 'Blood Group', value: student.bloodGroup || 'Not Specified' },
            { label: 'Shift', value: student.shift || 'Morning' },
          ]}
          contacts={{
            mobile: student.mobile || student.father?.mobile,
            email: student.email,
            whatsapp: student.whatsapp || student.father?.mobile || student.mobile,
            location: student.presentAddress,
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
              onClick: () => setActiveTab('idcard'),
              color: 'text-indigo-600',
            },
            {
              label: 'Report Card',
              icon: Printer,
              onClick: () => setReportCardOpen(true),
              color: 'text-zinc-700',
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: () => openEditModal(student),
              color: 'text-zinc-600',
            },
          ]}
          dangerAction={{
            label: 'Delete Student Record',
            onClick: handleDelete,
          }}
        />

        {/* ── Executive State Cards directly from Student List ── */}
        <ProfileKpiGrid items={studentKpis} />

        {/* ── Tab Navigation Bar ──────────────────────────── */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-1.5 shadow-xs flex items-center overflow-x-auto scrollbar-none gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

        {/* ── Tab Content Panels ──────────────────────────── */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-6 shadow-sm">
          {activeTab === 'profile' && <ProfileTab student={student} />}
          {activeTab === 'results' && <ResultsTab student={student} />}
          {activeTab === 'attendance' && <AttendanceTab student={student} />}
          {activeTab === 'fees' && <FeesTab student={student} />}
          {activeTab === 'idcard' && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="max-w-md w-full bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                {/* ID Card Front Preview */}
                <div className="w-full max-w-[320px] rounded-2xl border-2 border-slate-900 overflow-hidden bg-white shadow-md mb-6">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <School size={16} />
                      <h4 className="text-xs font-black uppercase tracking-wider">Estudy Model Academy</h4>
                    </div>
                    <p className="text-[9px] text-emerald-200 uppercase tracking-widest font-semibold">Official Student Identity Card</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-3 border-emerald-700 bg-zinc-100 flex items-center justify-center text-emerald-800 text-xl font-black shadow-sm overflow-hidden mb-2">
                      {student.profilePhoto ? (
                        <img src={student.profilePhoto} alt={student.fullNameEn} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(student.fullNameEn)
                      )}
                    </div>

                    <h5 className="text-sm font-black text-zinc-900">{student.fullNameEn}</h5>
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 my-1">
                      {student.className} · Roll {student.rollNumber}
                    </span>

                    <table className="w-full text-[11px] text-left mt-2 border-t border-zinc-100 pt-2">
                      <tbody>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Student ID:</td>
                          <td className="py-0.5 font-bold font-mono text-zinc-900 text-right">{student.studentId}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Blood Group:</td>
                          <td className="py-0.5 font-bold font-mono text-rose-600 text-right">{student.bloodGroup || 'Not Specified'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Guardian Phone:</td>
                          <td className="py-0.5 font-bold font-mono text-zinc-900 text-right">{student.father?.mobile || student.mobile}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-500 font-medium">Academic Session:</td>
                          <td className="py-0.5 font-bold font-mono text-zinc-900 text-right">{student.session || '2024'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-zinc-100 px-4 py-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-200">
                    <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-600" /> Verified Record</span>
                    <span className="font-mono">VALID 2024-2025</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIdCardOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
                  >
                    <Printer size={15} /> Print High-Res Card
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modals */}
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
        onClose={() => {
          setQuickCollectOpen(false)
          setRefreshKey(k => k + 1)
        }}
      />

      <AddStudentModal
        isOpen={isModalOpen}
        isEdit={!!editingStudentId}
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
