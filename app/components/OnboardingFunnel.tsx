'use client'
import { useState } from 'react'

interface Props {
  onComplete: (email?: string, password?: string, name?: string) => void
}

const SLIDES = [
  {
    emoji: '🫀',
    tag: 'CLINICAL AI',
    title: 'Train Like a\nConsultant',
    sub: 'The clinical training platform built by a physician — for physicians worldwide.',
    color: '#0a84ff',
    bg: 'linear-gradient(160deg,#000000,#001233,#000820)',
  },
  {
    emoji: '⚡',
    tag: '25+ CASES',
    title: 'Real Cases.\nReal Pressure.',
    sub: 'STEMI. Sepsis. Stroke. PE. Cases that simulate real clinical decisions.',
    color: '#30d158',
    bg: 'linear-gradient(160deg,#000000,#001a0a,#000d00)',
  },
  {
    emoji: '🌍',
    tag: 'GLOBAL · LIVE',
    title: 'Compete\nWorldwide',
    sub: 'Join 1,000+ physicians deciding on the same critical case in real-time.',
    color: '#ff9f0a',
    bg: 'linear-gradient(160deg,#000000,#1a0800,#0d0400)',
  },
  {
    emoji: '🧠',
    tag: 'AI POWERED',
    title: 'Surgical AI\n& Ghost Consult',
    sub: 'Cardiac. Neuro. General Surgery. An AI that challenges your every decision.',
    color: '#bf5af2',
    bg: 'linear-gradient(160deg,#000000,#12001f,#080010)',
  },
]

