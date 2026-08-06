'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  coral:'#FCA5A5', red:'#EF4444',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowMd:'0 4px 16px rgba(15,23,42,0.12)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.30)',
}

const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
const fast   = 'all 0.15s ease'

// SVG Lucide-style icons with gradient
const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nexusGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs><linearGradient id="nexusGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#4F46E5"/></linearGradient></defs>
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="url(#heartGrad)" stroke="none">
    <defs><linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#brainGrad)" strokeWidth="2" strokeLinecap="round">
    <defs><linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#4F46E5"/></linearGradient></defs>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#shieldGrad)" strokeWidth="2" strokeLinecap="round">
    <defs><linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#DC2626"/></linearGradient></defs>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const VoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#voteGrad)" strokeWidth="2" strokeLinecap="round">
    <defs><linearGradient id="voteGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0D9488"/><stop offset="100%" stopColor="#1E40AF"/></linearGradient></defs>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const CASES = [
  {
    id:1,
    title:'72M — Acute Chest Pain',
    tags:['STEMI','Cardiology'],
    tagColor:'#EF4444',
    icon:<HeartIcon/>,
    img:'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80',
    votes:{ pci:61, lytics:18, medical:21 },
    totalVotes:1284,
    countries:['🇸🇦','🇬🇧','🇺🇸','🇩🇪','🇯🇵'],
    summary:'72-year-old male, sudden onset chest pain, diaphoresis. ECG: ST elevation V1-V4. BP 90/60 mmHg. HR 110.',
    options:[
      { key:'pci',     label:'Primary PCI',     color:'#0D9488', emoji:'🫀' },
      { key:'lytics',  label:'Thrombolytics',   color:'#1E40AF', emoji:'💉' },
      { key:'medical', label:'Medical Mx Only',  color:'#F5B731', emoji:'💊' },
    ]
  },
  {
    id:2,
    title:'45F — Status Epilepticus',
    tags:['Neurology','Emergency'],
    tagColor:'#7C3AED',
    icon:<BrainIcon/>,
    img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    votes:{ benzo:72, phenytoin:19, levetiracetam:9 },
    totalVotes:876,
    countries:['🇦🇪','🇫🇷','🇨🇦','🇦🇺','🇸🇦'],
    summary:'45F, 8-min generalized tonic-clonic seizure. No IV access yet. Known epileptic, missed doses.',
    options:[
      { key:'benzo',         label:'IM Midazolam',      color:'#7C3AED', emoji:'💊' },
      { key:'phenytoin',     label:'IV Phenytoin',       color:'#0D9488', emoji:'🧪' },
      { key:'levetiracetam', label:'IV Levetiracetam',   color:'#1E40AF', emoji:'🔬' },
    ]
  },
  {
    id:3,
    title:'58M — Septic Shock',
    tags:['ICU','Sepsis'],
    tagColor:'#EF4444',
    icon:<ShieldIcon/>,
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    votes:{ norepi:68, dopamine:12, vasopressin:20 },
    totalVotes:2103,
    countries:['🇸🇦','🇮🇳','🇺🇸','🇬🇧','🇧🇷','🇨🇳'],
    summary:'58M post-op day 2. Fever 39.8°C, BP 70/40, HR 128, lactate 5.2. Suspected abdominal source.',
    options:[
      { key:'norepi',      label:'Norepinephrine',   color:'#EF4444', emoji:'⚡' },
      { key:'dopamine',    label:'Dopamine',          color:'#F5B731', emoji:'💛' },
      { key:'vasopressin', label:'Add Vasopressin',   color:'#0D9488', emoji:'🔵' },
    ]
  },
]

function VoteBar({ pct, color }:{ pct:number, color:string }) {
  return (
    <div style={{ background:L.raised, borderRadius:99, height:7, overflow:'hidden', marginTop:6 }}>
      <div style={{
        height:'100%', width:`${pct}%`, borderRadius:99, background:color,
        transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'
      }}/>
    </div>
  )
}

