'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), { ssr:false })

const F = 'var(--font,-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif)'

const RANKS = [
  { name:'Clinical Clerk',    icon:'🩺', color:'#64748b', xpNeeded:0    },
  { name:'Junior Resident',   icon:'📋', color:'#00D4C8', xpNeeded:100  },
  { name:'Senior Resident',   icon:'🔬', color:'#34D399', xpNeeded:300  },
  { name:'Registrar',         icon:'⚕️', color:'#FBBF24', xpNeeded:600  },
  { name:'Specialist',        icon:'🏥', color:'#4F8EF7', xpNeeded:1000 },
  { name:'Consultant',        icon:'👨‍⚕️', color:'#F87171', xpNeeded:1500 },
  { name:'Senior Consultant', icon:'🎓', color:'#FCD34D', xpNeeded:2200 },
  { name:'Chief of Medicine', icon:'🌟', color:'#A78BFA', xpNeeded:3000 },
]

const BADGES = [
  { id:'first_case', icon:'🏅', name:'First Case',   color:'#FCD34D' },
  { id:'cardio',     icon:'🫀', name:'Cardiologist', color:'#F87171' },
  { id:'speed',      icon:'⚡', name:'Lightning MD', color:'#FBBF24' },
  { id:'streak3',    icon:'🔥', name:'On Fire',      color:'#FB923C' },
  { id:'mcq10',      icon:'🧬', name:'Brain Trust',  color:'#34D399' },
  { id:'stemi',      icon:'❤️‍🔥', name:'STEMI Master',color:'#F87171' },
  { id:'sports',     icon:'⚽', name:'FIFA Medic',   color:'#34D399' },
  { id:'peds',       icon:'🧸', name:'Pediatrician', color:'#A78BFA' },
]

const WEEK = ['M','T','W','T','F','S','S']

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; name:string
  onUpgrade:()=>void; onReset:()=>void
}

function getRank(xp:number) {
  let r = RANKS[0]
  for(let i=RANKS.length-1;i>=0;i--) { if(xp>=RANKS[i].xpNeeded){r=RANKS[i];break} }
  return r
}
function getNext(xp:number) {
  for(let i=0;i<RANKS.length;i++) { if(xp<RANKS[i].xpNeeded) return RANKS[i] }
  return null
}
function getPct(xp:number) {
  const c=getRank(xp), n=getNext(xp)
  if(!n) return 100
  return Math.round(((xp-c.xpNeeded)/(n.xpNeeded-c.xpNeeded))*100)
}

// ── RANK RING ──
function RankRing({ xp, rank }:any) {
  const pct = getPct(xp)
  const r = 44, circ = 2*Math.PI*r
  const dash = (pct/100)*circ
  return (
    <div style={{position:'relative',width:110,height:110,margin:'0 auto 16px'}}>
      <svg width="110" height="110" style={{position:'absolute',inset:0,transform:'rotate(-90deg)'}}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
        <circle cx="55" cy="55" r={r} fill="none"
          stroke="url(#rankGrad)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{transition:'stroke-dasharray 1s ease'}}
        />
        <defs>
          <linearGradient id="rankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4C8"/>
            <stop offset="100%" stopColor="#4F8EF7"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position:'absolute',inset:0,display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',
      }}>
        <span style={{fontSize:30}}>{rank.icon}</span>
        <span style={{fontSize:10,color:'rgba(232,244,253,0.50)',fontWeight:600,marginTop:2}}>{pct}%</span>
      </div>
    </div>
  )
}

// ── HEATMAP ──
function WeekHeatmap({ streak }:any) {
  const today = new Date().getDay()
  const days = WEEK.map((_,i)=>({
    label:WEEK[i],
    active: i <= (today===0?6:today-1) && i >= Math.max(0,(today===0?6:today-1)-streak+1)
  }))
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,color:'rgba(232,244,253,0.35)',letterSpacing:2,marginBottom:10,fontWeight:700}}>WEEKLY ACTIVITY</div>
      <div style={{display:'flex',gap:6}}>
        {days.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:'center'}}>
            <div style={{
              height:36,borderRadius:10,marginBottom:5,
              background: d.active
                ? 'linear-gradient(135deg,#00D4C8,#4F8EF7)'
                : 'rgba(255,255,255,0.05)',
              border: d.active ? 'none' : '1px solid rgba(255,255,255,0.07)',
              boxShadow: d.active ? '0 4px 12px rgba(0,212,200,0.25)' : 'none',
            }}/>
            <div style={{fontSize:9,color:'rgba(232,244,253,0.35)',fontWeight:600}}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RANK JOURNEY ──
