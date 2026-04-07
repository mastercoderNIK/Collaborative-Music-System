import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { icon: '🔐', title: 'Sign Up / Log In', desc: 'Click Sign Up or Log In on the welcome page. You\'ll be redirected to AWS Cognito\'s secure hosted login. Create your account with email and password — no third-party linking required.' },
  { icon: '🎵', title: 'Search & Play', desc: 'Use the search bar on your dashboard to find any song, artist, or album. Results come from YouTube\'s vast catalog. Click a result and it plays instantly in the embedded player.' },
  { icon: '👥', title: 'Create or Join a Group', desc: 'Head to the Groups panel. Create a group and get a unique token. Share that token with friends. They paste it in "Join Group" and everyone is synced to your playback in real-time.' },
  { icon: '🗳️', title: 'Vote Together', desc: 'Members can vote to Skip, Like, Dislike, or Replay the current track. When a vote type reaches 60% of group members, the action fires automatically — even if the leader is away.' },
  { icon: '💬', title: 'Group Chat', desc: 'Every group has its own live chat. Message your crew while you listen. Chats are private — only group members can see them.' },
  { icon: '🤖', title: 'Smart Recommendations', desc: 'After each track, the system fetches 5 YouTube-powered recommendations related to what you\'re listening to. Click any to queue it up.' },
]

const TEAM = [
  { name: 'Devanshi Tripathi', role: 'Frontend Architecture & UI/UX Design', color: 'var(--accent-primary)' },
  { name: 'Nikhil Pal', role: 'Backend Development & Database Design', color: 'var(--accent-secondary)' },
  { name: 'Ayush Dubey', role: 'Cloud Infrastructure & DevOps (AWS/EKS)', color: 'var(--accent-pink)' },
]

export default function About() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px', height: 64,
        background: 'rgba(5, 10, 26, 0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>D</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: 2, color: 'var(--text-primary)' }}>
            DNA<span style={{ color: 'var(--accent-primary)' }}>MUSIC</span>
          </span>
        </div>
        <button className="btn-outline" style={{ padding: '7px 20px', fontSize: '0.85rem' }} onClick={() => navigate(user ? '/dashboard' : '/')}>
          {user ? '← Dashboard' : '← Home'}
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: 100, padding: '6px 20px', marginBottom: 24 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>ABOUT DNA MUSIC SYSTEM</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', marginBottom: 20, lineHeight: 1.15 }}>
            <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Music.</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>Together.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            DNA Music System is a collaborative music streaming platform that lets you and your friends listen to the same music simultaneously, vote on what plays next, and chat in real-time — all powered by YouTube and secured by AWS.
          </p>
        </div>

        {/* How it works */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: 2, marginBottom: 36, textAlign: 'center' }}>
          HOW IT <span style={{ color: 'var(--accent-primary)' }}>WORKS</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 72 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: 24, padding: '28px', borderRadius: 20,
              background: 'rgba(11, 21, 48, 0.7)', border: '1px solid rgba(0, 240, 255, 0.1)',
              transition: 'all 0.3s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)'; e.currentTarget.style.transform = 'translateX(6px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.transform = 'translateX(0)' }}
            >
              <div style={{ fontSize: 36, flexShrink: 0 }}>{step.icon}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#000' }}>{i + 1}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--accent-primary)', letterSpacing: 1 }}>{step.title}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: 2, marginBottom: 36, textAlign: 'center' }}>
          TECH <span style={{ color: 'var(--accent-primary)' }}>STACK</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 72 }}>
          {[
            ['⚛️', 'React 18', 'Frontend — Vite + React Router'],
            ['🐍', 'Flask', 'Backend — Python REST + SocketIO'],
            ['🐘', 'PostgreSQL', 'Database — Full relational schema'],
            ['☁️', 'AWS Cognito', 'Auth — Hosted OAuth2 UI'],
            ['▶️', 'YouTube API', 'Music — Data v3 + IFrame Player'],
            ['🔌', 'Socket.IO', 'Real-time — Group sync & chat'],
            ['🐳', 'Docker + EKS', 'Deploy — Kubernetes on AWS'],
            ['🤖', 'Jenkins', 'CI/CD — Automated pipeline'],
          ].map(([icon, name, desc]) => (
            <div key={name} style={{ padding: '20px', borderRadius: 14, background: 'rgba(11, 21, 48, 0.7)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: 2, marginBottom: 36, textAlign: 'center' }}>
          THE <span style={{ color: 'var(--accent-primary)' }}>TEAM</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 48 }}>
          {TEAM.map(({ name, role, color }) => (
            <div key={name} style={{
              padding: '28px 24px', borderRadius: 20, textAlign: 'center',
              background: 'rgba(11, 21, 48, 0.7)', border: `1px solid ${color}33`,
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${color}66`}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${color}33`}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.4rem', fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>
                {name[0]}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{role}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '28px', borderTop: '1px solid rgba(0, 240, 255, 0.08)', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.8 }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: 8 }}>DNA MUSIC SYSTEM</div>
          Built with ❤️ by <strong style={{ color: 'var(--text-secondary)' }}>Devanshi Tripathi</strong>, <strong style={{ color: 'var(--text-secondary)' }}>Nikhil Pal</strong> &amp; <strong style={{ color: 'var(--text-secondary)' }}>Ayush Dubey</strong>
          <br />Powered by YouTube Data API v3 · Secured by AWS Cognito · Hosted on AWS EKS
        </div>
      </div>
    </div>
  )
}
