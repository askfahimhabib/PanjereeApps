import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'
import { createStore } from '../lib/localStore'
import type { Notice } from '../features/notices/types'
import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  LayoutDashboard, Users, GraduationCap, LogOut, BookOpen,
  CalendarDays, ClipboardList, ClipboardCheck, Bell, Wallet,
  Settings, Trophy, FileBarChart2, Menu, X, ChevronRight,
  ChevronLeft, GraduationCap as AlumniIcon, BookCopy, Layers,
  DollarSign, Calendar, Scale, Receipt
} from 'lucide-react'

// ── Page Title & Breadcrumb Map ───────────────────────────────────────────────
const PAGE_META: Record<string, { title: string; breadcrumb?: string[] }> = {
  '/':                 { title: 'Dashboard' },
  '/students':         { title: 'Students',    breadcrumb: ['Manage', 'Students'] },
  '/teachers':         { title: 'Teachers',    breadcrumb: ['Manage', 'Teachers'] },
  '/classes':          { title: 'Classes',     breadcrumb: ['Academic', 'Classes'] },
  '/alumni':           { title: 'Alumni',      breadcrumb: ['Manage', 'Alumni'] },
  '/routines':         { title: 'Routines',    breadcrumb: ['Academic', 'Routines'] },
  '/attendance':       { title: 'Attendance & Leaves', breadcrumb: ['Academic', 'Attendance & Leaves'] },
  '/exam-held':        { title: 'Exams',       breadcrumb: ['Academic', 'Exams'] },
  '/exam-results':     { title: 'Results',     breadcrumb: ['Academic', 'Results'] },
  '/finance':          { title: 'Finance Overview', breadcrumb: ['Finance', 'Overview'] },
  '/finance/expenses': { title: 'Institutional Expenses', breadcrumb: ['Finance', 'Expenses'] },
  '/payments':         { title: 'Payments & Fees', breadcrumb: ['Finance', 'Payments'] },
  '/salary':           { title: 'Teacher Salary', breadcrumb: ['Finance', 'Salary'] },
  '/notices':          { title: 'Notices',     breadcrumb: ['Communication', 'Notices'] },
  '/reports':          { title: 'Reports',     breadcrumb: ['Reports'] },
  '/settings':         { title: 'Settings',    breadcrumb: ['System', 'Settings'] },
  '/profile':          { title: 'My Profile',  breadcrumb: ['Profile'] },
  '/subjects':         { title: 'Subjects',    breadcrumb: ['Academic', 'Subjects'] },
  '/batches':          { title: 'Batches',     breadcrumb: ['Academic', 'Batches'] },
  '/rollover':         { title: 'Class Rollover', breadcrumb: ['Academic', 'Rollover'] },
  '/leaves':           { title: 'Attendance & Leaves', breadcrumb: ['Academic', 'Attendance & Leaves'] },
  '/calendar':         { title: 'Calendar',    breadcrumb: ['Academic', 'Calendar'] },
}

// ── Nav Types ──────────────────────────────────────────────────────────────────
type NavItem = {
  to: string
  label: string
  icon: React.ElementType
}

