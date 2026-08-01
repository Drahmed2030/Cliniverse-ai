'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes logoFloat {
    0%,100%{opacity:0.07;transform:scale(1);}
    50%    {opacity:0.12;transform:scale(1.04);}
  }
  @keyframes checkIn {
    from{transform:scale(0);opacity:0;}
    to  {transform:scale(1);opacity:1;}
  }
`

// ── iOS 2026 THEME SYSTEM ──
export const THEMES = [
  {
    id:    'navy',
    label: 'Navy',
    icon:  '🌊',
    desc:  'Deep ocean · Clinical standard',
    light: { bg:'#EBF2FA', bg1:'#FFFFFF', bg2:'#D6E8F5', t1:'#0a1e35', t2:'rgba(10,30,53,0.72)', border:'rgba(10,30,53,0.10)', accent:'#00C8B8' },
    dark:  { bg:'#0d1828', bg1:'#142840', bg2:'#1a3050', t1:'#F2F8FC', t2:'rgba(242,248,252,0.78)', border:'rgba(255,255,255,0.10)', accent:'#00C8B8' },
    preview: ['#0d1828','#142840','#00C8B8','#1A8CFF'],
  },
  {
    id:    'white',
    label: 'Clinical White',
    icon:  '🏥',
    desc:  'Pure white · Hospital clean',
    light: { bg:'#F8FAFC', bg1:'#FFFFFF', bg2:'#EEF4FB', t1:'#0f1f2e', t2:'rgba(15,31,46,0.70)', border:'rgba(15,31,46,0.08)', accent:'#00C8B8' },
    dark:  { bg:'#111820', bg1:'#1a2535', bg2:'#202e42', t1:'#F5FAFF', t2:'rgba(245,250,255,0.78)', border:'rgba(255,255,255,0.10)', accent:'#00C8B8' },
    preview: ['#F8FAFC','#FFFFFF','#00C8B8','#1A8CFF'],
  },
  {
    id:    'forest',
    label: 'Forest',
    icon:  '🌿',
    desc:  'Natural green · Calm focus',
    light: { bg:'#EDF4EE', bg1:'#FFFFFF', bg2:'#DAEDDb', t1:'#0d2010', t2:'rgba(13,32,16,0.70)', border:'rgba(13,32,16,0.10)', accent:'#1DB954' },
    dark:  { bg:'#0d1f10', bg1:'#142818', bg2:'#1a3520', t1:'#F0FAF0', t2:'rgba(240,250,240,0.78)', border:'rgba(255,255,255,0.10)', accent:'#30D158' },
    preview: ['#0d1f10','#142818','#30D158','#00C8B8'],
  },
  {
    id:    'amber',
    label: 'Amber',
    icon:  '🌅',
    desc:  'Warm gold · Evening rounds',
    light: { bg:'#FDF6E8', bg1:'#FFFFFF', bg2:'#FAEDD0', t1:'#2a1800', t2:'rgba(42,24,0,0.70)', border:'rgba(42,24,0,0.10)', accent:'#FF9F0A' },
    dark:  { bg:'#1a1200', bg1:'#2a1e00', bg2:'#382800', t1:'#FFF8E8', t2:'rgba(255,248,232,0.78)', border:'rgba(255,255,255,0.10)', accent:'#FFD60A' },
    preview: ['#1a1200','#2a1e00','#FFD60A','#FF9F0A'],
  },
  {
    id:    'violet',
    label: 'Violet',
    icon:  '💜',
    desc:  'Academic purple · Board prep',
    light: { bg:'#F3EEFA', bg1:'#FFFFFF', bg2:'#E8DCF5', t1:'#1a0a35', t2:'rgba(26,10,53,0.70)', border:'rgba(26,10,53,0.10)', accent:'#BF5AF2' },
    dark:  { bg:'#120820', bg1:'#1e1035', bg2:'#281848', t1:'#F5F0FF', t2:'rgba(245,240,255,0.78)', border:'rgba(255,255,255,0.10)', accent:'#BF5AF2' },
    preview: ['#120820','#1e1035','#BF5AF2','#1A8CFF'],
  },
  {
    id:    'slate',
    label: 'Slate',
    icon:  '🩶',
    desc:  'Steel grey · Surgical precision',
    light: { bg:'#F0F2F5', bg1:'#FFFFFF', bg2:'#E2E6EC', t1:'#1a1f2e', t2:'rgba(26,31,46,0.70)', border:'rgba(26,31,46,0.10)', accent:'#636E82' },
    dark:  { bg:'#141820', bg1:'#1e2535', bg2:'#262e42', t1:'#EEF2F8', t2:'rgba(238,242,248,0.78)', border:'rgba(255,255,255,0.10)', accent:'#8E9BB0' },
    preview: ['#141820','#1e2535','#8E9BB0','#1A8CFF'],
  },
]

type ThemeId = 'navy'|'white'|'forest'|'amber'|'violet'|'slate'

// Apply theme to DOM
function applyTheme(id: ThemeId, mode: 'light'|'dark') {
  const theme = THEMES.find(t => t.id === id)!
  const vars  = mode === 'light' ? theme.light : theme.dark
  const root  = document.documentElement
  root.style.setProperty('--bg',      vars.bg)
  root.style.setProperty('--bg1',     vars.bg1)
  root.style.setProperty('--bg2',     vars.bg2)
  root.style.setProperty('--t1',      vars.t1)
  root.style.setProperty('--t2',      vars.t2)
  root.style.setProperty('--border',  vars.border)
  root.style.setProperty('--accent',  vars.accent)
  root.setAttribute('data-theme', id)
  root.setAttribute('data-mode',  mode)
}

// ── LOGO CORNER MARK ──
function CornerMark({ color }: { color: string }) {
  return (
    <div style={{ position:'absolute', top:0, right:0, width:60, height:60, pointerEvents:'none', opacity:0.08, animation:'logoFloat 4s ease-in-out infinite' }}>
      <svg width="60" height="60" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cmG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5D4"/><stop offset="100%" stopColor="#0096FF"/>
          </linearGradient>
        </defs>
        <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#cmG)" strokeWidth="10" strokeLinecap="round"/>
        <circle cx="84" cy="38" r="6" fill="#00E5D4"/>
        <circle cx="84" cy="82" r="6" fill="#0096FF"/>
        <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
          fill="none" stroke="#00C8B8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

interface Props { onThemeChange?: (id: ThemeId) => void }

export default function ThemeToggle({ onThemeChange }: Props) {
  const [current, setCurrent] = useState<ThemeId>('navy')
  const [mode, setMode]       = useState<'auto'|'light'|'dark'>('auto')
  const [applied, setApplied] = useState(false)

  // Detect system mode
  const systemMode = (): 'light'|'dark' =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  useEffect(() => {
    const saved    = localStorage.getItem('cliniverse-theme') as ThemeId
    const savedMode = localStorage.getItem('cliniverse-mode') as 'auto'|'light'|'dark'
    if (saved && THEMES.find(t => t.id === saved)) setCurrent(saved)
    if (savedMode) setMode(savedMode)
    const m = savedMode === 'auto' || !savedMode ? systemMode() : savedMode as 'light'|'dark'
    applyTheme(saved || 'navy', m)
  }, [])

  const apply = (id: ThemeId, newMode?: 'auto'|'light'|'dark') => {
    const m = newMode || mode
    setCurrent(id)
    if (newMode) setMode(newMode)
    localStorage.setItem('cliniverse-theme', id)
    localStorage.setItem('cliniverse-mode',  m)
    const resolvedMode = m === 'auto' ? systemMode() : m
    applyTheme(id, resolvedMode)
    if ('vibrate' in navigator) navigator.vibrate(8)
    onThemeChange?.(id)
    setApplied(true)
    setTimeout(() => setApplied(false), 1800)
  }

  return (
    <div style={{ fontFamily:F }}>

      {/* ── MODE TOGGLE ── */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>APPEARANCE MODE</div>
        <div style={{ display:'flex', gap:6, background:'rgba(255,255,255,0.05)', borderRadius:16, padding:4, border:'1px solid rgba(255,255,255,0.08)' }}>
          {([['auto','⚙️ Auto'],['light','☀️ Light'],['dark','🌙 Dark']] as [string,string][]).map(([id,label])=>(
            <button key={id} onClick={()=>apply(current, id as any)} style={{
              flex:1, padding:'9px 4px', cursor:'pointer', borderRadius:12, fontFamily:F,
              fontWeight:700, fontSize:11,
              border:mode===id?'1px solid rgba(0,200,184,0.35)':'1px solid transparent',
              background:mode===id?'rgba(0,200,184,0.12)':'transparent',
              color:mode===id?'#00C8B8':'rgba(242,248,252,0.45)',
              transition:'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ fontSize:10, color:'rgba(242,248,252,0.32)', marginTop:5, textAlign:'center' }}>
          {mode==='auto'?'Follows iPhone settings automatically':mode==='light'?'Always light mode':'Always dark mode'}
        </div>
      </div>

      {/* ── THEME GRID ── */}
      <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>COLOUR THEME</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {THEMES.map(theme => {
          const isActive = current === theme.id
          const resolvedMode = mode === 'auto' ? 'dark' : mode
          const vars = resolvedMode === 'dark' ? theme.dark : theme.light

          return (
            <div key={theme.id} onClick={()=>apply(theme.id as ThemeId)} style={{
              background: isActive
                ? `linear-gradient(135deg,${vars.bg2},${vars.bg1})`
                : 'rgba(255,255,255,0.04)',
              border:`1.5px solid ${isActive ? theme.dark.accent+'50' : 'rgba(255,255,255,0.08)'}`,
              borderRadius:20, padding:'14px 12px',
              cursor:'pointer', position:'relative', overflow:'hidden',
              transition:'all 0.25s ease',
            }}>
              <CornerMark color={theme.dark.accent}/>

              {/* Preview swatches */}
              <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                {theme.preview.map((c,i)=>(
                  <div key={i} style={{ width:i===0?22:14, height:14, borderRadius:4, background:c, border:'1px solid rgba(255,255,255,0.12)', flexShrink:0 }}/>
                ))}
              </div>

              {/* Icon + Label */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                <span style={{ fontSize:16 }}>{theme.icon}</span>
                <span style={{ fontSize:13, fontWeight:800, color:'var(--text-primary, #F2F8FC)' }}>{theme.label}</span>
              </div>
              <div style={{ fontSize:9, color:'var(--text-muted, rgba(242,248,252,0.45))', lineHeight:1.4 }}>{theme.desc}</div>

              {/* Active checkmark */}
              {isActive && (
                <div style={{
                  position:'absolute', top:10, right:10,
                  width:22, height:22, borderRadius:'50%',
                  background:theme.dark.accent,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, color:'#000', fontWeight:900,
                  animation:'checkIn 0.25s ease',
                }}>✓</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Applied feedback */}
      {applied && (
        <div style={{ marginTop:12, background:'rgba(48,209,88,0.10)', border:'1px solid rgba(48,209,88,0.22)', borderRadius:14, padding:'10px 14px', textAlign:'center', animation:'checkIn 0.3s ease' }}>
          <div style={{ fontSize:12, color:'#30D158', fontWeight:700 }}>✓ Theme applied</div>
        </div>
      )}

      {/* iOS note */}
      <div style={{ marginTop:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 14px', textAlign:'center' }}>
        <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.35))' }}>
          🍎 Auto mode follows iPhone Dark/Light setting
        </div>
      </div>

      <style>{CSS}</style>
    </div>
  )
}
