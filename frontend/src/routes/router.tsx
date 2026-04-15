import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AppointmentsPage from '../pages/AppointmentsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default AppRoutes


