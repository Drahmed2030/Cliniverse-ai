'use client'
import { useState, useEffect, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  blue:    '#0A84FF',
  teal:    '#00C8B8',
  coral:   '#FF6B6B',
  mint:    '#30D158',
  amber:   '#FFB347',
  violet:  '#7C5CFC',
  gold:    '#FFD60A',
  text:    '#0A1F3C',
  textSub: 'rgba(10,31,60,0.65)',
  textMuted:'rgba(10,31,60,0.40)',
}

// ── Animated ECG line ───────────────────────────────────────────
function ECGLine({ color = '#00C8B8', width = 200 }: { color?: string, width?: number }) {
  return (
    <svg width={width} height={40} viewBox={`0 0 ${width} 40`}>
      <polyline
        points={`0,20 ${width*0.15},20 ${width*0.22},20 ${width*0.27},4 ${width*0.32},36 ${width*0.37},8 ${width*0.42},28 ${width*0.47},20 ${width*0.6},20 ${width*0.67},20 ${width*0.72},4 ${width*0.77},36 ${width*0.82},8 ${width*0.87},28 ${width*0.92},20 ${width},20`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: width * 3,
          strokeDashoffset: width * 3,
          animation: 'ecgDraw 2s ease forwards',
        }}
      />
      <style>{`
        @keyframes ecgDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  )
}

// ── Floating dot ────────────────────────────────────────────────
function Dot({ x, y, size, color, delay }: any) {
  return (
    <div style={{
      position:'absolute', left:`${x}%`, top:`${y}%`,
      width:size, height:size, borderRadius:'50%',
      background:color, opacity:0.4,
      animation:`floatDot 4s ease-in-out ${delay}s infinite alternate`,
    }}/>
  )
}

// ── Screen wrapper ───────────────────────────────────────────────
function Screen({ bg, children }: { bg: string, children: React.ReactNode }) {
  return (
    <div style={{
      minHeight:'100vh', width:'100%',
      background:bg,
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'48px 28px 40px',
      position:'relative', overflow:'hidden',
      fontFamily:F,
    }}>
      {children}
    </div>
  )
}

// ── Stat chip ────────────────────────────────────────────────────
function Stat({ value, label, color }: { value: string, label: string, color: string }) {
  return (
    <div style={{
      flex:1, textAlign:'center', padding:'14px 8px',
      background:'rgba(255,255,255,0.80)',
      backdropFilter:'blur(16px)',
      borderRadius:18, border:'1px solid rgba(10,132,255,0.10)',
      boxShadow:'0 2px 12px rgba(10,132,255,0.06)',
    }}>
      <div style={{ fontSize:24, fontWeight:900, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color:C.textMuted, fontWeight:600, marginTop:4 }}>{label}</div>
    </div>
  )
}

// ── CTA Button ───────────────────────────────────────────────────
function CTABtn({ label, onClick, gradient, glow }: any) {
  return (
    <button onClick={onClick} style={{
      width:'100%', maxWidth:360, padding:'18px',
      borderRadius:18, border:'none',
      background:gradient,
      color:'white', fontSize:17, fontWeight:800,
      cursor:'pointer', letterSpacing:-0.3,
      boxShadow:glow,
      transition:'transform 0.1s ease',
    }}
      onTouchStart={e => (e.currentTarget.style.transform='scale(0.97)')}
      onTouchEnd={e => (e.currentTarget.style.transform='scale(1)')}
    >{label}</button>
  )
}

// ── Progress dots ────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number, current: number }) {
  return (
    <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:32 }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{
          width: i===current ? 24 : 6,
          height:6, borderRadius:3,
          background: i===current ? C.blue : 'rgba(10,31,60,0.15)',
          transition:'all 0.3s ease',
        }}/>
      ))}
    </div>
  )
}

interface OnboardingProps {
  onComplete: () => void
}

export default function OnboardingFunnel({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState(0)
  const [splashDone, setSplashDone] = useState(false)
  const TOTAL = 6

  useEffect(() => {
    if (screen === 0) {
      const t = setTimeout(() => setScreen(1), 3000)
      return () => clearTimeout(t)
    }
  }, [screen])

  const next = () => {
    if (screen < TOTAL) setScreen(s => s + 1)
    else onComplete()
  }
  const skip = () => onComplete()

  // ── SCREEN 0: SPLASH ──────────────────────────────────────────
  if (screen === 0) return (
    <div style={{
      minHeight:'100vh', width:'100%',
      background:'linear-gradient(160deg,#EEF6FF 0%,#F0F8FF 50%,#E8F4FF 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:F, position:'relative', overflow:'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{position:'absolute',top:-100,left:'50%',transform:'translateX(-50%)',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.12),transparent 65%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,right:-60,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,200,184,0.10),transparent 65%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      {/* Logo */}
      <div style={{
        width:120, height:120, borderRadius:34,
        background:'linear-gradient(145deg,#0d1a2e,#1a2d4a)',
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:28, position:'relative',
        boxShadow:'0 0 0 1px rgba(10,132,255,0.20), 0 20px 60px rgba(10,132,255,0.25), 0 0 80px rgba(0,200,184,0.15)',
        animation:'logoAppear 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        {/* C letter */}
        <svg width="72" height="72" viewBox="0 0 72 72">
          <defs>
            <linearGradient id="cGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00C8B8"/>
              <stop offset="100%" stopColor="#0A84FF"/>
            </linearGradient>
          </defs>
          <path
            d="M52 20C46 14 38 10 29 10C14 10 2 22 2 36C2 50 14 62 29 62C38 62 46 58 52 52"
            stroke="url(#cGrad)" strokeWidth="8" strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray:120,
              strokeDashoffset:120,
              animation:'cDraw 1.2s ease 0.4s forwards',
            }}
          />
          {/* Blue dot */}
          <circle cx="52" cy="52" r="5" fill="#0A84FF"
            style={{opacity:0,animation:'dotPop 0.3s ease 1.4s forwards'}}/>
        </svg>

        {/* Pulse rings */}
        <div style={{position:'absolute',inset:-20,borderRadius:'50%',border:'1px solid rgba(10,132,255,0.15)',animation:'ring1 2s ease-out 1s infinite'}}/>
        <div style={{position:'absolute',inset:-40,borderRadius:'50%',border:'1px solid rgba(0,200,184,0.10)',animation:'ring1 2s ease-out 1.4s infinite'}}/>
      </div>

      {/* Name */}
      <div style={{textAlign:'center',marginBottom:32,animation:'fadeUp 0.6s ease 1.2s both'}}>
        <div style={{fontSize:36,fontWeight:900,color:C.text,letterSpacing:-1,marginBottom:4}}>
          Cliniverse <span style={{background:`linear-gradient(135deg,${C.teal},${C.blue})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</span>
        </div>
        <div style={{fontSize:13,color:C.textMuted,letterSpacing:2,textTransform:'uppercase'}}>Medical AI · 2026</div>
      </div>

      {/* ECG */}
      <div style={{animation:'fadeUp 0.6s ease 1.6s both'}}>
        <ECGLine color={C.teal} width={220}/>
      </div>

      {/* Loading bar */}
      <div style={{width:160,height:3,background:'rgba(10,132,255,0.10)',borderRadius:2,marginTop:28,overflow:'hidden',animation:'fadeUp 0.4s ease 1.8s both'}}>
        <div style={{height:'100%',background:`linear-gradient(90deg,${C.teal},${C.blue})`,borderRadius:2,animation:'loadBar 2.2s ease forwards'}}/>
      </div>

      {splashDone && (
        <div style={{position:'absolute',bottom:48,left:0,right:0,display:'flex',justifyContent:'center',animation:'fadeUp 0.4s ease forwards'}}>
          <button onClick={next} style={{background:'none',border:'none',cursor:'pointer',fontSize:14,color:C.blue,fontWeight:700,fontFamily:F}}>
            Get Started →
          </button>
        </div>
      )}

      <style>{`
        @keyframes logoAppear { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
        @keyframes cDraw { to{stroke-dashoffset:0} }
        @keyframes dotPop { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
        @keyframes ring1 { 0%{opacity:0.6;transform:scale(0.9)} 100%{opacity:0;transform:scale(1.4)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loadBar { from{width:0%} to{width:100%} }
        @keyframes floatDot { from{transform:translateY(0)} to{transform:translateY(-12px)} }
      `}</style>
    </div>
  )

  // ── SCREEN 1: WELCOME ─────────────────────────────────────────
  if (screen === 1) return (
    <Screen bg="linear-gradient(160deg,#EEF6FF,#F2F8FF,#EAF4FF)">
      <Dot x={8} y={15} size={8} color={C.blue} delay={0}/>
      <Dot x={88} y={25} size={5} color={C.teal} delay={0.5}/>
      <Dot x={15} y={75} size={6} color={C.violet} delay={1}/>
      <Dot x={85} y={70} size={7} color={C.coral} delay={1.5}/>

      <ProgressDots total={TOTAL} current={0}/>

      {/* Hero visual */}
      <div style={{
        width:100, height:100, borderRadius:28,
        background:'linear-gradient(145deg,#0d1a2e,#1a2d4a)',
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:24, position:'relative',
        boxShadow:`0 20px 50px rgba(10,132,255,0.25), 0 0 0 1px rgba(10,132,255,0.15)`,
      }}>
        <span style={{fontSize:48}}>🏥</span>
        <div style={{position:'absolute',top:-8,right:-8,background:C.blue,borderRadius:12,padding:'3px 10px',fontSize:11,fontWeight:800,color:'white'}}>2026</div>
      </div>

      <div style={{textAlign:'center',marginBottom:28,maxWidth:340}}>
        <div style={{fontSize:11,color:C.blue,fontWeight:800,letterSpacing:2,textTransform:'uppercase',marginBottom:12}}>BUILT BY A PHYSICIAN</div>
        <h1 style={{fontSize:32,fontWeight:900,color:C.text,lineHeight:1.15,margin:'0 0 14px',letterSpacing:-1}}>
          The Clinical Brain<br/>
          <span style={{background:`linear-gradient(135deg,${C.teal},${C.blue})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>You Always Needed.</span>
        </h1>
        <p style={{fontSize:15,color:C.textSub,lineHeight:1.65,margin:0}}>
          Your AI consultant, SOAP note writer, MCQ tutor, and shift partner — all in one app. Used by 50,000+ physicians across 40 countries.
        </p>
      </div>

      <div style={{display:'flex',gap:10,width:'100%',maxWidth:340,marginBottom:28}}>
        <Stat value="50K+" label="Physicians" color={C.blue}/>
        <Stat value="40+" label="AI Modules" color={C.teal}/>
        <Stat value="EN·AR" label="Languages" color={C.violet}/>
      </div>

      <CTABtn
        label="Begin Your Journey →"
        onClick={next}
        gradient={`linear-gradient(135deg,${C.teal},${C.blue})`}
        glow={`0 8px 28px rgba(10,132,255,0.30)`}
      />
      <button onClick={skip} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.textMuted,marginTop:14,fontFamily:F}}>Skip for now</button>
    </Screen>
  )

  // ── SCREEN 2: LIVE CASES ──────────────────────────────────────
  if (screen === 2) return (
    <Screen bg="linear-gradient(160deg,#FFF0F0,#FFF5F5,#FFF8F8)">
      <Dot x={5} y={10} size={6} color={C.coral} delay={0}/>
      <Dot x={90} y={20} size={8} color={C.amber} delay={0.8}/>

      <ProgressDots total={TOTAL} current={1}/>

      {/* Live cases preview */}
      <div style={{width:'100%',maxWidth:340,marginBottom:24}}>
        <div style={{fontSize:10,color:C.coral,fontWeight:800,letterSpacing:2,marginBottom:10}}>🔴 LIVE CLINICAL CASES — RIGHT NOW</div>
        {[
          {tag:'STEMI',  city:'Riyadh',   title:'52M — Chest pain 2 hours',       sub:'Door-to-balloon: 67 min',     color:C.coral},
          {tag:'SEPSIS', city:'Dubai',    title:'67F — Fever + Hypotension',       sub:'Lactate 4.2 · ICU',           color:C.amber},
          {tag:'DKA',    city:'London',   title:'19M — pH 7.1 · K+ 2.8',          sub:'Insulin infusion started',     color:C.violet},
        ].map((c,i) => (
          <div key={i} style={{
            background:'rgba(255,255,255,0.85)',
            backdropFilter:'blur(16px)',
            borderRadius:16, padding:'12px 14px', marginBottom:8,
            border:`1px solid ${c.color}18`,
            boxShadow:`0 2px 12px ${c.color}08`,
            display:'flex', alignItems:'center', gap:12,
          }}>
            <div style={{
              background:`${c.color}12`,border:`1px solid ${c.color}25`,
              borderRadius:10,padding:'3px 8px',flexShrink:0,
            }}>
              <span style={{fontSize:9,fontWeight:800,color:c.color}}>{c.tag}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.title}</div>
              <div style={{fontSize:11,color:C.textMuted}}>{c.sub}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:c.color,animation:'pulse 1.5s ease-in-out infinite'}}/>
              <span style={{fontSize:9,fontWeight:700,color:c.color}}>LIVE</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign:'center',marginBottom:28,maxWidth:340}}>
        <h1 style={{fontSize:30,fontWeight:900,color:C.text,lineHeight:1.2,margin:'0 0 12px',letterSpacing:-0.8}}>
          Train on Real<br/>
          <span style={{color:C.coral}}>Clinical Scenarios.</span>
        </h1>
        <p style={{fontSize:14,color:C.textSub,lineHeight:1.65,margin:0}}>
          STEMI at 2am. Septic shock. DKA in ED. 1,200+ physicians training live right now. Your decisions are timed. Every second counts.
        </p>
      </div>

      <div style={{display:'flex',gap:10,width:'100%',maxWidth:340,marginBottom:28}}>
        <Stat value="1.2K+" label="Live Now"    color={C.coral}/>
        <Stat value="25+"  label="Cases/Day"   color={C.amber}/>
        <Stat value="AI"   label="Generated"   color={C.blue}/>
      </div>

      <CTABtn
        label="See Live Cases →"
        onClick={next}
        gradient={`linear-gradient(135deg,${C.coral},${C.amber})`}
        glow={`0 8px 28px rgba(255,107,107,0.30)`}
      />
      <button onClick={skip} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.textMuted,marginTop:14,fontFamily:F}}>Skip for now</button>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </Screen>
  )

  // ── SCREEN 3: AI SCRIBE ───────────────────────────────────────
  if (screen === 3) return (
    <Screen bg="linear-gradient(160deg,#F0FFF8,#F5FFFC,#EDFFF8)">
      <Dot x={10} y={12} size={7} color={C.mint} delay={0}/>
      <Dot x={85} y={22} size={5} color={C.teal} delay={1}/>

      <ProgressDots total={TOTAL} current={2}/>

      {/* Microphone visual */}
      <div style={{
        width:110, height:110, borderRadius:'50%',
        background:`radial-gradient(circle,${C.teal}18,${C.teal}06)`,
        border:`2px solid ${C.teal}25`,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:20, position:'relative',
        animation:'breathe 3s ease-in-out infinite',
      }}>
        <div style={{
          width:80, height:80, borderRadius:'50%',
          background:`radial-gradient(circle,${C.teal}25,${C.teal}10)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:42,
        }}>🎙️</div>

        {/* Sound waves */}
        {[0,1,2].map(i => (
          <div key={i} style={{
            position:'absolute', inset:-(i+1)*16,
            borderRadius:'50%', border:`1px solid ${C.teal}${['20','15','08'][i]}`,
            animation:`wave 2s ease-out ${i*0.4}s infinite`,
          }}/>
        ))}
      </div>

      {/* Waveform */}
      <div style={{display:'flex',alignItems:'center',gap:3,marginBottom:8}}>
        {[4,8,14,20,28,20,14,8,20,28,14,8,4,8,14,20,8,4].map((h,i) => (
          <div key={i} style={{
            width:3, height:h, borderRadius:2,
            background:C.teal, opacity:0.7,
            animation:`bar 1.2s ease-in-out ${i*0.06}s infinite alternate`,
          }}/>
        ))}
      </div>
      <div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1.5,marginBottom:24}}>AI IS LISTENING...</div>

      <div style={{textAlign:'center',marginBottom:28,maxWidth:340}}>
        <h1 style={{fontSize:30,fontWeight:900,color:C.text,lineHeight:1.2,margin:'0 0 12px',letterSpacing:-0.8}}>
          Record. Speak.<br/>
          <span style={{color:C.teal}}>SOAP Note Done.</span>
        </h1>
        <p style={{fontSize:14,color:C.textSub,lineHeight:1.65,margin:0}}>
          Speak naturally during your consultation. AI generates a complete SOAP note in English and Arabic. 2 hours saved every single day.
        </p>
      </div>

      <div style={{display:'flex',gap:10,width:'100%',maxWidth:340,marginBottom:28}}>
        <Stat value="2h"  label="Saved/Day"  color={C.teal}/>
        <Stat value="94%" label="Accuracy"   color={C.mint}/>
        <Stat value="Live" label="EN + AR"   color={C.blue}/>
      </div>

      <CTABtn
        label="Try AI Scribe →"
        onClick={next}
        gradient={`linear-gradient(135deg,${C.teal},${C.mint})`}
        glow={`0 8px 28px rgba(0,200,184,0.30)`}
      />
      <button onClick={skip} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.textMuted,marginTop:14,fontFamily:F}}>Skip for now</button>

      <style>{`
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes wave{0%{opacity:0.5;transform:scale(0.9)}100%{opacity:0;transform:scale(1.3)}}
        @keyframes bar{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}
      `}</style>
    </Screen>
  )

  // ── SCREEN 4: BOARD PREP ──────────────────────────────────────
  if (screen === 4) return (
    <Screen bg="linear-gradient(160deg,#F4F0FF,#F8F5FF,#F0EEFF)">
      <Dot x={8} y={14} size={7} color={C.violet} delay={0}/>
      <Dot x={88} y={22} size={5} color={C.blue} delay={1}/>

      <ProgressDots total={TOTAL} current={3}/>

      {/* Board grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,width:'100%',maxWidth:340,marginBottom:24}}>
        {[
          {flag:'🇸🇦',name:'Saudi Board',color:C.mint},
          {flag:'🇺🇸',name:'USMLE',      color:C.blue},
          {flag:'🇬🇧',name:'MRCP UK',    color:C.violet},
          {flag:'🌙',  name:'Arab Board', color:C.amber},
          {flag:'❤️',  name:'PALS · ATLS',color:C.coral},
          {flag:'🫀',  name:'AHA · ESC',  color:C.teal},
        ].map(b => (
          <div key={b.name} style={{
            background:'rgba(255,255,255,0.85)',
            backdropFilter:'blur(16px)',
            borderRadius:14, padding:'12px',
            border:`1px solid ${b.color}18`,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{fontSize:22}}>{b.flag}</span>
            <span style={{fontSize:12,fontWeight:700,color:b.color}}>{b.name}</span>
          </div>
        ))}
      </div>

      <div style={{textAlign:'center',marginBottom:28,maxWidth:340}}>
        <h1 style={{fontSize:30,fontWeight:900,color:C.text,lineHeight:1.2,margin:'0 0 12px',letterSpacing:-0.8}}>
          Pass Your Boards.<br/>
          <span style={{color:C.violet}}>First Time.</span>
        </h1>
        <p style={{fontSize:14,color:C.textSub,lineHeight:1.65,margin:0}}>
          Saudi Board · USMLE · MRCP · Arab Board. AI adapts to your weak areas automatically. 92% pass rate among Cliniverse users.
        </p>
      </div>

      <div style={{display:'flex',gap:10,width:'100%',maxWidth:340,marginBottom:28}}>
        <Stat value="4"   label="Boards"    color={C.violet}/>
        <Stat value="AI"  label="Adaptive"  color={C.blue}/>
        <Stat value="92%" label="Pass Rate" color={C.mint}/>
      </div>

      <CTABtn
        label="Start Board Prep →"
        onClick={next}
        gradient={`linear-gradient(135deg,${C.violet},${C.blue})`}
        glow={`0 8px 28px rgba(124,92,252,0.30)`}
      />
      <button onClick={skip} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.textMuted,marginTop:14,fontFamily:F}}>Skip for now</button>
    </Screen>
  )

  // ── SCREEN 5: PRO PAYWALL ─────────────────────────────────────
  if (screen === 5) return (
    <Screen bg="linear-gradient(180deg,#0A1F3C 0%,#0D2545 60%,#0A1F3C 100%)">

      <ProgressDots total={TOTAL} current={4}/>

      {/* Logo */}
      <div style={{
        width:88, height:88, borderRadius:24,
        background:'linear-gradient(145deg,#142840,#1e3a5a)',
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:6, position:'relative',
        boxShadow:`0 0 0 1px rgba(10,132,255,0.30), 0 20px 50px rgba(10,132,255,0.20)`,
      }}>
        <span style={{fontSize:44}}>⚕️</span>
        <div style={{
          position:'absolute', top:-10, right:-10,
          background:`linear-gradient(135deg,${C.gold},${C.amber})`,
          borderRadius:12, padding:'3px 10px',
          fontSize:11, fontWeight:900, color:'#000',
        }}>PRO</div>
      </div>

      <div style={{textAlign:'center',marginBottom:24}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',letterSpacing:2,marginBottom:8}}>CLINIVERSE AI PRO</div>
        <h1 style={{fontSize:28,fontWeight:900,color:'white',lineHeight:1.2,margin:'0 0 8px',letterSpacing:-0.8}}>
          Unlock Everything.<br/>Elevate Your Practice.
        </h1>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.6,margin:0}}>
          Full access to all AI tools, unlimited cases, Ambient Scribe, and FHIR integration.
        </p>
      </div>

      {/* Features */}
      <div style={{width:'100%',maxWidth:340,marginBottom:24}}>
        {[
          {icon:'∞',  label:'Unlimited Cases & MCQ',         color:C.teal},
          {icon:'🎙️', label:'Ambient AI Scribe — EN + AR',   color:C.mint},
          {icon:'🌐', label:'FHIR EHR Integration',          color:C.blue},
          {icon:'📓', label:'Clinical Memory & Logbook',     color:C.violet},
          {icon:'🤝', label:'Enterprise & Team Access',      color:C.amber},
        ].map(f => (
          <div key={f.label} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'11px 14px', marginBottom:6,
            background:'rgba(255,255,255,0.05)',
            borderRadius:14, border:'1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{fontSize:18,width:28,textAlign:'center'}}>{f.icon}</span>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.85)',fontWeight:600,flex:1}}>{f.label}</span>
            <span style={{color:C.mint,fontSize:16}}>✓</span>
          </div>
        ))}
      </div>

      {/* Pricing toggle */}
      <div style={{display:'flex',gap:10,width:'100%',maxWidth:340,marginBottom:20}}>
        {[
          {period:'Monthly',price:'$14.99',sub:'/month',highlight:true},
          {period:'Annual', price:'$99',   sub:'Save 45% 🎉',highlight:false},
        ].map(p => (
          <div key={p.period} style={{
            flex:1, borderRadius:18, padding:'14px 10px', textAlign:'center',
            background: p.highlight ? `linear-gradient(135deg,${C.teal},${C.blue})` : 'rgba(255,255,255,0.07)',
            border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
            cursor:'pointer', position:'relative',
            boxShadow: p.highlight ? `0 8px 24px rgba(10,132,255,0.30)` : 'none',
          }}>
            {p.highlight && (
              <div style={{
                position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',
                background:C.mint,borderRadius:10,padding:'2px 10px',
                fontSize:9,fontWeight:800,color:'#000',whiteSpace:'nowrap',
              }}>MOST POPULAR</div>
            )}
            <div style={{fontSize:10,color:p.highlight?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.45)',marginBottom:4}}>{p.period}</div>
            <div style={{fontSize:26,fontWeight:900,color:'white',lineHeight:1}}>{p.price}</div>
            <div style={{fontSize:10,color:p.highlight?'rgba(255,255,255,0.7)':C.mint,marginTop:2}}>{p.sub}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{width:'100%',maxWidth:340,marginBottom:10}}>
        <button onClick={next} style={{
          width:'100%',padding:'17px',borderRadius:18,border:'none',
          background:`linear-gradient(135deg,${C.teal},${C.blue})`,
          color:'white',fontSize:17,fontWeight:800,cursor:'pointer',
          boxShadow:`0 10px 32px rgba(10,132,255,0.40)`,fontFamily:F,
          letterSpacing:-0.3,
        }}>🚀 Start Free — Upgrade Anytime</button>
      </div>
      <button onClick={skip} style={{
        width:'100%',maxWidth:340,padding:'14px',borderRadius:18,
        border:'1px solid rgba(255,255,255,0.15)',
        background:'transparent',
        color:'rgba(255,255,255,0.55)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F,
      }}>⭐ See Pro Plans</button>

      <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:12,textAlign:'center'}}>
        Cancel anytime · Secure · No hidden fees
      </div>
    </Screen>
  )

  // ── SCREEN 6: FINAL CTA ───────────────────────────────────────
  return (
    <Screen bg="linear-gradient(160deg,#EEF6FF,#F2F8FF,#EAF4FF)">
      <Dot x={8} y={15} size={8} color={C.blue} delay={0}/>
      <Dot x={88} y={25} size={5} color={C.teal} delay={0.5}/>
      <Dot x={12} y={78} size={6} color={C.violet} delay={1}/>

      <ProgressDots total={TOTAL} current={5}/>

      {/* Final logo */}
      <div style={{
        width:100, height:100, borderRadius:28,
        background:'linear-gradient(145deg,#0d1a2e,#1a2d4a)',
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:24,
        boxShadow:`0 0 0 1px rgba(10,132,255,0.20), 0 20px 50px rgba(10,132,255,0.25), 0 0 60px rgba(0,200,184,0.12)`,
      }}>
        <svg width="60" height="60" viewBox="0 0 72 72">
          <defs>
            <linearGradient id="cGrad2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00C8B8"/>
              <stop offset="100%" stopColor="#0A84FF"/>
            </linearGradient>
          </defs>
          <path d="M52 20C46 14 38 10 29 10C14 10 2 22 2 36C2 50 14 62 29 62C38 62 46 58 52 52"
            stroke="url(#cGrad2)" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <circle cx="52" cy="52" r="5" fill="#0A84FF"/>
        </svg>
      </div>

      <div style={{textAlign:'center',marginBottom:32,maxWidth:340}}>
        <h1 style={{fontSize:34,fontWeight:900,color:C.text,lineHeight:1.15,margin:'0 0 14px',letterSpacing:-1}}>
          Your Clinical AI<br/>
          <span style={{background:`linear-gradient(135deg,${C.teal},${C.blue})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Starts Now.</span>
        </h1>
        <p style={{fontSize:15,color:C.textSub,lineHeight:1.65,margin:0}}>
          Join 50,000+ physicians who train smarter, document faster, and practice safer — every single shift.
        </p>
      </div>

      {/* ECG */}
      <div style={{marginBottom:32}}>
        <ECGLine color={C.blue} width={240}/>
      </div>

      <div style={{width:'100%',maxWidth:340,display:'flex',flexDirection:'column',gap:10}}>
        <CTABtn
          label="Enter the Hospital →"
          onClick={onComplete}
          gradient={`linear-gradient(135deg,${C.teal},${C.blue})`}
          glow={`0 10px 32px rgba(10,132,255,0.35)`}
        />
        <button onClick={onComplete} style={{
          padding:'14px',borderRadius:18,
          border:`1px solid rgba(10,132,255,0.15)`,
          background:'rgba(255,255,255,0.70)',
          color:C.textSub,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F,
        }}>
          Sign in with existing account
        </button>
      </div>

      <div style={{fontSize:11,color:C.textMuted,marginTop:16,textAlign:'center'}}>
        Free to start · No credit card required
      </div>
    </Screen>
  )
}
