import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import LoadingSpinner from './components/ui/LoadingSpinner'
import useAuth from './hooks/useAuth'

import LoginPage from './pages/LoginPage'
import DetectPage from './pages/user/DetectPage'
import MyHistoryPage from './pages/user/MyHistoryPage'
import MyMapPage from './pages/user/MyMapPage'
import DashboardPage from './pages/admin/DashboardPage'
import LiveMapPage from './pages/admin/LiveMapPage'
import AlertsPage from './pages/admin/AlertsPage'
import AllDetectionsPage from './pages/admin/AllDetectionsPage'
import ReportsPage from './pages/admin/ReportsPage'
import MunicipalityPage from './pages/admin/MunicipalityPage'
import SettingsPage from './pages/admin/SettingsPage'

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function RootRedirect() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <LoadingSpinner fullscreen />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/detect'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/detect"
        element={(
          <ProtectedRoute>
            <AppLayout><DetectPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/my-history"
        element={(
          <ProtectedRoute>
            <AppLayout><MyHistoryPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/my-map"
        element={(
          <ProtectedRoute>
            <AppLayout><MyMapPage /></AppLayout>
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/dashboard"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><DashboardPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/map"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><LiveMapPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/alerts"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><AlertsPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/detections"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><AllDetectionsPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/reports"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><ReportsPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/municipality"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><MunicipalityPage /></AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/settings"
        element={(
          <ProtectedRoute adminOnly>
            <AppLayout><SettingsPage /></AppLayout>
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#28a745', secondary: 'white' } },
            error: { iconTheme: { primary: '#dc3545', secondary: 'white' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
