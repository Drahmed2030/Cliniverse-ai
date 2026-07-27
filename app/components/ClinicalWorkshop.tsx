'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const DifficultConversations = dynamic(() => import('./DifficultConversations'), { ssr: false })

const C = {
  card: 'rgba(255,255,255,0.11)',
  border: 'rgba(139,92,246,0.25)',
  text: 'white',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

// ── SBAR GENERATOR ──
function SBARGenerator() {
  const [form, setForm] = useState({
    patientAge: '', patientSex: 'M', ward: '', time: '',
    situation: '', background: '', pmh: '', meds: '',
    observations: '', bp: '', hr: '', o2: '', temp: '', rr: '', gcs: '',
    assessment: '', recommendation: '',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'form'|'result'>('form')

  const generate = async () => {
    setGenerating(true)
    const prompt = `You are a senior NHS consultant. Generate a professional SBAR clinical handover based on these details. Format it clearly with S/B/A/R headers. Be concise and clinically precise.

Patient: ${form.patientAge}${form.patientSex}, Ward: ${form.ward}, Time: ${form.time}
Situation: ${form.situation}
Background/PMH: ${form.background} ${form.pmh}
Medications: ${form.meds}
Observations: BP ${form.bp} HR ${form.hr} SpO2 ${form.o2}% Temp ${form.temp}°C RR ${form.rr} GCS ${form.gcs}
Assessment: ${form.assessment}
Recommendation: ${form.recommendation}

Generate a complete professional SBAR handover ready for verbal or written communication. Include any safety-netting and clear escalation plan.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text || 'Generation failed')
      setMode('result')
    } catch { setResult('Connection error. Please try again.') }
    setGenerating(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const f = (key: string, val: string) => setForm(p => ({...p, [key]: val}))

  const InputField = ({label, k, placeholder, half}: {label:string, k:string, placeholder?:string, half?:boolean}) => (
    <div style={{flex:half?1:'none',width:half?undefined:'100%',marginBottom:half?0:10}}>
      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4,letterSpacing:0.5}}>{label}</div>
      <input value={(form as any)[k]} onChange={e=>f(k,e.target.value)} placeholder={placeholder||label}
        style={{width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${C.border}`,background:'rgba(255,255,255,0.05)',color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
    </div>
  )

  const TextArea = ({label, k, rows=2}: {label:string, k:string, rows?:number}) => (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4,letterSpacing:0.5}}>{label}</div>
      <textarea value={(form as any)[k]} onChange={e=>f(k,e.target.value)} rows={rows}
        style={{width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${C.border}`,background:'rgba(255,255,255,0.05)',color:C.text,fontSize:12,outline:'none',resize:'none',boxSizing:'border-box'}}/>
    </div>
  )

  if (mode === 'result') return (
    <div style={{paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setMode('form')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Edit</button>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>✅ SBAR Generated</div></div>
        <button onClick={copy} style={{padding:'8px 14px',borderRadius:12,border:'none',background:copied?'rgba(48,209,88,0.2)':'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          {copied?'✓ Copied':'📋 Copy'}
        </button>
      </div>
      <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(10,132,255,0.05))',borderRadius:20,padding:'18px',marginBottom:14,border:'1px solid rgba(139,92,246,0.3)'}}>
        <div style={{fontSize:10,color:'#8b5cf6',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>🤖 AI SBAR HANDOVER</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.85,whiteSpace:'pre-line'}}>{result}</div>
      </div>
      <button onClick={()=>{setForm({patientAge:'',patientSex:'M',ward:'',time:'',situation:'',background:'',pmh:'',meds:'',observations:'',bp:'',hr:'',o2:'',temp:'',rr:'',gcs:'',assessment:'',recommendation:''});setMode('form');setResult('')}}
        style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:13,fontWeight:700,cursor:'pointer'}}>
        🔄 New SBAR
      </button>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}`}</style>
    </div>
  )

  return (
    <div style={{paddingBottom:20}}>
      {/* Patient */}
      <div style={{background:'rgba(10,132,255,0.08)',borderRadius:16,padding:'14px',marginBottom:12,border:'1px solid rgba(10,132,255,0.15)'}}>
        <div style={{fontSize:10,color:'#0a84ff',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>👤 PATIENT</div>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <div style={{flex:2}}><InputField label="AGE" k="patientAge" placeholder="e.g. 58" half/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4,letterSpacing:0.5}}>SEX</div>
            <div style={{display:'flex',gap:6}}>
              {['M','F'].map(s=>(
                <button key={s} onClick={()=>f('patientSex',s)} style={{flex:1,padding:'10px',borderRadius:10,border:form.patientSex===s?'2px solid #0a84ff':`1px solid ${C.border}`,background:form.patientSex===s?'rgba(10,132,255,0.15)':C.card,color:form.patientSex===s?'#0a84ff':C.sub,fontSize:12,fontWeight:700,cursor:'pointer'}}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:2}}><InputField label="WARD / LOCATION" k="ward" placeholder="e.g. Ward 4B, CCU" half/></div>
          <div style={{flex:1}}><InputField label="TIME" k="time" placeholder="e.g. 02:30" half/></div>
        </div>
      </div>

      {/* S — Situation */}
      <div style={{background:'rgba(255,69,58,0.06)',borderRadius:16,padding:'14px',marginBottom:10,border:'1px solid rgba(255,69,58,0.15)'}}>
        <div style={{fontSize:10,color:'#ff453a',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>S — SITUATION</div>
        <TextArea label="Chief complaint / Acute issue" k="situation" rows={2}/>
      </div>

      {/* B — Background */}
      <div style={{background:'rgba(255,159,10,0.06)',borderRadius:16,padding:'14px',marginBottom:10,border:'1px solid rgba(255,159,10,0.15)'}}>
        <div style={{fontSize:10,color:'#ff9f0a',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>B — BACKGROUND</div>
        <TextArea label="Relevant history / admission reason" k="background" rows={2}/>
        <TextArea label="Past medical history (PMH)" k="pmh" rows={1}/>
        <TextArea label="Current medications" k="meds" rows={1}/>
      </div>

      {/* A — Assessment */}
      <div style={{background:'rgba(139,92,246,0.06)',borderRadius:16,padding:'14px',marginBottom:10,border:'1px solid rgba(139,92,246,0.25)'}}>
        <div style={{fontSize:10,color:'#8b5cf6',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>A — ASSESSMENT (Vitals)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
          {[{l:'BP',k:'bp',p:'120/80'},{l:'HR',k:'hr',p:'88'},{l:'SpO2',k:'o2',p:'96'},{l:'Temp°C',k:'temp',p:'37.2'},{l:'RR',k:'rr',p:'18'},{l:'GCS',k:'gcs',p:'15'}].map(v=>(
            <div key={v.k}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>{v.l}</div>
              <input value={(form as any)[v.k]} onChange={e=>f(v.k,e.target.value)} placeholder={v.p}
                style={{width:'100%',padding:'8px 10px',borderRadius:10,border:`1px solid ${C.border}`,background:'rgba(255,255,255,0.05)',color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
            </div>
          ))}
        </div>
        <TextArea label="Clinical assessment / working diagnosis" k="assessment" rows={2}/>
      </div>

      {/* R — Recommendation */}
      <div style={{background:'rgba(48,209,88,0.06)',borderRadius:16,padding:'14px',marginBottom:14,border:'1px solid rgba(48,209,88,0.15)'}}>
        <div style={{fontSize:10,color:'#30d158',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>R — RECOMMENDATION</div>
        <TextArea label="What do you need / suggest?" k="recommendation" rows={2}/>
      </div>

      <button onClick={generate} disabled={generating||!form.situation}
        style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:generating||!form.situation?'rgba(139,92,246,0.3)':'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:15,fontWeight:800,cursor:generating||!form.situation?'not-allowed':'pointer',boxShadow:generating||!form.situation?'none':'0 8px 32px rgba(139,92,246,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
        {generating?(<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Generating SBAR...</>):'🤖 Generate SBAR with AI'}
      </button>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── DISCHARGE WRITER ──
function DischargeWriter() {
  const [form, setForm] = useState({
    diagnosis: '', procedure: '', duration: '', medications: '',
    followup: '', restrictions: '', redflags: '', language: 'English' as 'English'|'Arabic'
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [mode, setMode] = useState<'form'|'result'>('form')
  const [copied, setCopied] = useState(false)
  const f = (k:string, v:string) => setForm(p=>({...p,[k]:v}))

  const generate = async () => {
    setGenerating(true)
    const isArabic = form.language === 'Arabic'
    const prompt = `You are a patient-facing medical writer. Write a clear, simple discharge summary ${isArabic ? 'IN ARABIC' : 'in English'} that a patient with no medical background can understand.

Diagnosis: ${form.diagnosis}
Procedure/Treatment: ${form.procedure}
Hospital stay: ${form.duration}
Medications to take home: ${form.medications}
Follow-up: ${form.followup}
Activity restrictions: ${form.restrictions}
Red flags (when to return): ${form.redflags}

Write in ${isArabic ? 'clear modern Arabic' : 'simple English'} (Grade 6 reading level). Use short sentences. Avoid medical jargon. Include:
1. What happened to you (in simple terms)
2. Your medications (what each one is for, when to take)
3. What to do and not do
4. When to come back / seek help
5. Who to contact

Be warm, reassuring and clear.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1000, messages:[{role:'user',content:prompt}] })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text || 'Failed')
      setMode('result')
    } catch { setResult('Error generating.') }
    setGenerating(false)
  }

  const TextArea = ({label, k, rows=2}:{label:string,k:string,rows?:number}) => (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4,letterSpacing:0.5}}>{label}</div>
      <textarea value={(form as any)[k]} onChange={e=>f(k,e.target.value)} rows={rows}
        style={{width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${C.border}`,background:'rgba(255,255,255,0.05)',color:C.text,fontSize:12,outline:'none',resize:'none',boxSizing:'border-box',direction:form.language==='Arabic'&&k==='diagnosis'?'rtl':'ltr'}}/>
    </div>
  )

  if (mode === 'result') return (
    <div style={{paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setMode('form')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Edit</button>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>📄 Discharge Summary</div><div style={{fontSize:11,color:C.sub}}>{form.language} · Patient-friendly</div></div>
        <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:'8px 14px',borderRadius:12,border:'none',background:copied?'rgba(48,209,88,0.2)':'linear-gradient(135deg,#30d158,#0a84ff)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          {copied?'✓ Copied':'📋 Copy'}
        </button>
      </div>
      <div style={{background:C.card,borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${C.border}`,direction:form.language==='Arabic'?'rtl':'ltr'}}>
        <div style={{fontSize:10,color:'#30d158',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>📋 PATIENT DISCHARGE LETTER</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.9,whiteSpace:'pre-line'}}>{result}</div>
      </div>
      <button onClick={()=>{setMode('form');setResult('')}} style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:13,fontWeight:700,cursor:'pointer'}}>🔄 New Letter</button>
    </div>
  )

  return (
    <div style={{paddingBottom:20}}>
      {/* Language selector */}
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {(['English','Arabic'] as const).map(l=>(
          <button key={l} onClick={()=>f('language',l)} style={{flex:1,padding:'12px',borderRadius:14,border:form.language===l?'2px solid #30d158':`1px solid ${C.border}`,background:form.language===l?'rgba(48,209,88,0.12)':C.card,color:form.language===l?'#30d158':C.sub,fontSize:13,fontWeight:700,cursor:'pointer'}}>
            {l==='English'?'🇬🇧 English':'🇸🇦 العربية'}
          </button>
        ))}
      </div>

      <div style={{background:'rgba(48,209,88,0.06)',borderRadius:16,padding:'14px',marginBottom:10,border:'1px solid rgba(48,209,88,0.15)'}}>
        <div style={{fontSize:10,color:'#30d158',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📋 CLINICAL DETAILS</div>
        <TextArea label="DIAGNOSIS / WHAT WAS FOUND" k="diagnosis" rows={2}/>
        <TextArea label="TREATMENT / PROCEDURE DONE" k="procedure" rows={1}/>
        <TextArea label="HOW LONG IN HOSPITAL" k="duration" rows={1}/>
      </div>

      <div style={{background:'rgba(255,214,10,0.06)',borderRadius:16,padding:'14px',marginBottom:10,border:'1px solid rgba(255,214,10,0.15)'}}>
        <div style={{fontSize:10,color:'#ffd60a',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>💊 GOING HOME</div>
        <TextArea label="MEDICATIONS (name + dose + frequency)" k="medications" rows={3}/>
        <TextArea label="FOLLOW-UP APPOINTMENTS" k="followup" rows={1}/>
        <TextArea label="ACTIVITY RESTRICTIONS" k="restrictions" rows={1}/>
      </div>

      <div style={{background:'rgba(255,69,58,0.06)',borderRadius:16,padding:'14px',marginBottom:14,border:'1px solid rgba(255,69,58,0.15)'}}>
        <div style={{fontSize:10,color:'#ff453a',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>🚨 RED FLAGS — WHEN TO RETURN</div>
        <TextArea label="Symptoms that need urgent attention" k="redflags" rows={2}/>
      </div>

      <button onClick={generate} disabled={generating||!form.diagnosis}
        style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:generating||!form.diagnosis?'rgba(48,209,88,0.3)':'linear-gradient(135deg,#30d158,#0a84ff)',color:'white',fontSize:15,fontWeight:800,cursor:generating||!form.diagnosis?'not-allowed':'pointer',boxShadow:generating||!form.diagnosis?'none':'0 8px 32px rgba(48,209,88,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
        {generating?(<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Writing discharge letter...</>):'📄 Generate Patient Letter'}
      </button>
      <style>{`textarea::placeholder{color:rgba(255,255,255,0.2)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── LOGBOOK HELPER ──
function LogbookHelper() {
  const [form, setForm] = useState({
    specialty:'', caseType:'', role:'', outcome:'', learning:'', challenge:''
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [mode, setMode] = useState<'form'|'result'>('form')
  const [copied, setCopied] = useState(false)
  const f = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const generate = async () => {
    setGenerating(true)
    const prompt = `You are a medical education expert specialising in reflective practice for doctor portfolios (UK/Ireland NHS/RCPI standards).

Write a professional Reflective Practice entry for a doctor's portfolio based on:
Specialty: ${form.specialty}
Case type: ${form.caseType}
Doctor's role: ${form.role}
Patient outcome: ${form.outcome}
Key learning points: ${form.learning}
Challenges faced: ${form.challenge}

Write a structured reflective log using Gibbs Reflective Cycle (Description, Feelings, Evaluation, Analysis, Conclusion, Action Plan). 
- Professional tone suitable for GMC/RCPI portfolio review
- 250-350 words
- De-identified (no patient details)
- Highlight personal and professional development
- Include specific action plan for improvement`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,messages:[{role:'user',content:prompt}]})
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text||'Failed')
      setMode('result')
    } catch { setResult('Error') }
    setGenerating(false)
  }

  const TextArea = ({label,k,rows=2}:{label:string,k:string,rows?:number}) => (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4,letterSpacing:0.5}}>{label}</div>
      <textarea value={(form as any)[k]} onChange={e=>f(k,e.target.value)} rows={rows}
        style={{width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${C.border}`,background:'rgba(255,255,255,0.05)',color:C.text,fontSize:12,outline:'none',resize:'none',boxSizing:'border-box'}}/>
    </div>
  )

  const SPECIALTIES = ['Emergency Medicine','Cardiology','General Medicine','Surgery','Paediatrics','Neurology','Critical Care','Obstetrics','Psychiatry','Orthopaedics']

  if (mode==='result') return (
    <div style={{paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setMode('form')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Edit</button>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>📓 Reflective Log</div><div style={{fontSize:11,color:C.sub}}>GMC/RCPI Portfolio Ready</div></div>
        <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:'8px 14px',borderRadius:12,border:'none',background:copied?'rgba(191,90,242,0.2)':'linear-gradient(135deg,#bf5af2,#8b5cf6)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          {copied?'✓ Copied':'📋 Copy'}
        </button>
      </div>
      <div style={{background:'rgba(191,90,242,0.06)',borderRadius:20,padding:'18px',marginBottom:14,border:'1px solid rgba(191,90,242,0.2)'}}>
        <div style={{fontSize:10,color:'#bf5af2',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>📓 REFLECTIVE PRACTICE — GIBBS CYCLE</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.9,whiteSpace:'pre-line'}}>{result}</div>
      </div>
      <button onClick={()=>{setMode('form');setResult('')}} style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:13,fontWeight:700,cursor:'pointer'}}>🔄 New Entry</button>
    </div>
  )

  return (
    <div style={{paddingBottom:20}}>
      <div style={{background:'rgba(191,90,242,0.08)',borderRadius:16,padding:'12px 14px',marginBottom:14,border:'1px solid rgba(191,90,242,0.2)'}}>
        <div style={{fontSize:12,color:'rgba(191,90,242,0.9)',lineHeight:1.6}}>📓 Generates a professional Reflective Practice entry using Gibbs Reflective Cycle — ready for GMC, RCPI, or ACGME portfolios.</div>
      </div>

      {/* Specialty */}
      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:6,letterSpacing:0.5}}>SPECIALTY</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
        {SPECIALTIES.map(s=>(
          <button key={s} onClick={()=>f('specialty',s)} style={{padding:'6px 12px',borderRadius:10,border:form.specialty===s?'2px solid #bf5af2':`1px solid ${C.border}`,background:form.specialty===s?'rgba(191,90,242,0.15)':C.card,color:form.specialty===s?'#bf5af2':C.sub,fontSize:10,fontWeight:700,cursor:'pointer'}}>
            {s}
          </button>
        ))}
      </div>

      <div style={{background:'rgba(255,255,255,0.11)',borderRadius:16,padding:'14px',marginBottom:14,border:`1px solid ${C.border}`}}>
        <TextArea label="CASE TYPE / CLINICAL SCENARIO" k="caseType" rows={2}/>
        <TextArea label="YOUR ROLE IN THE CASE" k="role" rows={1}/>
        <TextArea label="PATIENT OUTCOME" k="outcome" rows={1}/>
        <TextArea label="KEY LEARNING POINTS" k="learning" rows={2}/>
        <TextArea label="CHALLENGES / DIFFICULTIES FACED" k="challenge" rows={2}/>
      </div>

      <button onClick={generate} disabled={generating||!form.specialty||!form.caseType}
        style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:generating||!form.specialty?'rgba(191,90,242,0.3)':'linear-gradient(135deg,#bf5af2,#8b5cf6)',color:'white',fontSize:15,fontWeight:800,cursor:generating||!form.specialty?'not-allowed':'pointer',boxShadow:generating||!form.specialty?'none':'0 8px 32px rgba(191,90,242,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
        {generating?(<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Writing reflective log...</>):'📓 Generate Portfolio Entry'}
      </button>
      <style>{`textarea::placeholder{color:rgba(255,255,255,0.2)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── MAIN WORKSHOP ──
type Tool = 'menu'|'sbar'|'discharge'|'logbook'|'conversations'

export default function ClinicalWorkshop({ onXP }: { onXP?: (n:number)=>void }) {
  const [tool, setTool] = useState<Tool>('menu')

  const TOOLS = [
    {
      id:'sbar' as Tool,
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      label:'SBAR Generator',
      sub:'AI handover in 30 seconds',
      desc:'NHS/HSE standard SBAR handover generated by AI — saves 30-40 min per shift',
      color:'#0a84ff',
      badge:'NHS STANDARD',
    },
    {
      id:'discharge' as Tool,
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="#30d158" strokeWidth="1.8"/><path d="M12 11v4M10 13h4" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      label:'Discharge Letter Writer',
      sub:'Patient-friendly · EN + AR',
      desc:'Convert complex diagnosis to simple patient letter — reduces complaints & improves CSAT',
      color:'#30d158',
      badge:'ENGLISH + ARABIC',
    },
    {
      id:'conversations' as Tool,
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#ff453a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 10h8M8 14h5" stroke="#ff453a" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      label:'Difficult Conversations',
      sub:'AI patient simulator · 5 scenarios',
      desc:'SPIKES · REMAP · HEARD — practise breaking bad news, angry patients, end-of-life, and more with a realistic AI patient',
      color:'#ff453a',
      badge:'AI PATIENT',
    },
    {
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#bf5af2" strokeWidth="1.8" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#bf5af2" strokeWidth="1.8"/><path d="M8 7h8M8 11h5" stroke="#bf5af2" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      label:'Logbook & Portfolio',
      sub:'Gibbs Reflective Cycle AI',
      desc:'GMC/RCPI/ACGME portfolio entries written in seconds — Gibbs Reflective Cycle format',
      color:'#bf5af2',
      badge:'GMC · RCPI · ACGME',
    },
  ]

  if (tool !== 'menu') {
    const t = TOOLS.find(x=>x.id===tool)!
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setTool('menu')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text}}>{t.label}</div>
            <div style={{fontSize:11,color:C.sub}}>{t.sub}</div>
          </div>
          <div style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:`${t.color}18`,color:t.color,fontWeight:800,border:`1px solid ${t.color}30`}}>{t.badge}</div>
        </div>
        {tool==='sbar'&&<SBARGenerator/>}
        {tool==='discharge'&&<DischargeWriter/>}
        {tool==='logbook'&&<LogbookHelper/>}
        {tool==='conversations'&&<DifficultConversations onXP={onXP}/>}
      </div>
    )
  }

  return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,rgba(10,132,255,0.12),rgba(139,92,246,0.08))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(10,132,255,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-25,right:-25,width:110,height:110,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,132,255,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(10,132,255,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🔧 PROFESSIONAL TOOLS</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Clinical Workshop</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.6}}>AI-powered tools for your daily clinical workflow — SBAR, discharge letters, portfolio</div>
        <div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap'}}>
          {['NHS','HSE Ireland','KSA','ACGME','GMC'].map(b=>(
            <span key={b} style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:'rgba(255,255,255,0.15)',color:C.muted,border:'1px solid rgba(255,255,255,0.18)',fontWeight:700}}>{b}</span>
          ))}
        </div>
      </div>

      {/* Tools */}
      {TOOLS.map(t=>(
        <div key={t.id} onClick={()=>setTool(t.id)}
          style={{background:C.card,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${t.color}20`,cursor:'pointer',boxShadow:`0 4px 24px ${t.color}08`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-20,right:-20,width:90,height:90,borderRadius:'50%',background:`${t.color}08`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:10}}>
            <div style={{width:54,height:54,borderRadius:17,background:`${t.color}15`,border:`1px solid ${t.color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 4px 16px ${t.color}20`,filter:`drop-shadow(0 0 8px ${t.color}50)`}}>{t.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontSize:16,fontWeight:900,color:C.text}}>{t.label}</span>
              </div>
              <div style={{fontSize:11,color:C.sub,marginBottom:6}}>{t.sub}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.6}}>{t.desc}</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:`${t.color}15`,color:t.color,fontWeight:800,border:`1px solid ${t.color}25`}}>{t.badge}</span>
            <span style={{fontSize:11,color:t.color,fontWeight:700}}>Open →</span>
          </div>
        </div>
      ))}

      {/* Coming soon */}
      <div style={{background:'rgba(255,214,10,0.06)',borderRadius:20,padding:'16px',border:'1px solid rgba(255,214,10,0.15)'}}>
        <div style={{fontSize:11,color:'#ffd60a',fontWeight:700,marginBottom:8}}>🚀 Coming Soon</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['Renal Dosing AI','Clinical Risk Calculator','Drug Interaction Checker'].map(s=>(
            <span key={s} style={{fontSize:10,padding:'4px 12px',borderRadius:10,background:'rgba(255,214,10,0.1)',color:'rgba(255,214,10,0.7)',border:'1px solid rgba(255,214,10,0.15)',fontWeight:600}}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
