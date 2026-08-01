'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(16px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes progressFill {
    from{width:0%;}
    to  {width:var(--w);}
  }
  @keyframes checkIn {
    from{transform:scale(0.6);opacity:0;}
    to  {transform:scale(1);opacity:1;}
  }
  @keyframes logoGlow {
    0%,100%{filter:drop-shadow(0 0 12px rgba(0,200,184,.50));}
    50%    {filter:drop-shadow(0 0 24px rgba(0,200,184,.80));}
  }
`

const STEPS = [
  {
    id:'specialty',
    question:'What is your specialty?',
    subtitle:'We\'ll personalise your cases and tools',
    type:'grid',
    options:[
      {v:'Cardiology',       icon:'🫀', color:'#FF453A'},
      {v:'Emergency',        icon:'🚨', color:'#FF9F0A'},
      {v:'Internal Medicine',icon:'🏥', color:'#1A8CFF'},
      {v:'Critical Care',    icon:'🔬', color:'#BF5AF2'},
      {v:'Neurology',        icon:'🧠', color:'#30D158'},
      {v:'Respiratory',      icon:'🫁', color:'#00C8B8'},
      {v:'Pediatrics',       icon:'🧸', color:'#BF5AF2'},
      {v:'Nephrology',       icon:'🫘', color:'#FF9F0A'},
      {v:'Surgery',          icon:'⚕️', color:'#FF453A'},
      {v:'Radiology',        icon:'🩻', color:'#636E82'},
      {v:'Other',            icon:'➕', color:'#636E82'},
    ],
  },
  {
    id:'level',
    question:'What is your training level?',
    subtitle:'Helps us set the right difficulty',
    type:'list',
    options:[
      {v:'Medical Student',    icon:'📚', desc:'Years 1-6',                   color:'#636E82'},
      {v:'Intern',             icon:'🩺', desc:'First year after graduation',  color:'#1A8CFF'},
      {v:'Resident',           icon:'📋', desc:'Specialty training years',     color:'#00C8B8'},
      {v:'Senior Resident',    icon:'🔬', desc:'Advanced training',            color:'#30D158'},
      {v:'Specialist / Fellow',icon:'⚕️', desc:'Board certified',              color:'#FF9F0A'},
      {v:'Consultant',         icon:'👨‍⚕️',desc:'Senior attending physician',  color:'#FFD60A'},
    ],
  },
  {
    id:'goal',
    question:'What is your main goal?',
    subtitle:'We\'ll focus your experience accordingly',
    type:'list',
    options:[
      {v:'Board Exam Prep',    icon:'🎓', desc:'Saudi Board · USMLE · MRCP',  color:'#BF5AF2'},
      {v:'Daily Clinical Tool',icon:'🏥', desc:'Rx · SOAP · Clinical memory', color:'#00C8B8'},
      {v:'CPD & Revalidation', icon:'📋', desc:'Log hours · Reflections',     color:'#30D158'},
      {v:'Clinical Research',  icon:'🔬', desc:'Trials · PubMed · Evidence',  color:'#1A8CFF'},
      {v:'Teaching & Training',icon:'🎙️', desc:'Supervise & educate residents',color:'#FF9F0A'},
    ],
  },
  {
    id:'board',
    question:'Which board are you preparing for?',
    subtitle:'Optional — skip if not applicable',
    type:'grid',
    options:[
      {v:'Saudi Board',  icon:'🇸🇦', color:'#30D158'},
      {v:'USMLE Step 1', icon:'🇺🇸', color:'#1A8CFF'},
      {v:'USMLE Step 2', icon:'🇺🇸', color:'#1A8CFF'},
      {v:'USMLE Step 3', icon:'🇺🇸', color:'#1A8CFF'},
      {v:'MRCP Part 1',  icon:'🇬🇧', color:'#BF5AF2'},
      {v:'MRCP Part 2',  icon:'🇬🇧', color:'#BF5AF2'},
      {v:'Arab Board',   icon:'🌙',  color:'#FFD60A'},
      {v:'PALS / ATLS',  icon:'❤️',  color:'#FF453A'},
      {v:'Not preparing',icon:'⏭️',  color:'#636E82'},
    ],
    skippable:true,
  },
  {
    id:'hours',
    question:'How many hours do you study daily?',
    subtitle:'We\'ll send reminders at the right time',
    type:'hours',
    options:[
      {v:'< 30 min',  icon:'⚡', color:'#636E82', h:0.5},
      {v:'30–60 min', icon:'🌱', color:'#30D158', h:1},
      {v:'1–2 hours', icon:'📚', color:'#1A8CFF', h:1.5},
      {v:'2–4 hours', icon:'🔥', color:'#FF9F0A', h:3},
      {v:'4+ hours',  icon:'🚀', color:'#BF5AF2', h:5},
    ],
  },
  {
    id:'country',
    question:'Where are you based?',
    subtitle:'For local guidelines and terminology',
    type:'grid',
    options:[
      {v:'Saudi Arabia', icon:'🇸🇦', color:'#30D158'},
      {v:'UAE',          icon:'🇦🇪', color:'#1A8CFF'},
      {v:'Kuwait',       icon:'🇰🇼', color:'#FF9F0A'},
      {v:'Qatar',        icon:'🇶🇦', color:'#BF5AF2'},
      {v:'Bahrain',      icon:'🇧🇭', color:'#FF453A'},
      {v:'Oman',         icon:'🇴🇲', color:'#00C8B8'},
      {v:'Egypt',        icon:'🇪🇬', color:'#FF453A'},
      {v:'Jordan',       icon:'🇯🇴', color:'#1A8CFF'},
      {v:'UK',           icon:'🇬🇧', color:'#BF5AF2'},
      {v:'USA',          icon:'🇺🇸', color:'#1A8CFF'},
      {v:'Other',        icon:'🌍', color:'#636E82'},
    ],
  },
]

interface Answers { [key:string]: string }

function LogoMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{animation:'logoGlow 2.8s ease-in-out infinite'}}>
      <defs>
        <linearGradient id="arcOS" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/><stop offset="60%" stopColor="#00C8B8"/><stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <filter id="glOS" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="28" fill="#0d1f30"/>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcOS)" strokeWidth="7" strokeLinecap="round" filter="url(#glOS)"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF"><animate attributeName="r" values="3;6;3" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
      <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
        fill="none" stroke="#00C8B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="120" strokeDashoffset="120" filter="url(#glOS)">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
      </polyline>
    </svg>
  )
}

interface Props { onComplete: (answers:Answers) => void }

export default function OnboardingSurvey({ onComplete }: Props) {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [animKey, setAnimKey] = useState(0)

  const current = STEPS[step]
  const progress = ((step) / STEPS.length) * 100
  const selected = answers[current.id]

  const select = (val:string) => {
    setAnswers(p => ({ ...p, [current.id]: val }))
    if ('vibrate' in navigator) navigator.vibrate(8)
    // Auto advance after short delay
    setTimeout(() => advance(val), 300)
  }

  const advance = (val?: string) => {
    const ans = val || selected
    if (!ans && !current.skippable) return
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      setAnimKey(k => k + 1)
    } else {
      onComplete({ ...answers, [current.id]: ans || 'skip' })
    }
  }

  const back = () => {
    if (step > 0) { setStep(s => s - 1); setAnimKey(k => k + 1) }
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'linear-gradient(160deg,#0d1828 0%,#0f2040 50%,#0d1828 100%)',
      fontFamily:F, display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* Aurora top glow */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'40%',background:`radial-gradient(ellipse at 50% 0%,rgba(0,200,184,0.12) 0%,transparent 70%)`,pointerEvents:'none'}}/>

      {/* Progress bar */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'rgba(255,255,255,0.08)'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,#00C8B8,#1A8CFF)',width:`${progress}%`,transition:'width 0.4s ease',boxShadow:'0 0 8px rgba(0,200,184,0.60)'}}/>
      </div>

      <div style={{position:'relative',zIndex:1,flex:1,display:'flex',flexDirection:'column',padding:'52px 20px 0',overflowY:'auto'}}>

        {/* Top nav */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <button onClick={back} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:12,padding:'8px 14px',color:'var(--text-secondary, rgba(242,248,252,0.55))',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,opacity:step===0?0:1,pointerEvents:step===0?'none':'auto'}}>
            ← Back
          </button>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <LogoMark/>
          </div>
          <div style={{fontSize:11,color:'var(--text-muted, rgba(242,248,252,0.40))',fontWeight:600}}>
            {step+1} of {STEPS.length}
          </div>
        </div>

        {/* Question */}
        <div style={{textAlign:'center',marginBottom:24,animation:'fadeUp 0.4s ease'}} key={`q-${animKey}`}>
          <div style={{fontSize:24,fontWeight:900,color:'var(--text-primary, #F2F8FC)',letterSpacing:-0.6,lineHeight:1.2,marginBottom:8}}>
            {current.question}
          </div>
          <div style={{fontSize:13,color:'var(--text-secondary, rgba(242,248,252,0.55))',lineHeight:1.5}}>
            {current.subtitle}
          </div>
        </div>

        {/* Options */}
        <div style={{animation:'fadeUp 0.45s ease 0.05s both'}} key={`o-${animKey}`}>

          {/* GRID layout */}
          {current.type === 'grid' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9}}>
              {current.options.map(opt => {
                const isSelected = selected === opt.v
                return (
                  <div key={opt.v} onClick={()=>select(opt.v)} style={{
                    background: isSelected ? `${opt.color}18` : 'rgba(255,255,255,0.05)',
                    border:`1.5px solid ${isSelected ? opt.color+'50' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius:18, padding:'13px 8px',
                    cursor:'pointer', textAlign:'center',
                    transition:'all 0.2s', position:'relative',
                  }}>
                    <div style={{fontSize:24,marginBottom:5}}>{opt.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,color:isSelected?opt.color:'var(--text-secondary, rgba(242,248,252,0.70))',lineHeight:1.3}}>{opt.v}</div>
                    {isSelected && <div style={{position:'absolute',top:5,right:5,width:16,height:16,borderRadius:'50%',background:opt.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#000',fontWeight:900,animation:'checkIn 0.2s ease'}}>✓</div>}
                  </div>
                )
              })}
            </div>
          )}

          {/* LIST layout */}
          {current.type === 'list' && (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {current.options.map(opt => {
                const isSelected = selected === opt.v
                return (
                  <div key={opt.v} onClick={()=>select(opt.v)} style={{
                    display:'flex', alignItems:'center', gap:14,
                    background: isSelected ? `${opt.color}12` : 'rgba(255,255,255,0.05)',
                    border:`1.5px solid ${isSelected ? opt.color+'45' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius:18, padding:'14px 16px',
                    cursor:'pointer', transition:'all 0.2s',
                  }}>
                    <div style={{width:44,height:44,borderRadius:14,background:`${opt.color}18`,border:`1px solid ${opt.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{opt.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:'var(--text-primary, #F2F8FC)',marginBottom:2}}>{opt.v}</div>
                      <div style={{fontSize:11,color:'var(--text-muted, rgba(242,248,252,0.50))'}}>{(opt as any).desc}</div>
                    </div>
                    {isSelected && <div style={{width:24,height:24,borderRadius:'50%',background:opt.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#000',fontWeight:900,flexShrink:0,animation:'checkIn 0.2s ease'}}>✓</div>}
                  </div>
                )
              })}
            </div>
          )}

          {/* HOURS layout */}
          {current.type === 'hours' && (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {current.options.map(opt => {
                const isSelected = selected === opt.v
                return (
                  <div key={opt.v} onClick={()=>select(opt.v)} style={{
                    display:'flex', alignItems:'center', gap:14,
                    background: isSelected ? `${opt.color}12` : 'rgba(255,255,255,0.05)',
                    border:`1.5px solid ${isSelected ? opt.color+'45' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius:18, padding:'13px 16px',
                    cursor:'pointer', transition:'all 0.2s',
                  }}>
                    <span style={{fontSize:26}}>{opt.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:'var(--text-primary, #F2F8FC)'}}>{opt.v}</div>
                    </div>
                    {/* Visual bar */}
                    <div style={{width:80,height:6,borderRadius:3,background:'rgba(255,255,255,0.10)',overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:3,background:opt.color,width:`${Math.min((opt as any).h/5*100,100)}%`}}/>
                    </div>
                    {isSelected && <div style={{width:22,height:22,borderRadius:'50%',background:opt.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#000',fontWeight:900,animation:'checkIn 0.2s ease'}}>✓</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {current.skippable && (
          <button onClick={()=>advance('skip')} style={{marginTop:14,background:'transparent',border:'none',color:'var(--text-muted, rgba(242,248,252,0.35))',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F,padding:'8px',textAlign:'center',width:'100%'}}>
            Skip this step →
          </button>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{position:'relative',zIndex:1,padding:'12px 20px 48px'}}>
        <button onClick={()=>advance()} disabled={!selected && !current.skippable} style={{
          width:'100%', padding:'17px', borderRadius:22, border:'none',
          background: !selected && !current.skippable
            ? 'rgba(0,200,184,0.15)'
            : 'linear-gradient(135deg,#00C8B8,#1A8CFF)',
          color:'var(--text-primary, #fff)', fontSize:16, fontWeight:900,
          cursor: !selected && !current.skippable ? 'not-allowed' : 'pointer',
          fontFamily:F,
          boxShadow: !selected && !current.skippable ? 'none' : '0 8px 28px rgba(0,200,184,0.40)',
        }}>
          {step === STEPS.length-1 ? '🚀 Start Using Cliniverse' : 'Continue →'}
        </button>
      </div>

      <style>{CSS}</style>
    </div>
  )
}
