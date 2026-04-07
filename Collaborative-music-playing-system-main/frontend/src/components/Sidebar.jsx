import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ activePanel, onPanelChange, onFeedback }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Regular user nav
  const USER_NAV = [
    { icon: '🎵', label: 'Dashboard', key: 'dashboard' },
    { icon: '👥', label: 'Groups', key: 'groups' },
    { icon: '💬', label: 'Chat', key: 'chat' },
    { icon: '🗳️', label: 'Votes', key: 'votes' },
    { icon: 'ℹ️', label: 'About', key: 'about' },
  ]

  // Admin nav — no groups/chat/votes
  const ADMIN_NAV = [
    { icon: '🛡️', label: 'Admin Panel', key: 'admin' },
    { icon: 'ℹ️', label: 'About', key: 'about' },
  ]

  const navItems = isAdmin ? ADMIN_NAV : USER_NAV

  const handleNav = (key) => {
    if (key === 'about') { navigate('/about'); return }
    if (key === 'admin') { navigate('/admin'); return }
    onPanelChange(key)
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'rgba(8, 14, 36, 0.95)',
      borderRight: '1px solid rgba(0, 240, 255, 0.07)',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 20px',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
          }}>D</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: 2, color: 'var(--text-primary)' }}>
            DNA<span style={{ color: 'var(--accent-primary)' }}>MUSIC</span>
          </span>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isAdmin
              ? 'linear-gradient(135deg, #ff2d78, #7b2fff)'
              : 'linear-gradient(135deg, var(--accent-secondary), var(--accent-pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', color: '#fff',
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
              {user?.name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: '0.7rem', color: isAdmin ? 'var(--accent-pink)' : 'var(--text-muted)' }}>
              {isAdmin ? '👑 Admin' : '🎵 Listener'}
            </div>
          </div>
        </div>

        {/* Admin notice */}
        {isAdmin && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255, 45, 120, 0.08)', border: '1px solid rgba(255, 45, 120, 0.2)',
            fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            Admin accounts cannot join groups or listen to music. Use the Admin Panel to manage the platform.
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ icon, label, key }) => {
          const isActive = activePanel === key
          return (
            <button key={key} onClick={() => handleNav(key)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0, 240, 255, 0.25)' : 'transparent'}`,
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.88rem', fontWeight: isActive ? 600 : 400,
              textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!isAdmin && (
          <button onClick={onFeedback} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.15)',
            color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.06)'}
          >
            <span>📝</span> Feedback
          </button>
        )}

        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 10,
          background: 'transparent', border: '1px solid transparent',
          color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 45, 120, 0.08)'; e.currentTarget.style.color = 'var(--accent-pink)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <span>🚪</span> Log Out
        </button>
      </div>
    </aside>
  )
}