import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  User,
  CalendarCheck,
  Wallet,
  Award,
  AlertTriangle,
  History,
  MessageCircle,
  Printer,
  Zap,
  Edit,
  CreditCard,
} from 'lucide-react'
import type { Student } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../types'

import { ProfileTab }       from './drawer-tabs/ProfileTab'
import { AttendanceTab }    from './drawer-tabs/AttendanceTab'
import { FeesTab }          from './drawer-tabs/FeesTab'
import { ResultsTab }       from './drawer-tabs/ResultsTab'
import { DisciplinaryTab }  from './drawer-tabs/DisciplinaryTab'
import { CommunicationTab } from './drawer-tabs/CommunicationTab'
import { StudentIdCardModal } from './modals/StudentIdCardModal'
import { StudentReportCardModal } from './modals/StudentReportCardModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import { manualDueStore } from '@/data/stores'

interface Props {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onEdit: (student: Student) => void
  onDelete?: (id: string) => void
  onCertificate?: (student: Student) => void
}

type TabKey = 'profile' | 'attendance' | 'fees' | 'results' | 'disciplinary' | 'logs'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'profile',      label: 'Profile',      icon: User },
  { key: 'fees',         label: 'Fees & Dues',  icon: Wallet },
  { key: 'attendance',   label: 'Attendance',   icon: CalendarCheck },
  { key: 'results',      label: 'Results',      icon: Award },
  { key: 'disciplinary', label: 'Discipline',   icon: AlertTriangle },
  { key: 'logs',         label: 'Logs',         icon: History },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    'from-emerald-600 to-teal-500',
    'from-indigo-600 to-blue-500',
    'from-purple-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-cyan-600 to-blue-600',
  ]
  return colors[id.charCodeAt(id.length - 1) % colors.length]
}

export function StudentDetailDrawer({
  student,
  isOpen,
  onClose,
  onEdit,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [idCardOpen, setIdCardOpen] = useState(false)
  const [reportCardOpen, setReportCardOpen] = useState(false)
  const [quickCollectOpen, setQuickCollectOpen] = useState(false)

  // Live calculation of dues
  const totalDue = useMemo(() => {
    if (!student) return 0
    const dues = manualDueStore.getAll().filter(d => d.student_id === student.id && !d.is_paid)
    return dues.reduce((sum, d) => sum + d.amount, 0)
  }, [student, isOpen])

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
        {!student ? null : (
          <>
            {/* ── Top Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-100 bg-zinc-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Student 360° Profile Hub
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEdit(student)}
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
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-zinc-50 border-b border-zinc-200/80 shrink-0">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(
                    student.id
                  )} flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-md border-2 border-white`}
                >
                  {getInitials(student.fullNameEn)}
                </div>

                {/* Info Block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-zinc-900 truncate">
                      {student.fullNameEn}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        STATUS_COLORS[student.status]
                      }`}
                    >
                      {STATUS_LABELS[student.status]}
                    </span>
                  </div>

                  {student.fullNameBn && (
                    <p className="text-xs text-zinc-500 font-medium">{student.fullNameBn}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white border border-zinc-200/80 text-emerald-800 shadow-xs">
                      {student.className} • Section {student.sectionName || 'A'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white border border-zinc-200/80 text-zinc-700">
                      Roll: {student.rollNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-500 bg-white border border-zinc-200/80">
                      ID: {student.studentId}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── KPI Summary Strip ──────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-emerald-100 text-center">
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Attendance</p>
                  <p className="text-xs font-black text-emerald-700 font-mono mt-0.5">96% Present</p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Fee Status</p>
                  <p className={`text-xs font-black font-mono mt-0.5 ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {totalDue > 0 ? `৳${totalDue} Due` : 'Cleared ✓'}
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Academic GPA</p>
                  <p className="text-xs font-black text-indigo-700 font-mono mt-0.5">GPA 4.93</p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 shadow-xs">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase">Blood Group</p>
                  <p className="text-xs font-black text-rose-600 mt-0.5">{student.bloodGroup || 'B+'}</p>
                </div>
              </div>

              {/* ── 1-Click Quick Actions Bar ──────────────────────── */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-emerald-100">
                <button
                  onClick={() => setQuickCollectOpen(true)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
                >
                  <Zap size={13} /> Collect Fee
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
                  title="Send WhatsApp to Guardian"
                >
                  <MessageCircle size={13} className="text-emerald-600" /> WhatsApp
                </button>

                <button
                  onClick={() => setReportCardOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <Printer size={13} /> Report Card
                </button>
              </div>
            </div>

            {/* ── Tab Navigation Bar ─────────────────────────────── */}
            <div className="shrink-0 border-b border-zinc-200 bg-white px-3 sm:px-5 pt-2">
              <div className="flex items-stretch gap-1 overflow-x-auto scrollbar-none">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 min-w-[62px] shrink-0 flex flex-col items-center gap-1 py-2 px-1.5 rounded-t-xl text-[10px] font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                        isActive
                          ? 'text-emerald-700 bg-emerald-50/80 border-b-2 border-emerald-600'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Active Tab Content ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/40">
              {activeTab === 'profile'      && <ProfileTab student={student} />}
              {activeTab === 'fees'         && <FeesTab student={student} />}
              {activeTab === 'attendance'   && <AttendanceTab student={student} />}
              {activeTab === 'results'      && <ResultsTab student={student} />}
              {activeTab === 'disciplinary' && <DisciplinaryTab student={student} />}
              {activeTab === 'logs'         && <CommunicationTab student={student} />}
            </div>
          </>
        )}
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
        onClose={() => setQuickCollectOpen(false)}
      />
    </>,
    document.body
  )
}
