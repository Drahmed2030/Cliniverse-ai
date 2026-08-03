'use client'
import { useState } from 'react'

type ViewType = 'menu'|'algorithm'|'h5t5'|'drugs'|'quiz'

interface Step {
  id: number
  action: string
  detail: string
  timer?: number
  critical?: boolean
  drug?: string
  dose?: string
}

interface Algorithm {
  id: string
  title: string
  subtitle: string
  color: string
  icon: string
  rhythm?: string
  steps: Step[]
}

const BLS_ADULT: Algorithm = {
  id:'bls_adult', title:'Adult BLS', subtitle:'AHA 2020 Guidelines', color:'#ff453a', icon:'🫀',
  steps:[
    {id:1, action:'Scene Safety', detail:'Ensure scene is safe for rescuer and victim. Use PPE if available.', critical:true},
    {id:2, action:'Check Responsiveness', detail:'Tap shoulders firmly. Shout "Are you OK?" twice.', timer:5},
    {id:3, action:'Call for Help', detail:'Shout for help. Send someone to call 911 and get AED. Activate emergency response.', critical:true},
    {id:4, action:'Check Breathing & Pulse', detail:'Look for breathing (no more than 10 seconds). Check carotid pulse simultaneously.', timer:10},
    {id:5, action:'Begin CPR — 30 Compressions', detail:'Hard and fast. Centre of chest. 100-120/min. 2-2.4 inch depth. Full recoil between compressions. Minimize interruptions.', timer:18, critical:true},
    {id:6, action:'2 Rescue Breaths', detail:'Head-tilt chin-lift. 1 second each breath. Visible chest rise. If no training — compression-only CPR.', timer:5},
    {id:7, action:'AED Arrives — Power On', detail:'Power on AED. Attach pads: right clavicle, left lateral chest (V5 position).', critical:true},
    {id:8, action:'AED Analyzes', detail:'Clear the patient. Do not touch. Let AED analyze rhythm.', timer:10},
    {id:9, action:'Shock if Advised', detail:'Clear patient. Ensure no contact. Press shock button. Resume CPR immediately after shock.', critical:true},
    {id:10, action:'Continue CPR 2 Minutes', detail:'Resume 30:2 cycles. Reassess every 2 minutes. Switch compressor if possible to prevent fatigue.', timer:120},
  ]
}

const VF_PVT: Algorithm = {
  id:'vf_pvt', title:'VF / Pulseless VT', subtitle:'Shockable Rhythm — ACLS', color:'#ff453a', icon:'⚡',
  rhythm:'VF — Chaotic baseline. No identifiable QRS complexes.',
  steps:[
    {id:1, action:'Confirm Pulseless', detail:'No pulse > 10 seconds. Start CPR immediately.', critical:true},
    {id:2, action:'CPR — 2 Minutes', detail:'High-quality CPR. IV/IO access during CPR. Minimize interruptions.', timer:120},
    {id:3, action:'Charge Defibrillator', detail:'Biphasic: 120-200J. Monophasic: 360J.', critical:true},
    {id:4, action:'SHOCK', detail:'Clear patient. Deliver shock. Resume CPR immediately — no pulse check.', critical:true},
    {id:5, action:'Epinephrine IV/IO', detail:'Epinephrine 1mg IV/IO every 3-5 minutes. Establish access during CPR.', drug:'Epinephrine', dose:'1mg IV/IO q3-5min'},
    {id:6, action:'CPR — 2 Min + Rhythm Check', detail:'Continue CPR. Reassess rhythm every 2 minutes.', timer:120},
    {id:7, action:'Shock Again if VF/pVT', detail:'Biphasic 120-200J. Clear and shock.', critical:true},
    {id:8, action:'Amiodarone or Lidocaine', detail:'After 2nd shock: Amiodarone 300mg IV/IO bolus. OR Lidocaine 1-1.5mg/kg.', drug:'Amiodarone', dose:'300mg IV/IO, then 150mg'},
    {id:9, action:'Treat 5H/5T', detail:'Hypovolemia, Hypoxia, H+ (acidosis), Hypo/Hyperkalemia, Hypothermia | Tension PTX, Tamponade, Toxins, Thrombosis PE/MI', critical:true},
  ]
}

