'use client'
import { useState, useRef, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes ambientBreath {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,200,184,0.35), 0 0 20px rgba(0,200,184,0.20); }
    50%      { box-shadow: 0 0 0 6px rgba(0,200,184,0), 0 0 40px rgba(0,200,184,0.40); }
  }
  @keyframes redPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,69,58,0.5), 0 0 20px rgba(255,69,58,0.3); }
    50%      { box-shadow: 0 0 0 8px rgba(255,69,58,0), 0 0 40px rgba(255,69,58,0.5); }
  }
  @keyframes greenPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(48,209,88,0.5), 0 0 20px rgba(48,209,88,0.3); }
    50%      { box-shadow: 0 0 0 8px rgba(48,209,88,0), 0 0 40px rgba(48,209,88,0.5); }
  }
  @keyframes sheetUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes liveBlink {
    0%,100% { opacity: 1; } 50% { opacity: 0.2; }
  }
  @keyframes ecgDraw {
    0%   { stroke-dashoffset: 120; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes pillExpand {
    from { transform: translateX(-50%) scaleX(0.7); opacity: 0; }
    to   { transform: translateX(-50%) scaleX(1);   opacity: 1; }
  }
  @keyframes micRing {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.15); opacity: 0.7; }
  }
  @keyframes textReveal {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

// ── NAV TABS ────────────────────────────────────────────────────────────────
const NAV_TABS = [
  {
    id: 'hub',
    label: 'PULSE',
    svg: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M2 12h4l3-7 4 14 3-7h6"
          stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'tools',
    label: 'TOOLS',
    svg: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3"  y="3"  width="8" height="8" rx="2" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <rect x="13" y="3"  width="8" height="8" rx="2" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <rect x="3"  y="13" width="8" height="8" rx="2" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'ward',
    label: 'WARD',
    svg: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"
          stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <path d="M9 22V12h6v10"
          stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'net',
    label: 'NET',
    svg: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5"  r="2.5" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <circle cx="5"  cy="19" r="2.5" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <circle cx="19" cy="19" r="2.5" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <path d="M12 7.5L5 16.5M12 7.5L19 16.5M5 19h14"
          stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'ME',
    svg: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={active ? '#00C8B8' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// ── COMMAND CENTER ───────────────────────────────────────────────────────────
const COMMANDS = [
  { icon: '🎙️', label: 'Ambient Scribe',  desc: 'Start consultation', color: '#00C8B8', tab: 'tools', tool: 'scribe',   pro: true  },
  { icon: '🏥', label: 'Live Case',        desc: 'Jump to active case',color: '#FF453A', tab: 'hub',   tool: '',         pro: false },
  { icon: '💊', label: 'Prescription AI',  desc: 'Write Rx now',       color: '#30D158', tab: 'tools', tool: 'rx',       pro: false },
  { icon: '📊', label: 'Risk Calculator',  desc: 'Quick score',        color: '#BF5AF2', tab: 'tools', tool: 'riskcalc', pro: false },
  { icon: '🗂️', label: 'Clinical Memory', desc: 'Patient records',    color: '#1A8CFF', tab: 'tools', tool: 'memory',   pro: true  },
  { icon: '🌐', label: 'FHIR',            desc: 'EHR integration',    color: '#30D158', tab: 'tools', tool: 'fhir',     pro: true  },
]

// ── PILL STATE based on active tab ──────────────────────────────────────────
type PillMode = 'default' | 'ward' | 'scribe'

function getPillMode(tab: string, toolTab: string): PillMode {
  if (tab === 'ward') return 'ward'
  if (tab === 'tools' && toolTab === 'scribe') return 'scribe'
  return 'default'
}

// ── CORE PILL CONTENT ────────────────────────────────────────────────────────
function CorePillContent({ mode, pressed }: { mode: PillMode; pressed: boolean }) {
  // Default: CLINIVERSE + ECG
  if (mode === 'default') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative', zIndex:1 }}>
      <span style={{
        fontSize: 8, fontWeight: 900, letterSpacing: 2.5,
        color: '#00C8B8', fontFamily: F,
        animation: 'textReveal 0.3s ease',
        textShadow: '0 0 10px rgba(0,200,184,0.8)',
      }}>CLINIVERSE</span>
      <svg width="32" height="12" viewBox="0 0 32 12">
        <polyline
          points="0,6 5,6 7,1 9,11 11,3 13,9 15,6 32,6"
          fill="none" stroke="#00C8B8" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="120" strokeDashoffset="0"
          style={{ animation:'ecgDraw 1.2s ease forwards' }}
        />
      </svg>
    </div>
  )

  // Ward: critical patient alert
  if (mode === 'ward') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative', zIndex:1, animation:'textReveal 0.3s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#FF453A', animation:'liveBlink 0.8s infinite' }}/>
        <span style={{ fontSize:7, fontWeight:900, color:'#FF453A', letterSpacing:1, fontFamily:F }}>BED 4A</span>
      </div>
      <span style={{ fontSize:7, fontWeight:800, color:'rgba(255,255,255,0.7)', letterSpacing:0.5, fontFamily:F }}>STEMI STAT</span>
    </div>
  )

  // Scribe: mic active
  if (mode === 'scribe') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative', zIndex:1, animation:'textReveal 0.3s ease' }}>
      <svg width="18" height="22" viewBox="0 0 24 28" fill="none" style={{ animation:'micRing 1s ease-in-out infinite' }}>
        <rect x="8" y="1" width="8" height="14" rx="4" stroke="#30D158" strokeWidth="2"/>
        <path d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="#30D158" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="22" x2="12" y2="27" stroke="#30D158" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize:7, fontWeight:900, color:'#30D158', letterSpacing:1, fontFamily:F }}>AI SCRIBE</span>
    </div>
  )

  return null
}

