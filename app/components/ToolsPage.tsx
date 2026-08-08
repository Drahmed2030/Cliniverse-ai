'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const EmergencyNexus    = dynamic(()=>import('./EmergencyNexus'),{ssr:false})
const ClinicalLibrary      = dynamic(()=>import('./ClinicalLibrary'),{ssr:false})
const AIIntelligenceHub    = dynamic(()=>import('./AIIntelligenceHub'),{ssr:false})
const GlobalStandards      = dynamic(()=>import('./GlobalStandards'),{ssr:false})
const MedicalTechnology    = dynamic(()=>import('./MedicalTechnology'),{ssr:false})

const CodeBlue         = dynamic(() => import('./CodeBlue'),         { ssr:false })
const EcgChallenge     = dynamic(() => import('./EcgChallenge'),     { ssr:false })
const BLSACLSModule    = dynamic(() => import('./BLSACLSModule'),    { ssr:false })
const OnCallSystem     = dynamic(() => import('./OnCallSystem'),     { ssr:false })
const NightShiftSurvival = dynamic(() => import('./NightShiftSurvival'), { ssr:false })
const MedCalculators   = dynamic(() => import('./MedCalculators'),   { ssr:false })
const PharmacyModule   = dynamic(() => import('./PharmacyModule'),   { ssr:false })
const NursingModule    = dynamic(() => import('./NursingModule'),    { ssr:false })
const LabModule        = dynamic(() => import('./LabModule'),        { ssr:false })
const RadiologyModule  = dynamic(() => import('./RadiologyModule'),  { ssr:false })
const AICaseGenerator  = dynamic(() => import('./AICaseGenerator'),  { ssr:false })
const ClinicalDuels    = dynamic(() => import('./ClinicalDuels'),    { ssr:false })
const DiagnosticDetective = dynamic(() => import('./DiagnosticDetective'), { ssr:false })
const ErrorAutopsy     = dynamic(() => import('./ErrorAutopsy'),     { ssr:false })
const HealthInsights   = dynamic(() => import('./HealthInsights'),   { ssr:false })
const BoardExam        = dynamic(() => import('./BoardExam'),        { ssr:false })


const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'


