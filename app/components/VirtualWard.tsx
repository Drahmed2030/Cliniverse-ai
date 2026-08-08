'use client'
import { useIntelligence } from '../hooks/useIntelligence'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'var(--bg-card,rgba(255,255,255,0.88))',
  glass2: 'var(--bg-card,rgba(255,255,255,0.88))',
  border: 'var(--border-card,rgba(10,132,255,0.10))',
  text:   'var(--text-primary,#EEF6FA)',
  sub:    'var(--text-secondary,rgba(238,246,250,0.72))',
  muted:  'var(--text-muted,rgba(238,246,250,0.50))',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}


// ── DYNAMIC PATIENT GENERATOR ──
const DIAGNOSES = [
  { dx:"Anterior STEMI — Post PCI", status:"critical", specialty:"Cardiology",
    vitals:{bp:"108/70",hr:"95",spo2:"96",temp:"37.2",rr:"18"},
    meds:["Aspirin 75mg OD","Ticagrelor 90mg BD","Atorvastatin 80mg ON","Bisoprolol 2.5mg OD"],
    tasks:["Echo review","Cardiology review","Rehab referral"] },
  { dx:"Severe Sepsis — UTI source", status:"urgent", specialty:"Internal Medicine",
    vitals:{bp:"92/58",hr:"118",spo2:"94",temp:"38.9",rr:"22"},
    meds:["Pip-Taz 4.5g TDS IV","IV Fluids 1L NaCl","Paracetamol 1g QDS"],
    tasks:["Culture results","Fluid balance","Step-down antibiotics"] },
  { dx:"COPD Exacerbation — Infective", status:"stable", specialty:"Respiratory",
    vitals:{bp:"138/86",hr:"92",spo2:"91",temp:"37.4",rr:"20"},
    meds:["Salbutamol Neb QDS","Prednisolone 40mg OD","Doxycycline 200mg OD"],
    tasks:["Sputum culture","ABG review","Physiotherapy"] },
  { dx:"Hypertensive Emergency", status:"critical", specialty:"Cardiology",
    vitals:{bp:"210/120",hr:"102",spo2:"97",temp:"37.0",rr:"16"},
    meds:["IV Labetalol","Amlodipine 10mg OD","Furosemide 40mg OD"],
    tasks:["Echo","Renal function","Ophthalmology review"] },
  { dx:"Diabetic Ketoacidosis", status:"urgent", specialty:"Endocrinology",
    vitals:{bp:"104/68",hr:"112",spo2:"98",temp:"37.1",rr:"24"},
    meds:["IV Insulin infusion","IV Fluids","Potassium replacement"],
    tasks:["Hourly glucose","VBG q2h","Identify trigger"] },
  { dx:"Acute Pulmonary Embolism", status:"urgent", specialty:"Respiratory",
    vitals:{bp:"98/62",hr:"122",spo2:"88",temp:"37.3",rr:"26"},
    meds:["Apixaban 10mg BD","O2 therapy","Analgesia"],
    tasks:["CTPA review","Echo","Lower limb Doppler"] },
  { dx:"Community Acquired Pneumonia", status:"stable", specialty:"Respiratory",
    vitals:{bp:"128/78",hr:"88",spo2:"93",temp:"38.2",rr:"20"},
    meds:["Amoxicillin-Clav 625mg TDS","Clarithromycin 500mg BD","Paracetamol"],
    tasks:["CXR review","Blood cultures","CURB-65 score"] },
  { dx:"Acute Kidney Injury — Stage 2", status:"urgent", specialty:"Nephrology",
    vitals:{bp:"158/94",hr:"78",spo2:"97",temp:"37.0",rr:"16"},
    meds:["IV Fluids","Hold nephrotoxics","Furosemide if overloaded"],
    tasks:["Renal USS","Urine output hourly","Nephrology review"] },
  { dx:"Stroke — Ischemic MCA territory", status:"critical", specialty:"Neurology",
    vitals:{bp:"178/98",hr:"82",spo2:"96",temp:"37.1",rr:"16"},
    meds:["Aspirin 300mg OD","Atorvastatin 80mg ON","IV fluids"],
    tasks:["MRI brain","Swallow assessment","Physio referral"] },
  { dx:"Acute Pancreatitis — Moderate", status:"stable", specialty:"Surgery",
    vitals:{bp:"122/76",hr:"96",spo2:"97",temp:"37.8",rr:"18"},
    meds:["IV Fluids aggressive","Analgesia","NBM initially"],
    tasks:["CT abdomen","LFTs","Surgical review"] },
];

