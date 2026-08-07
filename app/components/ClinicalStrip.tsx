'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C', pink:'#DB2777',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowMd:'0 4px 16px rgba(15,23,42,0.12)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

// ── DRUG INTERACTION ──────────────────────────────────────
const COMMON_DRUGS = [
  'Warfarin','Aspirin','Metformin','Lisinopril','Atorvastatin',
  'Amiodarone','Digoxin','Clopidogrel','Furosemide','Metoprolol',
  'Amlodipine','Omeprazole','Enoxaparin','Morphine','Vancomycin',
]

const INTERACTIONS: Record<string,{severity:'major'|'moderate'|'minor', effect:string, advice:string}> = {
  'Warfarin+Aspirin':     {severity:'major',   effect:'Increased bleeding risk — antiplatelet + anticoagulant synergy', advice:'Avoid if possible. If essential, PPI cover + monitor INR closely.'},
  'Aspirin+Warfarin':     {severity:'major',   effect:'Increased bleeding risk — antiplatelet + anticoagulant synergy', advice:'Avoid if possible. If essential, PPI cover + monitor INR closely.'},
  'Amiodarone+Digoxin':   {severity:'major',   effect:'Digoxin toxicity — amiodarone inhibits P-glycoprotein & CYP3A4', advice:'Reduce digoxin dose by 50%. Monitor levels and ECG.'},
  'Digoxin+Amiodarone':   {severity:'major',   effect:'Digoxin toxicity — amiodarone inhibits P-glycoprotein & CYP3A4', advice:'Reduce digoxin dose by 50%. Monitor levels and ECG.'},
  'Warfarin+Amiodarone':  {severity:'major',   effect:'INR elevation — amiodarone inhibits CYP2C9 metabolism of warfarin', advice:'Reduce warfarin dose 30-50%. Weekly INR monitoring initially.'},
  'Metformin+Furosemide': {severity:'moderate',effect:'Risk of lactic acidosis — dehydration impairs metformin clearance', advice:'Monitor renal function. Hold metformin if dehydrated.'},
  'Furosemide+Metformin': {severity:'moderate',effect:'Risk of lactic acidosis — dehydration impairs metformin clearance', advice:'Monitor renal function. Hold metformin if dehydrated.'},
  'Aspirin+Clopidogrel':  {severity:'moderate',effect:'Dual antiplatelet — increased bleeding, also beneficial post-ACS', advice:'Indicated post-ACS for 12 months. Use PPI cover (lansoprazole).'},
  'Clopidogrel+Aspirin':  {severity:'moderate',effect:'Dual antiplatelet — increased bleeding, also beneficial post-ACS', advice:'Indicated post-ACS for 12 months. Use PPI cover (lansoprazole).'},
  'Lisinopril+Furosemide':{severity:'moderate',effect:'First-dose hypotension — synergistic BP lowering', advice:'Start low dose. Monitor BP after first dose. Check renal function & K+.'},
  'Furosemide+Lisinopril':{severity:'moderate',effect:'First-dose hypotension — synergistic BP lowering', advice:'Start low dose. Monitor BP after first dose. Check renal function & K+.'},
  'Omeprazole+Clopidogrel':{severity:'moderate',effect:'Reduced clopidogrel efficacy — CYP2C19 inhibition', advice:'Switch to pantoprazole or lansoprazole if PPI needed.'},
  'Clopidogrel+Omeprazole':{severity:'moderate',effect:'Reduced clopidogrel efficacy — CYP2C19 inhibition', advice:'Switch to pantoprazole or lansoprazole if PPI needed.'},
  'Morphine+Metoprolol':  {severity:'minor',   effect:'Additive hypotension and bradycardia possible', advice:'Monitor vitals. Use with caution in hemodynamically unstable patients.'},
  'Metoprolol+Morphine':  {severity:'minor',   effect:'Additive hypotension and bradycardia possible', advice:'Monitor vitals. Use with caution in hemodynamically unstable patients.'},
  'Atorvastatin+Amiodarone':{severity:'moderate',effect:'Myopathy risk — amiodarone inhibits CYP3A4', advice:'Cap atorvastatin at 40mg. Monitor CK levels.'},
  'Amiodarone+Atorvastatin':{severity:'moderate',effect:'Myopathy risk — amiodarone inhibits CYP3A4', advice:'Cap atorvastatin at 40mg. Monitor CK levels.'},
}

