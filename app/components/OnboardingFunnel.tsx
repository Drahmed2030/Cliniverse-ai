'use client'
import { useState, useEffect, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const STYLES = `
  @keyframes phoneFloat {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%      { transform: translateY(-8px) rotate(1deg); }
  }
  @keyframes slideInUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
`

function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ position:'relative', width:220, height:440, animation:'phoneFloat 4s ease-in-out infinite' }}>
      <div style={{
        position:'absolute', inset:0, borderRadius:38,
        background:'#1A1A1A',
        boxShadow:'0 30px 80px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.12)',
      }}>
        <div style={{ position:'absolute',left:-3,top:80,width:3,height:32,background:'#2A2A2A',borderRadius:'2px 0 0 2px' }}/>
        <div style={{ position:'absolute',left:-3,top:124,width:3,height:52,background:'#2A2A2A',borderRadius:'2px 0 0 2px' }}/>
        <div style={{ position:'absolute',left:-3,top:188,width:3,height:52,background:'#2A2A2A',borderRadius:'2px 0 0 2px' }}/>
        <div style={{ position:'absolute',right:-3,top:120,width:3,height:70,background:'#2A2A2A',borderRadius:'0 2px 2px 0' }}/>
        <div style={{ position:'absolute',top:6,left:6,right:6,bottom:6,borderRadius:33,overflow:'hidden',background:'#F0F6FF' }}>
          <div style={{ position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',width:90,height:28,background:'#000',borderRadius:20,zIndex:10 }}/>
          <img src={src} alt={alt} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }}/>
          <div style={{ position:'absolute',bottom:0,left:0,right:0,height:60,background:'linear-gradient(transparent,rgba(240,246,255,0.8))' }}/>
        </div>
      </div>
    </div>
  )
}

const SLIDES = [
  { id:'stemi',       img:'/screenshots/stemi.png',       bg:'#FFFFFF', accent:'#FF453A', title:'Real Emergency\nSimulations',      sub:'Train with life-like STEMI, Sepsis & Stroke cases. Know exactly what to do when it matters.' },
  { id:'detective',   img:'/screenshots/detective.png',   bg:'#FAFBFF', accent:'#7C5CFC', title:'Diagnose Like\na Detective',       sub:'Order investigations wisely. Every test costs money. Diagnose accurately to maximize your score.' },
  { id:'nexus',       img:'/screenshots/nexus.png',       bg:'#F8F5FF', accent:'#0A84FF', title:'The Global\nMedical Room',         sub:'Vote on real cases with 12,000+ doctors worldwide — in real time. See how you compare globally.' },
  { id:'calculators', img:'/screenshots/calculators.png', bg:'#F0F8FF', accent:'#00C2B2', title:'Clinical Tools\nAt Your Fingertips',sub:'ASCVD, CHA₂DS₂-VASc, TIMI, Wells Score — evidence-based calculators for every decision.' },
  { id:'paywall',     img:'',                             bg:'#0A1628', accent:'#00C2B2', title:null,                               sub:null },
]

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
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:28, fontWeight:900, color:'#F2F8FF', letterSpacing:-0.8, marginBottom:6 }}>
          Cliniverse{' '}
          <span style={{ background:'linear-gradient(135deg,#00C2B2,#0A84FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PRO</span>
        </div>
        <div style={{ fontSize:13, color:'rgba(242,248,255,0.55)' }}>Join 12,000+ doctors worldwide</div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:18, border:'1px solid rgba(255,255,255,0.09)', padding:'12px 16px', marginBottom:14 }}>
        {FEATURES.map((f,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'7px 0', borderBottom:i<FEATURES.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
            <span style={{ fontSize:17, minWidth:22 }}>{f.icon}</span>
            <span style={{ fontSize:13, color:'rgba(242,248,255,0.85)', fontWeight:500, flex:1 }}>{f.text}</span>
            <span style={{ color:'#00C2B2', fontSize:14 }}>✓</span>
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
            <div style={{ fontSize:11,color:'rgba(242,248,255,0.50)',fontWeight:600,marginBottom:3 }}>{plan.label}</div>
            <div style={{ fontSize:22,fontWeight:900,color:'#F2F8FF',letterSpacing:-0.5 }}>{plan.price}</div>
            <div style={{ fontSize:10,color:'rgba(242,248,255,0.40)' }}>{plan.period}</div>
            {selected===key&&<div style={{ position:'absolute',top:8,right:8,width:16,height:16,borderRadius:'50%',background:'#00C2B2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',fontWeight:900 }}>✓</div>}
          </div>
        ))}
      </div>
      <button onClick={handle} disabled={loading} style={{
        width:'100%', padding:'16px', borderRadius:16, border:'none',
        background:loading?'rgba(0,194,178,0.5)':'linear-gradient(135deg,#00C2B2,#0A84FF)',
        color:'white', fontSize:17, fontWeight:800, cursor:loading?'default':'pointer',
        boxShadow:'0 8px 32px rgba(0,194,178,0.30)', marginBottom:10, letterSpacing:-0.3,
      }}>{loading?'⏳ Processing...':`Start PRO — ${plans[selected].per}`}</button>
      <button onClick={onFree} style={{ width:'100%',padding:'12px',borderRadius:14,border:'none',background:'transparent',color:'rgba(242,248,255,0.35)',fontSize:14,fontWeight:600,cursor:'pointer' }}>
        Continue with Free — 1 case/day
      </button>
      <div style={{ textAlign:'center',marginTop:10,fontSize:10,color:'rgba(242,248,255,0.18)',lineHeight:1.6 }}>
        Auto-renews. Cancel anytime in Settings.
      </div>
    </div>
  )
}

