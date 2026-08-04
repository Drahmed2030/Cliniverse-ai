'use client'
import { useState, useEffect, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── CSS Animations ────────────────────────────────────────────────
const STYLES = `
  @keyframes heartbeat {
    0%,100% { transform: scale(1); }
    14%     { transform: scale(1.18); }
    28%     { transform: scale(1); }
    42%     { transform: scale(1.12); }
    56%     { transform: scale(1); }
  }
  @keyframes ecgDraw {
    from { stroke-dashoffset: 400; opacity:0.3; }
    to   { stroke-dashoffset: 0;   opacity:1; }
  }
  @keyframes ecgLoop {
    0%   { stroke-dashoffset: 400; opacity:0.4; }
    50%  { stroke-dashoffset: 0;   opacity:1; }
    100% { stroke-dashoffset:-400; opacity:0.4; }
  }
  @keyframes brainPulse {
    0%,100% { opacity:0.4; transform:scale(1); }
    50%     { opacity:1;   transform:scale(1.05); }
  }
  @keyframes nodeGlow {
    0%,100% { opacity:0.3; r:3; }
    50%     { opacity:1;   r:5; }
  }
  @keyframes trophyBounce {
    0%,100% { transform:translateY(0) rotate(-3deg); }
    50%     { transform:translateY(-12px) rotate(3deg); }
  }
  @keyframes starSpin {
    from { transform:rotate(0deg) scale(1); opacity:0.6; }
    to   { transform:rotate(360deg) scale(1.2); opacity:1; }
  }
  @keyframes riseUp {
    from { transform:translateY(20px); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(45px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
  }
  @keyframes rankBar {
    from { width:0%; }
    to   { width:var(--w); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0px); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes emojiIn {
    from { opacity:0; transform:scale(0.6) translateY(16px); }
    to   { opacity:1; transform:scale(1)   translateY(0); }
  }
`

// ── Illustration Components ───────────────────────────────────────

function HeartbeatIllustration({ color }: { color: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      {/* Beating heart */}
      <div style={{
        fontSize:80, lineHeight:1,
        animation:'heartbeat 1.4s ease-in-out infinite',
        filter:`drop-shadow(0 0 20px ${color}60)`,
      }}>🏥</div>
      {/* ECG line */}
      <svg width="220" height="44" viewBox="0 0 220 44" style={{overflow:'visible'}}>
        <defs>
          <linearGradient id="ecgG" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={color} stopOpacity="0"/>
            <stop offset="30%" stopColor={color}/>
            <stop offset="70%" stopColor={color}/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          <filter id="ecgGlow">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <polyline
          points="0,22 28,22 36,22 44,6 52,38 60,12 68,30 76,22 110,22 118,22 126,6 134,38 142,12 150,30 158,22 220,22"
          fill="none" stroke="url(#ecgG)" strokeWidth="2.8"
          strokeLinecap="round" strokeLinejoin="round"
          filter="url(#ecgGlow)"
          strokeDasharray="400"
          style={{ animation:'ecgLoop 2.4s ease-in-out infinite' }}
        />
        <circle cx="158" cy="22" r="4" fill={color} filter="url(#ecgGlow)">
          <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  )
}

function CasesIllustration({ color }: { color: string }) {
  const cases = [
    { icon:'🫀', label:'STEMI', top:0, left:0 },
    { icon:'🧠', label:'Stroke', top:0, right:0 },
    { icon:'🫁', label:'Sepsis', bottom:0, left:0 },
    { icon:'🩺', label:'Trauma', bottom:0, right:0 },
  ]
  return (
    <div style={{ position:'relative', width:180, height:180 }}>
      {/* Center */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:64, height:64, borderRadius:20,
        background:`linear-gradient(135deg,${color},#0A84FF)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:30,
        boxShadow:`0 8px 28px ${color}50`,
        animation:'float 3s ease-in-out infinite',
      }}>⚡</div>
      {/* Corner cards */}
      {[
        { icon:'🫀', label:'STEMI',  top:0,    left:0 },
        { icon:'🧠', label:'Stroke', top:0,    right:0 },
        { icon:'🫁', label:'Sepsis', bottom:0, left:0 },
        { icon:'🩺', label:'Trauma', bottom:0, right:0 },
      ].map((c,i)=>(
        <div key={c.label} style={{
          position:'absolute', ...c,
          width:56, height:56, borderRadius:16,
          background:'rgba(255,255,255,0.92)',
          border:`1.5px solid ${color}25`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:2, boxShadow:`0 4px 16px ${color}15`,
          animation:`riseUp 0.5s ease ${i*0.1}s both`,
        }}>
          <span style={{ fontSize:22 }}>{c.icon}</span>
          <span style={{ fontSize:8, fontWeight:700, color:`${color}`, letterSpacing:0.5 }}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function AIIllustration({ color }: { color: string }) {
  const nodes = [
    { cx:50,  cy:50,  delay:'0s' },
    { cx:130, cy:50,  delay:'0.3s' },
    { cx:90,  cy:110, delay:'0.6s' },
    { cx:30,  cy:110, delay:'0.9s' },
    { cx:150, cy:110, delay:'1.2s' },
  ]
  return (
    <div style={{ position:'relative', width:180, height:160 }}>
      <svg width="180" height="160" viewBox="0 0 180 160" fill="none">
        <defs>
          <filter id="nodeGlow2">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Connections */}
        {[[50,50,130,50],[50,50,90,110],[130,50,90,110],[50,50,30,110],[130,50,150,110],[90,110,30,110],[90,110,150,110]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="1.5" opacity="0.25"
            strokeDasharray="4 4">
            <animate attributeName="opacity" values="0.15;0.40;0.15"
              dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/>
          </line>
        ))}
        {/* Nodes */}
        {nodes.map((n,i)=>(
          <circle key={i} cx={n.cx} cy={n.cy} r="10"
            fill={`${color}18`} stroke={color} strokeWidth="2"
            filter="url(#nodeGlow2)">
            <animate attributeName="r" values="8;12;8"
              dur={`${1.5+i*0.3}s`} begin={n.delay} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;1;0.5"
              dur={`${1.5+i*0.3}s`} begin={n.delay} repeatCount="indefinite"/>
          </circle>
        ))}
      </svg>
      {/* Center bot */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        fontSize:40,
        filter:`drop-shadow(0 0 16px ${color}60)`,
        animation:'float 2.5s ease-in-out infinite',
      }}>🤖</div>
    </div>
  )
}

function RanksIllustration({ color }: { color: string }) {
  const ranks = [
    { name:'Clinical Clerk', pct:20, c:'#64748b' },
    { name:'Resident',       pct:45, c:'#00C2B2' },
    { name:'Specialist',     pct:70, c:'#0A84FF' },
    { name:'Consultant',     pct:90, c:'#FF9F0A' },
    { name:'Chief',          pct:100, c:color },
  ]
  return (
    <div style={{ width:240 }}>
      {/* Trophy */}
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <span style={{ fontSize:52, animation:'trophyBounce 2s ease-in-out infinite', display:'inline-block', filter:`drop-shadow(0 0 16px ${color}60)` }}>🏆</span>
      </div>
      {/* Rank bars */}
      {ranks.map((r,i)=>(
        <div key={r.name} style={{ marginBottom:6, animation:`riseUp 0.4s ease ${i*0.08}s both` }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:10, color:'rgba(10,22,40,0.55)', fontWeight:600 }}>{r.name}</span>
            <span style={{ fontSize:10, color:r.c, fontWeight:700 }}>{r.pct}%</span>
          </div>
          <div style={{ height:6, background:'rgba(10,22,40,0.08)', borderRadius:3, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:3,
              background:`linear-gradient(90deg,${r.c},${r.c}bb)`,
              boxShadow:`0 0 8px ${r.c}50`,
              animation:`rankBar 1s ease ${i*0.15}s both`,
              ['--w' as any]: `${r.pct}%`,
            }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Proof Slide ───────────────────────────────────────────────────
const TESTIMONIALS = [
  { name:'Dr. Sarah K.', role:'Cardiology Resident', flag:'🇸🇦', text:'The STEMI simulation saved a real patient. I knew exactly what to do.' },
  { name:'Dr. Ahmed M.', role:'Emergency Medicine',  flag:'🇦🇪', text:'Best clinical learning app I\'ve used. The AI consultant is incredible.' },
  { name:'Dr. Priya R.', role:'Internal Medicine',   flag:'🇬🇧', text:'Went from Clinical Clerk to Specialist rank in 3 weeks!' },
]

function ProofSlide({ accent }: { accent: string }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a=>(a+1)%TESTIMONIALS.length), 3200)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[{v:'12K+',l:'Doctors'},{v:'48',l:'Countries'},{v:'94%',l:'Pass Rate'}].map(s=>(
          <div key={s.l} style={{
            background:'rgba(255,255,255,0.92)', borderRadius:16, padding:'14px 8px',
            textAlign:'center', border:'1px solid rgba(10,132,255,0.10)',
            boxShadow:'0 2px 12px rgba(10,132,255,0.06)',
          }}>
            <div style={{ fontSize:22, fontWeight:900, color:accent }}>{s.v}</div>
            <div style={{ fontSize:11, color:'rgba(10,22,40,0.50)', fontWeight:600, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{
        background:'rgba(255,255,255,0.92)', borderRadius:20, padding:'20px 18px',
        border:'1px solid rgba(10,132,255,0.10)',
        boxShadow:'0 4px 20px rgba(10,132,255,0.08)', minHeight:140,
        animation:'fadeIn 0.4s ease',
        key:active,
      }}>
        <div style={{ fontSize:32, color:accent, lineHeight:1, marginBottom:8 }}>"</div>
        <div style={{ fontSize:14, color:'#0A1628', lineHeight:1.65, marginBottom:16, fontWeight:500 }}>
          {TESTIMONIALS[active].text}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:'50%',fontSize:20,background:`${accent}14`,display:'flex',alignItems:'center',justifyContent:'center' }}>
            {TESTIMONIALS[active].flag}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#0A1628' }}>{TESTIMONIALS[active].name}</div>
            <div style={{ fontSize:11, color:'rgba(10,22,40,0.50)' }}>{TESTIMONIALS[active].role}</div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:14 }}>
        {TESTIMONIALS.map((_,i)=>(
          <div key={i} style={{
            width:i===active?18:6, height:6, borderRadius:3,
            background:i===active?accent:'rgba(10,22,40,0.15)',
            transition:'all 0.3s',
          }}/>
        ))}
      </div>
    </div>
  )
}

// ── Paywall ───────────────────────────────────────────────────────
const FEATURES = [
  { icon:'🏥', text:'Unlimited clinical cases — all specialties' },
  { icon:'🤖', text:'AI Consultant — instant clinical guidance' },
  { icon:'📜', text:'PDF Certificates for every completed case' },
  { icon:'🏆', text:'Global leaderboard & clinical ranks' },
  { icon:'📊', text:'Full performance analytics & insights' },
  { icon:'🔔', text:'On-call reminders & clinical alerts' },
]

function Paywall({ onSubscribe, onFree }: { onSubscribe:(p:string)=>void; onFree:()=>void }) {
  const [selected, setSelected] = useState<'monthly'|'annual'>('annual')
  const [loading,  setLoading]  = useState(false)
  const plans = {
    monthly: { label:'Monthly', price:'$14.99', period:'/month', save:null,       per:'$14.99/mo' },
    annual:  { label:'Annual',  price:'$99.99', period:'/year',  save:'Save 44%', per:'$8.33/mo'  },
  }
  const handle = () => { setLoading(true); setTimeout(()=>onSubscribe(selected),1000) }
  return (
    <div style={{ width:'100%', maxWidth:400, margin:'0 auto', fontFamily:F }}>
      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:70, height:70, borderRadius:22, marginBottom:14,
          background:'linear-gradient(135deg,#0A2540,#0D3060)',
          border:'1.5px solid rgba(0,194,178,0.30)',
          boxShadow:'0 8px 32px rgba(0,194,178,0.20)', fontSize:34,
        }}>⚕️</div>
        <div style={{ fontSize:28, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.8, marginBottom:6 }}>
          Cliniverse{' '}
          <span style={{ background:'linear-gradient(135deg,#00C2B2,#0A84FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PRO</span>
        </div>
        <div style={{ fontSize:13, color:'rgba(242,248,255,0.55)' }}>Unlimited access to every case & AI consultant</div>
      </div>

      <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:18, border:'1px solid rgba(255,255,255,0.09)', padding:'14px 16px', marginBottom:16 }}>
        {FEATURES.map((f,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:i<FEATURES.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
            <span style={{ fontSize:18, minWidth:24 }}>{f.icon}</span>
            <span style={{ fontSize:13, color:'rgba(242,248,255,0.85)', fontWeight:500, flex:1 }}>{f.text}</span>
            <span style={{ color:'#00C2B2', fontSize:15 }}>✓</span>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {(Object.entries(plans) as [string, typeof plans.monthly][]).map(([key,plan])=>(
          <div key={key} onClick={()=>setSelected(key as 'monthly'|'annual')} style={{
            borderRadius:16, padding:'14px 12px', cursor:'pointer', textAlign:'center', position:'relative',
            border:selected===key?'2px solid #00C2B2':'1.5px solid rgba(255,255,255,0.10)',
            background:selected===key?'rgba(0,194,178,0.12)':'rgba(255,255,255,0.04)',
            transition:'all 0.2s',
          }}>
            {plan.save&&<div style={{ position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#00C2B2,#0A84FF)',borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:800,color:'white',whiteSpace:'nowrap' }}>{plan.save}</div>}
            <div style={{ fontSize:11, color:'rgba(242,248,255,0.50)', fontWeight:600, marginBottom:4 }}>{plan.label}</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.5 }}>{plan.price}</div>
            <div style={{ fontSize:10, color:'rgba(242,248,255,0.40)' }}>{plan.period}</div>
            {selected===key&&<div style={{ position:'absolute',top:8,right:8,width:16,height:16,borderRadius:'50%',background:'#00C2B2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',fontWeight:900 }}>✓</div>}
          </div>
        ))}
      </div>

      <button onClick={handle} disabled={loading} style={{
        width:'100%', padding:'16px', borderRadius:16, border:'none',
        background:loading?'rgba(0,194,178,0.5)':'linear-gradient(135deg,#00C2B2,#0A84FF)',
        color:'white', fontSize:17, fontWeight:800, cursor:loading?'default':'pointer',
        boxShadow:'0 8px 32px rgba(0,194,178,0.30)', marginBottom:12,
        letterSpacing:-0.3, transition:'all 0.2s',
      }}>{loading?'⏳ Processing...':`Start PRO — ${plans[selected].per}`}</button>

      <button onClick={onFree} style={{
        width:'100%', padding:'13px', borderRadius:14, border:'none',
        background:'transparent', color:'rgba(242,248,255,0.35)',
        fontSize:14, fontWeight:600, cursor:'pointer',
      }}>Continue with Free — 1 case/day</button>

      <div style={{ textAlign:'center', marginTop:12, fontSize:10, color:'rgba(242,248,255,0.20)', lineHeight:1.6 }}>
        Auto-renews. Cancel anytime in Settings.
      </div>
    </div>
  )
}

// ── Slides config ─────────────────────────────────────────────────
const SLIDES = [
  { id:'welcome', bg:['#EBF5FF','#F0FAFF'], accent:'#00C2B2',  tag:null,              title:'Welcome to\nCliniverse AI',       sub:'The world\'s most advanced\nclinical simulation platform', illustration:'heartbeat' },
  { id:'cases',   bg:['#EDF6FF','#F2F9FF'], accent:'#0A84FF',  tag:'50+ Real Cases',  title:'Train with\nReal Scenarios',      sub:'STEMI, Sepsis, Stroke —\nlife-like patient simulations',  illustration:'cases'    },
  { id:'ai',      bg:['#EDFFF8','#F0FFF9'], accent:'#00C2B2',  tag:'Powered by Claude',title:'AI Clinical\nConsultant',        sub:'Get instant expert guidance\non any clinical decision',      illustration:'ai'       },
  { id:'ranks',   bg:['#FFFBEE','#FFFDF5'], accent:'#FF9F0A',  tag:'8 Clinical Ranks', title:'Climb the\nClinical Ladder',     sub:null,                                                         illustration:'ranks'    },
  { id:'proof',   bg:['#F5F0FF','#F8F5FF'], accent:'#7C5CFC',  tag:null,              title:'Trusted by\nDoctors Worldwide',   sub:null,                                                         illustration:'proof'    },
  { id:'paywall', bg:['#0A1628','#0A1628'], accent:'#00C2B2',  tag:null,              title:null,                              sub:null,                                                         illustration:'paywall'  },
]

// ── Main ──────────────────────────────────────────────────────────
interface Props { onComplete: (isPro: boolean) => void }

export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide,    setSlide]    = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const touchX   = useRef(0)

  const s         = SLIDES[slide]
  const isPaywall = s.id === 'paywall'
  const isProof   = s.id === 'proof'
  const DURATION  = isProof ? 6000 : 4800

  const startTimer = () => {
    if (isPaywall) return
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    const step = 100 / (DURATION / 50)
    timerRef.current = setInterval(()=>{
      setProgress(p=>{
        if (p >= 100) { clearInterval(timerRef.current!); goNext(); return 0 }
        return p + step
      })
    }, 50)
  }

  useEffect(()=>{ startTimer(); return ()=>{ if(timerRef.current) clearInterval(timerRef.current) } }, [slide])

  const goNext = () => { if(timerRef.current) clearInterval(timerRef.current); setSlide(s=>Math.min(s+1,SLIDES.length-1)) }
  const goPrev = () => { if(slide===0) return; if(timerRef.current) clearInterval(timerRef.current); setSlide(s=>Math.max(s-1,0)) }

  const handleClick = (e: React.MouseEvent) => {
    if (isPaywall) return
    e.clientX > window.innerWidth*0.3 ? goNext() : goPrev()
  }

  return (
    <div
      onClick={handleClick}
      onTouchStart={e=>{ touchX.current=e.touches[0].clientX }}
      onTouchEnd={e=>{ const dx=e.changedTouches[0].clientX-touchX.current; if(dx<-50)goNext(); else if(dx>50)goPrev() }}
      style={{
        position:'fixed', inset:0, zIndex:9999, fontFamily:F,
        background:isPaywall?'#0A1628':`linear-gradient(160deg,${s.bg[0]},${s.bg[1]})`,
        display:'flex', flexDirection:'column', alignItems:'center', overflow:'hidden',
        transition:'background 0.4s ease',
      }}
    >
      <style>{STYLES}</style>

      {/* Progress bars */}
      {!isPaywall && (
        <div style={{ position:'absolute',top:0,left:0,right:0,display:'flex',gap:4,padding:'52px 16px 0',zIndex:100 }}>
          {SLIDES.slice(0,-1).map((_,i)=>(
            <div key={i} style={{ flex:1,height:2.5,borderRadius:2,background:'rgba(10,22,40,0.10)',overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:2,
                background:i<slide?s.accent:i===slide?s.accent:'transparent',
                width:i<slide?'100%':i===slide?`${progress}%`:'0%',
                opacity:i<slide?0.45:1,
              }}/>
            </div>
          ))}
        </div>
      )}

      {/* Ambient glow */}
      {!isPaywall && (
        <div style={{
          position:'absolute',top:'8%',left:'50%',transform:'translateX(-50%)',
          width:320,height:320,borderRadius:'50%',
          background:`radial-gradient(circle,${s.accent}18 0%,transparent 70%)`,
          filter:'blur(50px)',pointerEvents:'none',
        }}/>
      )}

      {/* Content */}
      {isPaywall ? (
        <div style={{ width:'100%',height:'100%',overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',padding:'56px 20px 40px' }}>
          <Paywall
            onSubscribe={()=>{
              if(typeof window!=='undefined') window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank')
              onComplete(true)
            }}
            onFree={()=>onComplete(false)}
          />
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'86px 28px 88px',textAlign:'center',width:'100%',flex:1,justifyContent:isProof?'flex-start':'center' }}>

          {/* Illustration */}
          <div style={{ marginBottom:24, animation:'emojiIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
            {s.illustration==='heartbeat' && <HeartbeatIllustration color={s.accent}/>}
            {s.illustration==='cases'     && <CasesIllustration color={s.accent}/>}
            {s.illustration==='ai'        && <AIIllustration color={s.accent}/>}
            {s.illustration==='ranks'     && <RanksIllustration color={s.accent}/>}
            {s.illustration==='proof'     && <ProofSlide accent={s.accent}/>}
          </div>

          {/* Tag */}
          {s.tag && (
            <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`${s.accent}14`,border:`1px solid ${s.accent}30`,borderRadius:20,padding:'5px 14px',marginBottom:14,fontSize:12,fontWeight:700,color:s.accent }}>
              {s.tag}
            </div>
          )}

          {/* Title */}
          {s.title && (
            <div style={{ fontSize:34,fontWeight:900,color:'#0A1628',letterSpacing:-1,lineHeight:1.15,marginBottom:12,whiteSpace:'pre-line' }}>
              {s.title}
            </div>
          )}

          {/* Sub */}
          {s.sub && (
            <div style={{ fontSize:16,color:'rgba(10,22,40,0.55)',lineHeight:1.65,fontWeight:400,maxWidth:290,whiteSpace:'pre-line' }}>
              {s.sub}
            </div>
          )}
        </div>
      )}

      {/* Bottom */}
      {!isPaywall && (
        <div style={{ position:'absolute',bottom:36,display:'flex',flexDirection:'column',alignItems:'center',gap:14,width:'100%',padding:'0 24px' }}>
          {slide===SLIDES.length-2 && (
            <button onClick={e=>{e.stopPropagation();goNext()}} style={{
              width:'100%',maxWidth:320,padding:'16px',borderRadius:16,border:'none',
              background:`linear-gradient(135deg,${s.accent},#0A84FF)`,
              color:'white',fontSize:17,fontWeight:800,cursor:'pointer',
              boxShadow:`0 8px 28px ${s.accent}35`,letterSpacing:-0.3,
            }}>Get Started →</button>
          )}
          <div style={{ display:'flex',gap:6,alignItems:'center' }}>
            {SLIDES.slice(0,-1).map((_,i)=>(
              <div key={i} style={{ width:i===slide?20:6,height:6,borderRadius:3,background:i===slide?s.accent:'rgba(10,22,40,0.15)',transition:'all 0.3s' }}/>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
