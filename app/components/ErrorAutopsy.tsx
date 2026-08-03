'use client'
import { useState } from 'react'

type Phase = 'menu' | 'timeline' | 'analysis' | 'verdict'

interface ErrorEvent {
  id: string
  time: string
  actor: string
  action: string
  errorType?: string
  isError: boolean
  icon: string
}

interface AutopsyCase {
  id: string
  title: string
  subtitle: string
  color: string
  icon: string
  specialty: string
  severity: 'Sentinel' | 'Serious' | 'Near Miss'
  xpReward: number
  outcome: string
  timeline: ErrorEvent[]
  errors: { type: string; description: string; color: string }[]
  rootCause: string
  contributingFactors: string[]
  questions: { q: string; opts: string[]; correct: number; explain: string }[]
  prevention: string[]
  systemChange: string
}

const CASES: AutopsyCase[] = [
  {
    id: 'wrong_patient',
    title: 'The Wrong Patient',
    subtitle: 'Insulin given to wrong patient → cardiac arrest',
    color: '#ff453a',
    icon: '💉',
    specialty: 'Patient Safety',
    severity: 'Sentinel',
    xpReward: 160,
    outcome: 'Patient A received Patient B\'s insulin dose (20 units rapid-acting). Developed severe hypoglycaemia. Cardiac arrest. Successfully resuscitated but suffered hypoxic brain injury.',
    timeline: [
      { id:'1', time:'22:00', actor:'Nurse', action:'Night shift handover — 2 patients in adjacent beds, both diabetic', isError:false, icon:'🤝' },
      { id:'2', time:'22:30', actor:'Nurse', action:'Draws up insulin for "Bed 4" without checking wristband', isError:true, errorType:'Identification Failure', icon:'💉' },
      { id:'3', time:'22:32', actor:'Nurse', action:'Administers 20 units to Patient A (Bed 4) — correct bed, WRONG patient (patients swapped beds)', isError:true, errorType:'Wrong Patient', icon:'❌' },
      { id:'4', time:'23:15', actor:'Patient A', action:'Becomes confused, diaphoretic, unresponsive', isError:false, icon:'😰' },
      { id:'5', time:'23:20', actor:'Nurse', action:'Finds patient unresponsive — calls arrest team', isError:false, icon:'🚨' },
      { id:'6', time:'23:22', actor:'Doctor', action:'BG checked: 1.4 mmol/L — severe hypoglycaemia recognised', isError:false, icon:'🩸' },
      { id:'7', time:'23:23', actor:'Team', action:'Dextrose 50% IV — ROSC achieved after 4 min CPR', isError:false, icon:'✅' },
      { id:'8', time:'Next day', actor:'Review', action:'Root cause analysis reveals wristband not checked + patients changed beds without documentation', isError:true, errorType:'System Failure', icon:'📋' },
    ],
    errors: [
      { type: 'Identification Error', description: 'Wristband not checked before medication administration', color: '#ff453a' },
      { type: 'Communication Failure', description: 'Bed change not documented or communicated to nursing staff', color: '#ff9f0a' },
      { type: 'Environmental Factor', description: 'Adjacent beds with similar patients — high confusion risk', color: '#bf5af2' },
      { type: 'System Failure', description: 'No mandatory barcode scanning for insulin administration', color: '#00C4B4' },
    ],
    rootCause: 'Failure to verify patient identity using two identifiers (name + DOB/MRN) before medication administration, compounded by undocumented bed change.',
    contributingFactors: ['Night shift fatigue', 'High patient load', 'No barcode medication system', 'Beds changed without documentation', 'Verbal-only handover'],
    questions: [
      { q: 'How many patient identifiers should be checked before medication?', opts: ['One (bed number)', 'Two (name + DOB/MRN)', 'Three minimum', 'Verbal confirmation only'], correct: 1, explain: 'WHO standard: minimum TWO identifiers — full name AND date of birth or MRN. Bed number is NEVER an identifier.' },
      { q: 'What is the FIRST step when finding an unresponsive patient?', opts: ['Call the family', 'Check blood glucose immediately', 'Call for help + check airway + pulse', 'Document the incident'], correct: 2, explain: 'ABCDE approach — Airway, Breathing, Circulation first. Call for help simultaneously. BG check follows initial assessment.' },
      { q: 'Insulin errors are classified as?', opts: ['Low risk medications', 'High alert medications', 'Routine medications', 'PRN medications'], correct: 1, explain: 'Insulin is a HIGH ALERT medication (ISMP list) — requires double-check by two nurses before administration in many protocols.' },
      { q: 'Best system change to prevent this?', opts: ['More nurses on shift', 'Barcode medication scanning', 'Verbal read-back', 'More training sessions'], correct: 1, explain: 'Barcode Medication Administration (BCMA) links the RIGHT drug to the RIGHT patient electronically — reduces wrong-patient errors by 85%.' },
    ],
    prevention: [
      'Always check TWO patient identifiers — never rely on bed number',
      'Document ALL bed/room changes immediately in the system',
      'Implement Barcode Medication Administration (BCMA)',
      'Double-nurse check for all HIGH ALERT medications (insulin, heparin, KCl)',
      'Structured handover protocol — SBAR for every patient',
    ],
    systemChange: 'Implement BCMA system + mandatory double-check for all high-alert medications + bed change documentation protocol.'
  },
  {
    id: 'delayed_sepsis',
    title: 'The Missed Sepsis',
    subtitle: 'Delayed recognition → multi-organ failure',
    color: '#ff9f0a',
    icon: '🦠',
    specialty: 'Emergency Medicine',
    severity: 'Serious',
    xpReward: 140,
    outcome: '68-year-old male presented to ED with confusion and fever. Sepsis not recognised for 6 hours. Antibiotics delayed. Developed multi-organ failure requiring ICU admission for 3 weeks.',
    timeline: [
      { id:'1', time:'08:00', actor:'Triage Nurse', action:'Patient triaged as "Category 3 — confusion in elderly". Vitals: HR 108, BP 102/68, Temp 38.8', isError:true, errorType:'Under-triage', icon:'📋' },
      { id:'2', time:'08:15', actor:'ED', action:'Patient placed in waiting room — wait time 4 hours estimated', isError:true, errorType:'Delayed Assessment', icon:'⏰' },
      { id:'3', time:'10:30', actor:'Junior Doctor', action:'Sees patient — notes "UTI likely". Orders urine dipstick only. No lactate, no blood cultures', isError:true, errorType:'Incomplete Assessment', icon:'👨‍⚕️' },
      { id:'4', time:'11:00', actor:'Junior Doctor', action:'Prescribes oral trimethoprim and plans discharge', isError:true, errorType:'Wrong Treatment', icon:'💊' },
      { id:'5', time:'13:00', actor:'Nurse', action:'Patient found on floor — BP now 80/50. GCS 12. Called consultant', isError:false, icon:'🚨' },
      { id:'6', time:'13:15', actor:'Consultant', action:'Septic shock recognised. Sepsis 6 bundle initiated — 5 hours late', isError:false, icon:'✅' },
      { id:'7', time:'13:30', actor:'Team', action:'Blood cultures, lactate (6.2), IV antibiotics, fluids, ICU referral', isError:false, icon:'🏥' },
      { id:'8', time:'Day 2', actor:'ICU', action:'Multi-organ failure — vasopressors + ventilation required', isError:false, icon:'😰' },
    ],
    errors: [
      { type: 'Recognition Failure', description: 'Sepsis not identified at triage despite meeting 2+ SIRS criteria', color: '#ff453a' },
      { type: 'Assessment Error', description: 'Junior doctor did not order lactate or blood cultures', color: '#ff9f0a' },
      { type: 'Treatment Delay', description: 'IV antibiotics not started within 1 hour of sepsis recognition', color: '#bf5af2' },
      { type: 'Supervision Gap', description: 'Senior review not sought for deteriorating elderly patient', color: '#00C4B4' },
    ],
    rootCause: 'Failure to recognise sepsis at point of triage using validated screening tool (qSOFA/NEWS), leading to delayed treatment bundle activation.',
    contributingFactors: ['Busy ED with high patient volume', 'Junior doctor working unsupervised', 'No mandatory sepsis screening tool at triage', 'Atypical presentation in elderly (confusion without classic fever sensation)'],
    questions: [
      { q: 'qSOFA criteria for sepsis screening — which is NOT included?', opts: ['Altered mental status', 'Respiratory rate ≥ 22', 'SBP ≤ 100', 'Temperature > 38.5'], correct: 3, explain: 'qSOFA: GCS < 15 (AMS) + RR ≥ 22 + SBP ≤ 100. Temperature is NOT in qSOFA — sepsis can occur without fever, especially in elderly.' },
      { q: 'Antibiotic target in septic shock?', opts: ['Within 6 hours', 'Within 3 hours', 'Within 1 hour', 'After culture results'], correct: 2, explain: 'Surviving Sepsis 2021: antibiotics within 1 hour of septic shock recognition. Every hour delay increases mortality by 7%.' },
      { q: 'Lactate target in sepsis resuscitation?', opts: ['< 4 mmol/L', '< 2 mmol/L', '< 1 mmol/L', 'Not used in monitoring'], correct: 1, explain: 'Target lactate clearance to < 2 mmol/L. Lactate ≥ 4 = septic shock regardless of BP. Repeat every 2h to monitor clearance.' },
      { q: 'Sepsis 6 — which is NOT included?', opts: ['Blood cultures', 'IV antibiotics', 'IV steroids', 'IV fluids'], correct: 2, explain: 'Sepsis 6: O2, blood cultures, IV antibiotics, IV fluids, lactate, urine output monitoring. Steroids are NOT routine — only vasopressor-refractory shock.' },
    ],
    prevention: [
      'Mandatory sepsis screening (qSOFA/NEWS2) at triage for ALL patients',
      'Automatic senior review if qSOFA ≥ 2 or NEWS ≥ 5',
      'Sepsis pathway activation with 1-hour antibiotic target',
      'Lactate mandatory in all suspected sepsis presentations',
      'Never discharge confused elderly without senior review',
    ],
    systemChange: 'Implement electronic sepsis alert (auto-triggers when vitals meet criteria) + mandatory 1-hour antibiotic pathway + senior review protocol for all elderly confusion.'
  },
  {
    id: 'allergy_error',
    title: 'The Allergy Disaster',
    subtitle: 'Penicillin allergy ignored → anaphylaxis',
    color: '#bf5af2',
    icon: '⚠️',
    specialty: 'Pharmacovigilance',
    severity: 'Sentinel',
    xpReward: 150,
    outcome: '45-year-old female with documented penicillin allergy received amoxicillin. Developed severe anaphylaxis with cardiovascular collapse. Required ICU admission for 48h.',
    timeline: [
      { id:'1', time:'09:00', actor:'GP', action:'Patient seen for chest infection. Penicillin allergy clearly documented in electronic record (red alert)', isError:false, icon:'📋' },
      { id:'2', time:'09:10', actor:'GP', action:'Prescribes Amoxicillin 500mg TDS — allergy alert overridden without documentation of reason', isError:true, errorType:'Allergy Override', icon:'❌' },
      { id:'3', time:'09:30', actor:'Pharmacist', action:'Dispenses amoxicillin — allergy alert appears but dismissed as "patient-reported, not confirmed"', isError:true, errorType:'Alert Fatigue', icon:'💊' },
      { id:'4', time:'10:00', actor:'Patient', action:'Takes first dose of amoxicillin at home', isError:false, icon:'🏠' },
      { id:'5', time:'10:08', actor:'Patient', action:'Develops throat tightening, urticaria, dizziness', isError:false, icon:'😰' },
      { id:'6', time:'10:12', actor:'Ambulance', action:'Called — patient in anaphylactic shock. BP 60/30. GCS 10', isError:false, icon:'🚑' },
      { id:'7', time:'10:20', actor:'Paramedic', action:'Adrenaline 0.5mg IM given. IV access. Rapid transfer to ED', isError:false, icon:'✅' },
      { id:'8', time:'Debrief', action:'Investigation reveals allergy override not documented + pharmacist alert dismissed', actor:'Safety Team', isError:true, errorType:'System Failure', icon:'📊' },
    ],
    errors: [
      { type: 'Allergy Override', description: 'GP overrode documented allergy alert without clinical justification', color: '#ff453a' },
      { type: 'Alert Fatigue', description: 'Pharmacist dismissed allergy alert due to over-alerting normalisation', color: '#ff9f0a' },
      { type: 'Cross-Reactivity Ignorance', description: 'Amoxicillin is a penicillin — same class, not an alternative', color: '#bf5af2' },
      { type: 'Documentation Failure', description: 'No reason documented for allergy override', color: '#00C4B4' },
    ],
    rootCause: 'Alert fatigue due to excessive clinical decision support alerts causing dismissal of critical allergy warnings, combined with prescriber error in drug class recognition.',
    contributingFactors: ['High volume of clinical alerts causing fatigue', 'Incomplete allergy documentation (no severity recorded)', 'Time pressure in GP clinic', 'Pharmacist alert dismissed without patient consultation'],
    questions: [
      { q: 'Penicillin allergy — safe alternative for chest infection?', opts: ['Amoxicillin','Co-amoxiclav','Clarithromycin','Ampicillin'], correct: 2, explain: 'Clarithromycin (macrolide) is safe in penicillin allergy. Amoxicillin, Co-amoxiclav, Ampicillin are ALL penicillins — avoid in penicillin allergy.' },
      { q: 'First-line treatment for anaphylaxis?', opts: ['IV hydrocortisone','IV chlorphenamine','IM adrenaline 0.5mg','Oral antihistamine'], correct: 2, explain: 'IM Adrenaline 0.5mg (1:1000) into lateral thigh is FIRST LINE. Give immediately — do not delay for IV access.' },
      { q: 'Cross-reactivity between penicillins and cephalosporins?', opts: ['0%','1-2%','10-15%','50%'], correct: 1, explain: 'Cross-reactivity is 1-2% (lower than historically thought). Cephalosporins can be used cautiously if allergy was mild — but avoid if history of anaphylaxis.' },
      { q: 'Best strategy to reduce alert fatigue?', opts: ['Remove all alerts','Increase alert volume','Tiered alerts — critical vs advisory','Make all alerts mandatory'], correct: 2, explain: 'Tiered alert systems: CRITICAL alerts (anaphylaxis-risk) cannot be overridden without documentation; ADVISORY alerts can be dismissed easily — reduces fatigue while maintaining safety.' },
    ],
    prevention: [
      'Document allergy AND severity (anaphylaxis vs rash) — not just "penicillin allergy"',
      'CRITICAL allergy overrides require mandatory documented justification',
      'Implement tiered alert system — reduce low-priority alerts',
      'Pharmacist must contact prescriber before dispensing overridden allergy',
      'Patient education: always carry allergy information card',
    ],
    systemChange: 'Tiered alert system + mandatory documentation for ALL critical allergy overrides + pharmacist-prescriber callback protocol before dispensing.'
  },
]

