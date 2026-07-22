'use client'
import { useState } from 'react'

const CASES = [
  {
    id:'cabg',icon:'🫀',title:'CABG — Triple Vessel Disease',sub:'68M · EF 35% · CCS III',color:'#ff453a',difficulty:'Advanced',xp:150,
    scenario:'68M, EF 35%, three-vessel CAD (LAD 90%, LCx 80%, RCA 70%). Failed maximal medical therapy. EuroSCORE II 6.2%.',
    vitals:{BP:'138/88',HR:'72 bpm',EF:'35%',EuroSCORE:'6.2%'},
    steps:[
      {title:'Preoperative Assessment',icon:'📋',content:'EuroSCORE II 6.2% — elevated risk. Optimise HbA1c <7.5%, stop antiplatelet 5 days pre-op, echo confirm EF, carotid Doppler. IABP standby if EF <30%.',detail:'Consider hybrid: MIDCAB for LAD + PCI for non-LAD vessels if anatomy suitable. Discuss with Heart Team.'},
      {title:'Cardiopulmonary Bypass',icon:'⚙️',content:'Median sternotomy. Aortic + bicaval cannulation. Cool to 32°C. Antegrade/retrograde cardioplegia. Target ACT >480s. Minimise CPB time <120 min.',detail:'Off-pump CABG (OPCAB) if calcified aorta — avoids aortic manipulation, reduces stroke risk. Requires experienced surgeon.'},
      {title:'Grafting Strategy',icon:'🔪',content:'LITA→LAD (gold standard — 90% patency at 10yr). SVG→LCx, SVG→RCA. Sequential grafting reduces aortic manipulation.',detail:'Bilateral ITA (BITA) improves survival but increases sternal wound infection risk — avoid in diabetics, obese, COPD.'},
      {title:'Weaning from CPB',icon:'📈',content:'Warm to 37°C. Defibrillate if VF. Wean with Dobutamine 5mcg/kg/min if EF <35%. TOE: wall motion, LV function, residual air.',detail:'IABP if unable to wean. LVAD (Impella/ECMO) if refractory low output. Consider VA-ECMO for cardiogenic shock.'},
      {title:'Post-op ICU',icon:'🏥',content:'Target MAP >65, CI >2.2, CVP 8-12. Ventilate 4-6h. Aspirin 100mg at 6h. Watch: AF (30%), bleeding, tamponade, stroke, AKI.',detail:'Fast-track extubation <6h reduces ICU stay. Enhanced recovery: early mobilisation, chest physio, DVT prophylaxis.'},
    ],
    ai_context:'CABG triple vessel EF 35% EuroSCORE LITA LAD SVG CPB cardioplegia OPCAB weaning inotropes IABP'
  },
  {
    id:'tavi',icon:'💠',title:'TAVI vs SAVR — Severe Aortic Stenosis',sub:'78F · AVA 0.6cm² · STS 4.8%',color:'#bf5af2',difficulty:'Expert',xp:180,
    scenario:'78F, severe AS (AVA 0.6cm², gradient 52mmHg). Symptomatic NYHA III. STS 4.8%. Intermediate risk. Frailty score borderline.',
    vitals:{AVA:'0.6 cm²',Gradient:'52 mmHg',STS:'4.8%',NYHA:'Class III'},
    steps:[
      {title:'Heart Team Decision',icon:'👥',content:'MDT: interventional cardiologist + cardiac surgeon mandatory. TAVI preferred: age >75, frailty, hostile chest, porcelain aorta. SAVR: bicuspid, young, unfavourable TAVI anatomy.',detail:'PARTNER 3 & Evolut Low Risk trials: TAVI non-inferior to SAVR in low-risk. Shared decision making with patient essential.'},
      {title:'TAVI Planning',icon:'🎯',content:'CT aorta: annulus sizing, access planning, LMCA height (>12mm needed). Transfemoral if iliac >6mm, minimal calcification. Alternative: transapical, subclavian.',detail:'Annulus sizing: area-derived diameter from CT. Undersizing → paravalvular leak. Oversizing → annular rupture (rare, fatal).'},
      {title:'TAVI Procedure',icon:'🔧',content:'GA or conscious sedation. TOE guidance. Rapid pacing 180bpm for deployment. Post-dilation if PVL >grade 1. Check LMCA perfusion post-deployment.',detail:'Permanent pacemaker risk: 10-25% (CoreValve > Sapien). New LBBB — 48h monitoring. Stroke risk 2-4%.'},
      {title:'Post-TAVI Care',icon:'📊',content:'Echo at 24h. Aspirin + Clopidogrel 3-6 months. Single antiplatelet if high bleeding risk. DOAC if AF. Endocarditis prophylaxis lifelong.',detail:'Valve-in-valve TAVI feasible for degenerated bioprosthesis — plan from outset. TAVI durability: 10-year data now available showing sustained benefit.'},
    ],
    ai_context:'TAVI SAVR aortic stenosis STS Heart Team transfemoral annulus sizing paravalvular leak pacemaker PARTNER Evolut'
  },
]

