import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  Wallet,
  Bell,
  BookOpen,
  CalendarDays,
  Clock,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Shield,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { useSettingsStore } from '@/store/settings'
import { useTheme } from '@/lib/theme'
import { getEffectiveStudentAvatar } from '@/lib/studentAvatar'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/student/routine',   label: 'Class & Exam Routine', icon: Clock },
      { to: '/student/results',   label: 'Results & Marksheet', icon: Award },
    ],
  },
  {
    label: 'Academic & Daily',
    items: [
      { to: '/student/attendance',label: 'Attendance & Leaves', icon: CalendarCheck },
      { to: '/student/fees',      label: 'Fees & Invoices', icon: Wallet, badge: 'Pay' },
      { to: '/student/subjects',  label: 'My Subjects', icon: BookOpen },
    ],
  },
  {
    label: 'Campus & Identity',
    items: [
      { to: '/student/notices',   label: 'Notice Board', icon: Bell },
      { to: '/student/calendar',  label: 'Academic Calendar', icon: CalendarDays },
      { to: '/student/profile',   label: 'Digital ID & Bio', icon: CreditCard },
      { to: '/student/settings',  label: 'Settings & Security', icon: Settings },
    ],
  },
]

const BREADCRUMB_MAP: Record<string, { title: string; subtitle: string }> = {
  '/student':            { title: 'Student Dashboard', subtitle: 'Overview & daily academic updates' },
  '/student/dashboard':  { title: 'Student Dashboard', subtitle: 'Overview & daily academic updates' },
  '/student/routine':    { title: 'Class & Exam Routine', subtitle: 'Weekly timetable & test schedule' },
  '/student/results':    { title: 'Results & Marksheet', subtitle: 'Term marks, grades & GPA progress' },
  '/student/attendance': { title: 'Attendance & Leaves', subtitle: 'Daily check-in logs & leave applications' },
  '/student/fees':       { title: 'Fees & Payment Records', subtitle: 'Tuition fees, online & in-cash receipts' },
  '/student/notices':    { title: 'Notice Board', subtitle: 'Official institutional circulars & alerts' },
  '/student/subjects':   { title: 'My Subjects & Syllabus', subtitle: 'Curriculum & assigned teacher info' },
  '/student/calendar':   { title: 'Academic Calendar', subtitle: 'Events, holidays & milestones' },
  '/student/profile':    { title: 'Digital ID Card & Bio', subtitle: 'Identity credentials & guardian contact' },
  '/student/settings':   { title: 'Settings & Account Security', subtitle: 'Profile editing, guardian info, SMS alerts & portal security' },
}

