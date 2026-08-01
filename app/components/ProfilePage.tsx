'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), { ssr:false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ─────────────────────────────────────────────
//  THEME SYSTEM — CSS Variables on :root
// ─────────────────────────────────────────────
const THEMES = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Clinical',
    desc: 'Dark intelligence mode',
    icon: '🌌',
    preview: ['#0d1828','#00C8B8','#1A8CFF'],
    vars: {
      '--bg-primary':    'linear-gradient(160deg,#080e1a,#0d1828,#091420)',
      '--bg-card':       'rgba(255,255,255,0.04)',
      '--bg-card-hover': 'rgba(255,255,255,0.07)',
      '--border-card':   'rgba(255,255,255,0.09)',
      '--border-accent': 'rgba(0,200,184,0.30)',
      '--text-primary':  '#F2F8FC',
      '--text-secondary':'rgba(242,248,252,0.55)',
      '--text-muted':    'rgba(242,248,252,0.30)',
      '--accent':        '#00C8B8',
      '--accent-glow':   'rgba(0,200,184,0.20)',
      '--aurora':        'radial-gradient(ellipse at 50% 0%,rgba(0,200,184,0.10),rgba(26,140,255,0.06) 50%,transparent 75%)',
      '--nav-bg':        'rgba(255,255,255,0.04)',
      '--nav-blur':      'blur(40px) saturate(180%) brightness(1.0)',
      '--tab-active':    'rgba(0,200,184,0.14)',
      '--tab-text':      '#00C8B8',
      '--shadow':        '0 8px 40px rgba(0,0,0,0.40)',
    }
  },
  hospital: {
    id: 'hospital',
    name: 'Pure Hospital',
    desc: 'Clean clinical daylight',
    icon: '🏥',
    preview: ['#F0F4F8','#00A896','#0077B6'],
    vars: {
      '--bg-primary':    'linear-gradient(160deg,#EBF4F8,#F5F9FC,#EDF6F9)',
      '--bg-card':       'rgba(255,255,255,0.80)',
      '--bg-card-hover': 'rgba(255,255,255,0.95)',
      '--border-card':   'rgba(0,120,150,0.12)',
      '--border-accent': 'rgba(0,168,150,0.35)',
      '--text-primary':  '#0D2137',
      '--text-secondary':'rgba(13,33,55,0.60)',
      '--text-muted':    'rgba(13,33,55,0.35)',
      '--accent':        '#00A896',
      '--accent-glow':   'rgba(0,168,150,0.15)',
      '--aurora':        'radial-gradient(ellipse at 50% 0%,rgba(0,168,150,0.06),rgba(0,119,182,0.04) 50%,transparent 75%)',
      '--nav-bg':        'rgba(255,255,255,0.55)',
      '--nav-blur':      'blur(40px) saturate(200%) brightness(1.15)',
      '--tab-active':    'rgba(0,168,150,0.12)',
      '--tab-text':      '#00A896',
      '--shadow':        '0 8px 40px rgba(0,80,120,0.12)',
    }
  },
  ambient: {
    id: 'ambient',
    name: 'Adaptive Ambient',
    desc: 'Shifts with your environment',
    icon: '🌊',
    preview: ['#0f1a2e','#BF5AF2','#FF9F0A'],
    vars: {
      '--bg-primary':    'linear-gradient(160deg,#0c1424,#111e35,#0e1a2d)',
      '--bg-card':       'rgba(255,255,255,0.05)',
      '--bg-card-hover': 'rgba(255,255,255,0.08)',
      '--border-card':   'rgba(191,90,242,0.12)',
      '--border-accent': 'rgba(191,90,242,0.35)',
      '--text-primary':  '#F5F0FF',
      '--text-secondary':'rgba(245,240,255,0.55)',
      '--text-muted':    'rgba(245,240,255,0.30)',
      '--accent':        '#BF5AF2',
      '--accent-glow':   'rgba(191,90,242,0.20)',
      '--aurora':        'radial-gradient(ellipse at 30% 0%,rgba(191,90,242,0.10),rgba(255,159,10,0.05) 50%,transparent 75%)',
      '--nav-bg':        'rgba(255,255,255,0.04)',
      '--nav-blur':      'blur(40px) saturate(180%) brightness(1.05)',
      '--tab-active':    'rgba(191,90,242,0.14)',
      '--tab-text':      '#BF5AF2',
      '--shadow':        '0 8px 40px rgba(80,0,120,0.30)',
    }
  }
} as const

type ThemeId = keyof typeof THEMES

