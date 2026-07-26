'use client'
import { useState, useEffect } from 'react'

interface Props {
  onComplete: (email?: string, password?: string, name?: string) => void
}

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'

const CVLogo = ({ size = 56 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.3,
    background: 'linear-gradient(135deg, rgba(0,180,255,0.12), rgba(0,100,255,0.06))',
    border: '1.5px solid rgba(0,180,255,0.3)',
    backdropFilter: 'blur(20px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(0,180,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    position: 'relative', overflow: 'hidden', flexShrink: 0,
  }}>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)', pointerEvents: 'none' }}/>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 40" fill="none">
      <path d="M22 8 C14 8 8 13.5 8 20 C8 26.5 14 32 22 32 C26 32 29.5 30.5 32 28"
        stroke="url(#cg)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M20 10 L27 30 L34 10"
        stroke="url(#vg)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <defs>
        <linearGradient id="cg" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff"/><stop offset="1" stopColor="#0066ff"/>
        </linearGradient>
        <linearGradient id="vg" x1="20" y1="10" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff"/><stop offset="1" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
)

const SLIDES = [
  {
    tag: 'CLINICAL AI · USMLE · MRCP',
    title: 'Train Like\na Consultant.',
    sub: 'The AI-powered clinical platform trusted by physicians preparing for USMLE and MRCP worldwide.',
    accent: '#00d4ff',
    glow: 'rgba(0,212,255,0.2)',
    grad: 'linear-gradient(135deg, #00d4ff, #0066ff)',
    svgContent: `
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#0066ff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="el" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0"/>
          <stop offset="40%" stop-color="#00d4ff"/>
          <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <circle cx="150" cy="130" r="100" fill="url(#g1)"/>
      <path d="M20 130 L70 130 L85 90 L100 170 L115 105 L130 130 L200 130 L215 85 L230 175 L245 130 L280 130"
        fill="none" stroke="url(#el)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M150 185 C90 148 88 95 118 85 C132 80 145 92 150 102 C155 92 168 80 182 85 C212 95 210 148 150 185Z"
        fill="none" stroke="#00d4ff" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M150 185 C90 148 88 95 118 85 C132 80 145 92 150 102 C155 92 168 80 182 85 C212 95 210 148 150 185Z"
        fill="rgba(0,212,255,0.05)"/>
      <circle cx="150" cy="130" r="6" fill="#00d4ff"/>
      <circle cx="150" cy="130" r="16" fill="rgba(0,212,255,0.12)"/>
      <circle cx="150" cy="130" r="28" fill="rgba(0,212,255,0.05)"/>
      <rect x="20" y="38" width="60" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="#00d4ff" stroke-width="1" stroke-opacity="0.5"/>
      <text x="50" y="53" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="9" fill="#00d4ff">USMLE</text>
      <rect x="218" y="38" width="56" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="#7c3aed" stroke-width="1" stroke-opacity="0.5"/>
      <text x="246" y="53" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="9" fill="#7c3aed">MRCP</text>
      <rect x="218" y="198" width="50" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="#0066ff" stroke-width="1" stroke-opacity="0.5"/>
      <text x="243" y="213" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="9" fill="#0066ff">ESC</text>
      <rect x="25" y="198" width="48" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="#00b894" stroke-width="1" stroke-opacity="0.5"/>
      <text x="49" y="213" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="9" fill="#00b894">AHA</text>
    `,
  },
  {
    tag: 'AI-POWERED · REAL PRESSURE',
    title: 'Real Cases.\nReal Decisions.',
    sub: 'STEMI. Sepsis. Stroke. PE — designed by consultants to simulate the pressure of real clinical decisions.',
    accent: '#7c3aed',
    glow: 'rgba(124,58,237,0.2)',
    grad: 'linear-gradient(135deg, #7c3aed, #0066ff)',
    svgContent: `
      <defs>
        <radialGradient id="g2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#0066ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="130" r="95" fill="url(#g2)"/>
      <line x1="90" y1="80" x2="160" y2="70" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <line x1="160" y1="70" x2="210" y2="110" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <line x1="210" y1="110" x2="200" y2="170" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <line x1="200" y1="170" x2="140" y2="200" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <line x1="140" y1="200" x2="80" y2="170" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <line x1="80" y1="170" x2="60" y2="120" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <line x1="60" y1="120" x2="90" y2="80" stroke="#7c3aed" stroke-width="1.5" stroke-opacity="0.3"/>
      <circle cx="90" cy="80" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="160" cy="70" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="210" cy="110" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="200" cy="170" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="140" cy="200" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="80" cy="170" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="60" cy="120" r="7" fill="#7c3aed" fill-opacity="0.8"/>
      <circle cx="150" cy="130" r="20" fill="rgba(0,212,255,0.12)"/>
      <circle cx="150" cy="130" r="10" fill="#00d4ff"/>
      <text x="150" y="134" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="10" fill="#0a0f1e">AI</text>
      <rect x="95" y="218" width="56" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="rgba(0,212,255,0.4)" stroke-width="1"/>
      <text x="123" y="233" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="9" fill="#00d4ff">STEMI</text>
      <rect x="158" y="218" width="56" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="rgba(0,212,255,0.4)" stroke-width="1"/>
      <text x="186" y="233" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="9" fill="#00d4ff">Sepsis</text>
      <rect x="220" y="118" width="54" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="rgba(0,212,255,0.4)" stroke-width="1"/>
      <text x="247" y="133" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="9" fill="#00d4ff">Stroke</text>
      <rect x="18" y="118" width="40" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="rgba(0,212,255,0.4)" stroke-width="1"/>
      <text x="38" y="133" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="9" fill="#00d4ff">PE</text>
    `,
  },
  {
    tag: 'GLOBAL · LIVE · 24/7',
    title: 'You vs\n1,000+\nPhysicians.',
    sub: 'Real-time clinical duels with physicians from London, Dubai, Toronto and Riyadh.',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    grad: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    svgContent: `
      <defs>
        <radialGradient id="g3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#0066ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="130" r="95" fill="url(#g3)"/>
      <circle cx="150" cy="130" r="90" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1.5"/>
      <circle cx="150" cy="130" r="60" fill="none" stroke="rgba(0,212,255,0.07)" stroke-width="1"/>
      <ellipse cx="150" cy="130" rx="90" ry="22" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1"/>
      <path d="M150 40 Q175 130 150 220 Q125 130 150 40" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1"/>
      <text x="162" y="92" font-size="15" text-anchor="middle">🇬🇧</text>
      <text x="180" y="112" font-size="15" text-anchor="middle">🇦🇪</text>
      <text x="118" y="104" font-size="15" text-anchor="middle">🇸🇦</text>
      <text x="105" y="132" font-size="15" text-anchor="middle">🇪🇬</text>
      <text x="82" y="115" font-size="15" text-anchor="middle">🇩🇪</text>
      <text x="192" y="150" font-size="15" text-anchor="middle">🇮🇳</text>
      <text x="98" y="165" font-size="15" text-anchor="middle">🇺🇸</text>
      <text x="170" y="170" font-size="15" text-anchor="middle">🇦🇺</text>
      <text x="145" y="80" font-size="15" text-anchor="middle">🇫🇷</text>
      <circle cx="150" cy="130" r="14" fill="rgba(245,158,11,0.18)"/>
      <circle cx="150" cy="130" r="7" fill="#f59e0b"/>
    `,
  },
  {
    tag: 'YOUR JOURNEY BEGINS NOW',
    title: 'Built by\na Doctor.\nFor Doctors.',
    sub: 'Join the fastest-growing clinical AI platform. Free to start. No credit card needed.',
    accent: '#00d4ff',
    glow: 'rgba(0,212,255,0.2)',
    grad: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
    svgContent: `
      <defs>
        <radialGradient id="g4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cvgrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00d4ff"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      <circle cx="150" cy="130" r="95" fill="url(#g4)"/>
      <path d="M150 45 L215 72 L215 148 C215 192 150 225 150 225 C150 225 85 192 85 148 L85 72 Z"
        fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.25)" stroke-width="2" stroke-linejoin="round"/>
      <text x="150" y="128" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="36"
        fill="url(#cvgrad)" letter-spacing="-2">CV</text>
      <text x="150" y="150" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="9"
        fill="rgba(0,212,255,0.5)" letter-spacing="2.5">CLINIVERSE</text>
      <circle cx="108" cy="65" r="3" fill="#00d4ff" fill-opacity="0.4"/>
      <circle cx="192" cy="65" r="3" fill="#00d4ff" fill-opacity="0.4"/>
      <circle cx="150" cy="52" r="5" fill="#00d4ff" fill-opacity="0.8"/>
      <circle cx="108" cy="195" r="3" fill="#7c3aed" fill-opacity="0.4"/>
      <circle cx="192" cy="195" r="3" fill="#7c3aed" fill-opacity="0.4"/>
    `,
  },
]

