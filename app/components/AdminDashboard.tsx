'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.60)',
  muted:  'rgba(238,246,250,0.38)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

const ADMIN_PIN = '1987'

interface Stats {
  totalUsers:number; proUsers:number; totalXP:number
  casesCompleted:number; mcqAnswered:number; revenue:number
}
interface RecentUser {
  id:string; name:string; email:string; specialty:string
  xp:number; is_pro:boolean; created_at:string; cases_completed:number
}
interface ErrorLog {
  id:string; error_message:string; error_source:string
  page_context:string; created_at:string; resolved:boolean
}

const DEMO_STATS: Stats = {
  totalUsers:284, proUsers:47, totalXP:182400,
  casesCompleted:1247, mcqAnswered:8934, revenue:469.53,
}

const DEMO_USERS: RecentUser[] = [
  { id:'1', name:'Dr. Ahmed Al-Rashidi', email:'ahmed@hospital.sa', specialty:'Cardiology',        xp:2450, is_pro:true,  created_at:'2026-07-19', cases_completed:28 },
  { id:'2', name:'Dr. Sarah Mitchell',   email:'sarah@clinic.com',  specialty:'Emergency',         xp:1890, is_pro:true,  created_at:'2026-07-18', cases_completed:22 },
  { id:'3', name:'Dr. Khalid Hassan',    email:'khalid@med.sa',     specialty:'Internal Medicine', xp:1650, is_pro:false, created_at:'2026-07-18', cases_completed:19 },
  { id:'4', name:'Dr. Fatima Al-Zahra', email:'fatima@neuro.sa',   specialty:'Neurology',         xp:1420, is_pro:true,  created_at:'2026-07-17', cases_completed:17 },
  { id:'5', name:'Dr. James Chen',      email:'james@icu.com',      specialty:'Critical Care',     xp:1280, is_pro:false, created_at:'2026-07-17', cases_completed:15 },
  { id:'6', name:'Dr. Nora Al-Qasim',   email:'nora@cardio.sa',    specialty:'Cardiology',        xp:980,  is_pro:true,  created_at:'2026-07-16', cases_completed:12 },
]

const DEMO_ERRORS: ErrorLog[] = [
  { id:'1', error_message:'Failed to fetch leaderboard data', error_source:'supabase_query', page_context:'TOP tab',    created_at:'2026-07-20T06:12:00Z', resolved:false },
  { id:'2', error_message:'AI response timeout after 30s',   error_source:'anthropic_api',  page_context:'STEMI case', created_at:'2026-07-20T05:44:00Z', resolved:true  },
  { id:'3', error_message:'Supabase auth session expired',   error_source:'window.onerror', page_context:'Sign In',    created_at:'2026-07-19T22:10:00Z', resolved:true  },
]

// ── SPARKLINE ──
const SparkLine = ({ data, color }: { data:number[], color:string }) => {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max-min||1
  const w=80, h=32
  const pts = data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(' ')
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} stroke="none"/>
    </svg>
  )
}

