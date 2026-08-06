'use client'
import { useState, useEffect, useRef } from 'react'
import { L } from '../lib/tokens'

const TABS = [
  { id:'pulse', label:'Today',  icon:'⚡' },
  { id:'ward',  label:'Clinic', icon:'🏥' },
  { id:'tools', label:'Tools',  icon:'🔬' },
  { id:'me',    label:'Me',     icon:'👤' },
]

export default function FloatingNav({ tab, setTab }: { tab:string, setTab:(t:string)=>void }) {
  const [visible, setVisible] = useState(true)
  const [dot, setDot] = useState(false)
  const lastY = useRef(0)
  const timer = useRef<any>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const down = y > lastY.current
      lastY.current = y
      if (down && y > 80) { setVisible(false); setDot(true) }
      else { setVisible(true); setDot(false) }
      clearTimeout(timer.current)
      timer.current = setTimeout(() => { setVisible(true); setDot(false) }, 2500)
    }
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const active = TABS.find(t =>
    t.id === tab ||
    (t.id === 'pulse' && tab === 'hub') ||
    (t.id === 'ward'  && tab === 'net') ||
    (t.id === 'me'    && tab === 'profile')
  )?.id || 'pulse'

  return (
    <>
      {/* FLOATING PILL */}
      <div style={{
        position:'fixed', bottom:32, left:'50%',
        transform:`translateX(-50%) translateY(${visible?'0':'110px'})`,
        opacity: visible ? 1 : 0,
        transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        zIndex:1000,
      }}>
        <div style={{
          display:'flex', alignItems:'center',
          background:'rgba(255,255,255,0.88)',
          backdropFilter:'blur(40px) saturate(200%)',
          WebkitBackdropFilter:'blur(40px) saturate(200%)',
          border:`1px solid ${L.border}`,
          borderRadius:50,
          padding:'5px 6px',
          gap:3,
          boxShadow:`${L.shadowLg}, 0 0 0 1px rgba(13,148,136,0.08)`,
        }}>
          {TABS.map(t => {
            const isActive = t.id === active
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:3, border:'none', cursor:'pointer',
                borderRadius:44,
                padding: isActive ? '9px 22px' : '9px 16px',
                minWidth: isActive ? 84 : 52,
                background: isActive ? L.gradPrimary : 'transparent',
                boxShadow: isActive ? L.shadowMd : 'none',
                transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <span style={{fontSize:18, lineHeight:1}}>{t.icon}</span>
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:0.3,
                  fontFamily:L.font,
                  color: isActive ? 'white' : L.textMuted,
                  transition:'color 0.2s',
                }}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* DOT */}
      {dot && (
        <div onClick={() => { setVisible(true); setDot(false) }} style={{
          position:'fixed', bottom:40, left:'50%',
          transform:'translateX(-50%)',
          width:40, height:5, borderRadius:5,
          background:`rgba(13,148,136,0.40)`,
          border:`1px solid rgba(13,148,136,0.20)`,
          cursor:'pointer', zIndex:1000,
          boxShadow:L.glowTeal,
          transition:'all 0.3s ease',
        }}/>
      )}

      <div style={{height:130}}/>
    </>
  )
}