export default function OnboardingFunnel({ onComplete }: Props) {
  const [slide, setSlide] = useState(0)
  const [screen, setScreen] = useState<'slides'|'auth'>('slides')
  const [mode, setMode] = useState<'signup'|'signin'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const F = '-apple-system,"SF Pro Display","Helvetica Neue",sans-serif'
  const s = SLIDES[slide]

  const handleAuth = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onComplete(email, password, name)
  }

  if (screen === 'auth') return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'#000',fontFamily:F,display:'flex',flexDirection:'column',paddingTop:'env(safe-area-inset-top,60px)',paddingBottom:'env(safe-area-inset-bottom,34px)'}}>

      {/* Header */}
      <div style={{padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>setScreen('slides')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',fontSize:15,cursor:'pointer',fontFamily:F}}>← Back</button>
        <button onClick={()=>setMode(m=>m==='signup'?'signin':'signup')} style={{background:'none',border:'none',color:'#0a84ff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F}}>
          {mode==='signup'?'Sign in instead':'Create account'}
        </button>
      </div>

      {/* Title */}
      <div style={{padding:'20px 24px 16px'}}>
        <div style={{fontSize:11,color:'#0a84ff',fontWeight:700,letterSpacing:2,marginBottom:10,textTransform:'uppercase'}}>Cliniverse AI</div>
        <div style={{fontSize:30,fontWeight:900,color:'white',lineHeight:1.1,letterSpacing:-1,marginBottom:8,whiteSpace:'pre-line'}}>
          {mode==='signup'?'Create Your\nAccount':'Welcome\nBack'}
        </div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.4)'}}>
          {mode==='signup'?'Join 10,000+ physicians worldwide':'Continue your clinical training'}
        </div>
      </div>

      {/* Form */}
      <div style={{flex:1,padding:'0 24px',display:'flex',flexDirection:'column',gap:12,overflowY:'auto'}}>
        {mode==='signup'&&(
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Full Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Dr. Ahmed" style={{width:'100%',padding:'15px 16px',borderRadius:14,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:15,outline:'none',boxSizing:'border-box',fontFamily:F}}/>
          </div>
        )}
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="doctor@email.com" style={{width:'100%',padding:'15px 16px',borderRadius:14,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:15,outline:'none',boxSizing:'border-box',fontFamily:F}}/>
        </div>
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Password</div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{width:'100%',padding:'15px 16px',borderRadius:14,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:15,outline:'none',boxSizing:'border-box',fontFamily:F}}/>
        </div>
        {mode==='signup'&&(
          <div style={{background:'rgba(10,132,255,0.06)',borderRadius:16,padding:14,border:'1px solid rgba(10,132,255,0.15)'}}>
            {['25+ AI Clinical Cases — Free','Global Competition with 1,000+ doctors','Surgical AI: Cardiac · Neuro · General','Ghost Consultant + Rapid Fire + ECG'].map((f,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:i<3?8:0}}>
                <div style={{width:16,height:16,borderRadius:'50%',background:'#30d158',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'black',fontWeight:800,flexShrink:0}}>✓</div>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{padding:'16px 24px'}}>
        <button onClick={handleAuth} disabled={loading} style={{width:'100%',padding:'17px',borderRadius:16,border:'none',background:loading?'rgba(10,132,255,0.4)':'#0a84ff',color:'white',fontSize:16,fontWeight:700,cursor:'pointer',marginBottom:10,fontFamily:F}}>
          {loading?'Setting up...':mode==='signup'?'Create Account →':'Sign In →'}
        </button>
        <button onClick={()=>onComplete()} style={{width:'100%',padding:'13px',borderRadius:14,border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:'rgba(255,255,255,0.3)',fontSize:13,cursor:'pointer',fontFamily:F}}>
          Continue without account
        </button>
      </div>

      <style>{`input::placeholder{color:rgba(255,255,255,0.2)}input:focus{border-color:#0a84ff!important}`}</style>
    </div>
  )

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,fontFamily:F,overflow:'hidden',background:s.bg,transition:'background 0.8s ease'}}>
      {/* Glow */}
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:280,height:280,borderRadius:'50%',background:`radial-gradient(circle,${s.color}25 0%,transparent 70%)`,filter:'blur(50px)',pointerEvents:'none',transition:'all 0.8s'}}/>

      {/* Progress dots */}
      <div style={{position:'absolute',top:'env(safe-area-inset-top,50px)',left:0,right:0,padding:'16px 20px',display:'flex',gap:4,zIndex:10}}>
        {SLIDES.map((_,i)=>(
          <div key={i} onClick={()=>setSlide(i)} style={{flex:1,height:2.5,borderRadius:2,background:'rgba(255,255,255,0.15)',overflow:'hidden',cursor:'pointer'}}>
            <div style={{height:'100%',borderRadius:2,background:'rgba(255,255,255,0.85)',width:i<=slide?'100%':'0%',transition:'width 0.4s'}}/>
          </div>
        ))}
      </div>

      {/* Skip */}
      <button onClick={()=>setScreen('auth')} style={{position:'absolute',top:'calc(env(safe-area-inset-top,50px) + 24px)',right:20,background:'rgba(255,255,255,0.08)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,padding:'5px 14px',cursor:'pointer',zIndex:10,fontFamily:F}}>Skip</button>

      {/* Emoji */}
      <div style={{position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',fontSize:90,textAlign:'center',filter:'drop-shadow(0 0 30px '+s.color+'50)',transition:'all 0.5s'}}>
        {s.emoji}
      </div>

      {/* Content */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 28px calc(env(safe-area-inset-bottom,34px) + 16px)',zIndex:10}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:s.color+'15',border:`1px solid ${s.color}30`,borderRadius:20,padding:'4px 12px',marginBottom:16}}>
          <div style={{width:5,height:5,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}`}}/>
          <span style={{fontSize:10,fontWeight:700,color:s.color,letterSpacing:1.5}}>{s.tag}</span>
        </div>
        <div style={{fontSize:46,fontWeight:900,color:'white',lineHeight:0.95,letterSpacing:-2,marginBottom:14,whiteSpace:'pre-line'}}>{s.title}</div>
        <div style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.65,marginBottom:24}}>{s.sub}</div>

        {/* Dots */}
        <div style={{display:'flex',gap:6,marginBottom:20}}>
          {SLIDES.map((_,i)=>(<div key={i} onClick={()=>setSlide(i)} style={{width:i===slide?20:6,height:6,borderRadius:3,background:i===slide?'white':'rgba(255,255,255,0.2)',transition:'all 0.3s',cursor:'pointer'}}/>))}
        </div>

        <button onClick={()=>{if(slide<SLIDES.length-1)setSlide(s=>s+1);else setScreen('auth')}}
          style={{width:'100%',padding:'17px',borderRadius:16,border:'none',background:slide===SLIDES.length-1?`linear-gradient(135deg,${s.color},${s.color}bb)`:'rgba(255,255,255,0.92)',color:slide===SLIDES.length-1?'white':'#000',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:F,letterSpacing:-0.3}}>
          {slide<SLIDES.length-1?'Continue →':'Get Started — Free'}
        </button>
      </div>
    </div>
  )
}
