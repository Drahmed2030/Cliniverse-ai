'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:   '#F8FAFC',
  surface:  '#FFFFFF',
  raised:   '#F1F5F9',
  border:   '#E2E8F0',
  teal:     '#0D9488',
  cobalt:   '#1E40AF',
  sage:     '#10B981',
  amber:    '#F5B731',
  red:      '#EF4444',
  textPrimary: '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
  gradient: 'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm: '0 1px 3px rgba(15,23,42,0.08)',
  shadowMd: '0 4px 16px rgba(15,23,42,0.12)',
}

const CASES = [
  {
    id:1,
    title:'72M — Acute Chest Pain',
    tags:['STEMI','Cardiology','Critical'],
    tagColor: '#EF4444',
    img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    votes:{ pci:61, lytics:18, medical:21 },
    totalVotes:1284,
    countries:['🇸🇦','🇬🇧','🇺🇸','🇩🇪','🇯🇵'],
    summary:'72-year-old male, sudden onset chest pain, diaphoresis. ECG: ST elevation V1-V4. BP 90/60.',
    options:[
      { key:'pci', label:'Primary PCI', color:'#0D9488' },
      { key:'lytics', label:'Thrombolytics', color:'#1E40AF' },
      { key:'medical', label:'Medical Mx', color:'#F5B731' },
    ]
  },
  {
    id:2,
    title:'45F — Status Epilepticus',
    tags:['Neurology','Emergency'],
    tagColor: '#7C3AED',
    img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    votes:{ benzo:72, phenytoin:19, levetiracetam:9 },
    totalVotes:876,
    countries:['🇦','🇫🇷','🇨🇦','🇦🇺'],
    summary:'45F, 8 min generalized tonic-clonic seizure. No IV access yet. Known epileptic on medication.',
    options:[
      { key:'benzo', label:'IM Midazolam', color:'#7C3AED' },
      { key:'phenytoin', label:'IV Phenytoin', color:'#0D9488' },
      { key:'levetiracetam', label:'IV Levetiracetam', color:'#1E40AF' },
    ]
  },
  {
    id:3,
    title:'58M — Septic Shock',
    tags:['ICU','Sepsis','Critical'],
    tagColor: '#EF4444',
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    votes:{ norepi:68, dopamine:12, vasopressin:20 },
    totalVotes:2103,
    countries:['🇸🇦','🇮🇳','🇺🇸','🇬🇧','🇧🇷','🇨🇳'],
    summary:'58M post-op day 2, fever 39.8°C, BP 70/40, HR 128, lactate 5.2. Source: abdominal.',
    options:[
      { key:'norepi', label:'Norepinephrine', color:'#EF4444' },
      { key:'dopamine', label:'Dopamine', color:'#F5B731' },
      { key:'vasopressin', label:'Add Vasopressin', color:'#0D9488' },
    ]
  },
]

const VoteBar = ({ pct, color }:{ pct:number, color:string }) => (
  <div style={{ background:L.raised, borderRadius:99, height:8, overflow:'hidden' }}>
    <div style={{
      height:'100%', width:`${pct}%`, borderRadius:99,
      background:color, transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'
    }}/>
  </div>
)

