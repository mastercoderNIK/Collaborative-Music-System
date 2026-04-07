import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useMusic } from '../context/MusicContext'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { getTrending, syncGroupTrack, getGroupCurrent } from '../services/api'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'
import YouTubePlayer from '../components/YouTubePlayer'
import MusicPlayer from '../components/MusicPlayer'
import Recommendations from '../components/Recommendations'
import GroupPanel from '../components/GroupPanel'
import GroupChat from '../components/GroupChat'
import VotingPanel from '../components/VotingPanel'
import FeedbackModal from '../components/FeedbackModal'

export default function Dashboard() {
  const { user } = useAuth()
  const {
    currentTrack, playTrack, isPlaying, setIsPlaying,
    activeGroup, isGroupLeader, setActiveGroup, setIsGroupLeader,
    playNext, setCurrentTrack, playerRef,
  } = useMusic()
  const { emit, on } = useSocket() || {}
  const [activePanel, setActivePanel] = useState('dashboard')
  const [showFeedback, setShowFeedback] = useState(false)
  const [trending, setTrending] = useState([])
  const positionSyncRef = useRef(null)

  
  useEffect(() => {
    getTrending()
      .then(({ data }) => setTrending(data.results || []))
      .catch(() => setTrending([]))
  }, [])

  // ── When a group becomes active, sync state ────────────────────────────────
    useEffect(() => {
    if (!activeGroup || isGroupLeader) return
    getGroupCurrent(activeGroup.id)
      .then(({ data }) => {
        if (data.track?.videoId) {
          const pos = data.track.position || 0
          if (pos > 1) pendingSeekRef.current = pos  // set BEFORE playTrack
          playTrack(data.track)
        }
      })
      .catch(() => {})
  }, [activeGroup?.id, isGroupLeader])

  // ── Leader: sync track + position to backend every 10s ────────────────────
  useEffect(() => {
    if (!activeGroup || !isGroupLeader) {
      clearInterval(positionSyncRef.current)
      return
    }
    positionSyncRef.current = setInterval(() => {
      if (!currentTrack?.videoId) return
      const pos = playerRef.current?.getCurrentTime?.() || 0
      syncGroupTrack(activeGroup.id, currentTrack, pos).catch(() => {})
    }, 10000)
    return () => clearInterval(positionSyncRef.current)
  }, [activeGroup?.id, isGroupLeader, currentTrack?.videoId])

  // ── Leader: broadcast track change via socket ──────────────────────────────
  useEffect(() => {
    if (!emit || !activeGroup || !isGroupLeader || !currentTrack) return
    const pos = playerRef.current?.getCurrentTime?.() || 0
    syncGroupTrack(activeGroup.id, currentTrack, pos).catch(() => {})
    emit('track_change', { group_id: activeGroup.id, track: currentTrack, position: pos })
  }, [currentTrack?.videoId])

  // ── Member: receive track change from leader ───────────────────────────────
  useEffect(() => {
    if (!on || !activeGroup || isGroupLeader) return
    const off = on('track_change', ({ track, position }) => {
      if (position > 1) pendingSeekRef.current = position  // set BEFORE playTrack
      playTrack(track)
    })
    return off
  }, [on, activeGroup?.id, isGroupLeader])

  // ── Leader: broadcast position every 15s so members stay in sync ──────────
  useEffect(() => {
    if (!emit || !activeGroup || !isGroupLeader) return
    const interval = setInterval(() => {
      if (!currentTrack?.videoId) return
      try {
        const pos = playerRef.current?.getCurrentTime?.() || 0
        emit('position_sync', { group_id: activeGroup.id, position: pos })
      } catch {}
    }, 15000)
    return () => clearInterval(interval)
  }, [emit, activeGroup?.id, isGroupLeader, currentTrack?.videoId])

  // ── Member: receive position sync and seek ────────────────────────────────
  useEffect(() => {
    if (!on || !activeGroup || isGroupLeader) return
    const off = on('position_sync', ({ position }) => {
      try {
        const myPos = playerRef.current?.getCurrentTime?.() || 0
        // Only seek if more than 3 seconds out of sync
        if (Math.abs(myPos - position) > 3) {
          playerRef.current?.seekTo(position, true)
        }
      } catch {}
    })
    return off
  }, [on, activeGroup?.id, isGroupLeader])

  const handleSkip = useCallback(() => {
    if (isGroupLeader) playNext()
  }, [isGroupLeader, playNext])

  const handleReplay = useCallback(() => {
    if (isGroupLeader && currentTrack) {
      setIsPlaying(false)
      setTimeout(() => setIsPlaying(true), 100)
    }
  }, [isGroupLeader, currentTrack])

  // Members in a group cannot click trending tracks
  const handleTrackClick = (track) => {
    if (activeGroup && !isGroupLeader) return
    playTrack(track)
  }

  const renderRightPanel = () => {
    switch (activePanel) {
      case 'groups': return <GroupPanel />
      case 'chat': return <GroupChat />
      case 'votes': return <VotingPanel onSkip={handleSkip} onReplay={handleReplay} />
      default: return <Recommendations />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} onFeedback={() => setShowFeedback(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          padding: '14px 28px', borderBottom: '1px solid rgba(0, 240, 255, 0.07)',
          display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0,
          background: 'rgba(8, 14, 36, 0.8)',
        }}>
          <div style={{ flex: 1, maxWidth: 500 }}>
            {/* Disable search for group members */}
            {activeGroup && !isGroupLeader ? (
              <div style={{
                padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                color: 'var(--text-muted)', fontSize: '0.88rem',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                🔒 Search disabled — leader controls playback
              </div>
            ) : (
              <SearchBar onSelect={() => setActivePanel('dashboard')} />
            )}
          </div>

          {activeGroup && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
              background: 'rgba(123, 47, 255, 0.12)', border: '1px solid rgba(123, 47, 255, 0.3)',
              borderRadius: 100, fontSize: '0.8rem',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isGroupLeader ? '👑' : '👤'}{' '}
                <strong style={{ color: 'var(--accent-secondary)' }}>{activeGroup.name}</strong>
              </span>
            </div>
          )}

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Hello, <span style={{ color: 'var(--accent-primary)' }}>{user?.name || user?.email?.split('@')[0]}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px 28px', gap: 24, minWidth: 0 }}>

            <div style={{ background: 'rgba(11, 21, 48, 0.7)', borderRadius: 20, border: '1px solid rgba(0, 240, 255, 0.1)', overflow: 'hidden' }}>
              <YouTubePlayer onEnded={isGroupLeader || !activeGroup ? playNext : () => {}} onStateChange={() => {}} />
            </div>

            {currentTrack && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'rgba(0, 240, 255, 0.04)', borderRadius: 14, border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                <img src={currentTrack.thumbnail} alt="" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{currentTrack.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentTrack.channel}</div>
                </div>
                {activeGroup && (
                  <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isGroupLeader ? '📡 Broadcasting to group' : '📻 Synced with leader'}
                  </div>
                )}
              </div>
            )}

            {/* Member lock notice */}
            {activeGroup && !isGroupLeader && (
              <div style={{
                padding: '12px 20px', borderRadius: 12,
                background: 'rgba(123, 47, 255, 0.08)', border: '1px solid rgba(123, 47, 255, 0.25)',
                fontSize: '0.85rem', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                🔒 You're a group member. Only the group leader can control playback and change songs.
              </div>
            )}

            {(!currentTrack || activePanel === 'dashboard') && trending.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--accent-primary)', letterSpacing: 2, marginBottom: 16 }}>
                  🔥 TRENDING NOW
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {trending.slice(0, 8).map((track) => (
                    <TrackCard
                      key={track.videoId}
                      track={track}
                      onPlay={() => handleTrackClick(track)}
                      locked={activeGroup && !isGroupLeader}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{
            width: 300, flexShrink: 0,
            borderLeft: '1px solid rgba(0, 240, 255, 0.07)',
            background: 'rgba(8, 14, 36, 0.6)',
            display: 'flex', flexDirection: 'column',
            padding: 20, gap: 28, overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, flexShrink: 0 }}>
              {[['dashboard', '🎵'], ['groups', '👥'], ['chat', '💬'], ['votes', '🗳️']].map(([key, icon]) => (
                <button key={key} onClick={() => setActivePanel(key)} style={{
                  flex: 1, padding: '6px 0', borderRadius: 7, fontSize: '0.9rem',
                  background: activePanel === key ? 'var(--accent-secondary)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  opacity: activePanel === key ? 1 : 0.6,
                }} title={key}>{icon}</button>
              ))}
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {renderRightPanel()}
            </div>
          </div>
        </div>

        <MusicPlayer onNext={isGroupLeader || !activeGroup ? playNext : () => {}} isLeader={!activeGroup || isGroupLeader} />
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  )
}

function TrackCard({ track, onPlay, locked }) {
  return (
    <div onClick={onPlay} style={{
      background: 'rgba(11, 21, 48, 0.7)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, overflow: 'hidden',
      cursor: locked ? 'not-allowed' : 'pointer',
      transition: 'all 0.25s', opacity: locked ? 0.6 : 1,
    }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)'; e.currentTarget.style.transform = 'translateY(-3px)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
        <img src={track.thumbnail} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {!locked && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,240,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>▶</div>
          </div>
        )}
        {locked && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '2px 7px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>🔒</div>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: locked ? 'var(--text-muted)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.title}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{track.channel}</div>
      </div>
    </div>
  )
}