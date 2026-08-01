'use client'
import { useState, useEffect } from 'react'

type View = 'menu' | 'grand_rounds' | 'patient_journey' | 'crossover'
type JourneyPhase = 'symptoms' | 'decision' | 'arrival' | 'diagnosis' | 'treatment' | 'outcome'

const C = {
  card: 'rgba(255,255,255,0.14)',
  border: 'rgba(0,196,180,0.25)',
  text: '#EEF6FA',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

// ── GRAND ROUNDS DATA ──
const GRAND_ROUNDS = [
  {
    id: 'gr1',
    week: 'Week 1 · July 2026',
    journal: 'NEJM',
    color: '#ff453a',
    title: 'Enigmatic Fever in a Returning Traveller',
    patient: '34M returned from sub-Saharan Africa. 12-day fever, rigors, thrombocytopenia, elevated LDH.',
    keyFindings: ['Fever 39.8°C for 12 days','Platelets 68 × 10⁹/L','LDH 580 IU/L','Splenomegaly on USS','Thin blood film pending'],
    hiddenDx: 'Plasmodium falciparum Malaria',
    ddx: ['Malaria','Typhoid fever','Dengue','Viral haemorrhagic fever','Leptospirosis'],
    correctDx: 0,
    aiAnalysis: `This case from NEJM represents a classic presentation of severe falciparum malaria.

KEY REASONING:
• Sub-Saharan Africa exposure + fever + thrombocytopenia = malaria until proven otherwise
• LDH elevation suggests haemolysis (RBC destruction by Plasmodium)
• Splenomegaly typical of chronic/acute malaria
• Thin/thick blood film remains gold standard for diagnosis

MANAGEMENT (WHO 2023):
1. IV Artesunate — first-line for severe malaria
2. Strict input/output monitoring
3. Blood glucose every 4h (hypoglycaemia risk)
4. ICU admission if >2% parasitaemia
5. Repeat films at 24h, 48h, 72h

LEARNING: Every fever in returning traveller = malaria screen first. Rapid Antigen Test (RDT) + blood film simultaneously.`,
    questions: [
      {q:'First investigation in returning traveller with fever?', opts:['Blood culture','Malaria RDT + blood film','Chest X-ray','HIV test'], correct:1, explain:'Malaria RDT + thick/thin blood film simultaneously — fastest and most sensitive. Never exclude malaria on single negative film; repeat at 12-24h intervals.'},
      {q:'First-line treatment for severe falciparum malaria?', opts:['Oral chloroquine','IV Artesunate','IV Quinine','Oral Artemether-Lumefantrine'], correct:1, explain:'IV Artesunate is WHO 2023 first-line for severe malaria. Superior to IV quinine (AQUAMAT trial). Switch to oral after 24h if tolerating.'},
    ]
  },
  {
    id: 'gr2',
    week: 'Week 2 · July 2026',
    journal: 'Lancet',
    color: '#00C4B4',
    title: 'Breathless at 28',
    patient: '28F non-smoker, progressive dyspnoea 4 months. SpO2 88% at rest. No cough. Echo: PAP 68mmHg.',
    keyFindings: ['SpO2 88% at rest','PAP 68mmHg on echo','No cardiac cause found','6MWT: 220m (severely limited)','RHC: mPAP 52mmHg'],
    hiddenDx: 'Idiopathic Pulmonary Arterial Hypertension (IPAH)',
    ddx: ['IPAH','Chronic PE','Left heart disease','Interstitial lung disease','Connective tissue disease'],
    correctDx: 0,
    aiAnalysis: `This Lancet case highlights idiopathic PAH — a devastating condition often diagnosed late.

KEY REASONING:
• Young woman + progressive dyspnoea + no cardiac/pulmonary cause = think PAH
• mPAP > 25mmHg on RHC = definition of pulmonary hypertension
• WHO Group 1 (PAH) requires RHC for diagnosis
• 6MWT < 300m = severe functional limitation

MANAGEMENT (ESC 2022):
1. Phosphodiesterase-5 inhibitors (Sildenafil/Tadalafil)
2. Endothelin receptor antagonists (Ambrisentan/Macitentan)
3. Prostacyclin pathway (Selexipag/IV Epoprostenol for severe)
4. Avoid pregnancy — high mortality
5. Lung transplant for refractory disease

LEARNING: Dyspnoea in young woman without obvious cause → echo first → if PAP elevated → RHC for definitive diagnosis.`,
    questions: [
      {q:'Gold standard for diagnosing pulmonary hypertension?', opts:['Echocardiogram','CT pulmonary angiography','Right heart catheterisation','V/Q scan'], correct:2, explain:'Right heart catheterisation (RHC) is gold standard. mPAP ≥ 25mmHg at rest defines PH. Echo estimates but RHC confirms and guides therapy.'},
      {q:'Why is pregnancy dangerous in PAH?', opts:['Drug teratogenicity only','Haemodynamic changes cause RV failure and death','Infection risk','All medications contraindicated'], correct:1, explain:'Pregnancy causes 30-50% increase in cardiac output. Fixed pulmonary vascular resistance cannot accommodate → acute RV failure. Maternal mortality 30-50% in PAH.'},
    ]
  },
  {
    id: 'gr3',
    week: 'Week 3 · July 2026',
    journal: 'JAMA',
    color: '#30d158',
    title: 'The Confused Athlete',
    patient: '22M competitive marathon runner. Post-race confusion, seizing. Na+ 118 mmol/L. Ran 42km in heat.',
    keyFindings: ['Na+ 118 mmol/L','Seizing post-race','Temperature 37.2°C (normal)','Urine dilute','Consumed 6L water during race'],
    hiddenDx: 'Exercise-Associated Hyponatraemia (EAH)',
    ddx: ['Exercise-associated hyponatraemia','Heat stroke','Hypoglycaemia','Traumatic brain injury','SIADH'],
    correctDx: 0,
    aiAnalysis: `This JAMA case illustrates a dangerous and preventable condition in endurance athletes.

KEY REASONING:
• Endurance athlete + hyponatraemia + seizures = EAH until proven otherwise
• Over-hydration with water (not electrolytes) is the mechanism
• Normal temperature excludes heat stroke
• Dilute urine = still excreting water (different from SIADH)

MANAGEMENT (Wilderness Medical Society 2023):
1. 3% NaCl 100ml IV bolus — immediate for symptomatic EAH
2. Repeat if seizures continue (max 3 doses)
3. DO NOT give isotonic fluids — will worsen sodium
4. Target Na rise: 1-2 mmol/L per hour until symptom-free
5. Max rise: 8 mmol/L in 24h (osmotic demyelination risk)

PREVENTION: Drink to thirst only. Sports drinks not pure water.`,
    questions: [
      {q:'Immediate treatment for symptomatic EAH with seizures?', opts:['0.9% NaCl 1L fast','3% NaCl 100ml IV bolus','Restrict all fluids','Mannitol 1g/kg'], correct:1, explain:'3% hypertonic saline 100ml IV bolus — rapid Na rise of 2-3 mmol/L stops seizures. Isotonic saline contraindicated — will not correct hyponatraemia.'},
      {q:'Maximum safe Na correction rate to prevent osmotic demyelination?', opts:['4 mmol/L/day','8 mmol/L/day','12 mmol/L/day','As fast as possible'], correct:1, explain:'Max 8 mmol/L in first 24h (some guidelines: 10). Too rapid correction → central pontine myelinolysis → irreversible quadriplegia and dysarthria.'},
    ]
  },
]

// ── PATIENT JOURNEY CASES ──
const JOURNEY_CASES = [
  {
    id: 'journey_stemi',
    title: 'I Think I\'m Having a Heart Attack',
    color: '#ff453a',
    icon: '🫀',
    yourAge: '58M',
    phases: [
      {
        phase: 'symptoms' as JourneyPhase,
        title: 'You notice something wrong',
        story: 'It\'s 2:14 AM. You wake with crushing pressure in your chest — like an elephant sitting on you. Pain radiates to your left arm. You\'re sweating despite the cold room. Your wife asks if you\'re okay.',
        choices: [
          {label:'Take paracetamol and try to sleep', correct:false, impact:'high', consequence:'Every minute without treatment = 2 million dead heart cells. This could be fatal.', energyCost:30},
          {label:'Call emergency services immediately', correct:true, consequence:'✅ Correct. Time is muscle. Calling 999/911 immediately is life-saving.', energyCost:0},
          {label:'Drive yourself to hospital', correct:false, impact:'high', consequence:'Driving with possible STEMI risks your life and others. You could collapse at the wheel.', energyCost:20},
          {label:'Wake wife + call ambulance together', correct:true, consequence:'✅ Perfect. Someone with you + ambulance en route = safest option.', energyCost:0},
        ]
      },
      {
        phase: 'arrival' as JourneyPhase,
        title: 'Paramedics arrive — 8 minutes',
        story: 'The paramedics rush in. They put sticky pads on your chest. "We\'re doing an ECG," one says. The other starts an IV line in your arm. You feel terrified.',
        choices: [
          {label:'Refuse the ECG — you hate wires', correct:false, impact:'medium', consequence:'ECG diagnoses STEMI in seconds. Refusing delays life-saving treatment.', energyCost:20},
          {label:'Ask what the ECG shows', correct:true, consequence:'✅ Good. Understanding your care reduces anxiety and helps cooperation.', energyCost:0},
          {label:'Tell them about all your medications', correct:true, consequence:'✅ Essential. Knowing your medications (especially anticoagulants) affects treatment.', energyCost:0},
          {label:'Say you feel better and refuse hospital', correct:false, impact:'high', consequence:'STEMI symptoms can temporarily ease — the artery is still blocked. Refusing = death risk.', energyCost:30},
        ]
      },
      {
        phase: 'diagnosis' as JourneyPhase,
        title: 'ED — Diagnosis confirmed',
        story: 'The ED doctor shows you the ECG. "You have what we call a STEMI — a heart attack. We need to take you to the Cath Lab immediately to open the blocked artery." Your wife is crying.',
        choices: [
          {label:'Ask how long the procedure takes', correct:true, consequence:'✅ Reasonable question. Understanding the plan reduces fear.', energyCost:0},
          {label:'Refuse — you\'re scared of the procedure', correct:false, impact:'high', consequence:'Without PCI, your heart muscle dies permanently. Fear is understandable but delay is dangerous.', energyCost:30},
          {label:'Ask about risks and alternatives', correct:true, consequence:'✅ Your right as a patient. Doctor will explain PCI vs thrombolysis options.', energyCost:0},
          {label:'Sign consent and trust the team', correct:true, consequence:'✅ Informed trust saves lives. The Cath Lab team do this every day.', energyCost:0},
        ]
      },
      {
        phase: 'treatment' as JourneyPhase,
        title: 'Cath Lab — The procedure',
        story: 'You\'re awake but sedated. You can see the screens showing your arteries. The cardiologist says "I can see the blockage — I\'m opening it now." You feel a strange warmth in your chest.',
        choices: [
          {label:'Stay calm and follow instructions', correct:true, consequence:'✅ Patient cooperation during PCI is critical for safety.', energyCost:0},
          {label:'Try to sit up and look at the screen', correct:false, impact:'medium', consequence:'Moving during PCI is dangerous — could dislodge the catheter.', energyCost:15},
          {label:'Tell the team if you feel chest pain', correct:true, consequence:'✅ Communication during the procedure is encouraged and important.', energyCost:0},
          {label:'Ask if the stent will last forever', correct:true, consequence:'✅ Valid question. Stents last indefinitely but require dual antiplatelet therapy.', energyCost:0},
        ]
      },
      {
        phase: 'outcome' as JourneyPhase,
        title: 'Recovery — What now?',
        story: 'The cardiologist visits you next morning. "The stent is in and your artery is open. You were lucky — you came in time." You have questions about life after a heart attack.',
        choices: [
          {label:'Ask when you can drive again', correct:true, consequence:'✅ Important question. DVLA/DMV rules apply — typically 4 weeks minimum.', energyCost:0},
          {label:'Ask about your medications — how long?', correct:true, consequence:'✅ Dual antiplatelet (aspirin + ticagrelor) for 12 months minimum. Never stop without asking.', energyCost:0},
          {label:'Decide to stop your medications once home', correct:false, impact:'high', consequence:'Stopping antiplatelet therapy = stent thrombosis risk. This can cause fatal heart attack.', energyCost:30},
          {label:'Ask about cardiac rehabilitation', correct:true, consequence:'✅ Cardiac rehab reduces re-admission by 30% and improves outcomes significantly.', energyCost:0},
        ]
      },
    ]
  },
  {
    id: 'journey_stroke',
    title: 'When Words Stop Making Sense',
    color: '#00C4B4',
    icon: '🧠',
    yourAge: '67F',
    phases: [
      {
        phase: 'symptoms' as JourneyPhase,
        title: 'Something feels wrong',
        story: 'You\'re having breakfast. Suddenly your right hand drops your cup. You try to say "I\'m okay" to your husband but the words come out jumbled. Your face feels strange — numb on one side.',
        choices: [
          {label:'Try to rest — you\'re probably just tired', correct:false, impact:'high', consequence:'Stroke symptoms that resolve can return worse. Rest wastes critical treatment time.', energyCost:30},
          {label:'Ask husband to call 999 immediately', correct:true, consequence:'✅ FAST: Face drooping, Arm weakness, Speech problems, Time to call. Every second counts.', energyCost:0},
          {label:'Use FAST: Face, Arm, Speech, Time', correct:true, consequence:'✅ Perfect. FAST recognition saves lives. You\'re within the treatment window.', energyCost:0},
          {label:'Take aspirin and wait 30 minutes', correct:false, impact:'high', consequence:'Do not give aspirin without brain scan — if haemorrhagic stroke, aspirin is fatal.', energyCost:30},
        ]
      },
      {
        phase: 'arrival' as JourneyPhase,
        title: 'Hospital — Stroke team activated',
        story: 'The ambulance arrives in 6 minutes. Paramedics do a quick assessment. "We\'re taking you straight to the stroke unit — they\'re waiting for you." You arrive at hospital. A team of 4 is ready.',
        choices: [
          {label:'Tell them when symptoms started exactly', correct:true, consequence:'✅ Time of last seen well is critical for tPA eligibility. Be as precise as possible.', energyCost:0},
          {label:'Ask if you\'ll be paralysed', correct:true, consequence:'✅ Valid concern. Early treatment with tPA or thrombectomy dramatically improves outcomes.', energyCost:0},
          {label:'Demand to wait for your family doctor', correct:false, impact:'high', consequence:'Stroke is time-critical. Delaying for any reason risks permanent disability.', energyCost:30},
          {label:'Cooperate with CT scan immediately', correct:true, consequence:'✅ CT within 15 min of arrival is the target. You\'re helping save your own brain.', energyCost:0},
        ]
      },
      {
        phase: 'treatment' as JourneyPhase,
        title: 'The clot-busting decision',
        story: '"Good news — no bleeding on the scan. You\'re eligible for tPA — the clot-busting drug. It has a small risk of bleeding but could reverse your stroke completely. The decision is yours."',
        choices: [
          {label:'Refuse — scared of bleeding risk', correct:false, impact:'high', consequence:'Without tPA, you\'re at higher risk of permanent disability. Benefit outweighs risk in eligible patients.', energyCost:20},
          {label:'Ask about the bleeding risk specifically', correct:true, consequence:'✅ Right to know: 6% risk of brain bleed vs potential full recovery. Your neurologist will guide you.', energyCost:0},
          {label:'Accept tPA and sign consent', correct:true, consequence:'✅ Within window, eligible patient: tPA significantly improves outcomes. Good decision.', energyCost:0},
          {label:'Ask if thrombectomy is also an option', correct:true, consequence:'✅ Excellent question. If large vessel occlusion, thrombectomy + tPA gives best outcome.', energyCost:0},
        ]
      },
      {
        phase: 'outcome' as JourneyPhase,
        title: '24 hours later — Recovery begins',
        story: 'Your speech has improved significantly. Your arm is weaker but moving. The physiotherapist visits: "Early rehabilitation is critical — we start today."',
        choices: [
          {label:'Refuse physio — need to rest', correct:false, impact:'medium', consequence:'Early mobilisation after stroke improves outcomes. Bed rest increases complications.', energyCost:20},
          {label:'Engage fully with rehabilitation team', correct:true, consequence:'✅ Neuroplasticity is highest in first weeks. Intensive rehab now = better long-term recovery.', energyCost:0},
          {label:'Ask why this happened to you', correct:true, consequence:'✅ Finding the cause (AF? carotid stenosis?) prevents future strokes. Secondary prevention is vital.', energyCost:0},
          {label:'Ask about stroke prevention medications', correct:true, consequence:'✅ Anticoagulation for AF, antiplatelet for non-cardioembolic. Address all risk factors.', energyCost:0},
        ]
      },
    ]
  },
]

// ── SPECIALTY CROSSOVER ──
const CROSSOVER_CASES = [
  {
    id: 'cross_pe',
    title: 'One Patient — Four Perspectives',
    color: '#00C4B4',
    patient: '44F, 3 weeks post-op hip replacement, acute dyspnoea, SpO2 88%, HR 120, Wells score 7.5',
    perspectives: [
      {
        specialty: 'Emergency Medicine',
        icon: '🚨',
        color: '#ff453a',
        role: 'ED Consultant',
        priority: 'Stabilise first, diagnose fast',
        actions: ['ABCDE assessment — O2, IV access, monitoring','Wells score → high probability PE','CTPA ordered — not V/Q (faster, more accurate)','Anticoagulate before scan if stable','Activate PE response team'],
        insight: 'From my perspective: time-critical. If haemodynamically unstable → bedside echo → if RV dilation → thrombolysis without waiting for CTPA.',
        keyDrug: 'Heparin 80u/kg bolus now'
      },
      {
        specialty: 'Nursing',
        icon: '🩺',
        color: '#64d2ff',
        role: 'Senior ED Nurse',
        priority: 'Safety, monitoring, patient support',
        actions: ['Continuous SpO2 + HR monitoring','Position: sitting up at 45° — improves breathing','Two large-bore IV cannulae','Calm reassurance — patient extremely anxious','Prepare thrombolysis equipment (just in case)','Document exact symptom onset time'],
        insight: 'The patient is terrified. While the team works — I hold her hand and explain every step. Psychological safety matters as much as physical care.',
        keyDrug: 'Oxygen to keep SpO2 > 94%'
      },
      {
        specialty: 'Pharmacy',
        icon: '💊',
        color: '#30d158',
        role: 'Clinical Pharmacist',
        priority: 'Right drug, right dose, right monitoring',
        actions: ['Check current medications — any anticoagulants?','Check renal function before LMWH dosing','Enoxaparin 1.5mg/kg SC if stable + CrCl > 30','If unstable → UFH IV (easier to reverse)','DOAC after 5-10 days bridging','Check drug interactions — NSAIDs, antiplatelet'],
        insight: 'She\'s on the orthopaedic ward — probably on aspirin + prophylactic LMWH. Full therapeutic anticoagulation now needed. I calculate the dose based on her weight and renal function.',
        keyDrug: 'Enoxaparin 1mg/kg BD or 1.5mg/kg OD'
      },
      {
        specialty: 'Laboratory',
        icon: '🔬',
        color: '#bf5af2',
        role: 'Lab Specialist',
        priority: 'Rapid, accurate results to guide management',
        actions: ['D-Dimer: if < 500 = excludes PE (but her pre-test probability is high)','ABG: hypoxaemia + respiratory alkalosis expected','Troponin: RV strain marker — guides severity','BNP: elevated = worse prognosis','Cross-match in case thrombolysis needed','APTT if starting UFH — baseline + q6h monitoring'],
        insight: 'Her D-Dimer will definitely be high — post-op day 21, it\'s expected. I flag this to the team. What matters is the troponin: if elevated = high-risk PE needing ICU.',
        keyDrug: 'Monitoring: APTT 60-100s if on UFH'
      },
    ]
  },
  {
    id: 'cross_sepsis',
    title: 'Septic Shock — Every Role Matters',
    color: '#ff9f0a',
    patient: '67M, 3h history fever, BP 72/40, HR 138, Temp 39.8, Lactate 5.2, source: pneumonia',
    perspectives: [
      {
        specialty: 'Emergency Medicine',
        icon: '🚨',
        color: '#ff453a',
        role: 'ED Consultant',
        priority: 'Sepsis 6 bundle within 1 hour',
        actions: ['Activate sepsis pathway immediately','Blood cultures × 2 BEFORE antibiotics','IV Pip-Taz 4.5g within 1 hour','Fluid bolus 500ml crystalloid — reassess','Noradrenaline if MAP < 65 despite fluids','Lactate target: clearance > 10% per 2h'],
        insight: 'Every hour delay in antibiotics increases mortality 7%. I\'m managing 4 other patients but this is the sickest — I\'m here.',
        keyDrug: 'Pip-Taz 4.5g IV + Noradrenaline if needed'
      },
      {
        specialty: 'Nursing',
        icon: '🩺',
        color: '#64d2ff',
        role: 'Resus Nurse',
        priority: 'Execute the bundle, protect the patient',
        actions: ['Two large-bore IVs — antecubital first','Urinary catheter — strict hourly output','Blood cultures BEFORE antibiotics — 2 sets','Fluid balance chart: every 30 min','Family liaison — they are outside, terrified','Reassess AVPU and vitals every 15 min'],
        insight: 'In the chaos of resus, I am the anchor. I call out vital signs as they change. I am the eyes and ears of the team.',
        keyDrug: 'Crystalloid 30ml/kg — then reassess'
      },
      {
        specialty: 'Pharmacy',
        icon: '💊',
        color: '#30d158',
        role: 'Clinical Pharmacist',
        priority: 'Antibiotic optimisation and safety',
        actions: ['Pip-Taz appropriate for community pneumonia','Check allergy status FIRST — any penicillin allergy?','Renal function — adjust gentamicin if added','Hydrocortisone 200mg/day if vasopressor-refractory','De-escalate antibiotics at 48-72h based on cultures','Stress ulcer prophylaxis (PPI) + DVT prophylaxis'],
        insight: 'He has a penicillin allergy documented. I intercept before the Pip-Taz goes up — switch to Meropenem + clarithromycin. This could save his life.',
        keyDrug: 'Meropenem 1g TDS (if penicillin allergy)'
      },
      {
        specialty: 'Laboratory',
        icon: '🔬',
        color: '#bf5af2',
        role: 'Lab Specialist',
        priority: 'Rapid results to guide every decision',
        actions: ['Blood cultures: 2 sets, aerobic + anaerobic','Lactate stat + repeat at 2h','CRP, procalcitonin — guides antibiotic duration','Urine M,C&S — check microscopy','FBC, CRP, creatinine q6h','Sensitivity results in 48h — enables de-escalation'],
        insight: 'Procalcitonin > 10 = bacterial infection almost certain. I fast-track this sample. The micro team is alerted to watch the culture bottles.',
        keyDrug: 'Procalcitonin-guided antibiotic duration'
      },
    ]
  },
]

// ── COMPONENTS ──
const BackBtn = ({onBack}:{onBack:()=>void}) => (
  <button onClick={onBack} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
)

export default function SocialHub({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<View>('menu')
  const [activeGR, setActiveGR] = useState<typeof GRAND_ROUNDS[0]|null>(null)
  const [grPhase, setGrPhase] = useState<'read'|'diagnose'|'analysis'|'quiz'>('read')
  const [selectedDx, setSelectedDx] = useState<number|null>(null)
  const [grQIdx, setGrQIdx] = useState(0)
  const [grAns, setGrAns] = useState<number|null>(null)
  const [grScore, setGrScore] = useState(0)
  const [activeJourney, setActiveJourney] = useState<typeof JOURNEY_CASES[0]|null>(null)
  const [journeyPhaseIdx, setJourneyPhaseIdx] = useState(0)
  const [journeyAns, setJourneyAns] = useState<number|null>(null)
  const [journeyScore, setJourneyScore] = useState(0)
  const [journeyMistakes, setJourneyMistakes] = useState(0)
  const [activeCross, setActiveCross] = useState<typeof CROSSOVER_CASES[0]|null>(null)
  const [crossPerspIdx, setCrossPerspIdx] = useState(0)

  // ── MENU ──
  if (view === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.25),rgba(10,132,255,0.08))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(0,196,180,0.25)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-25,right:-25,width:110,height:110,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.25),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(139,92,246,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🌍 SOCIAL FEATURES</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Social Hub</div>
        <div style={{fontSize:13,color:C.sub}}>Grand Rounds · Patient Journey · Specialty Crossover</div>
      </div>

      {[
        {
          id:'grand_rounds' as View,
          icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ff453a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          label:'Grand Rounds AI',
          sub:'Weekly NEJM/Lancet/JAMA cases + AI analysis',
          color:'#ff453a',
          badge:'WEEKLY',
          desc:'Real clinical cases from top journals. Diagnose with the world. AI provides expert analysis.'
        },
        {
          id:'patient_journey' as View,
          icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="#30d158" strokeWidth="1.8"/><path d="M12 11v4M10 13h4" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round"/></svg>,
          label:'Patient Journey',
          sub:'Play as the patient — feel the experience',
          color:'#30d158',
          badge:'UNIQUE',
          desc:'Step into the patient\'s shoes. Make decisions. Feel the anxiety. Understand what your patients go through.'
        },
        {
          id:'crossover' as View,
          icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#ffd60a" strokeWidth="1.8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M18.36 5.64l-2.83 2.83M8.46 15.54l-2.83 2.83" stroke="#ffd60a" strokeWidth="1.8" strokeLinecap="round"/></svg>,
          label:'Specialty Crossover',
          sub:'Same case — 4 specialties, 4 perspectives',
          color:'#ffd60a',
          badge:'TEAM',
          desc:'ED, Nursing, Pharmacy, Lab tackle the SAME patient. See how each specialty thinks differently.'
        },
      ].map(f=>(
        <div key={f.id} onClick={()=>setView(f.id)}
          style={{background:C.card,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${f.color}20`,cursor:'pointer',boxShadow:`0 4px 24px ${f.color}08`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-20,right:-20,width:90,height:90,borderRadius:'50%',background:`${f.color}08`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:12}}>
            <div style={{width:54,height:54,borderRadius:17,background:`${f.color}15`,border:`1px solid ${f.color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 4px 16px ${f.color}20`,filter:`drop-shadow(0 0 8px ${f.color}50)`}}>{f.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontSize:16,fontWeight:900,color:C.text}}>{f.label}</span>
                <span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:`${f.color}20`,color:f.color,fontWeight:800,border:`1px solid ${f.color}30`}}>{f.badge}</span>
              </div>
              <div style={{fontSize:11,color:C.sub,marginBottom:6}}>{f.sub}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.6}}>{f.desc}</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:6}}>
            <div style={{height:1,flex:1,background:`${f.color}20`}}/>
            <div style={{fontSize:11,color:f.color,fontWeight:700}}>Explore →</div>
          </div>
        </div>
      ))}
    </div>
  )

  // ── GRAND ROUNDS ──
  if (view === 'grand_rounds' && !activeGR) return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <BackBtn onBack={()=>setView('menu')}/>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>📰 Grand Rounds AI</div>
          <div style={{fontSize:11,color:C.sub}}>Weekly cases from top journals</div>
        </div>
      </div>
      {GRAND_ROUNDS.map(gr=>(
        <div key={gr.id} onClick={()=>{setActiveGR(gr);setGrPhase('read');setSelectedDx(null);setGrQIdx(0);setGrAns(null);setGrScore(0)}}
          style={{background:C.card,borderRadius:20,padding:'18px',marginBottom:12,border:`1px solid ${gr.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${gr.color}08`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${gr.color}10`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <div style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${gr.color}18`,color:gr.color,fontWeight:800,border:`1px solid ${gr.color}30`}}>{gr.journal}</div>
            <div style={{fontSize:10,color:C.muted}}>{gr.week}</div>
          </div>
          <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>{gr.title}</div>
          <div style={{fontSize:12,color:C.sub,lineHeight:1.6,marginBottom:10}}>{gr.patient}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {gr.keyFindings.slice(0,3).map((f,i)=>(
              <span key={i} style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,255,255,0.05)',color:C.muted,border:'1px solid rgba(255,255,255,0.18)'}}>{f}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (view === 'grand_rounds' && activeGR) {
    const gr = activeGR

    if (grPhase === 'read') return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <BackBtn onBack={()=>setActiveGR(null)}/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>{gr.journal} · Grand Rounds</div><div style={{fontSize:11,color:C.sub}}>{gr.week}</div></div>
          <div style={{fontSize:10,padding:'3px 12px',borderRadius:10,background:`${gr.color}18`,color:gr.color,fontWeight:800,border:`1px solid ${gr.color}30`}}>{gr.journal}</div>
        </div>
        <div style={{background:`${gr.color}10`,borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${gr.color}25`}}>
          <div style={{fontSize:18,fontWeight:900,color:C.text,marginBottom:8,letterSpacing:-0.5}}>{gr.title}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.8,marginBottom:12}}>{gr.patient}</div>
          <div style={{fontSize:10,color:gr.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>KEY FINDINGS</div>
          {gr.keyFindings.map((f,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
              <div style={{width:20,height:20,borderRadius:6,background:`${gr.color}20`,border:`1px solid ${gr.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:900,color:gr.color,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.5}}>{f}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setGrPhase('diagnose')} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${gr.color},${gr.color}bb)`,color:'var(--text-primary, white)',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${gr.color}44`}}>
          🩺 Make Your Diagnosis →
        </button>
      </div>
    )

    if (grPhase === 'diagnose') return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <BackBtn onBack={()=>setGrPhase('read')}/>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>What is your diagnosis?</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {gr.ddx.map((dx,i)=>(
            <div key={i} onClick={()=>setSelectedDx(i)}
              style={{background:selectedDx===i?`${gr.color}15`:C.card,borderRadius:16,padding:'16px',border:selectedDx===i?`2px solid ${gr.color}`:`1px solid ${C.border}`,cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
              <div style={{width:30,height:30,borderRadius:9,background:selectedDx===i?`${gr.color}25`:'rgba(255,255,255,0.12)',border:`1px solid ${selectedDx===i?gr.color:'rgba(0,196,180,0.20)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:selectedDx===i?gr.color:C.muted,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:14,fontWeight:600,color:selectedDx===i?C.text:C.sub,flex:1}}>{dx}</div>
              {selectedDx===i&&<span style={{color:gr.color,fontSize:18}}>◉</span>}
            </div>
          ))}
        </div>
        <button onClick={()=>setGrPhase('analysis')} disabled={selectedDx===null}
          style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:selectedDx!==null?`linear-gradient(135deg,${gr.color},${gr.color}bb)`:'rgba(255,255,255,0.12)',color:'var(--text-primary, white)',fontSize:15,fontWeight:800,cursor:selectedDx!==null?'pointer':'not-allowed',opacity:selectedDx!==null?1:0.5}}>
          🤖 Get AI Analysis →
        </button>
      </div>
    )

    if (grPhase === 'analysis') return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <BackBtn onBack={()=>setGrPhase('diagnose')}/>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>🤖 AI Analysis</div></div>
          <div style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:selectedDx===gr.correctDx?'rgba(48,209,88,0.15)':'rgba(255,69,58,0.15)',color:selectedDx===gr.correctDx?'#30d158':'#ff453a',fontWeight:800,border:`1px solid ${selectedDx===gr.correctDx?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`}}>{selectedDx===gr.correctDx?'✅ Correct':'❌ Incorrect'}</div>
        </div>
        <div style={{background:'rgba(255,255,255,0.14)',borderRadius:18,padding:'16px',marginBottom:12,border:'1px solid rgba(255,255,255,0.18)'}}>
          <div style={{fontSize:10,color:'rgba(139,92,246,0.8)',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>🎯 CORRECT DIAGNOSIS</div>
          <div style={{fontSize:18,fontWeight:900,color:C.text,marginBottom:4}}>{gr.hiddenDx}</div>
          <div style={{fontSize:12,color:C.sub}}>Your answer: <span style={{color:selectedDx===gr.correctDx?'#30d158':'#ff453a',fontWeight:700}}>{gr.ddx[selectedDx!]}</span></div>
        </div>
        <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.08),rgba(10,132,255,0.05))',borderRadius:18,padding:'16px',marginBottom:12,border:'1px solid rgba(0,196,180,0.25)'}}>
          <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>🤖 CLAUDE AI ANALYSIS</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.85,whiteSpace:'pre-line'}}>{gr.aiAnalysis}</div>
        </div>
        <button onClick={()=>setGrPhase('quiz')} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 24px rgba(139,92,246,0.4)'}}>
          🧠 Test Knowledge →
        </button>
      </div>
    )

    if (grPhase === 'quiz') {
      if (grQIdx >= gr.questions.length) {
        const xp = grScore * 50
        onXP && onXP(xp)
        return (
          <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:60,marginBottom:12}}>🏆</div>
            <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:4}}>{grScore}/{gr.questions.length}</div>
            <div style={{fontSize:14,color:'#ffd60a',fontWeight:700,marginBottom:20}}>+{xp} XP · Grand Rounds Complete</div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setActiveGR(null)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>← Cases</button>
              <button onClick={()=>setView('menu')} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ff453a,#8b5cf6)',color:'var(--text-primary, white)',fontSize:14,fontWeight:700,cursor:'pointer'}}>Social Hub</button>
            </div>
          </div>
        )
      }
      const q = gr.questions[grQIdx]
      return (
        <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <BackBtn onBack={()=>setGrPhase('analysis')}/>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>Knowledge Check</div><div style={{fontSize:11,color:C.sub}}>Q{grQIdx+1}/{gr.questions.length}</div></div>
          </div>
          <div style={{background:C.card,borderRadius:16,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text,lineHeight:1.7}}>{q.q}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
            {q.opts.map((opt,i)=>{
              let bg=C.card,border=`1px solid ${C.border}`,tc=C.text
              if(grAns!==null){if(i===q.correct){bg='rgba(48,209,88,0.12)';border='2px solid rgba(48,209,88,0.4)';tc='#86efac'}else if(i===grAns){bg='rgba(255,69,58,0.12)';border='1px solid rgba(255,69,58,0.3)';tc='#fca5a5'}}
              return (
                <div key={i} onClick={()=>{if(grAns!==null)return;setGrAns(i);if(i===q.correct)setGrScore(s=>s+1)}}
                  style={{background:bg,borderRadius:14,padding:'14px 16px',border,cursor:grAns===null?'pointer':'default',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                  <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.12)',border:'1px solid rgba(0,196,180,0.20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.4)',flexShrink:0}}>{['A','B','C','D'][i]}</div>
                  <div style={{fontSize:13,color:tc,fontWeight:500,flex:1}}>{opt}</div>
                  {grAns!==null&&i===q.correct&&<span>✅</span>}
                  {grAns!==null&&i===grAns&&i!==q.correct&&<span>❌</span>}
                </div>
              )
            })}
          </div>
          {grAns!==null&&(
            <div>
              <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:'14px',marginBottom:12,border:'1px solid rgba(0,196,180,0.20)'}}>
                <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:6}}>💡 EXPLANATION</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>{q.explain}</div>
              </div>
              <button onClick={()=>{setGrQIdx(i=>i+1);setGrAns(null)}} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${gr.color},${gr.color}bb)`,color:'var(--text-primary, white)',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 20px ${gr.color}44`}}>
                {grQIdx<gr.questions.length-1?'Next →':'Results 🏆'}
              </button>
            </div>
          )}
        </div>
      )
    }
  }

  // ── PATIENT JOURNEY ──
  if (view === 'patient_journey' && !activeJourney) return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <BackBtn onBack={()=>setView('menu')}/>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>👤 Patient Journey</div>
          <div style={{fontSize:11,color:C.sub}}>Experience healthcare as the patient</div>
        </div>
      </div>
      <div style={{background:'rgba(48,209,88,0.08)',borderRadius:16,padding:'14px 16px',marginBottom:16,border:'1px solid rgba(48,209,88,0.2)'}}>
        <div style={{fontSize:12,color:'rgba(48,209,88,0.9)',lineHeight:1.7}}>💡 You are the patient. Make decisions from your perspective. Feel what your patients feel. Every choice has consequences.</div>
      </div>
      {JOURNEY_CASES.map(j=>(
        <div key={j.id} onClick={()=>{setActiveJourney(j);setJourneyPhaseIdx(0);setJourneyAns(null);setJourneyScore(0);setJourneyMistakes(0)}}
          style={{background:C.card,borderRadius:20,padding:'18px',marginBottom:12,border:`1px solid ${j.color}25`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${j.color}10`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:54,height:54,borderRadius:17,background:`${j.color}18`,border:`1px solid ${j.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,boxShadow:`0 4px 16px ${j.color}25`}}>{j.icon}</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:2}}>{j.title}</div>
              <div style={{fontSize:11,color:C.sub}}>You are: {j.yourAge}</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.muted}}>{j.phases.length} phases · Immersive experience</div>
        </div>
      ))}
    </div>
  )

  if (view === 'patient_journey' && activeJourney) {
    const j = activeJourney
    const phase = j.phases[journeyPhaseIdx]
    if (!phase) return (
      <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
        <div style={{fontSize:60,marginBottom:12}}>{journeyMistakes===0?'🏆':journeyScore>journeyMistakes?'🥇':'📚'}</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:8}}>Journey Complete</div>
        <div style={{fontSize:14,color:'#30d158',fontWeight:700,marginBottom:6}}>{journeyScore} good decisions · {journeyMistakes} mistakes</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:24}}>
          {journeyMistakes===0?'Perfect patient! You made all the right decisions.':journeyMistakes<=2?'Good — most decisions were correct. Review the mistakes.':'Review the journey — these decisions save lives.'}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setActiveJourney(null)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>← Cases</button>
          <button onClick={()=>{onXP&&onXP(journeyScore*15);setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#0a84ff)',color:'var(--text-primary, white)',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(48,209,88,0.4)'}}>+{journeyScore*15} XP ✓</button>
        </div>
      </div>
    )

    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <BackBtn onBack={()=>setActiveJourney(null)}/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>👤 {j.title}</div><div style={{fontSize:11,color:C.sub}}>Phase {journeyPhaseIdx+1}/{j.phases.length}</div></div>
        </div>
        <div style={{height:4,background:'rgba(255,255,255,0.12)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
          <div style={{height:'100%',width:`${(journeyPhaseIdx/j.phases.length)*100}%`,background:`linear-gradient(90deg,${j.color},${j.color}aa)`,borderRadius:2,transition:'width 0.4s',boxShadow:`0 0 8px ${j.color}88`}}/>
        </div>
        <div style={{background:`${j.color}10`,borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${j.color}25`}}>
          <div style={{fontSize:11,color:j.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📍 {phase.title}</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.85)',lineHeight:1.85,fontStyle:'italic'}}>"{phase.story}"</div>
        </div>
        {journeyAns!==null&&(
          <div style={{background:phase.choices[journeyAns].correct?'rgba(48,209,88,0.1)':'rgba(255,69,58,0.1)',borderRadius:14,padding:'14px',marginBottom:12,border:`1px solid ${phase.choices[journeyAns].correct?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`,animation:'fadeIn 0.3s ease'}}>
            <div style={{fontSize:13,color:phase.choices[journeyAns].correct?'#86efac':'#fca5a5',fontWeight:600,lineHeight:1.6}}>{phase.choices[journeyAns].consequence}</div>
          </div>
        )}
        <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>What do you do?</div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {phase.choices.map((ch,i)=>{
            const done = journeyAns !== null
            const isSelected = journeyAns === i
            let bg=C.card, border=`1px solid ${C.border}`, tc=C.text
            if(done){if(ch.correct){bg='rgba(48,209,88,0.1)';border='2px solid rgba(48,209,88,0.3)';tc='#86efac'}else if(isSelected){bg='rgba(255,69,58,0.1)';border='1px solid rgba(255,69,58,0.3)';tc='#fca5a5'}}
            return (
              <div key={i} onClick={()=>{if(done)return;setJourneyAns(i);if(ch.correct)setJourneyScore(s=>s+1);else setJourneyMistakes(m=>m+1)}}
                style={{background:bg,borderRadius:16,padding:'14px 16px',border,cursor:done?'default':'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s',opacity:done&&!ch.correct&&!isSelected?0.4:1}}>
                <div style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                  {done?(ch.correct?'✅':isSelected?'❌':'○'):'▷'}
                </div>
                <div style={{fontSize:13,color:tc,fontWeight:600,flex:1,lineHeight:1.4}}>{ch.label}</div>
              </div>
            )
          })}
        </div>
        {journeyAns!==null&&(
          <button onClick={()=>{setJourneyPhaseIdx(i=>i+1);setJourneyAns(null)}}
            style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${j.color},${j.color}bb)`,color:'var(--text-primary, white)',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${j.color}44`}}>
            {journeyPhaseIdx<j.phases.length-1?'Continue Journey →':'Complete Journey 🏁'}
          </button>
        )}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    )
  }

  // ── SPECIALTY CROSSOVER ──
  if (view === 'crossover' && !activeCross) return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <BackBtn onBack={()=>setView('menu')}/>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>🌟 Specialty Crossover</div>
          <div style={{fontSize:11,color:C.sub}}>One patient · Four specialties · Four perspectives</div>
        </div>
      </div>
      <div style={{background:'rgba(255,214,10,0.08)',borderRadius:16,padding:'14px 16px',marginBottom:16,border:'1px solid rgba(255,214,10,0.2)'}}>
        <div style={{fontSize:12,color:'rgba(255,214,10,0.9)',lineHeight:1.7}}>💡 Same patient. See how ED, Nursing, Pharmacy and Lab each approach differently. Healthcare is a team sport.</div>
      </div>
      {CROSSOVER_CASES.map(cc=>(
        <div key={cc.id} onClick={()=>{setActiveCross(cc);setCrossPerspIdx(0)}}
          style={{background:C.card,borderRadius:20,padding:'18px',marginBottom:12,border:`1px solid ${cc.color}25`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${cc.color}10`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:8}}>{cc.title}</div>
          <div style={{background:'rgba(255,255,255,0.14)',borderRadius:12,padding:'10px 12px',marginBottom:10,border:'1px solid rgba(36,63,82,0.65)'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',lineHeight:1.6}}>{cc.patient}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['🚨','🩺','💊','🔬'].map((icon,i)=>(
              <div key={i} style={{width:36,height:36,borderRadius:11,background:`${cc.color}15`,border:`1px solid ${cc.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
            ))}
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
              <span style={{fontSize:11,color:cc.color,fontWeight:700}}>4 perspectives →</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (view === 'crossover' && activeCross) {
    const cc = activeCross
    const p = cc.perspectives[crossPerspIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <BackBtn onBack={()=>setActiveCross(null)}/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>{cc.title}</div></div>
        </div>
        {/* Patient card */}
        <div style={{background:'rgba(255,255,255,0.14)',borderRadius:16,padding:'12px 14px',marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>THE PATIENT</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{cc.patient}</div>
        </div>
        {/* Perspective selector */}
        <div style={{display:'flex',gap:8,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
          {cc.perspectives.map((persp,i)=>(
            <button key={i} onClick={()=>setCrossPerspIdx(i)}
              style={{flexShrink:0,padding:'8px 14px',borderRadius:13,border:crossPerspIdx===i?`2px solid ${persp.color}`:`1px solid ${C.border}`,background:crossPerspIdx===i?`${persp.color}18`:C.card,color:crossPerspIdx===i?persp.color:C.sub,fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>
              {persp.icon} {persp.specialty.split(' ')[0]}
            </button>
          ))}
        </div>
        {/* Perspective card */}
        <div style={{background:`${p.color}10`,borderRadius:20,padding:'18px',marginBottom:12,border:`1px solid ${p.color}25`,boxShadow:`0 6px 24px ${p.color}10`}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <div style={{width:48,height:48,borderRadius:15,background:`${p.color}20`,border:`1px solid ${p.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,boxShadow:`0 4px 16px ${p.color}30`}}>{p.icon}</div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:C.text}}>{p.specialty}</div>
              <div style={{fontSize:11,color:C.sub}}>{p.role}</div>
            </div>
          </div>
          <div style={{background:`${p.color}12`,borderRadius:12,padding:'10px 14px',marginBottom:12,border:`1px solid ${p.color}20`}}>
            <div style={{fontSize:10,color:p.color,fontWeight:700,marginBottom:3}}>🎯 PRIORITY</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.priority}</div>
          </div>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>MY ACTIONS</div>
          {p.actions.map((action,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<p.actions.length-1?'1px solid rgba(36,63,82,0.60)':'none'}}>
              <div style={{width:22,height:22,borderRadius:7,background:`${p.color}18`,border:`1px solid ${p.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:p.color,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>{action}</div>
            </div>
          ))}
          <div style={{background:'rgba(255,255,255,0.14)',borderRadius:14,padding:'12px 14px',marginTop:10,border:'1px solid rgba(36,63,82,0.65)'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>💬 MY PERSPECTIVE</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.7,fontStyle:'italic'}}>"{p.insight}"</div>
          </div>
          <div style={{marginTop:12,background:`${p.color}12`,borderRadius:12,padding:'10px 14px',border:`1px solid ${p.color}20`}}>
            <div style={{fontSize:10,color:p.color,fontWeight:700,marginBottom:3}}>💊 KEY DRUG/ACTION</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.keyDrug}</div>
          </div>
        </div>
        {crossPerspIdx < cc.perspectives.length-1 ? (
          <button onClick={()=>setCrossPerspIdx(i=>i+1)}
            style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${p.color},${p.color}bb)`,color:'var(--text-primary, white)',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${p.color}44`}}>
            Next: {cc.perspectives[crossPerspIdx+1].icon} {cc.perspectives[crossPerspIdx+1].specialty} →
          </button>
        ) : (
          <button onClick={()=>{onXP&&onXP(80);setActiveCross(null)}}
            style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 24px rgba(255,214,10,0.4)'}}>
            ✅ All Perspectives Done · +80 XP
          </button>
        )}
      </div>
    )
  }

  return null
}
