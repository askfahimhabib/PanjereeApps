import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, CalendarCheck, Wallet, Award, AlertTriangle, History, Phone, Mail, MapPin, Calendar, Edit, Trash2 } from 'lucide-react'
import { createStore } from '@/lib/localStore'
import type { Student } from '../features/students/types'
import { STATUS_LABELS, STATUS_COLORS, GROUP_LABELS } from '../features/students/types'
import { ProfileTab } from '../features/students/components/drawer-tabs/ProfileTab'
import { AttendanceTab } from '../features/students/components/drawer-tabs/AttendanceTab'
import { FeesTab } from '../features/students/components/drawer-tabs/FeesTab'
import { ResultsTab } from '../features/students/components/drawer-tabs/ResultsTab'
import { DisciplinaryTab } from '../features/students/components/drawer-tabs/DisciplinaryTab'
import { CommunicationTab } from '../features/students/components/drawer-tabs/CommunicationTab'

const studentStore = createStore<Student>('students')

type TabKey = 'profile' | 'attendance' | 'fees' | 'results' | 'disciplinary' | 'logs'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Overview', icon: User },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'fees', label: 'Payments', icon: Wallet },
  { key: 'results', label: 'Results', icon: Award },
  { key: 'disciplinary', label: 'Disciplinary', icon: AlertTriangle },
  { key: 'logs', label: 'Logs', icon: History },
]

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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-200 mt-0.5">{value || '—'}</p>
    </div>
  )
}

export function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  const student = useMemo(() => studentStore.getOne(studentId ?? ''), [studentId])

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-600">
        <User size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium text-slate-500">Student not found</p>
        <button onClick={() => navigate('/students')} className="mt-4 flex items-center gap-2 text-sm text-indigo-400 hover:underline">
          <ArrowLeft size={14} /> Back to Students
        </button>
      </div>
    )
  }

  const academicLabel = student.type === 'REGULAR'
    ? [student.className, student.sectionName && `Section ${student.sectionName}`, student.groupId && GROUP_LABELS[student.groupId]].filter(Boolean).join(' · ')
    : student.batchName ?? '—'

  return (
    <div className="space-y-6">
      {/* ── Back button ─────────────────────────────── */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Students
      </button>

      {/* ── Hero Card ────────────────────────────────── */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Gradient banner */}
        <div className={`h-28 bg-gradient-to-r ${getAvatarGradient(student.id)} opacity-20`} />

        <div className="px-6 pb-5">
          {/* Avatar + header row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(student.id)} flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-slate-900 shrink-0 overflow-hidden`}>
              {student.profilePhoto
                ? <img src={student.profilePhoto} alt={student.fullNameEn} className="w-full h-full object-cover" />
                : getInitials(student.fullNameEn)
              }
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <Edit size={13} /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${student.fullNameEn}? This cannot be undone.`)) {
                    studentStore.remove(student.id)
                    navigate('/students')
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          {/* Name + badges */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{student.fullNameEn}</h1>
              {student.fullNameBn && <p className="text-sm text-slate-400 mt-0.5">{student.fullNameBn}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[student.status]}`}>
                {STATUS_LABELS[student.status]}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${student.type === 'REGULAR'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                {student.type === 'REGULAR' ? 'Regular' : 'Exam Batch'}
              </span>
              {student.shift && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                  {student.shift} Shift
                </span>
              )}
            </div>
          </div>

          {/* Quick info chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <InfoChip label="Student ID" value={student.studentId} />
            <InfoChip label="Roll Number" value={student.rollNumber} />
            <InfoChip label="Class / Batch" value={academicLabel} />
            <InfoChip label="Session" value={student.session} />
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-sm text-slate-400">
            {student.mobile && (
              <a href={`tel:${student.mobile}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <Phone size={13} /> {student.mobile}
              </a>
            )}
            {student.email && (
              <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <Mail size={13} /> {student.email}
              </a>
            )}
            {student.presentAddress && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {student.presentAddress}
              </span>
            )}
            {student.admissionDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Admitted: {student.admissionDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────── */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6">
        {activeTab === 'profile' && <ProfileTab student={student} />}
        {activeTab === 'attendance' && <AttendanceTab student={student} />}
        {activeTab === 'fees' && <FeesTab student={student} />}
        {activeTab === 'results' && <ResultsTab student={student} />}
        {activeTab === 'disciplinary' && <DisciplinaryTab student={student} />}
        {activeTab === 'logs' && <CommunicationTab student={student} />}
      </div>
    </div>
  )
}
