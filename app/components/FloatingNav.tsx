'use client'
import { useState, useEffect, useRef } from 'react'
import { C, A } from '../lib/ds'
import { Icons } from '../lib/icons'

const TABS = [
  { id:'pulse', label:'Today',  Icon: Icons.pulse },
  { id:'ward',  label:'Clinic', Icon: Icons.ward  },
  { id:'tools', label:'Tools',  Icon: Icons.tools },
  { id:'me',    label:'Me',     Icon: Icons.me    },
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
    (t.id === 'pulse' && (tab === 'hub')) ||
    (t.id === 'ward'  && tab === 'net') ||
    (t.id === 'me'    && tab === 'profile')
  )?.id || 'pulse'

  return (
    <>
      <div style={{
        position:'fixed', bottom:36, left:'50%',
        transform:`translateX(-50%) translateY(${visible?'0':'110px'})`,
        opacity: visible ? 1 : 0,
        transition: A.spring,
        zIndex:1000,
      }}>
        <div style={{
          display:'flex', alignItems:'center',
          background:'rgba(13,21,32,0.94)',
          backdropFilter:'blur(40px) saturate(200%)',
          WebkitBackdropFilter:'blur(40px) saturate(200%)',
          border:'1px solid rgba(255,255,255,0.10)',
          borderRadius:50, padding:'5px 6px', gap:2,
          boxShadow:'0 8px 40px rgba(0,0,0,0.70), 0 0 0 1px rgba(0,210,200,0.06)',
        }}>
          {TABS.map(t => {
            const isActive = t.id === active
            const iconColor = isActive ? 'white' : 'rgba(240,248,255,0.35)'
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:3, border:'none', cursor:'pointer',
                borderRadius:44,
                padding: isActive ? '9px 22px' : '9px 16px',
                minWidth: isActive ? 84 : 52,
                background: isActive ? C.gradPrimary : 'transparent',
                boxShadow: isActive ? '0 4px 20px rgba(0,210,200,0.40)' : 'none',
                transition: A.spring,
              }}>
                <t.Icon color={iconColor} size={20}/>
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:0.3,
                  fontFamily:C.font,
                  color: isActive ? 'white' : 'rgba(240,248,255,0.38)',
                  transition: A.smooth,
                  marginTop:1,
                }}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {dot && (
        <div onClick={() => { setVisible(true); setDot(false) }} style={{
          position:'fixed', bottom:44, left:'50%',
          transform:'translateX(-50%)',
          width:40, height:5, borderRadius:5,
          background:'rgba(0,210,200,0.40)',
          border:'1px solid rgba(0,210,200,0.20)',
          cursor:'pointer', zIndex:1000,
          boxShadow:'0 0 16px rgba(0,210,200,0.30)',
          transition: A.smooth,
        }}/>
      )}

      <div style={{height:130}}/>
    </>
  )
}