function RankJourney({ xp }:any) {
  const cur = getRank(xp)
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,color:'rgba(232,244,253,0.35)',letterSpacing:2,marginBottom:12,fontWeight:700}}>CLINICAL RANK JOURNEY</div>
      <div style={{position:'relative',paddingLeft:20}}>
        <div style={{
          position:'absolute',left:8,top:0,bottom:0,width:2,
          background:'rgba(255,255,255,0.07)',borderRadius:2,
        }}/>
        {RANKS.map((r,i)=>{
          const done = xp >= r.xpNeeded
          const isCur = r.name === cur.name
          return (
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:12,
              marginBottom:12,position:'relative',
              opacity: done ? 1 : 0.35,
            }}>
              <div style={{
                position:'absolute',left:-16,
                width:12,height:12,borderRadius:'50%',
                background: isCur
                  ? 'linear-gradient(135deg,#00D4C8,#4F8EF7)'
                  : done ? '#34D399' : 'rgba(255,255,255,0.10)',
                border: isCur ? '2px solid rgba(0,212,200,0.50)' : 'none',
                boxShadow: isCur ? '0 0 12px rgba(0,212,200,0.50)' : 'none',
                zIndex:1,
              }}/>
              <span style={{fontSize:18}}>{r.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight: isCur?800:600,color: isCur?'#E8F4FD':'rgba(232,244,253,0.60)'}}>
                  {r.name} {isCur && <span style={{fontSize:10,color:'#00D4C8',marginLeft:6}}>← YOU</span>}
                </div>
                <div style={{fontSize:10,color:'rgba(232,244,253,0.30)',marginTop:1}}>{r.xpNeeded} XP</div>
              </div>
              {done && !isCur && <span style={{fontSize:12,color:'#34D399'}}>✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SETTINGS ROW ──
function SettingRow({ icon, label, sub, toggle, value, onToggle, onPress }:any) {
  return (
    <div onClick={onPress} style={{
      display:'flex',alignItems:'center',gap:12,
      padding:'13px 0',
      borderBottom:'1px solid rgba(255,255,255,0.05)',
      cursor: onPress||onToggle ? 'pointer' : 'default',
    }}>
      <div style={{
        width:36,height:36,borderRadius:10,flexShrink:0,
        background:'rgba(255,255,255,0.07)',
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
      }}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:600,color:'#E8F4FD'}}>{label}</div>
        {sub && <div style={{fontSize:11,color:'rgba(232,244,253,0.40)',marginTop:1}}>{sub}</div>}
      </div>
      {toggle && (
        <div onClick={e=>{e.stopPropagation();onToggle?.()}} style={{
          width:44,height:26,borderRadius:13,
          background: value ? 'linear-gradient(135deg,#00D4C8,#4F8EF7)' : 'rgba(255,255,255,0.12)',
          position:'relative',cursor:'pointer',
          boxShadow: value ? '0 2px 8px rgba(0,212,200,0.30)' : 'none',
          transition:'all 0.25s',flexShrink:0,
        }}>
          <div style={{
            position:'absolute',top:3,
            left: value ? 21 : 3,
            width:20,height:20,borderRadius:'50%',
            background:'white',
            boxShadow:'0 2px 6px rgba(0,0,0,0.30)',
            transition:'left 0.25s',
          }}/>
        </div>
      )}
      {!toggle && onPress && <span style={{color:'rgba(232,244,253,0.25)',fontSize:16}}>›</span>}
    </div>
  )
}

