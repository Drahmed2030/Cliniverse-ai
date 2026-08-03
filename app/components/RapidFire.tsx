'use client'
import { useState, useEffect, useCallback } from 'react'

const QUESTIONS = [
  { q:'First-line vasopressor in septic shock?', opts:['Dopamine','Norepinephrine','Adrenaline','Vasopressin'], a:1, cat:'ICU' },
  { q:'Door-to-balloon time target in STEMI?', opts:['60 min','90 min','120 min','30 min'], a:1, cat:'Cardio' },
  { q:'Antidote for heparin overdose?', opts:['Vitamin K','FFP','Protamine sulfate','Tranexamic acid'], a:2, cat:'Pharm' },
  { q:'Wells score >4 + high HR — next step?', opts:['V/Q scan','D-dimer','CT-PA','Echo'], a:2, cat:'ED' },
  { q:'Glasgow Coma Scale — best verbal response max?', opts:['4','5','6','3'], a:1, cat:'Neuro' },
  { q:'Calcium gluconate is used first in hyperkalaemia because?', opts:['Shifts K+ into cells','Membrane stabilisation','Excretes K+','Blocks aldosterone'], a:1, cat:'Renal' },
  { q:'CURB-65 score 3 — disposition?', opts:['Discharge','Ward','ICU consideration','GP follow-up'], a:2, cat:'Resp' },
  { q:'Which ECG finding is most specific for PE?', opts:['Sinus tachycardia','S1Q3T3','AF','LBBB'], a:1, cat:'Cardio' },
  { q:'Absolute contraindication to tPA in stroke?', opts:['Age >80','AF','Prior ICH','Hypertension'], a:2, cat:'Neuro' },
  { q:'Normal anion gap metabolic acidosis — cause?', opts:['DKA','Lactic acidosis','Diarrhoea','Salicylates'], a:2, cat:'Metabolic' },
  { q:'First-line treatment for anaphylaxis?', opts:['IV hydrocortisone','IM Adrenaline 0.5mg','IV Chlorphenamine','O2 only'], a:1, cat:'ED' },
  { q:'Target SpO2 in COPD exacerbation?', opts:['94-98%','88-92%','>99%','85-90%'], a:1, cat:'Resp' },
  { q:'Commonest cause of community-acquired pneumonia?', opts:['H. influenzae','S. pneumoniae','Mycoplasma','Legionella'], a:1, cat:'ID' },
  { q:'Which diuretic causes hypokalaemia AND hyperuricaemia?', opts:['Spironolactone','Furosemide','Amiloride','Eplerenone'], a:1, cat:'Pharm' },
  { q:'Troponin peaks at what time after MI?', opts:['3-4h','12-24h','48-72h','6h'], a:1, cat:'Cardio' },
  { q:'Treatment of choice for massive PE with haemodynamic instability?', opts:['LMWH','Warfarin','Systemic thrombolysis','Heparin only'], a:2, cat:'Resp' },
  { q:'Which nerve is tested by the knee jerk reflex?', opts:['L2-L3','L3-L4','L4-L5','S1-S2'], a:1, cat:'Neuro' },
  { q:'Normal serum potassium range?', opts:['2.5-3.5','3.5-5.0','5.0-6.5','3.0-4.5'], a:1, cat:'Biochem' },
  { q:'Febrile seizure — LP indicated when?', opts:['Always','Never','Age <12 months or meningism','Age >5 years'], a:2, cat:'Peds' },
  { q:"Beck's triad is associated with?", opts:['Tension pneumothorax','Cardiac tamponade','PE','ARDS'], a:1, cat:'Cardio' },
  { q:'First-line antibiotic for CAP outpatient?', opts:['Co-amoxiclav','Amoxicillin','Doxycycline','Azithromycin'], a:1, cat:'ID' },
  { q:'In DKA, insulin should be started when K+ is?', opts:['>5.5','>3.5','>4.0','>6.0'], a:1, cat:'Endo' },
  { q:'Which sign indicates tension pneumothorax?', opts:['Dullness to percussion','Tracheal deviation away','Bilateral wheeze','Raised JVP only'], a:1, cat:'ED' },
  { q:'Normal PaO2/FiO2 ratio?', opts:['>200','<200','>300','<100'], a:2, cat:'ICU' },
  { q:'Hyponatraemia correction rate — max per 24h?', opts:['4 mEq/L','8 mEq/L','12 mEq/L','20 mEq/L'], a:1, cat:'Renal' },
  { q:'Ottawa Knee Rules — X-ray if?', opts:['Pain only','Age >55 OR inability to weight bear','Swelling only','Tenderness anywhere'], a:1, cat:'Sports' },
  { q:"Which antibody positive in Graves' disease?", opts:['Anti-TPO','Anti-TSH receptor','Anti-thyroglobulin','ANA'], a:1, cat:'Endo' },
  { q:'Loading dose of aspirin in ACS?', opts:['75mg','150mg','300mg','500mg'], a:2, cat:'Cardio' },
  { q:'SOFA score is used to diagnose?', opts:['PE','Sepsis','AKI','ARDS'], a:1, cat:'ICU' },
  { q:'Commonest arrhythmia post cardiac surgery?', opts:['VT','AF','Complete heart block','VF'], a:1, cat:'Cardio' },
]

