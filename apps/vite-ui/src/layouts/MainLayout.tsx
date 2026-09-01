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
  GraduationCap as AlumniIcon, BookCopy, Layers, DollarSign, Calendar,
  Scale, Receipt
} from 'lucide-react'

// ── Page Title Map ─────────────────────────────────────────────────────────────
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

// ── NavItemLink ────────────────────────────────────────────────────────────────
function NavItemLink({ to, label, icon: Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
          isActive
            ? 'nav-active-indicator bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] shadow-sm'
            : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/80'
        }`
      }
    >
      <Icon size={17} strokeWidth={2} />
      <span className="text-[13px]">{label}</span>
    </NavLink>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 mt-4">
      {label}
    </p>
  )
}

function Divider() {
  return <div className="my-2 border-t border-zinc-100" />
}

// ── Main Layout ────────────────────────────────────────────────────────────────
export function MainLayout() {
  const { user, logout } = useAuthStore()
  const settings = useSettingsStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotices, setShowNotices] = useState(false)
  const noticeRef = useRef<HTMLDivElement>(null)

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

  const [readNotices, setReadNotices] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem('readNotices') || '[]')
  )

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
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'A'

  return (
    <div className="min-h-screen flex bg-[var(--color-dark-bg)]">

      {/* ── Mobile Overlay ───────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: sticky, mobile: drawer) ────── */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 lg:z-auto
          w-64 h-screen bg-[var(--color-sidebar-bg)]
          flex flex-col overflow-hidden shrink-0
          border-r border-zinc-100
          shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 shrink-0 flex items-center gap-3 border-b border-zinc-100">
          <div className="bg-[var(--color-primary)] text-white p-2 rounded-xl shadow-md shadow-green-200/60 shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] font-bold text-zinc-900 leading-tight truncate">
              {settings.schoolName || 'Panjeree LMS'}
            </h1>
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
              {settings.tagline || 'Institutional ERP'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto py-3 space-y-0.5 scrollbar-thin">
          <SectionLabel label="Menu" />
          <NavItemLink to="/"         label="Dashboard" icon={LayoutDashboard} />
          <NavItemLink to="/students" label="Students"  icon={Users} />
          <NavItemLink to="/teachers" label="Teachers"  icon={GraduationCap} />
          <NavItemLink to="/classes"  label="Classes"   icon={BookOpen} />
          <NavItemLink to="/alumni"   label="Alumni"    icon={AlumniIcon} />

          <Divider />
          <SectionLabel label="Academic" />
          <NavItemLink to="/subjects"    label="Subjects"   icon={BookCopy} />
          <NavItemLink to="/batches"     label="Batches"    icon={Layers} />
          <NavItemLink to="/routines"    label="Routines"   icon={CalendarDays} />
          <NavItemLink to="/calendar"    label="Calendar"   icon={Calendar} />
          <NavItemLink to="/attendance"  label="Attendance & Leaves" icon={ClipboardCheck} />
          <NavItemLink to="/exam-held"   label="Exams"      icon={ClipboardList} />
          <NavItemLink to="/exam-results" label="Results"   icon={Trophy} />

          <Divider />
          <SectionLabel label="Finance" />
          <NavItemLink to="/finance"          label="Overview"          icon={Scale} />
          <NavItemLink to="/payments"         label="Payments & Fees"   icon={Wallet} />
          <NavItemLink to="/salary"           label="Teacher Salary"    icon={DollarSign} />
          <NavItemLink to="/finance/expenses" label="Expenses"          icon={Receipt} />

          <Divider />
          <SectionLabel label="Communication" />
          <NavItemLink to="/notices" label="Notices" icon={Bell} />

          <Divider />
          <SectionLabel label="Reports" />
          <NavItemLink to="/reports" label="Reports" icon={FileBarChart2} />
        </nav>

        {/* Bottom: User + Settings */}
        <div className="shrink-0 px-3 pb-4 pt-3 border-t border-zinc-100 space-y-1">
          <NavItemLink to="/settings" label="Settings" icon={Settings} />

          {/* User row */}
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-zinc-900 truncate">{user?.fullName}</p>
              <p className="text-[11px] text-zinc-400 truncate capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</p>
            </div>
            <ChevronRight size={13} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[var(--color-dark-bg)]">

        {/* ── Top Header ─────────────────────────────────── */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white border-b border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Page title + breadcrumb */}
            <div>
              {currentPage.breadcrumb && (
                <div className="flex items-center gap-1 mb-0.5">
                  {currentPage.breadcrumb.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight size={10} className="text-zinc-300" />}
                      <span className={`text-[11px] font-medium ${i === currentPage.breadcrumb!.length - 1 ? 'text-[var(--color-primary)]' : 'text-zinc-400'}`}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-lg font-bold text-zinc-900 leading-none">
                {currentPage.title}
              </h2>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Notification Bell */}
            <div className="relative" ref={noticeRef}>
              <button
                onClick={() => setShowNotices(!showNotices)}
                className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)]/20 transition-all relative"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Dropdown */}
              {showNotices && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-50">
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
                                className="shrink-0 text-zinc-300 hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all self-center p-1"
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
                      className="w-full py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors text-center rounded-lg hover:bg-zinc-100"
                    >
                      View All Notices →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User avatar (header only — no sidebar duplication) */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 pl-3 border-l border-zinc-100 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-zinc-900 leading-none">{user?.fullName}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5 capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</p>
              </div>
            </button>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
