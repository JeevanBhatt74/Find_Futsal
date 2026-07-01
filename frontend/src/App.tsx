import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import VenuesPage from '@/pages/VenuesPage'
import VenueDetailPage from '@/pages/VenueDetailPage'
import BookingPage from '@/pages/BookingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ListVenuePage from '@/pages/ListVenuePage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import ProfilePage from '@/pages/ProfilePage'
import MyBookingsPage from '@/pages/MyBookingsPage'
import AdminDashboard from '@/pages/AdminDashboard'
import NotFoundPage from '@/pages/NotFoundPage'
import { useAuthStore } from '@/store'

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Save attempts to access specific pages and redirect after successful sign-in
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

// ─── Admin Route Wrapper ──────────────────────────────────────────────────────
function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                      element={<HomePage />} />
          <Route path="/venues"                element={<VenuesPage />} />
          <Route path="/venues/:venueId"       element={<VenueDetailPage />} />
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/register"              element={<RegisterPage />} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/list-venue"            element={<ListVenuePage />} />
          <Route path="/privacy"               element={<PrivacyPage />} />
          <Route path="/terms"                 element={<TermsPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/venues/:venueId/book"  element={<BookingPage />} />
            <Route path="/profile"               element={<ProfilePage />} />
            <Route path="/bookings"              element={<MyBookingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/*"               element={<AdminDashboard />} />
          </Route>

          <Route path="*"                      element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