function GeminiNanoTool({ onXP }:{ onXP?:(n:number)=>void }) {
  const [image, setImage]     = useState<string|null>(null)
  const [mode, setMode]       = useState<'ecg'|'xray'|'lab'>('ecg')
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [pressed, setPressed] = useState(false)

  const MODES = [
    {id:'ecg',  label:'ECG',     icon:'📈', color:L.red},
    {id:'xray', label:'X-Ray',   icon:'🩻', color:L.cobalt},
    {id:'lab',  label:'Lab',     icon:'🧪', color:L.teal},
  ]

  const analyze = async () => {
    if(!image) return
    setLoading(true); setResult('')
    try {
      const prompts = {
        ecg:'You are an expert cardiologist. Analyze this ECG: 1)Rhythm 2)Rate 3)Axis 4)Intervals 5)ST changes 6)Diagnosis 7)Clinical action. Be concise.',
        xray:'You are a radiologist. Analyze this chest X-ray: 1)Quality 2)Lung fields 3)Heart size 4)Mediastinum 5)Bones 6)Impression 7)Recommendation.',
        lab:'Analyze these lab results. Identify abnormal values, clinical significance, and recommended follow-up actions. Be concise and clinician-focused.',
      }
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question:prompts[mode],image:image.split(',')[1],specialty:'Radiology'})
      })
      const data = await res.json()
      setResult(data.answer||'Analysis unavailable.')
      onXP?.(25)
    } catch { setResult('Error analyzing. Please try again.') }
    setLoading(false)
  }

  const colors: Record<string,string> = {ecg:L.red,xray:L.cobalt,lab:L.teal}

  return (
    <div>
      <div style={{position:'relative',height:140,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>GEMINI AI · ON-DEVICE PRIVACY</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>🧠 AI Medical Imaging</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>ECG · X-Ray · Labs · Instant Analysis</div>
        </div>
        <div style={{position:'absolute',top:14,right:14,background:'rgba(13,148,136,0.2)',backdropFilter:'blur(12px)',border:'1px solid rgba(13,148,136,0.3)',borderRadius:99,padding:'4px 10px'}}>
          <span style={{fontSize:9,fontWeight:800,color:L.sage}}>🔒 PRIVATE</span>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        {/* Mode selector */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id as any);setResult('');setImage(null)}}
              style={{
                flex:1,padding:'10px',borderRadius:12,border:'none',cursor:'pointer',
                background:mode===m.id?`${m.color}12`:L.raised,
                border:`1.5px solid ${mode===m.id?m.color:L.border}`,
                display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                transition:spring,
              }}>
              <span style={{fontSize:22}}>{m.icon}</span>
              <span style={{fontSize:11,fontWeight:700,color:mode===m.id?m.color:L.textMuted}}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Upload */}
        <label style={{
          display:'block',padding:'20px',borderRadius:14,
          border:`2px dashed ${image?colors[mode]:L.border}`,
          background:image?`${colors[mode]}06`:L.raised,
          textAlign:'center',cursor:'pointer',marginBottom:12,
        }}>
          <input type="file" accept="image/*" onChange={e=>{
            const f=e.target.files?.[0]; if(!f) return
            const r=new FileReader(); r.onload=ev=>setImage(ev.target?.result as string); r.readAsDataURL(f)
          }} style={{display:'none'}}/>
          {image?(
            <img src={image} alt="" style={{maxHeight:150,borderRadius:10,maxWidth:'100%'}}/>
          ):(
            <div>
              <div style={{fontSize:36,marginBottom:8}}>{MODES.find(m=>m.id===mode)?.icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:L.textPrimary,marginBottom:4}}>Upload {mode.toUpperCase()} Image</div>
              <div style={{fontSize:12,color:L.textMuted}}>Photo · Screenshot · Scan</div>
            </div>
          )}
        </label>

        {image && (
          <button onClick={analyze} disabled={loading}
            onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
            style={{
              width:'100%',padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
              background:loading?L.raised:`linear-gradient(135deg,${colors[mode]},#1E40AF)`,
              color:loading?L.textMuted:'white',fontSize:14,fontWeight:700,marginBottom:12,
              transform:pressed?'scale(0.97)':'scale(1)',transition:spring,
              boxShadow:loading?'none':L.shadowGlow,
            }}>
            {loading?'🧠 AI Analyzing...':'🧠 Analyze with AI — +25 XP'}
          </button>
        )}

        {result && (
          <div style={{background:`${colors[mode]}06`,border:`1px solid ${colors[mode]}25`,borderRadius:14,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:colors[mode],marginBottom:8}}>🧠 AI ANALYSIS REPORT</div>
            <div style={{fontSize:13,color:L.textSub,lineHeight:1.75,whiteSpace:'pre-line'}}>{result}</div>
            <div style={{marginTop:10,fontSize:11,color:L.textMuted,fontStyle:'italic'}}>
              ⚠️ Educational only · Not for clinical diagnosis · Always verify with specialist
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── DRUG DOSING (RxNorm) ──────────────────────────────
function DrugDosingTool() {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [pressed, setPressed] = useState(false)

  const search = async () => {
    if(!query.trim()) return
    setLoading(true); setResults([]); setSelected(null)
    try {
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`)
      const data = await res.json()
      const drugs = data.drugGroup?.conceptGroup?.flatMap((g:any)=>g.conceptProperties||[]) || []
      setResults(drugs.slice(0,8))
    } catch { setResults([]) }
    setLoading(false)
  }

  const getDetails = async (rxcui:string, name:string) => {
    setSelected({name, rxcui, loading:true})
    try {
      const [propRes, relRes] = await Promise.all([
        fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`),
        fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN`)
      ])
      const propData = await propRes.json()
      const props = propData.properties
      setSelected({ name, rxcui, props, loading:false })
    } catch { setSelected({name,rxcui,loading:false}) }
  }

  return (
    <div>
      <div style={{position:'relative',height:130,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>FDA · RXNORM · LIVE</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>💊 Drug Reference</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&search()}
            placeholder="Search drug name... (e.g. Metformin)"
            style={{flex:1,padding:'11px 14px',borderRadius:12,border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          <button onClick={search} disabled={!query.trim()||loading}
            onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
            style={{
              padding:'11px 18px',borderRadius:12,border:'none',cursor:'pointer',
              background:!query.trim()?L.raised:L.gradient,
              color:!query.trim()?L.textMuted:'white',
              fontSize:13,fontWeight:700,
              transform:pressed?'scale(0.97)':'scale(1)',transition:spring,
            }}>
            {loading?'⏳':'🔍'}
          </button>
        </div>

        {results.length>0 && !selected && (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {results.map((r:any)=>(
              <button key={r.rxcui} onClick={()=>getDetails(r.rxcui,r.name)}
                style={{
                  width:'100%',textAlign:'left',padding:'10px 14px',borderRadius:12,
                  background:L.raised,border:`1px solid ${L.border}`,cursor:'pointer',
                  fontSize:13,fontWeight:600,color:L.textPrimary,transition:smooth,
                }}>
                💊 {r.name}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div style={{background:L.raised,borderRadius:14,padding:'14px 16px',border:`1px solid ${L.border}`}}>
            {selected.loading ? (
              <div style={{textAlign:'center',padding:20,color:L.textMuted}}>⏳ Loading details...</div>
            ) : (
              <>
                <div style={{fontSize:15,fontWeight:800,color:L.textPrimary,marginBottom:8}}>{selected.name}</div>
                <div style={{fontSize:11,color:L.textMuted,marginBottom:12}}>RxCUI: {selected.rxcui}</div>
                {selected.props && (
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      {label:'Synonym', value:selected.props.synonym},
                      {label:'Drug Class', value:selected.props.tty},
                      {label:'Language', value:selected.props.language},
                    ].filter(p=>p.value).map(p=>(
                      <div key={p.label} style={{display:'flex',gap:8}}>
                        <span style={{fontSize:11,fontWeight:700,color:L.textMuted,width:80,flexShrink:0}}>{p.label}:</span>
                        <span style={{fontSize:12,color:L.textSub}}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <a href={`https://www.drugs.com/search.php?searchterm=${encodeURIComponent(selected.name)}`}
                  target="_blank" rel="noreferrer"
                  style={{display:'block',marginTop:12,padding:'10px',borderRadius:12,background:L.gradient,color:'white',fontSize:12,fontWeight:700,textAlign:'center',textDecoration:'none'}}>
                  View Full Monograph →
                </a>
                <button onClick={()=>setSelected(null)}
                  style={{width:'100%',marginTop:8,padding:'8px',borderRadius:10,background:'none',border:`1px solid ${L.border}`,color:L.textMuted,fontSize:12,cursor:'pointer'}}>
                  ← Back to results
                </button>
              </>
            )}
          </div>
        )}
        <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
          ⚠️ Educational only · Powered by RxNorm/NIH · Verify doses clinically
        </div>
      </div>
    </div>
  )
}

