'use client'
import { useState } from 'react'

// ── TYPES ──
type View = 'menu' | 'session' | 'debrief' | 'guidelines'
type SessionPhase = 'intro' | 'history' | 'assessment' | 'plan' | 'handover' | 'complete'

interface TeleCase {
  id: string
  title: string
  specialty: string
  color: string
  icon: string
  urgency: 'Routine' | 'Urgent' | 'Emergency'
  patient: string
  referralReason: string
  background: string
  keyFindings: string[]
  redFlags: string[]
  correctActions: Action[]
  wrongActions: Action[]
  handoverTemplate: string
  xpReward: number
  learning: string[]
}

interface Action {
  id: string
  label: string
  correct: boolean
  feedback: string
  phase: SessionPhase
}

// ── TELECONSULT CASES ──
const CASES: TeleCase[] = [
  {
    id: 'chest_pain_tele',
    title: 'Chest Pain Referral',
    specialty: 'Cardiology',
    color: '#ff453a',
    icon: '🫀',
    urgency: 'Emergency',
    patient: '58M | DM, HTN, smoker',
    referralReason: 'Severe chest pain + ECG changes',
    background: 'GP refers 58-year-old male. Crushing chest pain 45 min, radiating to left arm. ECG: ST elevation V1-V4. BP 90/60. HR 110. Diaphoretic.',
    keyFindings: ['ST elevation V1-V4', 'BP 90/60 mmHg', 'HR 110 bpm', 'Troponin pending'],
    redFlags: ['Haemodynamic instability', 'ST elevation', 'High-risk profile'],
    correctActions: [
      { id:'accept', label:'Accept as emergency — immediate transfer', correct:true, feedback:'✅ Correct. STEMI requires door-to-balloon < 90 min. Immediate acceptance.', phase:'intro' },
      { id:'history_pain', label:'Clarify onset, radiation, severity (SOCRATES)', correct:true, feedback:'✅ Essential history. Onset 45 min — within thrombolysis window.', phase:'history' },
      { id:'history_contraindications', label:'Screen for tPA contraindications', correct:true, feedback:'✅ Critical before thrombolysis. Recent surgery? Bleeding? Stroke?', phase:'history' },
      { id:'assess_ecg', label:'Request ECG transmission immediately', correct:true, feedback:'✅ Tele-ECG is standard of care. Confirms STEMI remotely.', phase:'assessment' },
      { id:'assess_vitals', label:'Request continuous vitals monitoring', correct:true, feedback:'✅ BP 90/60 — cardiogenic shock risk. Continuous monitoring essential.', phase:'assessment' },
      { id:'plan_activate', label:'Activate Cath Lab — door-to-balloon < 90 min', correct:true, feedback:'✅ Primary PCI is gold standard for STEMI. Clock starts NOW.', phase:'plan' },
      { id:'plan_aspirin', label:'Instruct: Aspirin 300mg + Ticagrelor 180mg NOW', correct:true, feedback:'✅ Dual antiplatelet before transfer. Reduces mortality significantly.', phase:'plan' },
      { id:'handover_sbar', label:'Handover using SBAR format', correct:true, feedback:'✅ SBAR: Situation, Background, Assessment, Recommendation — gold standard.', phase:'handover' },
    ],
    wrongActions: [
      { id:'wait_troponin', label:'Wait for troponin result before accepting', correct:false, feedback:'❌ NEVER delay STEMI transfer for troponin! Clinical + ECG = act now.', phase:'intro' },
      { id:'routine_referral', label:'Schedule for next available cardiology clinic', correct:false, feedback:'❌ STEMI is time-critical. Every minute = myocardium lost.', phase:'intro' },
      { id:'gtn_hypotension', label:'Advise GTN spray for chest pain', correct:false, feedback:'❌ GTN contraindicated with SBP < 100! Will worsen hypotension.', phase:'plan' },
    ],
    handoverTemplate: `SITUATION: 58M with STEMI — ST elevation V1-V4, haemodynamically unstable.

BACKGROUND: DM, HTN, smoker. Chest pain 45 min, radiation left arm. Troponin pending.

ASSESSMENT: Anterior STEMI with cardiogenic shock risk. Aspirin + Ticagrelor given.

RECOMMENDATION: Immediate transfer for primary PCI. Cath Lab activated. ETA 25 min. Patient on continuous monitoring. IV access x2. Heparin 5000u given.`,
    xpReward: 120,
    learning: [
      'STEMI is a time-critical teleconsult — accept immediately, activate Cath Lab remotely',
      'Tele-ECG transmission confirms diagnosis without delaying transfer',
      'SBAR handover reduces communication errors by 80%',
      'GTN is contraindicated in hypotension (SBP < 100)',
      'Dual antiplatelet (Aspirin + Ticagrelor) should be given before transfer',
    ],
  },
  {
    id: 'stroke_tele',
    title: 'Acute Stroke Referral',
    specialty: 'Neurology',
    color: '#00C4B4',
    icon: '🧠',
    urgency: 'Emergency',
    patient: '67F | AF, HTN',
    referralReason: 'Sudden left hemiplegia — 90 min ago',
    background: 'ED physician calls. 67F, known AF on warfarin. Sudden left hemiplegia + facial droop. NIHSS 16. Last seen normal 90 min ago. CT: no haemorrhage. ASPECTS 8.',
    keyFindings: ['NIHSS 16', 'Last seen normal 90 min', 'CT: no haemorrhage', 'AF on warfarin'],
    redFlags: ['Anticoagulation status', 'Time window critical', 'Large vessel occlusion suspected'],
    correctActions: [
      { id:'accept_stroke', label:'Accept — time-critical stroke activation', correct:true, feedback:'✅ Stroke code activated. Every minute = 1.9 million neurons lost.', phase:'intro' },
      { id:'nihss', label:'Confirm NIHSS score remotely', correct:true, feedback:'✅ NIHSS guides tPA eligibility and thrombectomy decision.', phase:'history' },
      { id:'warfarin_inr', label:'Clarify last warfarin dose + urgent INR', correct:true, feedback:'✅ INR > 1.7 = tPA contraindicated. Critical information.', phase:'history' },
      { id:'ct_review', label:'Request CT images via PACS/teleradiology', correct:true, feedback:'✅ Remote CT review confirms no haemorrhage. ASPECTS 8 = good outcome.', phase:'assessment' },
      { id:'bp_target', label:'Instruct: BP < 185/110 before tPA', correct:true, feedback:'✅ BP must be < 185/110 for tPA safety. Labetalol IV if needed.', phase:'assessment' },
      { id:'tpa_decision', label:'Authorise IV tPA 0.9mg/kg if eligible', correct:true, feedback:'✅ Within 4.5h window, no contraindications — tPA authorised remotely.', phase:'plan' },
      { id:'thrombectomy', label:'Assess for mechanical thrombectomy', correct:true, feedback:'✅ NIHSS 16 + large vessel = thrombectomy candidate. Neuroradiology alert.', phase:'plan' },
      { id:'handover_stroke', label:'SBAR handover to stroke unit', correct:true, feedback:'✅ Clear handover ensures continuity. Include: NIHSS, INR, tPA dose, time.', phase:'handover' },
    ],
    wrongActions: [
      { id:'mri_first', label:'Request MRI before any treatment', correct:false, feedback:'❌ MRI delays treatment. CT + clinical = sufficient to start tPA.', phase:'assessment' },
      { id:'aspirin_before_tpa', label:'Give aspirin 300mg now', correct:false, feedback:'❌ Aspirin contraindicated 24h post-tPA! Do not give before or after.', phase:'plan' },
      { id:'routine_neuro', label:'Book urgent outpatient neurology review', correct:false, feedback:'❌ Acute stroke requires emergency admission, not outpatient review.', phase:'intro' },
    ],
    handoverTemplate: `SITUATION: 67F with acute ischaemic stroke — NIHSS 16, left hemiplegia.

BACKGROUND: AF on warfarin. Last seen normal 90 min ago. INR 1.4 — tPA eligible.

ASSESSMENT: Large vessel occlusion suspected. CT: no haemorrhage, ASPECTS 8. BP controlled 178/98.

RECOMMENDATION: IV tPA authorised — 0.9mg/kg (max 90mg). 10% bolus, 90% over 60 min. Assess for thrombectomy. Admit stroke unit. Neuroradiology on standby.`,
    xpReward: 120,
    learning: [
      'Telestroke allows remote NIHSS assessment and tPA authorisation 24/7',
      'Remote CT review via PACS is standard telestroke practice',
      'INR > 1.7 is an absolute contraindication to tPA',
      'Aspirin is contraindicated for 24h after tPA',
      'NIHSS ≥ 6 with LVO = consider thrombectomy regardless of tPA',
    ],
  },
  {
    id: 'sepsis_tele',
    title: 'Septic Patient — ICU Advice',
    specialty: 'Critical Care',
    color: '#ff9f0a',
    icon: '🦠',
    urgency: 'Urgent',
    patient: '72M | DM, CKD stage 3',
    referralReason: 'Unresponsive to fluids — vasopressor guidance needed',
    background: 'Ward physician calls. 72M, CKD3, DM. Temp 39.6, BP 72/40 despite 2L IVF. HR 138. Lactate 4.8. WBC 24k. Source: bilateral pneumonia. Received pip/taz 4h ago.',
    keyFindings: ['BP 72/40 after 2L IVF', 'Lactate 4.8 mmol/L', 'Temp 39.6°C', 'CKD stage 3'],
    redFlags: ['Vasopressor-requiring shock', 'Elevated lactate', 'CKD — fluid/drug dosing caution'],
    correctActions: [
      { id:'accept_icu', label:'Accept for ICU-level teleconsultation', correct:true, feedback:'✅ Septic shock requires ICU-level guidance. Accept immediately.', phase:'intro' },
      { id:'cultures', label:'Confirm blood cultures taken before abx', correct:true, feedback:'✅ Cultures before antibiotics — critical for source identification.', phase:'history' },
      { id:'lactate_trend', label:'Request lactate at 2h to assess clearance', correct:true, feedback:'✅ Target lactate clearance > 10% per 2h confirms adequate resuscitation.', phase:'assessment' },
      { id:'norad', label:'Advise: Norepinephrine — target MAP > 65', correct:true, feedback:'✅ First-line vasopressor in septic shock. Start at 0.1 mcg/kg/min.', phase:'plan' },
      { id:'hydrocortisone', label:'Consider hydrocortisone if vasopressor-refractory', correct:true, feedback:'✅ Hydrocortisone 200mg/day for refractory shock (Surviving Sepsis 2021).', phase:'plan' },
      { id:'fluid_caution', label:'Caution: fluid overload risk with CKD', correct:true, feedback:'✅ CKD3 limits fluid tolerance. Avoid >30ml/kg if no response.', phase:'assessment' },
      { id:'icu_transfer', label:'Arrange ICU transfer for continuous monitoring', correct:true, feedback:'✅ Vasopressor-requiring septic shock = ICU. Ward is not appropriate.', phase:'plan' },
      { id:'handover_icu', label:'SBAR handover to ICU team', correct:true, feedback:'✅ Include: fluid balance, vasopressor dose, cultures, antibiotics timing.', phase:'handover' },
    ],
    wrongActions: [
      { id:'more_fluids', label:'Give another 2L IVF bolus', correct:false, feedback:'❌ Fluid-refractory shock — vasopressors now. More fluids cause pulmonary oedema.', phase:'plan' },
      { id:'furosemide', label:'Give furosemide to improve urine output', correct:false, feedback:'❌ Diuretics in hypovolaemic shock = fatal. Restore MAP first.', phase:'plan' },
      { id:'routine_abx', label:'Add oral antibiotics and monitor', correct:false, feedback:'❌ Septic shock requires IV broad-spectrum antibiotics and ICU escalation.', phase:'plan' },
    ],
    handoverTemplate: `SITUATION: 72M septic shock — vasopressor-requiring, lactate 4.8.

BACKGROUND: CKD3, DM. Pneumonia source. Pip/Taz started 4h ago. Blood cultures x2 taken. 2L IVF given — no response.

ASSESSMENT: Fluid-refractory septic shock. Norepinephrine 0.15 mcg/kg/min started. Lactate trending. UO 15ml/h.

RECOMMENDATION: ICU admission. Continue norepinephrine — titrate to MAP > 65. Consider hydrocortisone 200mg/day. Reassess lactate 2h. Strict fluid balance — CKD risk.`,
    xpReward: 110,
    learning: [
      'Teleconsultation enables ICU-level guidance for ward physicians remotely',
      'Vasopressor-refractory septic shock: consider hydrocortisone (Surviving Sepsis 2021)',
      'CKD patients need careful fluid management — higher risk of fluid overload',
      'Lactate clearance > 10% per 2h is a target in septic shock resuscitation',
      'SBAR handover should include: fluid balance, vasopressor dose, culture results',
    ],
  },
  {
    id: 'paeds_tele',
    title: 'Paediatric Fever Referral',
    specialty: 'Paediatrics',
    color: '#bf5af2',
    icon: '🧸',
    urgency: 'Urgent',
    patient: '8-month-old | Previously well',
    referralReason: 'High fever + irritability + bulging fontanelle',
    background: 'GP calls. 8-month-old, previously well. Temp 39.8°C. Irritable, inconsolable. Bulging fontanelle noted. No rash currently. Refused feeds. Parents very anxious.',
    keyFindings: ['Bulging fontanelle', 'Temp 39.8°C', 'Irritable — inconsolable', 'Refused feeds'],
    redFlags: ['Bulging fontanelle = meningitis until proven otherwise', 'Age < 12 months', 'Feeding refusal'],
    correctActions: [
      { id:'accept_paeds', label:'Accept immediately — red flag signs', correct:true, feedback:'✅ Bulging fontanelle = bacterial meningitis until proven otherwise. Immediate.', phase:'intro' },
      { id:'rash_check', label:'Ask GP to check for non-blanching rash', correct:true, feedback:'✅ Purpuric rash = meningococcal sepsis. Must be excluded NOW.', phase:'history' },
      { id:'neuro_check', label:'Assess GCS and neck stiffness remotely', correct:true, feedback:'✅ Kernig\'s and Brudzinski\'s signs. GCS in infants uses modified scale.', phase:'assessment' },
      { id:'abx_before_transfer', label:'Advise: IV Ceftriaxone 100mg/kg BEFORE transfer', correct:true, feedback:'✅ Do not delay antibiotics for LP in suspected meningitis. Give NOW.', phase:'plan' },
      { id:'lp_guidance', label:'LP after CT if no contraindications', correct:true, feedback:'✅ LP confirms diagnosis. Do not delay antibiotics for LP.', phase:'plan' },
      { id:'dexamethasone', label:'Dexamethasone 0.15mg/kg with first antibiotic dose', correct:true, feedback:'✅ Reduces meningitis complications, especially hearing loss.', phase:'plan' },
      { id:'parents_comms', label:'Speak directly with parents — explain urgency', correct:true, feedback:'✅ Parental communication reduces anxiety and improves compliance.', phase:'handover' },
      { id:'handover_paeds', label:'SBAR handover to paediatric emergency team', correct:true, feedback:'✅ Include: fontanelle status, antibiotic time, rash check, parental consent.', phase:'handover' },
    ],
    wrongActions: [
      { id:'wait_for_rash', label:'Wait and monitor — no rash yet', correct:false, feedback:'❌ Rash appears LATE in meningococcal disease. Bulging fontanelle = act NOW.', phase:'intro' },
      { id:'oral_abx', label:'Start oral amoxicillin and review in 24h', correct:false, feedback:'❌ Bacterial meningitis requires IV antibiotics and immediate hospitalisation.', phase:'plan' },
      { id:'lp_before_abx', label:'Perform LP before giving antibiotics', correct:false, feedback:'❌ Never delay antibiotics for LP in meningitis. Give antibiotics first.', phase:'plan' },
    ],
    handoverTemplate: `SITUATION: 8-month-old with suspected bacterial meningitis — bulging fontanelle, high fever.

BACKGROUND: Previously well. Temp 39.8°C. Irritable, refusing feeds. No rash at time of call.

ASSESSMENT: Red flags: bulging fontanelle, age < 12 months, feeding refusal. Meningitis until proven otherwise.

RECOMMENDATION: IV Ceftriaxone 100mg/kg given at 14:32 by GP before transfer. Dexamethasone 0.15mg/kg given. LP planned on arrival if no contraindications. CT head if signs of raised ICP. Parents informed and en route.`,
    xpReward: 100,
    learning: [
      'Bulging fontanelle = meningitis until proven otherwise — never delay antibiotics',
      'Purpuric rash check is critical — absence does NOT exclude meningococcal disease',
      'IV Ceftriaxone should be given BEFORE transfer in suspected meningitis',
      'Dexamethasone with first dose reduces complications including hearing loss',
      'LP should never delay antibiotic treatment',
    ],
  },
]

