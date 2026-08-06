'use client'
import { useState, useEffect } from 'react'
import { L } from '../../lib/tokens'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

const HOSPITAL = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80'

interface Props {
  xp: number
  streak: number
  isPro: boolean
}

export function TodayCard({ xp, streak, isPro }: Props) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h = time.getHours()
  const shift = h<7?'🌙 Night Shift':h<12?'🌅 Morning Round':h<17?'☀️ Afternoon':h<21?'🌆 Evening':'🌙 Night Shift'
  const day = time.toLocaleDateString('en',{weekday:'long',day:'numeric',month:'short'})
  const timeStr = time.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})

  const vitals = [
    { icon:'🫀', value:'72', unit:'bpm',  label:'HEART RATE' },
    { icon:'🫁', value:'98', unit:'%',    label:'SpO₂' },
    { icon:'🌡️', value:'36.6', unit:'°C', label:'TEMP' },
    { icon:'🔥', value:String(streak), unit:'days', label:'STREAK' },
  ]

  return (
    <Card style={{ marginBottom:14, overflow:'hidden', borderRadius:24 }}>
      {/* Hero Image */}
      <div style={{
        position:'relative', height:180,
        backgroundImage:`url(${HOSPITAL})`,
        backgroundSize:'cover', backgroundPosition:'center',
      }}>
        {/* Gradient overlay */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(180deg, rgba(248,250,252,0.15) 0%, rgba(248,250,252,0.95) 100%)',
        }}/>

        {/* Top row */}
        <div style={{
          position:'absolute', top:14, left:16, right:16,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            background:'rgba(255,255,255,0.85)',
            backdropFilter:'blur(12px)',
            borderRadius:20, padding:'4px 12px',
            border:'1px solid rgba(255,255,255,0.60)',
          }}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#EF4444',animation:'pulse 1.5s infinite'}}/>
            <span style={{fontSize:10,fontWeight:700,color:'#EF4444'}}>LIVE</span>
            <span style={{fontSize:10,color:L.textMuted}}>1,247 online</span>
          </div>

          {/* Avatar */}
          <div style={{
            width:38,height:38,borderRadius:'50%',
            background:L.gradPrimary,
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'white',fontSize:14,fontWeight:800,
            boxShadow:L.shadowMd,
            border:'2px solid white',
          }}>DA</div>
        </div>

        {/* Bottom text */}
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:20,fontWeight:800,color:L.text,letterSpacing:-0.5}}>{day}</div>
          <div style={{fontSize:12,color:L.textSub,marginTop:2}}>{timeStr} · {shift}</div>
        </div>
      </div>

      {/* Vitals row */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        gap:8, padding:'14px 14px 0',
      }}>
        {vitals.map(v => (
          <div key={v.label} style={{
            background:L.raised,
            border:`1px solid ${L.border}`,
            borderRadius:16, padding:'10px 8px',
            textAlign:'center',
          }}>
            <div style={{fontSize:18,marginBottom:3}}>{v.icon}</div>
            <div style={{fontSize:16,fontWeight:800,color:L.text,lineHeight:1}}>{v.value}</div>
            <div style={{fontSize:8,color:L.textMuted,marginTop:2,letterSpacing:0.5}}>{v.unit}</div>
            <div style={{fontSize:7,color:L.textMuted,letterSpacing:0.8}}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px 14px 14px',
      }}>
        <span style={{fontSize:12,color:L.textMuted}}>Connect Watch →</span>
        <div style={{
          background:L.gradPrimary,
          borderRadius:20, padding:'5px 14px',
          fontSize:12, fontWeight:800, color:'white',
          boxShadow:L.shadowSm,
        }}>⚡ {xp} XP</div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </Card>
  )
}
