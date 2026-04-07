import React, { useState, useRef } from 'react'
import { searchMusic } from '../services/api'
import { useMusic } from '../context/MusicContext'

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const { playTrack } = useMusic()

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await searchMusic(val)
        setResults(data.results || [])
        setOpen(true)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 500)
  }

  const selectTrack = (track) => {
    playTrack(track)
    onSelect && onSelect(track)
    setOpen(false)
    setQuery(track.title)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: 16,
        }}>🔍</span>
        <input
          className="input-field"
          style={{ paddingLeft: 42, paddingRight: 42 }}
          placeholder="Search songs, artists, albums…"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {loading && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent-primary)', animation: 'rotate-slow 0.7s linear infinite' }} />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 1000,
          background: 'rgba(11, 21, 48, 0.98)', border: '1px solid var(--border-color)',
          borderRadius: 16, overflow: 'hidden',
          backdropFilter: 'blur(20px)', maxHeight: 380, overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'slide-up 0.2s ease',
        }}>
          {results.map((track) => (
            <div key={track.videoId} onClick={() => selectTrack(track)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                cursor: 'pointer', transition: 'background 0.2s',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img src={track.thumbnail} alt="" style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                  {track.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{track.channel}</div>
              </div>
              <button style={{
                marginLeft: 'auto', flexShrink: 0, background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.2)', color: 'var(--accent-primary)',
                borderRadius: 8, padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer',
              }}>▶ Play</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
