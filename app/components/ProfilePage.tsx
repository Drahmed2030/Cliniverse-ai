'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── NO BLACK — Apple Health inspired deep navy/slate ──
const D = {
  // Backgrounds — deep navy, NOT black
  bg:     '#0a1628',   // deep navy base
  bg1:    '#0f1f38',   // slightly lighter
  bg2:    '#142840',   // card surface
  bg3:    '#1a3350',   // card elevated
  // Glass
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  // Borders
  border: 'rgba(255,255,255,0.10)',
  borderHi:'rgba(0,200,184,0.25)',
  // Text — WCAG AA
  t1: '#F2F8FC',
  t2: 'rgba(242,248,252,0.78)',
  t3: 'rgba(242,248,252,0.52)',
  t4: 'rgba(242,248,252,0.32)',
  // Accents
  teal:   '#00C8B8',
  tealDim:'rgba(0,200,184,0.12)',
  tealBd: 'rgba(0,200,184,0.24)',
  blue:   '#1A8CFF',
  green:  '#30D158',
  orange: '#FF9F0A',
  red:    '#FF453A',
  purple: '#BF5AF2',
  gold:   '#FFD60A',
}

const CSS = `
  @keyframes logoGlow {
    0%,100%{filter:drop-shadow(0 0 12px rgba(0,200,184,.50)) drop-shadow(0 0 28px rgba(0,200,184,.20));}
    50%    {filter:drop-shadow(0 0 22px rgba(0,200,184,.75)) drop-shadow(0 0 48px rgba(0,200,184,.32));}
  }
  @keyframes neuralDrift {
    0%,100%{transform:translateY(0);opacity:.18;}
    50%    {transform:translateY(-9px);opacity:.32;}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(14px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes shimmer {
    0%{background-position:200% center;}
    100%{background-position:-200% center;}
  }
`

const RANKS = [
  {name:'Clinical Clerk',          icon:'🩺', color:'#8BA0B4', xpNeeded:0   },
  {name:'Junior Resident',         icon:'📋', color:D.teal,   xpNeeded:100 },
  {name:'Senior Resident',         icon:'🔬', color:D.green,  xpNeeded:300 },
  {name:'Registrar',               icon:'⚕️', color:D.orange, xpNeeded:600 },
  {name:'Specialist',              icon:'🏥', color:D.blue,   xpNeeded:1000},
  {name:'Consultant',              icon:'👨‍⚕️',color:D.red,    xpNeeded:1500},
  {name:'Senior Consultant',       icon:'🎓', color:D.purple, xpNeeded:2200},
  {name:'Chief of Medicine',       icon:'🌟', color:D.gold,   xpNeeded:3000},
]

const BADGES = [
  {id:'first_case',icon:'🏅',name:'First Case',    color:D.gold  },
  {id:'cardio',    icon:'🫀',name:'Cardiologist',  color:D.red   },
  {id:'speed',     icon:'⚡',name:'Lightning MD',  color:D.gold  },
  {id:'streak3',   icon:'🔥',name:'On Fire',       color:D.orange},
  {id:'mcq10',     icon:'🧬',name:'Brain Trust',   color:D.green },
  {id:'stemi',     icon:'❤️‍🔥',name:'STEMI Master', color:D.red   },
  {id:'sepsis',    icon:'🦠',name:'Sepsis Hero',   color:D.orange},
  {id:'sports',    icon:'⚽',name:'FIFA Medic',    color:D.green },
  {id:'peds',      icon:'🧸',name:'Pediatrician',  color:D.purple},
  {id:'lab100',    icon:'🔬',name:'Lab Expert',    color:D.teal  },
  {id:'rad',       icon:'🩻',name:'Radiologist',   color:'#64D2FF'},
]

