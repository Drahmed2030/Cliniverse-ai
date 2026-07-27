'use client'
import { useState } from 'react'

const C = { card:'rgba(255,255,255,0.11)', border:'rgba(139,92,246,0.25)', text:'white', sub:'rgba(255,255,255,0.45)', muted:'rgba(255,255,255,0.25)' }

const LAB_PANELS = [
  {
    panel:'Full Blood Count', icon:'🩸', color:'#ff453a',
    tests:[
      {name:'Haemoglobin',unit:'g/dL',male:'13.5-17.5',female:'12-16',low:'Anaemia → MCV guides type',high:'Polycythaemia, dehydration',critical:'< 7 or > 20'},
      {name:'WBC',unit:'×10⁹/L',male:'4-11',female:'4-11',low:'Neutropenia — infection risk, chemo',high:'Infection, leukaemia, steroid',critical:'< 2 or > 30'},
      {name:'Platelets',unit:'×10⁹/L',male:'150-400',female:'150-400',low:'Bleeding risk, ITP, DIC, heparin',high:'Reactive, essential thrombocythaemia',critical:'< 50 or > 1000'},
      {name:'MCV',unit:'fL',male:'80-100',female:'80-100',low:'Microcytic: iron deficiency, thalassaemia',high:'Macrocytic: B12/folate, alcohol, liver',critical:'N/A'},
    ]
  },
  {
    panel:'Renal Function', icon:'🫘', color:'#0a84ff',
    tests:[
      {name:'Sodium',unit:'mmol/L',male:'135-145',female:'135-145',low:'Hyponatraemia: SIADH, heart failure',high:'Hypernatraemia: dehydration, DI',critical:'< 120 or > 155'},
      {name:'Potassium',unit:'mmol/L',male:'3.5-5.0',female:'3.5-5.0',low:'Hypokalaemia: diuretics, vomiting',high:'Hyperkalaemia: AKI, ACEi, K-sparing diuretics',critical:'< 2.5 or > 6.5'},
      {name:'Creatinine',unit:'μmol/L',male:'60-110',female:'45-90',low:'Muscle wasting, pregnancy',high:'AKI, CKD, dehydration',critical:'> 500 (or rapid rise)'},
      {name:'eGFR',unit:'mL/min/1.73m²',male:'>60',female:'>60',low:'CKD — stage by degree',high:'N/A',critical:'< 15'},
      {name:'Urea',unit:'mmol/L',male:'2.5-7.8',female:'2.5-7.8',low:'Low protein, liver failure',high:'AKI, dehydration, GI bleed, high protein',critical:'> 35'},
    ]
  },
  {
    panel:'Liver Function', icon:'🫀', color:'#ff9f0a',
    tests:[
      {name:'ALT',unit:'IU/L',male:'< 45',female:'< 35',low:'N/A',high:'Hepatocellular damage: hepatitis, drugs, NAFLD',critical:'> 1000 (acute liver injury)'},
      {name:'ALP',unit:'IU/L',male:'30-130',female:'30-130',low:'N/A',high:'Cholestatic: biliary obstruction, bone disease',critical:'> 3x ULN + jaundice'},
      {name:'Bilirubin',unit:'μmol/L',male:'< 20',female:'< 20',low:'N/A',high:'Pre/intra/post-hepatic jaundice',critical:'> 100 with rising trend'},
      {name:'Albumin',unit:'g/L',male:'35-50',female:'35-50',low:'Malnutrition, liver failure, nephrotic syndrome',high:'Dehydration',critical:'< 20'},
      {name:'GGT',unit:'IU/L',male:'< 70',female:'< 45',low:'N/A',high:'Alcohol, enzyme-inducing drugs, biliary disease',critical:'N/A'},
    ]
  },
  {
    panel:'Cardiac Markers', icon:'🫀', color:'#ff453a',
    tests:[
      {name:'Troponin I (hs)',unit:'ng/L',male:'< 16',female:'< 9',low:'N/A',high:'NSTEMI/STEMI, myocarditis, PE, demand ischaemia',critical:'> 52 (rising pattern = ACS)'},
      {name:'BNP/NT-proBNP',unit:'pg/mL',male:'< 100 / < 300',female:'< 100 / < 300',low:'N/A',high:'Heart failure, RV strain, fluid overload',critical:'> 400 BNP / > 900 NT-proBNP'},
      {name:'D-Dimer',unit:'ng/mL',male:'< 500',female:'< 500',low:'N/A',high:'VTE, DIC, infection, post-op, pregnancy',critical:'> 4000 with symptoms'},
    ]
  },
  {
    panel:'Arterial Blood Gas', icon:'💨', color:'#64d2ff',
    tests:[
      {name:'pH',unit:'',male:'7.35-7.45',female:'7.35-7.45',low:'Acidaemia: DKA, sepsis, AKI, type 2 respiratory failure',high:'Alkalaemia: vomiting, hyperventilation',critical:'< 7.2 or > 7.6'},
      {name:'pCO2',unit:'kPa',male:'4.7-6.0',female:'4.7-6.0',low:'Hyperventilation, anxiety, PE',high:'Type 2 respiratory failure, COPD, opiates',critical:'< 3 or > 8'},
      {name:'pO2',unit:'kPa',male:'10-14',female:'10-14',low:'Hypoxaemia — give O2',high:'High-flow O2 therapy',critical:'< 8'},
      {name:'HCO3',unit:'mmol/L',male:'22-28',female:'22-28',low:'Metabolic acidosis',high:'Metabolic alkalosis, respiratory compensation',critical:'< 15 or > 35'},
      {name:'Lactate',unit:'mmol/L',male:'< 2.0',female:'< 2.0',low:'N/A',high:'Sepsis, ischaemia, metformin, liver failure',critical:'> 4 = shock'},
    ]
  },
]