const GUIDELINES = [
  {
    title: 'Teleconsultation Standards',
    color: '#00C4B4',
    icon: '📋',
    points: [
      'Always use SBAR framework for referrals and handover',
      'Confirm patient ID, location, and referring physician at start',
      'Document all advice given with timestamp',
      'Establish clear escalation pathway before ending call',
      'Ensure receiving team has accepting physician name',
    ]
  },
  {
    title: 'SBAR Framework',
    color: '#30d158',
    icon: '🗣️',
    points: [
      'S — Situation: What is happening right now?',
      'B — Background: Relevant history and context',
      'A — Assessment: Your clinical judgment',
      'R — Recommendation: What you need/suggest',
      'Repeat-back: receiver repeats key points to confirm',
    ]
  },
  {
    title: 'Telestroke Protocol',
    color: '#ff453a',
    icon: '🧠',
    points: [
      'Remote NIHSS assessment within 10 min of call',
      'CT images reviewed via PACS within 15 min',
      'tPA decision made within 20 min of consultation',
      'Thrombectomy team alerted simultaneously',
      'Door-to-needle target: < 60 min',
    ]
  },
  {
    title: 'Telecardiology — STEMI',
    color: '#ff453a',
    icon: '🫀',
    points: [
      'Tele-ECG transmission within 5 min of first contact',
      'Cath Lab activation by teleconsultant remotely',
      'Door-to-balloon target: < 90 min',
      'Dual antiplatelet given before transfer',
      'Continuous monitoring during transfer mandatory',
    ]
  },
  {
    title: 'Patient Safety in Teleconsult',
    color: '#ff9f0a',
    icon: '🛡️',
    points: [
      'Never give advice on incomplete information',
      'Always recommend emergency transfer if in doubt',
      'Document: time, advice given, follow-up plan',
      'Informed consent for remote consultation',
      'Clear handover = reduced adverse events',
    ]
  },
]

