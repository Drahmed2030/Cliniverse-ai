'use client'
import { useState, useEffect, useCallback } from 'react'

type GamePhase = 'menu' | 'briefing' | 'shift' | 'gameover' | 'complete'

interface ShiftCase {
  id: string
  time: string
  dept: string
  title: string
  patient: string
  urgency: 'Stat' | 'Urgent' | 'Routine'
  color: string
  icon: string
  presentation: string
  actions: ShiftAction[]
  timeLimit: number
  xp: number
}

interface ShiftAction {
  id: string
  label: string
  correct: boolean
  feedback: string
  consequence: string
  energyCost: number
}

interface ShiftScenario {
  id: string
  title: string
  subtitle: string
  color: string
  icon: string
  duration: string
  difficulty: 'Intern' | 'Resident' | 'Senior'
  totalXP: number
  cases: ShiftCase[]
  tips: string[]
}

const SCENARIOS: ShiftScenario[] = [
  {
    id: 'night_general',
    title: 'General Night Shift',
    subtitle: '8 hours on-call — General Medicine Ward',
    color: '#00C4B4',
    icon: '🌙',
    duration: '22:00 → 06:00',
    difficulty: 'Intern',
    totalXP: 400,
    tips: ['Check all sick patients first', 'Never miss a deteriorating patient', 'Escalate early — ask for help'],
    cases: [
      {
        id: 'n1', time: '22:30', dept: 'Ward 3', title: 'Hypoglycaemia',
        patient: '62F — DM Type 2, on insulin', urgency: 'Urgent', color: '#30d158', icon: '🩸',
        presentation: 'Nurse calls — patient confused, sweating. BG 2.1 mmol/L. Last insulin 3h ago.',
        timeLimit: 30, xp: 60,
        actions: [
          { id:'a1', label:'Dextrose 50% IV 50ml stat', correct:true, feedback:'✅ Correct! BG will rise rapidly. Recheck in 15 min.', consequence:'Patient recovers. BG normalises.', energyCost:5 },
          { id:'a2', label:'Oral juice if patient can swallow', correct:true, feedback:'✅ Acceptable if conscious and cooperative. Faster IV preferred.', consequence:'Patient improves slowly.', energyCost:5 },
          { id:'a3', label:'Wait and recheck BG in 1 hour', correct:false, feedback:'❌ Never wait with BG < 3! Can deteriorate to seizure.', consequence:'Patient seizes. Emergency team called.', energyCost:20 },
          { id:'a4', label:'Glucagon IM 1mg', correct:true, feedback:'✅ Good if no IV access. Works in 10-15 min.', consequence:'BG rises. Patient stabilises.', energyCost:8 },
        ]
      },
      {
        id: 'n2', time: '00:15', dept: 'Ward 5', title: 'Sudden Chest Pain',
        patient: '71M — post-op day 2 CABG', urgency: 'Stat', color: '#ff453a', icon: '🫀',
        presentation: 'Crushing chest pain 8/10. Diaphoretic. BP 88/58. HR 44. Bradycardic.',
        timeLimit: 25, xp: 100,
        actions: [
          { id:'a1', label:'ECG immediately + call senior STAT', correct:true, feedback:'✅ ECG first — could be inferior STEMI with RV involvement.', consequence:'ECG shows inferior STEMI. Cath lab activated in time.', energyCost:10 },
          { id:'a2', label:'Atropine 1mg IV for bradycardia', correct:false, feedback:'❌ Do NOT give atropine if inferior STEMI + RV involvement — can worsen.', consequence:'BP drops further. Vasopressors needed.', energyCost:25 },
          { id:'a3', label:'GTN spray for chest pain', correct:false, feedback:'❌ GTN contraindicated — SBP < 90 + possible RV infarct.', consequence:'Patient collapses. Emergency resuscitation.', energyCost:30 },
          { id:'a4', label:'IV fluids + oxygen + senior review', correct:true, feedback:'✅ IVF for preload in RV infarct. O2 for chest pain. Correct.', consequence:'Patient stabilises while awaiting senior.', energyCost:8 },
        ]
      },
      {
        id: 'n3', time: '02:00', dept: 'Ward 2', title: 'Acute Confusion',
        patient: '84F — dementia, UTI history', urgency: 'Urgent', color: '#ff9f0a', icon: '🧠',
        presentation: 'Agitated, shouting, pulled out IV line. Family distressed. Temp 38.2. O2 94%.',
        timeLimit: 35, xp: 70,
        actions: [
          { id:'a1', label:'Sepsis screen + urine culture + IV antibiotics', correct:true, feedback:'✅ Delirium in elderly = rule out infection first. Sepsis until proven otherwise.', consequence:'Sepsis identified early. Good outcome.', energyCost:8 },
          { id:'a2', label:'Haloperidol 5mg IV for agitation', correct:false, feedback:'❌ High dose haloperidol in elderly — risk of QT prolongation + falls. Use low dose only if needed.', consequence:'Patient over-sedated. Falls risk.', energyCost:20 },
          { id:'a3', label:'Reorient, dim lights, family support + low-dose haloperidol 0.5mg if needed', correct:true, feedback:'✅ Non-pharmacological first. Low-dose antipsychotic only if risk to self.', consequence:'Patient calms. Family reassured.', energyCost:5 },
          { id:'a4', label:'Restrain patient for safety', correct:false, feedback:'❌ Physical restraint worsens delirium and causes harm. Avoid.', consequence:'Delirium worsens. Family complains.', energyCost:15 },
        ]
      },
      {
        id: 'n4', time: '03:45', dept: 'ED', title: 'Referral — Chest Pain',
        patient: '55M — ED requesting admission', urgency: 'Routine', color: '#00C4B4', icon: '📞',
        presentation: 'ED calls. 55M, chest pain, troponin pending. ECG normal. Vitals stable. Want admission for observation.',
        timeLimit: 20, xp: 50,
        actions: [
          { id:'a1', label:'Accept for observation — request ECG + repeat troponin 3h', correct:true, feedback:'✅ Correct. NSTEMI protocol — serial troponins required.', consequence:'Patient admitted safely. Troponin rises at 3h — NSTEMI confirmed.', energyCost:5 },
          { id:'a2', label:'Refuse admission — not enough beds', correct:false, feedback:'❌ Never refuse based on beds alone. Clinical need first — escalate bed issue.', consequence:'Patient sent home. Cardiac event at home.', energyCost:25 },
          { id:'a3', label:'Request detailed history before accepting', correct:true, feedback:'✅ SBAR handover essential before accepting any referral.', consequence:'Good handover. Patient managed appropriately.', energyCost:3 },
          { id:'a4', label:'Discharge from ED — troponin likely negative', correct:false, feedback:'❌ Cannot predict troponin without serial measurements. Dangerous assumption.', consequence:'Adverse event. Complaint filed.', energyCost:30 },
        ]
      },
      {
        id: 'n5', time: '05:30', dept: 'Ward 4', title: 'Pre-Dawn Deterioration',
        patient: '67M — pneumonia, day 3', urgency: 'Stat', color: '#ff453a', icon: '🫁',
        presentation: 'Nurse calls — SpO2 dropped to 82%. RR 34. Using accessory muscles. Drowsy. BP 104/68.',
        timeLimit: 20, xp: 100,
        actions: [
          { id:'a1', label:'High-flow O2 + senior/ICU call immediately', correct:true, feedback:'✅ Type 1 respiratory failure — high-flow O2 + urgent ICU review.', consequence:'ICU accepts. Patient intubated electively. Good outcome.', energyCost:10 },
          { id:'a2', label:'1mg/kg furosemide IV for fluid overload', correct:false, feedback:'❌ No signs of fluid overload. BP already low. Diuresis will worsen.', consequence:'Patient deteriorates. BP crashes.', energyCost:25 },
          { id:'a3', label:'ABG + increase O2 + prepare for NIV', correct:true, feedback:'✅ ABG guides management. NIV buys time in type 2 failure.', consequence:'ABG: type 2 failure. NIV started. Improves.', energyCost:8 },
          { id:'a4', label:'Reposition + reassess in 30 min', correct:false, feedback:'❌ SpO2 82% is a medical emergency. Do NOT wait 30 minutes.', consequence:'Respiratory arrest. CPR required.', energyCost:30 },
        ]
      },
    ]
  },
  {
    id: 'night_emergency',
    title: 'ED Night Shift',
    subtitle: '12 hours in Emergency — high pressure',
    color: '#ff453a',
    icon: '🚨',
    duration: '20:00 → 08:00',
    difficulty: 'Resident',
    totalXP: 600,
    tips: ['Triage first — sickest patient first', 'ABCDE for every deteriorating patient', 'Communicate with family early'],
    cases: [
      {
        id: 'e1', time: '20:30', dept: 'ED Resus', title: 'Trauma Arrest',
        patient: '22M — RTA, unrestrained driver', urgency: 'Stat', color: '#ff453a', icon: '🚗',
        presentation: 'Paramedics arrive with CPR in progress. GCS 3. Bilateral chest injuries. Penetrating abdominal trauma.',
        timeLimit: 20, xp: 120,
        actions: [
          { id:'a1', label:'Continue CPR + trauma team activation + O negative blood', correct:true, feedback:'✅ Haemorrhagic arrest — O negative blood immediately. Do not wait crossmatch.', consequence:'Trauma team arrives. Patient revived after REBOA.', energyCost:10 },
          { id:'a2', label:'Stop CPR — injuries incompatible with life', correct:false, feedback:'❌ Traumatic arrest in young patient — not your decision alone. Activate team first.', consequence:'Family devastated. Complaint. Review needed.', energyCost:20 },
          { id:'a3', label:'CT scan before intervention', correct:false, feedback:'❌ Haemodynamically unstable → straight to theatre. CT delays = death.', consequence:'Patient exsanguinates in scanner.', energyCost:30 },
          { id:'a4', label:'Bilateral chest decompression + massive transfusion protocol', correct:true, feedback:'✅ Tension PTX + haemorrhage = bilateral decompression + MTP activation.', consequence:'Tension PTX relieved. BP recovers. Theatre in time.', energyCost:10 },
        ]
      },
      {
        id: 'e2', time: '23:00', dept: 'ED Majors', title: 'Stroke Alert',
        patient: '58F — sudden right hemiplegia', urgency: 'Stat', color: '#00C4B4', icon: '🧠',
        presentation: 'NIHSS 12. Last seen well 2 hours ago. Daughter reports no prior stroke. BP 188/104.',
        timeLimit: 25, xp: 100,
        actions: [
          { id:'a1', label:'CT head + stroke team activation NOW', correct:true, feedback:'✅ Time is brain. CT within 15 min. Stroke team simultaneous.', consequence:'CT: no haemorrhage. tPA given at 2h15m. Excellent recovery.', energyCost:8 },
          { id:'a2', label:'Lower BP immediately to 140/90', correct:false, feedback:'❌ Do NOT aggressively lower BP in acute ischaemic stroke — cerebral autoregulation needs higher BP.', consequence:'Stroke extends. Outcome worsens.', energyCost:25 },
          { id:'a3', label:'MRI brain for better characterisation', correct:false, feedback:'❌ MRI takes too long in hyperacute stroke. CT + CTA is standard.', consequence:'tPA window missed. Patient left with deficit.', energyCost:20 },
          { id:'a4', label:'Aspirin 300mg immediately', correct:false, feedback:'❌ No aspirin before tPA decision — if tPA given, aspirin 24h later only.', consequence:'Haemorrhagic transformation after tPA.', energyCost:15 },
        ]
      },
      {
        id: 'e3', time: '02:00', dept: 'ED Minors', title: 'Paeds Fever',
        patient: '9-month-old — high fever, irritable', urgency: 'Urgent', color: '#30d158', icon: '🧸',
        presentation: 'Temp 40.1°C. Inconsolable crying. Bulging anterior fontanelle. No rash. Refusing feeds. Parents very anxious.',
        timeLimit: 30, xp: 90,
        actions: [
          { id:'a1', label:'IV access + Ceftriaxone 100mg/kg NOW + LP after', correct:true, feedback:'✅ Suspected meningitis — antibiotics before LP. Never delay.', consequence:'Meningitis confirmed on CSF. Early treatment = full recovery.', energyCost:10 },
          { id:'a2', label:'LP first then antibiotics', correct:false, feedback:'❌ Do NOT delay antibiotics for LP in suspected meningitis. Ever.', consequence:'Patient deteriorates before LP completed.', energyCost:30 },
          { id:'a3', label:'Reassure parents — viral illness likely', correct:false, feedback:'❌ Bulging fontanelle = meningitis until proven otherwise. Never reassure without investigation.', consequence:'Child discharged. Readmits in septic shock.', energyCost:30 },
          { id:'a4', label:'Blood cultures + Ceftriaxone + Dexamethasone 0.15mg/kg', correct:true, feedback:'✅ Blood cultures before abx if possible. Dexamethasone reduces complications.', consequence:'Excellent outcome. Family grateful.', energyCost:8 },
        ]
      },
      {
        id: 'e4', time: '04:30', dept: 'ED Resus', title: 'Anaphylaxis',
        patient: '28F — collapse after eating shellfish', urgency: 'Stat', color: '#ff9f0a', icon: '⚠️',
        presentation: 'BP 60/40. HR 140. Angioedema. Stridor. SpO2 91%. Wheeze bilaterally.',
        timeLimit: 15, xp: 80,
        actions: [
          { id:'a1', label:'IM Adrenaline 0.5mg lateral thigh immediately', correct:true, feedback:'✅ IM adrenaline is FIRST LINE — do not delay for IV access.', consequence:'BP rises within 5 min. Stridor resolves. Full recovery.', energyCost:5 },
          { id:'a2', label:'IV chlorphenamine + hydrocortisone first', correct:false, feedback:'❌ Antihistamines and steroids are adjuncts — adrenaline FIRST. These alone will not stop anaphylaxis.', consequence:'Airway compromises. Emergency intubation.', energyCost:25 },
          { id:'a3', label:'Salbutamol nebuliser for wheeze', correct:false, feedback:'❌ Salbutamol is adjunct only. Adrenaline addresses all components of anaphylaxis.', consequence:'Condition worsens. Delayed treatment.', energyCost:20 },
          { id:'a4', label:'Adrenaline IM + supine position + high-flow O2', correct:true, feedback:'✅ Perfect triad. Supine position maintains cardiac output. O2 essential.', consequence:'Rapid recovery. Discharged after 6h observation.', energyCost:5 },
        ]
      },
    ]
  },
  {
    id: 'night_icu',
    title: 'ICU Night Shift',
    subtitle: '10 hours intensive care — life or death',
    color: '#ff9f0a',
    icon: '🫁',
    duration: '21:00 → 07:00',
    difficulty: 'Senior',
    totalXP: 800,
    tips: ['Know your patients before night starts', 'Ventilator alarms = assess patient immediately', 'Call cardiothoracic early for surgical issues'],
    cases: [
      {
        id: 'i1', time: '21:30', dept: 'ICU Bed 3', title: 'Ventilator Alarm',
        patient: '55M — ARDS, day 5 on ventilator', urgency: 'Stat', color: '#ff453a', icon: '🫁',
        presentation: 'High pressure alarm. SpO2 dropped 98→82%. Asymmetric chest rise. Trachea deviated left.',
        timeLimit: 15, xp: 120,
        actions: [
          { id:'a1', label:'Disconnect ventilator + bag-mask + needle decompression right side', correct:true, feedback:'✅ Tension pneumothorax — DOPE mnemonic. Disconnect, then decompress.', consequence:'Tension PTX relieved. SpO2 recovers immediately.', energyCost:8 },
          { id:'a2', label:'Increase FiO2 to 100% + suction ETT', correct:false, feedback:'❌ Tension PTX will not respond to O2 increase. Life-threatening — decompress NOW.', consequence:'Cardiac arrest from tension PTX.', energyCost:30 },
          { id:'a3', label:'Chest X-ray first to confirm', correct:false, feedback:'❌ Clinical diagnosis of tension PTX = treat immediately. CXR delays = death.', consequence:'Patient arrests before CXR completed.', energyCost:30 },
          { id:'a4', label:'DOPE mnemonic + needle decompression if clinical PTX', correct:true, feedback:'✅ DOPE: Displacement, Obstruction, Pneumothorax, Equipment. Systematic approach.', consequence:'Cause identified. Treated in 2 min. Excellent outcome.', energyCost:5 },
        ]
      },
      {
        id: 'i2', time: '00:00', dept: 'ICU Bed 7', title: 'Septic Shock Refractory',
        patient: '78F — abdominal sepsis post-colostomy', urgency: 'Stat', color: '#ff9f0a', icon: '🦠',
        presentation: 'MAP 48 despite Noradrenaline 0.4 mcg/kg/min. Lactate 7.2. Anuric. Cortisol pending.',
        timeLimit: 25, xp: 150,
        actions: [
          { id:'a1', label:'Add Vasopressin 0.03 units/min + Hydrocortisone 200mg/day', correct:true, feedback:'✅ Vasopressor-refractory shock: add vasopressin + steroid. Surviving Sepsis 2021.', consequence:'MAP improves to 68. Urine output returns.', energyCost:10 },
          { id:'a2', label:'Increase noradrenaline to maximum', correct:false, feedback:'❌ Very high doses of single vasopressor increase ischaemia risk. Add second agent instead.', consequence:'Digital ischaemia. Mesenteric ischaemia.', energyCost:20 },
          { id:'a3', label:'IV fluid bolus 500ml normal saline', correct:false, feedback:'❌ Fluid-refractory shock — more fluids worsen outcome. VASOPRESSORS, not fluid.', consequence:'Pulmonary oedema. Hypoxia worsens.', energyCost:20 },
          { id:'a4', label:'CRRT for acute kidney injury + source control review', correct:true, feedback:'✅ Anuric AKI + sepsis = CRRT. Review surgical source control if abdomen not controlled.', consequence:'CRRT started. Surgical team reviews.', energyCost:10 },
        ]
      },
      {
        id: 'i3', time: '03:00', dept: 'ICU Bed 1', title: 'Brain Death Protocol',
        patient: '24M — severe TBI after RTA', urgency: 'Routine', color: '#00C4B4', icon: '🧠',
        presentation: 'GCS 3 for 72h. CT: massive diffuse injury. Family present. Consultant requests brain death testing.',
        timeLimit: 40, xp: 120,
        actions: [
          { id:'a1', label:'Confirm prerequisites before testing: normothermia, no sedation, no metabolic cause', correct:true, feedback:'✅ Must confirm all prerequisites before brain death testing. Cannot proceed otherwise.', consequence:'Prerequisites confirmed. Formal testing proceeds.', energyCost:5 },
          { id:'a2', label:'Proceed directly to apnoea test', correct:false, feedback:'❌ Must complete full clinical examination first. Apnoea test is LAST step.', consequence:'Protocol violated. Testing invalidated.', energyCost:15 },
          { id:'a3', label:'Discuss organ donation sensitively with family', correct:true, feedback:'✅ Specialist organ donation nurse should lead family conversation. Compassionate approach.', consequence:'Family consents to donation. 4 lives saved.', energyCost:3 },
          { id:'a4', label:'Two senior physicians must complete testing independently', correct:true, feedback:'✅ Brain death requires TWO independent confirmations by senior doctors. Legal requirement.', consequence:'Testing completed correctly. Documentation complete.', energyCost:3 },
        ]
      },
    ]
  },
]

