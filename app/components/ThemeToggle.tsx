'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── THEMES ──
export const THEMES = {
  navy: {
    id: 'navy',
    label: 'Navy',
    icon: '🌊',
    bg:     '#0a1628',
    bg1:    '#0f1f38',
    bg2:    '#142840',
    accent: '#00C8B8',
    desc:   'Deep ocean blue',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    icon: '🌙',
    bg:     '#10121a',
    bg1:    '#14172a',
    bg2:    '#1a1f38',
    accent: '#BF5AF2',
    desc:   'Deep purple night',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    icon: '🩶',
    bg:     '#141820',
    bg1:    '#1a2030',
    bg2:    '#202838',
    accent: '#1A8CFF',
    desc:   'Clinical steel blue',
  },
}

type ThemeId = keyof typeof THEMES

interface Props {
  onThemeChange?: (theme: ThemeId) => void
}

// ── LOGO CORNER MARKS ──
function CornerLogo({ position }: { position: 'tl'|'tr'|'bl'|'br' }) {
  const transforms = {
    tl: 'translate(0,0)',
    tr: 'translate(calc(100% - 80px),0)',
    bl: 'translate(0,calc(100% - 80px))',
    br: 'translate(calc(100% - 80px),calc(100% - 80px))',
  }
  return (
    <div style={{
      position:'absolute',
      ...(position.includes('t') ? {top:0} : {bottom:0}),
      ...(position.includes('l') ? {left:0} : {right:0}),
      width:80, height:80,
      pointerEvents:'none', opacity:0.06,
    }}>
      <svg width="80" height="80" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`cLg${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5D4"/>
            <stop offset="100%" stopColor="#0096FF"/>
          </linearGradient>
        </defs>
        <path d="M 84 38 A 30 30 0 1 0 84 82"
          fill="none" stroke={`url(#cLg${position})`} strokeWidth="8" strokeLinecap="round"/>
        <circle cx="84" cy="38" r="5" fill="#00E5D4"/>
        <circle cx="84" cy="82" r="5" fill="#0096FF"/>
        <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
          fill="none" stroke="#00C8B8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default function ThemeToggle({ onThemeChange }: Props) {
  const [current, setCurrent] = useState<ThemeId>('navy')
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cliniverse-theme') as ThemeId
    if (saved && THEMES[saved]) setCurrent(saved)
  }, [])

  const apply = (id: ThemeId) => {
    setCurrent(id)
    localStorage.setItem('cliniverse-theme', id)
    // Apply CSS variables to root
    const theme = THEMES[id]
    document.documentElement.style.setProperty('--bg',     theme.bg)
    document.documentElement.style.setProperty('--bg1',    theme.bg1)
    document.documentElement.style.setProperty('--bg2',    theme.bg2)
    document.documentElement.style.setProperty('--accent', theme.accent)
    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(8)
    onThemeChange?.(id)
    setApplied(true)
    setTimeout(() => setApplied(false), 1500)
  }

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5, marginBottom:12 }}>
        APPEARANCE
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {Object.values(THEMES).map(theme => {
          const isActive = current === theme.id
          return (
            <div
              key={theme.id}
              onClick={() => apply(theme.id as ThemeId)}
              style={{
                background: isActive
                  ? `linear-gradient(135deg,${theme.bg2},${theme.bg1})`
                  : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isActive ? theme.accent + '45' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:18, padding:'14px 16px', cursor:'pointer',
                display:'flex', alignItems:'center', gap:14,
                position:'relative', overflow:'hidden',
                transition:'all 0.25s ease',
              }}
            >
              {/* Corner logos — النمط المنتشر في الأطراف */}
              <CornerLogo position="tr"/>
              <CornerLogo position="bl"/>

              {/* Theme preview swatch */}
              <div style={{
                width:48, height:48, borderRadius:14, flexShrink:0,
                background:`linear-gradient(135deg,${theme.bg},${theme.bg2})`,
                border:`1.5px solid ${theme.accent}35`,
                display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative', overflow:'hidden',
              }}>
                {/* Mini neural dot */}
                <div style={{position:'absolute',top:6,right:6,width:4,height:4,borderRadius:'50%',background:theme.accent,opacity:0.6}}/>
                <div style={{position:'absolute',bottom:6,left:6,width:3,height:3,borderRadius:'50%',background:'#1A8CFF',opacity:0.4}}/>
                <span style={{fontSize:20}}>{theme.icon}</span>
              </div>

              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#F2F8FC', marginBottom:3 }}>
                  {theme.label}
                </div>
                <div style={{ fontSize:11, color:'rgba(242,248,252,0.50)' }}>{theme.desc}</div>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:5 }}>
                  {/* Color dots */}
                  {[theme.bg, theme.bg1, theme.bg2, theme.accent].map((c,i)=>(
                    <div key={i} style={{width:10,height:10,borderRadius:'50%',background:c,border:'1px solid rgba(255,255,255,0.12)'}}/>
                  ))}
                </div>
              </div>

              {isActive && (
                <div style={{
                  width:26, height:26, borderRadius:'50%', flexShrink:0,
                  background: theme.accent, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:14, color:'#000', fontWeight:900,
                }}>✓</div>
              )}
            </div>
          )
        })}
      </div>

      {applied && (
        <div style={{ marginTop:12, background:'rgba(48,209,88,0.10)', border:'1px solid rgba(48,209,88,0.22)', borderRadius:12, padding:'10px 14px', textAlign:'center' }}>
          <div style={{ fontSize:12, color:'#30D158', fontWeight:700 }}>✓ Theme applied</div>
        </div>
      )}
    </div>
  )
}
