'use client'
import { useState , useRef } from 'react'
import dynamic from 'next/dynamic'

const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), { ssr: false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'

const D = {
  bg:          '#F0F6FF',
  card:        'rgba(255,255,255,0.92)',
  cardSolid:   '#FFFFFF',
  text:        '#0A1628',
  textSub:     'rgba(10,22,40,0.60)',
  textMuted:   'rgba(10,22,40,0.38)',
  border:      'rgba(10,132,255,0.10)',
  accent:      '#00C2B2',
  accentBlue:  '#0A84FF',
  accentMint:  '#30D158',
  accentAmber: '#FF9F0A',
  accentCoral: '#FF6B6B',
  glass: {
    background:           'rgba(255,255,255,0.88)',
    backdropFilter:       'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    borderRadius:         20,
    border:               '1px solid rgba(10,132,255,0.09)',
    boxShadow:            '0 2px 20px rgba(10,132,255,0.07)',
  }
}

const RANKS = [
  { name:'Clinical Clerk',    icon:'🩺', color:'#64748b', xpNeeded:0 },
  { name:'Junior Resident',   icon:'📋', color:'#00C2B2', xpNeeded:100 },
  { name:'Senior Resident',   icon:'🔬', color:'#30D158', xpNeeded:300 },
  { name:'Registrar',         icon:'⚕️', color:'#FF9F0A', xpNeeded:600 },
  { name:'Specialist',        icon:'🏥', color:'#0A84FF', xpNeeded:1000 },
  { name:'Consultant',        icon:'👨‍⚕️', color:'#FF6B6B', xpNeeded:1500 },
  { name:'Senior Consultant', icon:'🎓', color:'#FFD60A', xpNeeded:2200 },
  { name:'Chief of Medicine', icon:'🌟', color:'#7C5CFC', xpNeeded:3000 },
]

const BADGES = [
  { id:'first_case', icon:'🏅', name:'First Case',    color:'#FFD60A' },
  { id:'cardio',     icon:'🫀', name:'Cardiologist',  color:'#FF6B6B' },
  { id:'speed',      icon:'⚡', name:'Lightning MD',  color:'#FF9F0A' },
  { id:'streak3',    icon:'🔥', name:'On Fire',       color:'#FF6B35' },
  { id:'mcq10',      icon:'🧬', name:'Brain Trust',   color:'#30D158' },
  { id:'stemi',      icon:'❤️\u200d🔥', name:'STEMI Master', color:'#FF6B6B' },
  { id:'sports',     icon:'⚽', name:'FIFA Medic',    color:'#30D158' },
  { id:'peds',       icon:'🧸', name:'Pediatrician',  color:'#7C5CFC' },
]

interface ProfileProps {
  xp: number
  streak: number
  casesCompleted: number
  mcqCorrect: number
  isPro: boolean
  name: string
  onUpgrade: () => void
  onReset: () => void
}

function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} style={{
      display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent',
      color:'#0A84FF', fontSize:16, fontWeight:600, cursor:'pointer', marginBottom:20, padding:0,
    }}>‹ Back</button>
  )
}

function Toggle({ val, onToggle }: { val: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      width:51, height:31, borderRadius:16, cursor:'pointer', flexShrink:0,
      background: val ? '#0A84FF' : 'rgba(10,22,40,0.15)',
      position:'relative', transition:'background 0.25s',
    }}>
      <div style={{
        position:'absolute', top:2, left: val ? 22 : 2,
        width:27, height:27, borderRadius:'50%', background:'#fff',
        boxShadow:'0 2px 6px rgba(0,0,0,0.18)', transition:'left 0.25s',
      }}/>
    </div>
  )
}