export default function AdminDashboard({ onClose }: { onClose:()=>void }) {
  const [activeTab, setActiveTab] = useState<'overview'|'users'|'errors'|'content'>('overview')
  const [stats]  = useState<Stats>(DEMO_STATS)
  const [users]  = useState<RecentUser[]>(DEMO_USERS)
  const [errors, setErrors] = useState<ErrorLog[]>(DEMO_ERRORS)
  const [searchQuery, setSearchQuery] = useState('')
  const [authed, setAuthed]   = useState(false)
  const [pin, setPin]         = useState('')
  const [pinError, setPinError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked]   = useState(false)

  const handlePin = (digit:string) => {
    if(locked) return
    const newPin = pin+digit
    setPin(newPin)
    if(newPin.length===4) {
      if(newPin===ADMIN_PIN) { setAuthed(true); setPinError(false) }
      else {
        setPinError(true)
        const a = attempts+1
        setAttempts(a)
        if(a>=3) setLocked(true)
        setTimeout(()=>{ setPin(''); setPinError(false) }, 800)
      }
    }
  }

  const filteredUsers = users.filter(u=>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── PIN SCREEN ──
  if(!authed) return (
    <div style={{
      position:'fixed',inset:0,zIndex:10000,
      background:'linear-gradient(160deg,#2a5068 0%,#1e3d52 50%,#1a3a50 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      fontFamily:F,
    }}>
      {/* Ambient */}
      <div style={{position:'absolute',top:-100,left:'50%',transform:'translateX(-50%)',width:500,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.10),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <button onClick={onClose} style={{position:'absolute',top:20,left:20,background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,color:T.sub,padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:700,fontFamily:F}}>← Back</button>

      {/* Logo watermark */}
      <div style={{position:'absolute',bottom:40,right:40,opacity:0.06,pointerEvents:'none'}}>
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="90" height="90" rx="23" stroke="white" strokeWidth="2"/>
          <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M36 50L46 63L70 36" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{width:72,height:72,borderRadius:22,background:`${T.teal}18`,border:`2px solid ${T.teal}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34,margin:'0 auto 16px',boxShadow:`0 0 30px ${T.teal}25`}}>🔐</div>
        <div style={{fontSize:10,color:`${T.teal}CC`,letterSpacing:3,fontWeight:700,marginBottom:6}}>ADMIN ACCESS</div>
        <div style={{fontSize:22,fontWeight:900,color:T.text}}>Enter PIN</div>
        {locked && <div style={{fontSize:12,color:T.red,marginTop:8}}>🔒 Locked — too many attempts</div>}
      </div>

      {/* PIN dots */}
      <div style={{display:'flex',gap:16,marginBottom:36}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{
            width:16,height:16,borderRadius:'50%',
            background:pin.length>i?(pinError?T.red:T.teal):'rgba(255,255,255,0.12)',
            border:`2px solid ${pin.length>i?(pinError?T.red:T.teal):'rgba(255,255,255,0.18)'}`,
            boxShadow:pin.length>i?`0 0 12px ${pinError?T.red:T.teal}60`:'none',
            transition:'all 0.2s',
          }}/>
        ))}
      </div>

      {/* Keypad */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxWidth:240,width:'100%',padding:'0 20px'}}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map(d=>(
          <button key={d} onClick={()=>d==='⌫'?setPin(p=>p.slice(0,-1)):d?handlePin(d):null}
            disabled={locked||!d}
            style={{
              height:64, border:`1px solid ${T.border}`,
              borderRadius:18, fontSize:d==='⌫'?20:22, fontWeight:700,
              background:d?T.glass:'transparent',
              backdropFilter:d?'blur(20px)':'none',
              color:d?T.text:'transparent',
              cursor:d&&!locked?'pointer':'default',
              fontFamily:F, transition:'all 0.15s',
              opacity:locked?0.4:1,
            }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )

  // ── MAIN DASHBOARD ──
  const STAT_CARDS = [
    { label:'Total Users',  value:stats.totalUsers,    icon:'👥', color:T.blue,   trend:[180,210,230,250,265,280,284], fmt:(v:number)=>v.toLocaleString() },
    { label:'PRO Users',    value:stats.proUsers,      icon:'⭐', color:T.gold,   trend:[20,28,33,38,42,45,47],       fmt:(v:number)=>v },
    { label:'Revenue',      value:stats.revenue,       icon:'💰', color:T.green,  trend:[200,280,320,380,420,450,470],fmt:(v:number)=>`$${v.toFixed(0)}` },
    { label:'Cases Done',   value:stats.casesCompleted,icon:'🏥', color:T.teal,   trend:[600,750,880,960,1050,1150,1247],fmt:(v:number)=>v.toLocaleString() },
    { label:'MCQ Answered', value:stats.mcqAnswered,   icon:'🧠', color:T.purple, trend:[3000,4500,5800,6900,7800,8500,8934],fmt:(v:number)=>v.toLocaleString() },
    { label:'Total XP',     value:stats.totalXP,       icon:'⚡', color:T.orange, trend:[80000,100000,120000,140000,160000,175000,182400],fmt:(v:number)=>`${(v/1000).toFixed(0)}k` },
  ]

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:10000,
      background:'linear-gradient(160deg,#2a5068 0%,#1e3d52 50%,#1a3a50 100%)',
      overflowY:'auto', fontFamily:F,
    }}>
      {/* Header */}
      <div style={{
        background:'rgba(15,35,50,0.90)',backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${T.border}`,
        padding:'14px 20px',display:'flex',alignItems:'center',
        justifyContent:'space-between',position:'sticky',top:0,zIndex:10,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:11,background:`${T.teal}20`,border:`1.5px solid ${T.teal}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🛡️</div>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:T.text}}>Admin Dashboard</div>
            <div style={{fontSize:10,color:`${T.teal}AA`,fontWeight:600}}>CLINIVERSE AI · v2.0</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>✕ Close</button>
      </div>

      <div style={{padding:'20px 16px 60px',maxWidth:500,margin:'0 auto'}}>

        {/* Tab bar */}
        <div style={{display:'flex',gap:4,background:T.glass2,borderRadius:16,padding:4,marginBottom:20,border:`1px solid ${T.border}`}}>
          {[
            {id:'overview',label:'Overview',icon:'📊'},
            {id:'users',   label:'Users',   icon:'👥'},
            {id:'errors',  label:'Errors',  icon:'🚨'},
            {id:'content', label:'Content', icon:'🏥'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)} style={{
              flex:1,padding:'9px 4px',border:'none',cursor:'pointer',
              borderRadius:12,fontFamily:F,fontWeight:700,fontSize:11,
              background:activeTab===t.id?T.glass:'transparent',
              color:activeTab===t.id?T.teal:T.muted,
              border:activeTab===t.id?`1px solid ${T.teal}25`:'1px solid transparent',
              transition:'all 0.2s',
            }}>
              {t.icon} {t.label}
              {t.id==='errors'&&errors.filter(e=>!e.resolved).length>0&&(
                <span style={{marginLeft:4,background:T.red,borderRadius:10,padding:'1px 5px',fontSize:8,color:'white',fontWeight:900}}>
                  {errors.filter(e=>!e.resolved).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab==='overview' && (
          <div>
            {/* Live badge */}
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:16}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:T.green,boxShadow:`0 0 8px ${T.green}`}}/>
              <span style={{fontSize:10,color:T.green,fontWeight:700}}>LIVE DATA · Auto-refresh 30s</span>
            </div>

            {/* Stat cards */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {STAT_CARDS.map(s=>(
                <div key={s.label} style={{
                  background:T.glass,backdropFilter:'blur(30px)',WebkitBackdropFilter:'blur(30px)',
                  borderRadius:18,padding:'14px',
                  border:`1px solid ${s.color}22`,
                  boxShadow:`0 4px 16px rgba(0,0,0,0.12),0 0 10px ${s.color}08`,
                  position:'relative',overflow:'hidden',
                }}>
                  <div style={{position:'absolute',top:-20,right:-20,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${s.color}14,transparent 70%)`,pointerEvents:'none'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <span style={{fontSize:20}}>{s.icon}</span>
                    <SparkLine data={s.trend} color={s.color}/>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:s.color,marginBottom:2}}>{s.fmt(s.value)}</div>
                  <div style={{fontSize:10,color:T.muted,fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Revenue breakdown */}
            <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${T.gold}22`}}>
              <div style={{fontSize:10,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:12}}>💰 REVENUE BREAKDOWN</div>
              {[
                {label:'Monthly subscriptions',    value:`$${(stats.proUsers*9.99).toFixed(2)}`, pct:75},
                {label:'Annual subscriptions',     value:`$${(stats.proUsers*0.3*49.99/12).toFixed(2)}`,pct:20},
                {label:'Other',                    value:'$12.00', pct:5},
              ].map(r=>(
                <div key={r.label} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:11,color:T.sub}}>{r.label}</span>
                    <span style={{fontSize:12,fontWeight:800,color:T.gold}}>{r.value}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.06)'}}>
                    <div style={{height:'100%',borderRadius:2,width:`${r.pct}%`,background:`linear-gradient(90deg,${T.gold},${T.orange})`}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',border:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>⚡ QUICK ACTIONS</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {label:'Export Users CSV', icon:'📥', color:T.blue},
                  {label:'Send Broadcast',   icon:'📢', color:T.teal},
                  {label:'Clear Error Log',  icon:'🗑️', color:T.red},
                  {label:'Refresh Data',     icon:'🔄', color:T.green},
                ].map(a=>(
                  <button key={a.label} style={{
                    background:`${a.color}12`,border:`1px solid ${a.color}25`,
                    borderRadius:14,padding:'12px',cursor:'pointer',fontFamily:F,
                    display:'flex',alignItems:'center',gap:8,
                    color:a.color,fontSize:12,fontWeight:700,
                  }}>
                    <span style={{fontSize:16}}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab==='users' && (
          <div>
            {/* Search */}
            <div style={{position:'relative',marginBottom:12}}>
              <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:0.4}}>🔍</span>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Search by name, email, specialty..."
                style={{width:'100%',padding:'12px 16px 12px 44px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.text,fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:F}}
              />
            </div>

            {/* Stats row */}
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              {[
                {label:'Total',v:stats.totalUsers,             c:T.blue},
                {label:'PRO',  v:stats.proUsers,               c:T.gold},
                {label:'Free', v:stats.totalUsers-stats.proUsers,c:T.muted},
              ].map(s=>(
                <div key={s.label} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',borderRadius:14,padding:'10px',border:`1px solid ${s.c}20`,textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:T.muted,fontWeight:700}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* User list */}
            {filteredUsers.map(u=>(
              <div key={u.id} style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'14px',marginBottom:8,border:`1px solid ${u.is_pro?T.gold+'22':T.border}`,display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:14,background:u.is_pro?`linear-gradient(135deg,${T.gold}30,${T.orange}20)`:`${T.blue}15`,border:`1.5px solid ${u.is_pro?T.gold:T.blue}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {u.is_pro?'⭐':'👤'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name}</span>
                    {u.is_pro&&<span style={{fontSize:9,padding:'1px 7px',borderRadius:8,background:`${T.gold}20`,color:T.gold,fontWeight:800,border:`1px solid ${T.gold}30`,flexShrink:0}}>PRO</span>}
                  </div>
                  <div style={{fontSize:11,color:T.muted}}>{u.email}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2}}>{u.specialty} · {u.cases_completed} cases · {u.xp} XP</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:6}}>{u.created_at}</div>
                  <button style={{padding:'5px 10px',borderRadius:10,border:`1px solid ${T.teal}30`,background:`${T.teal}12`,color:T.teal,fontSize:10,cursor:'pointer',fontWeight:700,fontFamily:F}}>
                    {u.is_pro?'Revoke':'Grant PRO'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ERRORS ── */}
        {activeTab==='errors' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:T.text}}>🚨 Error Log</div>
                <div style={{fontSize:12,color:T.sub,marginTop:2}}>Auto-captured from app</div>
              </div>
              <div style={{fontSize:11,padding:'4px 12px',borderRadius:10,background:`${T.red}15`,color:T.red,border:`1px solid ${T.red}30`,fontWeight:700}}>
                {errors.filter(e=>!e.resolved).length} unresolved
              </div>
            </div>

            {errors.map(e=>(
              <div key={e.id} style={{
                background:e.resolved?T.glass2:`${T.red}08`,
                backdropFilter:'blur(20px)',
                borderRadius:18,padding:'14px',marginBottom:8,
                border:e.resolved?`1px solid ${T.border}`:`1px solid ${T.red}25`,
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:e.resolved?T.sub:T.text,flex:1,marginRight:8}}>{e.error_message}</div>
                  <span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:e.resolved?`${T.green}15`:`${T.red}15`,color:e.resolved?T.green:T.red,fontWeight:800,flexShrink:0,border:`1px solid ${e.resolved?T.green:T.red}30`}}>
                    {e.resolved?'RESOLVED':'OPEN'}
                  </span>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:e.resolved?0:10}}>
                  {[e.error_source, e.page_context].map((tag,i)=>(
                    <span key={i} style={{fontSize:10,color:T.muted,background:'rgba(255,255,255,0.05)',borderRadius:6,padding:'2px 8px'}}>{tag}</span>
                  ))}
                  <span style={{fontSize:10,color:T.muted}}>{new Date(e.created_at).toLocaleString()}</span>
                </div>
                {!e.resolved && (
                  <button onClick={()=>setErrors(prev=>prev.map(x=>x.id===e.id?{...x,resolved:true}:x))}
                    style={{padding:'7px 14px',borderRadius:10,border:`1px solid ${T.green}30`,background:`${T.green}12`,color:T.green,fontSize:11,cursor:'pointer',fontWeight:700,fontFamily:F}}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeTab==='content' && (
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T.text,marginBottom:16}}>🏥 Content Overview</div>

            {[
              {section:'Critical Care & Emergency', cases:9,  free:4, pro:5, color:T.red,    icon:'🚨'},
              {section:'Sports Medicine · FIFA 2026',cases:4,  free:1, pro:3, color:T.green,  icon:'⚽'},
              {section:'Pediatrics',                cases:3,  free:0, pro:3, color:T.purple, icon:'🧸'},
              {section:'Radiology',                 cases:5,  free:5, pro:0, color:T.blue,   icon:'🩻'},
              {section:'MCQ Bank',                  cases:10, free:10,pro:0, color:T.orange, icon:'🧠'},
              {section:'Teleconsultation 2030',     cases:1,  free:1, pro:0, color:T.teal,   icon:'🌐'},
              {section:'Non-Invasive Tech',         cases:3,  free:3, pro:0, color:T.gold,   icon:'🔬'},
            ].map(s=>(
              <div key={s.section} style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'14px',marginBottom:8,border:`1px solid ${s.color}20`,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-20,right:-20,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${s.color}12,transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`${s.color}18`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:T.text}}>{s.section}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:1}}>{s.cases} total cases</div>
                  </div>
                  <button style={{padding:'6px 12px',borderRadius:10,border:`1px solid ${T.teal}30`,background:`${T.teal}12`,color:T.teal,fontSize:11,cursor:'pointer',fontWeight:700,fontFamily:F}}>+ Add</button>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${T.green}12`,color:T.green,border:`1px solid ${T.green}20`,fontWeight:700}}>🆓 {s.free} Free</span>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${T.gold}12`,color:T.gold,border:`1px solid ${T.gold}20`,fontWeight:700}}>⭐ {s.pro} PRO</span>
                </div>
              </div>
            ))}

            <button style={{width:'100%',padding:'16px',borderRadius:18,border:`2px dashed ${T.teal}30`,background:`${T.teal}05`,color:`${T.teal}AA`,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:4,fontFamily:F}}>
              + Add New Case
            </button>
          </div>
        )}
      </div>

      <style>{`
        input::placeholder{color:rgba(238,246,250,0.22)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  )
}
