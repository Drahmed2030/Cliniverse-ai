'use client'
import { useState } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#EF4444,#DC2626)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(239,68,68,0.30)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const TRIAGE_SYSTEMS = [
  {
    id:'start',
    name:'START Triage',
    full:'Simple Triage And Rapid Treatment',
    flag:'🇺🇸',
    origin:'USA · Mass Casualty',
    img:'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80',
    color:'#EF4444',
    desc:'Used in mass casualty incidents. Assesses patients in under 60 seconds each.',
    categories:[
      {color:'#10B981',label:'IMMEDIATE',tag:'Green',icon:'🟢',desc:'Can walk — minor injuries',action:'Delayed treatment'},
      {color:'#F5B731',label:'DELAYED',tag:'Yellow',icon:'🟡',desc:'Serious but stable',action:'Treatment within hours'},
      {color:'#EF4444',label:'IMMEDIATE',tag:'Red',icon:'🔴',desc:'Life-threatening, salvageable',action:'Immediate treatment'},
      {color:'#1F2937',label:'EXPECTANT',tag:'Black',icon:'⚫',desc:'Unlikely to survive',action:'Comfort only'},
    ],
    steps:[
      {step:1,title:'Can they walk?',yes:'Minor → GREEN',no:'Move to step 2'},
      {step:2,title:'Are they breathing?',yes:'Move to step 3',no:'Open airway → if breathing RED, if not BLACK'},
      {step:3,title:'Respiratory rate',normal:'<30/min → step 4',abnormal:'>30/min → RED'},
      {step:4,title:'Radial pulse / GCS',normal:'Present + GCS>2 → YELLOW',abnormal:'Absent or GCS≤2 → RED'},
    ]
  },
  {
    id:'mts',
    name:'Manchester Triage',
    full:'Manchester Triage System',
    flag:'🇬🇧',
    origin:'UK · Emergency Departments',
    img:'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
    color:'#7C3AED',
    desc:'Used in emergency departments. 5-tier system with 52 flowcharts for different presentations.',
    categories:[
      {color:'#EF4444',label:'IMMEDIATE',tag:'Red',icon:'🔴',desc:'Life threatening',action:'Immediate — 0 min'},
      {color:'#EA580C',label:'VERY URGENT',tag:'Orange',icon:'🟠',desc:'Very urgent',action:'10 minutes'},
      {color:'#F5B731',label:'URGENT',tag:'Yellow',icon:'🟡',desc:'Urgent',action:'60 minutes'},
      {color:'#10B981',label:'STANDARD',tag:'Green',icon:'🟢',desc:'Standard',action:'120 minutes'},
      {color:'#3B82F6',label:'NON-URGENT',tag:'Blue',icon:'🔵',desc:'Non-urgent',action:'240 minutes'},
    ],
    steps:[
      {step:1,title:'Life threat?',yes:'RED — Immediate',no:'Step 2'},
      {step:2,title:'Pain level?',normal:'Mild → continue',abnormal:'Severe → Orange'},
      {step:3,title:'Select presentation flowchart',normal:'52 clinical flowcharts',abnormal:''},
      {step:4,title:'Assign priority',normal:'Green/Blue',abnormal:'Yellow/Orange/Red'},
    ]
  },
  {
    id:'esi',
    name:'ESI Triage',
    full:'Emergency Severity Index',
    flag:'🇺🇸',
    origin:'USA · ACEP Endorsed',
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    color:'#1E40AF',
    desc:'5-level triage tool developed in the USA. Considers both acuity and resource needs.',
    categories:[
      {color:'#EF4444',label:'LEVEL 1',tag:'Resuscitation',icon:'🔴',desc:'Immediate life threat',action:'Immediate'},
      {color:'#EA580C',label:'LEVEL 2',tag:'Emergent',icon:'🟠',desc:'High risk / confused / severe pain',action:'<10 min'},
      {color:'#F5B731',label:'LEVEL 3',tag:'Urgent',icon:'🟡',desc:'Stable, needs 2+ resources',action:'30 min'},
      {color:'#10B981',label:'LEVEL 4',tag:'Less Urgent',icon:'🟢',desc:'Stable, needs 1 resource',action:'60 min'},
      {color:'#3B82F6',label:'LEVEL 5',tag:'Non-Urgent',icon:'🔵',desc:'Stable, no resources',action:'120 min'},
    ],
    steps:[
      {step:1,title:'Requires immediate life-saving intervention?',yes:'ESI-1',no:'Step 2'},
      {step:2,title:'High risk situation?',yes:'ESI-2',no:'Step 3'},
      {step:3,title:'How many resources needed?',normal:'Many → ESI-3',abnormal:''},
      {step:4,title:'Vital signs danger zone?',normal:'ESI-3',abnormal:'Consider ESI-2'},
    ]
  },
  {
    id:'ctas',
    name:'CTAS',
    full:'Canadian Triage & Acuity Scale',
    flag:'🇨🇦',
    origin:'Canada · CAEP Standard',
    img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    color:'#DC2626',
    desc:'National standard in Canada. Based on chief complaint and vital signs modifiers.',
    categories:[
      {color:'#1F2937',label:'LEVEL 1',tag:'Resuscitation',icon:'⚫',desc:'Immediate threat to life',action:'Immediate'},
      {color:'#EF4444',label:'LEVEL 2',tag:'Emergent',icon:'🔴',desc:'Potential threat to life',action:'15 minutes'},
      {color:'#F5B731',label:'LEVEL 3',tag:'Urgent',icon:'🟡',desc:'Potentially serious',action:'30 minutes'},
      {color:'#10B981',label:'LEVEL 4',tag:'Less Urgent',icon:'🟢',desc:'Less urgent',action:'60 minutes'},
      {color:'#3B82F6',label:'LEVEL 5',tag:'Non-Urgent',icon:'🔵',desc:'Non-urgent',action:'120 minutes'},
    ],
    steps:[
      {step:1,title:'Chief complaint assessment',yes:'High acuity → 1/2',no:'Continue'},
      {step:2,title:'First order modifiers',normal:'Vital signs + pain',abnormal:'Upgrade if abnormal'},
      {step:3,title:'Second order modifiers',normal:'Mechanism + history',abnormal:''},
      {step:4,title:'Assign CTAS level',normal:'1-5 based on above',abnormal:''},
    ]
  },
]

