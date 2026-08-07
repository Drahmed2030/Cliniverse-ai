'use client'
import { useState, useEffect } from 'react'

const L = {
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981',
  border:'#E2E8F0', textMuted:'#94A3B8', surface:'#FFFFFF',
  raised:'#F1F5F9', shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
}

// بيانات الدول — iso code + إحداثيات تقريبية على الـ SVG viewBox 0 0 1000 500
const COUNTRY_POSITIONS: Record<string,{x:number,y:number,flag:string}> = {
  'SA': {x:580, y:265, flag:'🇸🇦'},
  'AE': {x:595, y:270, flag:'🇦🇪'},
  'GB': {x:460, y:175, flag:'🇬🇧'},
  'US': {x:200, y:220, flag:'🇺🇸'},
  'EG': {x:545, y:265, flag:'🇪🇬'},
  'IN': {x:650, y:270, flag:'🇮🇳'},
  'DE': {x:490, y:185, flag:'🇩🇪'},
  'FR': {x:470, y:195, flag:'🇫🇷'},
  'CA': {x:175, y:185, flag:'🇨🇦'},
  'AU': {x:750, y:360, flag:'🇦🇺'},
  'BR': {x:295, y:330, flag:'🇧🇷'},
  'JP': {x:755, y:215, flag:'🇯🇵'},
  'CN': {x:710, y:220, flag:'🇨🇳'},
  'KW': {x:585, y:258, flag:'🇰🇼'},
  'QA': {x:590, y:263, flag:'🇶🇦'},
  'JO': {x:562, y:250, flag:'🇯🇴'},
  'TR': {x:545, y:215, flag:'🇹🇷'},
  'PK': {x:635, y:248, flag:'🇵🇰'},
  'ZA': {x:530, y:380, flag:'🇿🇦'},
  'NG': {x:490, y:295, flag:'🇳🇬'},
}

const COUNTRY_CODES = Object.keys(COUNTRY_POSITIONS)

interface VoteDot {
  id: string
  x: number
  y: number
  flag: string
  color: string
  opacity: number
}

interface WorldMapProps {
  votes?: Record<string, number>  // country_code -> vote count
  accentColor?: string
  height?: number
  title?: string
  liveCount?: number
}