// ── PROPS ────────────────────────────────────────────────────────────────────
interface Props {
  tab: string
  setTab: (t: string) => void
  setToolTab?: (t: string) => void
  toolTab?: string
  liveCount?: number
  isPro?: boolean
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DynamicNav({
  tab, setTab, setToolTab, toolTab='', liveCount=1247, isPro=false
}: Props) {
  const [showCommand, setShowCommand] = useState(false)
  const [pressed, setPressed]         = useState(false)
  const [pillKey, setPillKey]         = useState(0)
  const touchStartY = useRef(0)
  const touchStartT = useRef(0)

  const mode = getPillMode(tab, toolTab)

  // Re-animate pill on mode change
  useEffect(() => { setPillKey(k => k+1) }, [mode])

  const pillColor = mode === 'ward' ? '#FF453A' : mode === 'scribe' ? '#30D158' : '#00C8B8'
  const pillAnim  = mode === 'ward' ? 'redPulse 1.8s ease-in-out infinite'
                  : mode === 'scribe' ? 'greenPulse 1.8s ease-in-out infinite'
                  : 'ambientBreath 3s ease-in-out infinite'

  const openCommand = () => {
    if ('vibrate' in navigator) navigator.vibrate([8, 50, 8])
    setShowCommand(true)
  }

  const execCommand = (cmd: typeof COMMANDS[0]) => {
    if (cmd.pro && !isPro) {
      setTab('profile') // redirect to paywall
      setShowCommand(false)
      return
    }
    setTab(cmd.tab)
    if (cmd.tool && setToolTab) setToolTab(cmd.tool)
    setShowCommand(false)
    if ('vibrate' in navigator) navigator.vibrate(6)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartT.current = Date.now()
    setPressed(true)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    setPressed(false)
    const dy = touchStartY.current - e.changedTouches[0].clientY
    const dt = Date.now() - touchStartT.current
    if (dy > 30 && dt < 400) openCommand() // swipe-up
  }

  const leftTabs    = NAV_TABS.slice(0, 2)
  const rightTabs   = NAV_TABS.slice(2, 4)
  const profileTab  = NAV_TABS[4]

  return (
    <>
      {/* ── COMMAND CENTER SHEET ── */}
      {showCommand && (
        <div
          style={{ position:'fixed', inset:0, zIndex:9998, fontFamily:F }}
          onClick={() => setShowCommand(false)}
        >
          {/* Backdrop */}
          <div style={{
            position:'absolute', inset:0,
            background:'rgba(0,0,0,0.70)',
            backdropFilter:'blur(14px)',
            animation:'fadeIn 0.2s ease',
          }}/>

          {/* Sheet */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position:'absolute', bottom:0, left:0, right:0,
              background:'linear-gradient(180deg,#0e2240,#091828)',
              borderRadius:'32px 32px 0 0',
              border:'1px solid rgba(0,200,184,0.18)',
              padding:'20px 18px 52px',
              animation:'sheetUp 0.34s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Handle */}
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)', margin:'0 auto 22px' }}/>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:9, color:'rgba(0,200,184,0.85)', fontWeight:800, letterSpacing:2, marginBottom:3 }}>COMMAND CENTER</div>
                <div style={{ fontSize:20, fontWeight:900, color:'#F2F8FC', letterSpacing:-0.3 }}>Quick Actions</div>
              </div>
              <div style={{
                display:'flex', alignItems:'center', gap:6,
                background:'rgba(255,69,58,0.10)',
                border:'1px solid rgba(255,69,58,0.30)',
                borderRadius:20, padding:'6px 12px',
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#FF453A', animation:'liveBlink 1.2s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:800, color:'#FF453A' }}>{liveCount.toLocaleString()} LIVE</span>
              </div>
            </div>

            {/* Voice AI — PRO banner */}
            <div style={{
              background: isPro ? 'rgba(0,200,184,0.08)' : 'rgba(191,90,242,0.08)',
              border:`1.5px solid ${isPro ? 'rgba(0,200,184,0.25)' : 'rgba(191,90,242,0.30)'}`,
              borderRadius:20, padding:'14px 16px', marginBottom:14,
              display:'flex', alignItems:'center', gap:14, cursor: isPro ? 'default' : 'pointer',
            }} onClick={() => !isPro && setTab('profile')}>
              <div style={{
                width:48, height:48, borderRadius:15,
                background: isPro ? 'rgba(0,200,184,0.12)' : 'rgba(191,90,242,0.12)',
                border:`1px solid ${isPro ? 'rgba(0,200,184,0.25)' : 'rgba(191,90,242,0.25)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0,
              }}>🎙️</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:'#F2F8FC' }}>Voice AI Command</span>
                  {!isPro && <span style={{ fontSize:8, fontWeight:900, color:'#BF5AF2', background:'rgba(191,90,242,0.15)', borderRadius:6, padding:'2px 7px', letterSpacing:1 }}>PRO</span>}
                </div>
                <div style={{ fontSize:10, color:'rgba(242,248,252,0.45)' }}>
                  {isPro ? 'Speak your command or question' : 'Unlock real-time voice automation'}
                </div>
              </div>
              {!isPro && <span style={{ fontSize:18 }}>→</span>}
            </div>

            {/* Commands grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {COMMANDS.filter(c => c.label !== 'Ambient Scribe').map(cmd => (
                <div key={cmd.label} onClick={() => execCommand(cmd)} style={{
                  background:`${cmd.color}0D`,
                  border:`1.5px solid ${cmd.color}22`,
                  borderRadius:18, padding:'14px 12px',
                  cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                  position:'relative', overflow:'hidden',
                }}>
                  {cmd.pro && !isPro && (
                    <div style={{
                      position:'absolute', top:6, right:8,
                      fontSize:7, fontWeight:900, color:'#BF5AF2',
                      background:'rgba(191,90,242,0.15)', borderRadius:5, padding:'1px 5px', letterSpacing:0.8,
                    }}>PRO</div>
                  )}
                  <div style={{
                    width:40, height:40, borderRadius:13,
                    background:`${cmd.color}15`,
                    border:`1px solid ${cmd.color}28`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:20, flexShrink:0,
                  }}>{cmd.icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:'#F2F8FC', marginBottom:1 }}>{cmd.label}</div>
                    <div style={{ fontSize:9, color:'rgba(242,248,252,0.45)' }}>{cmd.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel */}
            <button onClick={() => setShowCommand(false)} style={{
              width:'100%', padding:'15px',
              borderRadius:18,
              border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(255,255,255,0.04)',
              color:'rgba(242,248,252,0.55)',
              fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:F,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── FLOATING NAV BAR ── */}
      <div style={{
        position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
        zIndex:200, width:'calc(100% - 28px)', maxWidth:460, fontFamily:F,
      }}>
        <div style={{
          background:'rgba(10,18,32,0.90)',
          backdropFilter:'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          borderRadius:28,
          border:'1px solid rgba(255,255,255,0.08)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)',
          padding:'10px 12px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>

          {/* Left tabs */}
          {leftTabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if('vibrate' in navigator) navigator.vibrate(4) }} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background:'transparent', border:'none', cursor:'pointer',
              padding:'4px 6px', borderRadius:14, fontFamily:F, minWidth:50,
            }}>
              {t.svg(tab === t.id)}
              <span style={{
                fontSize:7.5, fontWeight: tab===t.id ? 800 : 600,
                color: tab===t.id ? '#00C8B8' : 'rgba(255,255,255,0.35)',
                letterSpacing:0.8,
              }}>{t.label}</span>
            </button>
          ))}

          {/* ── DYNAMIC CORE PILL ── */}
          <div
            key={pillKey}
            onClick={openCommand}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => { setPressed(false); openCommand() }}
            style={{
              position:'relative',
              width:72, height:72,
              borderRadius:'50%',
              background:`linear-gradient(135deg,${pillColor}18,${pillColor}0A)`,
              border:`2px solid ${pillColor}55`,
              cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              animation: pillAnim,
              transform: pressed ? 'scale(0.90)' : 'scale(1)',
              transition:'transform 0.12s, border-color 0.4s, background 0.4s',
              flexShrink:0,
              marginBottom:6,
              userSelect:'none',
            }}
          >
            {/* Inner glow */}
            <div style={{
              position:'absolute', inset:5, borderRadius:'50%',
              background:`radial-gradient(circle,${pillColor}18,transparent 70%)`,
              pointerEvents:'none',
            }}/>
            {/* Outer ring */}
            <div style={{
              position:'absolute', inset:-4, borderRadius:'50%',
              border:`1px solid ${pillColor}18`,
              pointerEvents:'none',
            }}/>
            <CorePillContent mode={mode} pressed={pressed} />
          </div>

          {/* Right tabs */}
          {rightTabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if('vibrate' in navigator) navigator.vibrate(4) }} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background:'transparent', border:'none', cursor:'pointer',
              padding:'4px 6px', borderRadius:14, fontFamily:F, minWidth:50,
            }}>
              {t.svg(tab === t.id)}
              <span style={{
                fontSize:7.5, fontWeight: tab===t.id ? 800 : 600,
                color: tab===t.id ? '#00C8B8' : 'rgba(255,255,255,0.35)',
                letterSpacing:0.8,
              }}>{t.label}</span>
            </button>
          ))}

          {/* Profile */}
          <button onClick={() => { setTab('profile'); if('vibrate' in navigator) navigator.vibrate(4) }} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'transparent', border:'none', cursor:'pointer',
            padding:'4px 6px', borderRadius:14, fontFamily:F, minWidth:50,
          }}>
            {profileTab.svg(tab === 'profile')}
            <span style={{
              fontSize:7.5, fontWeight: tab==='profile' ? 800 : 600,
              color: tab==='profile' ? '#00C8B8' : 'rgba(255,255,255,0.35)',
              letterSpacing:0.8,
            }}>ME</span>
          </button>

        </div>
      </div>

      <style>{CSS}</style>
    </>
  )
}
