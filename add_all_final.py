import os

base = os.path.expanduser('~/cliniverse-ai/app/components')

# ══════════════════════════════════════════
# 1. RAPID FIRE
# ══════════════════════════════════════════
rapid_fire = r"""'use client'
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
        <div style={{fontSize:26,fontWeight:900,color:'white',marginBottom:6,letterSpacing:-0.5}}>Rapid Fire</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',marginBottom:20,lineHeight:1.6}}>30 clinical questions · 3 minutes<br/>No second chances</div>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:24}}>
          {[['30','Questions'],['3 min','Time'],['⚡','XP']].map(([v,l])=>(
            <div key={l} style={{background:'rgba(255,255,255,0.06)',borderRadius:14,padding:'12px 16px',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{fontSize:18,fontWeight:900,color:'white'}}>{v}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase('game')} style={{background:'linear-gradient(135deg,#ff453a,#ff9f0a)',border:'none',borderRadius:18,padding:'16px 40px',fontSize:17,fontWeight:800,color:'white',cursor:'pointer',width:'100%',boxShadow:'0 8px 32px rgba(255,69,58,0.4)'}}>Start ⚡</button>
      </div>
    </div>
  )

  if(phase==='result'){
    const grade=score>=27?{l:'CONSULTANT',c:'#ffd60a',e:'🌟'}:score>=22?{l:'REGISTRAR',c:'#ff9f0a',e:'🏆'}:score>=15?{l:'SENIOR RESIDENT',c:'#30d158',e:'💪'}:{l:'JUNIOR RESIDENT',c:'#0a84ff',e:'📚'}
    const xp=Math.round(score*3.5)
    const weakCats=Object.entries(cats).filter(([,v])=>v.t>0&&v.c/v.t<0.6).map(([k])=>k)
    const shareText=`🏥 Cliniverse AI — Rapid Fire\n⚡ ${score}/30 · ${accuracy}% accuracy\n🔥 Best streak: ${maxStreak}\n🏅 ${grade.l}\n\ncliniverse-ai-xmev.vercel.app`
    return(
      <div style={{padding:'0 4px'}}>
        <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.97),rgba(25,8,55,0.95))',borderRadius:24,padding:24,marginBottom:14,border:'1px solid rgba(139,92,246,0.2)',textAlign:'center'}}>
          <div style={{fontSize:52,marginBottom:8}}>{grade.e}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:2,marginBottom:4}}>YOU RANKED AS</div>
          <div style={{fontSize:24,fontWeight:900,color:grade.c,marginBottom:16}}>{grade.l}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20}}>
            {[[`${score}/30`,'Score','#ffd60a'],[`${accuracy}%`,'Accuracy','#30d158'],[`${maxStreak}x`,'Streak','#ff9f0a']].map(([v,l,c])=>(
              <div key={l} style={{background:'rgba(255,255,255,0.05)',borderRadius:14,padding:'14px 8px',border:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{fontSize:22,fontWeight:900,color:c as string}}>{v}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(255,214,10,0.1)',borderRadius:16,padding:14,marginBottom:16,border:'1px solid rgba(255,214,10,0.2)'}}>
            <div style={{fontSize:28,fontWeight:900,color:'#ffd60a'}}>+{xp} XP</div>
          </div>
          {weakCats.length>0&&<div style={{background:'rgba(255,69,58,0.08)',borderRadius:14,padding:12,marginBottom:16,border:'1px solid rgba(255,69,58,0.2)',textAlign:'left'}}><div style={{fontSize:11,color:'#ff453a',fontWeight:700,marginBottom:6}}>📚 REVIEW</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{weakCats.map(c=><span key={c} style={{fontSize:11,padding:'3px 10px',borderRadius:10,background:'rgba(255,69,58,0.15)',color:'#ff453a',border:'1px solid rgba(255,69,58,0.2)',fontWeight:600}}>{c}</span>)}</div></div>}
          <button onClick={()=>navigator.share?navigator.share({text:shareText}):navigator.clipboard.writeText(shareText)} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#25D366,#128C7E)',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:10}}>📱 Share Score</button>
          <button onClick={()=>{setPhase('intro');setQIndex(0);setSelected(null);setScore(0);setTimeLeft(TOTAL_TIME);setQTime(6);setStreak(0);setMaxStreak(0);setCats({})}} style={{width:'100%',padding:'13px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,cursor:'pointer'}}>Try Again ⚡</button>
        </div>
      </div>
    )
  }

  return(
    <div style={{padding:'0 4px',position:'relative'}}>
      {showStreak&&<div style={{position:'fixed',top:'20%',left:'50%',transform:'translateX(-50%)',zIndex:999,background:'linear-gradient(135deg,#ff9f0a,#ff6b35)',borderRadius:20,padding:'12px 24px',fontSize:18,fontWeight:900,color:'white',boxShadow:'0 8px 32px rgba(255,159,10,0.5)'}}>🔥 {streak} STREAK!</div>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'10px 14px',border:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:timerColor,fontFamily:'monospace'}}>{mins}:{secs.toString().padStart(2,'0')}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>TIME</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:'white'}}>{qIndex+1}<span style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>/30</span></div><div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>Q</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:'#30d158'}}>{score}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>CORRECT</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:'#ff9f0a'}}>{streak>0?`🔥${streak}`:'-'}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>STREAK</div></div>
      </div>
      <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,marginBottom:8,overflow:'hidden'}}><div style={{height:'100%',background:'linear-gradient(90deg,#ff453a,#ff9f0a)',width:`${(qIndex/30)*100}%`,borderRadius:2}}/></div>
      <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,marginBottom:14,overflow:'hidden'}}><div style={{height:'100%',background:timerColor,width:`${(qTime/6)*100}%`,borderRadius:2,transition:'width 1s linear'}}/></div>
      <div style={{display:'inline-block',fontSize:10,padding:'3px 10px',borderRadius:10,background:'rgba(139,92,246,0.15)',color:'#c4b5fd',border:'1px solid rgba(139,92,246,0.25)',fontWeight:700,marginBottom:12}}>{q.cat}</div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:'18px 16px',marginBottom:14,border:'1px solid rgba(255,255,255,0.07)',minHeight:80,display:'flex',alignItems:'center'}}><div style={{fontSize:16,fontWeight:700,color:'white',lineHeight:1.6}}>{q.q}</div></div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {q.opts.map((opt,i)=>{
          const isCorrect=i===q.a,isSelected=i===selected
          let bg='rgba(255,255,255,0.04)',border='1px solid rgba(255,255,255,0.08)',color='rgba(255,255,255,0.85)'
          if(selected!==null){if(isCorrect){bg='rgba(48,209,88,0.15)';border='1.5px solid rgba(48,209,88,0.5)';color='#30d158'}else if(isSelected){bg='rgba(255,69,58,0.15)';border='1.5px solid rgba(255,69,58,0.5)';color='#ff453a'}}
          return(
            <button key={i} onClick={()=>handleAnswer(i)} disabled={selected!==null} style={{background:bg,border,borderRadius:16,padding:'14px 16px',fontSize:14,fontWeight:600,color,textAlign:'left',cursor:selected!==null?'default':'pointer',display:'flex',alignItems:'center',gap:10,transition:'all 0.2s'}}>
              <div style={{width:26,height:26,borderRadius:'50%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0,color:'rgba(255,255,255,0.4)'}}>{String.fromCharCode(65+i)}</div>
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
"""