const MASS_CASUALTY = {
  phases:[
    {phase:'Phase 1',title:'Notification & Activation',icon:'📢',color:'#F5B731',
     actions:['Activate MCI protocol','Alert all departments','Set up command post','Notify regional hospitals']},
    {phase:'Phase 2',title:'Scene Assessment',icon:'🔍',color:'#EA580C',
     actions:['Establish hot/warm/cold zones','Estimate casualty numbers','Identify hazards','Request additional resources']},
    {phase:'Phase 3',title:'Triage & Treatment',icon:'🏥',color:'#EF4444',
     actions:['Apply START triage','Establish treatment areas','Immediate life-saving interventions','Track patients with tags']},
    {phase:'Phase 4',title:'Transport & Recovery',icon:'🚑',color:'#7C3AED',
     actions:['Prioritize transport by severity','Coordinate with receiving hospitals','Document all transfers','Family liaison']},
  ]
}

export default function EmergencyNexus() {
  const [activeSystem, setActiveSystem] = useState<string|null>(null)
  const [activeTab, setActiveTab] = useState<'overview'|'steps'|'mci'>('overview')
  const [pressed, setPressed] = useState<string|null>(null)
  const [pulse, setPulse] = useState(true)

  const system = TRIAGE_SYSTEMS.find(s=>s.id===activeSystem)

  if(activeSystem && system) return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:100,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src={system.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.92))'}}/>
        <button onClick={()=>setActiveSystem(null)} style={{
          position:'absolute',top:16,left:16,
          background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:12,padding:'8px 16px',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',
        }}>← Back</button>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginBottom:6}}>{system.flag} {system.origin}</div>
          <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>{system.name}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>{system.full}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,margin:'14px 16px 0',background:L.raised,borderRadius:16,padding:4,border:`1px solid ${L.border}`}}>
        {(['overview','steps','mci'] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            flex:1,padding:'9px',borderRadius:12,border:'none',cursor:'pointer',
            background:activeTab===t?system.color:'transparent',
            color:activeTab===t?'white':L.textMuted,
            fontSize:12,fontWeight:700,transition:spring,
            boxShadow:activeTab===t?`0 4px 12px ${system.color}40`:'none',
          }}>
            {t==='overview'?'📊 Overview':t==='steps'?'📋 Algorithm':'🚨 MCI'}
          </button>
        ))}
      </div>

      <div style={{padding:'14px 16px'}}>
        {activeTab==='overview' && (
          <>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:`4px solid ${system.color}`,borderRadius:20,padding:'16px 18px',marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>ABOUT THIS SYSTEM</div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.7}}>{system.desc}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {system.categories.map((cat,i)=>(
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:12,
                  background:L.surface,border:`1px solid ${cat.color}25`,
                  borderLeft:`4px solid ${cat.color}`,
                  borderRadius:16,padding:'14px 16px',boxShadow:L.shadowSm,
                }}>
                  <span style={{fontSize:24,flexShrink:0}}>{cat.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:800,color:cat.color}}>{cat.label}</span>
                      <span style={{fontSize:10,fontWeight:700,color:'white',background:cat.color,borderRadius:99,padding:'2px 8px'}}>{cat.tag}</span>
                    </div>
                    <div style={{fontSize:12,color:L.textSub,marginBottom:2}}>{cat.desc}</div>
                    <div style={{fontSize:11,fontWeight:600,color:cat.color}}>⏱ {cat.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab==='steps' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:'16px 18px',marginBottom:4,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>TRIAGE ALGORITHM</div>
              <div style={{fontSize:13,color:L.textSub,lineHeight:1.6}}>Follow these steps sequentially for each patient. Maximum 60 seconds per assessment.</div>
            </div>
            {system.steps.map((step,i)=>(
              <div key={i} style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:16,padding:'14px 16px',boxShadow:L.shadowSm}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:system.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'white',flexShrink:0}}>
                    {step.step}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>{step.title}</div>
                </div>
                <div style={{display:'flex',gap:8,paddingLeft:38}}>
                  {step.yes && (
                    <div style={{flex:1,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:10,padding:'8px 10px'}}>
                      <div style={{fontSize:9,fontWeight:800,color:L.sage,marginBottom:3}}>YES ✓</div>
                      <div style={{fontSize:11,color:L.textSub}}>{step.yes}</div>
                    </div>
                  )}
                  {step.no && (
                    <div style={{flex:1,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'8px 10px'}}>
                      <div style={{fontSize:9,fontWeight:800,color:L.red,marginBottom:3}}>NO ✗</div>
                      <div style={{fontSize:11,color:L.textSub}}>{step.no}</div>
                    </div>
                  )}
                  {step.normal && !step.yes && (
                    <div style={{flex:1,background:'rgba(13,148,136,0.08)',border:'1px solid rgba(13,148,136,0.2)',borderRadius:10,padding:'8px 10px'}}>
                      <div style={{fontSize:9,fontWeight:800,color:L.teal,marginBottom:3}}>NORMAL</div>
                      <div style={{fontSize:11,color:L.textSub}}>{step.normal}</div>
                    </div>
                  )}
                  {step.abnormal && (
                    <div style={{flex:1,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'8px 10px'}}>
                      <div style={{fontSize:9,fontWeight:800,color:L.red,marginBottom:3}}>ABNORMAL</div>
                      <div style={{fontSize:11,color:L.textSub}}>{step.abnormal}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16,padding:'12px 16px',marginTop:4}}>
              <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
                ⚠️ Educational purposes only. Always follow your institution's protocols and medical director guidance.
              </div>
            </div>
          </div>
        )}

        {activeTab==='mci' && (
          <div>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:'4px solid #EF4444',borderRadius:20,padding:'16px 18px',marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>MASS CASUALTY INCIDENT PROTOCOL</div>
              <div style={{fontSize:13,color:L.textSub,lineHeight:1.7}}>A structured 4-phase response to mass casualty events. Activate when casualties exceed local resource capacity.</div>
            </div>
            {MASS_CASUALTY.phases.map((phase,i)=>(
              <div key={i} style={{background:L.surface,border:`1px solid ${phase.color}25`,borderRadius:18,padding:'16px',marginBottom:10,boxShadow:L.shadowSm}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{width:36,height:36,borderRadius:12,background:`${phase.color}15`,border:`1px solid ${phase.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                    {phase.icon}
                  </div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:phase.color}}>{phase.phase}</div>
                    <div style={{fontSize:14,fontWeight:800,color:L.textPrimary}}>{phase.title}</div>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {phase.actions.map((action,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:phase.color,flexShrink:0}}/>
                      <span style={{fontSize:13,color:L.textSub}}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:100,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.15),rgba(15,23,42,0.92))'}}/>
        <div style={{position:'absolute',top:16,left:16,display:'flex',alignItems:'center',gap:6,
          background:'rgba(239,68,68,0.2)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(239,68,68,0.3)',borderRadius:99,padding:'5px 14px'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#EF4444',boxShadow:'0 0 8px #EF4444'}}/>
          <span style={{fontSize:10,fontWeight:700,color:'white',letterSpacing:1.5}}>EMERGENCY NEXUS · LIVE</span>
        </div>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:6}}>4 TRIAGE SYSTEMS · GLOBAL STANDARDS</div>
          <div style={{fontSize:28,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>🚨 Emergency NEXUS</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>Triage · MCI · Emergency Protocols · Evidence-based</div>
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>
        {/* Triage Systems */}
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:12}}>SELECT TRIAGE SYSTEM</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {TRIAGE_SYSTEMS.map(sys=>(
            <div key={sys.id}
              onClick={()=>setActiveSystem(sys.id)}
              onMouseDown={()=>setPressed(sys.id)} onMouseUp={()=>setPressed(null)}
              style={{
                position:'relative',height:120,borderRadius:20,overflow:'hidden',cursor:'pointer',
                transform:pressed===sys.id?'scale(0.97)':'scale(1)',
                transition:spring,boxShadow:`0 4px 16px ${sys.color}20`,
              }}>
              <img src={sys.img} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
              <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${sys.color}BB,rgba(15,23,42,0.80))`}}/>
              <div style={{position:'absolute',inset:0,padding:'14px 16px',display:'flex',alignItems:'center',gap:14}}>
                <div style={{fontSize:28}}>{sys.flag}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:900,color:'white',marginBottom:3}}>{sys.name}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginBottom:4}}>{sys.full}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.65)'}}>{sys.origin}</div>
                </div>
                <div style={{fontSize:20,color:'rgba(255,255,255,0.7)'}}>›</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Reference */}
        <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:'16px 18px',marginBottom:14,boxShadow:L.shadowSm}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:12}}>QUICK TRIAGE COLORS</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              {color:'#EF4444',label:'RED',desc:'Immediate — life threat',time:'Now'},
              {color:'#F5B731',label:'YELLOW',desc:'Delayed — serious',time:'Hours'},
              {color:'#10B981',label:'GREEN',desc:'Minor — can wait',time:'Last'},
              {color:'#1F2937',label:'BLACK',desc:'Expectant / deceased',time:'Comfort'},
            ].map(c=>(
              <div key={c.label} style={{background:`${c.color}10`,border:`1px solid ${c.color}30`,borderRadius:14,padding:'12px 10px'}}>
                <div style={{fontSize:13,fontWeight:900,color:c.color,marginBottom:3}}>{c.label}</div>
                <div style={{fontSize:11,color:L.textSub,marginBottom:3}}>{c.desc}</div>
                <div style={{fontSize:10,fontWeight:700,color:c.color}}>{c.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16,padding:'12px 16px'}}>
          <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
            ⚠️ Educational purposes only. Always follow your institution's emergency protocols and medical director guidance. Not a substitute for formal triage training.
          </div>
        </div>
      </div>
    </div>
  )
}
