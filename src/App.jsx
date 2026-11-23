import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CircularProgress, Stack } from '@mui/material'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './auth/AuthContext'

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const ClaimsPage = lazy(() => import('./pages/claims/ClaimsPage'))
const MembersPage = lazy(() => import('./pages/members/MembersPage'))
const ObservabilityPage = lazy(() => import('./pages/observability/ObservabilityPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))

export default function App() {
  const { session } = useAuth()
  return <Suspense fallback={<Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}><CircularProgress /></Stack>}><Routes>
    <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route path="/register" element={session ? <Navigate to="/" replace /> : <RegisterPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route index element={<DashboardPage />} /><Route path="claims" element={<ClaimsPage />} /><Route path="members" element={<MembersPage />} /><Route path="observability" element={<ObservabilityPage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
  </Routes></Suspense>
}
