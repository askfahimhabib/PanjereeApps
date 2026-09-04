import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Users,
  CalendarCheck,
  Wallet,
  GraduationCap,
  Briefcase,
  Printer,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { classStore } from '@/data/stores'
import { StudentReportsTab } from '../features/reports/components/StudentReportsTab'
import { AttendanceReport } from '../features/reports/components/AttendanceReport'
import { PaymentReport } from '../features/reports/components/PaymentReport'
import { AcademicReportsTab } from '../features/reports/components/AcademicReportsTab'
import { FacultyReportsTab } from '../features/reports/components/FacultyReportsTab'
import { useLiveReports } from '../features/reports/useLiveReports'
import type { ReportFilter } from '../features/reports/types'
import { formatCurrency } from '../features/payments/types'

type TabKey = 'students' | 'attendance' | 'payment' | 'academic' | 'faculty'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'students',   label: 'Students & Enrollment', icon: Users },
  { key: 'attendance', label: 'Attendance Analysis',   icon: CalendarCheck },
  { key: 'payment',    label: 'Finance & Accounts',     icon: Wallet },
  { key: 'academic',   label: 'Academics & Exams',     icon: GraduationCap },
  { key: 'faculty',    label: 'Faculty & Staff HR',    icon: Briefcase },
]

export function Reports() {
  const [activeTab, setActiveTab] = useState<TabKey>('students')

  // Global filters
  const [filter, setFilter] = useState<ReportFilter>({
    classId: null,
    shift: null,
    searchQuery: '',
    examId: null,
  })

  // Fetch real stores data via hook
  const {
    overviewMetrics,
    studentData,
    attendanceData,
    paymentData,
    academicData,
    facultyData,
  } = useLiveReports(filter)

  // Classes for filter dropdown
  const classes = useMemo(() => classStore.getAll().filter((c) => c.isActive !== false), [])

  const hasActiveFilters = filter.classId !== null || filter.shift !== null || !!filter.searchQuery

  const handleResetFilters = () => {
    setFilter({
      classId: null,
      shift: null,
      searchQuery: '',
      examId: null,
    })
  }

  // Horizontal scrolling logic for tabs
  const tabsRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
  }, [])

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [checkScroll])

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return
    const offset = direction === 'left' ? -220 : 220
    tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    setTimeout(checkScroll, 320)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (tabsRef.current && e.deltaY !== 0) {
      tabsRef.current.scrollLeft += e.deltaY * 0.8
      checkScroll()
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Institutional Reports &amp; Analytics</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Store Sync
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Official institutional analytics, student rosters, attendance trends, financial audit ledgers, and faculty metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer size={15} className="text-zinc-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Executive Institutional Health Banner ───────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Students</span>
          <p className="text-lg font-bold text-zinc-900 mt-1">{overviewMetrics.totalStudents}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Active enrolled</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Faculty</span>
          <p className="text-lg font-bold text-zinc-900 mt-1">{overviewMetrics.totalTeachers}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Teaching staff</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Class Cohorts</span>
          <p className="text-lg font-bold text-zinc-900 mt-1">{overviewMetrics.totalClasses}</p>
          <span className="text-[10px] text-zinc-500 font-medium">Active grades</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Today's Attendance</span>
          <p className="text-lg font-bold text-emerald-600 mt-1">{overviewMetrics.overallAttendanceRate}%</p>
          <span className="text-[10px] text-zinc-500 font-medium">Real-time presence</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Collections</span>
          <p className="text-base font-bold text-zinc-900 mt-1 truncate" title={formatCurrency(overviewMetrics.totalCollected)}>
            {formatCurrency(overviewMetrics.totalCollected)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Total fees paid</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Unpaid Dues</span>
          <p className="text-base font-bold text-amber-600 mt-1 truncate" title={formatCurrency(overviewMetrics.totalOutstandingDues)}>
            {formatCurrency(overviewMetrics.totalOutstandingDues)}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Student arrears</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Expenditures</span>
          <p className="text-base font-bold text-rose-600 mt-1 truncate" title={formatCurrency(overviewMetrics.totalExpenses)}>
            {formatCurrency(overviewMetrics.totalExpenses)}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Operations &amp; pay</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Net Cash Flow</span>
          <p
            className={`text-base font-bold mt-1 truncate ${
              overviewMetrics.netSurplus >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
            title={formatCurrency(overviewMetrics.netSurplus)}
          >
            {formatCurrency(overviewMetrics.netSurplus)}
          </p>
          <span className="text-[10px] text-zinc-500 font-medium">Balance surplus</span>
        </div>
      </div>

      {/* ── 3. Navigation Tabs & Global Filters ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
        {/* Scrollable Tab Navigation with Arrow Controls */}
        <div className="relative flex items-center min-w-0 max-w-full">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-xs transition-all mr-1.5 shrink-0 cursor-pointer ${
              !canScrollLeft
                ? 'opacity-30 pointer-events-none'
                : 'hover:bg-zinc-50 hover:border-zinc-300 active:scale-95'
            }`}
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Tab Pills Track */}
          <div
            ref={tabsRef}
            onScroll={checkScroll}
            onWheel={handleWheel}
            className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-x-auto scroll-smooth scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={(e) => {
                    setActiveTab(tab.key)
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-zinc-400'} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-xs transition-all ml-1.5 shrink-0 cursor-pointer ${
              !canScrollRight
                ? 'opacity-30 pointer-events-none'
                : 'hover:bg-zinc-50 hover:border-zinc-300 active:scale-95'
            }`}
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <select
            value={filter.classId || 'ALL'}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                classId: e.target.value === 'ALL' ? null : e.target.value,
              }))
            }
            className="py-2 px-3 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-700 font-medium focus:outline-none focus:border-zinc-400 shadow-xs"
          >
            <option value="ALL">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            value={filter.shift || 'ALL'}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                shift: e.target.value === 'ALL' ? null : e.target.value,
              }))
            }
            className="py-2 px-3 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-700 font-medium focus:outline-none focus:border-zinc-400 shadow-xs"
          >
            <option value="ALL">All Shifts</option>
            <option value="Morning">Morning Shift</option>
            <option value="Day">Day Shift</option>
          </select>

          {/* Search Query */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  searchQuery: e.target.value,
                }))
              }
              placeholder="Search data records..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 shadow-xs"
            />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Active Tab Content ──────────────────────────────────────── */}
      <div className="animate-fadeIn">
        {activeTab === 'students' && <StudentReportsTab data={studentData} />}
        {activeTab === 'attendance' && <AttendanceReport data={attendanceData} />}
        {activeTab === 'payment' && <PaymentReport data={paymentData} />}
        {activeTab === 'academic' && (
          <AcademicReportsTab
            data={academicData}
            selectedExamId={filter.examId}
            onSelectExam={(examId) => setFilter((prev) => ({ ...prev, examId }))}
          />
        )}
        {activeTab === 'faculty' && <FacultyReportsTab data={facultyData} />}
      </div>
    </div>
  )
}

export default Reports
