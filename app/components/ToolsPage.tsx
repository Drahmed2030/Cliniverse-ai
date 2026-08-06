'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { L } from '../lib/tokens'

const CodeBlue         = dynamic(() => import('./CodeBlue'),         { ssr:false })
const EcgChallenge     = dynamic(() => import('./EcgChallenge'),     { ssr:false })
const BLSACLSModule    = dynamic(() => import('./BLSACLSModule'),    { ssr:false })
const OnCallSystem     = dynamic(() => import('./OnCallSystem'),     { ssr:false })
const NightShiftSurvival = dynamic(() => import('./NightShiftSurvival'), { ssr:false })
const MedCalculators   = dynamic(() => import('./MedCalculators'),   { ssr:false })
const PharmacyModule   = dynamic(() => import('./PharmacyModule'),   { ssr:false })
const NursingModule    = dynamic(() => import('./NursingModule'),    { ssr:false })
const LabModule        = dynamic(() => import('./LabModule'),        { ssr:false })
const RadiologyModule  = dynamic(() => import('./RadiologyModule'),  { ssr:false })
const AICaseGenerator  = dynamic(() => import('./AICaseGenerator'),  { ssr:false })
const ClinicalDuels    = dynamic(() => import('./ClinicalDuels'),    { ssr:false })
const DiagnosticDetective = dynamic(() => import('./DiagnosticDetective'), { ssr:false })
const ErrorAutopsy     = dynamic(() => import('./ErrorAutopsy'),     { ssr:false })
const HealthInsights   = dynamic(() => import('./HealthInsights'),   { ssr:false })
const BoardExam        = dynamic(() => import('./BoardExam'),        { ssr:false })

// Unsplash images per section
const IMGS = {
  clinical: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
  reference:'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
  gaming:   'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
}

