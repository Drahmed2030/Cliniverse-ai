'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ThemeToggle        = dynamic(() => import('./ThemeToggle'),        { ssr:false })
const AppearanceSettings = dynamic(() => import('./AppearanceSettings'), { ssr:false })
const PersonaliseHome    = dynamic(() => import('./PersonaliseHome'),    { ssr:false })
const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), { ssr:false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes ringPulse {
    0%  { transform:scale(1);   opacity:0.6; }
    70% { transform:scale(1.5); opacity:0;   }
    100%{ transform:scale(1);   opacity:0;   }
  }
  @keyframes logoGlow {
    0%,100%{filter:drop-shadow(0 0 10px rgba(0,200,184,.45));}
    50%    {filter:drop-shadow(0 0 20px rgba(0,200,184,.75));}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(14px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes shimmer {
    0%  {background-position:200% center;}
    100%{background-position:-200% center;}
  }
  @keyframes badgePop {
    0%  {transform:scale(0.7);opacity:0;}
    80% {transform:scale(1.1);}
    100%{transform:scale(1);opacity:1;}
  }
`

const RANKS = [
  {name:'Clinical Clerk',          icon:'🩺', color:'#8BA0B4', xpNeeded:0,    ring:'#8BA0B4'},
  {name:'Junior Resident',         icon:'📋', color:'#00C8B8', xpNeeded:100,  ring:'#00C8B8'},
  {name:'Senior Resident',         icon:'🔬', color:'#30D158', xpNeeded:300,  ring:'#30D158'},
  {name:'Registrar',               icon:'⚕️', color:'#FF9F0A', xpNeeded:600,  ring:'#FF9F0A'},
  {name:'Specialist',              icon:'🏥', color:'#1A8CFF', xpNeeded:1000, ring:'#1A8CFF'},
  {name:'Consultant',              icon:'👨‍⚕️',color:'#FF453A', xpNeeded:1500, ring:'#FF453A'},
  {name:'Senior Consultant',       icon:'🎓', color:'#BF5AF2', xpNeeded:2200, ring:'#BF5AF2'},
  {name:'Chief of Medicine',       icon:'🌟', color:'#FFD60A', xpNeeded:3000, ring:'#FFD60A'},
]

// iOS 26 style badges — using shapes instead of emojis
const BADGES = [
  {id:'first_case', label:'First Case',    color:'#FFD60A', shape:'star',   unlockAt:'Complete 1 case'},
  {id:'cardio',     label:'Cardiologist',  color:'#FF453A', shape:'heart',  unlockAt:'Complete 5 cardio cases'},
  {id:'speed',      label:'Lightning MD',  color:'#FFD60A', shape:'bolt',   unlockAt:'Answer in < 10 seconds'},
  {id:'streak3',    label:'On Fire',       color:'#FF9F0A', shape:'flame',  unlockAt:'3-day streak'},
  {id:'mcq10',      label:'Brain Trust',   color:'#30D158', shape:'brain',  unlockAt:'10 MCQ correct'},
  {id:'stemi',      label:'STEMI Master',  color:'#FF453A', shape:'ecg',    unlockAt:'Complete STEMI case'},
  {id:'sepsis',     label:'Sepsis Hero',   color:'#FF9F0A', shape:'shield', unlockAt:'Complete Sepsis case'},
  {id:'sports',     label:'FIFA Medic',    color:'#30D158', shape:'bolt',   unlockAt:'Complete Sports case'},
  {id:'peds',       label:'Paediatrics',   color:'#BF5AF2', shape:'star',   unlockAt:'Complete Peds case'},
  {id:'lab',        label:'Lab Expert',    color:'#00C8B8', shape:'hex',    unlockAt:'10 lab cases'},
  {id:'rad',        label:'Radiologist',   color:'#1A8CFF', shape:'hex',    unlockAt:'5 radiology cases'},
  {id:'pro',        label:'Pro Member',    color:'#FFD60A', shape:'crown',  unlockAt:'Subscribe to Pro'},
]

// Badge shape SVG
function BadgeShape({ shape, color, size=32 }: { shape:string, color:string, size?:number }) {
  const s = size
  switch(shape) {
    case 'star':   return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12" fill={color} opacity="0.9"/></svg>
    case 'heart':  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 28s-12-8-12-16a8 8 0 0 1 12-6.9A8 8 0 0 1 28 12c0 8-12 16-12 16z" fill={color} opacity="0.9"/></svg>
    case 'bolt':   return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="18,2 8,18 15,18 14,30 24,14 17,14" fill={color} opacity="0.9"/></svg>
    case 'flame':  return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 2c0 0 8 8 8 16a8 8 0 0 1-16 0c0-4 2-7 2-7s1 4 4 5c0 0-2-8 2-14z" fill={color} opacity="0.9"/></svg>
    case 'brain':  return <svg width={s} height={s} viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="12" ry="10" fill={color} opacity="0.9"/><ellipse cx="16" cy="16" rx="6" ry="5" fill="rgba(0,0,0,0.15)"/></svg>
    case 'shield': return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M16 2L4 8v10c0 7 6 11 12 12 6-1 12-5 12-12V8z" fill={color} opacity="0.9"/></svg>
    case 'crown':  return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="4,24 4,10 10,16 16,4 22,16 28,10 28,24" fill={color} opacity="0.9"/><rect x="4" y="24" width="24" height="4" rx="2" fill={color} opacity="0.9"/></svg>
    case 'hex':    return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill={color} opacity="0.9"/></svg>
    case 'ecg':    return <svg width={s} height={s} viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill={color} opacity="0.9"/><polyline points="2,16 8,16 11,8 14,24 17,12 20,20 23,16 30,16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    default:       return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill={color} opacity="0.9"/></svg>
  }
}

// Logo mark
function LogoMark({ size=60 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{animation:'logoGlow 2.8s ease-in-out infinite'}}>
      <defs>
        <linearGradient id="arcPG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/><stop offset="60%" stopColor="#00C8B8"/><stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <linearGradient id="pulPG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C8B8" stopOpacity="0"/>
          <stop offset="35%" stopColor="#00C8B8"/>
          <stop offset="65%" stopColor="#00E5D4"/>
          <stop offset="100%" stopColor="#0096FF" stopOpacity="0"/>
        </linearGradient>
        <filter id="glPG" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="28" fill="#0d1f30"/>
      <radialGradient id="ambPG" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#00C8B8" stopOpacity="0.10"/>
        <stop offset="100%" stopColor="#00C8B8" stopOpacity="0"/>
      </radialGradient>
      <rect width="120" height="120" rx="28" fill="url(#ambPG)"/>
      <rect x="1" y="1" width="118" height="118" rx="27" fill="none" stroke="rgba(0,200,184,0.20)" strokeWidth="1.5"/>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcPG)" strokeWidth="7" strokeLinecap="round" filter="url(#glPG)"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4" filter="url(#glPG)">
        <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF" filter="url(#glPG)">
        <animate attributeName="r" values="3;6;3" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
        fill="none" stroke="url(#pulPG)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#glPG)" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
      </polyline>
    </svg>
  )
}

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; unlockedBadges?:string[]
  name?:string; onUpgrade?:()=>void; onReset?:()=>void; onLogout?:()=>void
  setShowUpgrade?:(v:boolean)=>void
}

export default function ProfilePage({
  xp, streak, casesCompleted, mcqCorrect,
  isPro, unlockedBadges=[], name, onUpgrade, onReset, onLogout, setShowUpgrade
}: Props) {
  const [tab, setTab]         = useState<'overview'|'badges'|'settings'>('overview')
  const [settingTab, setSettingTab] = useState<'general'|'theme'|'appearance'|'home'>('general')
  const [showCert, setShowCert] = useState(false)
  const [survey, setSurvey]   = useState<any>(null)

  useEffect(() => {
    const s = localStorage.getItem('cliniverse-survey')
    if (s) setSurvey(JSON.parse(s))
  }, [])

  const rank    = [...RANKS].reverse().find(r => xp >= r.xpNeeded) || RANKS[0]
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1]
  const pct     = nextRank ? Math.min(((xp - rank.xpNeeded) / (nextRank.xpNeeded - rank.xpNeeded)) * 100, 100) : 100
  const xpToNext = nextRank ? nextRank.xpNeeded - xp : 0
  const displayName = survey?.greeting || name || 'Doctor'

  if (showCert) return (
    <div style={{ padding:'0 0 120px' }}>
      <CertificateGenerator
        doctorName={displayName}
        casesCompleted={casesCompleted}
        mcqCorrect={mcqCorrect}
        xp={xp}
        streak={streak}
        specialties={survey?.specialty ? [survey.specialty] : []}
        onClose={() => setShowCert(false)}
      />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0d1828,#0f2040,#0d1828)', fontFamily:F, position:'relative', overflow:'hidden' }}>

      {/* Aurora */}
      <div style={{position:'fixed',top:0,left:0,right:0,height:'50%',background:'radial-gradient(ellipse at 50% 0%,rgba(0,200,184,0.08),rgba(26,140,255,0.05) 40%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      <div style={{ position:'relative', zIndex:1, padding:'20px 16px 130px', maxWidth:540, margin:'0 auto', animation:'fadeUp 0.4s ease' }}>

        {/* ── HERO PROFILE CARD ── */}
        <div style={{
          background:'linear-gradient(135deg,rgba(20,40,64,0.90),rgba(15,30,50,0.95))',
          border:'1.5px solid rgba(0,200,184,0.22)',
          borderRadius:28, padding:'24px 20px', marginBottom:14,
          position:'relative', overflow:'hidden',
          backdropFilter:'blur(20px)',
        }}>
          {/* Ambient glow */}
          <div style={{position:'absolute',top:-50,right:-50,width:180,height:180,borderRadius:'50%',background:`radial-gradient(circle,${rank.ring}12,transparent 70%)`,pointerEvents:'none'}}/>

          {/* Top row */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:20 }}>

            {/* Avatar with Apple-style rank ring */}
            <div style={{ position:'relative', flexShrink:0 }}>
              {/* Outer ping ring */}
              <div style={{ position:'absolute', inset:-6, borderRadius:'50%', border:`2px solid ${rank.ring}`, animation:'ringPulse 2s ease-out infinite', opacity:0.4 }}/>
              {/* Rank ring */}
              <div style={{ position:'absolute', inset:-4, borderRadius:'50%', background:`conic-gradient(${rank.ring} ${pct}%, rgba(255,255,255,0.08) ${pct}%)` }}/>
              {/* Logo avatar */}
              <div style={{ position:'relative', zIndex:1, margin:3 }}>
                <LogoMark size={66}/>
              </div>
              {/* PRO badge */}
              {isPro && (
                <div style={{ position:'absolute', bottom:-2, right:-2, background:'linear-gradient(135deg,#FFD60A,#FF9F0A)', borderRadius:10, padding:'2px 7px', fontSize:8, color:'#000', fontWeight:900, zIndex:2, boxShadow:'0 2px 8px rgba(255,214,10,0.50)' }}>PRO</div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:'rgba(0,200,184,0.80)', fontWeight:700, letterSpacing:1.5, marginBottom:4 }}>CLINIVERSE AI</div>
              <div style={{ fontSize:20, fontWeight:900, color:'#F2F8FC', marginBottom:5, letterSpacing:-0.4 }}>
                {displayName}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:15 }}>{rank.icon}</span>
                <span style={{ fontSize:13, color:rank.color, fontWeight:700 }}>{rank.name}</span>
              </div>
              {survey?.specialty && (
                <div style={{ fontSize:11, color:'rgba(242,248,252,0.50)', fontWeight:500 }}>{survey.specialty} · {survey.country || 'Saudi Arabia'}</div>
              )}
            </div>
          </div>

          {/* XP Progress — Apple style */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:11, color:'rgba(242,248,252,0.55)', fontWeight:600 }}>{xp} XP</span>
              <span style={{ fontSize:11, color:rank.color, fontWeight:700 }}>
                {nextRank ? `${xpToNext} XP to ${nextRank.name}` : '🏆 MAX RANK'}
              </span>
            </div>
            {/* Segmented progress bar */}
            <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.08)', overflow:'hidden', position:'relative' }}>
              <div style={{
                height:'100%', borderRadius:4,
                background:`linear-gradient(90deg,${rank.ring},${rank.ring}BB)`,
                width:`${pct}%`,
                boxShadow:`0 0 10px ${rank.ring}60`,
                transition:'width 1s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}/>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:8 }}>
            {[
              {l:'Cases',   v:casesCompleted, c:'#00C8B8'},
              {l:'MCQ',     v:mcqCorrect,     c:'#BF5AF2'},
              {l:'Streak',  v:`${streak}🔥`,  c:'#FF9F0A'},
              {l:'Badges',  v:unlockedBadges.length, c:'#FFD60A'},
            ].map(s => (
              <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'9px 4px', textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:900, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:8, color:'rgba(242,248,252,0.40)', marginTop:2, fontWeight:600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate button */}
        <div onClick={() => setShowCert(true)} style={{
          background:'linear-gradient(135deg,rgba(255,214,10,0.10),rgba(255,159,10,0.07))',
          border:'1.5px solid rgba(255,214,10,0.25)',
          borderRadius:20, padding:'14px 16px', marginBottom:14,
          cursor:'pointer', display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{ fontSize:28 }}>🎓</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#FFD60A' }}>Generate Certificate</div>
            <div style={{ fontSize:11, color:'rgba(242,248,252,0.55)' }}>Share your achievement on LinkedIn</div>
          </div>
          <div style={{ fontSize:20, color:'rgba(255,214,10,0.60)' }}>›</div>
        </div>

        {/* PRO upgrade */}
        {!isPro && (
          <div onClick={() => { onUpgrade?.(); setShowUpgrade?.(true) }} style={{
            background:'linear-gradient(135deg,rgba(191,90,242,0.12),rgba(26,140,255,0.08))',
            border:'1.5px solid rgba(191,90,242,0.28)',
            borderRadius:20, padding:'14px 16px', marginBottom:14,
            cursor:'pointer', display:'flex', alignItems:'center', gap:12,
          }}>
            <div style={{ fontSize:28 }}>⭐</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#BF5AF2' }}>Upgrade to Pro</div>
              <div style={{ fontSize:11, color:'rgba(242,248,252,0.55)' }}>Scribe · FHIR · Unlimited · SOAP</div>
            </div>
            <div style={{ background:'linear-gradient(135deg,#BF5AF2,#1A8CFF)', borderRadius:12, padding:'6px 14px', fontSize:12, color:'#fff', fontWeight:800 }}>Upgrade</div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, background:'rgba(255,255,255,0.05)', borderRadius:18, padding:4, marginBottom:16, border:'1px solid rgba(255,255,255,0.08)' }}>
          {([['overview','📊 Overview'],['badges','🏅 Badges'],['settings','⚙️ Settings']] as [string,string][]).map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id as any)} style={{ flex:1, padding:'10px 4px', cursor:'pointer', borderRadius:14, fontFamily:F, fontWeight:700, fontSize:11, border:tab===id?'1px solid rgba(0,200,184,0.35)':'1px solid transparent', background:tab===id?'rgba(0,200,184,0.12)':'transparent', color:tab===id?'#00C8B8':'rgba(242,248,252,0.40)', transition:'all 0.2s' }}>{label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div>
            {/* Survey data */}
            {survey && (
              <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden', marginBottom:14 }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,200,184,0.06)' }}>
                  <div style={{ fontSize:10, color:'#00C8B8', fontWeight:700, letterSpacing:1.5 }}>YOUR PROFILE</div>
                </div>
                {[
                  {k:'Specialty',  v:survey.specialty,  icon:'🏥'},
                  {k:'Level',      v:survey.level,      icon:'📋'},
                  {k:'Goal',       v:survey.goal,       icon:'🎯'},
                  {k:'Board',      v:survey.board === 'skip' ? '—' : survey.board, icon:'🎓'},
                  {k:'Study Time', v:survey.hours,      icon:'⏰'},
                  {k:'Country',    v:survey.country,    icon:'🌍'},
                ].filter(r => r.v && r.v !== 'undefined').map((row,i,arr) => (
                  <div key={row.k} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                    <span style={{ fontSize:18 }}>{row.icon}</span>
                    <span style={{ flex:1, fontSize:13, color:'rgba(242,248,252,0.70)', fontWeight:500 }}>{row.k}</span>
                    <span style={{ fontSize:13, color:'#F2F8FC', fontWeight:700 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rank ladder */}
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.40)', fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>RANK LADDER</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {RANKS.map(r => {
                const isCurrent = r.name === rank.name
                const unlocked  = xp >= r.xpNeeded
                return (
                  <div key={r.name} style={{ display:'flex', alignItems:'center', gap:12, background:isCurrent?`${r.ring}10`:'rgba(255,255,255,0.04)', border:`1.5px solid ${isCurrent?r.ring+'35':'rgba(255,255,255,0.07)'}`, borderRadius:16, padding:'11px 14px', opacity:unlocked?1:0.35 }}>
                    {/* Rank dot */}
                    <div style={{ width:10, height:10, borderRadius:'50%', background:unlocked?r.ring:'rgba(255,255,255,0.15)', flexShrink:0, boxShadow:unlocked?`0 0 8px ${r.ring}60`:'' }}/>
                    <span style={{ fontSize:20 }}>{r.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:isCurrent?800:600, color:isCurrent?r.color:'rgba(242,248,252,0.70)' }}>{r.name}</div>
                      <div style={{ fontSize:10, color:'rgba(242,248,252,0.38)' }}>{r.xpNeeded} XP</div>
                    </div>
                    {isCurrent && <span style={{ fontSize:9, background:`${r.ring}22`, border:`1px solid ${r.ring}35`, color:r.color, borderRadius:8, padding:'3px 9px', fontWeight:800 }}>CURRENT</span>}
                    {unlocked && !isCurrent && <span style={{ color:'#30D158', fontSize:16 }}>✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {tab === 'badges' && (
          <div>
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.40)', fontWeight:700, letterSpacing:1.5, marginBottom:14 }}>
              ACHIEVEMENTS — {unlockedBadges.length}/{BADGES.length} EARNED
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {BADGES.map((b,i) => {
                const earned = unlockedBadges.includes(b.id)
                return (
                  <div key={b.id} style={{
                    background: earned ? `${b.color}10` : 'rgba(255,255,255,0.03)',
                    border:`1.5px solid ${earned ? b.color+'30' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius:20, padding:'16px 8px',
                    textAlign:'center', position:'relative', overflow:'hidden',
                    opacity: earned ? 1 : 0.30,
                    animation: earned ? `badgePop 0.4s ease ${i*0.05}s both` : 'none',
                  }}>
                    {earned && <div style={{ position:'absolute', top:-15, right:-15, width:50, height:50, borderRadius:'50%', background:`radial-gradient(circle,${b.color}20,transparent 70%)`, pointerEvents:'none' }}/>}

                    {/* Badge shape */}
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:8, filter: earned ? `drop-shadow(0 0 8px ${b.color}60)` : 'grayscale(1)' }}>
                      <BadgeShape shape={b.shape} color={earned ? b.color : '#636E82'} size={34}/>
                    </div>
                    <div style={{ fontSize:9, fontWeight:800, color: earned ? b.color : 'rgba(242,248,252,0.35)', lineHeight:1.3, marginBottom:earned?0:4 }}>{b.label}</div>
                    {!earned && <div style={{ fontSize:7, color:'rgba(242,248,252,0.25)', lineHeight:1.3, marginTop:3 }}>{b.unlockAt}</div>}
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
            <div style={{ display:'flex', gap:5, background:'rgba(255,255,255,0.04)', borderRadius:16, padding:4, marginBottom:16, border:'1px solid rgba(255,255,255,0.08)', overflowX:'auto' }}>
              {([['general','⚙️ General'],['theme','🎨 Theme'],['appearance','✨ Display'],['home','🏠 Home']] as [string,string][]).map(([id,label])=>(
                <button key={id} onClick={()=>setSettingTab(id as any)} style={{ flexShrink:0, padding:'9px 12px', cursor:'pointer', borderRadius:12, fontFamily:F, fontWeight:700, fontSize:10, border:settingTab===id?'1px solid rgba(0,200,184,0.35)':'1px solid transparent', background:settingTab===id?'rgba(0,200,184,0.12)':'transparent', color:settingTab===id?'#00C8B8':'rgba(242,248,252,0.45)', transition:'all 0.2s' }}>{label}</button>
              ))}
            </div>

            {settingTab === 'theme'      && <ThemeToggle/>}
            {settingTab === 'appearance' && <AppearanceSettings/>}
            {settingTab === 'home'       && <PersonaliseHome/>}

            {settingTab === 'general' && (
              <div>
                {/* App info */}
                <div style={{ background:'linear-gradient(135deg,rgba(20,40,64,0.90),rgba(15,30,50,0.95))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:22, overflow:'hidden', marginBottom:12 }}>
                  {[
                    {label:'App Version',  value:'v2.0 · 2026',              icon:'📱'},
                    {label:'Plan',         value:isPro?'⭐ Pro':'Free',       icon:'💳'},
                    {label:'Language',     value:'English · العربية',          icon:'🌐'},
                    {label:'Theme',        value:'Dark Navy · Bioluminescence',icon:'🎨'},
                  ].map((item,i,arr)=>(
                    <div key={item.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                      <span style={{ fontSize:19 }}>{item.icon}</span>
                      <span style={{ flex:1, fontSize:13, color:'rgba(242,248,252,0.80)', fontWeight:600 }}>{item.label}</span>
                      <span style={{ fontSize:12, color:'rgba(242,248,252,0.45)', fontWeight:600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Links */}
                <div style={{ background:'linear-gradient(135deg,rgba(20,40,64,0.90),rgba(15,30,50,0.95))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:22, overflow:'hidden', marginBottom:12 }}>
                  {[
                    {label:'Enterprise & Partnerships', icon:'🤝', color:'#FFD60A'},
                    {label:'Privacy Policy',            icon:'🔒', color:'rgba(242,248,252,0.60)'},
                    {label:'Terms of Service',          icon:'📋', color:'rgba(242,248,252,0.60)'},
                    {label:'Contact Support',           icon:'💬', color:'#00C8B8'},
                  ].map((item,i,arr)=>(
                    <div key={item.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.06)':'none', cursor:'pointer' }}>
                      <span style={{ fontSize:19 }}>{item.icon}</span>
                      <span style={{ flex:1, fontSize:13, color:item.color, fontWeight:600 }}>{item.label}</span>
                      <span style={{ color:'rgba(242,248,252,0.30)', fontSize:18 }}>›</span>
                    </div>
                  ))}
                </div>

                {/* Brand footer */}
                <div style={{ background:'linear-gradient(135deg,rgba(20,40,64,0.90),rgba(15,30,50,0.95))', border:'1.5px solid rgba(0,200,184,0.18)', borderRadius:22, padding:'20px', textAlign:'center', marginBottom:12, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-30, left:'50%', transform:'translateX(-50%)', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,184,0.07),transparent 70%)', pointerEvents:'none' }}/>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                    <LogoMark size={50}/>
                  </div>
                  <div style={{ fontSize:17, fontWeight:900, color:'#F2F8FC', marginBottom:4 }}>
                    Cliniverse <span style={{ color:'#00C8B8' }}>AI</span>
                  </div>
                  <div style={{ fontSize:10, color:'rgba(242,248,252,0.38)', letterSpacing:2, marginBottom:10 }}>MEDICAL INTELLIGENCE PLATFORM</div>
                  <div style={{ fontSize:11, color:'rgba(242,248,252,0.45)', lineHeight:1.7 }}>
                    🇸🇦 Built in Saudi Arabia · Vision 2030<br/>
                    enterprise@cliniverseai.com
                  </div>
                </div>

                {onReset && (
                  <button onClick={onReset} style={{ width:'100%', padding:'13px', borderRadius:18, border:'1px solid rgba(255,149,10,0.25)', background:'rgba(255,149,10,0.08)', color:'#FF9F0A', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F, marginBottom:10 }}>
                    ↺ Reset Onboarding
                  </button>
                )}
                {onLogout && (
                  <button onClick={onLogout} style={{ width:'100%', padding:'13px', borderRadius:18, border:'1px solid rgba(255,69,58,0.25)', background:'rgba(255,69,58,0.08)', color:'#FF453A', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:F }}>
                    Sign Out
                  </button>
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