const PEA_ASYSTOLE: Algorithm = {
  id:'pea', title:'PEA / Asystole', subtitle:'Non-Shockable — ACLS', color:'#00C4B4', icon:'📉',
  rhythm:'Asystole — flat line. PEA — organised rhythm without pulse.',
  steps:[
    {id:1, action:'Confirm No Pulse', detail:'Asystole or PEA? Confirm in 2 leads. Start CPR. Do NOT defibrillate.', critical:true},
    {id:2, action:'CPR — 2 Minutes', detail:'High-quality CPR. IV/IO access.', timer:120},
    {id:3, action:'Epinephrine ASAP', detail:'1mg IV/IO as soon as access available. Repeat q3-5 min.', drug:'Epinephrine', dose:'1mg IV/IO q3-5min', critical:true},
    {id:4, action:'Treat 5H/5T', detail:'Hypovolemia → fluids. Hypoxia → O2. H+ → bicarb. Hypo/HyperK → correct. Hypothermia → warm. Tension PTX → needle decompression. Tamponade → pericardiocentesis.', critical:true},
    {id:5, action:'Rhythm Check Every 2 min', detail:'If shockable → switch to VF algorithm.', timer:120},
    {id:6, action:'Advanced Airway', detail:'ET tube or supraglottic. Waveform capnography. 10 breaths/min. Don\'t interrupt compressions.'},
    {id:7, action:'ROSC → Post-Arrest Care', detail:'SpO2 92-98%. SBP > 90. 12-lead ECG. TTM 32-36°C. ICU.'},
  ]
}

const BRADYCARDIA: Algorithm = {
  id:'brady', title:'Symptomatic Bradycardia', subtitle:'HR < 50 with symptoms', color:'#00C4B4', icon:'🐢',
  rhythm:'Sinus bradycardia, AV block, or junctional < 50 bpm',
  steps:[
    {id:1, action:'Monitor & Identify', detail:'12-lead ECG. SpO2, BP, IV access. Stable or unstable?', critical:true},
    {id:2, action:'Assess Instability', detail:'Hypotension? Altered consciousness? Chest pain? Acute HF? If yes → treat immediately.'},
    {id:3, action:'Atropine First Line', detail:'Atropine 1mg IV. Repeat q3-5 min. Max 3mg total.', drug:'Atropine', dose:'1mg IV, max 3mg', critical:true},
    {id:4, action:'If Atropine Fails', detail:'Transcutaneous pacing (TCP) immediately. OR Dopamine 2-10mcg/kg/min. OR Epinephrine 2-10mcg/min.', drug:'Dopamine', dose:'2-10 mcg/kg/min'},
    {id:5, action:'Transvenous Pacing', detail:'If TCP fails or not tolerated. Cardiology for permanent pacemaker.'},
    {id:6, action:'Treat Cause', detail:'ACS → cath lab. Drug toxicity → antidote. Hyperkalemia → calcium/insulin. Hypothyroid → T4.'},
  ]
}

const TACHY: Algorithm = {
  id:'tachy', title:'Tachycardia with Pulse', subtitle:'HR > 150 — ACLS', color:'#ff9f0a', icon:'🏃',
  rhythm:'Regular or irregular — determine: narrow vs wide QRS',
  steps:[
    {id:1, action:'Stable or Unstable?', detail:'Unstable: hypotension, AMS, ischaemic chest pain, acute HF → immediate cardioversion.', critical:true},
    {id:2, action:'Sync Cardioversion if Unstable', detail:'Sedate if conscious. Narrow regular: 50-100J. AF: 120-200J. Wide regular: 100J.', critical:true},
    {id:3, action:'Stable — Narrow QRS', detail:'Vagal manoeuvres first. Then Adenosine 6mg rapid IV push + saline flush. If no conversion → 12mg.', drug:'Adenosine', dose:'6mg rapid IV, then 12mg'},
    {id:4, action:'Stable — Wide QRS', detail:'If VT or uncertain: Amiodarone 150mg IV over 10 min. Avoid AV nodal agents if pre-excitation.', drug:'Amiodarone', dose:'150mg IV over 10 min'},
    {id:5, action:'12-Lead ECG', detail:'Identify: SVT, AF, flutter, VT, WPW? Consult cardiology if uncertain.'},
    {id:6, action:'Treat Cause', detail:'Sepsis, PE, hypoxia, drugs, electrolytes, thyroid, pain.'},
  ]
}

