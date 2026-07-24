'use client'
import { useState, useEffect, useRef } from 'react'

interface Props { onComplete: (email?: string, password?: string, name?: string) => void }

const SLIDES = [
  {
    id: 0,
    bg: 'linear-gradient(160deg, #000000 0%, #001233 60%, #000820 100%)',
    accent: '#0A84FF',
    glow: 'rgba(10,132,255,0.4)',
    tag: 'CLINICAL AI · v2.0',
    title: 'Medicine\nMeets\nPrecision',
    sub: 'The most advanced clinical training platform — built by a physician, for physicians.',
    visual: (
      <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
        <circle cx="140" cy="110" r="90" stroke="rgba(10,132,255,0.15)" strokeWidth="1"/>
        <circle cx="140" cy="110" r="65" stroke="rgba(10,132,255,0.2)" strokeWidth="1"/>
        <circle cx="140" cy="110" r="40" fill="rgba(10,132,255,0.1)" stroke="rgba(10,132,255,0.4)" strokeWidth="1.5"/>
        {/* ECG line */}
        <path d="M40 110 L80 110 L90 70 L100 150 L115 80 L125 130 L135 110 L240 110" stroke="#0A84FF" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{filter:'drop-shadow(0 0 8px #0A84FF)'}}/>
        {/* Pulse dot */}
        <circle cx="240" cy="110" r="5" fill="#0A84FF" style={{filter:'drop-shadow(0 0 12px #0A84FF)'}}/>
        {/* Stars/dots */}
        {[[50,40],[230,35],[260,90],[20,160],[250,175]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,0.4)"/>
        ))}
      </svg>
    ),
  },
  {
    id: 1,
    bg: 'linear-gradient(160deg, #000000 0%, #001a0a 60%, #000d00 100%)',
    accent: '#30D158',
    glow: 'rgba(48,209,88,0.4)',
    tag: 'AI POWERED · UNLIMITED',
    title: '25+\nClinical\nCases',
    sub: 'STEMI. Sepsis. Stroke. PE. Real scenarios managed by AI that thinks like a clinician.',
    visual: (
      <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
        {/* Hospital building */}
        <rect x="90" y="80" width="100" height="110" rx="4" fill="rgba(48,209,88,0.08)" stroke="rgba(48,209,88,0.3)" strokeWidth="1.5"/>
        <rect x="120" y="130" width="40" height="60" rx="2" fill="rgba(48,209,88,0.15)" stroke="rgba(48,209,88,0.4)" strokeWidth="1"/>
        {/* Cross */}
        <rect x="128" y="95" width="24" height="8" rx="2" fill="#30D158" style={{filter:'drop-shadow(0 0 8px #30D158)'}}/>
        <rect x="136" y="87" width="8" height="24" rx="2" fill="#30D158" style={{filter:'drop-shadow(0 0 8px #30D158)'}}/>
        {/* Windows */}
        {[[100,95],[162,95],[100,115],[162,115]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="16" height="12" rx="2" fill="rgba(48,209,88,0.2)" stroke="rgba(48,209,88,0.3)" strokeWidth="1"/>
        ))}
        {/* Floating cards */}
        <rect x="20" y="60" width="55" height="30" rx="8" fill="rgba(48,209,88,0.1)" stroke="rgba(48,209,88,0.3)" strokeWidth="1"/>
        <text x="28" y="73" fontSize="8" fill="rgba(48,209,88,0.8)" fontFamily="monospace">STEMI</text>
        <text x="28" y="83" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="monospace">+80 XP</text>
        <rect x="205" y="55" width="55" height="30" rx="8" fill="rgba(48,209,88,0.1)" stroke="rgba(48,209,88,0.3)" strokeWidth="1"/>
        <text x="213" y="68" fontSize="8" fill="rgba(48,209,88,0.8)" fontFamily="monospace">SEPSIS</text>
        <text x="213" y="78" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="monospace">+75 XP</text>
        {/* Ground */}
        <line x1="60" y1="190" x2="220" y2="190" stroke="rgba(48,209,88,0.15)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 2,
    bg: 'linear-gradient(160deg, #000000 0%, #1a0800 60%, #0d0400 100%)',
    accent: '#FF9F0A',
    glow: 'rgba(255,159,10,0.4)',
    tag: 'GLOBAL · REAL-TIME',
    title: 'Compete\nWorldwide',
    sub: 'Join 1,000+ physicians deciding on the same critical case. See how the world votes.',
    visual: (
      <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
        {/* Globe outline */}
        <circle cx="140" cy="110" r="80" stroke="rgba(255,159,10,0.15)" strokeWidth="1"/>
        <ellipse cx="140" cy="110" rx="40" ry="80" stroke="rgba(255,159,10,0.1)" strokeWidth="1"/>
        <line x1="60" y1="110" x2="220" y2="110" stroke="rgba(255,159,10,0.1)" strokeWidth="1"/>
        <line x1="70" y1="75" x2="210" y2="75" stroke="rgba(255,159,10,0.08)" strokeWidth="1"/>
        <line x1="70" y1="145" x2="210" y2="145" stroke="rgba(255,159,10,0.08)" strokeWidth="1"/>
        {/* Doctor dots around globe */}
        {[
          [140,35,'#FF9F0A'],[200,70,'#30D158'],[215,130,'#0A84FF'],
          [170,185,'#FF453A'],[100,185,'#BF5AF2'],[65,130,'#FF9F0A'],
          [80,70,'#30D158'],[140,110,'#FF9F0A'],
        ].map(([x,y,c],i)=>(
          <g key={i}>
            <circle cx={x as number} cy={y as number} r="6" fill={`${c}20`} stroke={c as string} strokeWidth="1.5"/>
            <circle cx={x as number} cy={y as number} r="2" fill={c as string} style={{filter:`drop-shadow(0 0 4px ${c})`}}/>
          </g>
        ))}
        {/* Connection lines */}
        <line x1="140" y1="110" x2="200" y2="70" stroke="rgba(255,159,10,0.2)" strokeWidth="1" strokeDasharray="3,3"/>
        <line x1="140" y1="110" x2="65" y2="130" stroke="rgba(48,209,88,0.2)" strokeWidth="1" strokeDasharray="3,3"/>
        <line x1="140" y1="110" x2="215" y2="130" stroke="rgba(10,132,255,0.2)" strokeWidth="1" strokeDasharray="3,3"/>
        {/* Center glow */}
        <circle cx="140" cy="110" r="12" fill="rgba(255,159,10,0.2)" stroke="#FF9F0A" strokeWidth="2" style={{filter:'drop-shadow(0 0 12px #FF9F0A)'}}/>
        <text x="134" y="115" fontSize="12" fill="#FF9F0A">⚕</text>
      </svg>
    ),
  },
  {
    id: 3,
    bg: 'linear-gradient(160deg, #000000 0%, #12001f 60%, #080010 100%)',
    accent: '#BF5AF2',
    glow: 'rgba(191,90,242,0.4)',
    tag: 'SURGICAL AI · EXPERT',
    title: 'Master\nEvery\nSpecialty',
    sub: 'Cardiac. Neuro. General Surgery. ECG. Rapid Fire. Clinical Nexus. All in one place.',
    visual: (
      <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
        {/* Brain outline */}
        <path d="M140 40 C100 40 70 65 70 95 C70 115 80 130 95 140 C90 155 95 170 110 175 C120 178 130 172 140 168 C150 172 160 178 170 175 C185 170 190 155 185 140 C200 130 210 115 210 95 C210 65 180 40 140 40Z" fill="rgba(191,90,242,0.08)" stroke="rgba(191,90,242,0.3)" strokeWidth="1.5"/>
        {/* Brain folds */}
        <path d="M110 80 Q120 70 130 80 Q140 90 150 80 Q160 70 170 80" stroke="rgba(191,90,242,0.3)" strokeWidth="1" fill="none"/>
        <path d="M100 105 Q115 95 130 105 Q145 115 160 105 Q175 95 185 105" stroke="rgba(191,90,242,0.25)" strokeWidth="1" fill="none"/>
        <path d="M105 130 Q120 120 135 130 Q150 140 165 130" stroke="rgba(191,90,242,0.2)" strokeWidth="1" fill="none"/>
        {/* Neural connections */}
        {[[120,90,145,120],[155,85,155,120],[130,110,160,130],[110,100,120,130]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(191,90,242,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
        ))}
        {/* Glow dots */}
        {[[120,90],[155,85],[130,110],[110,100],[145,120],[155,120],[160,130],[120,130]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="3" fill="#BF5AF2" style={{filter:'drop-shadow(0 0 6px #BF5AF2)'}} opacity="0.8"/>
        ))}
        {/* Floating modules */}
        <rect x="15" y="80" width="48" height="22" rx="6" fill="rgba(191,90,242,0.1)" stroke="rgba(191,90,242,0.3)" strokeWidth="1"/>
        <text x="22" y="93" fontSize="8" fill="rgba(191,90,242,0.9)" fontFamily="-apple-system,sans-serif" fontWeight="600">🫀 Cardiac</text>
        <rect x="217" y="80" width="48" height="22" rx="6" fill="rgba(10,132,255,0.1)" stroke="rgba(10,132,255,0.3)" strokeWidth="1"/>
        <text x="222" y="93" fontSize="8" fill="rgba(10,132,255,0.9)" fontFamily="-apple-system,sans-serif" fontWeight="600">🧠 Neuro</text>
        <rect x="15" y="115" width="48" height="22" rx="6" fill="rgba(48,209,88,0.1)" stroke="rgba(48,209,88,0.3)" strokeWidth="1"/>
        <text x="20" y="128" fontSize="8" fill="rgba(48,209,88,0.9)" fontFamily="-apple-system,sans-serif" fontWeight="600">⚡ Rapid</text>
        <rect x="217" y="115" width="48" height="22" rx="6" fill="rgba(255,159,10,0.1)" stroke="rgba(255,159,10,0.3)" strokeWidth="1"/>
        <text x="222" y="128" fontSize="8" fill="rgba(255,159,10,0.9)" fontFamily="-apple-system,sans-serif" fontWeight="600">🌍 Nexus</text>
      </svg>
    ),
  },
]

