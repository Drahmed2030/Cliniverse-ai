'use client'
import { useState, useEffect } from 'react'
import { L } from '../../lib/tokens'
import dynamic from 'next/dynamic'
import WardHome from './WardHome'
import PatientJourney from './PatientJourney'
import { MOCK_PATIENTS } from '../../lib/ward'

const MedFeed     = dynamic(() => import('../MedFeed'),     { ssr:false })
const ClinicalNet = dynamic(() => import('../ClinicalNet'), { ssr:false })

const HOSPITAL_ICU = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80'

const PATIENTS = [
  {
    id:'p1', name:'Ms. Amira S.', age:'53F', bed:'4B',
    specialty:'Neurology', diagnosis:'Stroke — Ischemic MCA territory',
    status:'critical', color:'#EF4444',
    vitals:{ bp:'178/98', hr:'82', o2:'96', temp:'37.1' },
    tasks:['MRI brain', 'Swallow assessment', 'Neurology review'],
  },
  {
    id:'p2', name:'Ms. Sarah E.', age:'49F', bed:'4C',
    specialty:'Endocrinology', diagnosis:'Diabetic Ketoacidosis',
    status:'urgent', color:'#F59E0B',
    vitals:{ bp:'104/68', hr:'112', o2:'98', temp:'37.1' },
    tasks:['Hourly glucose', 'VBG q2h', 'Insulin protocol'],
  },
  {
    id:'p3', name:'Ms. Emma E.', age:'57F', bed:'4A',
    specialty:'Respiratory', diagnosis:'COPD Exacerbation — Infective',
    status:'stable', color:'#10B981',
    vitals:{ bp:'138/86', hr:'92', o2:'91', temp:'37.4' },
    tasks:['Sputum culture', 'ABG review', 'Physio referral'],
  },
  {
    id:'p4', name:'Ms. Layla K.', age:'41F', bed:'4D',
    specialty:'Respiratory', diagnosis:'Community Acquired Pneumonia',
    status:'stable', color:'#10B981',
    vitals:{ bp:'128/78', hr:'88', o2:'93', temp:'38.2' },
    tasks:['CXR review', 'Blood cultures', 'IV antibiotics'],
  },
  {
    id:'p5', name:'Mr. Hassan A.', age:'62M', bed:'4E',
    specialty:'Cardiology', diagnosis:'Anterior STEMI — Post PCI Day 2',
    status:'urgent', color:'#F59E0B',
    vitals:{ bp:'118/72', hr:'78', o2:'97', temp:'36.8' },
    tasks:['Echo today', 'Cardiac rehab', 'Discharge planning'],
  },
]

const STATUS = {
  critical: { label:'CRITICAL', color:'#EF4444', bg:'rgba(239,68,68,0.10)', dot:'#EF4444' },
  urgent:   { label:'URGENT',   color:'#F59E0B', bg:'rgba(245,158,11,0.10)', dot:'#F59E0B' },
  stable:   { label:'STABLE',   color:'#10B981', bg:'rgba(16,185,129,0.10)', dot:'#3B82F6' },
}