const ALGORITHMS = [BLS_ADULT, VF_PVT, PEA_ASYSTOLE, BRADYCARDIA, TACHY]

const H5 = ['Hypovolemia','Hypoxia','H⁺ Acidosis','Hypo/Hyperkalemia','Hypothermia']
const T5 = ['Tension Pneumothorax','Tamponade (Cardiac)','Toxins','Thrombosis — PE','Thrombosis — MI']

const DRUGS = [
  {name:'Epinephrine', dose:'1mg IV/IO q3-5min', ind:'All cardiac arrest rhythms', color:'#ff453a'},
  {name:'Amiodarone', dose:'300mg IV (1st), 150mg (2nd)', ind:'VF/pVT after 2nd shock', color:'#00C4B4'},
  {name:'Lidocaine', dose:'1-1.5mg/kg IV', ind:'VF/pVT (alt to amiodarone)', color:'#ff9f0a'},
  {name:'Atropine', dose:'1mg IV q3-5min (max 3mg)', ind:'Symptomatic bradycardia', color:'#00C4B4'},
  {name:'Adenosine', dose:'6mg rapid IV push', ind:'Regular narrow SVT', color:'#30d158'},
  {name:'Dopamine', dose:'2-20 mcg/kg/min', ind:'Bradycardia/hypotension', color:'#ffd60a'},
  {name:'Magnesium', dose:'1-2g IV over 15 min', ind:'Torsades de Pointes', color:'#64d2ff'},
  {name:'Sodium Bicarb', dose:'1 mEq/kg IV', ind:'Hyperkalemia, TCA toxicity', color:'#ff6b35'},
]

const QUIZ = [
  {q:'First drug in cardiac arrest (any rhythm)?', opts:['Amiodarone 300mg','Epinephrine 1mg IV','Atropine 1mg','Lidocaine 1.5mg/kg'], correct:1, explain:'Epinephrine 1mg IV/IO every 3-5 min is first-line in all cardiac arrest rhythms (AHA 2020).'},
  {q:'Compression rate in adult BLS?', opts:['60-80/min','80-100/min','100-120/min','120-140/min'], correct:2, explain:'AHA 2020: 100-120 compressions/min. Hard, fast, full chest recoil between compressions.'},
  {q:'First-line drug for symptomatic bradycardia?', opts:['Dopamine IV','Epinephrine drip','Atropine 1mg IV','Isoproterenol'], correct:2, explain:'Atropine 1mg IV first-line. Repeat q3-5min up to max 3mg.'},
  {q:'Biphasic energy for VF defibrillation?', opts:['50-75J','100J','120-200J','360J'], correct:2, explain:'Biphasic 120-200J per manufacturer recommendation. Monophasic 360J. Escalate if needed.'},
  {q:'Adenosine dose for SVT?', opts:['3mg','6mg rapid IV push','12mg slow IV','1mg/kg'], correct:1, explain:'Adenosine 6mg rapid IV push + saline flush. Second dose 12mg if no conversion.'},
  {q:'Which is NOT in the 5T of cardiac arrest?', opts:['Tension PTX','Thrombosis PE','Thyrotoxicosis','Tamponade'], correct:2, explain:'5T: Tension PTX, Tamponade, Toxins, Thrombosis PE, Thrombosis MI. Thyrotoxicosis is not in the 5T.'},
  {q:'Adult CPR compression depth?', opts:['1-1.5 inches','2-2.4 inches','3-4 inches','As deep as possible'], correct:1, explain:'AHA 2020: at least 2 inches (5cm), max 2.4 inches (6cm). Full recoil between compressions.'},
  {q:'Amiodarone first dose in refractory VF?', opts:['150mg IV','300mg IV bolus','500mg IV','1g IV'], correct:1, explain:'Amiodarone 300mg IV/IO bolus after 2nd shock. Second dose 150mg if VF continues.'},
]

// ── STYLES ──
const card = {background:'rgba(255,255,255,0.92)', borderRadius:20, border:'1px solid rgba(0,196,180,0.25)', padding:'14px 16px', marginBottom:10}
const glow = (color:string) => ({background:`${color}18`, border:`1px solid ${color}30`, boxShadow:`0 4px 20px ${color}15`})