const FIRST_NAMES_M = ["James","Omar","David","Ahmed","Carlos","Wei","Yusuf","Michael","Hassan","Tariq"];
const FIRST_NAMES_F = ["Sarah","Fatima","Emma","Aisha","Maria","Priya","Amira","Sophie","Layla","Nour"];
const LAST_INITIALS = ["A","B","C","D","E","F","G","H","K","M","N","R","S","T"];

function getDailyPatients() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  const pseudo = (n: number) => ((seed * 1103515245 + n * 12345) & 0x7fffffff) % 100;
  
  const beds = ["4A","4B","4C","4D","4E"];
  return beds.map((bed, i) => {
    const dxIndex = pseudo(i * 7) % DIAGNOSES.length;
    const dx = DIAGNOSES[dxIndex];
    const isFemale = pseudo(i * 13) % 2 === 0;
    const names = isFemale ? FIRST_NAMES_F : FIRST_NAMES_M;
    const firstName = names[pseudo(i * 17) % names.length];
    const lastName = LAST_INITIALS[pseudo(i * 23) % LAST_INITIALS.length];
    const age = 25 + (pseudo(i * 31) % 60);
    const title = isFemale ? "Ms." : "Mr.";
    
    return {
      id: `p${i+1}`,
      bed,
      name: `${title} ${firstName} ${lastName}.`,
      age,
      sex: isFemale ? "F" : "M",
      diagnosis: dx.dx,
      status: dx.status,
      statusColor: dx.status === "critical" ? "#FF3B30" : dx.status === "urgent" ? "#FF9500" : "#007AFF",
      vitals: dx.vitals,
      meds: dx.meds,
      notes: `Day ${1 + (pseudo(i*41) % 5)} admission. Monitoring closely. Plan reviewed.`,
      tasks: dx.tasks,
      specialty: dx.specialty,
      labs: {},
    };
  });
}


// ── VIRTUAL PATIENTS (now dynamic) ──
const PATIENTS_STATIC = [
  {
    id: 'p1', bed: '4A', name: 'Mr. Hassan A.', age: 58, sex: 'M',
    diagnosis: 'Anterior STEMI — Post PCI Day 2',
    status: 'critical', statusColor: T.red,
    vitals: { bp:'118/74', hr:'88', spo2:'97', temp:'37.1', rr:'16' },
    labs: { troponin:'↑ 2.4', hb:'11.2', wcc:'11.8', creatinine:'98', egfr:'72' },
    meds: ['Aspirin 75mg OD', 'Ticagrelor 90mg BD', 'Atorvastatin 80mg ON', 'Bisoprolol 2.5mg OD', 'Ramipril 2.5mg OD'],
    notes: 'Post primary PCI to LAD. EF 35% on echo. Currently stable. Monitoring for arrhythmias.',
    tasks: ['Echo report review', 'Cardiology review', 'Rehab referral'],
    specialty: 'Cardiology',
  },
  {
    id: 'p2', bed: '4B', name: 'Mrs. Fatima K.', age: 34, sex: 'F',
    diagnosis: 'Severe Sepsis — UTI source',
    status: 'urgent', statusColor: T.orange,
    vitals: { bp:'96/58', hr:'118', spo2:'95', temp:'38.9', rr:'22' },
    labs: { wcc:'18.4', crp:'284', lactate:'2.8', creatinine:'142', egfr:'48' },
    meds: ['Piperacillin-Tazobactam 4.5g TDS IV', 'IV Fluids 1L NaCl 0.9%', 'Paracetamol 1g QDS', 'Enoxaparin 40mg OD'],
    notes: 'qSOFA score 2. Started on sepsis bundle. Urine cultures pending. Improving on antibiotics.',
    tasks: ['Culture results', 'Fluid balance review', 'Step-down antibiotics'],
    specialty: 'Internal Medicine',
  },
  {
    id: 'p3', bed: '4C', name: 'Mr. Ibrahim S.', age: 72, sex: 'M',
    diagnosis: 'COPD Exacerbation — Infective',
    status: 'stable', statusColor: T.blue,
    vitals: { bp:'138/86', hr:'92', spo2:'91', temp:'37.4', rr:'20' },
    labs: { wcc:'13.2', crp:'98', pco2:'52', po2:'68', ph:'7.34' },
    meds: ['Salbutamol 2.5mg NEB Q4H', 'Ipratropium 0.5mg NEB TDS', 'Prednisolone 30mg OD', 'Amoxicillin-Clavulanate 625mg TDS', 'O2 via Venturi 28%'],
    notes: 'Day 3 admission. SpO2 improving. Target SpO2 88-92%. Sputum purulent — green.',
    tasks: ['ABG repeat at 2pm', 'Physio review', 'Discharge planning'],
    specialty: 'Respiratory',
  },
  {
    id: 'p4', bed: '4D', name: 'Ms. Nora A.', age: 28, sex: 'F',
    diagnosis: 'DKA — Type 1 Diabetes',
    status: 'stable', statusColor: T.green,
    vitals: { bp:'108/68', hr:'96', spo2:'99', temp:'36.9', rr:'18' },
    labs: { glucose:'8.4', ph:'7.36', bicarb:'22', ketones:'1.2', k:'3.8' },
    meds: ['Variable Rate Insulin Infusion', 'IV Fluids — completed', 'Insulin Glargine 20u ON', 'KCl replacement completed'],
    notes: 'Resolved DKA. pH normalised. Transitioned to SC insulin. Diabetes nurse review done.',
    tasks: ['Stop VRIII', 'Endocrine review', 'Discharge letter'],
    specialty: 'Endocrinology',
  },
  {
    id: 'p5', bed: '4E', name: 'Mr. Omar B.', age: 65, sex: 'M',
    diagnosis: 'Acute Kidney Injury — Stage 2',
    status: 'urgent', statusColor: T.orange,
    vitals: { bp:'158/96', hr:'78', spo2:'98', temp:'36.8', rr:'16' },
    labs: { creatinine:'312', egfr:'18', k:'5.8', urea:'22', hb:'9.8' },
    meds: ['Calcium Gluconate 10ml 10% IV', 'Calcium Resonium 15g BD', 'Furosemide 80mg IV BD', 'Stopped NSAIDs'],
    notes: 'AKI on CKD. Hyperkalaemia managed. Renal team review requested. Fluid overloaded.',
    tasks: ['Renal review urgent', 'Fluid restrict 1L/day', 'Repeat U&E at 6pm'],
    specialty: 'Nephrology',
  },
]

