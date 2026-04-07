import React, { useState, useEffect } from 'react'
import { useMusic } from '../context/MusicContext'
import { useAuth } from '../context/AuthContext'
import { createGroup, joinGroup, getMyGroups, leaveGroup, getGroupMembers, deleteGroup } from '../services/api'

export default function GroupPanel() {
  const { user } = useAuth()
  const { setActiveGroup, setIsGroupLeader, activeGroup } = useMusic()
  const [groups, setGroups] = useState([])
  const [tab, setTab] = useState('mine') // 'mine' | 'create' | 'join'
  const [newName, setNewName] = useState('')
  const [joinToken, setJoinToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState([])
  const [copiedToken, setCopiedToken] = useState('')

  const fetchGroups = async () => {
    try {
      const { data } = await getMyGroups()
      setGroups(data.groups || [])
    } catch {}
  }

  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setLoading(true); setError('')
    try {
      const { data } = await createGroup(newName.trim())
      setGroups(prev => [data.group, ...prev])
      setNewName('')
      setTab('mine')
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create group')
    } finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if (!joinToken.trim()) return
    setLoading(true); setError('')
    try {
      const { data } = await joinGroup(joinToken.trim())
      setGroups(prev => [data.group, ...prev])
      setJoinToken('')
      setTab('mine')
    } catch (e) {
      setError(e.response?.data?.error || 'Invalid token')
    } finally { setLoading(false) }
  }

  const selectGroup = async (group) => {
    setActiveGroup(group)
    setIsGroupLeader(group.leader_id === user?.id)
    try {
      const { data } = await getGroupMembers(group.id)
      setMembers(data.members || [])
    } catch {}
  }

  const copyToken = (token) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  const handleLeave = async (groupId) => {
    try {
      await leaveGroup(groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
      if (activeGroup?.id === groupId) {
        setActiveGroup(null)
        setIsGroupLeader(false)
        // Clear localStorage so the group doesn't restore on reload
        localStorage.removeItem('dna_active_group')
        localStorage.removeItem('dna_is_leader')
        localStorage.removeItem('dna_current_track')
      }
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to leave group'
      setError(msg)
    }
  }

  const handleDelete = async (groupId) => {
    if (!window.confirm('Delete this group? All members will be removed.')) return
    try {
      await deleteGroup(groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
      if (activeGroup?.id === groupId) {
        setActiveGroup(null)
        setIsGroupLeader(false)
        localStorage.removeItem('dna_active_group')
        localStorage.removeItem('dna_is_leader')
        localStorage.removeItem('dna_current_track')
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete group')
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--accent-primary)', letterSpacing: 2, marginBottom: 16 }}>
        GROUPS
      </h3>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
        {[['mine', 'My Groups'], ['create', 'Create'], ['join', 'Join']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '6px 0', borderRadius: 7, fontSize: '0.78rem',
            background: tab === key ? 'var(--accent-secondary)' : 'transparent',
            color: tab === key ? '#fff' : 'var(--text-secondary)',
            fontWeight: tab === key ? 600 : 400,
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {error && <div style={{ color: 'var(--accent-pink)', fontSize: '0.8rem', marginBottom: 10 }}>{error}</div>}

      {/* Create */}
      {tab === 'create' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input-field" placeholder="Group name…" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ padding: '10px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : '+ Create Group'}
          </button>
        </div>
      )}

      {/* Join */}
      {tab === 'join' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input-field" placeholder="Paste group token…" value={joinToken}
            onChange={e => setJoinToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <button className="btn-primary" onClick={handleJoin} disabled={loading} style={{ padding: '10px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Joining…' : '→ Join Group'}
          </button>
        </div>
      )}

      {/* My Groups */}
      {tab === 'mine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groups.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              No groups yet. Create or join one!
            </div>
          )}
          {groups.map(group => (
            <div key={group.id} style={{
              padding: '12px 14px', borderRadius: 12,
              background: activeGroup?.id === group.id ? 'rgba(123, 47, 255, 0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeGroup?.id === group.id ? 'rgba(123, 47, 255, 0.4)' : 'var(--border-color)'}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{group.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {group.leader_id === user?.id ? '👑 Leader' : '👤 Member'} · {group.member_count || 1} member(s)
                  </div>
                </div>
                <button onClick={() => selectGroup(group)} style={{
                  background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)',
                  color: 'var(--accent-primary)', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer',
                }}>
                  {activeGroup?.id === group.id ? '✓ Active' : 'Select'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => copyToken(group.token)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)', borderRadius: 6, padding: '3px 8px', fontSize: '0.7rem', cursor: 'pointer',
                }}>
                  {copiedToken === group.token ? '✓ Copied!' : '📋 Token'}
                </button>
                {group.leader_id === user?.id ? (
                  <button onClick={() => handleDelete(group.id)} style={{
                    background: 'rgba(255, 45, 120, 0.1)', border: '1px solid rgba(255, 45, 120, 0.3)',
                    color: 'var(--accent-pink)', borderRadius: 6, padding: '3px 8px',
                    fontSize: '0.7rem', cursor: 'pointer',
                  }}>🗑 Delete</button>
                ) : (
                  <button onClick={() => handleLeave(group.id)} style={{
                    background: 'rgba(255, 45, 120, 0.1)', border: '1px solid rgba(255, 45, 120, 0.2)',
                    color: 'var(--accent-pink)', borderRadius: 6, padding: '3px 8px',
                    fontSize: '0.7rem', cursor: 'pointer',
                  }}>Leave</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
