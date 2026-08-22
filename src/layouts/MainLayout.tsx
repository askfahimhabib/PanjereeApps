import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import {
  LayoutDashboard, Users, GraduationCap, LogOut, BookOpen,
  CalendarDays, ClipboardList, ClipboardCheck, Bell, Wallet,
  BarChart3, Settings, Trophy, FileBarChart2,
} from 'lucide-react'

type NavItem = {
  to: string
  label: string
  icon: React.ElementType
  activeColor?: string
}

function NavItemLink({ to, label, icon: Icon, activeColor = 'bg-[var(--color-primary)]' }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? `${activeColor} text-white`
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`
      }
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1 mt-1">
      {label}
    </p>
  )
}

function Divider() {
  return <div className="my-2 border-t border-slate-700/50" />
}

export function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const initials = user?.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'A'

  return (
    <div className="min-h-screen flex bg-[var(--color-dark-bg)]">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className="w-56 h-screen bg-[var(--color-card-bg)] flex flex-col overflow-hidden sticky top-0 shrink-0">
        {/* Logo */}
        <div className="p-5 shrink-0">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            PANJEREE
            <span className="text-xs font-medium text-slate-400 ml-1">LMS</span>
          </h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-0.5 pb-2">

          {/* ── Main ── */}
          <NavItemLink to="/" label="Dashboard" icon={LayoutDashboard} />
          <NavItemLink to="/students" label="Students" icon={Users} />
          <NavItemLink to="/teachers" label="Teachers" icon={BookOpen} />
          <NavItemLink to="/classes" label="Classes" icon={GraduationCap} />
          <NavItemLink to="/alumni" label="Alumni" icon={GraduationCap} />

          <Divider />
          <SectionLabel label="Academic" />

          <NavItemLink to="/routines"    label="Routines"   icon={CalendarDays} />
          <NavItemLink to="/attendance"  label="Attendance" icon={ClipboardCheck} />
          <NavItemLink to="/exam-held"   label="Exams"      icon={ClipboardList} activeColor="bg-[var(--color-secondary)]" />
          <NavItemLink to="/exam-results" label="Results"   icon={Trophy} activeColor="bg-purple-600" />

          <Divider />
          <SectionLabel label="Finance" />

          <NavItemLink to="/payments" label="Payments" icon={Wallet} activeColor="bg-emerald-600" />

          <Divider />
          <SectionLabel label="Communication" />

          <NavItemLink to="/notices"  label="Notices" icon={Bell} />
          <NavItemLink to="/reports"  label="Reports" icon={FileBarChart2} activeColor="bg-sky-600" />

        </nav>

        {/* ── Bottom: User + Settings ─────────────────── */}
        <div className="shrink-0 border-t border-slate-700/50 p-3 space-y-1">
          <NavItemLink to="/settings" label="Settings" icon={Settings} />

          {/* User row */}
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-card-bg)] min-w-0">
        <header className="h-14 bg-[var(--color-card-bg)] flex items-center px-8 shrink-0 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-slate-600" />
            <h2 className="text-sm font-medium text-slate-400">Welcome back, <span className="text-slate-200">{user?.fullName}</span></h2>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-[var(--color-dark-bg)] rounded-tl-2xl border-t border-l border-slate-800 shadow-inner">
          <div className="min-h-full p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