function PatientCard({ p, onSelect }:any) {
  const s = STATUS[p.status as keyof typeof STATUS]
  return (
    <div onClick={()=>onSelect(p)} style={{
      background:'#FFFFFF',
      border:`1px solid ${L.border}`,
      borderLeft:`4px solid ${p.color}`,
      borderRadius:20, padding:'16px',
      marginBottom:10, cursor:'pointer',
      boxShadow:L.shadowSm,
      transition:'all 0.2s ease',
    }}
    onTouchStart={e=>(e.currentTarget.style.transform='scale(0.99)')}
    onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
    >
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{
            width:8,height:8,borderRadius:'50%',
            background:s.dot,
            boxShadow:`0 0 6px ${s.dot}`,
            animation: p.status==='critical' ? 'pulse 1.5s infinite' : 'none',
          }}/>
          <span style={{
            fontSize:10,fontWeight:800,letterSpacing:1,
            color:s.color,
          }}>{s.label}</span>
        </div>
        <div style={{
          background:`${p.color}12`,
          border:`1px solid ${p.color}25`,
          borderRadius:10,padding:'3px 10px',
          fontSize:11,fontWeight:700,color:p.color,
        }}>Bed {p.bed}</div>
      </div>

      {/* Patient info */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:17,fontWeight:800,color:L.text,marginBottom:2}}>{p.name}</div>
        <div style={{fontSize:12,color:L.textSub}}>{p.age} · {p.specialty}</div>
        <div style={{fontSize:13,color:L.textMuted,marginTop:4}}>{p.diagnosis}</div>
      </div>

      {/* Vitals */}
      <div style={{
        display:'grid',gridTemplateColumns:'repeat(4,1fr)',
        gap:6,marginBottom:10,
      }}>
        {[
          {label:'BP',   value:p.vitals.bp,   crit:parseInt(p.vitals.bp)<90},
          {label:'HR',   value:p.vitals.hr,   crit:parseInt(p.vitals.hr)>120},
          {label:'SpO₂', value:p.vitals.o2+'%', crit:parseInt(p.vitals.o2)<94},
          {label:'Temp', value:p.vitals.temp+'°', crit:parseFloat(p.vitals.temp)>38.5},
        ].map(v=>(
          <div key={v.label} style={{
            background: v.crit ? 'rgba(239,68,68,0.08)' : L.raised,
            border:`1px solid ${v.crit ? 'rgba(239,68,68,0.25)' : L.border}`,
            borderRadius:10,padding:'6px 4px',textAlign:'center',
          }}>
            <div style={{fontSize:12,fontWeight:800,color:v.crit?'#EF4444':L.text}}>{v.value}</div>
            <div style={{fontSize:8,color:L.textMuted,letterSpacing:0.5}}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
        {p.tasks.slice(0,2).map((t:string)=>(
          <span key={t} style={{
            fontSize:10,fontWeight:600,
            background:`${p.color}10`,
            border:`1px solid ${p.color}20`,
            color:p.color,borderRadius:8,
            padding:'3px 8px',
          }}>⚡ {t}</span>
        ))}
        {p.tasks.length>2 && (
          <span style={{fontSize:10,color:L.textMuted,padding:'3px 6px'}}>
            +{p.tasks.length-2} more
          </span>
        )}
      </div>
    </div>
  )
}

function PatientDetail({ p, onBack }:any) {
  const s = STATUS[p.status as keyof typeof STATUS]
  return (
    <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>
      <WardHome onSelectPatient={function(id) { const p = MOCK_PATIENTS.find(function(x) { return x.id === id }); if(p) setSelected(p); }} />
      {/* Hero */}
      <div style={{
        height:140,
        backgroundImage:`url(${HOSPITAL_ICU})`,
        backgroundSize:'cover',backgroundPosition:'center',
        position:'relative',
      }}>
        <div style={{
          position:'absolute',inset:0,
          background:'linear-gradient(180deg,rgba(248,250,252,0.20) 0%,rgba(248,250,252,0.96) 100%)',
        }}/>
        <button onClick={onBack} style={{
          position:'absolute',top:16,left:16,
          background:'rgba(255,255,255,0.90)',
          backdropFilter:'blur(12px)',
          border:`1px solid ${L.border}`,
          borderRadius:20,padding:'8px 16px',
          fontSize:13,fontWeight:700,color:L.text,cursor:'pointer',
          boxShadow:L.shadowSm,
        }}>← Back</button>
      </div>

      <div style={{padding:'0 16px 140px',marginTop:-20}}>
        {/* Status + Bed */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{
            background:s.bg,border:`1px solid ${p.color}30`,
            borderRadius:20,padding:'5px 14px',
            display:'flex',alignItems:'center',gap:6,
          }}>
            <div style={{width:6,height:6,borderRadius:'50%',background:s.dot}}/>
            <span style={{fontSize:11,fontWeight:800,color:s.color}}>{s.label}</span>
          </div>
          <div style={{
            background:`${p.color}12`,border:`1px solid ${p.color}25`,
            borderRadius:12,padding:'5px 14px',
            fontSize:12,fontWeight:700,color:p.color,
          }}>Bed {p.bed}</div>
        </div>

        {/* Name */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:24,fontWeight:900,color:L.text,letterSpacing:-0.5}}>{p.name}</div>
          <div style={{fontSize:14,color:L.textSub,marginTop:2}}>{p.age} · {p.specialty}</div>
          <div style={{fontSize:14,color:L.textMuted,marginTop:4}}>{p.diagnosis}</div>
        </div>

        {/* Vitals */}
        <div style={{
          background:'#FFFFFF',border:`1px solid ${L.border}`,
          borderRadius:20,padding:'16px',marginBottom:12,
          boxShadow:L.shadowSm,
        }}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:L.textMuted,marginBottom:12}}>
            ⚡ VITAL SIGNS
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
            {[
              {label:'Blood Pressure',icon:'🫀',value:p.vitals.bp+' mmHg',crit:parseInt(p.vitals.bp)<90},
              {label:'Heart Rate',    icon:'💓',value:p.vitals.hr+' bpm',  crit:parseInt(p.vitals.hr)>120},
              {label:'SpO₂',         icon:'🫁',value:p.vitals.o2+'%',     crit:parseInt(p.vitals.o2)<94},
              {label:'Temperature',  icon:'🌡️',value:p.vitals.temp+'°C',  crit:parseFloat(p.vitals.temp)>38.5},
            ].map(v=>(
              <div key={v.label} style={{
                background: v.crit ? 'rgba(239,68,68,0.06)' : L.raised,
                border:`1px solid ${v.crit?'rgba(239,68,68,0.20)':L.border}`,
                borderRadius:14,padding:'12px',
              }}>
                <div style={{fontSize:16,marginBottom:4}}>{v.icon}</div>
                <div style={{fontSize:18,fontWeight:900,color:v.crit?'#EF4444':L.text}}>{v.value}</div>
                <div style={{fontSize:10,color:L.textMuted,marginTop:2}}>{v.label}</div>
                {v.crit && <div style={{fontSize:9,color:'#EF4444',fontWeight:700,marginTop:3}}>⚠ CRITICAL</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div style={{
          background:'#FFFFFF',border:`1px solid ${L.border}`,
          borderRadius:20,padding:'16px',marginBottom:12,
          boxShadow:L.shadowSm,
        }}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:L.textMuted,marginBottom:12}}>
            📋 TASKS & ORDERS
          </div>
          {p.tasks.map((t:string,i:number)=>(
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:12,
              padding:'10px 0',
              borderBottom:i<p.tasks.length-1?`1px solid ${L.border}`:'none',
            }}>
              <div style={{
                width:28,height:28,borderRadius:8,flexShrink:0,
                background:`${p.color}12`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:12,fontWeight:800,color:p.color,
              }}>{i+1}</div>
              <div style={{fontSize:13,fontWeight:600,color:L.text}}>{t}</div>
              <div style={{marginLeft:'auto'}}>
                <div style={{
                  width:20,height:20,borderRadius:6,
                  border:`2px solid ${L.border}`,
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* AI Consult */}
        <div style={{
          background:`${L.teal}08`,
          border:`1px solid ${L.tealBd}`,
          borderRadius:20,padding:'16px',
          boxShadow:L.shadowSm,
        }}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{
              width:36,height:36,borderRadius:10,
              background:L.gradPrimary,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
            }}>🤖</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:L.text}}>AI Clinical Consult</div>
              <div style={{fontSize:11,color:L.textMuted}}>Ask about this patient</div>
            </div>
          </div>
          <div style={{
            background:'#FFFFFF',border:`1px solid ${L.border}`,
            borderRadius:12,padding:'12px 14px',
            fontSize:13,color:L.textMuted,
          }}>Ask a clinical question about {p.name}...</div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}