export default function MePage({ xp, streak, casesCompleted, mcqCorrect, isPro, name, onUpgrade, onReset }:Props) {
  const [activeTab, setActiveTab] = useState<'profile'|'stats'|'settings'>('profile')
  const [showCert, setShowCert] = useState(false)
  const [notif, setNotif] = useState(true)
  const [sound, setSound] = useState(true)
  const [haptic, setHaptic] = useState(true)
  const rank = getRank(xp)
  const next = getNext(xp)
  const pct  = getPct(xp)

  if(showCert) return (
    <div style={{position:'fixed',inset:0,zIndex:999,background:'#0F1824'}}>
      <div style={{padding:'20px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'#E8F4FD',fontWeight:800,fontSize:16}}>Certificate</span>
        <button onClick={()=>setShowCert(false)} style={{
          background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:10,padding:'8px 14px',color:'#E8F4FD',cursor:'pointer',fontSize:14,
        }}>✕ Close</button>
      </div>
      <CertificateGenerator xp={xp} rank={rank.name} casesCompleted={casesCompleted} name={name||'Dr. Ahmed'}/>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-base,#0F1824)',fontFamily:F}}>
      {/* BG glow */}
      <div style={{position:'fixed',top:-150,right:-100,width:400,height:400,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(79,142,247,0.06),transparent 70%)',
        pointerEvents:'none',zIndex:0,filter:'blur(60px)'}}/>

      <div style={{position:'relative',zIndex:1,padding:'16px 16px 140px',maxWidth:560,margin:'0 auto'}}>

        {/* ── TAB SELECTOR ── */}
        <div style={{
          display:'flex',gap:4,
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:18,padding:4,marginBottom:20,
        }}>
          {(['profile','stats','settings'] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{
              flex:1,padding:'10px',border:'none',cursor:'pointer',borderRadius:14,
              fontFamily:F,fontWeight:700,fontSize:12,
              background: activeTab===t ? 'linear-gradient(135deg,#00D4C8,#4F8EF7)' : 'transparent',
              color: activeTab===t ? 'white' : 'rgba(232,244,253,0.40)',
              boxShadow: activeTab===t ? '0 4px 16px rgba(0,212,200,0.25)' : 'none',
              transition:'all 0.25s',
              textTransform:'capitalize',
            }}>{t === 'profile' ? '👤 Profile' : t === 'stats' ? '📊 Stats' : '⚙️ Settings'}</button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab==='profile' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            {/* Hero card */}
            <div style={{
              background:'linear-gradient(160deg,rgba(0,212,200,0.08),rgba(79,142,247,0.06))',
              border:'1px solid rgba(0,212,200,0.15)',
              borderRadius:28,padding:'28px 20px 20px',
              marginBottom:16,textAlign:'center',
              position:'relative',overflow:'hidden',
            }}>
              <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',
                background:'radial-gradient(circle,rgba(0,212,200,0.08),transparent 70%)',pointerEvents:'none'}}/>

              <RankRing xp={xp} rank={rank}/>

              <div style={{fontSize:22,fontWeight:900,color:'#E8F4FD',letterSpacing:-0.5,marginBottom:4}}>
                {name || 'Dr. Ahmed'}
              </div>
              <div style={{
                display:'inline-flex',alignItems:'center',gap:6,
                background:'rgba(0,212,200,0.12)',border:'1px solid rgba(0,212,200,0.22)',
                borderRadius:20,padding:'5px 14px',marginBottom:16,
              }}>
                <span style={{fontSize:14}}>{rank.icon}</span>
                <span style={{fontSize:13,fontWeight:700,color:'#00D4C8'}}>{rank.name}</span>
              </div>

              {/* XP bar */}
              <div style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:11,color:'rgba(232,244,253,0.40)'}}>XP Progress</span>
                  <span style={{fontSize:11,color:'#00D4C8',fontWeight:700}}>{xp} XP</span>
                </div>
                <div style={{height:6,background:'rgba(255,255,255,0.07)',borderRadius:6,overflow:'hidden'}}>
                  <div style={{
                    height:'100%',borderRadius:6,
                    background:'linear-gradient(90deg,#00D4C8,#4F8EF7)',
                    width:`${pct}%`,transition:'width 1s ease',
                    boxShadow:'0 0 8px rgba(0,212,200,0.40)',
                  }}/>
                </div>
                {next && <div style={{fontSize:10,color:'rgba(232,244,253,0.30)',marginTop:5,textAlign:'right'}}>
                  {next.xpNeeded-xp} XP to {next.name}
                </div>}
              </div>

              {/* PRO badge */}
              {isPro && <div style={{
                background:'linear-gradient(135deg,#FBBF24,#FB923C)',
                borderRadius:12,padding:'6px 16px',display:'inline-block',
                fontSize:12,fontWeight:800,color:'white',marginTop:4,
              }}>⭐ PRO Member</div>}
            </div>

            {/* Quick stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
              {[
                {label:'Cases',value:casesCompleted,icon:'🏥',color:'#F87171'},
                {label:'MCQ',value:mcqCorrect,icon:'🧬',color:'#4F8EF7'},
                {label:'Streak',value:`${streak}🔥`,icon:'',color:'#FBBF24'},
              ].map(s=>(
                <div key={s.label} style={{
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:18,padding:'16px 10px',textAlign:'center',
                }}>
                  <div style={{fontSize:24,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:'rgba(232,244,253,0.40)',marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:22,padding:'18px 16px',marginBottom:16,
            }}>
              <div style={{fontSize:10,color:'rgba(232,244,253,0.35)',letterSpacing:2,marginBottom:12,fontWeight:700}}>
                🏆 ACHIEVEMENTS
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {BADGES.map(b=>(
                  <div key={b.id} style={{
                    background:`${b.color}10`,
                    border:`1px solid ${b.color}25`,
                    borderRadius:14,padding:'10px 6px',textAlign:'center',
                  }}>
                    <div style={{fontSize:22,marginBottom:4}}>{b.icon}</div>
                    <div style={{fontSize:9,color:`${b.color}`,fontWeight:700,lineHeight:1.2}}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate + Upgrade */}
            <button onClick={()=>setShowCert(true)} style={{
              width:'100%',padding:16,borderRadius:18,border:'none',
              background:'linear-gradient(135deg,#00D4C8,#4F8EF7)',
              color:'white',fontSize:15,fontWeight:800,cursor:'pointer',
              marginBottom:10,boxShadow:'0 8px 28px rgba(0,212,200,0.30)',
            }}>📜 Generate Clinical Certificate</button>

            {!isPro && <button onClick={onUpgrade} style={{
              width:'100%',padding:14,borderRadius:18,
              border:'1px solid rgba(251,191,36,0.30)',
              background:'rgba(251,191,36,0.08)',
              color:'#FBBF24',fontSize:14,fontWeight:700,cursor:'pointer',
            }}>⭐ Upgrade to PRO — $14.99/mo</button>}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab==='stats' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <WeekHeatmap streak={streak}/>
            {/* Stats list */}
            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:22,padding:'8px 16px',marginBottom:16,
            }}>
              {[
                {icon:'⚡',label:'Total XP',value:xp,unit:'pts',color:'#4F8EF7'},
                {icon:'🏥',label:'Cases Completed',value:casesCompleted,unit:'cases',color:'#F87171'},
                {icon:'🧬',label:'MCQ Answered',value:mcqCorrect,unit:'correct',color:'#34D399'},
                {icon:'🔥',label:'Current Streak',value:streak,unit:'days',color:'#FBBF24'},
                {icon:'🏅',label:'Badges Collected',value:BADGES.length,unit:'badges',color:'#A78BFA'},
              ].map(s=>(
                <div key={s.label} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'14px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{
                    width:40,height:40,borderRadius:13,flexShrink:0,
                    background:`${s.color}12`,border:`1px solid ${s.color}20`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                  }}>{s.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:'rgba(232,244,253,0.60)',fontWeight:500}}>{s.label}</div>
                    <div style={{fontSize:24,fontWeight:900,color:s.color,lineHeight:1.2}}>{s.value}</div>
                  </div>
                  <div style={{
                    fontSize:11,fontWeight:700,color:s.color,
                    background:`${s.color}15`,border:`1px solid ${s.color}25`,
                    borderRadius:8,padding:'4px 10px',
                  }}>{s.unit}</div>
                </div>
              ))}
            </div>
            <RankJourney xp={xp}/>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab==='settings' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:22,padding:'4px 16px',marginBottom:12,
            }}>
              <div style={{fontSize:10,color:'rgba(232,244,253,0.30)',letterSpacing:2,padding:'12px 0 4px',fontWeight:700}}>ACCOUNT</div>
              <SettingRow icon="👤" label="Edit Profile" sub="Name · Specialty · Country" onPress={()=>{}}/>
              <SettingRow icon="🔔" label="Notifications" sub="On-call reminders · Alerts" toggle value={notif} onToggle={()=>setNotif(v=>!v)}/>
              <SettingRow icon="📱" label="Install App" sub="App Store · PWA" onPress={()=>{}}/>
              <SettingRow icon="🔒" label="Privacy & Security" sub="Data · Account settings" onPress={()=>{}}/>
            </div>

            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:22,padding:'4px 16px',marginBottom:12,
            }}>
              <div style={{fontSize:10,color:'rgba(232,244,253,0.30)',letterSpacing:2,padding:'12px 0 4px',fontWeight:700}}>PREFERENCES</div>
              <SettingRow icon="🔊" label="Sound Effects" sub="Feedback sounds" toggle value={sound} onToggle={()=>setSound(v=>!v)}/>
              <SettingRow icon="📳" label="Haptics" sub="Tactile feedback" toggle value={haptic} onToggle={()=>setHaptic(v=>!v)}/>
            </div>

            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:22,padding:'4px 16px',marginBottom:16,
            }}>
              <div style={{fontSize:10,color:'rgba(232,244,253,0.30)',letterSpacing:2,padding:'12px 0 4px',fontWeight:700}}>ABOUT</div>
              <SettingRow icon="ℹ️" label="Version" sub="Cliniverse AI v1.1 · 2026" onPress={()=>{}}/>
              <SettingRow icon="⚖️" label="Terms & Privacy" sub="Legal · Data usage" onPress={()=>window.open('/privacy','_blank')}/>
              <SettingRow icon="💬" label="Send Feedback" sub="Help us improve" onPress={()=>{}}/>
              <SettingRow icon="⭐" label="Rate the App" sub="Support Cliniverse AI" onPress={()=>{}}/>
            </div>

            <button onClick={onReset} style={{
              width:'100%',padding:14,borderRadius:18,
              border:'1px solid rgba(248,113,113,0.25)',
              background:'rgba(248,113,113,0.06)',
              color:'#F87171',fontSize:14,fontWeight:700,cursor:'pointer',
            }}>🔄 Reset Onboarding</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
