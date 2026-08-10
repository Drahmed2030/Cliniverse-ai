'use client'
import { useState, useEffect } from 'react'

const L = {
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.35)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'

const SLIDES = [
  {
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    tag:'VIRTUAL HOSPITAL',
    title:'Train Like You\nAre On Call',
    sub:'Real emergency cases · AI-powered decisions · Evidence-based learning used by 47,000+ physicians',
    color:'#0D9488',
  },
  {
    img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    tag:'LIVE GLOBAL · 63 COUNTRIES',
    title:'Compete with\nDoctors Worldwide',
    sub:'Vote on live cases · Debate clinical decisions · Rise on the global leaderboard in real-time',
    color:'#1E40AF',
  },
  {
    img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    tag:'MRCP · USMLE · FRCP',
    title:'Ace Your\nBoard Exams',
    sub:'Daily MCQs · Clinical Pulse Room · 500+ exam-style questions across all specialties and systems',
    color:'#7C3AED',
  },
  {
    img:'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80',
    tag:'AI CONSULTANT · CLAUDE AI',
    title:'Evidence-Based\nAI at Your Side',
    sub:'PubMed live · FDA drug database · ESC/AHA/ADA Guidelines 2026 — instant clinical answers',
    color:'#0D9488',
  },
  {
    img:'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80',
    tag:'AFIA · عافية · HEALTH FOR ALL',
    title:'For Your Family\nNot Just Doctors',
    sub:'Mother & child health · Patient guide · Pharmacy · Nutrition — intelligent health for everyone',
    color:'#10B981',
  },
]