interface Props { onXP:(n:number)=>void }
export default function CardiacSurgeryAI({onXP}:Props){
  const [view,setView]=useState<'hub'|'case'>('hub')
  const [active,setActive]=useState<typeof CASES[0]|null>(null)
  const [step,setStep]=useState(0)
  const [done,setDone]=useState<string[]>([])
  const [detail,setDetail]=useState(false)
  const [aiQ,setAiQ]=useState(''),aiA=useState(''),aiLoad=useState(false),showAI=useState(false)
  const [aiAnswer,setAiAnswer]=useState(''),aiLoading=useState(false)
  const [showAIPanel,setShowAIPanel]=useState(false)

  const ask=async()=>{
    if(!aiQ.trim()||!active)return
    const [,setL]=aiLoading
    setL(true)
    try{const r=await fetch('/api/generate-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemPrompt:`Expert cardiac surgeon. Answer in 3 sentences. Context: ${active.ai_context}`,userPrompt:aiQ,specialty:'Cardiac Surgery',difficulty:'Expert'})});const d=await r.json();setAiAnswer(d.case?.management?.[0]||'Refer to cardiac surgery guidelines.')}catch{setAiAnswer('Connection error.')}
    setL(false)
  }

  if(view==='hub')return(
    <div style={{padding:'0 4px'}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(191,90,242,0.08))',borderRadius:22,padding:20,marginBottom:16,border:'1px solid rgba(255,69,58,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <div style={{fontSize:40}}>🫀</div>
          <div><div style={{fontSize:20,fontWeight:900,color:'white'}}>Cardiac Surgery AI</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>CABG · Valve · Aortic · Transplant</div></div>
          <div style={{marginLeft:'auto',background:'rgba(255,69,58,0.15)',border:'1px solid rgba(255,69,58,0.3)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:'#ff453a'}}>AI</div>
        </div>
      </div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>{setActive(c);setView('case');setStep(0);setDetail(false)}} style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${c.color}22`,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:15,background:`${c.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{c.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:'white'}}>{c.title}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{c.sub}</div></div>
            {done.includes(c.id)&&<span>✅</span>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700}}>{c.difficulty}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.1)',color:'#ffd60a',fontWeight:700}}>+{c.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  )

  if(!active)return null
  const s=active.steps[step],isLast=step===active.steps.length-1
  return(
    <div style={{padding:'0 4px'}}>
      <button onClick={()=>setView('hub')} style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 16px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:14,fontWeight:600}}>← Back</button>
      <div style={{background:`linear-gradient(135deg,${active.color}18,rgba(0,0,0,0.3))`,borderRadius:20,padding:18,marginBottom:14,border:`1px solid ${active.color}25`}}>
        <div style={{fontSize:28,marginBottom:4}}>{active.icon}</div>
        <div style={{fontSize:17,fontWeight:900,color:'white',marginBottom:3}}>{active.title}</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:12}}>{active.scenario}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {Object.entries(active.vitals).map(([k,v])=>(
            <div key={k} style={{background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'8px 12px'}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',marginBottom:2}}>{k}</div>
              <div style={{fontSize:13,fontWeight:700,color:'white'}}>{v as string}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto'}}>
        {active.steps.map((_,i)=>(
          <div key={i} onClick={()=>{setStep(i);setDetail(false)}} style={{flexShrink:0,width:36,height:36,borderRadius:12,background:i===step?`${active.color}30`:i<step?'rgba(48,209,88,0.2)':'rgba(255,255,255,0.05)',border:`1.5px solid ${i===step?active.color:i<step?'rgba(48,209,88,0.5)':'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,cursor:'pointer',color:'white'}}>{i<step?'✓':i+1}</div>
        ))}
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:20,padding:18,marginBottom:12,border:`1px solid ${active.color}20`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:11,background:`${active.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
          <div style={{fontSize:15,fontWeight:800,color:'white'}}>{s.title}</div>
        </div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.75,marginBottom:12}}>{s.content}</div>
        <button onClick={()=>setDetail(p=>!p)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'8px 14px',fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer',fontWeight:600}}>{detail?'▲ Hide':'▼ Detail'}</button>
        {detail&&<div style={{marginTop:10,padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:12,fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.7,borderLeft:`3px solid ${active.color}`}}>{s.detail}</div>}
      </div>
      <button onClick={()=>setShowAIPanel(p=>!p)} style={{width:'100%',padding:'12px',borderRadius:16,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>🤖 AI Consultant {showAIPanel?'▲':'▼'}</button>
      {showAIPanel&&(
        <div style={{background:'rgba(15,5,40,0.97)',borderRadius:18,padding:16,marginBottom:12,border:'1px solid rgba(139,92,246,0.2)'}}>
          {aiAnswer&&<div style={{background:'rgba(10,132,255,0.08)',borderRadius:12,padding:12,marginBottom:10,fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}><span style={{fontSize:10,color:'#0a84ff',fontWeight:700,display:'block',marginBottom:4}}>🤖 AI</span>{aiAnswer}</div>}
          <div style={{display:'flex',gap:8}}>
            <input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Ask cardiac surgery question..." style={{flex:1,padding:'11px 14px',borderRadius:13,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:13,outline:'none'}}/>
            <button onClick={ask} style={{width:44,height:44,borderRadius:13,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:18,cursor:'pointer',flexShrink:0}}>→</button>
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:10}}>
        {step>0&&<button onClick={()=>{setStep(p=>p-1);setDetail(false)}} style={{flex:1,padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,cursor:'pointer'}}>← Prev</button>}
        {!isLast?<button onClick={()=>{setStep(p=>p+1);setDetail(false)}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}bb)`,color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>Next →</button>
        :<button onClick={()=>{if(!done.includes(active.id)){setDone(p=>[...p,active.id]);onXP(active.xp)}setView('hub')}} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#30d158,#34d399)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>✅ Complete +{active.xp} XP</button>}
      </div>
    </div>
  )
}
