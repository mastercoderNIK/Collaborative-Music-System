import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MusicProvider } from './context/MusicContext'
import { SocketProvider } from './context/SocketContext'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'
import Callback from './pages/Callback'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  // Fallback: check localStorage directly in case React state hasn't propagated yet
  const storedUser = localStorage.getItem('user_data')
  const storedToken = localStorage.getItem('access_token')
  const hasSession = !!storedUser && !!storedToken

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
      Loading…
    </div>
  )

  if (!user && !hasSession) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  const token = localStorage.getItem('access_token')

  return (
    <SocketProvider token={token}>
      <MusicProvider>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Welcome />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MusicProvider>
    </SocketProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
