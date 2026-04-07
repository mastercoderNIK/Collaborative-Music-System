import React, { useEffect, useRef, useState } from 'react'
import { useMusic } from '../context/MusicContext'

/* global YT */

// Robust API loader — handles cached scripts, multiple calls, and late fires
let ytReady = false
let ytCallbacks = []

function loadYTApi() {
  return new Promise((resolve) => {
    // Already loaded
    if (ytReady && window.YT && window.YT.Player) {
      resolve()
      return
    }

    // Queue callback
    ytCallbacks.push(resolve)

    // Only inject script once
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }

    // Override global callback — may already be set, so chain it
    const existingCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback()
      ytReady = true
      ytCallbacks.forEach(cb => cb())
      ytCallbacks = []
    }

    // If YT is somehow already available (cached script), resolve immediately
    if (window.YT && window.YT.Player) {
      ytReady = true
      ytCallbacks.forEach(cb => cb())
      ytCallbacks = []
    }
  })
}

export default function YouTubePlayer({ onEnded, onStateChange }) {
  const { currentTrack, isPlaying, setIsPlaying, volume, playerRef, pendingSeekRef } = useMusic()
  const containerRef = useRef(null)
  const lastVideoId = useRef(null)
  const hasSeekFired = useRef(false)
  const [error, setError] = useState(null)
  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    let destroyed = false

    loadYTApi().then(() => {
      if (destroyed || !containerRef.current) return

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: '',
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            fs: 0,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              e.target.setVolume(volume)
              setPlayerReady(true)

              // If a track was already set before player was ready, load it now
              if (currentTrack?.videoId) {
                lastVideoId.current = currentTrack.videoId
                e.target.loadVideoById(currentTrack.videoId)
              }
            },
            onStateChange: (e) => {
              const state = e.data

              if (state === window.YT.PlayerState.PLAYING) {
                setError(null)
                setIsPlaying(true)

                // Seek to synced position on first play of this video
                if (pendingSeekRef.current > 1 && !hasSeekFired.current) {
                  hasSeekFired.current = true
                  const target = pendingSeekRef.current
                  pendingSeekRef.current = 0
                  setTimeout(() => {
                    try { e.target.seekTo(target, true) } catch {}
                  }, 300)
                }
              }

              if (state === window.YT.PlayerState.PAUSED) setIsPlaying(false)

              if (state === window.YT.PlayerState.ENDED) {
                setIsPlaying(false)
                onEnded && onEnded()
              }

              onStateChange && onStateChange(state)
            },
            onError: (e) => {
              const msgs = {
                2: 'Invalid video ID.',
                5: 'HTML5 player error.',
                100: 'Video not found or is private.',
                101: 'Embedding blocked by uploader. Try searching for an official audio version.',
                150: 'Embedding blocked by uploader. Try searching for an official audio version.',
              }
              setError(msgs[e.data] || `Playback error (${e.data}). Try a different result.`)
              setIsPlaying(false)
            },
          },
        })
      } catch (err) {
        console.error('YT Player init error:', err)
      }
    })

    return () => { destroyed = true }
  }, []) // Only run once on mount

  // Load new video when track changes (only after player is ready)
  useEffect(() => {
    if (!currentTrack?.videoId || !playerRef.current || !playerReady) return
    if (lastVideoId.current === currentTrack.videoId) return
    lastVideoId.current = currentTrack.videoId
    hasSeekFired.current = false
    setError(null)
    try {
      playerRef.current.loadVideoById(currentTrack.videoId)
    } catch (err) {
      console.warn('loadVideoById error:', err)
    }
  }, [currentTrack?.videoId, playerReady])

  // Play/pause sync
  useEffect(() => {
    if (!playerRef.current || !playerReady) return
    try {
      isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo()
    } catch {}
  }, [isPlaying, playerReady])

  // Volume sync
  useEffect(() => {
    if (!playerRef.current || !playerReady) return
    try { playerRef.current.setVolume(volume) } catch {}
  }, [volume, playerReady])

  return (
    <div style={{
      position: 'relative', width: '100%',
      borderRadius: 16, overflow: 'hidden',
      background: '#000', aspectRatio: '16/9',
    }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* No track overlay */}
      {!currentTrack && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,10,26,0.95)', gap: 16,
        }}>
          <div style={{ fontSize: 52, opacity: 0.4, animation: 'float 3s ease-in-out infinite' }}>🎵</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Search for a song to start playing
          </p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,10,26,0.95)', gap: 16, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 42 }}>⚠️</div>
          <p style={{ color: 'var(--accent-pink)', fontSize: '0.95rem', maxWidth: 380 }}>
            {error}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Search for "song name official audio" for embeddable results.
          </p>
        </div>
      )}
    </div>
  )
}