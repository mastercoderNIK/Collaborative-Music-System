import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Animated DNA helix particles ────────────────────────────────────────────
function DNAParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 190 : 270,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`
        ctx.fill()
      })
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

// ── Waveform Bars decoration ─────────────────────────────────────────────────
function Waveform({ bars = 24, color = 'var(--accent-primary)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, height: `${20 + Math.sin(i * 0.8) * 15}px`,
          background: color, borderRadius: 2, opacity: 0.7,
          animation: `waveBar 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.06}s`,
        }} />
      ))}
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <div style={{
      background: 'rgba(11, 21, 48, 0.7)',
      border: '1px solid rgba(0, 240, 255, 0.12)',
      borderRadius: 20,
      padding: '32px 28px',
      backdropFilter: 'blur(20px)',
      animation: `slide-up 0.7s ease ${delay}s both`,
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)'
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 240, 255, 0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.12)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--accent-primary)', marginBottom: 10, letterSpacing: 1 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

// ── Main Welcome Page ─────────────────────────────────────────────────────────
export default function Welcome() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflowX: 'hidden' }}>
      <DNAParticles />

      {/* Gradient blobs */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 70,
        background: 'rgba(5, 10, 26, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
          }}>D</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: 3, color: 'var(--text-primary)' }}>
            DNA<span style={{ color: 'var(--accent-primary)' }}>MUSIC</span>
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Home', 'About'].map(link => (
            <button key={link} onClick={() => link === 'About' && navigate('/about')} style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              fontSize: '0.9rem', fontFamily: 'var(--font-body)', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >{link}</button>
          ))}
          <button className="btn-outline" style={{ padding: '8px 22px', fontSize: '0.85rem' }} onClick={login}>
            Log In
          </button>
          <button className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.85rem' }} onClick={signup}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 80px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left — Text */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: 100, padding: '6px 16px', marginBottom: 28,
              animation: 'fade-in 0.6s ease',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>
                COLLABORATIVE MUSIC STREAMING
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1.1,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 24,
              animation: 'slide-up 0.8s ease 0.1s both',
            }}>
              <span style={{ color: 'var(--text-primary)' }}>MUSIC THAT</span>
              <br />
              <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                CONNECTS
              </span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>YOUR WORLD</span>
            </h1>

            <p style={{
              fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8,
              marginBottom: 40, maxWidth: 480,
              animation: 'slide-up 0.8s ease 0.2s both',
            }}>
              Stream millions of tracks, create sync groups with friends, vote together on what plays next — powered by YouTube, secured by AWS.
            </p>

            {/* Waveform */}
            <div style={{ marginBottom: 40, animation: 'fade-in 1s ease 0.3s both' }}>
              <Waveform />
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'slide-up 0.8s ease 0.3s both' }}>
              <button className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }} onClick={signup}>
                🎵 Start Free
              </button>
              <button className="btn-outline" style={{ padding: '14px 36px', fontSize: '1rem' }} onClick={login}>
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 48, animation: 'fade-in 1s ease 0.5s both' }}>
              {[['∞', 'Songs'], ['Real-time', 'Group Sync'], ['AI', 'Recommendations']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{v}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual Player Card */}
          <div style={{ animation: 'slide-up 0.8s ease 0.2s both' }}>
            <PlayerPreviewCard />
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 16, color: 'var(--text-primary)' }}>
              BUILT FOR <span style={{ color: 'var(--accent-primary)' }}>COLLABORATION</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Every feature designed so you and your crew can experience music together, no matter where you are.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <FeatureCard delay={0} icon="🎧" title="YOUTUBE POWERED" desc="Access hundreds of millions of tracks via YouTube Data API. No extra account linking required." />
            <FeatureCard delay={0.1} icon="👥" title="SYNC GROUPS" desc="Create a group, share the token, and everyone hears the same song simultaneously in real-time." />
            <FeatureCard delay={0.2} icon="🗳️" title="VOTE CONTROL" desc="Group members vote to skip, replay, like, or dislike. Cross 60% threshold and the action fires automatically." />
            <FeatureCard delay={0.3} icon="💬" title="GROUP CHAT" desc="Live chat panel for every group so you can discuss tracks, react, and vibe together." />
            <FeatureCard delay={0.4} icon="🔐" title="AWS COGNITO AUTH" desc="Enterprise-grade authentication. Secure login and signup with hosted UI — no password storage on our end." />
            <FeatureCard delay={0.5} icon="🤖" title="AI RECOMMENDATIONS" desc="YouTube-powered smart recommendations based on what you're currently playing." />
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(0, 240, 255, 0.08)',
        padding: '40px 80px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: 2 }}>
          DNA<span style={{ color: 'var(--accent-primary)' }}>MUSIC</span> SYSTEM
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Built by Devanshi Tripathi · Nikhil Pal · Ayush Dubey
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['About', 'Privacy', 'Terms'].map(link => (
            <button key={link} onClick={() => link === 'About' && navigate('/about')} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{link}</button>
          ))}
        </div>
      </footer>
    </div>
  )
}

// ── Fake Player Preview ───────────────────────────────────────────────────────
function PlayerPreviewCard() {
  const demoTracks = [
    { title: 'Blinding Lights', artist: 'The Weeknd', dur: '3:20' },
    { title: 'Levitating', artist: 'Dua Lipa', dur: '3:24' },
    { title: 'Peaches', artist: 'Justin Bieber', dur: '3:18' },
    { title: 'Good 4 U', artist: 'Olivia Rodrigo', dur: '2:58' },
  ]

  return (
    <div style={{
      background: 'rgba(11, 21, 48, 0.85)', borderRadius: 28,
      border: '1px solid rgba(0, 240, 255, 0.15)',
      backdropFilter: 'blur(30px)', padding: 28, maxWidth: 420,
      boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,240,255,0.05)',
      animation: 'float 5s ease-in-out infinite',
    }}>
      {/* Now Playing */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16, flexShrink: 0,
          background: 'linear-gradient(135deg, #7b2fff, #00f0ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          boxShadow: '0 8px 30px rgba(123, 47, 255, 0.4)',
          animation: 'rotate-slow 8s linear infinite',
        }}>🎵</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: 4, letterSpacing: 1 }}>NOW PLAYING</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Blinding Lights</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>The Weeknd</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '42%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>1:23</span><span>3:20</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
        {['⏮', '⏸', '⏭'].map((ctrl, i) => (
          <button key={i} style={{
            background: i === 1 ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: i === 1 ? '50%' : 10,
            width: i === 1 ? 52 : 40, height: i === 1 ? 52 : 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: i === 1 ? 20 : 16, cursor: 'pointer',
            boxShadow: i === 1 ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
          }}>{ctrl}</button>
        ))}
      </div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', marginBottom: 24 }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} style={{
            width: 3, background: i < 14 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.15)',
            height: `${8 + Math.abs(Math.sin(i * 0.5) * 24)}px`, borderRadius: 2,
            animation: `waveBar ${0.8 + Math.random() * 0.8}s ease-in-out infinite`,
            animationDelay: `${i * 0.04}s`,
          }} />
        ))}
      </div>

      {/* Queue */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1, fontFamily: 'var(--font-display)' }}>UP NEXT</div>
        {demoTracks.slice(1).map((t, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{t.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.artist}</div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.dur}</span>
          </div>
        ))}
      </div>

      {/* Group badge */}
      <div style={{
        marginTop: 18, padding: '10px 14px', borderRadius: 12,
        background: 'rgba(123, 47, 255, 0.12)', border: '1px solid rgba(123, 47, 255, 0.3)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span>👥</span>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>LoFi Crew — 4 listening</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Voting: 3/4 want to skip</div>
        </div>
      </div>
    </div>
  )
}
