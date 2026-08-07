'use client'
import { useEffect, useState } from 'react'

const VITALS = [
  { value:'47,284', label:'Doctors Online Now',    color:'#0D9488',
    ecg:'M0,20 L8,20 L12,4 L16,36 L20,12 L24,28 L28,20 L60,20' },
  { value:'1,847',  label:'Cases Solved Today',    color:'#1E40AF',
    ecg:'M0,20 L10,20 L14,8 L18,32 L22,14 L26,26 L30,20 L60,20' },
  { value:'63',     label:'Countries Learning',    color:'#10B981',
    ecg:'M0,20 L12,20 L16,6 L20,34 L24,10 L28,30 L32,20 L60,20' },
  { value:'94%',    label:'Clinical Accuracy',     color:'#7C3AED',
    ecg:'M0,20 L6,20 L10,2 L14,38 L18,8 L22,32 L26,20 L60,20' },
]

export default function SplashScreen({ onDone }:{ onDone:()=>void }) {
  const [vitalIdx, setVitalIdx] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const [pulse, setPulse]       = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(()=>{
    // Vitals animation — كل 400ms vital جديد
    const vitalsTimer = setInterval(()=>{
      setVitalIdx(i=>{
        if(i >= VITALS.length-1){ clearInterval(vitalsTimer); setShowLogo(true); return i }
        return i+1
      })
    }, 700)

    // Progress bar
    const prog = setInterval(()=>setProgress(p=>Math.min(p+0.8,100)), 30)

    // Pulse
    const pulseT = setInterval(()=>setPulse(p=>!p), 700)

    // Done
    const done = setTimeout(onDone, 2600)

    return ()=>{ clearInterval(vitalsTimer); clearInterval(prog); clearInterval(pulseT); clearTimeout(done) }
  },[])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
      overflow:'hidden',
    }}>
      {/* Unsplash Hospital BG */}
      <img
        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"
        alt=""
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}
      />
      {/* Gradient overlay */}
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.80) 50%, rgba(15,23,42,0.95) 100%)',
      }}/>

      {/* ECG line top */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,overflow:'hidden'}}>
        <div style={{
          height:'100%',
          width:`${progress}%`,
          background:'linear-gradient(90deg,#0D9488,#1E40AF)',
          transition:'width 0.035s linear',
          boxShadow:'0 0 12px rgba(13,148,136,0.8)',
        }}/>
      </div>

      {/* Content */}
      <div style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'0 32px',
      }}>

        {/* Vitals counter */}
        {!showLogo && (
          <div style={{
            textAlign:'center',
            animation:'fadeUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{marginBottom:20,position:'relative'}}>
              <svg width="120" height="40" viewBox="0 0 60 40" fill="none"
                style={{filter:`drop-shadow(0 0 8px ${VITALS[vitalIdx].color})`}}>
                <path
                  d={VITALS[vitalIdx].ecg}
                  stroke={VITALS[vitalIdx].color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="120"
                  strokeDashoffset={pulse ? 0 : 120}
                  style={{transition:'stroke-dashoffset 0.5s ease'}}
                />
              </svg>
            </div>
            <div style={{
              fontSize:58, fontWeight:900, color:'white',
              letterSpacing:-2, lineHeight:1,
              marginBottom:10,
              textShadow:`0 2px 20px ${VITALS[vitalIdx].color}80`,
              transition:'text-shadow 0.3s ease',
            }}>
              {VITALS[vitalIdx].value}
            </div>
            <div style={{
              fontSize:16, fontWeight:600,
              color:'rgba(255,255,255,0.75)',
              letterSpacing:0.5,
            }}>
              {VITALS[vitalIdx].label}
            </div>
          </div>
        )}

        {/* Logo — يظهر بعد الـ vitals */}
        {showLogo && (
          <div style={{
            textAlign:'center',
            animation:'fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Logo mark */}
            <div style={{
              width:88, height:88, borderRadius:28,
              background:'linear-gradient(135deg,#0D9488,#1E40AF)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px',
              boxShadow:`0 8px 40px rgba(13,148,136,0.50), 0 0 0 ${pulse?8:4}px rgba(13,148,136,0.15)`,
              transition:'box-shadow 0.6s ease',
            }}>
              <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
                <polyline
                  points="0,16 6,16 10,4 14,28 18,10 22,22 26,16 36,16 40,10 44,16 48,16"
                  stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>

            <div style={{
              fontSize:32, fontWeight:900, color:'white',
              letterSpacing:-0.8, marginBottom:6,
            }}>
              Cliniverse AI
            </div>
            <div style={{
              fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.55)',
              letterSpacing:3, textTransform:'uppercase',
            }}>
              Virtual Hospital · 2026
            </div>

            {/* Live indicator */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              marginTop:20,
              background:'rgba(16,185,129,0.15)', backdropFilter:'blur(12px)',
              border:'1px solid rgba(16,185,129,0.3)',
              borderRadius:99, padding:'6px 16px',
            }}>
              <div style={{
                width:7, height:7, borderRadius:'50%',
                background:'#10B981',
                boxShadow:pulse?'0 0 10px #10B981':'none',
                transition:'box-shadow 0.6s ease',
              }}/>
              <span style={{fontSize:12,fontWeight:700,color:'#10B981',letterSpacing:1}}>
                47,284 DOCTORS LIVE
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  )
}
