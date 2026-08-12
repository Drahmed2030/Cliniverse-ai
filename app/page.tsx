'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
const DocAnalyzer = dynamic(() => import('./components/DocAnalyzer'), { ssr:false })
const ClinicalOracle = dynamic(() => import('./components/ClinicalOracle'), { ssr:false })
import { ClinicalProvider } from './components/ClinicalContext'
import CliniverseLogo from './components/Logo'
import dynamic from 'next/dynamic'
const PulsePage = dynamic(() => import('./components/PulsePage'), { ssr:false })
const ClinicalNexus = dynamic(() => import('./components/ClinicalNexus'), { ssr: false })
const PulseIndex = dynamic(() => import('./components/pulse'), { ssr:false })
import ProfilePage from './components/ProfilePage'
const MePage = dynamic(() => import('./components/MePage'), { ssr:false })
const LifeScreen = dynamic(() => import('./components/LifeScreen'), { ssr:false })
const SplashScreen = dynamic(() => import('./components/SplashScreen'), { ssr:false })
const FloatingNav   = dynamic(() => import('./components/FloatingNav'),   { ssr:false })
const OnboardingFunnel = dynamic(() => import('./components/OnboardingFunnel'), { ssr:false })
const AuthScreen = dynamic(() => import('./components/AuthScreen'), { ssr:false })
const AfiaHome = dynamic(() => import('./components/AfiaHome'), { ssr:false })
const PaywallScreen = dynamic(() => import('./components/PaywallScreen'), { ssr:false })
const PWAInstall    = dynamic(() => import('./components/PWAInstall'),    { ssr:false })
const DynamicMCQ    = dynamic(() => import('./components/DynamicMCQ'),   { ssr:false })
const ToolsPage = dynamic(() => import('./components/ToolsPage'), { ssr:false })
const PulseRoom = dynamic(() => import('./components/PulseRoom'), { ssr:false })
const STEMICase = dynamic(() => import('./components/STEMICase'), { ssr:false })

const EcgChallenge        = dynamic(() => import('./components/EcgChallenge'),        { ssr:false })
const MedCalculators      = dynamic(() => import('./components/MedCalculators'),      { ssr:false })
const CodeBlue            = dynamic(() => import('./components/CodeBlue'),            { ssr:false })
const Leaderboard         = dynamic(() => import('./components/Leaderboard'),         { ssr:false })
const BoardExam           = dynamic(() => import('./components/BoardExam'),           { ssr:false })
const AdminDashboard      = dynamic(() => import('./components/AdminDashboard'),      { ssr:false })
const BLSACLSModule       = dynamic(() => import('./components/BLSACLSModule'),       { ssr:false })
const TeleconsultModule   = dynamic(() => import('./components/TeleconsultModule'),   { ssr:false })
const OnCallSystem        = dynamic(() => import('./components/OnCallSystem'),        { ssr:false })
const AICaseGenerator     = dynamic(() => import('./components/AICaseGenerator'),     { ssr:false })
const ClinicalDuels       = dynamic(() => import('./components/ClinicalDuels'),       { ssr:false })
const DiagnosticDetective = dynamic(() => import('./components/DiagnosticDetective'), { ssr:false })
const ErrorAutopsy        = dynamic(() => import('./components/ErrorAutopsy'),        { ssr:false })
const NightShiftSurvival  = dynamic(() => import('./components/NightShiftSurvival'),  { ssr:false })
const PharmacyModule      = dynamic(() => import('./components/PharmacyModule'),      { ssr:false })
const NursingModule       = dynamic(() => import('./components/NursingModule'),       { ssr:false })
const LabModule           = dynamic(() => import('./components/LabModule'),           { ssr:false })
const RadiologyModule     = dynamic(() => import('./components/RadiologyModule'),     { ssr:false })
const SocialHub           = dynamic(() => import('./components/SocialHub'),           { ssr:false })
const ClinicalWorkshop    = dynamic(() => import('./components/ClinicalWorkshop'),    { ssr:false })
const ClinicalNet         = dynamic(() => import('./components/ClinicalNet'),         { ssr:false })
const MedFeed             = dynamic(() => import('./components/MedFeed'),             { ssr:false })
const VirtualWard         = dynamic(() => import('./components/VirtualWard'),         { ssr:false })
const WardIndex = dynamic(() => import('./components/ward'), { ssr:false })
const AfiaSkeletonScreen = dynamic(() => import('./components/AfiaSkeletonScreen'), { ssr:false })
const LiveCasesSystem     = dynamic(() => import('./components/LiveCasesSystem'),     { ssr:false })
const HealthInsights      = dynamic(() => import('./components/HealthInsights'),      { ssr:false })

// ── DESIGN TOKENS — Liquid Ocean 2026 ──────────────────────────────────
const D = {
  // Backgrounds — layered luminous ocean
  bgBase:      'var(--bg-base, #EEF6FF)',
  bgCard:      'var(--bg-card, rgba(255,255,255,0.72))',
  bgCardHover: 'var(--bg-card-hover, rgba(255,255,255,0.88))',
  bgElevated:  'var(--bg-elevated, rgba(255,255,255,0.92))',

  // Text — deep navy on light, white on dark sections
  text:        'var(--text-primary, #0A1F3C)',
  textSub:     'var(--text-secondary, rgba(10,31,60,0.65))',
  textMuted:   'var(--text-muted, rgba(10,31,60,0.40))',

  // Accents
  teal:        '#00B8A9',
  cobalt:      '#0A84FF',
  coral:       '#FF6B6B',
  amber:       '#FFB347',
  violet:      '#7C5CFC',
  mint:        '#30D158',

  // Borders
  border:      'var(--border-card, rgba(10,132,255,0.12))',
  borderTeal:  'rgba(0,184,169,0.25)',
  borderCoral: 'rgba(255,107,107,0.25)',

  // Shadows — soft luminous
  shadow:      '0 2px 20px rgba(10,132,255,0.08), 0 1px 4px rgba(0,0,0,0.04)',
  shadowMd:    '0 8px 32px rgba(10,132,255,0.12), 0 2px 8px rgba(0,0,0,0.06)',
  shadowLg:    '0 20px 60px rgba(10,132,255,0.18), 0 4px 16px rgba(0,0,0,0.08)',

  // Glass card style
  glass: {
    background:        'var(--bg-card, rgba(255,255,255,0.72))',
    backdropFilter:    'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius:      20,
    border:            '1px solid var(--border-card, rgba(10,132,255,0.12))',
    boxShadow:         '0 4px 24px rgba(10,132,255,0.08), 0 1px 4px rgba(0,0,0,0.04)',
  },

  font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
}

// ── OCEAN AMBIENT BACKGROUND ─────────────────────────────────────────────
const OceanBg = () => (
  <>
    {/* Primary ocean gradient — sky to deep */}
    <div style={{
      position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
      background:'linear-gradient(160deg, #EEF6FF 0%, #F0F4FF 30%, #F5F0FF 60%, #EEF8F6 100%)',
    }}/>
    {/* Teal mist — top left */}
    <div style={{
      position:'fixed', top:-120, left:-80, width:500, height:500,
      borderRadius:'50%', pointerEvents:'none', zIndex:0,
      background:'radial-gradient(circle, rgba(0,184,169,0.12) 0%, transparent 65%)',
      filter:'blur(60px)',
    }}/>
    {/* Cobalt mist — top right */}
    <div style={{
      position:'fixed', top:-60, right:-100, width:420, height:420,
      borderRadius:'50%', pointerEvents:'none', zIndex:0,
      background:'radial-gradient(circle, rgba(10,132,255,0.10) 0%, transparent 65%)',
      filter:'blur(50px)',
    }}/>
    {/* Violet mist — bottom */}
    <div style={{
      position:'fixed', bottom:-100, left:'30%', width:400, height:400,
      borderRadius:'50%', pointerEvents:'none', zIndex:0,
      background:'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 65%)',
      filter:'blur(70px)',
    }}/>
    {/* Coral accent — bottom right */}
    <div style={{
      position:'fixed', bottom:-60, right:-80, width:320, height:320,
      borderRadius:'50%', pointerEvents:'none', zIndex:0,
      background:'radial-gradient(circle, rgba(255,107,107,0.07) 0%, transparent 65%)',
      filter:'blur(50px)',
    }}/>
  </>
)