# ══════════════════════════════════════════
# 2. CARDIAC SURGERY AI
# ══════════════════════════════════════════
cardiac = r"""'use client'
import { useState } from 'react'

const CASES = [
  {
    id:'cabg',icon:'🫀',title:'CABG — Triple Vessel Disease',sub:'68M · EF 35% · CCS III',color:'#ff453a',difficulty:'Advanced',xp:150,
    scenario:'68M, EF 35%, three-vessel CAD (LAD 90%, LCx 80%, RCA 70%). Failed maximal medical therapy. EuroSCORE II 6.2%.',
    vitals:{BP:'138/88',HR:'72 bpm',EF:'35%',EuroSCORE:'6.2%'},
    steps:[
      {title:'Preoperative Assessment',icon:'📋',content:'EuroSCORE II 6.2% — elevated risk. Optimise HbA1c <7.5%, stop antiplatelet 5 days pre-op, echo confirm EF, carotid Doppler. IABP standby if EF <30%.',detail:'Consider hybrid: MIDCAB for LAD + PCI for non-LAD vessels if anatomy suitable. Discuss with Heart Team.'},
      {title:'Cardiopulmonary Bypass',icon:'⚙️',content:'Median sternotomy. Aortic + bicaval cannulation. Cool to 32°C. Antegrade/retrograde cardioplegia. Target ACT >480s. Minimise CPB time <120 min.',detail:'Off-pump CABG (OPCAB) if calcified aorta — avoids aortic manipulation, reduces stroke risk. Requires experienced surgeon.'},
      {title:'Grafting Strategy',icon:'🔪',content:'LITA→LAD (gold standard — 90% patency at 10yr). SVG→LCx, SVG→RCA. Sequential grafting reduces aortic manipulation.',detail:'Bilateral ITA (BITA) improves survival but increases sternal wound infection risk — avoid in diabetics, obese, COPD.'},
      {title:'Weaning from CPB',icon:'📈',content:'Warm to 37°C. Defibrillate if VF. Wean with Dobutamine 5mcg/kg/min if EF <35%. TOE: wall motion, LV function, residual air.',detail:'IABP if unable to wean. LVAD (Impella/ECMO) if refractory low output. Consider VA-ECMO for cardiogenic shock.'},
      {title:'Post-op ICU',icon:'🏥',content:'Target MAP >65, CI >2.2, CVP 8-12. Ventilate 4-6h. Aspirin 100mg at 6h. Watch: AF (30%), bleeding, tamponade, stroke, AKI.',detail:'Fast-track extubation <6h reduces ICU stay. Enhanced recovery: early mobilisation, chest physio, DVT prophylaxis.'},
    ],
    ai_context:'CABG triple vessel EF 35% EuroSCORE LITA LAD SVG CPB cardioplegia OPCAB weaning inotropes IABP'
  },
  {
    id:'tavi',icon:'💠',title:'TAVI vs SAVR — Severe Aortic Stenosis',sub:'78F · AVA 0.6cm² · STS 4.8%',color:'#bf5af2',difficulty:'Expert',xp:180,
    scenario:'78F, severe AS (AVA 0.6cm², gradient 52mmHg). Symptomatic NYHA III. STS 4.8%. Intermediate risk. Frailty score borderline.',
    vitals:{AVA:'0.6 cm²',Gradient:'52 mmHg',STS:'4.8%',NYHA:'Class III'},
    steps:[
      {title:'Heart Team Decision',icon:'👥',content:'MDT: interventional cardiologist + cardiac surgeon mandatory. TAVI preferred: age >75, frailty, hostile chest, porcelain aorta. SAVR: bicuspid, young, unfavourable TAVI anatomy.',detail:'PARTNER 3 & Evolut Low Risk trials: TAVI non-inferior to SAVR in low-risk. Shared decision making with patient essential.'},
      {title:'TAVI Planning',icon:'🎯',content:'CT aorta: annulus sizing, access planning, LMCA height (>12mm needed). Transfemoral if iliac >6mm, minimal calcification. Alternative: transapical, subclavian.',detail:'Annulus sizing: area-derived diameter from CT. Undersizing → paravalvular leak. Oversizing → annular rupture (rare, fatal).'},
      {title:'TAVI Procedure',icon:'🔧',content:'GA or conscious sedation. TOE guidance. Rapid pacing 180bpm for deployment. Post-dilation if PVL >grade 1. Check LMCA perfusion post-deployment.',detail:'Permanent pacemaker risk: 10-25% (CoreValve > Sapien). New LBBB — 48h monitoring. Stroke risk 2-4%.'},
      {title:'Post-TAVI Care',icon:'📊',content:'Echo at 24h. Aspirin + Clopidogrel 3-6 months. Single antiplatelet if high bleeding risk. DOAC if AF. Endocarditis prophylaxis lifelong.',detail:'Valve-in-valve TAVI feasible for degenerated bioprosthesis — plan from outset. TAVI durability: 10-year data now available showing sustained benefit.'},
    ],
    ai_context:'TAVI SAVR aortic stenosis STS Heart Team transfemoral annulus sizing paravalvular leak pacemaker PARTNER Evolut'
  },
]

interface Props { onXP:(n:number)=>void }
export default function CardiacSurgeryAI({onXP}:Props){
  const [view,setView]=useState<'hub'|'case'>('hub')
  const [active,setActive]=useState<typeof CASES[0]|null>(null)
  const [step,setStep]=useState(0)
  const [done,setDone]=useState<string[]>([])
  const [detail,setDetail]=useState(false)
  const [aiQ,setAiQ]=useState(''),aiA=useState(''),aiLoad=useState(false),showAI=useState(false)
  const [aiAnswer,setAiAnswer]=useState(''),aiLoading=useState(false)
  const [showAIPanel,setShowAIPanel]=useState(false)

  const ask=async()=>{
    if(!aiQ.trim()||!active)return
    const [,setL]=aiLoading
    setL(true)
    try{const r=await fetch('/api/generate-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemPrompt:`Expert cardiac surgeon. Answer in 3 sentences. Context: ${active.ai_context}`,userPrompt:aiQ,specialty:'Cardiac Surgery',difficulty:'Expert'})});const d=await r.json();setAiAnswer(d.case?.management?.[0]||'Refer to cardiac surgery guidelines.')}catch{setAiAnswer('Connection error.')}
    setL(false)
  }

  if(view==='hub')return(
    <div style={{padding:'0 4px'}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(191,90,242,0.08))',borderRadius:22,padding:20,marginBottom:16,border:'1px solid rgba(255,69,58,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <div style={{fontSize:40}}>🫀</div>
          <div><div style={{fontSize:20,fontWeight:900,color:'white'}}>Cardiac Surgery AI</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>CABG · Valve · Aortic · Transplant</div></div>
          <div style={{marginLeft:'auto',background:'rgba(255,69,58,0.15)',border:'1px solid rgba(255,69,58,0.3)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:'#ff453a'}}>AI</div>
        </div>
      </div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>{setActive(c);setView('case');setStep(0);setDetail(false)}} style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${c.color}22`,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:15,background:`${c.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{c.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:'white'}}>{c.title}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{c.sub}</div></div>
            {done.includes(c.id)&&<span>✅</span>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700}}>{c.difficulty}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.1)',color:'#ffd60a',fontWeight:700}}>+{c.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  )

  if(!active)return null
  const s=active.steps[step],isLast=step===active.steps.length-1
  return(
    <div style={{padding:'0 4px'}}>
      <button onClick={()=>setView('hub')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 16px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:14,fontWeight:600}}>← Back</button>
      <div style={{background:`linear-gradient(135deg,${active.color}18,rgba(0,0,0,0.3))`,borderRadius:20,padding:18,marginBottom:14,border:`1px solid ${active.color}25`}}>
        <div style={{fontSize:28,marginBottom:4}}>{active.icon}</div>
        <div style={{fontSize:17,fontWeight:900,color:'white',marginBottom:3}}>{active.title}</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:12}}>{active.scenario}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {Object.entries(active.vitals).map(([k,v])=>(
            <div key={k} style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'8px 12px'}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',marginBottom:2}}>{k}</div>
              <div style={{fontSize:13,fontWeight:700,color:'white'}}>{v as string}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto'}}>
        {active.steps.map((_,i)=>(
          <div key={i} onClick={()=>{setStep(i);setDetail(false)}} style={{flexShrink:0,width:36,height:36,borderRadius:12,background:i===step?`${active.color}30`:i<step?'rgba(48,209,88,0.2)':'rgba(255,255,255,0.05)',border:`1.5px solid ${i===step?active.color:i<step?'rgba(48,209,88,0.5)':'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,cursor:'pointer',color:'white'}}>{i<step?'✓':i+1}</div>
        ))}
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${active.color}20`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:11,background:`${active.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
          <div style={{fontSize:15,fontWeight:800,color:'white'}}>{s.title}</div>
        </div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.75,marginBottom:12}}>{s.content}</div>
        <button onClick={()=>setDetail(p=>!p)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'8px 14px',fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer',fontWeight:600}}>{detail?'▲ Hide':'▼ Detail'}</button>
        {detail&&<div style={{marginTop:10,padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:12,fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.7,borderLeft:`3px solid ${active.color}`}}>{s.detail}</div>}
      </div>
      <button onClick={()=>setShowAIPanel(p=>!p)} style={{width:'100%',padding:'12px',borderRadius:16,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>🤖 AI Consultant {showAIPanel?'▲':'▼'}</button>
      {showAIPanel&&(
        <div style={{background:'rgba(15,5,40,0.97)',borderRadius:18,padding:16,marginBottom:12,border:'1px solid rgba(139,92,246,0.2)'}}>
          {aiAnswer&&<div style={{background:'rgba(10,132,255,0.08)',borderRadius:12,padding:12,marginBottom:10,fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}><span style={{fontSize:10,color:'#0a84ff',fontWeight:700,display:'block',marginBottom:4}}>🤖 AI</span>{aiAnswer}</div>}
          <div style={{display:'flex',gap:8}}>
            <input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Ask cardiac surgery question..." style={{flex:1,padding:'11px 14px',borderRadius:13,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:13,outline:'none'}}/>
            <button onClick={ask} style={{width:44,height:44,borderRadius:13,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:18,cursor:'pointer',flexShrink:0}}>→</button>
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:10}}>
        {step>0&&<button onClick={()=>{setStep(p=>p-1);setDetail(false)}} style={{flex:1,padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,cursor:'pointer'}}>← Prev</button>}
        {!isLast?<button onClick={()=>{setStep(p=>p+1);setDetail(false)}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}bb)`,color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>Next →</button>
        :<button onClick={()=>{if(!done.includes(active.id)){setDone(p=>[...p,active.id]);onXP(active.xp)}setView('hub')}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#34d399)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>✅ Complete +{active.xp} XP</button>}
      </div>
    </div>
  )
}
"""