const SECTIONS = {
  clinical: {
    label:'🔬 Clinical Tools',
    color:'#EF4444',
    img: IMGS.clinical,
    desc:'Emergency protocols · Procedures · Simulation',
    categories: [
      {
        id:'emergency', icon:'🚨', label:'Emergency & Critical',
        sub:'Code Blue · BLS/ACLS · Rapid Fire', color:'#EF4444', count:5,
        tools:[
          {id:'codeblue',  icon:'🔴', label:'Code Blue',    sub:'Resuscitation protocols',     color:'#EF4444'},
          {id:'blsacls',   icon:'💊', label:'BLS / ACLS',   sub:'Life support algorithms',     color:'#EF4444'},
          {id:'oncall',    icon:'📞', label:'On-Call',      sub:'Night shift call system',     color:'#7C3AED'},
          {id:'nightshift',icon:'🌙', label:'Night Shift',  sub:'Survival mode · Triage',      color:'#7C3AED'},
          {id:'rapidfire', icon:'⚡', label:'Rapid Fire',   sub:'Quick-fire clinical cases',   color:'#F59E0B'},
        ]
      },
      {
        id:'cardiac', icon:'🫀', label:'Cardiac & Neuro',
        sub:'ECG · Surgery · AI Reasoning', color:'#EF4444', count:4,
        tools:[
          {id:'ecg',    icon:'📈', label:'ECG Challenge',    sub:'Interpret real ECGs',        color:'#EF4444'},
          {id:'calc',   icon:'🧮', label:'Med Calculators',  sub:'GFR · BMI · Scores',         color:'#3B82F6'},
        ]
      },
      {
        id:'specialties', icon:'🎓', label:'Specialties',
        sub:'Pharmacy · Nursing · Lab · Radiology', color:'#10B981', count:4,
        tools:[
          {id:'pharmacy', icon:'💊', label:'Pharmacy',    sub:'Drug interactions · Dosing',   color:'#10B981'},
          {id:'nursing',  icon:'🩺', label:'Nursing',     sub:'Vitals · NEWS2 · Skills',      color:'#3B82F6'},
          {id:'lab',      icon:'🧪', label:'Laboratory',  sub:'5 panels · Critical values',   color:'#7C3AED'},
          {id:'radiology',icon:'🩻', label:'Radiology',   sub:'CXR · CT patterns · Echo',     color:'#F59E0B'},
        ]
      },
    ]
  },
  reference: {
    label:'📚 References',
    color:'#3B82F6',
    img: IMGS.reference,
    desc:'Guidelines 2026 · Drug database · Calculators',
    categories: [
      {
        id:'ref_main', icon:'📋', label:'Clinical Reference',
        sub:'Guidelines · Labs · Medications · Calculators', color:'#3B82F6', count:5,
        tools:[
          {id:'calc',     icon:'🧮', label:'Calculators',  sub:'GFR · BMI · Clinical scores', color:'#3B82F6'},
          {id:'pharmacy', icon:'💊', label:'Medications',  sub:'Drug database · Doses',        color:'#10B981'},
          {id:'lab',      icon:'🧪', label:'Lab Reference',sub:'Normal ranges · Critical',     color:'#7C3AED'},
          {id:'board',    icon:'📖', label:'Board Exam',   sub:'USMLE · MRCP · Saudi Boards',  color:'#F59E0B'},
          {id:'insights', icon:'📊', label:'Health Stats', sub:'Your clinical progress',       color:'#EF4444'},
        ]
      },
    ]
  },
  gaming: {
    label:'🎮 Gaming & AI',
    color:'#7C3AED',
    img: IMGS.gaming,
    desc:'Clinical duels · AI cases · Mystery diagnosis',
    categories: [
      {
        id:'gaming_main', icon:'🎮', label:'AI & Gaming',
        sub:'Duels · Detective · AI Generator', color:'#7C3AED', count:5,
        tools:[
          {id:'aicasegen',  icon:'🤖', label:'AI Case Generator', sub:'Unlimited AI cases',         color:'#0D9488'},
          {id:'duels',      icon:'⚔️', label:'Clinical Duels',    sub:'Race against time',           color:'#EF4444'},
          {id:'detective',  icon:'🔍', label:'Diagnostic Detective',sub:'Mystery cases',             color:'#7C3AED'},
          {id:'autopsy',    icon:'⚠️', label:'Error Autopsy',     sub:'Learn from medical errors',   color:'#F59E0B'},
          {id:'insights',   icon:'📊', label:'Health Insights',   sub:'Your stats & progress',       color:'#3B82F6'},
        ]
      },
    ]
  },
}

const TOOL_COMPONENTS: Record<string,any> = {
  codeblue:  CodeBlue,
  ecg:       EcgChallenge,
  calc:      MedCalculators,
  blsacls:   BLSACLSModule,
  oncall:    OnCallSystem,
  nightshift:NightShiftSurvival,
  pharmacy:  PharmacyModule,
  nursing:   NursingModule,
  lab:       LabModule,
  radiology: RadiologyModule,
  aicasegen: AICaseGenerator,
  duels:     ClinicalDuels,
  detective: DiagnosticDetective,
  autopsy:   ErrorAutopsy,
  insights:  HealthInsights,
  board:     BoardExam,
  rapidfire: CodeBlue,
}

interface Props { onXP: (n:number) => void }