// ── Desktop Sidebar Nav Item ───────────────────────────────────────────────────
function DesktopNavItemLink({ to, label, icon: Icon, isCollapsed }: NavItem & { isCollapsed: boolean }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center ${
          isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
        } rounded-xl transition-all duration-200 font-medium ${
          isActive
            ? 'bg-emerald-500/15 text-emerald-300 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className={`absolute ${
                isCollapsed ? 'left-1 w-1 h-6 rounded-full' : 'left-0 w-1 h-5 rounded-r-md'
              } bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]`}
            />
          )}
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : ''}`}
          />
          {!isCollapsed && <span className="text-[13px] truncate">{label}</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

// ── Mobile Drawer Nav Item ─────────────────────────────────────────────────────
function MobileDrawerNavItemLink({
  to,
  label,
  icon: Icon,
  onNavigate,
}: NavItem & { onNavigate: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium ${
          isActive
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
            : 'text-zinc-300 hover:text-white hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
          <span className="text-[13px]">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ label, isCollapsed }: { label: string; isCollapsed?: boolean }) {
  if (isCollapsed) {
    return <div className="my-2 border-t border-emerald-950/40" />
  }
  return (
    <p className="px-3 text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-1 mt-4">
      {label}
    </p>
  )
}

function Divider() {
  return <div className="my-2 border-t border-emerald-950/40" />
}

// ── Main Layout ────────────────────────────────────────────────────────────────
export function MainLayout() {
  const { user, logout } = useAuthStore()
  const settings = useSettingsStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Desktop Collapsed state (stored in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lms_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  // Mobile Drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotices, setShowNotices] = useState(false)
  const noticeRef = useRef<HTMLDivElement>(null)

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('lms_sidebar_collapsed', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Close notice dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (noticeRef.current && !noticeRef.current.contains(event.target as Node)) {
        setShowNotices(false)
      }
    }
    if (showNotices) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotices])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Dynamic page title
  const currentPage = PAGE_META[location.pathname] ?? { title: 'Dashboard' }

  // Notices
  const recentNotices = useMemo(() => {
    const store = createStore<Notice>('notices')
    const all = store.getAll().filter(n => n.isPublished)
    all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    return all.slice(0, 4)
  }, [])

  const [readNotices, setReadNotices] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('readNotices') || '[]')
    } catch {
      return []
    }
  })

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!readNotices.includes(id)) {
      const updated = [...readNotices, id]
      setReadNotices(updated)
      localStorage.setItem('readNotices', JSON.stringify(updated))
    }
  }

  const unreadCount = recentNotices.filter(n => !readNotices.includes(n.id)).length

  const initials = user?.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'A'

  // Determine whether "More" button on mobile bottom bar is active
  const isPrimaryMobileRoute = ['/', '/students', '/teachers', '/classes'].includes(location.pathname)
  const isMoreActive = !isPrimaryMobileRoute

  return (
    <div className="min-h-screen flex bg-[var(--color-dark-bg)]">

      {/* ─────────────────────────────────────────────────────────────────
          MOBILE DRAWER / SLIDE-SHEET (Visible when sidebarOpen is true)
      ───────────────────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 lg:hidden
          w-[84vw] max-w-[320px] bg-[#0c1e19] text-white
          flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          border-r border-[#15342c]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer Header (Properly spaced, close button cleanly aligned on right) */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#091a16] shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-950/40 shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold text-white leading-tight truncate">
                {settings.schoolName || 'Panjeree LMS'}
              </h2>
              <p className="text-[10px] text-emerald-400/80 mt-0.5 truncate">
                {settings.tagline || 'Institutional ERP'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Drawer Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 hide-scrollbar">
          <SectionLabel label="Main Menu" />
          <MobileDrawerNavItemLink to="/" label="Dashboard" icon={LayoutDashboard} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/students" label="Students" icon={Users} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/teachers" label="Teachers" icon={GraduationCap} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/classes" label="Classes" icon={BookOpen} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/alumni" label="Alumni" icon={AlumniIcon} onNavigate={() => setSidebarOpen(false)} />

          <Divider />
          <SectionLabel label="Academic" />
          <MobileDrawerNavItemLink to="/subjects" label="Subjects" icon={BookCopy} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/batches" label="Batches" icon={Layers} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/routines" label="Routines" icon={CalendarDays} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/calendar" label="Calendar" icon={Calendar} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/attendance" label="Attendance & Leaves" icon={ClipboardCheck} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/exam-held" label="Exams" icon={ClipboardList} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/exam-results" label="Results" icon={Trophy} onNavigate={() => setSidebarOpen(false)} />

          <Divider />
          <SectionLabel label="Finance" />
          <MobileDrawerNavItemLink to="/finance" label="Overview" icon={Scale} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/payments" label="Payments & Fees" icon={Wallet} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/salary" label="Teacher Salary" icon={DollarSign} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/finance/expenses" label="Expenses" icon={Receipt} onNavigate={() => setSidebarOpen(false)} />

          <Divider />
          <SectionLabel label="Communication & Reports" />
          <MobileDrawerNavItemLink to="/notices" label="Notices" icon={Bell} onNavigate={() => setSidebarOpen(false)} />
          <MobileDrawerNavItemLink to="/reports" label="Reports" icon={FileBarChart2} onNavigate={() => setSidebarOpen(false)} />

          <Divider />
          <SectionLabel label="System" />
          <MobileDrawerNavItemLink to="/settings" label="Settings" icon={Settings} onNavigate={() => setSidebarOpen(false)} />
        </div>

        {/* Drawer User & Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-[#091a16] space-y-2 shrink-0">
          <button
            onClick={() => {
              setSidebarOpen(false)
              navigate('/profile')
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-emerald-900/50">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[11px] text-emerald-400/80 truncate capitalize">
                {user?.role?.toLowerCase().replace(/_/g, ' ') || 'Admin'}
              </p>
            </div>
            <ChevronRight size={14} className="text-zinc-400" />
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR (Collapsible Rail & Deep Emerald Brand Theme)
      ───────────────────────────────────────────────────────────────── */}
      <aside
        className={`
          hidden lg:flex flex-col sticky top-0 h-screen
          bg-[#0c1e19] text-white border-r border-[#15342c]
          transition-[width] duration-300 ease-in-out shrink-0 z-30
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div
          className={`h-16 px-4 shrink-0 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } border-b border-white/10 bg-[#091a16]`}
        >
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-2 rounded-xl shadow-md shadow-emerald-950/40 shrink-0">
              <BookOpen size={18} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-[13px] font-bold text-white leading-tight truncate">
                  {settings.schoolName || 'Panjeree LMS'}
                </h1>
                <p className="text-[10px] text-emerald-400/80 mt-0.5 truncate">
                  {settings.tagline || 'Institutional ERP'}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapsed}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5 hide-scrollbar">
          <SectionLabel label="Menu" isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/"         label="Dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/students" label="Students"  icon={Users}           isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/teachers" label="Teachers"  icon={GraduationCap}   isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/classes"  label="Classes"   icon={BookOpen}        isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/alumni"   label="Alumni"    icon={AlumniIcon}      isCollapsed={isCollapsed} />

          <SectionLabel label="Academic" isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/subjects"     label="Subjects"            icon={BookCopy}       isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/batches"      label="Batches"             icon={Layers}         isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/routines"     label="Routines"            icon={CalendarDays}   isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/calendar"     label="Calendar"            icon={Calendar}       isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/attendance"   label="Attendance & Leaves" icon={ClipboardCheck} isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/exam-held"    label="Exams"               icon={ClipboardList}  isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/exam-results" label="Results"             icon={Trophy}         isCollapsed={isCollapsed} />

          <SectionLabel label="Finance" isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/finance"          label="Overview"        icon={Scale}      isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/payments"         label="Payments & Fees" icon={Wallet}     isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/salary"           label="Teacher Salary"  icon={DollarSign} isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/finance/expenses" label="Expenses"        icon={Receipt}    isCollapsed={isCollapsed} />

          <SectionLabel label="Communication" isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/notices" label="Notices" icon={Bell} isCollapsed={isCollapsed} />

          <SectionLabel label="Reports" isCollapsed={isCollapsed} />
          <DesktopNavItemLink to="/reports" label="Reports" icon={FileBarChart2} isCollapsed={isCollapsed} />
        </nav>

        {/* Desktop Bottom: Settings + User */}
        <div className="shrink-0 p-3 border-t border-white/10 bg-[#091a16] space-y-1">
          <DesktopNavItemLink to="/settings" label="Settings" icon={Settings} isCollapsed={isCollapsed} />

          {/* User row */}
          {!isCollapsed ? (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-emerald-950/50">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white truncate">{user?.fullName || 'Administrator'}</p>
                  <p className="text-[10px] text-emerald-400/80 truncate capitalize">
                    {user?.role?.toLowerCase().replace(/_/g, ' ') || 'Admin'}
                  </p>
                </div>
                <ChevronRight size={13} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 justify-center py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                onClick={() => navigate('/profile')}
                title={user?.fullName || 'Profile'}
                className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all"
              >
                {initials}
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[var(--color-dark-bg)]">

        {/* ── Top Header ─────────────────────────────────── */}
        <header className="h-16 flex items-center justify-between px-3.5 sm:px-6 lg:px-8 shrink-0 bg-white border-b border-zinc-200/80 shadow-xs z-20">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile drawer trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Page title + breadcrumb */}
            <div className="min-w-0">
              {currentPage.breadcrumb && (
                <div className="hidden sm:flex items-center gap-1 mb-0.5">
                  {currentPage.breadcrumb.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight size={10} className="text-zinc-400" />}
                      <span
                        className={`text-[11px] font-medium ${
                          i === currentPage.breadcrumb!.length - 1
                            ? 'text-emerald-600 font-semibold'
                            : 'text-zinc-400'
                        }`}
                      >
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight truncate">
                {currentPage.title}
              </h2>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Notification Bell */}
            <div className="relative" ref={noticeRef}>
              <button
                onClick={() => setShowNotices(!showNotices)}
                className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotices && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-50 hide-scrollbar">
                    {recentNotices.length > 0 ? (
                      recentNotices.map(notice => {
                        const isRead = readNotices.includes(notice.id)
                        return (
                          <div
                            key={notice.id}
                            className={`p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3 group ${isRead ? 'opacity-50' : ''}`}
                            onClick={() => { markAsRead(notice.id); setShowNotices(false); navigate('/notices') }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1 gap-2">
                                <span className={`text-[13px] font-semibold line-clamp-1 ${isRead ? 'text-zinc-500' : 'text-zinc-900'}`}>
                                  {notice.title}
                                </span>
                                <span className="text-[10px] text-zinc-400 shrink-0 mt-0.5">
                                  {formatDistanceToNow(parseISO(notice.publishedAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 line-clamp-2">{notice.body}</p>
                            </div>
                            {!isRead && (
                              <button
                                onClick={(e) => markAsRead(notice.id, e)}
                                className="shrink-0 text-zinc-300 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all self-center p-1"
                                title="Mark as read"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-6 text-center">
                        <Bell size={28} className="mx-auto mb-2 text-zinc-200" />
                        <p className="text-sm text-zinc-400">No new notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-zinc-100 bg-zinc-50/50">
                    <button
                      onClick={() => { setShowNotices(false); navigate('/notices') }}
                      className="w-full py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors text-center rounded-lg hover:bg-zinc-100 cursor-pointer"
                    >
                      View All Notices →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l sm:border-zinc-200/80 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-zinc-900 leading-none">{user?.fullName || 'Administrator'}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5 capitalize">
                  {user?.role?.toLowerCase().replace(/_/g, ' ') || 'Admin'}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* ── Page Content (with bottom padding pb-24 on mobile so bottom bar never covers content) ── */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-full pb-24 lg:pb-6 hide-scrollbar">
          <div className="page-enter max-w-full">
            <Outlet />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            MOBILE STICKY BOTTOM NAVIGATION BAR (`lg:hidden`)
        ───────────────────────────────────────────────────────────────── */}
        <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 z-40 lg:hidden flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
          {/* 1. Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-zinc-500 hover:text-zinc-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <LayoutDashboard size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                </div>
                <span className="text-[10px] mt-0.5">Dashboard</span>
              </>
            )}
          </NavLink>

          {/* 2. Students */}
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-zinc-500 hover:text-zinc-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <Users size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                </div>
                <span className="text-[10px] mt-0.5">Students</span>
              </>
            )}
          </NavLink>

          {/* 3. Teachers */}
          <NavLink
            to="/teachers"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-zinc-500 hover:text-zinc-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <GraduationCap size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                </div>
                <span className="text-[10px] mt-0.5">Teachers</span>
              </>
            )}
          </NavLink>

          {/* 4. Classes */}
          <NavLink
            to="/classes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-zinc-500 hover:text-zinc-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <BookOpen size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                </div>
                <span className="text-[10px] mt-0.5">Classes</span>
              </>
            )}
          </NavLink>

          {/* 5. More (Opens the Drawer) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
              isMoreActive ? 'text-emerald-600 font-semibold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isMoreActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              <Menu size={20} strokeWidth={isMoreActive ? 2.3 : 1.8} />
            </div>
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </nav>
      </main>
    </div>
  )
}
