import { useState } from 'react'
import { X, User, CalendarCheck, Wallet, Award, AlertTriangle, History } from 'lucide-react'
import type { Student } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../types'

import { ProfileTab }       from './drawer-tabs/ProfileTab'
import { AttendanceTab }    from './drawer-tabs/AttendanceTab'
import { FeesTab }          from './drawer-tabs/FeesTab'
import { ResultsTab }       from './drawer-tabs/ResultsTab'
import { DisciplinaryTab }  from './drawer-tabs/DisciplinaryTab'
import { CommunicationTab } from './drawer-tabs/CommunicationTab'

interface Props {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onEdit: (student: Student) => void
  onDelete: (id: string) => void
}

type TabKey = 'profile' | 'attendance' | 'fees' | 'results' | 'disciplinary' | 'logs'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'profile',      label: 'Profile',      icon: User },
  { key: 'attendance',   label: 'Attendance',   icon: CalendarCheck },
  { key: 'fees',         label: 'Fees',         icon: Wallet },
  { key: 'results',      label: 'Results',      icon: Award },
  { key: 'disciplinary', label: 'Disciplinary', icon: AlertTriangle },
  { key: 'logs',         label: 'Logs',         icon: History },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    'from-blue-600 to-blue-400',
    'from-purple-600 to-purple-400',
    'from-emerald-600 to-emerald-400',
    'from-amber-600 to-amber-400',
    'from-pink-600 to-pink-400',
    'from-cyan-600 to-cyan-400',
  ]
  return colors[id.charCodeAt(id.length - 1) % colors.length]
}

export function StudentDetailDrawer({ student, isOpen, onClose, onEdit, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[480px] max-w-full bg-slate-900 border-l border-slate-700/60 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {!student ? null : (
          <>
            {/* ── Header ───────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Student Profile</span>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Compact Profile Hero ─────────────────── */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-700/60 bg-slate-800/40 shrink-0">
              {/* Avatar */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(student.id)} flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg`}>
                {getInitials(student.fullNameEn)}
              </div>

              {/* Name + quick info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-100 truncate">{student.fullNameEn}</h2>
                {student.fullNameBn && (
                  <p className="text-xs text-slate-400 truncate">{student.fullNameBn}</p>
                )}
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md border ${STATUS_COLORS[student.status]}`}>
                    {STATUS_LABELS[student.status].toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md border ${
                    student.type === 'REGULAR'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {student.type === 'REGULAR' ? 'REGULAR' : 'EXAM BATCH'}
                  </span>
                  {student.className && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                      {student.className}
                    </span>
                  )}
                </div>
              </div>

              {/* ID chip */}
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-slate-500">Student ID</p>
                <p className="text-xs font-mono font-semibold text-slate-300">{student.studentId}</p>
                {student.rollNumber && (
                  <p className="text-[10px] text-slate-500 mt-0.5">Roll: {student.rollNumber}</p>
                )}
              </div>
            </div>

            {/* ── Tab Bar ──────────────────────────────── */}
            <div className="shrink-0 border-b border-slate-700/60 bg-slate-900 px-4 pt-2">
              <div className="flex items-stretch gap-0.5">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-t-lg text-[10px] font-semibold uppercase tracking-wide transition-all duration-200 relative ${
                        isActive
                          ? 'text-blue-400 bg-slate-800/60'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                      }`}
                    >
                      <Icon size={15} />
                      <span>{tab.label}</span>
                      {/* Active indicator line */}
                      {isActive && (
                        <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Scrollable Tab Content ────────────────── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                {activeTab === 'profile'      && <ProfileTab      student={student} />}
                {activeTab === 'attendance'   && <AttendanceTab   student={student} />}
                {activeTab === 'fees'         && <FeesTab         student={student} />}
                {activeTab === 'results'      && <ResultsTab      student={student} />}
                {activeTab === 'disciplinary' && <DisciplinaryTab student={student} />}
                {activeTab === 'logs'         && <CommunicationTab student={student} />}
              </div>
            </div>

            {/* ── Footer actions ────────────────────────── */}
            <div className="flex gap-2.5 px-5 py-3 border-t border-slate-700/60 bg-slate-900 shrink-0">
              <button
                onClick={() => onEdit(student)}
                className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${student.fullNameEn}? This cannot be undone.`)) {
                    onDelete(student.id)
                  }
                }}
                className="px-4 py-2.5 text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500/80 bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