export default function ToolsPage({ onXP }: Props) {
  const [activeSection, setActiveSection] = useState<string|null>(null)
  const [activeCat,     setActiveCat]     = useState<string|null>(null)
  const [activeTool,    setActiveTool]    = useState<string|null>(null)

  // Tool view
  if (activeTool) {
    const Comp = TOOL_COMPONENTS[activeTool]
    return (
      <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>
        <div style={{
          padding:'16px 16px 12px',
          background:L.surface,
          borderBottom:`1px solid ${L.border}`,
          display:'flex',alignItems:'center',gap:12,
        }}>
          <button onClick={()=>setActiveTool(null)} style={{
            background:L.raised,border:`1px solid ${L.border}`,
            borderRadius:20,padding:'8px 16px',
            fontSize:13,fontWeight:700,color:L.text,cursor:'pointer',
          }}>← Back</button>
        </div>
        {Comp ? <Comp onXP={onXP}/> : <div style={{padding:20,color:L.textMuted}}>Coming soon...</div>}
      </div>
    )
  }

  // Category view
  if (activeCat && activeSection) {
    const sec = SECTIONS[activeSection as keyof typeof SECTIONS]
    const cat = sec.categories.find(c=>c.id===activeCat)
    if (!cat) { setActiveCat(null); return null }
    return (
      <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>
        {/* Hero */}
        <div style={{
          height:120,
          backgroundImage:`url(${sec.img})`,
          backgroundSize:'cover',backgroundPosition:'center',
          position:'relative',
        }}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(248,250,252,0.20) 0%,rgba(248,250,252,0.96) 100%)'}}/>
          <button onClick={()=>setActiveCat(null)} style={{
            position:'absolute',top:16,left:16,
            background:'rgba(255,255,255,0.90)',backdropFilter:'blur(12px)',
            border:`1px solid ${L.border}`,borderRadius:20,
            padding:'8px 16px',fontSize:13,fontWeight:700,color:L.text,cursor:'pointer',
          }}>← Back</button>
        </div>

        <div style={{padding:'16px 16px 160px'}}>
          {/* Header */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:cat.color,fontWeight:700,letterSpacing:2,marginBottom:4}}>
              {cat.icon} {cat.label.toUpperCase()}
            </div>
            <div style={{fontSize:13,color:L.textMuted}}>{cat.count} tools available</div>
          </div>

          {/* Tools list */}
          {cat.tools.map(t=>(
            <div key={t.id} onClick={()=>setActiveTool(t.id)} style={{
              background:L.surface,
              border:`1px solid ${L.border}`,
              borderLeft:`4px solid ${t.color}`,
              borderRadius:18,padding:'14px 16px',marginBottom:10,
              cursor:'pointer',display:'flex',alignItems:'center',gap:14,
              boxShadow:L.shadowSm,
              transition:'all 0.2s',
            }}
            onTouchStart={e=>(e.currentTarget.style.transform='scale(0.98)')}
            onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
            >
              <div style={{
                width:52,height:52,borderRadius:16,flexShrink:0,
                background:`${t.color}10`,border:`1px solid ${t.color}20`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
              }}>{t.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:L.text}}>{t.label}</div>
                <div style={{fontSize:12,color:L.textSub,marginTop:2}}>{t.sub}</div>
              </div>
              <div style={{
                background:t.color,borderRadius:20,
                padding:'6px 14px',fontSize:12,fontWeight:700,color:'white',
              }}>Open →</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Section view
  if (activeSection) {
    const sec = SECTIONS[activeSection as keyof typeof SECTIONS]
    return (
      <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>
        {/* Hero */}
        <div style={{
          height:160,
          backgroundImage:`url(${sec.img})`,
          backgroundSize:'cover',backgroundPosition:'center',
          position:'relative',marginBottom:0,
        }}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(248,250,252,0.10) 0%,rgba(248,250,252,0.96) 100%)'}}/>
          <button onClick={()=>setActiveSection(null)} style={{
            position:'absolute',top:16,left:16,
            background:'rgba(255,255,255,0.90)',backdropFilter:'blur(12px)',
            border:`1px solid ${L.border}`,borderRadius:20,
            padding:'8px 16px',fontSize:13,fontWeight:700,color:L.text,cursor:'pointer',
          }}>← Back</button>
          <div style={{position:'absolute',bottom:20,left:16}}>
            <div style={{fontSize:22,fontWeight:900,color:L.text}}>{sec.label}</div>
            <div style={{fontSize:12,color:L.textSub}}>{sec.desc}</div>
          </div>
        </div>

        <div style={{padding:'20px 16px 160px'}}>
          {sec.categories.map(cat=>(
            <div key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
              background:L.surface,
              border:`1px solid ${L.border}`,
              borderLeft:`4px solid ${cat.color}`,
              borderRadius:20,padding:'16px',marginBottom:12,
              cursor:'pointer',display:'flex',alignItems:'center',gap:14,
              boxShadow:L.shadowSm,
            }}
            onTouchStart={e=>(e.currentTarget.style.transform='scale(0.98)')}
            onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
            >
              <div style={{
                width:56,height:56,borderRadius:18,flexShrink:0,
                background:`${cat.color}10`,border:`1px solid ${cat.color}20`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
              }}>{cat.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:L.text}}>{cat.label}</div>
                <div style={{fontSize:12,color:L.textSub,marginTop:2}}>{cat.sub}</div>
                <div style={{
                  display:'inline-block',marginTop:6,
                  fontSize:10,fontWeight:700,color:cat.color,
                  background:`${cat.color}10`,border:`1px solid ${cat.color}20`,
                  borderRadius:8,padding:'2px 8px',
                }}>{cat.count} tools</div>
              </div>
              <span style={{color:L.textMuted,fontSize:20}}>›</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Main view — 3 sections
  return (
    <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>

      {/* Header */}
      <div style={{padding:'20px 16px 16px'}}>
        <div style={{fontSize:11,color:L.teal,fontWeight:700,letterSpacing:2,marginBottom:4}}>CLINIVERSE AI</div>
        <div style={{fontSize:28,fontWeight:900,color:L.text,letterSpacing:-0.5,marginBottom:4}}>
          Clinical <span style={{color:L.teal}}>Tools</span>
        </div>
        <div style={{fontSize:13,color:L.textSub}}>3 sections · 24+ professional tools</div>
      </div>

      {/* Search */}
      <div style={{padding:'0 16px',marginBottom:20}}>
        <div style={{
          background:L.surface,border:`1px solid ${L.border}`,
          borderRadius:16,padding:'12px 16px',
          display:'flex',alignItems:'center',gap:10,
          boxShadow:L.shadowSm,
        }}>
          <span style={{fontSize:18,color:L.textMuted}}>🔍</span>
          <span style={{fontSize:14,color:L.textMuted}}>Search tools...</span>
        </div>
      </div>

      <div style={{padding:'0 16px 160px'}}>
        {/* 3 Main Sections */}
        {Object.entries(SECTIONS).map(([key, sec])=>(
          <div key={key} onClick={()=>setActiveSection(key)} style={{
            borderRadius:24,marginBottom:16,
            overflow:'hidden',cursor:'pointer',
            boxShadow:L.shadowMd,
            border:`1px solid ${L.border}`,
          }}
          onTouchStart={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
          >
            {/* Image */}
            <div style={{
              height:140,
              backgroundImage:`url(${sec.img})`,
              backgroundSize:'cover',backgroundPosition:'center',
              position:'relative',
            }}>
              <div style={{
                position:'absolute',inset:0,
                background:`linear-gradient(160deg, ${sec.color}30 0%, rgba(15,23,42,0.70) 100%)`,
              }}/>
              <div style={{
                position:'absolute',bottom:16,left:16,right:16,
              }}>
                <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:-0.3}}>{sec.label}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:2}}>{sec.desc}</div>
              </div>
              {/* Tools count */}
              <div style={{
                position:'absolute',top:12,right:12,
                background:'rgba(255,255,255,0.20)',
                backdropFilter:'blur(8px)',
                border:'1px solid rgba(255,255,255,0.30)',
                borderRadius:12,padding:'4px 12px',
              }}>
                <span style={{fontSize:11,fontWeight:700,color:'white'}}>
                  {sec.categories.reduce((a,c)=>a+c.count,0)} tools
                </span>
              </div>
            </div>

            {/* Category pills */}
            <div style={{
              background:L.surface,padding:'12px 14px',
              display:'flex',gap:6,flexWrap:'wrap',
            }}>
              {sec.categories.map(cat=>(
                <div key={cat.id} style={{
                  background:`${cat.color}10`,
                  border:`1px solid ${cat.color}20`,
                  borderRadius:10,padding:'4px 10px',
                  fontSize:10,fontWeight:700,color:cat.color,
                }}>{cat.icon} {cat.label}</div>
              ))}
              <div style={{
                marginLeft:'auto',
                display:'flex',alignItems:'center',
                fontSize:13,color:L.textMuted,
              }}>Explore →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
