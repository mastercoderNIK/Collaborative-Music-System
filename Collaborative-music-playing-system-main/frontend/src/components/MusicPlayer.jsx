import React, { useEffect, useState } from 'react'
import { useMusic } from '../context/MusicContext'

export default function MusicPlayer({ onNext, isLeader = true }) {
  const { currentTrack, isPlaying, setIsPlaying, volume, setVolume, playerRef } = useMusic()
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // ── Poll playback progress ──────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      if (!playerRef.current) return
      try {
        const ct = playerRef.current.getCurrentTime?.() || 0
        const dur = playerRef.current.getDuration?.() || 0
        setCurrentTime(ct)
        setDuration(dur)
        setProgress(dur ? (ct / dur) * 100 : 0)
      } catch {}
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying, playerRef])

  const seek = (e) => {
    if (!isLeader) return
    const pct = parseFloat(e.target.value)
    setProgress(pct)
    const t = (pct / 100) * duration
    try { playerRef.current?.seekTo(t, true) } catch {}
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div style={{
      background: 'rgba(11, 21, 48, 0.95)',
      borderTop: '1px solid rgba(0, 240, 255, 0.1)',
      padding: '16px 28px',
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220, flex: '0 0 220px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, overflow: 'hidden',
        }}>
          {currentTrack?.thumbnail
            ? <img src={currentTrack.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🎵'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
            {currentTrack?.title || 'Nothing playing'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
            {currentTrack?.channel || '—'}
          </div>
        </div>
      </div>

      {/* Controls + Progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CtrlBtn icon="⏮" title="Previous" disabled={!isLeader} onClick={() => {}} />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!isLeader && !!currentTrack}
            style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              border: 'none', fontSize: 18, cursor: isLeader ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              opacity: (!isLeader && currentTrack) ? 0.5 : 1,
            }}
            onMouseEnter={e => isLeader && (e.target.style.transform = 'scale(1.1)')}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >{isPlaying ? '⏸' : '▶'}</button>
          <CtrlBtn icon="⏭" title="Next" disabled={!isLeader} onClick={onNext} />
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 500 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' }}>{fmt(currentTime)}</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="range" min="0" max="100" value={progress} onChange={seek} disabled={!isLeader}
              style={{
                width: '100%',
                background: `linear-gradient(to right, var(--accent-primary) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
                cursor: isLeader ? 'pointer' : 'not-allowed',
              }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 36 }}>{fmt(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
        <span style={{ fontSize: 16 }}>{volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}</span>
        <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))}
          style={{
            width: 90,
            background: `linear-gradient(to right, var(--accent-primary) ${volume}%, rgba(255,255,255,0.1) ${volume}%)`,
          }} />
      </div>

      {/* Leader lock indicator */}
      {!isLeader && currentTrack && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          🔒 Leader controls
        </div>
      )}
    </div>
  )
}

function CtrlBtn({ icon, disabled, onClick, title }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} style={{
      background: 'none', border: 'none', fontSize: 18,
      color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: 6, borderRadius: 8, transition: 'color 0.2s',
    }}
      onMouseEnter={e => !disabled && (e.target.style.color = 'var(--accent-primary)')}
      onMouseLeave={e => e.target.style.color = disabled ? 'var(--text-muted)' : 'var(--text-secondary)'}
    >{icon}</button>
  )
}