# ══════════════════════════════════════════
# 3. NEUROSURGERY AI
# ══════════════════════════════════════════
neuro = r"""'use client'
import { useState } from 'react'
const CASES=[
  {id:'gbm',icon:'🧠',title:'Glioblastoma — Awake Craniotomy',sub:'54M · GBM Grade IV · Motor cortex',color:'#bf5af2',difficulty:'Expert',xp:180,
    scenario:'54M, seizures + right hand weakness. MRI: 4.5cm ring-enhancing left frontal lesion adjacent to motor cortex. MGMT methylated. KPS 80.',
    vitals:{KPS:'80%',Lesion:'4.5cm',Location:'Left frontal',MGMT:'Methylated'},
    steps:[
      {title:'Preoperative Planning',icon:'🗺️',content:'fMRI + DTI tractography map motor cortex and corticospinal tract. Neuronavigation registration. Awake craniotomy planned for eloquent cortex mapping.',detail:'MGMT methylation predicts TMZ response. IDH1/2, EGFR, TERT — molecular profiling mandatory for WHO 2021 classification.'},
      {title:'Awake Craniotomy',icon:'💬',content:'Asleep-awake-asleep technique. Scalp block with bupivacaine. Direct cortical stimulation 50Hz, 1-20mA. Stop resection at positive motor/language response.',detail:'5-ALA fluorescence: pink tumour vs blue-purple normal brain. Increases extent of resection by 30%. Improves 6-month PFS.'},
      {title:'Intraoperative Tech',icon:'🔬',content:'iMRI for real-time residual detection (positive in 30-40%). CUSA ultrasonic aspirator. Bipolar minimal power near vessels. ICG angiography for vascularity.',detail:'Intraoperative ultrasound: fast, real-time. Elastography emerging. Raman spectroscopy for tumour margin detection — investigational.'},
      {title:'Post-op & Stupp',icon:'🏥',content:'MRI <48h baseline. Dexamethasone taper. Stupp: RT 60Gy + concurrent TMZ → adjuvant TMZ 6 cycles. TTFields (Optune) adds 3-month OS benefit.',detail:'Bevacizumab at recurrence — extends PFS, not OS. Tumour treating fields: 200kHz, scalp electrodes, worn 18h/day. Compliance predicts benefit.'},
    ],
    ai_context:'glioblastoma awake craniotomy 5-ALA iMRI Stupp TMZ TTFields MGMT IDH cortical stimulation fMRI DTI'},
  {id:'sah',icon:'💥',title:'SAH — Ruptured MCA Aneurysm',sub:'49F · Hunt-Hess III · 8mm MCA',color:'#ff453a',difficulty:'Advanced',xp:160,
    scenario:'49F, thunderclap headache, GCS 13, Hunt-Hess III, Fisher 3. CTA: 8mm right MCA bifurcation aneurysm.',
    vitals:{'Hunt-Hess':'III',Fisher:'3',Aneurysm:'8mm MCA',GCS:'13/15'},
    steps:[
      {title:'Emergency Care',icon:'🚨',content:'ICU. Nimodipine 60mg q4h (vasospasm). Target SBP 140-160 pre-securing. Levetiracetam seizure prophylaxis. ICP monitor if GCS <13. Secure within 24h.',detail:'Rebleed risk 20-30% in 24h — highest in 6h. Antifibrinolytics (TXA) controversial — short course (<72h) may reduce rebleed.'},
      {title:'Clip vs Coil',icon:'⚖️',content:'ISAT: coiling superior posterior circulation/poor-grade SAH. Clipping: MCA aneurysm (preferred), young patient, haematoma needing evacuation, wide neck.',detail:'Flow diversion (Pipeline) for giant/fusiform aneurysms. Hybrid: clip + coil for complex cases. Intraoperative angiography essential.'},
      {title:'Microsurgical Clipping',icon:'✂️',content:'Pterional craniotomy. Sylvian fissure dissection. Proximal M1 control. Temporary clip <10min. Permanent clip — ICG + intraoperative angiography confirm occlusion.',detail:'Intraoperative neuromonitoring: MEP, SSEP. EEG if temporary clipping >10min. Papaverine for vessel spasm intraoperatively.'},
      {title:'Vasospasm',icon:'📊',content:'Days 4-14 peak risk. TCD daily. CT perfusion new deficits. Induced hypertension (MAP 90-110). Intra-arterial verapamil/nimodipine if refractory. Angioplasty severe vasospasm.',detail:'Clazosentan (endothelin antagonist) reduces vasospasm but not functional outcome. CONSCIOUS trials negative for OS.'},
    ],
    ai_context:'subarachnoid haemorrhage SAH aneurysm clipping coiling microsurgery nimodipine vasospasm Hunt-Hess pterional craniotomy ICG ISAT'},
]
interface Props{onXP:(n:number)=>void}
export default function NeuroSurgeryAI({onXP}:Props){
  const [view,setView]=useState<'hub'|'case'>('hub')
  const [active,setActive]=useState<typeof CASES[0]|null>(null)
  const [step,setStep]=useState(0),[done,setDone]=useState<string[]>([]),[detail,setDetail]=useState(false)
  const [aiQ,setAiQ]=useState(''),[aiAnswer,setAiAnswer]=useState(''),[showAI,setShowAI]=useState(false)
  const ask=async()=>{if(!aiQ.trim()||!active)return;try{const r=await fetch('/api/generate-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemPrompt:`Expert neurosurgeon. 3 sentences. Context: ${active.ai_context}`,userPrompt:aiQ,specialty:'Neurosurgery',difficulty:'Expert'})});const d=await r.json();setAiAnswer(d.case?.management?.[0]||'Refer to neurosurgical guidelines.')}catch{setAiAnswer('Error.')}}
  if(view==='hub')return(<div style={{padding:'0 4px'}}><div style={{background:'linear-gradient(135deg,rgba(191,90,242,0.12),rgba(10,132,255,0.08))',borderRadius:22,padding:20,marginBottom:16,border:'1px solid rgba(191,90,242,0.2)'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{fontSize:40}}>🧠</div><div><div style={{fontSize:20,fontWeight:900,color:'white'}}>Neurosurgery AI</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Tumour · Aneurysm · Spine · Trauma</div></div><div style={{marginLeft:'auto',background:'rgba(191,90,242,0.15)',border:'1px solid rgba(191,90,242,0.3)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:'#bf5af2'}}>AI</div></div></div>{CASES.map(c=>(<div key={c.id} onClick={()=>{setActive(c);setView('case');setStep(0);setDetail(false)}} style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${c.color}22`,cursor:'pointer'}}><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}><div style={{width:48,height:48,borderRadius:15,background:`${c.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{c.icon}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:'white'}}>{c.title}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{c.sub}</div></div>{done.includes(c.id)&&<span>✅</span>}</div><div style={{display:'flex',gap:8}}><span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700}}>{c.difficulty}</span><span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.1)',color:'#ffd60a',fontWeight:700}}>+{c.xp} XP</span></div></div>))}</div>)
  if(!active)return null
  const s=active.steps[step],isLast=step===active.steps.length-1
  return(<div style={{padding:'0 4px'}}><button onClick={()=>setView('hub')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 16px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:14,fontWeight:600}}>← Back</button><div style={{background:`linear-gradient(135deg,${active.color}18,rgba(0,0,0,0.3))`,borderRadius:20,padding:18,marginBottom:14,border:`1px solid ${active.color}25`}}><div style={{fontSize:28,marginBottom:4}}>{active.icon}</div><div style={{fontSize:17,fontWeight:900,color:'white',marginBottom:3}}>{active.title}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:12}}>{active.scenario}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{Object.entries(active.vitals).map(([k,v])=>(<div key={k} style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'8px 12px'}}><div style={{fontSize:9,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:700,color:'white'}}>{v as string}</div></div>))}</div></div><div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto'}}>{active.steps.map((_,i)=>(<div key={i} onClick={()=>{setStep(i);setDetail(false)}} style={{flexShrink:0,width:36,height:36,borderRadius:12,background:i===step?`${active.color}30`:i<step?'rgba(48,209,88,0.2)':'rgba(255,255,255,0.05)',border:`1.5px solid ${i===step?active.color:i<step?'rgba(48,209,88,0.5)':'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,cursor:'pointer',color:'white'}}>{i<step?'✓':i+1}</div>))}</div><div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${active.color}20`}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><div style={{width:36,height:36,borderRadius:11,background:`${active.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div><div style={{fontSize:15,fontWeight:800,color:'white'}}>{s.title}</div></div><div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.75,marginBottom:12}}>{s.content}</div><button onClick={()=>setDetail(p=>!p)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'8px 14px',fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer',fontWeight:600}}>{detail?'▲ Hide':'▼ Detail'}</button>{detail&&<div style={{marginTop:10,padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:12,fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.7,borderLeft:`3px solid ${active.color}`}}>{s.detail}</div>}</div><button onClick={()=>setShowAI(p=>!p)} style={{width:'100%',padding:'12px',borderRadius:16,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>🤖 AI Consultant {showAI?'▲':'▼'}</button>{showAI&&(<div style={{background:'rgba(15,5,40,0.97)',borderRadius:18,padding:16,marginBottom:12,border:'1px solid rgba(139,92,246,0.2)'}}>{aiAnswer&&<div style={{background:'rgba(10,132,255,0.08)',borderRadius:12,padding:12,marginBottom:10,fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}>{aiAnswer}</div>}<div style={{display:'flex',gap:8}}><input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Ask neurosurgery question..." style={{flex:1,padding:'11px 14px',borderRadius:13,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:13,outline:'none'}}/><button onClick={ask} style={{width:44,height:44,borderRadius:13,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:18,cursor:'pointer',flexShrink:0}}>→</button></div></div>)}<div style={{display:'flex',gap:10}}>{step>0&&<button onClick={()=>{setStep(p=>p-1);setDetail(false)}} style={{flex:1,padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,cursor:'pointer'}}>← Prev</button>}{!isLast?<button onClick={()=>{setStep(p=>p+1);setDetail(false)}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}bb)`,color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>Next →</button>:<button onClick={()=>{if(!done.includes(active.id)){setDone(p=>[...p,active.id]);onXP(active.xp)}setView('hub')}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#34d399)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>✅ Complete +{active.xp} XP</button>}</div></div>)
}
"""

