'use client'
import { useState } from 'react'

type View = 'menu' | 'interactions' | 'dosing' | 'quiz' | 'counselling'

const C = {
  card: 'rgba(255,255,255,0.14)',
  border: 'rgba(0,196,180,0.25)',
  text: '#EEF6FA',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

const INTERACTIONS = [
  { drug1:'Warfarin', drug2:'Amiodarone', severity:'Major', color:'#ff453a', icon:'⚠️', mechanism:'CYP2C9 inhibition → warfarin levels ↑↑↑', effect:'INR can triple. Life-threatening bleeding.', action:'Reduce warfarin 30-50%. Monitor INR weekly.' },
  { drug1:'Metformin', drug2:'IV Contrast', severity:'Major', color:'#ff453a', icon:'⚠️', mechanism:'Contrast impairs renal excretion of metformin', effect:'Lactic acidosis — fatal if not managed.', action:'Hold metformin 48h before and after IV contrast. Check eGFR.' },
  { drug1:'Simvastatin', drug2:'Amlodipine', severity:'Moderate', color:'#ff9f0a', icon:'⚡', mechanism:'CYP3A4 inhibition → statin levels ↑', effect:'Myopathy, rhabdomyolysis risk.', action:'Max simvastatin 20mg with amlodipine. Consider alternative statin.' },
  { drug1:'Clopidogrel', drug2:'Omeprazole', severity:'Moderate', color:'#ff9f0a', icon:'⚡', mechanism:'CYP2C19 inhibition → clopidogrel activation ↓', effect:'Reduced antiplatelet effect. Increased CV events.', action:'Use pantoprazole instead (weaker CYP2C19 inhibitor).' },
  { drug1:'SSRIs', drug2:'Tramadol', severity:'Major', color:'#ff453a', icon:'⚠️', mechanism:'Serotonin syndrome + lowered seizure threshold', effect:'Serotonin syndrome: hyperthermia, rigidity, clonus.', action:'Avoid combination. Use alternative analgesia.' },
  { drug1:'ACE Inhibitor', drug2:'Potassium-sparing diuretic', severity:'Major', color:'#ff453a', icon:'⚠️', mechanism:'Both increase potassium retention', effect:'Life-threatening hyperkalaemia.', action:'Monitor K+ closely. Avoid if eGFR < 30.' },
  { drug1:'Digoxin', drug2:'Amiodarone', severity:'Major', color:'#ff453a', icon:'⚠️', mechanism:'P-gp inhibition → digoxin levels ↑ 70-100%', effect:'Digoxin toxicity: bradycardia, arrhythmias, nausea.', action:'Reduce digoxin dose by 50%. Monitor levels and ECG.' },
  { drug1:'Lithium', drug2:'NSAIDs', severity:'Major', color:'#ff453a', icon:'⚠️', mechanism:'NSAIDs reduce renal lithium excretion', effect:'Lithium toxicity: tremor, confusion, renal failure.', action:'Avoid NSAIDs in lithium patients. Use paracetamol.' },
]

const DOSING = [
  { drug:'Gentamicin', route:'IV', dose:'5-7 mg/kg once daily', renal:'Reduce dose/extend interval if eGFR < 60. Monitor levels.', monitoring:'Trough < 1 mg/L. Peak 15-20 mg/L. Ototoxicity risk.', color:'#00C4B4', special:'Once-daily dosing reduces nephrotoxicity' },
  { drug:'Vancomycin', route:'IV', dose:'25-30 mg/kg/day in 2-4 divided doses', renal:'AUC-guided dosing preferred. Extend interval if CKD.', monitoring:'AUC/MIC 400-600. Trough 10-20 mg/L. Nephrotoxic.', color:'#00C4B4', special:'Infuse over ≥ 60 min to prevent red man syndrome' },
  { drug:'Warfarin', route:'PO', dose:'Individualised — start 5mg, adjust to INR 2-3', renal:'No dose adjustment needed in renal failure.', monitoring:'INR every 1-2 weeks when stable. Weekly when initiating.', color:'#ff453a', special:'Multiple interactions — always check before adding drugs' },
  { drug:'Heparin UFH', route:'IV', dose:'80 units/kg bolus → 18 units/kg/hr infusion', renal:'No renal adjustment — hepatic metabolism.', monitoring:'APTT 60-100 seconds (1.5-2.5x normal). Every 6h initially.', color:'#30d158', special:'Antidote: Protamine 1mg per 100 units heparin' },
  { drug:'Metformin', route:'PO', dose:'500mg BD with food → max 2g/day', renal:'Reduce if eGFR 30-45. STOP if eGFR < 30.', monitoring:'eGFR annually. Vitamin B12 every 2-3 years.', color:'#ff9f0a', special:'Hold before IV contrast. Restart 48h after if eGFR stable' },
  { drug:'Amiodarone', route:'IV/PO', dose:'IV: 300mg bolus. PO: 200mg TDS × 1 week → 200mg OD', renal:'No renal adjustment needed.', monitoring:'TFT, LFT, PFT every 6 months. CXR annually.', color:'#ffd60a', special:'Half-life 40-55 days — interactions persist after stopping' },
]

const QUIZ_Q = [
  { q:'Warfarin INR is 6.2 — no bleeding. What to do?', opts:['Continue same dose','Omit 1-2 doses + recheck','Give Vitamin K 5mg IV','Transfuse FFP'], correct:1, explain:'INR 5-8 with no bleeding: hold warfarin 1-2 doses, recheck INR, restart at lower dose. IV Vitamin K only if INR > 8 or bleeding.' },
  { q:'Metformin should be withheld before IV contrast if eGFR is?', opts:['< 90','< 60','< 45','< 30'], correct:2, explain:'Hold metformin if eGFR < 45 before IV contrast (or per local protocol). Risk of lactic acidosis from contrast-induced AKI.' },
  { q:'Red man syndrome from vancomycin is prevented by?', opts:['Dose reduction','Antihistamine premedication','Slow infusion > 60 min','Both B and C'], correct:3, explain:'Red man syndrome (flushing, hypotension) is rate-related, not allergic. Slow infusion > 60 min + premedication with antihistamine prevents it.' },
  { q:'Gentamicin trough level should be?', opts:['< 1 mg/L','1-5 mg/L','5-10 mg/L','> 10 mg/L'], correct:0, explain:'Gentamicin trough < 1 mg/L ensures complete elimination between doses and minimises nephrotoxicity and ototoxicity.' },
  { q:'Best PPI to use with clopidogrel?', opts:['Omeprazole','Esomeprazole','Pantoprazole','Lansoprazole'], correct:2, explain:'Pantoprazole has weakest CYP2C19 inhibition — least interaction with clopidogrel activation. Avoid omeprazole and esomeprazole.' },
]

const COUNSELLING = [
  { drug:'Warfarin', icon:'💊', color:'#ff453a', points:['Take at same time daily — evening preferred','Consistent vitamin K diet — no sudden increase in green vegetables','Avoid alcohol','Carry anticoagulant alert card always','Inform ALL healthcare providers you are on warfarin','Report unusual bleeding immediately — gums, urine, stools'] },
  { drug:'Metformin', icon:'🩺', color:'#30d158', points:['Always take with food — reduces GI side effects','Do not crush or chew SR tablets','Hold if vomiting, diarrhoea, or any procedure with contrast','Report lactic acidosis symptoms: weakness, unusual muscle pain, difficulty breathing','Vitamin B12 may decrease over time — regular blood tests needed'] },
  { drug:'Statins', icon:'🫀', color:'#ff9f0a', points:['Best taken in the evening (peak cholesterol synthesis at night)','Report muscle pain, weakness, or dark urine immediately','Avoid large quantities of grapefruit juice (CYP3A4)','Do not stop without consulting doctor — rebound risk','Regular LFT monitoring for first year'] },
]

export default function PharmacyModule({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<View>('menu')
  const [selectedInteraction, setSelectedInteraction] = useState<number|null>(null)
  const [selectedDrug, setSelectedDrug] = useState<number|null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [ans, setAns] = useState<number|null>(null)
  const [score, setScore] = useState(0)
  const [severity, setSeverity] = useState<string>('All')

  const filtered = severity === 'All' ? INTERACTIONS : INTERACTIONS.filter(i=>i.severity===severity)

  if (view === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(48,209,88,0.12),rgba(10,132,255,0.08))',borderRadius:22,padding:'18px',marginBottom:16,border:'1px solid rgba(48,209,88,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(48,209,88,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(48,209,88,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>💊 PHARMACY</div>
        <div style={{fontSize:24,fontWeight:900,color:'#0A1628',letterSpacing:-0.5,marginBottom:4}}>Clinical Pharmacology</div>
        <div style={{fontSize:13,color:C.sub}}>Drug interactions · Dosing · Counselling · MCQs</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {[
          {id:'interactions',icon:'⚡',label:'Drug Interactions',sub:'8 critical interactions',color:'#ff453a'},
          {id:'dosing',icon:'💉',label:'Drug Dosing',sub:'Renal + monitoring',color:'#00C4B4'},
          {id:'counselling',icon:'🗣️',label:'Patient Counselling',sub:'3 key medications',color:'#30d158'},
          {id:'quiz',icon:'🧠',label:'Pharmacy Quiz',sub:'5 clinical questions',color:'#ffd60a'},
        ].map(t=>(
          <div key={t.id} onClick={()=>{setView(t.id as View);setQIdx(0);setAns(null);setScore(0)}}
            style={{background:`${t.color}10`,borderRadius:20,padding:'16px',border:`1px solid ${t.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${t.color}08`}}>
            <div style={{fontSize:28,marginBottom:8}}>{t.icon}</div>
            <div style={{fontSize:14,fontWeight:800,color:'#0A1628',marginBottom:3}}>{t.label}</div>
            <div style={{fontSize:11,color:C.sub}}>{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (view === 'interactions') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:800,color:'#0A1628'}}>⚡ Drug Interactions</div></div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {['All','Major','Moderate'].map(s=>(
          <button key={s} onClick={()=>setSeverity(s)} style={{padding:'7px 14px',borderRadius:12,border:severity===s?`2px solid ${s==='Major'?'#ff453a':s==='Moderate'?'#ff9f0a':'#00C4B4'}`:`1px solid ${C.border}`,background:severity===s?`${s==='Major'?'rgba(255,69,58,0.15)':s==='Moderate'?'rgba(255,159,10,0.15)':'rgba(0,196,180,0.25)'}`:C.card,color:severity===s?s==='Major'?'#ff453a':s==='Moderate'?'#ff9f0a':'#6ee7e1':C.sub,fontSize:11,fontWeight:700,cursor:'pointer'}}>
            {s}
          </button>
        ))}
      </div>
      {filtered.map((int,i)=>(
        <div key={i} onClick={()=>setSelectedInteraction(selectedInteraction===i?null:i)}
          style={{background:selectedInteraction===i?`${int.color}10`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${int.color}${selectedInteraction===i?'40':'20'}`,cursor:'pointer',transition:'all 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:selectedInteraction===i?10:0}}>
            <div style={{fontSize:20,flexShrink:0}}>{int.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:'#0A1628'}}>{int.drug1} + {int.drug2}</div>
              <div style={{fontSize:10,padding:'2px 8px',borderRadius:6,background:`${int.color}20`,color:int.color,fontWeight:700,display:'inline-block',marginTop:3,border:`1px solid ${int.color}30`}}>{int.severity}</div>
            </div>
            <div style={{fontSize:16,color:`${int.color}60`}}>{selectedInteraction===i?'▲':'▼'}</div>
          </div>
          {selectedInteraction===i&&(
            <div style={{borderTop:`1px solid rgba(36,63,82,0.65)`,paddingTop:10}}>
              <div style={{marginBottom:8}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3}}>MECHANISM</div><div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.5}}>{int.mechanism}</div></div>
              <div style={{marginBottom:8}}><div style={{fontSize:9,color:'#ff453a',fontWeight:700,marginBottom:3}}>EFFECT</div><div style={{fontSize:12,color:'rgba(255,150,150,0.9)',lineHeight:1.5,fontWeight:600}}>{int.effect}</div></div>
              <div style={{background:'rgba(48,209,88,0.08)',borderRadius:10,padding:'8px 12px',border:'1px solid rgba(48,209,88,0.2)'}}><div style={{fontSize:9,color:'#30d158',fontWeight:700,marginBottom:3}}>ACTION</div><div style={{fontSize:12,color:'rgba(150,255,150,0.9)',lineHeight:1.5}}>{int.action}</div></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (view === 'dosing') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:'#0A1628'}}>💉 Drug Dosing Guide</div>
      </div>
      {DOSING.map((d,i)=>(
        <div key={i} onClick={()=>setSelectedDrug(selectedDrug===i?null:i)}
          style={{background:selectedDrug===i?`${d.color}10`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${d.color}${selectedDrug===i?'35':'18'}`,cursor:'pointer',transition:'all 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:selectedDrug===i?10:0}}>
            <div style={{width:42,height:42,borderRadius:13,background:`${d.color}18`,border:`1px solid ${d.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:d.color,flexShrink:0}}>{d.route}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:'#0A1628'}}>{d.drug}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{d.dose}</div></div>
            <div style={{fontSize:16,color:`${d.color}60`}}>{selectedDrug===i?'▲':'▼'}</div>
          </div>
          {selectedDrug===i&&(
            <div style={{borderTop:`1px solid rgba(36,63,82,0.65)`,paddingTop:10,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{background:'rgba(255,69,58,0.08)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(255,69,58,0.15)'}}><div style={{fontSize:9,color:'#ff453a',fontWeight:700,marginBottom:3}}>🫘 RENAL ADJUSTMENT</div><div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.5}}>{d.renal}</div></div>
              <div style={{background:'rgba(10,132,255,0.08)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(0,196,180,0.15)'}}><div style={{fontSize:9,color:'#00C4B4',fontWeight:700,marginBottom:3}}>📊 MONITORING</div><div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.5}}>{d.monitoring}</div></div>
              <div style={{background:'rgba(255,214,10,0.08)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(255,214,10,0.15)'}}><div style={{fontSize:9,color:'#ffd60a',fontWeight:700,marginBottom:3}}>⭐ SPECIAL NOTE</div><div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.5}}>{d.special}</div></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (view === 'counselling') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:'#0A1628'}}>🗣️ Patient Counselling</div>
      </div>
      {COUNSELLING.map((c,i)=>(
        <div key={i} style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:12,border:`1px solid ${c.color}25`}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{c.icon}</div>
            <div style={{fontSize:15,fontWeight:800,color:'#0A1628'}}>{c.drug}</div>
          </div>
          {c.points.map((p,j)=>(
            <div key={j} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:j<c.points.length-1?`1px solid rgba(36,63,82,0.60)`:'none'}}>
              <div style={{width:22,height:22,borderRadius:7,background:`${c.color}18`,border:`1px solid ${c.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:c.color,flexShrink:0}}>{j+1}</div>
              <div style={{fontSize:12,color:'#0A1628',lineHeight:1.6}}>{p}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  if (view === 'quiz') {
    if (qIdx >= QUIZ_Q.length) {
      const pct = Math.round((score/QUIZ_Q.length)*100)
      const xp = score * 20
      return (
        <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:60,marginBottom:12}}>{pct>=80?'🏆':pct>=60?'🎖️':'📚'}</div>
          <div style={{fontSize:28,fontWeight:900,color:'#0A1628',marginBottom:4}}>{pct}%</div>
          <div style={{fontSize:14,color:pct>=80?'#30d158':'#ff9f0a',fontWeight:700,marginBottom:20}}>+{xp} XP earned</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{setQIdx(0);setAns(null);setScore(0)}} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
            <button onClick={()=>{onXP&&onXP(xp);setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#0a84ff)',color:'var(--text-primary, white)',fontSize:14,fontWeight:800,cursor:'pointer'}}>+{xp} XP ✓</button>
          </div>
        </div>
      )
    }
    const q = QUIZ_Q[qIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:'#0A1628'}}>🧠 Pharmacy Quiz</div><div style={{fontSize:11,color:C.sub}}>Q{qIdx+1}/{QUIZ_Q.length} · Score: {score}</div></div>
          <div style={{fontSize:13,fontWeight:700,color:'#30d158'}}>{score*20} XP</div>
        </div>
        <div style={{height:3,background:'rgba(255,255,255,0.88)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
          <div style={{height:'100%',width:`${(qIdx/QUIZ_Q.length)*100}%`,background:'linear-gradient(90deg,#30d158,#0a84ff)',borderRadius:2,transition:'width 0.4s',boxShadow:'0 0 8px rgba(48,209,88,0.5)'}}/>
        </div>
        <div style={{background:C.card,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:15,fontWeight:700,color:'#0A1628',lineHeight:1.7}}>{q.q}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {q.opts.map((opt,i)=>{
            let bg=C.card,border=`1px solid ${C.border}`,tc=C.text
            if(ans!==null){
              if(i===q.correct){bg='rgba(48,209,88,0.12)';border='2px solid rgba(48,209,88,0.4)';tc='#86efac'}
              else if(i===ans){bg='rgba(255,69,58,0.12)';border='1px solid rgba(255,69,58,0.3)';tc='#fca5a5'}
            }
            return (
              <div key={i} onClick={()=>{if(ans!==null)return;setAns(i);if(i===q.correct)setScore(s=>s+1)}}
                style={{background:bg,borderRadius:14,padding:'14px 16px',border,cursor:ans===null?'pointer':'default',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.88)',border:'1px solid rgba(0,196,180,0.20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'rgba(10,22,40,0.70)',flexShrink:0}}>{['A','B','C','D'][i]}</div>
                <div style={{fontSize:13,color:tc,fontWeight:500,flex:1,lineHeight:1.4}}>{opt}</div>
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
            <button onClick={()=>{setQIdx(i=>i+1);setAns(null)}} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#0a84ff)',color:'var(--text-primary, white)',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(48,209,88,0.35)'}}>
              {qIdx<QUIZ_Q.length-1?'Next →':'Results 🏆'}
            </button>
          </div>
        )}
      </div>
    )
  }
  return null
}
