'use client'
import { useState, useEffect, useRef } from 'react'
import CliniverseLogo from './Logo'

interface Props {
  onComplete: (email?: string, password?: string, name?: string) => void
}

const F = '-apple-system, sans-serif'

const SLIDES = [
  {
    tag: 'CLINICAL AI',
    headline: ['Your next patient', 'could change', 'everything.'],
    sub: 'Cliniverse AI puts you inside real emergencies — STEMI, Sepsis, Stroke. Make the call before it is too late.',
    accent: '#00C4B4',
    bg: ['#1a3a50', '#2a4a60'],
    glow: 'rgba(0,196,180,0.18)',
    btnGrad: 'linear-gradient(135deg, #00C4B4, #0066cc)',
    visual: 'ecg',
  },
  {
    tag: 'AI-POWERED',
    headline: ['AI that challenges', 'you like your', 'toughest attending.'],
    sub: 'Every case built on AHA, ESC, and MRCP guidelines. Instant AI feedback on every decision you make.',
    accent: '#00DFD0',
    bg: ['#0a1f2e', '#1e3d52'],
    glow: 'rgba(0,180,166,0.18)',
    btnGrad: 'linear-gradient(135deg, #D4A847, #FF9500)',
    visual: 'brain',
  },
  {
    tag: 'GLOBAL · LIVE',
    headline: ['12,000 doctors', 'trained here.', 'Why not you?'],
    sub: 'Join physicians from Riyadh, Dubai, London and Toronto competing in real-time clinical simulations.',
    accent: '#fbbf24',
    bg: ['#1e3d52', '#2a4a60'],
    glow: 'rgba(251,191,36,0.15)',
    btnGrad: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    visual: 'globe',
  },
  {
    tag: 'YOUR MOMENT',
    headline: ['From intern', 'to consultant —', 'one platform.'],
    sub: 'The clinical platform that grows with your career. Built by a physician, for physicians worldwide.',
    accent: '#3ED6A0',
    bg: ['#1a3a50', '#1e3d52'],
    glow: 'rgba(62,214,160,0.15)',
    btnGrad: 'linear-gradient(135deg, #34C759, #00C4B4)',
    visual: 'shield',
  },
]

const ECGVisual = ({ accent }: { accent: string }) => (
  <svg viewBox="0 0 320 200" width="100%" height="180">
    <defs>
      <linearGradient id="ecgLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={accent} stopOpacity="0"/>
        <stop offset="30%" stopColor={accent} stopOpacity="1"/>
        <stop offset="100%" stopColor={accent} stopOpacity="0.3"/>
      </linearGradient>
      <filter id="glow1">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M0 100 L50 100 L65 100 L75 60 L85 140 L95 20 L105 180 L115 100 L130 100 L180 100 L195 100 L205 60 L215 140 L225 20 L235 180 L245 100 L260 100 L320 100"
      fill="none" stroke="url(#ecgLine)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow1)"/>
    <circle cx="95" cy="20" r="5" fill={accent} opacity="0.9" filter="url(#glow1)"/>
    <text x="102" y="18" fill={accent} fontSize="10" fontWeight="800" fontFamily="Inter,sans-serif">STEMI</text>
    <rect x="20" y="148" width="88" height="26" rx="13" fill="rgba(0,0,0,0.6)" stroke={accent} strokeWidth="1" strokeOpacity="0.5"/>
    <text x="64" y="165" textAnchor="middle" fill={accent} fontSize="10" fontWeight="800" fontFamily="Inter,sans-serif">♥ 118 bpm</text>
    <rect x="214" y="148" width="88" height="26" rx="13" fill="rgba(0,0,0,0.6)" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5"/>
    <text x="258" y="165" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="800" fontFamily="Inter,sans-serif">⚠ CRITICAL</text>
  </svg>
)