export function StudentLayout() {
  const { student, allPersonas, selectPersona } = useStudentSession()
  const settings = useSettingsStore()
  const { isDark, toggleTheme } = useTheme()
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentMeta = BREADCRUMB_MAP[location.pathname] || {
    title: 'Student Portal',
    subtitle: 'Bangladesh School & Coaching Management',
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. FIXED FULL-HEIGHT LEFT SIDEBAR (Signature Deep Emerald Institutional Theme)
      ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#0c1e19] text-white border-r border-[#15342c] z-40 shadow-xs">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 bg-[#091a16]">
          <NavLink to="/student/dashboard" className="flex items-center gap-2.5 group min-w-0">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-contain shrink-0 bg-white/10 p-0.5" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap size={20} />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-white block leading-tight truncate">
                {settings.schoolName || 'Panjeree LMS'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Student Portal
              </span>
            </div>
          </NavLink>
        </div>

        {/* Student Mini Profile Widget */}
        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 p-0.5 border border-emerald-400/40 shadow-sm overflow-hidden flex items-center justify-center">
                <img
                  src={getEffectiveStudentAvatar(student)}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c1e19]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">
                {student.fullNameEn}
              </h4>
              <p className="text-[11px] text-emerald-400/80 truncate">
                {student.className ? `${student.className}` : student.batchName}
                {' • '} Roll: <span className="font-semibold text-zinc-100">{student.rollNumber}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto hide-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <span className="px-3 text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider block mb-1">
                {group.label}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 w-1 h-5 rounded-r-md bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        )}
                        <div className="flex items-center gap-3 truncate">
                          <Icon size={17} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && !isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Return to Admin Panel */}
        <div className="p-3 border-t border-white/10 bg-[#091a16] space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span>Admin Management</span>
            </div>
            <ExternalLink size={12} className="text-zinc-400" />
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Offset by Sidebar width on Desktop)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left Title / Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {currentMeta.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Controls: Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Switch Persona Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 transition-all text-xs font-semibold shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 p-0.5 border border-emerald-500/40 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={getEffectiveStudentAvatar(student)}
                    alt={student.fullNameEn}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs font-bold truncate max-w-[120px]">
                      {student.fullNameEn}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                      Demo
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400">
                    Roll: {student.rollNumber} ({student.roleType})
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {personaMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setPersonaMenuOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Switch Simulated Persona
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Interactive Preview
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {allPersonas.map((p) => {
                      const isSelected = p.id === student.id
                      return (
                        <button
                          key={p.id}
                          onClick={() => selectPersona(p.id)}
                          className={`w-full px-3.5 py-2 text-left flex items-center gap-3 transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={getEffectiveStudentAvatar(p)}
                              alt={p.fullNameEn}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs truncate">{p.fullNameEn}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {p.className || p.batchName} • Roll: {p.rollNumber}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                    <NavLink
                      to="/student/settings"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings size={14} className="text-emerald-500" />
                      Account Settings & Security
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sun/Moon Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-400/40 transition-all shadow-xs cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light theme"
            >
              {isDark ? (
                <Sun size={16} className="text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon size={16} className="text-slate-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* Quick Settings Icon Button */}
            <NavLink
              to="/student/settings"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500/40 transition-all shadow-xs"
              title="Student Settings & Security"
            >
              <Settings size={16} />
            </NavLink>

            {/* Direct Admin return button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              title="Return to Admin Panel"
            >
              <ExternalLink size={13} />
              <span className="hidden md:inline">Admin</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Page Content with generous breathing room */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet key={student.id} />
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE DRAWER OVERLAY (FOR PHONES & TABLETS)
      ───────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#0c1e19] text-white border-r border-[#15342c] h-full p-5 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0 bg-white/10 p-0.5" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold shrink-0">
                      <GraduationCap size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-white block leading-tight truncate">
                      {settings.schoolName || 'Panjeree LMS'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                      Student Portal
                    </span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-zinc-400 hover:text-white shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Student Profile Badge & Persona Switcher */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getEffectiveStudentAvatar(student)}
                      alt={student.fullNameEn}
                      className="w-8 h-8 rounded-full border border-emerald-400/50 object-cover"
                    />
                    <div>
                      <p className="font-bold text-xs text-white leading-tight">{student.fullNameEn}</p>
                      <p className="text-[10px] text-emerald-400">
                        {student.className || student.batchName} • Roll {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 uppercase">
                    Demo
                  </span>
                </div>

                <select
                  aria-label="Select Demo Student Persona"
                  value={student.id}
                  onChange={(e) => {
                    selectPersona(e.target.value)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-[11px] bg-[#091a16] text-zinc-200 border border-white/15 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {allPersonas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullNameEn} ({p.className || p.batchName} - Roll {p.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <nav className="space-y-1 overflow-y-auto max-h-[60vh] hide-scrollbar">
                {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                            : 'text-zinc-300 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon size={16} className="text-emerald-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false)
                navigate('/')
              }}
              className="w-full py-2.5 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-emerald-500/20 rounded-xl transition-colors cursor-pointer"
            >
              Exit to Admin Panel
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE BOTTOM NAVIGATION BAR (THUMB-FRIENDLY ON PHONES)
      ───────────────────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-4 shadow-lg">
        <div className="flex justify-around items-center">
          <NavLink
            to="/student/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/student/routine"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Clock size={18} />
            <span>Routine</span>
          </NavLink>

          <NavLink
            to="/student/results"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Award size={18} />
            <span>Results</span>
          </NavLink>

          <NavLink
            to="/student/fees"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Wallet size={18} />
            <span>Fees</span>
          </NavLink>

          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <CreditCard size={18} />
            <span>ID Card</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
