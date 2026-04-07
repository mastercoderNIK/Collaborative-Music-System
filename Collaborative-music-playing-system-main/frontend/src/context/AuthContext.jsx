import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'

// ── Cognito Config (from your AWS screenshots) ──────────────────────────────
export const COGNITO_CONFIG = {
  domain: 'https://ap-south-13riyjhfmu.auth.ap-south-1.amazoncognito.com',
  clientId: '1papbh7lig8dd7kka4gk99ngru',
  redirectUri: 'https://music.iamshadow.link/callback',
  logoutUri: 'https://music.iamshadow.link',
  scopes: 'openid email profile',
  responseType: 'code',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // ── Restore session from localStorage ───────────────────────────────────
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    if (accessToken && userData) {
      try {
        const decoded = jwtDecode(accessToken)
        const now = Date.now() / 1000
        if (decoded.exp > now) {
          const parsed = JSON.parse(userData)
          setUser(parsed)
          setIsAdmin(parsed.is_admin || false)
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        } else {
          clearSession()
        }
      } catch {
        clearSession()
      }
    }
    setLoading(false)
  }, [])

  // ── Handle OAuth callback code exchange ─────────────────────────────────
  const handleCallback = useCallback(async (code) => {
    try {
      const { data } = await api.post('/api/auth/callback', { code })
      const { access_token, user: userData } = data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setUser(userData)
      setIsAdmin(userData.is_admin || false)
      return userData
    } catch (err) {
      console.error('Auth callback failed:', err)
      throw err
    }
  }, [])

  // ── Login redirect ───────────────────────────────────────────────────────
  const login = useCallback(() => {
    const params = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      response_type: COGNITO_CONFIG.responseType,
      scope: COGNITO_CONFIG.scopes,
      redirect_uri: COGNITO_CONFIG.redirectUri,
    })
    window.location.href = `${COGNITO_CONFIG.domain}/oauth2/authorize?${params}`
  }, [])

  // ── Signup redirect ──────────────────────────────────────────────────────
  const signup = useCallback(() => {
    const params = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      response_type: COGNITO_CONFIG.responseType,
      scope: COGNITO_CONFIG.scopes,
      redirect_uri: COGNITO_CONFIG.redirectUri,
    })
    window.location.href = `${COGNITO_CONFIG.domain}/signup?${params}`
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession()
    const params = new URLSearchParams({
      client_id: COGNITO_CONFIG.clientId,
      logout_uri: COGNITO_CONFIG.logoutUri,
    })
    window.location.href = `${COGNITO_CONFIG.domain}/logout?${params}`
  }, [])

  const clearSession = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, handleCallback }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