const BrainVisual = ({ accent }: { accent: string }) => (
  <svg viewBox="0 0 320 200" width="100%" height="180">
    <defs>
      <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={accent} stopOpacity="0.2"/>
        <stop offset="100%" stopColor={accent} stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="160" cy="100" r="80" fill="url(#brainGlow)"/>
    {[0,1,2,3,4,5].map(i => {
      const angle = (i * 60) * Math.PI / 180
      const x = 160 + 65 * Math.cos(angle)
      const y = 100 + 65 * Math.sin(angle)
      return <g key={i}>
        <line x1="160" y1="100" x2={x} y2={y} stroke={accent} strokeWidth="1" strokeOpacity="0.3"/>
        <circle cx={x} cy={y} r="8" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1" strokeOpacity="0.6"/>
        <text x={x} y={y+4} textAnchor="middle" fill={accent} fontSize="7" fontWeight="800" fontFamily="Inter,sans-serif" opacity="0.8">{['MRCP','USMLE','AHA','ESC','PALS','ATLS'][i]}</text>
      </g>
    })}
    <circle cx="160" cy="100" r="24" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.5" strokeOpacity="0.8"/>
    <text x="160" y="105" textAnchor="middle" fill={accent} fontSize="14" fontWeight="900" fontFamily="Inter,sans-serif">AI</text>
  </svg>
)

const GlobeVisual = ({ accent }: { accent: string }) => (
  <svg viewBox="0 0 320 200" width="100%" height="180">
    <defs>
      <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={accent} stopOpacity="0.15"/>
        <stop offset="100%" stopColor={accent} stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="160" cy="100" r="75" fill="url(#globeGlow)" stroke={accent} strokeWidth="1" strokeOpacity="0.2"/>
    <ellipse cx="160" cy="100" rx="75" ry="20" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.15"/>
    <ellipse cx="160" cy="100" rx="50" ry="75" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.15"/>
    <text x="175" y="52" textAnchor="middle" fontSize="18">🇬🇧</text>
    <text x="210" y="82" textAnchor="middle" fontSize="18">🇸🇦</text>
    <text x="222" y="118" textAnchor="middle" fontSize="18">🇦🇪</text>
    <text x="95"  y="132" textAnchor="middle" fontSize="18">🇺🇸</text>
    <text x="215" y="148" textAnchor="middle" fontSize="18">🇮🇳</text>
    <text x="108" y="72"  textAnchor="middle" fontSize="18">🇪🇬</text>
    <circle cx="160" cy="100" r="10" fill={accent} fillOpacity="0.9"/>
    <text x="160" y="104" textAnchor="middle" fill="#000" fontSize="9" fontWeight="900" fontFamily="Inter,sans-serif">LIVE</text>
  </svg>
)

