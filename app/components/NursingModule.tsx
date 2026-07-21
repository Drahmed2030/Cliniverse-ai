'use client'
import { useState } from 'react'

const C = { card:'rgba(255,255,255,0.04)', border:'rgba(139,92,246,0.15)', text:'white', sub:'rgba(255,255,255,0.45)', muted:'rgba(255,255,255,0.25)' }

const VITALS_RANGES = [
  { param:'Heart Rate', normal:'60-100 bpm', concern:'< 50 or > 120', critical:'< 40 or > 150', icon:'❤️', color:'#ff453a', action:'Assess rhythm, check BP, escalate if symptomatic' },
  { param:'Blood Pressure', normal:'90-139 / 60-89 mmHg', concern:'SBP < 90 or > 160', critical:'SBP < 80 or > 180', icon:'🩺', color:'#0a84ff', action:'Check lying/standing, review medications, escalate if symptomatic' },
  { param:'SpO2', normal:'≥ 95%', concern:'92-94%', critical:'< 92%', icon:'🫁', color:'#64d2ff', action:'Apply O2, check probe position, escalate if not improving' },
  { param:'Temperature', normal:'36-37.5°C', concern:'37.6-38.4°C or < 35.5°C', critical:'> 39°C or < 35°C', icon:'🌡️', color:'#ff9f0a', action:'Culture if pyrexic, warm if hypothermic, escalate if NEWS high' },
  { param:'Respiratory Rate', normal:'12-20 /min', concern:'21-24 /min', critical:'< 8 or > 25 /min', icon:'💨', color:'#30d158', action:'Most sensitive early warning sign — escalate immediately if > 25' },
  { param:'GCS', normal:'15', concern:'13-14', critical:'< 13', icon:'🧠', color:'#bf5af2', action:'Assess AVPU, check glucose, protect airway, immediate escalation' },
]

const SKILLS = [
  { title:'IV Cannula Insertion', icon:'💉', color:'#0a84ff', steps:['Select vein — antecubital first choice', 'Clean with 2% chlorhexidine × 30 seconds, allow to dry', 'Insert at 15-30° bevel up, advance on flashback', 'Advance cannula, withdraw needle, apply pressure', 'Flush with 5ml 0.9% NaCl — check patency', 'Secure with transparent dressing, document date'] },
  { title:'Urinary Catheter Care', icon:'🩺', color:'#30d158', steps:['Maintain closed drainage system always', 'Secure catheter to prevent traction', 'Empty bag when ≥ 2/3 full or every 8h', 'Document colour, volume, clarity every shift', 'Clean meatal area daily with soap and water', 'Remove catheter as soon as clinically safe — CAUTI prevention'] },
  { title:'Wound Assessment', icon:'🩹', color:'#ff9f0a', steps:['Document size (cm), depth, wound bed', 'Assess edges, surrounding skin, exudate', 'Note odour, signs of infection (NERDS/STONES)', 'Pain assessment before and during dressing', 'Choose dressing based on wound type and exudate', 'Photograph with consent — baseline and trend'] },
  { title:'Nasogastric Tube', icon:'🔬', color:'#bf5af2', steps:['Explain procedure, position upright', 'Measure: nose → ear → xiphisternum', 'Lubricate and advance during swallowing', 'NEVER use before confirming position', 'Aspirate: pH ≤ 5.5 confirms gastric — document', 'CXR if pH not obtained — gold standard'] },
]

const NEWS2_TABLE = [
  { param:'RR (per min)', scores:[['≤8','3'],['9-11','1'],['12-20','0'],['21-24','2'],['≥25','3']] },
  { param:'SpO2 Scale 1 (%)', scores:[['≤91','3'],['92-93','2'],['94-95','1'],['≥96','0']] },
  { param:'SBP (mmHg)', scores:[['≤90','3'],['91-100','2'],['101-110','1'],['111-219','0'],['≥220','3']] },
  { param:'HR (per min)', scores:[['≤40','3'],['41-50','1'],['51-90','0'],['91-110','1'],['111-130','2'],['≥131','3']] },
  { param:'Temp (°C)', scores:[['≤35.0','3'],['35.1-36.0','1'],['36.1-38.0','0'],['38.1-39.0','1'],['≥39.1','2']] },
]