function applyTheme(id: ThemeId) {
  const t = THEMES[id]
  const root = document.documentElement
  Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  localStorage.setItem('cliniverse-theme-v2', id)
  document.body.setAttribute('data-theme', id)
  // Notify ThemeProvider + all components
  window.dispatchEvent(new CustomEvent('cliniverse-theme-change', { detail: id }))
}

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const RANKS = [
  {name:'Clinical Clerk',    icon:'🩺', color:'#8BA0B4', xpNeeded:0,    ring:'#8BA0B4'},
  {name:'Junior Resident',   icon:'📋', color:'#00C8B8', xpNeeded:100,  ring:'#00C8B8'},
  {name:'Senior Resident',   icon:'🔬', color:'#30D158', xpNeeded:300,  ring:'#30D158'},
  {name:'Registrar',         icon:'⚕️', color:'#FF9F0A', xpNeeded:600,  ring:'#FF9F0A'},
  {name:'Specialist',        icon:'🏥', color:'#1A8CFF', xpNeeded:1000, ring:'#1A8CFF'},
  {name:'Consultant',        icon:'👨‍⚕️',color:'#FF453A', xpNeeded:1500, ring:'#FF453A'},
  {name:'Senior Consultant', icon:'🎓', color:'#BF5AF2', xpNeeded:2200, ring:'#BF5AF2'},
  {name:'Chief of Medicine', icon:'🌟', color:'#FFD60A', xpNeeded:3000, ring:'#FFD60A'},
]

const BADGES = [
  {id:'first_case', label:'First Case',   color:'#FFD60A', shape:'star',   unlockAt:'Complete 1 case'},
  {id:'cardio',     label:'Cardiologist', color:'#FF453A', shape:'heart',  unlockAt:'5 cardio cases'},
  {id:'speed',      label:'Lightning MD', color:'#FFD60A', shape:'bolt',   unlockAt:'Answer < 10s'},
  {id:'streak3',    label:'On Fire',      color:'#FF9F0A', shape:'flame',  unlockAt:'3-day streak'},
  {id:'mcq10',      label:'Brain Trust',  color:'#30D158', shape:'brain',  unlockAt:'10 MCQ correct'},
  {id:'stemi',      label:'STEMI Master', color:'#FF453A', shape:'ecg',    unlockAt:'STEMI case'},
  {id:'sepsis',     label:'Sepsis Hero',  color:'#FF9F0A', shape:'shield', unlockAt:'Sepsis case'},
  {id:'sports',     label:'FIFA Medic',   color:'#30D158', shape:'bolt',   unlockAt:'Sports case'},
  {id:'peds',       label:'Paediatrics',  color:'#BF5AF2', shape:'star',   unlockAt:'Peds case'},
  {id:'lab',        label:'Lab Expert',   color:'#00C8B8', shape:'hex',    unlockAt:'10 lab cases'},
  {id:'rad',        label:'Radiologist',  color:'#1A8CFF', shape:'hex',    unlockAt:'5 radiology'},
  {id:'pro',        label:'Pro Member',   color:'#FFD60A', shape:'crown',  unlockAt:'Subscribe Pro'},
]

// CCLI Vitality metrics
const VITALITY = [
  {icon:'🫀', label:'Cardio-Vitality',    desc:'150 min/week aerobic', color:'#FF453A', score:72},
  {icon:'🧪', label:'Metabolic Mastery',  desc:'Nutrition compliance',  color:'#30D158', score:58},
  {icon:'📜', label:'Clinical Scholar',   desc:'Evidence-based study',  color:'#1A8CFF', score:89},
  {icon:'💤', label:'Recovery Index',     desc:'Sleep & rest quality',  color:'#BF5AF2', score:65},
]

// ─────────────────────────────────────────────
//  BADGE SHAPE SVG
// ─────────────────────────────────────────────
function BadgeShape({ shape, color, size=32 }: { shape:string; color:string; size?:number }) {
  const s = size
  switch(shape) {
    case 'star':   return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12" fill={color} opacity="0.95"/></svg>
    case 'heart':  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 28s-12-8-12-16a8 8 0 0 1 12-6.9A8 8 0 0 1 28 12c0 8-12 16-12 16z" fill={color} opacity="0.95"/></svg>
    case 'bolt':   return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="18,2 8,18 15,18 14,30 24,14 17,14" fill={color} opacity="0.95"/></svg>
    case 'flame':  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 2c0 0 8 8 8 16a8 8 0 0 1-16 0c0-4 2-7 2-7s1 4 4 5c0 0-2-8 2-14z" fill={color} opacity="0.95"/></svg>
    case 'brain':  return <svg width={s} height={s} viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="12" ry="10" fill={color} opacity="0.95"/><ellipse cx="16" cy="16" rx="6" ry="5" fill="rgba(0,0,0,0.15)"/></svg>
    case 'shield': return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 2L4 8v10c0 7 6 11 12 12 6-1 12-5 12-12V8z" fill={color} opacity="0.95"/></svg>
    case 'crown':  return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="4,24 4,10 10,16 16,4 22,16 28,10 28,24" fill={color} opacity="0.95"/><rect x="4" y="24" width="24" height="4" rx="2" fill={color} opacity="0.95"/></svg>
    case 'hex':    return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill={color} opacity="0.95"/></svg>
    case 'ecg':    return <svg width={s} height={s} viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill={color} opacity="0.95"/><polyline points="2,16 8,16 11,8 14,24 17,12 20,20 23,16 30,16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    default:       return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill={color} opacity="0.95"/></svg>
  }
}