export default function WorldMap({
  votes = {},
  accentColor = L.teal,
  height = 200,
  title = 'Global Votes',
  liveCount = 0,
}: WorldMapProps) {
  const [dots, setDots] = useState<VoteDot[]>([])
  const [pulse, setPulse] = useState(true)

  useEffect(()=>{
    const t = setInterval(()=>setPulse(p=>!p), 800)
    return ()=>clearInterval(t)
  },[])

  // إضافة dot عند كل تصويت جديد
  useEffect(()=>{
    const entries = Object.entries(votes)
    if(entries.length===0) return
    const newDots: VoteDot[] = entries
      .filter(([code])=>COUNTRY_POSITIONS[code])
      .map(([code, count])=>{
        const pos = COUNTRY_POSITIONS[code]
        return {
          id: code,
          x: pos.x,
          y: pos.y,
          flag: pos.flag,
          color: accentColor,
          opacity: Math.min(0.9, 0.3 + count * 0.1),
        }
      })
    setDots(newDots)
  },[votes, accentColor])

  // Random live animation
  useEffect(()=>{
    const t = setInterval(()=>{
      const code = COUNTRY_CODES[Math.floor(Math.random()*COUNTRY_CODES.length)]
      const pos = COUNTRY_POSITIONS[code]
      const tempDot: VoteDot = {
        id: `live_${Date.now()}`,
        x: pos.x, y: pos.y,
        flag: pos.flag,
        color: accentColor,
        opacity: 0.6,
      }
      setDots(prev=>{
        const filtered = prev.filter(d=>!d.id.startsWith('live_'))
        return [...filtered, tempDot]
      })
      setTimeout(()=>{
        setDots(prev=>prev.filter(d=>d.id!==tempDot.id))
      }, 2000)
    }, 1500)
    return ()=>clearInterval(t)
  },[accentColor])

  const totalVotes = Object.values(votes).reduce((a,b)=>a+b,0)

  return (
    <div style={{
      background:L.surface, border:`1px solid ${L.border}`,
      borderRadius:20, overflow:'hidden', boxShadow:L.shadowSm,
    }}>
      {/* Header */}
      <div style={{padding:'12px 16px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted}}>{title.toUpperCase()}</div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{
            width:7,height:7,borderRadius:'50%',
            background:pulse?L.sage:'rgba(16,185,129,0.2)',
            boxShadow:pulse?`0 0 8px ${L.sage}`:'none',
            transition:'all 0.3s ease',
          }}/>
          <span style={{fontSize:11,fontWeight:700,color:L.sage}}>
            {liveCount || totalVotes} LIVE
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <div style={{position:'relative', height, padding:'8px 12px'}}>
        <svg
          viewBox="0 0 1000 500"
          style={{width:'100%',height:'100%'}}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* World continents — simplified paths */}
          {/* North America */}
          <path d="M 80 120 Q 120 100 180 130 Q 220 140 260 170 Q 280 200 270 240 Q 250 280 230 300 Q 200 320 180 310 Q 150 300 130 280 Q 100 250 90 220 Q 75 180 80 120 Z"
            fill={`${accentColor}08`} stroke={`${accentColor}20`} strokeWidth="1"/>
          {/* South America */}
          <path d="M 220 300 Q 260 290 290 310 Q 320 340 330 380 Q 320 420 290 440 Q 260 450 240 430 Q 210 400 200 360 Q 195 330 220 300 Z"
            fill={`${accentColor}08`} stroke={`${accentColor}20`} strokeWidth="1"/>
          {/* Europe */}
          <path d="M 440 140 Q 480 130 520 150 Q 540 170 530 200 Q 510 220 480 210 Q 450 200 440 180 Q 430 160 440 140 Z"
            fill={`${accentColor}08`} stroke={`${accentColor}20`} strokeWidth="1"/>
          {/* Africa */}
          <path d="M 460 220 Q 510 210 550 230 Q 580 260 580 300 Q 570 360 540 400 Q 510 420 480 410 Q 450 390 440 350 Q 430 300 440 260 Q 445 235 460 220 Z"
            fill={`${accentColor}08`} stroke={`${accentColor}20`} strokeWidth="1"/>
          {/* Asia */}
          <path d="M 540 130 Q 620 110 720 130 Q 790 150 810 200 Q 800 250 760 260 Q 700 270 640 250 Q 580 230 555 200 Q 535 170 540 130 Z"
            fill={`${accentColor}08`} stroke={`${accentColor}20`} strokeWidth="1"/>
          {/* Middle East */}
          <path d="M 545 230 Q 580 220 610 235 Q 625 255 615 275 Q 595 285 570 278 Q 548 265 545 248 Q 543 238 545 230 Z"
            fill={`${accentColor}12`} stroke={`${accentColor}30`} strokeWidth="1"/>
          {/* Australia */}
          <path d="M 710 330 Q 760 320 800 340 Q 820 370 800 400 Q 770 420 730 410 Q 700 390 700 360 Q 700 340 710 330 Z"
            fill={`${accentColor}08`} stroke={`${accentColor}20`} strokeWidth="1"/>

          {/* Vote dots */}
          {dots.map(dot=>(
            <g key={dot.id}>
              {/* Pulse ring */}
              <circle
                cx={dot.x} cy={dot.y} r="14"
                fill="none"
                stroke={dot.color}
                strokeWidth="1"
                opacity={dot.opacity * 0.4}
              >
                <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values={`${dot.opacity*0.4};0;${dot.opacity*0.4}`} dur="2s" repeatCount="indefinite"/>
              </circle>
              {/* Main dot */}
              <circle
                cx={dot.x} cy={dot.y} r="5"
                fill={dot.color}
                opacity={dot.opacity}
              >
                <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              {/* Glow */}
              <circle
                cx={dot.x} cy={dot.y} r="3"
                fill="white"
                opacity={dot.opacity * 0.6}
              />
            </g>
          ))}

          {/* Connection lines between active dots */}
          {dots.slice(0,3).map((dot,i)=>
            dots.slice(i+1,i+2).map(dot2=>(
              <line
                key={`${dot.id}-${dot2.id}`}
                x1={dot.x} y1={dot.y}
                x2={dot2.x} y2={dot2.y}
                stroke={accentColor}
                strokeWidth="0.5"
                opacity="0.15"
                strokeDasharray="4 4"
              />
            ))
          )}
        </svg>

        {/* Country flags overlay */}
        <div style={{
          position:'absolute', bottom:8, left:12, right:12,
          display:'flex', flexWrap:'wrap', gap:4,
        }}>
          {Object.entries(votes).slice(0,8).map(([code])=>(
            COUNTRY_POSITIONS[code] && (
              <span key={code} style={{fontSize:14, filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.15))'}}>
                {COUNTRY_POSITIONS[code].flag}
              </span>
            )
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display:'flex', gap:0,
        borderTop:`1px solid ${L.border}`,
      }}>
        {[
          {label:'Countries', value:`${Math.max(Object.keys(votes).length, 28)}+`},
          {label:'Votes',     value:totalVotes || liveCount},
          {label:'Live Now',  value:`${liveCount || totalVotes}+`},
        ].map((s,i)=>(
          <div key={s.label} style={{
            flex:1, padding:'10px 0', textAlign:'center',
            borderRight: i<2 ? `1px solid ${L.border}` : 'none',
          }}>
            <div style={{fontSize:16,fontWeight:900,color:accentColor}}>{s.value}</div>
            <div style={{fontSize:9,fontWeight:700,color:L.textMuted,marginTop:1,letterSpacing:0.5}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
