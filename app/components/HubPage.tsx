'use client'
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../supabase'

const LiveCaseViewer = dynamic(() => import('./LiveCaseViewer'), { ssr: false })
const PulseAcademy   = dynamic(() => import('./PulseAcademy'),   { ssr: false })
const AmbientScribe  = dynamic(() => import('./AmbientScribe'),  { ssr: false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
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
}

// Bioluminescence styles
const BIO_CSS = `
  @keyframes bioGlow {
    0%,100% { box-shadow:0 0 20px rgba(0,196,180,0.35),0 0 40px rgba(0,196,180,0.15); }
    50%      { box-shadow:0 0 35px rgba(0,196,180,0.60),0 0 70px rgba(0,196,180,0.25); }
  }
  @keyframes bioPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:0.6; transform:scale(1.08); }
  }
  @keyframes neuralFloat {
    0%,100% { transform:translateY(0px); opacity:0.15; }
    50%     { transform:translateY(-8px); opacity:0.30; }
  }
  @keyframes heartbeat {
    0%,100% { transform:scaleX(1); }
    15%     { transform:scaleX(1.04); }
    30%     { transform:scaleX(0.97); }
  }
  @keyframes tickerMove {
    0%   { transform:translateX(0); }
    100% { transform:translateX(-50%); }
  }
  @keyframes ringPulse {
    0%   { transform:scale(0.85); opacity:0.8; }
    70%  { transform:scale(1.5);  opacity:0; }
    100% { transform:scale(0.85); opacity:0; }
  }
`

interface Props {
  xp: number; streak: number; casesCompleted: number; mcqCorrect: number
  isPro: boolean; criticalCases: any[]; sportsCases: any[]; pedsCases: any[]
  setActiveCase: (id: string) => void; setShowUpgrade: (v: boolean) => void
  setTab: (t: string) => void; setToolTab: (t: string) => void; onXP: (n: number) => void
}

// ── NEURAL NETWORK BACKGROUND ──
function NeuralBg() {
  const nodes = [
    {x:'15%',y:'20%'},{x:'45%',y:'10%'},{x:'80%',y:'25%'},
    {x:'10%',y:'60%'},{x:'55%',y:'55%'},{x:'85%',y:'65%'},
    {x:'30%',y:'80%'},{x:'70%',y:'85%'},
  ]
  return (
    <svg style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0,opacity:0.12}} viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Connection lines */}
      <line x1="15" y1="20" x2="45" y2="10" stroke={T.teal} strokeWidth="0.2" opacity="0.5"/>
      <line x1="45" y1="10" x2="80" y2="25" stroke={T.teal} strokeWidth="0.2" opacity="0.5"/>
      <line x1="10" y1="60" x2="55" y2="55" stroke={T.blue} strokeWidth="0.15" opacity="0.4"/>
      <line x1="55" y1="55" x2="85" y2="65" stroke={T.blue} strokeWidth="0.15" opacity="0.4"/>
      <line x1="30" y1="80" x2="70" y2="85" stroke={T.purple} strokeWidth="0.15" opacity="0.3"/>
      <line x1="45" y1="10" x2="55" y2="55" stroke={T.teal} strokeWidth="0.1" opacity="0.3"/>
      <line x1="80" y1="25" x2="85" y2="65" stroke={T.blue} strokeWidth="0.1" opacity="0.3"/>
      {/* Nodes */}
      {nodes.map((n,i) => (
        <circle key={i} cx={n.x} cy={n.y} r="0.8"
          fill={i%3===0?T.teal:i%3===1?T.blue:T.purple}
          style={{animation:`neuralFloat ${2+i*0.3}s ease-in-out infinite`}}/>
      ))}
    </svg>
  )
}