const STATUS_LABELS: Record<string,string> = {
  critical: 'CRITICAL',
  urgent:   'URGENT',
  stable:   'STABLE',
}

// ── LOGO WATERMARK ──
const LogoWatermark = () => (
  <div style={{position:'absolute',bottom:10,right:12,opacity:0.06,pointerEvents:'none'}}>
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
      <rect x="5" y="5" width="90" height="90" rx="23" stroke="white" strokeWidth="2"/>
      <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68"
        stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M36 50L46 63L70 36" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="69" cy="32" r="5" fill="white"/>
      <circle cx="69" cy="68" r="5" fill="white"/>
    </svg>
  </div>
)

// ── VITALS BADGE ──
const VitalBadge = ({ label, value, alert }: { label:string, value:string, alert?:boolean }) => (
  <div style={{
    background: alert ? 'rgba(255,59,48,0.12)' : T.glass2,
    border: `1px solid ${alert ? T.red+'40' : T.border}`,
    borderRadius:10, padding:'6px 10px', textAlign:'center', minWidth:52,
  }}>
    <div style={{fontSize:13,fontWeight:900,color: alert ? T.red : T.text}}>{value}</div>
    <div style={{fontSize:8,color:T.muted,marginTop:1,fontWeight:600}}>{label}</div>
  </div>
)

