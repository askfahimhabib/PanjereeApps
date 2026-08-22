import { useState } from 'react'
import { X, User, Briefcase, GraduationCap, BookOpen, Award, FileText, Settings } from 'lucide-react'
import type { Teacher } from '../types'
import { BasicInfoTab }    from './drawer-tabs/BasicInfoTab'
import { EmploymentTab }   from './drawer-tabs/EmploymentTab'
import { AcademicTab }     from './drawer-tabs/AcademicTab'
import { AssignmentTab }   from './drawer-tabs/AssignmentTab'
import { TrainingTab }     from './drawer-tabs/TrainingTab'
import { DocumentsTab }    from './drawer-tabs/DocumentsTab'
import { SystemTab }       from './drawer-tabs/SystemTab'
import { STATUS_LABELS, STATUS_COLORS, DESIGNATION_LABELS, TEACHER_CATEGORY_COLORS } from '../types'

interface Props {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  onEdit: (teacher: Teacher) => void
}

const TABS = [
  { id: 'basic',      label: 'Basic',    icon: User },
  { id: 'employment', label: 'Job',      icon: Briefcase },
  { id: 'academic',   label: 'Acad.',    icon: GraduationCap },
  { id: 'assignment', label: 'Assign',   icon: BookOpen },
  { id: 'training',   label: 'Train',    icon: Award },
  { id: 'documents',  label: 'Docs',     icon: FileText },
  { id: 'system',     label: 'System',   icon: Settings },
] as const

type TabId = (typeof TABS)[number]['id']

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

export function TeacherDetailDrawer({ teacher, isOpen, onClose, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')

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
        {!teacher ? null : (
          <>
            {/* ── Header ───────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Teacher Profile</span>
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
              {teacher.profilePhoto ? (
                <img src={teacher.profilePhoto} alt={teacher.fullName} className="w-14 h-14 rounded-2xl object-cover shadow-lg shrink-0" />
              ) : (
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(teacher.id)} flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg`}>
                  {getInitials(teacher.fullName)}
                </div>
              )}

              {/* Name + quick info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-100 truncate">{teacher.fullName}</h2>
                {teacher.nameBangla && (
                  <p className="text-xs text-slate-400 truncate">{teacher.nameBangla}</p>
                )}
                
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md border ${STATUS_COLORS[teacher.employmentStatus]}`}>
                    {STATUS_LABELS[teacher.employmentStatus].toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md border ${TEACHER_CATEGORY_COLORS[teacher.teacherCategory]}`}>
                    {teacher.teacherCategory === 'REGULAR' ? 'REGULAR' : 'GUEST'}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                    {DESIGNATION_LABELS[teacher.designation]}
                  </span>
                </div>
              </div>

              {/* ID chip */}
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-slate-500">Teacher ID</p>
                <p className="text-xs font-mono font-semibold text-slate-300">{teacher.teacherId}</p>
              </div>
            </div>

            {/* ── Tab Bar ──────────────────────────────── */}
            <div className="shrink-0 border-b border-slate-700/60 bg-slate-900 px-4 pt-2">
              <div className="flex items-stretch gap-0.5">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-t-lg text-[10px] font-semibold uppercase tracking-wide transition-all duration-200 relative ${
                        isActive
                          ? 'text-blue-400 bg-slate-800/60'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                      }`}
                    >
                      <Icon size={14} />
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

            {/* ── Content ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                {activeTab === 'basic'      && <BasicInfoTab    teacher={teacher} />}
                {activeTab === 'employment' && <EmploymentTab   teacher={teacher} />}
                {activeTab === 'academic'   && <AcademicTab     teacher={teacher} />}
                {activeTab === 'assignment' && <AssignmentTab   teacher={teacher} />}
                {activeTab === 'training'   && <TrainingTab     teacher={teacher} />}
                {activeTab === 'documents'  && <DocumentsTab    teacher={teacher} />}
                {activeTab === 'system'     && <SystemTab       teacher={teacher} />}
              </div>
            </div>

            {/* ── Footer actions ────────────────────────── */}
            <div className="flex gap-2.5 px-5 py-3 border-t border-slate-700/60 bg-slate-900 shrink-0">
              <button
                onClick={() => onEdit(teacher)}
                className="flex-1 py-2.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