export default function ClinicalNexus({ onXP }:{ onXP?:(n:number)=>void }) {
  const [active, setActive] = useState(CASES[0])
  const [voted, setVoted] = useState<Record<number,string>>({})
  const [pulse, setPulse] = useState(true)
  const [liveCount, setLiveCount] = useState(1284)

  useEffect(() => {
    const t = setInterval(() => setPulse(p=>!p), 900)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => n + Math.floor(Math.random()*3)), 4000)
    return () => clearInterval(t)
  }, [])

  const totalVotes = Object.values(active.votes).reduce((a,b)=>a+b,0)
  const hasVoted = voted[active.id]

  function handleVote(key:string) {
    if (hasVoted) return
    setVoted(v => ({...v, [active.id]: key}))
    if (onXP) onXP(15)
  }

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
      paddingBottom:100,
    }}>

      {/* Hero Unsplash */}
      <div style={{ position:'relative', height:220, overflow:'hidden' }}>
        <img src={active.img} alt="" style={{
          width:'100%', height:'100%', objectFit:'cover',
          transition:'all 0.5s ease'
        }}/>
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)'
        }}/>
        {/* Live badge */}
        <div style={{
          position:'absolute', top:16, left:16,
          display:'flex', alignItems:'center', gap:6,
          background:'rgba(15,23,42,0.6)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:99, padding:'6px 12px',
        }}>
          <div style={{
            width:8, height:8, borderRadius:'50%',
            background: pulse ? '#10B981' : 'transparent',
            boxShadow: pulse ? '0 0 8px #10B981' : 'none',
            transition:'all 0.3s ease',
          }}/>
          <span style={{ fontSize:11, fontWeight:700, color:'white', letterSpacing:1.2 }}>LIVE</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{liveCount.toLocaleString()} doctors</span>
        </div>
        {/* Case title */}
        <div style={{ position:'absolute', bottom:16, left:16, right:16 }}>
          <div style={{ display:'flex', gap:6, marginBottom:8 }}>
            {active.tags.map(t=>(
              <span key={t} style={{
                fontSize:10, fontWeight:700, letterSpacing:1.2,
                color:'white', background:active.tagColor+'CC',
                borderRadius:99, padding:'3px 10px',
              }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:'white', letterSpacing:-0.4 }}>{active.title}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:4 }}>
            {active.countries.join(' ')} · {totalVotes.toLocaleString()} votes
          </div>
        </div>
      </div>

      {/* Case selector tabs */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px', overflowX:'auto' }}>
        {CASES.map(c=>(
          <button key={c.id} onClick={()=>setActive(c)} style={{
            flexShrink:0, padding:'8px 16px', borderRadius:99,
            border:`1px solid ${active.id===c.id ? L.teal : L.border}`,
            background: active.id===c.id ? L.teal : L.surface,
            color: active.id===c.id ? 'white' : L.textSub,
            fontSize:12, fontWeight:700, cursor:'pointer',
            transition:'all 0.2s ease',
            boxShadow: active.id===c.id ? `0 4px 12px rgba(13,148,136,0.3)` : L.shadowSm,
          }}>Case {c.id}</button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* Summary card */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderLeft:`4px solid ${L.teal}`,
          borderRadius:20, padding:'16px 18px', marginBottom:16,
          boxShadow:L.shadowSm,
        }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:8 }}>CLINICAL VIGNETTE</div>
          <div style={{ fontSize:14, fontWeight:500, color:L.textPrimary, lineHeight:1.6 }}>{active.summary}</div>
        </div>

        {/* Vote section */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderRadius:24, padding:'20px', marginBottom:16,
          boxShadow:L.shadowSm,
        }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:16 }}>
            WHAT WOULD YOU DO?
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {active.options.map(opt => {
              const pct = Math.round((active.votes[opt.key as keyof typeof active.votes] / totalVotes) * 100)
              const isChosen = hasVoted === opt.key
              return (
                <div key={opt.key}>
                  <button onClick={()=>handleVote(opt.key)} style={{
                    width:'100%', textAlign:'left',
                    background: isChosen ? opt.color+'15' : L.raised,
                    border:`1.5px solid ${isChosen ? opt.color : L.border}`,
                    borderRadius:14, padding:'12px 16px',
                    cursor: hasVoted ? 'default' : 'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    transition:'all 0.2s ease',
                    marginBottom:6,
                  }}>
                    <span style={{ fontSize:14, fontWeight:700, color: isChosen ? opt.color : L.textPrimary }}>
                      {opt.label}
                    </span>
                    {hasVoted && (
                      <span style={{ fontSize:15, fontWeight:900, color:opt.color }}>{pct}%</span>
                    )}
                  </button>
                  {hasVoted && <VoteBar pct={pct} color={opt.color}/>}
                </div>
              )
            })}
          </div>

          {!hasVoted && (
            <div style={{ marginTop:12, fontSize:12, color:L.textMuted, textAlign:'center' }}>
              Tap to vote — results reveal after
            </div>
          )}
          {hasVoted && (
            <div style={{
              marginTop:16, padding:'10px 14px',
              background:'rgba(13,148,136,0.08)', borderRadius:12,
              border:'1px solid rgba(13,148,136,0.2)',
              fontSize:12, color:L.teal, fontWeight:600, textAlign:'center'
            }}>
              ✓ +15 XP — Your vote is counted globally
            </div>
          )}
        </div>

        {/* Global breakdown */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderRadius:24, padding:'20px', marginBottom:16,
          boxShadow:L.shadowSm,
        }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:14 }}>
            GLOBAL CONSENSUS
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {active.countries.map(flag => (
              <span key={flag} style={{
                fontSize:28, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>{flag}</span>
            ))}
          </div>
          <div style={{ marginTop:12, fontSize:13, color:L.textSub }}>
            Physicians from {active.countries.length * 7}+ countries voting in real-time
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          background:'rgba(245,183,49,0.08)', border:'1px solid rgba(245,183,49,0.25)',
          borderRadius:16, padding:'12px 16px', marginBottom:16,
        }}>
          <div style={{ fontSize:11, color:'#92400E', fontWeight:600, lineHeight:1.5 }}>
            ⚠️ Educational purposes only. Clinical decisions must be individualized. Not a substitute for professional judgment.
          </div>
        </div>

      </div>
    </div>
  )
}