function RowItem({ icon, label, sub, onPress, right }: {
  icon:string; label:string; sub:string; onPress?:()=>void; right?: React.ReactNode
}) {
  return (
    <div onClick={onPress} style={{
      display:'flex', alignItems:'center', gap:14, padding:'15px 16px', cursor: onPress ? 'pointer' : 'default',
    }}>
      <div style={{
        width:38, height:38, borderRadius:11, flexShrink:0,
        background:'rgba(10,132,255,0.08)', border:'1px solid rgba(10,132,255,0.10)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:19,
      }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:'#0A1628' }}>{label}</div>
        <div style={{ fontSize:11, color:'rgba(10,22,40,0.38)' }}>{sub}</div>
      </div>
      {right ?? (onPress && <span style={{ fontSize:20, color:'rgba(10,22,40,0.38)' }}>›</span>)}
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return <div style={{ fontSize:11, color:'rgba(10,22,40,0.38)', fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>{text}</div>
}

function Card({ children, mb=14 }: { children: React.ReactNode; mb?: number }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.88)', backdropFilter:'blur(28px) saturate(180%)',
      WebkitBackdropFilter:'blur(28px) saturate(180%)', borderRadius:20,
      border:'1px solid rgba(10,132,255,0.09)', boxShadow:'0 2px 20px rgba(10,132,255,0.07)',
      overflow:'hidden', marginBottom:mb,
    }}>{children}</div>
  )
}

// ── Edit Profile ──────────────────────────────────────────────────
function EditProfileScreen({ name, onBack }: { name:string; onBack:()=>void }) {
  const [displayName, setDisplayName] = useState(name || 'Dr. Ahmed')
  const [specialty, setSpecialty]     = useState('Cardiology')
  const [country, setCountry]         = useState('Saudi Arabia')
  const [saved, setSaved]             = useState(false)
  const specialties = ['Cardiology','Emergency Medicine','Internal Medicine','Pediatrics',
    'Surgery','Neurology','Radiology','Anesthesia','Psychiatry','Family Medicine']
  const save = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cliniverse_name', displayName)
      localStorage.setItem('cliniverse_specialty', specialty)
      localStorage.setItem('cliniverse_country', country)
    }
    setSaved(true)
    setTimeout(() => { setSaved(false); onBack() }, 1200)
  }
  const inputStyle = {
    width:'100%', padding:'14px 16px', borderRadius:14,
    border:'1.5px solid rgba(10,132,255,0.10)', background:'#FFFFFF',
    fontSize:15, color:'#0A1628', fontFamily:F, boxSizing:'border-box' as const, outline:'none',
  }
  return (
    <div style={{ fontFamily:F }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:4 }}>Edit Profile</div>
      <div style={{ fontSize:13, color:'rgba(10,22,40,0.60)', marginBottom:24 }}>Your clinical identity</div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{
          width:88, height:88, borderRadius:'50%', margin:'0 auto 10px',
          background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:38, boxShadow:'0 10px 28px rgba(0,194,178,0.30)',
          border:'3px solid white',
        }}>👤</div>
        <button style={{ border:'none', background:'transparent', color:'#0A84FF', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Change Photo
        </button>
      </div>
      <div style={{ marginBottom:14 }}>
        <SectionLabel text="FULL NAME" />
        <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)}
          placeholder="Dr. Ahmed" style={inputStyle} />
      </div>
      <div style={{ marginBottom:14 }}>
        <SectionLabel text="SPECIALTY" />
        <select value={specialty} onChange={e=>setSpecialty(e.target.value)} style={inputStyle}>
          {specialties.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginBottom:28 }}>
        <SectionLabel text="COUNTRY" />
        <input type="text" value={country} onChange={e=>setCountry(e.target.value)}
          placeholder="Saudi Arabia" style={inputStyle} />
      </div>
      <button onClick={save} style={{
        width:'100%', padding:16, borderRadius:16, border:'none',
        background: saved ? '#30D158' : 'linear-gradient(135deg,#00C2B2,#0A84FF)',
        color:'white', fontSize:16, fontWeight:700, cursor:'pointer',
        boxShadow:'0 8px 24px rgba(10,132,255,0.22)', transition:'background 0.3s',
      }}>{saved ? '✓ Saved!' : 'Save Profile'}</button>
    </div>
  )
}

