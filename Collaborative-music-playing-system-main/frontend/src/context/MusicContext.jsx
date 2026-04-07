import React, { createContext, useContext, useState, useRef, useCallback } from 'react'

const MusicContext = createContext(null)

const LS_TRACK = 'dna_current_track'
const LS_GROUP = 'dna_active_group'
const LS_LEADER = 'dna_is_leader'

export function MusicProvider({ children }) {
  const [currentTrack, setCurrentTrackState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_TRACK)) } catch { return null }
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [queue, setQueue] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [activeGroup, setActiveGroupState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_GROUP)) } catch { return null }
  })
  const [isGroupLeader, setIsGroupLeaderState] = useState(() => {
    return localStorage.getItem(LS_LEADER) === 'true'
  })

  const playerRef = useRef(null)
  // When set to a number > 0, YouTubePlayer will seek there on next PLAYING state
  const pendingSeekRef = useRef(0)

  const setCurrentTrack = useCallback((track) => {
    setCurrentTrackState(track)
    if (track) localStorage.setItem(LS_TRACK, JSON.stringify(track))
    else localStorage.removeItem(LS_TRACK)
  }, [])

  const setActiveGroup = useCallback((group) => {
    setActiveGroupState(group)
    if (group) localStorage.setItem(LS_GROUP, JSON.stringify(group))
    else localStorage.removeItem(LS_GROUP)
  }, [])

  const setIsGroupLeader = useCallback((val) => {
    setIsGroupLeaderState(val)
    localStorage.setItem(LS_LEADER, String(val))
  }, [])

  const playTrack = useCallback((track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }, [setCurrentTrack])

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const [next, ...rest] = queue
      setCurrentTrack(next)
      setQueue(rest)
      setIsPlaying(true)
    }
  }, [queue, setCurrentTrack])

  return (
    <MusicContext.Provider value={{
      currentTrack, setCurrentTrack,
      isPlaying, setIsPlaying,
      volume, setVolume,
      queue, setQueue,
      recommendations, setRecommendations,
      activeGroup, setActiveGroup,
      isGroupLeader, setIsGroupLeader,
      playerRef,
      pendingSeekRef,
      playTrack, playNext,
    }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used within MusicProvider')
  return ctx
}