// ── KARMA CASES ──────────────────────────────────────────
const KARMA_CASES = [
  {
    id:'k1',
    age:'64M', chief:'Chest pain + ST elevation V1-V4',
    question:'You decide to give thrombolytics instead of transferring for PCI (transfer time 3h)',
    options:['Correct — justified given transfer time','Wrong — should have transferred'],
    correctIdx:0,
    outcome:'Patient reperfused successfully. Peak troponin 2800. EF preserved at 55% at 30 days. ✅ Good outcome with thrombolytics when PCI >120min.',
    week:'This week',
    specialty:'Cardiology',
    color:L.red,
  },
  {
    id:'k2',
    age:'45F', chief:'Fever + confusion + neck stiffness',
    question:'You start ceftriaxone + dexamethasone before LP results',
    options:['Correct — empirical treatment saves lives','Wrong — should wait for LP'],
    correctIdx:0,
    outcome:'CSF confirmed bacterial meningitis (S. pneumoniae). Early antibiotics reduced mortality. Full neurological recovery. ✅ Never delay antibiotics for LP in meningitis.',
    week:'Last week',
    specialty:'Neurology',
    color:L.violet,
  },
  {
    id:'k3',
    age:'72M', chief:'Septic shock post-op, K+ 5.8, oliguria',
    question:'You start norepinephrine at 0.1 mcg/kg/min without additional fluids',
    options:['Correct — vasopressor first in refractory shock','Wrong — more fluids needed first'],
    correctIdx:1,
    outcome:'Patient developed worsening AKI. Inadequate fluid resuscitation before vasopressors contributed to renal hypoperfusion. ❌ Ensure adequate volume before escalating pressors.',
    week:'2 weeks ago',
    specialty:'Critical Care',
    color:L.amber,
  },
]

// ── LEADERBOARD ──────────────────────────────────────────
const LEADERBOARD = [
  {rank:1, name:'Dr. Sarah Al-Otaibi', specialty:'Cardiology',    country:'🇸🇦', xp:2840, streak:14, badge:'🏆'},
  {rank:2, name:'Dr. Omar Mitchell',   specialty:'Emergency',      country:'🇬🇧', xp:2650, streak:11, badge:'🥈'},
  {rank:3, name:'Dr. Priya Sharma',    specialty:'Critical Care',  country:'🇮🇳', xp:2410, streak:9,  badge:'🥉'},
  {rank:4, name:'Dr. Ahmed Hassan',    specialty:'Neurology',      country:'🇪🇬', xp:2200, streak:7,  badge:'⭐'},
  {rank:5, name:'Dr. Liu Wei',         specialty:'Internal Med',   country:'🇨🇳', xp:1980, streak:5,  badge:'⭐'},
]

const SPECIALTY_RANKS = [
  {specialty:'Cardiology',    score:94, color:L.red,    flag:'🫀', doctors:284},
  {specialty:'Emergency',     score:89, color:L.amber,  flag:'🚨', doctors:196},
  {specialty:'Critical Care', score:87, color:L.violet, flag:'🏥', doctors:142},
  {specialty:'Neurology',     score:82, color:L.cobalt, flag:'🧠', doctors:118},
  {specialty:'Surgery',       score:78, color:L.orange, flag:'🔪', doctors:203},
]

// ── MY PATIENTS ──────────────────────────────────────────
const PATIENT_TEMPLATES = [
  {emoji:'🫀', label:'Cardiac',    color:L.red,    placeholder:'62M, STEMI, post-PCI day 1. EF 40%. Started GDMT...'},
  {emoji:'🧠', label:'Neuro',      color:L.violet, placeholder:'55F, ischemic stroke, NIHSS 8. Started tPA within window...'},
  {emoji:'🫁', label:'Respiratory',color:L.cobalt, placeholder:'48M, ARDS, P/F ratio 180. Prone positioning initiated...'},
  {emoji:'💉', label:'Sepsis',     color:L.amber,  placeholder:'71F, septic shock, source control achieved. Day 3 ICU...'},
  {emoji:'🔬', label:'Other',      color:L.teal,   placeholder:'Brief clinical note...'},
]

