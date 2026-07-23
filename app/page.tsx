'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const EcgChallenge = dynamic(() => import('./components/EcgChallenge'), { ssr: false })
const MedCalculators = dynamic(() => import('./components/MedCalculators'), { ssr: false })
const CodeBlue = dynamic(() => import('./components/CodeBlue'), { ssr: false })
const Leaderboard = dynamic(() => import('./components/Leaderboard'), { ssr: false })
const BoardExam = dynamic(() => import('./components/BoardExam'), { ssr: false })
const HealthInsights = dynamic(() => import('./components/HealthInsights'), { ssr: false })
const AdminDashboard = dynamic(() => import('./components/AdminDashboard'), { ssr: false })
const BLSACLSModule = dynamic(() => import('./components/BLSACLSModule'), { ssr: false })
const TeleconsultModule = dynamic(() => import('./components/TeleconsultModule'), { ssr: false })
const OnCallSystem = dynamic(() => import('./components/OnCallSystem'), { ssr: false })
const LiveCasesSystem = dynamic(() => import('./components/LiveCasesSystem'), { ssr: false })
const AICaseGenerator = dynamic(() => import('./components/AICaseGenerator'), { ssr: false })
const ClinicalDuels = dynamic(() => import('./components/ClinicalDuels'), { ssr: false })
const DiagnosticDetective = dynamic(() => import('./components/DiagnosticDetective'), { ssr: false })
const ErrorAutopsy = dynamic(() => import('./components/ErrorAutopsy'), { ssr: false })
const NightShiftSurvival = dynamic(() => import('./components/NightShiftSurvival'), { ssr: false })
const PharmacyModule = dynamic(() => import('./components/PharmacyModule'), { ssr: false })
const NursingModule = dynamic(() => import('./components/NursingModule'), { ssr: false })
const LabModule = dynamic(() => import('./components/LabModule'), { ssr: false })
const RadiologyModule = dynamic(() => import('./components/RadiologyModule'), { ssr: false })
const SocialHub = dynamic(() => import('./components/SocialHub'), { ssr: false })
const ClinicalWorkshop = dynamic(() => import('./components/ClinicalWorkshop'), { ssr: false })
const OnboardingFunnel = dynamic(() => import('./components/OnboardingFunnel'), { ssr: false })
const PWAInstall = dynamic(() => import('./components/PWAInstall'), { ssr: false })
const UserGuide = dynamic(() => import("./components/UserGuide"), { ssr: false })
const DynamicMCQ = dynamic(() => import('./components/DynamicMCQ'), { ssr: false })
const RapidFire = dynamic(() => import('./components/RapidFire'), { ssr: false })
const CardiacSurgeryAI = dynamic(() => import('./components/CardiacSurgeryAI'), { ssr: false })
const NeuroSurgeryAI = dynamic(() => import('./components/NeuroSurgeryAI'), { ssr: false })
const GeneralSurgeryAI = dynamic(() => import('./components/GeneralSurgeryAI'), { ssr: false })
const ClinicalNexus = dynamic(() => import('./components/ClinicalNexus'), { ssr: false })
import { useLiveCases } from './components/LiveCasesSystem'

const RANKS = [
  { name:'Clinical Clerk', icon:'🩺', color:'#64748b', xpNeeded:0 },
  { name:'Junior Resident', icon:'📋', color:'#0a84ff', xpNeeded:100 },
  { name:'Senior Resident', icon:'🔬', color:'#30d158', xpNeeded:300 },
  { name:'Registrar', icon:'⚕️', color:'#ff9500', xpNeeded:600 },
  { name:'Specialist', icon:'🏥', color:'#8b5cf6', xpNeeded:1000 },
  { name:'Consultant', icon:'👨‍⚕️', color:'#ff3b30', xpNeeded:1500 },
  { name:'Senior Consultant', icon:'🎓', color:'#ffd60a', xpNeeded:2200 },
  { name:'Chief of Medicine', icon:'🌟', color:'#ff6b35', xpNeeded:3000 },
]

const BADGES = [
  { id:'first_case', icon:'🏅', name:'First Case', color:'#ffd60a' },
  { id:'cardio', icon:'🫀', name:'Cardiologist', color:'#ff3b30' },
  { id:'speed', icon:'⚡', name:'Lightning MD', color:'#ffd60a' },
  { id:'streak3', icon:'🔥', name:'On Fire', color:'#ff6b35' },
  { id:'mcq10', icon:'🧬', name:'Brain Trust', color:'#30d158' },
  { id:'stemi', icon:'❤️‍🔥', name:'STEMI Master', color:'#ff3b30' },
  { id:'sepsis', icon:'🦠', name:'Sepsis Hero', color:'#ff9500' },
  { id:'sports', icon:'⚽', name:'FIFA Medic', color:'#30d158' },
  { id:'peds', icon:'🧸', name:'Pediatrician', color:'#bf5af2' },
  { id:'lab100', icon:'🔬', name:'Lab Expert', color:'#0a84ff' },
  { id:'rad', icon:'🩻', name:'Radiologist', color:'#64d2ff' },
  { id:'pro', icon:'👑', name:'PRO Member', color:'#ffd60a' },
]

// ── SVG ICONS — Apple Health 2026 ──
const NavIcon = ({id, active, color}: {id:string, active:boolean, color:string}) => {
  const c = active ? color : 'rgba(255,255,255,0.45)'
  const w = 1.6
  const icons: Record<string,JSX.Element> = {
    hub: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
    </svg>,
    lab: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 3v8.5L4.5 18A2 2 0 006.3 21h11.4a2 2 0 001.8-3L15 11.5V3" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 3h6M7 15h10" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <circle cx="10" cy="17.5" r="1" fill={active ? color : 'rgba(255,255,255,0.45)'}/>
      <circle cx="14" cy="16" r="0.8" fill={active ? color : 'rgba(255,255,255,0.45)'}/>
    </svg>,
    rad: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth={w}/>
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth={w}/>
      <path d="M12 5v4M12 15v4M5 12h4M15 12h4" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
    mcq: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke={c} strokeWidth={w}/>
      <path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.8" fill={active ? color : 'rgba(255,255,255,0.45)'}/>
    </svg>,
    tools: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14.7 6.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-1-1a1 1 0 010-1.4l8-8a1 1 0 011.4 0l1 1z" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
      <path d="M19 2l-3 3 3 3 3-3-3-3z" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
      <path d="M2 22l3-3" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
    board: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
      <path d="M8 20h8M12 16v4" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <path d="M7 9l2 2 4-4" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
    leaderboard: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="14" width="5" height="8" rx="1" stroke={c} strokeWidth={w}/>
      <rect x="9.5" y="9" width="5" height="13" rx="1" stroke={c} strokeWidth={w}/>
      <rect x="17" y="5" width="5" height="17" rx="1" stroke={c} strokeWidth={w}/>
      <path d="M4.5 11l-2-3M12 6l-2-3M19.5 3l-1.5-1.5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
    profile: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke={c} strokeWidth={w}/>
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
    workshop: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
    social: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="18" cy="5" r="3" stroke={c} strokeWidth={w}/>
      <circle cx="6" cy="12" r="3" stroke={c} strokeWidth={w}/>
      <circle cx="18" cy="19" r="3" stroke={c} strokeWidth={w}/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
  }
}
const lightTheme = {
  bg: '#f2f2f7',
  headerBg: 'rgba(255,255,255,0.95)',
  headerBorder: 'rgba(60,60,67,0.1)',
  cardBg: '#ffffff',
  cardBorder: 'rgba(60,60,67,0.08)',
  text: '#000000',
  textSub: '#3c3c43',
  textMuted: '#8e8e93',
  navBg: 'rgba(255,255,255,0.97)',
  navBorder: 'rgba(60,60,67,0.12)',
  navActiveColor: '#007aff',
  navInactiveColor: 'rgba(60,60,67,0.35)',
  inputBg: 'rgba(118,118,128,0.12)',
  accent: '#007aff',
  segmentBg: 'rgba(118,118,128,0.12)',
  caseBg: '#ffffff',
}

const darkTheme = {
  bg: 'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',
  headerBg: 'rgba(10,0,21,0.85)',
  headerBorder: 'rgba(139,92,246,0.15)',
  cardBg: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(139,92,246,0.15)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  navBg: 'rgba(10,0,21,0.98)',
  navBorder: 'rgba(139,92,246,0.5)',
  navActiveColor: '#0a84ff',
  navInactiveColor: 'rgba(255,255,255,0.75)',
  inputBg: 'rgba(255,255,255,0.08)',
  accent: '#8b5cf6',
  segmentBg: 'rgba(255,255,255,0.06)',
  caseBg: 'rgba(28,14,50,0.9)',
}

