'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { L } from '../lib/tokens'

const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), { ssr:false })

const RANKS = [
  { name:'Clinical Clerk',    icon:'🩺', color:'#64748B', xpNeeded:0    },
  { name:'Junior Resident',   icon:'📋', color:'#0D9488', xpNeeded:100  },
  { name:'Senior Resident',   icon:'🔬', color:'#10B981', xpNeeded:300  },
  { name:'Registrar',         icon:'⚕️', color:'#F59E0B', xpNeeded:600  },
  { name:'Specialist',        icon:'🏥', color:'#3B82F6', xpNeeded:1000 },
  { name:'Consultant',        icon:'👨‍⚕️', color:'#EF4444', xpNeeded:1500 },
  { name:'Senior Consultant', icon:'🎓', color:'#F59E0B', xpNeeded:2200 },
  { name:'Chief of Medicine', icon:'🌟', color:'#7C3AED', xpNeeded:3000 },
]

const BADGES = [
  { id:'first_case', icon:'🏅', name:'First Case',   color:'#F59E0B' },
  { id:'cardio',     icon:'🫀', name:'Cardiologist', color:'#EF4444' },
  { id:'speed',      icon:'⚡', name:'Lightning MD', color:'#F59E0B' },
  { id:'streak3',    icon:'🔥', name:'On Fire',      color:'#F97316' },
  { id:'mcq10',      icon:'🧬', name:'Brain Trust',  color:'#10B981' },
  { id:'stemi',      icon:'❤️‍🔥', name:'STEMI Master',color:'#EF4444' },
  { id:'sports',     icon:'⚽', name:'FIFA Medic',   color:'#10B981' },
  { id:'peds',       icon:'🧸', name:'Pediatrician', color:'#7C3AED' },
]

const WEEK = ['M','T','W','T','F','S','S']

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; name:string; onUpgrade:()=>void; onReset:()=>void
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

// ── RANK RING SVG ──
function RankRing({ xp, rank }:any) {
  const pct = getPct(xp)
  const r = 44, circ = 2*Math.PI*r
  const dash = (pct/100)*circ
  return (
    <div style={{position:'relative',width:110,height:110,margin:'0 auto 12px'}}>
      <svg width="110" height="110" style={{position:'absolute',inset:0,transform:'rotate(-90deg)'}}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#E2E8F0" strokeWidth="6"/>
        <circle cx="55" cy="55" r={r} fill="none"
          stroke="url(#rankG)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
        <defs>
          <linearGradient id="rankG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488"/>
            <stop offset="100%" stopColor="#1E40AF"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position:'absolute',inset:0,
        display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',
      }}>
        <span style={{fontSize:28}}>{rank.icon}</span>
        <span style={{fontSize:10,color:L.textMuted,fontWeight:600}}>{pct}%</span>
      </div>
    </div>
  )
}