# ══════════════════════════════════════════
# 4. GENERAL SURGERY AI
# ══════════════════════════════════════════
general = r"""'use client'
import { useState } from 'react'
const CASES=[
  {id:'perf_du',icon:'🔪',title:'Perforated Duodenal Ulcer',sub:'42M · Peritonitis · Free air',color:'#ff9f0a',difficulty:'Advanced',xp:130,
    scenario:'42M, 6h severe epigastric pain, rigid abdomen, peritonitis. CXR: free air. HR 118, BP 98/68. H. pylori positive.',
    vitals:{BP:'98/68',HR:'118 bpm',Signs:'Peritonitis',CXR:'Free air'},
    steps:[
      {title:'Resuscitation',icon:'💧',content:'2 large-bore IVs. Crystalloid 500ml bolus. Catheter, NGT. IV PPI omeprazole 80mg. Sepsis 6: cultures, Tazocin 4.5g + metro 500mg IV, fluids, lactate, UO, O2.',detail:'Boey score: shock + comorbidity + late presentation. Score 3 = very high mortality. Guides operative risk discussion.'},
      {title:'Laparoscopic vs Open',icon:'⚖️',content:'Laparoscopic: <24h, stable, experienced surgeon. Open: haemodynamically unstable, widespread contamination, failed laparoscopic. Boey score guides consent.',detail:'Laparoscopic perforation repair: evidence from LAMA trial. Comparable outcomes in experienced hands. Conversion rate 5-12%.'},
      {title:'Graham Patch',icon:'✂️',content:'Identify perforation — anterior DU 95%. Vicryl sutures through edges. Mobilise omentum. Secure over defect. Saline leak test. Peritoneal lavage 4-6L warm saline.',detail:'Avoid primary closure under tension. If friable tissue, omental plug sutured in. Highly selective vagotomy no longer routinely performed.'},
      {title:'Post-op',icon:'🏥',content:'ICU/HDU 24-48h. IV antibiotics 3-5 days if peritonitis. Early enteral feeding. H. pylori eradication at discharge — triple therapy. PPI lifelong.',detail:'Complications: intra-abdominal abscess (CT-guided drain), ileus, leak. Mortality 5-10%, increases with delay and comorbidity.'},
    ],
    ai_context:'perforated duodenal ulcer Graham patch laparoscopic peritonitis Boey score H pylori peritoneal lavage damage control'},
  {id:'lap_colon',icon:'🩺',title:'Laparoscopic Anterior Resection',sub:'65F · Sigmoid Ca · T3N1M0',color:'#30d158',difficulty:'Advanced',xp:140,
    scenario:'65F, sigmoid adenocarcinoma T3N1M0. CEA 18. MDT: laparoscopic anterior resection with TME.',
    vitals:{Staging:'T3N1M0',CEA:'18 ng/mL',Approach:'Laparoscopic',TME:'Required'},
    steps:[
      {title:'MDT & ERAS',icon:'👥',content:'Colorectal MDT planning. CT CAP staging. MRI rectum if low sigmoid. ERAS: carb loading, no prolonged fast, multimodal analgesia, early mobilisation.',detail:'Stoma nurse preop marking mandatory. Bowel prep: mechanical + oral antibiotics reduces SSI. Carbohydrate drink 2h pre-op.'},
      {title:'Laparoscopic Technique',icon:'📹',content:'Lloyd-Davies position. 4-5 ports. Medial-to-lateral: IMA ligation at origin (D2). Identify left ureter + gonadal vessels. Mobilise splenic flexure if needed.',detail:'Critical: preserve hypogastric nerves for sexual/bladder function. IMA flush ligation — adequate lymph node harvest (D3 for right colon).'},
      {title:'Total Mesorectal Excision',icon:'🔬',content:'Sharp dissection in holy plane. CRM target >1mm. Distal margin >2cm. Specimen assessment on back table. Frozen section if CRM concern.',detail:'CRM involvement = local recurrence risk 3-4x. Laparoscopic TME: equivalent oncological outcomes to open (COLOR II, CLASICC trials).'},
      {title:'ERAS Recovery',icon:'⚡',content:'Day 0: remove catheter, mobilise, oral fluids. Day 1: solid food, remove NGT. Target discharge day 2-3. Loop ileostomy if low anastomosis, steroid use, malnutrition.',detail:'Anastomotic leak day 3-7: fever, tachycardia, peritonism. CT diagnosis. Washout + proximal diversion or Hartmann if severe.'},
    ],
    ai_context:'colorectal cancer sigmoid anterior resection TME IMA ligation ERAS CRM anastomosis stapled ileostomy laparoscopic COLOR CLASICC'},
]
interface Props{onXP:(n:number)=>void}
export default function GeneralSurgeryAI({onXP}:Props){
  const [view,setView]=useState<'hub'|'case'>('hub')
  const [active,setActive]=useState<typeof CASES[0]|null>(null)
  const [step,setStep]=useState(0),[done,setDone]=useState<string[]>([]),[detail,setDetail]=useState(false)
  const [aiQ,setAiQ]=useState(''),[aiAnswer,setAiAnswer]=useState(''),[showAI,setShowAI]=useState(false)
  const ask=async()=>{if(!aiQ.trim()||!active)return;try{const r=await fetch('/api/generate-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemPrompt:`Expert general surgeon. 3 sentences. Context: ${active.ai_context}`,userPrompt:aiQ,specialty:'General Surgery',difficulty:'Advanced'})});const d=await r.json();setAiAnswer(d.case?.management?.[0]||'Refer to surgical guidelines.')}catch{setAiAnswer('Error.')}}
  if(view==='hub')return(<div style={{padding:'0 4px'}}><div style={{background:'linear-gradient(135deg,rgba(255,159,10,0.12),rgba(48,209,88,0.08))',borderRadius:22,padding:20,marginBottom:16,border:'1px solid rgba(255,159,10,0.2)'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{fontSize:40}}>🔪</div><div><div style={{fontSize:20,fontWeight:900,color:'white'}}>General Surgery AI</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Acute Abdomen · Colorectal · HPB · Laparoscopic</div></div><div style={{marginLeft:'auto',background:'rgba(255,159,10,0.15)',border:'1px solid rgba(255,159,10,0.3)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:'#ff9f0a'}}>AI</div></div></div>{CASES.map(c=>(<div key={c.id} onClick={()=>{setActive(c);setView('case');setStep(0);setDetail(false)}} style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${c.color}22`,cursor:'pointer'}}><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}><div style={{width:48,height:48,borderRadius:15,background:`${c.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{c.icon}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:'white'}}>{c.title}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{c.sub}</div></div>{done.includes(c.id)&&<span>✅</span>}</div><div style={{display:'flex',gap:8}}><span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700}}>{c.difficulty}</span><span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.1)',color:'#ffd60a',fontWeight:700}}>+{c.xp} XP</span></div></div>))}</div>)
  if(!active)return null
  const s=active.steps[step],isLast=step===active.steps.length-1
  return(<div style={{padding:'0 4px'}}><button onClick={()=>setView('hub')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 16px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:14,fontWeight:600}}>← Back</button><div style={{background:`linear-gradient(135deg,${active.color}18,rgba(0,0,0,0.3))`,borderRadius:20,padding:18,marginBottom:14,border:`1px solid ${active.color}25`}}><div style={{fontSize:28,marginBottom:4}}>{active.icon}</div><div style={{fontSize:17,fontWeight:900,color:'white',marginBottom:3}}>{active.title}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:12}}>{active.scenario}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{Object.entries(active.vitals).map(([k,v])=>(<div key={k} style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'8px 12px'}}><div style={{fontSize:9,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:700,color:'white'}}>{v as string}</div></div>))}</div></div><div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto'}}>{active.steps.map((_,i)=>(<div key={i} onClick={()=>{setStep(i);setDetail(false)}} style={{flexShrink:0,width:36,height:36,borderRadius:12,background:i===step?`${active.color}30`:i<step?'rgba(48,209,88,0.2)':'rgba(255,255,255,0.05)',border:`1.5px solid ${i===step?active.color:i<step?'rgba(48,209,88,0.5)':'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,cursor:'pointer',color:'white'}}>{i<step?'✓':i+1}</div>))}</div><div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${active.color}20`}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><div style={{width:36,height:36,borderRadius:11,background:`${active.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div><div style={{fontSize:15,fontWeight:800,color:'white'}}>{s.title}</div></div><div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.75,marginBottom:12}}>{s.content}</div><button onClick={()=>setDetail(p=>!p)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'8px 14px',fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer',fontWeight:600}}>{detail?'▲ Hide':'▼ Detail'}</button>{detail&&<div style={{marginTop:10,padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:12,fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.7,borderLeft:`3px solid ${active.color}`}}>{s.detail}</div>}</div><button onClick={()=>setShowAI(p=>!p)} style={{width:'100%',padding:'12px',borderRadius:16,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>🤖 AI Consultant {showAI?'▲':'▼'}</button>{showAI&&(<div style={{background:'rgba(15,5,40,0.97)',borderRadius:18,padding:16,marginBottom:12,border:'1px solid rgba(139,92,246,0.2)'}}>{aiAnswer&&<div style={{background:'rgba(10,132,255,0.08)',borderRadius:12,padding:12,marginBottom:10,fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}>{aiAnswer}</div>}<div style={{display:'flex',gap:8}}><input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Ask surgical question..." style={{flex:1,padding:'11px 14px',borderRadius:13,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:13,outline:'none'}}/><button onClick={ask} style={{width:44,height:44,borderRadius:13,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:18,cursor:'pointer',flexShrink:0}}>→</button></div></div>)}<div style={{display:'flex',gap:10}}>{step>0&&<button onClick={()=>{setStep(p=>p-1);setDetail(false)}} style={{flex:1,padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,cursor:'pointer'}}>← Prev</button>}{!isLast?<button onClick={()=>{setStep(p=>p+1);setDetail(false)}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}bb)`,color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>Next →</button>:<button onClick={()=>{if(!done.includes(active.id)){setDone(p=>[...p,active.id]);onXP(active.xp)}setView('hub')}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#34d399)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>✅ Complete +{active.xp} XP</button>}</div></div>)
}
"""

