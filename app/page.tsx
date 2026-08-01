'use client'
import { useState, useEffect } from 'react'
import { useClinical } from './components/ClinicalContext'
import SplashScreen from './components/SplashScreen'
import OnboardingSurvey from './components/OnboardingSurvey'
import CliniverseLogo from './components/Logo'
import dynamic from 'next/dynamic'
import HubPage from './components/HubPage'
import ProfilePage from './components/ProfilePage'
const DynamicNav = dynamic(() => import('./components/DynamicNav'), { ssr:false })
import ToolsPage from './components/ToolsPage'

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
const ClinicalNet      = dynamic(() => import('./components/ClinicalNet'),      { ssr: false })
const MedFeed          = dynamic(() => import('./components/MedFeed'),          { ssr: false })
const VirtualWard = dynamic(() => import('./components/VirtualWard'), { ssr: false })
const OnboardingFunnel = dynamic(() => import('./components/OnboardingFunnel'), { ssr: false })
const PWAInstall = dynamic(() => import('./components/PWAInstall'), { ssr: false })
const DynamicMCQ = dynamic(() => import('./components/DynamicMCQ'), { ssr: false })

const RANKS = [
  { name:'Clinical Clerk', icon:'🩺', color:'#64748b', xpNeeded:0 },
  { name:'Junior Resident', icon:'📋', color:'#00C4B4', xpNeeded:100 },
  { name:'Senior Resident', icon:'🔬', color:'#30d158', xpNeeded:300 },
  { name:'Registrar', icon:'⚕️', color:'#ff9500', xpNeeded:600 },
  { name:'Specialist', icon:'🏥', color:'#00C4B4', xpNeeded:1000 },
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
  { id:'lab100', icon:'🔬', name:'Lab Expert', color:'#00C4B4' },
  { id:'rad', icon:'🩻', name:'Radiologist', color:'#64d2ff' },
  { id:'pro', icon:'👑', name:'PRO Member', color:'#ffd60a' },
]