// ── PROGRESS NOTE GENERATOR ──
function ProgressNoteModal({ patient, onClose }: { patient:Patient, onClose:()=>void }) {
  const [generating, setGenerating] = useState(false)
  const [note, setNote] = useState('')

  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')

  const generate = async () => {
    setGenerating(true)
    const prompt = `Write a professional medical progress note (SOAP format) for:
Patient: ${patient.name}, ${patient.age}${patient.sex}, Bed ${patient.bed}
Diagnosis: ${patient.diagnosis}
Vitals: BP ${patient.vitals.bp} | HR ${patient.vitals.hr} | SpO2 ${patient.vitals.spo2}% | Temp ${patient.vitals.temp}°C | RR ${patient.vitals.rr}
Current medications: ${patient.meds.join(', ')}
Background: ${patient.notes}
Pending tasks: ${patient.tasks.join(', ')}

Write a concise, professional daily progress note in SOAP format. Include objective assessment, current plan, and any urgent actions needed. Be clinically precise and use standard medical abbreviations.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:800, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setNote(data.content?.[0]?.text || 'Generation failed')
    } catch { setNote('Connection error. Please try again.') }
    setGenerating(false)
  }

  const getFeedback = async () => {
    if (!note) return
    setGenerating(true)
    const prompt = `You are a senior consultant reviewing this progress note for ${patient.diagnosis}:
${note}
Give brief, constructive feedback (2-3 points max). What's good? What's missing? Any clinical concerns? Be concise and educational.`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:400, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setFeedback(data.content?.[0]?.text || '')
    } catch { setFeedback('Could not get feedback.') }
    setGenerating(false)
  }

  const copy = () => { navigator.clipboard.writeText(note); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.85)',backdropFilter:'blur(12px)',overflowY:'auto'}}>

{/* Cliniverse Logo Watermark */}
<div style={{position:'fixed',bottom:'15%',right:'5%',opacity:0.06,pointerEvents:'none',zIndex:0,transform:'rotate(-15deg)'}}>
  <svg width="140" height="140" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="arcW" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5D4"/><stop offset="100%" stopColor="#0096FF"/>
      </linearGradient>
      <filter id="glW" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcW)" strokeWidth="8" strokeLinecap="round" filter="url(#glW)"/>
    <circle cx="84" cy="38" r="5" fill="#00E5D4"/>
    <circle cx="84" cy="82" r="5" fill="#0096FF"/>
    <polyline points="28,60 36,60 40,60 44,48 48,72 52,55 56,65 60,60 78,60" fill="none" stroke="#00C8B8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>


      <div style={{padding:'20px',maxWidth:480,margin:'0 auto',paddingBottom:40}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>📋 Progress Note</div>
            <div style={{fontSize:11,color:T.sub}}>{patient.name} · Bed {patient.bed}</div>
          </div>
          {note && (
            <button onClick={copy} style={{background:copied?`${T.green}20`:T.glass,border:`1px solid ${copied?T.green:T.border}`,borderRadius:12,padding:'8px 14px',color:copied?T.green:T.sub,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              {copied?'✓':'📋'}
            </button>
          )}
        </div>

        {/* Patient summary */}
        <div style={{background:T.glass,backdropFilter:'blur(16px)',borderRadius:18,padding:'14px',marginBottom:16,border:`1px solid ${patient.statusColor}28`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:patient.statusColor,boxShadow:`0 0 8px ${patient.statusColor}`}}/>
            <span style={{fontSize:10,color:patient.statusColor,fontWeight:800}}>{STATUS_LABELS[patient.status]}</span>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:2}}>{patient.diagnosis}</div>
          <div style={{fontSize:11,color:T.sub}}>{patient.notes}</div>
        </div>

        {/* Generate button */}
        {!note && (
          <button onClick={generate} disabled={generating} style={{
            width:'100%', padding:'16px', borderRadius:18, border:'none',
            background:generating?'rgba(0,196,180,0.2)':`linear-gradient(135deg,${T.teal},${T.blue})`,
            color:'var(--text-primary, #fff)', fontSize:15, fontWeight:800, cursor:generating?'not-allowed':'pointer',
            fontFamily:F, boxShadow:generating?'none':`0 8px 32px ${T.teal}35`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            marginBottom:16,
          }}>
            {generating
              ? <><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Generating note...</>
              : '🤖 Generate Progress Note'}
          </button>
        )}

        {/* Generated note */}
        {note && (
          <div>
            <div style={{background:T.glass,backdropFilter:'blur(20px)',borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${T.blue}25`}}>
              <div style={{fontSize:9,color:T.blue,fontWeight:700,letterSpacing:1,marginBottom:10}}>📋 PROGRESS NOTE — SOAP FORMAT</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.8,whiteSpace:'pre-line'}}>{note}</div>
            </div>

            {/* AI Feedback */}
            {!feedback && (
              <button onClick={getFeedback} disabled={generating} style={{
                width:'100%', padding:'13px', borderRadius:16, border:`1px solid ${T.gold}30`,
                background:`${T.gold}10`, color:T.gold, fontSize:13, fontWeight:700,
                cursor:generating?'not-allowed':'pointer', fontFamily:F, marginBottom:12,
              }}>
                {generating?'Getting feedback...':'🎓 Get Consultant Feedback'}
              </button>
            )}

            {feedback && (
              <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}22`,borderRadius:16,padding:'14px',marginBottom:12}}>
                <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:8}}>🎓 CONSULTANT FEEDBACK</div>
                <div style={{fontSize:12,color:T.sub,lineHeight:1.7,whiteSpace:'pre-line'}}>{feedback}</div>
              </div>
            )}

            <button onClick={()=>{setNote('');setFeedback('')}} style={{
              width:'100%', padding:'13px', borderRadius:16, border:`1px solid ${T.border}`,
              background:T.glass, color:T.sub, fontSize:13, fontWeight:700,
              cursor:'pointer', fontFamily:F,
            }}>
              🔄 Regenerate Note
            </button>
          </div>
        )}
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
}

// ── DISCHARGE MODAL ──
function DischargeModal({ patient, onClose }: { patient:Patient, onClose:()=>void }) {
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setGenerating(true)
    const prompt = `Write a professional hospital discharge summary for:
Patient: ${patient.name}, ${patient.age}${patient.sex}
Diagnosis: ${patient.diagnosis}
Medications on discharge: ${patient.meds.join(', ')}
Clinical notes: ${patient.notes}
Specialty: ${patient.specialty}

Write a complete discharge summary including: admission reason, hospital course, investigations, procedures, discharge medications, follow-up plan, and red flag symptoms. Use professional medical language.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:900, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setSummary(data.content?.[0]?.text || 'Generation failed')
    } catch { setSummary('Connection error.') }
    setGenerating(false)
  }

  const copy = () => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.85)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
      <div style={{padding:'20px',maxWidth:480,margin:'0 auto',paddingBottom:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>📄 Discharge Summary</div>
            <div style={{fontSize:11,color:T.sub}}>{patient.name} · Bed {patient.bed}</div>
          </div>
          {summary && (
            <button onClick={copy} style={{background:copied?`${T.green}20`:T.glass,border:`1px solid ${copied?T.green:T.border}`,borderRadius:12,padding:'8px 14px',color:copied?T.green:T.sub,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              {copied?'✓':'📋'}
            </button>
          )}
        </div>

        {!summary && (
          <button onClick={generate} disabled={generating} style={{
            width:'100%', padding:'16px', borderRadius:18, border:'none',
            background:generating?'rgba(52,199,89,0.2)':`linear-gradient(135deg,${T.green},${T.teal})`,
            color:'var(--text-primary, #fff)', fontSize:15, fontWeight:800, cursor:generating?'not-allowed':'pointer',
            fontFamily:F, boxShadow:generating?'none':`0 8px 32px ${T.green}35`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            {generating
              ? <><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Generating...</>
              : '📄 Generate Discharge Summary'}
          </button>
        )}

        {summary && (
          <div>
            <div style={{background:T.glass,backdropFilter:'blur(20px)',borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${T.green}25`}}>
              <div style={{fontSize:9,color:T.green,fontWeight:700,letterSpacing:1,marginBottom:10}}>📄 DISCHARGE SUMMARY</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.8,whiteSpace:'pre-line'}}>{summary}</div>
            </div>
            <button onClick={()=>setSummary('')} style={{width:'100%',padding:'13px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              🔄 Regenerate
            </button>
          </div>
        )}
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
}

// ── PATIENT DETAIL VIEW ──
function PatientDetail({ patient, onBack }: { patient:Patient, onBack:()=>void }) {
  const [showNote, setShowNote] = useState(false)
  const [showDischarge, setShowDischarge] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview'|'labs'|'meds'|'tasks'>('overview')

  if (showNote) return <ProgressNoteModal patient={patient} onClose={()=>setShowNote(false)}/>
  if (showDischarge) return <DischargeModal patient={patient} onClose={()=>setShowDischarge(false)}/>

  return (
    <div style={{fontFamily:F}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <button onClick={onBack} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'9px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Ward</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T.text}}>{patient.name}</div>
          <div style={{fontSize:11,color:T.sub}}>Bed {patient.bed} · {patient.age}{patient.sex} · {patient.specialty}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,background:`${patient.statusColor}15`,border:`1px solid ${patient.statusColor}35`,borderRadius:20,padding:'4px 10px'}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:patient.statusColor,boxShadow:`0 0 6px ${patient.statusColor}`}}/>
          <span style={{fontSize:9,color:patient.statusColor,fontWeight:800}}>{STATUS_LABELS[patient.status]}</span>
        </div>
      </div>

      {/* Diagnosis */}
      <div style={{background:T.glass,backdropFilter:'blur(16px)',borderRadius:18,padding:'14px',marginBottom:14,border:`1px solid ${patient.statusColor}22`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:`radial-gradient(circle,${patient.statusColor}15,transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{fontSize:10,color:patient.statusColor,fontWeight:700,letterSpacing:1,marginBottom:6}}>DIAGNOSIS</div>
        <div style={{fontSize:15,fontWeight:900,color:T.text,marginBottom:6}}>{patient.diagnosis}</div>
        <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{patient.notes}</div>
      </div>

      {/* Vitals */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>VITALS</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <VitalBadge label="BP" value={patient.vitals.bp} alert={patient.status==='critical'}/>
          <VitalBadge label="HR" value={patient.vitals.hr} alert={parseInt(patient.vitals.hr)>100}/>
          <VitalBadge label="SpO2%" value={patient.vitals.spo2} alert={parseInt(patient.vitals.spo2)<94}/>
          <VitalBadge label="Temp" value={patient.vitals.temp} alert={parseFloat(patient.vitals.temp)>38}/>
          <VitalBadge label="RR" value={patient.vitals.rr} alert={parseInt(patient.vitals.rr)>20}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,background:T.glass2,borderRadius:16,padding:4,marginBottom:14,border:`1px solid ${T.border}`}}>
        {(['overview','labs','meds','tasks'] as const).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{
            flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
            borderRadius:12, fontFamily:F, fontWeight:700, fontSize:11,
            background: activeTab===tab ? T.glass : 'transparent',
            color: activeTab===tab ? T.teal : T.muted,
            border: activeTab===tab ? `1px solid ${T.teal}25` : '1px solid transparent',
            transition:'all 0.2s',
          }}>
            {tab==='overview'?'📋':tab==='labs'?'🧪':tab==='meds'?'💊':'✅'} {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab==='overview' && (
        <div style={{background:T.glass,backdropFilter:'blur(16px)',borderRadius:18,padding:'14px',border:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>CLINICAL NOTES</div>
          <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}>{patient.notes}</div>
        </div>
      )}

      {activeTab==='labs' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {Object.entries(patient.labs).map(([k,v])=>(
            <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:T.glass,backdropFilter:'blur(20px)',borderRadius:14,padding:'12px 16px',border:`1px solid ${String(v).includes('↑')||String(v).includes('↓')?T.red+'30':T.border}`}}>
              <span style={{fontSize:13,color:T.sub,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{k}</span>
              <span style={{fontSize:14,fontWeight:800,color:String(v).includes('↑')||String(v).includes('↓')?T.red:T.text}}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab==='meds' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {patient.meds.map((med,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,background:T.glass,backdropFilter:'blur(20px)',borderRadius:14,padding:'12px 16px',border:`1px solid ${T.border}`}}>
              <span style={{fontSize:18}}>💊</span>
              <span style={{fontSize:13,color:T.text,fontWeight:600,flex:1}}>{med}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab==='tasks' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {patient.tasks.map((task,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,background:T.glass,backdropFilter:'blur(20px)',borderRadius:14,padding:'12px 16px',border:`1px solid ${T.orange}22`}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:T.orange,flexShrink:0}}/>
              <span style={{fontSize:13,color:T.text,fontWeight:600,flex:1}}>{task}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{display:'flex',gap:10,marginTop:16}}>
        <button onClick={()=>setShowNote(true)} style={{
          flex:1, padding:'14px', borderRadius:16, border:'none',
          background:`linear-gradient(135deg,${T.blue},${T.teal})`,
          color:'var(--text-primary, #fff)', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:F,
          boxShadow:`0 6px 20px ${T.blue}35`,
        }}>
          📋 Progress Note
        </button>
        <button onClick={()=>setShowDischarge(true)} style={{
          flex:1, padding:'14px', borderRadius:16, border:`1px solid ${T.green}35`,
          background:`${T.green}15`, color:T.green, fontSize:13, fontWeight:800,
          cursor:'pointer', fontFamily:F,
        }}>
          📄 Discharge
        </button>
      </div>
    </div>
  )
}

// ── MAIN VIRTUAL WARD ──
const _PATIENTS_TYPE = getDailyPatients();
const PATIENTS_DEFAULT = _PATIENTS_TYPE;
type Patient = typeof _PATIENTS_TYPE[0];

export default function VirtualWard({
  onXP }: { onXP?: (n:number)=>void }) {
  const [selected, setSelected] = useState<Patient|null>(null)
  const [researchBanner, setResearchBanner] = useState<{title:string,specialty:string,source:string}|null>(null)

  // NET→WARD Integration
  useEffect(() => {
    const saved = localStorage.getItem('cliniverse-latest-research')
    if (saved) { try { setResearchBanner(JSON.parse(saved)) } catch {} }
    const handler = () => {
      const data = localStorage.getItem('cliniverse-latest-research')
      if (data) { try { setResearchBanner(JSON.parse(data)) } catch {} }
    }
    window.addEventListener('cliniverse-research-update', handler)
    return () => window.removeEventListener('cliniverse-research-update', handler)
  }, [])

  // WARD→TOOLS Integration — broadcast active patient specialty
  useEffect(() => {
    const PATIENTS = getDailyPatients()
  const criticalPatients = PATIENTS.filter(p => p.status === 'critical')
    if (criticalPatients.length > 0) {
      localStorage.setItem('cliniverse-tools-suggest', JSON.stringify({
        specialty: criticalPatients[0].specialty,
        diagnosis: criticalPatients[0].diagnosis,
        tools: criticalPatients[0].specialty === 'Cardiology'
          ? ['ECG Challenge', 'TIMI Score', 'Cardiac Surgery']
          : criticalPatients[0].specialty === 'Respiratory'
          ? ['ABG Interpreter', 'BLS/ACLS', 'Critical Care']
          : ['Risk Calculator', 'Clinical Memory'],
        timestamp: Date.now()
      }))
      window.dispatchEvent(new CustomEvent('cliniverse-tools-update'))
    }
  }, [])

  // WARD→PULSE Integration — broadcast critical patients
  useEffect(() => {
    const PATIENTS = getDailyPatients()
  const criticalPatients = PATIENTS.filter(p => p.status === 'critical')
    if (criticalPatients.length > 0) {
      localStorage.setItem('cliniverse-ward-alert', JSON.stringify({
        count: criticalPatients.length,
        patient: criticalPatients[0].name,
        bed: criticalPatients[0].bed,
        diagnosis: criticalPatients[0].diagnosis,
        timestamp: Date.now()
      }))
      window.dispatchEvent(new CustomEvent('cliniverse-ward-update'))
    }
  }, [])
  const [liveCount, setLiveCount] = useState(1247)

  useEffect(() => {
    const t = setInterval(()=>setLiveCount(n=>Math.max(900,Math.min(1600,n+Math.floor(Math.random()*5)-2))),3000)
    return ()=>clearInterval(t)
  }, [])

  if (selected) return <PatientDetail patient={selected} onBack={()=>setSelected(null)}/>

  const PATIENTS = getDailyPatients()
  const critical = PATIENTS.filter(p=>p.status==='critical').length
  const urgent   = PATIENTS.filter(p=>p.status==='urgent').length
  const stable   = PATIENTS.filter(p=>p.status==='stable').length

  return (
    <div style={{fontFamily:F}}>

      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>VIRTUAL HOSPITAL</div>
        <div style={{fontSize:22,fontWeight:900,color:T.text,letterSpacing:-0.5,lineHeight:1.1}}>
          Ward <span style={{color:T.teal}}>4 North</span>
        </div>
        <div style={{fontSize:12,color:T.sub,marginTop:4}}>
          AI-generated patients · Practice safely · No real data
        </div>
      </div>

      {/* Ward stats */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[
          {l:'Critical', v:critical, c:T.red   },
          {l:'Urgent',   v:urgent,   c:T.orange },
          {l:'Stable',   v:stable,   c:T.green  },
          {l:'Total',    v:PATIENTS.length, c:T.blue },
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',borderRadius:14,padding:'10px 6px',textAlign:'center',border:`1px solid ${s.c}22`}}>
            <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:8,color:T.muted,marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Live badge */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        {/* ── NET→WARD Research Banner ── */}
        {researchBanner && (
          <div style={{
            background:'rgba(0,200,184,0.08)',
            border:'1px solid rgba(0,200,184,0.25)',
            borderRadius:14, padding:'10px 14px',
            marginBottom:12, display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{fontSize:18}}>🔬</span>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:'var(--accent,#00C8B8)',fontWeight:800,letterSpacing:1,marginBottom:2}}>
                NEW RESEARCH — {researchBanner.source}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-primary,#F2F8FC)',lineHeight:1.4}}>
                {researchBanner.title}
              </div>
              <div style={{fontSize:9,color:'var(--text-muted,rgba(242,248,252,0.45))',marginTop:2}}>
                Relevant to: {researchBanner.specialty} patients in this ward
              </div>
            </div>
            <div onClick={()=>setResearchBanner(null)} style={{
              fontSize:16, color:'var(--text-muted,rgba(242,248,252,0.45))',
              cursor:'pointer', padding:'4px',
            }}>✕</div>
          </div>
        )}

        <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5}}>PATIENT CENSUS</div>
        <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,59,48,0.10)',border:'1px solid rgba(255,59,48,0.22)',borderRadius:20,padding:'3px 10px'}}>
          <div style={{width:5,height:5,borderRadius:'50%',background:T.red,boxShadow:`0 0 6px ${T.red}`}}/>
          <span style={{fontSize:9,fontWeight:800,color:T.red,letterSpacing:0.5}}>LIVE WARD</span>
        </div>
      </div>

      {/* Patient list */}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {PATIENTS.map(p=>(
          <div key={p.id} onClick={()=>setSelected(p)} style={{
            background:T.glass, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            border:`1.5px solid ${p.statusColor}25`,
            borderRadius:20, padding:'16px', cursor:'pointer',
            position:'relative', overflow:'hidden',
            boxShadow:`0 4px 20px rgba(0,0,0,0.15), 0 0 12px ${p.statusColor}10`,
            transition:'all 0.2s',
          }}>
            <LogoWatermark/>

            {/* Status + bed */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:p.statusColor,boxShadow:`0 0 8px ${p.statusColor}`,animation:p.status==='critical'?'pulse 1.5s ease-in-out infinite':'none'}}/>
                <span style={{fontSize:9,fontWeight:800,color:p.statusColor,letterSpacing:1}}>{STATUS_LABELS[p.status]}</span>
              </div>
              <div style={{background:`${p.statusColor}15`,border:`1px solid ${p.statusColor}28`,borderRadius:10,padding:'3px 10px',fontSize:10,fontWeight:800,color:p.statusColor}}>
                Bed {p.bed}
              </div>
            </div>

            {/* Patient info */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:900,color:T.text,marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:11,color:T.sub}}>{p.age}{p.sex} · {p.specialty}</div>
              </div>
              <span style={{fontSize:18,color:T.muted}}>›</span>
            </div>

            {/* Diagnosis */}
            <div style={{fontSize:12,color:T.sub,marginBottom:10,lineHeight:1.5}}>{p.diagnosis}</div>

            {/* Key vitals strip */}
            <div style={{display:'flex',gap:6}}>
              {[
                {l:'BP', v:p.vitals.bp},
                {l:'HR', v:p.vitals.hr},
                {l:'SpO2', v:p.vitals.spo2+'%'},
                {l:'Temp', v:p.vitals.temp},
              ].map(v=>(
                <div key={v.l} style={{flex:1,background:'var(--bg-card,rgba(255,255,255,0.88))',borderRadius:8,padding:'5px 4px',textAlign:'center',border:`1px solid rgba(255,255,255,0.07)`}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.text}}>{v.v}</div>
                  <div style={{fontSize:7,color:T.muted,marginTop:1}}>{v.l}</div>
                </div>
              ))}
            </div>

            {/* Tasks */}
            {p.tasks.length > 0 && (
              <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                {p.tasks.slice(0,2).map((task,i)=>(
                  <span key={i} style={{fontSize:9,color:T.orange,background:`${T.orange}12`,border:`1px solid ${T.orange}22`,borderRadius:8,padding:'3px 8px',fontWeight:600}}>
                    ⚡ {task}
                  </span>
                ))}
                {p.tasks.length > 2 && <span style={{fontSize:9,color:T.muted,padding:'3px 4px'}}>+{p.tasks.length-2} more</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{marginTop:16,background:`${T.gold}08`,border:`1px solid ${T.gold}18`,borderRadius:14,padding:'12px 14px',textAlign:'center'}}>
        <div style={{fontSize:10,color:T.gold,fontWeight:700,marginBottom:4}}>⭐ EDUCATIONAL TOOL</div>
        <div style={{fontSize:11,color:T.muted,lineHeight:1.6}}>All patients are AI-generated for training purposes only. No real patient data is used.</div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px #FF3B30}50%{opacity:0.5;box-shadow:0 0 3px #FF3B30}}`}</style>
    </div>
  )
}