const QUIZ_Q = [
  { q:'NEWS2 score ≥ 7 requires?', opts:['Routine obs','4-hourly monitoring','Continuous monitoring + urgent review','Ward doctor review only'], correct:2, explain:'NEWS2 ≥ 7 = HIGH risk. Continuous monitoring + URGENT clinical review within 30 min + consider HDU/ICU.' },
  { q:'Most sensitive early warning sign of deterioration?', opts:['Falling BP','Rising HR','Rising respiratory rate','Falling GCS'], correct:2, explain:'Respiratory rate is the most sensitive early indicator of deterioration — changes before HR or BP. Often poorly recorded.' },
  { q:'NG tube position confirmation — first line?', opts:['CXR','pH of aspirate ≤ 5.5','Listening with stethoscope','Patient reports no discomfort'], correct:1, explain:'pH ≤ 5.5 is first-line confirmation. CXR is gold standard if pH not achievable. NEVER use auscultation alone — unreliable.' },
  { q:'CAUTI prevention — most important intervention?', opts:['Daily chlorhexidine cleaning','Remove catheter ASAP when no longer needed','Antibiotic prophylaxis','Change catheter every 2 weeks'], correct:1, explain:'Removing the catheter as soon as clinically unnecessary is the single most effective CAUTI prevention strategy.' },
  { q:'Correct blood pressure cuff size?', opts:['Always use standard adult cuff','Bladder should cover 80% of arm circumference','Use the largest available','Always use small cuff for accuracy'], correct:1, explain:'Cuff bladder should cover ≥ 80% arm circumference. Wrong size = inaccurate reading. Too small = falsely high BP.' },
]