// ── SVG ICONS — Apple Health 2026 ──
const NavIcon = ({id, active, color}: {id:string, active:boolean, color:string}) => {
  const c = active ? color : 'rgba(238,246,250,0.60)'
  const w = 1.6
  const icons: Record<string,JSX.Element> = {
    hub: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={c} strokeWidth={w} strokeLinejoin="round"/>
    </svg>,
    lab: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 3v8.5L4.5 18A2 2 0 006.3 21h11.4a2 2 0 001.8-3L15 11.5V3" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 3h6M7 15h10" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <circle cx="10" cy="17.5" r="1" fill={active ? color : 'rgba(238,246,250,0.60)'}/>
      <circle cx="14" cy="16" r="0.8" fill={active ? color : 'rgba(238,246,250,0.60)'}/>
    </svg>,
    rad: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth={w}/>
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth={w}/>
      <path d="M12 5v4M12 15v4M5 12h4M15 12h4" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>,
    mcq: <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke={c} strokeWidth={w}/>
      <path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.8" fill={active ? color : 'rgba(238,246,250,0.60)'}/>
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
  text: '#0a1628',
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
  bg: 'radial-gradient(ellipse at 30% 20%, #1e3d52 0%, #162e3e 40%, #000510 100%)',
  headerBg: 'rgba(26,37,53,0.92)',
  headerBorder: 'rgba(0,196,180,0.25)',
  cardBg: 'rgba(255,255,255,0.12)',
  cardBorder: 'rgba(0,196,180,0.30)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  navBg: 'rgba(10,0,21,0.95)',
  navBorder: 'rgba(0,196,180,0.3)',
  navActiveColor: '#00C4B4',
  navInactiveColor: 'rgba(255,255,255,0.3)',
  inputBg: 'rgba(255,255,255,0.12)',
  accent: '#00C4B4',
  segmentBg: 'rgba(255,255,255,0.12)',
  caseBg: 'rgba(28,14,50,0.9)',
}

export default function Home() {
  const { tab, setTab, toolTab, setToolTab, xp, addXP, casesCompleted, setCasesCompleted, mcqCorrect, setMcqCorrect, isPro, setIsPro, userName, setUserName, showUpgrade, setShowUpgrade } = useClinical()
  const [screen, setScreen] = useState('hub')
  const [progress, setProgress] = useState(0)
  const [tagline, setTagline] = useState(0)
  const [showSplash, setShowSplash] = useState(true)
  const [showSurvey, setShowSurvey] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [userName, setUserName] = useState('')
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
  const [dark] = useState(true)
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState<{q:string,a:string}[]>([])
  const [isPro] = useState(false) // set true after payment
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const openCheckout = (url: string) => setCheckoutUrl(url)
  const [showAdmin, setShowAdmin] = useState(false)
  const liveCount = 0; const markLiveSeen = () => {}

  const T = dark ? darkTheme : lightTheme

  // Show onboarding for first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem('onboarding_completed')
    if (seen) setShowOnboarding(false)
  }, [])

  const taglines = ['Where medicine meets precision.','Train on real emergencies.','Think like a consultant.','AI-powered clinical intelligence.']

  const criticalCases: any[] = [
    { id:'septic_shock', icon:'🦠', title:'Septic Shock',         sub:'Vasopressors · Bundle',    color:'#FF3B30', free:true,  xpReward:30 },
    { id:'ards',         icon:'🫁', title:'ARDS Management',       sub:'Prone · Lung-protective',  color:'#007AFF', free:true,  xpReward:30 },
    { id:'sofa',         icon:'📊', title:'SOFA Score Calculator', sub:'Organ failure · Mortality', color:'#FF9500', free:true,  xpReward:20 },
    { id:'vent',         icon:'🔧', title:'Ventilator Simulator',  sub:'Settings · Lung-protective',color:'#AF52DE', free:false, xpReward:25 },
  ]

  const sportsCases: any[] = [
    { id:'concussion',  icon:'🏃', title:'Concussion Assessment', sub:'SCAT6 · FIFA Protocol',    color:'#007AFF', free:true,  xpReward:25 },
    { id:'heatstroke',  icon:'☀️', title:'Heat Stroke',           sub:'EHS · Cold immersion',     color:'#FF3B30', free:true,  xpReward:25 },
    { id:'sca_sports',  icon:'🫀', title:'Cardiac Arrest',        sub:'Pitch-side · AED',         color:'#FF3B30', free:false, xpReward:30 },
    { id:'rtp',         icon:'🏆', title:'Return to Play',        sub:'6-step FIFA protocol',     color:'#34C759', free:true,  xpReward:20 },
  ]

  const pedsCases: any[] = [
    { id:'febrile',   icon:'🌡️', title:'Febrile Seizure', sub:'Management · Safety-net',    color:'#FF3B30', free:true,  xpReward:20 },
    { id:'croup',     icon:'🫁', title:'Croup',           sub:'Westley · Dex · Adrenaline', color:'#007AFF', free:true,  xpReward:20 },
    { id:'dka_peds',  icon:'💉', title:'Paediatric DKA',  sub:'BSPED · Cerebral oedema',    color:'#FF9500', free:false, xpReward:25 },
  ]

  const radCases: any[] = []

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
    const prog=setInterval(()=>{setProgress(p=>{if(p>=100){clearInterval(prog);setTimeout(()=>setScreen('welcome'),400);return 100}return p+1.2})},30)
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
      <div style={{position:'fixed',top:-80,left:'50%',transform:'translateX(-50%)',width:500,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.08) 0%,transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(60px)'}}/>
      <div style={{position:'fixed',bottom:-80,right:-60,width:350,height:350,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,168,71,0.06) 0%,transparent 70%)',pointerEvents:'none',zIndex:0,filter:'blur(60px)'}}/>
    </>
  )
  // ADMIN DASHBOARD
  if(showAdmin) return <AdminDashboard onClose={()=>setShowAdmin(false)}/>

  // UPGRADE MODAL
  if(showUpgrade) return (
    <div style={{position:'fixed',inset:0,background:'rgba(10,22,40,0.85)',backdropFilter:'blur(20px)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'linear-gradient(145deg,#0d3347,#162e3e)',borderRadius:28,padding:32,maxWidth:380,width:'100%',border:'1px solid rgba(0,196,180,0.4)',boxShadow:'0 20px 80px rgba(0,196,180,0.4)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <button onClick={()=>setShowUpgrade(false)} style={{position:'absolute',top:16,right:16,background:'rgba(0,196,180,0.20)',border:'none',borderRadius:'50%',width:32,height:32,color:'var(--text-primary, white)',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        <div style={{fontSize:52,textAlign:'center',marginBottom:12,filter:'drop-shadow(0 0 20px rgba(255,214,10,0.5))'}}>🔒</div>
        <h2 style={{fontSize:24,fontWeight:900,color:'var(--text-primary, white)',textAlign:'center',margin:'0 0 8px',letterSpacing:-0.5}}>PRO Case</h2>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:14,textAlign:'center',lineHeight:1.7,margin:'0 0 24px'}}>Unlock all 30+ emergency cases with Cliniverse PRO</p>
        <div style={{background:'var(--bg-card,rgba(255,255,255,0.05))',borderRadius:16,padding:'14px 16px',marginBottom:20}}>
          {['30+ Emergency Cases','AI Clinical Consultant','PDF Certificates','500+ MCQ Bank','Global Leaderboard'].map(f=>(
            <div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid rgba(36,63,82,0.50)'}}>
              <span style={{color:'#30d158',fontSize:14}}>✓</span>
              <span style={{color:'rgba(255,255,255,0.8)',fontSize:13}}>{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={()=>{openCheckout('https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly?embed=1&dark=1');setShowUpgrade(false)}}
          style={{width:'100%',padding:'16px',borderRadius:16,border:'none',background:'white',color:'black',fontSize:16,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Pay with Apple Pay · $14.99/mo
        </button>
        <button
          onClick={()=>{openCheckout('https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly?embed=1&dark=1');setShowUpgrade(false)}}
          style={{width:'100%',padding:'14px',borderRadius:16,border:'1px solid rgba(0,196,180,0.4)',background:'transparent',color:'#6ee7e1',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          💳 Pay with Card
        </button>
      </div>
    </div>
  )

  // LAUNCH
  if(showOnboarding) return (
    <OnboardingFunnel onComplete={()=>{
      localStorage.setItem('onboarding_completed','1')
      setShowOnboarding(false)
    }}/>
  )

  if(screen==='launch') return (
    <div style={{minHeight:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg-base, #162e3e)',fontFamily:'-apple-system,sans-serif',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.25) 0%,transparent 70%)',top:-150,left:-150,filter:'blur(60px)'}}/>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.12) 0%,transparent 70%)',bottom:-100,right:-100,filter:'blur(60px)'}}/>
      <div style={{marginBottom:28,position:'relative'}}>
        <svg width={130} height={130} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={55} fill="none" stroke="rgba(0,196,180,0.3)" strokeWidth={1}/>
          <circle cx={60} cy={60} r={55} fill="none" stroke="url(#grad)" strokeWidth={2} strokeDasharray="345" strokeDashoffset={345-(345*progress/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.1s'}}/>
          <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00C4B4"/><stop offset="50%" stopColor="#00C4B4"/><stop offset="100%" stopColor="#30d158"/></linearGradient></defs>
          <path d="M18 60 L34 60 L42 32 L52 88 L62 60 L70 60 L77 44 L84 76 L91 60 L102 60" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',boxShadow:'0 0 60px rgba(0,196,180,0.5)',animation:'pulse 2s ease-in-out infinite'}}/>
      </div>
      <div style={{marginBottom:6,textAlign:'center'}}>
        <span style={{fontSize:40,fontWeight:900,letterSpacing:-1,background:'linear-gradient(135deg,#ffffff,rgba(200,180,255,0.95))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',display:'block',lineHeight:1}}>CLINIVERSE</span>
        <span style={{fontSize:40,fontWeight:900,letterSpacing:3,background:'linear-gradient(135deg,#00C4B4,#0a84ff,#30d158)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',display:'block',lineHeight:1}}>AI</span>
      </div>
      <div style={{fontSize:10,color:'rgba(0,196,180,0.25)',letterSpacing:4,textTransform:'uppercase',marginBottom:10}}>Virtual Hospital Hub</div>
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:20,background:'rgba(0,196,180,0.3)',border:'1px solid rgba(0,196,180,0.4)',color:'#6ee7e1'}}>⚕ 21 Cases</span>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:20,background:'rgba(245,158,11,0.2)',border:'1px solid rgba(245,158,11,0.4)',color:'#fbbf24'}}>◈ 164 MCQs</span>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:20,background:'rgba(255,59,48,0.2)',border:'1px solid rgba(255,59,48,0.4)',color:'#fca5a5'}}>🚨 10 Simulations</span>
      </div>
      <div style={{height:22,marginBottom:28,overflow:'hidden',width:300,textAlign:'center'}}>
        <p key={tagline} style={{fontSize:13,color:'rgba(255,255,255,0.5)',margin:0,animation:'slideUp 0.6s ease'}}>{taglines[tagline]}</p>
      </div>
      <div style={{width:220,height:2,background:'rgba(255,255,255,0.14)',borderRadius:1,marginBottom:12,overflow:'hidden'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,#00C4B4,#0a84ff,#30d158)',width:`${progress}%`,transition:'width 0.1s'}}/>
      </div>
      <p style={{fontSize:10,color:'rgba(255,255,255,0.12)',letterSpacing:2}}>v5.0 · SECURE · Built by a Physician</p>
    </div>
  )

  if(screen==='welcome') return (
    <div style={{minHeight:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg-base, #162e3e)',fontFamily:'-apple-system,sans-serif',padding:'0 32px',textAlign:'center'}}>
      <div style={{animation:'fadeIn 0.8s ease',maxWidth:420,width:'100%'}}>
        <p style={{fontSize:13,color:'rgba(0,196,180,0.8)',letterSpacing:3,textTransform:'uppercase',marginBottom:16,fontWeight:600}}>Welcome to</p>
        <h1 style={{fontSize:56,fontWeight:900,margin:'0 0 6px',letterSpacing:-2,lineHeight:1,background:'linear-gradient(135deg,#fff,rgba(200,180,255,0.9))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Cliniverse</h1>
        <h1 style={{fontSize:56,fontWeight:900,margin:'0 0 20px',letterSpacing:3,lineHeight:1,background:'linear-gradient(135deg,#00C4B4,#0a84ff,#30d158)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.7,margin:'0 auto 40px',maxWidth:300}}>The clinical intelligence platform built by a physician, for physicians.</p>
        <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:360,margin:'0 auto'}}>
          <button onClick={()=>setScreen('signin')} style={{padding:'18px 32px',borderRadius:16,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:17,fontWeight:700,boxShadow:'0 8px 40px rgba(0,196,180,0.5)'}}>Enter Hospital →</button>
          <button onClick={()=>setScreen('signin')} style={{padding:'16px 32px',borderRadius:16,cursor:'pointer',background:'var(--bg-card,rgba(255,255,255,0.05))',color:'rgba(255,255,255,0.55)',fontSize:15,border:'1px solid rgba(0,196,180,0.20)'}}>Sign in with existing account</button>
        </div>
      </div>
    </div>
  )

  if(screen==='signin') return (
    <div style={{minHeight:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 70% 80%, #1e3d52 0%, #162e3e 40%, #000510 100%)',fontFamily:'-apple-system,sans-serif',padding:'40px 24px'}}>
      <div style={{animation:'fadeIn 0.6s ease',width:'100%',maxWidth:420}}>
        <p style={{fontSize:13,color:'rgba(0,196,180,0.7)',letterSpacing:2,textTransform:'uppercase',marginBottom:8,fontWeight:600}}>Cliniverse AI</p>
        <h2 style={{fontSize:36,fontWeight:800,color:'var(--text-primary, white)',margin:'0 0 6px',letterSpacing:-1}}>Sign In</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:36}}>Access your clinical dashboard</p>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:8,display:'block'}}>Email / Medical ID</label>
          <input placeholder="doctor@hospital.com" style={{width:'100%',padding:'16px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(255,255,255,0.14)',color:'var(--text-primary, white)',fontSize:15,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:28}}>
          <label style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:8,display:'block'}}>Password</label>
          <input type="password" placeholder="••••••••" style={{width:'100%',padding:'16px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(255,255,255,0.14)',color:'var(--text-primary, white)',fontSize:15,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <button onClick={()=>setScreen('app')} style={{width:'100%',padding:'17px',borderRadius:16,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:16,fontWeight:700,boxShadow:'0 8px 32px rgba(0,196,180,0.4)',marginBottom:14}}>Access Hospital →</button>
        <div style={{display:'flex',gap:10,marginBottom:24}}>
          <button onClick={()=>setScreen('app')} style={{flex:1,padding:'15px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.6)',fontSize:14,cursor:'pointer'}}>Face ID 🔒</button>
          <button onClick={()=>setScreen('app')} style={{flex:1,padding:'15px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.6)',fontSize:14,cursor:'pointer'}}>Touch ID 👆</button>
        </div>
        <p style={{textAlign:'center',fontSize:13,color:'rgba(238,246,250,0.60)'}}>New physician? <span style={{color:'#00C4B4',cursor:'pointer'}} onClick={()=>setScreen('app')}>Request Access</span></p>
      </div>
    </div>
  )

  // CASE VIEW
  if(activeCase){
    const allCases=[...criticalCases,...sportsCases,...pedsCases]
    const c=allCases.find(x=>x.id===activeCase)!
    return(
      <div style={{minHeight:'100vh',width:'100vw',background:'var(--bg-base, #162e3e)',fontFamily:'-apple-system,sans-serif',paddingBottom:0,position:'relative'}}>
        {ambientGlow}

      {/* ── WATERMARK ── */}
      <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:9999,opacity:0.08,width:500,height:500}}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="500" height="500">
          <rect x="5" y="5" width="90" height="90" rx="23" fill="rgba(255,213,79,0.15)" stroke="rgba(255,213,79,0.9)" strokeWidth="2"/>
          <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="rgba(255,213,79,1)" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M36 50L46 63L70 36" stroke="rgba(0,229,255,1)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="69" cy="32" r="5" fill="rgba(255,213,79,1)"/>
          <circle cx="69" cy="68" r="5" fill="rgba(255,213,79,1)"/>
        </svg>
      </div>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',zIndex:0,overflow:'hidden',opacity:0.045}}>
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',zIndex:1,overflow:'hidden'}}>
          <div style={{opacity:0.08,transform:'scale(1.2)'}}>
            <CliniverseLogo size={520}/>
          </div>
        </div>
      </div>
        <div style={{background:`linear-gradient(160deg,${c.color}22,rgba(10,0,21,0.9))`,backdropFilter:'blur(30px)',padding:'56px 20px 24px',borderBottom:'1px solid rgba(0,196,180,0.25)',position:'relative',zIndex:1}}>
          <button onClick={()=>setActiveCase(null)} style={{background:'rgba(0,196,180,0.25)',backdropFilter:'blur(10px)',border:'1px solid rgba(0,196,180,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 18px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:18,fontWeight:600}}>← Back</button>
          <div style={{fontSize:50,marginBottom:8}}>{c.icon}</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 4px',color:T.text}}>{c.title}</h1>
          <p style={{color:T.textSub,fontSize:13,margin:0}}>{c.sub}</p>
        </div>
        <div style={{padding:'16px 20px',maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}}>
          <p style={{color:'var(--text-secondary, rgba(238,246,250,0.65))',fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 10px',fontWeight:700}}>Vital Signs</p>
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
            <p style={{color:'var(--text-secondary, rgba(238,246,250,0.65))',fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 8px',fontWeight:700}}>Clinical Presentation</p>
            <p style={{color:T.text,fontSize:13,lineHeight:1.8,margin:0}}>{c.presentation}</p>
          </div>
          <div style={{...glassCard,padding:16,marginBottom:14}}>
            <p style={{color:'var(--text-secondary, rgba(238,246,250,0.65))',fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 12px',fontWeight:700}}>Management Protocol</p>
            {c.management.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:`${c.color}22`,border:`1.5px solid ${c.color}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:800,color:c.color}}>{i+1}</div>
                <p style={{color:T.text,fontSize:13,lineHeight:1.65,margin:0}}>{m}</p>
              </div>
            ))}
          </div>
          <button onClick={()=>completeCase(c.xpReward)} style={{width:'100%',padding:'16px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${c.color},${c.color}bb)`,color:'var(--text-primary, white)',fontSize:15,fontWeight:700,marginBottom:10,boxShadow:`0 6px 24px ${c.color}55`}}>✅ Complete Case +{c.xpReward} XP</button>
          
          {/* AI CLINICAL CONSULTANT */}
          <button onClick={()=>{setShowAI(s=>!s);setAiHistory([]);setAiResponse('')}} style={{width:'100%',padding:'14px',borderRadius:18,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#1e3d52,#162e3e)',color:'var(--text-primary, white)',fontSize:14,fontWeight:700,marginBottom:10,boxShadow:'0 6px 24px rgba(0,196,180,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span style={{fontSize:18}}>🤖</span> AI Clinical Consultant {showAI?'▲':'▼'}
          </button>

          {showAI&&(
            <div style={{background:'linear-gradient(145deg,rgba(15,23,42,0.97),rgba(10,15,30,0.99))',borderRadius:20,padding:18,marginBottom:14,border:'1px solid rgba(0,196,180,0.3)',boxShadow:'0 8px 40px rgba(0,196,180,0.3)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🤖</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary, white)'}}>Claude AI Consultant</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>Ask anything about this case</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:10,padding:'3px 10px',borderRadius:10,background:'rgba(48,209,88,0.15)',color:'#30d158',border:'1px solid rgba(48,209,88,0.3)',fontWeight:700}}>● LIVE</div>
              </div>

              {/* Suggested questions */}
              {aiHistory.length===0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,color:'var(--text-secondary, rgba(238,246,250,0.65))',marginBottom:8,letterSpacing:1,textTransform:'uppercase'}}>Suggested Questions</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      `What is the first-line treatment for ${c.title}?`,
                      `What are the contraindications in this case?`,
                      `When should I consider ICU admission?`,
                    ].map(q=>(
                      <button key={q} onClick={()=>setAiQuestion(q)} style={{background:'var(--bg-card,rgba(255,255,255,0.05))',border:'1px solid rgba(36,63,82,0.65)',borderRadius:12,padding:'10px 14px',color:'rgba(255,255,255,0.7)',fontSize:12,cursor:'pointer',textAlign:'left',fontWeight:500}}>{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat history */}
              {aiHistory.map((item,i)=>(
                <div key={i} style={{marginBottom:12}}>
                  <div style={{background:'rgba(0,196,180,0.12)',border:'1px solid rgba(0,196,180,0.3)',borderRadius:12,padding:'10px 14px',marginBottom:6}}>
                    <div style={{fontSize:10,color:'rgba(0,196,180,0.8)',marginBottom:4,fontWeight:700}}>YOU</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>{item.q}</div>
                  </div>
                  <div style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(0,196,180,0.15)',borderRadius:12,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'rgba(10,132,255,0.8)',marginBottom:4,fontWeight:700}}>🤖 CLAUDE AI</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}>{item.a}</div>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {aiLoading&&(
                <div style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(0,196,180,0.15)',borderRadius:12,padding:'14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid rgba(0,196,180,0.30)',borderTop:'2px solid #0a84ff',animation:'spin 1s linear infinite',flexShrink:0}}/>
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
                  style={{flex:1,padding:'12px 16px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(255,255,255,0.14)',color:'var(--text-primary, white)',fontSize:13,outline:'none'}}
                />
                <button
                  onClick={()=>askAI(`${c.title}: ${c.presentation}. Vitals: BP ${c.vitals.bp}, HR ${c.vitals.hr}, O2 ${c.vitals.o2}%. ECG: ${c.ecg}`)}
                  disabled={aiLoading||!aiQuestion.trim()}
                  style={{width:46,height:46,borderRadius:14,border:'none',background:aiLoading||!aiQuestion.trim()?'rgba(0,196,180,0.20)':'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:18,cursor:aiLoading||!aiQuestion.trim()?'not-allowed':'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}
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
      <div style={{minHeight:'100vh',width:'100vw',background:'var(--bg-base, #162e3e)',fontFamily:'-apple-system,sans-serif',paddingBottom:0,position:'relative'}}>
        {ambientGlow}
        <div style={{background:`linear-gradient(160deg,${r.color}18,rgba(10,0,21,0.9))`,backdropFilter:'blur(30px)',padding:'56px 20px 24px',borderBottom:'1px solid rgba(0,196,180,0.25)',position:'relative',zIndex:1}}>
          <button onClick={()=>setActiveRad(null)} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(0,196,180,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 18px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:18,fontWeight:600}}>← Back</button>
          <div style={{fontSize:50,marginBottom:8}}>{r.icon}</div>
          <h1 style={{fontSize:26,fontWeight:800,margin:'0 0 4px',color:T.text}}>{r.title}</h1>
          <p style={{color:T.textSub,fontSize:13,margin:0}}>{r.sub}</p>
        </div>
        <div style={{padding:'16px 20px',maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}}>
          <div style={{background:T.cardBg,borderRadius:18,padding:20,marginBottom:14,minHeight:150,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${T.cardBorder}`}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:68,marginBottom:10}}>{r.icon}</div><p style={{color:'var(--text-secondary, rgba(238,246,250,0.65))',fontSize:12,margin:0}}>Interactive viewer — PRO feature</p></div>
          </div>
          <div style={{...glassCard,padding:18,marginBottom:14}}>
            <p style={{color:'var(--text-secondary, rgba(238,246,250,0.65))',fontSize:10,letterSpacing:2,textTransform:'uppercase',margin:'0 0 12px',fontWeight:700}}>Radiologist Report</p>
            <p style={{color:T.text,fontSize:13,lineHeight:1.9,margin:0,whiteSpace:'pre-line'}}>{r.report}</p>
          </div>
          <button style={{width:'100%',padding:'16px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${r.color},${r.color}bb)`,color:'var(--text-primary, white)',fontSize:15,fontWeight:700}}>🤖 AI Interpretation</button>
        </div>
      </div>
    )
  }

  const rank=getCurrentRank(),nextRank=getNextRank(),rankPct=getRankPct()
  const currentMCQ=mcqs[mcqIndex]

  return(
    <div style={{minHeight:'100vh',width:'100vw',background:'var(--bg-base, #162e3e)',fontFamily:'-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif',display:'flex',flexDirection:'column',position:'relative'}}>
      {ambientGlow}

      {/* HEADER — Apple Health 2026 */}
      <header style={{background:T.headerBg,backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',padding:'0 14px',height:48,display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100,borderBottom:`0.5px solid ${T.headerBorder}`}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#0a84ff,#00C4B4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:'0 2px 8px rgba(10,132,255,0.4)'}}>⚕️</div>
          <b style={{fontSize:16,color:T.text,letterSpacing:-0.3}}>C<span style={{background:'linear-gradient(135deg,#0a84ff,#00C4B4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</span></b>
        </div>
        {/* Right — avatar + XP */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:600,color:'#00C4B4',flexShrink:0}}>{rank.icon}{xp} XP</div>
          <div onClick={()=>setTab('profile')} style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-primary, white)',fontSize:13,cursor:'pointer',flexShrink:0,boxShadow:'0 2px 10px rgba(0,196,180,0.5)'}}>👤</div>
        </div>
      </header>

      <main style={{flex:1,padding:'14px 16px',paddingBottom:140,maxWidth:700,margin:'0 auto',width:'100%',boxSizing:'border-box',position:'relative',zIndex:1}}>


        {/* HUB */}
        {tab==="hub"&&(
          <HubPage
            xp={xp} streak={streak} casesCompleted={casesCompleted}
            mcqCorrect={mcqCorrect} isPro={isPro}
            criticalCases={criticalCases} sportsCases={sportsCases} pedsCases={pedsCases}
            setActiveCase={setActiveCase} setShowUpgrade={setShowUpgrade}
            setTab={setTab} setToolTab={setToolTab} onXP={addXP}
          />
        )}

        {/* WORKSHOP */}
        {tab==='work'&&(
          <div><ClinicalWorkshop onXP={addXP}/></div>
        )}

        {tab==='net'&&(
          <div style={{padding:'0 0 20px'}}>
            <div style={{display:'flex',gap:4,background:'var(--bg-card,rgba(255,255,255,0.04))',borderRadius:16,padding:4,marginBottom:16,border:'1px solid rgba(255,255,255,0.12)'}}>
              <button id="net-feed" onClick={()=>{document.getElementById('net-social').style.display='none';document.getElementById('net-feed-content').style.display='block';document.getElementById('net-feed').style.background='rgba(255,255,255,0.07)';document.getElementById('net-social').style.background='transparent'}} style={{flex:1,padding:'9px',border:'none',cursor:'pointer',borderRadius:12,fontFamily:'-apple-system,sans-serif',fontWeight:700,fontSize:12,background:'var(--bg-card-2,rgba(255,255,255,0.07))',color:'#00C4B4',transition:'all 0.2s'}}>📰 MedFeed</button>
              <button id="net-social" onClick={()=>{document.getElementById('net-feed-content').style.display='none';document.getElementById('net-social-content').style.display='block';document.getElementById('net-social').style.background='rgba(255,255,255,0.07)';document.getElementById('net-feed').style.background='transparent'}} style={{flex:1,padding:'9px',border:'none',cursor:'pointer',borderRadius:12,fontFamily:'-apple-system,sans-serif',fontWeight:700,fontSize:12,background:'transparent',color:'rgba(238,246,250,0.38)',transition:'all 0.2s'}}>🌐 ClinicalNet</button>
            </div>
            <div id="net-feed-content"><MedFeed onXP={addXP}/></div>
            <div id="net-social-content" style={{display:'none'}}><ClinicalNet onXP={addXP}/></div>
          </div>
        )}

        {tab==='ward'&&(
          <div><VirtualWard onXP={addXP}/></div>
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
                    <div style={{fontSize:11,color:'var(--text-secondary, rgba(238,246,250,0.65))',marginTop:1}}>{l.unit}</div>
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
                <div style={{background: dark ? 'rgba(10,132,255,0.08)' : 'rgba(219,234,254,0.6)',borderRadius:10,padding:'9px 12px',border: dark ? '1px solid rgba(0,196,180,0.15)' : '1px solid rgba(59,130,246,0.15)'}}>
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
                <span style={{fontSize:20,color:'var(--text-secondary, rgba(238,246,250,0.65))'}}>›</span>
              </div>
            ))}

            {/* CLINICAL PULSE */}
            <div style={{marginTop:16,background:'linear-gradient(135deg,rgba(255,214,10,0.08),rgba(255,159,10,0.06))',borderRadius:20,padding:16,border:'1px solid rgba(255,214,10,0.18)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:'rgba(255,214,10,0.06)',filter:'blur(16px)',pointerEvents:'none'}}/>
              <div style={{fontSize:10,color:'#ffd60a',fontWeight:800,letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>⚡ Clinical Pulse</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.5,marginBottom:12}}>Your daily clinical brief — trending cases, drug alerts & decision challenges.</div>
              <div style={{display:'flex',gap:8}}>
                <div onClick={()=>{setTab('tools');setToolTab('insights')}} style={{flex:1,background:'rgba(255,214,10,0.12)',borderRadius:12,padding:'9px 14px',fontSize:12,fontWeight:700,color:'#ffd60a',border:'1px solid rgba(255,214,10,0.25)',cursor:'pointer',textAlign:'center'}}>📊 My Stats</div>
                <div onClick={()=>setActiveCase('stemi')} style={{flex:1,background:'rgba(0,196,180,0.1)',borderRadius:12,padding:'9px 14px',fontSize:12,fontWeight:700,color:'#00C4B4',border:'1px solid rgba(0,196,180,0.25)',cursor:'pointer',textAlign:'center'}}>🫀 Today's Case</div>
              </div>
            </div>

          </div>
        )}

        {/* MCQ */}
        {tab==='mcq'&&(
          <div><DynamicMCQ 
            onXP={addXP} 
            isPro={isPro}
            mcqCorrect={mcqCorrect}
            setMcqCorrect={setMcqCorrect}
            mcqTotal={mcqTotal}
            setMcqTotal={setMcqTotal}
          /></div>
        )}

        {/* TOOLS TAB */}
        {tab==='tools'&&(
          <ToolsPage onXP={addXP} />
        )}

        {tab==='profile'&&(
          <ProfilePage
            xp={xp} streak={streak} casesCompleted={casesCompleted}
            mcqCorrect={mcqCorrect} isPro={isPro}
            name={userName}
            onUpgrade={()=>setShowUpgrade(true)}
            onReset={()=>{localStorage.removeItem('onboarding_completed');setShowOnboarding(true)}}
          />
        )}

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
            <div style={{background:'linear-gradient(145deg,#0d3347,#162e3e)',borderRadius:28,padding:'32px 24px 28px',marginBottom:16,textAlign:'center',border:'1px solid rgba(0,196,180,0.35)',boxShadow:'0 12px 60px rgba(0,196,180,0.3)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-60,left:'50%',transform:'translateX(-50%)',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.3),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{fontSize:64,marginBottom:12,filter:'drop-shadow(0 0 20px rgba(255,214,10,0.6))'}}>⭐</div>
              <div style={{fontSize:11,letterSpacing:3,color:'rgba(0,196,180,0.9)',fontWeight:700,textTransform:'uppercase',marginBottom:8}}>Cliniverse</div>
              <h2 style={{fontSize:32,fontWeight:900,color:'var(--text-primary, white)',margin:'0 0 8px',letterSpacing:-1}}>PRO Access</h2>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:14,lineHeight:1.7,margin:'0 0 28px',maxWidth:280,marginLeft:'auto',marginRight:'auto'}}>The full virtual hospital. Train like a consultant from day one.</p>

              {/* Pricing Toggle */}
              <div style={{display:'flex',gap:10,marginBottom:20,justifyContent:'center'}}>
                <div style={{background:'linear-gradient(135deg,#00C4B4,#0a84ff)',borderRadius:20,padding:'18px 20px',flex:1,maxWidth:160,cursor:'pointer',border:'2px solid rgba(0,196,180,0.25)',position:'relative'}}>
                  <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#30d158',borderRadius:10,padding:'2px 10px',fontSize:10,fontWeight:800,color:'var(--text-primary, white)',whiteSpace:'nowrap'}}>MOST POPULAR</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontWeight:600,marginBottom:4}}>Monthly</div>
                  <div style={{fontSize:28,fontWeight:900,color:'var(--text-primary, white)',lineHeight:1}}>$9.99</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>/month</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.14)',borderRadius:20,padding:'18px 20px',flex:1,maxWidth:160,cursor:'pointer',border:'1px solid rgba(0,196,180,0.3)'}}>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontWeight:600,marginBottom:4}}>Yearly</div>
                  <div style={{fontSize:28,fontWeight:900,color:'#ffd60a',lineHeight:1}}>$79</div>
                  <div style={{fontSize:11,color:'rgba(48,209,88,0.9)',marginTop:2}}>Save 34% 🎉</div>
                </div>
              </div>

              <button
                onClick={()=>openCheckout('https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly?embed=1&dark=1')}
                style={{background:'linear-gradient(135deg,#00C4B4,#0a84ff)',border:'none',borderRadius:18,padding:'18px 40px',fontSize:17,fontWeight:800,color:'var(--text-primary, white)',cursor:'pointer',width:'100%',boxShadow:'0 8px 40px rgba(0,196,180,0.5)',letterSpacing:-0.3}}>
                🚀 Upgrade to PRO — $14.99/mo
              </button>
              <p style={{fontSize:11,color:'var(--text-secondary, rgba(238,246,250,0.65))',marginTop:10}}>Cancel anytime · Secure payment via Lemon Squeezy</p>
            </div>

            {/* Features Grid */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:2,textTransform:'uppercase',marginBottom:10,fontWeight:700}}>What's included</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {icon:'🏥',title:'30+ Cases',sub:'ED, CCU, ICU, Neuro, Peds',color:'#ff453a'},
                  {icon:'🤖',title:'AI Consultant',sub:'Powered by Claude AI',color:'#00C4B4'},
                  {icon:'📜',title:'Certificates',sub:'PDF per case',color:'#ffd60a'},
                  {icon:'🧬',title:'MCQ Bank',sub:'500+ clinical questions',color:'#30d158'},
                  {icon:'🎥',title:'Face-Swap',sub:'Become the lead doctor',color:'#bf5af2'},
                  {icon:'📊',title:'Leaderboard',sub:'Global rankings',color:'#ff9f0a'},
                  {icon:'🔔',title:'On-Call Alerts',sub:'Smart reminders',color:'#64d2ff'},
                  {icon:'📱',title:'Mobile App',sub:'iOS & Android soon',color:'#ff6b35'},
                ].map(f=>(
                  <div key={f.title} style={{background:'rgba(255,255,255,0.14)',borderRadius:18,padding:'14px 12px',border:'1px solid rgba(56,189,248,0.2)',display:'flex',flexDirection:'column',gap:6}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`${f.color}20`,border:`1px solid ${f.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
                      {f.icon}
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary, white)'}}>{f.title}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{f.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution Plan */}
            <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.12),rgba(0,196,180,0.08))',borderRadius:20,padding:20,border:'1px solid rgba(0,196,180,0.25)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{fontSize:32}}>🏛️</div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--text-primary, white)'}}>Institution Plan</div>
                  <div style={{fontSize:12,color:'rgba(238,246,250,0.60)'}}>For hospitals & medical colleges</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:18,fontWeight:900,color:'#00C4B4'}}>$49<span style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.4)'}}>/mo</span></div>
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
      {/* ── DYNAMIC NAV ── */}
      <DynamicNav/>

      <div style={{height:120}}/>
      <PWAInstall/>
    </div>
  )
}