const ShieldVisual = ({ accent }: { accent: string }) => (
  <svg viewBox="0 0 320 200" width="100%" height="180">
    <defs>
      <linearGradient id="sgold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFDE7"/>
        <stop offset="20%" stopColor="#FFD54F"/>
        <stop offset="60%" stopColor="#FF8F00"/>
        <stop offset="100%" stopColor="#E65100"/>
      </linearGradient>
      <linearGradient id="steal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E0FFFD"/>
        <stop offset="30%" stopColor="#00E5FF"/>
        <stop offset="100%" stopColor="#00796B"/>
      </linearGradient>
      <linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,213,79,0.20)"/>
        <stop offset="50%" stopColor="rgba(30,61,82,0.90)"/>
        <stop offset="100%" stopColor="rgba(0,180,166,0.15)"/>
      </linearGradient>
      <radialGradient id="ssheen" cx="35%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0.02)"/>
      </radialGradient>
      <filter id="sglow">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="sglow2">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Outer ring glow */}
    <rect x="96" y="10" width="128" height="128" rx="33" fill="none" stroke="url(#sgold)" strokeWidth="2" strokeOpacity="0.5" filter="url(#sglow2)"/>
    {/* Glass background */}
    <rect x="98" y="12" width="124" height="124" rx="31" fill="url(#sbg)" stroke="url(#sgold)" strokeWidth="2.5" strokeOpacity="0.95"/>
    <rect x="98" y="12" width="124" height="124" rx="31" fill="url(#ssheen)"/>
    <rect x="104" y="18" width="112" height="112" rx="26" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1"/>
    {/* Ambient glow */}
    <ellipse cx="148" cy="74" rx="40" ry="40" fill="#FFD54F" fillOpacity="0.08" filter="url(#sglow)"/>
    {/* C glow */}
    <path d="M184 46C174 36 162 30 148 30C122 30 100 50 100 74C100 98 122 118 148 118C162 118 174 112 184 102"
      stroke="#FFD54F" strokeWidth="22" strokeLinecap="round" fill="none" strokeOpacity="0.18" filter="url(#sglow)"/>
    {/* C main */}
    <path d="M184 46C174 36 162 30 148 30C122 30 100 50 100 74C100 98 122 118 148 118C162 118 174 112 184 102"
      stroke="url(#sgold)" strokeWidth="13" strokeLinecap="round" fill="none"/>
    {/* Checkmark glow */}
    <path d="M122 74L140 94L186 52"
      stroke="#00E5FF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.28" filter="url(#sglow)"/>
    {/* Checkmark main */}
    <path d="M122 74L140 94L186 52"
      stroke="url(#steal)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Gold dots */}
    <circle cx="184" cy="46" r="8" fill="#FFD54F" filter="url(#sglow2)"/>
    <circle cx="184" cy="46" r="5" fill="#FFFDE7"/>
    <circle cx="184" cy="102" r="8" fill="#FFD54F" filter="url(#sglow2)"/>
    <circle cx="184" cy="102" r="5" fill="#FFFDE7"/>
    {/* Sparkle top-left */}
    <line x1="106" y1="22" x2="106" y2="16" stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    <line x1="102" y1="22" x2="110" y2="22" stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    {/* Teal sparkle bottom-right */}


<line x1="214" y1="126" x2="214" y2="121" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <line x1="210" y1="126" x2="218" y2="126" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    {/* App name */}
    <text x="160" y="158" textAnchor="middle" fill={accent} fontSize="9" fontWeight="800" fontFamily="Inter,sans-serif" opacity="0.6" letterSpacing="2">CLINIVERSE AI</text>
    {/* Tagline */}
    <text x="160" y="172" textAnchor="middle" fill={accent} fontSize="7.5" fontWeight="500" fontFamily="Inter,sans-serif" opacity="0.35">Where Doctors Train</text>
  </svg>
)

const Visual = ({ type, accent }: { type: string; accent: string }) => {
  if (type === 'ecg')   return <ECGVisual accent={accent}/>
  if (type === 'brain') return <BrainVisual accent={accent}/>
  if (type === 'globe') return <GlobeVisual accent={accent}/>
  return <ShieldVisual accent={accent}/>
}