const C = {
  card: 'var(--bg-card, rgba(255,255,255,0.72))',
  border: 'var(--border-card, rgba(10,132,255,0.12))',
  text: 'var(--text-primary, #0A1628)',
  sub: 'var(--text-secondary, rgba(10,22,40,0.55))',
  muted: 'var(--text-muted, rgba(10,22,40,0.40))',
}

const SEVERITY_COLOR: Record<string,string> = {
  Sentinel: '#ff453a', Serious: '#ff9f0a', 'Near Miss': '#30d158'
}

export default function ErrorAutopsy({ onXP }: { onXP?: (n:number)=>void }) {
  const [phase, setPhase] = useState<Phase>('menu')
  const [activeCase, setActiveCase] = useState<AutopsyCase|null>(null)
  const [expandedEvent, setExpandedEvent] = useState<string|null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [ans, setAns] = useState<number|null>(null)
  const [score, setScore] = useState(0)
  const [activeTab, setActiveTab] = useState<'timeline'|'errors'|'factors'>('timeline')

  const startCase = (c: AutopsyCase) => {
    setActiveCase(c); setPhase('timeline'); setExpandedEvent(null)
    setQIdx(0); setAns(null); setScore(0); setActiveTab('timeline')
  }

  // ── MENU ──
  if (phase === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(0,196,180,0.08))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(255,69,58,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(255,69,58,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>💀 NEW MODE</div>
        <div style={{fontSize:24,fontWeight:900,color:'#0A1628',letterSpacing:-0.5,marginBottom:6}}>Error Autopsy</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.7}}>Analyse real medical errors. Find what went wrong. Learn without blame. Prevent future harm.</div>
        <div style={{display:'flex',gap:8,marginTop:12}}>
          {['🔍 Analyse','⚠️ No Blame','🛡️ Prevent'].map(t=>(
            <div key={t} style={{flex:1,background:'rgba(255,255,255,0.88)',borderRadius:12,padding:'10px',border:'1px solid rgba(255,255,255,0.18)',textAlign:'center',fontSize:11,color:C.sub,fontWeight:600}}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Medical Error Cases</div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>startCase(c)}
          style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${c.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${c.color}08`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${c.color}10`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:52,height:52,borderRadius:16,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:'#0A1628',marginBottom:2}}>{c.title}</div>
              <div style={{fontSize:11,color:C.sub}}>{c.subtitle}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${SEVERITY_COLOR[c.severity]}20`,color:SEVERITY_COLOR[c.severity],fontWeight:800,border:`1px solid ${SEVERITY_COLOR[c.severity]}30`}}>⚠️ {c.severity}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700}}>{c.specialty}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.12)',color:'#ffd60a',fontWeight:700}}>+{c.xpReward} XP</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (!activeCase) return null
  const c = activeCase

  // ── TIMELINE + ANALYSIS ──
  if (phase === 'timeline') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setPhase('menu')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:'#0A1628'}}>{c.icon} {c.title}</div>
          <div style={{fontSize:11,color:C.sub}}>{c.specialty}</div>
        </div>
        <span style={{fontSize:10,padding:'4px 10px',borderRadius:10,background:`${SEVERITY_COLOR[c.severity]}20`,color:SEVERITY_COLOR[c.severity],fontWeight:800,border:`1px solid ${SEVERITY_COLOR[c.severity]}30`}}>{c.severity}</span>
      </div>

      {/* Outcome */}
      <div style={{background:'rgba(255,69,58,0.08)',borderRadius:18,padding:'14px 16px',marginBottom:14,border:'1px solid rgba(255,69,58,0.2)'}}>
        <div style={{fontSize:10,color:'#ff453a',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>📋 WHAT HAPPENED</div>
        <div style={{fontSize:13,color:'#0A1628',lineHeight:1.75}}>{c.outcome}</div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:14,background:C.card,borderRadius:16,padding:5,border:`1px solid ${C.border}`}}>
        {[{id:'timeline',label:'⏱ Timeline'},{id:'errors',label:'❌ Errors'},{id:'factors',label:'🔍 Root Cause'}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id as any)}
            style={{flex:1,padding:'9px 6px',borderRadius:11,border:activeTab===t.id?`1px solid ${c.color}40`:'none',background:activeTab===t.id?`${c.color}15`:'transparent',color:activeTab===t.id?c.color:C.sub,fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TIMELINE TAB */}
      {activeTab==='timeline'&&(
        <div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:12}}>Tap events to explore</div>
          <div style={{position:'relative'}}>
            <div style={{position:'absolute',left:20,top:0,bottom:0,width:2,background:'linear-gradient(180deg,rgba(255,69,58,0.4),rgba(139,92,246,0.3))',borderRadius:1}}/>
            {c.timeline.map((ev,i)=>(
              <div key={ev.id} onClick={()=>setExpandedEvent(expandedEvent===ev.id?null:ev.id)}
                style={{display:'flex',gap:14,marginBottom:12,cursor:'pointer',position:'relative'}}>
                <div style={{width:40,height:40,borderRadius:12,background:ev.isError?`rgba(255,69,58,0.2)`:C.card,border:`2px solid ${ev.isError?'rgba(255,69,58,0.5)':C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,zIndex:1,boxShadow:ev.isError?'0 4px 16px rgba(255,69,58,0.3)':'none'}}>
                  {ev.isError?'❌':ev.icon}
                </div>
                <div style={{flex:1,background:expandedEvent===ev.id?`${c.color}08`:C.card,borderRadius:14,padding:'10px 14px',border:expandedEvent===ev.id?`1px solid ${c.color}30`:ev.isError?'1px solid rgba(255,69,58,0.2)':`1px solid ${C.border}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:10,color:C.muted,fontWeight:700}}>{ev.time}</span>
                    <span style={{fontSize:10,color:ev.isError?'#ff453a':C.muted,fontWeight:700}}>{ev.actor}</span>
                  </div>
                  <div style={{fontSize:12,color:ev.isError?'rgba(255,150,150,0.9)':'rgba(255,255,255,0.75)',lineHeight:1.5,fontWeight:ev.isError?700:400}}>{ev.action}</div>
                  {ev.isError&&ev.errorType&&(
                    <div style={{marginTop:6,display:'inline-block',fontSize:9,padding:'2px 8px',borderRadius:6,background:'rgba(255,69,58,0.2)',color:'#ff453a',fontWeight:800,border:'1px solid rgba(255,69,58,0.3)'}}>{ev.errorType}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ERRORS TAB */}
      {activeTab==='errors'&&(
        <div>
          {c.errors.map((e,i)=>(
            <div key={i} style={{background:C.card,borderRadius:16,padding:'14px 16px',marginBottom:10,border:`1px solid ${e.color}25`,boxShadow:`0 4px 16px ${e.color}08`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:e.color,boxShadow:`0 0 10px ${e.color}`,flexShrink:0}}/>
                <div style={{fontSize:13,fontWeight:800,color:e.color}}>{e.type}</div>
              </div>
              <div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.6}}>{e.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* ROOT CAUSE TAB */}
      {activeTab==='factors'&&(
        <div>
          <div style={{background:`${c.color}10`,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${c.color}25`}}>
            <div style={{fontSize:10,color:c.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>🎯 ROOT CAUSE</div>
            <div style={{fontSize:13,color:'#0A1628',lineHeight:1.75,fontWeight:600}}>{c.rootCause}</div>
          </div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Contributing Factors</div>
          {c.contributingFactors.map((f,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8,background:C.card,borderRadius:12,padding:'10px 14px',border:`1px solid ${C.border}`}}>
              <div style={{width:22,height:22,borderRadius:7,background:'rgba(255,159,10,0.2)',border:'1px solid rgba(255,159,10,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:'#ff9f0a',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.5}}>{f}</div>
            </div>
          ))}
          <div style={{background:'rgba(10,132,255,0.08)',borderRadius:16,padding:'14px',marginTop:12,border:'1px solid rgba(0,196,180,0.20)'}}>
            <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>🔧 SYSTEM CHANGE</div>
            <div style={{fontSize:13,color:'#0A1628',lineHeight:1.7}}>{c.systemChange}</div>
          </div>
        </div>
      )}

      <button onClick={()=>setPhase('analysis')}
        style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${c.color},${c.color}bb)`,color:'var(--text-primary, #0A1628)',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${c.color}44`,marginTop:16}}>
        🧠 Test Your Knowledge →
      </button>
    </div>
  )

  // ── QUIZ ──
  if (phase === 'analysis') {
    if (qIdx >= c.questions.length) {
      const pct = Math.round((score/c.questions.length)*100)
      const xpEarned = Math.round((score/c.questions.length)*c.xpReward)
      return (
        <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
          <div style={{background:'linear-gradient(145deg,rgba(48,209,88,0.1),rgba(10,132,255,0.08))',borderRadius:24,padding:'28px 20px',marginBottom:16,border:'1px solid rgba(48,209,88,0.2)',textAlign:'center'}}>
            <div style={{fontSize:60,marginBottom:12}}>{pct>=80?'🛡️':pct>=60?'📚':'🔄'}</div>
            <div style={{fontSize:26,fontWeight:900,color:'#0A1628',marginBottom:4}}>{pct}%</div>
            <div style={{fontSize:14,color:pct>=80?'#30d158':'#ff9f0a',fontWeight:700,marginBottom:4}}>{pct>=80?'Patient Safety Champion!':pct>=60?'Good — keep learning':'Review the case again'}</div>
            <div style={{fontSize:13,color:C.sub}}>+{xpEarned} XP earned</div>
          </div>

          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Prevention Checklist</div>
          {c.prevention.map((p,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8,background:C.card,borderRadius:12,padding:'12px 14px',border:`1px solid ${C.border}`}}>
              <span style={{color:'#30d158',flexShrink:0,fontSize:14}}>✓</span>
              <span style={{fontSize:12,color:'#0A1628',lineHeight:1.6}}>{p}</span>
            </div>
          ))}

          <div style={{display:'flex',gap:10,marginTop:16}}>
            <button onClick={()=>startCase(c)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${c.color}30`,background:`${c.color}10`,color:c.color,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
            <button onClick={()=>{onXP&&onXP(xpEarned);setPhase('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ff453a,#bf5af2)',color:'var(--text-primary, #0A1628)',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(255,69,58,0.4)'}}>+{xpEarned} XP ✓</button>
          </div>
        </div>
      )
    }

    const q = c.questions[qIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setPhase('timeline')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Case</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:'#0A1628'}}>🧠 Knowledge Check</div>
            <div style={{fontSize:11,color:C.sub}}>Q{qIdx+1}/{c.questions.length} · Score: {score}</div>
          </div>
        </div>

        <div style={{height:4,background:'rgba(255,255,255,0.88)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
          <div style={{height:'100%',width:`${(qIdx/c.questions.length)*100}%`,background:`linear-gradient(90deg,${c.color},${c.color}bb)`,borderRadius:2,transition:'width 0.4s',boxShadow:`0 0 8px ${c.color}88`}}/>
        </div>

        <div style={{background:C.card,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:15,fontWeight:700,color:'#0A1628',lineHeight:1.7}}>{q.q}</div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {q.opts.map((opt,i)=>{
            let bg=C.card,border=`1px solid ${C.border}`,color=C.text
            if(ans!==null){
              if(i===q.correct){bg='rgba(48,209,88,0.12)';border='2px solid rgba(48,209,88,0.4)';color='#86efac'}
              else if(i===ans){bg='rgba(255,69,58,0.12)';border='1px solid rgba(255,69,58,0.3)';color='#fca5a5'}
            }
            return (
              <div key={i} onClick={()=>{if(ans!==null)return;setAns(i);if(i===q.correct)setScore(s=>s+1)}}
                style={{background:bg,borderRadius:14,padding:'14px 16px',border,cursor:ans===null?'pointer':'default',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.88)',border:'1px solid rgba(0,196,180,0.20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'rgba(10,22,40,0.70)',flexShrink:0}}>{['A','B','C','D'][i]}</div>
                <div style={{fontSize:13,color,fontWeight:500,flex:1,lineHeight:1.4}}>{opt}</div>
                {ans!==null&&i===q.correct&&<span>✅</span>}
                {ans!==null&&i===ans&&i!==q.correct&&<span>❌</span>}
              </div>
            )
          })}
        </div>

        {ans!==null&&(
          <div>
            <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:'14px',marginBottom:12,border:'1px solid rgba(0,196,180,0.20)'}}>
              <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>💡 EXPLANATION</div>
              <div style={{fontSize:13,color:'#0A1628',lineHeight:1.7}}>{q.explain}</div>
            </div>
            <button onClick={()=>{setQIdx(i=>i+1);setAns(null)}}
              style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${c.color},${c.color}bb)`,color:'var(--text-primary, #0A1628)',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 20px ${c.color}44`}}>
              {qIdx<c.questions.length-1?'Next →':'See Results 🏆'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
