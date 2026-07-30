'use client'
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// ── Dynamic imports for all tools ──
const CodeBlue        = dynamic(() => import('./CodeBlue'),           { ssr:false })
const RapidFire       = dynamic(() => import('./RapidFire'),          { ssr:false })
const BLSACLSModule   = dynamic(() => import('./BLSACLSModule'),      { ssr:false })
const OnCallSystem    = dynamic(() => import('./OnCallSystem'),       { ssr:false })
const NightShift      = dynamic(() => import('./NightShiftSurvival'), { ssr:false })
const EcgChallenge    = dynamic(() => import('./EcgChallenge'),       { ssr:false })
const CardiacSurgeryAI= dynamic(() => import('./CardiacSurgeryAI'),   { ssr:false })
const NeuroSurgeryAI  = dynamic(() => import('./NeuroSurgeryAI'),     { ssr:false })
const ClinicalNexus   = dynamic(() => import('./ClinicalNexus'),      { ssr:false })
const GeneralSurgeryAI= dynamic(() => import('./GeneralSurgeryAI'),   { ssr:false })
const PharmacyModule  = dynamic(() => import('./PharmacyModule'),     { ssr:false })
const NursingModule   = dynamic(() => import('./NursingModule'),      { ssr:false })
const LabModule       = dynamic(() => import('./LabModule'),          { ssr:false })
const RadiologyModule = dynamic(() => import('./RadiologyModule'),    { ssr:false })
const AICaseGenerator = dynamic(() => import('./AICaseGenerator'),    { ssr:false })
const DrugInteractionAI=dynamic(() => import('./DrugInteractionAI'), { ssr:false })
const PocketConsultant= dynamic(() => import('./PocketConsultant'),   { ssr:false })
const ShiftHandoverAI = dynamic(() => import('./ShiftHandoverAI'),    { ssr:false })
const ClinicalWorkshop= dynamic(() => import('./ClinicalWorkshop'),   { ssr:false })
const TeleconsultModule=dynamic(() => import('./TeleconsultModule'),  { ssr:false })
const MedCalculators  = dynamic(() => import('./MedCalculators'),     { ssr:false })
const Guidelines      = dynamic(() => import('./Guidelines'),         { ssr:false })
const ClinicalDuels   = dynamic(() => import('./ClinicalDuels'),      { ssr:false })
const GrandRoundsAI   = dynamic(() => import('./GrandRoundsAI'),      { ssr:false })
const ClinicalToolkit = dynamic(() => import('./ClinicalToolkit'),  { ssr:false })
const RenalDosingAI   = dynamic(() => import('./RenalDosingAI'),    { ssr:false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  bg:     '#2a5068',
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

// ── SECTIONS DATA (Critical Care removed — lives in HUB) ──
const SECTIONS = [
  {
    id:'emergency', icon:'🚨', label:'Emergency & Critical',
    sub:'Code Blue · BLS/ACLS · Rapid Fire · On-Call',
    color:'#FF3B30', count:'5 tools',
    tools:[
      { id:'codeblue',   icon:'🔴', label:'Code Blue',   desc:'Resuscitation protocols',   color:'#FF3B30' },
      { id:'rapid',      icon:'⚡', label:'Rapid Fire',   desc:'Quick-fire clinical cases', color:'#FFB300' },
      { id:'bls',        icon:'💊', label:'BLS / ACLS',  desc:'Life support algorithms',   color:'#FF3B30' },
      { id:'oncall',     icon:'📞', label:'On-Call',     desc:'Night shift call system',   color:'#00C4B4' },
      { id:'nightshift', icon:'🌙', label:'Night Shift', desc:'Survival mode · Triage',    color:'#007AFF' },
    ]
  },
  {
    id:'cardiac', icon:'🫀', label:'Cardiac & Neuro',
    sub:'ECG · Cardiac Surgery · Neuro AI · Clinical Nexus',
    color:'#007AFF', count:'4 tools',
    tools:[
      { id:'ecg',     icon:'📈', label:'ECG Challenge',    desc:'Interpret real ECGs',       color:'#007AFF' },
      { id:'cardiac', icon:'🫀', label:'Cardiac Surgery',  desc:'CABG · Valve · LVAD',       color:'#FF3B30' },
      { id:'neuro',   icon:'🧠', label:'Neuro Surgery AI', desc:'Craniotomy · Spine',        color:'#00C4B4' },
      { id:'nexus',   icon:'🔗', label:'Clinical Nexus',   desc:'AI clinical reasoning',     color:'#007AFF' },
    ]
  },
  {
    id:'surgical', icon:'🔪', label:'Surgical AI',
    sub:'General · Cardiac · Neuro Surgery',
    color:'#5856D6', count:'3 tools',
    tools:[
      { id:'general', icon:'🔪', label:'General Surgery', desc:'Appendix · Cholecyst · Hernia', color:'#5856D6' },
      { id:'cardiac', icon:'🫀', label:'Cardiac Surgery', desc:'CABG · Valve · LVAD',           color:'#FF3B30' },
      { id:'neuro',   icon:'🧠', label:'Neuro Surgery',   desc:'Craniotomy · Spine',            color:'#00C4B4' },
    ]
  },
  {
    id:'specialties', icon:'🎓', label:'Specialties',
    sub:'Pharmacy · Nursing · Lab · Radiology',
    color:'#34C759', count:'4 tools',
    tools:[
      { id:'pharmacy',  icon:'💊', label:'Pharmacy AI',  desc:'Drug interactions · Dosing',  color:'#34C759' },
      { id:'nursing',   icon:'🩺', label:'Nursing',      desc:'Vitals · NEWS2 · Skills',     color:'#64D2FF' },
      { id:'lab',       icon:'🔬', label:'Laboratory',   desc:'5 panels · Critical values',  color:'#00C4B4' },
      { id:'radiology', icon:'🩻', label:'Radiology',    desc:'CXR · CT patterns · Echo',    color:'#FFB300' },
    ]
  },
  {
    id:'ai', icon:'🤖', label:'AI Clinical Tools',
    sub:'Pocket Consultant · Drug Checker · Handover AI',
    color:'#00C4B4', count:'5 tools',
    tools:[
      { id:'consultant',  icon:'🤖', label:'Pocket Consultant',  desc:'AI clinical decision support', color:'#00C4B4' },
      { id:'drug',        icon:'⚗️', label:'Drug Interaction AI', desc:'Check drug combinations',      color:'#FF9500' },
      { id:'handover',    icon:'📋', label:'Shift Handover AI',   desc:'SBAR in 30 seconds',           color:'#34C759' },
      { id:'workshop',    icon:'🛠️', label:'Clinical Workshop',   desc:'Discharge · Portfolio · Notes', color:'#007AFF' },
      { id:'toolkit',     icon:'🏥', label:'Clinical Toolkit', desc:'Drug dosing · Renal · 7 Clinical Scores', color:'#00C4B4' },
      { id:'calculator',  icon:'🧮', label:'Med Calculators',    desc:'GFR · CHADS · Wells · SOFA',   color:'#AF52DE' },
    ]
  },
  {
    id:'reference', icon:'📚', label:'Clinical Reference',
    sub:'Guidelines · Labs · Medications · Calculators',
    color:'#D4A847', count:'3 tools',
    tools:[
      { id:'guidelines',  icon:'📖', label:'Guidelines',      desc:'AHA · ESC · NICE · SRCP',     color:'#D4A847' },
      { id:'duels',       icon:'👥', label:'Clinical Duels',  desc:'Challenge a colleague',        color:'#FF9500' },
      { id:'rounds',      icon:'🏆', label:'Grand Rounds AI', desc:'Real cases · Expert panel',   color:'#FF3B30' },
    ]
  },
]

// ── TOOL RENDERER ──
function ToolRenderer({ toolId, onXP }: { toolId:string, onXP:(n:number)=>void }) {
  const map: Record<string, React.ReactNode> = {
    codeblue:   <CodeBlue onXP={onXP}/>,
    rapid:      <RapidFire onXP={onXP}/>,
    bls:        <BLSACLSModule onXP={onXP}/>,
    oncall:     <OnCallSystem onXP={onXP}/>,
    nightshift: <NightShift onXP={onXP}/>,
    ecg:        <EcgChallenge onXP={onXP}/>,
    cardiac:    <CardiacSurgeryAI onXP={onXP}/>,
    neuro:      <NeuroSurgeryAI onXP={onXP}/>,
    nexus:      <ClinicalNexus onXP={onXP}/>,
    general:    <GeneralSurgeryAI onXP={onXP}/>,
    pharmacy:   <PharmacyModule onXP={onXP}/>,
    nursing:    <NursingModule onXP={onXP}/>,
    lab:        <LabModule onXP={onXP}/>,
    radiology:  <RadiologyModule onXP={onXP}/>,
    consultant: <PocketConsultant onXP={onXP}/>,
    drug:       <DrugInteractionAI onXP={onXP}/>,
    handover:   <ShiftHandoverAI onXP={onXP}/>,
    codeblue:   <CodeBlue onXP={onXP}/>,
    rapid:      <RapidFire onXP={onXP}/>,
    bls:        <BLSACLSModule onXP={onXP}/>,
    oncall:     <OnCallSystem onXP={onXP}/>,
    nightshift: <NightShift onXP={onXP}/>,
    ecg:        <EcgChallenge onXP={onXP}/>,
    cardiac:    <CardiacSurgeryAI onXP={onXP}/>,
    neuro:      <NeuroSurgeryAI onXP={onXP}/>,
    nexus:      <ClinicalNexus onXP={onXP}/>,
    general:    <GeneralSurgeryAI onXP={onXP}/>,
    pharmacy:   <PharmacyModule onXP={onXP}/>,
    nursing:    <NursingModule onXP={onXP}/>,
    lab:        <LabModule onXP={onXP}/>,
    radiology:  <RadiologyModule onXP={onXP}/>,
    drug:       <DrugInteractionAI onXP={onXP}/>,
    handover:   <ShiftHandoverAI onXP={onXP}/>,
    workshop:   <ClinicalWorkshop onXP={onXP}/>,
    calculator: <MedCalculators onXP={onXP}/>,
    guidelines: <Guidelines onXP={onXP}/>,
    duels:      <ClinicalDuels onXP={onXP}/>,
    rounds:     <GrandRoundsAI onXP={onXP}/>,
    teleconsult:  <TeleconsultModule   onXP={onXP}/>,
    noninvasive:  <NonInvasiveTech     onXP={onXP}/>,
    consultant:   <PocketConsultant    onXP={onXP}/>,
    critical:     <CriticalCareModule  onXP={onXP}/>,
    peds:         <PediatricsModule    onXP={onXP}/>,
    sports:       <SportsMedicineModule onXP={onXP}/>,
    ai:         <AICaseGenerator onXP={onXP}/>,
  }
  return <>{map[toolId] || <div style={{color:T.text,padding:20,fontFamily:F}}>Tool coming soon...</div>}</>
}

// ── CINEMATIC SECTION CARD ──
function CinematicCard({ section, index, onClick }: { section:typeof SECTIONS[0], index:number, onClick:()=>void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} onClick={onClick} style={{
      background: T.glass,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1.5px solid ${section.color}30`,
      borderRadius: 24,
      padding: '20px',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 12,
      boxShadow: `0 8px 32px rgba(0,0,0,0.20), 0 0 16px ${section.color}14`,
      // Cinematic entrance animation
      opacity: visible ? 1 : 0,
      transform: visible
        ? 'translateY(0) scale(1)'
        : `translateY(${40 + index * 8}px) scale(0.96)`,
      transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
    }}>
      {/* Ambient glow */}
      <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:`radial-gradient(circle,${section.color}14,transparent 70%)`, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-40, left:-20, width:140, height:140, borderRadius:'50%', background:`radial-gradient(circle,${section.color}08,transparent 70%)`, pointerEvents:'none' }}/>

      {/* Logo watermark */}
      <div style={{ position:'absolute', bottom:10, right:12, opacity:0.05, pointerEvents:'none' }}>
        <svg width="55" height="55" viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="90" height="90" rx="23" stroke="white" strokeWidth="2"/>
          <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M36 50L46 63L70 36" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:52, height:52, borderRadius:16, flexShrink:0,
            background:`${section.color}18`,
            border:`1.5px solid ${section.color}40`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26,
            boxShadow:`0 0 20px ${section.color}30`,
          }}>{section.icon}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:T.text, marginBottom:2 }}>{section.label}</div>
            <div style={{ fontSize:11, color:T.sub }}>{section.sub}</div>
          </div>
        </div>
        <div style={{ background:`${section.color}18`, border:`1px solid ${section.color}35`, borderRadius:12, padding:'6px 12px', fontSize:11, color:section.color, fontWeight:700, flexShrink:0 }}>
          {section.count}
        </div>
      </div>

      {/* Tool pills preview */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {section.tools.slice(0,4).map((t,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:20, padding:'4px 10px' }}>
            <span style={{ fontSize:12 }}>{t.icon}</span>
            <span style={{ fontSize:10, color:T.sub, fontWeight:600 }}>{t.label}</span>
          </div>
        ))}
        {section.tools.length > 4 && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'4px 10px' }}>
            <span style={{ fontSize:10, color:T.muted }}>+{section.tools.length-4} more</span>
          </div>
        )}
      </div>

      {/* Open button */}
      <div style={{
        background:`linear-gradient(135deg,${section.color}22,${section.color}0A)`,
        border:`1px solid ${section.color}35`,
        borderRadius:14, padding:'10px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <span style={{ fontSize:13, fontWeight:700, color:T.text }}>Open {section.label}</span>
        <span style={{ fontSize:16, color:section.color }}>›</span>
      </div>
    </div>
  )
}

// ── SECTION DETAIL VIEW ──
function SectionDetail({ section, onBack, onTool }: { section:typeof SECTIONS[0], onBack:()=>void, onTool:(id:string)=>void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(30px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {/* Back button */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{
          background: T.glass, backdropFilter:'blur(20px)',
          border:`1px solid ${T.border}`, borderRadius:14,
          padding:'9px 16px', color:T.text, fontSize:13,
          fontWeight:700, cursor:'pointer', fontFamily:F,
          display:'flex', alignItems:'center', gap:6,
        }}>
          ← Back
        </button>
        <div>
          <div style={{ fontSize:17, fontWeight:900, color:T.text }}>{section.icon} {section.label}</div>
          <div style={{ fontSize:11, color:T.sub }}>{section.tools.length} tools available</div>
        </div>
      </div>

      {/* Tools list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {section.tools.map((tool, i) => (
          <div key={tool.id} onClick={() => onTool(tool.id)} style={{
            display:'flex', alignItems:'center', gap:14,
            background: T.glass, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            borderRadius:20, padding:'16px 18px',
            border:`1px solid ${tool.color}22`, cursor:'pointer',
            boxShadow:`0 4px 20px ${tool.color}10`,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition:`opacity 0.3s ease ${i*0.06}s, transform 0.3s ease ${i*0.06}s`,
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle,${tool.color}12,transparent 70%)`, pointerEvents:'none' }}/>
            <div style={{ width:50, height:50, borderRadius:16, flexShrink:0, background:`${tool.color}15`, border:`1px solid ${tool.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:`0 0 14px ${tool.color}25` }}>{tool.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:800, color:T.text, marginBottom:3 }}>{tool.label}</div>
              <div style={{ fontSize:12, color:T.sub }}>{tool.desc}</div>
            </div>
            <div style={{ background:`${tool.color}15`, border:`1px solid ${tool.color}28`, borderRadius:12, padding:'7px 14px', fontSize:12, color:tool.color, fontWeight:700, flexShrink:0 }}>
              Open →
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function ToolsPage({ onXP }: { onXP: (n:number) => void }) {
  const [view, setView] = useState<'list'|'section'|'tool'>('list')
  const [activeSection, setActiveSection] = useState<typeof SECTIONS[0]|null>(null)
  const [activeTool, setActiveTool] = useState<string>('')

  const openSection = (s: typeof SECTIONS[0]) => {
    setActiveSection(s)
    setView('section')
  }

  const openTool = (id: string) => {
    setActiveTool(id)
    setView('tool')
  }

  const goBack = () => {
    if (view === 'tool') setView('section')
    else { setView('list'); setActiveSection(null) }
  }

  // ── TOOL VIEW ──
  if (view === 'tool') return (
    <div style={{ fontFamily:F, paddingBottom:8 }}>
      <button onClick={goBack} style={{
        background:T.glass, backdropFilter:'blur(20px)',
        border:`1px solid ${T.border}`, borderRadius:14,
        padding:'9px 16px', color:T.text, fontSize:13,
        fontWeight:700, cursor:'pointer', fontFamily:F, marginBottom:16,
        display:'flex', alignItems:'center', gap:6,
      }}>← Back</button>
      <ToolRenderer toolId={activeTool} onXP={onXP}/>
    </div>
  )

  // ── SECTION VIEW ──
  if (view === 'section' && activeSection) return (
    <SectionDetail section={activeSection} onBack={goBack} onTool={openTool}/>
  )

  // ── LIST VIEW (Cinematic Scroll) ──
  return (
    <div style={{ fontFamily:F, position:'relative' }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, color:`${T.teal}CC`, fontWeight:700, letterSpacing:1.5, marginBottom:4 }}>CLINICAL TOOLS</div>
        <div style={{ fontSize:22, fontWeight:900, color:T.text, letterSpacing:-0.5, lineHeight:1.1 }}>
          <span style={{ color:T.text }}>Clinical</span>{' '}
          <span style={{ color:T.teal }}>Tools</span>
        </div>
        <div style={{ fontSize:12, color:T.sub, marginTop:4 }}>
          6 categories · 24+ tools
        </div>
      </div>

      {/* Search bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        background:T.glass, backdropFilter:'blur(20px)',
        border:`1px solid ${T.border}`, borderRadius:16,
        padding:'11px 16px', marginBottom:20,
      }}>
        <span style={{ fontSize:16, opacity:0.5 }}>🔍</span>
        <span style={{ fontSize:13, color:T.muted, fontWeight:500 }}>Search tools...</span>
      </div>

      {/* Cinematic section cards */}
      {SECTIONS.map((section, i) => (
        <CinematicCard
          key={section.id}
          section={section}
          index={i}
          onClick={() => openSection(section)}
        />
      ))}

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
