'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes ecgDraw {
    0%   { stroke-dashoffset: 200; opacity:0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity:0; }
  }
  @keyframes liveBlink {
    0%,100%{ opacity:1; } 50%{ opacity:0.3; }
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(8px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes pulse {
    0%,100%{transform:scale(1);} 50%{transform:scale(1.08);}
  }
  @keyframes ticker {
    0%{transform:translateX(0);} 100%{transform:translateX(-50%);}
  }
`

interface Props {
  doctorName: string
  xp: number
  streak: number
  liveCount?: number
  isPro?: boolean
}

// ── ECG LINE ──
function ECGStrip() {
  return (
    <svg width="100%" height="28" viewBox="0 0 300 28" preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',bottom:0,left:0,right:0,opacity:0.14}}>
      <defs>
        <linearGradient id="ecgG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00C8B8" stopOpacity="0"/>
          <stop offset="20%"  stopColor="#00C8B8"/>
          <stop offset="80%"  stopColor="#00C8B8"/>
          <stop offset="100%" stopColor="#00C8B8" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline
        points="0,14 30,14 45,14 55,14 62,2 68,26 74,8 80,20 86,14 120,14 135,14 142,14 149,2 155,26 161,8 167,20 173,14 210,14 225,14 232,14 239,2 245,26 251,8 257,20 263,14 300,14"
        fill="none" stroke="url(#ecgG)" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="200" strokeDashoffset="200"
      >
        <animate attributeName="stroke-dashoffset" values="200;0;200" dur="3s"
          repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;0.9;0" dur="3s" repeatCount="indefinite"/>
      </polyline>
    </svg>
  )
}

// ── VITAL SIGN CHIP ──
function VitalChip({ icon, value, unit, label, color, pulse: doPulse }:
  { icon:string, value:string|number, unit:string, label:string, color:string, pulse?:boolean }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      background:'var(--bg-card,rgba(255,255,255,0.05))',
      border:`1px solid ${color}22`,
      borderRadius:14, padding:'7px 10px',
      minWidth:62, gap:2,
      animation: doPulse ? 'pulse 1.8s ease-in-out infinite' : 'none',
    }}>
      <div style={{fontSize:14}}>{icon}</div>
      <div style={{display:'flex',alignItems:'baseline',gap:2}}>
        <span style={{fontSize:14,fontWeight:900,color,letterSpacing:-0.5}}>{value}</span>
        <span style={{fontSize:8,color:`${color}90`,fontWeight:600}}>{unit}</span>
      </div>
      <div style={{fontSize:7,color:'rgba(242,248,252,0.38)',fontWeight:600,letterSpacing:0.5}}>{label}</div>
    </div>
  )
}

export default function HealthStatusHeader({ doctorName, xp, streak, liveCount = 1247, isPro = false }: Props) {
  const [heartRate, setHeartRate] = useState(72)
  const [spo2]      = useState(98)
  const [temp]      = useState(36.6)
  const [time, setTime] = useState(new Date())
  const [live, setLive] = useState(liveCount)

  // Simulate live heart rate
  useEffect(() => {
    const t1 = setInterval(() => {
      setHeartRate(h => Math.max(62, Math.min(84, h + Math.floor(Math.random()*5)-2)))
    }, 2000)
    const t2 = setInterval(() => {
      setLive(n => Math.max(1000, Math.min(1600, n + Math.floor(Math.random()*5)-2)))
      setTime(new Date())
    }, 3000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const dayName = time.toLocaleDateString('en-GB', { weekday:'short' })
  const dateStr = time.toLocaleDateString('en-GB', { day:'numeric', month:'short' })
  const timeStr = time.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })

  // Doctor initials for avatar
  const initials = doctorName.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() || 'DR'

  return (
    <div style={{
      position:'relative', overflow:'hidden',
      background:'linear-gradient(135deg,rgba(0,200,184,0.06),rgba(26,140,255,0.04))',
      border:'1px solid rgba(0,200,184,0.16)',
      borderRadius:22, padding:'14px 16px 18px',
      marginBottom:14, fontFamily:F,
    }}>
      <ECGStrip/>

      {/* ── ROW 1: Date + Time + Doctor Avatar ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,position:'relative',zIndex:1}}>

        {/* Left: Date + Time */}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#FF453A',animation:'liveBlink 1.4s ease-in-out infinite'}}/>
            <span style={{fontSize:9,fontWeight:800,color:'#FF453A',letterSpacing:1}}>LIVE</span>
            <span style={{fontSize:9,color:'var(--text-muted, rgba(242,248,252,0.40))',marginLeft:2}}>{live.toLocaleString()} active</span>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:'rgba(242,248,252,0.85)',letterSpacing:-0.2}}>
            {dayName}, {dateStr}
          </div>
          <div style={{fontSize:11,color:'var(--text-muted, rgba(242,248,252,0.45))',fontWeight:500,letterSpacing:0.5}}>
            {timeStr} · {isPro ? '⭐ Pro' : 'Free'}
          </div>
        </div>

        {/* Right: Doctor Avatar + Name */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
          {/* Avatar circle */}
          <div style={{
            width:44,height:44,borderRadius:'50%',
            background:'linear-gradient(135deg,rgba(0,200,184,0.20),rgba(26,140,255,0.15))',
            border:'2px solid rgba(0,200,184,0.35)',
            display:'flex',alignItems:'center',justifyContent:'center',
            position:'relative',
          }}>
            {/* Mini logo ring */}
            <svg width="44" height="44" viewBox="0 0 44 44" style={{position:'absolute',inset:0}}>
              <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(0,200,184,0.20)" strokeWidth="1"/>
            </svg>
            <span style={{fontSize:13,fontWeight:900,color:'#00C8B8',letterSpacing:-0.5,fontFamily:F}}>{initials}</span>
          </div>
          {/* Name — small elegant */}
          <div style={{
            fontSize:9,fontWeight:700,color:'rgba(242,248,252,0.65)',
            letterSpacing:0.8,textAlign:'center',
            maxWidth:70,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
          }}>
            {doctorName.split(' ').slice(-1)[0]}
          </div>
          {/* XP badge */}
          <div style={{
            background:'rgba(255,214,10,0.12)',border:'1px solid rgba(255,214,10,0.22)',
            borderRadius:8,padding:'2px 7px',fontSize:8,color:'#FFD60A',fontWeight:800,
          }}>⚡ {xp} XP</div>
        </div>
      </div>

      {/* ── ROW 2: Vitals Strip ── */}
      <div style={{display:'flex',gap:7,position:'relative',zIndex:1}}>
        <VitalChip icon="🫀" value={heartRate} unit="bpm"  label="HEART RATE" color="#FF453A" pulse/>
        <VitalChip icon="🫁" value={spo2}      unit="%"    label="SpO₂"       color="#30D158"/>
        <VitalChip icon="🌡️" value={temp}      unit="°C"   label="TEMP"       color="#FF9F0A"/>
        <div style={{
          flex:1,display:'flex',flexDirection:'column',justifyContent:'center',
          background:'rgba(0,200,184,0.06)',border:'1px solid rgba(0,200,184,0.18)',
          borderRadius:14,padding:'7px 10px',gap:3,
        }}>
          <div style={{fontSize:7,color:'rgba(242,248,252,0.38)',fontWeight:700,letterSpacing:1}}>STREAK</div>
          <div style={{fontSize:16,fontWeight:900,color:'#FF9F0A'}}>🔥 {streak}</div>
          <div style={{fontSize:7,color:'rgba(242,248,252,0.38)',fontWeight:600}}>DAYS</div>
        </div>
      </div>

      {/* ── ROW 3: Ticker ── */}
      <div style={{marginTop:12,overflow:'hidden',borderRadius:8,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'5px 0',position:'relative',zIndex:1}}>
        <div style={{display:'flex',animation:'ticker 18s linear infinite',width:'max-content'}}>
          {[...Array(2)].map((_,ri)=>(
            <div key={ri} style={{display:'flex'}}>
              {[
                {k:'CASES',  v:`${xp>0?Math.floor(xp/10):0} done`,  c:'#00C8B8'},
                {k:'BOARD',  v:'Saudi·USMLE·MRCP',                    c:'#BF5AF2'},
                {k:'AI',     v:'Ambient Scribe',                       c:'#1A8CFF'},
                {k:'FHIR',   v:'EHR connected',                        c:'#30D158'},
                {k:'WATCH',  v:'Apple Watch ready',                    c:'#FF9F0A'},
              ].map((it,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:4,padding:'0 16px',flexShrink:0}}>
                  <span style={{fontSize:8,color:'rgba(242,248,252,0.32)',fontWeight:700,letterSpacing:1}}>{it.k}</span>
                  <span style={{fontSize:9,color:it.c,fontWeight:800}}>{it.v}</span>
                  <span style={{color:'rgba(255,255,255,0.10)',marginLeft:2}}>·</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{CSS}</style>
    </div>
  )
}
