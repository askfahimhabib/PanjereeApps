import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { Classes } from './pages/Classes'
import { ClassDetail } from './pages/ClassDetail'
import { GroupDetail } from './pages/GroupDetail'
import { SectionDetail } from './pages/SectionDetail'
import { Teachers } from './pages/Teachers'
import { Attendance } from './pages/Attendance'
import { Notices } from './pages/Notices'
import { Alumni } from './pages/Alumni'
import { Routines } from './pages/Routines'
import { ExamHeldPage } from './pages/ExamHeld'
import { ExamResultsPage } from './pages/ExamResults'
import { Payments } from './pages/Payments'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { AdminProfile } from './pages/AdminProfile'
import { StudentProfile } from './pages/StudentProfile'
import { TeacherProfile } from './pages/TeacherProfile'
import { Subjects } from './pages/Subjects'
import { Batches } from './pages/Batches'
import { ClassRollover } from './pages/ClassRollover'
import { TeacherSalary } from './pages/TeacherSalary'
import { Leaves } from './pages/Leaves'
import { CalendarPage } from './pages/CalendarPage'
import { FinanceOverview } from './pages/FinanceOverview'
import { FinanceExpenses } from './pages/FinanceExpenses'

// Student Portal Imports
import { StudentSessionProvider } from './features/student-portal/hooks/useStudentSession'
import { StudentLayout } from './layouts/StudentLayout'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { StudentRoutine as StudentRoutinePage } from './pages/student/StudentRoutine'
import { StudentResults as StudentResultsPage } from './pages/student/StudentResults'
import { StudentAttendance as StudentAttendancePage } from './pages/student/StudentAttendance'
import { StudentFees as StudentFeesPage } from './pages/student/StudentFees'
import { StudentNotices as StudentNoticesPage } from './pages/student/StudentNotices'
import { useEffect } from 'react'
import { useSettingsStore } from './store/settings'
import { StudentSubjects as StudentSubjectsPage } from './pages/student/StudentSubjects'
import { StudentCalendar as StudentCalendarPage } from './pages/student/StudentCalendar'
import { StudentProfile as StudentProfilePage } from './pages/student/StudentProfile'
import { StudentSettings as StudentSettingsPage } from './pages/student/StudentSettings'
import { Toaster } from './components/ui/Toast'

function App() {
  const schoolName = useSettingsStore((s) => s.schoolName)

  useEffect(() => {
    document.title = schoolName ? `${schoolName} | LMS` : 'Panjeree LMS'
  }, [schoolName])

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Admin & Management Staff Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:studentId" element={<StudentProfile />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/rollover" element={<ClassRollover />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/admin/classes/:classId" element={<ClassDetail />} />
          <Route path="/admin/classes/:classId/groups/:groupId" element={<GroupDetail />} />
          <Route path="/admin/classes/:classId/sections/:sectionId" element={<SectionDetail />} />
          <Route path="/admin/classes/:classId/groups/:groupId/sections/:sectionId" element={<SectionDetail />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/salary" element={<TeacherSalary />} />
          <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
          <Route path="/salary" element={<TeacherSalary />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/exam-held" element={<ExamHeldPage />} />
          <Route path="/exam-results" element={<ExamResultsPage />} />
          <Route path="/finance" element={<FinanceOverview />} />
          <Route path="/finance/expenses" element={<FinanceExpenses />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<AdminProfile />} />
        </Route>

        {/* Dedicated Student Portal Layout */}
        <Route
          element={
            <StudentSessionProvider>
              <StudentLayout />
            </StudentSessionProvider>
          }
        >
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/routine" element={<StudentRoutinePage />} />
          <Route path="/student/results" element={<StudentResultsPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/fees" element={<StudentFeesPage />} />
          <Route path="/student/notices" element={<StudentNoticesPage />} />
          <Route path="/student/subjects" element={<StudentSubjectsPage />} />
          <Route path="/student/calendar" element={<StudentCalendarPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/settings" element={<StudentSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App