'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes logoGlow {
    0%,100%{filter:drop-shadow(0 0 14px rgba(0,200,184,.55)) drop-shadow(0 0 32px rgba(0,200,184,.22));}
    50%    {filter:drop-shadow(0 0 24px rgba(0,200,184,.80)) drop-shadow(0 0 56px rgba(0,200,184,.35));}
  }
  @keyframes neuralDrift {
    0%,100%{transform:translateY(0) scale(1);opacity:.20;}
    50%    {transform:translateY(-12px) scale(1.12);opacity:.38;}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(20px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes fadeIn {
    from{opacity:0;} to{opacity:1;}
  }
  @keyframes scaleIn {
    from{opacity:0;transform:scale(0.82);}
    to  {opacity:1;transform:scale(1);}
  }
  @keyframes loadBar {
    0%{width:0%} 35%{width:50%} 72%{width:80%} 100%{width:100%}
  }
  @keyframes waveBar {
    0%,100%{height:4px;} 50%{height:var(--h);}
  }
  @keyframes ping {
    0%{transform:scale(1);opacity:.5;}
    100%{transform:scale(2.2);opacity:0;}
  }
  @keyframes slideIn {
    from{opacity:0;transform:translateX(32px);}
    to  {opacity:1;transform:translateX(0);}
  }
`

// ── SLIDES CONFIG ──
const SLIDES = [
  {
    accent:   '#00C8B8',
    aurora:   'radial-gradient(ellipse at 50% 0%, rgba(0,200,184,0.22) 0%, rgba(0,200,184,0.04) 55%, transparent 80%)',
    badge:    'MEDICAL AI · 2026',
    title:    'The Future of\nClinical Training',
    sub:      'AI-powered cases, prescriptions, and SOAP notes — built by doctors, for doctors.',
    visual:   'logo',
    stats:    [{v:'50K+',l:'Physicians'},{v:'40+',l:'AI Modules'},{v:'EN·AR',l:'Languages'}],
    cta:      'Get Started',
  },
  {
    accent:   '#00D170',
    aurora:   'radial-gradient(ellipse at 50% 0%, rgba(0,209,112,0.20) 0%, rgba(0,209,112,0.04) 55%, transparent 80%)',
    badge:    'AMBIENT AI SCRIBE',
    title:    'Record. Speak.\nSOAP Note Done.',
    sub:      'Saves 2 hours of documentation per day. The #1 requested feature by physicians in 2026.',
    visual:   'scribe',
    stats:    [{v:'2h',l:'Saved/Day'},{v:'94%',l:'Accuracy'},{v:'Live',l:'EN + AR'}],
    cta:      'Continue',
  },
  {
    accent:   '#FF2D55',
    aurora:   'radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.22) 0%, rgba(255,45,85,0.05) 55%, transparent 80%)',
    badge:    'LIVE CLINICAL CASES',
    title:    'Train on Real\nClinical Scenarios',
    sub:      'STEMI at 2am. Septic shock. DKA in ED. 1,200+ physicians training live right now.',
    visual:   'cases',
    stats:    [{v:'1.2K+',l:'Live Now'},{v:'25+',l:'Cases/Day'},{v:'AI',l:'Generated'}],
    cta:      'Continue',
  },
  {
    accent:   '#5E5CE6',
    aurora:   'radial-gradient(ellipse at 50% 0%, rgba(94,92,230,0.22) 0%, rgba(94,92,230,0.05) 55%, transparent 80%)',
    badge:    'BOARD EXAM PREP',
    title:    'Pass Your Boards.\nFirst Time.',
    sub:      'Saudi Board · USMLE · MRCP · Arab Board. AI adapts to your weak areas automatically.',
    visual:   'boards',
    stats:    [{v:'4',l:'Boards'},{v:'AI',l:'Adaptive'},{v:'92%',l:'Pass Rate'}],
    cta:      'Continue',
  },
  {
    accent:   '#FFB340',
    aurora:   'radial-gradient(ellipse at 50% 0%, rgba(255,179,64,0.22) 0%, rgba(255,179,64,0.05) 55%, transparent 80%)',
    badge:    'CLINIVERSE PRO',
    title:    'Unlock Everything.\nElevate Your Practice.',
    sub:      'Full access to all AI tools, unlimited cases, Ambient Scribe, and FHIR integration.',
    visual:   'pro',
    stats:    [{v:'∞',l:'Cases'},{v:'FHIR',l:'EHR Ready'},{v:'PRO',l:'All Tools'}],
    cta:      'Start Free',
  },
]

// ── LOGO MARK ──
function LogoMark({ size=90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{animation:'logoGlow 2.8s ease-in-out infinite'}}>
      <defs>
        <linearGradient id="bgLO" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d1f30"/><stop offset="100%" stopColor="#081218"/>
        </linearGradient>
        <linearGradient id="arcLO" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/><stop offset="60%" stopColor="#00C8B8"/><stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <linearGradient id="pulLO" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C8B8" stopOpacity="0"/>
          <stop offset="35%" stopColor="#00C8B8"/>
          <stop offset="65%" stopColor="#00E5D4"/>
          <stop offset="100%" stopColor="#0096FF" stopOpacity="0"/>
        </linearGradient>
        <filter id="glLO" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sfLO" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#bgLO)"/>
      <radialGradient id="ambLO" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#00C8B8" stopOpacity="0.09"/>
        <stop offset="100%" stopColor="#00C8B8" stopOpacity="0"/>
      </radialGradient>
      <rect width="120" height="120" rx="28" fill="url(#ambLO)"/>
      <rect x="1" y="1" width="118" height="118" rx="27" fill="none" stroke="rgba(0,200,184,0.22)" strokeWidth="1.5"/>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcLO)" strokeWidth="7" strokeLinecap="round" filter="url(#glLO)"/>
      <path d="M 80 44 A 24 24 0 1 0 80 76" fill="none" stroke="#00C8B8" strokeWidth="0.8" strokeLinecap="round" opacity="0.15"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4" filter="url(#sfLO)" opacity="0.95">
        <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF" filter="url(#sfLO)" opacity="0.9">
        <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <line x1="28" y1="60" x2="78" y2="60" stroke="#00C8B8" strokeWidth="0.5" opacity="0.12"/>
      <polyline points="28,60 36,60 40,60 44,48 48,72 52,55 56,65 60,60 78,60"
        fill="none" stroke="url(#pulLO)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#glLO)" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
      </polyline>
      <circle cx="60" cy="60" r="0" fill="none" stroke="#00C8B8" strokeWidth="1.5" opacity="0">
        <animate attributeName="r" values="0;26" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.45;0" dur="2.2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}

// ── NEURAL NODES ──
function NeuralNodes({ accent }: { accent: string }) {
  const nodes = [
    {x:'8%', y:'18%',s:5},{x:'88%',y:'12%',s:4},{x:'94%',y:'65%',s:4},
    {x:'6%', y:'72%',s:4},{x:'48%',y:'5%', s:5},{x:'18%',y:'88%',s:3},{x:'82%',y:'88%',s:3},
  ]
  return (
    <>
      {nodes.map((n,i)=>(
        <div key={i} style={{
          position:'absolute',left:n.x,top:n.y,
          width:n.s,height:n.s,borderRadius:'50%',
          background:i%2===0?accent:'#1A8CFF',
          animation:`neuralDrift ${2.2+i*0.28}s ease-in-out infinite`,
          animationDelay:`${i*0.22}s`,
          pointerEvents:'none',
        }}/>
      ))}
    </>
  )
}

// ── VISUALS PER SLIDE ──
function Visual({ type, accent, animKey }: { type:string, accent:string, animKey:number }) {

  if (type === 'logo') return (
    <div key={animKey} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,animation:'scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <LogoMark size={108}/>
      <div style={{display:'flex',gap:12}}>
        {['Medical AI','2026','Saudi Arabia'].map((t,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:10,padding:'5px 10px',fontSize:10,color:'rgba(242,248,252,0.60)',fontWeight:600}}>{t}</div>
        ))}
      </div>
    </div>
  )

  if (type === 'scribe') return (
    <div key={animKey} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,animation:'scaleIn 0.5s ease'}}>
      {/* Mic icon with ping */}
      <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'absolute',width:100,height:100,borderRadius:'50%',background:`${accent}18`,border:`1.5px solid ${accent}30`,animation:'ping 2s ease-out infinite'}}/>
        <div style={{width:80,height:80,borderRadius:24,background:`${accent}14`,border:`2px solid ${accent}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,filter:`drop-shadow(0 0 20px ${accent}60)`}}>🎙️</div>
      </div>
      {/* Waveform */}
      <div style={{display:'flex',alignItems:'center',gap:3,height:40}}>
        {[8,18,28,36,24,40,20,32,14,26,10,22].map((h,i)=>(
          <div key={i} style={{
            width:3,borderRadius:2,background:accent,opacity:0.75,
            '--h':`${h}px`,
            animation:`waveBar ${0.35+i*0.06}s ease-in-out infinite`,
            animationDelay:`${i*0.04}s`,
          } as any}/>
        ))}
      </div>
      <div style={{fontSize:11,color:`${accent}CC`,fontWeight:700,letterSpacing:2}}>AI IS LISTENING...</div>
    </div>
  )

  if (type === 'cases') return (
    <div key={animKey} style={{width:'100%',animation:'slideIn 0.5s ease'}}>
      {[
        {tag:'STEMI',    title:'52M — Chest pain 2 hours',      city:'Riyadh', sub:'Door-to-balloon: 67 min', color:'#FF2D55'},
        {tag:'SEPSIS',   title:'67F — Fever + Hypotension',     city:'Dubai',  sub:'Lactate 4.2 · ICU',       color:'#FF9F0A'},
        {tag:'DKA',      title:'19M — pH 7.1 · K+ 2.8',         city:'London', sub:'Insulin infusion started', color:'#FF2D55'},
      ].map((c,i)=>(
        <div key={i} style={{
          background:`rgba(255,255,255,${0.06-i*0.01})`,
          border:`1.5px solid ${c.color}${i===0?'35':'20'}`,
          borderRadius:16,padding:'12px 14px',marginBottom:8,
          opacity:1-i*0.15,transform:`scale(${1-i*0.025})`,
          display:'flex',alignItems:'center',gap:10,
          animation:`slideIn 0.4s ease ${i*0.08}s both`,
        }}>
          <div style={{display:'flex',flexDirection:'column',gap:3,flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <span style={{fontSize:9,color:c.color,background:`${c.color}18`,borderRadius:6,padding:'2px 8px',fontWeight:800}}>{c.tag}</span>
              <span style={{fontSize:9,color:'rgba(242,248,252,0.45)'}}>{c.city}</span>
            </div>
            <span style={{fontSize:13,color:'#F2F8FC',fontWeight:700}}>{c.title}</span>
            <span style={{fontSize:10,color:'rgba(242,248,252,0.55)'}}>{c.sub}</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:c.color,animation:'ping 1.5s ease-out infinite'}}/>
            <span style={{fontSize:8,color:c.color,fontWeight:700}}>LIVE</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (type === 'boards') return (
    <div key={animKey} style={{display:'flex',flexWrap:'wrap',gap:9,justifyContent:'center',animation:'fadeIn 0.5s ease'}}>
      {[
        {name:'Saudi Board', flag:'🇸🇦', color:'#00D170'},
        {name:'USMLE',       flag:'🇺🇸', color:'#5E5CE6'},
        {name:'MRCP UK',     flag:'🇬🇧', color:'#5E5CE6'},
        {name:'Arab Board',  flag:'🌙',  color:'#FFB340'},
        {name:'PALS · ATLS', flag:'❤️',  color:'#FF2D55'},
        {name:'AHA · ESC',   flag:'🫀',  color:'#00C8B8'},
      ].map((b,i)=>(
        <div key={i} style={{
          background:`${b.color}12`,
          border:`1.5px solid ${b.color}30`,
          borderRadius:18,padding:'11px 14px',
          display:'flex',alignItems:'center',gap:8,
          animation:`scaleIn 0.4s ease ${i*0.07}s both`,
        }}>
          <span style={{fontSize:20}}>{b.flag}</span>
          <span style={{fontSize:12,color:b.color,fontWeight:800}}>{b.name}</span>
        </div>
      ))}
    </div>
  )

  if (type === 'pro') return (
    <div key={animKey} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,animation:'scaleIn 0.5s ease',width:'100%'}}>
      <div style={{position:'relative'}}>
        <LogoMark size={80}/>
        <div style={{position:'absolute',top:-8,right:-8,background:'linear-gradient(135deg,#FFB340,#B8860B)',borderRadius:12,padding:'4px 10px',fontSize:10,color:'#000',fontWeight:900,letterSpacing:1}}>PRO</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:7,width:'100%'}}>
        {[
          {f:'Unlimited Cases & MCQ',         icon:'♾️'},
          {f:'Ambient AI Scribe — EN + AR',   icon:'🎙️'},
          {f:'FHIR EHR Integration',          icon:'🌐'},
          {f:'Clinical Memory & Logbook',     icon:'🗂️'},
          {f:'Enterprise & B2B Access',       icon:'🤝'},
        ].map((item,i)=>(
          <div key={i} style={{
            display:'flex',alignItems:'center',gap:10,
            background:'rgba(255,179,64,0.07)',
            border:'1px solid rgba(255,179,64,0.18)',
            borderRadius:13,padding:'10px 14px',
            animation:`slideIn 0.35s ease ${i*0.07}s both`,
          }}>
            <span style={{fontSize:16}}>{item.icon}</span>
            <span style={{fontSize:12,color:'rgba(242,248,252,0.82)',fontWeight:600}}>{item.f}</span>
            <span style={{marginLeft:'auto',color:'#FFB340',fontSize:12,fontWeight:800}}>✓</span>
          </div>
        ))}
      </div>
    </div>
  )

  return null
}

