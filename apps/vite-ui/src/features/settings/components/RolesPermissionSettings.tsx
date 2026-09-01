import { useState } from 'react'
import {
  ShieldCheck,
  Wallet,
  GraduationCap,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { useSettingsStore, type UserRolePersona } from '@/store/settings'

interface RoleOption {
  id: UserRolePersona
  title: string
  subtitle: string
  icon: React.ElementType
  badge: string
  color: string
  capabilities: string[]
}

const ROLES: RoleOption[] = [
  {
    id: 'SUPER_ADMIN',
    title: 'Super Admin & Principal',
    subtitle: 'Institutional Executive Authority',
    icon: ShieldCheck,
    badge: 'Full Access (100%)',
    color: 'border-indigo-500 bg-indigo-50/50 text-indigo-700',
    capabilities: [
      'Full Access to all 15+ System Modules',
      'Manage Institute Configurations & Disaster Recovery',
      'Approve/Reject Teacher and Student Leaves',
      'Publish Exam Results & Manage Staff Salaries',
    ],
  },
  {
    id: 'ACCOUNTANT',
    title: 'Accountant & Cashier',
    subtitle: 'Financial Operations & Fee Registry',
    icon: Wallet,
    badge: 'Finance & Accounts',
    color: 'border-emerald-500 bg-emerald-50/50 text-emerald-700',
    capabilities: [
      'Quick Collect Student Tuition Fees & Dues',
      'Record Campus Operational Expenses & Vouchers',
      'Generate Money Receipts & Financial Day Closing',
      'View Defaulters List & Send Due Reminders',
    ],
  },
  {
    id: 'TEACHER',
    title: 'Class Teacher & Faculty',
    subtitle: 'Academic Schedule & Student Progress',
    icon: GraduationCap,
    badge: 'Academic Operations',
    color: 'border-amber-500 bg-amber-50/50 text-amber-700',
    capabilities: [
      'Mark Daily Student Roll-Call Register',
      'Enter & Update Examination Marks & Grades',
      'View Weekly Class Timetable & Routine Slots',
      'Submit Personal Leave Requests to Principal',
    ],
  },
  {
    id: 'STUDENT_GUARDIAN',
    title: 'Student & Guardian Portal',
    subtitle: 'Self-Service & Parent Visibility',
    icon: Users,
    badge: 'Read-Only Portal',
    color: 'border-purple-500 bg-purple-50/50 text-purple-700',
    capabilities: [
      'View Personal Fee Payment Receipts & Pending Dues',
      'Check Real-time Attendance & Absent Alerts',
      'View Published Term Report Cards & Marksheets',
      'View Class Timetable & Circular Notices',
    ],
  },
]

export function RolesPermissionSettings() {
  const settings = useSettingsStore()
  const [selectedRole, setSelectedRole] = useState<UserRolePersona>(settings.activeRole)
  const [saved, setSaved] = useState(false)

  const handleApplyRole = (role: UserRolePersona) => {
    setSelectedRole(role)
    settings.updateRolePersona(role)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Active Role Simulation ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Role-Based Access Control (RBAC) & Active Persona Simulator
          </h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Switch the simulated user role to preview the ERP experience from the perspective of the Principal, Accountant, Class Teacher, or Parent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon
            const isCurrent = selectedRole === role.id
            return (
              <div
                key={role.id}
                onClick={() => handleApplyRole(role.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? `${role.color} ring-2 ring-indigo-500/20 shadow-md`
                    : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${isCurrent ? 'bg-white shadow-xs' : 'bg-zinc-100 text-zinc-700'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{role.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium">{role.subtitle}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCurrent ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                      {role.badge}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mt-3 pt-3 border-t border-zinc-100/80">
                    {role.capabilities.map((cap, i) => (
                      <li key={i} className="text-[11px] text-zinc-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">
                    {isCurrent ? '● Active Persona' : 'Click to Switch Persona'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApplyRole(role.id)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    {isCurrent ? 'Active' : 'Switch Role'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status banner */}
      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Active user persona switched to: {ROLES.find(r => r.id === selectedRole)?.title}</span>
        </div>
      )}
    </div>
  )
}
