'use client'
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
const LiveCaseViewer = dynamic(() => import('./LiveCaseViewer'), { ssr: false })
const DynamicMCQ        = dynamic(() => import('./DynamicMCQ'),          { ssr: false })
const PediatricsModule   = dynamic(() => import('./PediatricsModule'),    { ssr: false })
const SportsMedicineModule = dynamic(() => import('./SportsMedicineModule'), { ssr: false })
const CriticalCareModule  = dynamic(() => import('./CriticalCareModule'),   { ssr: false })
const TeleconsultModule   = dynamic(() => import('./TeleconsultModule'),   { ssr: false })
const NonInvasiveTech     = dynamic(() => import('./NonInvasiveTech'),     { ssr: false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── FROSTED TEAL TOKENS ──
const T = {
  bg:     '#2a5068',
  glass:  'rgba(255,255,255,0.06)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.72)',
  muted:  'rgba(238,246,250,0.50)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
  amber:  '#FFB300',
  rose:   '#FF3B30',
  indigo: '#AF52DE',
}

interface Props {
  xp: number; streak: number; casesCompleted: number; mcqCorrect: number
  isPro: boolean; criticalCases: any[]; sportsCases: any[]; pedsCases: any[]
  setActiveCase: (id: string) => void; setShowUpgrade: (v: boolean) => void
  setTab: (t: string) => void; setToolTab: (t: string) => void; onXP: (n: number) => void
}

// ── SECTION MODAL (kept from original) ──
function SectionModal({ section, onClose, onCase, isPro, setShowUpgrade }: any) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(180deg,#1e3d52,#162e3e)', borderRadius:'28px 28px 0 0', border:`1px solid ${section.color}25`, padding:'24px 20px 40px', maxHeight:'80vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.20)', margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:`${section.color}18`, border:`1px solid ${section.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{section.icon}</div>
          <div>
            <div style={{ fontSize:19, fontWeight:900, color:T.text, fontFamily:F }}>{section.title}</div>
            <div style={{ fontSize:13, color:T.sub }}>{section.cases?.length||0} cases available</div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {(section.cases||[]).map((c:any)=>(
            <div key={c.id} onClick={()=>{ if(!c.free&&!isPro){setShowUpgrade(true);return} onCase(c.id);onClose() }} style={{ background:T.glass, borderRadius:18, padding:'14px 16px', border:`1px solid ${c.color||section.color}25`, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background:`${c.color||section.color}18`, border:`1px solid ${c.color||section.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{c.icon||'🏥'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:2 }}>{c.title}</div>
                <div style={{ fontSize:13, color:T.sub }}>{c.sub}</div>
              </div>
              {!c.free&&!isPro
                ? <span style={{ fontSize:10, padding:'4px 10px', borderRadius:8, background:'rgba(255,149,0,0.15)', color:'#FF9500', fontWeight:800, border:'1px solid rgba(255,149,0,0.25)' }}>PRO</span>
                : <span style={{ fontSize:20, color:T.muted }}>›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── LIVE TICKER ──
function LiveTicker({ xp, streak, liveCount }: { xp:number, streak:number, liveCount:number }) {
  const offsetRef = useRef(0)
  const rafRef = useRef<number>(0)
  const [, forceUpdate] = useState(0)

  const items = [
    { l:'LIVE', v:`${liveCount.toLocaleString()} active`, c:T.red, dot:true },
    { l:'XP', v:`${xp}`, c:T.gold },
    { l:'STREAK', v:`${streak}🔥`, c:T.orange },
    { l:'CASES', v:'25+ ready', c:T.teal },
    { l:'BOARD', v:'Saudi·USMLE·MRCP', c:T.blue },
  ]

  useEffect(() => {
    const tick = () => {
      offsetRef.current += 0.35
      forceUpdate(n => n + 1)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const totalW = items.length * 155
  const x = -(offsetRef.current % totalW)

  return (
    <div style={{ overflow:'hidden', borderRadius:12, background:T.glass, backdropFilter:'blur(20px)', border:`1px solid ${T.border}`, padding:'8px 0', marginBottom:14, position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:32, background:`linear-gradient(90deg,#1e3d52,transparent)`, zIndex:2, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:32, background:`linear-gradient(270deg,#1e3d52,transparent)`, zIndex:2, pointerEvents:'none' }}/>
      <div style={{ display:'flex', transform:`translateX(${x}px)`, width: totalW * 2 }}>
        {[...items,...items].map((item,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5, width:155, flexShrink:0 }}>
            {item.dot && <div style={{ width:6, height:6, borderRadius:'50%', background:item.c, boxShadow:`0 0 8px ${item.c}` }}/>}
            <span style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:1 }}>{item.l}</span>
            <span style={{ fontSize:11, color:item.c, fontWeight:800 }}>{item.v}</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.12)', marginLeft:4 }}>·</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HubPage({ xp, streak, casesCompleted, mcqCorrect, isPro, criticalCases, sportsCases, pedsCases, setActiveCase, setShowUpgrade, setTab, setToolTab, onXP }: Props) {
  const [openSection, setOpenSection] = useState<any>(null)
  const [showMCQ, setShowMCQ] = useState(false)
  const [activeModule, setActiveModule] = useState<string|null>(null)
  const [showTele, setShowTele] = useState(false)
  const [showNIT,  setShowNIT]  = useState(false)
  const [liveCount, setLiveCount] = useState(1247)
  const [showLive, setShowLive] = useState(false)
  const [waitlist, setWaitlist] = useState<string[]>([])

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => Math.max(900, Math.min(1600, n + Math.floor(Math.random()*5)-2))), 3000)
    return () => clearInterval(t)
  }, [])

  const sections = [
    { key:'critical', icon:'🏥', title:'Critical Care', sub:'ED · ICU · CCU · Neuro', color:T.red,    cases:criticalCases },
    { key:'sports',   icon:'⚽', title:'Sports Medicine', sub:'FIFA 2026 · Pitch-side', color:T.green, cases:sportsCases, badge:'NEW' },
    { key:'peds',     icon:'🧸', title:'Pediatrics',    sub:'Febrile · Procedures',    color:T.purple, cases:pedsCases,   badge:'NEW' },
  ]

  const h = new Date().getHours()
  const greet = h<12 ? '🌅 Good morning' : h<17 ? '☀️ Good afternoon' : h<21 ? '🌆 Good evening' : '🌙 Night shift'

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,#2a5068 0%,#1e3d52 50%,#1a3a50 100%)`, fontFamily:F, overflowX:'hidden', position:'relative' }}>

      {/* Ambient glows — subtle only */}
      <div style={{ position:'fixed', top:-100, left:'50%', transform:'translateX(-50%)', width:500, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,196,180,0.08),transparent 70%)', pointerEvents:'none', zIndex:0, filter:'blur(20px)' }}/>
      <div style={{ position:'fixed', bottom:-80, right:-60, width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(212,168,71,0.06),transparent 70%)', pointerEvents:'none', zIndex:0, filter:'blur(20px)' }}/>

      <div style={{ position:'relative', zIndex:1, padding:'16px 16px 120px' }}>
      {/* ── LOGO WATERMARK ── */}
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:0, overflow:'hidden', opacity:0.06 }}>
        <svg width='520' height='520' viewBox='0 0 100 100' fill='none'>
          <rect x='5' y='5' width='90' height='90' rx='23' fill='rgba(255,213,79,0.15)' stroke='rgba(255,213,79,0.9)' strokeWidth='2'/>
          <rect x='5' y='5' width='90' height='90' rx='23' fill='rgba(255,255,255,0.08)'/>
          <path d='M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68' stroke='rgba(255,213,79,1)' strokeWidth='9' strokeLinecap='round' fill='none'/>
          <path d='M36 50L46 63L70 36' stroke='rgba(0,229,255,1)' strokeWidth='5.5' strokeLinecap='round' strokeLinejoin='round'/>
          <circle cx='69' cy='32' r='5' fill='rgba(255,213,79,1)'/>
          <circle cx='69' cy='68' r='5' fill='rgba(255,213,79,1)'/>
        </svg>
      </div>

        {/* ── GREETING ── */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:10, color:'rgba(0,196,180,0.85)', fontWeight:700, letterSpacing:1.5, marginBottom:4 }}>CLINIVERSE AI</div>
              <div style={{ fontSize:22, fontWeight:900, color:T.text, letterSpacing:-0.5, lineHeight:1.1 }}>
                {greet}, <span style={{ color:T.teal }}>Doctor</span>
              </div>
              <div style={{ fontSize:12, color:T.sub, marginTop:4 }}>
                Ready to train? <span style={{ color:T.orange, fontWeight:700 }}>{streak}-day streak 🔥</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,59,48,0.12)', border:'1px solid rgba(255,59,48,0.28)', borderRadius:20, padding:'5px 10px', flexShrink:0, marginLeft:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:T.red, boxShadow:`0 0 8px ${T.red}` }}/>
              <span style={{ fontSize:10, fontWeight:800, color:T.red, letterSpacing:0.5 }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* ── LIVE TICKER ── */}
        <LiveTicker xp={xp} streak={streak} liveCount={liveCount}/>

        {/* ── NEON ACTION BUTTONS ── */}
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          {[
            { icon:'🫀', label:'Start Case', sub:'AI Sim',  color:T.red,   pulse:true,  action:()=>setOpenSection(sections[0]) },
            { icon:'🧠', label:'MCQ',        sub:'Board',   color:T.blue,  pulse:false, action:()=>setShowMCQ(true) },
            { icon:'🤖', label:'AI',         sub:'Claude',  color:T.teal,  pulse:false, action:()=>setShowTele(true) },
            { icon:'🏆', label:'Ranks',      sub:'Global',  color:T.gold,  pulse:false, action:()=>setTab('leaderboard') },
          ].map((btn,i) => (
            <div key={i} onClick={btn.action} style={{
              flex:1, background:T.glass, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
              border:`1.5px solid ${btn.color}40`, borderRadius:18, padding:'12px 6px', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:5,
              position:'relative', overflow:'hidden',
              boxShadow:`0 0 ${btn.pulse?'14px':'6px'} ${btn.color}28`,
            }}>
              {btn.pulse && <div style={{ position:'absolute', width:44, height:44, borderRadius:'50%', border:`1px solid ${btn.color}`, animation:'ringPulse 2s ease-out infinite', pointerEvents:'none' }}/>}
              <div style={{ width:42, height:42, borderRadius:'50%', background:`${btn.color}15`, border:`1.5px solid ${btn.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:`0 0 12px ${btn.color}30`, position:'relative', zIndex:1 }}>{btn.icon}</div>
              <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
                <div style={{ fontSize:11, fontWeight:800, color:T.text, lineHeight:1.2 }}>{btn.label}</div>
                <div style={{ fontSize:9, color:`${btn.color}CC`, marginTop:1, fontWeight:600 }}>{btn.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── BENTO GRID ── */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>CLINICAL DASHBOARD</div>

          {/* Row 1 */}
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            {/* Virtual Ward — large */}
            <div onClick={()=>setOpenSection(sections[0])} style={{
              flex:2, background:T.glass, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
              border:`1.5px solid rgba(255,59,48,0.30)`, borderRadius:22, padding:'16px 14px',
              cursor:'pointer', position:'relative', overflow:'hidden',
              boxShadow:'0 0 20px rgba(255,59,48,0.15)', minHeight:115,
            }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,59,48,0.20),transparent 70%)', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:8, right:10, fontSize:9, fontWeight:800, color:'rgba(255,59,48,0.55)', letterSpacing:1 }}>VIRTUAL WARD</div>
              <div style={{ width:42, height:42, borderRadius:13, background:'rgba(255,59,48,0.15)', border:'1px solid rgba(255,59,48,0.30)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:8, boxShadow:'0 0 12px rgba(255,59,48,0.28)' }}>🏥</div>
              <div style={{ fontSize:14, fontWeight:900, color:T.text, marginBottom:2 }}>Virtual Ward</div>
              <div style={{ fontSize:10, color:T.sub }}>5 patients waiting</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:7 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:T.red, boxShadow:`0 0 6px ${T.red}` }}/>
                <span style={{ fontSize:9, color:T.red, fontWeight:700 }}>LIVE</span>
              </div>
            </div>

            {/* Right column */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
              <div onClick={()=>setShowMCQ(true)} style={{ flex:1, background:T.glass, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:`1.5px solid ${T.blue}28`, borderRadius:18, padding:'12px 10px', cursor:'pointer' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>🧠</div>
                <div style={{ fontSize:12, fontWeight:800, color:T.text }}>MCQ</div>
                <div style={{ fontSize:9, color:T.sub }}>Board Prep</div>
              </div>
              <div style={{ flex:1, background:T.glass, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:`1.5px solid ${T.orange}28`, borderRadius:18, padding:'12px 10px' }}>
                <div style={{ fontSize:20, marginBottom:2 }}>🔥</div>
                <div style={{ fontSize:18, fontWeight:900, color:T.orange }}>{streak}</div>
                <div style={{ fontSize:9, color:T.sub }}>Day Streak</div>
              </div>
            </div>
          </div>

          {/* Row 2 — 3 equal */}
          <div style={{ display:'flex', gap:10 }}>
            {[
              { icon:'💓', label:'ECG AI',  color:T.red,    action:()=>{ setTab('tools'); setToolTab('ecg') } },
              { icon:'🧬', label:'Labs',    color:T.purple, action:()=>{ setTab('tools'); setToolTab('lab') } },
              { icon:'🏆', label:`${xp} XP`, color:T.gold, action:()=>setTab('leaderboard') },
            ].map(c => (
              <div key={c.label} onClick={c.action} style={{ flex:1, background:T.glass, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:`1.5px solid ${c.color}22`, borderRadius:18, padding:'12px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:4, boxShadow:`0 0 10px ${c.color}10` }}>
                <div style={{ fontSize:22 }}>{c.icon}</div>
                <div style={{ fontSize:11, fontWeight:800, color:T.text }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LIVE CLINICAL FEED ── */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:T.red, boxShadow:`0 0 8px ${T.red}` }}/>
              <span style={{ fontSize:11, fontWeight:800, color:T.text, letterSpacing:1 }}>LIVE CLINICAL FEED</span>
            </div>
            <span style={{ fontSize:11, color:T.teal, fontWeight:700 }}>{liveCount.toLocaleString()} active</span>
          </div>
          <div style={{ overflowX:'auto', display:'flex', gap:12, paddingBottom:4 }}>
            {[
              { city:'Riyadh', tag:'CRITICAL', title:'52M — Anterior STEMI', sub:'Door-to-balloon: 67 min', color:T.red },
              { city:'Dubai',  tag:'URGENT',   title:'67F — Acute HF',       sub:'BNP 4200 · BiPAP started', color:T.orange },
              { city:'London', tag:'CRITICAL', title:'19M — DKA',            sub:'pH 7.1 · Insulin infusion', color:T.red },
            ].map((c,i) => (
              <div key={i} onClick={()=>setShowLive(true)} style={{ minWidth:200, background:T.glass, backdropFilter:'blur(20px)', borderRadius:18, padding:'14px', border:`1px solid ${c.color}22`, cursor:'pointer', flexShrink:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:10, color:T.muted, fontWeight:600 }}>{c.city}</span>
                  <span style={{ fontSize:9, fontWeight:800, color:c.color, background:`${c.color}15`, padding:'2px 8px', borderRadius:6 }}>{c.tag}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:11, color:T.sub, marginBottom:10 }}>{c.sub}</div>
                <div style={{ display:'flex', gap:6 }}>
                  {['Labs','ECG','Echo'].map((t,j) => (
                    <span key={j} style={{ fontSize:10, fontWeight:700, color:T.teal, background:'rgba(0,196,180,0.10)', padding:'3px 8px', borderRadius:6, border:`1px solid ${T.teal}25` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CLINICAL PULSE (horizontal scroll) ── */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1.5 }}>CLINICAL PULSE</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,59,48,0.10)', border:'1px solid rgba(255,59,48,0.22)', borderRadius:20, padding:'3px 10px' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:T.red, boxShadow:`0 0 6px ${T.red}` }}/>
              <span style={{ fontSize:9, fontWeight:800, color:T.red, letterSpacing:0.5 }}>LIVE</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
            {[
              { icon:'💊', label:'Pharmacy AI',   sub:'Drug checker · Dosing',   color:T.green,  action:()=>{ setTab('tools'); setToolTab('pharmacy') } },
              { icon:'🩻', label:'Radiology',     sub:'X-ray · CT · MRI',       color:T.teal,   action:()=>{ setTab('tools'); setToolTab('rad') } },
              { icon:'🧬', label:'Lab AI',        sub:'CBC · BMP · ABG · LFTs', color:T.purple, action:()=>{ setTab('tools'); setToolTab('lab') } },
              { icon:'👥', label:'Clinical Duels',sub:'Challenge a colleague',   color:T.orange, action:()=>setShowTele(true) },
              { icon:'🏆', label:'Grand Rounds',  sub:'Real cases · Experts',   color:T.red,    action:()=>setShowTele(true) },
              { icon:'🤖', label:'AI Generator',  sub:'Infinite AI cases',      color:T.blue,   action:()=>setShowMCQ(true) },
            ].map((m,i) => (
              <div key={i} onClick={m.action} style={{
                flexShrink:0, width:116,
                background:T.glass, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                border:`1.5px solid ${m.color}25`, borderRadius:18, padding:'13px 10px',
                cursor:'pointer', position:'relative', overflow:'hidden',
                boxShadow:`0 0 12px ${m.color}12`,
              }}>
                <div style={{ position:'absolute', top:-16, right:-16, width:60, height:60, borderRadius:'50%', background:`radial-gradient(circle,${m.color}18,transparent 70%)`, pointerEvents:'none' }}/>
                <div style={{ width:40, height:40, borderRadius:12, background:`${m.color}15`, border:`1px solid ${m.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, marginBottom:8, boxShadow:`0 0 10px ${m.color}22` }}>{m.icon}</div>
                <div style={{ fontSize:11, fontWeight:800, color:T.text, marginBottom:2, lineHeight:1.2 }}>{m.label}</div>
                <div style={{ fontSize:9, color:`${m.color}BB`, fontWeight:600, lineHeight:1.3 }}>{m.sub}</div>
                <div style={{ position:'absolute', top:7, right:7, width:5, height:5, borderRadius:'50%', background:m.color, opacity:0.8 }}/>
              </div>
            ))}
          </div>
        </div>

        {/* ── CASE LIBRARY ── */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>CASE LIBRARY</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {sections.map((s,i) => (
              <div key={i} onClick={()=>{ if(s.key==='peds'||s.key==='sports'||s.key==='critical'){setActiveModule(s.key)}else{setOpenSection(s)} }} style={{ background:T.glass, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:`1px solid ${s.color}20`, borderRadius:18, padding:'16px', cursor:'pointer', display:'flex', alignItems:'center', gap:14, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${s.color}08 0%, transparent 70%)`, pointerEvents:'none' }}/>
                <div style={{ width:48, height:48, borderRadius:15, background:`${s.color}15`, border:`1px solid ${s.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{s.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:15, fontWeight:800, color:T.text }}>{s.title}</span>
                    {s.badge && <span style={{ fontSize:9, fontWeight:800, color:s.color, background:`${s.color}15`, padding:'2px 7px', borderRadius:6 }}>{s.badge}</span>}
                  </div>
                  <div style={{ fontSize:12, color:T.sub }}>{s.sub}</div>
                </div>
                <span style={{ fontSize:20, color:T.muted }}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SPATIAL CARDS — Scroll to Discover ── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ height:1, flex:1, background:'linear-gradient(90deg,transparent,rgba(0,196,180,0.35),transparent)' }}/>
            <span style={{ fontSize:9, color:T.teal, fontWeight:700, letterSpacing:2 }}>DISCOVER MORE</span>
            <div style={{ height:1, flex:1, background:'linear-gradient(90deg,transparent,rgba(0,196,180,0.35),transparent)' }}/>
          </div>
          <div style={{ fontSize:16, fontWeight:900, color:T.text, textAlign:'center', letterSpacing:-0.5, marginBottom:4 }}>
            What&apos;s next in Cliniverse
          </div>
          <div style={{ fontSize:11, color:T.muted, textAlign:'center', marginBottom:16 }}>
            The future of clinical medicine
          </div>

          {[
            {
              id:'teleconsult',
              icon:'🌐', title:'Teleconsultation', sub:'Connect with specialists worldwide',
              desc:'Video consult · Second opinion · Real-time AI assist',
              color:T.blue, live:true,
              stats:[{l:'Specialists',v:'120+'},{l:'Countries',v:'28'},{l:'Avg wait',v:'4 min'}],
              action:()=>setShowTele(true),
            },
            {
              id:'reports',
              icon:'📋', title:'Medical Reports AI', sub:'Generate reports in seconds',
              desc:'Discharge · Referral · Operative note · Handover AI',
              color:T.teal, live:false, count:847,
              stats:[{l:'Report types',v:'12+'},{l:'Languages',v:'EN·AR'},{l:'Time saved',v:'40 min'}],
            },
            {
              id:'nit', action:()=>setShowNIT(true),
              icon:'🔬', title:'Non-Invasive Tech', sub:'AI-powered diagnostics',
              desc:'ECG AI · Retinal scan · Skin lesion · Waveform analysis',
              color:T.purple, live:false, count:1203,
              stats:[{l:'Tools',v:'8+'},{l:'Accuracy',v:'94%'},{l:'FDA cleared',v:'3'}],
            },
          ].map((card,i) => (
            <div key={card.id} onClick={card.live ? card.action : undefined} style={{
              background:T.glass, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
              border:`1.5px solid ${card.color}${card.live?'40':'20'}`,
              borderRadius:24, padding:'18px', marginBottom:12,
              position:'relative', overflow:'hidden',
              cursor:card.live?'pointer':'default',
              boxShadow:`0 ${8+i*4}px ${28+i*6}px rgba(0,0,0,${0.15+i*0.03}), 0 0 ${card.live?'20px':'10px'} ${card.color}${card.live?'20':'10'}`,
            }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:`radial-gradient(circle,${card.color}14,transparent 70%)`, pointerEvents:'none' }}/>

              {/* Header */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:48, height:48, borderRadius:15, background:`${card.color}18`, border:`1.5px solid ${card.color}38`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:`0 0 16px ${card.color}28` }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:T.text, marginBottom:2 }}>{card.title}</div>
                    <div style={{ fontSize:10, color:T.sub }}>{card.sub}</div>
                  </div>
                </div>
                <div style={{ background:card.live?`${card.color}20`:'rgba(255,255,255,0.05)', border:`1px solid ${card.live?card.color+'45':'rgba(255,255,255,0.10)'}`, borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                  {card.live && <div style={{ width:6, height:6, borderRadius:'50%', background:card.color, boxShadow:`0 0 8px ${card.color}` }}/>}
                  <span style={{ fontSize:9, fontWeight:800, color:card.live?card.color:T.muted, letterSpacing:0.5 }}>{card.live?'LIVE NOW':'COMING SOON'}</span>
                </div>
              </div>

              {/* Description */}
              <div style={{ fontSize:11, color:T.sub, lineHeight:1.6, marginBottom:12 }}>{card.desc}</div>

              {/* Stats */}
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {card.stats.map(s => (
                  <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'7px 5px', textAlign:'center', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:12, fontWeight:900, color:card.color }}>{s.v}</div>
                    <div style={{ fontSize:8, color:T.muted, marginTop:2, fontWeight:600 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {card.live ? (
                <div style={{ background:`linear-gradient(135deg,${card.color},${card.color}CC)`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:`0 6px 20px ${card.color}35` }}>
                  <span style={{ fontSize:13, fontWeight:800, color:'#fff' }} onClick={()=>setShowTele(true)}>Start Consultation →</span>
                  <span style={{ fontSize:16 }}>🌐</span>
                </div>
              ) : (
                <button onClick={e=>{ e.stopPropagation(); if(!waitlist.includes(card.id)) setWaitlist(w=>[...w,card.id]) }} style={{
                  width:'100%', background:waitlist.includes(card.id)?`${card.color}15`:T.glass2,
                  backdropFilter:'blur(20px)', border:`1.5px solid ${card.color}${waitlist.includes(card.id)?'50':'25'}`,
                  borderRadius:14, padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  cursor:'pointer', fontFamily:F,
                  boxShadow:waitlist.includes(card.id)?`0 0 16px ${card.color}28`:'none',
                  transition:'all 0.2s',
                }}>
                  <span style={{ fontSize:14 }}>{waitlist.includes(card.id)?'✓':'🔔'}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:waitlist.includes(card.id)?card.color:T.text }}>
                    {waitlist.includes(card.id) ? "You're on the waitlist!" : `Join Waitlist · ${(card.count||0).toLocaleString()} waiting`}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Live viewer */}
      {showLive && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.90)', backdropFilter:'blur(12px)' }}>
          <div style={{ padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:T.text, fontWeight:800, fontSize:16, fontFamily:F }}>Live Case</span>
            <button onClick={()=>setShowLive(false)} style={{ background:T.glass, border:'none', borderRadius:10, padding:'8px 14px', color:T.text, cursor:'pointer', fontFamily:F, fontSize:14 }}>✕ Close</button>
          </div>
          <LiveCaseViewer specialty="Emergency Medicine" difficulty="Intermediate" onXP={onXP}/>
        </div>
      )}

      {/* MCQ Modal */}
      {showMCQ && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
          <div style={{padding:'20px 20px 40px',maxWidth:480,margin:'0 auto'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:'rgba(0,196,180,0.8)',fontWeight:700,letterSpacing:1.5,marginBottom:2}}>AI-POWERED</div>
                <div style={{fontSize:20,fontWeight:900,color:'#EEF6FA'}}>Dynamic MCQ</div>
              </div>
              <button onClick={()=>setShowMCQ(false)} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:14,padding:'8px 16px',color:'#EEF6FA',fontSize:13,fontWeight:700,cursor:'pointer'}}>✕ Close</button>
            </div>
            <DynamicMCQ onXP={onXP}/>
          </div>
        </div>
      )}

      {/* Module Modals */}
      {/* Teleconsult Modal */}
      {showTele && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
          <div style={{padding:'20px 16px 60px',maxWidth:480,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:'rgba(0,196,180,0.8)',fontWeight:700,letterSpacing:1.5,marginBottom:2}}>TELECONSULTATION 2030</div>
                <div style={{fontSize:18,fontWeight:900,color:'#EEF6FA'}}>🌐 Global Medicine</div>
              </div>
              <button onClick={()=>setShowTele(false)} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'8px 16px',color:'#EEF6FA',cursor:'pointer',fontWeight:700,fontFamily:'-apple-system,sans-serif'}}>✕ Close</button>
            </div>
            <TeleconsultModule onXP={onXP}/>
          </div>
        </div>
      )}

      {/* Non-Invasive Tech Modal */}
      {showNIT && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
          <div style={{padding:'20px 16px 60px',maxWidth:480,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:'rgba(0,196,180,0.8)',fontWeight:700,letterSpacing:1.5,marginBottom:2}}>NON-INVASIVE TECH</div>
                <div style={{fontSize:18,fontWeight:900,color:'#EEF6FA'}}>🔬 AI Diagnostics</div>
              </div>
              <button onClick={()=>setShowNIT(false)} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'8px 16px',color:'#EEF6FA',cursor:'pointer',fontWeight:700,fontFamily:'-apple-system,sans-serif'}}>✕ Close</button>
            </div>
            <NonInvasiveTech onXP={onXP}/>
          </div>
        </div>
      )}

      {activeModule && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
          <div style={{padding:'20px 16px 60px',maxWidth:480,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:900,color:'#EEF6FA'}}>
                {activeModule==='peds'?'🧸 Pediatrics':activeModule==='sports'?'⚽ Sports Medicine':'🚨 Critical Care'}
              </div>
              <button onClick={()=>setActiveModule(null)} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'8px 16px',color:'#EEF6FA',cursor:'pointer',fontWeight:700,fontFamily:'-apple-system,sans-serif'}}>✕ Close</button>
            </div>
            {activeModule==='peds'    && <PediatricsModule    onXP={onXP}/>}
            {activeModule==='sports'  && <SportsMedicineModule onXP={onXP}/>}
            {activeModule==='critical'&& <CriticalCareModule  onXP={onXP}/>}
          </div>
        </div>
      )}

      {openSection && (
        <SectionModal section={openSection} onClose={()=>setOpenSection(null)} onCase={setActiveCase} isPro={isPro} setShowUpgrade={setShowUpgrade}/>
      )}

      <style>{`
        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
