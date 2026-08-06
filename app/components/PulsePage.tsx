'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { C, A, T } from '../lib/ds'
import { Icons } from '../lib/icons'
import { glass, S } from '../lib/glass'

const AmbientScribe = dynamic(() => import('./AmbientScribe'), { ssr:false })
const LiveCaseViewer = dynamic(() => import('./LiveCaseViewer'), { ssr:false })
const PulseAcademy = dynamic(() => import('./PulseAcademy'), { ssr:false })

const F = 'var(--font)'

// ── UNSPLASH IMAGES ──
const IMGS = {
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  er:       'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
  research: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80',
}

// ── MINI COMPONENTS ──
const VitalChip = ({ icon, value, unit, label, crit=false }:any) => (
  <div style={{
    background: crit ? 'rgba(248,113,113,0.10)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${crit ? 'rgba(248,113,113,0.30)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius:16, padding:'12px 10px', textAlign:'center',
    flex:1,
  }}>
    <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
    <div style={{fontSize:18,fontWeight:800,color: crit ? '#F87171' : '#E8F4FD',lineHeight:1}}>{value}</div>
    <div style={{fontSize:9,color:'rgba(232,244,253,0.40)',marginTop:2}}>{unit}</div>
    <div style={{fontSize:8,color:'rgba(232,244,253,0.35)',letterSpacing:0.8,marginTop:1}}>{label}</div>
  </div>
)

const SectionLabel = ({ children }:any) => (
  <div style={{
    fontSize:10, fontWeight:700, letterSpacing:2,
    color:'rgba(232,244,253,0.35)', marginBottom:12,
    textTransform:'uppercase', fontFamily:F,
  }}>{children}</div>
)

const GlassCard = ({ children, accent, onClick, style={} }:any) => (
  <div onClick={onClick} style={{
    background:'rgba(255,255,255,0.04)',
    backdropFilter:'blur(24px)',
    WebkitBackdropFilter:'blur(24px)',
    border:`1px solid ${accent ? accent+'30' : 'rgba(255,255,255,0.08)'}`,
    borderRadius:24,
    boxShadow: accent ? `0 8px 32px ${accent}15` : '0 4px 20px rgba(0,0,0,0.30)',
    cursor: onClick ? 'pointer' : 'default',
    overflow:'hidden',
    ...style,
  }}>{children}</div>
)

// ── ISLAND 1: TODAY ──
function TodayIsland({ xp, streak, isPro }:any) {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t) },[])

  const h = time.getHours()
  const shift = h<7?'🌙 Night Shift':h<12?'🌅 Morning Round':h<17?'☀️ Afternoon':h<21?'🌆 Evening Round':'🌙 Night Shift'
  const dayName = time.toLocaleDateString('en',{weekday:'long'})
  const dateStr = time.toLocaleDateString('en',{day:'numeric',month:'short'})
  const timeStr = time.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})

  return (
    <GlassCard accent="#00D4C8" style={{marginBottom:14,position:'relative',overflow:'hidden'}}>
      {/* Hero image */}
      <div style={{
        position:'absolute',inset:0,
        backgroundImage:`url(${IMGS.hospital})`,
        backgroundSize:'cover',backgroundPosition:'center',
        opacity:0.18,
      }}/>
      {/* Gradient overlay */}
      <div style={{
        position:'absolute',inset:0,
        background:'linear-gradient(160deg,rgba(0,212,200,0.08) 0%,rgba(15,24,36,0.95) 100%)',
      }}/>

      <div style={{position:'relative',zIndex:1,padding:'20px 18px'}}>
        {/* Top row */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <div style={{
              display:'inline-flex',alignItems:'center',gap:6,
              background:'rgba(248,113,113,0.15)',border:'1px solid rgba(248,113,113,0.30)',
              borderRadius:20,padding:'3px 10px',marginBottom:8,
            }}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#F87171',animation:'pulse 1.5s infinite'}}/>
              <span style={{fontSize:10,color:'#F87171',fontWeight:700,letterSpacing:1}}>LIVE</span>
              <span style={{fontSize:10,color:'rgba(248,113,113,0.70)'}}>1,247 online</span>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:'#E8F4FD',letterSpacing:-0.5}}>{dayName}, {dateStr}</div>
            <div style={{fontSize:13,color:'rgba(232,244,253,0.50)',marginTop:2}}>{timeStr} · {shift}</div>
          </div>
          {/* Avatar */}
          <div style={{
            width:46,height:46,borderRadius:'50%',
            background:'linear-gradient(135deg,#00D4C8,#4F8EF7)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:20,fontWeight:900,color:'white',
            boxShadow:'0 4px 16px rgba(0,212,200,0.30)',
            flexShrink:0,
          }}>DA</div>
        </div>

        {/* Vitals row */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          <VitalChip icon="🫀" value="72" unit="bpm" label="HEART RATE"/>
          <VitalChip icon="🫁" value="98" unit="%" label="SpO₂"/>
          <VitalChip icon="🌡️" value="36.6" unit="°C" label="TEMP"/>
          <VitalChip icon="🔥" value={streak} unit="days" label="STREAK" crit={streak>=7}/>
        </div>

        {/* Footer */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,color:'rgba(232,244,253,0.40)'}}>Connect Watch →</span>
          <div style={{
            background:'linear-gradient(135deg,#00D4C8,#4F8EF7)',
            borderRadius:12,padding:'5px 14px',
            fontSize:12,fontWeight:800,color:'white',
            boxShadow:'0 4px 12px rgba(0,212,200,0.30)',
          }}>⚡ {xp} XP</div>
        </div>
      </div>
    </GlassCard>
  )
}

