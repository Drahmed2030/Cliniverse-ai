'use client'
import { useState, useEffect, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const SLIDES = [
  {
    id: 'welcome',
    bg: ['#0A2540','#0D3060'],
    accent: '#00C2B2',
    icon: null,
    svg: 'hospital',
    title: 'Welcome to\nCliniverse AI',
    sub: 'The world\'s most advanced\nclinical simulation platform',
    badge: null,
  },
  {
    id: 'cases',
    bg: ['#0A1F3C','#0D2850'],
    accent: '#0A84FF',
    icon: null,
    svg: 'ecg',
    title: 'Real Clinical\nScenarios',
    sub: 'STEMI, Sepsis, Stroke — train with\nlife-like patient simulations',
    badge: '50+ Cases',
  },
  {
    id: 'ai',
    bg: ['#0D1F35','#0A2A48'],
    accent: '#30D158',
    icon: null,
    svg: 'brain',
    title: 'AI-Powered\nConsultant',
    sub: 'Get instant clinical guidance\npowered by advanced AI',
    badge: 'Powered by Claude',
  },
  {
    id: 'ranks',
    bg: ['#1A0A3C','#2A0D5C'],
    accent: '#FF9F0A',
    icon: null,
    svg: 'trophy',
    title: 'Climb the\nClinical Ranks',
    sub: 'From Clinical Clerk to\nChief of Medicine',
    badge: '8 Ranks',
  },
  {
    id: 'paywall',
    bg: ['#0A1628','#0A1628'],
    accent: '#00C2B2',
    icon: null,
    svg: 'pro',
    title: null,
    sub: null,
    badge: null,
  },
]

function HospitalSVG({ color }: { color: string }) {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <radialGradient id="hBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="75" fill="url(#hBg)"/>
      <rect x="35" y="55" width="90" height="75" rx="6" fill="none" stroke={color} strokeWidth="2.5" opacity="0.8"/>
      <rect x="55" y="35" width="50" height="30" rx="4" fill="none" stroke={color} strokeWidth="2" opacity="0.6"/>
      <line x1="65" y1="75" x2="95" y2="75" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="80" y1="60" x2="80" y2="90" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <rect x="60" y="100" width="40" height="30" rx="3" fill={color} opacity="0.2"/>
      <rect x="72" y="105" width="16" height="25" rx="2" fill={color} opacity="0.5"/>
      {[40,60,100,120].map((x,i)=>(
        <rect key={i} x={x} y="60" width="12" height="14" rx="2" fill={color} opacity="0.15"/>
      ))}
    </svg>
  )
}

function ECGSvg({ color }: { color: string }) {
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
      <defs>
        <linearGradient id="ecgG" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0"/>
          <stop offset="20%" stopColor={color}/>
          <stop offset="80%" stopColor={color}/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
        <filter id="ecgGlow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polyline
        points="0,50 20,50 28,50 34,24 40,76 46,36 52,62 58,50 80,50 88,50 94,26 100,74 106,38 112,50 160,50"
        fill="none" stroke="url(#ecgG)" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"
        filter="url(#ecgGlow)">
        <animate attributeName="stroke-dasharray" from="0 400" to="400 0" dur="2s" repeatCount="indefinite"/>
      </polyline>
      <circle cx="112" cy="50" r="4" fill={color} filter="url(#ecgGlow)">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}

function BrainSVG({ color }: { color: string }) {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <radialGradient id="brBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
        <filter id="brGlow">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="80" cy="80" r="75" fill="url(#brBg)"/>
      <path d="M80 40 C60 38, 42 50, 40 68 C38 82, 45 92, 55 96 C65 100, 75 95, 80 90"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" filter="url(#brGlow)" opacity="0.9"/>
      <path d="M80 40 C100 38, 118 50, 120 68 C122 82, 115 92, 105 96 C95 100, 85 95, 80 90"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" filter="url(#brGlow)" opacity="0.9"/>
      <line x1="80" y1="40" x2="80" y2="90" stroke={color} strokeWidth="1.5" opacity="0.3"/>
      {[[55,60],[65,50],[95,60],[105,55],[50,75],[110,72],[60,82],[100,80]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill={color} opacity="0.5" filter="url(#brGlow)">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {[[55,60,65,50],[65,50,80,55],[95,60,105,55],[80,55,95,60],[50,75,60,82],[110,72,100,80]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" opacity="0.25"/>
      ))}
    </svg>
  )
}

function TrophySVG({ color }: { color: string }) {
  return (
    <svg width="140" height="160" viewBox="0 0 140 160" fill="none">
      <defs>
        <linearGradient id="trG" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </linearGradient>
        <filter id="trGlow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M45 30 L95 30 L90 80 C88 96, 52 96, 50 80 Z"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" filter="url(#trGlow)" opacity="0.9"/>
      <path d="M45 45 C30 43, 22 55, 28 68 C32 76, 42 80, 50 78"
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M95 45 C110 43, 118 55, 112 68 C108 76, 98 80, 90 78"
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="70" y1="96" x2="70" y2="118" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <rect x="45" y="118" width="50" height="8" rx="4" fill={color} opacity="0.5" filter="url(#trGlow)"/>
      <text x="70" y="65" textAnchor="middle" fill={color} fontSize="22" fontWeight="900" opacity="0.9"
        style={{fontFamily:F}}>🏆</text>
    </svg>
  )
}

function Paywall({ onSubscribe, onFree }: { onSubscribe:(plan:string)=>void; onFree:()=>void }) {
  const [selected, setSelected] = useState<'monthly'|'annual'>('monthly')
  const [loading, setLoading] = useState(false)

  const plans = {
    monthly: { label:'Monthly', price:'$14.99', period:'/month', save:null },
    annual:  { label:'Annual',  price:'$99.99', period:'/year', save:'Save 44%' },
  }

  const handleSubscribe = () => {
    setLoading(true)
    setTimeout(() => onSubscribe(selected), 1200)
  }

  return (
    <div style={{ width:'100%', maxWidth:400, margin:'0 auto', padding:'0 4px' }}>

      {/* Logo + Title */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:64, height:64, borderRadius:18, marginBottom:14,
          background:'linear-gradient(135deg,#0A2540,#0D3060)',
          border:'1.5px solid rgba(0,194,178,0.30)',
          boxShadow:'0 8px 32px rgba(0,194,178,0.20)',
        }}>
          <span style={{ fontSize:28 }}>⚕️</span>
        </div>
        <div style={{ fontSize:26, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.8, lineHeight:1.2, marginBottom:8 }}>
          Cliniverse <span style={{
            background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>PRO</span>
        </div>
        <div style={{ fontSize:14, color:'rgba(242,248,255,0.55)', fontWeight:500, lineHeight:1.5 }}>
          Unlimited access to every case,{'\n'}AI consultant & certificate
        </div>
      </div>

      {/* Features */}
      <div style={{
        background:'rgba(255,255,255,0.05)', borderRadius:18,
        border:'1px solid rgba(255,255,255,0.09)',
        padding:'16px 18px', marginBottom:20,
      }}>
        {[
          { icon:'🏥', text:'Unlimited clinical cases — all specialties' },
          { icon:'🤖', text:'AI Consultant — instant clinical guidance' },
          { icon:'📜', text:'PDF Certificates for every case' },
          { icon:'🏆', text:'Global leaderboard & clinical ranks' },
          { icon:'📊', text:'Full performance analytics & stats' },
          { icon:'🔔', text:'On-call reminders & clinical alerts' },
        ].map((f,i)=>(
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'9px 0',
            borderBottom: i<5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{ fontSize:18, minWidth:24 }}>{f.icon}</span>
            <span style={{ fontSize:14, color:'rgba(242,248,255,0.85)', fontWeight:500 }}>{f.text}</span>
            <span style={{ marginLeft:'auto', color:'#00C2B2', fontSize:16 }}>✓</span>
          </div>
        ))}
      </div>

      {/* Plan selector */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        {(Object.entries(plans) as [string, typeof plans.monthly][]).map(([key, plan])=>(
          <div key={key} onClick={()=>setSelected(key as 'monthly'|'annual')} style={{
            borderRadius:16, padding:'14px 12px', cursor:'pointer',
            border: selected===key
              ? '2px solid #00C2B2'
              : '1.5px solid rgba(255,255,255,0.10)',
            background: selected===key
              ? 'rgba(0,194,178,0.12)'
              : 'rgba(255,255,255,0.04)',
            textAlign:'center', position:'relative',
            transition:'all 0.2s',
          }}>
            {plan.save && (
              <div style={{
                position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
                background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
                borderRadius:20, padding:'3px 10px',
                fontSize:10, fontWeight:800, color:'white', whiteSpace:'nowrap',
              }}>{plan.save}</div>
            )}
            <div style={{ fontSize:12, color:'rgba(242,248,255,0.55)', fontWeight:600, marginBottom:4 }}>{plan.label}</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.5 }}>{plan.price}</div>
            <div style={{ fontSize:11, color:'rgba(242,248,255,0.40)' }}>{plan.period}</div>
            {selected===key && (
              <div style={{
                position:'absolute', top:10, right:10,
                width:16, height:16, borderRadius:'50%',
                background:'#00C2B2',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:9, color:'white', fontWeight:900,
              }}>✓</div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={handleSubscribe} disabled={loading} style={{
        width:'100%', padding:'16px', borderRadius:16, border:'none',
        background: loading
          ? 'rgba(0,194,178,0.5)'
          : 'linear-gradient(135deg,#00C2B2 0%,#0A84FF 100%)',
        color:'white', fontSize:17, fontWeight:800, cursor: loading ? 'default' : 'pointer',
        boxShadow:'0 8px 32px rgba(0,194,178,0.30)',
        transition:'all 0.2s', letterSpacing:-0.3,
        marginBottom:12,
      }}>
        {loading ? '⏳ Processing...' : `Start PRO — ${plans[selected].price}${plans[selected].period}`}
      </button>

      {/* Free option */}
      <button onClick={onFree} style={{
        width:'100%', padding:'13px', borderRadius:14, border:'none',
        background:'transparent', color:'rgba(242,248,255,0.40)',
        fontSize:14, fontWeight:600, cursor:'pointer',
        transition:'color 0.2s',
      }}>
        Continue with Free — 1 case/day
      </button>

      {/* Legal */}
      <div style={{
        textAlign:'center', marginTop:14,
        fontSize:10, color:'rgba(242,248,255,0.22)', lineHeight:1.6,
      }}>
        Auto-renews. Cancel anytime in Settings.{'\n'}
        By subscribing you agree to our Terms & Privacy Policy.
      </div>
    </div>
  )
}

interface OnboardingProps {
  onComplete: (isPro: boolean) => void
}

export default function OnboardingFunnel({ onComplete }: OnboardingProps) {
  const [slide, setSlide]       = useState(0)
  const [progress, setProgress] = useState(0)
  const [touching, setTouching] = useState(false)
  const touchX = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const DURATION = 4500

  const isPaywall = slide === SLIDES.length - 1

  const startTimer = () => {
    if (isPaywall) return
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    const step = 100 / (DURATION / 50)
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timerRef.current!)
          setSlide(s => Math.min(s + 1, SLIDES.length - 1))
          return 0
        }
        return p + step
      })
    }, 50)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slide])

  const goNext = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSlide(s => Math.min(s + 1, SLIDES.length - 1))
  }
  const goPrev = () => {
    if (slide === 0) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSlide(s => Math.max(s - 1, 0))
  }

  const handleTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setTouching(true) }
  const handleTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current
    if (dx < -40) goNext()
    else if (dx > 40) goPrev()
    setTouching(false)
  }
  const handleClick = (e: React.MouseEvent) => {
    if (isPaywall) return
    const x = e.clientX; const w = window.innerWidth
    if (x > w * 0.35) goNext(); else goPrev()
  }

  const s = SLIDES[slide]

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background: isPaywall
          ? '#0A1628'
          : `linear-gradient(160deg, ${s.bg[0]} 0%, ${s.bg[1]} 100%)`,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        fontFamily:F, overflow:'hidden',
        transition:'background 0.5s ease',
      }}
    >

      {/* Progress bars — story style */}
      {!isPaywall && (
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          display:'flex', gap:5, padding:'54px 20px 0',
          zIndex:100,
        }}>
          {SLIDES.slice(0,-1).map((_,i)=>(
            <div key={i} style={{
              flex:1, height:2.5, borderRadius:2,
              background:'rgba(255,255,255,0.18)', overflow:'hidden',
            }}>
              <div style={{
                height:'100%', borderRadius:2,
                background:'rgba(255,255,255,0.88)',
                width: i < slide ? '100%' : i === slide ? `${progress}%` : '0%',
                transition: i === slide ? 'none' : 'none',
              }}/>
            </div>
          ))}
        </div>
      )}

      {/* Ambient glow */}
      {!isPaywall && (
        <div style={{
          position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)',
          width:400, height:400, borderRadius:'50%',
          background:`radial-gradient(circle, ${s.accent}18 0%, transparent 70%)`,
          filter:'blur(60px)', pointerEvents:'none', transition:'background 0.5s',
        }}/>
      )}

      {/* Content */}
      {isPaywall ? (
        <div style={{
          width:'100%', height:'100%',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'60px 20px 40px', overflowY:'auto',
        }}>
          <Paywall
            onSubscribe={(plan) => {
              // Open payment
              if (typeof window !== 'undefined') {
                window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank')
              }
              onComplete(true)
            }}
            onFree={() => onComplete(false)}
          />
        </div>
      ) : (
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          padding:'100px 32px 80px', textAlign:'center', width:'100%',
          pointerEvents:'none',
        }}>

          {/* Illustration */}
          <div style={{
            marginBottom:36,
            filter:`drop-shadow(0 0 30px ${s.accent}50)`,
            animation:'slideIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {s.svg==='hospital' && <HospitalSVG color={s.accent}/>}
            {s.svg==='ecg'      && <ECGSvg color={s.accent}/>}
            {s.svg==='brain'    && <BrainSVG color={s.accent}/>}
            {s.svg==='trophy'   && <TrophySVG color={s.accent}/>}
          </div>

          {/* Badge */}
          {s.badge && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:`${s.accent}20`, border:`1px solid ${s.accent}40`,
              borderRadius:20, padding:'5px 14px', marginBottom:16,
              fontSize:12, fontWeight:700, color:s.accent,
              animation:'fadeUp 0.4s ease',
            }}>{s.badge}</div>
          )}

          {/* Title */}
          <div style={{
            fontSize:34, fontWeight:900, color:'white',
            letterSpacing:-1, lineHeight:1.15, marginBottom:14,
            whiteSpace:'pre-line', animation:'fadeUp 0.5s ease',
          }}>{s.title}</div>

          {/* Subtitle */}
          <div style={{
            fontSize:16, color:'rgba(255,255,255,0.60)',
            lineHeight:1.6, fontWeight:400, maxWidth:280,
            whiteSpace:'pre-line', animation:'fadeUp 0.6s ease',
          }}>{s.sub}</div>
        </div>
      )}

      {/* Dot indicators */}
      {!isPaywall && (
        <div style={{
          position:'absolute', bottom:50,
          display:'flex', gap:6, alignItems:'center',
        }}>
          {SLIDES.slice(0,-1).map((_,i)=>(
            <div key={i} style={{
              width: i===slide ? 20 : 6, height:6, borderRadius:3,
              background: i===slide ? s.accent : 'rgba(255,255,255,0.25)',
              transition:'all 0.3s ease',
            }}/>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:scale(0.85) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
