import React, { useEffect, useState } from 'react'
import { getRecommendations } from '../services/api'
import { useMusic } from '../context/MusicContext'

export default function Recommendations() {
  const { currentTrack, playTrack, recommendations, setRecommendations } = useMusic()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentTrack?.videoId) return
    setLoading(true)
    getRecommendations(currentTrack.videoId)
      .then(({ data }) => setRecommendations(data.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false))
  }, [currentTrack?.videoId])

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--accent-primary)', letterSpacing: 2, marginBottom: 16 }}>
        RECOMMENDED
      </h3>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 56, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.06)', animation: 'pulse-glow 1.5s infinite', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 6, animation: 'pulse-glow 1.5s infinite' }} />
                <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, width: '70%', animation: 'pulse-glow 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
          {currentTrack ? 'No recommendations yet' : 'Play a song to get recommendations'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recommendations.map((track, i) => (
          <div key={track.videoId || i}
            onClick={() => playTrack(track)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={track.thumbnail} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >▶</div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {track.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{track.channel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
