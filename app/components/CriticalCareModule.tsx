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

// ── SOFA CALCULATOR ──
function SOFACalculator({ onClose }: { onClose:()=>void }) {
  const [scores, setScores] = useState({ resp:0, coag:0, liver:0, cardio:0, cns:0, renal:0 })
  const total = Object.values(scores).reduce((a,b)=>a+b,0)

  const params = [
    { key:'resp',   label:'Respiratory (PaO2/FiO2)', options:['≥400 (0)','300-399 (1)','200-299 (2)','100-199 (3)','<100 (4)'] },
    { key:'coag',   label:'Coagulation (Platelets)', options:['≥150 (0)','100-149 (1)','50-99 (2)','20-49 (3)','<20 (4)'] },
    { key:'liver',  label:'Liver (Bilirubin μmol/L)', options:['<20 (0)','20-32 (1)','33-101 (2)','102-204 (3)','>204 (4)'] },
    { key:'cardio', label:'Cardiovascular', options:['MAP≥70 (0)','MAP<70 (1)','Dopa≤5 (2)','Dopa>5 (3)','Dopa>15 (4)'] },
    { key:'cns',    label:'CNS (GCS)', options:['15 (0)','13-14 (1)','10-12 (2)','6-9 (3)','<6 (4)'] },
    { key:'renal',  label:'Renal (Creatinine μmol/L)', options:['<110 (0)','110-170 (1)','171-299 (2)','300-440 (3)','>440 (4)'] },
  ]

  const mortality = total<=6?'<10%':total<=9?'15-20%':total<=12?'40-50%':'50-60%+'
  const mortColor = total<=6?T.green:total<=9?T.orange:T.red

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.90)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
      <div style={{padding:'20px',maxWidth:480,margin:'0 auto',paddingBottom:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>📊 SOFA Score Calculator</div>
            <div style={{fontSize:11,color:T.sub}}>Sequential Organ Failure Assessment</div>
          </div>
        </div>

        {/* Score display */}
        <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',marginBottom:16,border:`1px solid ${mortColor}30`,textAlign:'center'}}>
          <div style={{fontSize:42,fontWeight:900,color:mortColor,lineHeight:1}}>{total}</div>
          <div style={{fontSize:12,color:T.sub,marginTop:4}}>SOFA Score</div>
          <div style={{fontSize:14,fontWeight:800,color:mortColor,marginTop:8}}>Mortality: {mortality}</div>
        </div>

        {params.map(p=>(
          <div key={p.key} style={{background:T.glass2,backdropFilter:'blur(20px)',borderRadius:14,padding:'12px 14px',marginBottom:8,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>{p.label}</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {p.options.map((opt,i)=>(
                <button key={i} onClick={()=>setScores(s=>({...s,[p.key]:i}))} style={{
                  padding:'5px 8px',borderRadius:8,border:`1px solid ${(scores as any)[p.key]===i?T.red:T.border}`,
                  background:(scores as any)[p.key]===i?`${T.red}20`:T.glass2,
                  color:(scores as any)[p.key]===i?T.red:T.muted,
                  fontSize:9,fontWeight:700,cursor:'pointer',fontFamily:F,
                }}>{opt}</button>
              ))}
            </div>
          </div>
        ))}

        <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}18`,borderRadius:14,padding:'12px 14px',marginTop:8}}>
          <div style={{fontSize:10,color:T.gold,fontWeight:700,marginBottom:4}}>📌 SOFA NOTE</div>
          <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>SOFA score increase ≥2 = organ failure. Used to define sepsis (suspected infection + SOFA ≥2). Reassess daily.</div>
        </div>
      </div>
    </div>
  )
}

// ── VENTILATOR SIMULATOR ──
function VentSimulator({ onClose }: { onClose:()=>void }) {
  const [settings, setSettings] = useState({ mode:'AC/VC', vt:500, rr:14, fio2:60, peep:5, pc:20 })
  const [weight, setWeight] = useState(70)

  const idealVT = Math.round(weight * 6)
  const minute = settings.vt * settings.rr / 1000
  const isLungProtective = settings.vt <= Math.round(weight * 8)
  const isPEEPAdequate = settings.peep >= 5

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.90)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
      <div style={{padding:'20px',maxWidth:480,margin:'0 auto',paddingBottom:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>🫁 Ventilator Settings</div>
            <div style={{fontSize:11,color:T.sub}}>Lung-protective ventilation simulator</div>
          </div>
        </div>

        {/* IBW input */}
        <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',marginBottom:16,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>PATIENT IDEAL BODY WEIGHT</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <input type="range" min={40} max={120} value={weight} onChange={e=>setWeight(Number(e.target.value))} style={{flex:1}}/>
            <span style={{fontSize:18,fontWeight:900,color:T.teal,minWidth:60}}>{weight} kg</span>
          </div>
          <div style={{fontSize:11,color:T.muted,marginTop:4}}>Ideal TV: {Math.round(weight*6)}-{Math.round(weight*8)} ml (6-8 ml/kg IBW)</div>
        </div>

        {/* Settings */}
        {[
          {label:'Tidal Volume (ml)', key:'vt', min:300, max:900, step:10, unit:'ml', alert:settings.vt>Math.round(weight*8)},
          {label:'Respiratory Rate', key:'rr', min:8, max:35, step:1, unit:'/min', alert:settings.rr>25},
          {label:'FiO2 (%)', key:'fio2', min:21, max:100, step:1, unit:'%', alert:settings.fio2>60},
          {label:'PEEP (cmH2O)', key:'peep', min:0, max:20, step:1, unit:'cmH2O', alert:settings.peep<5},
        ].map(s=>(
          <div key={s.key} style={{background:s.alert?`rgba(255,59,48,0.08)`:T.glass2,backdropFilter:'blur(20px)',borderRadius:14,padding:'12px 14px',marginBottom:8,border:`1px solid ${s.alert?T.red+'30':T.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,color:s.alert?T.red:T.sub,fontWeight:700}}>{s.label}</span>
              <span style={{fontSize:14,fontWeight:900,color:s.alert?T.red:T.text}}>{(settings as any)[s.key]} {s.unit}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={(settings as any)[s.key]}
              onChange={e=>setSettings(prev=>({...prev,[s.key]:Number(e.target.value)}))}
              style={{width:'100%'}}/>
          </div>
        ))}

        {/* Summary */}
        <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',border:`1px solid ${isLungProtective?T.green+'30':T.red+'30'}`}}>
          <div style={{fontSize:10,color:isLungProtective?T.green:T.red,fontWeight:700,marginBottom:10}}>
            {isLungProtective?'✅ LUNG-PROTECTIVE':'⚠️ NOT LUNG-PROTECTIVE'}
          </div>
          <div style={{display:'flex',gap:8}}>
            {[
              {l:'TV/IBW', v:`${Math.round(settings.vt/weight*10)/10} ml/kg`, ok:isLungProtective},
              {l:'Min Vol', v:`${Math.round(minute*10)/10} L/min`, ok:minute<10},
              {l:'PEEP', v:`${settings.peep} cmH2O`, ok:isPEEPAdequate},
            ].map(d=>(
              <div key={d.l} style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'8px 6px',textAlign:'center'}}>
                <div style={{fontSize:12,fontWeight:900,color:d.ok?T.green:T.red}}>{d.v}</div>
                <div style={{fontSize:8,color:T.muted,marginTop:2}}>{d.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ICU CASES ──
const ICU_CASES = [
  {
    id:'septic_shock', icon:'🦠', title:'Septic Shock',
    color:T.red, urgency:'CRITICAL',
    patient:'65M, known DM2. Presented with fever 39.8°C, confusion. BP 78/42 despite 2L IVF. HR 128. Lactate 4.2. Source: urinary.',
    question:'Initial vasopressor of choice after adequate fluid resuscitation?',
    options:[
      {text:'Adrenaline (Epinephrine) 0.1-0.5 mcg/kg/min', correct:false, explanation:'Adrenaline is second-line or for refractory shock. Causes more tachycardia and metabolic side effects.'},
      {text:'Noradrenaline (Norepinephrine) 0.01-0.5 mcg/kg/min', correct:true, explanation:'Noradrenaline is first-line vasopressor in septic shock (SSC Guidelines 2021). Target MAP ≥65 mmHg.'},
      {text:'Dopamine 5-20 mcg/kg/min', correct:false, explanation:'Dopamine associated with higher mortality and arrhythmias vs noradrenaline. Not first-line.'},
      {text:'Vasopressin 0.03 units/min', correct:false, explanation:'Vasopressin is adjunct to noradrenaline, not first-line monotherapy.'},
    ],
    pearl:'Septic shock bundle (1h): Blood cultures → Antibiotics → 30ml/kg IVF → Lactate → Vasopressors if refractory. Target MAP ≥65, UO >0.5ml/kg/h.',
  },
  {
    id:'ards', icon:'🫁', title:'ARDS Management',
    color:T.blue, urgency:'CRITICAL',
    patient:'48F, post-aspiration pneumonia. P/F ratio 85. Bilateral infiltrates on CXR. PEEP 8. FiO2 80%. Berlin criteria: Severe ARDS.',
    question:'Most evidence-based intervention to improve mortality in severe ARDS?',
    options:[
      {text:'High-frequency oscillatory ventilation', correct:false, explanation:'HFOV showed no mortality benefit and potential harm in OSCAR/OSCILLATE trials. Not recommended.'},
      {text:'Prone positioning ≥16 hours/day', correct:true, explanation:'PROSEVA trial: prone positioning >16h/day reduced 28-day mortality from 32.8% to 16% in severe ARDS (P/F <150).'},
      {text:'Inhaled nitric oxide', correct:false, explanation:'iNO improves oxygenation but no mortality benefit. Used as bridge to other therapies.'},
      {text:'Increase PEEP to 18 cmH2O immediately', correct:false, explanation:'Higher PEEP improves oxygenation but must be titrated carefully. Not evidence-based as first escalation without recruitment.'},
    ],
    pearl:'Severe ARDS (P/F<150): Prone 16h/day, lung-protective ventilation (6ml/kg IBW), PEEP titration, NMB for first 48h. Consider VV-ECMO if refractory.',
  },
]

export default function CriticalCareModule({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<'menu'|'case'|'sofa'|'vent'>('menu')
  const [selectedCase, setSelectedCase] = useState<typeof ICU_CASES[0]|null>(null)
  const [answered, setAnswered] = useState<number|null>(null)
  const [time, setTime] = useState(0)
  const [timerOn, setTimerOn] = useState(false)

  useEffect(()=>{
    if(!timerOn) return
    const t = setInterval(()=>setTime(s=>s+1),1000)
    return ()=>clearInterval(t)
  },[timerOn])

  if (view==='sofa') return <SOFACalculator onClose={()=>setView('menu')}/>
  if (view==='vent') return <VentSimulator onClose={()=>setView('menu')}/>

  if (view==='case' && selectedCase) {
    const isCorrect = answered !== null && selectedCase.options[answered].correct
    return (
      <div style={{fontFamily:F}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <button onClick={()=>{setView('menu');setAnswered(null);setTimerOn(false);setTime(0)}} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'9px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← ICU</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>{selectedCase.icon} {selectedCase.title}</div>
          </div>
          <div style={{fontSize:14,fontWeight:900,color:time>60?T.red:T.orange,fontFamily:'monospace'}}>
            {Math.floor(time/60)}:{String(time%60).padStart(2,'0')}
          </div>
        </div>

        <div style={{background:`${selectedCase.color}08`,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${selectedCase.color}22`}}>
          <div style={{fontSize:9,color:selectedCase.color,fontWeight:700,letterSpacing:1,marginBottom:6}}>🏥 ICU CASE</div>
          <div style={{fontSize:13,color:T.sub,lineHeight:1.75}}>{selectedCase.patient}</div>
        </div>

        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>{selectedCase.question}</div>

        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {selectedCase.options.map((opt,i)=>{
            const isSel=answered===i, done=answered!==null
            const isCorrectOpt=opt.correct
            let bg=T.glass,border=T.border,opacity=1
            if(done){
              if(isCorrectOpt){bg='rgba(52,199,89,0.14)';border='#34C759'}
              else if(isSel){bg='rgba(255,59,48,0.14)';border='#FF3B30'}
              else opacity=0.4
            }
            return(
              <button key={i} onClick={()=>{if(!done){setAnswered(i);setTimerOn(false);isCorrectOpt&&onXP?.(30)}}} style={{
                background:bg,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
                border:`1.5px solid ${border}`,borderRadius:16,padding:'13px 16px',
                cursor:done?'default':'pointer',display:'flex',alignItems:'flex-start',
                gap:12,textAlign:'left',opacity,fontFamily:F,transition:'all 0.25s',
              }}>
                <div style={{width:30,height:30,borderRadius:9,flexShrink:0,
                  background:done&&isCorrectOpt?'rgba(52,199,89,0.20)':done&&isSel?'rgba(255,59,48,0.20)':'rgba(255,255,255,0.07)',
                  border:`1px solid ${done&&isCorrectOpt?'#34C75970':done&&isSel?'#FF3B3070':'rgba(255,255,255,0.12)'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,
                  color:done&&isCorrectOpt?'#34C759':done&&isSel?'#FF3B30':'rgba(238,246,250,0.45)',
                }}>
                  {done?(isCorrectOpt?'✓':isSel?'✗':String.fromCharCode(65+i)):String.fromCharCode(65+i)}
                </div>
                <div style={{fontSize:13,color:T.text,fontWeight:600,flex:1,lineHeight:1.5,paddingTop:2}}>{opt.text}</div>
              </button>
            )
          })}
        </div>

        {answered !== null && (
          <div>
            <div style={{background:isCorrect?'rgba(52,199,89,0.08)':'rgba(255,59,48,0.08)',border:`1.5px solid ${isCorrect?'#34C75930':'#FF3B3030'}`,borderRadius:18,padding:'16px',marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:900,color:isCorrect?T.green:T.red,marginBottom:8}}>
                {isCorrect?'✅ Correct! +30 XP':'❌ Incorrect'}
              </div>
              <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}>{selectedCase.options[answered].explanation}</div>
            </div>
            <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}22`,borderRadius:14,padding:'12px 14px',marginBottom:14}}>
              <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:4}}>⭐ ICU PEARL</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{selectedCase.pearl}</div>
            </div>
            <button onClick={()=>{setView('menu');setAnswered(null);setTime(0)}} style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              ← Back to ICU
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{fontFamily:F}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:`${T.red}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>CRITICAL CARE</div>
        <div style={{fontSize:24,fontWeight:900,color:T.text,letterSpacing:-0.5}}>
          The ICU <span style={{color:T.red}}>Shift</span>
        </div>
        <div style={{fontSize:12,color:T.sub,marginTop:4,lineHeight:1.5}}>
          Sepsis · ARDS · Vasopressors · Ventilator · SOFA Score
        </div>
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {['SSC Bundle','SOFA Score','Lung-Protective','Vasopressors','ARDS Prone'].map(tag=>(
          <span key={tag} style={{background:`${T.red}15`,border:`1px solid ${T.red}30`,color:T.red,borderRadius:20,padding:'4px 12px',fontSize:10,fontWeight:700}}>{tag}</span>
        ))}
      </div>

      {/* Tools */}
      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>ICU TOOLS</div>
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        <div onClick={()=>setView('sofa')} style={{flex:1,background:T.glass,backdropFilter:'blur(30px)',border:`1px solid ${T.orange}28`,borderRadius:18,padding:'14px',cursor:'pointer',textAlign:'center',boxShadow:`0 0 14px ${T.orange}10`}}>
          <div style={{fontSize:24,marginBottom:6}}>📊</div>
          <div style={{fontSize:13,fontWeight:800,color:T.text}}>SOFA Score</div>
          <div style={{fontSize:10,color:T.sub}}>Mortality calculator</div>
        </div>
        <div onClick={()=>setView('vent')} style={{flex:1,background:T.glass,backdropFilter:'blur(30px)',border:`1px solid ${T.blue}28`,borderRadius:18,padding:'14px',cursor:'pointer',textAlign:'center',boxShadow:`0 0 14px ${T.blue}10`}}>
          <div style={{fontSize:24,marginBottom:6}}>🫁</div>
          <div style={{fontSize:13,fontWeight:800,color:T.text}}>Ventilator</div>
          <div style={{fontSize:10,color:T.sub}}>Settings simulator</div>
        </div>
      </div>

      {/* Cases */}
      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>ICU CASES</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {ICU_CASES.map(c=>(
          <div key={c.id} onClick={()=>{setSelectedCase(c);setView('case');setTimerOn(true);setTime(0)}} style={{
            background:T.glass,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',
            border:`1.5px solid ${c.color}28`,borderRadius:20,padding:'18px',
            cursor:'pointer',position:'relative',overflow:'hidden',
            boxShadow:`0 4px 20px rgba(0,0,0,0.15),0 0 14px ${c.color}10`,
          }}>
            <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${c.color}14,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:16,background:`${c.color}15`,border:`1.5px solid ${c.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 0 16px ${c.color}25`}}>{c.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:T.text,marginBottom:2}}>{c.title}</div>
              </div>
              <div style={{background:`${c.color}18`,border:`1px solid ${c.color}30`,borderRadius:10,padding:'4px 10px',fontSize:9,color:c.color,fontWeight:800}}>{c.urgency}</div>
            </div>
            <div style={{fontSize:12,color:T.sub,lineHeight:1.6,marginBottom:12}}>{c.patient.substring(0,100)}...</div>
            <div style={{background:`linear-gradient(135deg,${c.color}18,${c.color}08)`,border:`1px solid ${c.color}28`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>Start Case · +30 XP</span>
              <span style={{fontSize:16,color:c.color}}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
