'use client'
import { useEffect, useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'logo'|'pulse'|'text'|'fade'>('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pulse'), 600)
    const t2 = setTimeout(() => setPhase('text'),  1400)
    const t3 = setTimeout(() => setPhase('fade'),  2800)
    const t4 = setTimeout(() => onDone(),           3600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#0d1828',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: F,
      opacity: phase === 'fade' ? 0 : 1,
      transition: 'opacity 0.7s ease',
    }}>

      {/* Neural ambient glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,200,184,0.07),transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,150,255,0.05),transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      {/* Neural dots */}
      {[
        {x:'15%',y:'20%',c:'#00C8B8',d:0},{x:'80%',y:'15%',c:'#0096FF',d:0.3},
        {x:'90%',y:'70%',c:'#00C8B8',d:0.6},{x:'10%',y:'75%',c:'#0096FF',d:0.9},
        {x:'50%',y:'8%', c:'#00C8B8',d:0.4},{x:'20%',y:'88%',c:'#0096FF',d:0.7},
      ].map((dot,i)=>(
        <div key={i} style={{
          position:'absolute', left:dot.x, top:dot.y,
          width: 4, height: 4, borderRadius:'50%',
          background: dot.c, opacity: 0.25,
          animation: `neuralDrift ${2.5+i*0.2}s ease-in-out infinite`,
          animationDelay: `${dot.d}s`,
        }}/>
      ))}

      {/* ── LOGO SVG ── */}
      <div style={{
        opacity: phase === 'logo' ? 0 : 1,
        transform: phase === 'logo' ? 'scale(0.7)' : 'scale(1)',
        transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        filter: phase !== 'logo' ? 'drop-shadow(0 0 20px rgba(0,200,184,0.55)) drop-shadow(0 0 48px rgba(0,200,184,0.25))' : 'none',
        marginBottom: 32,
      }}>
        <svg width="110" height="110" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bgSp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#0d1f30"/>
              <stop offset="100%" stopColor="#081218"/>
            </linearGradient>
            <linearGradient id="arcSp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#00E5D4"/>
              <stop offset="60%"  stopColor="#00C8B8"/>
              <stop offset="100%" stopColor="#0096FF"/>
            </linearGradient>
            <linearGradient id="pulseSp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00C8B8" stopOpacity="0"/>
              <stop offset="30%"  stopColor="#00C8B8"/>
              <stop offset="70%"  stopColor="#00E5D4"/>
              <stop offset="100%" stopColor="#0096FF" stopOpacity="0"/>
            </linearGradient>
            <filter id="glowSp" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softSp" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width="120" height="120" rx="28" fill="url(#bgSp)"/>
          <radialGradient id="ambSp" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#00C8B8" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#00C8B8" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="120" height="120" rx="28" fill="url(#ambSp)"/>

          {/* Border glow */}
          <rect x="1" y="1" width="118" height="118" rx="27" fill="none" stroke="rgba(0,200,184,0.20)" strokeWidth="1.5"/>

          {/* C Arc */}
          <path d="M 84 38 A 30 30 0 1 0 84 82"
            fill="none" stroke="url(#arcSp)" strokeWidth="7" strokeLinecap="round" filter="url(#glowSp)"/>
          <path d="M 80 44 A 24 24 0 1 0 80 76"
            fill="none" stroke="#00C8B8" strokeWidth="0.8" strokeLinecap="round" opacity="0.15"/>

          {/* End dots */}
          <circle cx="84" cy="38" r="4" fill="#00E5D4" filter="url(#softSp)" opacity="0.95">
            <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="84" cy="82" r="4" fill="#0096FF" filter="url(#softSp)" opacity="0.90">
            <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" begin="0.5s" repeatCount="indefinite"/>
          </circle>

          {/* ECG Pulse */}
          <line x1="28" y1="60" x2="78" y2="60" stroke="#00C8B8" strokeWidth="0.5" opacity="0.12"/>
          <polyline
            points="28,60 36,60 40,60 44,48 48,72 52,55 56,65 60,60 78,60"
            fill="none" stroke="url(#pulseSp)" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#glowSp)"
            strokeDasharray="120" strokeDashoffset="120"
          >
            <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
          </polyline>

          {/* Ping ring */}
          <circle cx="60" cy="60" r="0" fill="none" stroke="#00C8B8" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values="0;26" dur="2.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.45;0" dur="2.2s" repeatCount="indefinite"/>
            <animate attributeName="strokeWidth" values="1.5;0.2" dur="2.2s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      {/* ── WORDMARK ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: phase === 'text' || phase === 'fade' ? 1 : 0,
        transform: phase === 'text' || phase === 'fade' ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#F2F8FC', letterSpacing: -0.8 }}>
          Cliniverse <span style={{ color: '#00C8B8' }}>AI</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(242,248,252,0.45)', fontWeight: 600, letterSpacing: 3 }}>
          MEDICAL INTELLIGENCE
        </div>
      </div>

      {/* ── LOADING BAR ── */}
      <div style={{
        position: 'absolute', bottom: 60,
        width: 120, height: 2, borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        opacity: phase !== 'fade' ? 1 : 0,
        transition: 'opacity 0.4s',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg,#00C8B8,#0096FF)',
          animation: 'loadBar 2.8s ease forwards',
          boxShadow: '0 0 8px rgba(0,200,184,0.6)',
        }}/>
      </div>

      {/* ── VERSION ── */}
      <div style={{
        position: 'absolute', bottom: 32,
        fontSize: 10, color: 'rgba(242,248,252,0.25)',
        fontWeight: 600, letterSpacing: 1.5,
      }}>
        v2.0 · 2026
      </div>

      <style>{`
        @keyframes neuralDrift {
          0%,100% { transform:translateY(0) scale(1); opacity:.20; }
          50%      { transform:translateY(-10px) scale(1.15); opacity:.35; }
        }
        @keyframes loadBar {
          0%   { width:0%; }
          30%  { width:40%; }
          60%  { width:72%; }
          85%  { width:90%; }
          100% { width:100%; }
        }
      `}</style>
    </div>
  )
}
