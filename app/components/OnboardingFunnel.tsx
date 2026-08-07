'use client'
import { useState } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', textPrimary:'#0F172A',
  textMuted:'#94A3B8', gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'

const SLIDES = [
  {
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    tag:'CLINICAL AI',
    title:'Your Virtual\nHospital',
    sub:'Real cases · Real decisions · Real learning',
    color:'#0D9488',
  },
  {
    img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    tag:'LIVE GLOBAL',
    title:'1,200+ Doctors\nOnline Now',
    sub:'Vote · Debate · Learn with physicians worldwide',
    color:'#1E40AF',
  },
  {
    img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    tag:'AI POWERED',
    title:'Evidence-Based\nAI Consultant',
    sub:'Claude AI · PubMed · FDA · Guidelines 2026',
    color:'#7C3AED',
  },
]

export default function OnboardingFunnel({ onComplete }:{ onComplete:(type?:string)=>void }) {
  const [idx, setIdx]       = useState(0)
  const [pressed, setPressed] = useState<string|null>(null)
  const slide = SLIDES[idx]
  const isLast = idx >= SLIDES.length

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9998,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
    }}>
      {/* Full Unsplash Hero */}
      <div style={{position:'absolute',inset:0}}>
        <img src={slide.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',transition:'all 0.5s ease'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.15) 0%,rgba(15,23,42,0.92) 60%,rgba(15,23,42,0.98) 100%)'}}/>
      </div>

      {/* Content */}
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'0 24px 60px'}}>

        {/* Progress dots */}
        <div style={{display:'flex',gap:6,marginBottom:28}}>
          {SLIDES.map((_,i)=>(
            <div key={i} style={{
              height:3, borderRadius:99,
              background:i<=idx?'white':'rgba(255,255,255,0.3)',
              flex:i===idx?2:1,
              transition:spring,
            }}/>
          ))}
        </div>

        {/* Tag */}
        <div style={{
          display:'inline-flex', alignSelf:'flex-start',
          background:`${slide.color}CC`, backdropFilter:'blur(12px)',
          borderRadius:99, padding:'4px 14px', marginBottom:16,
          fontSize:10, fontWeight:700, letterSpacing:1.5, color:'white',
        }}>{slide.tag}</div>

        {/* Title */}
        <div style={{
          fontSize:38, fontWeight:900, color:'white',
          letterSpacing:-1, lineHeight:1.15, marginBottom:14,
          whiteSpace:'pre-line',
        }}>{slide.title}</div>

        {/* Sub */}
        <div style={{fontSize:15,fontWeight:500,color:'rgba(255,255,255,0.75)',marginBottom:36,lineHeight:1.6}}>
          {slide.sub}
        </div>

        {idx < SLIDES.length-1 ? (
          <button onClick={()=>setIdx(i=>i+1)}
            onMouseDown={()=>setPressed('next')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%', padding:'17px', borderRadius:20, border:'none', cursor:'pointer',
              background:'rgba(255,255,255,0.95)', color:'#0F172A',
              fontSize:16, fontWeight:800,
              transform:pressed==='next'?'scale(0.97)':'scale(1)', transition:spring,
            }}>
            Next →
          </button>
        ) : idx === SLIDES.length-1 ? (
          /* Who are you screen */
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.7)',textAlign:'center',marginBottom:4,letterSpacing:1}}>WHO ARE YOU?</div>
            <button onClick={()=>setIdx(SLIDES.length)}
              onMouseDown={()=>setPressed('doc')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'17px',borderRadius:20,border:'none',cursor:'pointer',
                background:L.gradient,color:'white',fontSize:16,fontWeight:800,
                transform:pressed==='doc'?'scale(0.97)':'scale(1)',transition:spring,
                boxShadow:L.shadowGlow,display:'flex',alignItems:'center',justifyContent:'center',gap:10,
              }}>
              <span style={{fontSize:22}}>👨‍⚕️</span> I'm a Doctor / Medical Student
            </button>
            <button onClick={()=>onComplete('patient')}
              onMouseDown={()=>setPressed('pat')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'17px',borderRadius:20,cursor:'pointer',
                background:'rgba(255,255,255,0.15)',backdropFilter:'blur(20px)',
                border:'1px solid rgba(255,255,255,0.3)',
                color:'white',fontSize:16,fontWeight:700,
                transform:pressed==='pat'?'scale(0.97)':'scale(1)',transition:spring,
                display:'flex',alignItems:'center',justifyContent:'center',gap:10,
              }}>
              <span style={{fontSize:22}}>🏥</span> Patient / Family Member
            </button>
          </div>
        ) : (
          /* Paywall screen */
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{
              background:'rgba(255,255,255,0.12)',backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.2)',borderRadius:20,padding:'16px',
              marginBottom:4,
            }}>
              <div style={{fontSize:13,fontWeight:800,color:'rgba(255,255,255,0.6)',letterSpacing:1.5,marginBottom:12,textAlign:'center'}}>
                CLINIVERSE PRO
              </div>
              {['🌐 Global Nexus — live case voting','🧠 Clinical Pulse Room — daily quiz','💊 Drug Interaction Checker','🏆 Global Leaderboard','📄 PDF Clinical Logbook','🤖 AI Clinical Consultant'].map(f=>(
                <div key={f} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#10B981',flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>onComplete('doctor')}
              onMouseDown={()=>setPressed('pro')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'17px',borderRadius:20,border:'none',cursor:'pointer',
                background:L.gradient,color:'white',fontSize:16,fontWeight:800,
                transform:pressed==='pro'?'scale(0.97)':'scale(1)',transition:spring,
                boxShadow:L.shadowGlow,
              }}>
              🚀 Start PRO — $14.99/mo
            </button>
            <button onClick={()=>onComplete('doctor')}
              style={{
                width:'100%',padding:'14px',borderRadius:20,cursor:'pointer',
                background:'rgba(255,255,255,0.10)',border:'1px solid rgba(255,255,255,0.2)',
                color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,
              }}>
              Continue Free
            </button>
          </div>
        )}

        {/* Skip */}
        {!isLast && (
          <button onClick={()=>setIdx(SLIDES.length-1)} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600,
            marginTop:16, textAlign:'center',
          }}>
            Skip →
          </button>
        )}
      </div>
    </div>
  )
}
