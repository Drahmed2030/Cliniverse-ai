'use client'
import { useState, useEffect, useRef } from 'react'

const TABS = [
  { id:'pulse', icon:'⚡', label:'Today' },
  { id:'ward',  icon:'🏥', label:'Clinic' },
  { id:'tools', icon:'🔬', label:'Tools' },
  { id:'me',    icon:'👤', label:'Me' },
]

export default function FloatingNav({ tab, setTab }: { tab:string, setTab:(t:string)=>void }) {
  const [visible, setVisible] = useState(true)
  const [dot, setDot] = useState(false)
  const lastY = useRef(0)
  const timer = useRef<any>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const going = y > lastY.current
      lastY.current = y

      if (going && y > 80) {
        setVisible(false)
        setDot(true)
      } else {
        setVisible(true)
        setDot(false)
      }

      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        setVisible(true)
        setDot(false)
      }, 2000)
    }
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeTab = TABS.find(t =>
    t.id === tab ||
    (t.id === 'pulse' && tab === 'hub') ||
    (t.id === 'ward'  && tab === 'net')
  )?.id || 'pulse'

  return (
    <>
      {/* ── FLOATING PILL ── */}
      <div style={{
        position:'fixed', bottom:32, left:'50%',
        transform:`translateX(-50%) translateY(${visible?'0':'120px'})`,
        opacity: visible ? 1 : 0,
        transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        zIndex:1000,
        display:'flex', alignItems:'center',
        background:'rgba(15,24,36,0.85)',
        backdropFilter:'blur(32px) saturate(200%)',
        WebkitBackdropFilter:'blur(32px) saturate(200%)',
        border:'1px solid rgba(255,255,255,0.10)',
        borderRadius:40,
        padding:'6px 8px',
        gap:4,
        boxShadow:'0 8px 40px rgba(0,0,0,0.60), 0 0 0 1px rgba(0,212,200,0.08)',
      }}>
        {TABS.map(t => {
          const isActive = t.id === activeTab
          return (
            <button key={t.id} onClick={() => {
              if (t.id === 'ward') {
                setTab('ward')
              } else if (t.id === 'pulse') {
                setTab('pulse')
              } else {
                setTab(t.id)
              }
            }} style={{
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              gap:3, border:'none', cursor:'pointer',
              borderRadius:32,
              padding: isActive ? '10px 22px' : '10px 16px',
              transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              background: isActive
                ? 'linear-gradient(135deg,#00D4C8,#4F8EF7)'
                : 'transparent',
              boxShadow: isActive ? '0 4px 16px rgba(0,212,200,0.35)' : 'none',
              minWidth: isActive ? 80 : 52,
            }}>
              <span style={{ fontSize:18, lineHeight:1 }}>{t.icon}</span>
              <span style={{
                fontSize:10, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'white' : 'rgba(232,244,253,0.45)',
                fontFamily:'var(--font)',
                letterSpacing:0.3,
                transition:'color 0.2s',
              }}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── DOT (Nav مخفي) ── */}
      {dot && (
        <div
          onClick={() => { setVisible(true); setDot(false) }}
          style={{
            position:'fixed', bottom:40, left:'50%',
            transform:'translateX(-50%)',
            width:32, height:8, borderRadius:8,
            background:'rgba(0,212,200,0.50)',
            border:'1px solid rgba(0,212,200,0.30)',
            cursor:'pointer', zIndex:1000,
            boxShadow:'0 0 12px rgba(0,212,200,0.30)',
            transition:'all 0.3s',
          }}
        />
      )}

      {/* spacer */}
      <div style={{height:120}}/>
    </>
  )
}
