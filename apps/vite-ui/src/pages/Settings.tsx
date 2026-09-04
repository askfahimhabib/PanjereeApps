import { useState, useRef } from 'react'
import {
  School,
  Calendar,
  Award,
  Wallet,
  Clock,
  MessageSquare,
  ShieldCheck,
  Palette,
  Database,
  AlertTriangle,
  ChevronRight,
  Sliders,
} from 'lucide-react'
import { InstitutionIdentityForm } from '../features/settings/components/InstitutionIdentityForm'
import { AcademicSessionSettings } from '../features/settings/components/AcademicSessionSettings'
import { GradingPolicySettings } from '../features/settings/components/GradingPolicySettings'
import { FinanceSettings } from '../features/settings/components/FinanceSettings'
import { AttendanceSettings } from '../features/settings/components/AttendanceSettings'
import { SmsNotificationSettings } from '../features/settings/components/SmsNotificationSettings'
import { RolesPermissionSettings } from '../features/settings/components/RolesPermissionSettings'
import { AppearanceSettings } from '../features/settings/components/AppearanceSettings'
import { DatabaseBackupManager } from '../features/settings/components/DatabaseBackupManager'
import { useSettingsStore } from '../store/settings'
import { useAuthStore } from '../store/auth'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { AdminDatabaseResetModal } from '../features/settings/components/AdminDatabaseResetModal'

type SectionId =
  | 'school-info'
  | 'session'
  | 'grading'
  | 'finance'
  | 'attendance'
  | 'sms'
  | 'roles'
  | 'appearance'
  | 'backup'
  | 'danger'

interface SectionConfig {
  id: SectionId
  icon: React.ElementType
  label: string
  badge: string
  title: string
  description: string
  category: 'General & Identity' | 'Academic & Rules' | 'Finance & Comms' | 'System & Security'
}

const SECTIONS: SectionConfig[] = [
  // 1. General & Identity
  {
    id: 'school-info',
    icon: School,
    label: 'Institution Profile',
    badge: 'Legal & EIIN',
    title: 'Institution Profile & Legal Identity',
    description: 'Legal name, EIIN, accreditation board, principal signature, and contact details used across all formal documents.',
    category: 'General & Identity',
  },
  {
    id: 'appearance',
    icon: Palette,
    label: 'Theme & Print Layout',
    badge: 'Branding & UI',
    title: 'Theme Branding & Print Paper Layout',
    description: 'Customize brand color palettes, receipt format (A4 vs Thermal POS), and official watermark seals.',
    category: 'General & Identity',
  },

  // 2. Academic & Rules
  {
    id: 'session',
    icon: Calendar,
    label: 'Academic Session',
    badge: 'Year & Days',
    title: 'Academic Session & Working Days',
    description: 'Configure the active academic year, weekly holidays, and student/staff ID prefix patterns.',
    category: 'Academic & Rules',
  },
  {
    id: 'grading',
    icon: Award,
    label: 'Grading & Exams',
    badge: 'NCTB 5.0',
    title: 'Examination & Grading System Policy',
    description: 'Select grading standards (NCTB GPA 5.0, Cambridge), pass marks %, and 4th subject bonus calculation rules.',
    category: 'Academic & Rules',
  },
  {
    id: 'attendance',
    icon: Clock,
    label: 'Attendance & Timings',
    badge: 'Rules & Limits',
    title: 'Attendance Rules & Punctuality Timings',
    description: 'Set school arrival timings, grace periods for late roll-calls, and minimum attendance thresholds for exam eligibility.',
    category: 'Academic & Rules',
  },

  // 3. Finance & Comms
  {
    id: 'finance',
    icon: Wallet,
    label: 'Fees & Late Fine',
    badge: 'Finance Policy',
    title: 'Fees, Finance & Late Fine Automation',
    description: 'Configure monthly fee billing due dates, automatic late fine calculations, and official merchant payment accounts.',
    category: 'Finance & Comms',
  },
  {
    id: 'sms',
    icon: MessageSquare,
    label: 'SMS Gateway',
    badge: 'Alerts & Toggles',
    title: 'SMS Gateway & Automated Notifications',
    description: 'Configure SMS gateway credentials, approved sender masking IDs, automated absent alerts, and payment templates.',
    category: 'Finance & Comms',
  },

  // 4. System & Security
  {
    id: 'roles',
    icon: ShieldCheck,
    label: 'Roles & RBAC',
    badge: 'Simulator',
    title: 'Roles & Permission Control Simulator',
    description: 'Switch simulated user personas (Principal, Accountant, Teacher, Student) to preview role-based access.',
    category: 'System & Security',
  },
  {
    id: 'backup',
    icon: Database,
    label: 'Backup & Recovery',
    badge: '1-Click JSON',
    title: 'Database Backup & Disaster Recovery',
    description: 'Export and restore full encrypted JSON snapshots of all 25+ institutional databases to prevent data loss.',
    category: 'System & Security',
  },
  {
    id: 'danger',
    icon: AlertTriangle,
    label: 'Danger Zone',
    badge: 'Reset',
    title: 'Danger Zone & Factory Reset',
    description: 'High-impact administrative actions — reset configurations or reload clean sample database.',
    category: 'System & Security',
  },
]

