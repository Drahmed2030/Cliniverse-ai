'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [screen, setScreen] = useState<'launch'|'welcome'|'signin'|'app'>('launch')
  const [progress, setProgress] = useState(0)
  const [tagline, setTagline] = useState(0)
  const [tab, setTab] = useState('hub')

  const taglines = [
    'Where medicine meets precision.',
    'Train on real emergencies.',
    'Think like a consultant.',
    'AI-powered clinical intelligence.',
  ]

  useEffect(() => {
    if (screen !== 'launch') return
    const prog = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(prog); setTimeout(() => setScreen('welcome'), 400); return 100 }
        return p + 1.2
      })
    }, 30)
    const tag = setInterval(() => setTagline(t => (t + 1) % taglines.length), 2200)
    return () => { clearInterval(prog); clearInterval(tag) }
  }, [screen])

  // LAUNCH SCREEN
  if (screen === 'launch') return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',
      fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',
      overflow:'hidden', position:'relative',
    }}>
      {/* Ambient orbs */}
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)',top:-100,left:-100,filter:'blur(40px)'}}/>
      <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.12) 0%,transparent 70%)',bottom:0,right:-50,filter:'blur(40px)'}}/>
      <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(48,209,88,0.08) 0%,transparent 70%)',bottom:100,left:50,filter:'blur(30px)'}}/>

      {/* ECG Logo */}
      <div style={{marginBottom:32,position:'relative'}}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={55} fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth={1}/>
          <circle cx={60} cy={60} r={55} fill="none" stroke="url(#grad)" strokeWidth={1.5}
            strokeDasharray="345" strokeDashoffset={345 - (345 * progress / 100)}
            strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.1s'}}/>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6"/>
              <stop offset="50%" stopColor="#0a84ff"/>
              <stop offset="100%" stopColor="#30d158"/>
            </linearGradient>
          </defs>
          <path d="M20 60 L38 60 L46 35 L54 85 L62 60 L70 60 L76 48 L82 72 L88 60 L100 60"
            fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Pulse glow */}
        <div style={{position:'absolute',inset:0,borderRadius:'50%',boxShadow:'0 0 40px rgba(139,92,246,0.3)',animation:'pulse 2s ease-in-out infinite'}}/>
      </div>

      {/* Logo text */}
      <div style={{marginBottom:8,textAlign:'center'}}>
        <span style={{
          fontSize:38, fontWeight:900, letterSpacing:-1,
          background:'linear-gradient(135deg,#ffffff 0%,rgba(200,180,255,0.95) 50%,rgba(120,180,255,0.9) 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          display:'block', lineHeight:1,
        }}>CLINIVERSE</span>
        <span style={{
          fontSize:38, fontWeight:900, letterSpacing:2,
          background:'linear-gradient(135deg,#8b5cf6,#0a84ff,#30d158)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          display:'block', lineHeight:1,
        }}>AI</span>
      </div>

      <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',letterSpacing:4,textTransform:'uppercase',marginBottom:40}}>
        Virtual Hospital Hub
      </div>

      {/* Animated tagline */}
      <div style={{height:24,marginBottom:48,overflow:'hidden',position:'relative',width:280,textAlign:'center'}}>
        <p key={tagline} style={{
          fontSize:13, color:'rgba(255,255,255,0.55)', letterSpacing:0.3,
          margin:0, animation:'slideUp 0.6s ease',
        }}>{taglines[tagline]}</p>
      </div>

      {/* Progress bar */}
      <div style={{width:200,height:1,background:'rgba(255,255,255,0.08)',borderRadius:1,marginBottom:16,overflow:'hidden'}}>
        <div style={{
          height:'100%', borderRadius:1,
          background:'linear-gradient(90deg,#8b5cf6,#0a84ff,#30d158)',
          width:`${progress}%`, transition:'width 0.1s',
          boxShadow:'0 0 8px rgba(139,92,246,0.6)',
        }}/>
      </div>
      <p style={{fontSize:10,color:'rgba(255,255,255,0.2)',letterSpacing:2}}>v4.5 · SECURE</p>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.05); } }
      `}</style>
    </div>
  )

  // WELCOME SCREEN
  if (screen === 'welcome') return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',
      fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',
      padding:'0 32px', textAlign:'center', position:'relative', overflow:'hidden',
    }}>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)',top:-150,left:-150,filter:'blur(60px)'}}/>

      <div style={{animation:'fadeIn 0.8s ease'}}>
        <p style={{fontSize:13,color:'rgba(139,92,246,0.8)',letterSpacing:3,textTransform:'uppercase',marginBottom:16,fontWeight:600}}>Welcome to</p>
        <h1 style={{
          fontSize:52, fontWeight:900, margin:'0 0 8px', letterSpacing:-2, lineHeight:1,
          background:'linear-gradient(135deg,#fff 0%,rgba(200,180,255,0.9) 60%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>Cliniverse</h1>
        <h1 style={{
          fontSize:52, fontWeight:900, margin:'0 0 24px', letterSpacing:2, lineHeight:1,
          background:'linear-gradient(135deg,#8b5cf6,#0a84ff,#30d158)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>AI</h1>
        <p style={{fontSize:16,color:'rgba(255,255,255,0.55)',lineHeight:1.6,marginBottom:48,maxWidth:280,margin:'0 auto 48px'}}>
          The clinical intelligence platform built by a physician, for physicians.
        </p>

        <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:320,margin:'0 auto'}}>
          <button onClick={() => setScreen('signin')} style={{
            padding:'16px 32px', borderRadius:16, border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',
            color:'white', fontSize:16, fontWeight:700, letterSpacing:0.3,
            boxShadow:'0 8px 32px rgba(139,92,246,0.4)',
          }}>Enter Hospital →</button>
          <button onClick={() => setScreen('signin')} style={{
            padding:'16px 32px', borderRadius:16, cursor:'pointer',
            background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)',
            fontSize:14, fontWeight:500, border:'1px solid rgba(255,255,255,0.1)',
          }}>Sign in with existing account</button>
        </div>
      </div>

      <div style={{position:'absolute',bottom:32,display:'flex',gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:i===1?20:6,height:6,borderRadius:3,background:i===1?'#8b5cf6':'rgba(255,255,255,0.2)'}}/>)}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )

  // SIGNIN SCREEN
  if (screen === 'signin') return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      background:'radial-gradient(ellipse at 70% 80%, #1a0533 0%, #0a0015 40%, #000510 100%)',
      fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',
      padding:'60px 24px 40px', position:'relative', overflow:'hidden',
    }}>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.1) 0%,transparent 70%)',bottom:-100,right:-100,filter:'blur(60px)'}}/>

      <div style={{animation:'fadeIn 0.6s ease'}}>
        <p style={{fontSize:13,color:'rgba(139,92,246,0.7)',letterSpacing:2,textTransform:'uppercase',marginBottom:8,fontWeight:600}}>Cliniverse AI</p>
        <h2 style={{fontSize:34,fontWeight:800,color:'white',margin:'0 0 8px',letterSpacing:-1}}>Sign In</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.4)',marginBottom:40}}>Access your clinical dashboard</p>

        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:'rgba(255,255,255,0.4)',letterSpacing:1,textTransform:'uppercase',marginBottom:8,display:'block'}}>Email / Medical ID</label>
          <input placeholder="doctor@hospital.com" style={{
            width:'100%', padding:'14px 16px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)',
            background:'rgba(255,255,255,0.05)', color:'white', fontSize:15,
            outline:'none', boxSizing:'border-box' as const,
          }}/>
        </div>

        <div style={{marginBottom:32}}>
          <label style={{fontSize:12,color:'rgba(255,255,255,0.4)',letterSpacing:1,textTransform:'uppercase',marginBottom:8,display:'block'}}>Password</label>
          <input type="password" placeholder="••••••••" style={{
            width:'100%', padding:'14px 16px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)',
            background:'rgba(255,255,255,0.05)', color:'white', fontSize:15,
            outline:'none', boxSizing:'border-box' as const,
          }}/>
        </div>

        <button onClick={() => setScreen('app')} style={{
          width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
          background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',
          color:'white', fontSize:16, fontWeight:700,
          boxShadow:'0 8px 32px rgba(139,92,246,0.4)', marginBottom:16,
        }}>Access Hospital →</button>

        <div style={{display:'flex',gap:12}}>
          <button style={{flex:1,padding:'14px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',fontSize:13,cursor:'pointer'}}>Face ID 🔒</button>
          <button style={{flex:1,padding:'14px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',fontSize:13,cursor:'pointer'}}>Touch ID 👆</button>
        </div>

        <p style={{textAlign:'center',marginTop:24,fontSize:13,color:'rgba(255,255,255,0.3)'}}>
          New physician? <span style={{color:'#8b5cf6',cursor:'pointer'}} onClick={() => setScreen('app')}>Request Access</span>
        </p>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )

  // MAIN APP
  const card = {background:'rgba(255,255,255,0.7)',borderRadius:16,padding:16,marginBottom:10,boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#d6e4f7,#e4eef9,#f0e8fb)',fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto'}}>
      <header style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100,borderBottom:'0.5px solid rgba(0,0,0,0.06)'}}>
        <b style={{fontSize:20,color:'#0f172a'}}>CLINIVERSE<span style={{color:'#0a84ff'}}>AI</span></b>
        <span style={{fontSize:10,color:'#1a7a40',fontWeight:700}}>● ONLINE</span>
      </header>
      <main style={{flex:1,padding:16,paddingBottom:90}}>
        {tab==='hub' && <div><h1 style={{color:'#0f172a',fontSize:24,marginBottom:16}}>Virtual Hospital Hub</h1>{['STEMI','PE','Sepsis','Heart Block'].map(c=><div key={c} style={card}><p style={{color:'#0f172a',fontWeight:700,margin:0}}>{c}</p><p style={{color:'#666',fontSize:12,margin:0}}>Emergency</p></div>)}</div>}
        {tab==='lab' && <div><h2 style={{color:'#0f172a'}}>Clinical Laboratory</h2>{['Troponin I','Haemoglobin','WBC Count','BNP'].map(t=><div key={t} style={card}><p style={{color:'#0f172a',fontWeight:600,margin:0}}>{t}</p></div>)}</div>}
        {tab==='mcq' && <div><h2 style={{color:'#0f172a'}}>MCQ Bank</h2>{['Cardiology','Medicine','Surgery'].map(s=><div key={s} style={{...card,textAlign:'center' as const}}><p style={{color:'#0f172a',fontWeight:700,margin:0}}>{s}</p></div>)}</div>}
        {(tab==='rad'||tab==='pro') && <div style={{textAlign:'center' as const,paddingTop:60}}><p style={{fontSize:48,margin:0}}>{tab==='rad'?'🩻':'⭐'}</p><h2 style={{color:'#0f172a'}}>{tab==='rad'?'Radiology':'PRO'}</h2></div>}
      </main>
      <nav style={{position:'fixed' as const,bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'rgba(255,255,255,0.9)',backdropFilter:'blur(44px)',WebkitBackdropFilter:'blur(44px)',display:'grid',gridTemplateColumns:'repeat(5,1fr)',padding:'8px 8px 20px',borderTop:'0.5px solid rgba(0,0,0,0.08)'}}>
        {[{id:'hub',icon:'🏥',label:'HUB'},{id:'lab',icon:'🔬',label:'LAB'},{id:'rad',icon:'🩻',label:'RAD'},{id:'mcq',icon:'❓',label:'MCQ'},{id:'pro',icon:'⭐',label:'PRO'}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column' as const,alignItems:'center',gap:2}}><span style={{fontSize:20}}>{t.icon}</span><span style={{fontSize:10,fontWeight:700,color:tab===t.id?'#0a84ff':'rgba(15,23,42,0.4)'}}>{t.label}</span></button>)}
      </nav>
    </div>
  )
}
