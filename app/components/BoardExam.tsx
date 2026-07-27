'use client'
import { useState, useEffect, useRef } from 'react'

// ── DAILY CHALLENGE ──
const getDailyCase = () => {
  const cases = ['stemi','pe','sepsis','stroke','dka','hyperk','anaphylaxis','heartblock','vt','tension']
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return cases[day % cases.length]
}

const getTimeUntilMidnight = () => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

// ── BOARD EXAM QUESTIONS ──
const BOARD_LEVELS = [
  {
    level: 1, name: 'Intern', icon: '🩺', color: '#64748b',
    questions: [
      { q: 'STEMI: ST elevation V1-V4, BP 95/60. First drug?', options: ['GTN spray', 'Aspirin 300mg', 'Metoprolol IV', 'Furosemide IV'], correct: 1, explain: 'Aspirin 300mg is always first in STEMI. GTN contraindicated if SBP < 100.' },
      { q: 'Anaphylaxis: BP 70/40, stridor. First treatment?', options: ['IV hydrocortisone', 'Adrenaline 0.5mg IM', 'Chlorphenamine IV', 'High-flow O2'], correct: 1, explain: 'IM Adrenaline outer thigh is ALWAYS first in anaphylaxis.' },
      { q: 'Sepsis: BP 72/40 post 2L IVF, lactate 4.8. Next?', options: ['More IVF', 'Norepinephrine', 'Dopamine', 'Furosemide'], correct: 1, explain: 'Norepinephrine is first-line vasopressor in septic shock.' },
      { q: 'ECG: Complete AV dissociation, QRS 32/min. Management?', options: ['Atropine 3mg IV', 'Transcutaneous pacing', 'Amiodarone 300mg', 'Digoxin'], correct: 1, explain: 'Complete heart block: transcutaneous pacing immediately. Atropine usually ineffective.' },
      { q: 'K+ 7.2, peaked T waves on ECG. First priority?', options: ['Furosemide', 'Salbutamol nebs', 'Calcium gluconate 10ml IV', 'Dialysis'], correct: 2, explain: 'Calcium gluconate stabilises cardiac membrane FIRST when ECG changes present.' },
    ]
  },
  {
    level: 2, name: 'Resident', icon: '📋', color: '#0a84ff',
    questions: [
      { q: 'Massive PE, BP 80/50, RV:LV 1.5 on echo. Best treatment?', options: ['LMWH alone', 'Alteplase 100mg IV', 'Surgical embolectomy', 'IVC filter'], correct: 1, explain: 'Haemodynamically unstable massive PE: systemic thrombolysis with alteplase.' },
      { q: 'DKA: BG 28, pH 7.1, K+ 3.2. What BEFORE insulin?', options: ['Sodium bicarbonate', 'Potassium replacement', 'Insulin 10u bolus', 'Dextrose 50%'], correct: 1, explain: 'NEVER give insulin before K+ replacement in DKA. K+ 3.2 will drop further → fatal arrhythmia.' },
      { q: 'Tension PTX: trachea deviated, BP 70/40. Next step?', options: ['CXR stat', 'CT chest', 'Needle decompression 2nd ICS MCL', 'Intubate first'], correct: 2, explain: 'Tension PTX is clinical diagnosis. Immediate needle decompression 2nd ICS MCL.' },
      { q: 'Stroke: NIHSS 16, CT no bleed, 90 min onset. Aspirin given. Next?', options: ['Heparin infusion', 'IV tPA 0.9mg/kg', 'Aspirin 300mg', 'Warfarin loading'], correct: 1, explain: 'IV tPA within 4.5h window. Aspirin contraindicated 24h after tPA. Check BP < 185/110 first.' },
      { q: 'NSTEMI: TIMI score 5. Optimal timing for angiography?', options: ['Immediate < 2h', 'Within 24h (early invasive)', '72h', 'Medical management only'], correct: 1, explain: 'TIMI 5 = HIGH risk. Early invasive strategy within 24h. Immediate only if haemodynamically unstable.' },
    ]
  },
  {
    level: 3, name: 'Registrar', icon: '⚕️', color: '#ff9500',
    questions: [
      { q: 'AF + WPW on ECG, rapid rate 220/min. Which drug is CONTRAINDICATED?', options: ['Flecainide', 'Procainamide', 'Verapamil', 'DC cardioversion'], correct: 2, explain: 'Verapamil/Diltiazem in AF+WPW: blocks AV node → accessory pathway takes over → VF. Contraindicated.' },
      { q: 'Hypertensive emergency: BP 220/130, papilloedema, AKI. Target BP reduction?', options: ['Immediate normalisation', '25% reduction in 1h, then gradual', '10% per day', 'No treatment — risky'], correct: 1, explain: 'Hypertensive emergency: reduce MAP by 25% in first hour. Too rapid = ischaemia (cerebral, coronary, renal).' },
      { q: 'Post-cardiac arrest ROSC. Temperature management target?', options: ['38-39°C', '36-37°C (targeted temp)', '34°C mandatory', 'No temperature management'], correct: 1, explain: 'TTM 2 trial: target 36-37°C or lower (32-36°C). Avoid fever (>37.7°C) for 72h post-ROSC.' },
      { q: 'Cardiogenic shock post-STEMI, EF 20%. IABP benefit evidence?', options: ['Strong — reduces mortality', 'IABP-SHOCK II: no mortality benefit', 'Only in elderly', 'Contraindicated'], correct: 1, explain: 'IABP-SHOCK II trial: no mortality benefit from routine IABP in cardiogenic shock. Consider Impella/ECMO.' },
      { q: 'Sepsis-3: what defines septic shock vs sepsis?', options: ['Lactate > 2 alone', 'Vasopressor + lactate > 2 despite adequate IVF', 'SOFA > 2 alone', 'BP < 90/60'], correct: 1, explain: 'Septic shock (Sepsis-3): vasopressor required to maintain MAP ≥ 65 + lactate > 2 mmol/L despite adequate IVF.' },
    ]
  },
  {
    level: 4, name: 'Specialist', icon: '🏥', color: '#8b5cf6',
    questions: [
      { q: 'Refractory VF post 3 shocks + amiodarone. What next?', options: ['Increase shock energy', 'Double sequential defibrillation', 'Lidocaine + continue CPR', 'All of the above consider'], correct: 3, explain: 'Refractory VF: consider double sequential defibrillation (2 AEDs simultaneously), vector change, lidocaine, correct reversible causes.' },
      { q: 'ARDS: P/F ratio 80, driving pressure 18 cmH2O. Best intervention?', options: ['PEEP reduction', 'Prone positioning 16h/day', 'High-frequency ventilation', 'Immediate ECMO'], correct: 1, explain: 'Severe ARDS (P/F < 150): prone positioning 16h/day reduces mortality 28% (PROSEVA trial). First-line before ECMO.' },
      { q: 'TTP: ADAMTS13 < 10%, anti-ADAMTS13 antibody positive. Treatment?', options: ['FFP alone', 'Platelet transfusion', 'Plasma exchange + rituximab + steroids', 'IVIG only'], correct: 2, explain: 'Acquired TTP: emergency plasma exchange daily + steroids + rituximab. Platelet transfusion CONTRAINDICATED (thrombosis risk).' },
      { q: 'Takotsubo: echo shows apical ballooning, EF 25%. Troponin mildly elevated. Coronaries?', options: ['Significant LAD disease expected', 'Normal or non-obstructive coronaries', 'Multi-vessel disease', 'Requires urgent PCI'], correct: 1, explain: 'Takotsubo (stress cardiomyopathy): normal or non-obstructive coronaries despite severe LV dysfunction. Usually reversible.' },
      { q: 'Massive haemoptysis (>600ml/24h). Most immediate intervention?', options: ['Bronchoscopy rigid', 'Protect airway — intubate with large ET tube, bleeding lung dependent', 'IR embolisation first', 'CT chest first'], correct: 1, explain: 'Life-threatening haemoptysis: airway FIRST. Intubate + position bleeding lung down to protect contralateral lung. Then bronchoscopy/IR.' },
    ]
  },
  {
    level: 5, name: 'Consultant', icon: '🎓', color: '#ff3b30',
    questions: [
      { q: 'ECMO for refractory cardiogenic shock. V-A ECMO initiated. Main risk of retrograde flow?', options: ['Pulmonary oedema worsening (North-South syndrome)', 'Renal failure', 'Stroke', 'Haemolysis'], correct: 0, explain: 'North-South (Harlequin) syndrome: V-A ECMO delivers oxygenated blood retrograde, but LV ejects deoxygenated blood to upper body. Monitor right radial SpO2.' },
      { q: 'HELLP syndrome: platelets 42, ALT 380, BP 170/110. Delivery decision?', options: ['Expectant management until term', 'Deliver regardless of gestation after stabilisation', 'Steroids only', 'MgSO4 and await'], correct: 1, explain: 'HELLP: deliver regardless of gestation. MgSO4 for seizure prophylaxis, antihypertensives. No benefit in delay — maternal and foetal risk.' },
      { q: 'Thrombotic storm: 4 vessel occlusions, anti-PL antibodies positive. Diagnosis and treatment?', options: ['HIT type II — argatroban', 'Catastrophic APS — anticoagulation + steroids + IVIG + plasma exchange', 'DIC — FFP only', 'TTP — plasma exchange alone'], correct: 1, explain: 'Catastrophic APS (CAPS): < 1 week multi-organ thrombosis. Treat with anticoagulation + high-dose steroids + IVIG + plasma exchange. Mortality 30-50%.' },
      { q: 'Refractory status epilepticus 45 min, on propofol + midazolam infusion. Next step?', options: ['Add phenytoin', 'Ketamine IV infusion or barbiturate coma', 'Increase propofol', 'EEG monitoring only'], correct: 1, explain: 'Super-refractory SE (>24h despite anaesthesia): ketamine (NMDA antagonist) or barbiturate coma (thiopental). EEG-guided burst suppression.' },
      { q: 'ICU patient: sudden hypotension, JVP raised, muffled heart sounds post-CVL. Next?', options: ['Urgent echo + pericardiocentesis', 'IVF 1L bolus', 'Inotropes', 'CXR and wait'], correct: 0, explain: 'Beck\'s triad post-CVL = cardiac tamponade. Emergency echo-guided pericardiocentesis. Do not delay for CXR.' },
    ]
  },
]

