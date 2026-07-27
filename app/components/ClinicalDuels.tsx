'use client'
import { useState, useEffect, useCallback } from 'react'

// ── TYPES ──
type DuelPhase = 'lobby' | 'countdown' | 'battle' | 'result'
type PlayerSide = 'A' | 'B'

interface DuelCase {
  id: string
  title: string
  patient: string
  presentation: string
  color: string
  icon: string
  specialty: string
  questions: DuelQuestion[]
}

interface DuelQuestion {
  id: string
  q: string
  opts: string[]
  correct: number
  points: number
  timeLimit: number
  explain: string
}

// ── DUEL CASES ──
const DUEL_CASES: DuelCase[] = [
  {
    id:'stemi_duel', title:'STEMI Protocol', patient:'58M crushing chest pain 40min',
    presentation:'ST elevation V1-V4. BP 88/60. HR 118. Diaphoretic. Known DM, HTN.',
    color:'#ff453a', icon:'🫀', specialty:'Cardiology',
    questions:[
      {id:'q1',q:'First drug to give immediately?',opts:['GTN spray','Aspirin 300mg','Morphine IV','Furosemide IV'],correct:1,points:100,timeLimit:15,explain:'Aspirin 300mg immediately — dual antiplatelet is cornerstone of STEMI management.'},
      {id:'q2',q:'GTN is contraindicated because?',opts:['Tachycardia','SBP < 90','Allergy risk','Age > 50'],correct:1,points:150,timeLimit:12,explain:'GTN contraindicated with SBP < 100 or if inferior STEMI with RV involvement.'},
      {id:'q3',q:'Door-to-balloon target?',opts:['30 min','60 min','90 min','120 min'],correct:2,points:100,timeLimit:10,explain:'AHA 2020: Door-to-balloon < 90 min for primary PCI in STEMI.'},
      {id:'q4',q:'Second antiplatelet to add?',opts:['Clopidogrel 75mg','Ticagrelor 180mg','Warfarin 5mg','Rivaroxaban 20mg'],correct:1,points:200,timeLimit:15,explain:'Ticagrelor 180mg loading dose preferred over clopidogrel (PLATO trial — superior outcomes).'},
      {id:'q5',q:'BP 88/60 — what does this indicate?',opts:['Vasovagal','Cardiogenic shock','Dehydration','Medication effect'],correct:1,points:200,timeLimit:12,explain:'SBP < 90 + STEMI = cardiogenic shock. Needs vasopressors, not fluids alone.'},
    ]
  },
  {
    id:'stroke_duel', title:'Acute Stroke', patient:'67F sudden left hemiplegia',
    presentation:'NIHSS 14. Last seen normal 2h ago. CT: no haemorrhage. AF on warfarin.',
    color:'#0a84ff', icon:'🧠', specialty:'Neurology',
    questions:[
      {id:'q1',q:'First investigation in ED?',opts:['MRI brain','CT head non-contrast','Lumbar puncture','EEG'],correct:1,points:100,timeLimit:15,explain:'CT head non-contrast is fastest — rules out haemorrhage before tPA.'},
      {id:'q2',q:'tPA window in ischaemic stroke?',opts:['1 hour','3 hours','4.5 hours','6 hours'],correct:2,points:150,timeLimit:12,explain:'IV tPA eligible up to 4.5 hours from last known well (selected patients).'},
      {id:'q3',q:'INR result 1.9 — can we give tPA?',opts:['Yes, safe','No, contraindicated','Only half dose','Need repeat test'],correct:1,points:200,timeLimit:12,explain:'INR > 1.7 is absolute contraindication to tPA due to bleeding risk.'},
      {id:'q4',q:'BP target before tPA?',opts:['< 140/90','< 160/100','< 185/110','No target needed'],correct:2,points:150,timeLimit:10,explain:'BP must be < 185/110 before tPA. Use Labetalol IV if needed.'},
      {id:'q5',q:'NIHSS 14 suggests?',opts:['Minor stroke','Moderate stroke','Severe stroke','TIA'],correct:2,points:100,timeLimit:10,explain:'NIHSS > 15 = severe. 5-15 = moderate. < 5 = minor. 14 = moderate-severe.'},
    ]
  },
  {
    id:'sepsis_duel', title:'Septic Shock', patient:'72M fever + hypotension',
    presentation:'Temp 39.8. BP 74/42. HR 136. Lactate 5.2. Source: pneumonia. WBC 28k.',
    color:'#ff9f0a', icon:'🦠', specialty:'Critical Care',
    questions:[
      {id:'q1',q:'First line vasopressor in septic shock?',opts:['Adrenaline','Vasopressin','Norepinephrine','Dobutamine'],correct:2,points:100,timeLimit:15,explain:'Norepinephrine is first-line vasopressor — Surviving Sepsis Campaign 2021.'},
      {id:'q2',q:'Antibiotic timing target in septic shock?',opts:['Within 6 hours','Within 3 hours','Within 1 hour','Within 30 min'],correct:2,points:200,timeLimit:12,explain:'Antibiotics within 1 hour of recognition significantly reduces mortality.'},
      {id:'q3',q:'MAP target with vasopressors?',opts:['> 55 mmHg','> 65 mmHg','> 75 mmHg','> 85 mmHg'],correct:1,points:100,timeLimit:10,explain:'MAP > 65 mmHg is the standard target in septic shock (Surviving Sepsis 2021).'},
      {id:'q4',q:'Lactate 5.2 — what to do next?',opts:['Ignore — not reliable','Repeat in 2 hours','Give bicarbonate','Stop fluids'],correct:1,points:150,timeLimit:12,explain:'Repeat lactate 2h — target clearance > 10%. Lactate-guided resuscitation improves outcomes.'},
      {id:'q5',q:'Hydrocortisone indication in septic shock?',opts:['Always give','Never give','Vasopressor-refractory','Temp > 39'],correct:2,points:200,timeLimit:15,explain:'Hydrocortisone 200mg/day for vasopressor-refractory septic shock (ADRENAL trial).'},
    ]
  },
  {
    id:'pharma_duel', title:'Drug Interaction', patient:'Pharmacist clinical challenge',
    presentation:'75F on Warfarin + Digoxin. Starting Amiodarone for AF. INR was 2.4.',
    color:'#30d158', icon:'💊', specialty:'Pharmacy',
    questions:[
      {id:'q1',q:'Amiodarone + Warfarin interaction?',opts:['No interaction','Decreases INR','Increases INR significantly','No effect'],correct:2,points:150,timeLimit:15,explain:'Amiodarone inhibits CYP2C9 — increases warfarin levels. INR can double or triple!'},
      {id:'q2',q:'Action needed with warfarin dose?',opts:['Increase by 50%','Decrease by 30-50%','Stop warfarin','No change'],correct:1,points:200,timeLimit:12,explain:'Reduce warfarin dose 30-50% when starting amiodarone. Monitor INR closely.'},
      {id:'q3',q:'Amiodarone + Digoxin interaction?',opts:['No interaction','Increases digoxin level','Decreases digoxin','Only affects HR'],correct:1,points:150,timeLimit:12,explain:'Amiodarone inhibits P-gp and renal excretion of digoxin — levels rise 70-100%.'},
      {id:'q4',q:'INR monitoring frequency after starting amiodarone?',opts:['Monthly','Weekly x4 then monthly','Daily','Every 6 months'],correct:1,points:100,timeLimit:10,explain:'Weekly INR for first month when amiodarone added to warfarin — then monthly when stable.'},
      {id:'q5',q:'Half-life of amiodarone?',opts:['6 hours','24 hours','7 days','40-55 days'],correct:3,points:200,timeLimit:15,explain:'Amiodarone has extremely long half-life 40-55 days — effects persist long after stopping.'},
    ]
  },
  {
    id:'peds_duel', title:'Paediatric Emergency', patient:'4yr old seizure + fever',
    presentation:'Temp 39.9°C. Tonic-clonic seizure 6 min ongoing. No prior seizure history.',
    color:'#bf5af2', icon:'🧸', specialty:'Paediatrics',
    questions:[
      {id:'q1',q:'First line treatment for ongoing seizure?',opts:['IV Phenytoin','IM/IV Midazolam','Rectal Diazepam','IV Levetiracetam'],correct:1,points:100,timeLimit:15,explain:'Benzodiazepines first line — IV/IM Midazolam preferred. Buccal midazolam if no IV access.'},
      {id:'q2',q:'Febrile seizure — when to do LP?',opts:['Always in < 18 months','If < 12 months or meningism signs','Never needed','Always after first seizure'],correct:1,points:200,timeLimit:12,explain:'LP if < 12 months, meningism signs, complex febrile seizure, or unwell child — rule out meningitis.'},
      {id:'q3',q:'Status epilepticus definition?',opts:['Seizure > 2 min','Seizure > 5 min','Seizure > 10 min','Seizure > 30 min'],correct:1,points:150,timeLimit:10,explain:'Status epilepticus: seizure > 5 minutes or 2+ seizures without full recovery between them.'},
      {id:'q4',q:'Second line if benzodiazepine fails?',opts:['More diazepam','IV Phenobarbital or Phenytoin','IV Propofol','IM Ketamine'],correct:1,points:200,timeLimit:12,explain:'If benzodiazepines fail after 2 doses: IV Phenobarbital or Phenytoin (fosphenytoin) second line.'},
      {id:'q5',q:'Dose of IV Midazolam in child?',opts:['0.01 mg/kg','0.1 mg/kg','1 mg/kg','5 mg flat dose'],correct:1,points:150,timeLimit:12,explain:'Midazolam 0.1-0.15 mg/kg IV/IM. Max 5mg in children. Repeat once if needed.'},
    ]
  },
]

