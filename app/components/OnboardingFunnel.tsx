'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  onComplete: (email?: string, password?: string, name?: string) => void
}

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'

// ── SLIDES ──
const SLIDES = [
  {
    id: 0,
    tag: 'CLINICAL AI · 2026',
    title: 'Medicine\nReimagined.',
    sub: 'The platform built by a physician — for physicians who demand excellence.',
    accent: '#0066ff',
    illustration: (
      <svg viewBox="0 0 280 280" width="260" height="260" style={{ display: 'block', margin: '0 auto' }}>
        {/* ECG background */}
        <path d="M10 140 L60 140 L80 80 L100 200 L120 110 L140 140 L200 140 L220 80 L240 200 L260 140 L280 140"
          fill="none" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round" opacity="0.15"/>
        {/* Heart */}
        <path d="M140 200 C60 150 60 80 110 70 C125 67 138 80 140 90 C142 80 155 67 170 70 C220 80 220 150 140 200Z"
          fill="none" stroke="#0066ff" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M140 200 C60 150 60 80 110 70 C125 67 138 80 140 90 C142 80 155 67 170 70 C220 80 220 150 140 200Z"
          fill="#0066ff" opacity="0.06"/>
        {/* Pulse dot */}
        <circle cx="140" cy="140" r="8" fill="#0066ff" opacity="0.9"/>
        <circle cx="140" cy="140" r="16" fill="#0066ff" opacity="0.12"/>
        <circle cx="140" cy="140" r="28" fill="#0066ff" opacity="0.05"/>
        {/* Cross */}
        <path d="M130 100 h20 v-20 h10 v20 h20 v10 h-20 v20 h-10 v-20 h-20 Z"
          fill="#0066ff" opacity="0.15"/>
      </svg>
    ),
    bg: '#f0f5ff',
  },
  {
    id: 1,
    tag: 'AI-POWERED · REAL CASES',
    title: 'Every\nDecision\nCounts.',
    sub: 'STEMI. Sepsis. Stroke. Cases designed by consultants to simulate real clinical pressure.',
    accent: '#00b894',
    illustration: (
      <svg viewBox="0 0 280 280" width="260" height="260" style={{ display: 'block', margin: '0 auto' }}>
        {/* Brain outline */}
        <ellipse cx="140" cy="130" rx="80" ry="70" fill="none" stroke="#00b894" strokeWidth="2.5" opacity="0.2"/>
        {/* Neural connections */}
        {[[80,90],[160,80],[200,130],[170,180],[110,190],[60,150]].map(([x,y],i,arr) => {
          const next = arr[(i+1)%arr.length]
          return <line key={i} x1={x} y1={y} x2={next[0]} y2={next[1]} stroke="#00b894" strokeWidth="1.5" opacity="0.25"/>
        })}
        {[[80,90],[160,80],[200,130],[170,180],[110,190],[60,150]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="6" fill="#00b894" opacity="0.7"/>
        ))}
        {/* Center glow */}
        <circle cx="140" cy="130" r="20" fill="#00b894" opacity="0.12"/>
        <circle cx="140" cy="130" r="10" fill="#00b894" opacity="0.4"/>
        {/* AI text */}
        <text x="140" y="136" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="12" fill="#00b894">AI</text>
        {/* Floating chips */}
        {[{x:30,y:50,l:'STEMI'},{x:185,y:45,l:'Sepsis'},{x:195,y:210,l:'Stroke'},{x:25,y:210,l:'PE'}].map((c,i)=>(
          <g key={i}>
            <rect x={c.x} y={c.y} width="58" height="22" rx="11" fill="#00b894" opacity="0.12"/>
            <text x={c.x+29} y={c.y+15} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="9" fill="#00b894">{c.l}</text>
          </g>
        ))}
      </svg>
    ),
    bg: '#f0fdf8',
  },
  {
    id: 2,
    tag: 'GLOBAL · LIVE · 24/7',
    title: 'You vs\n1,000+\nPhysicians.',
    sub: 'Real-time clinical duels with physicians from London, Dubai, Toronto and Riyadh.',
    accent: '#f59e0b',
    illustration: (
      <svg viewBox="0 0 280 280" width="260" height="260" style={{ display: 'block', margin: '0 auto' }}>
        {/* Globe */}
        <circle cx="140" cy="140" r="90" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.15"/>
        <circle cx="140" cy="140" r="90" fill="#f59e0b" opacity="0.03"/>
        {/* Latitude lines */}
        {[0.4,0.65,0.85].map((r,i)=>(
          <ellipse key={i} cx="140" cy="140" rx={90*r} ry={20} fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.12"/>
        ))}
        {/* Longitude lines */}
        <path d="M140 50 Q170 140 140 230 Q110 140 140 50" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.15"/>
        <path d="M50 140 Q140 110 230 140 Q140 170 50 140" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.15"/>
        {/* City dots */}
        {[
          {x:155,y:95,l:'🇬🇧'},{x:175,y:110,l:'🇦🇪'},{x:115,y:105,l:'🇸🇦'},
          {x:100,y:130,l:'🇪🇬'},{x:75,y:115,l:'🇩🇪'},{x:185,y:145,l:'🇮🇳'},
          {x:95,y:160,l:'🇺🇸'},{x:165,y:165,l:'🇦🇺'}
        ].map((c,i)=>(
          <text key={i} x={c.x} y={c.y} fontSize="14" textAnchor="middle">{c.l}</text>
        ))}
        {/* Center */}
        <circle cx="140" cy="140" r="12" fill="#f59e0b" opacity="0.9"/>
        <circle cx="140" cy="140" r="22" fill="#f59e0b" opacity="0.15"/>
      </svg>
    ),
    bg: '#fffbf0',
  },
  {
    id: 3,
    tag: 'YOUR JOURNEY STARTS NOW',
    title: 'Built by\na Doctor.\nFor Doctors.',
    sub: 'Join the fastest-growing clinical AI platform. Free to start. No credit card needed.',
    accent: '#8b5cf6',
    illustration: (
      <svg viewBox="0 0 280 280" width="260" height="260" style={{ display: 'block', margin: '0 auto' }}>
        {/* Shield */}
        <path d="M140 40 L210 70 L210 150 C210 190 140 230 140 230 C140 230 70 190 70 150 L70 70 Z"
          fill="#8b5cf6" opacity="0.08" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round"/>
        {/* Stethoscope */}
        <path d="M115 110 C115 110 105 120 105 135 C105 155 125 165 140 165 C155 165 175 155 175 135 C175 120 165 110 165 110"
          fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="140" cy="170" r="12" fill="none" stroke="#8b5cf6" strokeWidth="2.5"/>
        <circle cx="140" cy="170" r="5" fill="#8b5cf6" opacity="0.8"/>
        <path d="M115 110 L115 95 C115 88 121 82 128 82 C135 82 140 88 140 95"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M165 110 L165 95 C165 88 159 82 152 82 C145 82 140 88 140 95"
          fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Stars */}
        {[[100,55],[180,55],[140,48]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i===2?5:3} fill="#8b5cf6" opacity={i===2?0.8:0.4}/>
        ))}
      </svg>
    ),
    bg: '#faf5ff',
  },
]