const DAILY_CHALLENGE_CASES = [
  { id:'stemi', title:'🫀 STEMI Master Challenge', color:'#ff3b30', timeLimit:180, xp:150,
    questions:[
      {q:'55M STEMI, BP 88/60, HR 110. GTN requested by nurse. Your decision?', options:['Give GTN 0.4mg sublingual','Withhold GTN — hypotension contraindication','Give GTN IV only','Reduce GTN dose'], correct:1, explain:'GTN absolutely contraindicated if SBP < 100 in STEMI. Causes severe hypotension → cardiogenic shock.'},
      {q:'Door-to-balloon time currently 95 min. Cath lab delayed. Alternative?', options:['Wait for cath lab','Thrombolysis if PCI > 120 min unavailable','Repeat ECG only','Discharge and readmit'], correct:1, explain:'If PCI cannot be achieved within 120 min of first medical contact, consider fibrinolysis if no contraindications.'},
      {q:'Post-PCI: patient hypotensive, JVP raised, clear lungs. Echo: RV dilatation. Diagnosis?', options:['LV failure','RV infarction','Tamponade','PE'], correct:1, explain:'RV infarction (inferior STEMI): hypotension + raised JVP + clear lungs. Avoid diuretics/nitrates. IVF + maintain RV preload.'},
    ]
  },
  { id:'sepsis', title:'🦠 Sepsis Hour-1 Sprint', color:'#ff6b35', timeLimit:120, xp:120,
    questions:[
      {q:'Sepsis patient: cultures taken, Abx given. BP 72/40 after 30ml/kg IVF. Lactate 4.2. Next?', options:['More IVF 1L','Norepinephrine — MAP target 65-70','Dopamine','Vasopressin first-line'], correct:1, explain:'After adequate fluid resuscitation, norepinephrine is first-line vasopressor. Target MAP 65-70 mmHg.'},
      {q:'Source control: sigmoid perforation + peritonitis in septic shock. Timing of surgery?', options:['Stabilise 48h then operate','Emergency surgery as soon as safely possible','Medical management only','Surgery only if no improvement'], correct:1, explain:'Source control is a pillar of sepsis management. Source must be controlled as soon as safely possible — delay worsens mortality.'},
      {q:'Hydrocortisone 200mg/day in septic shock: when indicated?', options:['All septic shock','Vasopressor-refractory shock (norad > 0.25mcg/kg/min)','Only if cortisol < 250','Never'], correct:1, explain:'ADRENAL trial: hydrocortisone in vasopressor-refractory shock. Faster shock reversal but no 90-day mortality benefit. Use when norad dose high.'},
    ]
  },
]

