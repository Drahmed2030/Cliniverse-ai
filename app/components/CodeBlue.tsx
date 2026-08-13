'use client'
import { useState, useEffect, useRef } from 'react'

type Phase = 'intro' | 'running' | 'success' | 'failed'

// ── Apple Health Style SVG Icons ──
const Icons = {
  heart: (color='#ff3b30') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} opacity="0.9"/>
    </svg>
  ),
  lightning: (color='#ff9500') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4.09 12.96A1 1 0 005 14.5h6.5L10 22l9.91-10.96A1 1 0 0019 9.5H12.5L13 2z" fill={color}/>
    </svg>
  ),
  virus: (color='#ff6b35') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill={color} opacity="0.9"/>
      <line x1="12" y1="2" x2="12" y2="7" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="7" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="17" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="white"/>
    </svg>
  ),
  ecg: (color='#ff3b30') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2 12h3l2-7 3 14 2-9 2 4 1-2h7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  lungs: (color='#00C4B4') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v8M8 7C5 7 3 9 3 12v4c0 2 1.5 3 3 3s2-1 2-2v-3M16 7c3 0 5 2 5 5v4c0 2-1.5 3-3 3s-2-1-2-2v-3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  brain: (color='#00C4B4') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M9.5 2A2.5 2.5 0 007 4.5c0 .56.19 1.08.5 1.5A3 3 0 004 9a3 3 0 002 2.83V18a2 2 0 002 2h8a2 2 0 002-2v-6.17A3 3 0 0020 9a3 3 0 00-3.5-2.95A2.5 2.5 0 0014.5 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M9 12h6M9 15h6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  flask: (color='#ff9500') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6M10 3v6l-4 9a1 1 0 00.9 1.5h10.2a1 1 0 00.9-1.5L14 9V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="16" r="1" fill={color}/>
      <circle cx="14" cy="14" r="0.8" fill={color}/>
    </svg>
  ),
  drop: (color='#30d158') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z" fill={color} opacity="0.85"/>
      <path d="M9 16a3 3 0 006 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  pneumo: (color='#ff3b30') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v8M7 8C4.5 8 3 10 3 12v5c0 1.5 1 2.5 2.5 2.5S8 18.5 8 17v-2.5M17 8c2.5 0 4 2 4 4v5c0 1.5-1 2.5-2.5 2.5S16 18.5 16 17v-2.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="19" cy="6" r="3" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5"/>
      <path d="M18 6h2M19 5v2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  blood: (color='#dc2626') => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z" fill={color} opacity="0.85"/>
      <path d="M9 14l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  check: (color='#30d158') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.15"/>
      <path d="M7 12l4 4 6-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  cross: (color='#ff3b30') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.15"/>
      <path d="M8 8l8 8M16 8l-8 8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  arrow: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const SCENARIOS = [
  {
    id: 'vf', title: 'Ventricular Fibrillation', icon: 'ecg', color: '#ff3b30',
    setting: 'CCU — 02:14 AM. Monitor alarm. 58M post-STEMI day 2. Unresponsive. No pulse.',
    vitals: { rhythm: 'VF', bp: '0/0', hr: '---', o2: '0%' }, timeLimit: 120,
    steps: [
      { id:'cpr', label:'Start CPR (30:2)', icon:'heart', correct:true, consequence:'✅ CPR started. Do not stop!' },
      { id:'aed', label:'Call crash team + AED', icon:'lightning', correct:true, consequence:'✅ Team alerted! AED charging...' },
      { id:'shock', label:'Shock 200J biphasic', icon:'lightning', correct:true, consequence:'✅ Shock delivered! Resume CPR 2 min.' },
      { id:'adrenaline', label:'Adrenaline 1mg IV', icon:'drop', correct:true, consequence:'✅ Adrenaline given. Continue CPR.' },
      { id:'amiodarone', label:'Amiodarone 300mg IV', icon:'flask', correct:true, consequence:'✅ Amiodarone after 3rd shock.' },
      { id:'nitrates', label:'GTN infusion', icon:'cross', correct:false, consequence:'❌ GTN contraindicated in arrest!' },
      { id:'metoprolol', label:'Metoprolol 5mg IV', icon:'cross', correct:false, consequence:'❌ Beta-blockers worsen cardiac arrest!' },
    ],
    successMessage:'ROSC achieved! Excellent ALS performance!', failMessage:'Review: CPR → Shock → Adrenaline → Amiodarone.', xpReward:100,
  },
  {
    id:'anaphylaxis', title:'Anaphylactic Shock', icon:'lightning', color:'#ff9500',
    setting:'ED — Collapse 3 min after IV contrast. BP 60/30. Stridor. Urticaria.',
    vitals:{rhythm:'Tachy', bp:'60/30', hr:'142', o2:'82%'}, timeLimit:90,
    steps:[
      {id:'adrenaline_im', label:'Adrenaline 0.5mg IM outer thigh', icon:'drop', correct:true, consequence:'✅ IM adrenaline — first-line ALWAYS!'},
      {id:'position', label:'Lay flat — legs elevated', icon:'check', correct:true, consequence:'✅ Correct position. Venous return improved.'},
      {id:'o2', label:'High-flow O2 15L/min', icon:'lungs', correct:true, consequence:'✅ O2 given. SpO2 improving.'},
      {id:'ivf', label:'IV 0.9% saline 500ml rapid', icon:'drop', correct:true, consequence:'✅ Fluid bolus. BP improving.'},
      {id:'chlorphenamine', label:'Chlorphenamine 10mg IV', icon:'flask', correct:true, consequence:'✅ Antihistamine — second-line.'},
      {id:'steroids', label:'Hydrocortisone 200mg IV', icon:'flask', correct:true, consequence:'✅ Steroids — prevents biphasic reaction.'},
      {id:'beta_blocker', label:'Metoprolol for tachycardia', icon:'cross', correct:false, consequence:'❌ Beta-blockers worsen anaphylaxis!'},
    ],
    successMessage:'Patient stabilised! BP 110/70. SpO2 98%.', failMessage:'IM Adrenaline FIRST — always. Then O2, IVF, antihistamines, steroids.', xpReward:90,
  },
  {
    id:'sepsis', title:'Septic Shock', icon:'virus', color:'#ff6b35',
    setting:'Ward — 67M. Temp 39.8°C, BP 72/40, HR 138, GCS 13. Lactate 4.8.',
    vitals:{rhythm:'Sinus Tachy', bp:'72/40', hr:'138', o2:'88%'}, timeLimit:60,
    steps:[
      {id:'cultures', label:'Blood cultures x2 before Abx', icon:'flask', correct:true, consequence:'✅ Cultures first — critical for source ID!'},
      {id:'abx', label:'Pip/Taz 4.5g + Azithromycin IV', icon:'flask', correct:true, consequence:'✅ Broad-spectrum antibiotics within 1h.'},
      {id:'fluids', label:'IV saline 30ml/kg bolus', icon:'drop', correct:true, consequence:'✅ Fluid resuscitation started.'},
      {id:'norad', label:'Norepinephrine — MAP < 65', icon:'drop', correct:true, consequence:'✅ First-line vasopressor. Target MAP > 65.'},
      {id:'lactate', label:'Reassess lactate at 2h', icon:'flask', correct:true, consequence:'✅ Target lactate clearance > 10%.'},
      {id:'steroids', label:'Hydrocortisone if refractory', icon:'flask', correct:true, consequence:'✅ Steroids for vasopressor-refractory shock.'},
      {id:'furosemide', label:'Furosemide 40mg IV now', icon:'cross', correct:false, consequence:'❌ Patient hypovolaemic — diuretics worsen shock!'},
    ],
    successMessage:'Hour-1 Bundle complete! Lactate clearing. BP improving.', failMessage:'Cultures → Antibiotics → Fluids → Vasopressors → Lactate.', xpReward:100,
  },
  {
    id:'stemi', title:'Acute STEMI', icon:'ecg', color:'#ff3b30',
    setting:'ED — 55M. Crushing chest pain 1h. ST elevation V1-V4. BP 95/60.',
    vitals:{rhythm:'Sinus', bp:'95/60', hr:'110', o2:'92%'}, timeLimit:90,
    steps:[
      {id:'aspirin', label:'Aspirin 300mg PO stat', icon:'flask', correct:true, consequence:'✅ Aspirin — antiplatelet effect immediate.'},
      {id:'ticagrelor', label:'Ticagrelor 180mg PO', icon:'flask', correct:true, consequence:'✅ P2Y12 inhibitor loaded.'},
      {id:'heparin', label:'Heparin 5000u IV bolus', icon:'drop', correct:true, consequence:'✅ Anticoagulation started.'},
      {id:'cath_lab', label:'Activate Cath Lab urgently', icon:'heart', correct:true, consequence:'✅ Door-to-balloon clock started!'},
      {id:'morphine', label:'Morphine 2mg IV for pain', icon:'drop', correct:true, consequence:'✅ Pain control. Sympathetic activation reduced.'},
      {id:'gtn', label:'GTN spray — BP 95/60', icon:'cross', correct:false, consequence:'❌ GTN contraindicated if SBP < 100!'},
    ],
    successMessage:'PCI performed! Door-to-balloon 67 min. TIMI 3 flow!', failMessage:'Aspirin + P2Y12 → Heparin → Cath Lab < 90 min.', xpReward:110,
  },
  {
    id:'pe_massive', title:'Massive Pulmonary Embolism', icon:'lungs', color:'#00C4B4',
    setting:'Ward — 44F. Sudden collapse. HR 135, BP 80/50, O2 82%. Post long-haul flight.',
    vitals:{rhythm:'Tachy', bp:'80/50', hr:'135', o2:'82%'}, timeLimit:90,
    steps:[
      {id:'o2_pe', label:'High-flow O2 immediately', icon:'lungs', correct:true, consequence:'✅ O2 started. SpO2 improving.'},
      {id:'heparin_pe', label:'UFH 80u/kg IV bolus', icon:'drop', correct:true, consequence:'✅ Anticoagulation started immediately.'},
      {id:'ctpa', label:'CT-PA urgently', icon:'flask', correct:true, consequence:'✅ CT-PA confirms massive bilateral PE.'},
      {id:'echo_pe', label:'Bedside Echo — RV assessment', icon:'heart', correct:true, consequence:'✅ RV:LV ratio 1.5. Right heart strain confirmed.'},
      {id:'alteplase', label:'Alteplase 100mg IV over 2h', icon:'drop', correct:true, consequence:'✅ Systemic thrombolysis for massive PE!'},
      {id:'fluids_pe', label:'Aggressive IVF 2L bolus', icon:'cross', correct:false, consequence:'❌ Excess fluids worsen RV failure in PE!'},
    ],
    successMessage:'Thrombolysis successful! BP normalising. SpO2 95%.', failMessage:'O2 → Heparin → CT-PA → Echo → Thrombolysis if unstable.', xpReward:110,
  },
  {
    id:'stroke', title:'Acute Ischaemic Stroke', icon:'brain', color:'#00C4B4',
    setting:'ED — 61F. Sudden left hemiplegia. NIHSS 16. Last seen normal 80 min ago. CT: no bleed.',
    vitals:{rhythm:'AF', bp:'188/104', hr:'92', o2:'96%'}, timeLimit:90,
    steps:[
      {id:'nihss', label:'NIHSS assessment', icon:'brain', correct:true, consequence:'✅ NIHSS 16 — moderate-severe stroke.'},
      {id:'ct', label:'Non-contrast CT head', icon:'flask', correct:true, consequence:'✅ No haemorrhage. ASPECTS 8. tPA eligible.'},
      {id:'bp_control', label:'Lower BP < 185/110 before tPA', icon:'drop', correct:true, consequence:'✅ BP 178/100. Ready for tPA.'},
      {id:'tpa', label:'IV tPA 0.9mg/kg (max 90mg)', icon:'drop', correct:true, consequence:'✅ tPA started within 4.5h window!'},
      {id:'thrombectomy', label:'Assess mechanical thrombectomy', icon:'brain', correct:true, consequence:'✅ MCA occlusion. Thrombectomy team activated!'},
      {id:'aspirin_stroke', label:'Aspirin 300mg before tPA', icon:'cross', correct:false, consequence:'❌ Aspirin contraindicated 24h after tPA!'},
    ],
    successMessage:'tPA + Thrombectomy! NIHSS improved to 4. Excellent!', failMessage:'CT (no bleed) → BP < 185/110 → tPA within 4.5h → Thrombectomy.', xpReward:110,
  },
  {
    id:'hyperk', title:'Severe Hyperkalaemia', icon:'flask', color:'#ff9500',
    setting:'Renal ward — 67M. CKD stage 4. K+ 7.8. ECG: wide QRS, peaked T waves.',
    vitals:{rhythm:'Wide QRS', bp:'100/70', hr:'48', o2:'97%'}, timeLimit:60,
    steps:[
      {id:'calcium', label:'Calcium gluconate 10ml 10% IV', icon:'drop', correct:true, consequence:'✅ Cardiac membrane stabilised! Effect in 1-3 min.'},
      {id:'insulin_dex', label:'Insulin 10u + Dextrose 50g IV', icon:'flask', correct:true, consequence:'✅ K+ shifting into cells. Effect in 20-30 min.'},
      {id:'salbutamol', label:'Salbutamol 10mg nebulised', icon:'lungs', correct:true, consequence:'✅ Beta-2 agonist — shifts K+ intracellularly.'},
      {id:'resonium', label:'Calcium resonium PO', icon:'flask', correct:true, consequence:'✅ K+ removal from body — takes hours.'},
      {id:'dialysis', label:'Urgent dialysis if refractory', icon:'drop', correct:true, consequence:'✅ Most effective K+ removal. Nephrology urgent.'},
      {id:'normal_saline', label:'IVF 1L normal saline', icon:'cross', correct:false, consequence:'❌ Normal saline contains K+! Use 5% dextrose!'},
    ],
    successMessage:'K+ reduced to 5.8. ECG normalised. Excellent management!', failMessage:'Calcium gluconate → Insulin/Dextrose → Salbutamol → Remove K+.', xpReward:90,
  },
  {
    id:'dka', title:'Diabetic Ketoacidosis', icon:'drop', color:'#30d158',
    setting:'ED — 22F. Type 1 DM. BG 28 mmol/L. pH 7.1. K+ 3.2. Kussmaul breathing.',
    vitals:{rhythm:'Sinus Tachy', bp:'95/60', hr:'118', o2:'98%'}, timeLimit:90,
    steps:[
      {id:'ivf_dka', label:'IV 0.9% saline 1L over 1h', icon:'drop', correct:true, consequence:'✅ Fluid resuscitation — DKA #1 priority!'},
      {id:'potassium', label:'K+ replacement before insulin', icon:'flask', correct:true, consequence:'✅ K+ 3.2 — replace BEFORE insulin!'},
      {id:'insulin_dka', label:'Fixed-rate insulin 0.1u/kg/h IV', icon:'drop', correct:true, consequence:'✅ Insulin infusion after K+ replaced.'},
      {id:'monitoring', label:'Hourly BG + 2h VBG + U&E', icon:'flask', correct:true, consequence:'✅ Target BG drop 3-4 mmol/L/h.'},
      {id:'dextrose_dka', label:'Add 10% Dextrose when BG < 14', icon:'drop', correct:true, consequence:'✅ Prevents hypoglycaemia while ketones clear.'},
      {id:'insulin_bolus', label:'Insulin 10u IV bolus stat', icon:'cross', correct:false, consequence:'❌ Bolus insulin before K+ causes fatal hypokalaemia!'},
    ],
    successMessage:'DKA resolving! pH 7.35. Excellent management!', failMessage:'Fluids → K+ replacement → Insulin infusion → Monitor → Dextrose.', xpReward:100,
  },
  {
    id:'tension_ptx', title:'Tension Pneumothorax', icon:'pneumo', color:'#ff3b30',
    setting:'ED — 28M. RTA. Trachea deviated left. Absent right breath sounds. BP 70/40.',
    vitals:{rhythm:'Tachy', bp:'70/40', hr:'145', o2:'78%'}, timeLimit:60,
    steps:[
      {id:'clinical_dx', label:'Clinical diagnosis — no CXR wait', icon:'brain', correct:true, consequence:'✅ Correct! Clinical diagnosis. Immediate decompression!'},
      {id:'o2_ptx', label:'High-flow O2 15L/min', icon:'lungs', correct:true, consequence:'✅ O2 maximised. SpO2 improving.'},
      {id:'needle_decomp', label:'Needle decomp 2nd ICS MCL', icon:'drop', correct:true, consequence:'✅ Rush of air! Tension relieved. BP improving.'},
      {id:'chest_drain', label:'Chest drain 4th/5th ICS AAL', icon:'flask', correct:true, consequence:'✅ Definitive treatment. Drain inserted.'},
      {id:'ivf_ptx', label:'IV access + fluid bolus', icon:'drop', correct:true, consequence:'✅ Vascular access. Fluid support.'},
      {id:'cxr_first', label:'Order CXR before decompression', icon:'cross', correct:false, consequence:'❌ FATAL! CXR delay = cardiac arrest in tension PTX!'},
    ],
    successMessage:'Tension PTX decompressed! SpO2 97%. Life-saving!', failMessage:'Clinical diagnosis → Needle decompression 2nd ICS → Chest drain.', xpReward:120,
  },
  {
    id:'upper_gi_bleed', title:'Massive Upper GI Bleed', icon:'blood', color:'#dc2626',
    setting:'ED — 55M. Haematemesis 1L. HR 130, BP 80/50, Hb 62. On Warfarin.',
    vitals:{rhythm:'Tachy', bp:'80/50', hr:'130', o2:'96%'}, timeLimit:90,
    steps:[
      {id:'airway', label:'Airway assessment', icon:'lungs', correct:true, consequence:'✅ Airway intact. GCS 14 — monitor closely.'},
      {id:'large_bore', label:'2x large-bore IV access', icon:'drop', correct:true, consequence:'✅ 2x 16G cannulas. Ready for transfusion.'},
      {id:'xmatch', label:'Group & crossmatch + bloods', icon:'flask', correct:true, consequence:'✅ Urgent bloods. Crossmatch 6 units PRBCs.'},
      {id:'prbc', label:'Packed RBCs — target Hb > 70', icon:'blood', correct:true, consequence:'✅ Blood transfusion started. 1:1:1 ratio.'},
      {id:'ppi', label:'Omeprazole 80mg IV + infusion', icon:'flask', correct:true, consequence:'✅ IV PPI reduces rebleeding risk.'},
      {id:'reverse', label:'Vitamin K + PCC for warfarin', icon:'flask', correct:true, consequence:'✅ INR correction critical!'},
      {id:'endoscopy', label:'Urgent endoscopy within 24h', icon:'flask', correct:true, consequence:'✅ Endoscopy for diagnosis and haemostasis.'},
      {id:'saline_only', label:'Saline 3L — no blood products', icon:'cross', correct:false, consequence:'❌ Saline dilutes clotting factors! Blood required!'},
    ],
    successMessage:'Haemostasis at endoscopy. Hb stable at 85. Excellent!', failMessage:'Airway → IV access → Blood transfusion → PPI → Reverse anticoag → Endoscopy.', xpReward:120,
  },
]