interface Props { onComplete: (isPro: boolean) => void }

export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide,    setSlide]    = useState(0)
  const [progress, setProgress] = useState(0)
  const [animKey,  setAnimKey]  = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const touchX   = useRef(0)
  const s         = SLIDES[slide]
  const isPaywall = s.id === 'paywall'
  const DURATION  = 5500

  const startTimer = () => {
    if (isPaywall) return
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    const step = 100 / (DURATION / 50)
    timerRef.current = setInterval(()=>{
      setProgress(p=>{ if(p>=100){clearInterval(timerRef.current!);goNext();return 0} return p+step })
    }, 50)
  }

  useEffect(()=>{ setAnimKey(k=>k+1); startTimer(); return ()=>{ if(timerRef.current) clearInterval(timerRef.current) } }, [slide])

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
      style={{ position:'fixed',inset:0,zIndex:9999,fontFamily:F,background:isPaywall?'#0A1628':s.bg,display:'flex',flexDirection:'column',transition:'background 0.4s ease',overflow:'hidden' }}
    >
      <style>{STYLES}</style>

      {/* Progress bars */}
      {!isPaywall && (
        <div style={{ position:'absolute',top:0,left:0,right:0,display:'flex',gap:4,padding:'52px 20px 0',zIndex:100 }}>
          {SLIDES.slice(0,-1).map((_,i)=>(
            <div key={i} style={{ flex:1,height:2.5,borderRadius:2,background:'rgba(10,22,40,0.10)',overflow:'hidden' }}>
              <div style={{ height:'100%',borderRadius:2,background:i<=slide?s.accent:'transparent',width:i<slide?'100%':i===slide?`${progress}%`:'0%',opacity:i<slide?0.40:1 }}/>
            </div>
          ))}
        </div>
      )}

      {/* Skip */}
      {!isPaywall && (
        <button onClick={e=>{e.stopPropagation();setSlide(SLIDES.length-1)}} style={{ position:'absolute',top:46,right:20,zIndex:200,background:'rgba(10,22,40,0.07)',border:'none',borderRadius:20,padding:'6px 14px',fontSize:13,fontWeight:600,color:'rgba(10,22,40,0.45)',cursor:'pointer' }}>Skip</button>
      )}

      {isPaywall ? (
        <div style={{ width:'100%',height:'100%',overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',padding:'56px 20px 40px' }}>
          <Paywall
            onSubscribe={()=>{ if(typeof window!=='undefined') window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank'); onComplete(true) }}
            onFree={()=>onComplete(false)}
          />
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',flex:1 }}>
          {/* Phone mockup */}
          <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80,paddingBottom:10 }}>
            <div key={`phone-${animKey}`} style={{ animation:'slideInUp 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <PhoneMockup src={s.img} alt={s.id} />
            </div>
          </div>

          {/* Text + controls */}
          <div style={{ padding:'20px 28px 44px', background:s.bg }}>
            <div style={{ fontSize:32,fontWeight:900,color:'#0A1628',letterSpacing:-1,lineHeight:1.15,marginBottom:12,whiteSpace:'pre-line' }}>{s.title}</div>
            <div style={{ fontSize:15,color:'rgba(10,22,40,0.55)',lineHeight:1.65,fontWeight:400,marginBottom:24 }}>{s.sub}</div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div style={{ display:'flex',gap:6 }}>
                {SLIDES.slice(0,-1).map((_,i)=>(
                  <div key={i} style={{ width:i===slide?20:6,height:6,borderRadius:3,background:i===slide?s.accent:'rgba(10,22,40,0.15)',transition:'all 0.3s' }}/>
                ))}
              </div>
              <button onClick={e=>{e.stopPropagation();goNext()}} style={{
                padding:'14px 28px',borderRadius:30,border:'none',
                background:`linear-gradient(135deg,${s.accent},#0A84FF)`,
                color:'white',fontSize:16,fontWeight:800,cursor:'pointer',
                boxShadow:`0 6px 24px ${s.accent}40`,letterSpacing:-0.3,
              }}>
                {slide===SLIDES.length-2?'Get Started →':'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