// ── PAYWALL ──
const Paywall = ({ onPay, onSkip }: { onPay: () => void; onSkip: () => void }) => {
  const [plan, setPlan] = useState<'monthly'|'annual'>('annual')
  const features = [
    { icon: '⚡', text: 'Unlimited AI Case Generation' },
    { icon: '🫀', text: 'All Specialties & Departments' },
    { icon: '🏆', text: 'Global Leaderboard & Ranks' },
    { icon: '📋', text: 'PDF Certificates per Case' },
    { icon: '🤖', text: 'AI Clinical Consultant 24/7' },
    { icon: '🎯', text: 'USMLE · MRCP · Board Prep' },
  ]
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(180deg,#0a1f2e 0%,#162e3e 50%,#0a1f2e 100%)',
      fontFamily: F, overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,196,180,0.2) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ flex:1, padding:'56px 24px 32px', display:'flex', flexDirection:'column', position:'relative', zIndex:2 }}>

        <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
          <CliniverseLogo size={72}/>
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <div style={{ padding:'6px 18px', background:'rgba(212,168,71,0.15)', border:'1px solid rgba(212,168,71,0.35)', borderRadius:20, fontSize:11, fontWeight:800, color:'#D4A847', letterSpacing:1.5 }}>
            👑 CLINIVERSE PRO
          </div>
        </div>

        <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', textAlign:'center', lineHeight:1.1, letterSpacing:-1, margin:'0 0 8px' }}>
          Train at the<br/>
          <span style={{ background:'linear-gradient(135deg,#D4A847,#00C4B4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            highest level.
          </span>
        </h1>
        <p style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:14, margin:'0 0 28px', lineHeight:1.6 }}>
          Join doctors preparing for USMLE, MRCP and NHS daily.
        </p>

        {/* Plan toggle */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:16, padding:4, marginBottom:20, gap:4 }}>
          {([['annual','Annual','$99/yr','Save 45%'],['monthly','Monthly','$14.99/mo','']] as const).map(([key,label,price,save]) => (
            <button key={key} onClick={() => setPlan(key)} style={{
              flex:1, padding:'12px 8px', borderRadius:13, border:'none', cursor:'pointer', fontFamily:F,
              background: plan===key ? 'linear-gradient(135deg,#00C4B4,#D4A847)' : 'transparent',
              color: plan===key ? '#fff' : 'rgba(255,255,255,0.4)',
              transition:'all 0.3s',
              boxShadow: plan===key ? '0 4px 20px rgba(0,180,166,0.4)' : 'none',
            }}>
              <div style={{ fontSize:12, fontWeight:800 }}>{label}</div>
              <div style={{ fontSize:14, fontWeight:900, marginTop:2 }}>{price}</div>
              {save && <div style={{ fontSize:9, fontWeight:800, color:'#D4A847', marginTop:2 }}>{save}</div>}
            </button>
          ))}
        </div>

        {/* Features */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {features.map((f,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,0.04)', borderRadius:14, border:'1px solid rgba(36,63,82,0.65)' }}>
              <span style={{ fontSize:20 }}>{f.icon}</span>
              <span style={{ fontSize:14, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{f.text}</span>
              <span style={{ marginLeft:'auto', color:'#34d399', fontSize:16 }}>✓</span>
            </div>
          ))}
        </div>

        <button onClick={onPay} style={{
          width:'100%', padding:'18px',
          background:'linear-gradient(135deg,#00C4B4,#007AFF)',
          border:'none', borderRadius:18, color:'#fff',
          fontSize:17, fontWeight:900, cursor:'pointer', fontFamily:F,
          boxShadow:'0 8px 32px rgba(0,180,166,0.5)', marginBottom:12,
        }}>
          {plan==='annual' ? 'Start PRO — $99/year' : 'Start PRO — $14.99/month'}
        </button>

        <button onClick={onSkip} style={{
          width:'100%', padding:'14px', background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.18)', borderRadius:14,
          color:'rgba(255,255,255,0.25)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:F, marginBottom:16,
        }}>
          Continue with Free (1 case)
        </button>

        <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.12)', margin:0, lineHeight:1.8 }}>
          Cancel anytime · Secure payment · 7-day free trial
        </p>
      </div>
    </div>
  )
}

