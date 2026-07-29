'use client'
import { useState, useEffect } from 'react'

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

type Phase = 'brief' | 'labs' | 'imaging' | 'decision' | 'result'

interface CaseData {
  title?: string
  specialty?: string
  brief?: string
  vitals?: Record<string, string>
  labs?: { name:string, value:string, status:string, ref:string }[]
  ecg?: string
  echo?: string
  xray?: string
  options?: { id:string, text:string, correct:boolean, explanation:string }[]
  question?: string
  keyLearning?: string[]
  management?: string[]
}

interface Props {
  specialty?: string
  difficulty?: string
  onXP?: (n:number) => void
  daily?: boolean
}

// ── ECG VISUAL ──
function ECGVisual({ description, color=T.teal }: { description:string, color?:string }) {
  const isSTEMI = description?.toLowerCase().includes('stemi') || description?.toLowerCase().includes('st elevation')
  const isAFib  = description?.toLowerCase().includes('fibrillation') || description?.toLowerCase().includes('af')
  const isVT    = description?.toLowerCase().includes('ventricular tach')

  const path = isSTEMI
    ? "M0 50 L20 50 L25 50 L30 20 L35 80 L40 5 L45 95 L50 50 L80 50 L120 50 L125 20 L130 80 L135 5 L140 95 L145 50 L180 50 L220 50"
    : isAFib
    ? "M0 50 L10 45 L15 55 L20 48 L25 52 L35 50 L37 30 L39 70 L41 50 L55 48 L60 52 L65 50 L67 30 L69 70 L71 50 L90 50 L120 50"
    : isVT
    ? "M0 50 L10 50 L15 20 L20 80 L25 20 L30 80 L35 20 L40 80 L45 50 L80 50 L85 20 L90 80 L95 20 L100 80 L105 50 L140 50"
    : "M0 50 L25 50 L30 40 L35 50 L55 50 L60 25 L65 75 L70 50 L95 50 L100 40 L105 50 L140 50 L145 25 L150 75 L155 50 L180 50 L220 50"

  return (
    <div style={{background:'rgba(0,0,0,0.30)',borderRadius:16,padding:'14px',position:'relative',overflow:'hidden',border:`1px solid ${color}22`}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${color},transparent)`}}/>
      <div style={{fontSize:9,color:color,fontWeight:700,letterSpacing:1,marginBottom:8}}>
        📈 ECG — {isSTEMI?'⚡ STEMI PATTERN':isAFib?'AF PATTERN':isVT?'VT PATTERN':'RHYTHM STRIP'}
      </div>
      <svg viewBox="0 0 220 100" width="100%" height="80">
        {/* Grid */}
        {[25,50,75].map(y=><line key={y} x1="0" y1={y} x2="220" y2={y} stroke={color} strokeWidth="0.3" strokeOpacity="0.15"/>)}
        {[55,110,165].map(x=><line key={x} x1={x} y1="0" x2={x} y2="100" stroke={color} strokeWidth="0.3" strokeOpacity="0.10"/>)}
        {/* Glow */}
        <path d={path} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.15" filter="blur(3px)"/>
        {/* Main line */}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        {/* STEMI marker */}
        {isSTEMI && <>
          <circle cx="40" cy="5" r="4" fill={color} opacity="0.9"/>
          <rect x="46" y="0" width="46" height="16" rx="8" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="1"/>
          <text x="69" y="11" textAnchor="middle" fill={color} fontSize="8" fontWeight="800" fontFamily={F}>⚡ ST↑</text>
        </>}
      </svg>
      <div style={{fontSize:10,color:T.sub,marginTop:6,lineHeight:1.5}}>{description}</div>
    </div>
  )
}

// ── X-RAY VISUAL ──
function XRayVisual({ description }: { description:string }) {
  const isPneumonia = description?.toLowerCase().includes('pneumonia') || description?.toLowerCase().includes('consolidation')
  const isPulmonary = description?.toLowerCase().includes('oedema') || description?.toLowerCase().includes('edema')
  const isPneumo    = description?.toLowerCase().includes('pneumothorax')

  return (
    <div style={{background:'rgba(0,0,0,0.50)',borderRadius:16,padding:'14px',border:`1px solid rgba(255,255,255,0.08)`}}>
      <div style={{fontSize:9,color:T.blue,fontWeight:700,letterSpacing:1,marginBottom:8}}>🩻 CHEST X-RAY</div>
      <svg viewBox="0 0 200 180" width="100%" height="150">
        {/* Dark background */}
        <rect width="200" height="180" fill="#0a0a0a" rx="8"/>
        {/* Lung borders */}
        <ellipse cx="70" cy="90" rx="50" ry="70" fill="none" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="130" cy="90" rx="50" ry="70" fill="none" stroke="#333" strokeWidth="1.5"/>
        {/* Lung fields */}
        <ellipse cx="70" cy="90" rx="44" ry="64" fill={isPulmonary?"rgba(100,150,255,0.25)":"rgba(60,80,100,0.15)"}/>
        <ellipse cx="130" cy="90" rx="44" ry="64" fill={isPulmonary?"rgba(100,150,255,0.25)":"rgba(60,80,100,0.15)"}/>
        {/* Pneumonia consolidation */}
        {isPneumonia && <ellipse cx="148" cy="110" rx="28" ry="22" fill="rgba(255,149,0,0.40)" opacity="0.8"/>}
        {/* Pulmonary oedema */}
        {isPulmonary && <>
          <ellipse cx="70"  cy="90" rx="40" ry="55" fill="rgba(100,180,255,0.20)"/>
          <ellipse cx="130" cy="90" rx="40" ry="55" fill="rgba(100,180,255,0.20)"/>
          {[70,90,110,130,150].map(y=>(
            <line key={y} x1="30" y1={y} x2="90" y2={y} stroke="rgba(100,180,255,0.25)" strokeWidth="1"/>
          ))}
          {[70,90,110,130,150].map(y=>(
            <line key={y+200} x1="110" y1={y} x2="170" y2={y} stroke="rgba(100,180,255,0.25)" strokeWidth="1"/>
          ))}
        </>}
        {/* Pneumothorax */}
        {isPneumo && <ellipse cx="55" cy="70" rx="25" ry="40" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>}
        {/* Spine */}
        <rect x="95" y="20" width="10" height="140" rx="5" fill="rgba(200,200,200,0.15)"/>
        {/* Carina */}
        <path d="M100 60 L80 80 M100 60 L120 80" stroke="rgba(200,200,200,0.25)" strokeWidth="1.5"/>
        {/* Ribs */}
        {[40,60,80,100,120,140].map((y,i)=>(
          <g key={y}>
            <path d={`M100 ${y} Q60 ${y+5} 30 ${y+15}`} fill="none" stroke="rgba(200,200,200,0.15)" strokeWidth="1"/>
            <path d={`M100 ${y} Q140 ${y+5} 170 ${y+15}`} fill="none" stroke="rgba(200,200,200,0.15)" strokeWidth="1"/>
          </g>
        ))}
        {/* Annotations */}
        {isPneumonia && <>
          <circle cx="148" cy="110" r="4" fill="rgba(255,149,0,0.9)"/>
          <rect x="155" y="100" width="38" height="14" rx="7" fill="rgba(0,0,0,0.8)"/>
          <text x="174" y="110" textAnchor="middle" fill="#FF9500" fontSize="7" fontWeight="800" fontFamily={F}>CONSOLIDATION</text>
        </>}
        {isPulmonary && <>
          <rect x="2" y="2" width="60" height="14" rx="7" fill="rgba(0,0,0,0.8)"/>
          <text x="32" y="12" textAnchor="middle" fill="#64D2FF" fontSize="7" fontWeight="800" fontFamily={F}>PULM. OEDEMA</text>
        </>}
        {isPneumo && <>
          <rect x="2" y="2" width="56" height="14" rx="7" fill="rgba(0,0,0,0.8)"/>
          <text x="30" y="12" textAnchor="middle" fill="#FF3B30" fontSize="7" fontWeight="800" fontFamily={F}>PNEUMOTHORAX</text>
        </>}
      </svg>
      <div style={{fontSize:10,color:T.sub,marginTop:6,lineHeight:1.5}}>{description}</div>
    </div>
  )
}

// ── ECHO VISUAL ──
function EchoVisual({ description }: { description:string }) {
  const isLowEF  = description?.toLowerCase().includes('reduced') || description?.toLowerCase().includes('35%') || description?.toLowerCase().includes('30%')
  const isLVH    = description?.toLowerCase().includes('hypertrophy') || description?.toLowerCase().includes('lvh')
  const isEffusion = description?.toLowerCase().includes('effusion')

  return (
    <div style={{background:'rgba(0,0,0,0.40)',borderRadius:16,padding:'14px',border:`1px solid rgba(175,82,222,0.22)`}}>
      <div style={{fontSize:9,color:T.purple,fontWeight:700,letterSpacing:1,marginBottom:8}}>🫀 ECHOCARDIOGRAM</div>
      <svg viewBox="0 0 200 160" width="100%" height="130">
        <rect width="200" height="160" fill="#050510" rx="8"/>
        {/* Ultrasound cone */}
        <path d="M100 10 L20 150 L180 150 Z" fill="rgba(100,50,180,0.08)"/>
        {/* Pericardium */}
        {isEffusion && <ellipse cx="100" cy="95" rx="75" ry="65" fill="rgba(100,150,255,0.15)" stroke="rgba(100,150,255,0.3)" strokeWidth="1"/>}
        {/* LV wall */}
        <ellipse cx="100" cy="95" rx={isLVH?62:55} ry={isLVH?55:48} fill="rgba(255,59,48,0.12)" stroke="rgba(255,59,48,0.4)" strokeWidth={isLVH?3:1.5}/>
        {/* LV cavity */}
        <ellipse cx="100" cy="95" rx={isLowEF?40:32} ry={isLowEF?35:28} fill="rgba(0,196,180,0.15)" stroke="rgba(0,196,180,0.5)" strokeWidth="1.5"/>
        {/* RV */}
        <path d="M55 55 Q45 95 60 135 Q80 120 80 95 Q75 70 55 55Z" fill="rgba(0,122,255,0.15)" stroke="rgba(0,122,255,0.35)" strokeWidth="1"/>
        {/* Mitral valve */}
        <path d="M80 95 L95 80 M120 95 L105 80" stroke="rgba(255,213,79,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Aortic root */}
        <ellipse cx="100" cy="52" rx="12" ry="8" fill="none" stroke="rgba(255,149,0,0.4)" strokeWidth="1.5"/>
        {/* EF annotation */}
        <rect x="4" y="4" width="60" height="14" rx="7" fill="rgba(0,0,0,0.8)"/>
        <text x="34" y="14" textAnchor="middle" fill={isLowEF?T.red:T.green} fontSize="8" fontWeight="800" fontFamily={F}>
          EF {isLowEF?'35%':'60%'}
        </text>
        {/* LVH label */}
        {isLVH && <>
          <rect x="130" y="4" width="64" height="14" rx="7" fill="rgba(0,0,0,0.8)"/>
          <text x="162" y="14" textAnchor="middle" fill={T.purple} fontSize="7" fontWeight="800" fontFamily={F}>LVH PRESENT</text>
        </>}
        {/* Effusion label */}
        {isEffusion && <>
          <rect x="4" y="142" width="60" height="14" rx="7" fill="rgba(0,0,0,0.8)"/>
          <text x="34" y="152" textAnchor="middle" fill="#64D2FF" fontSize="7" fontWeight="800" fontFamily={F}>EFFUSION</text>
        </>}
        {/* Scan lines */}
        {[0,15,30,45,60,75,90,105,120,135,150].map((a,i)=>{
          const rad = (a-75)*Math.PI/180
          return <line key={i} x1="100" y1="10" x2={100+140*Math.sin(rad)} y2={10+140*Math.cos(rad)} stroke="rgba(100,50,180,0.05)" strokeWidth="0.5"/>
        })}
      </svg>
      <div style={{fontSize:10,color:T.sub,marginTop:6,lineHeight:1.5}}>{description}</div>
    </div>
  )
}

// ── LAB RESULT ROW ──
function LabRow({ lab }: { lab:{name:string,value:string,status:string,ref:string} }) {
  const isHigh = lab.status==='high' || lab.status==='H' || lab.status==='↑'
  const isLow  = lab.status==='low'  || lab.status==='L' || lab.status==='↓'
  const isCrit = lab.status==='critical' || lab.status==='CRIT'
  const color  = isCrit?T.red:isHigh||isLow?T.orange:T.green

  return (
    <div style={{
      display:'flex', alignItems:'center', padding:'9px 12px',
      background: isCrit?'rgba(255,59,48,0.08)':isHigh||isLow?'rgba(255,149,0,0.06)':T.glass2,
      borderRadius:12, gap:10,
      border:`1px solid ${isCrit?T.red+'30':isHigh||isLow?T.orange+'25':T.border}`,
      marginBottom:6,
    }}>
      <div style={{flex:2,fontSize:12,fontWeight:600,color:T.text}}>{lab.name}</div>
      <div style={{flex:1,fontSize:13,fontWeight:900,color,textAlign:'right'}}>{lab.value}</div>
      <div style={{flex:1,fontSize:9,color:T.muted,textAlign:'right'}}>{lab.ref}</div>
      <div style={{width:20,textAlign:'center',fontSize:12,fontWeight:900,color}}>
        {isCrit?'🚨':isHigh?'↑':isLow?'↓':'✓'}
      </div>
    </div>
  )
}

// ── PHASE TABS ──
function PhaseTabs({ phase, setPhase, hasLabs, hasImaging }: {
  phase:Phase, setPhase:(p:Phase)=>void, hasLabs:boolean, hasImaging:boolean
}) {
  const tabs = [
    { id:'brief',    label:'Brief',   icon:'📋' },
    ...(hasLabs    ? [{ id:'labs',    label:'Labs',    icon:'🧪' }] : []),
    ...(hasImaging ? [{ id:'imaging', label:'Imaging', icon:'🩻' }] : []),
    { id:'decision', label:'Decide',  icon:'🎯' },
  ] as { id:Phase, label:string, icon:string }[]

  return (
    <div style={{display:'flex',gap:4,background:T.glass2,borderRadius:16,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setPhase(t.id)} style={{
          flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
          borderRadius:12, fontFamily:F, fontWeight:700, fontSize:11,
          background: phase===t.id ? T.glass : 'transparent',
          color: phase===t.id ? T.teal : T.muted,
          border: phase===t.id ? `1px solid ${T.teal}25` : '1px solid transparent',
          transition:'all 0.2s',
        }}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  )
}

export default function LiveCaseViewer({ specialty='Emergency Medicine', difficulty='Intermediate', onXP, daily=false }: Props) {
  const [phase, setPhase]         = useState<Phase>('brief')
  const [caseData, setCaseData]   = useState<CaseData|null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState<string|null>(null)
  const [showResult, setShowResult] = useState(false)
  const [xpAwarded, setXpAwarded] = useState(false)

  useEffect(() => { fetchCase() }, [specialty, difficulty])

  const fetchCase = async () => {
    setLoading(true); setError(''); setSelected(null)
    setShowResult(false); setPhase('brief'); setXpAwarded(false)
    try {
      const res = await fetch('/api/generate-case', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ specialty, difficulty, fullCase:true, daily }),
      })
      const data = await res.json()
      if (data.success) setCaseData(data.case)
      else setError(data.error||'Generation failed')
    } catch { setError('Network error') }
    setLoading(false)
  }

  const handleAnswer = (id:string) => {
    if (selected) return
    setSelected(id)
    setShowResult(true)
    setPhase('result' as Phase)
    const correct = caseData?.options?.find(o=>o.id===id)?.correct
    if (correct && !xpAwarded) {
      onXP?.(50)
      setXpAwarded(true)
    }
  }

  // ── LOADING ──
  if (loading) return (
    <div style={{fontFamily:F,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,gap:16}}>
      {/* Animated ECG */}
      <svg viewBox="0 0 220 60" width="200" height="60">
        <path d="M0 30 L40 30 L50 30 L55 10 L60 50 L65 5 L70 55 L75 30 L120 30 L130 15 L135 45 L140 10 L145 50 L150 30 L220 30"
          fill="none" stroke={T.teal} strokeWidth="2" strokeLinecap="round"
          style={{strokeDasharray:400,strokeDashoffset:400,animation:'draw 2s ease forwards'}}/>
        <style>{`@keyframes draw{to{stroke-dashoffset:0}}`}</style>
      </svg>
      <div style={{fontSize:14,fontWeight:700,color:T.text}}>Generating {specialty} case...</div>
      <div style={{fontSize:11,color:T.muted}}>AI building clinical scenario</div>
    </div>
  )

  // ── ERROR ──
  if (error) return (
    <div style={{fontFamily:F,textAlign:'center',padding:24}}>
      <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
      <div style={{fontSize:13,color:T.red,marginBottom:16}}>{error}</div>
      <button onClick={fetchCase} style={{background:T.glass,border:`1px solid ${T.border}`,borderRadius:14,padding:'10px 20px',color:T.text,fontFamily:F,cursor:'pointer',fontWeight:700}}>Try Again</button>
    </div>
  )

  if (!caseData) return null

  const hasLabs    = !!(caseData.labs?.length)
  const hasImaging = !!(caseData.ecg || caseData.echo || caseData.xray)

  return (
    <div style={{fontFamily:F}}>

      {/* Case header */}
      <div style={{
        background:T.glass, backdropFilter:'blur(30px)', WebkitBackdropFilter:'blur(30px)',
        borderRadius:20, padding:'16px', marginBottom:14,
        border:`1px solid ${T.teal}22`,
        position:'relative', overflow:'hidden',
        boxShadow:`0 0 20px ${T.teal}10`,
      }}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${T.teal}14,transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
          <div>
            <div style={{fontSize:10,color:T.teal,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>
              {daily?'📅 DAILY CASE':'🔴 LIVE CASE'} · {specialty.toUpperCase()}
            </div>
            <div style={{fontSize:18,fontWeight:900,color:T.text,letterSpacing:-0.5}}>{caseData.title||'Clinical Case'}</div>
          </div>
          <div style={{background:`${T.orange}18`,border:`1px solid ${T.orange}30`,borderRadius:12,padding:'4px 10px',fontSize:10,color:T.orange,fontWeight:700,flexShrink:0}}>{difficulty}</div>
        </div>

        {/* Vitals strip */}
        {caseData.vitals && (
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
            {Object.entries(caseData.vitals).map(([k,v])=>{
              const alert = (k==='HR'&&(parseInt(v)>100||parseInt(v)<50)) ||
                            (k==='BP'&&parseInt(v)<90) ||
                            (k==='SpO2'&&parseInt(v)<94) ||
                            (k==='RR'&&parseInt(v)>25)
              return (
                <div key={k} style={{
                  background: alert?'rgba(255,59,48,0.12)':T.glass2,
                  border:`1px solid ${alert?T.red+'30':T.border}`,
                  borderRadius:10, padding:'5px 9px', textAlign:'center',
                }}>
                  <div style={{fontSize:12,fontWeight:900,color:alert?T.red:T.text}}>{v}</div>
                  <div style={{fontSize:8,color:T.muted,marginTop:1}}>{k}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Phase tabs */}
      <PhaseTabs phase={phase} setPhase={setPhase} hasLabs={hasLabs} hasImaging={hasImaging}/>

      {/* ── BRIEF ── */}
      {phase==='brief' && (
        <div>
          <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>📋 CLINICAL PRESENTATION</div>
            <div style={{fontSize:13,color:T.sub,lineHeight:1.8}}>{caseData.brief}</div>
          </div>
          <button onClick={()=>setPhase(hasLabs?'labs':hasImaging?'imaging':'decision')} style={{
            width:'100%',padding:'15px',borderRadius:18,border:'none',
            background:`linear-gradient(135deg,${T.teal},${T.blue})`,
            color:'#fff',fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:F,
            boxShadow:`0 6px 24px ${T.teal}35`,
          }}>
            {hasLabs?'Review Labs →':hasImaging?'View Imaging →':'Make Decision →'}
          </button>
        </div>
      )}

      {/* ── LABS ── */}
      {phase==='labs' && caseData.labs && (
        <div>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>🧪 LABORATORY RESULTS</div>
          {caseData.labs.map((lab,i)=><LabRow key={i} lab={lab}/>)}
          <button onClick={()=>setPhase(hasImaging?'imaging':'decision')} style={{
            width:'100%',padding:'15px',borderRadius:18,border:'none',marginTop:8,
            background:`linear-gradient(135deg,${T.blue},${T.purple})`,
            color:'#fff',fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:F,
            boxShadow:`0 6px 24px ${T.blue}35`,
          }}>
            {hasImaging?'View Imaging →':'Make Decision →'}
          </button>
        </div>
      )}

      {/* ── IMAGING ── */}
      {phase==='imaging' && (
        <div>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>🩻 IMAGING & INVESTIGATIONS</div>
          <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:14}}>
            {caseData.ecg  && <ECGVisual  description={caseData.ecg}/>}
            {caseData.xray && <XRayVisual description={caseData.xray}/>}
            {caseData.echo && <EchoVisual description={caseData.echo}/>}
          </div>
          <button onClick={()=>setPhase('decision')} style={{
            width:'100%',padding:'15px',borderRadius:18,border:'none',
            background:`linear-gradient(135deg,${T.orange},${T.red})`,
            color:'#fff',fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:F,
            boxShadow:`0 6px 24px ${T.orange}35`,
          }}>
            Make Decision →
          </button>
        </div>
      )}

      {/* ── DECISION ── */}
      {phase==='decision' && !selected && (
        <div>
          <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',marginBottom:14,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.orange,fontWeight:700,letterSpacing:1,marginBottom:8}}>🎯 CLINICAL DECISION</div>
            <div style={{fontSize:14,fontWeight:800,color:T.text,lineHeight:1.6}}>{caseData.question}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {caseData.options?.map(opt=>(
              <button key={opt.id} onClick={()=>handleAnswer(opt.id)} style={{
                background:T.glass, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                border:`1px solid ${T.border}`, borderRadius:18, padding:'14px 16px',
                cursor:'pointer', display:'flex', alignItems:'flex-start', gap:12,
                textAlign:'left', fontFamily:F, transition:'all 0.2s',
              }}>
                <div style={{width:32,height:32,borderRadius:10,flexShrink:0,background:`${T.teal}15`,border:`1px solid ${T.teal}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:T.teal}}>
                  {opt.id.toUpperCase()}
                </div>
                <div style={{fontSize:13,color:T.text,fontWeight:600,flex:1,lineHeight:1.55,paddingTop:2}}>{opt.text}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {showResult && selected && (
        <div>
          {(() => {
            const sel = caseData.options?.find(o=>o.id===selected)
            const isCorrect = sel?.correct
            return (
              <div>
                {/* Result banner */}
                <div style={{
                  background:isCorrect?'rgba(52,199,89,0.10)':'rgba(255,59,48,0.10)',
                  border:`1.5px solid ${isCorrect?T.green+'35':T.red+'35'}`,
                  borderRadius:20, padding:'18px', marginBottom:12,
                }}>
                  <div style={{fontSize:18,fontWeight:900,color:isCorrect?T.green:T.red,marginBottom:8}}>
                    {isCorrect?'✅ Excellent! +50 XP':'❌ Incorrect'}
                  </div>
                  <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}>{sel?.explanation}</div>
                </div>

                {/* Key learning */}
                {caseData.keyLearning?.length && (
                  <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}22`,borderRadius:16,padding:'14px',marginBottom:12}}>
                    <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:8}}>⭐ KEY LEARNING POINTS</div>
                    {caseData.keyLearning.map((p,i)=>(
                      <div key={i} style={{fontSize:12,color:T.sub,padding:'4px 0',lineHeight:1.5}}>• {p}</div>
                    ))}
                  </div>
                )}

                {/* Management */}
                {caseData.management?.length && (
                  <div style={{background:`${T.blue}08`,border:`1px solid ${T.blue}20`,borderRadius:16,padding:'14px',marginBottom:14}}>
                    <div style={{fontSize:9,color:T.blue,fontWeight:700,letterSpacing:1,marginBottom:8}}>📋 MANAGEMENT STEPS</div>
                    {caseData.management.map((m,i)=>(
                      <div key={i} style={{display:'flex',gap:8,padding:'4px 0'}}>
                        <span style={{color:T.teal,fontWeight:800,fontSize:12}}>{i+1}.</span>
                        <span style={{fontSize:12,color:T.sub,lineHeight:1.5}}>{m}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next case button */}
                <button onClick={fetchCase} style={{
                  width:'100%', padding:'16px', borderRadius:18, border:'none',
                  background:`linear-gradient(135deg,${T.teal},${T.blue})`,
                  color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:F,
                  boxShadow:`0 6px 24px ${T.teal}35`,
                }}>
                  🔄 Next Case →
                </button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