// ── Notifications ─────────────────────────────────────────────────
function NotificationsScreen({ onBack }: { onBack:()=>void }) {
  const [s, setS] = useState({ push:true, oncall:true, cases:true, streaks:true, weekly:false })
  const toggle = (k: keyof typeof s) => setS(p=>({...p,[k]:!p[k]}))
  const items = [
    { key:'push',    icon:'📲', label:'Push Notifications', sub:'Enable all app alerts' },
    { key:'oncall',  icon:'⏰', label:'On-Call Reminders',  sub:'Duty schedule alerts' },
    { key:'cases',   icon:'🏥', label:'New Cases',          sub:'Daily case notifications' },
    { key:'streaks', icon:'🔥', label:'Streak Reminders',   sub:'Keep your streak alive' },
    { key:'weekly',  icon:'📊', label:'Weekly Summary',     sub:'Performance digest' },
  ]
  return (
    <div style={{ fontFamily:F }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:4 }}>Notifications</div>
      <div style={{ fontSize:13, color:'rgba(10,22,40,0.60)', marginBottom:24 }}>Clinical alerts & reminders</div>
      <Card>
        {items.map((item,i)=>(
          <div key={item.key} style={{ borderBottom: i<items.length-1 ? '1px solid rgba(10,132,255,0.09)' : 'none' }}>
            <RowItem icon={item.icon} label={item.label} sub={item.sub}
              right={<Toggle val={s[item.key as keyof typeof s]} onToggle={()=>toggle(item.key as keyof typeof s)} />} />
          </div>
        ))}
      </Card>
      <SectionLabel text="ON-CALL SCHEDULE" />
      <Card>
        {['Sunday','Tuesday','Thursday'].map((day,i)=>(
          <div key={day} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'13px 16px', borderBottom: i<2 ? '1px solid rgba(10,132,255,0.09)' : 'none',
          }}>
            <span style={{ fontSize:14, fontWeight:600, color:'#0A1628' }}>{day}</span>
            <span style={{ fontSize:13, color:'#0A84FF', fontWeight:700 }}>08:00 – 20:00</span>
          </div>
        ))}
        <div style={{ padding:'12px 16px' }}>
          <button style={{
            width:'100%', padding:'11px', borderRadius:12,
            border:'1.5px dashed rgba(10,132,255,0.30)', background:'transparent',
            color:'#0A84FF', fontSize:13, fontWeight:700, cursor:'pointer',
          }}>+ Add Shift</button>
        </div>
      </Card>
    </div>
  )
}

// ── Privacy & Security ────────────────────────────────────────────
function PrivacyScreen({ onBack, onReset }: { onBack:()=>void; onReset:()=>void }) {
  const [biometric, setBiometric] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  return (
    <div style={{ fontFamily:F }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:4 }}>Privacy & Security</div>
      <div style={{ fontSize:13, color:'rgba(10,22,40,0.60)', marginBottom:24 }}>Your data, your control</div>
      <SectionLabel text="SECURITY" />
      <Card>
        <div style={{ borderBottom:'1px solid rgba(10,132,255,0.09)' }}>
          <RowItem icon="🔒" label="Biometric Lock" sub="Face ID / Touch ID"
            right={<Toggle val={biometric} onToggle={()=>setBiometric(!biometric)} />} />
        </div>
        <RowItem icon="📊" label="Usage Analytics" sub="Help improve the app"
          right={<Toggle val={analytics} onToggle={()=>setAnalytics(!analytics)} />} />
      </Card>
      <SectionLabel text="DATA" />
      <Card mb={20}>
        {[
          { icon:'📥', label:'Export My Data',   sub:'Download your clinical records' },
          { icon:'🔗', label:'Privacy Policy',   sub:'How we handle your data', onPress:()=>window.open('/privacy.html','_blank') },
          { icon:'⚖️', label:'Terms of Service', sub:'Legal agreement', onPress:()=>window.open('/privacy.html','_blank') },
        ].map((item,i)=>(
          <div key={item.label} style={{ borderBottom: i<2 ? '1px solid rgba(10,132,255,0.09)' : 'none' }}>
            <RowItem icon={item.icon} label={item.label} sub={item.sub} onPress={()=>{}} />
          </div>
        ))}
      </Card>
      <button onClick={onReset} style={{
        width:'100%', padding:14, borderRadius:16,
        border:'1px solid rgba(255,107,107,0.30)', background:'rgba(255,107,107,0.07)',
        color:'#C0392B', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:10,
      }}>🔄 Reset All Progress</button>
      <button style={{
        width:'100%', padding:14, borderRadius:16,
        border:'1px solid rgba(255,107,107,0.30)', background:'rgba(255,107,107,0.07)',
        color:'#C0392B', fontSize:14, fontWeight:700, cursor:'pointer',
      }}>🗑 Delete Account</button>
    </div>
  )
}