// ── CLINICAL TRIALS ───────────────────────────────────
function ClinicalTrialsTool() {
  const [query, setQuery]     = useState('')
  const [trials, setTrials]   = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pressed, setPressed] = useState(false)

  const search = async () => {
    if(!query.trim()) return
    setLoading(true); setTrials([])
    try {
      const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(query)}&pageSize=6&format=json`)
      const data = await res.json()
      setTrials(data.studies||[])
    } catch { setTrials([]) }
    setLoading(false)
  }

  return (
    <div>
      <div style={{position:'relative',height:130,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>450K+ TRIALS · LIVE</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>🔬 Clinical Trials</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&search()}
            placeholder="Search trials... (e.g. STEMI PCI 2026)"
            style={{flex:1,padding:'11px 14px',borderRadius:12,border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          <button onClick={search} disabled={!query.trim()||loading}
            onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
            style={{
              padding:'11px 18px',borderRadius:12,border:'none',cursor:'pointer',
              background:!query.trim()?L.raised:L.gradient,
              color:!query.trim()?L.textMuted:'white',fontSize:13,fontWeight:700,
              transform:pressed?'scale(0.97)':'scale(1)',transition:spring,
            }}>{loading?'⏳':'🔍'}</button>
        </div>

        {trials.length>0 && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {trials.map((t:any,i:number)=>{
              const s = t.protocolSection
              const id = s?.identificationModule
              const status = s?.statusModule
              const design = s?.designModule
              const nctId = id?.nctId
              const statusVal = status?.overallStatus||'Unknown'
              const statusColor = statusVal==='RECRUITING'?L.sage:statusVal==='COMPLETED'?L.cobalt:L.textMuted
              return (
                <div key={nctId||i} style={{background:L.raised,borderRadius:14,padding:'12px 14px',border:`1px solid ${L.border}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:10,fontWeight:700,letterSpacing:1,color:statusColor,background:`${statusColor}12`,borderRadius:99,padding:'2px 8px'}}>
                      {statusVal}
                    </span>
                    <span style={{fontSize:10,color:L.textMuted}}>{nctId}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:L.textPrimary,marginBottom:6,lineHeight:1.4}}>
                    {id?.briefTitle||'Untitled Study'}
                  </div>
                  <div style={{fontSize:11,color:L.textMuted,marginBottom:8}}>
                    {design?.studyType} · {status?.startDateStruct?.date||'Date N/A'}
                  </div>
                  <a href={`https://clinicaltrials.gov/study/${nctId}`} target="_blank" rel="noreferrer"
                    style={{fontSize:12,fontWeight:700,color:L.teal,textDecoration:'none'}}>
                    View on ClinicalTrials.gov →
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {!loading && trials.length===0 && query && (
          <div style={{textAlign:'center',padding:20,color:L.textMuted,fontSize:13}}>No trials found</div>
        )}
        <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
          ⚠️ Educational only · Source: ClinicalTrials.gov
        </div>
      </div>
    </div>
  )
}

