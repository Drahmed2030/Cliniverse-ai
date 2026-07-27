'use client'
import { useState } from 'react'

const C = { card:'rgba(255,255,255,0.11)', border:'rgba(139,92,246,0.25)', text:'white', sub:'rgba(255,255,255,0.45)', muted:'rgba(255,255,255,0.25)' }

const CXR_FINDINGS = [
  { finding:'Cardiomegaly', criteria:'Cardiothoracic ratio > 0.5 on PA film', causes:'Heart failure, cardiomyopathy, pericardial effusion', icon:'🫀', color:'#ff453a', nextStep:'Echo, BNP, cardiology review' },
  { finding:'Pulmonary Oedema', criteria:'Bat-wing shadowing, Kerley B lines, pleural effusions', causes:'Left ventricular failure, ARDS, fluid overload', icon:'💧', color:'#0a84ff', nextStep:'Furosemide, O2, BNP, echo' },
  { finding:'Consolidation', criteria:'Opacification with air bronchograms', causes:'Pneumonia, haemorrhage, infarction, aspiration', icon:'🫁', color:'#ff9f0a', nextStep:'Antibiotics if infective, CT if atypical' },
  { finding:'Pneumothorax', criteria:'Visible lung edge + absent lung markings peripherally', causes:'Spontaneous, trauma, iatrogenic', icon:'⚡', color:'#ff453a', nextStep:'Size determines: observe vs needle vs chest drain' },
  { finding:'Pleural Effusion', criteria:'Blunted costophrenic angle, meniscus sign', causes:'Heart failure, malignancy, infection, PE', icon:'💧', color:'#64d2ff', nextStep:'Aspirate if large/diagnostic, Light\'s criteria on fluid' },
  { finding:'Hilar Enlargement', criteria:'Bilateral or unilateral hilar prominence', causes:'Sarcoidosis, TB, lymphoma, pulmonary HTN', icon:'🔍', color:'#bf5af2', nextStep:'CT chest, ACE level, biopsy if needed' },
]

const CT_PATTERNS = [
  { scan:'CT Head', finding:'Hyperdense lesion', meaning:'Acute haemorrhage (blood is bright on non-contrast CT)', urgency:'Emergency', color:'#ff453a', action:'Neurosurgery review, reverse anticoagulation if on treatment' },
  { scan:'CT Head', finding:'Hypodense lesion', meaning:'Ischaemic stroke or tumour (check age of symptoms)', urgency:'Urgent', color:'#ff9f0a', action:'MRI for characterisation, stroke team if acute' },
  { scan:'CT Head', finding:'Midline shift', meaning:'Mass effect from oedema, haematoma, or tumour', urgency:'Emergency', color:'#ff453a', action:'Neurosurgery, mannitol, head of bed 30°' },
  { scan:'CT Pulmonary Angiography', finding:'Filling defect in pulmonary artery', meaning:'Pulmonary embolism — saddle PE if central', urgency:'Emergency', color:'#ff453a', action:'Anticoagulate immediately, consider thrombolysis if haemodynamically unstable' },
  { scan:'CT Abdomen', finding:'Free air under diaphragm', meaning:'Hollow viscus perforation until proven otherwise', urgency:'Emergency', color:'#ff453a', action:'Surgical emergency — immediate surgical review, nil by mouth, IV antibiotics' },
  { scan:'CT Abdomen', finding:'Aortic dilatation > 3cm', meaning:'Abdominal aortic aneurysm (AAA)', urgency:'Urgent/Emergency', color:'#ff9f0a', action:'Vascular surgery, if > 5.5cm or symptomatic = emergency repair' },
]

const QUIZ_Q = [
  { q:'On CXR, cardiomegaly is defined as CTR > ?', opts:['0.4','0.5','0.6','0.7'], correct:1, explain:'Cardiothoracic ratio (CTR) > 0.5 on a PA (not AP) film = cardiomegaly. AP films overestimate heart size — note the projection before reporting.' },
  { q:'Air bronchograms on CXR indicate?', opts:['Pleural effusion','Consolidation','Pneumothorax','Pulmonary oedema only'], correct:1, explain:'Air bronchograms (air-filled bronchi visible within opacified lung) indicate consolidation — the surrounding alveoli are filled with fluid/pus/blood, but airways remain air-filled.' },
  { q:'On non-contrast CT head, acute blood appears?', opts:['Dark (hypodense)','Bright (hyperdense)','Same as brain','Invisible'], correct:1, explain:'Acute blood is hyperdense (bright white) on non-contrast CT due to high protein content of clot. After 2-3 weeks it becomes isodense, then hypodense.' },
  { q:'Bilateral hilar lymphadenopathy on CXR — first investigation?', opts:['HRCT chest','ACE level + CT chest','PET scan','Lung biopsy first'], correct:1, explain:'ACE level (elevated in sarcoidosis) + CT chest to characterise. Sarcoidosis is most common cause of bilateral hilar lymphadenopathy in young adults.' },
  { q:'Free air under diaphragm on erect CXR means?', opts:['Normal finding','Hollow viscus perforation','Subphrenic abscess','Diaphragmatic hernia'], correct:1, explain:'Free air under diaphragm = hollow viscus perforation until proven otherwise. Surgical emergency — perforated peptic ulcer most common cause.' },
]