// ── MAIN ──
export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide, setSlide]           = useState(0)
  const [progress, setProgress]     = useState(0)
  const [animIn, setAnimIn]         = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)
  const progressRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const DURATION = 5000
  const current = SLIDES[slide]
  const isLast  = slide === SLIDES.length - 1

  useEffect(() => {
    if (showPaywall) return
    setProgress(0)
    setAnimIn(true)
    const start = Date.now()
    const tick = () => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        progressRef.current = setTimeout(tick, 16)
      } else {
        if (isLast) setShowPaywall(true)
        else { setAnimIn(false); setTimeout(() => setSlide(s => s + 1), 200) }
      }
    }
    progressRef.current = setTimeout(tick, 16)
    return () => { if (progressRef.current) clearTimeout(progressRef.current) }
  }, [slide, showPaywall, isLast])

  const handleTap = () => {
    if (showPaywall) return
    if (progressRef.current) clearTimeout(progressRef.current)
    if (isLast) { setShowPaywall(true); return }
    setAnimIn(false)
    setTimeout(() => setSlide(s => s + 1), 180)
  }

  if (showPaywall) return (
    <Paywall
      onPay={() => { window.open('https://cliniverse.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank'); onComplete() }}
      onSkip={() => onComplete()}
    />
  )

  return (
    <div onClick={handleTap} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:`linear-gradient(160deg,${current.bg[0]} 0%,${current.bg[1]} 100%)`,
      fontFamily:F, display:'flex', flexDirection:'column',
      userSelect:'none', overflow:'hidden', cursor:'pointer',
      transition:'background 0.6s ease',
    }}>
      {/* Ambient glow */}
      <div style={{
        position:'absolute', top:-120, left:'50%', transform:'translateX(-50%)',
        width:500, height:500, borderRadius:'50%',
        background:`radial-gradient(circle,${current.glow} 0%,transparent 70%)`,
        pointerEvents:'none', transition:'background 0.6s',
      }}/>

      {/* Stories progress bars */}
      <div style={{ padding:'52px 20px 0', display:'flex', gap:5, position:'relative', zIndex:2 }}>
        {SLIDES.map((_,i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.12)', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:2,
              background: i < slide ? SLIDES[i].accent : i === slide ? current.accent : 'transparent',
              width: i < slide ? '100%' : i === slide ? `${progress}%` : '0%',
              boxShadow: i === slide ? `0 0 8px ${current.accent}` : 'none',
            }}/>
          </div>
        ))}
      </div>

      {/* Tag + counter */}
      <div style={{ padding:'14px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:2 }}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <CliniverseLogo size={26}/>
          <span style={{ fontSize:9, fontWeight:900, letterSpacing:3, color:current.accent, textTransform:'uppercase' as const, opacity:0.9 }}>
          {current.tag}</span>
        </div>
        <div style={{ fontSize:10, fontWeight:800, color:'rgba(0,196,180,0.25)', letterSpacing:1 }}>
          {slide+1}/{SLIDES.length}
        </div>
      </div>

      {/* Visual */}
      <div style={{
        flex:'0 0 auto', padding:'12px 24px 0', position:'relative', zIndex:2,
        opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(-10px)',
        transition:'opacity 0.4s, transform 0.4s',
      }}>
        <Visual type={current.visual} accent={current.accent}/>
      </div>

      {/* Text + buttons */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end',
        padding:'0 24px 44px', position:'relative', zIndex:2,
        opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity 0.4s 0.1s, transform 0.4s 0.1s',
      }}>
        <h1 style={{ fontSize:44, fontWeight:900, lineHeight:1.0, letterSpacing:-2, margin:'0 0 14px', color:'#fff' }}>
          {current.headline.map((line,i) => (
            <span key={i} style={{ display:'block', color: i===current.headline.length-1 ? current.accent : '#fff' }}>
              {line}
            </span>
          ))}
        </h1>
        <p style={{ fontSize:14, lineHeight:1.7, color:'rgba(255,255,255,0.45)', margin:'0 0 28px', fontWeight:500 }}>
          {current.sub}
        </p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={e=>{ e.stopPropagation(); handleTap() }} style={{
            flex:1, padding:'17px', background:current.btnGrad,
            border:'none', borderRadius:18, color:'#fff',
            fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:F,
            boxShadow:`0 8px 32px ${current.glow}`, letterSpacing:-0.3,
          }}>
            {isLast ? 'See Plans →' : 'Continue →'}
          </button>
          <button onClick={e=>{ e.stopPropagation(); setShowPaywall(true) }} style={{
            padding:'17px 18px', background:'rgba(255,255,255,0.12)',
            border:'1px solid rgba(0,196,180,0.20)', borderRadius:18,
            color:'rgba(255,255,255,0.35)', fontSize:13, fontWeight:700,
            cursor:'pointer', fontFamily:F,
          }}>Skip</button>
        </div>
      </div>
    </div>
  )
}