interface Props { onComplete: (isPro: boolean) => void }

export default function OnboardingFunnel({ onComplete }: Props) {
  const [splash, setSplash]   = useState(true)
  const [step, setStep]       = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2800)
    return () => clearTimeout(t)
  }, [])

  const slide   = SLIDES[step]
  const isLast  = step === SLIDES.length - 1

  const next = () => {
    if (isLast) { onComplete(false); return }
    setLeaving(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimKey(k => k + 1)
      setLeaving(false)
    }, 200)
  }

  // ── SPLASH ──
  if (splash) return (
    <div style={{position:'fixed',inset:0,background:'#0d1828',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:F,zIndex:9999}}>
      {/* Aurora */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'55%',background:'radial-gradient(ellipse at 50% 0%,rgba(0,200,184,0.18) 0%,rgba(0,200,184,0.04) 55%,transparent 80%)',pointerEvents:'none'}}/>
      {/* Neural dots */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        <NeuralNodes accent="#00C8B8"/>
      </div>
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:28}}>
        <div style={{animation:'scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <LogoMark size={110}/>
        </div>
        <div style={{textAlign:'center',animation:'fadeUp 0.6s ease 0.5s both'}}>
          <div style={{fontSize:28,fontWeight:900,color:'#F2F8FC',letterSpacing:-0.7,marginBottom:6}}>
            Cliniverse <span style={{color:'#00C8B8'}}>AI</span>
          </div>
          <div style={{fontSize:11,color:'rgba(242,248,252,0.42)',fontWeight:600,letterSpacing:3.5}}>MEDICAL INTELLIGENCE</div>
        </div>
        <div style={{width:130,height:2,borderRadius:2,background:'rgba(255,255,255,0.08)',overflow:'hidden',animation:'fadeUp 0.4s ease 0.9s both'}}>
          <div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#00C8B8,#0096FF)',animation:'loadBar 2.4s ease forwards',boxShadow:'0 0 10px rgba(0,200,184,0.55)'}}/>
        </div>
      </div>
      <div style={{position:'absolute',bottom:38,fontSize:10,color:'rgba(242,248,252,0.25)',fontWeight:600,letterSpacing:1.5}}>v2.0 · 2026</div>
      <style>{CSS}</style>
    </div>
  )

  // ── SLIDES ──
  return (
    <div style={{
      position:'fixed',inset:0,
      background:'#0d1828',
      fontFamily:F,overflow:'hidden',
      display:'flex',flexDirection:'column',
      opacity: leaving ? 0 : 1,
      transition:'opacity 0.2s ease',
    }}>
      {/* Aurora per slide */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'60%',background:slide.aurora,pointerEvents:'none',transition:'background 0.5s ease',zIndex:0}}/>

      {/* Neural nodes */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
        <NeuralNodes accent={slide.accent}/>
      </div>

      {/* Top accent line */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${slide.accent},transparent)`,opacity:0.7,zIndex:2,transition:'background 0.5s ease'}}/>

      <div style={{position:'relative',zIndex:1,flex:1,display:'flex',flexDirection:'column',padding:'52px 24px 0',overflow:'hidden'}}>

        {/* Progress */}
        <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:24}}>
          {SLIDES.map((_,i)=>(
            <div key={i} style={{
              height:3,borderRadius:2,
              background:i===step?slide.accent:'rgba(255,255,255,0.14)',
              width:i===step?28:8,
              transition:'all 0.35s ease',
              boxShadow:i===step?`0 0 8px ${slide.accent}60`:'none',
            }}/>
          ))}
        </div>

        {/* Badge */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:18}}>
          <div style={{
            background:`${slide.accent}16`,
            border:`1px solid ${slide.accent}32`,
            borderRadius:20,padding:'5px 14px',
            fontSize:10,color:slide.accent,fontWeight:700,letterSpacing:1.5,
          }}>{slide.badge}</div>
        </div>

        {/* Visual */}
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:210,marginBottom:20}}>
          <Visual type={slide.visual} accent={slide.accent} animKey={animKey}/>
        </div>

        {/* Title */}
        <div style={{textAlign:'center',marginBottom:12,animation:'fadeUp 0.45s ease 0.05s both'}} key={`t-${animKey}`}>
          <h1 style={{fontSize:27,fontWeight:900,color:'#F2F8FC',letterSpacing:-0.7,lineHeight:1.18,margin:0,whiteSpace:'pre-line'}}>{slide.title}</h1>
        </div>

        {/* Sub */}
        <div style={{textAlign:'center',marginBottom:18,animation:'fadeUp 0.45s ease 0.12s both'}} key={`s-${animKey}`}>
          <p style={{fontSize:14,color:'rgba(242,248,252,0.72)',lineHeight:1.68,margin:0,maxWidth:310,marginLeft:'auto',marginRight:'auto'}}>{slide.sub}</p>
        </div>

        {/* Stats */}
        <div style={{display:'flex',gap:9,animation:'fadeUp 0.45s ease 0.20s both'}} key={`st-${animKey}`}>
          {slide.stats.map((s,i)=>(
            <div key={i} style={{
              flex:1,
              background:'rgba(255,255,255,0.05)',
              border:`1px solid ${slide.accent}20`,
              borderRadius:16,padding:'10px 4px',textAlign:'center',
            }}>
              <div style={{fontSize:17,fontWeight:900,color:slide.accent,marginBottom:2}}>{s.v}</div>
              <div style={{fontSize:9,color:'rgba(242,248,252,0.45)',fontWeight:600,letterSpacing:0.5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{position:'relative',zIndex:1,padding:'16px 24px 50px',display:'flex',flexDirection:'column',gap:10}}>
        <button onClick={next} style={{
          width:'100%',padding:'17px',borderRadius:22,border:'none',
          background:isLast
            ?'linear-gradient(135deg,#FFB340,#C87800)'
            :`linear-gradient(135deg,${slide.accent},${slide.accent}BB)`,
          color:isLast?'#000':'#fff',
          fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:F,
          boxShadow:`0 8px 30px ${slide.accent}45`,letterSpacing:-0.2,
        }}>
          {isLast?'🚀 Start Free — Upgrade Anytime':`${slide.cta} →`}
        </button>

        {isLast && (
          <button onClick={()=>onComplete(true)} style={{
            width:'100%',padding:'15px',borderRadius:22,
            border:'1.5px solid rgba(255,179,64,0.30)',
            background:'rgba(255,179,64,0.10)',
            color:'#FFB340',fontSize:14,fontWeight:800,
            cursor:'pointer',fontFamily:F,
          }}>⭐ See Pro Plans</button>
        )}

        {!isLast && (
          <button onClick={()=>onComplete(false)} style={{background:'transparent',border:'none',color:'rgba(242,248,252,0.35)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F,padding:'6px'}}>
            Skip for now
          </button>
        )}
      </div>

      <style>{CSS}</style>
    </div>
  )
}