export default function BoardExam({ onXP }: { onXP: (n: number) => void }) {
  const [mode, setMode] = useState<'menu'|'board'|'daily'>('menu')
  const [boardLevel, setBoardLevel] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [correct, setCorrect] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [passed, setPassed] = useState<boolean|null>(null)
  const [unlockedLevels, setUnlockedLevels] = useState([true,false,false,false,false])
  const [dailyIdx, setDailyIdx] = useState(0)
  const [dailyQ, setDailyQ] = useState(0)
  const [dailyAns, setDailyAns] = useState<number|null>(null)
  const [dailyCorrect, setDailyCorrect] = useState(0)
  const [dailyDone, setDailyDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()

  const level = BOARD_LEVELS[boardLevel]
  const questions = level?.questions || []
  const currentQ = questions[qIndex]
  const dailyCase = DAILY_CHALLENGE_CASES[dailyIdx]
  const dailyQuestion = dailyCase?.questions[dailyQ]

  useEffect(() => {
    if (mode === 'daily' && !dailyDone) {
      setTimeLeft(dailyCase.timeLimit)
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);setDailyDone(true);return 0} return t-1 })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [mode, dailyIdx])

  const handleBoardAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    setShowExplain(true)
    if (i === currentQ.correct) setCorrect(c => c+1)
  }

  const nextBoardQ = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(q => q+1); setSelected(null); setShowExplain(false)
    } else {
      const pass = correct >= Math.ceil(questions.length * 0.6)
      setPassed(pass)
      if (pass) {
        onXP(100 * (boardLevel+1))
        if (boardLevel < BOARD_LEVELS.length-1) {
          setUnlockedLevels(prev => { const n=[...prev]; n[boardLevel+1]=true; return n })
        }
      }
    }
  }

  const handleDailyAnswer = (i: number) => {
    if (dailyAns !== null) return
    setDailyAns(i)
    if (i === dailyQuestion.correct) setDailyCorrect(c => c+1)
    setTimeout(() => {
      if (dailyQ < dailyCase.questions.length-1) { setDailyQ(q=>q+1); setDailyAns(null) }
      else { clearInterval(timerRef.current); setDailyDone(true); onXP(dailyCase.xp) }
    }, 1800)
  }

  const resetBoard = () => { setQIndex(0); setSelected(null); setShowExplain(false); setCorrect(0); setPassed(null) }

  // ── MENU ──
  if (mode === 'menu') return (
    <div style={{ fontFamily:'-apple-system,sans-serif', paddingBottom:20 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 4px', letterSpacing:-0.5 }}>Board Certification</h2>
        <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Virtual board exam + daily clinical challenge</p>
      </div>

      {/* Daily Challenge Card */}
      <div style={{ background:'linear-gradient(135deg,#1a0533,#0a0f1e)', borderRadius:22, padding:20, marginBottom:16, color:'white', border:'1px solid rgba(139,92,246,0.3)', boxShadow:'0 8px 32px rgba(139,92,246,0.3)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent)', pointerEvents:'none' }}/>
        <div style={{ fontSize:11, color:'rgba(139,92,246,0.8)', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>🔥 TODAY'S CHALLENGE</div>
        <h3 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>{DAILY_CHALLENGE_CASES[dailyIdx].title}</h3>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:'0 0 16px' }}>Resets in: {getTimeUntilMidnight()} · +{DAILY_CHALLENGE_CASES[dailyIdx].xp} XP</p>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>{setMode('daily');setDailyQ(0);setDailyAns(null);setDailyCorrect(0);setDailyDone(false)}} style={{ flex:1, padding:'12px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#8b5cf6,#0a84ff)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Start Challenge →
          </button>
          <button onClick={()=>setDailyIdx(i=>(i+1)%DAILY_CHALLENGE_CASES.length)} style={{ padding:'12px 16px', borderRadius:14, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, cursor:'pointer' }}>
            Change
          </button>
        </div>
      </div>

      {/* Board Levels */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:12, letterSpacing:-0.2 }}>Virtual Board Examination</div>
        {BOARD_LEVELS.map((lvl, i) => (
          <div key={i} onClick={()=>{if(unlockedLevels[i]){setBoardLevel(i);resetBoard();setMode('board')}}} style={{ background:unlockedLevels[i]?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.4)', backdropFilter:'blur(20px)', borderRadius:18, padding:'14px 16px', marginBottom:8, border:unlockedLevels[i]?`1.5px solid ${lvl.color}22`:'1px solid rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:14, cursor:unlockedLevels[i]?'pointer':'not-allowed', opacity:unlockedLevels[i]?1:0.5, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ width:48, height:48, borderRadius:16, background:unlockedLevels[i]?`${lvl.color}12`:'rgba(0,0,0,0.04)', border:`2px solid ${unlockedLevels[i]?lvl.color+'44':'rgba(0,0,0,0.08)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              {unlockedLevels[i] ? lvl.icon : '🔒'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:unlockedLevels[i]?'#0f172a':'#94a3b8' }}>Level {lvl.level} — {lvl.name}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{lvl.questions.length} questions · Pass: 60% · +{100*(i+1)} XP</div>
            </div>
            {unlockedLevels[i] ? (
              <div style={{ fontSize:20, color:'#94a3b8' }}>›</div>
            ) : (
              <div style={{ fontSize:10, padding:'4px 10px', borderRadius:10, background:'rgba(0,0,0,0.05)', color:'#94a3b8', fontWeight:700 }}>LOCKED</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // ── BOARD EXAM ──
  if (mode === 'board') {
    if (passed !== null) return (
      <div style={{ fontFamily:'-apple-system,sans-serif' }}>
        <div style={{ background:passed?'rgba(220,252,231,0.9)':'rgba(254,226,226,0.9)', backdropFilter:'blur(20px)', borderRadius:20, padding:28, textAlign:'center', border:`2px solid ${passed?'rgba(22,163,74,0.3)':'rgba(220,38,38,0.3)'}`, animation:'fadeIn 0.5s ease' }}>
          <div style={{ fontSize:64, marginBottom:12 }}>{passed?'🎓':'📚'}</div>
          <h3 style={{ fontSize:22, fontWeight:800, color:passed?'#14532d':'#7f1d1d', marginBottom:8 }}>{passed?`Level ${level.level} Passed!`:'Not Passed'}</h3>
          <p style={{ fontSize:14, color:passed?'#166534':'#991b1b', lineHeight:1.7, marginBottom:16 }}>
            {passed?`Excellent! You scored ${correct}/${questions.length}. ${boardLevel<4?`Level ${boardLevel+2} unlocked!`:'You reached Chief of Medicine! 🌟'}`:`Score: ${correct}/${questions.length}. Need ${Math.ceil(questions.length*0.6)} to pass. Review and retry.`}
          </p>
          {passed && <div style={{ background:`${level.color}15`, borderRadius:14, padding:12, marginBottom:16, border:`1px solid ${level.color}30` }}>
            <div style={{ fontSize:20, fontWeight:900, color:level.color }}>+{100*(boardLevel+1)} XP</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Board certification bonus</div>
          </div>}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>{resetBoard()}} style={{ flex:1, padding:'14px', borderRadius:14, border:'none', background:passed?'rgba(22,163,74,0.15)':'linear-gradient(135deg,#ff3b30,#ff6b35)', color:passed?'#14532d':'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              {passed?'Retry for 100%':'Retry Exam'}
            </button>
            <button onClick={()=>{setMode('menu');resetBoard()}} style={{ flex:1, padding:'14px', borderRadius:14, border:'1px solid rgba(0,0,0,0.08)', background:'rgba(255,255,255,0.8)', color:'#374151', fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    )

    return (
      <div style={{ fontFamily:'-apple-system,sans-serif', paddingBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <button onClick={()=>{setMode('menu');resetBoard()}} style={{ background:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.9)', color:'#475569', padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', fontWeight:600 }}>← Exit</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{level.icon} Level {level.level} — {level.name}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Q {qIndex+1} of {questions.length} · Score: {correct}</div>
          </div>
          <div style={{ fontSize:13, fontWeight:800, color:level.color }}>{Math.round((qIndex/questions.length)*100)}%</div>
        </div>
        <div style={{ height:4, background:'rgba(0,0,0,0.06)', borderRadius:2, overflow:'hidden', marginBottom:16 }}>
          <div style={{ height:'100%', background:`linear-gradient(90deg,${level.color},${level.color}aa)`, width:`${(qIndex/questions.length)*100}%`, transition:'width 0.4s', borderRadius:2 }}/>
        </div>
        <div style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderRadius:20, padding:18, marginBottom:12, border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize:10, color:level.color, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>BOARD QUESTION {qIndex+1}</div>
          <p style={{ fontSize:15, color:'#0f172a', lineHeight:1.8, fontWeight:500, margin:0 }}>{currentQ.q}</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
          {currentQ.options.map((opt,i)=>{
            let bg='rgba(255,255,255,0.8)',border='1px solid rgba(255,255,255,0.85)',tc='#0f172a'
            if(selected!==null){
              if(i===currentQ.correct){bg='rgba(220,252,231,0.9)';border='2px solid #16a34a';tc='#14532d'}
              else if(i===selected){bg='rgba(254,226,226,0.9)';border='2px solid #dc2626';tc='#7f1d1d'}
            }
            return(
              <div key={i} onClick={()=>handleBoardAnswer(i)} style={{ background:bg, backdropFilter:'blur(12px)', borderRadius:14, padding:'14px 16px', border, cursor:selected===null?'pointer':'default', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:selected!==null&&i===currentQ.correct?'#16a34a':selected===i&&i!==currentQ.correct?'#dc2626':`${level.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:selected!==null&&(i===currentQ.correct||i===selected)?'white':level.color }}>{['A','B','C','D'][i]}</span>
                </div>
                <span style={{ fontSize:13, color:tc, fontWeight:500, flex:1, lineHeight:1.5 }}>{opt}</span>
                {selected!==null&&i===currentQ.correct&&<span>✅</span>}
                {selected!==null&&i===selected&&i!==currentQ.correct&&<span>❌</span>}
              </div>
            )
          })}
        </div>
        {showExplain&&(
          <div>
            <div style={{ background:'rgba(219,234,254,0.8)', backdropFilter:'blur(12px)', borderRadius:14, padding:14, marginBottom:12, border:'1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#1d4ed8', marginBottom:6, letterSpacing:0.5 }}>💡 BOARD EXPLANATION</div>
              <p style={{ fontSize:13, color:'#1e3a5f', lineHeight:1.75, margin:0, fontWeight:500 }}>{currentQ.explain}</p>
            </div>
            <button onClick={nextBoardQ} style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background:`linear-gradient(135deg,${level.color},${level.color}bb)`, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:`0 6px 20px ${level.color}33` }}>
              {qIndex<questions.length-1?'Next Question →':'Submit Exam 📋'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── DAILY CHALLENGE ──
  if (mode === 'daily') {
    if (dailyDone) return (
      <div style={{ fontFamily:'-apple-system,sans-serif' }}>
        <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,0.95),rgba(10,15,30,0.98))', backdropFilter:'blur(20px)', borderRadius:22, padding:28, textAlign:'center', border:'1px solid rgba(139,92,246,0.3)', color:'white', animation:'fadeIn 0.5s ease' }}>
          <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
          <h3 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Daily Challenge Complete!</h3>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', marginBottom:20 }}>{dailyCorrect}/{dailyCase.questions.length} correct · Come back tomorrow for a new challenge!</p>
          <div style={{ background:'rgba(139,92,246,0.25)', borderRadius:14, padding:14, marginBottom:20, border:'1px solid rgba(139,92,246,0.25)' }}>
            <div style={{ fontSize:28, fontWeight:900, color:'#c4b5fd' }}>+{dailyCase.xp} XP</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>Daily bonus earned</div>
          </div>
          <button onClick={()=>setMode('menu')} style={{ width:'100%', padding:'16px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#8b5cf6,#0a84ff)', color:'white', fontSize:16, fontWeight:700, cursor:'pointer' }}>
            Back to Menu
          </button>
        </div>
      </div>
    )

    const timerPct = (timeLeft / dailyCase.timeLimit) * 100
    const timerColor = timerPct > 50 ? '#30d158' : timerPct > 25 ? '#ff9500' : '#ff3b30'

    return (
      <div style={{ fontFamily:'-apple-system,sans-serif', paddingBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={()=>{setMode('menu');clearInterval(timerRef.current)}} style={{ background:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.9)', color:'#475569', padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', fontWeight:600 }}>← Exit</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{dailyCase.title}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Q {dailyQ+1} of {dailyCase.questions.length}</div>
          </div>
          <div style={{ fontSize:14, fontWeight:800, color:timerColor }}>⏱ {timeLeft}s</div>
        </div>
        <div style={{ height:5, background:'rgba(0,0,0,0.06)', borderRadius:3, overflow:'hidden', marginBottom:14 }}>
          <div style={{ height:'100%', background:timerColor, width:`${timerPct}%`, transition:'width 1s linear', borderRadius:3 }}/>
        </div>
        <div style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderRadius:20, padding:18, marginBottom:12, border:'1px solid rgba(255,255,255,0.9)' }}>
          <div style={{ fontSize:10, color:dailyCase.color, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>🔥 DAILY CHALLENGE · Q{dailyQ+1}</div>
          <p style={{ fontSize:15, color:'#0f172a', lineHeight:1.8, fontWeight:500, margin:0 }}>{dailyQuestion?.q}</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {dailyQuestion?.options.map((opt,i)=>{
            let bg='rgba(255,255,255,0.8)',border='1px solid rgba(255,255,255,0.85)',tc='#0f172a'
            if(dailyAns!==null){
              if(i===dailyQuestion.correct){bg='rgba(220,252,231,0.9)';border='2px solid #16a34a';tc='#14532d'}
              else if(i===dailyAns){bg='rgba(254,226,226,0.9)';border='2px solid #dc2626';tc='#7f1d1d'}
            }
            return(
              <div key={i} onClick={()=>handleDailyAnswer(i)} style={{ background:bg, backdropFilter:'blur(12px)', borderRadius:14, padding:'14px 16px', border, cursor:dailyAns===null?'pointer':'default', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:dailyAns!==null&&i===dailyQuestion.correct?'#16a34a':dailyAns===i&&i!==dailyQuestion.correct?'#dc2626':'rgba(139,92,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:dailyAns!==null&&(i===dailyQuestion.correct||i===dailyAns)?'white':'#8b5cf6' }}>{['A','B','C','D'][i]}</span>
                </div>
                <span style={{ fontSize:13, color:tc, fontWeight:500, flex:1, lineHeight:1.5 }}>{opt}</span>
                {dailyAns!==null&&i===dailyQuestion.correct&&<span>✅</span>}
                {dailyAns!==null&&i===dailyAns&&i!==dailyQuestion.correct&&<span>❌</span>}
              </div>
            )
          })}
        </div>
        {dailyAns!==null&&(
          <div style={{ background:'rgba(219,234,254,0.8)', backdropFilter:'blur(12px)', borderRadius:14, padding:14, marginTop:12, border:'1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#1d4ed8', marginBottom:6 }}>💡 EXPLANATION</div>
            <p style={{ fontSize:13, color:'#1e3a5f', lineHeight:1.75, margin:0 }}>{dailyQuestion?.explain}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}
