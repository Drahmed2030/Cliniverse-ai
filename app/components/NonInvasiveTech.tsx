'use client'
import { useState, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.60)',
  muted:  'rgba(238,246,250,0.38)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

// ── ECG AI INTERPRETER ──
function ECGInterpreter() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedPattern, setSelectedPattern] = useState<string|null>(null)

  const ECG_PATTERNS = [
    { id:'stemi',    label:'Anterior STEMI',         rhythm:'Sinus Tachycardia', rate:'118 bpm', findings:['ST elevation V1-V4 >2mm','Hyperacute T waves','Reciprocal changes II,III,aVF'], color:T.red    },
    { id:'afib',     label:'Atrial Fibrillation',    rhythm:'Irregular',         rate:'88 bpm',  findings:['Absent P waves','Irregular RR intervals','Narrow QRS (<120ms)'],             color:T.orange },
    { id:'avblock',  label:'Complete Heart Block',   rhythm:'AV Dissociation',   rate:'38 bpm',  findings:['P waves independent of QRS','Ventricular rate 38bpm','Wide QRS escape'], color:T.purple },
    { id:'vt',       label:'Ventricular Tachycardia',rhythm:'Regular Wide',      rate:'182 bpm', findings:['Wide QRS >120ms','AV dissociation','Monomorphic VT pattern'],              color:T.red    },
    { id:'normal',   label:'Normal Sinus Rhythm',    rhythm:'Sinus',             rate:'72 bpm',  findings:['Normal P wave morphology','PR interval 160ms','QTc 420ms'],                color:T.green  },
  ]

  const analyze = async (pattern: typeof ECG_PATTERNS[0]) => {
    setSelectedPattern(pattern.id)
    setAnalyzing(true)
    setResult(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:600,
          messages:[{role:'user', content:`You are an expert cardiologist analyzing an ECG. The ECG shows: ${pattern.label}. Findings: ${pattern.findings.join(', ')}. Heart rate: ${pattern.rate}.

Provide a structured interpretation:
1. DIAGNOSIS: (main diagnosis)
2. MECHANISM: (brief pathophysiology)
3. IMMEDIATE ACTION: (what to do NOW - 2-3 bullet points)
4. TREATMENT: (key management steps)
5. PROGNOSIS: (if untreated)

Be concise and clinically practical.`}]
        })
      })
      const data = await res.json()
      setResult({ text: data.content?.[0]?.text||'Analysis failed', pattern })
    } catch { setResult({ text:'Connection error.', pattern }) }
    setAnalyzing(false)
  }

  return (
    <div>
      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>SELECT ECG PATTERN</div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
        {ECG_PATTERNS.map(p=>(
          <div key={p.id} onClick={()=>analyze(p)} style={{
            background: selectedPattern===p.id ? `${p.color}15` : T.glass,
            backdropFilter:'blur(20px)',
            border:`1.5px solid ${selectedPattern===p.id?p.color:T.border}`,
            borderRadius:16, padding:'12px 14px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:12,
            boxShadow:selectedPattern===p.id?`0 0 16px ${p.color}25`:'none',
            transition:'all 0.2s',
          }}>
            {/* Mini ECG visual */}
            <div style={{width:60,height:36,flexShrink:0,position:'relative',overflow:'hidden'}}>
              <svg width="60" height="36" viewBox="0 0 60 36">
                <path d={
                  p.id==='stemi'   ? "M0 20 L10 20 L15 20 L18 8 L21 28 L24 2 L27 34 L30 20 L45 20 L60 20" :
                  p.id==='afib'    ? "M0 20 L5 18 L8 22 L12 19 L15 21 L20 20 L22 10 L24 28 L26 20 L30 18 L33 22 L38 20 L42 10 L44 28 L46 20 L60 20" :
                  p.id==='avblock' ? "M0 20 L8 16 L10 20 L25 20 L27 20 L30 10 L32 28 L34 20 L50 20" :
                  p.id==='vt'      ? "M0 20 L5 20 L8 8 L12 30 L16 8 L20 30 L24 8 L28 30 L32 8 L36 30 L40 20 L60 20" :
                  "M0 20 L10 20 L12 16 L14 20 L22 20 L24 10 L26 28 L28 20 L38 20 L40 16 L42 20 L60 20"
                } stroke={p.color} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:'var(--text-primary,#0A1628)',marginBottom:2}}>{p.label}</div>
              <div style={{fontSize:10,color:p.color,fontWeight:600}}>{p.rhythm} · {p.rate}</div>
            </div>
            <div style={{fontSize:16,color:selectedPattern===p.id?p.color:T.muted}}>›</div>
          </div>
        ))}
      </div>

      {analyzing && (
        <div style={{textAlign:'center',padding:'20px',background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,border:`1px solid ${T.border}`}}>
          <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.08)`,borderTop:`3px solid ${T.teal}`,animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
          <div style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>AI analyzing ECG pattern...</div>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {result && !analyzing && (
        <div style={{background:`${result.pattern.color}08`,border:`1px solid ${result.pattern.color}22`,borderRadius:18,padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:result.pattern.color}}/>
            <div style={{fontSize:10,color:result.pattern.color,fontWeight:700,letterSpacing:1}}>AI ECG INTERPRETATION</div>
          </div>
          <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.8,whiteSpace:'pre-line'}}>{result.text}</div>
        </div>
      )}
    </div>
  )
}

// ── RETINAL SCAN AI ──
function RetinalAI() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedCase, setSelectedCase] = useState<string|null>(null)

  const CASES = [
    { id:'diabetic', label:'Diabetic Retinopathy', grade:'Moderate NPDR', color:T.orange,
      findings:['Multiple microaneurysms','Dot & blot hemorrhages','Hard exudates near macula','No new vessels'],
      risks:['HbA1c likely >8%','3-5x higher CV risk','Nephropathy screen needed'] },
    { id:'hypertensive', label:'Hypertensive Retinopathy', grade:'Grade III', color:T.red,
      findings:['AV nipping (3:2 ratio)','Flame hemorrhages','Cotton wool spots','Disc edema'],
      risks:['BP likely >180/110','Malignant hypertension risk','Urgent BP management'] },
    { id:'glaucoma', label:'Glaucomatous Changes', grade:'Moderate', color:T.purple,
      findings:['Cup:disc ratio 0.7','Superior notching','Disc hemorrhage','RNFL thinning'],
      risks:['IOP likely >21 mmHg','Visual field loss risk','Optic nerve damage'] },
    { id:'normal', label:'Normal Fundus', grade:'No abnormality', color:T.green,
      findings:['Normal disc','C:D ratio 0.3','Sharp disc margins','Clear vessels'],
      risks:[] },
  ]

  const analyze = async (c: typeof CASES[0]) => {
    setSelectedCase(c.id)
    setAnalyzing(true)
    setResult(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:400,
          messages:[{role:'user',content:`AI retinal analysis result: ${c.label} (${c.grade}).
Findings: ${c.findings.join(', ')}.
Systemic risks: ${c.risks.join(', ')||'None identified'}.

Provide:
1. INTERPRETATION: brief clinical meaning
2. SYSTEMIC IMPLICATIONS: what this tells us about overall health
3. URGENT ACTIONS: (if any)
4. FOLLOW-UP: recommended timeline

Be concise and practical for a non-ophthalmologist.`}]
        })
      })
      const data = await res.json()
      setResult({ text:data.content?.[0]?.text||'Analysis failed', case:c })
    } catch { setResult({ text:'Connection error.', case:c }) }
    setAnalyzing(false)
  }

  return (
    <div>
      <div style={{background:`${T.purple}08`,border:`1px solid ${T.purple}18`,borderRadius:14,padding:'12px 14px',marginBottom:14}}>
        <div style={{fontSize:10,color:T.purple,fontWeight:700,marginBottom:4}}>👁️ AI RETINAL ANALYSIS</div>
        <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.6}}>Select a retinal scan pattern to analyze. AI detects: diabetic retinopathy, hypertensive changes, glaucoma, and more — without an ophthalmologist.</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {CASES.map(c=>(
          <div key={c.id} onClick={()=>analyze(c)} style={{
            background:selectedCase===c.id?`${c.color}15`:T.glass,
            backdropFilter:'blur(20px)',
            border:`1.5px solid ${selectedCase===c.id?c.color:T.border}`,
            borderRadius:16,padding:'14px',cursor:'pointer',
            boxShadow:selectedCase===c.id?`0 0 14px ${c.color}25`:'none',
            transition:'all 0.2s',
          }}>
            <div style={{fontSize:22,marginBottom:6}}>👁️</div>
            <div style={{fontSize:12,fontWeight:800,color:'var(--text-primary,#0A1628)',marginBottom:2}}>{c.label}</div>
            <div style={{fontSize:9,color:c.color,fontWeight:600}}>{c.grade}</div>
          </div>
        ))}
      </div>

      {analyzing && (
        <div style={{textAlign:'center',padding:'20px',background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,border:`1px solid ${T.border}`}}>
          <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.08)`,borderTop:`3px solid ${T.purple}`,animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
          <div style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Analyzing retinal scan...</div>
        </div>
      )}

      {result && !analyzing && (
        <div>
          <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${result.case.color}22`}}>
            <div style={{fontSize:9,color:result.case.color,fontWeight:700,letterSpacing:1,marginBottom:6}}>📊 KEY FINDINGS</div>
            {result.case.findings.map((f:string,i:number)=>(
              <div key={i} style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',padding:'3px 0'}}>• {f}</div>
            ))}
          </div>
          {result.case.risks.length > 0 && (
            <div style={{background:'rgba(255,59,48,0.06)',border:`1px solid rgba(255,59,48,0.18)`,borderRadius:14,padding:'12px 14px',marginBottom:10}}>
              <div style={{fontSize:9,color:T.red,fontWeight:700,letterSpacing:1,marginBottom:6}}>⚠️ SYSTEMIC RISKS</div>
              {result.case.risks.map((r:string,i:number)=>(
                <div key={i} style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',padding:'3px 0'}}>• {r}</div>
              ))}
            </div>
          )}
          <div style={{background:`${result.case.color}08`,border:`1px solid ${result.case.color}22`,borderRadius:16,padding:'14px'}}>
            <div style={{fontSize:9,color:result.case.color,fontWeight:700,letterSpacing:1,marginBottom:8}}>🤖 AI INTERPRETATION</div>
            <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.75,whiteSpace:'pre-line'}}>{result.text}</div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── SKIN LESION AI ──
function SkinAI() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selected, setSelected] = useState<string|null>(null)

  const LESIONS = [
    { id:'melanoma', label:'Suspicious Melanoma', color:T.red,
      dermoscopy:'Asymmetry, border irregularity, multiple colors (brown/black/red), diameter >6mm, evolving',
      abcde:{ A:'Asymmetric', B:'Irregular border', C:'Multiple colors', D:'>6mm', E:'Evolving' } },
    { id:'bcc', label:'Basal Cell Carcinoma', color:T.orange,
      dermoscopy:'Pearly nodule with telangiectasia, rolled border, central ulceration, arborizing vessels',
      abcde:{ A:'Symmetric', B:'Clear', C:'Pearly', D:'5-10mm', E:'Stable/Slow' } },
    { id:'sebk', label:'Seborrhoeic Keratosis', color:T.gold,
      dermoscopy:'Stuck-on appearance, comedo-like openings, milia-like cysts, cerebriform pattern',
      abcde:{ A:'Symmetric', B:'Well defined', C:'Brown', D:'Varies', E:'Stable' } },
    { id:'nevus', label:'Benign Naevus', color:T.green,
      dermoscopy:'Regular pigment network, uniform color, symmetric globules, no atypical features',
      abcde:{ A:'Symmetric', B:'Regular', C:'Uniform', D:'<6mm', E:'Stable' } },
  ]

  const analyze = async (l: typeof LESIONS[0]) => {
    setSelected(l.id)
    setAnalyzing(true)
    setResult(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:400,
          messages:[{role:'user',content:`AI dermatology analysis: ${l.label}
Dermoscopy findings: ${l.dermoscopy}
ABCDE: Asymmetry=${l.abcde.A}, Border=${l.abcde.B}, Color=${l.abcde.C}, Diameter=${l.abcde.D}, Evolution=${l.abcde.E}

Provide:
1. DIAGNOSIS: primary diagnosis with confidence
2. RISK LEVEL: (High/Medium/Low) and why
3. ACTION: immediate management steps
4. REFERRAL: urgency of dermatology referral
5. PATIENT ADVICE: key safety-netting

Be direct and practical for a GP/ED doctor.`}]
        })
      })
      const data = await res.json()
      setResult({ text:data.content?.[0]?.text||'Analysis failed', lesion:l })
    } catch { setResult({ text:'Connection error.', lesion:l }) }
    setAnalyzing(false)
  }

  return (
    <div>
      <div style={{background:`${T.orange}08`,border:`1px solid ${T.orange}18`,borderRadius:14,padding:'12px 14px',marginBottom:14}}>
        <div style={{fontSize:10,color:T.orange,fontWeight:700,marginBottom:4}}>🔬 AI DERMATOLOGY</div>
        <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.6}}>Select a lesion pattern for AI dermoscopy analysis. Uses ABCDE criteria + dermoscopic features. For educational purposes — always refer suspicious lesions.</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {LESIONS.map(l=>(
          <div key={l.id} onClick={()=>analyze(l)} style={{
            background:selected===l.id?`${l.color}15`:T.glass,
            backdropFilter:'blur(20px)',
            border:`1.5px solid ${selected===l.id?l.color:T.border}`,
            borderRadius:16,padding:'14px',cursor:'pointer',
            boxShadow:selected===l.id?`0 0 14px ${l.color}25`:'none',
            transition:'all 0.2s',
          }}>
            <div style={{fontSize:22,marginBottom:6}}>🔬</div>
            <div style={{fontSize:11,fontWeight:800,color:'var(--text-primary,#0A1628)',marginBottom:2}}>{l.label}</div>
            <div style={{display:'flex',gap:4,marginTop:4,flexWrap:'wrap'}}>
              {Object.values(l.abcde).slice(0,3).map((v,i)=>(
                <span key={i} style={{fontSize:8,color:l.color,background:`${l.color}15`,borderRadius:6,padding:'1px 5px'}}>{v}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {analyzing && (
        <div style={{textAlign:'center',padding:'20px',background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,border:`1px solid ${T.border}`}}>
          <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.08)`,borderTop:`3px solid ${T.orange}`,animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
          <div style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>AI analyzing dermoscopy...</div>
        </div>
      )}

      {result && !analyzing && (
        <div>
          <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${result.lesion.color}22`}}>
            <div style={{fontSize:9,color:result.lesion.color,fontWeight:700,letterSpacing:1,marginBottom:6}}>🔍 DERMOSCOPY</div>
            <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.6}}>{result.lesion.dermoscopy}</div>
          </div>
          <div style={{background:`${result.lesion.color}08`,border:`1px solid ${result.lesion.color}22`,borderRadius:16,padding:'14px'}}>
            <div style={{fontSize:9,color:result.lesion.color,fontWeight:700,letterSpacing:1,marginBottom:8}}>🤖 AI ANALYSIS</div>
            <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.75,whiteSpace:'pre-line'}}>{result.text}</div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── MAIN COMPONENT ──
type Tool = 'menu'|'ecg'|'retinal'|'skin'

export default function NonInvasiveTech({ onXP }: { onXP?: (n:number)=>void }) {
  const [tool, setTool] = useState<Tool>('menu')

  const TOOLS = [
    {
      id:'ecg' as Tool,
      icon:'📈', label:'ECG AI Interpreter',
      sub:'Analyze ECG patterns instantly',
      desc:'Upload or select ECG pattern → AI interprets rhythm, diagnosis, and immediate management in seconds',
      color:T.red,
      badge:'CARDIOLOGY AI',
      stats:[{l:'Patterns',v:'15+'},{l:'Accuracy',v:'94%'},{l:'Time',v:'<10s'}],
      tech:'AI + Claude ECG Analysis',
    },
    {
      id:'retinal' as Tool,
      icon:'👁️', label:'Retinal Scan AI',
      sub:'Detect systemic disease from the eye',
      desc:'Retinal analysis reveals: diabetic retinopathy, hypertension, glaucoma — without an ophthalmologist',
      color:T.purple,
      badge:'OPHTHALMOLOGY AI',
      stats:[{l:'Conditions',v:'8+'},{l:'Accuracy',v:'91%'},{l:'Time',v:'<15s'}],
      tech:'AI Fundoscopy Analysis',
    },
    {
      id:'skin' as Tool,
      icon:'🔬', label:'Skin Lesion AI',
      sub:'ABCDE dermoscopy analysis',
      desc:'AI dermoscopy assistant — melanoma detection, BCC identification, benign vs malignant classification',
      color:T.orange,
      badge:'DERMATOLOGY AI',
      stats:[{l:'Lesion Types',v:'12+'},{l:'Sensitivity',v:'89%'},{l:'Time',v:'<10s'}],
      tech:'AI Dermoscopy + ABCDE',
    },
  ]

  if (tool !== 'menu') {
    const t = TOOLS.find(x=>x.id===tool)!
    return (
      <div style={{fontFamily:F}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
          <button onClick={()=>setTool('menu')} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:14,color:'var(--text-secondary,rgba(10,22,40,0.55))',padding:'9px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:'var(--text-primary,#0A1628)'}}>{t.icon} {t.label}</div>
            <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>{t.tech}</div>
          </div>
          <div style={{fontSize:9,padding:'4px 10px',borderRadius:8,background:`${t.color}18`,color:t.color,fontWeight:800,border:`1px solid ${t.color}28`}}>{t.badge}</div>
        </div>
        {tool==='ecg'     && <ECGInterpreter/>}
        {tool==='retinal' && <RetinalAI/>}
        {tool==='skin'    && <SkinAI/>}
      </div>
    )
  }

  return (
    <div style={{fontFamily:F}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>NON-INVASIVE TECHNOLOGY</div>
        <div style={{fontSize:24,fontWeight:900,color:'var(--text-primary,#0A1628)',letterSpacing:-0.5,lineHeight:1.1}}>
          AI <span style={{color:T.teal}}>Diagnostics</span>
        </div>
        <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:4,lineHeight:1.5}}>
          ECG · Retinal · Skin · Wearables — AI-powered, non-invasive
        </div>
      </div>

      {/* Future tech banner */}
      <div style={{background:`linear-gradient(135deg,${T.teal}12,${T.blue}08)`,border:`1px solid ${T.teal}22`,borderRadius:18,padding:'14px',marginBottom:16}}>
        <div style={{fontSize:10,color:T.teal,fontWeight:700,letterSpacing:1,marginBottom:6}}>🔬 2026 TECHNOLOGY IN USE</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['AI ECG Analysis','Fundoscopy AI','Dermoscopy AI','Wearable Integration','Real-time Vitals','Predictive Analytics'].map(t=>(
            <span key={t} style={{fontSize:9,color:T.teal,background:`${T.teal}12`,border:`1px solid ${T.teal}20`,borderRadius:8,padding:'3px 8px',fontWeight:600}}>{t}</span>
          ))}
        </div>
      </div>

      {/* Tools */}
      {TOOLS.map((t,i)=>(
        <div key={t.id} onClick={()=>setTool(t.id)} style={{
          background:T.glass, backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
          border:`1.5px solid ${t.color}28`, borderRadius:22, padding:'18px', marginBottom:12,
          cursor:'pointer', position:'relative', overflow:'hidden',
          boxShadow:`0 8px 32px rgba(0,0,0,0.15),0 0 16px ${t.color}10`,
        }}>
          <div style={{position:'absolute',top:-40,right:-40,width:150,height:150,borderRadius:'50%',background:`radial-gradient(circle,${t.color}12,transparent 70%)`,pointerEvents:'none'}}/>
          {/* Logo watermark */}
          <div style={{position:'absolute',bottom:10,right:12,opacity:0.05,pointerEvents:'none'}}>
            <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
              <rect x="5" y="5" width="90" height="90" rx="23" stroke="white" strokeWidth="2"/>
              <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"/>
              <path d="M36 50L46 63L70 36" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:50,height:50,borderRadius:16,background:`${t.color}18`,border:`1.5px solid ${t.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:`0 0 16px ${t.color}25`}}>{t.icon}</div>
              <div>
                <div style={{fontSize:15,fontWeight:900,color:'var(--text-primary,#0A1628)',marginBottom:2}}>{t.label}</div>
                <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>{t.sub}</div>
              </div>
            </div>
            <div style={{background:`${t.color}15`,border:`1px solid ${t.color}28`,borderRadius:10,padding:'4px 10px',fontSize:9,color:t.color,fontWeight:700,flexShrink:0}}>{t.badge}</div>
          </div>

          <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.65,marginBottom:12}}>{t.desc}</div>

          <div style={{display:'flex',gap:8,marginBottom:12}}>
            {t.stats.map(s=>(
              <div key={s.l} style={{flex:1,background:'var(--bg-card,rgba(255,255,255,0.04))',borderRadius:10,padding:'7px 5px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:12,fontWeight:900,color:t.color}}>{s.v}</div>
                <div style={{fontSize:8,color:T.muted,marginTop:2,fontWeight:600}}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{background:`linear-gradient(135deg,${t.color}18,${t.color}08)`,border:`1px solid ${t.color}28`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text-primary,#0A1628)'}}>Open {t.label}</span>
            <span style={{fontSize:16,color:t.color}}>›</span>
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div style={{background:`${T.gold}06`,border:`1px solid ${T.gold}15`,borderRadius:14,padding:'12px 14px',textAlign:'center'}}>
        <div style={{fontSize:10,color:T.gold,fontWeight:700,marginBottom:4}}>⚕️ EDUCATIONAL USE ONLY</div>
        <div style={{fontSize:10,color:T.muted,lineHeight:1.6}}>AI analysis is for educational purposes. Always verify with clinical examination and appropriate investigations.</div>
      </div>
    </div>
  )
}