// ── LOGO MARK ──
function LogoMark({ size=56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{animation:'logoGlow 2.8s ease-in-out infinite'}}>
      <defs>
        <linearGradient id="bgPF" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#102035"/><stop offset="100%" stopColor="#0a1628"/>
        </linearGradient>
        <linearGradient id="arcPF" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/>
          <stop offset="60%" stopColor="#00C8B8"/>
          <stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <linearGradient id="pulPF" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C8B8" stopOpacity="0"/>
          <stop offset="35%" stopColor="#00C8B8"/>
          <stop offset="65%" stopColor="#00E5D4"/>
          <stop offset="100%" stopColor="#0096FF" stopOpacity="0"/>
        </linearGradient>
        <filter id="glPF" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sfPF" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#bgPF)"/>
      <radialGradient id="ambPF" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#00C8B8" stopOpacity="0.10"/>
        <stop offset="100%" stopColor="#00C8B8" stopOpacity="0"/>
      </radialGradient>
      <rect width="120" height="120" rx="28" fill="url(#ambPF)"/>
      <rect x="1" y="1" width="118" height="118" rx="27" fill="none" stroke="rgba(0,200,184,0.22)" strokeWidth="1.5"/>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcPF)" strokeWidth="7" strokeLinecap="round" filter="url(#glPF)"/>
      <path d="M 80 44 A 24 24 0 1 0 80 76" fill="none" stroke="#00C8B8" strokeWidth="0.8" strokeLinecap="round" opacity="0.15"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4" filter="url(#sfPF)" opacity="0.95">
        <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF" filter="url(#sfPF)" opacity="0.9">
        <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <line x1="28" y1="60" x2="78" y2="60" stroke="#00C8B8" strokeWidth="0.5" opacity="0.12"/>
      <polyline points="28,60 36,60 40,60 44,48 48,72 52,55 56,65 60,60 78,60"
        fill="none" stroke="url(#pulPF)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#glPF)" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.2s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
      </polyline>
      <circle cx="60" cy="60" r="0" fill="none" stroke="#00C8B8" strokeWidth="1.2" opacity="0">
        <animate attributeName="r" values="0;24" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0" dur="2.2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; unlockedBadges:string[]; setShowUpgrade:(v:boolean)=>void
  onLogout?:()=>void
}

export default function ProfilePage({ xp, streak, casesCompleted, mcqCorrect, isPro, unlockedBadges, setShowUpgrade, onLogout }: Props) {
  const [tab, setTab] = useState<'stats'|'badges'|'settings'>('stats')

  const rank     = [...RANKS].reverse().find(r => xp >= r.xpNeeded) || RANKS[0]
  const nextRank = RANKS[RANKS.findIndex(r => r.name === rank.name) + 1]
  const xpToNext = nextRank ? nextRank.xpNeeded - xp : 0
  const pct      = nextRank ? Math.min(((xp - rank.xpNeeded) / (nextRank.xpNeeded - rank.xpNeeded)) * 100, 100) : 100

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${D.bg} 0%,${D.bg1} 50%,${D.bg} 100%)`, fontFamily:F, position:'relative', overflow:'hidden' }}>

      {/* Aurora top glow — navy blue, NOT black */}
      <div style={{position:'fixed',top:0,left:0,right:0,height:'45%',background:'radial-gradient(ellipse at 50% 0%,rgba(0,200,184,0.10) 0%,rgba(26,140,255,0.06) 45%,transparent 75%)',pointerEvents:'none',zIndex:0}}/>

      {/* Neural ambient dots */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        {[{x:'9%',y:'25%'},{x:'87%',y:'18%'},{x:'92%',y:'68%'},{x:'5%',y:'74%'},{x:'50%',y:'4%'}].map((n,i)=>(
          <div key={i} style={{position:'absolute',left:n.x,top:n.y,width:4,height:4,borderRadius:'50%',background:i%2===0?D.teal:D.blue,animation:`neuralDrift ${2.4+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.25}s`}}/>
        ))}
      </div>

      <div style={{position:'relative',zIndex:1,padding:'20px 16px 120px',maxWidth:540,margin:'0 auto',animation:'fadeUp 0.4s ease'}}>

        {/* ── HEADER CARD ── */}
        <div style={{
          background:`linear-gradient(135deg,${D.bg3},${D.bg2})`,
          border:`1.5px solid ${D.tealBd}`,
          borderRadius:28,padding:'22px 20px',marginBottom:12,
          position:'relative',overflow:'hidden',
        }}>
          {/* Ambient glow inside card */}
          <div style={{position:'absolute',top:-50,right:-50,width:180,height:180,borderRadius:'50%',background:`radial-gradient(circle,rgba(0,200,184,0.12),transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-30,left:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,rgba(26,140,255,0.08),transparent 70%)`,pointerEvents:'none'}}/>

          {/* Avatar + info */}
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}>
            <LogoMark size={66}/>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:D.teal,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>CLINIVERSE AI · PROFILE</div>
              <div style={{fontSize:19,fontWeight:900,color:D.t1,marginBottom:5}}>Dr. Ahmed Osman</div>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:15}}>{rank.icon}</span>
                <span style={{fontSize:13,color:rank.color,fontWeight:700}}>{rank.name}</span>
                {isPro && (
                  <span style={{fontSize:9,background:'linear-gradient(135deg,#FFD60A,#B8860B)',color:'#000',borderRadius:8,padding:'2px 9px',fontWeight:900}}>PRO</span>
                )}
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
              <span style={{fontSize:11,color:D.t3,fontWeight:600}}>XP Progress</span>
              <span style={{fontSize:11,color:D.teal,fontWeight:700}}>
                {xp} XP{nextRank?` · ${xpToNext} to ${nextRank.name}`:'  · MAX RANK'}
              </span>
            </div>
            <div style={{height:7,borderRadius:4,background:'rgba(255,255,255,0.09)',overflow:'hidden'}}>
              <div style={{
                height:'100%',borderRadius:4,
                background:`linear-gradient(90deg,${D.teal},${D.blue})`,
                width:`${pct}%`,
                boxShadow:`0 0 10px ${D.teal}55`,
                transition:'width 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}/>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{display:'flex',gap:8}}>
            {[
              {l:'Streak', v:`${streak}🔥`, c:D.orange},
              {l:'Cases',  v:casesCompleted, c:D.teal  },
              {l:'MCQ',    v:mcqCorrect,     c:D.purple},
              {l:'Badges', v:unlockedBadges.length, c:D.gold},
            ].map(s=>(
              <div key={s.l} style={{flex:1,background:'rgba(255,255,255,0.06)',border:`1px solid rgba(255,255,255,0.10)`,borderRadius:14,padding:'10px 4px',textAlign:'center'}}>
                <div style={{fontSize:15,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:8,color:D.t4,marginTop:2,fontWeight:600}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRO banner */}
        {!isPro && (
          <div onClick={()=>setShowUpgrade(true)} style={{
            background:'linear-gradient(135deg,rgba(255,214,10,0.10),rgba(255,159,10,0.07))',
            border:'1.5px solid rgba(255,214,10,0.24)',
            borderRadius:22,padding:'14px 16px',marginBottom:12,
            cursor:'pointer',display:'flex',alignItems:'center',gap:12,
          }}>
            <div style={{fontSize:30}}>⭐</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:900,color:D.gold,marginBottom:2}}>Upgrade to Pro</div>
              <div style={{fontSize:12,color:D.t2,lineHeight:1.5}}>Ambient Scribe · FHIR · Unlimited cases</div>
            </div>
            <div style={{width:34,height:34,borderRadius:11,background:'rgba(255,214,10,0.14)',border:'1px solid rgba(255,214,10,0.28)',display:'flex',alignItems:'center',justifyContent:'center',color:D.gold,fontSize:18}}>›</div>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:6,background:'rgba(255,255,255,0.05)',borderRadius:18,padding:4,marginBottom:14,border:`1px solid ${D.border}`}}>
          {([['stats','📊 Stats'],['badges','🏅 Badges'],['settings','⚙️ Settings']] as [string,string][]).map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id as any)} style={{
              flex:1,padding:'10px 4px',cursor:'pointer',borderRadius:14,fontFamily:F,
              fontWeight:700,fontSize:11,
              border:tab===id?`1px solid ${D.tealBd}`:'1px solid transparent',
              background:tab===id?'rgba(0,200,184,0.10)':'transparent',
              color:tab===id?D.teal:D.t4,transition:'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── STATS ── */}
        {tab==='stats' && (
          <div>
            <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CLINICAL PERFORMANCE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              {[
                {icon:'📈',label:'Cases Done',  value:casesCompleted, color:D.teal,  sub:'Simulations'},
                {icon:'🧠',label:'MCQ Correct', value:mcqCorrect,     color:D.purple,sub:'Board questions'},
                {icon:'🔥',label:'Day Streak',  value:streak,          color:D.orange,sub:'Consecutive days'},
                {icon:'⚡',label:'Total XP',    value:xp,              color:D.gold,  sub:rank.name},
              ].map(s=>(
                <div key={s.label} style={{
                  background:`linear-gradient(135deg,${D.bg3},${D.bg2})`,
                  border:`1.5px solid ${s.color}20`,
                  borderRadius:22,padding:'17px 14px',
                  position:'relative',overflow:'hidden',
                }}>
                  <div style={{position:'absolute',top:-18,right:-18,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${s.color}12,transparent 70%)`,pointerEvents:'none'}}/>
                  <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:23,fontWeight:900,color:s.color,marginBottom:2}}>{s.value}</div>
                  <div style={{fontSize:12,color:D.t1,fontWeight:700,marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:10,color:D.t3}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Rank ladder */}
            <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>RANK LADDER</div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {RANKS.map(r=>{
                const isCurrent = r.name===rank.name
                const unlocked  = xp>=r.xpNeeded
                return (
                  <div key={r.name} style={{
                    background:isCurrent?`${r.color}12`:'rgba(255,255,255,0.04)',
                    border:`1.5px solid ${isCurrent?r.color:'rgba(255,255,255,0.08)'}${isCurrent?'30':''}`,
                    borderRadius:16,padding:'11px 14px',
                    display:'flex',alignItems:'center',gap:10,
                    opacity:unlocked?1:0.38,
                  }}>
                    <span style={{fontSize:22}}>{r.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:isCurrent?800:600,color:isCurrent?r.color:D.t2}}>{r.name}</div>
                      <div style={{fontSize:10,color:D.t4}}>{r.xpNeeded} XP</div>
                    </div>
                    {isCurrent&&<span style={{fontSize:9,background:`${r.color}20`,border:`1px solid ${r.color}30`,color:r.color,borderRadius:8,padding:'2px 9px',fontWeight:800}}>CURRENT</span>}
                    {unlocked&&!isCurrent&&<span style={{color:D.green,fontSize:15}}>✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BADGES ── */}
        {tab==='badges' && (
          <div>
            <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>
              EARNED BADGES ({unlockedBadges.length}/{BADGES.length})
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {BADGES.map(b=>{
                const earned=unlockedBadges.includes(b.id)
                return (
                  <div key={b.id} style={{
                    background:earned?`${b.color}10`:'rgba(255,255,255,0.04)',
                    border:`1.5px solid ${earned?b.color:'rgba(255,255,255,0.08)'}${earned?'28':''}`,
                    borderRadius:20,padding:'15px 8px',textAlign:'center',
                    opacity:earned?1:0.32,position:'relative',overflow:'hidden',
                  }}>
                    {earned&&<div style={{position:'absolute',top:-12,right:-12,width:45,height:45,borderRadius:'50%',background:`radial-gradient(circle,${b.color}18,transparent 70%)`,pointerEvents:'none'}}/>}
                    <div style={{fontSize:30,marginBottom:7}}>{b.icon}</div>
                    <div style={{fontSize:9,fontWeight:700,color:earned?b.color:D.t4,lineHeight:1.3}}>{b.name}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==='settings' && (
          <div>
            <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>ACCOUNT</div>

            {/* Info rows */}
            <div style={{background:`linear-gradient(135deg,${D.bg3},${D.bg2})`,border:`1px solid ${D.border}`,borderRadius:22,overflow:'hidden',marginBottom:12}}>
              {[
                {label:'App Version', value:'v2.0 · 2026',             icon:'📱'},
                {label:'Plan',        value:isPro?'Pro ⭐':'Free',      icon:'💳'},
                {label:'Language',    value:'English · العربية',         icon:'🌐'},
                {label:'Theme',       value:'Dark Navy · Bioluminescence',icon:'🎨'},
              ].map((item,i,arr)=>(
                <div key={item.label} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom:i<arr.length-1?`1px solid ${D.border}`:'none'}}>
                  <span style={{fontSize:19}}>{item.icon}</span>
                  <span style={{flex:1,fontSize:13,color:D.t1,fontWeight:600}}>{item.label}</span>
                  <span style={{fontSize:12,color:D.t3,fontWeight:600}}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Links */}
            <div style={{background:`linear-gradient(135deg,${D.bg3},${D.bg2})`,border:`1px solid ${D.border}`,borderRadius:22,overflow:'hidden',marginBottom:12}}>
              {[
                {label:'Enterprise & Partnerships',icon:'🤝',color:D.gold },
                {label:'Privacy Policy',           icon:'🔒',color:D.t3  },
                {label:'Terms of Service',         icon:'📋',color:D.t3  },
                {label:'Contact Support',          icon:'💬',color:D.teal},
              ].map((item,i,arr)=>(
                <div key={item.label} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom:i<arr.length-1?`1px solid ${D.border}`:'none',cursor:'pointer'}}>
                  <span style={{fontSize:19}}>{item.icon}</span>
                  <span style={{flex:1,fontSize:13,color:item.color===D.t3?D.t2:item.color,fontWeight:600}}>{item.label}</span>
                  <span style={{color:D.t4,fontSize:18}}>›</span>
                </div>
              ))}
            </div>

            {/* Brand footer */}
            <div style={{
              background:`linear-gradient(135deg,${D.bg3},${D.bg2})`,
              border:`1.5px solid ${D.tealBd}`,
              borderRadius:24,padding:'20px',
              textAlign:'center',marginBottom:12,
              position:'relative',overflow:'hidden',
            }}>
              <div style={{position:'absolute',top:-30,left:'50%',transform:'translateX(-50%)',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,200,184,0.08),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
                <LogoMark size={52}/>
              </div>
              <div style={{fontSize:16,fontWeight:900,color:D.t1,marginBottom:4}}>
                Cliniverse <span style={{color:D.teal}}>AI</span>
              </div>
              <div style={{fontSize:10,color:D.t3,letterSpacing:2,marginBottom:10}}>MEDICAL INTELLIGENCE PLATFORM</div>
              <div style={{fontSize:11,color:D.t3,lineHeight:1.7}}>
                🇸🇦 Built in Saudi Arabia · Vision 2030<br/>
                enterprise@cliniverseai.com
              </div>
            </div>

            {onLogout && (
              <button onClick={onLogout} style={{width:'100%',padding:'14px',borderRadius:20,border:'1.5px solid rgba(255,69,58,0.22)',background:'rgba(255,69,58,0.07)',color:D.red,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:F}}>
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
      <style>{CSS}</style>
    </div>
  )
}
