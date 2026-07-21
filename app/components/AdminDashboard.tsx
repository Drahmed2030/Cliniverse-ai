'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const ADMIN_EMAIL = 'ahmfadul2030@gmail.com'
const ADMIN_PIN = '1987' // last 4 digits — change anytime

// ── TYPES ──
interface Stats {
  totalUsers: number
  proUsers: number
  totalXP: number
  casesCompleted: number
  mcqAnswered: number
  revenue: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  specialty: string
  xp: number
  is_pro: boolean
  created_at: string
  cases_completed: number
}

interface ErrorLog {
  id: string
  error_message: string
  error_source: string
  page_context: string
  created_at: string
  resolved: boolean
}

// ── DEMO DATA ──
const DEMO_STATS: Stats = {
  totalUsers: 284,
  proUsers: 47,
  totalXP: 182400,
  casesCompleted: 1247,
  mcqAnswered: 8934,
  revenue: 469.53,
}

const DEMO_USERS: RecentUser[] = [
  { id:'1', name:'Dr. Ahmed Al-Rashidi', email:'ahmed@hospital.sa', specialty:'Cardiology', xp:2450, is_pro:true, created_at:'2026-07-19', cases_completed:28 },
  { id:'2', name:'Dr. Sarah Mitchell', email:'sarah@clinic.com', specialty:'Emergency', xp:1890, is_pro:true, created_at:'2026-07-18', cases_completed:22 },
  { id:'3', name:'Dr. Khalid Hassan', email:'khalid@med.sa', specialty:'Internal Medicine', xp:1650, is_pro:false, created_at:'2026-07-18', cases_completed:19 },
  { id:'4', name:'Dr. Fatima Al-Zahra', email:'fatima@neuro.sa', specialty:'Neurology', xp:1420, is_pro:true, created_at:'2026-07-17', cases_completed:17 },
  { id:'5', name:'Dr. James Chen', email:'james@icu.com', specialty:'Critical Care', xp:1280, is_pro:false, created_at:'2026-07-17', cases_completed:15 },
  { id:'6', name:'Dr. Nora Al-Qasim', email:'nora@cardio.sa', specialty:'Cardiology', xp:980, is_pro:true, created_at:'2026-07-16', cases_completed:12 },
]

const DEMO_ERRORS: ErrorLog[] = [
  { id:'1', error_message:'Failed to fetch leaderboard data', error_source:'supabase_query', page_context:'TOP tab', created_at:'2026-07-20T06:12:00Z', resolved:false },
  { id:'2', error_message:'AI response timeout after 30s', error_source:'anthropic_api', page_context:'STEMI case', created_at:'2026-07-20T05:44:00Z', resolved:true },
  { id:'3', error_message:'Supabase auth session expired', error_source:'window.onerror', page_context:'Sign In', created_at:'2026-07-19T22:10:00Z', resolved:true },
]