const QUIZ_Q = [
  { q:'Troponin rises then falls — what pattern confirms NSTEMI?', opts:['Single high value','Rise and fall with at least one value above 99th percentile','Any elevation regardless of pattern','Two values above normal'], correct:1, explain:'NSTEMI requires a rise AND/OR fall pattern with at least one value above the 99th percentile URL. Serial troponins at 0h and 3h are standard.' },
  { q:'Hypokalaemia K+ 2.8 — what ECG change expected?', opts:['Peaked T waves','Flat T waves + U waves','ST elevation','Wide QRS'], correct:1, explain:'Hypokalaemia: flat/inverted T waves, prominent U waves, long QT. Hyperkalaemia gives peaked T waves, wide QRS, and eventually sine wave.' },
  { q:'INR 1.9 in liver failure — what does this indicate?', opts:['Anticoagulated state','Synthetic liver dysfunction','Vitamin K deficiency only','Normal for liver failure patients'], correct:1, explain:'INR reflects liver synthetic function (clotting factors II, VII, IX, X). Elevated INR in liver disease = poor synthetic function, not just anticoagulation.' },
  { q:'Lactate 5.2 mmol/L in a septic patient means?', opts:['Mild stress response','Dehydration only','Septic shock — vasopressors likely needed','Normal finding in infection'], correct:2, explain:'Lactate ≥ 4 mmol/L + sepsis = septic shock regardless of BP. Requires vasopressors and ICU level care per Surviving Sepsis 2021.' },
  { q:'Macrocytic anaemia (MCV > 100) — most common causes?', opts:['Iron deficiency + thalassaemia','B12/folate deficiency + alcohol + hypothyroidism','Chronic disease only','Lead poisoning'], correct:1, explain:'Macrocytosis: B12 deficiency, folate deficiency, alcohol excess, hypothyroidism, liver disease, myelodysplasia, medications (methotrexate, hydroxyurea).' },
]