// ── LIVE TICKER ──
function LiveTicker({ xp, streak, liveCount }: { xp:number, streak:number, liveCount:number }) {
  const items = [
    { l:'LIVE', v:`${liveCount.toLocaleString()} doctors`, c:T.red, dot:true },
    { l:'XP',   v:`${xp} pts`,                            c:T.gold },
    { l:'STREAK',v:`${streak}🔥`,                         c:T.orange },
    { l:'CASES', v:'25+ ready',                           c:T.teal },
    { l:'BOARD', v:'Saudi·USMLE·MRCP',                   c:T.blue },
    { l:'AI',    v:'Ambient Scribe',                      c:T.purple },
  ]
  return (
    <div style={{overflow:'hidden',borderRadius:12,background:T.glass,backdropFilter:'blur(16px)',border:`1px solid ${T.border}`,padding:'7px 0',marginBottom:16,position:'relative'}}>
      <div style={{display:'flex',animation:'tickerMove 18s linear infinite',width:'max-content'}}>
        {[...items,...items].map((item,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'0 20px',flexShrink:0}}>
            {item.dot && <div style={{width:5,height:5,borderRadius:'50%',background:item.c,boxShadow:`0 0 6px ${item.c}`}}/>}
            <span style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1}}>{item.l}</span>
            <span style={{fontSize:11,color:item.c,fontWeight:800}}>{item.v}</span>
            <span style={{fontSize:10,color:'rgba(255,255,255,0.10)',marginLeft:4}}>·</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SECTION MODAL ──
function SectionModal({ section, onClose, onCase, isPro, setShowUpgrade }: any) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)',display:'flex',flexDirection:'column',justifyContent:'flex-end'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'linear-gradient(180deg,#1e3d52,#162e3e)',borderRadius:'28px 28px 0 0',border:`1px solid ${section.color}25`,padding:'24px 20px 40px',maxHeight:'80vh',overflowY:'auto'}}>
        <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.20)',margin:'0 auto 20px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:16,background:`${section.color}18`,border:`1px solid ${section.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{section.icon}</div>
          <div>
            <div style={{fontSize:19,fontWeight:900,color:T.text,fontFamily:F}}>{section.title}</div>
            <div style={{fontSize:13,color:T.sub}}>{section.cases?.length||0} cases available</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {(section.cases||[]).map((c:any)=>(
            <div key={c.id} onClick={()=>{if(!c.free&&!isPro){setShowUpgrade(true);return}onCase(c.id);onClose()}} style={{background:T.glass,borderRadius:18,padding:'14px 16px',border:`1px solid ${c.color||section.color}25`,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:13,flexShrink:0,background:`${c.color||section.color}18`,border:`1px solid ${c.color||section.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{c.icon||'🏥'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:2}}>{c.title}</div>
                <div style={{fontSize:13,color:T.sub}}>{c.sub}</div>
              </div>
              {!c.free&&!isPro
                ?<span style={{fontSize:10,padding:'4px 10px',borderRadius:8,background:'rgba(255,149,0,0.15)',color:'#FF9500',fontWeight:800,border:'1px solid rgba(255,149,0,0.25)'}}>PRO</span>
                :<span style={{fontSize:20,color:T.muted}}>›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── FULL SCREEN MODAL WRAPPER ──
function FullModal({ onBack, title, children }: { onBack:()=>void, title:string, children:React.ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'linear-gradient(160deg,#1a2e3e,#142432,#101e2e)',overflowY:'auto'}}>
      <div style={{padding:'20px 16px 120px'}}>
        <button onClick={onBack} style={{background:T.glass,backdropFilter:'blur(16px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'9px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:20,fontFamily:F}}>← {title}</button>
        {children}
      </div>
    </div>
  )
}