export default function RadiologyModule({ onXP }:{ onXP?:(n:number)=>void }) {
  const [view, setView] = useState<'menu'|'cxr'|'ct'|'quiz'>('menu')
  const [expandedCXR, setExpandedCXR] = useState<number|null>(null)
  const [expandedCT, setExpandedCT] = useState<number|null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [ans, setAns] = useState<number|null>(null)
  const [score, setScore] = useState(0)

  if (view === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,214,10,0.12),rgba(255,159,10,0.08))',borderRadius:22,padding:'18px',marginBottom:16,border:'1px solid rgba(255,214,10,0.2)'}}>
        <div style={{fontSize:11,color:'rgba(255,214,10,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🩻 RADIOLOGY</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Radiology Interpretation</div>
        <div style={{fontSize:13,color:C.sub}}>CXR · CT patterns · Clinical context</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {[
          {id:'cxr',icon:'🩻',label:'CXR Findings',sub:'6 critical patterns',color:'#ffd60a'},
          {id:'ct',icon:'🔬',label:'CT Patterns',sub:'Head, chest, abdomen',color:'#ff9f0a'},
          {id:'quiz',icon:'🧠',label:'Radiology Quiz',sub:'5 clinical questions',color:'#bf5af2'},
        ].map(t=>(
          <div key={t.id} onClick={()=>{setView(t.id as any);setQIdx(0);setAns(null);setScore(0)}}
            style={{background:`${t.color}10`,borderRadius:20,padding:'16px',border:`1px solid ${t.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${t.color}08`,gridColumn:t.id==='quiz'?'span 2':'span 1'}}>
            <div style={{fontSize:28,marginBottom:8}}>{t.icon}</div>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:3}}>{t.label}</div>
            <div style={{fontSize:11,color:C.sub}}>{t.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:'rgba(255,255,255,0.11)',borderRadius:18,padding:'14px 16px',border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>🎯 SYSTEMATIC CXR APPROACH</div>
        {['A — Airway: trachea midline?','B — Breathing: lung fields symmetric?','C — Cardiac: CTR, borders, shape','D — Diaphragm: right higher, no free air','E — Everything else: bones, soft tissue, lines'].map((s,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
            <span style={{color:'#ffd60a',fontWeight:800,fontSize:12,flexShrink:0}}>→</span>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (view === 'cxr') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>🩻 CXR Findings</div>
      </div>
      {CXR_FINDINGS.map((f,i)=>(
        <div key={i} onClick={()=>setExpandedCXR(expandedCXR===i?null:i)}
          style={{background:expandedCXR===i?`${f.color}08`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${f.color}${expandedCXR===i?'35':'20'}`,cursor:'pointer',transition:'all 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:expandedCXR===i?10:0}}>
            <div style={{width:44,height:44,borderRadius:14,background:`${f.color}18`,border:`1px solid ${f.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{f.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>{f.finding}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{f.criteria}</div></div>
            <div style={{fontSize:16,color:`${f.color}60`}}>{expandedCXR===i?'▲':'▼'}</div>
          </div>
          {expandedCXR===i&&(
            <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:10,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{background:'rgba(255,255,255,0.11)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(255,255,255,0.15)'}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3}}>CAUSES</div><div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{f.causes}</div></div>
              <div style={{background:`${f.color}10`,borderRadius:10,padding:'10px 12px',border:`1px solid ${f.color}25`}}><div style={{fontSize:9,color:f.color,fontWeight:700,marginBottom:3}}>NEXT STEP</div><div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.5,fontWeight:600}}>{f.nextStep}</div></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (view === 'ct') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>🔬 CT Patterns</div>
      </div>
      {CT_PATTERNS.map((p,i)=>(
        <div key={i} onClick={()=>setExpandedCT(expandedCT===i?null:i)}
          style={{background:expandedCT===i?`${p.color}08`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${p.color}${expandedCT===i?'35':'20'}`,cursor:'pointer',transition:'all 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:expandedCT===i?10:0}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{p.scan}</div>
              <div style={{fontSize:13,fontWeight:800,color:C.text}}>{p.finding}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:9,padding:'3px 8px',borderRadius:6,background:`${p.color}20`,color:p.color,fontWeight:800,border:`1px solid ${p.color}30`}}>{p.urgency}</span>
              <div style={{fontSize:16,color:`${p.color}60`}}>{expandedCT===i?'▲':'▼'}</div>
            </div>
          </div>
          {expandedCT===i&&(
            <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:10,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{background:'rgba(255,255,255,0.11)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(255,255,255,0.15)'}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3}}>MEANING</div><div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{p.meaning}</div></div>
              <div style={{background:`${p.color}10`,borderRadius:10,padding:'10px 12px',border:`1px solid ${p.color}25`}}><div style={{fontSize:9,color:p.color,fontWeight:700,marginBottom:3}}>ACTION</div><div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.5,fontWeight:600}}>{p.action}</div></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (view === 'quiz') {
    if (qIdx >= QUIZ_Q.length) {
      const xp = score * 20
      return (
        <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:60,marginBottom:12}}>{score>=4?'🏆':'📚'}</div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:4}}>{Math.round((score/QUIZ_Q.length)*100)}%</div>
          <div style={{fontSize:14,color:'#ffd60a',fontWeight:700,marginBottom:20}}>+{xp} XP</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{setQIdx(0);setAns(null);setScore(0)}} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
            <button onClick={()=>{onXP&&onXP(xp);setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:14,fontWeight:800,cursor:'pointer'}}>+{xp} XP ✓</button>
          </div>
        </div>
      )
    }
    const q = QUIZ_Q[qIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>🩻 Radiology Quiz</div><div style={{fontSize:11,color:C.sub}}>Q{qIdx+1}/{QUIZ_Q.length}</div></div>
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
            <button onClick={()=>{setQIdx(i=>i+1);setAns(null)}} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:14,fontWeight:800,cursor:'pointer'}}>
              {qIdx<QUIZ_Q.length-1?'Next →':'Results 🏆'}
            </button>
          </div>
        )}
      </div>
    )
  }
  return null
}