// ── ISLAND 2: ACTIONS ──
function ActionsIsland({ onScribe, onCase, setTab, setToolTab, onNexus }:any) {
  const actions = [
    {
      icon:'🎙️', label:'AI Scribe', sub:'Record → SOAP note · EN+AR',
      grad:'linear-gradient(135deg,rgba(0,212,200,0.15),rgba(79,142,247,0.10))',
      border:'rgba(0,212,200,0.25)', glow:'rgba(0,212,200,0.20)',
      tags:['2h saved','Arabic+English'],
      onClick: onScribe,
    },
    {
      icon:'📋', label:"Today's Case", sub:'AI clinical simulation · +30 XP',
      grad:'linear-gradient(135deg,rgba(248,113,113,0.12),rgba(251,191,36,0.08))',
      border:'rgba(248,113,113,0.22)', glow:'rgba(248,113,113,0.15)',
      tags:['Interactive','Evidence-based'],
      onClick: onCase,
    },
    {
      icon:'🔬', label:'Quick Tools', sub:'Calculators · Drug search · Guidelines',
      grad:'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(79,142,247,0.10))',
      border:'rgba(167,139,250,0.22)', glow:'rgba(167,139,250,0.15)',
      tags:['FDA','PubMed','ESC 2026'],
      onClick: ()=>setTab('tools'),
    },
  ]

  return (
    <div style={{marginBottom:20}}>
      <SectionLabel>⚡ Quick Actions</SectionLabel>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {actions.map((a,i)=>(
          <div key={i} onClick={a.onClick} style={{
            background:a.grad,
            border:`1px solid ${a.border}`,
            borderRadius:20,padding:'16px 18px',
            cursor:'pointer',
            boxShadow:`0 4px 24px ${a.glow}`,
            transition:'transform 0.15s, box-shadow 0.15s',
            display:'flex',alignItems:'center',gap:14,
          }}
          onTouchStart={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
          >
            <div style={{
              width:52,height:52,borderRadius:16,flexShrink:0,
              background:'rgba(255,255,255,0.06)',
              border:`1px solid ${a.border}`,
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              {a.IconEl==='mic'   && <Icons.mic   color='#00D2C8' size={26}/>}
              {a.IconEl==='book'  && <Icons.flask color='#F06B6B' size={26}/>}
              {a.IconEl==='tools' && <Icons.tools color='#9B7AF5' size={26}/>}
              {!a.IconEl && a.icon}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:800,color:'#E8F4FD',marginBottom:3}}>{a.label}</div>
              <div style={{fontSize:12,color:'rgba(232,244,253,0.55)',marginBottom:8}}>{a.sub}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {a.tags.map(tag=>(
                  <span key={tag} style={{
                    fontSize:9,fontWeight:700,letterSpacing:0.5,
                    background:'rgba(255,255,255,0.08)',
                    border:'1px solid rgba(255,255,255,0.12)',
                    borderRadius:8,padding:'3px 8px',
                    color:'rgba(232,244,253,0.60)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{
              width:32,height:32,borderRadius:10,flexShrink:0,
              background:'rgba(255,255,255,0.08)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'rgba(232,244,253,0.60)',fontSize:16,
            }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ISLAND 3: STATS ──
function StatsIsland({ xp, streak, casesCompleted, mcqCorrect }:any) {
  const stats = [
    { label:'Cases Done', value:casesCompleted, icon:'🏥', color:'#F87171' },
    { label:'MCQ Correct', value:mcqCorrect, icon:'🧬', color:'#4F8EF7' },
    { label:'Day Streak', value:streak, icon:'🔥', color:'#FBBF24' },
  ]
  return (
    <div style={{marginBottom:20}}>
      <SectionLabel>📊 Clinical Dashboard</SectionLabel>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
        {stats.map(s=>(
          <div key={s.label} style={{
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:18,padding:'16px 12px',textAlign:'center',
          }}>
            <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:10,color:'rgba(232,244,253,0.40)',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ISLAND 4: CASE LIBRARY ──
function CaseLibraryIsland({ onNexus }:any) {
  const sections:any[] = []
  const [open, setOpen] = useState<string|null>(null)

  return (
    <div style={{marginBottom:20}}>
      <SectionLabel>🌐 Global Room</SectionLabel>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <div onClick={onNexus} style={{
          background:'#FFFFFF',
          border:'1px solid #E2E8F0',
          borderLeft:'4px solid #0D9488',
          borderRadius:20,padding:'16px 18px',
          cursor:'pointer',
          display:'flex',alignItems:'center',gap:14,
          boxShadow:'0 1px 3px rgba(15,23,42,0.08)',
          transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{
            width:48,height:48,borderRadius:14,flexShrink:0,
            background:'linear-gradient(135deg,#0D9488,#1E40AF)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,
          }}>🌐</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:'#0F172A',letterSpacing:-0.1}}>Clinical Nexus</div>
            <div style={{fontSize:12,color:'#475569',marginTop:2}}>Global · Real-time · Voting</div>
          </div>
          <div style={{
            background:'linear-gradient(135deg,#0D9488,#1E40AF)',
            borderRadius:8,padding:'4px 10px',
            fontSize:10,fontWeight:700,color:'white',letterSpacing:1.2
          }}>LIVE</div>
        </div>
        {sections.map(s=>(
          <div key={s.key}>
            <div onClick={()=>setOpen(open===s.key?null:s.key)} style={{
              background:'rgba(255,255,255,0.04)',
              border:`1px solid ${s.color}20`,
              borderRadius:18,padding:'14px 16px',
              cursor:'pointer',
              display:'flex',alignItems:'center',gap:12,
              transition:'background 0.2s',
            }}>
              <div style={{
                width:44,height:44,borderRadius:14,flexShrink:0,
                background:`${s.color}15`,border:`1px solid ${s.color}25`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
              }}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:15,fontWeight:700,color:'#E8F4FD'}}>{s.label}</span>
                  {s.badge && <span style={{
                    fontSize:9,fontWeight:800,color:s.color,
                    background:`${s.color}15`,border:`1px solid ${s.color}30`,
                    borderRadius:6,padding:'2px 7px',
                  }}>{s.badge}</span>}
                </div>
                <div style={{fontSize:12,color:'rgba(232,244,253,0.45)',marginTop:2}}>{s.sub}</div>
              </div>
              <div style={{color:'rgba(232,244,253,0.40)',fontSize:18,transition:'transform 0.2s',
                transform:open===s.key?'rotate(90deg)':'rotate(0deg)'}}>›</div>
            </div>

            {open===s.key && (
              <div style={{marginTop:4,display:'flex',flexDirection:'column',gap:6,paddingLeft:8}}>
                {s.cases.map((c:any)=>(
                  <div key={c.id} onClick={()=>c.free?setActiveCase(c.id):setShowUpgrade(true)}
                    style={{
                      background:'rgba(255,255,255,0.03)',
                      border:`1px solid rgba(255,255,255,0.07)`,
                      borderRadius:14,padding:'12px 14px',
                      cursor:'pointer',display:'flex',alignItems:'center',gap:12,
                    }}>
                    <span style={{fontSize:20}}>{c.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#E8F4FD'}}>{c.title}</div>
                      <div style={{fontSize:11,color:'rgba(232,244,253,0.40)',marginTop:1}}>{c.sub}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      {!c.free && <span style={{fontSize:11,color:'#FBBF24'}}>🔒</span>}
                      <span style={{
                        fontSize:10,fontWeight:700,color:s.color,
                        background:`${s.color}15`,borderRadius:8,padding:'3px 8px',
                      }}>+{c.xpReward}XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ISLAND 5: WARD ALERT ──
function WardAlertIsland({ setTab }:any) {
  const [alert, setAlert] = useState<any>(null)
  const [show, setShow] = useState(true)
  useEffect(()=>{
    const d = localStorage.getItem('cliniverse-ward-alert')
    if(d) try { setAlert(JSON.parse(d)) } catch {}
  },[])
  if(!alert||!show) return null
  return (
    <div style={{marginBottom:14}}>
      <div style={{
        background:'rgba(248,113,113,0.08)',
        border:'1px solid rgba(248,113,113,0.25)',
        borderRadius:18,padding:'14px 16px',
        display:'flex',alignItems:'center',gap:12,
      }}>
        <div style={{width:8,height:8,borderRadius:'50%',background:'#F87171',flexShrink:0,animation:'pulse 1.5s infinite'}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:'#F87171',fontWeight:700,letterSpacing:1,marginBottom:2}}>WARD ALERT — CRITICAL</div>
          <div style={{fontSize:14,fontWeight:700,color:'#E8F4FD'}}>{alert.patient} · {alert.bed}</div>
          <div style={{fontSize:12,color:'rgba(232,244,253,0.50)',marginTop:1}}>{alert.diagnosis}</div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>setTab('ward')} style={{
            background:'rgba(248,113,113,0.15)',border:'1px solid rgba(248,113,113,0.25)',
            borderRadius:10,padding:'6px 12px',color:'#F87171',fontSize:11,fontWeight:700,cursor:'pointer',
          }}>View</button>
          <button onClick={()=>setShow(false)} style={{
            background:'transparent',border:'none',color:'rgba(232,244,253,0.35)',
            fontSize:18,cursor:'pointer',padding:'0 4px',
          }}>×</button>
        </div>
      </div>
    </div>
  )
}

// ── DISCLAIMER ──
function Disclaimer() {
  return (
    <div style={{
      background:'rgba(251,191,36,0.06)',
      border:'1px solid rgba(251,191,36,0.15)',
      borderRadius:14,padding:'10px 14px',
      marginBottom:16,display:'flex',gap:8,alignItems:'flex-start',
    }}>
      <span style={{fontSize:13,flexShrink:0}}>⚠️</span>
      <p style={{margin:0,fontSize:11,color:'rgba(232,244,253,0.50)',lineHeight:1.6,fontFamily:F}}>
        <b style={{color:'rgba(251,191,36,0.80)'}}>Educational use only.</b> All cases are AI-generated simulations. Not a substitute for clinical judgment.
      </p>
    </div>
  )
}

// ── MAIN PULSE PAGE ──
interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; criticalCases:any[]; sportsCases:any[]; pedsCases:any[]
  setActiveCase:(id:string)=>void; setShowUpgrade:(v:boolean)=>void
  setTab:(t:string)=>void; setToolTab:(t:string)=>void; onXP:(n:number)=>void
}

export default function PulsePage(props:Props) {
  const { xp, streak, casesCompleted, mcqCorrect, isPro,
    criticalCases, sportsCases, pedsCases,
    setActiveCase, setShowUpgrade, setTab, setToolTab, onXP } = props

  const [showScribe, setShowScribe] = useState(false)
  const [showCase, setShowCase] = useState(false)

  if(showScribe) return (
    <div style={{position:'fixed',inset:0,zIndex:999,background:'#0F1824'}}>
      <div style={{padding:'20px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'#E8F4FD',fontWeight:800,fontSize:16}}>AI Scribe</span>
        <button onClick={()=>setShowScribe(false)} style={{
          background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:10,padding:'8px 14px',color:'#E8F4FD',cursor:'pointer',fontSize:14,
        }}>✕ Close</button>
      </div>
      <AmbientScribe onXP={onXP}/>
    </div>
  )

  if(showCase) return (
    <div style={{position:'fixed',inset:0,zIndex:999,background:'#0F1824'}}>
      <div style={{padding:'20px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'#E8F4FD',fontWeight:800,fontSize:16}}>Today's Case</span>
        <button onClick={()=>setShowCase(false)} style={{
          background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:10,padding:'8px 14px',color:'#E8F4FD',cursor:'pointer',fontSize:14,
        }}>✕ Close</button>
      </div>
      <LiveCaseViewer specialty="Emergency Medicine" difficulty="Intermediate" onXP={onXP}/>
    </div>
  )

  return (
    <div style={{
      minHeight:'100vh',
      background:'#0F1824',
      fontFamily:F,
    }}>
      {/* Background glow */}
      <div style={{
        position:'fixed',top:-200,left:'50%',transform:'translateX(-50%)',
        width:600,height:400,borderRadius:'50%',
        background:'radial-gradient(ellipse,rgba(0,212,200,0.06),transparent 70%)',
        pointerEvents:'none',zIndex:0,filter:'blur(60px)',
      }}/>

      <div style={{
        position:'relative',zIndex:1,
        padding:'16px 16px 160px',
        maxWidth:560,margin:'0 auto',
        animation:'fadeUp 0.5s ease',
      }}>
        <WardAlertIsland setTab={setTab}/>
        <TodayIsland xp={xp} streak={streak} isPro={isPro}/>
        <Disclaimer/>
        <ActionsIsland
          onScribe={()=>setShowScribe(true)}
          onCase={()=>setShowCase(true)}
          setTab={setTab}
          setToolTab={setToolTab}
        />
        <StatsIsland xp={xp} streak={streak} casesCompleted={casesCompleted} mcqCorrect={mcqCorrect}/>
        <CaseLibraryIsland
          criticalCases={criticalCases} sportsCases={sportsCases} pedsCases={pedsCases}
          setActiveCase={setActiveCase} setShowUpgrade={setShowUpgrade} isPro={isPro}
        />
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}