# ══════════════════════════════════════════
# 5. CLINICAL NEXUS — THE GRAND FINALE
# ══════════════════════════════════════════
nexus = r"""'use client'
import { useState, useEffect, useCallback } from 'react'

const CASES = [
  {
    id:'nexus1', title:'The Collapsing Patient', tag:'GLOBAL EMERGENCY',
    color:'#ff453a', glow:'rgba(255,69,58,0.5)',
    intro:'03:47 AM. A 52-year-old male collapses in the hospital corridor. You are the first physician on scene. 847 doctors worldwide are watching this case right now.',
    timeline:[
      {time:'00:00',event:'Collapse witnessed. No pulse. Call for help.',vital:{hr:'0',bp:'0/0',spo2:'0%',rr:'0'},ecg:'Ventricular Fibrillation',question:'Your FIRST action?',opts:['Start CPR immediately','Check pulse for 10 seconds','Get defibrillator first','Call ICU'],correct:0,explain:'CPR first — minimize interruptions. Every 10s delay = 10% survival reduction.',globalVote:[67,8,18,7]},
      {time:'02:00',event:'CPR ongoing. AED arrives.',vital:{hr:'0',bp:'0/0',spo2:'0%',rr:'0'},ecg:'VF persists — coarse',question:'AED shows shockable rhythm. CPR quality good. Next?',opts:['Shock immediately','2 more minutes CPR','Adrenaline first','Amiodarone first'],correct:0,explain:'Shock immediately when rhythm identified — minimize pre-shock pause <5s.',globalVote:[72,10,12,6]},
      {time:'04:30',event:'ROSC achieved. GCS 8. Intubated.',vital:{hr:'98',bp:'82/50',spo2:'94%',rr:'14 (ventilated)'},ecg:'Sinus tachycardia. ST elevation II/III/aVF',question:'BP 82/50, ST elevation inferior leads. Priority?',opts:['Cath Lab activation + vasopressor','CT brain first','High-dose steroids','Therapeutic hypothermia only'],correct:0,explain:'Inferior STEMI post-arrest: immediate cath lab. Norepinephrine for haemodynamic support. Targeted temperature management 36°C.',globalVote:[58,22,4,16]},
      {time:'12:00',event:'Post-cath: RCA stented. ICU. TTM 36°C.',vital:{hr:'72',bp:'108/68',spo2:'98%',rr:'14'},ecg:'Normal sinus rhythm. Q waves III/aVF',question:'24h post-arrest. GCS improving. Family asks about prognosis. Best indicator?',opts:['EEG at 24-48h + SSEP at 72h','CT head immediately','Pupil reflexes alone','Withdraw care at 24h'],correct:0,explain:'Neuroprognostication: multimodal — EEG (burst suppression/seizures), SSEP (N20 absence bilateral = poor), pupillary reactivity, MRI at 5 days. Never single indicator.',globalVote:[61,19,9,11]},
    ],
    outcome:'Excellent neurological recovery. Patient discharged day 12, mRS 1. Back to work at 3 months. This outcome is achieved in only 8% of out-of-hospital cardiac arrests globally.',
    keyLearning:['Minimise CPR interruptions — survival falls 10% per 10s delay','Post-arrest: treat the cause (STEMI) simultaneously with supportive care','Neuroprognostication requires multimodal assessment after 72h — never single indicator','Targeted temperature management 36°C equivalent to 33°C (TTM2 trial)'],
  },
  {
    id:'nexus2', title:'The Silent Killer', tag:'DIAGNOSTIC CHALLENGE',
    color:'#bf5af2', glow:'rgba(191,90,242,0.5)',
    intro:'A 34-year-old previously fit female presents with 3 weeks of fatigue. Refused by two GPs. You have 5 minutes. 1,204 doctors worldwide are trying to crack this case.',
    timeline:[
      {time:'Week 3',event:'Fatigue, mild dyspnea, no fever.',vital:{hr:'102',bp:'94/60',spo2:'97%',rr:'18'},ecg:'Sinus tachycardia. Low voltage.',question:'Most discriminating next investigation?',opts:['Echo','D-dimer','Full blood count','Thyroid function'],correct:0,explain:'Low voltage ECG + tachycardia + young female = cardiac tamponade until proven otherwise. Echo is diagnostic.',globalVote:[44,22,28,6]},
      {time:'Echo result',event:'Echo: 3cm circumferential effusion. RV collapse in diastole.',vital:{hr:'118',bp:'88/72',spo2:'95%',rr:'22'},ecg:'Electrical alternans',question:"Beck's triad present. Pulsus paradoxus 22mmHg. Action?",opts:['Emergency pericardiocentesis','IV fluids + watch','Steroids for pericarditis','CT chest first'],correct:0,explain:'Tamponade = obstructive shock. Pericardiocentesis emergent. Cautious IVF as bridge. Echo-guided preferred.',globalVote:[79,11,6,4]},
      {time:'Post-drain',event:'800ml haemoserous fluid drained. BP 112/70. Send fluid.',vital:{hr:'88',bp:'112/70',spo2:'99%',rr:'16'},ecg:'Resolving alternans',question:'Pericardial fluid: haemoserous, LDH high, glucose low, cytology pending. Most likely cause in this age group?',opts:['Malignancy','TB','Viral','Autoimmune'],correct:0,explain:'Haemoserous effusion in young female: malignancy #1 (breast, lymphoma, lung). TB in endemic areas. Send: cytology, culture, ADA, flow cytometry.',globalVote:[52,28,14,6]},
      {time:'Day 5',event:'Cytology: adenocarcinoma cells. CT: bilateral breast mass.',vital:{hr:'76',bp:'118/74',spo2:'99%',rr:'16'},ecg:'Normal sinus rhythm',question:'Stage IV breast cancer with cardiac tamponade. Oncology next step?',opts:['Biopsy + molecular profiling first','Chemotherapy immediately','Palliative care only','Surgery on primary first'],correct:0,explain:'Molecular profiling (HER2, ER/PR, PD-L1) directs therapy. HER2+: trastuzumab. ER+: endocrine therapy. TNBC: chemo ± immunotherapy. Biopsy first always.',globalVote:[68,19,8,5]},
    ],
    outcome:'HER2-positive metastatic breast cancer. Commenced trastuzumab + pertuzumab + docetaxel. PFS 18 months. Cardiac monitoring — LVEF maintained. Still on treatment at 2 years.',
    keyLearning:['Low voltage ECG + young female = tamponade until proven otherwise','Never attribute tachycardia to anxiety in a young patient without excluding cardiac cause','Haemoserous pericardial effusion in young female: malignancy #1','Molecular profiling precedes treatment in metastatic cancer — always'],
  },
]

interface Props { onXP:(n:number)=>void }

export default function ClinicalNexus({ onXP }:Props) {
  const [phase, setPhase] = useState<'hub'|'intro'|'case'|'outcome'>('hub')
  const [active, setActive] = useState<typeof CASES[0]|null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [showGlobal, setShowGlobal] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [viewers, setViewers] = useState(847)
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(()=>{
    const t=setInterval(()=>{
      setPulse(p=>(p+1)%3)
      setViewers(v=>v+Math.floor(Math.random()*3)-1)
    },2000)
    return()=>clearInterval(t)
  },[])

  if(phase==='hub') return(
    <div style={{padding:'0 4px'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.98),rgba(25,8,55,0.95))',borderRadius:24,padding:24,marginBottom:16,border:'1px solid rgba(139,92,246,0.3)',position:'relative',overflow:'hidden',boxShadow:'0 12px 48px rgba(139,92,246,0.2)'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-30,left:-30,width:150,height:150,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.15),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 12px #ff453a',animation:pulse===0?'none':'none',opacity:pulse===0?1:0.4,transition:'opacity 0.5s'}}/>
          <span style={{fontSize:11,color:'#ff453a',fontWeight:800,letterSpacing:2}}>LIVE WORLDWIDE</span>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginLeft:'auto'}}>{viewers.toLocaleString()} doctors online</span>
        </div>

        <div style={{fontSize:13,color:'rgba(139,92,246,0.8)',fontWeight:700,letterSpacing:2,marginBottom:8,textTransform:'uppercase'}}>Clinical Nexus</div>
        <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.8,marginBottom:8,lineHeight:1.1}}>The Global<br/>Medical Room</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:20}}>Real cases. Real decisions. Real doctors worldwide — voting on the same patient, same time. See how you compare to the global medical community.</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20}}>
          {[['🌍','Global votes','Real-time'],['🤖','AI Attending','Comments live'],['📊','Your rank','vs world']].map(([i,t,s])=>(
            <div key={t} style={{background:'rgba(255,255,255,0.05)',borderRadius:14,padding:'12px 8px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{fontSize:22,marginBottom:4}}>{i}</div>
              <div style={{fontSize:11,fontWeight:700,color:'white'}}>{t}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cases */}
      <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',letterSpacing:2,fontWeight:700,marginBottom:10}}>ACTIVE CASES</div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>{setActive(c);setPhase('intro');setStepIdx(0);setSelected(null);setTotalScore(0);setShowExplain(false);setShowGlobal(false)}}
          style={{background:`linear-gradient(135deg,${c.color}10,rgba(0,0,0,0.3))`,borderRadius:22,padding:20,marginBottom:14,border:`1px solid ${c.color}30`,cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:`0 8px 32px ${c.color}15`}}>
          <div style={{position:'absolute',top:-20,right:-20,fontSize:80,opacity:0.05}}>🌍</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:c.color,boxShadow:`0 0 8px ${c.color}`,flexShrink:0}}/>
            <span style={{fontSize:10,color:c.color,fontWeight:800,letterSpacing:1}}>{c.tag}</span>
            <span style={{marginLeft:'auto',fontSize:11,color:'rgba(255,255,255,0.3)'}}>{viewers+Math.floor(Math.random()*200)} watching</span>
          </div>
          <div style={{fontSize:19,fontWeight:900,color:'white',marginBottom:6,letterSpacing:-0.3}}>{c.title}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.6,marginBottom:14}}>{c.intro.substring(0,120)}...</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:8}}>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,background:`${c.color}15`,color:c.color,fontWeight:700,border:`1px solid ${c.color}25`}}>4 decisions</span>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,background:'rgba(255,214,10,0.1)',color:'#ffd60a',fontWeight:700}}>+200 XP</span>
            </div>
            {completed.includes(c.id)&&<span style={{fontSize:18}}>✅</span>}
          </div>
        </div>
      ))}
    </div>
  )

  if(phase==='intro'&&active) return(
    <div style={{padding:'0 4px'}}>
      <button onClick={()=>setPhase('hub')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 16px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:16,fontWeight:600}}>← Back</button>
      <div style={{background:`linear-gradient(145deg,${active.color}12,rgba(10,0,21,0.95))`,borderRadius:24,padding:24,marginBottom:16,border:`1px solid ${active.color}25`,position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 10px #ff453a'}}/>
          <span style={{fontSize:10,color:'#ff453a',fontWeight:800,letterSpacing:2}}>LIVE · {viewers.toLocaleString()} DOCTORS ONLINE</span>
        </div>
        <div style={{fontSize:13,color:active.color,fontWeight:700,letterSpacing:1,marginBottom:8}}>{active.tag}</div>
        <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:14,letterSpacing:-0.5}}>{active.title}</div>
        <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:16,border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.8}}>{active.intro}</div>
        </div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:16,marginBottom:16,border:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,marginBottom:10,fontWeight:700}}>YOUR CHALLENGE</div>
        {['Make 4 critical decisions in real-time','See how the global medical community voted','AI Attending reveals what actually happened','Your decisions affect the patient outcome'].map((t,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:`${active.color}20`,border:`1px solid ${active.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:active.color,flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:1.5}}>{t}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>setPhase('case')} style={{width:'100%',padding:'17px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}aa)`,color:'white',fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:`0 8px 32px ${active.glow}`}}>
        🌍 Enter the Global Room →
      </button>
    </div>
  )

  if(phase==='case'&&active){
    const step=active.timeline[stepIdx]
    const isLast=stepIdx===active.timeline.length-1
    const vitalAlert=(v:string)=>parseFloat(v)===0||parseFloat(v)<80

    return(
      <div style={{padding:'0 4px'}}>
        {/* Live header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,background:'rgba(255,69,58,0.08)',borderRadius:16,padding:'10px 14px',border:'1px solid rgba(255,69,58,0.2)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 8px #ff453a'}}/>
            <span style={{fontSize:11,color:'#ff453a',fontWeight:800}}>LIVE</span>
          </div>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{viewers.toLocaleString()} watching · Decision {stepIdx+1}/4</span>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:600}}>⏰ {step.time}</span>
        </div>

        {/* Event */}
        <div style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:16,marginBottom:12,border:'1px solid rgba(255,255,255,0.07)'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,marginBottom:6,fontWeight:700}}>SITUATION UPDATE</div>
          <div style={{fontSize:15,fontWeight:700,color:'white',lineHeight:1.6}}>{step.event}</div>
        </div>

        {/* Vitals */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
          {Object.entries(step.vital).map(([k,v])=>(
            <div key={k} style={{background:vitalAlert(v as string)?'rgba(255,69,58,0.15)':'rgba(255,255,255,0.05)',borderRadius:14,padding:'10px 6px',textAlign:'center',border:vitalAlert(v as string)?'1px solid rgba(255,69,58,0.4)':'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{fontSize:9,color:vitalAlert(v as string)?'#ff453a':'rgba(255,255,255,0.35)',textTransform:'uppercase',marginBottom:3,fontWeight:700}}>{k}</div>
              <div style={{fontSize:13,fontWeight:900,color:vitalAlert(v as string)?'#ff453a':'white'}}>{v as string}</div>
            </div>
          ))}
        </div>

        {/* ECG */}
        <div style={{background:'rgba(48,209,88,0.06)',borderRadius:14,padding:'10px 14px',marginBottom:14,border:'1px solid rgba(48,209,88,0.15)'}}>
          <span style={{fontSize:10,color:'#30d158',fontWeight:700,letterSpacing:1}}>⚡ ECG: </span>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>{step.ecg}</span>
        </div>

        {/* Question */}
        <div style={{background:`linear-gradient(135deg,${active.color}12,rgba(0,0,0,0.2))`,borderRadius:18,padding:16,marginBottom:14,border:`1px solid ${active.color}20`}}>
          <div style={{fontSize:10,color:active.color,fontWeight:800,letterSpacing:1,marginBottom:8}}>🌍 GLOBAL DECISION — {viewers.toLocaleString()} DOCTORS DECIDING</div>
          <div style={{fontSize:15,fontWeight:700,color:'white',lineHeight:1.6}}>{step.question}</div>
        </div>

        {/* Options */}
        {!selected && !showExplain && (
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
            {step.opts.map((opt,i)=>(
              <button key={i} onClick={()=>{setSelected(i);if(i===step.correct)setTotalScore(p=>p+1);setShowExplain(true)}}
                style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'14px 16px',fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.85)',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'rgba(255,255,255,0.4)',flexShrink:0}}>{String.fromCharCode(65+i)}</div>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {showExplain && selected !== null && (
          <div style={{marginBottom:14}}>
            {step.opts.map((opt,i)=>{
              const isCorrect=i===step.correct,isSelected=i===selected
              return(
                <div key={i} style={{background:isCorrect?'rgba(48,209,88,0.12)':isSelected?'rgba(255,69,58,0.12)':'rgba(255,255,255,0.03)',border:`1.5px solid ${isCorrect?'rgba(48,209,88,0.5)':isSelected?'rgba(255,69,58,0.4)':'rgba(255,255,255,0.06)'}`,borderRadius:14,padding:'12px 14px',marginBottom:8,fontSize:13,display:'flex',alignItems:'center',gap:10,color:isCorrect?'#30d158':isSelected?'#ff453a':'rgba(255,255,255,0.5)'}}>
                  <span style={{fontWeight:800}}>{String.fromCharCode(65+i)}.</span>
                  <span style={{flex:1}}>{opt}</span>
                  {isCorrect&&<span>✅</span>}{isSelected&&!isCorrect&&<span>❌</span>}
                </div>
              )
            })}

            {/* Explanation */}
            <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:14,marginBottom:12,border:'1px solid rgba(10,132,255,0.15)'}}>
              <div style={{fontSize:10,color:'#0a84ff',fontWeight:800,marginBottom:6,letterSpacing:1}}>💡 CLINICAL REASONING</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}>{step.explain}</div>
            </div>

            {/* Global vote */}
            <button onClick={()=>setShowGlobal(p=>!p)} style={{width:'100%',padding:'10px',borderRadius:14,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:10}}>
              🌍 See how {viewers.toLocaleString()} doctors voted {showGlobal?'▲':'▼'}
            </button>
            {showGlobal&&(
              <div style={{background:'rgba(255,255,255,0.03)',borderRadius:14,padding:14,marginBottom:12,border:'1px solid rgba(255,255,255,0.06)'}}>
                {step.opts.map((opt,i)=>(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:12,color:i===step.correct?'#30d158':'rgba(255,255,255,0.55)'}}>{opt}</span>
                      <span style={{fontSize:12,fontWeight:700,color:i===step.correct?'#30d158':'rgba(255,255,255,0.4)'}}>{step.globalVote[i]}%</span>
                    </div>
                    <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',background:i===step.correct?'#30d158':'rgba(255,255,255,0.15)',width:`${step.globalVote[i]}%`,borderRadius:3,transition:'width 0.8s ease'}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLast
              ?<button onClick={()=>{setStepIdx(p=>p+1);setSelected(null);setShowExplain(false);setShowGlobal(false)}} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}bb)`,color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:`0 6px 24px ${active.glow}`}}>Next Decision →</button>
              :<button onClick={()=>{onXP(200);if(!completed.includes(active.id))setCompleted(p=>[...p,active.id]);setPhase('outcome')}} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:15,fontWeight:800,cursor:'pointer'}}>🌍 See Patient Outcome +200 XP</button>
            }
          </div>
        )}
      </div>
    )
  }

  if(phase==='outcome'&&active) return(
    <div style={{padding:'0 4px'}}>
      <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.98),rgba(25,8,55,0.95))',borderRadius:24,padding:24,marginBottom:16,border:'1px solid rgba(139,92,246,0.3)',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>🌍</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:2,marginBottom:6}}>PATIENT OUTCOME</div>
        <div style={{fontSize:20,fontWeight:900,color:'white',marginBottom:16,letterSpacing:-0.3}}>{active.title}</div>
        <div style={{background:'rgba(48,209,88,0.08)',borderRadius:16,padding:16,marginBottom:16,border:'1px solid rgba(48,209,88,0.2)',textAlign:'left'}}>
          <div style={{fontSize:10,color:'#30d158',fontWeight:800,letterSpacing:1,marginBottom:8}}>WHAT HAPPENED</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.85)',lineHeight:1.8}}>{active.outcome}</div>
        </div>
        <div style={{background:`linear-gradient(135deg,${active.color}15,rgba(255,214,10,0.08))`,borderRadius:16,padding:16,marginBottom:16,border:`1px solid ${active.color}25`,textAlign:'left'}}>
          <div style={{fontSize:10,color:'#ffd60a',fontWeight:800,letterSpacing:1,marginBottom:10}}>KEY LEARNING POINTS</div>
          {active.keyLearning.map((k,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:10,alignItems:'flex-start'}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(255,214,10,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#ffd60a',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{background:'rgba(139,92,246,0.1)',borderRadius:16,padding:14,marginBottom:20,border:'1px solid rgba(139,92,246,0.2)'}}>
          <div style={{fontSize:10,color:'#c4b5fd',fontWeight:800,letterSpacing:1,marginBottom:4}}>YOUR SCORE</div>
          <div style={{fontSize:36,fontWeight:900,color:'#ffd60a'}}>{totalScore}/4</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:4}}>vs global average: {Math.round((active.timeline.reduce((a,s)=>a+s.globalVote[s.correct],0)/active.timeline.length))}%</div>
        </div>
        <button onClick={()=>setPhase('hub')} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:15,fontWeight:700,cursor:'pointer'}}>← Back to Nexus</button>
      </div>
    </div>
  )

  return null
}
"""

