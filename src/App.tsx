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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:studentId" element={<StudentProfile />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/admin/classes/:classId" element={<ClassDetail />} />
          <Route path="/admin/classes/:classId/groups/:groupId" element={<GroupDetail />} />
          <Route path="/admin/classes/:classId/sections/:sectionId" element={<SectionDetail />} />
          <Route path="/admin/classes/:classId/groups/:groupId/sections/:sectionId" element={<SectionDetail />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/exam-held" element={<ExamHeldPage />} />
          <Route path="/exam-results" element={<ExamResultsPage />} />
          <Route path="/student/routine" element={<StudentRoutine />} />
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