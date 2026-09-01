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
import { StudentRoutine } from './pages/StudentRoutine'
import { Payments } from './pages/Payments'
import { ExamResultsPage } from './pages/ExamResults'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="/student/routine" element={<StudentRoutine />} />
          <Route path="/finance" element={<FinanceOverview />} />
          <Route path="/finance/expenses" element={<FinanceExpenses />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App