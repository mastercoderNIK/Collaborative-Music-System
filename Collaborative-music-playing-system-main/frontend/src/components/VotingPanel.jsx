import React, { useState, useEffect, useCallback } from 'react'
import { castVote, getVoteTally } from '../services/api'
import { useSocket } from '../context/SocketContext'
import { useMusic } from '../context/MusicContext'

const VOTE_TYPES = [
  { key: 'skip', label: '⏭ Skip', color: 'var(--accent-pink)' },
  { key: 'like', label: '👍 Like', color: 'var(--accent-green)' },
  { key: 'dislike', label: '👎 Dislike', color: 'var(--text-secondary)' },
  { key: 'replay', label: '🔁 Replay', color: 'var(--accent-primary)' },
]

const THRESHOLD = 60

export default function VotingPanel({ onSkip, onReplay }) {
  const { activeGroup, isGroupLeader } = useMusic()
  const { on } = useSocket() || {}
  const [tally, setTally] = useState({ skip: 0, like: 0, dislike: 0, replay: 0, total: 1 })
  const [myVote, setMyVote] = useState(null)
  const [triggered, setTriggered] = useState(null)

  const fetchTally = useCallback(async () => {
    if (!activeGroup) return
    try {
      const { data } = await getVoteTally(activeGroup.id)
      setTally(data)
      checkThreshold(data)
    } catch {}
  }, [activeGroup?.id])

  useEffect(() => {
    fetchTally()
    const interval = setInterval(fetchTally, 5000)
    return () => clearInterval(interval)
  }, [fetchTally])

  useEffect(() => {
    if (!on) return
    const off = on('vote_update', (data) => {
      setTally(data)
      checkThreshold(data)
    })
    return off
  }, [on, activeGroup?.id])

  const checkThreshold = (t) => {
    if (!t.total) return
    const pct = (v) => Math.round((v / t.total) * 100)
    if (pct(t.skip) >= THRESHOLD) {
      setTriggered('skip')
      onSkip && setTimeout(onSkip, 500)
    }
    if (pct(t.replay) >= THRESHOLD) {
      setTriggered('replay')
      onReplay && setTimeout(onReplay, 500)
    }
  }

  const handleVote = async (type) => {
    if (!activeGroup || isGroupLeader) return
    if (myVote === type) return
    try {
      await castVote(activeGroup.id, type)
      setMyVote(type)
      fetchTally()
    } catch {}
  }

  if (!activeGroup) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>
        Join a group to vote
      </div>
    )
  }

  const pct = (v) => tally.total > 0 ? Math.round((v / tally.total) * 100) : 0

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--accent-primary)', letterSpacing: 2, marginBottom: 14 }}>
        VOTES
      </h3>

      {isGroupLeader && (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(123, 47, 255, 0.1)', border: '1px solid rgba(123, 47, 255, 0.2)', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
          👑 You're the leader — members vote, you control
        </div>
      )}

      {triggered && (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: 14, animation: 'fade-in 0.3s ease' }}>
          ⚡ Vote threshold reached: {triggered} triggered!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {VOTE_TYPES.map(({ key, label, color }) => {
          const count = tally[key] || 0
          const p = pct(count)
          const isActive = myVote === key
          const isOver = p >= THRESHOLD

          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <button
                  onClick={() => handleVote(key)}
                  disabled={isGroupLeader}
                  style={{
                    background: isActive ? `${color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? color : 'var(--text-secondary)',
                    borderRadius: 8, padding: '5px 12px', fontSize: '0.8rem',
                    cursor: isGroupLeader ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: isActive ? 600 : 400,
                    opacity: isGroupLeader ? 0.5 : 1,
                  }}
                >
                  {label}
                </button>
                <span style={{ fontSize: '0.78rem', color: isOver ? color : 'var(--text-muted)', fontWeight: isOver ? 700 : 400 }}>
                  {count} ({p}%)
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${p}%`, borderRadius: 2,
                  background: isOver ? color : `${color}66`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              {isOver && (
                <div style={{ fontSize: '0.7rem', color, marginTop: 2 }}>⚡ {THRESHOLD}% threshold reached!</div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 14, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {tally.total} member(s) · actions auto-trigger at {THRESHOLD}%
      </div>
    </div>
  )
}