// ────────────────────────────────────────────────────────
// DRUG INTERACTION CARD
// ────────────────────────────────────────────────────────
function DrugInteractionCard({ onXP }:{ onXP?:(n:number)=>void }) {
  const [drug1, setDrug1]     = useState('')
  const [drug2, setDrug2]     = useState('')
  const [result, setResult]   = useState<any>(null)
  const [pressed, setPressed] = useState(false)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if(!drug1 || !drug2) return
    setLoading(true)
    await new Promise(r=>setTimeout(r,600))
    const key = `${drug1}+${drug2}`
    const interaction = INTERACTIONS[key]
    if(interaction){
      setResult({...interaction, found:true})
      onXP?.(10)
    } else {
      setResult({found:false, severity:'none', effect:'No known major interaction found in our database', advice:'Always verify with current BNF/clinical pharmacist for complete interaction profile.'})
    }
    setLoading(false)
  }

  const severityConfig = {
    major:    {color:L.red,    bg:'rgba(239,68,68,0.08)',    label:'⚠️ MAJOR',    border:'rgba(239,68,68,0.3)'},
    moderate: {color:L.amber,  bg:'rgba(245,183,49,0.08)',   label:'⚡ MODERATE', border:'rgba(245,183,49,0.3)'},
    minor:    {color:L.sage,   bg:'rgba(16,185,129,0.08)',   label:'ℹ️ MINOR',    border:'rgba(16,185,129,0.3)'},
    none:     {color:L.teal,   bg:'rgba(13,148,136,0.08)',   label:'✅ SAFE',     border:'rgba(13,148,136,0.3)'},
  }

  return (
    <div style={{marginBottom:16}}>
      {/* Hero */}
      <div style={{position:'relative',height:140,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>DRUG SAFETY</div>
          <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:-0.4}}>💊 Interaction Checker</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:2}}>Instant drug-drug interaction check</div>
        </div>
      </div>

      {/* Body */}
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:'16px',borderTop:'none',boxShadow:L.shadowSm}}>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          {[{val:drug1,set:setDrug1,ph:'Drug 1'},{val:drug2,set:setDrug2,ph:'Drug 2'}].map((d,i)=>(
            <div key={i} style={{flex:1,position:'relative'}}>
              <input value={d.val} onChange={e=>d.set(e.target.value)}
                placeholder={d.ph} list={`drugs${i}`}
                style={{width:'100%',padding:'11px 14px',borderRadius:12,boxSizing:'border-box',
                  border:`1px solid ${L.border}`,background:L.raised,
                  color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              <datalist id={`drugs${i}`}>
                {COMMON_DRUGS.map(d=><option key={d} value={d}/>)}
              </datalist>
            </div>
          ))}
        </div>

        <button onClick={check} disabled={!drug1||!drug2||loading}
          onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
          style={{
            width:'100%',padding:'13px',borderRadius:14,border:'none',cursor:!drug1||!drug2?'not-allowed':'pointer',
            background:!drug1||!drug2?L.raised:L.gradient,
            color:!drug1||!drug2?L.textMuted:'white',
            fontSize:14,fontWeight:700,
            transform:pressed?'scale(0.98)':'scale(1)',transition:spring,
            boxShadow:drug1&&drug2?L.shadowGlow:'none',
          }}>
          {loading ? '🔍 Checking...' : '⚡ Check Interaction'}
        </button>

        {result && (
          <div style={{
            marginTop:12,padding:'14px 16px',borderRadius:14,
            background:severityConfig[result.severity as keyof typeof severityConfig]?.bg || L.raised,
            border:`1px solid ${severityConfig[result.severity as keyof typeof severityConfig]?.border || L.border}`,
          }}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:1.2,
              color:severityConfig[result.severity as keyof typeof severityConfig]?.color || L.teal,
              marginBottom:8}}>
              {severityConfig[result.severity as keyof typeof severityConfig]?.label}
            </div>
            <div style={{fontSize:13,fontWeight:600,color:L.textPrimary,marginBottom:6,lineHeight:1.5}}>
              {result.effect}
            </div>
            <div style={{fontSize:12,color:L.textSub,lineHeight:1.6,fontStyle:'italic'}}>
              💡 {result.advice}
            </div>
          </div>
        )}

        <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
          ⚠️ Educational only · Always verify with clinical pharmacist
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// CLINICAL KARMA CARD
// ────────────────────────────────────────────────────────
function ClinicalKarmaCard({ onXP }:{ onXP?:(n:number)=>void }) {
  const [caseIdx, setCaseIdx]   = useState(0)
  const [chosen, setChosen]     = useState<number|null>(null)
  const [showOutcome, setShowOutcome] = useState(false)
  const [pressed, setPressed]   = useState<number|null>(null)
  const kcase = KARMA_CASES[caseIdx]

  const handleChoose = (idx:number) => {
    if(chosen!==null) return
    setChosen(idx)
    setTimeout(()=>setShowOutcome(true), 600)
    onXP?.(20)
  }

  const isCorrect = chosen === kcase.correctIdx
  const specColors:Record<string,string> = {
    'Cardiology':L.red, 'Neurology':L.violet,
    'Critical Care':L.amber, 'Emergency':L.orange,
  }
  const specColor = specColors[kcase.specialty] || L.teal

  return (
    <div style={{marginBottom:16}}>
      {/* Hero */}
      <div style={{position:'relative',height:140,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',top:14,right:14,background:'rgba(245,183,49,0.2)',backdropFilter:'blur(12px)',border:'1px solid rgba(245,183,49,0.4)',borderRadius:99,padding:'4px 12px'}}>
          <span style={{fontSize:10,fontWeight:700,color:L.amber}}>⭐ {kcase.week}</span>
        </div>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>CLINICAL KARMA</div>
          <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:-0.4}}>Was Your Decision Right?</div>
        </div>
      </div>

      {/* Body */}
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:'16px',borderTop:'none',boxShadow:L.shadowSm}}>
        {/* Case selector */}
        <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto'}}>
          {KARMA_CASES.map((c,i)=>(
            <button key={c.id} onClick={()=>{setCaseIdx(i);setChosen(null);setShowOutcome(false)}}
              style={{
                flexShrink:0,padding:'5px 14px',borderRadius:99,cursor:'pointer',
                background:caseIdx===i?specColor:L.raised,
                border:`1px solid ${caseIdx===i?specColor:L.border}`,
                color:caseIdx===i?'white':L.textSub,
                fontSize:11,fontWeight:700,transition:smooth,
              }}>{c.specialty}</button>
          ))}
        </div>

        {/* Patient */}
        <div style={{background:L.raised,borderRadius:14,padding:'12px 14px',marginBottom:12,border:`1px solid ${L.border}`}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:specColor,marginBottom:6}}>
            {kcase.age} · {kcase.chief}
          </div>
          <div style={{fontSize:14,fontWeight:600,color:L.textPrimary,lineHeight:1.6}}>
            {kcase.question}
          </div>
        </div>

        {/* Options */}
        {!showOutcome ? (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {kcase.options.map((opt,i)=>(
              <button key={i} onClick={()=>handleChoose(i)}
                onMouseDown={()=>setPressed(i)} onMouseUp={()=>setPressed(null)}
                style={{
                  width:'100%',textAlign:'left',padding:'13px 16px',borderRadius:14,
                  cursor:chosen!==null?'default':'pointer',border:`1.5px solid ${L.border}`,
                  background:chosen===i?'rgba(13,148,136,0.08)':L.raised,
                  color:chosen===i?L.teal:L.textPrimary,
                  fontSize:14,fontWeight:700,
                  transform:pressed===i?'scale(0.97)':'scale(1)',transition:spring,
                }}>
                {opt}
              </button>
            ))}
            {chosen===null && (
              <div style={{fontSize:11,color:L.textMuted,textAlign:'center',marginTop:4}}>
                What would YOU have done?
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding:'14px 16px',borderRadius:14,
            background:isCorrect?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)',
            border:`1px solid ${isCorrect?L.sage+'40':L.red+'40'}`,
            animation:'fadeIn 0.5s ease',
          }}>
            <div style={{fontSize:16,fontWeight:800,color:isCorrect?L.sage:L.red,marginBottom:8}}>
              {isCorrect ? '✅ Good Call!' : '❌ Reconsider This'}
            </div>
            <div style={{fontSize:13,color:L.textSub,lineHeight:1.7}}>{kcase.outcome}</div>
            <div style={{marginTop:10,fontSize:12,fontWeight:700,color:isCorrect?L.sage:L.red}}>
              {isCorrect ? '+20 XP — Clinical judgment confirmed 🎯' : 'Learning moment — +10 XP'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// SPECIALTY LEADERBOARD CARD
// ────────────────────────────────────────────────────────
function LeaderboardCard() {
  const [view, setView] = useState<'doctors'|'specialties'>('doctors')
  const [pressed, setPressed] = useState<string|null>(null)

  return (
    <div style={{marginBottom:16}}>
      {/* Hero */}
      <div style={{position:'relative',height:140,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>THIS WEEK</div>
          <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:-0.4}}>🏆 Global Leaderboard</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:2}}>Top physicians worldwide</div>
        </div>
      </div>

      {/* Body */}
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:'16px',borderTop:'none',boxShadow:L.shadowSm}}>
        {/* Toggle */}
        <div style={{display:'flex',gap:0,background:L.raised,borderRadius:14,padding:3,marginBottom:14,border:`1px solid ${L.border}`}}>
          {(['doctors','specialties'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{
                flex:1,padding:'8px',borderRadius:11,border:'none',cursor:'pointer',
                background:view===v?L.gradient:'transparent',
                color:view===v?'white':L.textMuted,
                fontSize:12,fontWeight:700,transition:spring,
                boxShadow:view===v?L.shadowGlow:'none',
              }}>
              {v==='doctors'?'👨‍⚕️ Doctors':'🏥 Specialties'}
            </button>
          ))}
        </div>

        {view==='doctors' ? (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {LEADERBOARD.map(doc=>(
              <div key={doc.rank} style={{
                display:'flex',alignItems:'center',gap:12,
                background:doc.rank<=3?`${[L.amber,L.textMuted,L.orange][doc.rank-1]}08`:L.raised,
                border:`1px solid ${doc.rank<=3?`${[L.amber,L.textMuted,L.orange][doc.rank-1]}25`:L.border}`,
                borderRadius:14,padding:'12px 14px',
              }}>
                <div style={{fontSize:20,width:28,textAlign:'center'}}>{doc.badge}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{doc.name} {doc.country}</div>
                  <div style={{fontSize:11,color:L.textMuted}}>{doc.specialty} · {doc.streak}🔥 streak</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:15,fontWeight:900,color:L.teal}}>{doc.xp.toLocaleString()}</div>
                  <div style={{fontSize:9,color:L.textMuted,fontWeight:700}}>XP</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {SPECIALTY_RANKS.map((s,i)=>(
              <div key={s.specialty} style={{
                background:L.raised,border:`1px solid ${L.border}`,borderRadius:14,padding:'12px 14px',
              }}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:20}}>{s.flag}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{s.specialty}</div>
                      <div style={{fontSize:10,color:L.textMuted}}>{s.doctors} doctors</div>
                    </div>
                  </div>
                  <div style={{fontSize:18,fontWeight:900,color:s.color}}>{s.score}%</div>
                </div>
                <div style={{background:L.border,borderRadius:99,height:6,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${s.score}%`,background:s.color,borderRadius:99,transition:'width 1s ease'}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:12,padding:'10px 14px',background:'rgba(13,148,136,0.06)',borderRadius:12,border:'1px solid rgba(13,148,136,0.15)',textAlign:'center'}}>
          <div style={{fontSize:12,color:L.teal,fontWeight:700}}>
            🔒 PRO — Join the leaderboard & compete globally
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// MY PATIENTS TODAY CARD
// ────────────────────────────────────────────────────────
function MyPatientsCard({ onXP }:{ onXP?:(n:number)=>void }) {
  const [notes, setNotes]       = useState<any[]>([])
  const [input, setInput]       = useState('')
  const [category, setCategory] = useState(0)
  const [pressed, setPressed]   = useState(false)

  useEffect(()=>{
    try {
      const saved = localStorage.getItem('cliniverse_patient_notes')
      if(saved) setNotes(JSON.parse(saved))
    } catch {}
  },[])

  const addNote = () => {
    if(!input.trim()) return
    const note = {
      id: Date.now(),
      text: input.trim(),
      category: PATIENT_TEMPLATES[category].label,
      emoji: PATIENT_TEMPLATES[category].emoji,
      color: PATIENT_TEMPLATES[category].color,
      time: new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}),
      date: new Date().toLocaleDateString('en',{day:'numeric',month:'short'}),
    }
    const updated = [note, ...notes].slice(0,10)
    setNotes(updated)
    localStorage.setItem('cliniverse_patient_notes', JSON.stringify(updated))
    setInput('')
    onXP?.(5)
  }

  return (
    <div style={{marginBottom:16}}>
      {/* Hero */}
      <div style={{position:'relative',height:140,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))'}}/>
        <div style={{position:'absolute',bottom:14,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>CLINICAL LOG</div>
          <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:-0.4}}>🏥 My Patients Today</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:2}}>{notes.length} notes today</div>
        </div>
      </div>

      {/* Body */}
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:'16px',borderTop:'none',boxShadow:L.shadowSm}}>
        {/* Category selector */}
        <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:12,paddingBottom:2}}>
          {PATIENT_TEMPLATES.map((t,i)=>(
            <button key={t.label} onClick={()=>setCategory(i)}
              style={{
                flexShrink:0,display:'flex',alignItems:'center',gap:5,
                padding:'7px 14px',borderRadius:99,cursor:'pointer',
                background:category===i?t.color+'12':L.raised,
                border:`1.5px solid ${category===i?t.color:L.border}`,
                color:category===i?t.color:L.textSub,
                fontSize:12,fontWeight:700,transition:smooth,
              }}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{marginBottom:12}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            placeholder={PATIENT_TEMPLATES[category].placeholder}
            rows={3}
            style={{
              width:'100%',padding:'12px 14px',borderRadius:14,boxSizing:'border-box',
              border:`1px solid ${L.border}`,background:L.raised,
              color:L.textPrimary,fontSize:13,outline:'none',
              resize:'none',lineHeight:1.6,fontFamily:'inherit',
            }}/>
          <button onClick={addNote} disabled={!input.trim()}
            onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
            style={{
              width:'100%',marginTop:8,padding:'12px',borderRadius:14,border:'none',cursor:'pointer',
              background:!input.trim()?L.raised:L.gradient,
              color:!input.trim()?L.textMuted:'white',
              fontSize:13,fontWeight:700,
              transform:pressed?'scale(0.98)':'scale(1)',transition:spring,
              boxShadow:input.trim()?L.shadowGlow:'none',
            }}>
            + Save Note
          </button>
        </div>

        {/* Notes */}
        {notes.length>0 && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:4}}>
              RECENT NOTES
            </div>
            {notes.slice(0,3).map(note=>(
              <div key={note.id} style={{
                background:L.raised,border:`1px solid ${note.color}20`,
                borderLeft:`3px solid ${note.color}`,
                borderRadius:12,padding:'10px 12px',
              }}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:note.color}}>
                    {note.emoji} {note.category}
                  </span>
                  <span style={{fontSize:10,color:L.textMuted}}>{note.time} · {note.date}</span>
                </div>
                <div style={{fontSize:12,color:L.textSub,lineHeight:1.5}}>{note.text}</div>
              </div>
            ))}
            {notes.length>3 && (
              <div style={{textAlign:'center',fontSize:12,color:L.teal,fontWeight:600}}>
                +{notes.length-3} more notes →
              </div>
            )}
          </div>
        )}

        <div style={{marginTop:10,padding:'10px 14px',background:'rgba(13,148,136,0.06)',borderRadius:12,border:'1px solid rgba(13,148,136,0.15)',textAlign:'center'}}>
          <div style={{fontSize:12,color:L.teal,fontWeight:700}}>
            🔒 PRO — Export PDF Clinical Logbook
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// MAIN EXPORT
// ────────────────────────────────────────────────────────
export default function ClinicalStrip({ onXP }:{ onXP?:(n:number)=>void }) {
  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif'}}>
      <DrugInteractionCard onXP={onXP}/>
      <ClinicalKarmaCard onXP={onXP}/>
      <LeaderboardCard/>
      <MyPatientsCard onXP={onXP}/>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        input::placeholder,textarea::placeholder{color:#94A3B8}
      `}</style>
    </div>
  )
}
