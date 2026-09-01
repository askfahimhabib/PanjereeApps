import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  BookOpen,
  FileText,
  Settings,
  DollarSign,
  Calendar,
  CreditCard,
  MessageCircle,
  Edit,
} from 'lucide-react'
import type { Teacher } from '../types'
import { BasicInfoTab }       from './drawer-tabs/BasicInfoTab'
import { EmploymentTab }      from './drawer-tabs/EmploymentTab'
import { AcademicTab }        from './drawer-tabs/AcademicTab'
import { AssignmentTab }      from './drawer-tabs/AssignmentTab'
import { DocumentsTab }       from './drawer-tabs/DocumentsTab'
import { SystemTab }          from './drawer-tabs/SystemTab'
import { SalaryHistoryTab }   from './drawer-tabs/SalaryHistoryTab'
import { ScheduleRoutineTab } from './drawer-tabs/ScheduleRoutineTab'
import { TeacherIdCardModal } from './modals/TeacherIdCardModal'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DESIGNATION_LABELS,
} from '../types'
import { teacherSalarySettingStore } from '@/data/stores'
import { formatCurrency } from '@/features/payments/types'

interface Props {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  onEdit: (teacher: Teacher) => void
}

const TABS = [
  { id: 'basic',      label: 'Profile',      icon: User },
  { id: 'salary',     label: 'Salary & Pay', icon: DollarSign },
  { id: 'schedule',   label: 'Routine',      icon: Calendar },
  { id: 'employment', label: 'Employment',   icon: Briefcase },
  { id: 'academic',   label: 'Academic',     icon: GraduationCap },
  { id: 'assignment', label: 'Assign',       icon: BookOpen },
  { id: 'documents',  label: 'Docs',         icon: FileText },
  { id: 'system',     label: 'System',       icon: Settings },
] as const

type TabId = (typeof TABS)[number]['id']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-purple-600 to-pink-600',
    'from-slate-700 to-zinc-900',
  ]
  return colors[id.charCodeAt(id.length - 1) % colors.length]
}

export function TeacherDetailDrawer({ teacher, isOpen, onClose, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [idCardOpen, setIdCardOpen] = useState(false)

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

  const deptName = teacher?.department
    ? teacher.department.replace(/_/g, ' ')
    : (teacher?.specialization || 'General')

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[560px] max-w-full bg-white border-l border-zinc-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {!teacher ? null : (
          <>
            {/* ── Top Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-100 bg-zinc-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Teacher 360° Profile Hub
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEdit(teacher)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors cursor-pointer"
                >
                  <Edit size={13} /> Edit
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Hero Profile Banner ────────────────────────────── */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-zinc-50 border-b border-zinc-200/80 shrink-0">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                {teacher.profilePhoto ? (
                  <img
                    src={teacher.profilePhoto}
                    alt={teacher.fullName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white shrink-0"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(
                      teacher.id
                    )} flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-md border-2 border-white`}
                  >
                    {getInitials(teacher.fullName)}
                  </div>
                )}

                {/* Info Block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-zinc-900 truncate">
                      {teacher.fullName}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        STATUS_COLORS[teacher.employmentStatus]
                      }`}
                    >
                      {STATUS_LABELS[teacher.employmentStatus]}
                    </span>
                  </div>

                  {teacher.nameBangla && (
                    <p className="text-xs text-zinc-500 font-medium">{teacher.nameBangla}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white border border-zinc-200/80 text-indigo-900 shadow-xs">
                      {DESIGNATION_LABELS[teacher.designation]}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white border border-zinc-200/80 text-zinc-700">
                      Dept: {deptName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-500 bg-white border border-zinc-200/80">
                      ID: {teacher.teacherId}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── KPI Summary Strip ──────────────────────────────── */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-indigo-100 text-center">
                <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Monthly Base</p>
                  <p className="text-xs font-black text-indigo-900 font-mono mt-0.5">
                    {formatCurrency(baseSalary)}
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Classes / Wk</p>
                  <p className="text-xs font-black text-emerald-700 font-mono mt-0.5">18 Periods</p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Attendance</p>
                  <p className="text-xs font-black text-blue-700 font-mono mt-0.5">98% Logged</p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Blood Group</p>
                  <p className="text-xs font-black text-rose-600 mt-0.5">{teacher.bloodGroup || 'A+'}</p>
                </div>
              </div>

              {/* ── 1-Click Quick Actions Bar ──────────────────────── */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-indigo-100">
                <button
                  onClick={() => setActiveTab('salary')}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
                >
                  <DollarSign size={13} /> View Pay Slip
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <Calendar size={13} className="text-indigo-600" /> Routine
                </button>

                <button
                  onClick={() => setIdCardOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <CreditCard size={13} className="text-indigo-600" /> ID Card
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                  title="WhatsApp Direct Message"
                >
                  <MessageCircle size={13} className="text-emerald-600" /> WhatsApp
                </button>
              </div>
            </div>

            {/* ── Tab Navigation Bar ─────────────────────────────── */}
            <div className="shrink-0 border-b border-zinc-200 bg-white px-4 pt-2">
              <div className="flex items-stretch gap-0.5 overflow-x-auto">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-t-xl text-[10px] font-bold uppercase tracking-wider transition-all relative shrink-0 min-w-[62px] ${
                        isActive
                          ? 'text-indigo-700 bg-indigo-50/80 border-b-2 border-indigo-600'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Active Tab Content ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/40">
              {activeTab === 'basic'      && <BasicInfoTab teacher={teacher} />}
              {activeTab === 'salary'     && <SalaryHistoryTab teacher={teacher} />}
              {activeTab === 'schedule'   && <ScheduleRoutineTab teacher={teacher} />}
              {activeTab === 'employment' && <EmploymentTab teacher={teacher} />}
              {activeTab === 'academic'   && <AcademicTab teacher={teacher} />}
              {activeTab === 'assignment' && <AssignmentTab teacher={teacher} />}
              {activeTab === 'documents'  && <DocumentsTab teacher={teacher} />}
              {activeTab === 'system'     && <SystemTab teacher={teacher} />}
            </div>
          </>
        )}
      </div>

      {/* Teacher ID Card Modal */}
      <TeacherIdCardModal
        open={idCardOpen}
        teacher={teacher}
        onClose={() => setIdCardOpen(false)}
      />
    </>,
    document.body
  )
}
