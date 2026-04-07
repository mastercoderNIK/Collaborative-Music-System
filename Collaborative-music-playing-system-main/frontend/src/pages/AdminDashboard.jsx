import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminGetUsers, adminGetGroups, adminGetFeedback, adminDeleteUser, adminDeleteGroup } from '../services/api'

const TABS = [
  { key: 'users', label: '👤 Users', color: 'var(--accent-primary)' },
  { key: 'groups', label: '👥 Groups', color: 'var(--accent-secondary)' },
  { key: 'feedback', label: '📝 Feedback', color: 'var(--accent-green)' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, g, f] = await Promise.all([adminGetUsers(), adminGetGroups(), adminGetFeedback()])
      setUsers(u.data.users || [])
      setGroups(g.data.groups || [])
      setFeedback(f.data.feedback || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Remove this user?')) return
    try { await adminDeleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)) } catch {}
  }

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Remove this group?')) return
    try { await adminDeleteGroup(id); setGroups(prev => prev.filter(g => g.id !== id)) } catch {}
  }

  const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'

  const filter = (arr, keys) =>
    search.trim() ? arr.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(search.toLowerCase()))) : arr

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 36px', height: 64,
        background: 'rgba(8, 14, 36, 0.95)', borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', letterSpacing: 2, color: 'var(--text-primary)' }}>
            DNA<span style={{ color: 'var(--accent-primary)' }}>MUSIC</span>
            <span style={{ marginLeft: 12, padding: '3px 10px', background: 'rgba(255, 45, 120, 0.15)', border: '1px solid rgba(255, 45, 120, 0.4)', borderRadius: 100, fontSize: '0.7rem', color: 'var(--accent-pink)', letterSpacing: 1 }}>ADMIN</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            👑 {user?.name || user?.email}
          </span>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
            Dashboard
          </button>
          <button onClick={logout} style={{ background: 'rgba(255, 45, 120, 0.1)', border: '1px solid rgba(255, 45, 120, 0.3)', color: 'var(--accent-pink)', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding: '36px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
          {[
            { label: 'Total Users', value: users.length, color: 'var(--accent-primary)', icon: '👤' },
            { label: 'Active Groups', value: groups.length, color: 'var(--accent-secondary)', icon: '👥' },
            { label: 'Feedback Items', value: feedback.length, color: 'var(--accent-green)', icon: '📝' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '24px 28px', borderRadius: 20,
              background: 'rgba(11, 21, 48, 0.8)', border: `1px solid ${stat.color}33`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
              </div>
              <div style={{ fontSize: 36, opacity: 0.6 }}>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 6, width: 'fit-content' }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '9px 22px', borderRadius: 10, fontSize: '0.88rem', fontWeight: tab === key ? 600 : 400,
              background: tab === key ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${tab === key ? 'rgba(0, 240, 255, 0.3)' : 'transparent'}`,
              color: tab === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20, maxWidth: 360 }}>
          <input className="input-field" placeholder={`Search ${tab}…`} value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '10px 16px' }} />
        </div>

        {loading && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading…</div>}

        {/* Users Tab */}
        {!loading && tab === 'users' && (
          <AdminTable
            columns={['Name', 'Email', 'Joined', 'Role', 'Actions']}
            rows={filter(users, ['name', 'email'])}
            renderRow={(u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={tdStyle}>{u.name || '—'}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{fmt(u.created_at)}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', background: u.is_admin ? 'rgba(255,45,120,0.15)' : 'rgba(0,240,255,0.1)', color: u.is_admin ? 'var(--accent-pink)' : 'var(--accent-primary)', border: `1px solid ${u.is_admin ? 'rgba(255,45,120,0.3)' : 'rgba(0,240,255,0.2)'}` }}>
                    {u.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {!u.is_admin && (
                    <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: 'var(--accent-pink)', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            )}
          />
        )}

        {/* Groups Tab */}
        {!loading && tab === 'groups' && (
          <AdminTable
            columns={['Group Name', 'Leader', 'Members', 'Created', 'Actions']}
            rows={filter(groups, ['name', 'leader_name'])}
            renderRow={(g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={tdStyle}>{g.name}</td>
                <td style={tdStyle}><span style={{ color: 'var(--accent-secondary)' }}>👑 {g.leader_name || g.leader_email || '—'}</span></td>
                <td style={tdStyle}>{g.member_count || 1}</td>
                <td style={tdStyle}>{fmt(g.created_at)}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleDeleteGroup(g.id)} style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: 'var(--accent-pink)', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Dissolve
                  </button>
                </td>
              </tr>
            )}
          />
        )}

        {/* Feedback Tab */}
        {!loading && tab === 'feedback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filter(feedback, ['message', 'username', 'email']).length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No feedback submitted yet</div>
            )}
            {filter(feedback, ['message', 'username', 'email']).map(fb => (
              <div key={fb.id} style={{ padding: '22px 28px', borderRadius: 18, background: 'rgba(11, 21, 48, 0.8)', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                      {(fb.username || fb.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{fb.username || fb.email}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fb.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(fb.created_at)}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {fb.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const tdStyle = { padding: '12px 16px', fontSize: '0.86rem', color: 'var(--text-secondary)', verticalAlign: 'middle' }

function AdminTable({ columns, rows, renderRow }) {
  return (
    <div style={{ background: 'rgba(11, 21, 48, 0.8)', borderRadius: 18, border: '1px solid rgba(0, 240, 255, 0.1)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.12)' }}>
            {columns.map(col => (
              <th key={col} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: 1, fontWeight: 600 }}>
                {col.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>No records found</td></tr>
          ) : rows.map(renderRow)}
        </tbody>
      </table>
    </div>
  )
}