// ── RANKS & BADGES ───────────────────────────────────────────────────────
const RANKS = [
  { name:'Clinical Clerk',     icon:'🩺', color:'#647280', xpNeeded:0 },
  { name:'Junior Resident',    icon:'📋', color:'#00B4A6', xpNeeded:100 },
  { name:'Senior Resident',    icon:'🔬', color:'#22C55E', xpNeeded:300 },
  { name:'Registrar',          icon:'⚕️', color:'#F59E0B', xpNeeded:600 },
  { name:'Specialist',         icon:'🏥', color:'#2B6DE5', xpNeeded:1000 },
  { name:'Consultant',         icon:'👨‍⚕️', color:'#EF4444', xpNeeded:1500 },
  { name:'Senior Consultant',  icon:'🎓', color:'#AF52DE', xpNeeded:2200 },
  { name:'Chief of Medicine',  icon:'🌟', color:'#5856D6', xpNeeded:3000 },
]

const BADGES = [
  { id:'first_case', icon:'🏅', name:'First Case',    color:'#FFD60A' },
  { id:'cardio',     icon:'🫀', name:'Cardiologist',  color:'#FF6B6B' },
  { id:'speed',      icon:'⚡', name:'Lightning MD',  color:'#FFD60A' },
  { id:'streak3',    icon:'🔥', name:'On Fire',       color:'#FF6B35' },
  { id:'mcq10',      icon:'🧬', name:'Brain Trust',   color:'#30D158' },
  { id:'stemi',      icon:'❤️‍🔥', name:'STEMI Master', color:'#FF6B6B' },
  { id:'sports',     icon:'⚽', name:'FIFA Medic',    color:'#30D158' },
  { id:'peds',       icon:'🧸', name:'Pediatrician',  color:'#7C5CFC' },
]

// ── VITAL BADGE ──────────────────────────────────────────────────────────
const VitalBadge = ({label,value,unit,critical}:{label:string,value:string,unit:string,critical:boolean}) => (
  <div style={{
    background: critical
      ? 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,107,107,0.06))'
      : D.glass.background,
    backdropFilter: D.glass.backdropFilter,
    WebkitBackdropFilter: D.glass.WebkitBackdropFilter,
    borderRadius:16, padding:'12px 10px',
    border: critical ? '1.5px solid rgba(255,107,107,0.35)' : D.glass.border,
    boxShadow: critical
      ? '0 4px 16px rgba(255,107,107,0.15)'
      : '0 2px 12px rgba(10,132,255,0.06)',
    textAlign:'center' as const,
  }}>
    <div style={{
      fontSize:9, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase' as const,
      color: critical ? '#FF6B6B' : D.textMuted, marginBottom:4,
    }}>{label}</div>
    <div style={{
      fontSize:15, fontWeight:800, lineHeight:1,
      color: critical ? '#E53E3E' : D.text,
    }}>{value}</div>
    <div style={{fontSize:9, color: critical ? 'rgba(229,62,62,0.7)' : D.textMuted, marginTop:2}}>{unit}</div>
    {critical && <div style={{fontSize:8, color:'#E53E3E', fontWeight:700, marginTop:3}}>⚠ CRITICAL</div>}
  
      {showNexus && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'var(--bg-base)',overflowY:'auto'}}>
          <button onClick={()=>setShowNexus(false)} style={{
            position:'fixed',top:16,left:16,zIndex:10000,
            background:'rgba(0,212,200,0.15)',border:'1px solid rgba(0,212,200,0.3)',
            borderRadius:12,padding:'8px 16px',color:'#00D4C8',cursor:'pointer',fontSize:14
          }}>← Back</button>
          <ClinicalNexus />
        </div>
      )}
</div>
)

// ── GLASS CARD COMPONENT ─────────────────────────────────────────────────
const GCard = ({children, accent, style={}}: {children:React.ReactNode, accent?:string, style?:React.CSSProperties}) => (
  <div style={{
    ...D.glass,
    ...(accent ? {
      border:`1px solid ${accent}30`,
      boxShadow:`0 4px 24px ${accent}12, 0 1px 4px rgba(0,0,0,0.04)`,
    } : {}),
    marginBottom:10,
    ...style,
  }}>
    {children}
  
      {showNexus && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'var(--bg-base)',overflowY:'auto'}}>
          <button onClick={()=>setShowNexus(false)} style={{
            position:'fixed',top:16,left:16,zIndex:10000,
            background:'rgba(0,212,200,0.15)',border:'1px solid rgba(0,212,200,0.3)',
            borderRadius:12,padding:'8px 16px',color:'#00D4C8',cursor:'pointer',fontSize:14
          }}>← Back</button>
          <ClinicalNexus />
        </div>
      )}
</div>
)

// ── LABEL ────────────────────────────────────────────────────────────────
const Label = ({children, color=D.textMuted}: {children:React.ReactNode, color?:string}) => (
  <div style={{
    fontSize:9, fontWeight:700, letterSpacing:1.5,
    textTransform:'uppercase' as const, color, marginBottom:8,
  }}>{children}
      {showNexus && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'var(--bg-base)',overflowY:'auto'}}>
          <button onClick={()=>setShowNexus(false)} style={{
            position:'fixed',top:16,left:16,zIndex:10000,
            background:'rgba(0,212,200,0.15)',border:'1px solid rgba(0,212,200,0.3)',
            borderRadius:12,padding:'8px 16px',color:'#00D4C8',cursor:'pointer',fontSize:14
          }}>← Back</button>
          <ClinicalNexus />
        </div>
      )}
</div>
)

