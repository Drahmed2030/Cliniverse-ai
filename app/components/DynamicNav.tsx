'use client'
import { useState, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes corePulse {
    0%,100%{box-shadow:0 0 0 0 rgba(0,200,184,0.4),0 0 20px rgba(0,200,184,0.3);}
    50%    {box-shadow:0 0 0 8px rgba(0,200,184,0),0 0 35px rgba(0,200,184,0.5);}
  }
  @keyframes sheetUp {
    from{transform:translateY(100%);opacity:0;}
    to  {transform:translateY(0);opacity:1;}
  }
  @keyframes fadeIn {
    from{opacity:0;} to{opacity:1;}
  }
  @keyframes liveBlink {
    0%,100%{opacity:1;} 50%{opacity:0.3;}
  }
`

const NAV_TABS = [
  {
    id:'hub',
    label:'PULSE',
    svg:(active:boolean)=>(
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M2 12h4l3-7 4 14 3-7h6" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id:'tools',
    label:'TOOLS',
    svg:(active:boolean)=>(
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <rect x="13" y="3" width="8" height="8" rx="2" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <rect x="3" y="13" width="8" height="8" rx="2" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id:'ward',
    label:'WARD',
    svg:(active:boolean)=>(
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <path d="M9 22V12h6v10" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id:'net',
    label:'NET',
    svg:(active:boolean)=>(
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5"  r="2.5" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <circle cx="5"  cy="19" r="2.5" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <circle cx="19" cy="19" r="2.5" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <path d="M12 7.5L5 16.5M12 7.5L19 16.5M5 19h14" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id:'profile',
    label:'ME',
    svg:(active:boolean)=>(
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active?'#00C8B8':'rgba(255,255,255,0.40)'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// Command Center items
const COMMANDS = [
  {icon:'🎙️', label:'Ambient Scribe',   desc:'Start consultation',  color:'#00C8B8', tab:'tools', tool:'scribe'},
  {icon:'🏥', label:'Live Case',         desc:'Jump to active case', color:'#FF453A', tab:'hub',   tool:''},
  {icon:'💊', label:'Prescription AI',   desc:'Write Rx now',        color:'#30D158', tab:'tools', tool:'rx'},
  {icon:'📊', label:'Risk Calculator',   desc:'Quick score',         color:'#BF5AF2', tab:'tools', tool:'riskcalc'},
  {icon:'🗂️', label:'Clinical Memory',   desc:'Patient records',     color:'#1A8CFF', tab:'tools', tool:'memory'},
  {icon:'🌐', label:'FHIR',             desc:'EHR integration',     color:'#30D158', tab:'tools', tool:'fhir'},
]

interface Props {
  tab: string
  setTab: (t:string) => void
  setToolTab?: (t:string) => void
  liveCount?: number
  isPro?: boolean
}

export default function DynamicNav({ tab, setTab, setToolTab, liveCount=1247, isPro=false }: Props) {
  const [showCommand, setShowCommand] = useState(false)
  const [pressed, setPressed]         = useState(false)
  const touchStart = useRef<number>(0)

  const openCommand = () => {
    if ('vibrate' in navigator) navigator.vibrate([8,50,8])
    setShowCommand(true)
  }

  const closeCommand = () => setShowCommand(false)

  const execCommand = (cmd: typeof COMMANDS[0]) => {
    setTab(cmd.tab)
    if (cmd.tool && setToolTab) setToolTab(cmd.tool)
    closeCommand()
    if ('vibrate' in navigator) navigator.vibrate(6)
  }

  // Split tabs: 2 left, core pill, 2 right + profile
  const leftTabs  = NAV_TABS.slice(0, 2)
  const rightTabs = NAV_TABS.slice(2, 4)
  const profileTab = NAV_TABS[4]

  return (
    <>
      {/* ── COMMAND CENTER SHEET ── */}
      {showCommand && (
        <div style={{ position:'fixed', inset:0, zIndex:9998, fontFamily:F }} onClick={closeCommand}>
          {/* Backdrop */}
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(12px)', animation:'fadeIn 0.2s ease' }}/>

          {/* Sheet */}
          <div onClick={e=>e.stopPropagation()} style={{
            position:'absolute', bottom:0, left:0, right:0,
            background:'linear-gradient(180deg,#142840,#0d1f38)',
            borderRadius:'28px 28px 0 0',
            border:'1px solid rgba(0,200,184,0.20)',
            padding:'20px 16px 48px',
            animation:'sheetUp 0.32s cubic-bezier(0.32,0.72,0,1)',
          }}>
            {/* Handle */}
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.20)', margin:'0 auto 20px' }}/>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <div>
                <div style={{ fontSize:10, color:'rgba(0,200,184,0.80)', fontWeight:700, letterSpacing:1.5, marginBottom:2 }}>COMMAND CENTER</div>
                <div style={{ fontSize:18, fontWeight:900, color:'#F2F8FC' }}>Quick Actions</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,69,58,0.12)', border:'1px solid rgba(255,69,58,0.28)', borderRadius:20, padding:'5px 10px' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#FF453A', animation:'liveBlink 1.4s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:800, color:'#FF453A' }}>{liveCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Commands grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {COMMANDS.map(cmd => (
                <div key={cmd.label} onClick={() => execCommand(cmd)} style={{
                  background:`${cmd.color}10`,
                  border:`1.5px solid ${cmd.color}28`,
                  borderRadius:18, padding:'14px 12px',
                  cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                  transition:'all 0.15s',
                }}>
                  <div style={{ width:40, height:40, borderRadius:13, background:`${cmd.color}18`, border:`1px solid ${cmd.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{cmd.icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:'#F2F8FC', marginBottom:1 }}>{cmd.label}</div>
                    <div style={{ fontSize:9, color:'rgba(242,248,252,0.50)' }}>{cmd.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel */}
            <button onClick={closeCommand} style={{ width:'100%', padding:'14px', borderRadius:18, border:'1px solid rgba(255,255,255,0.10)', background:'rgba(255,255,255,0.05)', color:'rgba(242,248,252,0.60)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:F }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── FLOATING NAV ── */}
      <div style={{
        position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
        zIndex:200, width:'calc(100% - 32px)', maxWidth:440, fontFamily:F,
      }}>
        <div style={{
          background:'rgba(13,24,40,0.88)',
          backdropFilter:'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          borderRadius:26,
          border:'1px solid rgba(255,255,255,0.10)',
          boxShadow:'0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
          padding:'10px 14px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>

          {/* Left tabs */}
          {leftTabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if('vibrate' in navigator)navigator.vibrate(5) }} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background:'transparent', border:'none', cursor:'pointer',
              padding:'4px 8px', borderRadius:14, fontFamily:F,
              transition:'all 0.2s',
              minWidth:52,
            }}>
              {t.svg(tab === t.id)}
              <span style={{ fontSize:8, fontWeight:700, color:tab===t.id?'#00C8B8':'rgba(255,255,255,0.40)', letterSpacing:0.5 }}>{t.label}</span>
            </button>
          ))}

          {/* ── DYNAMIC CORE PILL ── */}
          <button
            onClick={openCommand}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
              position:'relative',
              width:58, height:58,
              borderRadius:'50%',
              background:'linear-gradient(135deg,rgba(0,200,184,0.20),rgba(26,140,255,0.15))',
              border:'2px solid rgba(0,200,184,0.45)',
              cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:2,
              animation:'corePulse 2.5s ease-in-out infinite',
              transform: pressed ? 'scale(0.92)' : 'scale(1)',
              transition:'transform 0.1s',
              flexShrink:0,
              marginBottom:4,
            }}
          >
            {/* Inner glow */}
            <div style={{ position:'absolute', inset:4, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,184,0.15),transparent 70%)', pointerEvents:'none' }}/>

            {/* Mini ECG icon */}
            <svg width="24" height="14" viewBox="0 0 24 14" style={{ position:'relative', zIndex:1 }}>
              <polyline points="0,7 4,7 6,1 8,13 10,4 12,10 14,7 24,7"
                fill="none" stroke="#00C8B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Live dot */}
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#FF453A', animation:'liveBlink 1.4s infinite', position:'relative', zIndex:1 }}/>
          </button>

          {/* Right tabs */}
          {rightTabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if('vibrate' in navigator)navigator.vibrate(5) }} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background:'transparent', border:'none', cursor:'pointer',
              padding:'4px 8px', borderRadius:14, fontFamily:F,
              transition:'all 0.2s',
              minWidth:52,
            }}>
              {t.svg(tab === t.id)}
              <span style={{ fontSize:8, fontWeight:700, color:tab===t.id?'#00C8B8':'rgba(255,255,255,0.40)', letterSpacing:0.5 }}>{t.label}</span>
            </button>
          ))}

          {/* Profile */}
          <button onClick={() => { setTab('profile'); if('vibrate' in navigator)navigator.vibrate(5) }} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'transparent', border:'none', cursor:'pointer',
            padding:'4px 8px', borderRadius:14, fontFamily:F,
            minWidth:52,
          }}>
            {profileTab.svg(tab === 'profile')}
            <span style={{ fontSize:8, fontWeight:700, color:tab==='profile'?'#00C8B8':'rgba(255,255,255,0.40)', letterSpacing:0.5 }}>ME</span>
          </button>
        </div>
      </div>

      <style>{CSS}</style>
    </>
  )
}