// ── WEEK HEATMAP ──
function WeekHeatmap({ streak }:any) {
  const today = new Date().getDay()
  const days = WEEK.map((_,i)=>({
    label:WEEK[i],
    active: i<=(today===0?6:today-1) && i>=Math.max(0,(today===0?6:today-1)-streak+1)
  }))
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,color:L.textMuted,letterSpacing:2,marginBottom:10,fontWeight:700}}>WEEKLY ACTIVITY</div>
      <div style={{display:'flex',gap:6}}>
        {days.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:'center'}}>
            <div style={{
              height:36,borderRadius:10,marginBottom:5,
              background: d.active ? L.gradPrimary : L.raised,
              border: d.active ? 'none' : `1px solid ${L.border}`,
              boxShadow: d.active ? L.shadowSm : 'none',
            }}/>
            <div style={{fontSize:9,color:L.textMuted,fontWeight:600}}>{d.label}</div>
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
      <div style={{fontSize:10,color:L.textMuted,letterSpacing:2,marginBottom:12,fontWeight:700}}>CLINICAL RANK JOURNEY</div>
      <div style={{position:'relative',paddingLeft:24}}>
        <div style={{
          position:'absolute',left:10,top:0,bottom:0,width:2,
          background:L.border,borderRadius:2,
        }}/>
        {RANKS.map((r,i)=>{
          const done = xp>=r.xpNeeded
          const isCur = r.name===cur.name
          return (
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:12,
              marginBottom:14,position:'relative',
              opacity: done?1:0.40,
            }}>
              <div style={{
                position:'absolute',left:-18,
                width:14,height:14,borderRadius:'50%',
                background: isCur ? L.gradPrimary : done ? L.sage : L.border,
                border: isCur ? '2px solid rgba(13,148,136,0.40)' : 'none',
                boxShadow: isCur ? L.glowTeal : 'none',
                zIndex:1,
              }}/>
              <span style={{fontSize:18}}>{r.icon}</span>
              <div style={{flex:1}}>
                <div style={{
                  fontSize:13,
                  fontWeight:isCur?800:600,
                  color:isCur?L.teal:L.text,
                }}>
                  {r.name}
                  {isCur && <span style={{fontSize:10,color:L.teal,marginLeft:6}}>← YOU</span>}
                </div>
                <div style={{fontSize:10,color:L.textMuted}}>{r.xpNeeded} XP</div>
              </div>
              {done && !isCur && <span style={{fontSize:12,color:L.sage}}>✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SETTING ROW ──
function SettingRow({ icon, label, sub, toggle, value, onToggle, onPress }:any) {
  return (
    <div onClick={onPress} style={{
      display:'flex',alignItems:'center',gap:12,
      padding:'13px 0',
      borderBottom:`1px solid ${L.border}`,
      cursor: onPress||onToggle?'pointer':'default',
    }}>
      <div style={{
        width:36,height:36,borderRadius:10,flexShrink:0,
        background:L.raised,border:`1px solid ${L.border}`,
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
      }}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:600,color:L.text}}>{label}</div>
        {sub && <div style={{fontSize:11,color:L.textMuted,marginTop:1}}>{sub}</div>}
      </div>
      {toggle && (
        <div onClick={e=>{e.stopPropagation();onToggle?.()}} style={{
          width:44,height:26,borderRadius:13,
          background: value ? L.gradPrimary : L.raised,
          border:`1px solid ${value?'transparent':L.border}`,
          position:'relative',cursor:'pointer',
          boxShadow: value ? L.shadowSm : 'none',
          transition:'all 0.25s',flexShrink:0,
        }}>
          <div style={{
            position:'absolute',top:3,
            left: value?21:3,
            width:20,height:20,borderRadius:'50%',
            background:'white',
            boxShadow:'0 2px 6px rgba(0,0,0,0.15)',
            transition:'left 0.25s',
          }}/>
        </div>
      )}
      {!toggle && onPress && <span style={{color:L.textMuted,fontSize:16}}>›</span>}
    </div>
  )
}

export default function MePage({ xp, streak, casesCompleted, mcqCorrect, isPro, name, onUpgrade, onReset }:Props) {
  const [activeTab, setActiveTab] = useState<'profile'|'stats'|'settings'>('profile')
  const [showCert, setShowCert] = useState(false)
  const [notif, setNotif]       = useState(true)
  const [sound, setSound]       = useState(true)
  const [haptic, setHaptic]     = useState(true)

  const rank = getRank(xp)
  const next = getNext(xp)
  const pct  = getPct(xp)

  if(showCert) return (
    <div style={{position:'fixed',inset:0,zIndex:999,background:L.canvas}}>
      <div style={{
        padding:'20px 16px',display:'flex',
        justifyContent:'space-between',alignItems:'center',
        borderBottom:`1px solid ${L.border}`,
        background:L.surface,
      }}>
        <span style={{fontSize:16,fontWeight:700,color:L.text}}>Certificate</span>
        <button onClick={()=>setShowCert(false)} style={{
          background:L.raised,border:`1px solid ${L.border}`,
          borderRadius:10,padding:'8px 14px',
          color:L.text,cursor:'pointer',fontSize:14,fontWeight:600,
        }}>✕ Close</button>
      </div>
      <CertificateGenerator xp={xp} rank={rank.name} casesCompleted={casesCompleted} name={name||'Dr. Ahmed'}/>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>
      {/* Top glow */}
      <div style={{
        position:'fixed',top:-100,right:-60,width:300,height:300,
        borderRadius:'50%',pointerEvents:'none',zIndex:0,
        background:'radial-gradient(circle,rgba(13,148,136,0.06),transparent 70%)',
        filter:'blur(40px)',
      }}/>

      <div style={{position:'relative',zIndex:1,padding:'16px 16px 140px',maxWidth:560,margin:'0 auto'}}>

        {/* Tab Selector */}
        <div style={{
          display:'flex',gap:4,
          background:L.surface,
          border:`1px solid ${L.border}`,
          borderRadius:18,padding:4,marginBottom:20,
          boxShadow:L.shadowSm,
        }}>
          {(['profile','stats','settings'] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{
              flex:1,padding:'10px',border:'none',cursor:'pointer',borderRadius:14,
              fontFamily:L.font,fontWeight:700,fontSize:12,
              background: activeTab===t ? L.gradPrimary : 'transparent',
              color: activeTab===t ? 'white' : L.textMuted,
              boxShadow: activeTab===t ? L.shadowSm : 'none',
              transition:'all 0.25s',
            }}>
              {t==='profile'?'👤 Profile':t==='stats'?'📊 Stats':'⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab==='profile' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            {/* Hero Card */}
            <div style={{
              background:L.surface,
              border:`1px solid ${L.border}`,
              borderRadius:28,
              marginBottom:14,textAlign:'center',
              boxShadow:L.shadowMd,
              position:'relative',overflow:'hidden',
            }}>
              {/* Unsplash Hero */}
              <div style={{
                height:120,
                backgroundImage:'url(https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80)',
                backgroundSize:'cover',backgroundPosition:'center top',
                position:'relative',
              }}>
                <div style={{
                  position:'absolute',inset:0,
                  background:'linear-gradient(180deg,rgba(248,250,252,0.10) 0%,rgba(248,250,252,0.95) 100%)',
                }}/>
              </div>
              <div style={{padding:'0 20px 20px',marginTop:-20}}>

              <RankRing xp={xp} rank={rank}/>

              <div style={{fontSize:22,fontWeight:900,color:L.text,letterSpacing:-0.5,marginBottom:4}}>
                {name||'Dr. Ahmed'}
              </div>
              <div style={{
                display:'inline-flex',alignItems:'center',gap:6,
                background:`${L.teal}12`,border:`1px solid ${L.tealBd}`,
                borderRadius:20,padding:'5px 14px',marginBottom:16,
              }}>
                <span style={{fontSize:14}}>{rank.icon}</span>
                <span style={{fontSize:13,fontWeight:700,color:L.teal}}>{rank.name}</span>
              </div>

              {/* XP Bar */}
              <div style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:11,color:L.textMuted}}>XP Progress</span>
                  <span style={{fontSize:11,color:L.teal,fontWeight:700}}>{xp} XP</span>
                </div>
                <div style={{height:6,background:L.raised,borderRadius:6,overflow:'hidden',border:`1px solid ${L.border}`}}>
                  <div style={{
                    height:'100%',borderRadius:6,
                    background:L.gradPrimary,
                    width:`${pct}%`,
                    transition:'width 1s ease',
                    boxShadow:L.glowTeal,
                  }}/>
                </div>
                {next && <div style={{fontSize:10,color:L.textMuted,marginTop:5,textAlign:'right'}}>
                  {next.xpNeeded-xp} XP to {next.name}
                </div>}
              </div>

              {isPro && <div style={{
                background:'linear-gradient(135deg,#F59E0B,#F97316)',
                borderRadius:12,padding:'6px 16px',display:'inline-block',
                fontSize:12,fontWeight:800,color:'white',marginTop:4,
              }}>⭐ PRO Member</div>}
            </div>
            </div>

            {/* Quick Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
              {[
                {label:'Cases',  value:casesCompleted, icon:'🏥', color:'#EF4444'},
                {label:'MCQ',    value:mcqCorrect,      icon:'🧬', color:'#3B82F6'},
                {label:'Streak', value:`${streak}🔥`,   icon:'',   color:'#F59E0B'},
              ].map(s=>(
                <div key={s.label} style={{
                  background:L.surface,border:`1px solid ${L.border}`,
                  borderRadius:18,padding:'16px 10px',textAlign:'center',
                  boxShadow:L.shadowSm,
                }}>
                  <div style={{fontSize:24,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:L.textMuted,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div style={{
              background:L.surface,border:`1px solid ${L.border}`,
              borderRadius:22,padding:'18px 16px',marginBottom:14,
              boxShadow:L.shadowSm,
            }}>
              <div style={{fontSize:10,color:L.textMuted,letterSpacing:2,marginBottom:12,fontWeight:700}}>
                🏆 ACHIEVEMENTS
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {BADGES.map(b=>(
                  <div key={b.id} style={{
                    background:`${b.color}08`,
                    border:`1px solid ${b.color}20`,
                    borderRadius:14,padding:'10px 6px',textAlign:'center',
                  }}>
                    <div style={{fontSize:22,marginBottom:4}}>{b.icon}</div>
                    <div style={{fontSize:9,color:b.color,fontWeight:700,lineHeight:1.2}}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate */}
            <button onClick={()=>setShowCert(true)} style={{
              width:'100%',padding:16,borderRadius:18,border:'none',
              background:L.gradPrimary,
              color:'white',fontSize:15,fontWeight:800,cursor:'pointer',
              marginBottom:10,boxShadow:L.shadowMd,
            }}>📜 Generate Clinical Certificate</button>

            {!isPro && <button onClick={onUpgrade} style={{
              width:'100%',padding:14,borderRadius:18,
              border:'1px solid rgba(245,158,11,0.30)',
              background:'rgba(245,158,11,0.08)',
              color:'#B45309',fontSize:14,fontWeight:700,cursor:'pointer',
            }}>⭐ Upgrade to PRO — $14.99/mo</button>}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab==='stats' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <WeekHeatmap streak={streak}/>
            <div style={{
              background:L.surface,border:`1px solid ${L.border}`,
              borderRadius:22,padding:'4px 16px',marginBottom:16,
              boxShadow:L.shadowSm,
            }}>
              {[
                {icon:'⚡',label:'Total XP',value:xp,unit:'pts',color:'#3B82F6'},
                {icon:'🏥',label:'Cases Completed',value:casesCompleted,unit:'cases',color:'#EF4444'},
                {icon:'🧬',label:'MCQ Answered',value:mcqCorrect,unit:'correct',color:'#10B981'},
                {icon:'🔥',label:'Current Streak',value:streak,unit:'days',color:'#F59E0B'},
                {icon:'🏅',label:'Badges Collected',value:BADGES.length,unit:'badges',color:'#7C3AED'},
              ].map(s=>(
                <div key={s.label} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'14px 0',borderBottom:`1px solid ${L.border}`,
                }}>
                  <div style={{
                    width:40,height:40,borderRadius:13,flexShrink:0,
                    background:`${s.color}10`,border:`1px solid ${s.color}20`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                  }}>{s.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:L.textSub,fontWeight:500}}>{s.label}</div>
                    <div style={{fontSize:24,fontWeight:900,color:s.color,lineHeight:1.2}}>{s.value}</div>
                  </div>
                  <div style={{
                    fontSize:11,fontWeight:700,color:s.color,
                    background:`${s.color}10`,border:`1px solid ${s.color}20`,
                    borderRadius:8,padding:'4px 10px',
                  }}>{s.unit}</div>
                </div>
              ))}
            </div>
            <RankJourney xp={xp}/>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab==='settings' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{
              background:L.surface,border:`1px solid ${L.border}`,
              borderRadius:22,padding:'4px 16px',marginBottom:12,
              boxShadow:L.shadowSm,
            }}>
              <div style={{fontSize:10,color:L.textMuted,letterSpacing:2,padding:'12px 0 4px',fontWeight:700}}>ACCOUNT</div>
              <SettingRow icon="👤" label="Edit Profile" sub="Name · Specialty · Country" onPress={()=>{}}/>
              <SettingRow icon="🔔" label="Notifications" sub="On-call reminders · Alerts" toggle value={notif} onToggle={()=>setNotif(v=>!v)}/>
              <SettingRow icon="📱" label="Install App" sub="App Store · PWA" onPress={()=>{}}/>
              <SettingRow icon="🔒" label="Privacy & Security" sub="Data · Account settings" onPress={()=>{}}/>
            </div>

            <div style={{
              background:L.surface,border:`1px solid ${L.border}`,
              borderRadius:22,padding:'4px 16px',marginBottom:12,
              boxShadow:L.shadowSm,
            }}>
              <div style={{fontSize:10,color:L.textMuted,letterSpacing:2,padding:'12px 0 4px',fontWeight:700}}>PREFERENCES</div>
              <SettingRow icon="🔊" label="Sound Effects" sub="Feedback sounds" toggle value={sound} onToggle={()=>setSound(v=>!v)}/>
              <SettingRow icon="📳" label="Haptics" sub="Tactile feedback" toggle value={haptic} onToggle={()=>setHaptic(v=>!v)}/>
            </div>

            <div style={{
              background:L.surface,border:`1px solid ${L.border}`,
              borderRadius:22,padding:'4px 16px',marginBottom:16,
              boxShadow:L.shadowSm,
            }}>
              <div style={{fontSize:10,color:L.textMuted,letterSpacing:2,padding:'12px 0 4px',fontWeight:700}}>ABOUT</div>
              <SettingRow icon="ℹ️" label="Version" sub="Cliniverse AI v1.1 · 2026" onPress={()=>{}}/>
              <SettingRow icon="⚖️" label="Terms & Privacy" sub="Legal · Data usage" onPress={()=>window.open('/privacy','_blank')}/>
              <SettingRow icon="💬" label="Send Feedback" sub="Help us improve" onPress={()=>{}}/>
              <SettingRow icon="⭐" label="Rate the App" sub="Support Cliniverse AI" onPress={()=>{}}/>
            </div>

            <button onClick={onReset} style={{
              width:'100%',padding:14,borderRadius:18,
              border:'1px solid rgba(239,68,68,0.25)',
              background:'rgba(239,68,68,0.06)',
              color:'#EF4444',fontSize:14,fontWeight:700,cursor:'pointer',
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