export function Settings() {
  const { user } = useAuthStore()
  const { resetToDefaults } = useSettingsStore()
  const [activeSection, setActiveSection] = useState<SectionId>('school-info')
  const [adminResetModalOpen, setAdminResetModalOpen] = useState(false)
  const contentPanelRef = useRef<HTMLDivElement>(null)

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0]
  const CurrentIcon = currentSection.icon

  const handleSectionClick = (id: SectionId) => {
    setActiveSection(id)
    if (contentPanelRef.current) {
      contentPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'danger' | 'warning'
    action: () => void
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    action: () => {},
  })

  const openConfirm = (opts: Omit<typeof confirmState, 'open'>) =>
    setConfirmState({ open: true, ...opts })

  const closeConfirm = () =>
    setConfirmState(s => ({ ...s, open: false }))

  return (
    <div className="space-y-5 pb-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1.5">
              <Sliders size={12} />
              Master System Configuration
            </span>
            <span className="text-xs text-zinc-400 font-medium">Enterprise ERP Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Institutional Settings Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Configure legal profile, grading rules, fee billing cycles, SMS triggers, and disaster recovery
          </p>
        </div>
      </div>

      {/* ── Horizontal Scrollable Pill Tabs for Mobile/Tablet ── */}
      <div className="xl:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SECTIONS.map(s => {
          const Icon = s.icon
          const isSelected = activeSection === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSectionClick(s.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-indigo-400' : 'text-zinc-500'} />
              <span>{s.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Main Layout: Fixed Sticky Sidebar + Scrollable Right Side Content ──── */}
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Fixed / Sticky Master Sidebar Navigation */}
        <nav className="hidden xl:block sticky top-6 bg-white border border-zinc-200/80 rounded-3xl p-3 shadow-xs space-y-3 shrink-0 h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider px-3 py-1.5">
              Settings Navigation
            </p>
            <div className="space-y-1 mt-1">
              {SECTIONS.map(s => {
                const Icon = s.icon
                const isSelected = activeSection === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSectionClick(s.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          isSelected ? 'text-indigo-400' : s.id === 'danger' ? 'text-rose-500' : 'text-zinc-400'
                        }`}
                      />
                      <span className="truncate">{s.label}</span>
                    </div>
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white shrink-0">
                        {s.badge}
                      </span>
                    ) : (
                      <ChevronRight size={13} className="text-zinc-300 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* ── Scrollable Right Side Content Container ── */}
        <div
          ref={contentPanelRef}
          className="space-y-6 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pr-2"
        >
          {/* Active Section Header Card */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              activeSection === 'danger'
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
            }`}>
              <CurrentIcon size={24} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-zinc-900">{currentSection.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {currentSection.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{currentSection.description}</p>
            </div>
          </div>

          {/* Active Section Content Form */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 shadow-xs animate-in fade-in duration-200">
            {activeSection === 'school-info' && <InstitutionIdentityForm />}
            {activeSection === 'appearance' && <AppearanceSettings />}
            {activeSection === 'session' && <AcademicSessionSettings />}
            {activeSection === 'grading' && <GradingPolicySettings />}
            {activeSection === 'attendance' && <AttendanceSettings />}
            {activeSection === 'finance' && <FinanceSettings />}
            {activeSection === 'sms' && <SmsNotificationSettings />}
            {activeSection === 'roles' && <RolesPermissionSettings />}
            {activeSection === 'backup' && <DatabaseBackupManager />}

            {/* Danger Zone View */}
            {activeSection === 'danger' && (
              <div className="space-y-6">
                <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Reset Settings to Institutional Defaults</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        Restore all settings to their original institutional values. Student, teacher, and payment data will remain untouched.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openConfirm({
                          title: 'Reset Settings to Defaults?',
                          description: 'All settings will be restored to their original institutional values. Student, teacher, and payment data will remain intact.',
                          confirmLabel: 'Reset Settings',
                          variant: 'warning',
                          action: resetToDefaults,
                        })
                      }
                      className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all cursor-pointer"
                    >
                      Reset Settings
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-rose-200/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900">Master Database Purge & Factory Reset</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-800 tracking-wider">
                          ADMIN ONLY
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        Permanently wipes all records across all 25 modules for clean school onboarding, or reloads fresh factory demo records.
                      </p>
                    </div>
                    {user?.role === 'ADMIN' ? (
                      <button
                        type="button"
                        onClick={() => setAdminResetModalOpen(true)}
                        className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-md shadow-rose-600/20"
                      >
                        Reset / Purge Database...
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-3 py-1.5 rounded-xl">
                        Administrator Access Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Master Reset Modal */}
      <AdminDatabaseResetModal
        isOpen={adminResetModalOpen}
        onClose={() => setAdminResetModalOpen(false)}
      />

      {/* Confirmation Dialog Modal */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={() => { confirmState.action(); closeConfirm() }}
        onCancel={closeConfirm}
      />
    </div>
  )
}
export default Settings