// ─────────────────────────────────────────────
//  LOGO MARK
// ─────────────────────────────────────────────
function LogoMark({ size=60 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{animation:'logoGlow 2.8s ease-in-out infinite', borderRadius:24}}>
      <defs>
        <linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/><stop offset="60%" stopColor="#00C8B8"/><stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <linearGradient id="pulG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C8B8" stopOpacity="0"/>
          <stop offset="35%" stopColor="#00C8B8"/>
          <stop offset="65%" stopColor="#00E5D4"/>
          <stop offset="100%" stopColor="#0096FF" stopOpacity="0"/>
        </linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="120" height="120" rx="28" fill="#0d1f30"/>
      <rect width="120" height="120" rx="28" fill="radial-gradient(circle at 50% 40%,rgba(0,200,184,0.10),transparent)"/>
      <rect x="1" y="1" width="118" height="118" rx="27" fill="none" stroke="rgba(0,200,184,0.20)" strokeWidth="1.5"/>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcG)" strokeWidth="7" strokeLinecap="round" filter="url(#gl)"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4" filter="url(#gl)"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF" filter="url(#gl)"><animate attributeName="r" values="3;6;3" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
      <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
        fill="none" stroke="url(#pulG)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#gl)" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
      </polyline>
    </svg>
  )
}

// ─────────────────────────────────────────────
//  GLASS CARD — reusable Liquid Glass card
// ─────────────────────────────────────────────
function GlassCard({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid var(--border-card)',
      borderRadius: 24,
      boxShadow: 'var(--shadow), inset 0 1px 0 rgba(255,255,255,0.10)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Inner top shimmer */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
        pointerEvents:'none',
      }}/>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
