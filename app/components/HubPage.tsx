'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../supabase'

const LiveCaseViewer = dynamic(() => import('./LiveCaseViewer'), { ssr: false })
const PulseAcademy   = dynamic(() => import('./PulseAcademy'),   { ssr: false })
const AmbientScribe       = dynamic(() => import('./AmbientScribe'),       { ssr: false })
const HealthStatusHeader  = dynamic(() => import('./HealthStatusHeader'), { ssr: false })
const Leaderboard         = dynamic(() => import('./Leaderboard'),        { ssr: false })
const SocialHub           = dynamic(() => import('./SocialHub'),           { ssr: false })
const TeleconsultModule   = dynamic(() => import('./TeleconsultModule'),  { ssr: false })
const BoardExam           = dynamic(() => import('./BoardExam'),           { ssr: false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── DESIGN TOKENS — Apple-grade contrast & clarity ──
const D = {
  // Backgrounds
  bg0:     'var(--bg-base,#EEF4FF)',
  bg1:     'var(--bg-card,rgba(255,255,255,0.85))',
  bg2:     'var(--bg-card,rgba(255,255,255,0.72))',
  // Glass layers
  glass:   'var(--bg-card,rgba(255,255,255,0.85))',
  glass2:  'var(--bg-card,rgba(255,255,255,0.72))',
  glassHover: 'var(--bg-card,rgba(255,255,255,0.95))',
  // Borders
  border:  'var(--border-card,rgba(10,132,255,0.10))',
  borderHi:'var(--border-card,rgba(10,132,255,0.18))',
  // Text — WCAG AA compliant
  t1: 'var(--text-primary,#0A1F3C)',
  t2: 'var(--text-secondary,rgba(10,31,60,0.65))',
  t3: 'var(--text-secondary,rgba(10,31,60,0.50))',
  t4: 'var(--text-muted,rgba(10,31,60,0.38))',
  // Brand accents
  teal:   '#00C8B8',
  tealDim:'rgba(0,200,184,0.12)',
  tealBd: 'rgba(0,200,184,0.22)',
  blue:   '#1A8CFF',
  blueDim:'rgba(26,140,255,0.10)',
  green:  '#30D158',
  red:    '#FF453A',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  gold:   '#FFD60A',
  // Semantic
  live:   '#FF453A',
}

const BIO = `
  @keyframes bioGlow {
    0%,100%{box-shadow:0 0 18px rgba(0,200,184,.30),0 0 36px rgba(0,200,184,.12);}
    50%     {box-shadow:0 0 28px rgba(0,200,184,.50),0 0 56px rgba(0,200,184,.20);}
  }
  @keyframes liveBlink {
    0%,100%{opacity:1;} 50%{opacity:.35;}
  }
  @keyframes ticker {
    0%{transform:translateX(0);} 100%{transform:translateX(-50%);}
  }
  @keyframes neuralDrift {
    0%,100%{transform:translateY(0) scale(1);opacity:.18;}
    50%    {transform:translateY(-10px) scale(1.1);opacity:.32;}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(14px);}
    to  {opacity:1;transform:translateY(0);}
  }
`

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; criticalCases:any[]; sportsCases:any[]; pedsCases:any[]
  setActiveCase:(id:string)=>void; setShowUpgrade:(v:boolean)=>void
  setTab:(t:string)=>void; setToolTab:(t:string)=>void; onXP:(n:number)=>void
}

// ── NEURAL BACKGROUND ──
function NeuralBg() {
  const nodes = [{x:12,y:18},{x:42,y:8},{x:78,y:22},{x:8,y:58},{x:52,y:52},{x:88,y:62},{x:28,y:82},{x:68,y:88},{x:95,y:35},{x:35,y:42}]
  const edges = [[0,1],[1,2],[3,4],[4,5],[6,7],[1,4],[2,5],[4,7],[8,5],[9,4]]
  return (
    <svg style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <radialGradient id="ng" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={D.teal} stopOpacity="0.04"/>
          <stop offset="100%" stopColor={D.blue} stopOpacity="0.01"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ng)"/>
      {edges.map(([a,b],i)=>(
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={i%2===0?D.teal:D.blue} strokeWidth="0.15" opacity="0.18"/>
      ))}
      {nodes.map((n,i)=>(
        <circle key={i} cx={n.x} cy={n.y} r={i<3?"0.9":"0.55"}
          fill={i%3===0?D.teal:i%3===1?D.blue:D.purple}
          style={{animation:`neuralDrift ${2.2+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.18}s`}}/>
      ))}
    </svg>
  )
}