export default function Home() {
  const [screen, setScreen] = useState<'launch'|'welcome'|'signin'|'app'>('launch')
  const [progress, setProgress] = useState(0)
  const [tagline, setTagline] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [tab, setTab] = useState('hub')
  const [toolTab, setToolTab] = useState('codeblue')
  const [activeCase, setActiveCase] = useState<string|null>(null)
  const [activeRad, setActiveRad] = useState<string|null>(null)
  const [mcqIndex, setMcqIndex] = useState(0)
  const [mcqAnswer, setMcqAnswer] = useState<number|null>(null)
  const [xp, setXp] = useState(0)
  const [streak] = useState(3)
  const [casesCompleted, setCasesCompleted] = useState(0)
  const [mcqCorrect, setMcqCorrect] = useState(0)
  const [mcqTotal, setMcqTotal] = useState(0)
  const [openAccordion, setOpenAccordion] = useState<string|null>('critical')
  const [showWelcome, setShowWelcome] = useState(true)
  const [dark, setDark] = useState(true)
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState<{q:string,a:string}[]>([])
  const [isPro, setIsPro] = useState(false) // set true after payment
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const { newCount: liveCount, markSeen: markLiveSeen } = useLiveCases()

  const T = dark ? darkTheme : lightTheme

  // Show onboarding for first-time visitors
  useEffect(() => {
    const theme = localStorage.getItem('cliniverse-theme')
    if (theme === 'light') setDark(false)
    else if (theme === 'midnight') setDark(false) // use light base for midnight
    else setDark(true) // default dark
  }, [])

  useEffect(() => {
    const seen = localStorage.getItem('cliniverse-onboarded')
    if (seen) setShowOnboarding(false)
  }, [])

  const taglines = ['Where medicine meets precision.','Train on real emergencies.','Think like a consultant.','AI-powered clinical intelligence.']

  const criticalCases = [
    { id:'stemi', icon:'🫀', title:'STEMI', sub:'Anterior MI · 58M', color:'#ff3b30', dept:'ED', free:true, xpReward:80,
      vitals:{bp:'90/60',hr:'110',o2:'92',temp:'37.1',rr:'22',gcs:'15'},
      ecg:'ST elevation 3mm V1-V4. Reciprocal ST depression II/III/aVF. Hyperacute T waves V2-V4. Sinus tachycardia 110 bpm.',
      presentation:'Severe crushing chest pain 9/10, radiating to left arm. Onset 45 min. Diaphoretic, pale. Troponin I: 2.4↑. BNP: 380.',
      management:['Aspirin 300mg PO + Ticagrelor 180mg PO','Heparin 5000u IV bolus','Activate Cath Lab — door-to-balloon < 90 min','Avoid GTN if SBP < 90 mmHg','O2 only if SpO2 < 94%','Morphine 2-4mg IV for pain'] },
    { id:'pe', icon:'🫁', title:'Pulmonary Embolism', sub:'Massive PE · 44F', color:'#ff9500', dept:'ED', free:true, xpReward:90,
      vitals:{bp:'88/54',hr:'128',o2:'85',temp:'37.4',rr:'32',gcs:'14'},
      ecg:'S1Q3T3 pattern. Sinus tachycardia. New RBBB. Right heart strain.',
      presentation:'Sudden dyspnea after 12h flight. Right calf swelling. Wells 6. D-dimer > 5000. CT-PA: saddle PE.',
      management:['UFH 80u/kg IV bolus immediately','Alteplase 100mg IV/2h if haemodynamically unstable','Avoid excessive IVF — RV sensitive','High-flow O2','ICU admission','Repeat echo RV function'] },
    { id:'sepsis', icon:'🦠', title:'Septic Shock', sub:'CAP source · 67M', color:'#ff6b35', dept:'ICU', free:true, xpReward:100,
      vitals:{bp:'72/40',hr:'138',o2:'88',temp:'39.8',rr:'28',gcs:'13'},
      ecg:'Sinus tachycardia.',
      presentation:'Fever, confusion, hypotension. CAP — bilateral CXR infiltrates. Lactate 4.8. WBC 24k. Unresponsive to 2L IVF.',
      management:['Blood cultures x2 BEFORE antibiotics','Pip/Taz 4.5g IV + Azithromycin 500mg','Norepinephrine — target MAP > 65','Hydrocortisone 200mg/day if refractory','Lactate remeasure at 2h','ICU — SOFA scoring'] },
    { id:'anaphylaxis', icon:'🚨', title:'Anaphylaxis', sub:'Drug reaction · 28F', color:'#ff3b30', dept:'ED', free:true, xpReward:90,
      vitals:{bp:'70/40',hr:'142',o2:'88',temp:'37.0',rr:'30',gcs:'13'},
      ecg:'Sinus tachycardia.',
      presentation:'Collapse 5 min after IV contrast. Urticaria, angioedema, stridor. Known shellfish allergy.',
      management:['Adrenaline 0.5mg IM outer thigh STAT','Lay flat, legs elevated','High-flow O2','IV saline 500-1000ml rapid','Chlorphenamine 10mg IV','Hydrocortisone 200mg IV','Repeat adrenaline at 5 min'] },
    { id:'heartblock', icon:'⚡', title:'Complete Heart Block', sub:'3rd Degree · 72M', color:'#8b5cf6', dept:'CCU', free:false, xpReward:120,
      vitals:{bp:'88/58',hr:'32',o2:'94',temp:'36.9',rr:'16',gcs:'14'},
      ecg:'Complete AV dissociation. P rate 75/min, QRS rate 32/min. Wide QRS escape.',
      presentation:'Syncope at rest. History of inferior MI 2yr ago. Bradycardic — atropine failed.',
      management:['Transcutaneous pacing — immediate','Atropine 0.5mg IV (often ineffective)','Avoid negative chronotropes','Transvenous pacing if TCP fails','Permanent pacemaker','Urgent cardiology consult'] },
    { id:'stroke', icon:'🧠', title:'Acute Ischaemic Stroke', sub:'Large vessel · 61F', color:'#0a84ff', dept:'Neuro', free:false, xpReward:110,
      vitals:{bp:'188/104',hr:'88',o2:'96',temp:'37.2',rr:'18',gcs:'13'},
      ecg:'AF — possible cardioembolic source.',
      presentation:'Sudden left hemiplegia + facial droop. NIHSS 18. Last seen normal 90 min ago. CT: no haemorrhage. ASPECTS 8.',
      management:['IV tPA 0.9mg/kg within 4.5h','Mechanical thrombectomy — LVO','BP < 185/110 before tPA','Avoid hypotension and hypoglycaemia','Swallowing assessment before oral','Stroke unit admission'] },
    { id:'acs', icon:'💊', title:'NSTEMI / ACS', sub:'High-risk · 55M', color:'#30d158', dept:'CCU', free:false, xpReward:85,
      vitals:{bp:'142/88',hr:'96',o2:'97',temp:'37.0',rr:'16',gcs:'15'},
      ecg:'ST depression V4-V6. T-wave inversion lateral leads.',
      presentation:'Exertional chest tightness 3h. Troponin: 0.8→2.1. TIMI 5. Prev angio: 70% LAD stenosis.',
      management:['Aspirin 300mg + Ticagrelor 180mg','Enoxaparin 1mg/kg SC','Early invasive: angio within 24h','Atorvastatin 80mg','Beta-blocker if no contraindication','GTN for symptom relief'] },
    { id:'hyperkalemia', icon:'⚗️', title:'Severe Hyperkalaemia', sub:'K+ 7.2 · Renal failure · 64M', color:'#ff9500', dept:'ED', free:false, xpReward:95,
      vitals:{bp:'158/92',hr:'52',o2:'96',temp:'37.0',rr:'16',gcs:'15'},
      ecg:'Peaked T waves V2-V5. Widened QRS 140ms. Sine wave pattern emerging.',
      presentation:'CKD stage 4. Missed dialysis 3 days. K+ 7.2. ECG changes. Weak, nauseous. On ACEi + spironolactone.',
      management:['Calcium gluconate 10ml 10% IV STAT — membrane stabilisation','Insulin 10u + Dextrose 50% 50ml IV','Salbutamol 10mg nebulised','Stop ACEi + K+-sparing diuretics','Dialysis if refractory','Repeat ECG + K+ at 1h'] },
    { id:'tamponade', icon:'🫀', title:'Cardiac Tamponade', sub:'Post-viral · 38F', color:'#bf5af2', dept:'CCU', free:false, xpReward:130,
      vitals:{bp:'82/70',hr:'124',o2:'94',temp:'37.3',rr:'22',gcs:'15'},
      ecg:'Low voltage. Electrical alternans. Sinus tachycardia.',
      presentation:'Viral illness 2 weeks ago. Progressive dyspnea, JVP elevated, muffled heart sounds. Beck\'s triad. Echo: 2cm circumferential effusion.',
      management:['Pericardiocentesis — urgent','IV fluids — cautious 250ml bolus','Avoid positive pressure ventilation','Echo-guided drainage preferred','Pericardial drain leave in situ','Send fluid: culture, cytology, protein'] },
  ]

  const sportsCases = [
    { id:'concussion', icon:'🧠', title:'Pitch-Side Concussion', sub:'SCAT6 · FIFA 2026', color:'#0a84ff', dept:'Sports', free:true, xpReward:70,
      vitals:{bp:'120/78',hr:'92',o2:'99',temp:'37.0',rr:'16',gcs:'15'},
      ecg:'N/A — neurological assessment priority.',
      presentation:'Head collision. SCAT6: headache 6/10, confusion, failed balance test.',
      management:['NO same-day return to play — EVER','SCAT6 full assessment pitchside','Rule out C-spine injury','Graduated RTP: 6 steps over 6 days','Neuroimaging if red flags','Document and report'] },
    { id:'cardiacarrest_sports', icon:'💔', title:'Sudden Cardiac Arrest', sub:'On-field · FIFA 2026', color:'#ff3b30', dept:'Sports', free:false, xpReward:100,
      vitals:{bp:'0/0',hr:'0',o2:'0',temp:'37.0',rr:'0',gcs:'3'},
      ecg:'VF — shockable rhythm.',
      presentation:'Player collapses suddenly. No pulse. AED pitchside. Age 22.',
      management:['CPR immediately — 30:2','AED deploy — shock if shockable','Call emergency services','< 10s interruptions','Post-ROSC: 12-lead, echo, ICU','Consider HCM / commotio cordis'] },
    { id:'heatstroke', icon:'🌡️', title:'Exertional Heat Stroke', sub:'World Cup · FIFA 2026', color:'#ff9500', dept:'Sports', free:false, xpReward:70,
      vitals:{bp:'90/60',hr:'135',o2:'95',temp:'41.2',rr:'24',gcs:'12'},
      ecg:'Sinus tachycardia.',
      presentation:'Core temp 41.2°C after 80 min in 38°C heat. Anhidrotic. GCS 12.',
      management:['Remove — cool immediately','Cold water immersion → < 39°C in 30 min','IV cold saline 0.9%','Monitor for seizures','Avoid antipyretics','Hospital when stable'] },
    { id:'kneeankle', icon:'🦴', title:'Acute Knee & Ankle Trauma', sub:'Ottawa rules · FIFA 2026', color:'#30d158', dept:'Sports', free:false, xpReward:60,
      vitals:{bp:'128/80',hr:'98',o2:'98',temp:'37.0',rr:'16',gcs:'15'},
      ecg:'N/A.',
      presentation:'Twisting right knee. Immediate pain + swelling. Ottawa Knee Rules positive.',
      management:['Ottawa Rules: X-ray if criteria met','RICE — Rest Ice Compression Elevation','Lachman + McMurray tests','Neurovascular check distal','MRI if ACL/meniscus suspected','Orthopaedic referral'] },
  ]

  const pedsCases = [
    { id:'febrileseizure', icon:'🌡️', title:'Febrile Seizure', sub:'18-month-old', color:'#ff9500', dept:'Peds', free:false, xpReward:70,
      vitals:{bp:'90/60',hr:'148',o2:'98',temp:'39.6',rr:'28',gcs:'15'},
      ecg:'N/A.',
      presentation:'18-month-old post-ictal. Seizure 2 min generalised. Temp 39.6°C. No prior seizures.',
      management:['Reassurance — benign in majority','Treat fever: paracetamol 15mg/kg','Investigate fever source','LP if < 12 months or meningism','No prophylactic anticonvulsants','Parent education'] },
    { id:'needlephobia', icon:'💉', title:'Needle Phobia — Vaccination', sub:'4-year-old', color:'#8b5cf6', dept:'Peds', free:false, xpReward:50,
      vitals:{bp:'95/60',hr:'120',o2:'99',temp:'37.1',rr:'20',gcs:'15'},
      ecg:'N/A.',
      presentation:'4yr refusing MMR booster. Extreme distress. Overdue.',
      management:['Comfort: parent lap forward','EMLA cream 45-60 min before','Distraction: bubbles, screen','Buzzy bee vibration','Rapid injection technique','Post-procedure positive reinforcement'] },
    { id:'bronchiolitis', icon:'🫁', title:'Severe Bronchiolitis', sub:'RSV · 3-month-old', color:'#0a84ff', dept:'Peds', free:false, xpReward:90,
      vitals:{bp:'80/50',hr:'168',o2:'86',temp:'38.2',rr:'72',gcs:'15'},
      ecg:'N/A.',
      presentation:'3-month-old, 3-day wheeze + poor feeding. O2 86%. Nasal flaring, subcostal recession. RSV positive.',
      management:['High-flow O2 — target SpO2 > 92%','Nasogastric feeds if poor oral intake','High-flow nasal cannula (HFNC)','No bronchodilators or steroids (RSV)','Strict infection control','PICU if worsening'] },
  ]

  const radCases = [
    { id:'ecg_rad', icon:'ecg', title:'ECG Interpretation', sub:'12-lead · 8 cases', color:'#ff3b30',
      report:'STEMI: ST elevation 3mm V1-V4. Reciprocal changes II/III/aVF. Rate 110 sinus tachycardia. QTc 420ms.\n\nConclusion: Anterior STEMI. Activate Cath Lab immediately.' },
    { id:'cxr', icon:'cxr', title:'Chest X-Ray', sub:'PA & lateral · 12 cases', color:'#0a84ff',
      report:'Bilateral perihilar haziness. Kerley B lines. Cardiomegaly CTR 0.58. Bilateral effusions. Upper lobe diversion.\n\nConclusion: Acute pulmonary oedema. IV diuresis indicated.' },
    { id:'ctpa', icon:'ctpa', title:'CT Pulmonary Angiography', sub:'PE protocol · 5 cases', color:'#8b5cf6',
      report:'Saddle embolus right main PA extending bilateral. RV:LV 1.4. D-sign present.\n\nConclusion: Massive bilateral PE with RV strain. Consider thrombolysis. ICU.' },
    { id:'echo_rad', icon:'echo', title:'Echocardiogram', sub:'TTE findings · 6 cases', color:'#30d158',
      report:'EF 25%. Global hypokinesia. LVEDD 65mm. Moderate MR. RVSP 58mmHg.\n\nConclusion: Severe dilated cardiomyopathy. Optimise GDMT. ICD assessment.' },
    { id:'ctbrain', icon:'ctbrain', title:'CT Brain — Stroke', sub:'Stroke & bleed · 10 cases', color:'#ff9500',
      report:'Hyperdense MCA sign right. No haemorrhage. ASPECTS 8. Sulcal effacement right MCA.\n\nConclusion: Right MCA occlusion. IV thrombolysis + thrombectomy urgent.' },
  ]

  const RadIcon = ({id, color}:{id:string,color:string}) => {
    const s = {stroke:color, strokeWidth:1.8, strokeLinecap:'round' as const, strokeLinejoin:'round' as const}
    if(id==='ecg') return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M2 12h3l2-5 3 10 2-5 2 3h8" {...s}/><rect x="1" y="3" width="22" height="18" rx="3" stroke={color} strokeWidth="1.5"/></svg>
    if(id==='cxr') return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" {...s}/><path d="M12 6v12M8 9c0 0 2 1 4 0s4 0 4 0M8 15c0 0 2-1 4 0s4 0 4 0" {...s}/></svg>
    if(id==='ctpa') return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" {...s}/><path d="M12 3v9l5 3" {...s}/><circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5"/></svg>
    if(id==='echo') return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" {...s}/><path d="M8 12c1-2 2-3 4-3s3 1 4 3" {...s}/></svg>
    if(id==='ctbrain') return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A6.5 6.5 0 003 8.5c0 1.8.73 3.43 1.9 4.62A6.5 6.5 0 009.5 21h5a6.5 6.5 0 000-13H12A6.5 6.5 0 009.5 2z" {...s}/><path d="M12 8v4M10 10h4" {...s}/></svg>
    return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" {...s}/></svg>
  }

  const labs = [
    { name:'Troponin I', normal:'< 0.04 ng/mL', critical:'> 0.4 ng/mL', unit:'ng/mL', icon:'🫀', detail:'Rise 3-4h, peak 12-24h. Serial at 0h, 3h, 6h.' },
    { name:'Haemoglobin', normal:'M:13-17 / F:12-16', critical:'< 7 g/dL', unit:'g/dL', icon:'🩸', detail:'Transfuse if Hb < 7 (< 8 in ACS). Check MCV, iron studies.' },
    { name:'WBC Count', normal:'4–11 ×10³/μL', critical:'> 30 or < 2', unit:'×10³/μL', icon:'🔬', detail:'Neutrophilia: bacterial. Left shift = bands. Lymphocytosis: viral.' },
    { name:'BNP', normal:'< 100 pg/mL', critical:'> 500 pg/mL', unit:'pg/mL', icon:'💧', detail:'Ventricular stretch marker. Elevated in HF, PE, AF, renal failure.' },
    { name:'Potassium', normal:'3.5–5.0 mEq/L', critical:'> 6.5 or < 2.5', unit:'mEq/L', icon:'⚗️', detail:'Hyperkalaemia: ECG first → calcium gluconate → insulin/dextrose.' },
    { name:'Creatinine', normal:'0.6–1.2 mg/dL', critical:'> 10 mg/dL', unit:'mg/dL', icon:'🧪', detail:'Calculate eGFR. Contrast risk if eGFR < 45. KDIGO AKI staging.' },
    { name:'Lactate', normal:'0.5–2.0 mmol/L', critical:'> 4.0 mmol/L', unit:'mmol/L', icon:'⚡', detail:'Tissue hypoperfusion. Target clearance > 10% per 2h.' },
    { name:'INR', normal:'0.8–1.2', critical:'> 4.0', unit:'ratio', icon:'🩺', detail:'Therapeutic AF warfarin: 2.0-3.0. INR > 4: hold warfarin, Vit K.' },
    { name:'D-Dimer', normal:'< 0.5 μg/mL', critical:'> 5.0 μg/mL', unit:'μg/mL FEU', icon:'🔴', detail:'High sensitivity, low specificity. Rules out PE in low probability.' },
    { name:'Sodium', normal:'135–145 mEq/L', critical:'< 120 or > 160', unit:'mEq/L', icon:'💊', detail:'Correct hyponatraemia slowly: max 8 mEq/24h to avoid ODS.' },
  ]

  const mcqs = [
    { q:'58M, crushing chest pain 45 min, ST elevation V1-V4. First-line management?',
      options:['Aspirin 300mg + emergent PCI','Metoprolol IV 5mg','Heparin alone','GTN + Morphine only'], correct:0,
      explain:'STEMI: Dual antiplatelet + emergent PCI within 90 mins. GTN contraindicated if SBP < 90.' },
    { q:'44F, Wells 6, O2 85%, HR 128 after long-haul flight. Next step?',
      options:['LMWH empirically then CT-PA','Wait for D-dimer first','V/Q scan first','Echo before treatment'], correct:0,
      explain:'High probability PE: anticoagulate before imaging. CT-PA is imaging of choice.' },
    { q:'Septic shock: BP 72/40 despite 2L IVF, lactate 4.8. First vasopressor?',
      options:['Dopamine 5mcg/kg/min','Norepinephrine 0.1mcg/kg/min','Vasopressin 0.03u/min','Adrenaline 0.1mcg/kg/min'], correct:1,
      explain:'Norepinephrine is first-line vasopressor in septic shock (Surviving Sepsis 2021).' },
    { q:'ECG: P rate 75/min, QRS 32/min, wide escape, complete dissociation. Diagnosis?',
      options:['2nd degree Mobitz I','2nd degree Mobitz II','Complete AV block','Sinus arrest'], correct:2,
      explain:'Complete AV block: total P-QRS dissociation. Urgent transcutaneous pacing.' },
    { q:'NIHSS 18, sudden left hemiplegia, CT no haemorrhage, ASPECTS 8, 90 min ago. Next?',
      options:['IV tPA 0.9mg/kg immediately','Aspirin only','Mechanical thrombectomy alone','Heparin infusion'], correct:0,
      explain:'IV tPA within 4.5h if no contraindications. BP < 185/110. Then assess for thrombectomy.' },
    { q:'28F collapse after IV contrast. BP 70/40, urticaria, stridor. First treatment?',
      options:['IV hydrocortisone 200mg','Adrenaline 0.5mg IM outer thigh STAT','IV chlorphenamine 10mg','O2 only'], correct:1,
      explain:'Anaphylaxis: IM adrenaline ALWAYS first. Then O2, IVF, antihistamines, steroids.' },
    { q:'Pitch-side concussion. GCS 15, headache 6/10, failed balance. Return to play?',
      options:['30 min if resolved','After CT normal','No same-day return — always','Next match only'], correct:2,
      explain:'FIFA/IOC: NO same-day return after suspected concussion. 6-step RTP minimum 6 days.' },
    { q:'Hyperkalaemia K+ 6.8. ECG: peaked T waves. Priority treatment?',
      options:['Sodium bicarbonate IV','Calcium gluconate 10ml 10% IV stat','Furosemide 40mg IV','Kayexalate'], correct:1,
      explain:'Calcium gluconate stabilises cardiac membrane FIRST when ECG changes present.' },
    { q:'18-month-old, 2-min generalised seizure, temp 39.6°C, post-ictal. Management?',
      options:['IV phenobarbitone','Reassurance + treat fever + LP if < 12 months','CT head emergency','Start phenytoin'], correct:1,
      explain:'Simple febrile seizure: reassurance — benign in most. Treat fever. LP if < 12 months.' },
    { q:'CURB-65 score 3 in CAP. Disposition?',
      options:['Outpatient antibiotics','General ward only','ICU consideration — 15-40% mortality','Discharge 48h review'], correct:2,
      explain:'CURB-65 3-5: ICU consideration. Score 3 = 15-40% 30-day mortality. IV antibiotics.' },
  ]

  const getCurrentRank = () => { let r=RANKS[0]; for(let i=RANKS.length-1;i>=0;i--){if(xp>=RANKS[i].xpNeeded){r=RANKS[i];break}} return r }
  const getNextRank = () => { for(let i=0;i<RANKS.length;i++){if(xp<RANKS[i].xpNeeded)return RANKS[i]} return null }
  const getRankPct = () => { const c=getCurrentRank(),n=getNextRank(); if(!n)return 100; return Math.round(((xp-c.xpNeeded)/(n.xpNeeded-c.xpNeeded))*100) }

  useEffect(() => {
    if(screen!=='launch')return
    const prog=setInterval(()=>{setProgress(p=>{if(p>=100){clearInterval(prog);setTimeout(()=>setScreen('app'),400);return 100}return p+1.2})},30)
    const tag=setInterval(()=>setTagline(t=>(t+1)%taglines.length),2200)
    return ()=>{clearInterval(prog);clearInterval(tag)}
  },[screen])

  const completeCase=(reward:number)=>{setXp(x=>x+reward);setCasesCompleted(c=>c+1);setActiveCase(null)}
  const addXP=(n:number)=>setXp(x=>x+n)

  const askAI = async (caseContext: string) => {
    if(!aiQuestion.trim()) return
    setAiLoading(true)
    const q = aiQuestion
    setAiQuestion('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1000,
          system:`You are an expert clinical consultant helping a physician with a medical case. 
Case context: ${caseContext}
Respond concisely in 3-5 sentences. Use medical terminology appropriately. 
Focus on practical clinical decision-making. Be direct and evidence-based.`,
          messages:[{role:'user',content:q}]
        })
      })
      const data = await res.json()
      const answer = data.content?.[0]?.text || 'Unable to get response.'
      setAiHistory(h=>[...h,{q,a:answer}])
      setAiResponse(answer)
    } catch {
      setAiResponse('Connection error. Please try again.')
    }
    setAiLoading(false)
  }

  const glassCard = {
    background: T.cardBg,
    backdropFilter: dark ? 'blur(20px) saturate(180%)' : 'none',
    WebkitBackdropFilter: dark ? 'blur(20px) saturate(180%)' : 'none',
    borderRadius: 16,
    border: `1px solid ${T.cardBorder}`,
    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    marginBottom: 10,
  }

  // ── DARK MODE AMBIENT GLOW ──
  const ambientGlow = (
    <>
      <div style={{position:'fixed',top:-200,left:-200,width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(40px)'}}/>
      <div style={{position:'fixed',top:'30%',right:-150,width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.12) 0%,transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(40px)'}}/>
      <div style={{position:'fixed',bottom:-100,left:'20%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(40px)'}}/>
    </>
  )

  // ADMIN DASHBOARD
  if(showAdmin) return <AdminDashboard onClose={()=>setShowAdmin(false)}/>

  // UPGRADE MODAL
  if(showUpgrade) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(20px)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'linear-gradient(145deg,#2d0a6e,#0d0030)',borderRadius:28,padding:32,maxWidth:380,width:'100%',border:'1px solid rgba(139,92,246,0.4)',boxShadow:'0 20px 80px rgba(139,92,246,0.4)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <button onClick={()=>setShowUpgrade(false)} style={{position:'absolute',top:16,right:16,background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:32,height:32,color:'white',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        <div style={{fontSize:52,textAlign:'center',marginBottom:12,filter:'drop-shadow(0 0 20px rgba(255,214,10,0.5))'}}>🔒</div>
        <h2 style={{fontSize:24,fontWeight:900,color:'white',textAlign:'center',margin:'0 0 8px',letterSpacing:-0.5}}>PRO Case</h2>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:14,textAlign:'center',lineHeight:1.7,margin:'0 0 24px'}}>Unlock all 30+ emergency cases with Cliniverse PRO</p>
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:'14px 16px',marginBottom:20}}>
          {['30+ Emergency Cases','AI Clinical Consultant','PDF Certificates','500+ MCQ Bank','Global Leaderboard'].map(f=>(
            <div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <span style={{color:'#30d158',fontSize:14}}>✓</span>
              <span style={{color:'rgba(255,255,255,0.8)',fontSize:13}}>{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={()=>{window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank');setShowUpgrade(false)}}
          style={{width:'100%',padding:'16px',borderRadius:16,border:'none',background:'white',color:'black',fontSize:16,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Pay with Apple Pay · $9.99/mo
        </button>
        <button
          onClick={()=>{window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank');setShowUpgrade(false)}}
          style={{width:'100%',padding:'14px',borderRadius:16,border:'1px solid rgba(139,92,246,0.4)',background:'transparent',color:'#c4b5fd',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          💳 Pay with Card
        </button>
      </div>
    </div>
  )

  // LAUNCH
  if(showOnboarding) return (
    <OnboardingFunnel onComplete={()=>{
      localStorage.setItem('cliniverse-onboarded','1')
      setScreen('welcome')
      setShowOnboarding(false)
    }}/>
  )

  if(screen==='launch') return (
    <div style={{minHeight:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',fontFamily:'-apple-system,sans-serif',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)',top:-150,left:-150,filter:'blur(60px)'}}/>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.12) 0%,transparent 70%)',bottom:-100,right:-100,filter:'blur(60px)'}}/>
      <div style={{marginBottom:28,position:'relative'}}>
        <svg width={130} height={130} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={55} fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth={1}/>
          <circle cx={60} cy={60} r={55} fill="none" stroke="url(#grad)" strokeWidth={2} strokeDasharray="345" strokeDashoffset={345-(345*progress/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.1s'}}/>
          <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="50%" stopColor="#0a84ff"/><stop offset="100%" stopColor="#30d158"/></linearGradient></defs>
          <path d="M18 60 L34 60 L42 32 L52 88 L62 60 L70 60 L77 44 L84 76 L91 60 L102 60" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',boxShadow:'0 0 60px rgba(139,92,246,0.5)',animation:'pulse 2s ease-in-out infinite'}}/>
      </div>
      <div style={{marginBottom:6,textAlign:'center'}}>
        <span style={{fontSize:40,fontWeight:900,letterSpacing:-1,background:'linear-gradient(135deg,#ffffff,rgba(200,180,255,0.95))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',display:'block',lineHeight:1}}>CLINIVERSE</span>
        <span style={{fontSize:40,fontWeight:900,letterSpacing:3,background:'linear-gradient(135deg,#8b5cf6,#0a84ff,#30d158)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',display:'block',lineHeight:1}}>AI</span>
      </div>
      <div style={{fontSize:10,color:'rgba(255,255,255,0.2)',letterSpacing:4,textTransform:'uppercase',marginBottom:10}}>Virtual Hospital Hub</div>
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:20,background:'rgba(139,92,246,0.2)',border:'1px solid rgba(139,92,246,0.4)',color:'#c4b5fd'}}>⚕ 21 Cases</span>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:20,background:'rgba(245,158,11,0.2)',border:'1px solid rgba(245,158,11,0.4)',color:'#fbbf24'}}>◈ 164 MCQs</span>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:20,background:'rgba(255,59,48,0.2)',border:'1px solid rgba(255,59,48,0.4)',color:'#fca5a5'}}>🚨 10 Simulations</span>
      </div>
      <div style={{height:22,marginBottom:28,overflow:'hidden',width:300,textAlign:'center'}}>
        <p key={tagline} style={{fontSize:13,color:'rgba(255,255,255,0.5)',margin:0,animation:'slideUp 0.6s ease'}}>{taglines[tagline]}</p>
      </div>
      <div style={{width:220,height:2,background:'rgba(255,255,255,0.06)',borderRadius:1,marginBottom:12,overflow:'hidden'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,#8b5cf6,#0a84ff,#30d158)',width:`${progress}%`,transition:'width 0.1s'}}/>
      </div>
      <p style={{fontSize:10,color:'rgba(255,255,255,0.15)',letterSpacing:2}}>v5.0 · SECURE · Built by a Physician</p>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}`}</style>
    </div>
  )

  if(screen==='welcome') return (
    <div style={{minHeight:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',fontFamily:'-apple-system,sans-serif',padding:'0 32px',textAlign:'center'}}>
      <div style={{animation:'fadeIn 0.8s ease',maxWidth:420,width:'100%'}}>
        <p style={{fontSize:13,color:'rgba(139,92,246,0.8)',letterSpacing:3,textTransform:'uppercase',marginBottom:16,fontWeight:600}}>Welcome to</p>
        <h1 style={{fontSize:56,fontWeight:900,margin:'0 0 6px',letterSpacing:-2,lineHeight:1,background:'linear-gradient(135deg,#fff,rgba(200,180,255,0.9))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Cliniverse</h1>
        <h1 style={{fontSize:56,fontWeight:900,margin:'0 0 20px',letterSpacing:3,lineHeight:1,background:'linear-gradient(135deg,#8b5cf6,#0a84ff,#30d158)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.7,margin:'0 auto 40px',maxWidth:300}}>The clinical intelligence platform built by a physician, for physicians.</p>
        <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:360,margin:'0 auto'}}>
          <button onClick={()=>setScreen('signin')} style={{padding:'18px 32px',borderRadius:16,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:17,fontWeight:700,boxShadow:'0 8px 40px rgba(139,92,246,0.5)'}}>Enter Hospital →</button>
          <button onClick={()=>setScreen('signin')} style={{padding:'16px 32px',borderRadius:16,cursor:'pointer',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.55)',fontSize:15,border:'1px solid rgba(255,255,255,0.1)'}}>Sign in with existing account</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )

  if(screen==='signin') return (
    <div style={{minHeight:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 70% 80%, #1a0533 0%, #0a0015 40%, #000510 100%)',fontFamily:'-apple-system,sans-serif',padding:'40px 24px'}}>
      <div style={{animation:'fadeIn 0.6s ease',width:'100%',maxWidth:420}}>
        <p style={{fontSize:13,color:'rgba(139,92,246,0.7)',letterSpacing:2,textTransform:'uppercase',marginBottom:8,fontWeight:600}}>Cliniverse AI</p>
        <h2 style={{fontSize:36,fontWeight:800,color:'white',margin:'0 0 6px',letterSpacing:-1}}>Sign In</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:36}}>Access your clinical dashboard</p>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:8,display:'block'}}>Email / Medical ID</label>
          <input placeholder="doctor@hospital.com" style={{width:'100%',padding:'16px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:15,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:28}}>
          <label style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:8,display:'block'}}>Password</label>
          <input type="password" placeholder="••••••••" style={{width:'100%',padding:'16px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:15,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <button onClick={()=>setScreen('app')} style={{width:'100%',padding:'17px',borderRadius:16,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:16,fontWeight:700,boxShadow:'0 8px 32px rgba(139,92,246,0.4)',marginBottom:14}}>Access Hospital →</button>
        <div style={{display:'flex',gap:10,marginBottom:24}}>
          <button onClick={()=>setScreen('app')} style={{flex:1,padding:'15px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',fontSize:14,cursor:'pointer'}}>Face ID 🔒</button>
          <button onClick={()=>setScreen('app')} style={{flex:1,padding:'15px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',fontSize:14,cursor:'pointer'}}>Touch ID 👆</button>
        </div>
        <p style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,0.25)'}}>New physician? <span style={{color:'#8b5cf6',cursor:'pointer'}} onClick={()=>setScreen('app')}>Request Access</span></p>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )

  // CASE VIEW
  if(activeCase){
    const allCases=[...criticalCases,...sportsCases,...pedsCases]
    const c=allCases.find(x=>x.id===activeCase)!
    return(
      <div style={{minHeight:'100vh',width:'100vw',background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',fontFamily:'-apple-system,sans-serif',paddingBottom:40,position:'relative'}}>
        {ambientGlow}
        <div style={{background:`linear-gradient(160deg,${c.color}22,rgba(10,0,21,0.9))`,backdropFilter:'blur(30px)',padding:'56px 20px 24px',borderBottom:'1px solid rgba(139,92,246,0.15)',position:'relative',zIndex:1}}>
          <button onClick={()=>setActiveCase(null)} style={{background:'rgba(139,92,246,0.15)',backdropFilter:'blur(10px)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 18px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:18,fontWeight:600}}>← Back</button>
          <div style={{fontSize:50,marginBottom:8}}>{c.icon}</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 4px',color:T.text}}>{c.title}</h1>
          <p style={{color:T.textSub,fontSize:13,margin:0}}>{c.sub}</p>
        </div>
        <div style={{padding:'16px 20px',maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}}>
          <p style={{color:T.textMuted,fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 10px',fontWeight:700}}>Vital Signs</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14}}>
            {[{l:'BP',v:c.vitals.bp+' mmHg',a:parseInt(c.vitals.bp)<90},{l:'HR',v:c.vitals.hr+' bpm',a:parseInt(c.vitals.hr)>120||parseInt(c.vitals.hr)<50},{l:'O2 Sat',v:c.vitals.o2+'%',a:parseInt(c.vitals.o2)<94},{l:'Temp',v:c.vitals.temp+'°C',a:parseFloat(c.vitals.temp)>38.5},{l:'RR',v:c.vitals.rr+'/min',a:parseInt(c.vitals.rr)>25},{l:'GCS',v:c.vitals.gcs+'/15',a:parseInt(c.vitals.gcs)<14}].map(v=>(
              <div key={v.l} style={{background:v.a?'rgba(255,59,48,0.15)': T.cardBg,backdropFilter:'blur(12px)',borderRadius:14,padding:'12px',border:v.a?'1.5px solid rgba(255,59,48,0.4)': `1px solid ${T.cardBorder}`}}>
                <p style={{color:v.a?'#ff453a':T.textMuted,fontSize:9,margin:'0 0 4px',letterSpacing:1,textTransform:'uppercase',fontWeight:700}}>{v.l}</p>
                <p style={{color:v.a?'#ff453a':T.text,fontSize:14,fontWeight:800,margin:0}}>{v.v}</p>
                {v.a&&<p style={{color:'#ff453a',fontSize:8,margin:'3px 0 0',fontWeight:700}}>⚠ CRITICAL</p>}
              </div>
            ))}
          </div>
          <div style={{background: dark ? 'rgba(48,209,88,0.08)' : 'rgba(240,255,248,0.8)',backdropFilter:'blur(12px)',borderRadius:16,padding:16,marginBottom:12,border: dark ? '1px solid rgba(48,209,88,0.2)' : '1px solid rgba(26,122,64,0.2)'}}>
            <p style={{color: dark ? '#30d158' : '#1a7a40',fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 8px',fontWeight:700}}>⚡ ECG FINDINGS</p>
            <p style={{color: dark ? 'rgba(255,255,255,0.8)' : '#164e32',fontSize:13,lineHeight:1.75,margin:0}}>{c.ecg}</p>
          </div>
          <div style={{...glassCard,padding:16,marginBottom:12}}>
            <p style={{color:T.textMuted,fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 8px',fontWeight:700}}>Clinical Presentation</p>
            <p style={{color:T.text,fontSize:13,lineHeight:1.8,margin:0}}>{c.presentation}</p>
          </div>
          <div style={{...glassCard,padding:16,marginBottom:14}}>
            <p style={{color:T.textMuted,fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 12px',fontWeight:700}}>Management Protocol</p>
            {c.management.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:`${c.color}22`,border:`1.5px solid ${c.color}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:800,color:c.color}}>{i+1}</div>
                <p style={{color:T.text,fontSize:13,lineHeight:1.65,margin:0}}>{m}</p>
              </div>
            ))}
          </div>
          <button onClick={()=>completeCase(c.xpReward)} style={{width:'100%',padding:'16px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${c.color},${c.color}bb)`,color:'white',fontSize:15,fontWeight:700,marginBottom:10,boxShadow:`0 6px 24px ${c.color}55`}}>✅ Complete Case +{c.xpReward} XP</button>
          
          {/* AI CLINICAL CONSULTANT */}
          <button onClick={()=>{setShowAI(s=>!s);setAiHistory([]);setAiResponse('')}} style={{width:'100%',padding:'14px',borderRadius:18,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#1a0533,#0a0015)',color:'white',fontSize:14,fontWeight:700,marginBottom:10,boxShadow:'0 6px 24px rgba(139,92,246,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span style={{fontSize:18}}>🤖</span> AI Clinical Consultant {showAI?'▲':'▼'}
          </button>

          {showAI&&(
            <div style={{background:'linear-gradient(145deg,rgba(15,23,42,0.97),rgba(10,15,30,0.99))',borderRadius:20,padding:18,marginBottom:14,border:'1px solid rgba(139,92,246,0.2)',boxShadow:'0 8px 40px rgba(139,92,246,0.2)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🤖</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'white'}}>Claude AI Consultant</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>Ask anything about this case</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:10,padding:'3px 10px',borderRadius:10,background:'rgba(48,209,88,0.15)',color:'#30d158',border:'1px solid rgba(48,209,88,0.3)',fontWeight:700}}>● LIVE</div>
              </div>

              {/* Suggested questions */}
              {aiHistory.length===0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginBottom:8,letterSpacing:1,textTransform:'uppercase'}}>Suggested Questions</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      `What is the first-line treatment for ${c.title}?`,
                      `What are the contraindications in this case?`,
                      `When should I consider ICU admission?`,
                    ].map(q=>(
                      <button key={q} onClick={()=>setAiQuestion(q)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'10px 14px',color:'rgba(255,255,255,0.7)',fontSize:12,cursor:'pointer',textAlign:'left',fontWeight:500}}>{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat history */}
              {aiHistory.map((item,i)=>(
                <div key={i} style={{marginBottom:12}}>
                  <div style={{background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:6}}>
                    <div style={{fontSize:10,color:'rgba(139,92,246,0.8)',marginBottom:4,fontWeight:700}}>YOU</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>{item.q}</div>
                  </div>
                  <div style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'rgba(10,132,255,0.8)',marginBottom:4,fontWeight:700}}>🤖 CLAUDE AI</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}>{item.a}</div>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {aiLoading&&(
                <div style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,padding:'14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid rgba(10,132,255,0.3)',borderTop:'2px solid #0a84ff',animation:'spin 1s linear infinite',flexShrink:0}}/>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}>Claude is thinking...</div>
                </div>
              )}

              {/* Input */}
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <input
                  value={aiQuestion}
                  onChange={e=>setAiQuestion(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&askAI(`${c.title}: ${c.presentation}. Vitals: BP ${c.vitals.bp}, HR ${c.vitals.hr}, O2 ${c.vitals.o2}%`)}
                  placeholder="Ask a clinical question..."
                  style={{flex:1,padding:'12px 16px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:13,outline:'none'}}
                />
                <button
                  onClick={()=>askAI(`${c.title}: ${c.presentation}. Vitals: BP ${c.vitals.bp}, HR ${c.vitals.hr}, O2 ${c.vitals.o2}%. ECG: ${c.ecg}`)}
                  disabled={aiLoading||!aiQuestion.trim()}
                  style={{width:46,height:46,borderRadius:14,border:'none',background:aiLoading||!aiQuestion.trim()?'rgba(255,255,255,0.1)':'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:18,cursor:aiLoading||!aiQuestion.trim()?'not-allowed':'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}
                >→</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // RAD VIEW
  if(activeRad){
    const r=radCases.find(x=>x.id===activeRad)!
    return(
      <div style={{minHeight:'100vh',width:'100vw',background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',fontFamily:'-apple-system,sans-serif',paddingBottom:40,position:'relative'}}>
        {ambientGlow}
        <div style={{background:`linear-gradient(160deg,${r.color}18,rgba(10,0,21,0.9))`,backdropFilter:'blur(30px)',padding:'56px 20px 24px',borderBottom:'1px solid rgba(139,92,246,0.15)',position:'relative',zIndex:1}}>
          <button onClick={()=>setActiveRad(null)} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 18px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:18,fontWeight:600}}>← Back</button>
          <div style={{fontSize:50,marginBottom:8}}>{r.icon}</div>
          <h1 style={{fontSize:26,fontWeight:800,margin:'0 0 4px',color:T.text}}>{r.title}</h1>
          <p style={{color:T.textSub,fontSize:13,margin:0}}>{r.sub}</p>
        </div>
        <div style={{padding:'16px 20px',maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}}>
          <div style={{background:T.cardBg,borderRadius:18,padding:20,marginBottom:14,minHeight:150,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${T.cardBorder}`}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:68,marginBottom:10}}>{r.icon}</div><p style={{color:T.textMuted,fontSize:12,margin:0}}>Interactive viewer — PRO feature</p></div>
          </div>
          <div style={{...glassCard,padding:18,marginBottom:14}}>
            <p style={{color:T.textMuted,fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 12px',fontWeight:700}}>Radiologist Report</p>
            <p style={{color:T.text,fontSize:13,lineHeight:1.9,margin:0,whiteSpace:'pre-line'}}>{r.report}</p>
          </div>
          <button style={{width:'100%',padding:'16px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${r.color},${r.color}bb)`,color:'white',fontSize:15,fontWeight:700}}>🤖 AI Interpretation</button>
        </div>
      </div>
    )
  }

  const rank=getCurrentRank(),nextRank=getNextRank(),rankPct=getRankPct()
  const currentMCQ=mcqs[mcqIndex]

  return(
    <div style={{minHeight:'100vh',width:'100vw',background:'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0a0015 40%, #000510 100%)',fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',display:'flex',flexDirection:'column',position:'relative'}}>
      {ambientGlow}

      {/* HEADER — Apple Health 2026 */}
      <header style={{background:T.headerBg,backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',padding:'0 14px',height:48,display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100,borderBottom:`0.5px solid ${T.headerBorder}`}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:'0 2px 8px rgba(10,132,255,0.4)'}}>⚕️</div>
          <b style={{fontSize:16,color:T.text,letterSpacing:-0.3}}>C<span style={{background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</span></b>
        </div>
        {/* Right — avatar + XP */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:600,color:'#8b5cf6',flexShrink:0}}>{rank.icon}{xp} XP</div>
          <div onClick={()=>setTab('profile')} style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:13,cursor:'pointer',flexShrink:0,boxShadow:'0 2px 10px rgba(139,92,246,0.5)'}}>👤</div>
        </div>
      </header>

      <main style={{flex:1,padding:'14px 16px',paddingBottom:90,maxWidth:700,margin:'0 auto',width:'100%',boxSizing:'border-box',position:'relative',zIndex:1}}>

        {/* ── CLINIVERSE AI HEADER — 2026 ── */}
        {tab==='hub'&&(
          <div style={{marginBottom:16}}>

            {/* Logo Card */}
            <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.95),rgba(25,8,55,0.9))',borderRadius:26,padding:'20px 20px 16px',marginBottom:14,border:'1px solid rgba(139,92,246,0.2)',position:'relative',overflow:'hidden',boxShadow:'0 12px 48px rgba(0,0,0,0.5)'}}>

              {/* Ambient glow blobs */}
              <div style={{position:'absolute',top:-40,left:-20,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.18),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:-30,right:-20,width:130,height:130,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.14),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',top:'40%',right:'30%',width:80,height:80,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.08),transparent 70%)',pointerEvents:'none'}}/>

              {/* Top row — logo + status */}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,position:'relative',zIndex:1}}>

                {/* Brand Mark */}
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:48,height:48,borderRadius:16,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 24px rgba(139,92,246,0.5)',position:'relative',flexShrink:0}}>
                    <div style={{position:'absolute',inset:0,borderRadius:16,background:'linear-gradient(135deg,rgba(255,255,255,0.15),transparent)',pointerEvents:'none'}}/>
                    <span style={{fontSize:24,filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'}}>⚕</span>
                  </div>
                  <div>
                    <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                      <span style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:-0.8,fontFamily:'-apple-system,sans-serif'}}>Clini</span>
                      <span style={{fontSize:22,fontWeight:900,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:-0.8}}>verse</span>
                      <span style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.5)',letterSpacing:0.5,marginLeft:2,alignSelf:'center'}}>AI</span>
                    </div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,textTransform:'uppercase',fontWeight:600,marginTop:1}}>Clinical Intelligence</div>
                  </div>
                </div>

                {/* Live status pill */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(48,209,88,0.1)',border:'1px solid rgba(48,209,88,0.25)',borderRadius:20,padding:'5px 10px'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#30d158',boxShadow:'0 0 8px rgba(48,209,88,0.8)',animation:'livePulse 2s ease-in-out infinite',flexShrink:0}}/>
                    <span style={{fontSize:10,color:'#30d158',fontWeight:700,letterSpacing:0.3}}>LIVE</span>
                  </div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',letterSpacing:0.5}}>v2.0 · 2026</div>
                </div>
              </div>

              {/* Greeting */}
              <div style={{position:'relative',zIndex:1,marginBottom:14}}>
                <div style={{fontSize:14,color:'rgba(255,255,255,0.9)',fontWeight:600,marginBottom:2}}>
                  Good morning, Doctor 👋
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>
                  Ready to train? <span style={{color:'#ffd60a',fontWeight:700}}>3-day streak 🔥</span>
                </div>
              </div>

              {/* Stats pills — SVG icons 2026 */}
              <div style={{display:'flex',gap:8,position:'relative',zIndex:1}}>
                {[
                  {
                    label:'Cases', value:'25+', color:'#ff453a', bg:'rgba(255,69,58,0.12)', border:'rgba(255,69,58,0.2)',
                    svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#ff453a" strokeWidth="2" strokeLinecap="round"/><path d="M9 22V12h6v10" stroke="#ff453a" strokeWidth="2" strokeLinecap="round"/></svg>
                  },
                  {
                    label:'Modules', value:'15+', color:'#ffd60a', bg:'rgba(255,214,10,0.1)', border:'rgba(255,214,10,0.2)',
                    svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#ffd60a" strokeWidth="2" strokeLinejoin="round"/></svg>
                  },
                  {
                    label:'Free', value:'5', color:'#30d158', bg:'rgba(48,209,88,0.1)', border:'rgba(48,209,88,0.2)',
                    svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  },
                ].map(s=>(
                  <div key={s.label} style={{flex:1,background:s.bg,border:`1px solid ${s.border}`,borderRadius:14,padding:'10px 8px',textAlign:'center',backdropFilter:'blur(8px)'}}>
                    <div style={{display:'flex',justifyContent:'center',marginBottom:4}}>{s.svg}</div>
                    <div style={{fontSize:15,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
                    <div style={{fontSize:8,color:'rgba(255,255,255,0.35)',fontWeight:600,marginTop:3,letterSpacing:0.5}}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HUB */}
        {tab==='hub'&&(
          <div style={{paddingBottom:8}}>

            {/* Featured Case */}
            <div onClick={()=>setActiveCase('stemi')} style={{background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',borderRadius:22,padding:22,marginBottom:16,color:'white',cursor:'pointer',boxShadow:'0 8px 40px rgba(10,132,255,0.4)',border:'1px solid rgba(255,255,255,0.12)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.06)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:-20,left:-10,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none'}}/>
              <p style={{fontSize:10,opacity:0.7,margin:'0 0 6px',letterSpacing:2,textTransform:'uppercase'}}>TODAY'S FEATURED CASE</p>
              <h3 style={{fontSize:20,fontWeight:900,margin:'0 0 6px',letterSpacing:-0.5}}>🫀 STEMI Protocol</h3>
              <p style={{fontSize:13,opacity:0.7,margin:'0 0 16px'}}>Master door-to-balloon · +80 XP</p>
              <button style={{background:'rgba(255,255,255,0.2)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.3)',color:'white',padding:'10px 22px',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer'}}>Start Case →</button>
            </div>

            {/* ── CASE SECTIONS ── */}
            <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Clinical Cases</div>

            {[
              {key:'critical',icon:'🏥',title:'Critical Care',sub:'ED · ICU · CCU · Neuro',color:'#ff453a',badge:null,badgeColor:'',cases:criticalCases},
              {key:'sports',icon:'⚽',title:'Sports Medicine',sub:'FIFA 2026 · 4 cases',color:'#30d158',badge:'NEW',badgeColor:'#30d158',cases:sportsCases},
              {key:'peds',icon:'🧸',title:'Pediatrics',sub:'2 cases · Vaccinations',color:'#8b5cf6',badge:'NEW',badgeColor:'#8b5cf6',cases:pedsCases},
            ].map(section=>(
              <div key={section.key} style={{marginBottom:12}}>
                {/* Section header */}
                <div onClick={()=>setOpenAccordion(openAccordion===section.key?null:section.key)}
                  style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,cursor:'pointer',padding:'10px 14px',background:'rgba(255,255,255,0.03)',borderRadius:16,border:`1px solid ${section.color}18`}}>
                  <div style={{width:36,height:36,borderRadius:11,background:`${section.color}18`,border:`1px solid ${section.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{section.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:'white'}}>{section.title}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{section.sub}</div>
                  </div>
                  {section.badge&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:`${section.badgeColor}18`,color:section.badgeColor,fontWeight:800,border:`1px solid ${section.badgeColor}30`}}>{section.badge}</span>}
                  <div style={{fontSize:11,color:`${section.color}80`,fontWeight:700,transform:openAccordion===section.key?'rotate(90deg)':'none',transition:'transform 0.2s'}}>›</div>
                </div>

                {/* Cases — horizontal scroll */}
                {openAccordion===section.key&&(
                  <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:6,paddingLeft:2,scrollbarWidth:'none'}}>
                    {section.cases.map((c:any)=>(
                      <div key={c.id} onClick={()=>{
                        if(!c.free && !isPro){setShowUpgrade(true);return}
                        setActiveCase(c.id)
                      }} style={{flexShrink:0,width:160,background:'rgba(255,255,255,0.04)',borderRadius:18,padding:'14px',border:`1px solid ${c.color}25`,cursor:'pointer',position:'relative',overflow:'hidden',opacity:!c.free&&!isPro?0.7:1,boxShadow:`0 4px 16px ${c.color}10`}}>
                        <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:`${c.color}12`,filter:'blur(10px)',pointerEvents:'none'}}/>
                        {/* Icon */}
                        <div style={{width:44,height:44,borderRadius:13,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10,boxShadow:`0 4px 12px ${c.color}20`}}>
                          {c.id==='stemi'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c.color} strokeWidth="2"/><path d="M2 12h4l2-4 3 8 2-4 2 2h7" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                          {c.id==='pe'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="6" stroke={c.color} strokeWidth="1.8"/><path d="M12 6v12M6 9l6 3 6-3" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                          {c.id==='sepsis'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c.color} strokeWidth="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83" stroke={c.color} strokeWidth="1.8" strokeLinecap="round"/></svg>}
                          {c.id==='anaphylaxis'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c.color} strokeWidth="1.8"/><path d="M12 9v4M12 17h.01" stroke={c.color} strokeWidth="2" strokeLinecap="round"/></svg>}
                          {c.id==='heartblock'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M2 12h3l2-5 3 10 2-5 2 3h8" stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          {c.id==='stroke'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 100 14A7 7 0 0012 2z" stroke={c.color} strokeWidth="1.8"/><path d="M8.21 15.89A7 7 0 0120 19H4a7 7 0 014.21-3.11" stroke={c.color} strokeWidth="1.8" strokeLinecap="round"/></svg>}
                          {c.id==='nstemi'&&<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c.color} strokeWidth="1.8"/></svg>}
                          {!['stemi','pe','sepsis','anaphylaxis','heartblock','stroke','nstemi'].includes(c.id)&&<span style={{fontSize:22}}>{c.icon}</span>}
                        </div>
                        <div style={{fontSize:12,fontWeight:700,color:'white',marginBottom:3,lineHeight:1.3}}>{c.title}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:8}}>{c.sub}</div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          {'dept' in c&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:6,background:`${c.color}20`,color:c.color,fontWeight:800,border:`1px solid ${c.color}30`}}>{(c as any).dept}</span>}
                          {!c.free&&!isPro&&<span style={{fontSize:8,padding:'2px 6px',borderRadius:5,background:'rgba(255,149,0,0.15)',color:'#ff9500',fontWeight:700,border:'1px solid rgba(255,149,0,0.25)'}}>PRO</span>}
                          {c.free&&<div style={{width:16,height:6,borderRadius:3,background:'linear-gradient(90deg,#30d158,#34d399)',boxShadow:'0 0 6px rgba(48,209,88,0.5)'}}/>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* AI-Powered Cases Banner */}
            <div onClick={()=>{setTab('tools');setToolTab('aigen')}}
              style={{background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(255,214,10,0.08))',borderRadius:20,padding:'16px 18px',marginBottom:16,border:'1px solid rgba(139,92,246,0.25)',cursor:'pointer',display:'flex',alignItems:'center',gap:14,boxShadow:'0 4px 24px rgba(139,92,246,0.15)'}}>
              <div style={{width:50,height:50,borderRadius:16,background:'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(255,214,10,0.2))',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>🤖</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:800,color:'white',marginBottom:3}}>AI Case Generator</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Unlimited cases · Any specialty · Arabic + English</div>
              </div>
              <div style={{fontSize:22,color:'rgba(139,92,246,0.5)'}}>›</div>
            </div>

            {/* Specialties Hub */}
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div>
                  <div style={{fontSize:17,fontWeight:900,color:'white',letterSpacing:-0.5}}>🎓 Specialties Hub</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>Pharmacy · Nursing · Lab · Radiology</div>
                </div>
                <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(10,132,255,0.15))',border:'1px solid rgba(139,92,246,0.3)',borderRadius:20,padding:'4px 12px'}}>
                  <span style={{fontSize:10,color:'#c4b5fd',fontWeight:700}}>4 modules</span>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {id:'pharmacy', label:'Pharmacy', sub:'Drug interactions · Dosing', color:'#30d158',
                    svg:<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#30d158" strokeWidth="1.8"/><path d="M8 12h8M12 8v8" stroke="#30d158" strokeWidth="2" strokeLinecap="round"/></svg>},
                  {id:'nursing', label:'Nursing', sub:'Vitals · Skills · NEWS2', color:'#64d2ff',
                    svg:<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2a5 5 0 100 10A5 5 0 0012 2z" stroke="#64d2ff" strokeWidth="1.8"/><path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="#64d2ff" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 8v4M10 10h4" stroke="#64d2ff" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                  {id:'lab', label:'Laboratory', sub:'5 panels · Critical values', color:'#bf5af2',
                    svg:<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 3v11l-5 5h16l-5-5V3" stroke="#bf5af2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 3h12" stroke="#bf5af2" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1.5" fill="#bf5af2"/></svg>},
                  {id:'radiology', label:'Radiology', sub:'CXR · CT patterns', color:'#ffd60a',
                    svg:<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#ffd60a" strokeWidth="1.8"/><path d="M12 7v10M7 12h10" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="#ffd60a" strokeWidth="1.5"/></svg>},
                ].map(s=>(
                  <div key={s.id} onClick={()=>{setTab('tools');setToolTab(s.id)}}
                    style={{background:`${s.color}10`,borderRadius:20,padding:'16px 14px',border:`1px solid ${s.color}25`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',top:-15,right:-15,width:60,height:60,borderRadius:'50%',background:`${s.color}12`,filter:'blur(12px)',pointerEvents:'none'}}/>
                    <div style={{marginBottom:10,filter:`drop-shadow(0 0 8px ${s.color}60)`}}>{s.svg}</div>
                    <div style={{fontSize:14,fontWeight:800,color:'white',marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',lineHeight:1.5,marginBottom:10}}>{s.sub}</div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{height:2,flex:1,borderRadius:1,background:`${s.color}30`}}/>
                      <div style={{fontSize:10,color:s.color,fontWeight:700}}>Open →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EXPLORE SECTIONS ── */}
            <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:12}}>Explore</div>

            {/* Row 1: Specialties + Gaming */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>

              {/* Specialties Hub */}
              <div style={{background:'rgba(48,209,88,0.08)',borderRadius:20,padding:'14px',border:'1px solid rgba(48,209,88,0.18)',cursor:'pointer',position:'relative',overflow:'hidden'}}
                onClick={()=>{setTab('tools');setToolTab('pharmacy')}}>
                <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:'rgba(48,209,88,0.1)',filter:'blur(10px)',pointerEvents:'none'}}/>
                <div style={{fontSize:11,color:'#30d158',fontWeight:800,marginBottom:8}}>🎓 Specialties</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                  {[{icon:'💊',l:'Pharma',id:'pharmacy',c:'#30d158'},{icon:'🩺',l:'Nursing',id:'nursing',c:'#64d2ff'},{icon:'🔬',l:'Lab',id:'lab',c:'#bf5af2'},{icon:'🩻',l:'X-Ray',id:'radiology',c:'#ffd60a'}].map(s=>(
                    <div key={s.id} onClick={e=>{e.stopPropagation();setTab('tools');setToolTab(s.id)}}
                      style={{background:`${s.c}10`,borderRadius:10,padding:'6px',border:`1px solid ${s.c}20`,textAlign:'center',cursor:'pointer'}}>
                      <div style={{fontSize:16,marginBottom:2}}>{s.icon}</div>
                      <div style={{fontSize:8,color:s.c,fontWeight:700}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaming Modes */}
              <div style={{background:'rgba(255,69,58,0.08)',borderRadius:20,padding:'14px',border:'1px solid rgba(255,69,58,0.18)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:'rgba(255,69,58,0.1)',filter:'blur(10px)',pointerEvents:'none'}}/>
                <div style={{fontSize:11,color:'#ff453a',fontWeight:800,marginBottom:8}}>⚔️ Gaming</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {[{id:'duels',l:'Clinical Duels',c:'#ff453a'},{id:'detective',l:'Detective',c:'#bf5af2'},{id:'nightshift',l:'Night Shift',c:'#8b5cf6'},{id:'autopsy',l:'Error Autopsy',c:'#ff6b35'}].map(g=>(
                    <div key={g.id} onClick={()=>{setTab('tools');setToolTab(g.id)}}
                      style={{background:`${g.c}10`,borderRadius:8,padding:'5px 8px',border:`1px solid ${g.c}20`,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:g.c,boxShadow:`0 0 6px ${g.c}`,flexShrink:0}}/>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600}}>{g.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Workshop + Social */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>

              {/* Workshop */}
              <div onClick={()=>setTab('workshop')}
                style={{background:'rgba(10,132,255,0.08)',borderRadius:20,padding:'14px',border:'1px solid rgba(10,132,255,0.18)',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:'rgba(10,132,255,0.1)',filter:'blur(10px)',pointerEvents:'none'}}/>
                <div style={{fontSize:11,color:'#0a84ff',fontWeight:800,marginBottom:8}}>🔧 Workshop</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {['SBAR Generator','Discharge Writer','Portfolio AI','Conversations'].map((l,i)=>(
                    <div key={i} style={{background:'rgba(10,132,255,0.08)',borderRadius:8,padding:'5px 8px',border:'1px solid rgba(10,132,255,0.15)',display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:'#0a84ff',boxShadow:'0 0 6px #0a84ff',flexShrink:0}}/>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div style={{background:'rgba(48,209,88,0.06)',borderRadius:20,padding:'14px',border:'1px solid rgba(48,209,88,0.15)',position:'relative',overflow:'hidden'}}>
                <div style={{fontSize:11,color:'#30d158',fontWeight:800,marginBottom:8}}>🌍 Social</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {[{l:'Grand Rounds',c:'#ff453a',tab:'grand_rounds'},{l:'Patient Journey',c:'#30d158',tab:'patient_journey'},{l:'Crossover',c:'#ffd60a',tab:'crossover'}].map(s=>(
                    <div key={s.l} onClick={()=>setTab('social')}
                      style={{background:`${s.c}08`,borderRadius:8,padding:'5px 8px',border:`1px solid ${s.c}15`,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:s.c,boxShadow:`0 0 6px ${s.c}`,flexShrink:0}}/>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600}}>{s.l}</div>
                    </div>
                  ))}
                  <div onClick={()=>{setTab('tools');setToolTab('aigen')}}
                    style={{background:'rgba(255,214,10,0.08)',borderRadius:8,padding:'5px 8px',border:'1px solid rgba(255,214,10,0.15)',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#ffd60a',boxShadow:'0 0 6px #ffd60a',flexShrink:0}}/>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600}}>AI Generator</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* WORKSHOP */}
        {tab==='workshop'&&(
          <div><ClinicalWorkshop onXP={addXP}/></div>
        )}

        {/* SOCIAL */}
        {tab==='social'&&(
          <div>
            <SocialHub onXP={addXP}/>
          </div>
        )}

        {/* LAB */}
        {tab==='lab'&&(
          <div>
            <div style={{marginBottom:16}}>
              <h1 style={{color:T.text,fontSize:26,fontWeight:800,margin:'0 0 4px',letterSpacing:-0.5}}>Clinical Laboratory</h1>
              <p style={{color:T.textSub,fontSize:13,margin:0}}>Critical values & normal ranges</p>
            </div>
            {labs.map(l=>(
              <div key={l.name} style={{...glassCard,padding:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <span style={{fontSize:22}}>{l.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:T.text}}>{l.name}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{l.unit}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                  <div style={{background: dark ? 'rgba(48,209,88,0.1)' : 'rgba(220,252,231,0.7)',backdropFilter:'blur(8px)',borderRadius:12,padding:'10px 12px',border: dark ? '1px solid rgba(48,209,88,0.2)' : '1px solid rgba(22,163,74,0.2)'}}>
                    <div style={{color:'#30d158',fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>✓ NORMAL</div>
                    <div style={{color: dark ? '#86efac' : '#14532d',fontSize:12,fontWeight:700}}>{l.normal}</div>
                  </div>
                  <div style={{background: dark ? 'rgba(255,59,48,0.1)' : 'rgba(254,226,226,0.7)',backdropFilter:'blur(8px)',borderRadius:12,padding:'10px 12px',border: dark ? '1px solid rgba(255,59,48,0.2)' : '1px solid rgba(239,68,68,0.2)'}}>
                    <div style={{color:'#ff453a',fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>⚠ CRITICAL</div>
                    <div style={{color: dark ? '#fca5a5' : '#7f1d1d',fontSize:12,fontWeight:700}}>{l.critical}</div>
                  </div>
                </div>
                <div style={{background: dark ? 'rgba(10,132,255,0.08)' : 'rgba(219,234,254,0.6)',borderRadius:10,padding:'9px 12px',border: dark ? '1px solid rgba(10,132,255,0.15)' : '1px solid rgba(59,130,246,0.15)'}}>
                  <div style={{color: dark ? '#60a5fa' : '#1d4ed8',fontSize:11,lineHeight:1.6}}>{l.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RAD */}
        {tab==='rad'&&(
          <div>
            <div style={{marginBottom:16}}>
              <h1 style={{color:T.text,fontSize:26,fontWeight:800,margin:'0 0 4px',letterSpacing:-0.5}}>Radiology</h1>
              <p style={{color:T.textSub,fontSize:13,margin:0}}>Tap to view radiologist report</p>
            </div>
            {radCases.map(r=>(
              <div key={r.id} onClick={()=>setActiveRad(r.id)} style={{...glassCard,padding:'14px 16px',display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}>
                <div style={{width:52,height:52,borderRadius:15,background:`${r.color}12`,border:`1px solid ${r.color}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 4px 16px ${r.color}33`,filter:`drop-shadow(0 0 8px ${r.color}55)`}}><RadIcon id={r.icon} color={r.color}/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:2}}>{r.title}</div>
                  <div style={{fontSize:12,color:T.textSub}}>{r.sub}</div>
                </div>
                <span style={{fontSize:20,color:T.textMuted}}>›</span>
              </div>
            ))}
          </div>
        )}

        {/* MCQ */}
        {tab==='mcq'&&(
          <div><DynamicMCQ onXP={addXP}/></div>
        )}

        {/* TOOLS TAB */}
        {tab==='tools'&&(
          <div>
            <div style={{marginBottom:14}}>
              <h1 style={{color:'white',fontSize:24,fontWeight:900,margin:'0 0 4px',letterSpacing:-0.5}}>Clinical Tools</h1>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:13,margin:0}}>Simulators & calculators</p>
            </div>

            {/* Tools segment — dark cosmic */}
            <div style={{display:'flex',gap:6,marginBottom:16,background:'rgba(255,255,255,0.04)',borderRadius:20,padding:6,border:'1px solid rgba(139,92,246,0.2)',overflowX:'auto'}}>
              {[
                {id:'codeblue', label:'Code Blue', color:'#ff453a', glow:'rgba(255,69,58,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg>},
                {id:'ecg', label:'ECG', color:'#30d158', glow:'rgba(48,209,88,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 12h3l3-7 4 14 3-7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                {id:'bls', label:'BLS/ACLS', color:'#ff453a', glow:'rgba(255,69,58,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
                {id:'tele', label:'Tele', color:'#0a84ff', glow:'rgba(10,132,255,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>},
                {id:'oncall', label:'On-Call', color:'#bf5af2', glow:'rgba(191,90,242,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>},
                {id:'live', label:'Live', color:'#ff453a', glow:'rgba(255,69,58,0.7)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4M3.5 3.5a13 13 0 000 17M20.5 3.5a13 13 0 010 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'calc', label:'Calc', color:'#ff9f0a', glow:'rgba(255,159,10,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
                {id:'duels', label:'Duels', color:'#ff453a', glow:'rgba(255,69,58,0.7)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.5 17.5L3 6M3 3h6M3 3v6M9.5 6.5L18 15M18 21h-6M18 21v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                {id:'detective', label:'Detective', color:'#bf5af2', glow:'rgba(191,90,242,0.7)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'autopsy', label:'Autopsy', color:'#ff6b35', glow:'rgba(255,107,53,0.7)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                {id:'nightshift', label:'Night', color:'#8b5cf6', glow:'rgba(139,92,246,0.7)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                {id:'pharmacy', label:'Pharma', color:'#30d158', glow:'rgba(48,209,88,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'nursing', label:'Nursing', color:'#64d2ff', glow:'rgba(100,210,255,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 100 14A7 7 0 0012 2zM12 8v4M10 10h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M8.21 15.89A7 7 0 0120 19H4a7 7 0 014.21-3.11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'lab', label:'Lab', color:'#bf5af2', glow:'rgba(191,90,242,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 3v11l-5 5h16l-5-5V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 3h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'radiology', label:'X-Ray', color:'#ffd60a', glow:'rgba(255,214,10,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
                {id:'nexus', label:'Nexus', color:'#ffd60a', glow:'rgba(255,214,10,0.8)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
                {id:'rapid', label:'Rapid', color:'#ff453a', glow:'rgba(255,69,58,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                {id:'cardiac', label:'Cardiac', color:'#ff453a', glow:'rgba(255,69,58,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2"/></svg>},
                {id:'neuro', label:'Neuro', color:'#bf5af2', glow:'rgba(191,90,242,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 017 7c0 2-1 4-2 5l1 8H6l1-8c-1-1-2-3-2-5a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'general_surg', label:'Surgery', color:'#ff9f0a', glow:'rgba(255,159,10,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg>},
                {id:'aigen', label:'AI Gen', color:'#ffd60a', glow:'rgba(255,214,10,0.7)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
                {id:'insights', label:'Stats', color:'#bf5af2', glow:'rgba(191,90,242,0.6)',
                  svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
              ].map(t=>{
                const active = toolTab===t.id
                return (
                  <button key={t.id} onClick={()=>setToolTab(t.id)} style={{
                    flex:1, padding:'10px 6px', borderRadius:14, border:'none', cursor:'pointer',
                    background:active?`linear-gradient(135deg,${t.color}25,${t.color}10)`:'transparent',
                    boxShadow:active?`0 4px 16px ${t.glow},0 0 0 1px ${t.color}30`:'none',
                    transition:'all 0.25s cubic-bezier(.34,1.56,.64,1)',
                    transform:active?'translateY(-1px)':'none',
                    whiteSpace:'nowrap', minWidth:0,
                  }}>
                    <div style={{color:active?t.color:'rgba(255,255,255,0.3)',display:'flex',justifyContent:'center',marginBottom:4,transition:'color 0.2s'}}>{t.svg}</div>
                    <div style={{fontSize:9,fontWeight:active?800:500,color:active?t.color:'rgba(255,255,255,0.3)',letterSpacing:active?0.3:0,transition:'all 0.2s'}}>{t.label}</div>
                    {active&&<div style={{width:16,height:2,borderRadius:1,background:t.color,margin:'4px auto 0',boxShadow:`0 0 6px ${t.color}`}}/>}
                  </button>
                )
              })}
            </div>

            {toolTab==='codeblue'&&<CodeBlue onXP={addXP}/>}
            {toolTab==='ecg'&&<EcgChallenge onXP={addXP}/>}
            {toolTab==='bls'&&<BLSACLSModule onXP={addXP}/>}
            {toolTab==='tele'&&<TeleconsultModule onXP={addXP}/>}
            {toolTab==='oncall'&&<OnCallSystem onXP={addXP}/>}
            {toolTab==='live'&&<LiveCasesSystem onXP={addXP}/>}
            {toolTab==='calc'&&<MedCalculators/>}
            {toolTab==='duels'&&<ClinicalDuels onXP={addXP}/>}
            {toolTab==='detective'&&<DiagnosticDetective onXP={addXP}/>}
            {toolTab==='autopsy'&&<ErrorAutopsy onXP={addXP}/>}
            {toolTab==='nightshift'&&<NightShiftSurvival onXP={addXP}/>}
            {toolTab==='pharmacy'&&<PharmacyModule onXP={addXP}/>}
            {toolTab==='nursing'&&<NursingModule onXP={addXP}/>}
            {toolTab==='lab'&&<LabModule onXP={addXP}/>}
            {toolTab==='radiology'&&<RadiologyModule onXP={addXP}/>}
                        {toolTab==='nexus'&&<ClinicalNexus onXP={addXP}/>}
            {toolTab==='rapid'&&<RapidFire onXP={addXP}/>}
            {toolTab==='cardiac'&&<CardiacSurgeryAI onXP={addXP}/>}
            {toolTab==='neuro'&&<NeuroSurgeryAI onXP={addXP}/>}
            {toolTab==='general_surg'&&<GeneralSurgeryAI onXP={addXP}/>}
            {toolTab==='aigen'&&<AICaseGenerator onXP={addXP}/>}
            {toolTab==='insights'&&<HealthInsights xp={xp} casesCompleted={casesCompleted} mcqCorrect={mcqCorrect} mcqTotal={mcqTotal} streak={streak}/>}
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile'&&(
          <div>
            <div style={{...glassCard,padding:18,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:62,height:62,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,boxShadow:'0 4px 20px rgba(139,92,246,0.6)'}}>👨‍⚕️</div>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:3}}>Physician Member</div>
                <div style={{fontSize:12,color:T.textSub,marginBottom:8}}>Standard Access Tier</div>
                <span style={{fontSize:10,fontWeight:700,padding:'3px 12px',borderRadius:12,background:'rgba(10,132,255,0.12)',color:'#0a84ff',border:'1px solid rgba(10,132,255,0.2)'}}>FREE TIER</span>
              </div>
              {/* Admin button - hidden, only for admin */}
              <div onClick={()=>setShowAdmin(true)} style={{width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:12,opacity:0.3}}>⚙️</div>
            </div>

            {/* XP RANK CARD */}
            <div style={{background:dark?'linear-gradient(145deg,rgba(15,23,42,0.97),rgba(10,15,30,0.99))':'linear-gradient(145deg,#1a1a2e,#16213e)',backdropFilter:'blur(40px)',borderRadius:22,padding:20,marginBottom:12,border:'1px solid rgba(139,92,246,0.15)',boxShadow:dark?'0 8px 40px rgba(139,92,246,0.2)':'0 8px 40px rgba(0,0,0,0.3)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 70% 20%,rgba(139,92,246,0.1),transparent)',pointerEvents:'none'}}/>
              <div style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:4}}>Clinical Intelligence Score</div>
                  <div style={{fontSize:52,fontWeight:900,color:'white',letterSpacing:-3,lineHeight:1}}>{xp}</div>
                  <div style={{fontSize:12,color:'rgba(48,209,88,0.9)',marginTop:6,fontWeight:600}}>{xp>0?`+${xp} XP earned`:'Complete a case to start'}</div>
                </div>
                <div style={{position:'relative',width:100,height:100,flexShrink:0}}>
                  <svg viewBox="0 0 100 100" width={100} height={100} style={{transform:'rotate(-90deg)'}}>
                    <circle cx={50} cy={50} r={40} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}/>
                    <circle cx={50} cy={50} r={40} fill="none" stroke={rank.color} strokeWidth={10} strokeLinecap="round" strokeDasharray="251" strokeDashoffset={251-(251*rankPct/100)} style={{transition:'stroke-dashoffset 1.5s cubic-bezier(.2,.9,.3,1)',filter:`drop-shadow(0 0 12px ${rank.color})`,animation:'ringGlow 3s ease-in-out infinite'}}/>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                    <div style={{fontSize:24,animation:'iconPulse 2s ease-in-out infinite'}}>{rank.icon}</div>
                    <div style={{fontSize:11,fontWeight:800,color:'white',marginTop:2}}>{rankPct}%</div>
                  </div>
                </div>
              </div>
              <div style={{fontSize:17,fontWeight:800,color:'white',textAlign:'center',marginBottom:4}}>{rank.name}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',textAlign:'center',marginBottom:14}}>{nextRank?`${nextRank.xpNeeded-xp} XP to ${nextRank.name}`:'Maximum rank! 🌟'}</div>
              <div style={{height:4,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
                <div style={{height:'100%',background:`linear-gradient(90deg,${rank.color},#0a84ff)`,width:`${rankPct}%`,transition:'width 1.5s ease',borderRadius:2,boxShadow:`0 0 10px ${rank.color}99`}}/>
              </div>
              <div style={{display:'flex',gap:10}}>
                <div style={{background:'rgba(255,150,0,0.1)',border:'1px solid rgba(255,150,0,0.2)',borderRadius:14,padding:'12px 16px',flexShrink:0}}>
                  <div style={{fontSize:26,fontWeight:900,color:'#ff9f0a',lineHeight:1}}>{streak}</div>
                  <div style={{fontSize:10,color:'rgba(255,150,0,0.8)',fontWeight:700,lineHeight:1.3,marginTop:2}}>day<br/>streak 🔥</div>
                </div>
                <div style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'12px 14px'}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>Next rank</div>
                  <div style={{fontSize:15,fontWeight:800,color:'white',marginBottom:6}}>{nextRank?nextRank.name:'MAX RANK 🌟'}</div>
                  <div style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',background:'linear-gradient(90deg,#0a84ff,#30d158)',width:`${rankPct}%`,transition:'width 1.5s ease',borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:4}}>{nextRank?`${nextRank.xpNeeded-xp} XP needed`:''}</div>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
              {[{num:casesCompleted,lbl:'CASES DONE',color:'#0a84ff'},{num:mcqTotal>0?Math.round((mcqCorrect/mcqTotal)*100)+'%':'—',lbl:'ACCURACY',color:'#30d158'},{num:xp,lbl:'TOTAL XP',color:'#8b5cf6'}].map(s=>(
                <div key={s.lbl} style={{...glassCard,padding:'16px 10px',textAlign:'center',marginBottom:0}}>
                  <div style={{fontSize:24,fontWeight:900,color:s.color,marginBottom:4}}>{s.num}</div>
                  <div style={{fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:0.5}}>{s.lbl}</div>
                </div>
              ))}
            </div>

                        
          <div onClick={()=>setShowGuide(true)} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(10,132,255,0.08)",borderRadius:16,padding:14,marginBottom:12,border:"1px solid rgba(10,132,255,0.2)",cursor:"pointer"}}>
            <span style={{fontSize:22}}>📖</span>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"white"}}>How to Use Cliniverse AI</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>Quick guide to all features</div></div>
            <span style={{fontSize:20,color:"rgba(255,255,255,0.3)"}}>›</span>
          </div>
          {showGuide&&<div style={{position:"fixed",inset:0,zIndex:400,overflowY:"auto",background:"#0a0015"}}><UserGuide onClose={()=>setShowGuide(false)} onUpgrade={()=>{setShowGuide(false);setShowUpgrade(true)}}/></div>}
          {/* ACHIEVEMENTS — Apple Health 2026 */}
            <div style={{...glassCard,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:T.text}}>Achievements</div>
                  <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Unlock by completing cases</div>
                </div>
                <div style={{background:'rgba(255,214,10,0.15)',border:'1px solid rgba(255,214,10,0.3)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:800,color:'#ffd60a'}}>{casesCompleted>0?2:0}/{BADGES.length}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {BADGES.map(b=>{
                  const earned=(b.id==='first_case'&&casesCompleted>0)||(b.id==='stemi'&&casesCompleted>0)
                  return(
                    <div key={b.id} style={{
                      display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                      padding:'14px 4px 10px',borderRadius:18,
                      background:earned
                        ? dark ? `linear-gradient(145deg,${b.color}18,${b.color}06)` : `linear-gradient(145deg,${b.color}12,${b.color}04)`
                        : dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',
                      border:earned ? `1px solid ${b.color}35` : dark?'1px solid rgba(255,255,255,0.05)':'1px solid rgba(0,0,0,0.05)',
                      opacity:earned?1:0.3,
                      boxShadow:earned&&dark?`0 4px 20px ${b.color}15`:'none',
                      position:'relative',overflow:'hidden',transition:'all 0.3s',
                    }}>
                      {earned&&<div style={{position:'absolute',top:6,left:'50%',transform:'translateX(-50%)',width:28,height:28,borderRadius:'50%',background:b.color,filter:'blur(14px)',opacity:0.2,pointerEvents:'none'}}/>}
                      <div style={{
                        width:40,height:40,borderRadius:13,
                        background:earned?`linear-gradient(135deg,${b.color}28,${b.color}10)`:'rgba(255,255,255,0.04)',
                        border:earned?`1px solid ${b.color}30`:'1px solid rgba(255,255,255,0.06)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:21,position:'relative',zIndex:1,
                        boxShadow:earned&&dark?`0 0 14px ${b.color}25`:'none',
                        animation:earned?'iconPulse 3s ease-in-out infinite':'none',
                      }}>{b.icon}</div>
                      <div style={{fontSize:8,fontWeight:800,color:earned?b.color:T.textMuted,textAlign:'center',lineHeight:1.3,position:'relative',zIndex:1,letterSpacing:0.2}}>{b.name}</div>
                      {earned&&<div style={{width:14,height:2,borderRadius:1,background:b.color,boxShadow:`0 0 5px ${b.color}`,opacity:0.9}}/>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FACE SWAP */}
            <div style={{...glassCard,padding:16,marginTop:2}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700,color:'white'}}>AI</div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.text}}>Face-Swap Video</div>
                  <div style={{fontSize:12,color:T.textSub}}>Become the lead physician</div>
                </div>
              </div>
              <div style={{background:'rgba(255,255,255,0.03)',borderRadius:14,padding:20,textAlign:'center',border:'1.5px dashed rgba(255,255,255,0.1)',marginBottom:10,cursor:'pointer'}}>
                <div style={{fontSize:34,marginBottom:6}}>🤳</div>
                <div style={{fontSize:13,color:T.textSub}}>Tap to upload photo</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>JPG · PNG · Front-facing</div>
              </div>
              <button style={{width:'100%',padding:'14px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(139,92,246,0.5)'}}>🎬 Generate My Video — PRO</button>
            </div>

            {/* ── SUBSCRIPTION CARD — Apple 2026 ── */}
            <div style={{borderRadius:28,overflow:'hidden',marginTop:4,marginBottom:10,boxShadow:'0 16px 60px rgba(139,92,246,0.35)'}}>

              {/* Top gradient hero */}
              <div style={{background:'linear-gradient(145deg,#2d0a6e 0%,#0d0030 60%,#001030 100%)',padding:'28px 20px 24px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
                <div style={{position:'absolute',bottom:-30,left:-20,width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.2),transparent 70%)',pointerEvents:'none'}}/>

                {/* Badge */}
                <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,214,10,0.15)',border:'1px solid rgba(255,214,10,0.3)',borderRadius:20,padding:'4px 12px',marginBottom:14}}>
                  <span style={{fontSize:12}}>⭐</span>
                  <span style={{fontSize:11,fontWeight:800,color:'#ffd60a',letterSpacing:1}}>CLINIVERSE PRO</span>
                </div>

                <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:6}}>Unlock the full virtual hospital</div>

                {/* Price display */}
                <div style={{display:'flex',alignItems:'flex-end',gap:4,marginBottom:20}}>
                  <span style={{fontSize:48,fontWeight:900,color:'white',letterSpacing:-2,lineHeight:1}}>$9</span>
                  <span style={{fontSize:24,fontWeight:900,color:'white',lineHeight:1,marginBottom:4}}>.99</span>
                  <span style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:6,marginLeft:2}}>/month</span>
                </div>

                {/* Apple Pay button */}
                <button
                  onClick={()=>window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank')}
                  style={{width:'100%',padding:'16px',borderRadius:16,border:'none',background:'white',color:'black',fontSize:17,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10,letterSpacing:-0.3}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Pay with Apple Pay
                </button>

                {/* Credit card button */}
                <button
                  onClick={()=>window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank')}
                  style={{width:'100%',padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:15,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  💳 Credit / Debit Card
                </button>
              </div>

              {/* Features list */}
              <div style={{background:'rgba(255,255,255,0.03)',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'16px 20px'}}>
                {[
                  ['🏥','30+ Emergency Cases','ED · CCU · ICU · Neuro · Peds'],
                  ['🤖','AI Clinical Consultant','Powered by Claude AI'],
                  ['🧬','500+ MCQ Bank','With detailed explanations'],
                  ['📜','PDF Certificates','Per completed case'],
                  ['🎥','Face-Swap Videos','Become the lead physician'],
                  ['📊','Global Leaderboard','Compete worldwide'],
                ].map(([icon,title,sub])=>(
                  <div key={title as string} style={{display:'flex',alignItems:'center',gap:12,paddingBottom:12,marginBottom:12,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:'white'}}>{title}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:1}}>{sub}</div>
                    </div>
                    <div style={{color:'#30d158',fontSize:16}}>✓</div>
                  </div>
                ))}

                {/* Yearly option */}
                <div style={{background:'linear-gradient(135deg,rgba(48,209,88,0.1),rgba(10,132,255,0.08))',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(48,209,88,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',marginBottom:12}}
                  onClick={()=>window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank')}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:'white'}}>Switch to Yearly</div>
                    <div style={{fontSize:11,color:'rgba(48,209,88,0.9)',marginTop:2}}>Save 34% — only $6.58/mo</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:22,fontWeight:900,color:'#ffd60a'}}>$79</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>/year</div>
                  </div>
                </div>

                <div style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.25)',lineHeight:1.7}}>
                  Secure payment · Cancel anytime<br/>
                  <span style={{color:'rgba(255,255,255,0.15)'}}>Powered by Lemon Squeezy 🍋</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOARD */}
        {tab==='board'&&(
          <div><BoardExam onXP={addXP}/></div>
        )}

        {/* LEADERBOARD */}
        {tab==='leaderboard'&&(
          <div><Leaderboard currentXP={xp} currentRank={rank.name}/></div>
        )}

        {/* PRO */}
        {tab==='pro'&&(
          <div>
            {/* Hero */}
            <div style={{background:'linear-gradient(145deg,#2d0a6e,#0d0030)',borderRadius:28,padding:'32px 24px 28px',marginBottom:16,textAlign:'center',border:'1px solid rgba(139,92,246,0.35)',boxShadow:'0 12px 60px rgba(139,92,246,0.3)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-60,left:'50%',transform:'translateX(-50%)',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{fontSize:64,marginBottom:12,filter:'drop-shadow(0 0 20px rgba(255,214,10,0.6))'}}>⭐</div>
              <div style={{fontSize:11,letterSpacing:3,color:'rgba(191,90,242,0.9)',fontWeight:700,textTransform:'uppercase',marginBottom:8}}>Cliniverse</div>
              <h2 style={{fontSize:32,fontWeight:900,color:'white',margin:'0 0 8px',letterSpacing:-1}}>PRO Access</h2>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:14,lineHeight:1.7,margin:'0 0 28px',maxWidth:280,marginLeft:'auto',marginRight:'auto'}}>The full virtual hospital. Train like a consultant from day one.</p>

              {/* Pricing Toggle */}
              <div style={{display:'flex',gap:10,marginBottom:20,justifyContent:'center'}}>
                <div style={{background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',borderRadius:20,padding:'18px 20px',flex:1,maxWidth:160,cursor:'pointer',border:'2px solid rgba(255,255,255,0.2)',position:'relative'}}>
                  <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#30d158',borderRadius:10,padding:'2px 10px',fontSize:10,fontWeight:800,color:'white',whiteSpace:'nowrap'}}>MOST POPULAR</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontWeight:600,marginBottom:4}}>Monthly</div>
                  <div style={{fontSize:28,fontWeight:900,color:'white',lineHeight:1}}>$9.99</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>/month</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.06)',borderRadius:20,padding:'18px 20px',flex:1,maxWidth:160,cursor:'pointer',border:'1px solid rgba(139,92,246,0.3)'}}>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontWeight:600,marginBottom:4}}>Yearly</div>
                  <div style={{fontSize:28,fontWeight:900,color:'#ffd60a',lineHeight:1}}>$79</div>
                  <div style={{fontSize:11,color:'rgba(48,209,88,0.9)',marginTop:2}}>Save 34% 🎉</div>
                </div>
              </div>

              <button
                onClick={()=>window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank')}
                style={{background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',border:'none',borderRadius:18,padding:'18px 40px',fontSize:17,fontWeight:800,color:'white',cursor:'pointer',width:'100%',boxShadow:'0 8px 40px rgba(139,92,246,0.5)',letterSpacing:-0.3}}>
                🚀 Upgrade to PRO — $9.99/mo
              </button>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:10}}>Cancel anytime · Secure payment via Lemon Squeezy</p>
            </div>

            {/* Features Grid */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:2,textTransform:'uppercase',marginBottom:10,fontWeight:700}}>What's included</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {icon:'🏥',title:'30+ Cases',sub:'ED, CCU, ICU, Neuro, Peds',color:'#ff453a'},
                  {icon:'🤖',title:'AI Consultant',sub:'Powered by Claude AI',color:'#0a84ff'},
                  {icon:'📜',title:'Certificates',sub:'PDF per case',color:'#ffd60a'},
                  {icon:'🧬',title:'MCQ Bank',sub:'500+ clinical questions',color:'#30d158'},
                  {icon:'🎥',title:'Face-Swap',sub:'Become the lead doctor',color:'#bf5af2'},
                  {icon:'📊',title:'Leaderboard',sub:'Global rankings',color:'#ff9f0a'},
                  {icon:'🔔',title:'On-Call Alerts',sub:'Smart reminders',color:'#64d2ff'},
                  {icon:'📱',title:'Mobile App',sub:'iOS & Android soon',color:'#ff6b35'},
                ].map(f=>(
                  <div key={f.title} style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:'14px 12px',border:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',gap:6}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`${f.color}20`,border:`1px solid ${f.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
                      {f.icon}
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'white'}}>{f.title}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{f.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution Plan */}
            <div style={{background:'linear-gradient(135deg,rgba(10,132,255,0.12),rgba(139,92,246,0.08))',borderRadius:20,padding:20,border:'1px solid rgba(10,132,255,0.25)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{fontSize:32}}>🏛️</div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:'white'}}>Institution Plan</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.45)'}}>For hospitals & medical colleges</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:18,fontWeight:900,color:'#0a84ff'}}>$49<span style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.4)'}}>/mo</span></div>
              </div>
              <button
                onClick={()=>window.open('mailto:cliniverse@gmail.com?subject=Institution Plan','_blank')}
                style={{width:'100%',padding:'14px',borderRadius:14,border:'1px solid rgba(10,132,255,0.4)',background:'transparent',color:'#64d2ff',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                📧 Contact for Institution Access
              </button>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAV — Apple Health 2026 */}
      <div style={{position:'fixed',bottom:12,left:'50%',transform:'translateX(-50%)',zIndex:200,width:'calc(100% - 32px)',maxWidth:420}}>
        {/* Strong ambient glow underneath */}
        <div style={{position:'absolute',inset:-24,borderRadius:40,background:'radial-gradient(ellipse,rgba(139,92,246,0.45) 0%,rgba(10,132,255,0.2) 50%,transparent 75%)',filter:'blur(24px)',pointerEvents:'none'}}/>
        <nav style={{
          background:'linear-gradient(135deg,rgba(28,8,58,0.98),rgba(12,4,32,0.99))',
          backdropFilter:'blur(60px) saturate(200%)',
          WebkitBackdropFilter:'blur(60px) saturate(200%)',
          borderRadius:30,
          border:'1.5px solid rgba(139,92,246,0.4)',
          boxShadow:'0 0 0 1px rgba(139,92,246,0.15), 0 12px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 40px rgba(139,92,246,0.08), 0 0 60px rgba(139,92,246,0.15)',
          display:'grid',
          gridTemplateColumns:'repeat(5,1fr)',
          padding:'10px 8px 14px',
          position:'relative',
          fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Rounded,SF Pro Text,sans-serif',
        }}>
          {[
            {id:'hub',label:'Home',icon:'🏥',color:'#ff453a',glow:'rgba(255,69,58,0.7)'},
            {id:'tools',label:'Tools',icon:'⚡',color:'#ffd60a',glow:'rgba(255,214,10,0.7)'},
            {id:'mcq',label:'Board',icon:'📝',color:'#ff9f0a',glow:'rgba(255,159,10,0.7)'},
            {id:'workshop',label:'Work',icon:'💼',color:'#0a84ff',glow:'rgba(10,132,255,0.7)'},
            {id:'profile',label:'Me',icon:'👤',color:'#64d2ff',glow:'rgba(100,210,255,0.7)'},
          ].map(t=>{
            const active = tab===t.id
            return(
              <button key={t.id} onClick={()=>{ setTab(t.id); if(t.id==='tools'){markLiveSeen()} }} style={{
                background:'none',border:'none',cursor:'pointer',
                display:'flex',flexDirection:'column',alignItems:'center',
                gap:1,padding:'2px 1px',position:'relative',
              }}>
                {active&&<div style={{
                  position:'absolute',inset:-4,borderRadius:16,
                  background:`linear-gradient(135deg,${t.color}20,${t.color}08)`,
                  boxShadow:`0 0 20px ${t.glow}, 0 0 40px ${t.color}30`,
                  border:`1px solid ${t.color}40`,
                  animation:'pillGlow 2s ease-in-out infinite',
                }}/>}
                <div style={{
                  width:active?38:30,height:active?38:30,
                  borderRadius:active?13:9,
                  background:active?`linear-gradient(135deg,${t.color}30,${t.color}10)`:'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  transform:active?'translateY(-3px)':'none',
                  transition:'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                  boxShadow:active?`0 6px 20px ${t.glow},0 0 0 1px ${t.color}30`:'none',
                  position:'relative',zIndex:1,
                }}>
                  <NavIcon id={t.id} active={active} color={t.color}/>
                  {t.id==='tools'&&liveCount>0&&!active&&(
                    <div style={{position:'absolute',top:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#ff453a',border:'2px solid rgba(15,5,35,1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:900,color:'white',boxShadow:'0 0 8px rgba(255,69,58,0.8)',animation:'pulse 1.5s infinite'}}>
                      {liveCount > 9 ? '9+' : liveCount}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize:10,fontWeight:active?800:600,
                  color:active?t.color:dark?'rgba(255,255,255,0.75)':'rgba(0,0,0,0.55)',
                  transition:'all 0.2s',letterSpacing:active?0.5:0.2,
                  textTransform:'uppercase',position:'relative',zIndex:1,
                  fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Rounded,sans-serif',
                }}>{t.label}</span>
                {active&&<div style={{
                  width:3,height:3,borderRadius:'50%',marginTop:1,
                  background:t.color,
                  boxShadow:`0 0 6px ${t.color},0 0 10px ${t.glow}`,
                  animation:'liveDot 1.5s ease-in-out infinite',
                  position:'relative',zIndex:1,
                }}/>}
              </button>
            )
          })}
        </nav>
      </div>
      <div style={{height:72}}/>
      <style>{`
        @keyframes iconPulse{0%,to{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes rankPulse{0%,to{opacity:1}50%{opacity:0.7}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ringGlow{0%,to{filter:drop-shadow(0 0 6px currentColor)}50%{filter:drop-shadow(0 0 16px currentColor)}}
        @keyframes pillGlow{0%,100%{opacity:0.8}50%{opacity:1}}
        @keyframes liveDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:0.7}}
      `}</style>
      <PWAInstall/>
    </div>
  )
}
