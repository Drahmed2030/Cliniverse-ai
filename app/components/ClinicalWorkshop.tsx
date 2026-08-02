'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
const DifficultConversations = dynamic(() => import('./DifficultConversations'), { ssr: false })

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

// ── INPUT COMPONENTS ──
const inputStyle = {
  width:'100%', padding:'11px 14px', borderRadius:14,
  border:'1px solid var(--border-card,rgba(255,255,255,0.12))',
  background:'var(--bg-card,rgba(255,255,255,0.06))',
  backdropFilter:'blur(20px)',
  color:'var(--text-primary, #EEF6FA)', fontSize:13, outline:'none',
  boxSizing:'border-box' as const, fontFamily:F,
}

const labelStyle = {
  fontSize:9, color:'var(--text-muted, rgba(238,246,250,0.40))',
  fontWeight:700, marginBottom:5, letterSpacing:1,
  textTransform:'uppercase' as const,
}

// ── SBAR GENERATOR ──
function SBARGenerator() {
  const [form, setForm] = useState({
    patientAge:'', patientSex:'M', ward:'', time:'',
    situation:'', background:'', pmh:'', meds:'',
    bp:'', hr:'', o2:'', temp:'', rr:'', gcs:'',
    assessment:'', recommendation:'',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'form'|'result'>('form')

  const f = (k:string, v:string) => setForm(p=>({...p,[k]:v}))

  const generate = async () => {
    setGenerating(true)
    const prompt = `You are a senior NHS consultant. Generate a professional SBAR clinical handover.
Patient: ${form.patientAge}${form.patientSex}, Ward: ${form.ward}, Time: ${form.time}
Situation: ${form.situation}
Background/PMH: ${form.background} ${form.pmh}
Medications: ${form.meds}
Observations: BP ${form.bp} HR ${form.hr} SpO2 ${form.o2}% Temp ${form.temp}°C RR ${form.rr} GCS ${form.gcs}
Assessment: ${form.assessment}
Recommendation: ${form.recommendation}
Generate a complete professional SBAR handover with S/B/A/R headers. Include safety-netting and escalation plan.`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1000, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text||'Generation failed')
      setMode('result')
    } catch { setResult('Connection error. Please try again.') }
    setGenerating(false)
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  if (mode==='result') return (
    <div style={{paddingBottom:20,fontFamily:F}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button onClick={()=>setMode('form')} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,color:T.sub,padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600,fontFamily:F}}>← Edit</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:T.text}}>✅ SBAR Generated</div>
          <div style={{fontSize:11,color:T.sub}}>Ready to handover</div>
        </div>
        <button onClick={copy} style={{padding:'8px 14px',borderRadius:12,border:'none',background:copied?`${T.green}25`:`linear-gradient(135deg,${T.blue},${T.teal})`,color:'var(--text-primary, white)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,border:copied?`1px solid ${T.green}`:'none'}}>
          {copied?'✓ Copied':'📋 Copy'}
        </button>
      </div>
      <div style={{background:T.glass,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${T.blue}25`,boxShadow:`0 0 20px ${T.blue}10`}}>
        <div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:10,letterSpacing:1}}>🤖 AI SBAR HANDOVER</div>
        <div style={{fontSize:13,color:T.sub,lineHeight:1.85,whiteSpace:'pre-line'}}>{result}</div>
      </div>
      <button onClick={()=>{setForm({patientAge:'',patientSex:'M',ward:'',time:'',situation:'',background:'',pmh:'',meds:'',bp:'',hr:'',o2:'',temp:'',rr:'',gcs:'',assessment:'',recommendation:''});setMode('form');setResult('')}}
        style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
        🔄 New SBAR
      </button>
    </div>
  )

  return (
    <div style={{paddingBottom:20,fontFamily:F}}>
      {/* Patient */}
      <div style={{background:`${T.blue}08`,borderRadius:18,padding:'14px',marginBottom:12,border:`1px solid ${T.blue}18`}}>
        <div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:10,letterSpacing:1}}>👤 PATIENT</div>
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <div style={{flex:2}}>
            <div style={labelStyle}>AGE</div>
            <input value={form.patientAge} onChange={e=>f('patientAge',e.target.value)} placeholder="e.g. 58" style={inputStyle}/>
          </div>
          <div style={{flex:1}}>
            <div style={labelStyle}>SEX</div>
            <div style={{display:'flex',gap:6}}>
              {['M','F'].map(s=>(
                <button key={s} onClick={()=>f('patientSex',s)} style={{flex:1,padding:'11px',borderRadius:12,border:form.patientSex===s?`1.5px solid ${T.blue}`:`1px solid ${T.border}`,background:form.patientSex===s?`${T.blue}18`:T.glass2,color:form.patientSex===s?T.blue:T.sub,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,backdropFilter:'blur(20px)'}}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:2}}>
            <div style={labelStyle}>WARD / LOCATION</div>
            <input value={form.ward} onChange={e=>f('ward',e.target.value)} placeholder="e.g. Ward 4B, CCU" style={inputStyle}/>
          </div>
          <div style={{flex:1}}>
            <div style={labelStyle}>TIME</div>
            <input value={form.time} onChange={e=>f('time',e.target.value)} placeholder="02:30" style={inputStyle}/>
          </div>
        </div>
      </div>

      {/* S */}
      <div style={{background:`${T.red}06`,borderRadius:18,padding:'14px',marginBottom:10,border:`1px solid ${T.red}18`}}>
        <div style={{fontSize:10,color:T.red,fontWeight:700,marginBottom:8,letterSpacing:1}}>S — SITUATION</div>
        <div style={labelStyle}>Chief complaint / Acute issue</div>
        <textarea value={form.situation} onChange={e=>f('situation',e.target.value)} rows={2} style={{...inputStyle,resize:'none'}}/>
      </div>

      {/* B */}
      <div style={{background:`${T.orange}06`,borderRadius:18,padding:'14px',marginBottom:10,border:`1px solid ${T.orange}18`}}>
        <div style={{fontSize:10,color:T.orange,fontWeight:700,marginBottom:8,letterSpacing:1}}>B — BACKGROUND</div>
        <div style={labelStyle}>History / PMH</div>
        <textarea value={form.background} onChange={e=>f('background',e.target.value)} rows={2} style={{...inputStyle,resize:'none',marginBottom:8}}/>
        <div style={labelStyle}>MEDICATIONS</div>
        <textarea value={form.meds} onChange={e=>f('meds',e.target.value)} rows={1} style={{...inputStyle,resize:'none'}}/>
      </div>

      {/* Vitals */}
      <div style={{background:`${T.teal}06`,borderRadius:18,padding:'14px',marginBottom:10,border:`1px solid ${T.teal}18`}}>
        <div style={{fontSize:10,color:T.teal,fontWeight:700,marginBottom:8,letterSpacing:1}}>📊 OBSERVATIONS</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[['BP','bp','120/80'],['HR','hr','72'],['SpO2%','o2','98'],['Temp°C','temp','37.2'],['RR','rr','16'],['GCS','gcs','15']].map(([l,k,p])=>(
            <div key={k}>
              <div style={labelStyle}>{l}</div>
              <input value={(form as any)[k]} onChange={e=>f(k,e.target.value)} placeholder={p} style={inputStyle}/>
            </div>
          ))}
        </div>
      </div>

      {/* A & R */}
      <div style={{background:`${T.purple}06`,borderRadius:18,padding:'14px',marginBottom:14,border:`1px solid ${T.purple}18`}}>
        <div style={{fontSize:10,color:T.purple,fontWeight:700,marginBottom:8,letterSpacing:1}}>A — ASSESSMENT</div>
        <textarea value={form.assessment} onChange={e=>f('assessment',e.target.value)} rows={2} style={{...inputStyle,resize:'none',marginBottom:10}}/>
        <div style={{fontSize:10,color:T.green,fontWeight:700,marginBottom:8,letterSpacing:1}}>R — RECOMMENDATION</div>
        <textarea value={form.recommendation} onChange={e=>f('recommendation',e.target.value)} rows={2} style={{...inputStyle,resize:'none'}}/>
      </div>

      <button onClick={generate} disabled={generating||!form.situation} style={{
        width:'100%', padding:'16px', borderRadius:18, border:'none',
        background:generating||!form.situation?'rgba(0,196,180,0.2)':`linear-gradient(135deg,${T.teal},${T.blue})`,
        color:'var(--text-primary, white)', fontSize:15, fontWeight:800, cursor:generating||!form.situation?'not-allowed':'pointer',
        fontFamily:F, boxShadow:generating||!form.situation?'none':`0 8px 32px ${T.teal}40`,
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      }}>
        {generating?<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Generating SBAR...</>:'🤖 Generate SBAR Handover'}
      </button>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(238,246,250,0.22)}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── DISCHARGE WRITER ──
function DischargeWriter() {
  const [form, setForm] = useState({
    name:'', age:'', diagnosis:'', treatment:'', meds:'', followup:'', language:'EN',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'form'|'result'>('form')

  const f = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const generate = async () => {
    setGenerating(true)
    const lang = form.language==='AR' ? 'Arabic' : 'English'
    const prompt = `Write a patient-friendly discharge letter in ${lang}.
Patient: ${form.name||'Patient'}, Age: ${form.age}
Diagnosis: ${form.diagnosis}
Treatment given: ${form.treatment}
Medications to continue: ${form.meds}
Follow-up: ${form.followup}
Use simple language a patient can understand. Be warm and reassuring. Include red flag symptoms to watch for.`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1000, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text||'Generation failed')
      setMode('result')
    } catch { setResult('Connection error.') }
    setGenerating(false)
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  if (mode==='result') return (
    <div style={{paddingBottom:20,fontFamily:F}}>
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        <button onClick={()=>setMode('form')} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,color:T.sub,padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600,fontFamily:F}}>← Edit</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:T.text}}>✅ Letter Ready</div>
          <div style={{fontSize:11,color:T.sub}}>{form.language==='AR'?'Arabic':'English'} · Patient-friendly</div>
        </div>
        <button onClick={copy} style={{padding:'8px 14px',borderRadius:12,border:copied?`1px solid ${T.green}`:'none',background:copied?`${T.green}20`:`linear-gradient(135deg,${T.green},${T.teal})`,color:'var(--text-primary, white)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>
          {copied?'✓ Copied':'📋 Copy'}
        </button>
      </div>
      <div style={{background:T.glass,backdropFilter:'blur(40px)',borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${T.green}25`}}>
        <div style={{fontSize:10,color:T.green,fontWeight:700,marginBottom:10,letterSpacing:1}}>📄 DISCHARGE LETTER</div>
        <div style={{fontSize:13,color:T.sub,lineHeight:1.85,whiteSpace:'pre-line'}}>{result}</div>
      </div>
      <button onClick={()=>{setResult('');setMode('form')}} style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
        🔄 New Letter
      </button>
    </div>
  )

  return (
    <div style={{paddingBottom:20,fontFamily:F}}>
      <div style={{background:`${T.green}08`,borderRadius:18,padding:'14px',marginBottom:12,border:`1px solid ${T.green}18`}}>
        <div style={{fontSize:10,color:T.green,fontWeight:700,marginBottom:10,letterSpacing:1}}>🌐 LANGUAGE</div>
        <div style={{display:'flex',gap:8}}>
          {[{id:'EN',label:'English'},{id:'AR',label:'العربية'}].map(l=>(
            <button key={l.id} onClick={()=>f('language',l.id)} style={{flex:1,padding:'11px',borderRadius:12,border:form.language===l.id?`1.5px solid ${T.green}`:`1px solid ${T.border}`,background:form.language===l.id?`${T.green}18`:T.glass2,color:form.language===l.id?T.green:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,backdropFilter:'blur(20px)'}}>{l.label}</button>
          ))}
        </div>
      </div>

      <div style={{background:`${T.blue}06`,borderRadius:18,padding:'14px',marginBottom:10,border:`1px solid ${T.blue}18`}}>
        <div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:8,letterSpacing:1}}>👤 PATIENT</div>
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <div style={{flex:2}}>
            <div style={labelStyle}>NAME (optional)</div>
            <input value={form.name} onChange={e=>f('name',e.target.value)} placeholder="Patient name" style={inputStyle}/>
          </div>
          <div style={{flex:1}}>
            <div style={labelStyle}>AGE</div>
            <input value={form.age} onChange={e=>f('age',e.target.value)} placeholder="e.g. 45" style={inputStyle}/>
          </div>
        </div>
      </div>

      {[
        {label:'DIAGNOSIS', k:'diagnosis', color:T.red, placeholder:'e.g. Acute MI, STEMI', rows:2},
        {label:'TREATMENT GIVEN', k:'treatment', color:T.orange, placeholder:'e.g. PCI, thrombolysis, medications', rows:2},
        {label:'MEDICATIONS TO CONTINUE', k:'meds', color:T.purple, placeholder:'e.g. Aspirin 75mg OD, Atorvastatin 40mg ON', rows:2},
        {label:'FOLLOW-UP INSTRUCTIONS', k:'followup', color:T.teal, placeholder:'e.g. Cardiology clinic in 2 weeks, repeat bloods in 1 week', rows:2},
      ].map(({label,k,color,placeholder,rows})=>(
        <div key={k} style={{background:`${color}06`,borderRadius:18,padding:'14px',marginBottom:10,border:`1px solid ${color}18`}}>
          <div style={{fontSize:10,color:color,fontWeight:700,marginBottom:8,letterSpacing:1}}>{label}</div>
          <textarea value={(form as any)[k]} onChange={e=>f(k,e.target.value)} rows={rows} placeholder={placeholder} style={{...inputStyle,resize:'none'}}/>
        </div>
      ))}

      <button onClick={generate} disabled={generating||!form.diagnosis} style={{
        width:'100%', padding:'16px', borderRadius:18, border:'none',
        background:generating||!form.diagnosis?'rgba(52,199,89,0.2)':`linear-gradient(135deg,${T.green},${T.teal})`,
        color:'var(--text-primary, white)', fontSize:15, fontWeight:800, cursor:generating||!form.diagnosis?'not-allowed':'pointer',
        fontFamily:F, boxShadow:generating||!form.diagnosis?'none':`0 8px 32px ${T.green}35`,
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      }}>
        {generating?<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Writing letter...</>:'📄 Generate Discharge Letter'}
      </button>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(238,246,250,0.22)}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── LOGBOOK ──
