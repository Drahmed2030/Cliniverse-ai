'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const LiveCaseViewer = dynamic(() => import('./LiveCaseViewer'), { ssr: false })

const F = '"Inter", -apple-system, sans-serif'

const T = {
  bg: '#1e2d40',
  card: 'rgba(36,63,82,0.65)',
  border: 'rgba(0,196,180,0.20)',
  text: '#ffffff',
  sub: 'rgba(148,163,184,0.85)',
  muted: 'rgba(148,163,184,0.45)',
  teal: '#38bdf8',
  amber: '#fbbf24',
  rose: '#f87171',
  green: '#4ade80',
  purple: '#00DFD0',
  indigo: '#818cf8',
}

interface Props {
  xp: number; streak: number; casesCompleted: number; mcqCorrect: number
  isPro: boolean; criticalCases: any[]; sportsCases: any[]; pedsCases: any[]
  setActiveCase: (id: string) => void; setShowUpgrade: (v: boolean) => void
  setTab: (t: string) => void; setToolTab: (t: string) => void; onXP: (n: number) => void
}

const StethoscopeBg = () => (
  <svg style={{ position:'fixed', right:-80, top:'50%', transform:'translateY(-50%)', width:400, height:400, opacity:0.04, pointerEvents:'none', zIndex:0 }} viewBox="0 0 200 200" fill="none">
    <circle cx="100" cy="60" r="30" stroke="#38bdf8" strokeWidth="4"/>
    <path d="M70 60 C70 60 40 60 40 100 C40 140 70 160 100 160 C130 160 160 140 160 100 C160 60 130 60 130 60" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="100" cy="165" r="18" stroke="#38bdf8" strokeWidth="4"/>
    <circle cx="100" cy="165" r="8" fill="#38bdf8" opacity="0.5"/>
    <path d="M85 45 L85 30 M115 45 L115 30" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="85" cy="27" r="5" fill="#38bdf8" opacity="0.7"/>
    <circle cx="115" cy="27" r="5" fill="#38bdf8" opacity="0.7"/>
  </svg>
)

const HexBg = () => (
  <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.045, pointerEvents:'none', zIndex:0 }}>
    <defs>
      <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
        <polygon points="30,2 58,17 58,45 30,52 2,45 2,17" fill="none" stroke="#38bdf8" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)"/>
  </svg>
)

