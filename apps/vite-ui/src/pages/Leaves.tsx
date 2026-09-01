import { Navigate } from 'react-router-dom'

export function Leaves() {
  // Redirect to unified Attendance & Leaves Hub tab
  return <Navigate to="/attendance?tab=student-leaves" replace />
}