export default function BLSACLSModule({ onXP }:{onXP?:(n:number)=>void}) {
  const [view, setView] = useState<ViewType>('menu')
  const [algo, setAlgo] = useState<Algorithm|null>(null)
  const [step, setStep] = useState(0)
  const [timerOn, setTimerOn] = useState(false)
  const [qIdx, setQIdx] = useState(0)
  const [ans, setAns] = useState<number|null>(null)
  const [score, setScore] = useState(0)

  if(view==='menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      {/* Header */}
      <div style={{marginBottom:18}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,69,58,0.12)',border:'1px solid rgba(255,69,58,0.25)',borderRadius:20,padding:'4px 14px',marginBottom:10}}>
          <span style={{fontSize:11}}>🫀</span>
          <span style={{fontSize:11,fontWeight:800,color:'#ff453a',letterSpacing:1}}>AHA 2020 GUIDELINES</span>
        </div>
        <h1 style={{fontSize:26,fontWeight:900,color:'var(--text-primary, white)',margin:'0 0 4px',letterSpacing:-0.5}}>BLS / ACLS</h1>
        <p style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))',margin:0}}>Interactive algorithms · Drug reference · Quiz</p>
      </div>

      {/* Algorithms */}
      <div style={{fontSize:10,color:'var(--text-secondary,rgba(10,22,40,0.55))',letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Algorithms</div>
      {ALGORITHMS.map(a=>(
        <div key={a.id} onClick={()=>{setAlgo(a);setStep(0);setView('algorithm');setTimerOn(false)}}
          style={{...card,...glow(a.color),cursor:'pointer',display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
          <div style={{width:50,height:50,borderRadius:15,background:`${a.color}20`,border:`1px solid ${a.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{a.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary, white)',marginBottom:2}}>{a.title}</div>
            <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginBottom:4}}>{a.subtitle}</div>
            <div style={{display:'flex',gap:6}}>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:`${a.color}20`,color:a.color,fontWeight:700,border:`1px solid ${a.color}30`}}>{a.steps.length} steps</span>
              {a.rhythm&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'rgba(48,209,88,0.1)',color:'#30d158',fontWeight:700,border:'1px solid rgba(48,209,88,0.2)'}}>ECG pattern</span>}
            </div>
          </div>
          <div style={{fontSize:22,color:`${a.color}60`}}>›</div>
        </div>
      ))}

      {/* Quick Reference */}
      <div style={{fontSize:10,color:'var(--text-secondary,rgba(10,22,40,0.55))',letterSpacing:2,textTransform:'uppercase',fontWeight:700,margin:'16px 0 10px'}}>Quick Reference</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div onClick={()=>setView('h5t5')} style={{background:'linear-gradient(145deg,rgba(255,69,58,0.12),rgba(0,196,180,0.08))',borderRadius:20,padding:'18px 16px',border:'1px solid rgba(255,69,58,0.2)',cursor:'pointer',boxShadow:'0 4px 20px rgba(255,69,58,0.1)'}}>
          <div style={{fontSize:32,marginBottom:8}}>🔍</div>
          <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary, white)'}}>5H · 5T</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:3}}>Reversible causes of arrest</div>
        </div>
        <div onClick={()=>setView('drugs')} style={{background:'linear-gradient(145deg,rgba(0,196,180,0.12),rgba(48,209,88,0.08))',borderRadius:20,padding:'18px 16px',border:'1px solid rgba(0,196,180,0.20)',cursor:'pointer',boxShadow:'0 4px 20px rgba(0,196,180,0.10)'}}>
          <div style={{fontSize:32,marginBottom:8}}>💊</div>
          <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary, white)'}}>Drug Doses</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:3}}>8 ACLS drugs & doses</div>
        </div>
      </div>
      <div onClick={()=>{setView('quiz');setQIdx(0);setAns(null);setScore(0)}}
        style={{background:'linear-gradient(135deg,rgba(255,214,10,0.12),rgba(255,107,53,0.08))',borderRadius:20,padding:'18px 16px',border:'1px solid rgba(255,214,10,0.25)',cursor:'pointer',display:'flex',alignItems:'center',gap:14,boxShadow:'0 4px 20px rgba(255,214,10,0.1)'}}>
        <div style={{fontSize:36}}>🧠</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary, white)'}}>ACLS Quiz</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:3}}>8 clinical questions · Earn up to +80 XP</div>
        </div>
        <div style={{fontSize:22,color:'rgba(255,214,10,0.4)'}}>›</div>
      </div>
    </div>
  )

  // ── ALGORITHM ──
  if(view==='algorithm'&&algo) {
    const s = algo.steps[step]
    const pct = ((step+1)/algo.steps.length)*100
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:'var(--text-primary, white)'}}>{algo.icon} {algo.title}</div>
            <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>{algo.subtitle}</div>
          </div>
        </div>

        {algo.rhythm&&(
          <div style={{background:'rgba(48,209,88,0.08)',borderRadius:14,padding:'10px 14px',marginBottom:12,border:'1px solid rgba(48,209,88,0.2)',boxShadow:'0 2px 12px rgba(48,209,88,0.08)'}}>
            <div style={{fontSize:10,color:'#30d158',fontWeight:700,marginBottom:3,letterSpacing:0.5}}>⚡ ECG PATTERN</div>
            <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.6}}>{algo.rhythm}</div>
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Step {step+1} / {algo.steps.length}</span>
            <span style={{fontSize:12,color:algo.color,fontWeight:700}}>{Math.round(pct)}% complete</span>
          </div>
          <div style={{height:4,background:'rgba(255,255,255,0.88)',borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${algo.color},${algo.color}aa)`,borderRadius:2,transition:'width 0.4s ease',boxShadow:`0 0 10px ${algo.color}88`}}/>
          </div>
        </div>

        {/* Current Step Card */}
        <div style={{background:s.critical?`linear-gradient(145deg,${algo.color}18,${algo.color}06)`:'rgba(255,255,255,0.92)',borderRadius:22,padding:'20px 18px',marginBottom:12,border:`1.5px solid ${s.critical?algo.color+'50':'rgba(255,255,255,0.18)'}`,boxShadow:s.critical?`0 8px 32px ${algo.color}25`:'0 4px 20px rgba(0,0,0,0.3)'}}>
          {s.critical&&(
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${algo.color}20`,border:`1px solid ${algo.color}40`,borderRadius:10,padding:'3px 10px',marginBottom:10}}>
              <span style={{fontSize:10}}>⚠️</span>
              <span style={{fontSize:10,color:algo.color,fontWeight:800,letterSpacing:0.5}}>CRITICAL ACTION</span>
            </div>
          )}
          <div style={{fontSize:22,fontWeight:900,color:'var(--text-primary, white)',marginBottom:10,letterSpacing:-0.5,lineHeight:1.3}}>{s.id}. {s.action}</div>
          <div style={{fontSize:14,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.85}}>{s.detail}</div>

          {s.drug&&(
            <div style={{background:'rgba(255,214,10,0.08)',borderRadius:14,padding:'12px 14px',marginTop:14,border:'1px solid rgba(255,214,10,0.2)'}}>
              <div style={{fontSize:10,color:'#ffd60a',fontWeight:700,marginBottom:4,letterSpacing:0.5}}>💊 DRUG</div>
              <div style={{fontSize:14,fontWeight:800,color:'var(--text-primary, white)'}}>{s.drug}</div>
              <div style={{fontSize:13,color:'rgba(255,214,10,0.9)',marginTop:2,fontWeight:600}}>{s.dose}</div>
            </div>
          )}

          {s.timer&&(
            <div style={{marginTop:12,display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>⏱ {s.timer}s suggested</div>
              <button onClick={()=>setTimerOn(!timerOn)} style={{padding:'6px 14px',borderRadius:10,border:'none',background:timerOn?'#ff453a':'#30d158',color:'var(--text-primary, white)',fontSize:11,fontWeight:700,cursor:'pointer',boxShadow:timerOn?'0 4px 12px rgba(255,69,58,0.4)':'0 4px 12px rgba(48,209,88,0.4)'}}>
                {timerOn?'⏹ Stop':'▶ Start'}
              </button>
            </div>
          )}
        </div>

        {/* Step pills */}
        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:14}}>
          {algo.steps.map((_,i)=>(
            <div key={i} onClick={()=>setStep(i)} style={{width:30,height:30,borderRadius:9,background:i===step?algo.color:i<step?`${algo.color}35`:'rgba(255,255,255,0.88)',border:`1px solid ${i===step?algo.color:i<step?`${algo.color}40`:'rgba(255,255,255,0.18)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:i===step?'white':i<step?algo.color:'rgba(10,22,40,0.40)',cursor:'pointer',boxShadow:i===step?`0 4px 12px ${algo.color}55`:'none',transition:'all 0.2s'}}>
              {i<step?'✓':i+1}
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{flex:1,padding:'14px',borderRadius:16,border:'1px solid rgba(0,196,180,0.20)',background:'var(--bg-card,rgba(255,255,255,0.88))',color:'var(--text-secondary,rgba(10,22,40,0.55))',fontSize:14,fontWeight:700,cursor:'pointer',opacity:step===0?0.3:1}}>← Prev</button>
          {step<algo.steps.length-1
            ? <button onClick={()=>setStep(s=>s+1)} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${algo.color},${algo.color}bb)`,color:'var(--text-primary, white)',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 6px 20px ${algo.color}44`}}>Next Step →</button>
            : <button onClick={()=>{onXP&&onXP(60);setView('menu')}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'var(--bg-base,#F7F9FC)',color:'var(--text-primary, white)',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(48,209,88,0.4)'}}>✅ Complete +60 XP</button>
          }
        </div>
      </div>
    )
  }

  // ── 5H5T ──
  if(view==='h5t5') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:'var(--text-primary, white)'}}>🔍 5H · 5T</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Reversible causes of cardiac arrest</div>
        </div>
      </div>
      <div style={{background:'rgba(255,255,255,0.92)',borderRadius:16,padding:'12px 16px',marginBottom:14,border:'1px solid rgba(36,63,82,0.60)'}}>
        <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.75}}>Always consider during arrest. Treat simultaneously with CPR. Finding and fixing these = best chance of ROSC.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{background:'linear-gradient(145deg,rgba(255,69,58,0.1),rgba(255,69,58,0.03))',borderRadius:22,padding:16,border:'1px solid rgba(255,69,58,0.2)',boxShadow:'0 4px 20px rgba(255,69,58,0.08)'}}>
          <div style={{fontSize:16,fontWeight:900,color:'#ff453a',marginBottom:14,letterSpacing:0.5}}>5H</div>
          {H5.map((h,i)=>(
            <div key={h} style={{display:'flex',gap:10,marginBottom:12,paddingBottom:12,borderBottom:i<4?'1px solid rgba(36,63,82,0.50)':'none'}}>
              <div style={{width:24,height:24,borderRadius:8,background:'rgba(255,69,58,0.2)',border:'1px solid rgba(255,69,58,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:'#ff453a',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'#0A1628',fontWeight:600,lineHeight:1.4}}>{h}</div>
            </div>
          ))}
        </div>
        <div style={{background:'linear-gradient(145deg,rgba(139,92,246,0.1),rgba(139,92,246,0.03))',borderRadius:22,padding:16,border:'1px solid rgba(139,92,246,0.3)',boxShadow:'0 4px 20px rgba(0,196,180,0.08)'}}>
          <div style={{fontSize:16,fontWeight:900,color:'#bf5af2',marginBottom:14,letterSpacing:0.5}}>5T</div>
          {T5.map((t,i)=>(
            <div key={t} style={{display:'flex',gap:10,marginBottom:12,paddingBottom:12,borderBottom:i<4?'1px solid rgba(36,63,82,0.50)':'none'}}>
              <div style={{width:24,height:24,borderRadius:8,background:'rgba(139,92,246,0.3)',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:'#bf5af2',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'#0A1628',fontWeight:600,lineHeight:1.4}}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── DRUGS ──
  if(view==='drugs') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:'var(--text-primary, white)'}}>💊 ACLS Drug Reference</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Doses & indications</div>
        </div>
      </div>
      {DRUGS.map(d=>(
        <div key={d.name} style={{background:'rgba(255,255,255,0.92)',borderRadius:18,padding:'14px 16px',marginBottom:8,border:`1px solid ${d.color}20`,boxShadow:`0 4px 16px ${d.color}08`}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:d.color,boxShadow:`0 0 10px ${d.color}`,flexShrink:0}}/>
            <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary, white)'}}>{d.name}</div>
          </div>
          <div style={{background:`${d.color}12`,borderRadius:12,padding:'10px 12px',marginBottom:8,border:`1px solid ${d.color}25`}}>
            <div style={{fontSize:9,color:d.color,fontWeight:700,marginBottom:3,letterSpacing:0.8}}>DOSE</div>
            <div style={{fontSize:13,color:'var(--text-primary, white)',fontWeight:700}}>{d.dose}</div>
          </div>
          <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.5}}>{d.ind}</div>
        </div>
      ))}
    </div>
  )

  // ── QUIZ ──
  if(view==='quiz') {
    if(qIdx>=QUIZ.length) return (
      <div style={{fontFamily:'-apple-system,sans-serif',textAlign:'center',padding:'40px 20px'}}>
        <div style={{fontSize:64,marginBottom:16,filter:`drop-shadow(0 0 24px ${score>=6?'rgba(255,214,10,0.6)':'rgba(255,69,58,0.4)'})`}}>{score>=6?'🏆':score>=4?'🎖️':'📚'}</div>
        <div style={{fontSize:36,fontWeight:900,color:'var(--text-primary, white)',marginBottom:8,letterSpacing:-1}}>{score}/{QUIZ.length}</div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:6,color:score>=6?'#30d158':score>=4?'#ff9f0a':'#ff453a'}}>
          {score>=6?'ACLS Ready! 🚀':score>=4?'Good — Review weak areas':'Study the algorithms'}
        </div>
        <div style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginBottom:28}}>{score*10} XP earned</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>{setQIdx(0);setAns(null);setScore(0)}} style={{flex:1,padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.18)',background:'rgba(255,255,255,0.88)',color:'var(--text-primary, white)',fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
          <button onClick={()=>{onXP&&onXP(score*10);setView('menu')}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(255,214,10,0.4)'}}>+{score*10} XP ✓</button>
        </div>
      </div>
    )

    const q = QUIZ[qIdx]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary, white)'}}>🧠 ACLS Quiz</div>
            <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Q {qIdx+1}/{QUIZ.length} · Score: {score}</div>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:'#ffd60a'}}>{score*10} XP</div>
        </div>

        <div style={{height:3,background:'rgba(255,255,255,0.88)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
          <div style={{height:'100%',width:`${(qIdx/QUIZ.length)*100}%`,background:'linear-gradient(90deg,#ffd60a,#ff9f0a)',borderRadius:2,transition:'width 0.4s',boxShadow:'0 0 8px rgba(255,214,10,0.5)'}}/>
        </div>

        <div style={{background:'rgba(255,255,255,0.92)',borderRadius:18,padding:'18px 16px',marginBottom:12,border:'1px solid rgba(255,255,255,0.18)'}}>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary, white)',lineHeight:1.7}}>{q.q}</div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {q.opts.map((o,i)=>{
            let bg='rgba(255,255,255,0.92)',border='1px solid rgba(255,255,255,0.18)',tc='rgba(255,255,255,0.8)'
            if(ans!==null){
              if(i===q.correct){bg='rgba(48,209,88,0.15)';border='2px solid #30d158';tc='#86efac'}
              else if(i===ans){bg='rgba(255,69,58,0.15)';border='2px solid #ff453a';tc='#fca5a5'}
            }
            return (
              <div key={i} onClick={()=>{if(ans!==null)return;setAns(i);if(i===q.correct)setScore(s=>s+1)}}
                style={{background:bg,borderRadius:14,padding:'14px 16px',border,cursor:ans===null?'pointer':'default',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.92)',border:'1px solid rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'var(--text-secondary,rgba(10,22,40,0.55))',flexShrink:0}}>{['A','B','C','D'][i]}</div>
                <div style={{fontSize:13,color:tc,fontWeight:500,flex:1,lineHeight:1.5}}>{o}</div>
                {ans!==null&&i===q.correct&&<span style={{fontSize:16}}>✅</span>}
                {ans!==null&&i===ans&&i!==q.correct&&<span style={{fontSize:16}}>❌</span>}
              </div>
            )
          })}
        </div>

        {ans!==null&&(
          <div>
            <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:'14px 16px',marginBottom:10,border:'1px solid rgba(0,196,180,0.20)',boxShadow:'0 4px 16px rgba(10,132,255,0.08)'}}>
              <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:6,letterSpacing:0.5}}>💡 EXPLANATION</div>
              <div style={{fontSize:13,color:'#0A1628',lineHeight:1.7}}>{q.explain}</div>
            </div>
            <button onClick={()=>{setQIdx(i=>i+1);setAns(null)}} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(255,214,10,0.35)'}}>
              {qIdx<QUIZ.length-1?'Next Question →':'See Results 🏆'}
            </button>
          </div>
        )}
      </div>
    )
  }
  return null
}