export default function ClinicalNexus({ onXP }:{ onXP?:(n:number)=>void }) {
  const [active, setActive]     = useState(CASES[0])
  const [voted, setVoted]       = useState<Record<number,string>>({})
  const [pulse, setPulse]       = useState(true)
  const [liveCount, setLiveCount] = useState(1284)
  const [pressed, setPressed]   = useState<string|null>(null)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setPulse(p=>!p), 900)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => n + Math.floor(Math.random()*3)), 3500)
    return () => clearInterval(t)
  }, [])

  const totalVotes = Object.values(active.votes).reduce((a,b)=>a+b,0)
  const hasVoted   = voted[active.id]

  function handleVote(key:string) {
    if (hasVoted) return
    setVoted(v => ({...v, [active.id]: key}))
    if (onXP) onXP(15)
  }

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif',
      paddingBottom:120,
    }}>

      {/* ── Hero Unsplash ── */}
      <div style={{ position:'relative', height:240, overflow:'hidden' }}>
        <img src={active.img} alt="" style={{
          width:'100%', height:'100%', objectFit:'cover',
          transition:smooth,
        }}/>
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom,rgba(15,23,42,0.15) 0%,rgba(15,23,42,0.88) 100%)'
        }}/>

        {/* LIVE badge */}
        <div style={{
          position:'absolute', top:16, left:16,
          display:'flex', alignItems:'center', gap:6,
          background:'rgba(15,23,42,0.55)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:99, padding:'6px 14px',
        }}>
          <div style={{
            width:8, height:8, borderRadius:'50%',
            background: pulse ? '#10B981' : 'rgba(16,185,129,0.2)',
            boxShadow: pulse ? '0 0 10px #10B981' : 'none',
            transition:fast,
          }}/>
          <span style={{ fontSize:11, fontWeight:700, color:'white', letterSpacing:1.5 }}>LIVE</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.65)' }}>
            {liveCount.toLocaleString()} physicians
          </span>
        </div>

        {/* Globe icon top right */}
        <div style={{ position:'absolute', top:16, right:16,
          width:38, height:38, borderRadius:12,
          background:'rgba(255,255,255,0.15)', backdropFilter:'blur(12px)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <GlobeIcon/>
        </div>

        {/* Case title bottom */}
        <div style={{ position:'absolute', bottom:16, left:16, right:16 }}>
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            {active.tags.map(t=>(
              <span key={t} style={{
                fontSize:10, fontWeight:700, letterSpacing:1.5, color:'white',
                background:active.tagColor+'BB', borderRadius:99, padding:'3px 10px',
              }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize:24, fontWeight:800, color:'white', letterSpacing:-0.6 }}>
            {active.title}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.70)', marginTop:4 }}>
            {active.countries.join(' ')} · {totalVotes.toLocaleString()} votes worldwide
          </div>
        </div>
      </div>

      {/* ── Case Selector ── */}
      <div style={{ display:'flex', gap:8, padding:'14px 16px 0', overflowX:'auto' }}>
        {CASES.map(c=>(
          <button key={c.id} onClick={()=>setActive(c)}
            onMouseDown={()=>setPressed('tab'+c.id)}
            onMouseUp={()=>setPressed(null)}
            style={{
              flexShrink:0, padding:'8px 18px', borderRadius:99, cursor:'pointer',
              border:`1.5px solid ${active.id===c.id ? L.teal : L.border}`,
              background: active.id===c.id ? L.gradient : L.surface,
              color: active.id===c.id ? 'white' : L.textSub,
              fontSize:12, fontWeight:700,
              boxShadow: active.id===c.id ? L.shadowGlow : L.shadowSm,
              transform: pressed===('tab'+c.id) ? 'scale(0.97)' : 'scale(1)',
              transition: spring,
            }}>
            {c.icon && <span style={{marginRight:6}}>{c.icon}</span>}
            Case {c.id}
          </button>
        ))}
      </div>

      <div style={{ padding:'14px 16px 0' }}>

        {/* ── Vignette Card ── */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderLeft:`4px solid ${L.teal}`,
          borderRadius:20, padding:'16px 18px', marginBottom:14,
          boxShadow:L.shadowSm,
        }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:8 }}>
            CLINICAL VIGNETTE
          </div>
          <div style={{ fontSize:14, fontWeight:500, color:L.textPrimary, lineHeight:1.65 }}>
            {active.summary}
          </div>
          <button onClick={()=>setShowSheet(true)} style={{
            marginTop:10, fontSize:12, fontWeight:700, color:L.teal,
            background:'none', border:'none', cursor:'pointer', padding:0,
          }}>
            View full case →
          </button>
        </div>

        {/* ── Vote Card ── */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderRadius:24, padding:'20px', marginBottom:14,
          boxShadow:L.shadowSm,
        }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:14 }}>
            WHAT WOULD YOU DO?
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {active.options.map(opt => {
              const pct = Math.round((active.votes[opt.key as keyof typeof active.votes] / totalVotes)*100)
              const isChosen = hasVoted === opt.key
              return (
                <div key={opt.key}>
                  <button onClick={()=>handleVote(opt.key)}
                    onMouseDown={()=>setPressed(opt.key)}
                    onMouseUp={()=>setPressed(null)}
                    style={{
                      width:'100%', textAlign:'left', cursor: hasVoted ? 'default' : 'pointer',
                      background: isChosen ? opt.color+'12' : L.raised,
                      border:`1.5px solid ${isChosen ? opt.color : L.border}`,
                      borderRadius:14, padding:'13px 16px',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      transform: pressed===opt.key ? 'scale(0.98)' : 'scale(1)',
                      transition: spring,
                      boxShadow: isChosen ? `0 4px 12px ${opt.color}25` : 'none',
                    }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:20 }}>{opt.emoji}</span>
                      <span style={{ fontSize:14, fontWeight:700,
                        color: isChosen ? opt.color : L.textPrimary }}>
                        {opt.label}
                      </span>
                    </div>
                    {hasVoted && (
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {isChosen && <VoteIcon/>}
                        <span style={{ fontSize:16, fontWeight:900, color:opt.color }}>{pct}%</span>
                      </div>
                    )}
                  </button>
                  {hasVoted && <VoteBar pct={pct} color={opt.color}/>}
                </div>
              )
            })}
          </div>

          {!hasVoted && (
            <div style={{ marginTop:14, fontSize:12, color:L.textMuted, textAlign:'center' }}>
              Tap an option — global results reveal after voting
            </div>
          )}
          {hasVoted && (
            <div style={{
              marginTop:14, padding:'11px 16px',
              background:'rgba(13,148,136,0.08)', borderRadius:14,
              border:'1px solid rgba(13,148,136,0.2)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <span style={{ fontSize:18 }}>🌐</span>
              <span style={{ fontSize:13, color:L.teal, fontWeight:700 }}>
                +15 XP — Your vote is counted globally
              </span>
            </div>
          )}
        </div>

        {/* ── Global Breakdown ── */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderRadius:24, padding:'20px', marginBottom:14,
          boxShadow:L.shadowSm,
        }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:12 }}>
            GLOBAL ROOM
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12 }}>
            {active.countries.map(flag=>(
              <span key={flag} style={{ fontSize:30, filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }}>
                {flag}
              </span>
            ))}
          </div>
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:4
          }}>
            {[
              { label:'Countries', value: active.countries.length * 7 + '+', color:L.teal },
              { label:'Votes', value: totalVotes.toLocaleString(), color:L.cobalt },
              { label:'Live Now', value: liveCount.toLocaleString(), color:L.sage },
            ].map(s=>(
              <div key={s.label} style={{
                background:L.raised, borderRadius:16, padding:'12px 8px', textAlign:'center',
                border:`1px solid ${L.border}`,
              }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:10, fontWeight:700, color:L.textMuted, marginTop:2, letterSpacing:0.5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{
          background:'rgba(245,183,49,0.08)', border:'1px solid rgba(245,183,49,0.3)',
          borderRadius:16, padding:'12px 16px', marginBottom:16,
        }}>
          <div style={{ fontSize:11, color:'#92400E', fontWeight:600, lineHeight:1.6 }}>
            ⚠️ Educational purposes only. Clinical decisions must be individualized based on full patient assessment. Not a substitute for professional medical judgment.
          </div>
        </div>

      </div>

      {/* ── Bottom Sheet ── */}
      {showSheet && (
        <div style={{
          position:'fixed', inset:0, zIndex:1000,
          background:'rgba(15,23,42,0.5)', backdropFilter:'blur(8px)',
        }} onClick={()=>setShowSheet(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            position:'absolute', bottom:0, left:0, right:0,
            background:L.surface, borderRadius:'28px 28px 0 0',
            padding:'20px 20px 48px',
            boxShadow:'0 -8px 40px rgba(15,23,42,0.18)',
            animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{
              width:40, height:4, borderRadius:99, background:L.border,
              margin:'0 auto 20px',
            }}/>
            <div style={{ fontSize:18, fontWeight:800, color:L.textPrimary, marginBottom:12, letterSpacing:-0.4 }}>
              {active.title}
            </div>
            <div style={{
              background:L.raised, borderRadius:16, padding:'14px 16px', marginBottom:14,
              border:`1px solid ${L.border}`,
            }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:8 }}>
                CLINICAL DETAILS
              </div>
              <div style={{ fontSize:14, color:L.textPrimary, lineHeight:1.7 }}>
                {active.summary}
                {'\n\n'}Key vitals and labs would appear here in the full case view.
              </div>
            </div>
            <button onClick={()=>setShowSheet(false)} style={{
              width:'100%', padding:'14px',
              background:L.gradient, borderRadius:16, border:'none',
              fontSize:15, fontWeight:700, color:'white', cursor:'pointer',
              boxShadow:L.shadowGlow,
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      `}</style>
    </div>
  )
}
