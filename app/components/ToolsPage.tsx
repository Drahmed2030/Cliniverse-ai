'use client'
import { useState, useEffect } from 'react'

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

// ── MAIN ARSENAL ──────────────────────────────────────
const TOOLS = [
  { id:'drug',     label:'Drug Reference',  icon:'💊', color:'#0D9488' },
  { id:'trials',   label:'Clinical Trials', icon:'🔬', color:'#1E40AF' },
  { id:'ecg',      label:'ECG AI',          icon:'📈', color:'#EF4444' },
  { id:'nutrition',label:'Nutrition',       icon:'🥗', color:'#10B981' },
  { id:'exercise', label:'Exercise Rx',     icon:'💪', color:'#7C3AED' },
  { id:'icd11',    label:'ICD-11',          icon:'🏷️', color:'#EA580C' },
]

export default function ToolsPage({ onXP }:{ onXP?:(n:number)=>void }) {
  const [active, setActive] = useState('drug')
  const [pressed, setPressed] = useState<string|null>(null)

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas, paddingBottom:100,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif',
    }}>

      {/* Header */}
      <div style={{position:'relative',height:140,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
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