interface Props { onXP: (n:number) => void }

export default function WardIndex({ onXP }: Props) {
  const [sub, setSub]         = useState('ward')
  const [selected, setSelected] = useState<any>(null)

  const critical = PATIENTS.filter(p=>p.status==='critical').length
  const urgent   = PATIENTS.filter(p=>p.status==='urgent').length
  const stable   = PATIENTS.filter(p=>p.status==='stable').length

  if(selected) { const full = MOCK_PATIENTS.find(function(x) { return x.id === selected.id }) || null; if(full) return <PatientJourney patient={full} onClose={function() { setSelected(null) }} onRequestConsult={function(id) { console.log(id) }} /> }

  return (
    <div style={{minHeight:'100vh',background:L.canvas,fontFamily:L.font}}>
      <WardHome onSelectPatient={function(id) { const p = MOCK_PATIENTS.find(function(x) { return x.id === id }); if(p) setSelected(p); }} />

      {/* Hero Image */}
      {false && (
        <div style={{
          height:160,
          backgroundImage:`url(${HOSPITAL_ICU})`,
          backgroundSize:'cover',backgroundPosition:'center',
          position:'relative',marginBottom:-20,
        }}>
          <div style={{
            position:'absolute',inset:0,
            background:'linear-gradient(180deg,rgba(248,250,252,0.10) 0%,rgba(248,250,252,0.96) 100%)',
          }}/>
          <div style={{
            position:'absolute',bottom:28,left:16,
          }}>
            <div style={{fontSize:11,color:L.teal,fontWeight:700,letterSpacing:2}}>VIRTUAL HOSPITAL</div>
            <div style={{fontSize:24,fontWeight:900,color:L.text,letterSpacing:-0.5}}>
              Ward <span style={{color:L.teal}}>4 North</span>
            </div>
            <div style={{fontSize:12,color:L.textSub}}>AI-generated · Practice safely · No real data</div>
          </div>
        </div>
      )}

      <div style={{padding:'20px 16px 160px',maxWidth:560,margin:'0 auto'}}>

        {/* Sub-tabs */}
        <div style={{
          display:'flex',gap:4,
          background:'#FFFFFF',
          border:`1px solid ${L.border}`,
          borderRadius:18,padding:5,marginBottom:16,
          boxShadow:L.shadowSm,
        }}>
          {[
            {id:'ward', label:'🏥 Ward'},
            {id:'feed', label:'📰 MedFeed'},
            {id:'net',  label:'🌐 ClinicalNet'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setSub(t.id)} style={{
              flex:1,padding:'10px 6px',border:'none',cursor:'pointer',
              borderRadius:14,fontWeight:700,fontSize:11,
              fontFamily:L.font,
              background: sub===t.id ? L.gradPrimary : 'transparent',
              color: sub===t.id ? 'white' : L.textMuted,
              boxShadow: sub===t.id ? L.shadowSm : 'none',
              transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* WARD content */}
        {false && (
          <div>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
              {[
                {label:'Critical',value:critical,color:'#EF4444'},
                {label:'Urgent',  value:urgent,  color:'#F59E0B'},
                {label:'Stable',  value:stable,  color:'#10B981'},
                {label:'Total',   value:PATIENTS.length,color:'#3B82F6'},
              ].map(s=>(
                <div key={s.label} style={{
                  background:'#FFFFFF',border:`1px solid ${L.border}`,
                  borderRadius:16,padding:'12px 8px',textAlign:'center',
                  boxShadow:L.shadowSm,
                }}>
                  <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:9,color:L.textMuted,marginTop:3,letterSpacing:0.5}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Live badge */}
            <div style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,
            }}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:L.textMuted}}>PATIENT CENSUS</div>
              <div style={{
                display:'flex',alignItems:'center',gap:5,
                background:'rgba(239,68,68,0.10)',
                border:'1px solid rgba(239,68,68,0.25)',
                borderRadius:20,padding:'4px 12px',
              }}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#EF4444',animation:'pulse 1.5s infinite'}}/>
                <span style={{fontSize:10,fontWeight:700,color:'#EF4444'}}>LIVE WARD</span>
              </div>
            </div>

            {/* Patient list */}
            {PATIENTS.map(p=>(
              <PatientCard key={p.id} p={p} onSelect={setSelected}/>
            ))}
          </div>
        )}

        {sub==='feed' && <MedFeed onXP={onXP}/>}
        {sub==='net'  && <ClinicalNet onXP={onXP}/>}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