// ── COMPONENT ──
export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide, setSlide] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)

  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const advance = () => {
    if (showAuth) return
    if (isLast) { setShowAuth(true); return }
    setSlide(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    onComplete(email || undefined, undefined, name || undefined)
    setLoading(false)
  }

  // Auto-advance every 6s
  useEffect(() => {
    if (showAuth) return
    const t = setTimeout(() => { if (!isLast) setSlide(s => s + 1) }, 6000)
    return () => clearTimeout(t)
  }, [slide, showAuth, isLast])

  return (
    <div
      onClick={advance}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: current.bg,
        fontFamily: F,
        transition: 'background 0.6s ease',
        display: 'flex', flexDirection: 'column',
        userSelect: 'none', cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      {!showAuth && (
        <div style={{ padding: '52px 24px 0', display: 'flex', gap: 6, position: 'relative', zIndex: 2 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= slide ? current.accent : 'rgba(0,0,0,0.1)',
              transition: 'background 0.4s',
            }} />
          ))}
        </div>
      )}

      {/* Tag */}
      {!showAuth && (
        <div style={{ padding: '16px 24px 0', position: 'relative', zIndex: 2 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 2,
            color: current.accent, textTransform: 'uppercase',
          }}>{current.tag}</span>
        </div>
      )}

      {/* Main Content */}
      {!showAuth ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px 40px', position: 'relative', zIndex: 2 }}>

          {/* Illustration */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            {current.illustration}
          </div>

          {/* Text */}
          <div>
            <h1 style={{
              fontSize: 42, fontWeight: 900, lineHeight: 1.05,
              letterSpacing: -1.5, margin: '0 0 16px',
              color: '#0a0a0a',
              whiteSpace: 'pre-line',
            }}>{current.title}</h1>
            <p style={{
              fontSize: 15, lineHeight: 1.65, color: 'rgba(0,0,0,0.5)',
              margin: '0 0 32px', fontWeight: 400, maxWidth: 320,
            }}>{current.sub}</p>

            {/* CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={e => { e.stopPropagation(); isLast ? setShowAuth(true) : setSlide(s => s + 1) }}
                style={{
                  background: current.accent, color: '#fff',
                  border: 'none', borderRadius: 16, padding: '16px 28px',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  fontFamily: F, letterSpacing: 0.2,
                  boxShadow: `0 8px 32px ${current.accent}40`,
                }}
              >
                {isLast ? 'Get Started →' : 'Continue →'}
              </button>

              <button
                onClick={e => { e.stopPropagation(); onComplete() }}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'rgba(0,0,0,0.3)', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', fontFamily: F,
                }}
              >Skip</button>
            </div>
          </div>
        </div>
      ) : (

        /* ── AUTH SCREEN ── */
        <div
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: '60px 28px 40px', cursor: 'default',
            position: 'relative', zIndex: 2,
          }}
        >
          {/* Logo mark */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg,#0066ff,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, boxShadow: '0 8px 32px rgba(0,102,255,0.3)',
            }}>
              <span style={{ fontSize: 28 }}>⚕</span>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0a0a0a', letterSpacing: -1, margin: '0 0 8px' }}>
              Join Cliniverse
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 1.5 }}>
              Free forever · No credit card · Cancel anytime
            </p>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {[
              { placeholder: 'Your name (Dr. ...)', value: name, set: setName, type: 'text', icon: '👤' },
              { placeholder: 'Email address', value: email, set: setEmail, type: 'email', icon: '✉️' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#ffffff', borderRadius: 16,
                border: '1.5px solid rgba(0,0,0,0.08)',
                padding: '14px 18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: 15, fontFamily: F, color: '#0a0a0a',
                    background: 'transparent',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '17px',
              background: loading ? 'rgba(0,0,0,0.1)' : 'linear-gradient(135deg,#0066ff,#8b5cf6)',
              border: 'none', borderRadius: 16, color: '#fff',
              fontSize: 16, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
              fontFamily: F, letterSpacing: 0.2, marginBottom: 14,
              boxShadow: loading ? 'none' : '0 8px 32px rgba(0,102,255,0.35)',
              transition: 'all 0.3s',
            }}
          >
            {loading ? '...' : 'Enter the Hospital →'}
          </button>

          {/* Skip */}
          <button
            onClick={() => onComplete()}
            style={{
              width: '100%', padding: '14px',
              background: 'transparent', border: '1.5px solid rgba(0,0,0,0.08)',
              borderRadius: 16, color: 'rgba(0,0,0,0.4)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            }}
          >Continue without account</button>

          {/* Trust signals */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 24 }}>
            {['🔒 Secure', '🌍 1,000+ Doctors', '⚡ Free'].map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Slide indicator dots */}
      {!showAuth && (
        <div style={{
          position: 'absolute', bottom: 160, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 6, zIndex: 2
        }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              background: i === slide ? current.accent : 'rgba(0,0,0,0.15)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