# Write all files
files = [
    ('RapidFire.tsx', rapid_fire),
    ('CardiacSurgeryAI.tsx', cardiac),
    ('NeuroSurgeryAI.tsx', neuro),
    ('GeneralSurgeryAI.tsx', general),
    ('ClinicalNexus.tsx', nexus),
]

for name, content in files:
    path = os.path.join(base, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✅ {name} — {len(content):,} chars')

# ══════════════════════════════════════════
# UPDATE page.tsx
# ══════════════════════════════════════════
page_path = os.path.expanduser('~/cliniverse-ai/app/page.tsx')
with open(page_path, 'r', encoding='utf-8') as f:
    page = f.read()

# Add imports
new_imports = """const RapidFire = dynamic(() => import('./components/RapidFire'), { ssr: false })
const CardiacSurgeryAI = dynamic(() => import('./components/CardiacSurgeryAI'), { ssr: false })
const NeuroSurgeryAI = dynamic(() => import('./components/NeuroSurgeryAI'), { ssr: false })
const GeneralSurgeryAI = dynamic(() => import('./components/GeneralSurgeryAI'), { ssr: false })
const ClinicalNexus = dynamic(() => import('./components/ClinicalNexus'), { ssr: false })"""

if 'ClinicalNexus' not in page:
    page = page.replace(
        "const DynamicMCQ = dynamic(() => import('./components/DynamicMCQ'), { ssr: false })",
        "const DynamicMCQ = dynamic(() => import('./components/DynamicMCQ'), { ssr: false })\n" + new_imports
    )
    print('✅ All imports added')

# Add tabs to tools segment
new_tabs = """{id:'nexus', label:'Nexus', color:'#ffd60a', glow:'rgba(255,214,10,0.8)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
                {id:'rapid', label:'Rapid', color:'#ff453a', glow:'rgba(255,69,58,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                {id:'cardiac', label:'Cardiac', color:'#ff453a', glow:'rgba(255,69,58,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2"/></svg>},
                {id:'neuro', label:'Neuro', color:'#bf5af2', glow:'rgba(191,90,242,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 017 7c0 2-1 4-2 5l1 8H6l1-8c-1-1-2-3-2-5a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
                {id:'general_surg', label:'Surgery', color:'#ff9f0a', glow:'rgba(255,159,10,0.7)', svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg>},"""

if 'nexus' not in page:
    page = page.replace(
        "{id:'aigen', label:'AI Gen'",
        new_tabs + "\n                {id:'aigen', label:'AI Gen'"
    )
    print('✅ New tabs added')

# Add renders
new_renders = """            {toolTab==='nexus'&&<ClinicalNexus onXP={addXP}/>}
            {toolTab==='rapid'&&<RapidFire onXP={addXP}/>}
            {toolTab==='cardiac'&&<CardiacSurgeryAI onXP={addXP}/>}
            {toolTab==='neuro'&&<NeuroSurgeryAI onXP={addXP}/>}
            {toolTab==='general_surg'&&<GeneralSurgeryAI onXP={addXP}/>}"""

if "toolTab==='nexus'" not in page:
    page = page.replace(
        "{toolTab==='aigen'&&<AICaseGenerator onXP={addXP}/>}",
        new_renders + "\n            {toolTab==='aigen'&&<AICaseGenerator onXP={addXP}/>}"
    )
    print('✅ Renders added')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page)

print('\n' + '='*50)
print('✅ ALL DONE!')
print('5 components: RapidFire + Cardiac + Neuro + General + ClinicalNexus')
print('\n🚀 Run: git add . && git commit -m "add: RapidFire, Surgical AI x3, ClinicalNexus grand finale" && git push')