// ── Install App ───────────────────────────────────────────────────
function InstallScreen({ onBack }: { onBack:()=>void }) {
  return (
    <div style={{ fontFamily:F }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:4 }}>Install App</div>
      <div style={{ fontSize:13, color:'rgba(10,22,40,0.60)', marginBottom:24 }}>Available on all platforms</div>
      {[
        { icon:'🍎', title:'App Store',          sub:'iPhone & iPad · iOS 16+',    status:'Available',    color:'#0A84FF' },
        { icon:'🤖', title:'Google Play',        sub:'Android 10+',                status:'Coming Soon',  color:'rgba(10,22,40,0.38)' },
        { icon:'🖥',  title:'Mac App',            sub:'macOS 13+',                  status:'Coming Soon',  color:'rgba(10,22,40,0.38)' },
        { icon:'📲', title:'Add to Home Screen', sub:'Install as PWA from browser', status:'Quick Install',color:'#00C2B2' },
      ].map(item=>(
        <div key={item.title} style={{
          background:'rgba(255,255,255,0.88)', backdropFilter:'blur(28px)',
          WebkitBackdropFilter:'blur(28px)', borderRadius:18,
          border:'1px solid rgba(10,132,255,0.09)', boxShadow:'0 2px 16px rgba(10,132,255,0.06)',
          display:'flex', alignItems:'center', gap:14, padding:'16px 18px', marginBottom:12,
        }}>
          <span style={{ fontSize:34 }}>{item.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#0A1628' }}>{item.title}</div>
            <div style={{ fontSize:12, color:'rgba(10,22,40,0.38)' }}>{item.sub}</div>
          </div>
          <div style={{
            padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700,
            background: item.status==='Coming Soon' ? 'rgba(10,22,40,0.06)' : `${item.color}18`,
            color: item.color, border:`1px solid ${item.color}30`,
          }}>{item.status}</div>
        </div>
      ))}
    </div>
  )
}