const TOTAL_TIME = 180

interface Props { onXP:(n:number)=>void }

export default function RapidFire({ onXP }:Props) {
  const [phase, setPhase] = useState<'intro'|'game'|'result'>('intro')
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [qTime, setQTime] = useState(6)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [showStreak, setShowStreak] = useState(false)
  const [cats, setCats] = useState<Record<string,{c:number,t:number}>>({})

  const finish = useCallback((s:number)=>{onXP(Math.round(s*3.5));setPhase('result')},[onXP])

  useEffect(()=>{
    if(phase!=='game')return
    const t=setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(t);finish(score);return 0}return p-1}),1000)
    return()=>clearInterval(t)
  },[phase,score,finish])

  useEffect(()=>{
    if(phase!=='game'||selected!==null)return
    const t=setInterval(()=>setQTime(p=>{if(p<=1){handleAnswer(-1);return 6}return p-1}),1000)
    return()=>clearInterval(t)
  },[phase,qIndex,selected])

  const handleAnswer=(idx:number)=>{
    if(selected!==null)return
    setSelected(idx)
    const correct=idx===QUESTIONS[qIndex].a
    const cat=QUESTIONS[qIndex].cat
    setCats(prev=>({...prev,[cat]:{c:(prev[cat]?.c||0)+(correct?1:0),t:(prev[cat]?.t||0)+1}}))
    if(correct){setScore(p=>p+1);setStreak(p=>{const ns=p+1;setMaxStreak(m=>Math.max(m,ns));if(ns>=3)setShowStreak(true);return ns})}
    else{setStreak(0);setShowStreak(false)}
    setTimeout(()=>{
      setShowStreak(false)
      if(qIndex>=QUESTIONS.length-1){finish(correct?score+1:score)}
      else{setQIndex(p=>p+1);setSelected(null);setQTime(6)}
    },700)
  }

  const accuracy=Math.round((score/Math.max(qIndex+(selected!==null?1:0),1))*100)
  const mins=Math.floor(timeLeft/60),secs=timeLeft%60
  const timerColor=timeLeft<30?'#ff453a':timeLeft<60?'#ff9f0a':'#30d158'
  const q=QUESTIONS[qIndex]

  if(phase==='intro')return(
    <div style={{padding:'0 4px'}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.15),rgba(255,159,10,0.1))',borderRadius:24,padding:28,marginBottom:16,border:'1px solid rgba(255,69,58,0.3)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,fontSize:100,opacity:0.06}}>⚡</div>
        <div style={{fontSize:56,marginBottom:12,filter:'drop-shadow(0 0 20px rgba(255,69,58,0.5))'}}>⚡</div>
        <div style={{fontSize:26,fontWeight:900,color:'var(--text-primary, white)',marginBottom:6,letterSpacing:-0.5}}>Rapid Fire</div>
        <div style={{fontSize:14,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginBottom:20,lineHeight:1.6}}>30 clinical questions · 3 minutes<br/>No second chances</div>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:24}}>
          {[['30','Questions'],['3 min','Time'],['⚡','XP']].map(([v,l])=>(
            <div key={l} style={{background:'rgba(255,255,255,0.88)',borderRadius:14,padding:'12px 16px',border:'1px solid rgba(255,255,255,0.18)'}}>
              <div style={{fontSize:18,fontWeight:900,color:'var(--text-primary, white)'}}>{v}</div>
              <div style={{fontSize:10,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase('game')} style={{background:'linear-gradient(135deg,#ff453a,#ff9f0a)',border:'none',borderRadius:18,padding:'16px 40px',fontSize:17,fontWeight:800,color:'var(--text-primary, white)',cursor:'pointer',width:'100%',boxShadow:'0 8px 32px rgba(255,69,58,0.4)'}}>Start ⚡</button>
      </div>
    </div>
  )

  if(phase==='result'){
    const grade=score>=27?{l:'CONSULTANT',c:'#ffd60a',e:'🌟'}:score>=22?{l:'REGISTRAR',c:'#ff9f0a',e:'🏆'}:score>=15?{l:'SENIOR RESIDENT',c:'#30d158',e:'💪'}:{l:'JUNIOR RESIDENT',c:'#00C4B4',e:'📚'}
    const xp=Math.round(score*3.5)
    const weakCats=Object.entries(cats).filter(([,v])=>v.t>0&&v.c/v.t<0.6).map(([k])=>k)
    const shareText=`🏥 Cliniverse AI — Rapid Fire\n⚡ ${score}/30 · ${accuracy}% accuracy\n🔥 Best streak: ${maxStreak}\n🏅 ${grade.l}\n\ncliniverse-ai-xmev.vercel.app`
    return(
      <div style={{padding:'0 4px'}}>
        <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.97),rgba(25,8,55,0.95))',borderRadius:24,padding:24,marginBottom:14,border:'1px solid rgba(139,92,246,0.3)',textAlign:'center'}}>
          <div style={{fontSize:52,marginBottom:8}}>{grade.e}</div>
          <div style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))',letterSpacing:2,marginBottom:4}}>YOU RANKED AS</div>
          <div style={{fontSize:24,fontWeight:900,color:grade.c,marginBottom:16}}>{grade.l}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20}}>
            {[[`${score}/30`,'Score','#ffd60a'],[`${accuracy}%`,'Accuracy','#30d158'],[`${maxStreak}x`,'Streak','#ff9f0a']].map(([v,l,c])=>(
              <div key={l} style={{background:'var(--bg-card,rgba(255,255,255,0.88))',borderRadius:14,padding:'14px 8px',border:'1px solid rgba(36,63,82,0.60)'}}>
                <div style={{fontSize:22,fontWeight:900,color:c as string}}>{v}</div>
                <div style={{fontSize:10,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(255,214,10,0.1)',borderRadius:16,padding:14,marginBottom:16,border:'1px solid rgba(255,214,10,0.2)'}}>
            <div style={{fontSize:28,fontWeight:900,color:'#ffd60a'}}>+{xp} XP</div>
          </div>
          {weakCats.length>0&&<div style={{background:'rgba(255,69,58,0.08)',borderRadius:14,padding:12,marginBottom:16,border:'1px solid rgba(255,69,58,0.2)',textAlign:'left'}}><div style={{fontSize:11,color:'#ff453a',fontWeight:700,marginBottom:6}}>📚 REVIEW</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{weakCats.map(c=><span key={c} style={{fontSize:11,padding:'3px 10px',borderRadius:10,background:'rgba(255,69,58,0.15)',color:'#ff453a',border:'1px solid rgba(255,69,58,0.2)',fontWeight:600}}>{c}</span>)}</div></div>}
          <button onClick={()=>navigator.share?navigator.share({text:shareText}):navigator.clipboard.writeText(shareText)} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'var(--bg-base,#F7F9FC)',color:'var(--text-primary, white)',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:10}}>📱 Share Score</button>
          <button onClick={()=>{setPhase('intro');setQIndex(0);setSelected(null);setScore(0);setTimeLeft(TOTAL_TIME);setQTime(6);setStreak(0);setMaxStreak(0);setCats({})}} style={{width:'100%',padding:'13px',borderRadius:16,border:'1px solid rgba(0,196,180,0.20)',background:'transparent',color:'var(--text-secondary,rgba(10,22,40,0.55))',fontSize:14,fontWeight:600,cursor:'pointer'}}>Try Again ⚡</button>
        </div>
      </div>
    )
  }

  return(
    <div style={{padding:'0 4px',position:'relative'}}>
      {showStreak&&<div style={{position:'fixed',top:'20%',left:'50%',transform:'translateX(-50%)',zIndex:999,background:'linear-gradient(135deg,#ff9f0a,#ff6b35)',borderRadius:20,padding:'12px 24px',fontSize:18,fontWeight:900,color:'var(--text-primary, white)',boxShadow:'0 8px 32px rgba(255,159,10,0.5)'}}>🔥 {streak} STREAK!</div>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,background:'rgba(255,255,255,0.92)',borderRadius:16,padding:'10px 14px',border:'1px solid rgba(36,63,82,0.65)'}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:timerColor,fontFamily:'monospace'}}>{mins}:{secs.toString().padStart(2,'0')}</div><div style={{fontSize:9,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>TIME</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:'var(--text-primary, white)'}}>{qIndex+1}<span style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>/30</span></div><div style={{fontSize:9,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Q</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:'#30d158'}}>{score}</div><div style={{fontSize:9,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>CORRECT</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:'#ff9f0a'}}>{streak>0?`🔥${streak}`:'-'}</div><div style={{fontSize:9,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>STREAK</div></div>
      </div>
      <div style={{height:3,background:'rgba(255,255,255,0.88)',borderRadius:2,marginBottom:8,overflow:'hidden'}}><div style={{height:'100%',background:'linear-gradient(90deg,#ff453a,#ff9f0a)',width:`${(qIndex/30)*100}%`,borderRadius:2}}/></div>
      <div style={{height:3,background:'rgba(255,255,255,0.88)',borderRadius:2,marginBottom:14,overflow:'hidden'}}><div style={{height:'100%',background:timerColor,width:`${(qTime/6)*100}%`,borderRadius:2,transition:'width 1s linear'}}/></div>
      <div style={{display:'inline-block',fontSize:10,padding:'3px 10px',borderRadius:10,background:'rgba(0,196,180,0.25)',color:'#6ee7e1',border:'1px solid rgba(0,196,180,0.25)',fontWeight:700,marginBottom:12}}>{q.cat}</div>
      <div style={{background:'rgba(255,255,255,0.92)',borderRadius:20,padding:'18px 16px',marginBottom:14,border:'1px solid rgba(36,63,82,0.60)',minHeight:80,display:'flex',alignItems:'center'}}><div style={{fontSize:16,fontWeight:700,color:'var(--text-primary, white)',lineHeight:1.6}}>{q.q}</div></div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {q.opts.map((opt,i)=>{
          const isCorrect=i===q.a,isSelected=i===selected
          let bg='rgba(255,255,255,0.92)',border='1px solid rgba(255,255,255,0.18)',color='rgba(255,255,255,0.85)'
          if(selected!==null){if(isCorrect){bg='rgba(48,209,88,0.15)';border='1.5px solid rgba(48,209,88,0.5)';color='#30d158'}else if(isSelected){bg='rgba(255,69,58,0.15)';border='1.5px solid rgba(255,69,58,0.5)';color='#ff453a'}}
          return(
            <button key={i} onClick={()=>handleAnswer(i)} disabled={selected!==null} style={{background:bg,border,borderRadius:16,padding:'14px 16px',fontSize:14,fontWeight:600,color,textAlign:'left',cursor:selected!==null?'default':'pointer',display:'flex',alignItems:'center',gap:10,transition:'all 0.2s'}}>
              <div style={{width:26,height:26,borderRadius:'50%',background:'rgba(255,255,255,0.88)',border:'1px solid rgba(0,196,180,0.20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>{String.fromCharCode(65+i)}</div>
              {opt}
              {selected!==null&&isCorrect&&<span style={{marginLeft:'auto'}}>✅</span>}
              {selected!==null&&isSelected&&!isCorrect&&<span style={{marginLeft:'auto'}}>❌</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