const C = {
  card: 'rgba(255,255,255,0.07)',
  border: 'rgba(139,92,246,0.15)',
  text: 'white',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

export default function ClinicalDuels({ onXP }: { onXP?: (n:number)=>void }) {
  const [phase, setPhase] = useState<DuelPhase>('lobby')
  const [selectedCase, setSelectedCase] = useState<DuelCase|null>(null)
  const [mode, setMode] = useState<'solo'|'vs'>('solo')
  const [countdown, setCountdown] = useState(3)
  const [qIdx, setQIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [ansA, setAnsA] = useState<number|null>(null)
  const [ansB, setAnsB] = useState<number|null>(null)
  const [streakA, setStreakA] = useState(0)
  const [streakB, setStreakB] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const currentQ = selectedCase?.questions[qIdx]

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { setPhase('battle'); setTimeLeft(currentQ?.timeLimit||15); return }
    const t = setTimeout(() => setCountdown(c => c-1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Timer
  useEffect(() => {
    if (phase !== 'battle') return
    if (timeLeft === 0) { handleTimeout(); return }
    const t = setTimeout(() => setTimeLeft(t => t-1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const startDuel = (c: DuelCase) => {
    setSelectedCase(c); setQIdx(0); setScoreA(0); setScoreB(0)
    setAnsA(null); setAnsB(null); setStreakA(0); setStreakB(0)
    setCorrectCount(0); setShowExplain(false); setCountdown(3)
    setPhase('countdown')
  }

  const handleAnswer = (player: PlayerSide, ansIdx: number) => {
    if (!currentQ) return
    if (player === 'A' && ansA !== null) return
    if (player === 'B' && ansB !== null) return

    const correct = ansIdx === currentQ.correct
    const timeBonus = Math.floor((timeLeft / currentQ.timeLimit) * 50)
    const pts = correct ? currentQ.points + timeBonus : 0

    if (player === 'A') {
      setAnsA(ansIdx)
      if (correct) { setScoreA(s => s+pts); setStreakA(s => s+1) }
      else setStreakA(0)
    } else {
      setAnsB(ansIdx)
      if (correct) { setScoreB(s => s+pts); setStreakB(s => s+1) }
      else setStreakB(0)
    }

    if (correct && player === 'A') setCorrectCount(c => c+1)

    // Auto advance after both answered (vs) or player A answered (solo)
    const bothDone = mode==='vs' ? (player==='A'?ansB!==null:ansA!==null) : true
    if (bothDone || mode==='solo') {
      setShowExplain(true)
      setTimeout(() => {
        if (qIdx < (selectedCase?.questions.length||0)-1) {
          setQIdx(i => i+1)
          setAnsA(null); setAnsB(null)
          setShowExplain(false)
          setTimeLeft(selectedCase?.questions[qIdx+1]?.timeLimit||15)
        } else {
          setPhase('result')
          const earned = Math.round((scoreA+(correct&&player==='A'?pts:0)) / ((selectedCase?.questions.length||1) * 200) * 100)
          onXP && onXP(earned)
        }
      }, 2200)
    }
  }

  const handleTimeout = () => {
    setShowExplain(true)
    setTimeout(() => {
      if (qIdx < (selectedCase?.questions.length||0)-1) {
        setQIdx(i => i+1)
        setAnsA(null); setAnsB(null)
        setShowExplain(false)
        setTimeLeft(selectedCase?.questions[qIdx+1]?.timeLimit||15)
      } else {
        setPhase('result')
      }
    }, 2200)
  }

  // ── LOBBY ──
  if (phase === 'lobby') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(139,92,246,0.1))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(255,69,58,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(255,69,58,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>⚔️ NEW</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Clinical Duels</div>
        <div style={{fontSize:13,color:C.sub,marginBottom:14}}>Race against time — answer faster & score higher</div>
        {/* Mode selector */}
        <div style={{display:'flex',gap:8}}>
          {[{id:'solo',icon:'🧠',label:'Solo Mode'},{id:'vs',icon:'⚔️',label:'VS Mode (2P)'}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id as any)} style={{flex:1,padding:'10px',borderRadius:14,border:mode===m.id?'2px solid #ff453a':'1px solid rgba(255,255,255,0.1)',background:mode===m.id?'rgba(255,69,58,0.15)':C.card,color:mode===m.id?'#ff453a':C.sub,fontSize:12,fontWeight:700,cursor:'pointer'}}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode==='vs'&&(
        <div style={{background:'rgba(255,214,10,0.08)',borderRadius:14,padding:'12px 16px',marginBottom:14,border:'1px solid rgba(255,214,10,0.2)'}}>
          <div style={{fontSize:12,color:'#ffd60a',fontWeight:600}}>⚔️ VS Mode: Two players on same device. Player A taps left options, Player B taps right options — first correct answer wins the round!</div>
        </div>
      )}

      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Choose Your Battle</div>
      {DUEL_CASES.map(c=>(
        <div key={c.id} onClick={()=>startDuel(c)}
          style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${c.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${c.color}10`,display:'flex',alignItems:'center',gap:14,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${c.color}10`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{width:52,height:52,borderRadius:16,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{c.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:3}}>{c.title}</div>
            <div style={{fontSize:11,color:C.sub,marginBottom:6}}>{c.patient}</div>
            <div style={{display:'flex',gap:6}}>
              <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700,border:`1px solid ${c.color}25`}}>{c.specialty}</span>
              <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.12)',color:'#ffd60a',fontWeight:700}}>{c.questions.length} rounds</span>
            </div>
          </div>
          <div style={{fontSize:22,color:`${c.color}60`,flexShrink:0}}>›</div>
        </div>
      ))}
    </div>
  )

  // ── COUNTDOWN ──
  if (phase === 'countdown') return (
    <div style={{fontFamily:'-apple-system,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:400,textAlign:'center'}}>
      <div style={{fontSize:14,color:C.sub,marginBottom:20,fontWeight:600}}>{selectedCase?.icon} {selectedCase?.title}</div>
      <div style={{fontSize:100,fontWeight:900,color:'#ff453a',lineHeight:1,animation:'pulse 1s ease infinite',filter:'drop-shadow(0 0 40px rgba(255,69,58,0.8))'}}>{countdown}</div>
      <div style={{fontSize:16,color:C.sub,marginTop:20}}>Get Ready!</div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
    </div>
  )

  // ── BATTLE ──
  if (phase === 'battle' && selectedCase && currentQ) {
    const c = selectedCase
    const timerPct = (timeLeft / currentQ.timeLimit) * 100
    const timerColor = timerPct > 50 ? '#30d158' : timerPct > 25 ? '#ff9f0a' : '#ff453a'

    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        {/* Scores */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <div style={{flex:1,background:'rgba(10,132,255,0.1)',borderRadius:16,padding:'10px 14px',border:'1px solid rgba(10,132,255,0.2)',textAlign:'center'}}>
            <div style={{fontSize:10,color:'rgba(10,132,255,0.7)',fontWeight:700,marginBottom:2}}>🧠 {mode==='vs'?'PLAYER A':'YOU'}</div>
            <div style={{fontSize:22,fontWeight:900,color:'#0a84ff'}}>{scoreA}</div>
            {streakA>1&&<div style={{fontSize:9,color:'#ffd60a',fontWeight:700}}>🔥 x{streakA} streak</div>}
          </div>

          {/* Timer */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <div style={{width:54,height:54,borderRadius:'50%',background:`conic-gradient(${timerColor} ${timerPct*3.6}deg, rgba(255,255,255,0.05) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 20px ${timerColor}55`}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(15,5,35,1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:18,fontWeight:900,color:timerColor}}>{timeLeft}</div>
              </div>
            </div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700}}>Q{qIdx+1}/{selectedCase.questions.length}</div>
          </div>

          {mode==='vs'&&(
            <div style={{flex:1,background:'rgba(255,69,58,0.1)',borderRadius:16,padding:'10px 14px',border:'1px solid rgba(255,69,58,0.2)',textAlign:'center'}}>
              <div style={{fontSize:10,color:'rgba(255,69,58,0.7)',fontWeight:700,marginBottom:2}}>⚔️ PLAYER B</div>
              <div style={{fontSize:22,fontWeight:900,color:'#ff453a'}}>{scoreB}</div>
              {streakB>1&&<div style={{fontSize:9,color:'#ffd60a',fontWeight:700}}>🔥 x{streakB} streak</div>}
            </div>
          )}
        </div>

        {/* Case context */}
        <div style={{background:`${c.color}10`,borderRadius:16,padding:'12px 14px',marginBottom:12,border:`1px solid ${c.color}25`}}>
          <div style={{fontSize:11,color:c.color,fontWeight:700,marginBottom:3}}>{c.icon} {c.title}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.5}}>{c.presentation}</div>
        </div>

        {/* Question */}
        <div style={{background:C.card,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text,lineHeight:1.6}}>{currentQ.q}</div>
          <div style={{fontSize:11,color:'#ffd60a',fontWeight:700,marginTop:6}}>+{currentQ.points} pts · +{Math.floor(currentQ.timeLimit*0.5*3.33)} speed bonus</div>
        </div>

        {/* Options */}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {currentQ.opts.map((opt,i)=>{
            const doneA = ansA !== null
            const doneB = ansB !== null || mode==='solo'
            const isCorrect = i === currentQ.correct
            let bg = C.card, border = `1px solid ${C.border}`, color: string = C.text

            if (showExplain) {
              if (isCorrect) { bg='rgba(48,209,88,0.15)'; border='2px solid rgba(48,209,88,0.4)'; color='#86efac' }
              else if (i===ansA||i===ansB) { bg='rgba(255,69,58,0.12)'; border='1px solid rgba(255,69,58,0.3)'; color='#fca5a5' }
            }

            return (
              <div key={i} onClick={()=>!showExplain&&handleAnswer('A',i)}
                style={{background:bg,borderRadius:14,padding:'14px 16px',border,cursor:showExplain?'default':'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                <div style={{width:30,height:30,borderRadius:9,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.5)',flexShrink:0}}>
                  {['A','B','C','D'][i]}
                </div>
                <div style={{fontSize:13,color,fontWeight:600,flex:1,lineHeight:1.4}}>{opt}</div>
                {showExplain&&isCorrect&&<span style={{fontSize:16}}>✅</span>}
                {showExplain&&(i===ansA||i===ansB)&&!isCorrect&&<span style={{fontSize:16}}>❌</span>}
              </div>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplain&&(
          <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:'14px',border:'1px solid rgba(10,132,255,0.2)',animation:'fadeIn 0.3s ease'}}>
            <div style={{fontSize:10,color:'#0a84ff',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>💡 EXPLANATION</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>{currentQ.explain}</div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
      </div>
    )
  }

  // ── RESULT ──
  if (phase === 'result' && selectedCase) {
    const winner = mode==='vs' ? (scoreA>scoreB?'A':scoreB>scoreA?'B':'Tie') : null
    const pct = Math.round((correctCount/selectedCase.questions.length)*100)
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{background:'linear-gradient(145deg,rgba(255,214,10,0.12),rgba(139,92,246,0.08))',borderRadius:24,padding:'28px 20px',marginBottom:16,border:'1px solid rgba(255,214,10,0.2)',textAlign:'center',boxShadow:'0 8px 32px rgba(255,214,10,0.1)'}}>
          <div style={{fontSize:60,marginBottom:12,filter:`drop-shadow(0 0 24px ${pct>=80?'rgba(255,214,10,0.6)':'rgba(139,92,246,0.4)'})`}}>
            {mode==='vs'?winner==='A'?'🥇':winner==='B'?'🥈':'🤝':pct>=80?'🏆':pct>=60?'🎖️':'📚'}
          </div>
          {mode==='vs' ? (
            <>
              <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:8}}>{winner==='Tie'?'It\'s a Tie!':winner==='A'?'Player A Wins!':'Player B Wins!'}</div>
              <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:8}}>
                <div style={{textAlign:'center'}}><div style={{fontSize:28,fontWeight:900,color:'#0a84ff'}}>{scoreA}</div><div style={{fontSize:10,color:C.muted}}>Player A</div></div>
                <div style={{fontSize:28,color:C.muted,alignSelf:'center'}}>vs</div>
                <div style={{textAlign:'center'}}><div style={{fontSize:28,fontWeight:900,color:'#ff453a'}}>{scoreB}</div><div style={{fontSize:10,color:C.muted}}>Player B</div></div>
              </div>
            </>
          ) : (
            <>
              <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:4}}>{pct}% Accuracy</div>
              <div style={{fontSize:16,fontWeight:700,color:'#ffd60a',marginBottom:4}}>{scoreA} points</div>
              <div style={{fontSize:13,color:C.sub}}>{correctCount}/{selectedCase.questions.length} correct</div>
            </>
          )}
        </div>

        {/* Specialty badge */}
        <div style={{background:`${selectedCase.color}10`,borderRadius:16,padding:'12px 16px',marginBottom:14,border:`1px solid ${selectedCase.color}25`,display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:32}}>{selectedCase.icon}</div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.text}}>{selectedCase.title}</div>
            <div style={{fontSize:11,color:C.sub}}>{selectedCase.specialty} · {selectedCase.questions.length} questions</div>
          </div>
          <div style={{marginLeft:'auto',textAlign:'right'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#ffd60a'}}>+{Math.round(scoreA/10)} XP</div>
          </div>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>startDuel(selectedCase)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${selectedCase.color}30`,background:`${selectedCase.color}10`,color:selectedCase.color,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Rematch</button>
          <button onClick={()=>setPhase('lobby')} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.4)'}}>⚔️ New Duel</button>
        </div>
      </div>
    )
  }

  return null
}