// ── MINI CHART ──
const SparkLine = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 32
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} stroke="none" />
    </svg>
  )
}

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview'|'users'|'errors'|'content'>('overview')
  const [stats, setStats] = useState<Stats>(DEMO_STATS)
  const [users, setUsers] = useState<RecentUser[]>(DEMO_USERS)
  const [errors, setErrors] = useState<ErrorLog[]>(DEMO_ERRORS)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ── AUTH ──
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

  const handlePin = (digit: string) => {
    if(locked) return
    const newPin = pin + digit
    setPin(newPin)
    if(newPin.length === 4) {
      if(newPin === ADMIN_PIN) {
        setAuthed(true)
        setPinError(false)
      } else {
        setPinError(true)
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if(newAttempts >= 3) setLocked(true)
        setTimeout(() => { setPin(''); setPinError(false) }, 800)
      }
    }
  }

  // PIN SCREEN
  if(!authed) return (
    <div style={{position:'fixed',inset:0,zIndex:1000,background:'radial-gradient(ellipse at 30% 20%,#1a0533 0%,#0a0015 40%,#000510 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{position:'absolute',top:-100,left:-100,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.2),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-100,right:-100,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.15),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

      <button onClick={onClose} style={{position:'absolute',top:20,left:20,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,color:'rgba(255,255,255,0.6)',padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>

      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:52,marginBottom:12,filter:'drop-shadow(0 0 20px rgba(139,92,246,0.6))'}}>🔐</div>
        <div style={{fontSize:11,color:'rgba(139,92,246,0.8)',letterSpacing:3,textTransform:'uppercase',fontWeight:700,marginBottom:6}}>Admin Access</div>
        <div style={{fontSize:20,fontWeight:800,color:'white'}}>Enter PIN</div>
        {locked && <div style={{fontSize:12,color:'#ff453a',marginTop:8}}>🔒 Locked — too many attempts</div>}
      </div>

      {/* PIN dots */}
      <div style={{display:'flex',gap:16,marginBottom:36}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{
            width:16,height:16,borderRadius:'50%',
            background:pin.length>i?(pinError?'#ff453a':'#8b5cf6'):'rgba(255,255,255,0.15)',
            border:`2px solid ${pin.length>i?(pinError?'#ff453a':'rgba(139,92,246,0.8)'):'rgba(255,255,255,0.2)'}`,
            boxShadow:pin.length>i?`0 0 12px ${pinError?'rgba(255,69,58,0.6)':'rgba(139,92,246,0.6)'}`:'none',
            transition:'all 0.2s',
          }}/>
        ))}
      </div>

      {/* Keypad */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,maxWidth:240,width:'100%'}}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map(d=>(
          <button key={d} onClick={()=>d==='⌫'?setPin(p=>p.slice(0,-1)):d?handlePin(d):null}
            disabled={locked||!d}
            style={{
              height:64,borderRadius:18,border:'1px solid rgba(255,255,255,0.1)',
              background:d?'rgba(255,255,255,0.06)':'transparent',
              color:'white',fontSize:d==='⌫'?20:22,fontWeight:600,cursor:d?'pointer':'default',
              boxShadow:'0 2px 8px rgba(0,0,0,0.3)',
              transition:'all 0.15s',opacity:locked?0.4:1,
            }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{marginTop:32,fontSize:11,color:'rgba(255,255,255,0.2)'}}>Admin only · Cliniverse AI</div>
    </div>
  )

  const weeklyUsers = [12, 18, 15, 24, 20, 28, 32]
  const weeklyRevenue = [29.97, 49.95, 39.96, 69.93, 59.94, 79.92, 99.9]
  const weeklyCases = [45, 62, 58, 87, 74, 95, 112]

  const convRate = stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : '0'
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'radial-gradient(ellipse at 20% 10%, #1a0533 0%, #0a0015 40%, #000510 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
      overflowY: 'auto',
    }}>
      {/* Ambient glows */}
      <div style={{position:'fixed',top:-100,left:-100,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%)',pointerEvents:'none',filter:'blur(40px)'}}/>
      <div style={{position:'fixed',bottom:-100,right:-100,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.1),transparent 70%)',pointerEvents:'none',filter:'blur(40px)'}}/>

      {/* HEADER */}
      <div style={{background:'rgba(10,0,21,0.9)',backdropFilter:'blur(40px)',borderBottom:'1px solid rgba(139,92,246,0.2)',padding:'0 20px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>⚙️</div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:'white',letterSpacing:-0.3}}>Admin Dashboard</div>
            <div style={{fontSize:10,color:'rgba(139,92,246,0.8)',fontWeight:600}}>CLINIVERSE AI · v5.0</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:11,color:'rgba(48,209,88,0.9)',background:'rgba(48,209,88,0.1)',border:'1px solid rgba(48,209,88,0.3)',borderRadius:10,padding:'3px 10px',fontWeight:700}}>● LIVE</div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'rgba(255,255,255,0.7)',padding:'6px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{display:'flex',gap:6,padding:'14px 20px 0',overflowX:'auto'}}>
        {[
          {id:'overview',icon:'📊',label:'Overview'},
          {id:'users',icon:'👥',label:'Users'},
          {id:'errors',icon:'🚨',label:'Errors'},
          {id:'content',icon:'🏥',label:'Content'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id as any)} style={{
            padding:'9px 16px',borderRadius:14,border:'none',cursor:'pointer',
            background:activeTab===t.id?'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(10,132,255,0.2))':'rgba(255,255,255,0.05)',
            color:activeTab===t.id?'#c4b5fd':'rgba(255,255,255,0.4)',
            fontSize:13,fontWeight:700,
            border:activeTab===t.id?'1px solid rgba(139,92,246,0.35)':'1px solid transparent',
            boxShadow:activeTab===t.id?'0 4px 16px rgba(139,92,246,0.2)':'none',
            whiteSpace:'nowrap',transition:'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:'16px 20px 100px'}}>

        {/* ── OVERVIEW ── */}
        {activeTab==='overview'&&(
          <div>
            {/* KPI Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
              {[
                {label:'Total Users',value:stats.totalUsers.toLocaleString(),icon:'👥',color:'#0a84ff',trend:'+12 today',data:weeklyUsers},
                {label:'PRO Members',value:stats.proUsers.toString(),icon:'⭐',color:'#ffd60a',trend:`${convRate}% conv.`,data:[8,12,15,18,22,28,47]},
                {label:'Revenue',value:`$${stats.revenue.toFixed(2)}`,icon:'💰',color:'#30d158',trend:'+$29.97 today',data:weeklyRevenue},
                {label:'Cases Done',value:stats.casesCompleted.toLocaleString(),icon:'🏥',color:'#ff453a',trend:'+87 today',data:weeklyCases},
              ].map(k=>(
                <div key={k.label} style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:'16px 16px 12px',border:'1px solid rgba(255,255,255,0.07)',boxShadow:'0 4px 24px rgba(0,0,0,0.3)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`${k.color}12`,filter:'blur(20px)',pointerEvents:'none'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div style={{width:36,height:36,borderRadius:11,background:`${k.color}18`,border:`1px solid ${k.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{k.icon}</div>
                    <SparkLine data={k.data} color={k.color}/>
                  </div>
                  <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-1,lineHeight:1,marginBottom:4}}>{k.value}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:3}}>{k.label}</div>
                  <div style={{fontSize:10,color:k.color,fontWeight:700}}>{k.trend}</div>
                </div>
              ))}
            </div>

            {/* Conversion + MCQ row */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:16,border:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:8,fontWeight:700,letterSpacing:0.5}}>CONVERSION RATE</div>
                <div style={{fontSize:32,fontWeight:900,color:'#30d158',letterSpacing:-1}}>{convRate}%</div>
                <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden',marginTop:10}}>
                  <div style={{height:'100%',width:`${convRate}%`,background:'linear-gradient(90deg,#30d158,#0a84ff)',borderRadius:2,boxShadow:'0 0 8px rgba(48,209,88,0.5)'}}/>
                </div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:6}}>{stats.proUsers} PRO / {stats.totalUsers} total</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:16,border:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:8,fontWeight:700,letterSpacing:0.5}}>MCQ ANSWERED</div>
                <div style={{fontSize:32,fontWeight:900,color:'#ff9f0a',letterSpacing:-1}}>{stats.mcqAnswered.toLocaleString()}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:10}}>Avg {Math.round(stats.mcqAnswered/stats.totalUsers)} per user</div>
                <div style={{fontSize:10,color:'#ff9f0a',fontWeight:700,marginTop:4}}>+234 today</div>
              </div>
            </div>

            {/* Revenue breakdown */}
            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,border:'1px solid rgba(255,255,255,0.07)',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:14}}>💳 Revenue Breakdown</div>
              {[
                {label:'Monthly PRO ($9.99)',count:38,amount:379.62,color:'#8b5cf6'},
                {label:'Yearly PRO ($79)',count:9,amount:711,color:'#ffd60a'},
                {label:'Institution ($49)',count:0,amount:0,color:'#0a84ff'},
              ].map(r=>(
                <div key={r.label} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:r.color,flexShrink:0,boxShadow:`0 0 8px ${r.color}`}}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:600}}>{r.label}</span>
                      <span style={{fontSize:12,fontWeight:800,color:r.color}}>${r.amount.toFixed(2)}</span>
                    </div>
                    <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${r.amount>0?(r.amount/1090.62)*100:0}%`,background:r.color,borderRadius:2}}/>
                    </div>
                  </div>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.3)',flexShrink:0}}>{r.count} users</span>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,border:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:12}}>⚡ Quick Actions</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {icon:'📧',label:'Email All Users',color:'#0a84ff'},
                  {icon:'🎁',label:'Grant PRO Access',color:'#30d158'},
                  {icon:'📊',label:'Export CSV',color:'#ff9f0a'},
                  {icon:'🔄',label:'Sync Supabase',color:'#bf5af2'},
                ].map(a=>(
                  <button key={a.label} style={{padding:'12px',borderRadius:14,border:`1px solid ${a.color}25`,background:`${a.color}10`,color:a.color,fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:16}}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab==='users'&&(
          <div>
            {/* Search */}
            <div style={{position:'relative',marginBottom:12}}>
              <input
                value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Search by name, email, specialty..."
                style={{width:'100%',padding:'12px 16px 12px 40px',borderRadius:16,border:'1px solid rgba(139,92,246,0.2)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:14,outline:'none',boxSizing:'border-box'}}
              />
              <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:0.5}}>🔍</span>
            </div>

            {/* Stats row */}
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              {[
                {label:'Total',value:stats.totalUsers,color:'#0a84ff'},
                {label:'PRO',value:stats.proUsers,color:'#ffd60a'},
                {label:'Free',value:stats.totalUsers-stats.proUsers,color:'rgba(255,255,255,0.4)'},
              ].map(s=>(
                <div key={s.label} style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'10px 12px',border:'1px solid rgba(255,255,255,0.07)',textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:700}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* User list */}
            {filteredUsers.map(u=>(
              <div key={u.id} style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:'14px 16px',marginBottom:8,border:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:u.is_pro?'linear-gradient(135deg,#8b5cf6,#0a84ff)':'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {u.is_pro?'⭐':'👤'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name}</span>
                    {u.is_pro&&<span style={{fontSize:9,padding:'1px 7px',borderRadius:8,background:'rgba(255,214,10,0.2)',color:'#ffd60a',fontWeight:800,border:'1px solid rgba(255,214,10,0.3)',flexShrink:0}}>PRO</span>}
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{u.email}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:2}}>{u.specialty} · {u.cases_completed} cases · {u.xp} XP</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{u.created_at}</div>
                  <button style={{marginTop:6,padding:'4px 10px',borderRadius:8,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'#c4b5fd',fontSize:10,cursor:'pointer',fontWeight:700}}>
                    {u.is_pro?'Revoke':'Grant PRO'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ERRORS ── */}
        {activeTab==='errors'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:'white'}}>🚨 Error Log</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>Auto-captured from app</div>
              </div>
              <div style={{fontSize:11,padding:'4px 12px',borderRadius:10,background:'rgba(255,69,58,0.15)',color:'#ff453a',border:'1px solid rgba(255,69,58,0.3)',fontWeight:700}}>
                {errors.filter(e=>!e.resolved).length} unresolved
              </div>
            </div>

            {errors.map(e=>(
              <div key={e.id} style={{background:e.resolved?'rgba(255,255,255,0.03)':'rgba(255,69,58,0.06)',borderRadius:18,padding:'14px 16px',marginBottom:8,border:e.resolved?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(255,69,58,0.2)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:e.resolved?'rgba(255,255,255,0.5)':'white',flex:1,marginRight:8}}>{e.error_message}</div>
                  <span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:e.resolved?'rgba(48,209,88,0.15)':'rgba(255,69,58,0.15)',color:e.resolved?'#30d158':'#ff453a',fontWeight:800,flexShrink:0,border:`1px solid ${e.resolved?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`}}>
                    {e.resolved?'RESOLVED':'OPEN'}
                  </span>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.05)',borderRadius:6,padding:'2px 8px'}}>{e.error_source}</span>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.05)',borderRadius:6,padding:'2px 8px'}}>{e.page_context}</span>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.25)'}}>{new Date(e.created_at).toLocaleString()}</span>
                </div>
                {!e.resolved&&(
                  <button
                    onClick={()=>setErrors(prev=>prev.map(x=>x.id===e.id?{...x,resolved:true}:x))}
                    style={{marginTop:10,padding:'6px 14px',borderRadius:10,border:'1px solid rgba(48,209,88,0.3)',background:'rgba(48,209,88,0.1)',color:'#30d158',fontSize:11,cursor:'pointer',fontWeight:700}}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeTab==='content'&&(
          <div>
            <div style={{fontSize:16,fontWeight:800,color:'white',marginBottom:14}}>🏥 Content Overview</div>

            {[
              {section:'Critical Care & Emergency',cases:9,free:4,pro:5,color:'#ff453a',icon:'🚨'},
              {section:'Sports Medicine — FIFA 2026',cases:4,free:1,pro:3,color:'#30d158',icon:'⚽'},
              {section:'Pediatrics',cases:3,free:0,pro:3,color:'#bf5af2',icon:'🧸'},
              {section:'Radiology',cases:5,free:5,pro:0,color:'#0a84ff',icon:'🩻'},
              {section:'MCQ Bank',cases:10,free:10,pro:0,color:'#ff9f0a',icon:'🧬'},
            ].map(s=>(
              <div key={s.section} style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:'14px 16px',marginBottom:8,border:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:11,background:`${s.color}18`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:'white'}}>{s.section}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:1}}>{s.cases} total cases</div>
                  </div>
                  <button style={{padding:'6px 12px',borderRadius:10,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'#c4b5fd',fontSize:11,cursor:'pointer',fontWeight:700}}>+ Add</button>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(48,209,88,0.12)',color:'#30d158',border:'1px solid rgba(48,209,88,0.2)',fontWeight:700}}>🆓 {s.free} Free</span>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.12)',color:'#ffd60a',border:'1px solid rgba(255,214,10,0.2)',fontWeight:700}}>⭐ {s.pro} PRO</span>
                </div>
              </div>
            ))}

            {/* Add new case button */}
            <button style={{width:'100%',padding:'16px',borderRadius:18,border:'2px dashed rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.05)',color:'rgba(139,92,246,0.8)',fontSize:15,fontWeight:700,cursor:'pointer',marginTop:4}}>
              + Add New Case
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:rgba(255,255,255,0.3)}
      `}</style>
    </div>
  )
}
