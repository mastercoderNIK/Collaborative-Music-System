import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Callback() {
  const [params] = useSearchParams()
  const { handleCallback } = useAuth()
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = params.get('code')
    if (!code) { navigate('/'); return }

    handleCallback(code)
      .then((userData) => {
        // Small delay ensures React state (setUser) propagates before PrivateRoute checks it
        setTimeout(() => {
          navigate(userData?.is_admin ? '/admin' : '/dashboard', { replace: true })
        }, 100)
      })
      .catch(() => navigate('/', { replace: true }))
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '24px',
      background: 'var(--bg-primary)',
    }}>
      {/* DNA Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'var(--accent-primary)',
          borderRightColor: 'var(--accent-secondary)',
          animation: 'rotate-slow 1s linear infinite',
        }} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--accent-primary)', letterSpacing: '2px' }}>
        AUTHENTICATING
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Securing your DNA Music session…
      </p>
      <style>{`
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