export default function HubPage({ xp, streak, casesCompleted, mcqCorrect, isPro, criticalCases, sportsCases, pedsCases, setActiveCase, setShowUpgrade, setTab, setToolTab, onXP }: Props) {
  const [liveCount, setLiveCount]       = useState(1247)
  const [dailyCase, setDailyCase]       = useState<any>(null)
  const [openSection, setOpenSection]   = useState<any>(null)
  const [showLive, setShowLive]         = useState(false)
  const [showScribe, setShowScribe]     = useState(false)
  const [showAcademy, setShowAcademy]   = useState(false)
  const [waitlist, setWaitlist]         = useState<string[]>([])

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => Math.max(900, Math.min(1600, n + Math.floor(Math.random()*5)-2))), 3000)
    supabase.from('daily_cases').select('*').order('created_at',{ascending:false}).limit(1).single().then(({data})=>{if(data)setDailyCase(data)})
    return () => clearInterval(t)
  }, [])

  const h = new Date().getHours()
  const greet = h<12?'🌅 Good morning':h<17?'☀️ Good afternoon':h<21?'🌆 Good evening':'🌙 Night shift'

  const sections = [
    { key:'critical', icon:'🏥', title:'Critical Care',   sub:'ED · ICU · CCU · Neuro',   color:T.red,    cases:criticalCases },
    { key:'sports',   icon:'⚽', title:'Sports Medicine', sub:'FIFA 2026 · Pitch-side',   color:T.green,  cases:sportsCases, badge:'NEW' },
    { key:'peds',     icon:'🧸', title:'Pediatrics',      sub:'Febrile · Procedures',     color:T.purple, cases:pedsCases,   badge:'NEW' },
  ]

  // Quick tools horizontal scroll
  const quickTools = [
    { icon:'🗂️', label:'Memory',    color:T.teal,   action:()=>{ setTab('tools'); setToolTab('memory') } },
    { icon:'💊', label:'Rx AI',     color:T.green,  action:()=>{ setTab('tools'); setToolTab('rx') } },
    { icon:'🔬', label:'Explorer',  color:T.blue,   action:()=>{ setTab('tools'); setToolTab('explorer') } },
    { icon:'🫘', label:'Renal',     color:T.orange, action:()=>{ setTab('tools'); setToolTab('renal') } },
    { icon:'⚗️', label:'Drug Int',  color:T.red,    action:()=>{ setTab('tools'); setToolTab('drugcheck') } },
    { icon:'📊', label:'Scores',    color:T.purple, action:()=>{ setTab('tools'); setToolTab('riskcalc') } },
    { icon:'📋', label:'Logbook',   color:T.gold,   action:()=>{ setTab('tools'); setToolTab('logbook') } },
    { icon:'🧠', label:'MCQ',       color:T.blue,   action:()=>setTab('mcq') },
  ]

  // Full screen modals
  if (showScribe)  return <FullModal onBack={()=>setShowScribe(false)}  title="Back to Pulse"><AmbientScribe  onXP={onXP}/></FullModal>
  if (showAcademy) return <FullModal onBack={()=>setShowAcademy(false)} title="Back to Pulse"><PulseAcademy   onXP={onXP}/></FullModal>
  if (showLive)    return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.92)',backdropFilter:'blur(12px)'}}>
      <div style={{padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:T.text,fontWeight:800,fontSize:16,fontFamily:F}}>Live Case</span>
        <button onClick={()=>setShowLive(false)} style={{background:T.glass,border:'none',borderRadius:10,padding:'8px 14px',color:T.text,cursor:'pointer',fontFamily:F,fontSize:14}}>✕ Close</button>
      </div>
      <LiveCaseViewer specialty="Emergency Medicine" difficulty="Intermediate" onXP={onXP}/>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0f1e2e 0%,#0a1520 50%,#080f18 100%)',fontFamily:F,overflowX:'hidden',position:'relative'}}>

      <NeuralBg/>

      {/* Bioluminescence ambient glows */}
      <div style={{position:'fixed',top:-80,left:'50%',transform:'translateX(-50%)',width:600,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.06),transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(60px)'}}/>
      <div style={{position:'fixed',bottom:-100,right:-80,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,122,255,0.05),transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(60px)'}}/>

      <div style={{position:'relative',zIndex:1,padding:'16px 16px 130px'}}>

        {/* ── GREETING ── */}
        <div style={{marginBottom:14}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>CLINIVERSE AI</div>
              <div style={{fontSize:22,fontWeight:900,color:T.text,letterSpacing:-0.5,lineHeight:1.1}}>
                {greet}, <span style={{color:T.teal}}>Doctor</span>
              </div>
              <div style={{fontSize:12,color:T.sub,marginTop:4}}>
                Ready to train? <span style={{color:T.orange,fontWeight:700}}>{streak}-day streak 🔥</span>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,59,48,0.12)',border:'1px solid rgba(255,59,48,0.28)',borderRadius:20,padding:'5px 10px',flexShrink:0}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:T.red,animation:'bioPulse 1.5s ease-in-out infinite'}}/>
              <span style={{fontSize:10,fontWeight:800,color:T.red}}>LIVE</span>
            </div>
          </div>
        </div>

        {/* ── TICKER ── */}
        <LiveTicker xp={xp} streak={streak} liveCount={liveCount}/>

        {/* ── AMBIENT SCRIBE — HERO CTA ── */}
        <div onClick={()=>setShowScribe(true)} style={{
          background:'linear-gradient(135deg,rgba(0,196,180,0.10),rgba(0,122,255,0.07))',
          border:'1.5px solid rgba(0,196,180,0.35)',
          borderRadius:24,padding:'18px',marginBottom:16,cursor:'pointer',
          position:'relative',overflow:'hidden',
          animation:'bioGlow 3s ease-in-out infinite',
        }}>
          {/* Bio dots */}
          {[{x:'80%',y:'20%'},{x:'90%',y:'60%'},{x:'75%',y:'80%'}].map((d,i)=>(
            <div key={i} style={{position:'absolute',left:d.x,top:d.y,width:4,height:4,borderRadius:'50%',background:T.teal,opacity:0.4,animation:`neuralFloat ${2+i*0.4}s ease-in-out infinite`}}/>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:56,height:56,borderRadius:18,background:'rgba(0,196,180,0.15)',border:'1.5px solid rgba(0,196,180,0.40)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0,animation:'bioGlow 2s ease-in-out infinite'}}>
              🎙️
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>AMBIENT AI SCRIBE · 2026</div>
              <div style={{fontSize:16,fontWeight:900,color:T.text,marginBottom:3}}>Start Consultation</div>
              <div style={{fontSize:11,color:T.sub}}>Record → AI generates SOAP note · EN + AR</div>
            </div>
            <div style={{flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(0,196,180,0.15)',border:'1px solid rgba(0,196,180,0.35)',display:'flex',alignItems:'center',justifyContent:'center',color:T.teal,fontSize:18}}>›</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            {['2h/day saved','SOAP format','Arabic + English'].map(tag=>(
              <span key={tag} style={{fontSize:9,color:T.teal,background:'rgba(0,196,180,0.10)',border:'1px solid rgba(0,196,180,0.20)',borderRadius:20,padding:'3px 8px',fontWeight:600}}>{tag}</span>
            ))}
          </div>
        </div>

        {/* ── BENTO GRID ── */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CLINICAL DASHBOARD</div>
          <div style={{display:'flex',gap:10,marginBottom:10}}>

            {/* Case of the Day */}
            <div onClick={()=>setShowLive(true)} style={{flex:2,background:T.glass,backdropFilter:'blur(20px)',border:`1.5px solid ${T.red}28`,borderRadius:22,padding:'14px',cursor:'pointer',position:'relative',overflow:'hidden',minHeight:120}}>
              <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${T.red}20,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:8,right:10,fontSize:9,fontWeight:800,color:`${T.red}55`,letterSpacing:1}}>CASE OF DAY</div>
              <div style={{width:38,height:38,borderRadius:12,background:`${T.red}15`,border:`1px solid ${T.red}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:8}}>🏥</div>
              <div style={{fontSize:13,fontWeight:900,color:T.text,marginBottom:2,lineHeight:1.3}}>
                {dailyCase?.title||'Today\'s Case'}
              </div>
              <div style={{fontSize:10,color:T.sub}}>{dailyCase?.specialty||'AI Generated'}</div>
              <div style={{display:'flex',alignItems:'center',gap:4,marginTop:8}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:T.red,animation:'bioPulse 1.5s ease-in-out infinite'}}/>
                <span style={{fontSize:9,color:T.red,fontWeight:700}}>LIVE</span>
              </div>
            </div>

            {/* Right column */}
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:10}}>
              {/* PulseAcademy */}
              <div onClick={()=>setShowAcademy(true)} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',border:`1.5px solid ${T.purple}28`,borderRadius:18,padding:'12px 10px',cursor:'pointer'}}>
                <div style={{fontSize:20,marginBottom:4}}>🎙️</div>
                <div style={{fontSize:11,fontWeight:800,color:T.text}}>Academy</div>
                <div style={{fontSize:9,color:T.sub}}>AI Lectures</div>
              </div>
              {/* Streak */}
              <div style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',border:`1.5px solid ${T.orange}28`,borderRadius:18,padding:'12px 10px'}}>
                <div style={{fontSize:20,marginBottom:2}}>🔥</div>
                <div style={{fontSize:18,fontWeight:900,color:T.orange}}>{streak}</div>
                <div style={{fontSize:9,color:T.sub}}>Day Streak</div>
              </div>
            </div>
          </div>

          {/* Row 2 — XP + ECG + Labs */}
          <div style={{display:'flex',gap:10}}>
            {[
              {icon:'⚡',label:`${xp} XP`,  color:T.gold,   action:()=>setTab('leaderboard')},
              {icon:'📈',label:'ECG AI',    color:T.red,    action:()=>{setTab('tools');setToolTab('ecg')}},
              {icon:'🧪',label:'Labs',      color:T.purple, action:()=>{setTab('tools');setToolTab('lab')}},
            ].map(c=>(
              <div key={c.label} onClick={c.action} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',border:`1.5px solid ${c.color}22`,borderRadius:18,padding:'12px 8px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:4}}>
                <div style={{fontSize:22}}>{c.icon}</div>
                <div style={{fontSize:11,fontWeight:800,color:T.text}}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK TOOLS HORIZONTAL SCROLL ── */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>QUICK TOOLS</div>
          <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
            {quickTools.map((tool,i)=>(
              <div key={i} onClick={tool.action} style={{
                flexShrink:0,width:72,
                background:T.glass,backdropFilter:'blur(16px)',
                border:`1.5px solid ${tool.color}22`,borderRadius:18,
                padding:'12px 8px',cursor:'pointer',
                display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                position:'relative',overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:-10,right:-10,width:40,height:40,borderRadius:'50%',background:`radial-gradient(circle,${tool.color}15,transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{width:36,height:36,borderRadius:11,background:`${tool.color}15`,border:`1px solid ${tool.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{tool.icon}</div>
                <div style={{fontSize:9,fontWeight:700,color:T.sub,textAlign:'center',lineHeight:1.2}}>{tool.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LIVE CLINICAL FEED ── */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:T.red,animation:'bioPulse 1.5s ease-in-out infinite'}}/>
              <span style={{fontSize:11,fontWeight:800,color:T.text,letterSpacing:1}}>LIVE CLINICAL FEED</span>
            </div>
            <span style={{fontSize:11,color:T.teal,fontWeight:700}}>{liveCount.toLocaleString()} active</span>
          </div>
          <div style={{overflowX:'auto',display:'flex',gap:12,paddingBottom:4}}>
            {[
              {city:'Riyadh',tag:'CRITICAL',title:'52M — Anterior STEMI',sub:'Door-to-balloon: 67 min',color:T.red},
              {city:'Dubai', tag:'URGENT',  title:'67F — Acute HF',      sub:'BNP 4200 · BiPAP started',color:T.orange},
              {city:'London',tag:'CRITICAL',title:'19M — DKA',           sub:'pH 7.1 · Insulin infusion',color:T.red},
            ].map((c,i)=>(
              <div key={i} onClick={()=>setShowLive(true)} style={{minWidth:200,background:T.glass,backdropFilter:'blur(16px)',borderRadius:18,padding:'14px',border:`1px solid ${c.color}22`,cursor:'pointer',flexShrink:0}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:10,color:T.muted,fontWeight:600}}>{c.city}</span>
                  <span style={{fontSize:9,fontWeight:800,color:c.color,background:`${c.color}15`,padding:'2px 8px',borderRadius:6}}>{c.tag}</span>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:4}}>{c.title}</div>
                <div style={{fontSize:11,color:T.sub,marginBottom:10}}>{c.sub}</div>
                <div style={{display:'flex',gap:6}}>
                  {['Labs','ECG','Echo'].map((t,j)=>(
                    <span key={j} style={{fontSize:10,fontWeight:700,color:T.teal,background:'rgba(0,196,180,0.10)',padding:'3px 8px',borderRadius:6,border:`1px solid ${T.teal}25`}}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CASE LIBRARY ── */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CASE LIBRARY</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {sections.map((s,i)=>(
              <div key={i} onClick={()=>setOpenSection(s)} style={{background:T.glass,backdropFilter:'blur(16px)',border:`1px solid ${s.color}20`,borderRadius:18,padding:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,right:0,width:60,height:60,borderRadius:'50%',background:`radial-gradient(circle,${s.color}08,transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{width:46,height:46,borderRadius:14,background:`${s.color}15`,border:`1px solid ${s.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:14,fontWeight:800,color:T.text}}>{s.title}</span>
                    {s.badge&&<span style={{fontSize:9,fontWeight:800,color:s.color,background:`${s.color}15`,padding:'2px 7px',borderRadius:6}}>{s.badge}</span>}
                  </div>
                  <div style={{fontSize:12,color:T.sub}}>{s.sub}</div>
                </div>
                <span style={{fontSize:20,color:T.muted}}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DISCOVER MORE ── */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <div style={{height:1,flex:1,background:'linear-gradient(90deg,transparent,rgba(0,196,180,0.30),transparent)'}}/>
            <span style={{fontSize:9,color:T.teal,fontWeight:700,letterSpacing:2}}>DISCOVER MORE</span>
            <div style={{height:1,flex:1,background:'linear-gradient(90deg,transparent,rgba(0,196,180,0.30),transparent)'}}/>
          </div>

          {[
            {id:'reports',icon:'📋',title:'Medical Reports AI',sub:'Generate reports in seconds',desc:'Discharge · Referral · Operative note · Handover AI',color:T.teal,live:false,count:847,stats:[{l:'Report types',v:'12+'},{l:'Languages',v:'EN·AR'},{l:'Time saved',v:'40 min'}]},
            {id:'nit',icon:'🔬',title:'Non-Invasive Tech',sub:'AI-powered diagnostics',desc:'ECG AI · Retinal scan · Skin lesion · Waveform analysis',color:T.purple,live:false,count:1203,stats:[{l:'Tools',v:'8+'},{l:'Accuracy',v:'94%'},{l:'FDA cleared',v:'3'}]},
          ].map((card,i)=>(
            <div key={card.id} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1.5px solid ${card.color}20`,borderRadius:24,padding:'18px',marginBottom:12,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${card.color}10,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:46,height:46,borderRadius:14,background:`${card.color}15`,border:`1.5px solid ${card.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{card.icon}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:900,color:T.text,marginBottom:2}}>{card.title}</div>
                    <div style={{fontSize:10,color:T.sub}}>{card.sub}</div>
                  </div>
                </div>
                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:20,padding:'4px 10px'}}>
                  <span style={{fontSize:9,fontWeight:800,color:T.muted,letterSpacing:0.5}}>COMING SOON</span>
                </div>
              </div>
              <div style={{fontSize:11,color:T.sub,lineHeight:1.6,marginBottom:12}}>{card.desc}</div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                {card.stats.map(s=>(
                  <div key={s.l} style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'6px 5px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <div style={{fontSize:12,fontWeight:900,color:card.color}}>{s.v}</div>
                    <div style={{fontSize:8,color:T.muted,marginTop:2,fontWeight:600}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={e=>{e.stopPropagation();if(!waitlist.includes(card.id))setWaitlist(w=>[...w,card.id])}} style={{
                width:'100%',background:waitlist.includes(card.id)?`${card.color}15`:T.glass2,
                backdropFilter:'blur(16px)',border:`1.5px solid ${card.color}${waitlist.includes(card.id)?'40':'20'}`,
                borderRadius:14,padding:'11px 16px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                cursor:'pointer',fontFamily:F,transition:'all 0.2s',
              }}>
                <span style={{fontSize:13}}>{waitlist.includes(card.id)?'✓':'🔔'}</span>
                <span style={{fontSize:12,fontWeight:800,color:waitlist.includes(card.id)?card.color:T.text}}>
                  {waitlist.includes(card.id)?"You're on the waitlist!":`Join Waitlist · ${(card.count||0).toLocaleString()} waiting`}
                </span>
              </button>
            </div>
          ))}
        </div>

      </div>

      {openSection && (
        <SectionModal section={openSection} onClose={()=>setOpenSection(null)} onCase={setActiveCase} isPro={isPro} setShowUpgrade={setShowUpgrade}/>
      )}

      <style>{BIO_CSS}</style>
    </div>
  )
}