export default function NursingModule({ onXP }:{ onXP?:(n:number)=>void }) {
  const [view, setView] = useState<'menu'|'vitals'|'skills'|'news2'|'quiz'>('menu')
  const [qIdx, setQIdx] = useState(0)
  const [ans, setAns] = useState<number|null>(null)
  const [score, setScore] = useState(0)
  const [expandedSkill, setExpandedSkill] = useState<number|null>(null)

  if (view === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(100,210,255,0.12),rgba(48,209,88,0.08))',borderRadius:22,padding:'18px',marginBottom:16,border:'1px solid rgba(100,210,255,0.2)'}}>
        <div style={{fontSize:11,color:'rgba(100,210,255,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🩺 NURSING</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Clinical Nursing</div>
        <div style={{fontSize:13,color:C.sub}}>Vitals · Skills · NEWS2 · Quiz</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[
          {id:'vitals',icon:'❤️',label:'Vital Signs Guide',sub:'Normal + Critical ranges',color:'#ff453a'},
          {id:'skills',icon:'💉',label:'Clinical Skills',sub:'IV, catheter, NGT, wounds',color:'#0a84ff'},
          {id:'news2',icon:'📊',label:'NEWS2 Score',sub:'Early warning system',color:'#30d158'},
          {id:'quiz',icon:'🧠',label:'Nursing Quiz',sub:'5 clinical questions',color:'#ffd60a'},
        ].map(t=>(
          <div key={t.id} onClick={()=>{setView(t.id as any);setQIdx(0);setAns(null);setScore(0)}}
            style={{background:`${t.color}10`,borderRadius:20,padding:'16px',border:`1px solid ${t.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${t.color}08`}}>
            <div style={{fontSize:28,marginBottom:8}}>{t.icon}</div>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:3}}>{t.label}</div>
            <div style={{fontSize:11,color:C.sub}}>{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (view === 'vitals') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>❤️ Vital Signs Guide</div>
      </div>
      {VITALS_RANGES.map((v,i)=>(
        <div key={i} style={{background:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${v.color}20`}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:`${v.color}18`,border:`1px solid ${v.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{v.icon}</div>
            <div style={{fontSize:14,fontWeight:800,color:C.text}}>{v.param}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:10}}>
            {[{label:'Normal',value:v.normal,color:'#30d158'},{label:'Concern',value:v.concern,color:'#ff9f0a'},{label:'Critical',value:v.critical,color:'#ff453a'}].map(r=>(
              <div key={r.label} style={{background:`${r.color}10`,borderRadius:10,padding:'8px',border:`1px solid ${r.color}20`,textAlign:'center'}}>
                <div style={{fontSize:9,color:r.color,fontWeight:700,marginBottom:3}}>{r.label}</div>
                <div style={{fontSize:10,color:C.text,fontWeight:600,lineHeight:1.3}}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(10,132,255,0.08)',borderRadius:10,padding:'8px 12px',border:'1px solid rgba(10,132,255,0.15)'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',lineHeight:1.5}}>→ {v.action}</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (view === 'skills') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>💉 Clinical Skills</div>
      </div>
      {SKILLS.map((s,i)=>(
        <div key={i} onClick={()=>setExpandedSkill(expandedSkill===i?null:i)}
          style={{background:expandedSkill===i?`${s.color}08`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${s.color}${expandedSkill===i?'35':'18'}`,cursor:'pointer',transition:'all 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:expandedSkill===i?12:0}}>
            <div style={{width:44,height:44,borderRadius:14,background:`${s.color}18`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>{s.title}</div></div>
            <div style={{fontSize:16,color:`${s.color}60`}}>{expandedSkill===i?'▲':'▼'}</div>
          </div>
          {expandedSkill===i&&s.steps.map((step,j)=>(
            <div key={j} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:j<s.steps.length-1?`1px solid rgba(255,255,255,0.04)`:'none'}}>
              <div style={{width:24,height:24,borderRadius:8,background:`${s.color}20`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:s.color,flexShrink:0}}>{j+1}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>{step}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  if (view === 'news2') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>📊 NEWS2 Score</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:'14px',marginBottom:14,border:`1px solid ${C.border}`,overflowX:'auto'}}>
        {NEWS2_TABLE.map((row,i)=>(
          <div key={i} style={{marginBottom:i<NEWS2_TABLE.length-1?12:0,paddingBottom:i<NEWS2_TABLE.length-1?12:0,borderBottom:i<NEWS2_TABLE.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',fontWeight:700,marginBottom:6}}>{row.param}</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {row.scores.map(([range,score],j)=>(
                <div key={j} style={{background:score==='3'?'rgba(255,69,58,0.15)':score==='2'?'rgba(255,159,10,0.12)':score==='1'?'rgba(255,214,10,0.1)':'rgba(48,209,88,0.1)',borderRadius:8,padding:'5px 8px',border:`1px solid ${score==='3'?'rgba(255,69,58,0.3)':score==='2'?'rgba(255,159,10,0.25)':score==='1'?'rgba(255,214,10,0.2)':'rgba(48,209,88,0.2)'}`,textAlign:'center',minWidth:60}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.7)',marginBottom:2}}>{range}</div>
                  <div style={{fontSize:12,fontWeight:900,color:score==='3'?'#ff453a':score==='2'?'#ff9f0a':score==='1'?'#ffd60a':'#30d158'}}>{score}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {[{score:'1-4',risk:'Low',color:'#30d158',action:'4-hourly obs'},{score:'5-6',risk:'Medium',color:'#ff9f0a',action:'Urgent review'},{score:'≥7',risk:'High',color:'#ff453a',action:'Continuous + ICU'}].map(r=>(
          <div key={r.risk} style={{background:`${r.color}10`,borderRadius:14,padding:'12px',border:`1px solid ${r.color}25`,textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:900,color:r.color,marginBottom:4}}>{r.score}</div>
            <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:4}}>{r.risk}</div>
            <div style={{fontSize:10,color:C.sub,lineHeight:1.4}}>{r.action}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (view === 'quiz') {
    if (qIdx >= QUIZ_Q.length) {
      const xp = score * 20
      return (
        <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:60,marginBottom:12}}>{score>=4?'🏆':'📚'}</div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:4}}>{Math.round((score/QUIZ_Q.length)*100)}%</div>
          <div style={{fontSize:14,color:'#64d2ff',fontWeight:700,marginBottom:20}}>+{xp} XP</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{setQIdx(0);setAns(null);setScore(0)}} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
            <button onClick={()=>{onXP&&onXP(xp);setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#64d2ff,#30d158)',color:'black',fontSize:14,fontWeight:800,cursor:'pointer'}}>+{xp} XP ✓</button>
          </div>
        </div>
      )
    }
    const q = QUIZ_Q[qIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>🧠 Nursing Quiz</div><div style={{fontSize:11,color:C.sub}}>Q{qIdx+1}/{QUIZ_Q.length}</div></div>
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
                <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.4)',flexShrink:0}}>{['A','B','C','D'][i]}</div>
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
            <button onClick={()=>{setQIdx(i=>i+1);setAns(null)}} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#64d2ff,#30d158)',color:'black',fontSize:14,fontWeight:800,cursor:'pointer'}}>
              {qIdx<QUIZ_Q.length-1?'Next →':'Results 🏆'}
            </button>
          </div>
        )}
      </div>
    )
  }
  return null
}