//  THEME SELECTOR COMPONENT
// ─────────────────────────────────────────────
function ThemeSelector({ current, onChange }: { current: ThemeId; onChange:(id:ThemeId)=>void }) {
  return (
    <div>
      <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:700,letterSpacing:1.8,marginBottom:14}}>
        APPEARANCE — SELECT THEME
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map(t => {
          const active = t.id === current
          return (
            <div key={t.id} onClick={()=>onChange(t.id as ThemeId)} style={{
              background: active ? 'var(--tab-active)' : 'var(--bg-card)',
              backdropFilter:'blur(20px)',
              WebkitBackdropFilter:'blur(20px)',
              border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-card)'}`,
              borderRadius:20, padding:'16px',
              cursor:'pointer',
              display:'flex', alignItems:'center', gap:14,
              transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: active ? '0 0 20px var(--accent-glow)' : 'none',
              transform: active ? 'scale(1.01)' : 'scale(1)',
            }}>
              {/* Color preview dots */}
              <div style={{display:'flex',gap:4,flexShrink:0}}>
                {t.preview.map((c,i) => (
                  <div key={i} style={{
                    width: i===0?32:20, height:32,
                    borderRadius: i===0?10:10,
                    background:c,
                    boxShadow:`0 2px 8px ${c}50`,
                    border:'1px solid rgba(255,255,255,0.15)',
                  }}/>
                ))}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  <span style={{fontSize:16}}>{t.icon}</span>
                  <span style={{fontSize:14,fontWeight:800,color:'var(--text-primary)'}}>{t.name}</span>
                  {active && (
                    <span style={{
                      fontSize:8,fontWeight:900,color:'var(--accent)',
                      background:'var(--accent-glow)',borderRadius:6,
                      padding:'2px 7px',letterSpacing:1,marginLeft:4,
                    }}>ACTIVE</span>
                  )}
                </div>
                <div style={{fontSize:11,color:'var(--text-secondary)'}}>{t.desc}</div>
              </div>
              {/* Checkmark */}
              <div style={{
                width:22,height:22,borderRadius:'50%',flexShrink:0,
                background: active ? 'var(--accent)' : 'var(--border-card)',
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border-card)'}`,
                display:'flex',alignItems:'center',justifyContent:'center',
                transition:'all 0.2s',
              }}>
                {active && <svg width="11" height="9" viewBox="0 0 11 9"><polyline points="1,4 4,7.5 10,1" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Adaptive Ambient preview info */}
      <div style={{
        marginTop:14,
        background:'var(--bg-card)',
        backdropFilter:'blur(16px)',
        border:'1px solid var(--border-card)',
        borderRadius:16,padding:'12px 14px',
        display:'flex',alignItems:'center',gap:10,
      }}>
        <span style={{fontSize:18}}>💡</span>
        <span style={{fontSize:11,color:'var(--text-secondary)',lineHeight:1.5}}>
          <strong style={{color:'var(--text-primary)'}}>Adaptive Ambient</strong> shifts accent colors based on your active section and patient severity.
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  CCLI INDEX COMPONENT
// ─────────────────────────────────────────────
function CCLIIndex({ xp, casesCompleted, mcqCorrect, streak }: {
  xp:number; casesCompleted:number; mcqCorrect:number; streak:number
}) {
  const academicScore = Math.min(Math.round((xp/30 + casesCompleted*5 + mcqCorrect*2) / 3), 100)
  const vitalityScore = Math.min(streak * 8 + 40, 100)
  const ccliTotal = Math.round((academicScore + vitalityScore) / 2)

  return (
    <div>
      {/* CCLI Total */}
      <GlassCard style={{padding:'20px',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <div style={{fontSize:9,color:'var(--accent)',fontWeight:800,letterSpacing:2,marginBottom:4}}>
              CLINICAL COMPETENCY & LIFESTYLE INDEX
            </div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary)'}}>CCLI Score</div>
          </div>
          <div style={{
            width:64,height:64,borderRadius:'50%',
            background:`conic-gradient(var(--accent) ${ccliTotal}%, var(--border-card) ${ccliTotal}%)`,
            display:'flex',alignItems:'center',justifyContent:'center',
            position:'relative',
          }}>
            <div style={{
              position:'absolute',inset:5,borderRadius:'50%',
              background:'var(--bg-card)',
              backdropFilter:'blur(10px)',
              display:'flex',alignItems:'center',justifyContent:'center',
              flexDirection:'column',
            }}>
              <div style={{fontSize:16,fontWeight:900,color:'var(--accent)'}}>{ccliTotal}</div>
              <div style={{fontSize:7,color:'var(--text-muted)',fontWeight:700}}>/ 100</div>
            </div>
          </div>
        </div>

        {/* Two pillars */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[
            {label:'Academic Progress',  score:academicScore, color:'#00C8B8', icon:'📚'},
            {label:'Clinical Vitality',  score:vitalityScore, color:'#FF9F0A', icon:'⚡'},
          ].map(p => (
            <div key={p.label} style={{
              background:'var(--bg-card)',
              backdropFilter:'blur(12px)',
              border:'1px solid var(--border-card)',
              borderRadius:16,padding:'12px 10px',textAlign:'center',
            }}>
              <div style={{fontSize:20,marginBottom:6}}>{p.icon}</div>
              <div style={{fontSize:18,fontWeight:900,color:p.color}}>{p.score}</div>
              <div style={{fontSize:8,color:'var(--text-muted)',fontWeight:700,letterSpacing:0.5,marginTop:2}}>{p.label}</div>
              {/* Mini bar */}
              <div style={{height:3,borderRadius:2,background:'var(--border-card)',overflow:'hidden',marginTop:8}}>
                <div style={{height:'100%',borderRadius:2,background:p.color,width:`${p.score}%`,
                  boxShadow:`0 0 6px ${p.color}60`,transition:'width 1s ease'}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Vitality metrics */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {VITALITY.map(v => (
            <div key={v.label} style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16,flexShrink:0}}>{v.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--text-primary)'}}>{v.label}</span>
                  <span style={{fontSize:10,fontWeight:800,color:v.color}}>{v.score}%</span>
                </div>
                <div style={{height:4,borderRadius:2,background:'var(--border-card)',overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:2,background:v.color,width:`${v.score}%`,
                    boxShadow:`0 0 8px ${v.color}50`,transition:'width 1.2s ease'}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* WHO Exercise Prescription */}
      <GlassCard style={{padding:'16px',marginBottom:12}}>
        <div style={{fontSize:9,color:'#30D158',fontWeight:800,letterSpacing:2,marginBottom:10}}>
          WHO EXERCISE PRESCRIPTION
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[
            {label:'Aerobic Target', value:'150 min/wk', color:'#30D158', icon:'🏃'},
            {label:'Target HR Zone', value:'104–156 bpm', color:'#FF453A', icon:'🫀'},
            {label:'Resistance',     value:'2× per week', color:'#1A8CFF', icon:'💪'},
            {label:'Recovery',       value:'7–9 hrs sleep', color:'#BF5AF2', icon:'💤'},
          ].map(m => (
            <div key={m.label} style={{
              background:'var(--bg-card)',
              border:'1px solid var(--border-card)',
              borderRadius:14,padding:'11px 10px',
            }}>
              <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
              <div style={{fontSize:12,fontWeight:800,color:m.color}}>{m.value}</div>
              <div style={{fontSize:8,color:'var(--text-muted)',fontWeight:600,marginTop:2}}>{m.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Drug-Food Interaction reminder */}
      <GlassCard style={{padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:40,height:40,borderRadius:13,
            background:'rgba(255,159,10,0.12)',border:'1px solid rgba(255,159,10,0.25)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,
          }}>💊</div>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:'#FF9F0A',marginBottom:2}}>Drug-Food Interactions</div>
            <div style={{fontSize:10,color:'var(--text-secondary)'}}>
              Clinical nutrition guidance available in TOOLS → Clinical Nutrition
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PROPS
// ─────────────────────────────────────────────
interface Props {
  xp: number; streak: number; casesCompleted: number; mcqCorrect: number
  isPro: boolean; unlockedBadges?: string[]
  name?: string; onUpgrade?: ()=>void; onReset?: ()=>void; onLogout?: ()=>void
  setShowUpgrade?: (v:boolean)=>void
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ProfilePage({
  xp, streak, casesCompleted, mcqCorrect,
  isPro, unlockedBadges=[], name, onUpgrade, onReset, onLogout, setShowUpgrade
}: Props) {

  const [tab, setTab]         = useState<'overview'|'ccli'|'badges'|'settings'>('overview')
  const [settingTab, setSettingTab] = useState<'general'|'theme'>('theme')
  const [showCert, setShowCert] = useState(false)
  const [survey, setSurvey]   = useState<any>(null)
  const [theme, setTheme]     = useState<ThemeId>('cyber')

  useEffect(() => {
    const s = localStorage.getItem('cliniverse-survey')
    if (s) setSurvey(JSON.parse(s))
    const saved = (localStorage.getItem('cliniverse-theme-v2') || 'cyber') as ThemeId
    setTheme(saved)
    applyTheme(saved)
  }, [])

  const handleThemeChange = useCallback((id: ThemeId) => {
    setTheme(id)
    applyTheme(id)
  }, [])

  const rank     = [...RANKS].reverse().find(r => xp >= r.xpNeeded) || RANKS[0]
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1]
  const pct      = nextRank ? Math.min(((xp - rank.xpNeeded) / (nextRank.xpNeeded - rank.xpNeeded)) * 100, 100) : 100
  const xpToNext = nextRank ? nextRank.xpNeeded - xp : 0
  const displayName = survey?.greeting || name || 'Doctor'

  if (showCert) return (
    <div style={{padding:'0 0 140px', background:'var(--bg-primary)', minHeight:'100vh'}}>
      <CertificateGenerator
        doctorName={displayName} casesCompleted={casesCompleted}
        mcqCorrect={mcqCorrect} xp={xp} streak={streak}
        specialties={survey?.specialty ? [survey.specialty] : []}
        onClose={() => setShowCert(false)}
      />
    </div>
  )

  const CSS = `
    @keyframes ringPulse{0%{transform:scale(1);opacity:0.6}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1);opacity:0}}
    @keyframes logoGlow{0%,100%{filter:drop-shadow(0 0 10px rgba(0,200,184,.45))}50%{filter:drop-shadow(0 0 20px rgba(0,200,184,.75))}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes badgePop{0%{transform:scale(0.7);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes shimmerSlide{0%{background-position:200% center}100%{background-position:-200% center}}
  `

  return (
    <div style={{
      minHeight:'100vh',
      background:'var(--bg-primary)',
      fontFamily:F,
      position:'relative',
      overflow:'hidden',
      transition:'background 0.5s ease',
    }}>
      {/* Aurora layer */}
      <div style={{
        position:'fixed',top:0,left:0,right:0,height:'55%',
        background:'var(--aurora)',
        pointerEvents:'none',zIndex:0,
        transition:'background 0.5s ease',
      }}/>

      <div style={{
        position:'relative',zIndex:1,
        padding:'20px 16px 150px',
        maxWidth:540,margin:'0 auto',
        animation:'fadeUp 0.35s ease',
      }}>

        {/* ── HERO PROFILE CARD ── */}
        <GlassCard style={{padding:'22px 20px',marginBottom:12}}>
          {/* Rank ambient glow */}
          <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',
            background:`radial-gradient(circle,${rank.ring}12,transparent 70%)`,pointerEvents:'none'}}/>

          <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:18}}>
            {/* Avatar */}
            <div style={{position:'relative',flexShrink:0}}>
              <div style={{position:'absolute',inset:-6,borderRadius:'50%',border:`2px solid ${rank.ring}`,
                animation:'ringPulse 2s ease-out infinite',opacity:0.5}}/>
              <div style={{position:'absolute',inset:-3,borderRadius:'50%',
                background:`conic-gradient(${rank.ring} ${pct}%, rgba(255,255,255,0.06) ${pct}%)`}}/>
              <div style={{position:'relative',zIndex:1,margin:3}}>
                <LogoMark size={64}/>
              </div>
              {isPro && (
                <div style={{position:'absolute',bottom:-2,right:-2,
                  background:'linear-gradient(135deg,#FFD60A,#FF9F0A)',
                  borderRadius:10,padding:'2px 7px',fontSize:8,
                  color:'#000',fontWeight:900,zIndex:2,
                  boxShadow:'0 2px 8px rgba(255,214,10,0.50)'}}>PRO</div>
              )}
            </div>

            {/* Info */}
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:'var(--accent)',fontWeight:800,letterSpacing:2,marginBottom:3}}>
                CLINIVERSE AI
              </div>
              <div style={{fontSize:20,fontWeight:900,color:'var(--text-primary)',marginBottom:5,letterSpacing:-0.4}}>
                {displayName}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                <span style={{fontSize:14}}>{rank.icon}</span>
                <span style={{fontSize:13,color:rank.color,fontWeight:700}}>{rank.name}</span>
              </div>
              {survey?.specialty && (
                <div style={{fontSize:11,color:'var(--text-secondary)',fontWeight:500}}>
                  {survey.specialty} · {survey.country || 'Saudi Arabia'}
                </div>
              )}
            </div>
          </div>

          {/* XP Bar */}
          <div style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:11,color:'var(--text-secondary)',fontWeight:600}}>{xp} XP</span>
              <span style={{fontSize:11,color:rank.color,fontWeight:700}}>
                {nextRank ? `${xpToNext} XP → ${nextRank.name}` : '🏆 MAX RANK'}
              </span>
            </div>
            <div style={{height:7,borderRadius:4,background:'var(--border-card)',overflow:'hidden',position:'relative'}}>
              <div style={{
                height:'100%',borderRadius:4,
                background:`linear-gradient(90deg,${rank.ring},${rank.ring}AA)`,
                width:`${pct}%`,
                boxShadow:`0 0 12px ${rank.ring}60`,
                transition:'width 1s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}/>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'flex',gap:8}}>
            {[
              {l:'Cases',  v:casesCompleted,      c:'#00C8B8'},
              {l:'MCQ',    v:mcqCorrect,           c:'#BF5AF2'},
              {l:'Streak', v:`${streak}🔥`,        c:'#FF9F0A'},
              {l:'Badges', v:unlockedBadges.length,c:'#FFD60A'},
            ].map(s => (
              <div key={s.l} style={{
                flex:1,
                background:'var(--bg-card)',
                backdropFilter:'blur(12px)',
                border:'1px solid var(--border-card)',
                borderRadius:14,padding:'9px 4px',textAlign:'center',
              }}>
                <div style={{fontSize:16,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:8,color:'var(--text-muted)',marginTop:2,fontWeight:600}}>{s.l}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ── QUICK ACTIONS ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          {/* Certificate */}
          <div onClick={() => setShowCert(true)} style={{
            background:'var(--bg-card)',
            backdropFilter:'blur(20px)',
            border:'1px solid rgba(255,214,10,0.25)',
            borderRadius:20,padding:'14px',cursor:'pointer',
            display:'flex',alignItems:'center',gap:10,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.10)',
          }}>
            <span style={{fontSize:24}}>🎓</span>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:'#FFD60A'}}>Certificate</div>
              <div style={{fontSize:9,color:'var(--text-muted)'}}>Share on LinkedIn</div>
            </div>
          </div>

          {/* Upgrade / PRO */}
          {!isPro ? (
            <div onClick={() => { onUpgrade?.(); setShowUpgrade?.(true) }} style={{
              background:'linear-gradient(135deg,rgba(191,90,242,0.12),rgba(26,140,255,0.08))',
              backdropFilter:'blur(20px)',
              border:'1.5px solid rgba(191,90,242,0.30)',
              borderRadius:20,padding:'14px',cursor:'pointer',
              display:'flex',alignItems:'center',gap:10,
            }}>
              <span style={{fontSize:24}}>⭐</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:'#BF5AF2'}}>Upgrade PRO</div>
                <div style={{fontSize:9,color:'var(--text-muted)'}}>$14.99/month</div>
              </div>
            </div>
          ) : (
            <div style={{
              background:'rgba(48,209,88,0.08)',
              backdropFilter:'blur(20px)',
              border:'1px solid rgba(48,209,88,0.25)',
              borderRadius:20,padding:'14px',
              display:'flex',alignItems:'center',gap:10,
            }}>
              <span style={{fontSize:24}}>✅</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:'#30D158'}}>Pro Active</div>
                <div style={{fontSize:9,color:'var(--text-muted)'}}>All features unlocked</div>
              </div>
            </div>
          )}
        </div>

        {/* ── MAIN TABS ── */}
        <div style={{
          display:'flex',gap:5,
          background:'var(--bg-card)',
          backdropFilter:'blur(20px)',
          borderRadius:18,padding:4,marginBottom:14,
          border:'1px solid var(--border-card)',
        }}>
          {([
            ['overview','📊','Overview'],
            ['ccli','🫀','CCLI'],
            ['badges','🏅','Badges'],
            ['settings','⚙️','Settings'],
          ] as [string,string,string][]).map(([id,ico,lbl]) => (
            <button key={id} onClick={()=>setTab(id as any)} style={{
              flex:1,padding:'10px 4px',cursor:'pointer',borderRadius:14,
              fontFamily:F,fontWeight:700,fontSize:10,
              border:tab===id?'1px solid var(--border-accent)':'1px solid transparent',
              background:tab===id?'var(--tab-active)':'transparent',
              color:tab===id?'var(--tab-text)':'var(--text-muted)',
              transition:'all 0.2s',
            }}>{ico} {lbl}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div>
            {survey && (
              <GlassCard style={{marginBottom:12}}>
                <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-card)',
                  background:'var(--accent-glow)'}}>
                  <div style={{fontSize:9,color:'var(--accent)',fontWeight:800,letterSpacing:2}}>YOUR PROFILE</div>
                </div>
                {[
                  {k:'Specialty',  v:survey.specialty,  icon:'🏥'},
                  {k:'Level',      v:survey.level,      icon:'📋'},
                  {k:'Goal',       v:survey.goal,       icon:'🎯'},
                  {k:'Board',      v:survey.board==='skip'?'—':survey.board, icon:'🎓'},
                  {k:'Study Time', v:survey.hours,      icon:'⏰'},
                  {k:'Country',    v:survey.country,    icon:'🌍'},
                ].filter(r=>r.v && r.v!=='undefined').map((row,i,arr)=>(
                  <div key={row.k} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'13px 16px',
                    borderBottom:i<arr.length-1?'1px solid var(--border-card)':'none',
                  }}>
                    <span style={{fontSize:17}}>{row.icon}</span>
                    <span style={{flex:1,fontSize:13,color:'var(--text-secondary)',fontWeight:500}}>{row.k}</span>
                    <span style={{fontSize:13,color:'var(--text-primary)',fontWeight:700}}>{row.v}</span>
                  </div>
                ))}
              </GlassCard>
            )}

            {/* Rank ladder */}
            <div style={{fontSize:9,color:'var(--text-muted)',fontWeight:700,letterSpacing:2,marginBottom:10}}>
              RANK LADDER — CCLI
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {RANKS.map(r => {
                const isCurrent = r.name === rank.name
                const unlocked  = xp >= r.xpNeeded
                return (
                  <div key={r.name} style={{
                    display:'flex',alignItems:'center',gap:12,
                    background: isCurrent ? `${r.ring}10` : 'var(--bg-card)',
                    backdropFilter:'blur(12px)',
                    border:`1.5px solid ${isCurrent ? r.ring+'40' : 'var(--border-card)'}`,
                    borderRadius:16,padding:'11px 14px',
                    opacity:unlocked?1:0.35,
                    transition:'all 0.2s',
                    boxShadow: isCurrent ? `0 0 16px ${r.ring}20` : 'none',
                  }}>
                    <div style={{width:9,height:9,borderRadius:'50%',flexShrink:0,
                      background:unlocked?r.ring:'rgba(255,255,255,0.12)',
                      boxShadow:unlocked?`0 0 8px ${r.ring}60`:''}}/>
                    <span style={{fontSize:18}}>{r.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:isCurrent?800:600,
                        color:isCurrent?r.color:'var(--text-secondary)'}}>{r.name}</div>
                      <div style={{fontSize:9,color:'var(--text-muted)'}}>{r.xpNeeded} XP</div>
                    </div>
                    {isCurrent && <span style={{fontSize:8,background:`${r.ring}20`,border:`1px solid ${r.ring}35`,
                      color:r.color,borderRadius:8,padding:'3px 9px',fontWeight:800}}>CURRENT</span>}
                    {unlocked && !isCurrent && <span style={{color:'#30D158',fontSize:16}}>✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── CCLI TAB ── */}
        {tab === 'ccli' && (
          <CCLIIndex xp={xp} casesCompleted={casesCompleted} mcqCorrect={mcqCorrect} streak={streak}/>
        )}

        {/* ── BADGES TAB ── */}
        {tab === 'badges' && (
          <div>
            <div style={{fontSize:9,color:'var(--text-muted)',fontWeight:700,letterSpacing:2,marginBottom:14}}>
              ACHIEVEMENTS — {unlockedBadges.length}/{BADGES.length} EARNED
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {BADGES.map((b,i) => {
                const earned = unlockedBadges.includes(b.id)
                return (
                  <div key={b.id} style={{
                    background: earned ? `${b.color}0D` : 'var(--bg-card)',
                    backdropFilter:'blur(16px)',
                    border:`1.5px solid ${earned ? b.color+'30' : 'var(--border-card)'}`,
                    borderRadius:20,padding:'16px 8px',
                    textAlign:'center',position:'relative',overflow:'hidden',
                    opacity:earned?1:0.30,
                    animation:earned?`badgePop 0.4s ease ${i*0.05}s both`:'none',
                    boxShadow:earned?`0 4px 16px ${b.color}18`:'none',
                  }}>
                    {earned && <div style={{position:'absolute',top:-15,right:-15,width:50,height:50,
                      borderRadius:'50%',background:`radial-gradient(circle,${b.color}20,transparent 70%)`,
                      pointerEvents:'none'}}/>}
                    <div style={{display:'flex',justifyContent:'center',marginBottom:8,
                      filter:earned?`drop-shadow(0 0 8px ${b.color}60)`:'grayscale(1)'}}>
                      <BadgeShape shape={b.shape} color={earned?b.color:'#636E82'} size={34}/>
                    </div>
                    <div style={{fontSize:9,fontWeight:800,
                      color:earned?b.color:'var(--text-muted)',lineHeight:1.3}}>{b.label}</div>
                    {!earned && <div style={{fontSize:7,color:'var(--text-muted)',lineHeight:1.3,marginTop:3}}>{b.unlockAt}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div>
            {/* Settings sub-tabs */}
            <div style={{
              display:'flex',gap:5,
              background:'var(--bg-card)',
              backdropFilter:'blur(16px)',
              borderRadius:16,padding:4,marginBottom:14,
              border:'1px solid var(--border-card)',
            }}>
              {([['theme','🎨 Theme'],['general','⚙️ General']] as [string,string][]).map(([id,lbl])=>(
                <button key={id} onClick={()=>setSettingTab(id as any)} style={{
                  flex:1,padding:'10px',cursor:'pointer',borderRadius:12,
                  fontFamily:F,fontWeight:700,fontSize:11,
                  border:settingTab===id?'1px solid var(--border-accent)':'1px solid transparent',
                  background:settingTab===id?'var(--tab-active)':'transparent',
                  color:settingTab===id?'var(--tab-text)':'var(--text-muted)',
                  transition:'all 0.2s',
                }}>{lbl}</button>
              ))}
            </div>

            {/* THEME SELECTOR */}
            {settingTab === 'theme' && (
              <ThemeSelector current={theme} onChange={handleThemeChange}/>
            )}

            {/* GENERAL */}
            {settingTab === 'general' && (
              <div>
                <GlassCard style={{marginBottom:12}}>
                  {[
                    {label:'App Version', value:'v2.0 · 2026',                          icon:'📱'},
                    {label:'Plan',        value:isPro?'⭐ Pro':'Free',                   icon:'💳'},
                    {label:'Theme',       value:THEMES[theme].name,                     icon:'🎨'},
                    {label:'Language',    value:'English · العربية',                     icon:'🌐'},
                  ].map((item,i,arr)=>(
                    <div key={item.label} style={{
                      display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
                      borderBottom:i<arr.length-1?'1px solid var(--border-card)':'none',
                    }}>
                      <span style={{fontSize:18}}>{item.icon}</span>
                      <span style={{flex:1,fontSize:13,color:'var(--text-primary)',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:12,color:'var(--text-secondary)',fontWeight:600}}>{item.value}</span>
                    </div>
                  ))}
                </GlassCard>

                <GlassCard style={{marginBottom:12}}>
                  {[
                    {label:'Enterprise & Partnerships', icon:'🤝', color:'#FFD60A'},
                    {label:'Privacy Policy',            icon:'🔒', color:'var(--text-secondary)'},
                    {label:'Terms of Service',          icon:'📋', color:'var(--text-secondary)'},
                    {label:'Contact Support',           icon:'💬', color:'var(--accent)'},
                  ].map((item,i,arr)=>(
                    <div key={item.label} style={{
                      display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
                      borderBottom:i<arr.length-1?'1px solid var(--border-card)':'none',
                      cursor:'pointer',
                    }}>
                      <span style={{fontSize:18}}>{item.icon}</span>
                      <span style={{flex:1,fontSize:13,color:item.color,fontWeight:600}}>{item.label}</span>
                      <span style={{color:'var(--text-muted)',fontSize:18}}>›</span>
                    </div>
                  ))}
                </GlassCard>

                {/* Brand footer */}
                <GlassCard style={{padding:'22px',textAlign:'center',marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
                    <LogoMark size={50}/>
                  </div>
                  <div style={{fontSize:17,fontWeight:900,color:'var(--text-primary)',marginBottom:3}}>
                    Cliniverse <span style={{color:'var(--accent)'}}>AI</span>
                  </div>
                  <div style={{fontSize:9,color:'var(--text-muted)',letterSpacing:2,marginBottom:10}}>
                    MEDICAL INTELLIGENCE PLATFORM
                  </div>
                  <div style={{fontSize:11,color:'var(--text-secondary)',lineHeight:1.7}}>
                    🇸🇦 Built in Saudi Arabia · Vision 2030<br/>
                    enterprise@cliniverseai.com
                  </div>
                </GlassCard>

                {onReset && (
                  <button onClick={onReset} style={{
                    width:'100%',padding:'13px',borderRadius:18,
                    border:'1px solid rgba(255,149,10,0.25)',
                    background:'rgba(255,149,10,0.08)',
                    color:'#FF9F0A',fontSize:13,fontWeight:700,
                    cursor:'pointer',fontFamily:F,marginBottom:10,
                  }}>↺ Reset Onboarding</button>
                )}
                {onLogout && (
                  <button onClick={onLogout} style={{
                    width:'100%',padding:'13px',borderRadius:18,
                    border:'1px solid rgba(255,69,58,0.25)',
                    background:'rgba(255,69,58,0.08)',
                    color:'#FF453A',fontSize:14,fontWeight:800,
                    cursor:'pointer',fontFamily:F,
                  }}>Sign Out</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{CSS}</style>
    </div>
  )
}