const C = {
  card: 'rgba(36,63,82,0.60)',
  border: 'rgba(0,196,180,0.25)',
  text: 'white',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

const DIFF_COLOR: Record<string,string> = { Intern:'#30d158', Resident:'#ff9f0a', Senior:'#ff453a' }

export default function NightShiftSurvival({ onXP }: { onXP?: (n:number)=>void }) {
  const [phase, setPhase] = useState<GamePhase>('menu')
  const [scenario, setScenario] = useState<ShiftScenario|null>(null)
  const [caseIdx, setCaseIdx] = useState(0)
  const [energy, setEnergy] = useState(100)
  const [totalXP, setTotalXP] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ShiftAction|null>(null)
  const [feedback, setFeedback] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const [showTip, setShowTip] = useState(true)

  const currentCase = scenario?.cases[caseIdx]

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return
    if (timeLeft === 0) { setTimerActive(false); return }
    const t = setTimeout(() => setTimeLeft(t => t-1), 1000)
    return () => clearTimeout(t)
  }, [timerActive, timeLeft])

  const startShift = (s: ShiftScenario) => {
    setScenario(s); setCaseIdx(0); setEnergy(100); setTotalXP(0)
    setMistakes(0); setSelectedAction(null); setFeedback(''); setShowTip(true)
    setTimeLeft(s.cases[0].timeLimit); setTimerActive(false)
    setPhase('briefing')
  }

  const startCase = () => {
    setShowTip(false); setSelectedAction(null); setFeedback('')
    if (currentCase) { setTimeLeft(currentCase.timeLimit); setTimerActive(true) }
    setPhase('shift')
  }

  const handleAction = (action: ShiftAction) => {
    if (selectedAction) return
    setTimerActive(false)
    setSelectedAction(action)
    setFeedback(action.feedback)

    const newEnergy = Math.max(0, energy - action.energyCost)
    setEnergy(newEnergy)

    if (action.correct) {
      setTotalXP(x => x + (currentCase?.xp || 0))
    } else {
      setMistakes(m => m+1)
    }

    if (newEnergy <= 0) {
      setTimeout(() => setPhase('gameover'), 2000)
      return
    }

    setTimeout(() => {
      if (caseIdx < (scenario?.cases.length || 0) - 1) {
        const nextIdx = caseIdx + 1
        setCaseIdx(nextIdx)
        setSelectedAction(null)
        setFeedback('')
        setShowTip(true)
        setTimeLeft(scenario?.cases[nextIdx]?.timeLimit || 30)
        setTimerActive(false)
        setPhase('briefing')
      } else {
        setPhase('complete')
        onXP && onXP(totalXP + (action.correct ? currentCase?.xp || 0 : 0))
      }
    }, 2500)
  }

  const energyColor = energy > 60 ? '#30d158' : energy > 30 ? '#ff9f0a' : '#ff453a'
  const timerPct = currentCase ? (timeLeft / currentCase.timeLimit) * 100 : 100
  const timerColor = timerPct > 50 ? '#30d158' : timerPct > 25 ? '#ff9f0a' : '#ff453a'

  // ── MENU ──
  if (phase === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.25),rgba(15,5,35,0.9))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(0,196,180,0.25)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(139,92,246,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🌙 SURVIVAL MODE</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:6}}>Night Shift Survival</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:12}}>Survive a full on-call shift. Manage your energy. Make the right calls. One wrong decision can cost a life — or your career.</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[{icon:'⚡',label:'Energy System'},{icon:'⏱️',label:'Time Pressure'},{icon:'🏆',label:'Survival Score'}].map(t=>(
            <div key={t.label} style={{background:'rgba(36,63,82,0.60)',borderRadius:12,padding:'10px',border:'1px solid rgba(36,63,82,0.65)',textAlign:'center'}}>
              <div style={{fontSize:20,marginBottom:4}}>{t.icon}</div>
              <div style={{fontSize:9,color:C.muted,fontWeight:700}}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Choose Your Shift</div>
      {SCENARIOS.map(s=>(
        <div key={s.id} onClick={()=>startShift(s)}
          style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${s.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${s.color}08`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:80,height:80,borderRadius:'50%',background:`${s.color}10`,filter:'blur(20px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:54,height:54,borderRadius:17,background:`${s.color}18`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,boxShadow:`0 4px 16px ${s.color}25`}}>{s.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:2}}>{s.title}</div>
              <div style={{fontSize:11,color:C.sub,marginBottom:4}}>{s.subtitle}</div>
              <div style={{fontSize:10,color:C.muted}}>⏰ {s.duration}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,padding:'4px 10px',borderRadius:10,background:`${DIFF_COLOR[s.difficulty]}18`,color:DIFF_COLOR[s.difficulty],fontWeight:800,border:`1px solid ${DIFF_COLOR[s.difficulty]}30`,marginBottom:6}}>{s.difficulty}</div>
              <div style={{fontSize:12,color:'#ffd60a',fontWeight:700}}>+{s.totalXP} XP</div>
            </div>
          </div>
          <div style={{display:'flex',gap:6}}>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${s.color}12`,color:s.color,fontWeight:700,border:`1px solid ${s.color}20`}}>{s.cases.length} cases</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(36,63,82,0.50)',color:C.muted,fontWeight:600}}>⚡ Energy system</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (!scenario || !currentCase) return null
  const sc = scenario
  const cc = currentCase

  // ── BRIEFING ──
  if (phase === 'briefing') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      {/* Energy + progress */}
      <div style={{background:C.card,borderRadius:16,padding:'12px 16px',marginBottom:14,border:`1px solid ${C.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
          <span style={{fontSize:12,color:C.sub,fontWeight:600}}>⚡ Energy</span>
          <span style={{fontSize:12,fontWeight:800,color:energyColor}}>{energy}%</span>
        </div>
        <div style={{height:8,background:'rgba(36,63,82,0.65)',borderRadius:4,overflow:'hidden',marginBottom:8}}>
          <div style={{height:'100%',width:`${energy}%`,background:`linear-gradient(90deg,${energyColor},${energyColor}aa)`,borderRadius:4,transition:'width 0.5s',boxShadow:`0 0 12px ${energyColor}66`}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:10,color:C.muted}}>Case {caseIdx+1}/{sc.cases.length}</span>
          <span style={{fontSize:10,color:'#ffd60a',fontWeight:700}}>+{totalXP} XP so far</span>
        </div>
      </div>

      {/* Incoming call */}
      <div style={{background:`${cc.color}12`,borderRadius:22,padding:'20px',marginBottom:14,border:`1px solid ${cc.color}30`,boxShadow:`0 8px 32px ${cc.color}15`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:`${cc.color}15`,filter:'blur(20px)',pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <div style={{width:48,height:48,borderRadius:15,background:`${cc.color}20`,border:`1px solid ${cc.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{cc.icon}</div>
          <div>
            <div style={{fontSize:10,color:cc.color,fontWeight:700,letterSpacing:0.5}}>{cc.urgency==='Stat'?'🔴 STAT CALL':cc.urgency==='Urgent'?'🟡 URGENT':'🟢 ROUTINE'} · {cc.time}</div>
            <div style={{fontSize:16,fontWeight:900,color:C.text}}>{cc.title}</div>
            <div style={{fontSize:11,color:C.sub}}>{cc.dept} · {cc.patient}</div>
          </div>
        </div>
        <div style={{background:'rgba(36,63,82,0.60)',borderRadius:14,padding:'12px 14px',border:'1px solid rgba(36,63,82,0.65)'}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:6,letterSpacing:0.5}}>📋 SITUATION</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.75}}>{cc.presentation}</div>
        </div>
      </div>

      {/* Night tip */}
      {showTip&&(
        <div style={{background:'rgba(255,214,10,0.08)',borderRadius:14,padding:'12px 14px',marginBottom:14,border:'1px solid rgba(255,214,10,0.2)'}}>
          <div style={{fontSize:10,color:'#ffd60a',fontWeight:700,marginBottom:4}}>💡 NIGHT TIP</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.5}}>{sc.tips[caseIdx % sc.tips.length]}</div>
        </div>
      )}

      <button onClick={startCase}
        style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${cc.color},${cc.color}bb)`,color:'white',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${cc.color}44`,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <span>▶ Respond Now</span>
        <span style={{fontSize:12,opacity:0.8}}>({cc.timeLimit}s to decide)</span>
      </button>
    </div>
  )

  // ── ACTIVE CASE ──
  if (phase === 'shift') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      {/* Timer + Energy */}
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        {/* Timer */}
        <div style={{flex:1,background:C.card,borderRadius:16,padding:'12px',border:`1px solid ${timerColor}30`,textAlign:'center'}}>
          <div style={{width:52,height:52,borderRadius:'50%',background:`conic-gradient(${timerColor} ${timerPct*3.6}deg, rgba(36,63,82,0.50) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 6px',boxShadow:`0 0 16px ${timerColor}44`}}>
            <div style={{width:42,height:42,borderRadius:'50%',background:'rgba(15,5,35,1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:18,fontWeight:900,color:timerColor}}>{timeLeft}</span>
            </div>
          </div>
          <div style={{fontSize:10,color:C.muted,fontWeight:700}}>seconds</div>
        </div>
        {/* Energy */}
        <div style={{flex:2,background:C.card,borderRadius:16,padding:'12px',border:`1px solid ${C.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:11,color:C.sub,fontWeight:600}}>⚡ Energy</span>
            <span style={{fontSize:13,fontWeight:800,color:energyColor}}>{energy}%</span>
          </div>
          <div style={{height:8,background:'rgba(36,63,82,0.65)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
            <div style={{height:'100%',width:`${energy}%`,background:`linear-gradient(90deg,${energyColor},${energyColor}aa)`,borderRadius:4,transition:'width 0.5s',boxShadow:`0 0 10px ${energyColor}66`}}/>
          </div>
          <div style={{fontSize:10,color:C.muted}}>Wrong decisions drain your energy</div>
        </div>
      </div>

      {/* Case card */}
      <div style={{background:`${cc.color}10`,borderRadius:18,padding:'14px',marginBottom:12,border:`1px solid ${cc.color}25`}}>
        <div style={{fontSize:11,color:cc.color,fontWeight:700,marginBottom:4}}>{cc.icon} {cc.time} · {cc.dept}</div>
        <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:6}}>{cc.title} — {cc.patient}</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>{cc.presentation}</div>
      </div>

      {/* Feedback */}
      {feedback&&(
        <div style={{background:feedback.startsWith('✅')?'rgba(48,209,88,0.1)':'rgba(255,69,58,0.1)',borderRadius:14,padding:'12px 14px',marginBottom:12,border:`1px solid ${feedback.startsWith('✅')?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`,animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:13,color:feedback.startsWith('✅')?'#86efac':'#fca5a5',fontWeight:600,lineHeight:1.6}}>{feedback}</div>
          {selectedAction&&<div style={{fontSize:12,color:C.sub,marginTop:6,fontStyle:'italic'}}>{selectedAction.consequence}</div>}
        </div>
      )}

      {/* Actions */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>What do you do?</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {cc.actions.map(action=>{
          const done = selectedAction !== null
          const isSelected = selectedAction?.id === action.id
          let bg = C.card
          let border = `1px solid ${C.border}`
          let textColor = C.text
          if (done) {
            if (action.correct) { bg='rgba(48,209,88,0.1)'; border='2px solid rgba(48,209,88,0.35)'; textColor='#86efac' }
            else if (isSelected) { bg='rgba(255,69,58,0.1)'; border='1px solid rgba(255,69,58,0.3)'; textColor='#fca5a5' }
          }
          return (
            <div key={action.id} onClick={()=>!done&&handleAction(action)}
              style={{background:bg,borderRadius:16,padding:'14px 16px',border,cursor:done?'default':'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s',opacity:done&&!action.correct&&!isSelected?0.4:1}}>
              <div style={{width:36,height:36,borderRadius:11,background:'rgba(36,63,82,0.50)',border:'1px solid rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                {done?(action.correct?'✅':isSelected?'❌':'○'):'▷'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:textColor,fontWeight:600,lineHeight:1.4}}>{action.label}</div>
                {!done&&<div style={{fontSize:10,color:'rgba(255,100,100,0.6)',marginTop:3}}>⚡ -{action.energyCost} energy if wrong</div>}
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )

  // ── GAME OVER ──
  if (phase === 'gameover') return (
    <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
      <div style={{fontSize:64,marginBottom:16,filter:'drop-shadow(0 0 24px rgba(255,69,58,0.6))'}}>😴</div>
      <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:8}}>Exhausted!</div>
      <div style={{fontSize:14,color:'#ff453a',fontWeight:700,marginBottom:6}}>Energy depleted at {cc.time}</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:24}}>You lasted {caseIdx+1}/{sc.cases.length} cases · +{totalXP} XP</div>
      <div style={{display:'flex',gap:10,justifyContent:'center'}}>
        <button onClick={()=>startShift(sc)} style={{padding:'14px 24px',borderRadius:16,border:'1px solid rgba(255,69,58,0.3)',background:'rgba(255,69,58,0.1)',color:'#ff453a',fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
        <button onClick={()=>setPhase('menu')} style={{padding:'14px 24px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>📋 Shifts</button>
      </div>
    </div>
  )

  // ── COMPLETE ──
  if (phase === 'complete') {
    const pct = Math.round((totalXP / sc.totalXP) * 100)
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{background:`linear-gradient(145deg,${sc.color}15,rgba(0,196,180,0.08))`,borderRadius:24,padding:'28px 20px',marginBottom:16,border:`1px solid ${sc.color}30`,textAlign:'center',boxShadow:`0 8px 32px ${sc.color}20`}}>
          <div style={{fontSize:60,marginBottom:12,filter:`drop-shadow(0 0 24px ${pct>=80?'rgba(255,214,10,0.6)':'rgba(139,92,246,0.4)'})`}}>
            {pct>=80?'🏆':pct>=60?'🥇':'🎖️'}
          </div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:4}}>{sc.icon} Shift Complete!</div>
          <div style={{fontSize:18,fontWeight:700,color:'#ffd60a',marginBottom:4}}>+{totalXP} XP</div>
          <div style={{fontSize:14,color:pct>=80?'#30d158':'#ff9f0a',fontWeight:700,marginBottom:8}}>
            {pct>=80?'Outstanding Doctor! 🌟':pct>=60?'Good Work — Review Mistakes':'Study the guidelines'}
          </div>
          <div style={{display:'flex',gap:16,justifyContent:'center'}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:900,color:energyColor}}>{energy}%</div><div style={{fontSize:10,color:C.muted}}>energy left</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:900,color:'#ff453a'}}>{mistakes}</div><div style={{fontSize:10,color:C.muted}}>mistakes</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:900,color:'#30d158'}}>{sc.cases.length}</div><div style={{fontSize:10,color:C.muted}}>cases done</div></div>
          </div>
        </div>

        <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Shift Tips</div>
        {sc.tips.map((tip,i)=>(
          <div key={i} style={{display:'flex',gap:10,marginBottom:8,background:C.card,borderRadius:12,padding:'12px 14px',border:`1px solid ${C.border}`}}>
            <span style={{color:'#ffd60a',flexShrink:0}}>💡</span>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>{tip}</span>
          </div>
        ))}

        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button onClick={()=>startShift(sc)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${sc.color}30`,background:`${sc.color}10`,color:sc.color,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
          <button onClick={()=>setPhase('menu')} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.4)'}}>🌙 All Shifts</button>
        </div>
      </div>
    )
  }

  return null
}