function SectionModal({ section, onClose, onCase, isPro, setShowUpgrade }: any) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(180deg,#0d1220,#080c14)', borderRadius:'28px 28px 0 0', border:`1px solid ${section.color}25`, padding:'24px 20px 40px', maxHeight:'80vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(148,163,184,0.3)', margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:`${section.color}18`, border:`1px solid ${section.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{section.icon}</div>
          <div>
            <div style={{ fontSize:19, fontWeight:900, color:'#fff', fontFamily:F }}>{section.title}</div>
            <div style={{ fontSize:13, color:'rgba(148,163,184,0.85)' }}>{section.cases?.length||0} cases available</div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {(section.cases||[]).map((c:any)=>(
            <div key={c.id} onClick={()=>{ if(!c.free&&!isPro){setShowUpgrade(true);return} onCase(c.id);onClose() }} style={{ background:'rgba(36,63,82,0.65)', borderRadius:18, padding:'14px 16px', border:`1px solid ${c.color||section.color}25`, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background:`${c.color||section.color}18`, border:`1px solid ${c.color||section.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{c.icon||'🏥'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:2 }}>{c.title}</div>
                <div style={{ fontSize:13, color:'rgba(148,163,184,0.85)' }}>{c.sub}</div>
              </div>
              {!c.free&&!isPro
                ? <span style={{ fontSize:10, padding:'4px 10px', borderRadius:8, background:'rgba(255,149,0,0.15)', color:'#ff9500', fontWeight:800, border:'1px solid rgba(255,149,0,0.25)' }}>PRO</span>
                : <span style={{ fontSize:20, color:'rgba(148,163,184,0.45)' }}>›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HubPage({ xp, streak, casesCompleted, mcqCorrect, isPro, criticalCases, sportsCases, pedsCases, setActiveCase, setShowUpgrade, setTab, setToolTab, onXP }: Props) {
  const [openSection, setOpenSection] = useState<any>(null)
  const [liveCount, setLiveCount] = useState(1247)
  const [showLive, setShowLive] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => Math.max(900, Math.min(1600, n + Math.floor(Math.random()*5)-2))), 3000)
    return () => clearInterval(t)
  }, [])

  const rank = xp>=3000?'Chief of Medicine':xp>=2200?'Senior Consultant':xp>=1500?'Consultant':xp>=1000?'Specialist':xp>=600?'Registrar':xp>=300?'Senior Resident':xp>=100?'Junior Resident':'Clinical Clerk'
  const accuracy = mcqCorrect>0 ? Math.round((mcqCorrect/(mcqCorrect+1))*100) : 0

  const sections = [
    { key:'critical', icon:'🏥', title:'Critical Care', sub:'ED · ICU · CCU · Neuro', color:T.rose, cases:criticalCases },
    { key:'sports', icon:'⚽', title:'Sports Medicine', sub:'FIFA 2026 · Pitch-side', color:T.green, cases:sportsCases, badge:'NEW' },
    { key:'peds', icon:'🧸', title:'Pediatrics', sub:'Febrile · Procedures', color:T.indigo, cases:pedsCases, badge:'NEW' },
  ]

  const quickTools = [
    { icon:'⚡', label:'Rapid Fire', color:T.amber, action:()=>{ setTab('tools'); setToolTab('rapidfire') } },
    { icon:'🫀', label:'ECG', color:T.rose, action:()=>{ setTab('tools'); setToolTab('ecg') } },
    { icon:'🧮', label:'Calculators', color:T.teal, action:()=>{ setTab('tools'); setToolTab('calc') } },
    { icon:'📋', label:'SBAR', color:T.purple, action:()=>{ setTab('tools'); setToolTab('sbar') } },
  ]

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:F, overflowX:'hidden', position:'relative' }}>
      <HexBg/>
      <StethoscopeBg/>
      <div style={{ position:'fixed', top:-200, left:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', bottom:-200, right:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,223,208,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ position:'relative', zIndex:1, padding:'16px 16px 120px' }}>

        {/* HERO */}
        <div style={{ background:'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(0,223,208,0.08))', border:'1px solid rgba(56,189,248,0.2)', borderRadius:24, padding:'20px', marginBottom:16, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:T.teal, marginBottom:4 }}>CLINIVERSE AI</div>
              <div style={{ fontSize:22, fontWeight:900, color:T.text, letterSpacing:-0.5 }}>Good morning, Doctor 👋</div>
              <div style={{ fontSize:13, color:T.sub, marginTop:2 }}>Ready to train? <span style={{ color:T.amber, fontWeight:700 }}>{streak}-day streak 🔥</span></div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', marginBottom:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80' }}/>
                <span style={{ fontSize:11, fontWeight:700, color:'#4ade80' }}>LIVE</span>
              </div>
              <div style={{ fontSize:11, color:T.muted }}>v2.0 · 2026</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[{label:'CASES',value:'25+',color:T.rose},{label:'MODULES',value:'15+',color:T.amber},{label:'FREE',value:'5',color:T.green}].map((s,i)=>(
              <div key={i} style={{ background:'rgba(0,0,0,0.3)', borderRadius:14, padding:'12px 8px', textAlign:'center', border:`1px solid ${s.color}20` }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE FEED */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#f87171', boxShadow:'0 0 8px #f87171' }}/>
              <span style={{ fontSize:12, fontWeight:800, color:T.text, letterSpacing:1 }}>LIVE CLINICAL FEED</span>
            </div>
            <span style={{ fontSize:11, color:T.teal, fontWeight:700 }}>{liveCount.toLocaleString()} active</span>
          </div>
          <div style={{ overflowX:'auto', display:'flex', gap:12, paddingBottom:4 }}>
            {[
              { city:'Riyadh', tag:'CRITICAL', title:'52M — Anterior STEMI', sub:'Door-to-balloon: 67 min', color:'#f87171' },
              { city:'Dubai', tag:'URGENT', title:'67F — Acute HF', sub:'BNP 4200 · BiPAP started', color:'#fbbf24' },
              { city:'London', tag:'CRITICAL', title:'19M — DKA', sub:'pH 7.1 · Insulin infusion', color:'#f87171' },
            ].map((c,i)=>(
              <div key={i} onClick={()=>setShowLive(true)} style={{ minWidth:200, background:'rgba(36,63,82,0.65)', borderRadius:18, padding:'14px', border:`1px solid ${c.color}25`, cursor:'pointer', flexShrink:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:10, color:T.muted, fontWeight:600 }}>{c.city}</span>
                  <span style={{ fontSize:9, fontWeight:800, color:c.color, background:`${c.color}15`, padding:'2px 8px', borderRadius:6 }}>{c.tag}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:11, color:T.sub, marginBottom:10 }}>{c.sub}</div>
                <div style={{ display:'flex', gap:6 }}>
                  {['Labs','ECG','Echo'].map((t,j)=>(
                    <span key={j} style={{ fontSize:10, fontWeight:700, color:T.teal, background:'rgba(56,189,248,0.1)', padding:'3px 8px', borderRadius:6, border:'1px solid rgba(56,189,248,0.2)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURED CASE */}
        <div onClick={()=>setShowLive(true)} style={{ background:'linear-gradient(135deg, #1a0533, #0d1a3a)', border:'1px solid rgba(0,223,208,0.3)', borderRadius:20, padding:'18px', marginBottom:16, cursor:'pointer', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,223,208,0.2) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:T.purple, marginBottom:6 }}>TODAY'S FEATURED CASE</div>
          <div style={{ fontSize:22, fontWeight:900, color:T.text, marginBottom:4 }}>🫀 STEMI Protocol</div>
          <div style={{ fontSize:13, color:T.sub, marginBottom:14 }}>Master door-to-balloon · +80 XP</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,223,208,0.2)', border:'1px solid rgba(0,223,208,0.4)', borderRadius:12, padding:'10px 18px' }}>
            <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Start Case →</span>
          </div>
        </div>

        {/* QUICK TOOLS - HIDDEN */}{false&&
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:T.muted, marginBottom:10 }}>QUICK ACCESS</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10 }}>
            {quickTools.map((t,i)=>(
              <div key={i} onClick={t.action} style={{ background:`${t.color}12`, border:`1px solid ${t.color}25`, borderRadius:16, padding:'14px 8px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:t.color }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

}{/* CASE LIBRARY */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:T.muted, marginBottom:10 }}>CASE LIBRARY</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {sections.map((s,i)=>(
              <div key={i} onClick={()=>setOpenSection(s)} style={{ background:T.card, border:`1px solid ${s.color}20`, borderRadius:18, padding:'16px', cursor:'pointer', display:'flex', alignItems:'center', gap:14, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${s.color}08 0%, transparent 70%)`, pointerEvents:'none' }}/>
                <div style={{ width:48, height:48, borderRadius:15, background:`${s.color}15`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{s.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:T.text }}>{s.title}</span>
                    {s.badge && <span style={{ fontSize:9, fontWeight:800, color:s.color, background:`${s.color}15`, padding:'2px 7px', borderRadius:6 }}>{s.badge}</span>}
                  </div>
                  <div style={{ fontSize:13, color:T.sub }}>{s.sub}</div>
                </div>
                <span style={{ fontSize:20, color:T.muted }}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* ADVANCED MODULES */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:T.muted }}>ADVANCED MODULES</div>
            <span style={{ fontSize:11, color:T.teal, fontWeight:700 }}>8 modules</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { icon:'💊', label:'Pharmacy', color:T.green },
              { icon:'🩻', label:'Radiology', color:T.teal },
              { icon:'🧬', label:'Lab Module', color:T.purple },
              { icon:'👥', label:'Clinical Duels', color:T.amber },
              { icon:'🏆', label:'Grand Rounds', color:T.rose },
              { icon:'🤖', label:'AI Generator', color:T.teal },
            ].map((m,i)=>(
              <div key={i} onClick={()=>setTab('tools')} style={{ background:T.card, border:`1px solid ${m.color}20`, borderRadius:16, padding:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>{m.icon}</span>
                <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showLive && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(12px)' }}>
          <div style={{ padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#fff', fontWeight:800, fontSize:16, fontFamily:F }}>Live Case</span>
            <button onClick={()=>setShowLive(false)} style={{ background:'rgba(0,196,180,0.20)', border:'none', borderRadius:10, padding:'8px 14px', color:'#fff', cursor:'pointer', fontFamily:F, fontSize:14 }}>✕ Close</button>
          </div>
          <LiveCaseViewer specialty="Emergency Medicine" difficulty="Intermediate" onXP={onXP}/>
        </div>
      )}

      {openSection && (
        <SectionModal section={openSection} onClose={()=>setOpenSection(null)} onCase={setActiveCase} isPro={isPro} setShowUpgrade={setShowUpgrade}/>
      )}
    </div>
  )
}