const BG = 'linear-gradient(145deg, #050d1a 0%, #080f22 60%, #040c1a 100%)'

export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide, setSlide] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const advance = () => {
    if (showAuth) return
    if (isLast) { setShowAuth(true); return }
    setSlide(s => s + 1)
  }

  useEffect(() => {
    if (showAuth) return
    const t = setTimeout(() => { if (!isLast) setSlide(s => s + 1) }, 6000)
    return () => clearTimeout(t)
  }, [slide, showAuth, isLast])

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    onComplete(email || undefined, undefined, name || undefined)
  }

  return (
    <div onClick={advance} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: BG, fontFamily: F,
      display: 'flex', flexDirection: 'column',
      userSelect: 'none', overflow: 'hidden',
      cursor: showAuth ? 'default' : 'pointer',
    }}>
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${current.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', transition: 'background 0.8s ease', zIndex: 0,
      }}/>

      {!showAuth ? (
        <>
          <div style={{ padding: '54px 24px 0', display: 'flex', gap: 6, position: 'relative', zIndex: 2 }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 2.5, borderRadius: 2,
                background: i <= slide ? current.accent : 'rgba(255,255,255,0.1)',
                transition: 'background 0.5s',
                boxShadow: i === slide ? `0 0 8px ${current.accent}` : 'none',
              }}/>
            ))}
          </div>

          <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, color: current.accent, textTransform: 'uppercase' as const }}>
              {current.tag}
            </span>
            <CVLogo size={34} />
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', position: 'relative', zIndex: 2 }}>
            <svg viewBox="0 0 300 260" width="100%" height="220" style={{ display: 'block', maxWidth: 320 }}
              dangerouslySetInnerHTML={{ __html: current.svgContent }}/>
          </div>

          <div style={{ padding: '0 24px 48px', position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontSize: 40, fontWeight: 900, lineHeight: 1.05,
              letterSpacing: -1.5, margin: '0 0 14px', color: '#ffffff', whiteSpace: 'pre-line',
            }}>{current.title}</h1>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.4)', margin: '0 0 28px' }}>
              {current.sub}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={e => { e.stopPropagation(); isLast ? setShowAuth(true) : setSlide(s => s + 1) }} style={{
                flex: 1, padding: '16px',
                background: current.grad,
                border: 'none', borderRadius: 16, color: '#fff',
                fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: F,
                boxShadow: `0 8px 28px ${current.glow}`,
              }}>
                {isLast ? 'Get Started →' : 'Continue →'}
              </button>
              <button onClick={e => { e.stopPropagation(); onComplete() }} style={{
                padding: '16px 16px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: F,
              }}>Skip</button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 172, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 2 }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{
                width: i === slide ? 22 : 6, height: 6, borderRadius: 3,
                background: i === slide ? current.accent : 'rgba(255,255,255,0.15)',
                transition: 'all 0.35s',
                boxShadow: i === slide ? `0 0 8px ${current.accent}` : 'none',
              }}/>
            ))}
          </div>
        </>
      ) : (
        <div onClick={e => e.stopPropagation()} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '60px 28px 44px', cursor: 'default', position: 'relative', zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <CVLogo size={52} />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(0,212,255,0.65)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>Cliniverse AI</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.8, lineHeight: 1 }}>Join Now</div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 26, lineHeight: 1.6 }}>
            USMLE · MRCP · Clinical AI — Free to start. No credit card.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {[
              { ph: 'Your name (Dr. ...)', val: name, set: setName, type: 'text', icon: '👤' },
              { ph: 'Email address', val: email, set: setEmail, type: 'email', icon: '✉️' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,212,255,0.18)',
                borderRadius: 16, padding: '14px 18px',
                backdropFilter: 'blur(10px)',
              }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <input type={f.type} placeholder={f.ph} value={f.val}
                  onChange={e => f.set(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: F, color: '#fff', background: 'transparent' }}/>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '17px',
            background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #00d4ff, #0066ff)',
            border: 'none', borderRadius: 16, color: '#fff',
            fontSize: 16, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
            fontFamily: F, marginBottom: 12,
            boxShadow: loading ? 'none' : '0 8px 28px rgba(0,180,255,0.3)',
            transition: 'all 0.3s',
          }}>
            {loading ? '...' : 'Enter the Hospital →'}
          </button>

          <button onClick={() => onComplete()} style={{
            width: '100%', padding: '14px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
            color: 'rgba(255,255,255,0.28)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: F,
          }}>Continue without account</button>

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['🔒 Secure', 'USMLE · MRCP', '⚡ Free'].map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      <style>{`input::placeholder{color:rgba(255,255,255,0.22);}input{caret-color:#00d4ff;}`}</style>
    </div>
  )
}
