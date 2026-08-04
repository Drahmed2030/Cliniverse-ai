'use client'
import { useState, useEffect, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const SLIDES = [
  {
    id: 'welcome',
    bg: ['#EBF5FF','#F0FAFF'],
    accent: '#00C2B2',
    emoji: '🏥',
    tag: null,
    title: 'Welcome to\nCliniverse AI',
    sub: 'The world\'s most advanced\nclinical simulation platform',
  },
  {
    id: 'cases',
    bg: ['#EDF6FF','#F2F9FF'],
    accent: '#0A84FF',
    emoji: '⚡',
    tag: '50+ Real Cases',
    title: 'Train with\nReal Scenarios',
    sub: 'STEMI, Sepsis, Stroke —\nlife-like patient simulations',
  },
  {
    id: 'ai',
    bg: ['#EDFFF8','#F0FFF9'],
    accent: '#00C2B2',
    emoji: '🤖',
    tag: 'Powered by Claude',
    title: 'AI Clinical\nConsultant',
    sub: 'Get instant expert guidance\non any clinical decision',
  },
  {
    id: 'ranks',
    bg: ['#FFFBEE','#FFFDF5'],
    accent: '#FF9F0A',
    emoji: '🏆',
    tag: '8 Clinical Ranks',
    title: 'Climb the\nClinical Ladder',
    sub: 'From Clinical Clerk to\nChief of Medicine',
  },
  {
    id: 'proof',
    bg: ['#F5F0FF','#F8F5FF'],
    accent: '#7C5CFC',
    emoji: '👨‍⚕️',
    tag: null,
    title: 'Trusted by\nDoctors Worldwide',
    sub: null,
  },
  {
    id: 'paywall',
    bg: ['#0A1628','#0A1628'],
    accent: '#00C2B2',
    emoji: null,
    tag: null,
    title: null,
    sub: null,
  },
]

const TESTIMONIALS = [
  { name:'Dr. Sarah K.', role:'Cardiology Resident', flag:'🇸🇦', text:'The STEMI simulation saved a real patient. I knew exactly what to do.' },
  { name:'Dr. Ahmed M.', role:'Emergency Medicine', flag:'🇦🇪', text:'Best clinical learning app I\'ve used. The AI consultant is incredible.' },
  { name:'Dr. Priya R.', role:'Internal Medicine', flag:'🇬🇧', text:'Went from Clinical Clerk to Specialist rank in 3 weeks!' },
]

const FEATURES = [
  { icon:'🏥', text:'Unlimited clinical cases — all specialties' },
  { icon:'🤖', text:'AI Consultant — instant clinical guidance' },
  { icon:'📜', text:'PDF Certificates for every completed case' },
  { icon:'🏆', text:'Global leaderboard & clinical ranks' },
  { icon:'📊', text:'Full performance analytics & insights' },
  { icon:'🔔', text:'On-call reminders & clinical alerts' },
]

interface Props { onComplete: (isPro: boolean) => void }

function ProofSlide({ accent }: { accent: string }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a+1)%TESTIMONIALS.length), 3000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ width:'100%', paddingBottom:20 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {[
          { v:'12K+', l:'Doctors' },
          { v:'48', l:'Countries' },
          { v:'94%', l:'Pass Rate' },
        ].map(s=>(
          <div key={s.l} style={{
            background:'rgba(255,255,255,0.90)', borderRadius:16, padding:'14px 8px',
            textAlign:'center', border:'1px solid rgba(10,132,255,0.10)',
            boxShadow:'0 2px 12px rgba(10,132,255,0.06)',
          }}>
            <div style={{ fontSize:22, fontWeight:900, color:accent }}>{s.v}</div>
            <div style={{ fontSize:11, color:'rgba(10,22,40,0.50)', fontWeight:600, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Testimonial */}
      <div style={{
        background:'rgba(255,255,255,0.92)', borderRadius:20, padding:'20px 18px',
        border:'1px solid rgba(10,132,255,0.10)',
        boxShadow:'0 4px 20px rgba(10,132,255,0.08)',
        minHeight:130,
      }}>
        <div style={{ fontSize:28, marginBottom:10 }}>"</div>
        <div style={{ fontSize:14, color:'#0A1628', lineHeight:1.65, marginBottom:14, fontWeight:500 }}>
          {TESTIMONIALS[active].text}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:'50%', fontSize:20,
            background:`${accent}14`, display:'flex', alignItems:'center', justifyContent:'center',
          }}>{TESTIMONIALS[active].flag}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#0A1628' }}>{TESTIMONIALS[active].name}</div>
            <div style={{ fontSize:11, color:'rgba(10,22,40,0.50)' }}>{TESTIMONIALS[active].role}</div>
          </div>
        </div>
      </div>
      {/* Dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
        {TESTIMONIALS.map((_,i)=>(
          <div key={i} style={{
            width: i===active ? 18 : 6, height:6, borderRadius:3,
            background: i===active ? accent : 'rgba(10,22,40,0.15)',
            transition:'all 0.3s',
          }}/>
        ))}
      </div>
    </div>
  )
}

function Paywall({ onSubscribe, onFree }: { onSubscribe:(plan:string)=>void; onFree:()=>void }) {
  const [selected, setSelected] = useState<'monthly'|'annual'>('annual')
  const [loading, setLoading] = useState(false)

  const plans = {
    monthly: { label:'Monthly', price:'$14.99', period:'/month', save:null, per:'$14.99/mo' },
    annual:  { label:'Annual',  price:'$99.99', period:'/year',  save:'Save 44%', per:'$8.33/mo' },
  }

  const handleSubscribe = () => {
    setLoading(true)
    setTimeout(() => onSubscribe(selected), 1000)
  }

  return (
    <div style={{ width:'100%', maxWidth:400, margin:'0 auto', fontFamily:F }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:68, height:68, borderRadius:20, marginBottom:14,
          background:'linear-gradient(135deg,#0A2540,#0D3060)',
          border:'1.5px solid rgba(0,194,178,0.30)',
          boxShadow:'0 8px 32px rgba(0,194,178,0.20)',
          fontSize:32,
        }}>⚕️</div>
        <div style={{ fontSize:28, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.8, marginBottom:6 }}>
          Cliniverse{' '}
          <span style={{
            background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>PRO</span>
        </div>
        <div style={{ fontSize:13, color:'rgba(242,248,255,0.55)', lineHeight:1.5 }}>
          Unlimited access to every case,{'\n'}AI consultant & certificate
        </div>
      </div>

      {/* Features */}
      <div style={{
        background:'rgba(255,255,255,0.06)', borderRadius:18,
        border:'1px solid rgba(255,255,255,0.09)', padding:'14px 16px', marginBottom:18,
      }}>
        {FEATURES.map((f,i)=>(
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:12, padding:'8px 0',
            borderBottom: i<FEATURES.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{ fontSize:18, minWidth:24 }}>{f.icon}</span>
            <span style={{ fontSize:13, color:'rgba(242,248,255,0.85)', fontWeight:500, flex:1 }}>{f.text}</span>
            <span style={{ color:'#00C2B2', fontSize:15 }}>✓</span>
          </div>
        ))}
      </div>

      {/* Plan selector */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {(Object.entries(plans) as [string, typeof plans.monthly][]).map(([key, plan])=>(
          <div key={key} onClick={()=>setSelected(key as 'monthly'|'annual')} style={{
            borderRadius:16, padding:'14px 12px', cursor:'pointer', textAlign:'center',
            position:'relative',
            border: selected===key ? '2px solid #00C2B2' : '1.5px solid rgba(255,255,255,0.10)',
            background: selected===key ? 'rgba(0,194,178,0.12)' : 'rgba(255,255,255,0.04)',
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
            <div style={{ fontSize:11, color:'rgba(242,248,255,0.50)', fontWeight:600, marginBottom:4 }}>{plan.label}</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.5 }}>{plan.price}</div>
            <div style={{ fontSize:10, color:'rgba(242,248,255,0.40)' }}>{plan.period}</div>
            {selected===key && (
              <div style={{
                position:'absolute', top:8, right:8,
                width:16, height:16, borderRadius:'50%', background:'#00C2B2',
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
        background: loading ? 'rgba(0,194,178,0.5)' : 'linear-gradient(135deg,#00C2B2,#0A84FF)',
        color:'white', fontSize:17, fontWeight:800, cursor: loading ? 'default' : 'pointer',
        boxShadow:'0 8px 32px rgba(0,194,178,0.30)', marginBottom:12,
        letterSpacing:-0.3, transition:'all 0.2s',
      }}>
        {loading ? '⏳ Processing...' : `Start PRO — ${plans[selected].per}`}
      </button>

      <button onClick={onFree} style={{
        width:'100%', padding:'13px', borderRadius:14, border:'none',
        background:'transparent', color:'rgba(242,248,255,0.35)',
        fontSize:14, fontWeight:600, cursor:'pointer',
      }}>
        Continue with Free — 1 case/day
      </button>

      <div style={{
        textAlign:'center', marginTop:12,
        fontSize:10, color:'rgba(242,248,255,0.20)', lineHeight:1.6,
      }}>
        Auto-renews. Cancel anytime in Settings.{'\n'}
        Subscribing means you agree to our Terms & Privacy Policy.
      </div>
    </div>
  )
}

export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide, setSlide]       = useState(0)
  const [progress, setProgress] = useState(0)
  const [animDir, setAnimDir]   = useState<'left'|'right'>('left')
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const touchX   = useRef(0)
  const DURATION = 5000
  const isPaywall = slide === SLIDES.length - 1
  const isProof   = SLIDES[slide].id === 'proof'

  const startTimer = () => {
    if (isPaywall) return
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    const step = 100 / (DURATION / 50)
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timerRef.current!)
          goNext()
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
    setAnimDir('left')
    setSlide(s => Math.min(s + 1, SLIDES.length - 1))
  }
  const goPrev = () => {
    if (slide === 0) return
    if (timerRef.current) clearInterval(timerRef.current)
    setAnimDir('right')
    setSlide(s => Math.max(s - 1, 0))
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isPaywall) return
    const x = e.clientX; const w = window.innerWidth
    if (x > w * 0.3) goNext(); else goPrev()
  }

  const s = SLIDES[slide]

  return (
    <div
      onClick={handleClick}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (dx < -50) goNext()
        else if (dx > 50) goPrev()
      }}
      style={{
        position:'fixed', inset:0, zIndex:9999, fontFamily:F,
        background: isPaywall ? '#0A1628' : `linear-gradient(160deg, ${s.bg[0]} 0%, ${s.bg[1]} 100%)`,
        display:'flex', flexDirection:'column',
        alignItems:'center', overflow:'hidden',
        transition:'background 0.4s ease',
      }}
    >
      {/* Progress bars */}
      {!isPaywall && (
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          display:'flex', gap:4, padding:'52px 16px 0', zIndex:100,
        }}>
          {SLIDES.slice(0,-1).map((_,i)=>(
            <div key={i} style={{
              flex:1, height:2.5, borderRadius:2,
              background:'rgba(10,22,40,0.10)', overflow:'hidden',
            }}>
              <div style={{
                height:'100%', borderRadius:2,
                background: i < slide ? s.accent : i === slide ? s.accent : 'transparent',
                width: i < slide ? '100%' : i === slide ? `${progress}%` : '0%',
                opacity: i < slide ? 0.5 : 1,
                transition: i === slide ? 'none' : 'none',
              }}/>
            </div>
          ))}
        </div>
      )}

      {/* Ambient glow */}
      {!isPaywall && (
        <div style={{
          position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)',
          width:350, height:350, borderRadius:'50%',
          background:`radial-gradient(circle, ${s.accent}15 0%, transparent 70%)`,
          filter:'blur(50px)', pointerEvents:'none',
        }}/>
      )}

      {/* Content */}
      {isPaywall ? (
        <div style={{
          width:'100%', height:'100%', overflowY:'auto',
          display:'flex', flexDirection:'column',
          alignItems:'center', padding:'60px 20px 40px',
        }}>
          <Paywall
            onSubscribe={(plan) => {
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
          padding:'90px 28px 80px', textAlign:'center', width:'100%',
          flex:1, justifyContent: isProof ? 'flex-start' : 'center',
        }}>
          {/* Emoji illustration */}
          {s.emoji && (
            <div style={{
              width:100, height:100, borderRadius:30, marginBottom:24,
              background:`linear-gradient(135deg, ${s.accent}18, ${s.accent}08)`,
              border:`1.5px solid ${s.accent}25`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:52,
              boxShadow:`0 8px 32px ${s.accent}20`,
              animation:'emojiIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>{s.emoji}</div>
          )}

          {/* Tag */}
          {s.tag && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:`${s.accent}14`, border:`1px solid ${s.accent}30`,
              borderRadius:20, padding:'5px 14px', marginBottom:14,
              fontSize:12, fontWeight:700, color:s.accent,
            }}>{s.tag}</div>
          )}

          {/* Title */}
          {s.title && (
            <div style={{
              fontSize:34, fontWeight:900, color:'#0A1628',
              letterSpacing:-1, lineHeight:1.15, marginBottom:14,
              whiteSpace:'pre-line',
            }}>{s.title}</div>
          )}

          {/* Subtitle */}
          {s.sub && (
            <div style={{
              fontSize:16, color:'rgba(10,22,40,0.55)',
              lineHeight:1.65, fontWeight:400, maxWidth:290,
              whiteSpace:'pre-line',
            }}>{s.sub}</div>
          )}

          {/* Proof slide content */}
          {isProof && <ProofSlide accent={s.accent} />}
        </div>
      )}

      {/* Bottom dots + Next button */}
      {!isPaywall && (
        <div style={{
          position:'absolute', bottom:40,
          display:'flex', flexDirection:'column', alignItems:'center', gap:16, width:'100%', padding:'0 24px',
        }}>
          {/* Next button on last non-paywall slide */}
          {slide === SLIDES.length - 2 && (
            <button onClick={e=>{e.stopPropagation();goNext()}} style={{
              width:'100%', maxWidth:320, padding:'16px', borderRadius:16, border:'none',
              background:`linear-gradient(135deg, ${s.accent}, #0A84FF)`,
              color:'white', fontSize:17, fontWeight:800, cursor:'pointer',
              boxShadow:`0 8px 28px ${s.accent}35`, letterSpacing:-0.3,
            }}>
              Get Started →
            </button>
          )}

          {/* Dots */}
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {SLIDES.slice(0,-1).map((_,i)=>(
              <div key={i} style={{
                width: i===slide ? 20 : 6, height:6, borderRadius:3,
                background: i===slide ? s.accent : 'rgba(10,22,40,0.15)',
                transition:'all 0.3s',
              }}/>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes emojiIn {
          from { opacity:0; transform:scale(0.7) translateY(10px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