export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide, setSlide] = useState(0)
  const [phase, setPhase] = useState<'slides'|'auth'>('slides')
  const [authMode, setAuthMode] = useState<'signup'|'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [animated, setAnimated] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    if (phase !== 'slides') return
    setAnimated(false)
    const t1 = setTimeout(() => setAnimated(true), 50)
    timerRef.current = setTimeout(() => {
      if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    }, 5000)
    return () => { clearTimeout(t1); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [slide, phase])

  const goTo = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSlide(i)
  }

  const handleBtn = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    else setPhase('auth')
  }

  const handleAuth = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    onComplete(email, password, name)
  }

  const s = SLIDES[slide]

  if (phase === 'auth') return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'#000000',fontFamily:'-apple-system,"SF Pro Display","Helvetica Neue",sans-serif',display:'flex',flexDirection:'column',paddingTop:'env(safe-area-inset-top,60px)',paddingBottom:'env(safe-area-inset-bottom,34px)'}}>
      <div style={{padding:'20px 28px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setPhase('slides')} style={{background:'none',border:'none',color:'#0A84FF',fontSize:17,cursor:'pointer',padding:0,fontFamily:'inherit'}}>← Back</button>
        <button onClick={()=>setAuthMode(m=>m==='signup'?'signin':'signup')} style={{background:'none',border:'none',color:'#0A84FF',fontSize:15,cursor:'pointer',padding:0,fontWeight:600,fontFamily:'inherit'}}>
          {authMode==='signup'?'Sign In':'Create Account'}
        </button>
      </div>
      <div style={{padding:'36px 28px 28px'}}>
        <div style={{fontSize:11,color:'#0A84FF',fontWeight:700,letterSpacing:2,marginBottom:12,textTransform:'uppercase'}}>CLINIVERSE AI</div>
        <div style={{fontSize:34,fontWeight:800,color:'#FFFFFF',lineHeight:1.1,letterSpacing:-1,marginBottom:10,whiteSpace:'pre-line'}}>
          {authMode==='signup'?'Create Your\nAccount':'Welcome\nBack, Doctor'}
        </div>
        <div style={{fontSize:15,color:'rgba(255,255,255,0.45)',lineHeight:1.5}}>
          {authMode==='signup'?'Join 10,000+ physicians worldwide.':'Sign in to continue your training.'}
        </div>
      </div>
      <div style={{flex:1,padding:'0 28px',display:'flex',flexDirection:'column',gap:14,overflowY:'auto'}}>
        {authMode==='signup'&&(
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Full Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Dr. Ahmed Al-Rashid"
              style={{width:'100%',padding:'16px 18px',borderRadius:14,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:16,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
          </div>
        )}
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
            style={{width:'100%',padding:'16px 18px',borderRadius:14,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:16,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
        </div>
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Password</div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••••••"
            style={{width:'100%',padding:'16px 18px',borderRadius:14,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:16,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
        </div>
        {authMode==='signup'&&(
          <div style={{background:'rgba(10,132,255,0.06)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(10,132,255,0.15)'}}>
            {['25+ AI Clinical Cases — Free to start','Global Competition with 1,000+ doctors','Surgical AI: Cardiac · Neuro · General','Rapid Fire · Clinical Nexus · ECG'].map((f,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:i<3?8:0}}>
                <div style={{width:16,height:16,borderRadius:'50%',background:'#30D158',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,flexShrink:0,color:'black',fontWeight:800}}>✓</div>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.65)',fontWeight:500}}>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:'20px 28px'}}>
        <button onClick={handleAuth} disabled={loading}
          style={{width:'100%',padding:'18px',borderRadius:16,border:'none',background:loading?'rgba(10,132,255,0.4)':'#0A84FF',color:'white',fontSize:17,fontWeight:700,cursor:'pointer',marginBottom:12,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.2s'}}>
          {loading?'⏳  Setting up your account...':authMode==='signup'?'Create Account & Enter →':'Sign In & Continue →'}
        </button>

        <p style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.15)',marginTop:14,lineHeight:1.5}}>
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,fontFamily:'-apple-system,"SF Pro Display","Helvetica Neue",sans-serif',userSelect:'none',WebkitUserSelect:'none',overflow:'hidden',background:s.bg,transition:'background 0.8s ease'}}>

      {/* Glow background */}
      <div style={{position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',width:300,height:300,borderRadius:'50%',background:`radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,filter:'blur(60px)',pointerEvents:'none',transition:'all 0.8s ease'}}/>

      {/* Progress bars */}
      <div style={{position:'absolute',top:'env(safe-area-inset-top,50px)',left:0,right:0,padding:'12px 20px',display:'flex',gap:4,zIndex:10}}>
        {SLIDES.map((_,i)=>(
          <div key={i} onClick={()=>goTo(i)} style={{flex:1,height:2.5,borderRadius:2,background:'rgba(255,255,255,0.2)',overflow:'hidden',cursor:'pointer'}}>
            <div style={{height:'100%',borderRadius:2,background:'rgba(255,255,255,0.9)',width:i<slide?'100%':i===slide?'100%':'0%',transition:i===slide?'width 5s linear':'none'}}/>
          </div>
        ))}
      </div>

      {/* Skip */}
      <button onClick={()=>setPhase('auth')} style={{position:'absolute',top:'calc(env(safe-area-inset-top,50px) + 26px)',right:20,background:'rgba(255,255,255,0.08)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:20,color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,padding:'6px 16px',cursor:'pointer',zIndex:10,fontFamily:'inherit'}}>
        Skip
      </button>

      {/* Visual */}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%, -58%)',opacity:animated?1:0,transition:'opacity 0.6s ease',pointerEvents:'none'}}>
        {s.visual}
      </div>

      {/* Content */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 28px calc(env(safe-area-inset-bottom,34px) + 16px)',zIndex:10}}>
        {/* Tag */}
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${s.accent}15`,border:`1px solid ${s.accent}35`,borderRadius:20,padding:'5px 14px',marginBottom:18,transition:'all 0.5s ease'}}>
          <div style={{width:5,height:5,borderRadius:'50%',background:s.accent,boxShadow:`0 0 8px ${s.accent}`}}/>
          <span style={{fontSize:10,fontWeight:700,color:s.accent,letterSpacing:1.5}}>{s.tag}</span>
        </div>

        {/* Title */}
        <div style={{fontSize:52,fontWeight:900,color:'white',lineHeight:0.95,letterSpacing:-2,marginBottom:16,whiteSpace:'pre-line',opacity:animated?1:0,transform:animated?'translateY(0)':'translateY(16px)',transition:'all 0.5s ease'}}>
          {s.title}
        </div>

        {/* Subtitle */}
        <div style={{fontSize:15,color:'rgba(255,255,255,0.55)',lineHeight:1.65,marginBottom:28,maxWidth:320,opacity:animated?1:0,transform:animated?'translateY(0)':'translateY(12px)',transition:'all 0.5s ease 0.1s'}}>
          {s.sub}
        </div>

        {/* Dots */}
        <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:20}}>
          {SLIDES.map((_,i)=>(
            <div key={i} onClick={()=>goTo(i)} style={{width:i===slide?22:6,height:6,borderRadius:3,background:i===slide?'white':'rgba(255,255,255,0.25)',transition:'all 0.35s ease',cursor:'pointer'}}/>
          ))}
        </div>

        {/* Button */}
        <button onClick={handleBtn} style={{width:'100%',padding:'18px',borderRadius:16,border:'none',background:slide===SLIDES.length-1?`linear-gradient(135deg,${s.accent},${s.accent}aa)`:'rgba(255,255,255,0.95)',color:slide===SLIDES.length-1?'white':'#000000',fontSize:17,fontWeight:700,cursor:'pointer',boxShadow:slide===SLIDES.length-1?`0 8px 32px ${s.glow}`:'0 8px 32px rgba(0,0,0,0.4)',fontFamily:'inherit',letterSpacing:-0.3,transition:'all 0.4s ease'}}>
          {slide<SLIDES.length-1?`${s.btn} →`:'Get Started — Free'}
        </button>
      </div>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: #0A84FF !important; box-shadow: 0 0 0 3px rgba(10,132,255,0.15); }
      `}</style>
    </div>
  )
}
