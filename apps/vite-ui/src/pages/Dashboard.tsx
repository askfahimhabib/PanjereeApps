import { useState } from 'react'
import { useDashboardData } from '@/features/dashboard/useDashboardData'
import type { DashboardTab } from '@/features/dashboard/types'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { DashboardKpiCards } from '@/features/dashboard/components/DashboardKpiCards'
import { DashboardActionAlerts } from '@/features/dashboard/components/DashboardActionAlerts'
import { WidgetTodayRoutine } from '@/features/dashboard/components/WidgetTodayRoutine'
import { WidgetAttendancePulse } from '@/features/dashboard/components/WidgetAttendancePulse'
import { WidgetFinanceRadar } from '@/features/dashboard/components/WidgetFinanceRadar'
import { WidgetAcademicExams } from '@/features/dashboard/components/WidgetAcademicExams'
import { WidgetClassDistribution } from '@/features/dashboard/components/WidgetClassDistribution'
import { WidgetNoticesBoard } from '@/features/dashboard/components/WidgetNoticesBoard'
import { WidgetCalendarEvents } from '@/features/dashboard/components/WidgetCalendarEvents'
import { WidgetFacultyStatus } from '@/features/dashboard/components/WidgetFacultyStatus'
import { QuickNoticeModal } from '@/features/dashboard/components/QuickNoticeModal'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import { AddExpenseModal } from '@/features/finance/components/AddExpenseModal'
import { AbsentSmsModal } from '@/features/attendance/components/AbsentSmsModal'
import type { Student } from '@/features/students/types'
import { format } from 'date-fns'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('all')
  const [quickCollectOpen, setQuickCollectOpen] = useState(false)
  const [selectedStudentForCollect, setSelectedStudentForCollect] = useState<Student | null>(null)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [quickNoticeOpen, setQuickNoticeOpen] = useState(false)
  const [absentSmsOpen, setAbsentSmsOpen] = useState(false)

  const {
    kpis,
    classBreakdown,
    batchBreakdown,
    topDueStudents,
    allRoutines,
    upcomingExams,
    publishedResults,
    activeNotices,
    upcomingEvents,
    alerts,
    activeTeachers,
    pendingLeaves,
    currentDayOfWeek,
    refresh,
  } = useDashboardData()

  // Handle 1-click collect from defaulters list
  const handleCollectStudent = (student: Student) => {
    setSelectedStudentForCollect(student)
    setQuickCollectOpen(true)
  }

  const handleCloseCollectModal = () => {
    setQuickCollectOpen(false)
    setSelectedStudentForCollect(null)
    refresh()
  }

  const handleNoticeSaved = () => {
    setQuickNoticeOpen(false)
    refresh()
  }

  // Absent students for SMS modal
  const absentStudentsList = topDueStudents.slice(0, 4).map(d => ({
    id: d.student.id,
    name: d.student.fullNameEn,
    roll: d.student.rollNumber || '01',
    guardianPhone: d.student.guardian?.mobile || d.student.father?.mobile || d.student.mobile,
  }))

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Hero Header & Perspective Tabs ── */}
      <DashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickCollect={() => {
          setSelectedStudentForCollect(null)
          setQuickCollectOpen(true)
        }}
        onOpenAddExpense={() => setAddExpenseOpen(true)}
        onOpenCreateNotice={() => setQuickNoticeOpen(true)}
      />

      {/* ── 2. Executive KPI Cards ── */}
      <DashboardKpiCards kpis={kpis} />

      {/* ── 3. Priority Action Alerts (if any) ── */}
      {alerts.length > 0 && (
        <DashboardActionAlerts alerts={alerts} />
      )}

      {/* ── 4. Main Widget Grid by Tab ── */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Row 1: Today's Live Timetable (2 cols) & Attendance Pulse (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WidgetTodayRoutine
                routines={allRoutines}
                currentDayOfWeek={currentDayOfWeek}
              />
            </div>
            <div className="lg:col-span-1">
              <WidgetAttendancePulse
                kpis={kpis}
                onOpenAbsentSms={() => setAbsentSmsOpen(true)}
              />
            </div>
          </div>

          {/* Row 2: Finance Radar (1 col), Academic Exams (1 col), Campus Notice Board (1 col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WidgetFinanceRadar
              kpis={kpis}
              topDueStudents={topDueStudents}
              onCollectStudent={handleCollectStudent}
              onOpenQuickCollect={() => {
                setSelectedStudentForCollect(null)
                setQuickCollectOpen(true)
              }}
            />

            <WidgetAcademicExams
              upcomingExams={upcomingExams}
              publishedResults={publishedResults}
            />

            <WidgetNoticesBoard
              notices={activeNotices}
              onOpenCreateNotice={() => setQuickNoticeOpen(true)}
            />
          </div>

          {/* Row 3: Class & Batch Capacity (1 col), Events & Holidays (1 col), Faculty Status (1 col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WidgetClassDistribution
              classBreakdown={classBreakdown}
              batchBreakdown={batchBreakdown}
              totalStudents={kpis.totalStudents}
            />

            <WidgetCalendarEvents upcomingEvents={upcomingEvents} />

            <WidgetFacultyStatus
              teachers={activeTeachers}
              pendingLeaves={pendingLeaves}
              onRefresh={refresh}
            />
          </div>
        </div>
      )}

      {/* ── 5. Academic & Routine Focus Tab ── */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WidgetTodayRoutine
                routines={allRoutines}
                currentDayOfWeek={currentDayOfWeek}
              />
            </div>
            <div className="lg:col-span-1">
              <WidgetAcademicExams
                upcomingExams={upcomingExams}
                publishedResults={publishedResults}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WidgetClassDistribution
              classBreakdown={classBreakdown}
              batchBreakdown={batchBreakdown}
              totalStudents={kpis.totalStudents}
            />
            <WidgetCalendarEvents upcomingEvents={upcomingEvents} />
          </div>
        </div>
      )}

      {/* ── 6. Finance Radar Focus Tab ── */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WidgetFinanceRadar
              kpis={kpis}
              topDueStudents={topDueStudents}
              onCollectStudent={handleCollectStudent}
              onOpenQuickCollect={() => {
                setSelectedStudentForCollect(null)
                setQuickCollectOpen(true)
              }}
            />

            <div className="space-y-6">
              <WidgetClassDistribution
                classBreakdown={classBreakdown}
                batchBreakdown={batchBreakdown}
                totalStudents={kpis.totalStudents}
              />
              <WidgetFacultyStatus
                teachers={activeTeachers}
                pendingLeaves={pendingLeaves}
                onRefresh={refresh}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Staff & Attendance Focus Tab ── */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WidgetAttendancePulse
              kpis={kpis}
              onOpenAbsentSms={() => setAbsentSmsOpen(true)}
            />

            <WidgetFacultyStatus
              teachers={activeTeachers}
              pendingLeaves={pendingLeaves}
              onRefresh={refresh}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WidgetNoticesBoard
              notices={activeNotices}
              onOpenCreateNotice={() => setQuickNoticeOpen(true)}
            />
            <WidgetCalendarEvents upcomingEvents={upcomingEvents} />
          </div>
        </div>
      )}

      {/* ── Instant Modals Hub ── */}
      {quickCollectOpen && (
        <QuickCollectModal
          open={quickCollectOpen}
          preselectedStudent={selectedStudentForCollect}
          onClose={handleCloseCollectModal}
          onSuccess={() => handleCloseCollectModal()}
        />
      )}

      {addExpenseOpen && (
        <AddExpenseModal
          open={addExpenseOpen}
          onClose={() => {
            setAddExpenseOpen(false)
            refresh()
          }}
        />
      )}

      {quickNoticeOpen && (
        <QuickNoticeModal
          open={quickNoticeOpen}
          onClose={() => setQuickNoticeOpen(false)}
          onSuccess={handleNoticeSaved}
        />
      )}

      {absentSmsOpen && (
        <AbsentSmsModal
          isOpen={absentSmsOpen}
          onClose={() => setAbsentSmsOpen(false)}
          className="All Active Classes"
          sectionName="General"
          date={format(new Date(), 'yyyy-MM-dd')}
          absentStudents={absentStudentsList}
        />
      )}
    </div>
  )
}
export default Dashboard