const C = {
  card: 'rgba(36,63,82,0.60)',
  border: 'rgba(0,196,180,0.25)',
  text: 'white',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.28)',
}

export default function TeleconsultModule({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<View>('menu')
  const [activeCase, setActiveCase] = useState<TeleCase|null>(null)
  const [phase, setPhase] = useState<SessionPhase>('intro')
  const [done, setDone] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [errors, setErrors] = useState(0)
  const [score, setScore] = useState(0)
  const [showHandover, setShowHandover] = useState(false)

  const PHASES: SessionPhase[] = ['intro','history','assessment','plan','handover']
  const phaseLabels: Record<SessionPhase,string> = {
    intro:'Accept Call', history:'Take History', assessment:'Assessment',
    plan:'Management Plan', handover:'Handover', complete:'Complete'
  }
  const phaseColors: Record<SessionPhase,string> = {
    intro:'#ff453a', history:'#ff9f0a', assessment:'#00C4B4',
    plan:'#30d158', handover:'#bf5af2', complete:'#ffd60a'
  }

  const startCase = (c: TeleCase) => {
    setActiveCase(c); setPhase('intro'); setDone([]); setFeedback(''); setErrors(0); setScore(0); setShowHandover(false); setView('session')
  }

  const handleAction = (action: Action) => {
    if(done.includes(action.id)) return
    setDone(d=>[...d,action.id])
    setFeedback(action.feedback)
    if(action.correct) {
      setScore(s=>s+1)
    } else {
      setErrors(e=>e+1)
    }
  }

  const allPhaseActions = (p: SessionPhase) => {
    if(!activeCase) return []
    return [...activeCase.correctActions, ...activeCase.wrongActions].filter(a=>a.phase===p)
  }

  const phaseProgress = PHASES.indexOf(phase)

  // ── MENU ──
  if(view==='menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{marginBottom:18}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(0,196,180,0.12)',border:'1px solid rgba(0,196,180,0.25)',borderRadius:20,padding:'4px 14px',marginBottom:10}}>
          <span style={{fontSize:11}}>💻</span>
          <span style={{fontSize:11,fontWeight:800,color:'#00C4B4',letterSpacing:1}}>TELECONSULTATION</span>
        </div>
        <h1 style={{fontSize:26,fontWeight:900,color:C.text,margin:'0 0 4px',letterSpacing:-0.5}}>Tele Training</h1>
        <p style={{fontSize:13,color:C.sub,margin:0}}>Remote consultation · SBAR · 4 specialties</p>
      </div>

      {/* Cases */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Consultation Cases</div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>startCase(c)}
          style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${c.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${c.color}10`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`${c.color}10`,filter:'blur(20px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:50,height:50,borderRadius:15,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:2}}>{c.title}</div>
              <div style={{fontSize:11,color:C.sub}}>{c.specialty}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10,padding:'3px 10px',borderRadius:10,background:c.urgency==='Emergency'?'rgba(255,69,58,0.15)':c.urgency==='Urgent'?'rgba(255,159,10,0.15)':'rgba(48,209,88,0.15)',color:c.urgency==='Emergency'?'#ff453a':c.urgency==='Urgent'?'#ff9f0a':'#30d158',fontWeight:800,border:`1px solid ${c.urgency==='Emergency'?'rgba(255,69,58,0.3)':c.urgency==='Urgent'?'rgba(255,159,10,0.3)':'rgba(48,209,88,0.3)'}`}}>{c.urgency}</div>
              <div style={{fontSize:10,color:'#ffd60a',fontWeight:700,marginTop:4}}>+{c.xpReward} XP</div>
            </div>
          </div>
          <div style={{background:`${c.color}08`,borderRadius:12,padding:'10px 12px',border:`1px solid ${c.color}15`}}>
            <div style={{fontSize:10,color:c.color,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>📞 REFERRAL REASON</div>
            <div style={{fontSize:12,color:C.sub}}>{c.referralReason}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>{c.patient}</div>
          </div>
        </div>
      ))}

      {/* Guidelines */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,margin:'16px 0 10px'}}>Reference</div>
      <div onClick={()=>setView('guidelines')}
        style={{background:'linear-gradient(135deg,rgba(0,196,180,0.12),rgba(0,196,180,0.08))',borderRadius:20,padding:'16px',border:'1px solid rgba(0,196,180,0.20)',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
        <div style={{fontSize:32}}>📚</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>Teleconsult Guidelines</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3}}>SBAR · Telestroke · Telecardiology · Safety</div>
        </div>
        <div style={{fontSize:22,color:'rgba(10,132,255,0.4)'}}>›</div>
      </div>
    </div>
  )

  // ── GUIDELINES ──
  if(view==='guidelines') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>📚 Guidelines</div>
          <div style={{fontSize:11,color:C.sub}}>Teleconsultation standards</div>
        </div>
      </div>
      {GUIDELINES.map(g=>(
        <div key={g.title} style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${g.color}20`}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:38,height:38,borderRadius:12,background:`${g.color}18`,border:`1px solid ${g.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{g.icon}</div>
            <div style={{fontSize:14,fontWeight:800,color:C.text}}>{g.title}</div>
          </div>
          {g.points.map((p,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<g.points.length-1?`1px solid rgba(36,63,82,0.50)`:'none'}}>
              <div style={{width:22,height:22,borderRadius:7,background:`${g.color}18`,border:`1px solid ${g.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:g.color,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5,fontWeight:500}}>{p}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  // ── SESSION ──
  if(view==='session'&&activeCase) {
    const c = activeCase
    const phaseActions = allPhaseActions(phase)
    const pct = ((phaseProgress+1)/PHASES.length)*100
    const color = phaseColors[phase]

    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← End</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:C.text}}>{c.icon} {c.title}</div>
            <div style={{fontSize:11,color:C.sub}}>{c.specialty} · {c.urgency}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#30d158'}}>✅ {score}</div>
            <div style={{fontSize:11,color:'#ff453a'}}>❌ {errors}</div>
          </div>
        </div>

        {/* Phase progress */}
        <div style={{marginBottom:14}}>
          <div style={{display:'flex',gap:4,marginBottom:8}}>
            {PHASES.map((p,i)=>(
              <div key={p} style={{flex:1,height:4,borderRadius:2,background:i<=phaseProgress?phaseColors[p]:'rgba(255,255,255,0.18)',boxShadow:i===phaseProgress?`0 0 8px ${phaseColors[p]}88`:'none',transition:'all 0.3s'}}/>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:11,color:color,fontWeight:700}}>{phaseLabels[phase]}</span>
            <span style={{fontSize:11,color:C.muted}}>Phase {phaseProgress+1}/{PHASES.length}</span>
          </div>
        </div>

        {/* Patient card */}
        <div style={{background:`${c.color}10`,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${c.color}25`}}>
          <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{fontSize:32}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:4}}>{c.patient}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.7}}>{c.background}</div>
            </div>
          </div>
          {/* Key findings */}
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
            {c.keyFindings.map(f=>(
              <span key={f} style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,border:`1px solid ${c.color}25`,fontWeight:600}}>{f}</span>
            ))}
          </div>
          {/* Red flags */}
          {phase==='intro'&&(
            <div style={{marginTop:10}}>
              {c.redFlags.map(r=>(
                <div key={r} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
                  <span style={{color:'#ff453a',fontSize:12}}>⚠️</span>
                  <span style={{fontSize:11,color:'rgba(255,69,58,0.9)',fontWeight:600}}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback&&(
          <div style={{background:feedback.startsWith('✅')?'rgba(48,209,88,0.1)':'rgba(255,69,58,0.1)',borderRadius:14,padding:'12px 14px',marginBottom:12,border:`1px solid ${feedback.startsWith('✅')?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`,animation:'fadeIn 0.3s ease'}}>
            <div style={{fontSize:13,color:feedback.startsWith('✅')?'#86efac':'#fca5a5',fontWeight:600,lineHeight:1.6}}>{feedback}</div>
          </div>
        )}

        {/* Actions for current phase */}
        <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>{phaseLabels[phase]} — Choose action</div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {phaseActions.map(action=>{
            const isDone = done.includes(action.id)
            return (
              <div key={action.id} onClick={()=>handleAction(action)}
                style={{background:isDone?(action.correct?'rgba(48,209,88,0.1)':'rgba(255,69,58,0.1)'):C.card,borderRadius:16,padding:'14px 16px',border:isDone?(action.correct?'1px solid rgba(48,209,88,0.3)':'1px solid rgba(255,69,58,0.3)'):`1px solid ${C.border}`,cursor:isDone?'default':'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s',boxShadow:isDone?(action.correct?'0 4px 16px rgba(48,209,88,0.1)':'0 4px 16px rgba(255,69,58,0.1)'):'none'}}>
                <div style={{width:32,height:32,borderRadius:10,background:isDone?(action.correct?'rgba(48,209,88,0.2)':'rgba(255,69,58,0.2)'):`${color}15`,border:`1px solid ${isDone?(action.correct?'rgba(48,209,88,0.4)':'rgba(255,69,58,0.4)'):color+'30'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                  {isDone?(action.correct?'✅':'❌'):'▷'}
                </div>
                <div style={{fontSize:13,color:isDone?(action.correct?'#86efac':'#fca5a5'):'rgba(255,255,255,0.85)',fontWeight:600,flex:1,lineHeight:1.4}}>{action.label}</div>
              </div>
            )
          })}
        </div>

        {/* Handover template */}
        {phase==='handover'&&(
          <div style={{marginBottom:14}}>
            <button onClick={()=>setShowHandover(!showHandover)} style={{width:'100%',padding:'12px',borderRadius:14,border:'1px solid rgba(0,196,180,0.3)',background:'rgba(0,196,180,0.1)',color:'#6ee7e1',fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:showHandover?10:0}}>
              📋 {showHandover?'Hide':'View'} SBAR Handover Template
            </button>
            {showHandover&&(
              <div style={{background:'rgba(36,63,82,0.40)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(0,196,180,0.2)'}}>
                <div style={{fontSize:11,color:'#bf5af2',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📋 SBAR HANDOVER</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.85,whiteSpace:'pre-line'}}>{c.handoverTemplate}</div>
              </div>
            )}
          </div>
        )}

        {/* Next phase / Complete */}
        {phaseProgress < PHASES.length-1 ? (
          <button onClick={()=>setPhase(PHASES[phaseProgress+1])}
            style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${color},${color}aa)`,color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 6px 20px ${color}44`}}>
            Next: {phaseLabels[PHASES[phaseProgress+1]]} →
          </button>
        ) : (
          <button onClick={()=>{onXP&&onXP(Math.round((score/(activeCase.correctActions.length))*activeCase.xpReward));setView('debrief')}}
            style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#0a84ff)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(48,209,88,0.4)'}}>
            ✅ Complete Consultation
          </button>
        )}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    )
  }

  // ── DEBRIEF ──
  if(view==='debrief'&&activeCase) {
    const c = activeCase
    const xpEarned = Math.round((score/c.correctActions.length)*c.xpReward)
    const pct = Math.round((score/c.correctActions.length)*100)
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{background:`linear-gradient(145deg,${c.color}18,${c.color}06)`,borderRadius:24,padding:'24px 20px',marginBottom:14,border:`1px solid ${c.color}30`,textAlign:'center',boxShadow:`0 8px 32px ${c.color}20`}}>
          <div style={{fontSize:52,marginBottom:12,filter:`drop-shadow(0 0 20px ${c.color}88)`}}>{pct>=80?'🏆':pct>=60?'🎖️':'📚'}</div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:4,letterSpacing:-1}}>{pct}%</div>
          <div style={{fontSize:16,fontWeight:700,color:pct>=80?'#30d158':pct>=60?'#ff9f0a':'#ff453a',marginBottom:8}}>
            {pct>=80?'Excellent Teleconsultant!':pct>=60?'Good — review debrief':'Review guidelines'}
          </div>
          <div style={{fontSize:13,color:C.sub}}>+{xpEarned} XP · {score}/{c.correctActions.length} correct</div>
        </div>

        {/* Learning points */}
        <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Key Learning Points</div>
        {c.learning.map((l,i)=>(
          <div key={i} style={{background:C.card,borderRadius:14,padding:'12px 14px',marginBottom:8,border:`1px solid ${c.color}20`,display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{width:24,height:24,borderRadius:8,background:`${c.color}20`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:c.color,flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>{l}</div>
          </div>
        ))}

        {/* SBAR reminder */}
        <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.1),rgba(10,132,255,0.08))',borderRadius:18,padding:'16px',marginBottom:14,border:'1px solid rgba(0,196,180,0.2)'}}>
          <div style={{fontSize:13,fontWeight:800,color:'#6ee7e1',marginBottom:10}}>📋 SBAR Handover</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.85,whiteSpace:'pre-line'}}>{c.handoverTemplate}</div>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>startCase(c)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${c.color}30`,background:`${c.color}10`,color:c.color,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
          <button onClick={()=>{setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.4)'}}>← Cases</button>
        </div>
      </div>
    )
  }

  return null
}