// ── LIVE TICKER ──
function Ticker({xp,streak,live}:{xp:number,streak:number,live:number}) {
  const items = [
    {k:'LIVE',v:`${live.toLocaleString()} active`,c:D.red,dot:true},
    {k:'XP',v:`${xp} pts`,c:D.gold},
    {k:'STREAK',v:`${streak} days 🔥`,c:D.orange},
    {k:'SCRIBE',v:'EN · AR ready',c:D.teal},
    {k:'CASES',v:'25+ today',c:D.blue},
    {k:'BOARDS',v:'Saudi · USMLE · MRCP',c:D.purple},
  ]
  return (
    <div style={{overflow:'hidden',borderRadius:10,background:D.glass,border:`1px solid ${D.border}`,padding:'6px 0',marginBottom:14}}>
      <div style={{display:'flex',animation:'ticker 20s linear infinite',width:'max-content'}}>
        {[...items,...items].map((it,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'0 18px',flexShrink:0}}>
            {it.dot&&<div style={{width:5,height:5,borderRadius:'50%',background:it.c,animation:'liveBlink 1.4s ease-in-out infinite'}}/>}
            <span style={{fontSize:9,color:D.t4,fontWeight:700,letterSpacing:1.2}}>{it.k}</span>
            <span style={{fontSize:10,color:it.c,fontWeight:800}}>{it.v}</span>
            <span style={{color:D.border,marginLeft:3}}>·</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SECTION MODAL ──
function SectionModal({section,onClose,onCase,isPro,setShowUpgrade}:any) {

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.82)',backdropFilter:'blur(16px)',display:'flex',flexDirection:'column',justifyContent:'flex-end'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${D.bg2},${D.bg1})`,borderRadius:'28px 28px 0 0',border:`1px solid ${D.borderHi}`,padding:'24px 20px 44px',maxHeight:'78vh',overflowY:'auto',animation:'fadeUp 0.28s ease'}}>
        <div style={{width:38,height:4,borderRadius:2,background:D.border,margin:'0 auto 22px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:22}}>
          <div style={{width:54,height:54,borderRadius:17,background:`${section.color}18`,border:`1.5px solid ${section.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{section.icon}</div>
          <div>
            <div style={{fontSize:10,color:section.color,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>{section.tag||'CASE LIBRARY'}</div>
            <div style={{fontSize:19,fontWeight:900,color:D.t1,fontFamily:F}}>{section.title}</div>
            <div style={{fontSize:12,color:D.t3,marginTop:2}}>{section.cases?.length||0} cases available</div>
          </div>
        </div>
        {(section.cases||[]).map((c:any)=>(
          <div key={c.id} onClick={()=>{if(!c.free&&!isPro){setShowUpgrade(true);return}onCase(c.id);onClose()}}
            style={{background:D.glass,backdropFilter:'blur(16px)',borderRadius:18,padding:'14px 16px',border:`1px solid ${c.color||section.color}20`,cursor:'pointer',display:'flex',alignItems:'center',gap:12,marginBottom:8,transition:'all 0.15s'}}>
            <div style={{width:46,height:46,borderRadius:14,background:`${c.color||section.color}15`,border:`1px solid ${c.color||section.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{c.icon||'🏥'}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:D.t1,marginBottom:2}}>{c.title}</div>
              <div style={{fontSize:12,color:D.t2}}>{c.sub}</div>
            </div>
            {!c.free&&!isPro
              ?<span style={{fontSize:9,padding:'4px 10px',borderRadius:8,background:'rgba(255,159,10,0.15)',color:D.orange,fontWeight:800,border:'1px solid rgba(255,159,10,0.25)'}}>PRO</span>
              :<span style={{fontSize:20,color:D.t4}}>›</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FULL MODAL WRAPPER ──
function FullModal({onBack,label,children}:{onBack:()=>void,label:string,children:React.ReactNode}) {

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:D.bg0,overflowY:'auto'}}>
      <div style={{padding:'20px 16px 120px',maxWidth:520,margin:'0 auto'}}>
        <button onClick={onBack} style={{background:D.glass,backdropFilter:'blur(16px)',border:`1px solid ${D.border}`,borderRadius:12,padding:'9px 18px',color:D.t2,fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:22,fontFamily:F,display:'flex',alignItems:'center',gap:6}}>
          ‹ <span>{label}</span>
        </button>
        {children}
      </div>
    </div>
  )
}

// ── QUICK TOOL PILL ──
function QuickTool({icon,label,color,onClick}:{icon:string,label:string,color:string,onClick:()=>void}) {

  return (
    <div onClick={onClick} style={{
      flexShrink:0,
      display:'flex',flexDirection:'column',alignItems:'center',gap:6,
      width:68,cursor:'pointer',
    }}>
      <div style={{
        width:52,height:52,borderRadius:17,
        background:`${color}14`,border:`1.5px solid ${color}28`,
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
        transition:'transform 0.15s',
      }}>{icon}</div>
      <span style={{fontSize:9,fontWeight:700,color:D.t3,textAlign:'center',lineHeight:1.2,letterSpacing:0.2}}>{label}</span>
    </div>
  )
}

export default function HubPage({xp,streak,casesCompleted,mcqCorrect,isPro,criticalCases,sportsCases,pedsCases,setActiveCase,setShowUpgrade,setTab,setToolTab,onXP}:Props) {
  const [liveCount,setLiveCount]   = useState(1247)
  const [dailyCase,setDailyCase]   = useState<any>(null)
  const [openSection,setOpenSection] = useState<any>(null)
  const [showLive,setShowLive]     = useState(false)
  const [showScribe,setShowScribe] = useState(false)
  const [showAcademy,setShowAcademy] = useState(false)
  const [waitlist,setWaitlist]     = useState<string[]>([])
  const [activeFeature,setActiveFeature] = useState<string|null>(null)

  useEffect(()=>{
    const t = setInterval(()=>setLiveCount(n=>Math.max(900,Math.min(1600,n+Math.floor(Math.random()*5)-2))),3500)
    supabase.from('daily_cases').select('*').order('created_at',{ascending:false}).limit(1).single().then(({data})=>{if(data)setDailyCase(data)})
    return()=>clearInterval(t)
  },[])

  // WARD→PULSE Integration
  const [wardAlert, setWardAlert] = useState<{patient:string,bed:string,diagnosis:string}|null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('cliniverse-ward-alert')
    if (saved) { try { setWardAlert(JSON.parse(saved)) } catch {} }
    const handler = () => {
      const data = localStorage.getItem('cliniverse-ward-alert')
      if (data) { try { setWardAlert(JSON.parse(data)) } catch {} }
    }
    window.addEventListener('cliniverse-ward-update', handler)
    return () => window.removeEventListener('cliniverse-ward-update', handler)
  }, [])

  const h = new Date().getHours()
  const greeting = h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Night shift'
  const greetIcon = h<12?'🌅':h<17?'☀️':h<21?'🌆':'🌙'

  const tools = [
    {icon:'🎙️',label:'Scribe',    color:D.teal,  act:()=>setShowScribe(true)},
    {icon:'🗂️',label:'Memory',   color:D.teal,  act:()=>{setTab('tools');setToolTab('memory')}},
    {icon:'💊',label:'Rx AI',    color:D.green, act:()=>{setTab('tools');setToolTab('rx')}},
    {icon:'🔬',label:'Explorer', color:D.blue,  act:()=>{setTab('tools');setToolTab('explorer')}},
    {icon:'🫘',label:'Renal',    color:D.orange,act:()=>{setTab('tools');setToolTab('renal')}},
    {icon:'⚗️',label:'Drug Int', color:D.red,   act:()=>{setTab('tools');setToolTab('drugcheck')}},
    {icon:'📊',label:'Scores',   color:D.purple,act:()=>{setTab('tools');setToolTab('riskcalc')}},
    {icon:'📋',label:'Logbook',  color:D.gold,  act:()=>{setTab('tools');setToolTab('logbook')}},
    {icon:'🌐',label:'FHIR',     color:D.green, act:()=>{setTab('tools');setToolTab('fhir')}},
  ]

  const sections = [
    {key:'critical',icon:'🏥',title:'Critical Care',  sub:'ED · ICU · CCU · Daily Cases', action:()=>setShowCritical(true),          color:D.red,   tag:'INTENSIVE',  cases:criticalCases},
    {key:'sports',  icon:'⚽',title:'Sports Medicine',sub:'Pitch-side · Evidence-based',  color:D.green, tag:'NEW',        cases:sportsCases,  badge:'NEW'},
    {key:'peds',    icon:'🧸',title:'Pediatrics',     sub:'Febrile · Vaccines · Growth',    color:D.purple,tag:'PEDIATRICS', cases:pedsCases,    badge:'NEW'},
  ]

  // Full modals
  if(showScribe)  return <FullModal onBack={()=>setShowScribe(false)}  label="Pulse"><AmbientScribe  onXP={onXP}/></FullModal>
  if(showAcademy) return <FullModal onBack={()=>setShowAcademy(false)} label="Pulse"><PulseAcademy   onXP={onXP}/></FullModal>
  if(showCritical) return <CriticalCareSection onXP={onXP} />

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.92)',backdropFilter:'blur(16px)'}}>
      <div style={{padding:'20px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${D.border}`}}>
        <span style={{color:D.t1,fontWeight:800,fontSize:16,fontFamily:F}}>Live Case</span>
        <button onClick={()=>setShowLive(false)} style={{background:D.glass,border:`1px solid ${D.border}`,borderRadius:10,padding:'8px 14px',color:D.t1,cursor:'pointer',fontFamily:F,fontSize:14}}>✕</button>
      </div>
      <LiveCaseViewer specialty="Emergency Medicine" difficulty="Intermediate" onXP={onXP}/>
    </div>
  )


  return (
    <div style={{minHeight:'100vh',background:'var(--bg-base, #0a1828)',fontFamily:F,overflowX:'hidden',position:'relative'}}>
      <NeuralBg/>

      {/* Ambient top glow */}
      <div style={{position:'fixed',top:-120,left:'50%',transform:'translateX(-50%)',width:700,height:300,borderRadius:'50%',background:`radial-gradient(ellipse,rgba(0,200,184,.05),transparent 70%)`,pointerEvents:'none',zIndex:0,filter:'blur(40px)'}}/>

      {/* ── MAIN SCROLL — pb accounts for Floating Nav ── */}
      <main style={{position:'relative',zIndex:1,padding:'20px 16px 116px',maxWidth:540,margin:'0 auto'}}>

        {/* ── HEALTH STATUS HEADER ── */}
        <HealthStatusHeader
          doctorName="Dr. Ahmed Osman"
          xp={xp}
          streak={streak}
          liveCount={liveCount}
          isPro={isPro}
        />

        {/* ── AMBIENT SCRIBE — HERO CTA ── */}
        <div onClick={()=>setShowScribe(true)} style={{
          background:`linear-gradient(135deg,rgba(0,200,184,.09),rgba(26,140,255,.06))`,
          border:`1.5px solid ${D.tealBd}`,
          borderRadius:22,padding:'18px',marginBottom:14,cursor:'pointer',
          position:'relative',overflow:'hidden',
          animation:'bioGlow 3s ease-in-out infinite',
          transition:'transform 0.15s',
        }}>
          {/* Ambient nodes */}
          {[{l:'82%',t:'18%'},{l:'91%',t:'62%'},{l:'74%',t:'82%'}].map((d,i)=>(
            <div key={i} style={{position:'absolute',left:d.l,top:d.t,width:5,height:5,borderRadius:'50%',background:D.teal,opacity:0.25,animation:`neuralDrift ${2+i*.4}s ease-in-out infinite`}}/>
          ))}

          <div style={{display:'flex',alignItems:'center',gap:14}}>
            {/* Icon */}
            <div style={{width:54,height:54,borderRadius:17,background:D.tealDim,border:`1.5px solid ${D.tealBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>🎙️</div>

            {/* Text */}
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <span style={{fontSize:10,color:D.teal,fontWeight:700,letterSpacing:1.5}}>AMBIENT AI SCRIBE</span>
                <span style={{fontSize:9,fontWeight:700,background:'rgba(48,209,88,.18)',color:D.green,border:'1px solid rgba(48,209,88,.28)',borderRadius:6,padding:'2px 7px'}}>2026</span>
              </div>
              <div style={{fontSize:16,fontWeight:900,color:D.t1,marginBottom:4,letterSpacing:-0.3}}>Start Consultation</div>
              {/* ← Higher contrast subtitle */}
              <div style={{fontSize:12,color:D.t2,fontWeight:500}}>
                Record <span style={{color:D.teal}}>→</span> AI generates SOAP note · EN + AR
              </div>
            </div>

            {/* Arrow CTA */}
            <div style={{width:38,height:38,borderRadius:12,background:D.teal,display:'flex',alignItems:'center',justifyContent:'center',color:'#000',fontSize:18,fontWeight:900,flexShrink:0}}>›</div>
          </div>

          {/* Tags */}
          <div style={{display:'flex',gap:7,marginTop:12}}>
            {['2h/day saved','SOAP format','Arabic + English'].map(tag=>(
              <span key={tag} style={{fontSize:10,color:D.t2,background:'var(--bg-card,rgba(255,255,255,0.88))',border:`1px solid ${D.border}`,borderRadius:8,padding:'3px 9px',fontWeight:600}}>{tag}</span>
            ))}
          </div>
        </div>

        {/* ── BENTO GRID ── */}
        <div style={{marginBottom:14}}>
          {/* ── WARD→PULSE Alert Banner ── */}
          {wardAlert && (
            <div style={{
              background:'rgba(255,69,58,0.08)',
              border:'1px solid rgba(255,69,58,0.25)',
              borderRadius:14, padding:'10px 14px',
              marginBottom:12, display:'flex', alignItems:'center', gap:10,
            }}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#FF453A',animation:'liveBlink 0.8s infinite',flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:'#FF453A',fontWeight:800,letterSpacing:1,marginBottom:2}}>
                  WARD ALERT — CRITICAL PATIENT
                </div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text-primary,#F2F8FC)'}}>
                  {wardAlert.patient} · Bed {wardAlert.bed}
                </div>
                <div style={{fontSize:10,color:'var(--text-muted,rgba(242,248,252,0.45))'}}>
                  {wardAlert.diagnosis}
                </div>
              </div>
              <div onClick={()=>setWardAlert(null)} style={{fontSize:16,color:'var(--text-muted,rgba(242,248,252,0.45))',cursor:'pointer',padding:'4px'}}>✕</div>
            </div>
          )}

          <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CLINICAL DASHBOARD</div>

          {/* Row 1 */}
          <div style={{display:'flex',gap:10,marginBottom:10}}>

            {/* Case of the Day — 2/3 width */}
            <div onClick={()=>{setShowLive(true);onXP(5)}} style={{
              flex:2,
              background:'var(--bg-card,rgba(255,255,255,0.88))',
              backdropFilter:'blur(40px) saturate(180%)',
              WebkitBackdropFilter:'blur(40px) saturate(180%)',
              border:'1px solid rgba(255,69,58,0.20)',
              borderRadius:28,padding:'18px',cursor:'pointer',
              position:'relative',overflow:'hidden',minHeight:140,
              transition:'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s',
              boxShadow:'0 8px 32px rgba(255,69,58,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}>
              {/* Ambient glow */}
              <div style={{position:'absolute',top:-30,right:-30,width:110,height:110,borderRadius:'50%',
                background:'radial-gradient(circle,rgba(255,69,58,0.18),transparent 70%)',pointerEvents:'none'}}/>
              {/* Inner shimmer */}
              <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
                pointerEvents:'none'}}/>
              {/* TODAY badge */}
              <div style={{
                position:'absolute',top:12,right:12,
                background:'rgba(255,69,58,0.12)',
                border:'1px solid rgba(255,69,58,0.25)',
                borderRadius:8,padding:'3px 8px',
                fontSize:8,fontWeight:900,color:'#FF453A',letterSpacing:1.5,
              }}>TODAY</div>

              {/* Icon */}
              <div style={{
                width:44,height:44,borderRadius:15,
                background:'rgba(255,69,58,0.12)',
                border:'1px solid rgba(255,69,58,0.22)',
                backdropFilter:'blur(10px)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:22,marginBottom:12,
                boxShadow:'0 4px 12px rgba(255,69,58,0.15)',
              }}>🏥</div>

              <div style={{fontSize:9,color:'#FF453A',fontWeight:800,letterSpacing:1.8,marginBottom:5}}>
                CASE OF THE DAY
              </div>
              <div style={{fontSize:15,fontWeight:900,color:'var(--text-primary,#F2F8FC)',lineHeight:1.3,marginBottom:6,letterSpacing:-0.3}}>
                {dailyCase?.title||'AI Clinical Case'}
              </div>
              <div style={{fontSize:11,color:'var(--text-secondary,rgba(242,248,252,0.60))',marginBottom:10}}>
                {dailyCase?.specialty||'Emergency Medicine'}
              </div>

              {/* Live indicator + XP */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#FF453A',
                    boxShadow:'0 0 8px rgba(255,69,58,0.8)',animation:'liveBlink 1.4s ease-in-out infinite'}}/>
                  <span style={{fontSize:9,color:'#FF453A',fontWeight:800,letterSpacing:0.8}}>LIVE INTERACTIVE</span>
                </div>
                <div style={{
                  background:'rgba(255,69,58,0.10)',
                  border:'1px solid rgba(255,69,58,0.20)',
                  borderRadius:8,padding:'2px 8px',
                  fontSize:9,fontWeight:800,color:'#FF453A',
                }}>+30 XP</div>
              </div>
            </div>

            {/* Right column */}
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:10}}>
              {/* Academy */}
              <div onClick={()=>setShowAcademy(true)} style={{
                flex:1,
                background:'rgba(191,90,242,0.08)',
                backdropFilter:'blur(30px) saturate(160%)',
                WebkitBackdropFilter:'blur(30px) saturate(160%)',
                border:'1px solid rgba(191,90,242,0.20)',
                borderRadius:22,padding:'14px 12px',cursor:'pointer',
                display:'flex',flexDirection:'column',gap:5,
                transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow:'0 4px 20px rgba(191,90,242,0.08), inset 0 1px 0 rgba(255,255,255,0.10)',
                position:'relative',overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
                  pointerEvents:'none'}}/>
                <div style={{
                  width:36,height:36,borderRadius:12,
                  background:'rgba(191,90,242,0.15)',
                  border:'1px solid rgba(191,90,242,0.25)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
                }}>🎙️</div>
                <div style={{fontSize:12,fontWeight:800,color:'var(--text-primary,#F2F8FC)'}}>Academy</div>
                <div style={{fontSize:9,color:'var(--text-muted,rgba(242,248,252,0.45))'}}>AI Lectures</div>
              </div>

              {/* XP */}
              <div style={{
                flex:1,
                background:'rgba(255,214,10,0.06)',
                backdropFilter:'blur(30px) saturate(160%)',
                WebkitBackdropFilter:'blur(30px) saturate(160%)',
                border:'1px solid rgba(255,214,10,0.18)',
                borderRadius:22,padding:'14px 12px',
                display:'flex',flexDirection:'column',gap:3,
                boxShadow:'0 4px 20px rgba(255,214,10,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
                position:'relative',overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)',
                  pointerEvents:'none'}}/>
                <div style={{fontSize:18,fontWeight:900,color:'#FFD60A',letterSpacing:-0.5}}>{xp}</div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--text-secondary,rgba(242,248,252,0.55))'}}>XP Points</div>
                <div style={{fontSize:9,color:'#FF9F0A',fontWeight:700}}>🔥 {streak}d streak</div>
              </div>
            </div>
          </div>

          {/* Row 2 — Mini stats */}
          <div style={{display:'flex',gap:10}}>
            {[
              {icon:'📈',label:'Cases Done',value:casesCompleted,color:D.teal},
              {icon:'🧠',label:'MCQ Correct',value:mcqCorrect,   color:D.purple},
              {icon:'⭐',label:'Level',       value:isPro?'PRO':'FREE',color:D.gold},
            ].map(c=>(
              <div key={c.label} style={{
                flex:1,
                background:'var(--bg-card,rgba(255,255,255,0.88))',
                backdropFilter:'blur(24px) saturate(160%)',
                WebkitBackdropFilter:'blur(24px) saturate(160%)',
                border:`1px solid ${c.color}20`,
                borderRadius:22,padding:'13px 8px',
                display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:4,
                cursor:'pointer',
                boxShadow:`0 4px 16px ${c.color}08, inset 0 1px 0 rgba(255,255,255,0.08)`,
                position:'relative',overflow:'hidden',
                transition:'transform 0.15s',
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)',
                  pointerEvents:'none'}}/>
                <div style={{
                  width:36,height:36,borderRadius:11,
                  background:`${c.color}12`,
                  border:`1px solid ${c.color}20`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:18,
                }}>{c.icon}</div>
                <span style={{fontSize:16,fontWeight:900,color:c.color,letterSpacing:-0.3}}>{c.value}</span>
                <span style={{fontSize:8,color:'var(--text-muted,rgba(242,248,252,0.40))',fontWeight:700,letterSpacing:0.5}}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK TOOLS ── */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>QUICK TOOLS</div>
          <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:6,scrollbarWidth:'none'}}>
            {tools.map((t,i)=>(
              <QuickTool key={i} icon={t.icon} label={t.label} color={t.color} onClick={t.act}/>
            ))}
          </div>
        </div>

        {/* ── LIVE FEED ── */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:D.red,animation:'liveBlink 1.4s ease-in-out infinite'}}/>
              <span style={{fontSize:11,fontWeight:800,color:D.t1,letterSpacing:0.5}}>LIVE CLINICAL FEED</span>
            </div>
            <span style={{fontSize:11,color:D.teal,fontWeight:700}}>{liveCount.toLocaleString()} active</span>
          </div>

          <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:6,scrollbarWidth:'none'}}>
            {[
              {city:'Riyadh', tag:'CRITICAL', title:'52M — Anterior STEMI',       sub:'Door-to-balloon: 67 min',    color:D.red},
              {city:'Dubai',  tag:'URGENT',   title:'67F — Acute Heart Failure',   sub:'BNP 4200 · BiPAP started',   color:D.orange},
              {city:'London', tag:'CRITICAL', title:'19M — DKA',                  sub:'pH 7.1 · Insulin infusion',   color:D.red},
            ].map((c,i)=>(
              <div key={i} onClick={()=>setShowLive(true)} style={{
                minWidth:190,background:D.bg2,backdropFilter:'blur(16px)',
                borderRadius:20,padding:'14px',border:`1.5px solid ${c.color}22`,
                cursor:'pointer',flexShrink:0,
                transition:'transform 0.15s',
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:10,color:D.t3,fontWeight:600}}>{c.city}</span>
                  <span style={{fontSize:9,fontWeight:800,color:c.color,background:`${c.color}18`,padding:'2px 8px',borderRadius:6}}>{c.tag}</span>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:D.t1,marginBottom:4,lineHeight:1.3}}>{c.title}</div>
                <div style={{fontSize:11,color:D.t2,marginBottom:10}}>{c.sub}</div>
                <div style={{display:'flex',gap:5}}>
                  {['Labs','ECG','Echo'].map((t,j)=>(
                    <span key={j} style={{fontSize:9,fontWeight:700,color:D.teal,background:D.tealDim,padding:'3px 7px',borderRadius:6,border:`1px solid ${D.tealBd}`}}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CASE LIBRARY ── */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:D.t4,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CASE LIBRARY</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {sections.map((s,i)=>(
              <div key={i} onClick={()=>setOpenSection(s)} style={{
                background:D.bg2,border:`1.5px solid ${s.color}18`,
                borderRadius:20,padding:'15px 16px',cursor:'pointer',
                display:'flex',alignItems:'center',gap:14,
                position:'relative',overflow:'hidden',
                transition:'transform 0.15s',
              }}>
                <div style={{position:'absolute',top:0,right:0,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${s.color}08,transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{width:48,height:48,borderRadius:15,background:`${s.color}14`,border:`1.5px solid ${s.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
                    <span style={{fontSize:15,fontWeight:800,color:D.t1}}>{s.title}</span>
                    {s.badge&&<span style={{fontSize:9,fontWeight:800,color:s.color,background:`${s.color}18`,padding:'2px 7px',borderRadius:6}}>{s.badge}</span>}
                  </div>
                  <div style={{fontSize:12,color:D.t2}}>{s.sub}</div>
                </div>
                <span style={{fontSize:20,color:D.t4}}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DISCOVER ── */}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{height:'1px',flex:1,background:`linear-gradient(90deg,transparent,${D.tealBd},transparent)`}}/>
            <span style={{fontSize:9,color:D.teal,fontWeight:700,letterSpacing:2}}>DISCOVER MORE</span>
            <div style={{height:'1px',flex:1,background:`linear-gradient(90deg,transparent,${D.tealBd},transparent)`}}/>
          </div>

          {/* ── ACTIVE FEATURES ── */}
          {[
            {id:'leaderboard',icon:'🏆',title:'Global Leaderboard',sub:'Top doctors worldwide',desc:'See how you rank against doctors globally. Compete, climb, and earn recognition.',color:D.gold,action:()=>setActiveFeature('leaderboard'),stats:[{l:'Doctors',v:'12K+'},{l:'Countries',v:'48'},{l:'Updated',v:'Live'}]},
            {id:'social',icon:'👥',title:'Clinical Social Hub',sub:'Cases · Discussions · Network',desc:'Connect with doctors globally. Share clinical insights and discuss complex cases.',color:D.blue,action:()=>setActiveFeature('social'),stats:[{l:'Members',v:'Live'},{l:'Updated',v:'Daily'},{l:'Specialties',v:'3+'}]},
            {id:'teleconsult',icon:'📹',title:'Teleconsultation',sub:'Live · Async · Secure',desc:'Consult with specialists remotely. Secure video and async messaging for complex cases.',color:D.teal,action:()=>setActiveFeature('teleconsult'),stats:[{l:'AI',v:'Powered'},{l:'Evidence',v:'Based'},{l:'PubMed',v:'Live'}]},
            {id:'board',icon:'📚',title:'Board Exam Prep',sub:'USMLE · MRCP · Saudi Boards',desc:'Comprehensive exam preparation with AI-powered practice questions and explanations.',color:D.purple,action:()=>setActiveFeature('board'),stats:[{l:'Questions',v:'5K+'},{l:'Pass rate',v:'94%'},{l:'Exams',v:'12'}]},
            {id:'reports',icon:'📋',title:'Medical Reports AI',sub:'Discharge · Referral · Handover',desc:'Generate professional medical reports in seconds with AI assistance.',color:'#00C2B2',count:847,action:null,stats:[{l:'Types',v:'12+'},{l:'Languages',v:'EN·AR'},{l:'Time saved',v:'40min'}]},
            {id:'nit',    icon:'🔬',title:'Non-Invasive Tech', sub:'ECG AI · Retinal · Skin lesion',desc:'AI-powered diagnostic tools for clinical decision support.',color:D.purple,count:1203,action:null,stats:[{l:'Tools',v:'8+'},{l:'Accuracy',v:'94%'},{l:'Validated',v:'FDA×3'}]},
          ].map((card:any)=>(
            <div key={card.id} onClick={card.action||undefined} style={{
              background:D.bg2,border:`1.5px solid ${card.color}18`,
              borderRadius:24,padding:'18px',marginBottom:12,
              position:'relative',overflow:'hidden',
              cursor: card.action ? 'pointer' : 'default',
              transition:'transform 0.15s',
            }}>
              <div style={{position:'absolute',top:-35,right:-35,width:130,height:130,borderRadius:'50%',background:`radial-gradient(circle,${card.color}08,transparent 70%)`,pointerEvents:'none'}}/>

              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:11}}>
                  <div style={{width:48,height:48,borderRadius:15,background:`${card.color}14`,border:`1.5px solid ${card.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{card.icon}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:900,color:D.t1,marginBottom:2}}>{card.title}</div>
                    <div style={{fontSize:11,color:D.t2}}>{card.sub}</div>
                  </div>
                </div>
                <div style={{
                  background: card.action ? `${card.color}14` : D.glass,
                  border:`1px solid ${card.action ? card.color+'35' : D.border}`,
                  borderRadius:20,padding:'4px 12px'
                }}>
                  <span style={{fontSize:9,fontWeight:800,color:card.action?card.color:D.t4,letterSpacing:0.5}}>
                    {card.action ? '● LIVE' : 'COMING SOON'}
                  </span>
                </div>
              </div>

              <div style={{fontSize:12,color:D.t2,lineHeight:1.65,marginBottom:12}}>{card.desc}</div>

              <div style={{display:'flex',gap:8,marginBottom:14}}>
                {card.stats.map(s=>(
                  <div key={s.l} style={{flex:1,background:D.glass,borderRadius:12,padding:'8px 6px',textAlign:'center',border:`1px solid ${D.border}`}}>
                    <div style={{fontSize:13,fontWeight:900,color:card.color}}>{s.v}</div>
                    <div style={{fontSize:8,color:D.t4,marginTop:2,fontWeight:600}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {card.action ? (
                <button onClick={e=>{e.stopPropagation();card.action&&card.action()}} style={{
                  width:'100%',
                  background:`linear-gradient(135deg,${card.color},${card.color}bb)`,
                  border:'none',
                  borderRadius:14,padding:'13px 16px',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  cursor:'pointer',fontFamily:F,transition:'all 0.2s',
                  boxShadow:`0 6px 20px ${card.color}30`,
                }}>
                  <span style={{fontSize:14}}>→</span>
                  <span style={{fontSize:13,fontWeight:800,color:'white'}}>Open {card.title.split(' ')[0]}</span>
                </button>
              ) : (
                <button onClick={e=>{e.stopPropagation();if(!waitlist.includes(card.id))setWaitlist(w=>[...w,card.id])}} style={{
                  width:'100%',
                  background:waitlist.includes(card.id)?`${card.color}12`:D.glass,
                  border:`1.5px solid ${card.color}${waitlist.includes(card.id)?'35':'18'}`,
                  borderRadius:14,padding:'12px 16px',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  cursor:'pointer',fontFamily:F,transition:'all 0.2s',
                }}>
                  <span style={{fontSize:14}}>{waitlist.includes(card.id)?'✓':'🔔'}</span>
                  <span style={{fontSize:12,fontWeight:800,color:waitlist.includes(card.id)?card.color:D.t1}}>
                    {waitlist.includes(card.id)?"You're on the waitlist!":`Join Waitlist · ${(card.count||0).toLocaleString()} waiting`}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

      </main>

      {/* ── FEATURE MODALS ── */}
      {activeFeature==='leaderboard' && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'#F0F6FF',overflowY:'auto',padding:'60px 16px 100px'}}>
          <button onClick={()=>setActiveFeature(null)} style={{position:'fixed',top:16,left:16,zIndex:1000,background:'rgba(255,255,255,0.92)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:14,padding:'10px 18px',fontSize:14,fontWeight:700,color:'#0A84FF',cursor:'pointer',backdropFilter:'blur(12px)'}}>‹ Back</button>
          <Leaderboard currentXP={xp} currentRank={''} />
        </div>
      )}
      {activeFeature==='social' && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'#F0F6FF',overflowY:'auto',padding:'60px 16px 100px'}}>
          <button onClick={()=>setActiveFeature(null)} style={{position:'fixed',top:16,left:16,zIndex:1000,background:'rgba(255,255,255,0.92)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:14,padding:'10px 18px',fontSize:14,fontWeight:700,color:'#0A84FF',cursor:'pointer',backdropFilter:'blur(12px)'}}>‹ Back</button>
          <SocialHub onXP={onXP} />
        </div>
      )}
      {activeFeature==='teleconsult' && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'#F0F6FF',overflowY:'auto',padding:'60px 16px 100px'}}>
          <button onClick={()=>setActiveFeature(null)} style={{position:'fixed',top:16,left:16,zIndex:1000,background:'rgba(255,255,255,0.92)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:14,padding:'10px 18px',fontSize:14,fontWeight:700,color:'#0A84FF',cursor:'pointer',backdropFilter:'blur(12px)'}}>‹ Back</button>
          <TeleconsultModule />
        </div>
      )}
      {activeFeature==='board' && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'#F0F6FF',overflowY:'auto',padding:'60px 16px 100px'}}>
          <button onClick={()=>setActiveFeature(null)} style={{position:'fixed',top:16,left:16,zIndex:1000,background:'rgba(255,255,255,0.92)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:14,padding:'10px 18px',fontSize:14,fontWeight:700,color:'#0A84FF',cursor:'pointer',backdropFilter:'blur(12px)'}}>‹ Back</button>
          <BoardExam onXP={onXP} />
        </div>
      )}

      {openSection&&(
        <SectionModal section={openSection} onClose={()=>setOpenSection(null)} onCase={setActiveCase} isPro={isPro} setShowUpgrade={setShowUpgrade}/>
      )}

      <style>{BIO}</style>
    </div>
  )
}