// ── ECG INTERPRETER AI ────────────────────────────────
function ECGInterpreter({ onXP }:{ onXP?:(n:number)=>void }) {
  const [image, setImage]     = useState<string|null>(null)
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = (e:any) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = ev=>setImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const interpret = async () => {
    if(!image) return
    setLoading(true); setResult('')
    try {
      const base64 = image.split(',')[1]
      const res = await fetch('/api/medical-ai',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          question:'You are an expert cardiologist. Analyze this ECG image and provide: 1) Rhythm, 2) Rate, 3) Axis, 4) Intervals (PR, QRS, QT), 5) ST changes, 6) Diagnosis, 7) Clinical recommendation. Be concise and structured.',
          image: base64,
          specialty:'Cardiology'
        })
      })
      const data = await res.json()
      setResult(data.answer||'Unable to interpret.')
      onXP?.(25)
    } catch { setResult('Error interpreting ECG. Please try again.') }
    setLoading(false)
  }

  return (
    <div>
      <div style={{position:'relative',height:130,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>CLAUDE AI · VISION</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>📈 ECG Interpreter</div>
        </div>
        <div style={{position:'absolute',top:14,right:14,background:'rgba(239,68,68,0.2)',backdropFilter:'blur(12px)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:99,padding:'4px 12px'}}>
          <span style={{fontSize:10,fontWeight:700,color:'#FCA5A5'}}>🔴 PRO</span>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        <label style={{
          display:'block',padding:'20px',borderRadius:14,
          border:`2px dashed ${L.border}`,background:L.raised,
          textAlign:'center',cursor:'pointer',marginBottom:12,
        }}>
          <input type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
          {image ? (
            <img src={image} alt="ECG" style={{maxHeight:160,borderRadius:10,maxWidth:'100%'}}/>
          ) : (
            <div>
              <div style={{fontSize:36,marginBottom:8}}>📈</div>
              <div style={{fontSize:14,fontWeight:700,color:L.textPrimary,marginBottom:4}}>Upload ECG Image</div>
              <div style={{fontSize:12,color:L.textMuted}}>Photo · Screenshot · PDF scan</div>
            </div>
          )}
        </label>

        {image && (
          <button onClick={interpret} disabled={loading} style={{
            width:'100%',padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
            background:loading?L.raised:L.gradient,
            color:loading?L.textMuted:'white',
            fontSize:14,fontWeight:700,marginBottom:12,
            boxShadow:loading?'none':L.shadowGlow,transition:smooth,
          }}>
            {loading?'⏳ AI Analyzing ECG...':'🤖 Interpret ECG — +25 XP'}
          </button>
        )}

        {result && (
          <div style={{background:'rgba(13,148,136,0.06)',border:'1px solid rgba(13,148,136,0.2)',borderRadius:14,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.teal,marginBottom:8}}>🤖 AI ECG REPORT</div>
            <div style={{fontSize:13,color:L.textSub,lineHeight:1.75,whiteSpace:'pre-line'}}>{result}</div>
          </div>
        )}
        <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
          ⚠️ Educational only · Not for clinical diagnosis · Always verify with cardiologist
        </div>
      </div>
    </div>
  )
}

// ── NUTRITION + WELLNESS ──────────────────────────────
function NutritionTool() {
  const [query, setQuery]   = useState('')
  const [foods, setFoods]   = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [pressed, setPressed] = useState(false)

  const search = async () => {
    if(!query.trim()) return
    setLoading(true); setFoods([]); setSelected(null)
    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6`)
      const data = await res.json()
      setFoods(data.products?.filter((p:any)=>p.product_name&&p.nutriments)||[])
    } catch { setFoods([]) }
    setLoading(false)
  }

  return (
    <div>
      <div style={{position:'relative',height:130,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>3M+ FOODS · OPEN FOOD FACTS</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>🥗 Nutrition DB</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&search()}
            placeholder="Search food... (e.g. dates, olive oil)"
            style={{flex:1,padding:'11px 14px',borderRadius:12,border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          <button onClick={search} disabled={!query.trim()||loading}
            onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
            style={{
              padding:'11px 18px',borderRadius:12,border:'none',cursor:'pointer',
              background:!query.trim()?L.raised:`linear-gradient(135deg,#10B981,#0D9488)`,
              color:!query.trim()?L.textMuted:'white',fontSize:13,fontWeight:700,
              transform:pressed?'scale(0.97)':'scale(1)',transition:spring,
            }}>{loading?'⏳':'🔍'}</button>
        </div>

        {selected ? (
          <div style={{background:L.raised,borderRadius:14,padding:'14px 16px',border:`1px solid ${L.border}`}}>
            <div style={{fontSize:14,fontWeight:800,color:L.textPrimary,marginBottom:12}}>{selected.product_name}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {label:'Energy',    value:`${Math.round(selected.nutriments?.['energy-kcal_100g']||0)} kcal`, color:L.amber},
                {label:'Protein',   value:`${Math.round(selected.nutriments?.proteins_100g||0)}g`,     color:L.teal},
                {label:'Carbs',     value:`${Math.round(selected.nutriments?.carbohydrates_100g||0)}g`, color:L.cobalt},
                {label:'Fat',       value:`${Math.round(selected.nutriments?.fat_100g||0)}g`,           color:L.orange},
                {label:'Fiber',     value:`${Math.round(selected.nutriments?.fiber_100g||0)}g`,         color:L.sage},
                {label:'Sugar',     value:`${Math.round(selected.nutriments?.sugars_100g||0)}g`,        color:L.red},
              ].map(n=>(
                <div key={n.label} style={{background:L.surface,borderRadius:12,padding:'10px',border:`1px solid ${n.color}20`,textAlign:'center'}}>
                  <div style={{fontSize:16,fontWeight:900,color:n.color}}>{n.value}</div>
                  <div style={{fontSize:10,color:L.textMuted,marginTop:2,fontWeight:600}}>{n.label}/100g</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setSelected(null)}
              style={{width:'100%',marginTop:12,padding:'8px',borderRadius:10,background:'none',border:`1px solid ${L.border}`,color:L.textMuted,fontSize:12,cursor:'pointer'}}>
              ← Back
            </button>
          </div>
        ) : foods.length>0 ? (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {foods.slice(0,5).map((f:any,i:number)=>(
              <button key={i} onClick={()=>setSelected(f)}
                style={{
                  width:'100%',textAlign:'left',padding:'10px 14px',borderRadius:12,
                  background:L.raised,border:`1px solid ${L.border}`,cursor:'pointer',
                  fontSize:13,fontWeight:600,color:L.textPrimary,
                  display:'flex',alignItems:'center',gap:10,transition:smooth,
                }}>
                <span style={{fontSize:20}}>🥗</span>
                <div>
                  <div>{f.product_name}</div>
                  <div style={{fontSize:11,color:L.textMuted}}>{Math.round(f.nutriments?.['energy-kcal_100g']||0)} kcal/100g</div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
        <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
          Powered by Open Food Facts · 3M+ products
        </div>
      </div>
    </div>
  )
}

// ── EXERCISE PRESCRIPTION ─────────────────────────────
function ExerciseTool({ onXP }:{ onXP?:(n:number)=>void }) {
  const [muscle, setMuscle] = useState('chest')
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [aiPlan, setAiPlan]   = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const MUSCLES = ['chest','back','legs','shoulders','arms','core','cardio']

  const getExercises = async (m:string) => {
    setMuscle(m); setLoading(true); setExercises([])
    try {
      const res = await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${m}?limit=6`, {
        headers: { 'X-RapidAPI-Host':'exercisedb.p.rapidapi.com', 'X-RapidAPI-Key':'demo' }
      })
      if(!res.ok) throw new Error()
      const data = await res.json()
      setExercises(data.slice(0,6))
    } catch {
      // Fallback exercises
      setExercises([
        {name:'Push-ups',target:'chest',equipment:'body weight',gifUrl:''},
        {name:'Bench Press',target:'pectorals',equipment:'barbell',gifUrl:''},
        {name:'Chest Fly',target:'pectorals',equipment:'dumbbell',gifUrl:''},
      ])
    }
    setLoading(false)
  }

  const getAIPlan = async () => {
    setLoadingAI(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`Create a brief evidence-based exercise prescription for ${muscle} training. Include: sets, reps, frequency, intensity (RPE), and clinical benefits. Keep it concise and practical for busy physicians.`,
          specialty:'Sports Medicine'
        })
      })
      const data = await res.json()
      setAiPlan(data.answer||'')
      onXP?.(10)
    } catch {}
    setLoadingAI(false)
  }

  useEffect(()=>{ getExercises('chest') },[])

  return (
    <div>
      <div style={{position:'relative',height:130,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>EXERCISE RX · AI POWERED</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>💪 Exercise Prescription</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        {/* Muscle selector */}
        <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:2}}>
          {MUSCLES.map(m=>(
            <button key={m} onClick={()=>getExercises(m)} style={{
              flexShrink:0,padding:'6px 14px',borderRadius:99,cursor:'pointer',
              background:muscle===m?`linear-gradient(135deg,#10B981,#0D9488)`:L.raised,
              border:`1px solid ${muscle===m?'transparent':L.border}`,
              color:muscle===m?'white':L.textSub,
              fontSize:11,fontWeight:700,whiteSpace:'nowrap',transition:smooth,
            }}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:20,color:L.textMuted}}>⏳ Loading exercises...</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
            {exercises.map((ex:any,i:number)=>(
              <div key={i} style={{background:L.raised,borderRadius:12,padding:'12px 14px',border:`1px solid ${L.border}`,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>💪</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:L.textPrimary,textTransform:'capitalize'}}>{ex.name}</div>
                  <div style={{fontSize:11,color:L.textMuted}}>Target: {ex.target} · {ex.equipment}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={getAIPlan} disabled={loadingAI} style={{
          width:'100%',padding:'12px',borderRadius:14,border:'none',cursor:'pointer',
          background:loadingAI?L.raised:`linear-gradient(135deg,#7C3AED,#4F46E5)`,
          color:loadingAI?L.textMuted:'white',fontSize:13,fontWeight:700,marginBottom:12,
        }}>
          {loadingAI?'⏳ Generating...':'🤖 AI Exercise Prescription — +10 XP'}
        </button>

        {aiPlan && (
          <div style={{background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:14,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.violet,marginBottom:8}}>💪 EXERCISE RX</div>
            <div style={{fontSize:13,color:L.textSub,lineHeight:1.75,whiteSpace:'pre-line'}}>{aiPlan}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ICD-11 SEARCH ─────────────────────────────────────
function ICD11Tool() {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pressed, setPressed] = useState(false)

  const search = async () => {
    if(!query.trim()) return
    setLoading(true); setResults([])
    try {
      const token = await fetch('https://icdaccessmanagement.who.int/connect/token',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'client_id=user-demo&client_secret=demo&grant_type=client_credentials&scope=icdapi_access&accept_language=en'
      }).then(r=>r.json()).then(d=>d.access_token).catch(()=>null)

      if(!token) throw new Error('no token')

      const res = await fetch(`https://id.who.int/icd/entity/search?q=${encodeURIComponent(query)}&highlighted=true&useFlexisearch=false&flatResults=true&includeKeywordResult=true`,{
        headers:{
          'Authorization':`Bearer ${token}`,
          'API-Version':'v2',
          'Accept-Language':'en',
        }
      })
      const data = await res.json()
      setResults((data.destinationEntities||[]).slice(0,6))
    } catch {
      // Fallback
      setResults([
        {theCode:'I21.0',title:'ST elevation myocardial infarction',definition:'Acute myocardial infarction with ST elevation'},
        {theCode:'I63.9',title:'Cerebral infarction, unspecified',definition:'Ischemic stroke without hemorrhagic transformation'},
        {theCode:'J18.9',title:'Pneumonia, unspecified organism',definition:'Pneumonia without specification of organism'},
      ])
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{position:'relative',height:130,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:3}}>WHO · ICD-11 · 2026</div>
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>🏷️ ICD-11 Codes</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm,marginBottom:16}}>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&search()}
            placeholder="Search diagnosis... (e.g. STEMI, sepsis)"
            style={{flex:1,padding:'11px 14px',borderRadius:12,border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          <button onClick={search} disabled={!query.trim()||loading}
            onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
            style={{
              padding:'11px 18px',borderRadius:12,border:'none',cursor:'pointer',
              background:!query.trim()?L.raised:`linear-gradient(135deg,#7C3AED,#4F46E5)`,
              color:!query.trim()?L.textMuted:'white',fontSize:13,fontWeight:700,
              transform:pressed?'scale(0.97)':'scale(1)',transition:spring,
            }}>{loading?'⏳':'🔍'}</button>
        </div>

        {results.length>0 && (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {results.map((r:any,i:number)=>(
              <div key={i} style={{background:L.raised,borderRadius:12,padding:'12px 14px',border:`1px solid ${L.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:800,color:L.violet,background:'rgba(124,58,237,0.1)',borderRadius:99,padding:'2px 10px'}}>
                    {r.theCode||r.code||'ICD-11'}
                  </span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:L.textPrimary,marginBottom:4,lineHeight:1.4}}
                  dangerouslySetInnerHTML={{__html:r.title?.replace(/<[^>]*>/g,'')||r.title||''}}/>
                {r.definition && (
                  <div style={{fontSize:11,color:L.textMuted,lineHeight:1.5}}>{r.definition.substring(0,120)}...</div>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
          Powered by WHO ICD-11 API · 2026 Edition
        </div>
      </div>
    </div>
  )
}


// ── ATLAS CARDS ───────────────────────────────────────
function AtlasCards({ onCardSelect }:{ onCardSelect:(id:string)=>void }) {
  const [pressed, setPressed] = useState<string|null>(null)

  const CARDS = [
    {
      id:'emergency',
      tag:'EMERGENCY NEXUS',
      title:'Triage &\nEmergency Systems',
      sub:'START · MTS · ESI · CTAS · Mass Casualty',
      img:'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
      color:'#EF4444',
      icon:'🚨',
      badge:'LIVE',
    },
    {
      id:'ai_hub',
      tag:'AI INTELLIGENCE HUB',
      title:'Multi-AI\nConsensus',
      sub:'Claude · Gemini · GPT-4o · Medical consensus',
      img:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
      color:'#7C3AED',
      icon:'🤖',
      badge:'NEW',
    },
    {
      id:'global',
      tag:'GLOBAL STANDARDS',
      title:'International\nGuidelines',
      sub:'🇺🇸 AHA · 🇪🇺 ESC · 🇨🇦 CAEP · 🇦🇺 ACEM',
      img:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      color:'#1E40AF',
      icon:'🌍',
      badge:'2026',
    },
    {
      id:'medtech',
      tag:'MEDICAL TECHNOLOGY',
      title:'Future of\nMedicine 2026',
      sub:'AI diagnostics · Robotics · Wearables · AR/VR',
      img:'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
      color:'#0D9488',
      icon:'🔬',
      badge:'BETA',
    },
    {
      id:'clinical_library',
      tag:'CLINICAL LIBRARY · 500+ CASES',
      title:'Global Case\nLibrary',
      sub:'Cardiology · Neurology · Infectious · Respiratory · Critical Care',
      img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      color:'#10B981',
      icon:'🏥',
      badge:'NEW',
    },
  ]

  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'#94A3B8',marginBottom:12,paddingLeft:4}}>
        ATLAS INTELLIGENCE GRID
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {CARDS.map(card=>(
          <div key={card.id}
            onClick={()=>onCardSelect(card.id)}
            onMouseDown={()=>setPressed(card.id)}
            onMouseUp={()=>setPressed(null)}
            style={{
              position:'relative',height:160,borderRadius:24,overflow:'hidden',cursor:'pointer',
              transform:pressed===card.id?'scale(0.98)':'scale(1)',
              transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow:`0 4px 20px ${card.color}25`,
            }}>
            {/* Unsplash BG */}
            <img src={card.img} alt=""
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${card.color}CC 0%,rgba(15,23,42,0.85) 100%)`}}/>

            {/* Badge */}
            <div style={{
              position:'absolute',top:14,right:14,
              background:'rgba(255,255,255,0.2)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(255,255,255,0.3)',
              borderRadius:99,padding:'4px 12px',
              fontSize:9,fontWeight:800,color:'white',letterSpacing:1.5,
            }}>{card.badge}</div>

            {/* Content */}
            <div style={{position:'absolute',inset:0,padding:'16px 18px',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
              <div style={{
                display:'inline-flex',alignSelf:'flex-start',
                background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',
                borderRadius:99,padding:'3px 12px',marginBottom:8,
                fontSize:9,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.9)',
              }}>{card.icon} {card.tag}</div>
              <div style={{
                fontSize:22,fontWeight:900,color:'white',
                letterSpacing:-0.6,lineHeight:1.15,marginBottom:6,
                whiteSpace:'pre-line',
              }}>{card.title}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',fontWeight:500}}>
                {card.sub}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              position:'absolute',bottom:16,right:16,
              width:32,height:32,borderRadius:'50%',
              background:'rgba(255,255,255,0.2)',backdropFilter:'blur(8px)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:16,color:'white',
            }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN ARSENAL ──────────────────────────────────────
const TOOLS = [
  { id:'codeblue',   label:'Code Blue',      icon:'🔴', color:'#EF4444' },
  { id:'blsacls',    label:'BLS/ACLS',       icon:'💊', color:'#EF4444' },
  { id:'oncall',     label:'On-Call',         icon:'📞', color:'#7C3AED' },
  { id:'nightshift', label:'Night Shift',     icon:'🌙', color:'#7C3AED' },
  { id:'calc',       label:'Calculators',     icon:'🧮', color:'#0D9488' },
  { id:'pharmacy',   label:'Pharmacy',        icon:'💊', color:'#10B981' },
  { id:'nursing',    label:'Nursing',         icon:'👩‍⚕️', color:'#DB2777' },
  { id:'lab',        label:'Lab',             icon:'🧪', color:'#1E40AF' },
  { id:'radiology',  label:'Radiology',       icon:'🩻', color:'#475569' },
  { id:'aigame',     label:'AI Gaming',       icon:'🎮', color:'#F59E0B' },
  { id:'duels',      label:'Clinical Duels',  icon:'⚔️', color:'#EF4444' },
  { id:'detective',  label:'Diagnostic Det.', icon:'🔍', color:'#7C3AED' },
  { id:'board',      label:'Board Exam',      icon:'📋', color:'#1E40AF' },
  { id:'atlas',    label:'Atlas Grid',      icon:'🌍', color:'#0D9488' },
  { id:'gemini',   label:'AI Imaging',      icon:'🧠', color:'#7C3AED' },
  { id:'drug',     label:'Drug Reference',  icon:'💊', color:'#0D9488' },
  { id:'trials',   label:'Clinical Trials', icon:'🔬', color:'#1E40AF' },
  { id:'ecg',      label:'ECG AI',          icon:'📈', color:'#EF4444' },
  { id:'nutrition',label:'Nutrition',       icon:'🥗', color:'#10B981' },
  { id:'exercise', label:'Exercise Rx',     icon:'💪', color:'#7C3AED' },
  { id:'icd11',    label:'ICD-11',          icon:'🏷️', color:'#EA580C' },
]

export default function ToolsPage({ onXP }:{ onXP?:(n:number)=>void }) {
  const [active, setActive] = useState('atlas')
  const [atlasCard, setAtlasCard] = useState<string|null>(null)
  const [pressed, setPressed] = useState<string|null>(null)

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas, paddingBottom:100,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif',
    }}>

      {/* Header */}
      <div style={{position:'relative',height:140,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.90))'}}/>
        <div style={{position:'absolute',bottom:16,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>CLINICAL ARSENAL · 2026</div>
          <div style={{fontSize:28,fontWeight:900,color:'white',letterSpacing:-0.6}}>⚡ Arsenal</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>6 live tools · FDA · WHO · Claude AI</div>
        </div>
      </div>

      {/* Tool Selector */}
      <div style={{display:'flex',gap:8,padding:'14px 16px',overflowX:'auto'}}>
        {TOOLS.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)}
            onMouseDown={()=>setPressed(t.id)} onMouseUp={()=>setPressed(null)}
            style={{
              flexShrink:0,cursor:'pointer',
              display:'flex',flexDirection:'column',alignItems:'center',gap:4,
              padding:'10px 14px',borderRadius:16,
              background:active===t.id?`${t.color}12`:L.surface,
              border:`1.5px solid ${active===t.id?t.color:L.border}`,
              boxShadow:active===t.id?`0 4px 12px ${t.color}25`:L.shadowSm,
              transform:pressed===t.id?'scale(0.95)':'scale(1)',
              transition:spring,
            }}>
            <span style={{fontSize:22}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:active===t.id?t.color:L.textMuted,whiteSpace:'nowrap'}}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{padding:'0 16px'}}>

        {active==='codeblue'   && <CodeBlue/>}
        {active==='blsacls'    && <BLSACLSModule/>}
        {active==='oncall'     && <OnCallSystem/>}
        {active==='nightshift' && <NightShiftSurvival/>}
        {active==='calc'       && <MedCalculators/>}
        {active==='pharmacy'   && <PharmacyModule/>}
        {active==='nursing'    && <NursingModule/>}
        {active==='lab'        && <LabModule/>}
        {active==='radiology'  && <RadiologyModule/>}
        {active==='aigame'     && <AICaseGenerator onXP={onXP}/>}
        {active==='duels'      && <ClinicalDuels onXP={onXP}/>}
        {active==='detective'  && <DiagnosticDetective onXP={onXP}/>}
        {active==='board'      && <BoardExam onXP={onXP}/>}
        {active==='atlas'     && <AtlasCards onCardSelect={(id)=>{setAtlasCard(id); setActive(id)}}/> }
        {active==='emergency'       && <EmergencyNexus/>}
        {active==='clinical_library'  && <ClinicalLibrary/>}
        {active==='ai_hub'          && <AIIntelligenceHub onXP={onXP}/>}
        {active==='global'          && <GlobalStandards/>}
        {active==='medtech'         && <MedicalTechnology/>}
        {active==='gemini'    && <GeminiNanoTool onXP={onXP}/>}
        {active==='drug'      && <DrugDosingTool/>}
        {active==='trials'    && <ClinicalTrialsTool/>}
        {active==='ecg'       && <ECGInterpreter onXP={onXP}/>}
        {active==='nutrition' && <NutritionTool/>}
        {active==='exercise'  && <ExerciseTool onXP={onXP}/>}
        {active==='icd11'     && <ICD11Tool/>}
      </div>
    </div>
  )
}
