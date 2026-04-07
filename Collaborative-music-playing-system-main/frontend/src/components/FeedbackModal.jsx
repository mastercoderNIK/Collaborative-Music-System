import React, { useState } from 'react'
import { submitFeedback } from '../services/api'

export default function FeedbackModal({ onClose }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true); setError('')
    try {
      await submitFeedback(message.trim())
      setSent(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send feedback')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 0.2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'rgba(11, 21, 48, 0.98)', border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: 24, padding: 36, width: 480, maxWidth: '90vw',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        animation: 'slide-up 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: 2 }}>
            FEEDBACK
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>THANK YOU!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your feedback has been submitted to the admin.</p>
            <button className="btn-outline" style={{ marginTop: 24 }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.7 }}>
              Got a suggestion, bug report, or general thought? We'd love to hear it!
            </p>
            <textarea
              className="input-field"
              rows={5}
              placeholder="Write your feedback here…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
            {error && <div style={{ color: 'var(--accent-pink)', fontSize: '0.82rem', marginTop: 8 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading || !message.trim()}>
                {loading ? 'Sending…' : '📤 Submit Feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