function LogbookHelper() {
  const [form, setForm] = useState({
    specialty:'', caseType:'', role:'', outcome:'', learning:'', challenge:'',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'form'|'result'>('form')

  const f = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const generate = async () => {
    setGenerating(true)
    const prompt = `Write a professional GMC/RCPI/ACGME portfolio reflective entry using Gibbs Reflective Cycle.
Specialty: ${form.specialty}
Case type: ${form.caseType}
My role: ${form.role}
Patient outcome: ${form.outcome}
Key learning: ${form.learning}
Challenges: ${form.challenge}
Write a structured reflective entry with: Description, Feelings, Evaluation, Analysis, Conclusion, Action Plan. Make it professional, introspective, and suitable for a medical portfolio.`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1000, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text||'Generation failed')
      setMode('result')
    } catch { setResult('Connection error.') }
    setGenerating(false)
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  if (mode==='result') return (
    <div style={{paddingBottom:20,fontFamily:F}}>
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        <button onClick={()=>setMode('form')} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,color:T.sub,padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600,fontFamily:F}}>← Edit</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:T.text}}>✅ Portfolio Entry Ready</div>
          <div style={{fontSize:11,color:T.sub}}>Gibbs Reflective Cycle · GMC/RCPI</div>
        </div>
        <button onClick={copy} style={{padding:'8px 14px',borderRadius:12,border:copied?`1px solid ${T.purple}`:'none',background:copied?`${T.purple}20`:`linear-gradient(135deg,${T.purple},${T.blue})`,color:'var(--text-primary, white)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>
          {copied?'✓ Copied':'📋 Copy'}
        </button>
      </div>
      <div style={{background:T.glass,backdropFilter:'blur(40px)',borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${T.purple}25`}}>
        <div style={{fontSize:10,color:T.purple,fontWeight:700,marginBottom:10,letterSpacing:1}}>📓 PORTFOLIO ENTRY</div>
        <div style={{fontSize:13,color:T.sub,lineHeight:1.85,whiteSpace:'pre-line'}}>{result}</div>
      </div>
      <button onClick={()=>{setResult('');setMode('form')}} style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
        🔄 New Entry
      </button>
    </div>
  )

  return (
    <div style={{paddingBottom:20,fontFamily:F}}>
      {[
        {label:'SPECIALTY', k:'specialty', color:T.blue,   placeholder:'e.g. Cardiology, Emergency Medicine', rows:1},
        {label:'CASE TYPE', k:'caseType',  color:T.teal,   placeholder:'e.g. STEMI, Sepsis, Trauma', rows:1},
        {label:'YOUR ROLE', k:'role',      color:T.orange, placeholder:'e.g. FY1 on call, registrar leading', rows:1},
        {label:'PATIENT OUTCOME', k:'outcome', color:T.green, placeholder:'e.g. Stabilised, discharged, transferred', rows:1},
        {label:'KEY LEARNING', k:'learning', color:T.gold, placeholder:'e.g. STEMI management, team communication', rows:2},
        {label:'CHALLENGES FACED', k:'challenge', color:T.red, placeholder:'e.g. Time pressure, difficult airway', rows:2},
      ].map(({label,k,color,placeholder,rows})=>(
        <div key={k} style={{background:`${color}06`,borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${color}18`}}>
          <div style={{fontSize:10,color:color,fontWeight:700,marginBottom:8,letterSpacing:1}}>{label}</div>
          <textarea value={(form as any)[k]} onChange={e=>f(k,e.target.value)} rows={rows} placeholder={placeholder} style={{...inputStyle,resize:'none'}}/>
        </div>
      ))}

      <button onClick={generate} disabled={generating||!form.specialty||!form.caseType} style={{
        width:'100%', padding:'16px', borderRadius:18, border:'none',
        background:generating||!form.specialty?'rgba(175,82,222,0.2)':`linear-gradient(135deg,${T.purple},${T.blue})`,
        color:'var(--text-primary, white)', fontSize:15, fontWeight:800,
        cursor:generating||!form.specialty?'not-allowed':'pointer',
        fontFamily:F, boxShadow:generating||!form.specialty?'none':`0 8px 32px ${T.purple}35`,
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      }}>
        {generating?<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Writing entry...</>:'📓 Generate Portfolio Entry'}
      </button>
      <style>{`textarea::placeholder{color:rgba(238,246,250,0.22)}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── MAIN COMPONENT ──
type Tool = 'menu'|'sbar'|'discharge'|'logbook'|'conversations'

export default function ClinicalWorkshop({ onXP }: { onXP?: (n:number)=>void }) {
  const [tool, setTool] = useState<Tool>('menu')

  const TOOLS = [
    {
      id:'sbar' as Tool,
      icon:'📋',
      label:'SBAR Generator',
      sub:'AI handover in 30 seconds',
      desc:'NHS/HSE standard SBAR handover generated by AI — saves 30-40 min per shift',
      color:T.blue,
      badge:'NHS STANDARD',
      stats:[{l:'Saves',v:'40 min'},{l:'Standard',v:'NHS/HSE'},{l:'Format',v:'SBAR'}],
    },
    {
      id:'discharge' as Tool,
      icon:'📄',
      label:'Discharge Letter',
      sub:'Patient-friendly · EN + AR',
      desc:'Convert complex diagnosis to simple patient letter — reduces complaints & improves satisfaction',
      color:T.green,
      badge:'EN + ARABIC',
      stats:[{l:'Languages',v:'EN·AR'},{l:'Reduces',v:'Complaints'},{l:'Format',v:'Patient'}],
    },
    {
      id:'conversations' as Tool,
      icon:'💬',
      label:'Difficult Conversations',
      sub:'AI patient simulator · 5 scenarios',
      desc:'SPIKES · REMAP · HEARD — practise breaking bad news and end-of-life with realistic AI patient',
      color:T.red,
      badge:'AI PATIENT',
      stats:[{l:'Scenarios',v:'5'},{l:'Framework',v:'SPIKES'},{l:'Format',v:'AI Sim'}],
    },
    {
      id:'logbook' as Tool,
      icon:'📓',
      label:'Logbook & Portfolio',
      sub:'Gibbs Reflective Cycle AI',
      desc:'GMC/RCPI/ACGME portfolio entries written in seconds — structured reflective cycle format',
      color:T.purple,
      badge:'GMC · RCPI',
      stats:[{l:'Standard',v:'GMC'},{l:'Format',v:'Gibbs'},{l:'Bodies',v:'3'}],
    },
  ]

  if (tool !== 'menu') {
    const t = TOOLS.find(x=>x.id===tool)!
    return (
      <div style={{fontFamily:F,paddingBottom:20}}>
        {/* Back header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
          <button onClick={()=>setTool('menu')} style={{
            background:T.glass, backdropFilter:'blur(20px)',
            border:`1px solid ${T.border}`, borderRadius:14,
            color:T.sub, padding:'9px 16px', fontSize:13,
            cursor:'pointer', fontWeight:700, fontFamily:F,
          }}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>{t.icon} {t.label}</div>
            <div style={{fontSize:11,color:T.sub}}>{t.sub}</div>
          </div>
          <div style={{fontSize:9,padding:'4px 10px',borderRadius:8,background:`${t.color}18`,color:t.color,fontWeight:800,border:`1px solid ${t.color}28`}}>{t.badge}</div>
        </div>
        {tool==='sbar'&&<SBARGenerator/>}
        {tool==='discharge'&&<DischargeWriter/>}
        {tool==='logbook'&&<LogbookHelper/>}
        {tool==='conversations'&&<DifficultConversations onXP={onXP}/>}
      </div>
    )
  }

  return (
    <div style={{fontFamily:F,paddingBottom:20}}>

      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>PROFESSIONAL TOOLS</div>
        <div style={{fontSize:24,fontWeight:900,color:T.text,letterSpacing:-0.5,lineHeight:1.1}}>
          Clinical <span style={{color:T.teal}}>Workshop</span>
        </div>
        <div style={{fontSize:12,color:T.sub,marginTop:4,lineHeight:1.5}}>
          AI-powered tools for your daily clinical workflow
        </div>
        <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
          {['NHS','HSE Ireland','KSA','ACGME','GMC'].map(b=>(
            <span key={b} style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:T.glass2,color:T.muted,border:`1px solid ${T.border}`,fontWeight:700}}>{b}</span>
          ))}
        </div>
      </div>

      {/* Tool cards — Cinematic */}
      {TOOLS.map((t,i) => (
        <div key={t.id} onClick={()=>setTool(t.id)} style={{
          background:T.glass,
          backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
          border:`1.5px solid ${t.color}28`,
          borderRadius:22, padding:'18px', marginBottom:12,
          cursor:'pointer', position:'relative', overflow:'hidden',
          boxShadow:`0 8px 32px rgba(0,0,0,0.15), 0 0 16px ${t.color}10`,
        }}>
          {/* Ambient */}
          <div style={{position:'absolute',top:-40,right:-40,width:150,height:150,borderRadius:'50%',background:`radial-gradient(circle,${t.color}12,transparent 70%)`,pointerEvents:'none'}}/>

          {/* Logo watermark */}
          <div style={{position:'absolute',bottom:10,right:12,opacity:0.05,pointerEvents:'none'}}>
            <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
              <rect x="5" y="5" width="90" height="90" rx="23" stroke="white" strokeWidth="2"/>
              <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"/>
              <path d="M36 50L46 63L70 36" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Header */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{
                width:50,height:50,borderRadius:16,flexShrink:0,
                background:`${t.color}15`, border:`1.5px solid ${t.color}35`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:24, boxShadow:`0 0 16px ${t.color}25`,
              }}>{t.icon}</div>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:T.text,marginBottom:2}}>{t.label}</div>
                <div style={{fontSize:11,color:T.sub}}>{t.sub}</div>
              </div>
            </div>
            <div style={{background:`${t.color}15`,border:`1px solid ${t.color}28`,borderRadius:10,padding:'4px 10px',fontSize:9,color:t.color,fontWeight:700,flexShrink:0}}>{t.badge}</div>
          </div>

          {/* Description */}
          <div style={{fontSize:12,color:T.sub,lineHeight:1.65,marginBottom:14}}>{t.desc}</div>

          {/* Stats */}
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            {t.stats.map(s=>(
              <div key={s.l} style={{flex:1,background:'var(--bg-card,rgba(255,255,255,0.04))',borderRadius:10,padding:'7px 5px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:11,fontWeight:900,color:t.color}}>{s.v}</div>
                <div style={{fontSize:8,color:T.muted,marginTop:2,fontWeight:600}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Open bar */}
          <div style={{background:`linear-gradient(135deg,${t.color}18,${t.color}08)`,border:`1px solid ${t.color}28`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:12,fontWeight:700,color:T.text}}>Open {t.label}</span>
            <span style={{fontSize:16,color:t.color}}>›</span>
          </div>
        </div>
      ))}

      {/* Coming soon */}
      <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}20`,borderRadius:18,padding:'16px'}}>
        <div style={{fontSize:10,color:T.gold,fontWeight:700,marginBottom:8,letterSpacing:1}}>🚀 COMING SOON</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['Renal Dosing AI','Clinical Risk Calculator','Drug Interaction Checker','Progress Note AI'].map(s=>(
            <span key={s} style={{fontSize:10,padding:'4px 12px',borderRadius:10,background:`${T.gold}10`,color:`${T.gold}BB`,border:`1px solid ${T.gold}18`,fontWeight:600}}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
