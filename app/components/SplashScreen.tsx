'use client'
import { useEffect, useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  // 0=init 1=logo-in 2=pulse 3=text 4=tagline 5=fade

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2100),
      setTimeout(() => setPhase(5), 3000),
      setTimeout(() => onDone(),    3700),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:99999,
      background:'linear-gradient(160deg, #F0F6FF 0%, #E8F2FF 50%, #F4F9FF 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:F,
      opacity: phase === 5 ? 0 : 1,
      transition: 'opacity 0.65s cubic-bezier(0.4,0,0.2,1)',
    }}>

      {/* Ambient glows */}
      <div style={{
        position:'absolute', top:'12%', left:'50%', transform:'translateX(-50%)',
        width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(0,194,178,0.10) 0%, transparent 70%)',
        filter:'blur(60px)', pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:'10%', right:'5%',
        width:300, height:300, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%)',
        filter:'blur(50px)', pointerEvents:'none',
      }}/>

      {/* Floating particles */}
      {[
        {x:'12%',y:'18%',s:5,c:'rgba(0,194,178,0.35)',d:0},
        {x:'85%',y:'14%',s:4,c:'rgba(10,132,255,0.30)',d:0.4},
        {x:'88%',y:'72%',s:6,c:'rgba(0,194,178,0.25)',d:0.8},
        {x:'8%', y:'78%',s:4,c:'rgba(10,132,255,0.25)',d:1.2},
        {x:'50%',y:'6%', s:3,c:'rgba(0,194,178,0.40)',d:0.6},
        {x:'22%',y:'90%',s:5,c:'rgba(10,132,255,0.20)',d:1.0},
      ].map((p,i)=>(
        <div key={i} style={{
          position:'absolute', left:p.x, top:p.y,
          width:p.s, height:p.s, borderRadius:'50%',
          background:p.c,
          animation:`particleDrift ${3+i*0.3}s ease-in-out infinite`,
          animationDelay:`${p.d}s`,
        }}/>
      ))}

      {/* ── LOGO ── */}
      <div style={{
        marginBottom:36,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        filter: phase >= 2
          ? 'drop-shadow(0 0 24px rgba(0,194,178,0.40)) drop-shadow(0 0 60px rgba(0,194,178,0.15))'
          : 'none',
      }}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="spBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0A2540"/>
              <stop offset="100%" stopColor="#0D1F35"/>
            </linearGradient>
            <linearGradient id="spArc" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5D4"/>
              <stop offset="100%" stopColor="#0A84FF"/>
            </linearGradient>
            <linearGradient id="spEcg" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00C2B2" stopOpacity="0"/>
              <stop offset="30%" stopColor="#00C2B2"/>
              <stop offset="70%" stopColor="#38E8D8"/>
              <stop offset="100%" stopColor="#0A84FF" stopOpacity="0"/>
            </linearGradient>
            <filter id="spGlow">
              <feGaussianBlur stdDeviation="2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="spSoft">
              <feGaussianBlur stdDeviation="3.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* BG */}
          <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#spBg)"/>
          <rect x="2" y="2" width="96" height="96" rx="24"
            fill="none" stroke="url(#spArc)" strokeWidth="1.2" opacity="0.5"/>
          <rect x="5" y="5" width="90" height="90" rx="21"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>

          {/* C letter */}
          <path d="M64 28 C54 22, 34 24, 28 38 C22 52, 28 70, 42 76 C54 81, 66 77, 70 68"
            stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"
            filter="url(#spGlow)" opacity="0.97"/>

          {/* ECG */}
          <polyline
            points="16,51 25,51 30,51 34,38 38,66 42,43 46,59 50,51 62,51 66,51 70,40 74,63 78,44 84,51"
            stroke="url(#spEcg)" strokeWidth="2.6"
            strokeLinecap="round" strokeLinejoin="round"
            fill="none" filter="url(#spGlow)">
            <animate attributeName="stroke-dasharray" from="0 200" to="200 0"
              dur="1.6s" repeatCount="indefinite"/>
          </polyline>

          {/* Pulse dot */}
          <circle cx="84" cy="51" r="3.2" fill="#38E8D8" filter="url(#spSoft)">
            <animate attributeName="r" values="2.5;4.5;2.5" dur="1.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite"/>
          </circle>

          {/* Ping rings */}
          <circle cx="50" cy="50" r="0" fill="none" stroke="#00C2B2" strokeWidth="1">
            <animate attributeName="r" values="0;32" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0" dur="2s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      {/* ── WORDMARK ── */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(14px)',
        transition: 'all 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
        textAlign:'center', marginBottom:10,
      }}>
        <div style={{
          fontSize:32, fontWeight:900, letterSpacing:-1,
          color:'#0A1628',
        }}>
          Cliniverse <span style={{
            background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>AI</span>
        </div>
      </div>

      {/* ── TAGLINE ── */}
      <div style={{
        opacity: phase >= 4 ? 1 : 0,
        transform: phase >= 4 ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
        fontSize:12, fontWeight:600, letterSpacing:3,
        color:'rgba(10,22,40,0.40)',
        textAlign:'center',
      }}>
        MEDICAL INTELLIGENCE · 2026
      </div>

      {/* ── LOADING INDICATOR ── */}
      <div style={{
        position:'absolute', bottom:52,
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
        opacity: phase >= 3 && phase < 5 ? 1 : 0,
        transition:'opacity 0.4s',
      }}>
        <div style={{
          width:140, height:2.5, borderRadius:2,
          background:'rgba(10,132,255,0.10)',
          overflow:'hidden',
        }}>
          <div style={{
            height:'100%', borderRadius:2,
            background:'linear-gradient(90deg,#00C2B2,#0A84FF)',
            boxShadow:'0 0 8px rgba(0,194,178,0.50)',
            animation:'splashLoad 2.5s cubic-bezier(0.4,0,0.2,1) forwards',
          }}/>
        </div>
      </div>

      <div style={{
        position:'absolute', bottom:28,
        fontSize:9, fontWeight:700, letterSpacing:2,
        color:'rgba(10,22,40,0.22)',
      }}>v6.0</div>

      <style>{`
        @keyframes particleDrift {
          0%,100% { transform:translateY(0) scale(1); opacity:0.8; }
          50%      { transform:translateY(-12px) scale(1.2); opacity:1; }
        }
        @keyframes splashLoad {
          0%   { width:0% }
          25%  { width:35% }
          60%  { width:70% }
          85%  { width:90% }
          100% { width:100% }
        }
      `}</style>
    </div>
  )
}