const ScenarioIcon = ({ iconName, color, size=28 }: {iconName: string, color: string, size?: number}) => {
  const scale = size / 28
  const map: Record<string, (c: string) => JSX.Element> = {
    heart: Icons.heart, lightning: Icons.lightning, virus: Icons.virus,
    ecg: Icons.ecg, lungs: Icons.lungs, brain: Icons.brain,
    flask: Icons.flask, drop: Icons.drop, pneumo: Icons.pneumo,
    blood: Icons.blood, check: Icons.check, cross: Icons.cross,
  }
  const fn = map[iconName] || Icons.heart
  return <div style={{transform:`scale(${scale})`,transformOrigin:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{fn(color)}</div>
}

const CASE_MAP: Record<string, "mega_vf_01" | "mega_pe_01" | "mega_sepsis_01"> = {
  vf: "mega_vf_01",
  pe_massive: "mega_pe_01",
  sepsis: "mega_sepsis_01",
};

export default function CodeBlue({ onXP }: { onXP: (n: number) => void }) {
  const [megaCaseId, setMegaCaseId] = React.useState<string | null>(null);
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [timeLeft, setTimeLeft] = useState(0)
  const [actions, setActions] = useState<string[]>([])
  const [lastConsequence, setLastConsequence] = useState('')
  const [errors, setErrors] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()
  const scenario = SCENARIOS[scenarioIdx]
  const correctSteps = scenario.steps.filter(s => s.correct)

  useEffect(() => {
    if (phase !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          const completed = correctSteps.filter(s => actions.includes(s.id)).length
          setPhase(completed >= Math.ceil(correctSteps.length * 0.6) ? 'success' : 'failed')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, actions])

  const startScenario = () => {
    setTimeLeft(scenario.timeLimit)
    setActions([])
    setLastConsequence('')
    setErrors(0)
    setCorrectCount(0)
    setPhase('running')
  }

  const handleAction = (step: any) => {
    if (actions.includes(step.id) || phase !== 'running') return
    setActions(prev => [...prev, step.id])
    setLastConsequence(step.consequence)
    if (step.correct) {
      const newCount = correctCount + 1
      setCorrectCount(newCount)
      if (newCount >= Math.ceil(correctSteps.length * 0.7)) {
        clearInterval(timerRef.current)
        setTotalXP(x => x + scenario.xpReward)
        onXP(scenario.xpReward)
        setTimeout(() => setPhase('success'), 800)
      }
    } else {
      const newErrors = errors + 1
      setErrors(newErrors)
      if (newErrors >= 2) { clearInterval(timerRef.current); setTimeout(() => setPhase('failed'), 1200) }
    }
  }

  const timerPct = (timeLeft / scenario.timeLimit) * 100
  const timerColor = timerPct > 50 ? '#30d158' : timerPct > 25 ? '#ff9500' : '#ff3b30'

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', paddingBottom: 20 }}>
      <div style={{ marginBottom: 14, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #0A1628)', margin: '0 0 2px', letterSpacing: -0.5 }}>Code Blue</h2>
          <p style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', margin: 0 }}>Real-time emergency · 10 scenarios</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#00C4B4' }}>+{totalXP} XP</div>
          <div style={{ fontSize: 10, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>total earned</div>
        </div>
      </div>

      {/* Scenario Selector — Scrollable with SVG icons */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:14, scrollbarWidth:'none' }}>
        {SCENARIOS.map((s, i) => (
          <button key={s.id} onClick={() => { if(phase!=='running'){setScenarioIdx(i);setPhase('intro')} }}
            style={{ flexShrink:0, width:68, padding:'10px 6px', borderRadius:16, border: i===scenarioIdx?`2px solid ${s.color}`:'1px solid rgba(0,196,180,0.25)', background: i===scenarioIdx?`${s.color}18`:'rgba(255,255,255,0.92)', cursor:'pointer', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', gap:4, boxShadow: i===scenarioIdx?`0 4px 16px ${s.color}44`:'none', transition:'all 0.2s' }}>
            <ScenarioIcon iconName={s.icon} color={i===scenarioIdx?s.color:'var(--text-secondary,rgba(10,22,40,0.55))'} size={28}/>
            <div style={{ fontSize:8, fontWeight:700, color:i===scenarioIdx?s.color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight:1.2, textAlign:'center' }}>{s.title.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {/* INTRO */}
      {phase==='intro'&&(
        <div style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderRadius:20, padding:20, border:'1px solid rgba(0,196,180,0.25)', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <div style={{ width:72, height:72, borderRadius:22, background:`${scenario.color}12`, border:`2px solid ${scenario.color}25`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 24px ${scenario.color}20` }}>
              <ScenarioIcon iconName={scenario.icon} color={scenario.color} size={40}/>
            </div>
          </div>
          <h3 style={{ fontSize:18, fontWeight:800, color:'#0A1628', textAlign:'center', marginBottom:6 }}>{scenario.title}</h3>
          <div style={{ background:`${scenario.color}08`, borderRadius:14, padding:14, marginBottom:14, border:`1px solid ${scenario.color}20` }}>
            <div style={{ fontSize:10, color:scenario.color, fontWeight:800, marginBottom:6, letterSpacing:1 }}>📍 SCENARIO</div>
            <p style={{ fontSize:13, color:'#0A1628', lineHeight:1.7, margin:0 }}>{scenario.setting}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
            {Object.entries(scenario.vitals).map(([k,v])=>(
              <div key={k} style={{ background:'var(--bg-card,rgba(255,255,255,0.88))', borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
                <div style={{ fontSize:9, color:'var(--text-secondary,rgba(10,22,40,0.55))', fontWeight:700, letterSpacing:0.3, marginBottom:4 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize:12, fontWeight:800, color:(v.includes('0/0')||v==='---'||v==='0%')?'#ff453a':'white' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color:'var(--text-secondary,rgba(10,22,40,0.55))', textAlign:'center', marginBottom:14 }}>
            ⏱ <b style={{color:'#ff3b30'}}>{scenario.timeLimit}s</b> · 2 wrong = FAILED · <b style={{color:'#00C4B4'}}>+{scenario.xpReward} XP</b>
          </div>
          <button
            onClick={() => {
              if (megaCaseId) return;
              const mapped = CASE_MAP[scenario.id];
              if (mapped) {
                setMegaCaseId(mapped);
              } else {
                startScenario();
              }
            }}
            style={{ width:'100%', padding:'16px', borderRadius:16, border:'none', background:'linear-gradient(135deg,' + scenario.color + ',' + scenario.color + 'bb)', color:'#0A1628', fontSize:16, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 20px ' + scenario.color + '44' }}>
            🚨 Respond Now
          </button>
          <div style={{ fontSize:10, color:'rgba(10,22,40,0.45)', textAlign:'center', marginTop:6 }}>
            Educational simulation only. Not real-time clinical guidance.
          </div>
        </div>
      )}

      {/* RUNNING */}
      {phase==='running'&&(
        <div>
          <div style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderRadius:16, padding:14, marginBottom:10, border:'1px solid rgba(0,196,180,0.25)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:14, fontWeight:800, color:timerColor }}>⏱ {timeLeft}s</span>
              <div style={{ display:'flex', gap:10 }}>
                <span style={{ fontSize:12, color:'#30d158', fontWeight:700 }}>✅ {correctCount}/{correctSteps.length}</span>
                <span style={{ fontSize:12, color:'#ff3b30', fontWeight:700 }}>❌ {errors}/2</span>
              </div>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.88)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', background:timerColor, width:`${timerPct}%`, transition:'width 1s linear', borderRadius:3, boxShadow:`0 0 8px ${timerColor}88` }}/>
            </div>
          </div>

          {lastConsequence&&(
            <div style={{ background:lastConsequence.startsWith('❌')?'rgba(255,69,58,0.12)':'rgba(48,209,88,0.12)', backdropFilter:'blur(12px)', borderRadius:14, padding:12, marginBottom:10, border:`1px solid ${lastConsequence.startsWith('❌')?'rgba(255,69,58,0.3)':'rgba(48,209,88,0.3)'}`, animation:'fadeIn 0.3s ease' }}>
              <p style={{ fontSize:13, color:lastConsequence.startsWith('❌')?'#fca5a5':'#86efac', fontWeight:600, margin:0, lineHeight:1.5 }}>{lastConsequence}</p>
            </div>
          )}

          {/* Vitals Monitor */}
          <div style={{ background:'var(--bg-card,rgba(255,255,255,0.88))', borderRadius:14, padding:12, marginBottom:10, border:'1px solid rgba(0,255,157,0.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-around' }}>
              {Object.entries(scenario.vitals).map(([k,v])=>(
                <div key={k} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:9, color:'#00875A', fontWeight:700, letterSpacing:1 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:correctCount>2?'#30d158':'#ff3b30', marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons with SVG Icons */}
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {scenario.steps.map(step=>{
              const done = actions.includes(step.id)
              return(
                <button key={step.id} onClick={()=>handleAction(step)} disabled={done}
                  style={{ padding:'13px 16px', borderRadius:14, border:done?(step.correct?'2px solid #30d158':'2px solid #ff453a'):'1px solid rgba(139,92,246,0.3)', background:done?(step.correct?'rgba(48,209,88,0.12)':'rgba(255,69,58,0.12)'):'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)', cursor:done?'default':'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left', opacity:done?0.85:1, transition:'all 0.2s', boxShadow:done?(step.correct?'0 4px 16px rgba(48,209,88,0.15)':'0 4px 16px rgba(255,69,58,0.15)'):'none' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:done?(step.correct?'rgba(48,209,88,0.15)':'rgba(255,69,58,0.15)'):step.correct?'rgba(0,196,180,0.10)':'rgba(255,59,48,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:done?(step.correct?'1px solid rgba(48,209,88,0.3)':'1px solid rgba(255,69,58,0.3)'):'1px solid rgba(255,255,255,0.18)' }}>
                    {done ? (step.correct ? Icons.check('#30d158') : Icons.cross('#ff453a')) : <ScenarioIcon iconName={step.icon} color={step.correct?'#00C4B4':'#ff453a'} size={22}/>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:done?(step.correct?'#86efac':'#fca5a5'):'rgba(255,255,255,0.85)', flex:1, lineHeight:1.4 }}>{step.label}</span>
                  {!done&&Icons.arrow()}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {phase==='success'&&(
        <div style={{ background:'rgba(48,209,88,0.1)', backdropFilter:'blur(20px)', borderRadius:20, padding:24, textAlign:'center', border:'2px solid rgba(22,163,74,0.3)', animation:'fadeIn 0.5s ease' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
          <h3 style={{ fontSize:20, fontWeight:800, color:'#16a34a', marginBottom:8 }}>Emergency Managed!</h3>
          <p style={{ fontSize:14, color:'rgba(134,239,172,0.8)', lineHeight:1.7, marginBottom:14 }}>{scenario.successMessage}</p>
          <div style={{ background:'rgba(48,209,88,0.08)', borderRadius:14, padding:12, marginBottom:16 }}>
            <div style={{ fontSize:13, color:'#16a34a', fontWeight:700 }}>✅ {correctCount} correct · ❌ {errors} errors · +{scenario.xpReward} XP</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={startScenario} style={{ flex:1, padding:'14px', borderRadius:14, border:'none', background:'rgba(22,163,74,0.2)', color:'#16a34a', fontSize:14, fontWeight:700, cursor:'pointer' }}>🔄 Retry</button>
            <button onClick={()=>{setScenarioIdx(i=>(i+1)%SCENARIOS.length);setPhase('intro')}} style={{ flex:2, padding:'14px', borderRadius:14, border:'none', background:'var(--bg-base,#F7F9FC)', color:'#0A1628', fontSize:14, fontWeight:700, cursor:'pointer' }}>Next →</button>
          </div>
        </div>
      )}

      {/* FAILED */}
      {phase==='failed'&&(
        <div style={{ background:'rgba(255,69,58,0.1)', backdropFilter:'blur(20px)', borderRadius:20, padding:24, textAlign:'center', border:'2px solid rgba(220,38,38,0.3)', animation:'fadeIn 0.5s ease' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>💔</div>
          <h3 style={{ fontSize:20, fontWeight:800, color:'#fca5a5', marginBottom:8 }}>Resuscitation Failed</h3>
          <p style={{ fontSize:14, color:'rgba(252,165,165,0.8)', lineHeight:1.7, marginBottom:14 }}>{scenario.failMessage}</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={startScenario} style={{ flex:2, padding:'14px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#ff3b30,#ff6b35)', color:'#0A1628', fontSize:14, fontWeight:700, cursor:'pointer' }}>🔄 Try Again</button>
            <button onClick={()=>setPhase('intro')} style={{ flex:1, padding:'14px', borderRadius:14, border:'1px solid rgba(220,38,38,0.2)', background:'transparent', color:'#dc2626', fontSize:13, fontWeight:600, cursor:'pointer' }}>Change</button>
          </div>
        </div>
      )}
            {megaCaseId && (
        <MegacodeRunner
          caseId={megaCaseId as "mega_vf_01" | "mega_pe_01" | "mega_sepsis_01"}
          onClose={() => setMegaCaseId(null)}
          onFinished={(r) => { if (onXP && r.xp) onXP(r.xp); setMegaCaseId(null); }}
        />
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