function LoadingSpinner({ color = '#00C2B2' }: { color?: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:16 }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:`3px solid ${color}20`,
        borderTop:`3px solid ${color}`,
        animation:'spin 0.8s linear infinite',
      }}/>
      <div style={{ fontSize:13, color:'rgba(10,22,40,0.40)', fontWeight:600 }}>Loading...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Home() {
  const [tab, setTab]                   = useState('pulse')
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  const _mTX = useRef(0)
  const _mTY = useRef(0)
  const MAIN_TABS = ['hub','ward','oracle','tools','me']
  const swipeMain = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - _mTX.current
    const dy = e.changedTouches[0].clientY - _mTY.current
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return
    const i = MAIN_TABS.indexOf(tab)
    if (i === -1) return
    const target = e.target as HTMLElement
    const inScroll = target.closest('[data-no-swipe]')
    if (inScroll) return
    // Ignore gestures starting/ending near FloatingNav (bottom ~100px)
    // to prevent double-trigger with the raised Oracle center button.
    const vh = window.innerHeight
    if (_mTY.current > vh - 100 || e.changedTouches[0].clientY > vh - 100) return
    if (dx < -65 && i < MAIN_TABS.length-1) setTab(MAIN_TABS[i+1])
    if (dx >  65 && i > 0) setTab(MAIN_TABS[i-1])
  }
  const [toolTab, setToolTab]           = useState('codeblue')
  const [showNexus, setShowNexus] = useState(false)
  const [activeCase, setActiveCase]     = useState<string|null>(null)
  const [activeRad, setActiveRad]       = useState<string|null>(null)
  const [xp, setXp]                     = useState(0)
  const [streak]                        = useState(3)
  const [casesCompleted, setCasesCompleted] = useState(0)
  const [mcqCorrect, setMcqCorrect]     = useState(0)
  const [mcqTotal, setMcqTotal]         = useState(0)
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showAfia, setShowAfia] = useState(false)
  const [afiaLoading, setAfiaLoading] = useState(false)
  const [userType, setUserType] = useState<string|null>(() => { if (typeof window !== 'undefined') return localStorage.getItem('afia_user_type'); return null; })
  const [showAdmin, setShowAdmin]       = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showUpgrade, setShowUpgrade]   = useState(false)
  const [showAI, setShowAI]             = useState(false)
  const [aiQuestion, setAiQuestion]     = useState('')
  const [aiResponse, setAiResponse]     = useState('')
  const [aiLoading, setAiLoading]       = useState(false)
  const [aiHistory, setAiHistory]       = useState<{q:string,a:string}[]>([])
  const [isPro]                         = useState(false)
  const [userName]                      = useState('')

  useEffect(() => {
    const seen = localStorage.getItem('onboarding_completed')
    if (seen) {
      setShowOnboarding(false)
    }
  }, [])

  // ── DATA ──────────────────────────────────────────────────────────────
  const criticalCases = [
    { id:'stemi', icon:'🫀', title:'Anterior STEMI', sub:'LAD occlusion · Interactive SVG', color:'#FF6B6B', free:true, xpReward:50,
      vitals:{bp:'88/58',hr:'118',o2:'91',temp:'36.8',rr:'26',gcs:'15'},
      ecg:'ST elevation 3mm V1-V4. Anterior STEMI. LAD occlusion suspected.',
      presentation:'52M, crushing chest pain radiating to left arm × 45 minutes. Diaphoretic. BP 88/58 mmHg.',
      management:['Aspirin 300mg + Ticagrelor 180mg stat','Activate Cath Lab — PCI within 90 min','Heparin 5000 units IV bolus','O2 if SpO2 < 94%','Morphine 2.5mg IV for pain if needed'],
    },
    { id:'septic_shock', icon:'🦠', title:'Septic Shock',         sub:'Vasopressors · Bundle',    color:'#FF6B6B', free:true,  xpReward:30,
      vitals:{bp:'72/40',hr:'128',o2:'88',temp:'39.1',rr:'28',gcs:'13'},
      ecg:'Sinus tachycardia 128 bpm. No ST changes. QTc 440ms.',
      presentation:'62M, febrile, confused, hypotensive despite 2L IVF. Source: UTI vs pneumonia. Lactate 5.2.',
      management:['Blood cultures × 2, then IV piperacillin-tazobactam within 1h','Norepinephrine 0.1–0.3 mcg/kg/min — target MAP ≥65 mmHg','Hydrocortisone 200mg/day if vasopressor-refractory','Repeat lactate 2h — target clearance >10%','ICU admission, CVP/ScvO2 monitoring'],
    },
    { id:'ards', icon:'🫁', title:'ARDS Management',       sub:'Prone · Lung-protective',  color:'#0A84FF', free:true,  xpReward:30,
      vitals:{bp:'118/74',hr:'112',o2:'82',temp:'37.8',rr:'32',gcs:'14'},
      ecg:'Sinus tachycardia. No acute ischaemia.',
      presentation:'58F, day 3 COVID pneumonia, worsening hypoxia on 15L O2. CXR: bilateral infiltrates. P/F ratio 88.',
      management:['Intubate: TV 6ml/kg IBW, PEEP 12, FiO2 titrate to SpO2 92–96%','Prone positioning ≥16h/day if P/F <150','Neuromuscular blockade 48h (cisatracurium)','Conservative fluid strategy after resuscitation','Daily SBT when P/F >200 and PEEP ≤8'],
    },
    { id:'sofa', icon:'📊', title:'SOFA Score Calculator', sub:'Organ failure · Mortality', color:'#FFB347', free:true,  xpReward:20,
      vitals:{bp:'95/60',hr:'102',o2:'91',temp:'38.6',rr:'22',gcs:'14'},
      ecg:'Sinus rhythm. Non-specific ST changes.',
      presentation:'45M, post-laparotomy day 2. Rising creatinine 2.8, bilirubin 48, platelets 88. Calculate SOFA.',
      management:['Score each organ: resp/coag/liver/cardiovascular/CNS/renal','SOFA ≥2 = organ dysfunction → sepsis if infection present','SOFA rise >2 = poor prognosis (mortality 10–20%+)','Targeted organ support — no single "SOFA treatment"','Daily reassessment with trending'],
    },
    { id:'vent', icon:'🔧', title:'Ventilator Simulator',  sub:'Settings · Lung-protective',color:'#7C5CFC', free:false, xpReward:25,
      vitals:{bp:'122/78',hr:'88',o2:'95',temp:'36.9',rr:'16',gcs:'15'},
      ecg:'Normal sinus rhythm.',
      presentation:'Post-intubation ARDS. Set initial ventilator parameters for lung-protective ventilation.',
      management:['Mode: Volume AC','TV: 6 ml/kg IBW (not actual weight)','RR: 20–24 to maintain pH 7.30–7.45','PEEP: titrate with FiO2 using ARDSNet table','Plateau pressure: keep <30 cmH2O'],
    },
  ]

  const sportsCases = [
    { id:'concussion', icon:'🏃', title:'Concussion Assessment', sub:'SCAT6 · FIFA Protocol',    color:'#0A84FF', free:true,  xpReward:25,
      vitals:{bp:'128/74',hr:'88',o2:'99',temp:'36.8',rr:'16',gcs:'15'},
      ecg:'Normal sinus rhythm. No acute changes.',
      presentation:'22M footballer, head clash, GCS 15 but confused × 2 min, headache 6/10, failed tandem balance.',
      management:['Remove from play IMMEDIATELY — no same-day return (FIFA/IOC)','SCAT6 assessment pitch-side','Cervical spine precautions until cleared','Medical clearance before 6-step RTP protocol','Minimum 6-day graduated return to play'],
    },
    { id:'heatstroke', icon:'☀️', title:'Heat Stroke',           sub:'EHS · Cold immersion',     color:'#FF6B6B', free:true,  xpReward:25,
      vitals:{bp:'88/54',hr:'138',o2:'96',temp:'41.2',rr:'28',gcs:'11'},
      ecg:'Sinus tachycardia. Prolonged QT.',
      presentation:'Marathon runner, collapsed km 38. Rectal temp 41.2°C, combative, sweating stopped.',
      management:['Cold-water immersion IMMEDIATELY (target <38.9°C in 30 min)','Target cooling rate >0.15°C/min','IV NS 1L bolus — avoid lactate (impaired hepatic metabolism)','Monitor for rhabdomyolysis: CK, urine myoglobin','No antipyretics — ineffective in EHS'],
    },
    { id:'sca_sports', icon:'🫀', title:'Cardiac Arrest',        sub:'Pitch-side · AED',         color:'#FF6B6B', free:false, xpReward:30,
      vitals:{bp:'0/0',hr:'0',o2:'0',temp:'36.5',rr:'0',gcs:'3'},
      ecg:'VF → coarse fibrillation. Shock advised.',
      presentation:'17M footballer, sudden collapse. No pulse. AED advises shock.',
      management:['Call 999/911, start CPR immediately (100–120/min, 5–6cm depth)','AED on — shock VF/pVT without delay','2 min CPR cycles','Adrenaline 1mg IV every 3–5 min after 3rd shock','4 Hs and 4 Ts differential (hypovolaemia, hypoxia, commotio cordis)'],
    },
    { id:'rtp', icon:'🏆', title:'Return to Play',        sub:'6-step FIFA protocol',     color:'#30D158', free:true,  xpReward:20,
      vitals:{bp:'122/76',hr:'72',o2:'99',temp:'36.6',rr:'14',gcs:'15'},
      ecg:'Normal sinus rhythm.',
      presentation:'Post-concussion day 7. Symptom-free for 48h. Cleared by physician. Plan RTP.',
      management:['Step 1: Symptom-limited activity','Step 2: Light aerobic (walk/swim — no resistance)','Step 3: Sport-specific exercise (no contact)','Step 4: Non-contact drills (can resume cognitive load)','Step 5: Full-contact practice (medical clearance required)','Step 6: Return to competition'],
    },
  ]

  const pedsCases = [
    { id:'febrile', icon:'🌡️', title:'Febrile Seizure',   sub:'Management · Safety-net',    color:'#FF6B6B', free:true,  xpReward:20,
      vitals:{bp:'96/60',hr:'148',o2:'97',temp:'39.6',rr:'26',gcs:'14'},
      ecg:'Sinus tachycardia — no arrhythmia.',
      presentation:'18-month-old, 2-min generalised tonic-clonic, post-ictal now. Temp 39.6. First episode.',
      management:['Reassure parents — simple febrile seizure is benign in most cases','Treat fever: paracetamol/ibuprofen','LP indicated if <12 months, or signs of meningism','EEG not indicated after first simple febrile seizure','Safety-net: return if seizure >5 min, focal, or recurs within 24h'],
    },
    { id:'croup', icon:'🫁', title:'Croup',               sub:'Westley · Dex · Adrenaline', color:'#0A84FF', free:true,  xpReward:20,
      vitals:{bp:'94/58',hr:'138',o2:'94',temp:'38.2',rr:'36',gcs:'15'},
      ecg:'Sinus tachycardia.',
      presentation:'2-year-old, barking cough, inspiratory stridor, moderate subcostal recession. SpO2 94%.',
      management:['Westley score ≥3: moderate croup','Dexamethasone 0.15–0.6 mg/kg PO/IM (single dose)','Nebulised adrenaline 1:1000, 5ml if severe/SpO2<92%','Observe 2–4h post-adrenaline (rebound effect)','Heliox if refractory; intubation if exhausted'],
    },
    { id:'dka_peds', icon:'💉', title:'Paediatric DKA',   sub:'BSPED · Cerebral oedema',    color:'#FFB347', free:false, xpReward:25,
      vitals:{bp:'92/56',hr:'152',o2:'98',temp:'36.4',rr:'34',gcs:'13'},
      ecg:'Sinus tachycardia. Peaked T waves (K+ effect).',
      presentation:'9-year-old, known T1DM, vomiting 24h, Kussmaul breathing. pH 7.14, glucose 28.',
      management:['BSPED protocol — calculate deficit + maintenance separately','Fluid: 10ml/kg NS bolus ONLY if shocked (HR/CRT)','Insulin: 0.05–0.1 units/kg/hr — NOT until 1h after fluids','Monitor neuro hourly — headache/agitation = cerebral oedema','Mannitol 0.5–1g/kg if cerebral oedema suspected'],
    },
  ]

  const labs = [
    { name:'Troponin I',  normal:'< 0.04 ng/mL',  critical:'> 0.4',   unit:'ng/mL',    icon:'🫀', color:D.coral,   detail:'Rise 3–4h, peak 12–24h. Serial 0h/3h/6h. High-sens assay preferred.' },
    { name:'BNP',         normal:'< 100 pg/mL',   critical:'> 500',   unit:'pg/mL',    icon:'💧', color:D.cobalt,  detail:'Ventricular wall stress. Elevated in HF, PE, AF. Guides diuresis.' },
    { name:'Lactate',     normal:'0.5–2.0 mmol/L',critical:'> 4.0',   unit:'mmol/L',   icon:'⚡', color:D.amber,   detail:'Tissue hypoperfusion marker. Target clearance >10% per 2h in sepsis.' },
    { name:'Potassium',   normal:'3.5–5.0 mEq/L', critical:'> 6.5',   unit:'mEq/L',    icon:'⚗️', color:D.violet,  detail:'ECG first if >6.0. Calcium gluconate → insulin/dextrose → Kayexalate.' },
    { name:'Haemoglobin', normal:'M:13–17 / F:12–16',critical:'< 7',  unit:'g/dL',     icon:'🩸', color:D.coral,   detail:'Transfuse if Hb<7 (<8 in ACS). Check MCV/iron. Cross-match 4u.' },
    { name:'Creatinine',  normal:'0.6–1.2 mg/dL', critical:'> 10',    unit:'mg/dL',    icon:'🧪', color:D.teal,    detail:'eGFR calculation essential. Contrast risk eGFR<45. KDIGO AKI staging.' },
    { name:'INR',         normal:'0.8–1.2',        critical:'> 4.0',   unit:'ratio',    icon:'🩺', color:D.amber,   detail:'AF warfarin target 2.0–3.0. INR>4: hold, give Vit K PO/IV.' },
    { name:'D-Dimer',     normal:'< 0.5 μg/mL',   critical:'> 5.0',   unit:'μg/mL FEU',icon:'🔴', color:D.coral,   detail:'High sensitivity, low specificity. Rules out PE in low-probability.' },
    { name:'WBC',         normal:'4–11 ×10³/μL',  critical:'> 30 or <2',unit:'×10³/μL',icon:'🔬', color:D.mint,    detail:'Neutrophilia: bacterial. Left shift = bands. Lymphocytosis: viral.' },
    { name:'Sodium',      normal:'135–145 mEq/L',  critical:'< 120 or >160',unit:'mEq/L',icon:'💊', color:D.cobalt,  detail:'Correct hypo slowly: max 8 mEq/24h to avoid osmotic demyelination.' },
  ]

  // ── HELPERS ───────────────────────────────────────────────────────────
  const getCurrentRank = () => {
    let r = RANKS[0]
    for (let i = RANKS.length-1; i >= 0; i--) { if (xp >= RANKS[i].xpNeeded) { r = RANKS[i]; break } }
    return r
  }
  const getNextRank = () => { for (let i=0;i<RANKS.length;i++) { if (xp<RANKS[i].xpNeeded) return RANKS[i] } return null }
  const getRankPct  = () => { const c=getCurrentRank(),n=getNextRank(); if(!n) return 100; return Math.round(((xp-c.xpNeeded)/(n.xpNeeded-c.xpNeeded))*100) }

  const completeCase = (reward: number) => { setXp(x=>x+reward); setCasesCompleted(c=>c+1); setActiveCase(null) }
  const addXP = (n: number) => setXp(x=>x+n)

  const askAI = async (ctx: string) => {
    if (!aiQuestion.trim()) return
    setAiLoading(true)
    const q = aiQuestion; setAiQuestion('')
    try {
      const res = await fetch('/api/generate-case', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userPrompt: q, systemPrompt: `You are a senior clinical consultant. Context: ${ctx}. Answer in 3–5 sentences, evidence-based, practical.` })
      })
      const data = await res.json()
      const answer = data.content?.[0]?.text || data.result || 'Unable to get response.'
      setAiHistory(h=>[...h,{q,a:answer}])
      setAiResponse(answer)
    } catch { setAiResponse('Connection error. Please try again.') }
    setAiLoading(false)
  }

  // ── GUARDS ────────────────────────────────────────────────────────────
  if (showAdmin) return <AdminDashboard onClose={()=>setShowAdmin(false)}/>

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  if (showOnboarding) return (
    <OnboardingFunnel onComplete={(type?:string)=>{
      if(type==='patient'){
        setUserType('patient')
        localStorage.setItem('afia_user_type','patient')
        localStorage.setItem('onboarding_completed','1')
        setShowOnboarding(false)
        setTab('me')
        return
      }
      localStorage.setItem('onboarding_completed','1')
      setShowOnboarding(false)
      setShowPaywall(true)
    }}/>
  )

  // ── UPGRADE MODAL ─────────────────────────────────────────────────────
  if (showPaywall) return <PaywallScreen onClose={() => setShowPaywall(false)} onSubscribe={(plan) => { window.open(plan === 'yearly' ? 'https://cliniverse.lemonsqueezy.com/checkout/buy/pro-yearly' : 'https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly', '_blank'); setShowPaywall(false); }} />
  if (showAuth) return (<AuthScreen onComplete={() => { setShowAuth(false); }} />)

  if (showAfia && afiaLoading) return <AfiaSkeletonScreen />
  if (showAfia) return (
  <AfiaHome
    key={userType || 'new'}
    onSelect={(type) => {
      if (type) {
        setUserType(type);
        localStorage.setItem('afia_user_type', type);
      }
      // لا نغلق عافية — المستخدم يتنقل داخلها
    }}
    savedType={userType as any}
    onClose={() => setShowAfia(false)}
  />
)

  if (showUpgrade) return (
    <div style={{
      position:'fixed', inset:0, zIndex:999,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
      overflow:'hidden',
    }}>
      <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
        alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.3) 0%,rgba(15,23,42,0.97) 45%)'}}/>
      <button onClick={()=>setShowUpgrade(false)} style={{position:'absolute',top:16,right:16,zIndex:10,width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.2)',color:'white',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'0 20px 48px',overflowY:'auto'}}>
        <div style={{display:'inline-flex',alignSelf:'center',background:'linear-gradient(135deg,#0D9488,#1E40AF)',borderRadius:99,padding:'6px 20px',marginBottom:16,fontSize:12,fontWeight:800,color:'white',letterSpacing:1.5}}>⭐ CLINIVERSE PRO</div>
        <div style={{fontSize:34,fontWeight:900,color:'white',textAlign:'center',letterSpacing:-1,marginBottom:6}}>Unlock Everything</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.65)',textAlign:'center',marginBottom:24}}>Trusted by 47,000+ doctors worldwide</div>
        <div style={{background:'rgba(255,255,255,0.08)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:20,padding:'16px 20px',marginBottom:20}}>
          {[{icon:'🌐',text:'Global Nexus — live case voting'},{icon:'🧠',text:'Clinical Pulse Room — daily MCQ'},{icon:'💊',text:'Drug Interaction Checker'},{icon:'🤖',text:'AI Clinical Consultant'},{icon:'📄',text:'PDF Logbook & Certificates'},{icon:'🏆',text:'Global Leaderboard'},{icon:'🔬',text:'30+ Emergency Cases'}].map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<6?'1px solid rgba(255,255,255,0.08)':'none'}}>
              <span style={{fontSize:18}}>{f.icon}</span>
              <span style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.90)'}}>{f.text}</span>
              <div style={{marginLeft:'auto',width:18,height:18,borderRadius:'50%',background:'rgba(16,185,129,0.2)',border:'1px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#10B981',fontWeight:900}}>✓</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:16,padding:'14px 12px',textAlign:'center'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginBottom:4}}>Monthly</div>
            <div style={{fontSize:26,fontWeight:900,color:'white'}}>$14.99</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>/month</div>
          </div>
          <div style={{background:'rgba(13,148,136,0.20)',border:'1.5px solid #0D9488',borderRadius:16,padding:'14px 12px',textAlign:'center'}}>
            <div style={{fontSize:10,fontWeight:800,color:'#10B981',marginBottom:4}}>⭐ BEST VALUE</div>
            <div style={{fontSize:26,fontWeight:900,color:'white'}}>$99.99</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>/year · Save 44%</div>
          </div>
        </div>
        <button onClick={()=>{window.open('https://cliniverse-ai.lemonsqueezy.com/checkout/buy/54d78f45-acc7-48ca-a5df-17bfbc03df3d','_blank');setShowUpgrade(false)}} style={{width:'100%',padding:'17px',borderRadius:20,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#0D9488,#1E40AF)',color:'white',fontSize:16,fontWeight:800,boxShadow:'0 4px 20px rgba(13,148,136,0.40)',marginBottom:12}}>
          🚀 Start PRO — $8.33/mo
        </button>
        <button onClick={()=>setShowUpgrade(false)} style={{width:'100%',padding:'14px',borderRadius:16,cursor:'pointer',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600}}>
          Continue Free — 1 case/day
        </button>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',textAlign:'center',marginTop:12}}>Auto-renews · Cancel anytime in Settings</div>
      </div>
      <div style={{
        ...D.glass, padding:32, maxWidth:380, width:'100%',
        borderRadius:28, position:'relative', overflow:'hidden',
        border:'1px solid rgba(0,184,169,0.30)',
        boxShadow:'0 32px 80px rgba(0,184,169,0.20)',
      }}>
        <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,184,169,0.15),transparent 70%)',pointerEvents:'none'}}/>
        <button onClick={()=>setShowUpgrade(false)} style={{position:'absolute',top:16,right:16,background:'rgba(10,132,255,0.10)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:'50%',width:32,height:32,color:D.text,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        <div style={{fontSize:52,textAlign:'center',marginBottom:12}}>🔒</div>
        <h2 style={{fontSize:24,fontWeight:900,color:D.text,textAlign:'center',margin:'0 0 8px'}}>PRO Case</h2>
        <p style={{color:D.textSub,fontSize:14,textAlign:'center',lineHeight:1.7,margin:'0 0 24px'}}>Unlock all 30+ emergency cases with Cliniverse PRO</p>
        <div style={{...D.glass,borderRadius:16,padding:'14px 16px',marginBottom:20}}>
          {['30+ Emergency Cases','AI Clinical Consultant','PDF Certificates','500+ MCQ Bank','Global Leaderboard'].map(f=>(
            <div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:`1px solid ${D.border}`}}>
              <span style={{color:D.mint,fontSize:14}}>✓</span>
              <span style={{color:D.textSub,fontSize:13}}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>{window.open('https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly','_blank');setShowUpgrade(false)}}
          style={{width:'100%',padding:16,borderRadius:16,border:'none',background:`linear-gradient(135deg,${D.teal},${D.cobalt})`,color:'white',fontSize:16,fontWeight:800,cursor:'pointer',marginBottom:10,boxShadow:`0 8px 32px rgba(0,184,169,0.30)`}}>
          🚀 Upgrade to PRO — $14.99/mo
        </button>
        <button onClick={()=>setShowUpgrade(false)}
          style={{width:'100%',padding:14,borderRadius:16,border:`1px solid ${D.borderTeal}`,background:'transparent',color:D.teal,fontSize:14,fontWeight:600,cursor:'pointer'}}>
          Maybe later
        </button>
      </div>
    </div>
  )

  // ── CASE VIEW ─────────────────────────────────────────────────────────
  if (activeCase) {
    // STEMI gets special interactive component
  if (activeCase === 'stemi') return <div style={{minHeight:'100vh',background:'var(--bg-base,#F2F7FF)',fontFamily:'-apple-system,sans-serif',padding:'60px 20px 20px'}}><button onClick={()=>setActiveCase(null)} style={{background:'rgba(255,255,255,0.75)',backdropFilter:'blur(12px)',border:'1px solid rgba(10,132,255,0.12)',borderRadius:14,padding:'8px 18px',fontSize:13,fontWeight:600,color:'#0A1F3C',cursor:'pointer',marginBottom:16}}>← Back</button><STEMICase onXP={addXP}/></div>
  const allCases = [...criticalCases,...sportsCases,...pedsCases]
    const c = allCases.find(x=>x.id===activeCase)!
    if (!c) { setActiveCase(null); return null }

    const vitals = [
      {l:'BP',    v:c.vitals.bp,   u:'mmHg',  crit:parseInt(c.vitals.bp)<90},
      {l:'HR',    v:c.vitals.hr,   u:'bpm',   crit:parseInt(c.vitals.hr)>120||parseInt(c.vitals.hr)<50},
      {l:'SpO2',  v:c.vitals.o2,   u:'%',     crit:parseInt(c.vitals.o2)<94},
      {l:'Temp',  v:c.vitals.temp, u:'°C',    crit:parseFloat(c.vitals.temp)>38.5},
      {l:'RR',    v:c.vitals.rr,   u:'/min',  crit:parseInt(c.vitals.rr)>25},
      {l:'GCS',   v:c.vitals.gcs,  u:'/15',   crit:parseInt(c.vitals.gcs)<14},
    ]

    return (
      <div style={{minHeight:'100vh', background:'#F8FAFC', fontFamily:D.font, position:'relative'}}>
        <OceanBg/>

        {/* Hero header */}
        <div style={{
          background:`linear-gradient(160deg, ${c.color}18 0%, rgba(255,255,255,0.85) 100%)`,
          backdropFilter:'blur(30px)', WebkitBackdropFilter:'blur(30px)',
          padding:'56px 20px 24px',
          borderBottom:`1px solid ${c.color}20`,
          position:'relative', zIndex:1,
        }}>
          <button onClick={()=>setActiveCase(null)} style={{
            display:'flex', alignItems:'center', gap:6,
            background:D.glass.background, backdropFilter:'blur(12px)',
            border:D.glass.border, color:D.text,
            padding:'8px 18px', borderRadius:20, fontSize:13,
            cursor:'pointer', marginBottom:18, fontWeight:600,
            boxShadow:D.shadow,
          }}>← Back</button>
          <div style={{fontSize:48, marginBottom:8}}>{c.icon}</div>
          <h1 style={{fontSize:28, fontWeight:800, margin:'0 0 4px', color:D.text, letterSpacing:-0.5}}>{c.title}</h1>
          <p style={{color:D.textSub, fontSize:13, margin:0}}>{c.sub}</p>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6, marginTop:10,
            background:`${c.color}15`, border:`1px solid ${c.color}30`,
            borderRadius:12, padding:'4px 12px',
          }}>
            <span style={{fontSize:10, fontWeight:700, color:c.color}}>+{c.xpReward} XP</span>
          </div>
        </div>

        <div style={{padding:'16px 20px', maxWidth:640, margin:'0 auto', position:'relative', zIndex:1}}>

          {/* Vitals */}
          <Label color={D.textMuted}>⚡ Vital Signs</Label>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16}}>
            {vitals.map(v=>(
              <VitalBadge key={v.l} label={v.l} value={v.v} unit={v.u} critical={v.crit}/>
            ))}
          </div>

          {/* ECG */}
          <GCard accent={D.mint} style={{padding:16, marginBottom:12}}>
            <Label color={D.mint}>📈 ECG Findings</Label>
            <p style={{color:D.text, fontSize:13, lineHeight:1.75, margin:0}}>{c.ecg}</p>
          </GCard>

          {/* Presentation */}
          <GCard style={{padding:16, marginBottom:12}}>
            <Label>🩺 Clinical Presentation</Label>
            <p style={{color:D.text, fontSize:13, lineHeight:1.8, margin:0}}>{c.presentation}</p>
          </GCard>

          {/* Management */}
          <GCard style={{padding:16, marginBottom:16}}>
            <Label>📋 Management Protocol</Label>
            {c.management.map((m,i)=>(
              <div key={i} style={{display:'flex', gap:12, alignItems:'flex-start', marginBottom:10}}>
                <div style={{
                  width:26, height:26, borderRadius:'50%', flexShrink:0,
                  background:`${c.color}15`, border:`1.5px solid ${c.color}40`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:800, color:c.color,
                }}>{i+1}</div>
                <p style={{color:D.text, fontSize:13, lineHeight:1.65, margin:0}}>{m}</p>
              </div>
            ))}
          </GCard>

          {/* Complete button */}
          <button onClick={()=>completeCase(c.xpReward)} style={{
            width:'100%', padding:16, borderRadius:18, border:'none',
            background:`linear-gradient(135deg,${c.color},${c.color}bb)`,
            color:'white', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:10,
            boxShadow:`0 8px 28px ${c.color}35`,
          }}>✅ Complete Case +{c.xpReward} XP</button>

          {/* AI Consultant */}
          <button onClick={()=>{setShowAI(s=>!s);setAiHistory([]);setAiResponse('')}} style={{
            width:'100%', padding:14, borderRadius:18, border:`1px solid ${D.borderTeal}`,
            background:D.glass.background, backdropFilter:'blur(20px)',
            color:D.teal, fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:10,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            boxShadow:D.shadow,
          }}>
            <span>🤖</span> AI Clinical Consultant {showAI?'▲':'▼'}
          </button>

          {showAI && (
            <GCard accent={D.teal} style={{padding:18, marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${D.teal},${D.cobalt})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🤖</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:D.text}}>Claude AI Consultant</div>
                  <div style={{fontSize:11,color:D.textMuted}}>Ask anything about this case</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:10,padding:'3px 10px',borderRadius:10,background:`${D.mint}15`,color:D.mint,border:`1px solid ${D.mint}30`,fontWeight:700}}>● LIVE</div>
              </div>

              {aiHistory.length===0 && (
                <div style={{marginBottom:14}}>
                  <Label color={D.textMuted}>Suggested Questions</Label>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      `What is the first-line treatment for ${c.title}?`,
                      `What are the contraindications in this case?`,
                      `When should I consider ICU admission?`,
                    ].map(q=>(
                      <button key={q} onClick={()=>setAiQuestion(q)} style={{
                        background:D.glass.background, border:D.glass.border,
                        borderRadius:12, padding:'10px 14px',
                        color:D.textSub, fontSize:12, cursor:'pointer', textAlign:'left', fontWeight:500,
                      }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {aiHistory.map((item,i)=>(
                <div key={i} style={{marginBottom:12}}>
                  <div style={{background:`${D.teal}10`,border:`1px solid ${D.teal}25`,borderRadius:12,padding:'10px 14px',marginBottom:6}}>
                    <div style={{fontSize:10,color:D.teal,marginBottom:4,fontWeight:700}}>YOU</div>
                    <div style={{fontSize:13,color:D.text}}>{item.q}</div>
                  </div>
                  <div style={{background:`${D.cobalt}08`,border:`1px solid ${D.cobalt}20`,borderRadius:12,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:D.cobalt,marginBottom:4,fontWeight:700}}>🤖 CLAUDE AI</div>
                    <div style={{fontSize:13,color:D.text,lineHeight:1.7}}>{item.a}</div>
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div style={{background:`${D.cobalt}08`,border:`1px solid ${D.cobalt}15`,borderRadius:12,padding:14,marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${D.teal}30`,borderTop:`2px solid ${D.cobalt}`,animation:'spin 1s linear infinite',flexShrink:0}}/>
                  <div style={{fontSize:13,color:D.textMuted}}>Claude is thinking...</div>
                </div>
              )}

              <div style={{display:'flex',gap:8,marginTop:8}}>
                <input
                  value={aiQuestion}
                  onChange={e=>setAiQuestion(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&askAI(`${c.title}: ${c.presentation}`)}
                  placeholder="Ask a clinical question..."
                  style={{
                    flex:1, padding:'12px 16px', borderRadius:14,
                    border:D.glass.border,
                    background:'rgba(255,255,255,0.60)',
                    color:D.text, fontSize:13, outline:'none',
                  }}
                />
                <button
                  onClick={()=>askAI(`${c.title}: ${c.presentation}. Vitals: BP ${c.vitals.bp}, HR ${c.vitals.hr}, O2 ${c.vitals.o2}%`)}
                  disabled={aiLoading||!aiQuestion.trim()}
                  style={{
                    width:46, height:46, borderRadius:14, border:'none',
                    background:aiLoading||!aiQuestion.trim()?'rgba(10,132,255,0.15)':`linear-gradient(135deg,${D.teal},${D.cobalt})`,
                    color:'white', fontSize:18, cursor:aiLoading||!aiQuestion.trim()?'not-allowed':'pointer',
                    flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow: aiLoading||!aiQuestion.trim()?'none':D.shadow,
                  }}
                >→</button>
              </div>
            </GCard>
          )}
        </div>
      </div>
    )
  }

  // ── MAIN APP ──────────────────────────────────────────────────────────
  const rank = getCurrentRank()

  return (
    <>
    
    <div style={{
      minHeight:'100vh', width:'100vw',
      background:'#F8FAFC',
      fontFamily:D.font,
      display:'flex', flexDirection:'column', position:'relative',
    }}>
      <OceanBg/>

      {/* ── HEADER ── */}
      <header style={{display:'none'}}>
        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
          <div style={{
            width:30, height:30, borderRadius:9,
            background:`linear-gradient(135deg,${D.cobalt},${D.teal})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, boxShadow:`0 2px 8px ${D.cobalt}30`,
          }}>⚕️</div>
          <b style={{fontSize:17, color:'#E8F4FD', letterSpacing:-0.5}}>
            C<span style={{background:`linear-gradient(135deg,${D.cobalt},${D.teal})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</span>
          </b>
        </div>

        {/* Right — XP + avatar */}
        <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
          <div style={{
            fontSize:11, fontWeight:700, color:D.teal,
            background:`${D.teal}12`, border:`1px solid ${D.teal}25`,
            borderRadius:10, padding:'4px 10px',
          }}>{rank.icon} {xp} XP</div>
          <div onClick={()=>setTab('me')} style={{
            width:32, height:32, borderRadius:'50%',
            background:`linear-gradient(135deg,${D.teal},${D.cobalt})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontSize:14, cursor:'pointer', flexShrink:0,
            boxShadow:`0 2px 10px ${D.teal}30`,
          }}>👤</div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flex:1, padding:'0px 0px', paddingBottom:140,
        maxWidth:700, margin:'0 auto', width:'100%',
        boxSizing:'border-box', position:'relative', zIndex:1,
      }}>

        {/* HUB */}
        {(tab==='hub'||tab==='pulse') && (
          <PulseIndex userName={userName}
            xp={xp} streak={streak} casesCompleted={casesCompleted}
            mcqCorrect={mcqCorrect} isPro={isPro}
            setTab={setTab} setToolTab={setToolTab} onXP={addXP}
          />
        )}

        {/* TOOLS */}
        {tab==='tools' && <ToolsPage onXP={addXP}/>}
        {tab==='pulseroom' && <PulseRoom onXP={addXP} setTab={setTab}/>}

        {/* PROFILE */}
        {(tab==='profile'||tab==='me') && (
          userType === 'patient'
            ? <AfiaHome
                key={userType}
                savedType="patient"
                onSelect={(type) => {
                  if (type) {
                    setUserType(type);
                    localStorage.setItem('afia_user_type', type);
                  }
                }}
                onClose={() => { setUserType(null); localStorage.removeItem('afia_user_type'); setShowOnboarding(true); setTab('hub'); }}
              />
            : <LifeScreen
                xp={xp} streak={streak} casesCompleted={casesCompleted}
                mcqCorrect={mcqCorrect} isPro={isPro} name={userName}
                onUpgrade={()=>setShowUpgrade(true)}
                onReset={()=>{localStorage.removeItem('onboarding_completed');setShowOnboarding(true)}}
              />
        )}

        {/* LEADERBOARD */}
        {tab==='leaderboard' && <Leaderboard currentXP={xp} currentRank={rank.name}/>}

        {/* MCQ */}
        {tab==='mcq' && (
          <DynamicMCQ
            onXP={addXP} isPro={isPro}
            mcqCorrect={mcqCorrect} setMcqCorrect={setMcqCorrect}
            mcqTotal={mcqTotal} setMcqTotal={setMcqTotal}
          />
        )}

        {/* WORKSHOP */}
        {tab==='work' && <ClinicalWorkshop onXP={addXP}/>}

        {/* NET */}
        {tab==='net' && (
          <div style={{padding:'0 0 20px'}}>
            <div style={{
              display:'flex', gap:4,
              background:D.glass.background, backdropFilter:'blur(16px)',
              border:D.glass.border, borderRadius:16, padding:4, marginBottom:16,
            }}>
              {[{id:'feed',label:'📰 MedFeed'},{id:'social',label:'🌐 ClinicalNet'}].map(t=>(
                <button key={t.id} id={`net-${t.id}`}
                  onClick={()=>{
                    document.querySelectorAll('[data-net-tab]').forEach((el:any)=>el.style.display='none')
                    const el = document.getElementById(`net-tab-${t.id}`)
                    if(el) el.style.display='block'
                  }}
                  style={{
                    flex:1, padding:'9px', border:'none', cursor:'pointer', borderRadius:12,
                    fontFamily:D.font, fontWeight:700, fontSize:12,
                    background:t.id==='feed'?'rgba(255,255,255,0.60)':'transparent',
                    color:t.id==='feed'?D.teal:D.textMuted,
                  }}>{t.label}</button>
              ))}
            </div>
            <div id="net-tab-feed" data-net-tab="true"><MedFeed onXP={addXP}/></div>
            <div id="net-tab-social" data-net-tab="true" style={{display:'none'}}><ClinicalNet onXP={addXP}/></div>
          </div>
        )}

        {/* WARD */}
        {tab==='ward' && (
          <WardIndex onXP={addXP}/>
        )}
        {tab==='ward_old' && (
          <div>
            <div style={{
              display:'flex',gap:4,
              background:'rgba(255,255,255,0.90)',
              border:'1px solid #E2E8F0',
              borderRadius:16,padding:4,marginBottom:14,
              boxShadow:'0 1px 3px rgba(15,23,42,0.08)',
            }}>
              {[
                {id:'ward', label:'🏥 Ward'},
                {id:'feed', label:'📰 MedFeed'},
                {id:'net',  label:'🌐 ClinicalNet'},
              ].map(t=>(
                <button key={t.id}
                  onClick={()=>setToolTab(t.id)}
                  style={{
                    flex:1,padding:'9px',border:'none',cursor:'pointer',
                    borderRadius:12,fontWeight:700,fontSize:11,
                    fontFamily:'-apple-system,sans-serif',
                    background: toolTab===t.id
                      ? 'linear-gradient(135deg,#0D9488,#1E40AF)'
                      : 'transparent',
                    color: toolTab===t.id ? 'white' : '#94A3B8',
                    transition:'all 0.25s',
                  }}>{t.label}</button>
              ))}
            </div>
            {(toolTab==='ward'||!['feed','net'].includes(toolTab)) && <VirtualWard onXP={addXP}/>}
            {toolTab==='feed' && <MedFeed onXP={addXP}/>}
            {toolTab==='net'  && <ClinicalNet onXP={addXP}/>}
          </div>
        )}

        {/* BOARD */}
        {tab==='board' && <BoardExam onXP={addXP}/>}

        {/* SOCIAL */}
        {tab==='social' && <SocialHub onXP={addXP}/>}

        {/* LAB */}
        {tab==='lab' && (
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,color:D.teal,fontWeight:800,letterSpacing:2,marginBottom:4}}>CLINICAL LABORATORY</div>
              <h1 style={{fontSize:26,fontWeight:800,margin:'0 0 4px',color:D.text,letterSpacing:-0.5}}>Lab Reference</h1>
              <p style={{color:D.textSub,fontSize:13,margin:0}}>Critical values & clinical pearls</p>
            </div>
            {labs.map(l=>(
              <GCard key={l.name} accent={l.color} style={{padding:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{
                    width:42,height:42,borderRadius:13,flexShrink:0,
                    background:`${l.color}12`,border:`1px solid ${l.color}25`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                  }}>{l.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:D.text}}>{l.name}</div>
                    <div style={{fontSize:11,color:D.textMuted}}>{l.unit}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                  <div style={{background:'rgba(48,209,88,0.08)',borderRadius:12,padding:'10px 12px',border:'1px solid rgba(48,209,88,0.18)'}}>
                    <div style={{color:D.mint,fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>✓ NORMAL</div>
                    <div style={{color:'#14532d',fontSize:12,fontWeight:700}}>{l.normal}</div>
                  </div>
                  <div style={{background:'rgba(255,107,107,0.08)',borderRadius:12,padding:'10px 12px',border:'1px solid rgba(255,107,107,0.18)'}}>
                    <div style={{color:D.coral,fontSize:9,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>⚠ CRITICAL</div>
                    <div style={{color:'#7f1d1d',fontSize:12,fontWeight:700}}>{l.critical}</div>
                  </div>
                </div>
                <div style={{background:`${l.color}08`,borderRadius:10,padding:'9px 12px',border:`1px solid ${l.color}15`}}>
                  <div style={{color:D.text,fontSize:11,lineHeight:1.6}}>{l.detail}</div>
                </div>
              </GCard>
            ))}
          </div>
        )}

        {/* PRO PAGE */}
        {tab==='pro' && (
          <div>
            <GCard style={{padding:'32px 24px 28px',marginBottom:16,textAlign:'center',
              background:'linear-gradient(145deg,rgba(0,184,169,0.08),rgba(10,132,255,0.06))',
              border:`1px solid ${D.borderTeal}`,
            }}>
              <div style={{fontSize:64,marginBottom:12}}>⭐</div>
              <div style={{fontSize:11,letterSpacing:3,color:D.teal,fontWeight:700,textTransform:'uppercase',marginBottom:8}}>Cliniverse</div>
              <h2 style={{fontSize:32,fontWeight:900,color:D.text,margin:'0 0 8px',letterSpacing:-1}}>PRO Access</h2>
              <p style={{color:D.textSub,fontSize:14,lineHeight:1.7,margin:'0 0 28px',maxWidth:280,marginLeft:'auto',marginRight:'auto'}}>The full virtual hospital. Train like a consultant from day one.</p>
              <div style={{display:'flex',gap:10,marginBottom:20,justifyContent:'center'}}>
                {[{label:'Monthly',price:'$14.99',sub:'/month',highlight:true},{label:'Yearly',price:'$99',sub:'Save 34% 🎉',highlight:false}].map(p=>(
                  <div key={p.label} style={{
                    borderRadius:20, padding:'18px 20px', flex:1, maxWidth:160, cursor:'pointer',
                    background:p.highlight?`linear-gradient(135deg,${D.teal},${D.cobalt})`:'rgba(255,255,255,0.60)',
                    border:p.highlight?'none':D.glass.border,
                    boxShadow:p.highlight?D.shadowMd:D.shadow,
                    position:'relative',
                  }}>
                    {p.highlight && <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:D.mint,borderRadius:10,padding:'2px 10px',fontSize:10,fontWeight:800,color:'white',whiteSpace:'nowrap'}}>POPULAR</div>}
                    <div style={{fontSize:11,color:p.highlight?'rgba(255,255,255,0.8)':D.textSub,fontWeight:600,marginBottom:4}}>{p.label}</div>
                    <div style={{fontSize:28,fontWeight:900,color:p.highlight?'white':D.text,lineHeight:1}}>{p.price}</div>
                    <div style={{fontSize:11,color:p.highlight?'rgba(255,255,255,0.7)':D.mint,marginTop:2}}>{p.sub}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>window.open('https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly','_blank')} style={{
                background:`linear-gradient(135deg,${D.teal},${D.cobalt})`,border:'none',
                borderRadius:18,padding:'18px 40px',fontSize:17,fontWeight:800,color:'white',
                cursor:'pointer',width:'100%',boxShadow:D.shadowLg,
              }}>🚀 Upgrade to PRO</button>
              <p style={{fontSize:11,color:D.textMuted,marginTop:10}}>Cancel anytime · Secure payment via Lemon Squeezy</p>
            </GCard>

            <div style={{marginBottom:14}}>
              <Label>What's included</Label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {icon:'🏥',title:'30+ Cases',  sub:'ED, CCU, ICU, Neuro, Peds', color:D.coral},
                  {icon:'🤖',title:'AI Consult', sub:'Powered by Claude AI',       color:D.teal},
                  {icon:'📜',title:'Certs',      sub:'PDF per case',               color:D.amber},
                  {icon:'🧬',title:'MCQ Bank',   sub:'500+ questions',             color:D.mint},
                  {icon:'🎥',title:'Face-Swap',  sub:'Become the lead doctor',     color:D.violet},
                  {icon:'📊',title:'Leaderboard',sub:'Global rankings',            color:D.cobalt},
                ].map(f=>(
                  <GCard key={f.title} accent={f.color} style={{padding:'14px 12px',display:'flex',flexDirection:'column',gap:6,marginBottom:0}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`${f.color}12`,border:`1px solid ${f.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{f.icon}</div>
                    <div style={{fontSize:13,fontWeight:700,color:D.text}}>{f.title}</div>
                    <div style={{fontSize:11,color:D.textSub}}>{f.sub}</div>
                  </GCard>
                ))}
              </div>
            </div>
          </div>
        )}

      

        {tab==='oracle' && <ErrorBoundary section="Oracle"><ClinicalOracle onXP={addXP}/></ErrorBoundary>}

      

        {tab==='docs' && <DocAnalyzer/>}

      </main>

      {/* ── NAV ── */}
      {userType !== 'patient' && <FloatingNav active={tab} onChange={setTab}/>}
      <div style={{height:120}}/>
      <PWAInstall/>

      {/* Global animations */}
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        * { -webkit-tap-highlight-color: transparent }
        input::placeholder { color: rgba(10,31,60,0.35) }
      `}</style>
    </div>
    </>
  )
}