// ── Feedback ──────────────────────────────────────────────────────
function FeedbackScreen({ onBack }: { onBack:()=>void }) {
  const [text, setText]   = useState('')
  const [rating, setRating] = useState(0)
  const [sent, setSent]   = useState(false)
  const send = () => { setSent(true); setTimeout(onBack, 1500) }
  return (
    <div style={{ fontFamily:F }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:4 }}>Send Feedback</div>
      <div style={{ fontSize:13, color:'rgba(10,22,40,0.60)', marginBottom:28 }}>Help us build the #1 clinical app</div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:12, color:'rgba(10,22,40,0.38)', fontWeight:700, letterSpacing:1, marginBottom:12 }}>RATE YOUR EXPERIENCE</div>
        <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
          {[1,2,3,4,5].map(s=>(
            <span key={s} onClick={()=>setRating(s)} style={{
              fontSize:40, cursor:'pointer', transition:'transform 0.15s',
              transform: s<=rating ? 'scale(1.25)' : 'scale(1)',
            }}>{s<=rating ? '⭐' : '☆'}</span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:22 }}>
        <SectionLabel text="YOUR FEEDBACK" />
        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder="What can we improve? What do you love?" rows={5}
          style={{
            width:'100%', padding:'14px 16px', borderRadius:14,
            border:'1.5px solid rgba(10,132,255,0.10)', background:'#FFFFFF',
            fontSize:14, color:'#0A1628', fontFamily:F, resize:'none',
            boxSizing:'border-box', outline:'none',
          }} />
      </div>
      <button onClick={send} disabled={!text && rating===0} style={{
        width:'100%', padding:16, borderRadius:16, border:'none',
        background: sent ? '#30D158' : 'linear-gradient(135deg,#00C2B2,#0A84FF)',
        color:'white', fontSize:16, fontWeight:700, cursor:'pointer',
        boxShadow:'0 8px 24px rgba(10,132,255,0.20)', transition:'background 0.3s',
        opacity: (!text && rating===0) ? 0.5 : 1,
      }}>{sent ? '✓ Thank you!' : '🚀 Send Feedback'}</button>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function ProfilePage({ xp, streak, casesCompleted, mcqCorrect, isPro, name, onUpgrade, onReset }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile'|'stats'|'settings'>('profile')
  const _tX = React.useRef(0)
  const _tY = React.useRef(0)
  const TABS: ('profile'|'stats'|'settings')[] = ['profile','stats','settings']
  const swipeTab = (dir: 'left'|'right') => {
    const i = TABS.indexOf(activeTab)
    if (dir==='left'  && i < TABS.length-1) setActiveTab(TABS[i+1])
    if (dir==='right' && i > 0)             setActiveTab(TABS[i-1])
  }
  const [subScreen, setSubScreen] = useState<string|null>(null)
  const [showCert, setShowCert]   = useState(false)
  const [notif, setNotif]         = useState(true)
  const [sound, setSound]         = useState(true)
  const [haptics, setHaptics]     = useState(true)
  const [compact, setCompact]     = useState(false)

  const getRank    = () => { let r=RANKS[0]; for(let i=RANKS.length-1;i>=0;i--){if(xp>=RANKS[i].xpNeeded){r=RANKS[i];break}} return r }
  const getNextRank= () => { for(let i=0;i<RANKS.length;i++){if(xp<RANKS[i].xpNeeded)return RANKS[i]} return null }
  const rank     = getRank()
  const nextRank = getNextRank()
  const rankPct  = nextRank ? Math.round(((xp-rank.xpNeeded)/(nextRank.xpNeeded-rank.xpNeeded))*100) : 100

  if (subScreen==='edit')     return <EditProfileScreen name={name} onBack={()=>setSubScreen(null)} />
  if (subScreen==='notif')    return <NotificationsScreen onBack={()=>setSubScreen(null)} />
  if (subScreen==='privacy')  return <PrivacyScreen onBack={()=>setSubScreen(null)} onReset={onReset} />
  if (subScreen==='install')  return <InstallScreen onBack={()=>setSubScreen(null)} />
  if (subScreen==='feedback') return <FeedbackScreen onBack={()=>setSubScreen(null)} />

  return (
    <div style={{ fontFamily:F, paddingBottom:24 }}>

      {/* TAB BAR */}
      <div style={{
        display:'flex', gap:4, background:'rgba(255,255,255,0.92)',
        backdropFilter:'blur(16px)', border:'1px solid rgba(10,132,255,0.10)',
        borderRadius:18, padding:5, marginBottom:20,
        boxShadow:'0 2px 12px rgba(10,132,255,0.07)',
      }}>
        {(['profile','stats','settings'] as const).map((t,i)=>{
          const icons = ['👤','📊','⚙️']
          const labels = ['Profile','Stats','Settings']
          return (
            <button key={t} onClick={()=>setActiveTab(t)} style={{
              flex:1, padding:'10px 4px', border:'none', cursor:'pointer', borderRadius:13,
              fontFamily:F, fontWeight:700, fontSize:12,
              background: activeTab===t ? '#FFFFFF' : 'transparent',
              color: activeTab===t ? '#0A84FF' : 'rgba(10,22,40,0.38)',
              boxShadow: activeTab===t ? '0 2px 10px rgba(10,132,255,0.12)' : 'none',
              transition:'all 0.2s',
            }}>{icons[i]} {labels[i]}</button>
          )
        })}
      </div>

      {/* PROFILE TAB */}
      {activeTab==='profile' && (
        <div>
          <div style={{
            background:'linear-gradient(160deg,rgba(0,194,178,0.09),rgba(10,132,255,0.06))',
            backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
            borderRadius:20, border:'1px solid rgba(10,132,255,0.09)',
            boxShadow:'0 2px 20px rgba(10,132,255,0.07)',
            padding:'30px 20px 22px', marginBottom:14, textAlign:'center',
          }}>
            <div style={{
              width:84, height:84, borderRadius:'50%', margin:'0 auto 14px',
              background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:38, boxShadow:'0 10px 30px rgba(0,194,178,0.30)',
              border:'3px solid rgba(255,255,255,0.95)',
            }}>👤</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:3, letterSpacing:-0.5 }}>
              {name||'Dr. Ahmed'}
            </div>
            <div style={{ fontSize:14, color:'rgba(10,22,40,0.60)', marginBottom:18 }}>
              {rank.icon} {rank.name}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:11, color:'rgba(10,22,40,0.38)', fontWeight:700, letterSpacing:0.5 }}>XP PROGRESS</span>
              <span style={{ fontSize:12, fontWeight:800, color:'#0A84FF' }}>{xp} XP</span>
            </div>
            <div style={{ height:8, background:'rgba(10,132,255,0.10)', borderRadius:6, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:`${rankPct}%`,
                background:'linear-gradient(90deg,#00C2B2,#0A84FF)', borderRadius:6,
                transition:'width 0.8s', boxShadow:'0 0 10px rgba(0,194,178,0.45)',
              }}/>
            </div>
            {nextRank && (
              <div style={{ fontSize:10, color:'rgba(10,22,40,0.38)', marginTop:5, textAlign:'right' }}>
                {nextRank.xpNeeded-xp} XP to {nextRank.icon} {nextRank.name}
              </div>
            )}
            {isPro && (
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6, marginTop:14,
                background:'linear-gradient(135deg,#FFD60A,#FF9F0A)',
                borderRadius:12, padding:'5px 16px', fontSize:11, fontWeight:800, color:'#7A4700',
              }}>👑 PRO Member</div>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
            {[
              { label:'Cases Done',  value:casesCompleted, icon:'🏥', color:'#00C2B2' },
              { label:'MCQ Correct', value:mcqCorrect,     icon:'🧬', color:'#0A84FF' },
              { label:'Day Streak',  value:streak,         icon:'🔥', color:'#FF9F0A' },
            ].map(s=>(
              <div key={s.label} style={{
                background:'rgba(255,255,255,0.88)', backdropFilter:'blur(28px)',
                WebkitBackdropFilter:'blur(28px)', borderRadius:20,
                border:'1px solid rgba(10,132,255,0.09)', boxShadow:'0 2px 20px rgba(10,132,255,0.07)',
                padding:'16px 10px', textAlign:'center',
              }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:9, color:'rgba(10,22,40,0.38)', fontWeight:700, marginTop:4, letterSpacing:0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <Card mb={14}>
            <div style={{ padding:'16px 16px 4px' }}>
              <div style={{ fontSize:11, color:'rgba(10,22,40,0.38)', fontWeight:700, letterSpacing:1.5, marginBottom:14 }}>🏅 BADGES EARNED</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'0 16px 16px' }}>
              {BADGES.map(b=>(
                <div key={b.id} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  background:`${b.color}10`, border:`1px solid ${b.color}22`,
                  borderRadius:14, padding:'10px 6px',
                }}>
                  <span style={{ fontSize:24 }}>{b.icon}</span>
                  <span style={{ fontSize:8, color:b.color, fontWeight:700, textAlign:'center', lineHeight:1.2 }}>{b.name}</span>
                </div>
              ))}
            </div>
          </Card>

          <button onClick={()=>setShowCert(true)} style={{
            width:'100%', padding:15, borderRadius:16, border:'none',
            background:'linear-gradient(135deg,#00C2B2,#0A84FF)',
            color:'white', fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 8px 24px rgba(0,194,178,0.28)', marginBottom:10,
          }}>📜 Generate Clinical Certificate</button>

          {!isPro && (
            <button onClick={onUpgrade} style={{
              width:'100%', padding:14, borderRadius:16,
              border:'1.5px solid rgba(255,214,10,0.35)',
              background:'rgba(255,214,10,0.07)',
              color:'#9A6800', fontSize:14, fontWeight:700, cursor:'pointer',
            }}>⭐ Upgrade to PRO — $14.99/mo</button>
          )}
          {showCert && <CertificateGenerator rank={rank.name} xp={xp} casesCompleted={casesCompleted} onClose={()=>setShowCert(false)} />}
        </div>
      )}

      {/* STATS TAB */}
      {activeTab==='stats' && (
        <div>
          <div style={{
            background:`linear-gradient(135deg,${rank.color}12,${rank.color}06)`,
            backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
            borderRadius:20, border:`1px solid ${rank.color}25`,
            boxShadow:'0 2px 20px rgba(10,132,255,0.07)',
            padding:'18px 20px', marginBottom:14,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:44 }}>{rank.icon}</span>
              <div>
                <div style={{ fontSize:11, color:'rgba(10,22,40,0.38)', fontWeight:700, letterSpacing:1 }}>CLINICAL RANK</div>
                <div style={{ fontSize:20, fontWeight:900, color:rank.color }}>{rank.name}</div>
                {nextRank && <div style={{ fontSize:12, color:'rgba(10,22,40,0.60)' }}>{nextRank.xpNeeded-xp} XP to {nextRank.name}</div>}
              </div>
            </div>
          </div>

          <Card mb={14}>
            <div style={{ padding:'16px 16px 4px' }}>
              <div style={{ fontSize:11, color:'rgba(10,22,40,0.38)', fontWeight:700, letterSpacing:1.5, marginBottom:14 }}>📈 WEEKLY ACTIVITY</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', height:70, padding:'0 16px 16px' }}>
              {['M','T','W','T','F','S','S'].map((d,i)=>{
                const h=[40,75,55,90,60,30,20][i]
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flex:1 }}>
                    <div style={{
                      width:'65%', height:`${h}%`, minHeight:4,
                      background: i===4 ? 'linear-gradient(180deg,#00C2B2,#0A84FF)' : 'rgba(10,132,255,0.12)',
                      borderRadius:'5px 5px 2px 2px',
                      boxShadow: i===4 ? '0 4px 12px rgba(0,194,178,0.30)' : 'none',
                    }}/>
                    <span style={{ fontSize:10, color: i===4 ? '#0A84FF' : 'rgba(10,22,40,0.38)', fontWeight: i===4?700:500 }}>{d}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {[
            { label:'Total XP Earned',  value:xp,            unit:'pts',    icon:'⚡', color:'#0A84FF' },
            { label:'Cases Completed',  value:casesCompleted, unit:'cases', icon:'🏥', color:'#00C2B2' },
            { label:'MCQ Answered',     value:mcqCorrect,    unit:'correct',icon:'🧬', color:'#30D158' },
            { label:'Current Streak',   value:streak,        unit:'days',   icon:'🔥', color:'#FF9F0A' },
            { label:'Badges Collected', value:BADGES.length, unit:'badges', icon:'🏅', color:'#FFD60A' },
          ].map(s=>(
            <div key={s.label} style={{
              background:'rgba(255,255,255,0.88)', backdropFilter:'blur(28px)',
              WebkitBackdropFilter:'blur(28px)', borderRadius:20,
              border:'1px solid rgba(10,132,255,0.09)', boxShadow:'0 2px 20px rgba(10,132,255,0.07)',
              padding:'14px 16px', marginBottom:10,
              display:'flex', alignItems:'center', gap:14,
            }}>
              <div style={{
                width:46, height:46, borderRadius:14, flexShrink:0,
                background:`${s.color}12`, border:`1px solid ${s.color}25`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
              }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:'rgba(10,22,40,0.38)', fontWeight:600, marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              </div>
              <div style={{
                fontSize:11, color:s.color, fontWeight:700,
                background:`${s.color}10`, padding:'4px 10px', borderRadius:8,
              }}>{s.unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab==='settings' && (
        <div>
          <SectionLabel text="ACCOUNT" />
          <Card mb={16}>
            {[
              { icon:'👤', label:'Edit Profile',       sub:'Name · Specialty · Country',  action:()=>setSubScreen('edit') },
              { icon:'🔔', label:'Notifications',      sub:'On-call reminders · Alerts',  action:()=>setSubScreen('notif') },
              { icon:'📱', label:'Install App',        sub:'App Store · PWA',             action:()=>setSubScreen('install') },
              { icon:'🔒', label:'Privacy & Security', sub:'Data · Account settings',     action:()=>setSubScreen('privacy') },
            ].map((item,i)=>(
              <div key={item.label} style={{ borderBottom: i<3 ? '1px solid rgba(10,132,255,0.09)' : 'none' }}>
                <RowItem icon={item.icon} label={item.label} sub={item.sub} onPress={item.action} />
              </div>
            ))}
          </Card>

          <SectionLabel text="PREFERENCES" />
          <Card mb={16}>
            {[
              { icon:'🔔', label:'Notifications', sub:'Clinical reminders', val:notif,   set:setNotif },
              { icon:'🔊', label:'Sound Effects', sub:'Feedback sounds',    val:sound,   set:setSound },
              { icon:'📳', label:'Haptics',        sub:'Tactile feedback',   val:haptics, set:setHaptics },
              { icon:'⬛', label:'Compact Mode',   sub:'Denser layout',      val:compact, set:setCompact },
            ].map((item,i)=>(
              <div key={item.label} style={{ borderBottom: i<3 ? '1px solid rgba(10,132,255,0.09)' : 'none' }}>
                <RowItem icon={item.icon} label={item.label} sub={item.sub}
                  right={<Toggle val={item.val} onToggle={()=>item.set(!item.val)} />} />
              </div>
            ))}
          </Card>

          <SectionLabel text="ABOUT" />
          <Card mb={16}>
            {[
              { icon:'ℹ️', label:'Version',         sub:'Cliniverse AI v6.0 · 2026',  action:()=>{} },
              { icon:'⚖️', label:'Terms & Privacy', sub:'Legal · Data usage',         action:()=>setSubScreen('privacy') },
              { icon:'💬', label:'Send Feedback',   sub:'Help us improve',            action:()=>setSubScreen('feedback') },
              { icon:'⭐', label:'Rate the App',    sub:'Support Cliniverse AI',      action:()=>{} },
            ].map((item,i)=>(
              <div key={item.label} style={{ borderBottom: i<3 ? '1px solid rgba(10,132,255,0.09)' : 'none' }}>
                <RowItem icon={item.icon} label={item.label} sub={item.sub} onPress={item.action} />
              </div>
            ))}
          </Card>

          <button onClick={onReset} style={{
            width:'100%', padding:14, borderRadius:16,
            border:'1px solid rgba(255,107,107,0.28)', background:'rgba(255,107,107,0.06)',
            color:'#C0392B', fontSize:14, fontWeight:600, cursor:'pointer',
          }}>🔄 Reset Onboarding</button>
        </div>
      )}
    </div>
  )
}
