import React, { useState, useEffect, useRef } from 'react'
import { getChatHistory } from '../services/api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { useMusic } from '../context/MusicContext'
import api from '../services/api'

export default function GroupChat() {
  const { user } = useAuth()
  const { activeGroup } = useMusic()
  const { emit, on, connected } = useSocket() || {}
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const lastMsgIdRef = useRef(0)

  // Load history + set up polling
  useEffect(() => {
    if (!activeGroup) { setMessages([]); return }

    const load = () => {
      getChatHistory(activeGroup.id)
        .then(({ data }) => {
          const msgs = data.messages || []
          setMessages(msgs)
          if (msgs.length > 0) {
            lastMsgIdRef.current = msgs[msgs.length - 1].id
          }
        })
        .catch(() => {})
    }

    load()
    // Poll every 4 seconds as fallback for when socket drops
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [activeGroup?.id])

  // Live socket messages (deduped against polled messages)
  useEffect(() => {
    if (!on) return
    const off = on('chat_message', (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })
    return off
  }, [on, activeGroup?.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !activeGroup) return
    const text = input.trim()
    setInput('')

    // Try socket first
    if (emit && connected) {
      emit('chat_message', { group_id: activeGroup.id, message: text })
    } else {
      // Fallback: REST API to persist message
      try {
        await api.post(`/api/chat/${activeGroup.id}`, { message: text })
      } catch {}
    }
  }

  const fmt = (iso) => {
    const d = new Date(iso)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (!activeGroup) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
        Select a group to see chat
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--accent-primary)', letterSpacing: 2 }}>
          CHAT · {activeGroup.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? 'var(--accent-green)' : 'var(--accent-pink)',
            boxShadow: connected ? '0 0 6px var(--accent-green)' : 'none',
          }} />
          <span style={{ color: 'var(--text-muted)' }}>{connected ? 'Live' : 'Polling'}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: 8, marginBottom: 12, paddingRight: 4, minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', marginTop: 20 }}>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: isOwn
                  ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                  : 'linear-gradient(135deg, var(--accent-secondary), var(--accent-pink))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              }}>
                {(msg.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ maxWidth: '72%' }}>
                {!isOwn && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3, marginLeft: 4 }}>
                    {msg.username}
                  </div>
                )}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isOwn
                    ? 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(123,47,255,0.2))'
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isOwn ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4,
                }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3, textAlign: isOwn ? 'right' : 'left', marginLeft: 4 }}>
                  {fmt(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          className="input-field"
          style={{ flex: 1, padding: '9px 14px', fontSize: '0.85rem' }}
          placeholder="Message the group…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          border: 'none', borderRadius: 10, padding: '9px 14px',
          color: '#fff', fontSize: 16, cursor: 'pointer',
        }}>➤</button>
      </div>
    </div>
  )
}