export default function OnboardingFunnel({ onComplete }:{ onComplete:(type?:string)=>void }) {
  const [idx, setIdx]         = useState(0)
  const [pressed, setPressed] = useState<string|null>(null)
  const [touching, setTouching] = useState(false)
  const [touchX, setTouchX]   = useState(0)

  // Auto-advance كل 4 ثوانٍ مثل Instagram Story
  useEffect(()=>{
    if(idx >= SLIDES.length) return
    const t = setTimeout(()=>{
      if(idx < SLIDES.length-1) setIdx(i=>i+1)
    }, 4000)
    return ()=>clearTimeout(t)
  },[idx])

  // Swipe gestures
  const onTouchStart = (e:any) => { setTouching(true); setTouchX(e.touches[0].clientX) }
  const onTouchEnd   = (e:any) => {
    if(!touching) return
    const dx = e.changedTouches[0].clientX - touchX
    if(dx < -50 && idx < SLIDES.length-1) setIdx(i=>i+1)
    if(dx > 50  && idx > 0)               setIdx(i=>i-1)
    setTouching(false)
  }

  // Tap left/right للتنقل
  const handleTap = (e:any) => {
    if(idx >= SLIDES.length) return
    const x = e.clientX
    const w = window.innerWidth
    if(x < w/3 && idx > 0)               setIdx(i=>i-1)
    else if(x > w*2/3 && idx < SLIDES.length-1) setIdx(i=>i+1)
  }

  const slide = SLIDES[Math.min(idx, SLIDES.length-1)]

  // شاشة Who Are You؟ — محسّنة
  if(idx === SLIDES.length) return (
    <div style={{
      position:'fixed', inset:0, zIndex:9998,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
      overflowY:'auto',
    }}>
      {/* Hero Background */}
      <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
        alt="" style={{position:'fixed',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0}}/>
      <div style={{position:'fixed',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.3) 0%,rgba(15,23,42,0.97) 50%)',zIndex:1}}/>

      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',minHeight:'100dvh',padding:'0 24px 48px'}}>
        {/* Top badge */}
        <div style={{paddingTop:60,textAlign:'center'}}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:8,
            background:'rgba(13,148,136,0.25)',border:'1px solid rgba(13,148,136,0.4)',
            borderRadius:99,padding:'6px 16px',marginBottom:24,
          }}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#0D9488',boxShadow:'0 0 8px #0D9488'}}/>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.9)',fontWeight:600,letterSpacing:1}}>PERSONALIZE YOUR EXPERIENCE</span>
          </div>
          <div style={{fontSize:36,fontWeight:900,color:'white',letterSpacing:-1,lineHeight:1.1,marginBottom:10}}>
            Choose Your Path
          </div>
          <div style={{fontSize:15,color:'rgba(255,255,255,0.6)',marginBottom:32}}>
            Cliniverse adapts to who you are
          </div>
        </div>

        {/* Cards */}
        <div style={{display:'flex',flexDirection:'column',gap:12,flex:1,justifyContent:'center'}}>

          {/* Doctor */}
          <button onClick={()=>onComplete('doctor')}
            onMouseDown={()=>setPressed('doc')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'18px 20px',borderRadius:22,border:'2px solid rgba(255,255,255,0.15)',
              cursor:'pointer',background:'linear-gradient(135deg,rgba(13,148,136,0.5),rgba(30,64,175,0.5))',
              backdropFilter:'blur(20px)',color:'white',
              transform:pressed==='doc'?'scale(0.97)':'scale(1)',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow:pressed==='doc'?'none':'0 8px 32px rgba(13,148,136,0.35)',
              display:'flex',alignItems:'center',gap:16,textAlign:'left',
            }}>
            <div style={{
              width:52,height:52,borderRadius:16,flexShrink:0,
              background:'linear-gradient(135deg,#0D9488,#1E40AF)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
            }}>👨‍⚕️</div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Doctor / Medical Student</div>
              <div style={{fontSize:12,opacity:0.75,fontWeight:500,lineHeight:1.5}}>Clinical cases · Oracle AI · Board prep · Global room</div>
            </div>
            <div style={{fontSize:18,opacity:0.6}}>›</div>
          </button>

          {/* Patient */}
          <button onClick={()=>onComplete('patient')}
            onMouseDown={()=>setPressed('pat')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'18px 20px',borderRadius:22,cursor:'pointer',
              background:'rgba(255,255,255,0.10)',backdropFilter:'blur(20px)',
              border:'2px solid rgba(255,255,255,0.2)',
              color:'white',
              transform:pressed==='pat'?'scale(0.97)':'scale(1)',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              display:'flex',alignItems:'center',gap:16,textAlign:'left',
            }}>
            <div style={{
              width:52,height:52,borderRadius:16,flexShrink:0,
              background:'linear-gradient(135deg,rgba(16,185,129,0.6),rgba(13,148,136,0.6))',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
            }}>🏥</div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Patient / Family Member</div>
              <div style={{fontSize:12,opacity:0.7,fontWeight:500,lineHeight:1.5}}>AI Health guide · Symptoms · Medications · Nutrition</div>
            </div>
            <div style={{fontSize:18,opacity:0.6}}>›</div>
          </button>

          {/* General Public */}
          <button onClick={()=>onComplete('patient')}
            onMouseDown={()=>setPressed('pub')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'16px 20px',borderRadius:22,cursor:'pointer',
              background:'rgba(255,255,255,0.07)',backdropFilter:'blur(20px)',
              border:'1.5px solid rgba(255,255,255,0.15)',
              color:'white',
              transform:pressed==='pub'?'scale(0.97)':'scale(1)',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              display:'flex',alignItems:'center',gap:16,textAlign:'left',
            }}>
            <div style={{
              width:46,height:46,borderRadius:14,flexShrink:0,
              background:'rgba(99,102,241,0.4)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
            }}>🌍</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>General Public</div>
              <div style={{fontSize:12,opacity:0.65,fontWeight:500}}>Wellness · Travel health · Mental health · Fitness</div>
            </div>
            <div style={{fontSize:18,opacity:0.4}}>›</div>
          </button>

          {/* Medical Student / Nurse */}
          <button onClick={()=>onComplete('doctor')}
            onMouseDown={()=>setPressed('nur')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'16px 20px',borderRadius:22,cursor:'pointer',
              background:'rgba(255,255,255,0.07)',backdropFilter:'blur(20px)',
              border:'1.5px solid rgba(255,255,255,0.15)',
              color:'white',
              transform:pressed==='nur'?'scale(0.97)':'scale(1)',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              display:'flex',alignItems:'center',gap:16,textAlign:'left',
            }}>
            <div style={{
              width:46,height:46,borderRadius:14,flexShrink:0,
              background:'rgba(245,158,11,0.35)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
            }}>📚</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>Medical Student / Nurse</div>
              <div style={{fontSize:12,opacity:0.65,fontWeight:500}}>Clinical training · MCQs · Board exam prep</div>
            </div>
            <div style={{fontSize:18,opacity:0.4}}>›</div>
          </button>

        </div>

        {/* Footer */}
        <div style={{textAlign:'center',paddingTop:24}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',lineHeight:1.6}}>
            🔒 Your choice is saved locally · No account required to explore
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:9998,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={handleTap}
    >
      {/* Unsplash Hero */}
      <img src={slide.img} alt=""
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transition:'all 0.5s ease'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1) 0%,rgba(15,23,42,0.95) 65%)'}}/>

      {/* Story progress bars */}
      <div style={{position:'absolute',top:16,left:16,right:16,display:'flex',gap:4,zIndex:10}}>
        {SLIDES.map((_,i)=>(
          <div key={i} style={{flex:1,height:3,borderRadius:99,background:'rgba(255,255,255,0.3)',overflow:'hidden'}}>
            <div style={{
              height:'100%',borderRadius:99,background:'white',
              width: i < idx ? '100%' : i === idx ? '100%' : '0%',
              transition: i === idx ? 'width 4s linear' : 'none',
            }}/>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 24px 60px'}}>
        {/* Tag */}
        <div style={{
          display:'inline-flex',
          background:`${slide.color}CC`,backdropFilter:'blur(12px)',
          borderRadius:99,padding:'5px 14px',marginBottom:16,
          fontSize:10,fontWeight:800,letterSpacing:1.5,color:'white',
        }}>{slide.tag}</div>

        {/* Title */}
        <div style={{
          fontSize:40,fontWeight:900,color:'white',
          letterSpacing:-1.2,lineHeight:1.1,marginBottom:14,
          whiteSpace:'pre-line',
        }}>{slide.title}</div>

        {/* Sub */}
        <div style={{fontSize:15,fontWeight:500,color:'rgba(255,255,255,0.72)',lineHeight:1.65,marginBottom:36}}>
          {slide.sub}
        </div>

        {/* Buttons */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <button
            onClick={e=>{e.stopPropagation(); setIdx(SLIDES.length)}}
            onMouseDown={()=>setPressed('start')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'17px',borderRadius:20,border:'none',cursor:'pointer',
              background:'rgba(255,255,255,0.95)',color:'#0F172A',
              fontSize:16,fontWeight:800,
              transform:pressed==='start'?'scale(0.97)':'scale(1)',transition:spring,
            }}>
            Get Started →
          </button>
          {idx < SLIDES.length-1 && (
            <button onClick={e=>{e.stopPropagation(); setIdx(SLIDES.length)}} style={{
              background:'none',border:'none',cursor:'pointer',
              color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:600,textAlign:'center',padding:'6px',
            }}>
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