export default function LabModule({ onXP }:{ onXP?:(n:number)=>void }) {
  const [view, setView] = useState<'menu'|'panels'|'quiz'>('menu')
  const [selectedPanel, setSelectedPanel] = useState<number|null>(null)
  const [expandedTest, setExpandedTest] = useState<string|null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [ans, setAns] = useState<number|null>(null)
  const [score, setScore] = useState(0)

  if (view === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(191,90,242,0.12),rgba(100,210,255,0.08))',borderRadius:22,padding:'18px',marginBottom:16,border:'1px solid rgba(191,90,242,0.2)'}}>
        <div style={{fontSize:11,color:'rgba(191,90,242,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🔬 LABORATORY</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Lab Interpretation</div>
        <div style={{fontSize:13,color:C.sub}}>5 panels · Critical values · Clinical context</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {LAB_PANELS.map((p,i)=>(
          <div key={i} onClick={()=>{setSelectedPanel(i);setView('panels');setExpandedTest(null)}}
            style={{background:`${p.color}10`,borderRadius:20,padding:'16px',border:`1px solid ${p.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${p.color}08`}}>
            <div style={{fontSize:28,marginBottom:8}}>{p.icon}</div>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:3}}>{p.panel}</div>
            <div style={{fontSize:11,color:C.sub}}>{p.tests.length} tests</div>
          </div>
        ))}
        <div onClick={()=>{setView('quiz');setQIdx(0);setAns(null);setScore(0)}}
          style={{background:'rgba(255,214,10,0.1)',borderRadius:20,padding:'16px',border:'1px solid rgba(255,214,10,0.25)',cursor:'pointer',boxShadow:'0 4px 20px rgba(255,214,10,0.08)'}}>
          <div style={{fontSize:28,marginBottom:8}}>🧠</div>
          <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:3}}>Lab Quiz</div>
          <div style={{fontSize:11,color:C.sub}}>5 clinical questions</div>
        </div>
      </div>
    </div>
  )

  if (view === 'panels' && selectedPanel !== null) {
    const panel = LAB_PANELS[selectedPanel]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{fontSize:16,fontWeight:800,color:C.text}}>{panel.icon} {panel.panel}</div>
        </div>
        {panel.tests.map((t,i)=>(
          <div key={i} onClick={()=>setExpandedTest(expandedTest===`${selectedPanel}-${i}`?null:`${selectedPanel}-${i}`)}
            style={{background:expandedTest===`${selectedPanel}-${i}`?`${panel.color}08`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${panel.color}${expandedTest===`${selectedPanel}-${i}`?'35':'18'}`,cursor:'pointer',transition:'all 0.2s'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:expandedTest===`${selectedPanel}-${i}`?10:0}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:C.text}}>{t.name}</div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>{t.male} {t.unit} {t.male!==t.female?`(M) / ${t.female} (F)`:''}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,69,58,0.15)',color:'#ff453a',fontWeight:700,border:'1px solid rgba(255,69,58,0.25)'}}>⚠️ {t.critical}</div>
                <div style={{fontSize:16,color:`${panel.color}60`}}>{expandedTest===`${selectedPanel}-${i}`?'▲':'▼'}</div>
              </div>
            </div>
            {expandedTest===`${selectedPanel}-${i}`&&(
              <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:10,display:'flex',flexDirection:'column',gap:8}}>
                <div style={{background:'rgba(10,132,255,0.08)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(10,132,255,0.15)'}}><div style={{fontSize:9,color:'#0a84ff',fontWeight:700,marginBottom:3}}>LOW →</div><div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{t.low}</div></div>
                <div style={{background:'rgba(255,69,58,0.08)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(255,69,58,0.15)'}}><div style={{fontSize:9,color:'#ff453a',fontWeight:700,marginBottom:3}}>HIGH →</div><div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{t.high}</div></div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (view === 'quiz') {
    if (qIdx >= QUIZ_Q.length) {
      const xp = score * 20
      return (
        <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:60,marginBottom:12}}>{score>=4?'🏆':'📚'}</div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:4}}>{Math.round((score/QUIZ_Q.length)*100)}%</div>
          <div style={{fontSize:14,color:'#bf5af2',fontWeight:700,marginBottom:20}}>+{xp} XP</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{setQIdx(0);setAns(null);setScore(0)}} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
            <button onClick={()=>{onXP&&onXP(xp);setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#bf5af2,#8b5cf6)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer'}}>+{xp} XP ✓</button>
          </div>
        </div>
      )
    }
    const q = QUIZ_Q[qIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>🔬 Lab Quiz</div><div style={{fontSize:11,color:C.sub}}>Q{qIdx+1}/{QUIZ_Q.length}</div></div>
        </div>
        <div style={{background:C.card,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text,lineHeight:1.7}}>{q.q}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {q.opts.map((opt,i)=>{
            let bg=C.card,border=`1px solid ${C.border}`,tc=C.text
            if(ans!==null){if(i===q.correct){bg='rgba(48,209,88,0.12)';border='2px solid rgba(48,209,88,0.4)';tc='#86efac'}else if(i===ans){bg='rgba(255,69,58,0.12)';border='1px solid rgba(255,69,58,0.3)';tc='#fca5a5'}}
            return (
              <div key={i} onClick={()=>{if(ans!==null)return;setAns(i);if(i===q.correct)setScore(s=>s+1)}}
                style={{background:bg,borderRadius:14,padding:'14px 16px',border,cursor:ans===null?'pointer':'default',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.4)',flexShrink:0}}>{['A','B','C','D'][i]}</div>
                <div style={{fontSize:13,color:tc,fontWeight:500,flex:1}}>{opt}</div>
                {ans!==null&&i===q.correct&&<span>✅</span>}
                {ans!==null&&i===ans&&i!==q.correct&&<span>❌</span>}
              </div>
            )
          })}
        </div>
        {ans!==null&&(
          <div>
            <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:'14px',marginBottom:12,border:'1px solid rgba(10,132,255,0.2)'}}>
              <div style={{fontSize:10,color:'#0a84ff',fontWeight:700,marginBottom:6}}>💡 EXPLANATION</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>{q.explain}</div>
            </div>
            <button onClick={()=>{setQIdx(i=>i+1);setAns(null)}} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#bf5af2,#8b5cf6)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer'}}>
              {qIdx<QUIZ_Q.length-1?'Next →':'Results 🏆'}
            </button>
          </div>
        )}
      </div>
    )
  }
  return null
}
