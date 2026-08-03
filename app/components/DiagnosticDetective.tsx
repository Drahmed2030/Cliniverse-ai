'use client'
import { useState } from 'react'

// ── TYPES ──
type GamePhase = 'intro' | 'history' | 'investigate' | 'diagnose' | 'result'

interface Investigation {
  id: string
  label: string
  category: string
  icon: string
  cost: number
  result: string
  critical: boolean
  revealsDx?: boolean
}

interface DetectiveCase {
  id: string
  title: string
  color: string
  icon: string
  specialty: string
  budget: number
  xpReward: number
  chiefComplaint: string
  initialHistory: string
  hiddenDx: string
  ddx: string[]
  correctDx: number
  investigations: Investigation[]
  finalAdvice: string
  keyLearning: string[]
}

// ── CASES ──
const CASES: DetectiveCase[] = [
  {
    id: 'mystery_chest',
    title: 'The Mysterious Chest Pain',
    color: '#ff453a',
    icon: '🕵️',
    specialty: 'Emergency',
    budget: 500,
    xpReward: 150,
    chiefComplaint: '34F — sudden onset chest pain + shortness of breath',
    initialHistory: 'A 34-year-old female, 6 weeks post-partum, presents with sudden right-sided chest pain and shortness of breath. Pain worsens on inspiration. No fever. HR 112. O2 sat 91% on room air. BP 118/76. She has been mostly bed-ridden since delivery.',
    hiddenDx: 'Pulmonary Embolism',
    ddx: ['Pulmonary Embolism','Pneumonia','Pleuritis','Costochondritis'],
    correctDx: 0,
    investigations: [
      {id:'ecg', label:'ECG', category:'Cardiac', icon:'📈', cost:50, result:'Sinus tachycardia. S1Q3T3 pattern (right heart strain). No ST elevation.', critical:true, revealsDx:true},
      {id:'cxr', label:'Chest X-Ray', category:'Imaging', icon:'🩻', cost:80, result:'Clear lung fields. No consolidation, no pneumothorax. Heart size normal.', critical:false},
      {id:'dimer', label:'D-Dimer', category:'Blood', icon:'🩸', cost:120, result:'D-Dimer: 4800 ng/mL (ELEVATED — normal < 500). Highly significant.', critical:true, revealsDx:true},
      {id:'troponin', label:'Troponin', category:'Cardiac', icon:'🫀', cost:150, result:'Troponin I: 0.04 (borderline). Mild RV strain pattern.', critical:false},
      {id:'ctpa', label:'CT Pulmonary Angiography', category:'Imaging', icon:'🔬', cost:400, result:'BILATERAL PULMONARY EMBOLI — right main PA + multiple bilateral segmental branches. Saddle PE pattern.', critical:true, revealsDx:true},
      {id:'echo', label:'Bedside Echo', category:'Imaging', icon:'💓', cost:200, result:'RV dilation with D-sign. TR +. TAPSE reduced. RV:LV ratio 1.1 — RV strain confirmed.', critical:true},
      {id:'wellsscore', label:'Wells Score', category:'Clinical', icon:'📋', cost:0, result:'Wells Score: Post-partum (1.5) + HR > 100 (1.5) + PE likely diagnosis (3) = 6 pts — HIGH probability.', critical:true, revealsDx:true},
      {id:'abg', label:'Arterial Blood Gas', category:'Blood', icon:'💉', cost:100, result:'pH 7.48, pO2 58, pCO2 30. Hypoxaemia + respiratory alkalosis. Consistent with PE.', critical:true},
      {id:'urine', label:'Urine Pregnancy Test', category:'Blood', icon:'🧪', cost:30, result:'Negative. Not currently pregnant.', critical:false},
      {id:'cultures', label:'Blood Cultures', category:'Blood', icon:'🦠', cost:100, result:'No growth at 48h. Unlikely infectious aetiology.', critical:false},
    ],
    finalAdvice: 'Immediate anticoagulation with LMWH or UFH. CT-PA confirms saddle PE → consider thrombolysis if haemodynamic instability. Anticoagulate 3-6 months post-partum. Screen for thrombophilia.',
    keyLearning: [
      'Post-partum state is a major PE risk factor — hypercoagulable for 6 weeks',
      'S1Q3T3 on ECG = right heart strain = think PE',
      'Wells Score + D-Dimer = efficient, cost-effective first step',
      'CT-PA is gold standard for PE diagnosis',
      'LMWH preferred over warfarin in post-partum (safe for breastfeeding)',
    ]
  },
  {
    id: 'mystery_weakness',
    title: 'Progressive Weakness',
    color: '#00C4B4',
    icon: '🧠',
    specialty: 'Neurology',
    budget: 600,
    xpReward: 180,
    chiefComplaint: '28M — ascending weakness both legs × 5 days',
    initialHistory: 'A 28-year-old male presents with progressive bilateral leg weakness over 5 days, now involving his hands. He had diarrhoea 3 weeks ago. Reflexes absent in both legs. No sensory loss. Cranial nerves intact. He\'s finding it hard to climb stairs.',
    hiddenDx: 'Guillain-Barré Syndrome',
    ddx: ['Guillain-Barré Syndrome','Multiple Sclerosis','Spinal Cord Compression','Myasthenia Gravis'],
    correctDx: 0,
    investigations: [
      {id:'mri_spine', label:'MRI Spine', category:'Imaging', icon:'🩻', cost:500, result:'No cord compression, no lesions. Normal cervical and lumbar spine.', critical:false},
      {id:'nerve_conduction', label:'Nerve Conduction Study', category:'Neuro', icon:'⚡', cost:350, result:'Demyelinating polyneuropathy — reduced conduction velocity, prolonged distal latencies, absent F-waves. Classic GBS pattern.', critical:true, revealsDx:true},
      {id:'csf', label:'Lumbar Puncture + CSF Analysis', category:'Neuro', icon:'🧪', cost:200, result:'CSF: Protein 2.8 g/L (HIGH), Cells 2/mm³ (normal). ALBUMINOCYTOLOGICAL DISSOCIATION — classic GBS finding.', critical:true, revealsDx:true},
      {id:'fbc', label:'Full Blood Count', category:'Blood', icon:'🩸', cost:80, result:'Normal WBC, no eosinophilia. Mild anaemia Hb 11.8.', critical:false},
      {id:'campylobacter', label:'Campylobacter Serology', category:'Blood', icon:'🦠', cost:120, result:'Anti-Campylobacter jejuni IgG positive — recent infection confirmed. Most common GBS trigger.', critical:true, revealsDx:true},
      {id:'spirometry', label:'Bedside Spirometry (FVC)', category:'Respiratory', icon:'💨', cost:50, result:'FVC 2.1L (55% predicted) — REDUCED. Monitor closely for respiratory failure risk.', critical:true},
      {id:'mri_brain', label:'MRI Brain', category:'Imaging', icon:'🧠', cost:500, result:'Normal. No demyelinating plaques, no mass lesions.', critical:false},
      {id:'ach_antibody', label:'AChR Antibodies', category:'Blood', icon:'💉', cost:250, result:'AChR antibodies: Negative. Myasthenia Gravis excluded.', critical:false},
    ],
    finalAdvice: 'Admit to HDU — monitor FVC every 4-6h (intubate if FVC < 1.5L or drops > 30%). IVIG 0.4g/kg/day × 5 days OR plasmapheresis. Physiotherapy. Most recover fully in 6-12 months.',
    keyLearning: [
      'GBS classic triad: ascending weakness + areflexia + preceding infection',
      'Albuminocytological dissociation in CSF = high protein, normal cells = GBS hallmark',
      'FVC monitoring is critical — respiratory failure is the killer in GBS',
      'Campylobacter jejuni most common trigger (50% of cases)',
      'IVIG and plasmapheresis are equally effective — give within 2 weeks of onset',
    ]
  },
  {
    id: 'mystery_confusion',
    title: 'Confused Elderly',
    color: '#ff9f0a',
    icon: '🧩',
    specialty: 'Internal Medicine',
    budget: 400,
    xpReward: 130,
    chiefComplaint: '78M — acute confusion + low sodium',
    initialHistory: 'A 78-year-old male, previously independent, brought in by family with 2 days of confusion. He has small cell lung cancer (SCLC) on chemotherapy. Medications: Cyclophosphamide, Ondansetron. Na+ 118 mmol/L on admission. Urine very concentrated. No leg swelling.',
    hiddenDx: 'SIADH (Paraneoplastic)',
    ddx: ['SIADH','Hypothyroidism','Adrenal Insufficiency','Hypervolaemic Hyponatraemia'],
    correctDx: 0,
    investigations: [
      {id:'serum_osm', label:'Serum Osmolality', category:'Blood', icon:'🩸', cost:100, result:'Serum Osm: 248 mOsm/kg (LOW — normal 285-295). Confirms hypotonic hyponatraemia.', critical:true, revealsDx:true},
      {id:'urine_osm', label:'Urine Osmolality', category:'Urine', icon:'🧪', cost:100, result:'Urine Osm: 680 mOsm/kg (HIGH > 100). Concentrated urine despite low serum osm = SIADH.', critical:true, revealsDx:true},
      {id:'urine_na', label:'Urine Sodium', category:'Urine', icon:'💉', cost:80, result:'Urine Na: 62 mmol/L (HIGH > 40). Kidneys wasting sodium = SIADH.', critical:true, revealsDx:true},
      {id:'tft', label:'Thyroid Function Tests', category:'Blood', icon:'🦋', cost:120, result:'TSH 2.1 mIU/L (normal). T4 normal. Hypothyroidism excluded.', critical:false},
      {id:'cortisol', label:'Morning Cortisol', category:'Blood', icon:'⏰', cost:150, result:'Cortisol 520 nmol/L (normal > 400). Adrenal insufficiency excluded.', critical:false},
      {id:'cxr', label:'Chest X-Ray', category:'Imaging', icon:'🩻', cost:80, result:'Right hilar mass with mediastinal lymphadenopathy. Consistent with known SCLC.', critical:true},
      {id:'ecg', label:'ECG', category:'Cardiac', icon:'📈', cost:50, result:'Normal sinus rhythm. No conduction abnormalities from hyponatraemia.', critical:false},
      {id:'renal_fn', label:'Renal Function', category:'Blood', icon:'🫘', cost:80, result:'Creatinine 88, eGFR 68. Normal renal function. Not renal cause.', critical:false},
    ],
    finalAdvice: 'Fluid restriction 500-800ml/day (first line SIADH). If Na < 120 + severe symptoms: 3% NaCl SLOWLY (max 8 mmol/L rise per day — avoid osmotic demyelination). Tolvaptan for recurrent SIADH. Treat underlying SCLC.',
    keyLearning: [
      'SIADH: low serum osm + high urine osm + high urine Na = classic triad',
      'SCLC most common paraneoplastic cause of SIADH (ectopic ADH)',
      'Correct Na slowly — max 8 mmol/L/day to prevent central pontine myelinolysis',
      'Fluid restriction is first-line for mild-moderate SIADH',
      'Always rule out hypothyroidism and adrenal insufficiency in hyponatraemia',
    ]
  },
]

const C = {
  card: 'var(--bg-card, rgba(255,255,255,0.72))',
  border: 'var(--border-card, rgba(10,132,255,0.12))',
  text: 'var(--text-primary, #0A1628)',
  sub: 'var(--text-secondary, rgba(10,22,40,0.55))',
  muted: 'var(--text-muted, rgba(10,22,40,0.40))',
}

export default function DiagnosticDetective({ onXP }: { onXP?: (n:number)=>void }) {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [activeCase, setActiveCase] = useState<DetectiveCase|null>(null)
  const [budget, setBudget] = useState(0)
  const [ordered, setOrdered] = useState<Investigation[]>([])
  const [selectedDx, setSelectedDx] = useState<number|null>(null)
  const [showResult, setShowResult] = useState(false)

  const startCase = (c: DetectiveCase) => {
    setActiveCase(c); setBudget(c.budget); setOrdered([]); setSelectedDx(null); setShowResult(false)
    setPhase('history')
  }

  const orderTest = (inv: Investigation) => {
    if (ordered.find(o=>o.id===inv.id)) return
    if (budget < inv.cost) return
    setBudget(b => b - inv.cost)
    setOrdered(o => [...o, inv])
  }

  const submitDx = () => {
    if (selectedDx === null || !activeCase) return
    setShowResult(true)
    const correct = selectedDx === activeCase.correctDx
    if (correct) {
      const efficiency = Math.round((budget / activeCase.budget) * 50)
      onXP && onXP(activeCase.xpReward + efficiency)
    } else {
      onXP && onXP(20)
    }
    setPhase('result')
  }

  const budgetPct = activeCase ? (budget / activeCase.budget) * 100 : 100
  const budgetColor = budgetPct > 50 ? '#30d158' : budgetPct > 25 ? '#ff9f0a' : '#ff453a'

  // ── INTRO ──
  if (phase === 'intro') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.12),rgba(10,132,255,0.08))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(0,196,180,0.25)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.25),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(0,196,180,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🕵️ NEW MODE</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:6}}>Diagnostic Detective</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:12}}>Order investigations wisely. Every test costs money. Diagnose accurately with the least spend to maximise your score.</div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1,background:'rgba(255,255,255,0.14)',borderRadius:12,padding:'10px',border:'1px solid rgba(255,255,255,0.18)',textAlign:'center'}}>
            <div style={{fontSize:18}}>💰</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginTop:4}}>Budget System</div>
          </div>
          <div style={{flex:1,background:'rgba(255,255,255,0.14)',borderRadius:12,padding:'10px',border:'1px solid rgba(255,255,255,0.18)',textAlign:'center'}}>
            <div style={{fontSize:18}}>🔬</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginTop:4}}>Order Tests</div>
          </div>
          <div style={{flex:1,background:'rgba(255,255,255,0.14)',borderRadius:12,padding:'10px',border:'1px solid rgba(255,255,255,0.18)',textAlign:'center'}}>
            <div style={{fontSize:18}}>🏆</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginTop:4}}>Diagnose</div>
          </div>
        </div>
      </div>

      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Choose a Case</div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>startCase(c)}
          style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${c.color}25`,cursor:'pointer',boxShadow:`0 4px 20px ${c.color}10`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${c.color}10`,filter:'blur(15px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:52,height:52,borderRadius:16,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:2}}>{c.title}</div>
              <div style={{fontSize:11,color:C.sub}}>{c.chiefComplaint}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${c.color}15`,color:c.color,fontWeight:700,border:`1px solid ${c.color}25`}}>{c.specialty}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.12)',color:'#ffd60a',fontWeight:700}}>💰 Budget: {c.budget} pts</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(0,196,180,0.25)',color:'#6ee7e1',fontWeight:700}}>+{c.xpReward} XP</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (!activeCase) return null
  const c = activeCase

  // ── HISTORY ──
  if (phase === 'history') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setPhase('intro')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>{c.icon} {c.title}</div>
          <div style={{fontSize:11,color:C.sub}}>{c.specialty}</div>
        </div>
      </div>

      <div style={{background:`${c.color}10`,borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${c.color}30`,boxShadow:`0 6px 24px ${c.color}10`}}>
        <div style={{fontSize:10,color:c.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📋 PATIENT PRESENTATION</div>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>{c.chiefComplaint}</div>
        <div style={{fontSize:13,color:'rgba(10,22,40,0.85)',lineHeight:1.85}}>{c.initialHistory}</div>
      </div>

      <div style={{background:'rgba(255,214,10,0.08)',borderRadius:16,padding:'14px',marginBottom:16,border:'1px solid rgba(255,214,10,0.2)'}}>
        <div style={{fontSize:11,color:'#ffd60a',fontWeight:700,marginBottom:4}}>💰 Your Investigation Budget</div>
        <div style={{fontSize:28,fontWeight:900,color:'#ffd60a'}}>{c.budget} points</div>
        <div style={{fontSize:11,color:C.sub,marginTop:4}}>Order wisely — unused budget = bonus XP at the end</div>
      </div>

      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>setPhase('investigate')} style={{flex:2,padding:'16px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${c.color},${c.color}bb)`,color:'var(--text-primary, #0A1628)',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${c.color}44`}}>
          🔬 Start Investigating
        </button>
      </div>
    </div>
  )

  // ── INVESTIGATE ──
  if (phase === 'investigate') {
    const categories = [...new Set(c.investigations.map(i=>i.category))]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        {/* Budget bar */}
        <div style={{background:C.card,borderRadius:16,padding:'12px 16px',marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:12,color:C.sub,fontWeight:600}}>💰 Remaining Budget</span>
            <span style={{fontSize:14,fontWeight:800,color:budgetColor}}>{budget} pts</span>
          </div>
          <div style={{height:6,background:'rgba(255,255,255,0.12)',borderRadius:3,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${budgetPct}%`,background:`linear-gradient(90deg,${budgetColor},${budgetColor}aa)`,borderRadius:3,transition:'width 0.4s ease',boxShadow:`0 0 10px ${budgetColor}88`}}/>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{ordered.length} tests ordered · {c.budget - budget} pts spent</div>
        </div>

        {/* Ordered results */}
        {ordered.length > 0 && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Results Received</div>
            {ordered.map(inv=>(
              <div key={inv.id} style={{background:inv.critical?`${c.color}08`:C.card,borderRadius:14,padding:'12px 14px',marginBottom:8,border:`1px solid ${inv.critical?c.color+'30':C.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontSize:14}}>{inv.icon}</span>
                  <span style={{fontSize:12,fontWeight:700,color:inv.critical?c.color:C.text}}>{inv.label}</span>
                  {inv.critical&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:6,background:`${c.color}20`,color:c.color,fontWeight:700}}>KEY</span>}
                  <span style={{marginLeft:'auto',fontSize:10,color:C.muted}}>-{inv.cost} pts</span>
                </div>
                <div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.6}}>{inv.result}</div>
              </div>
            ))}
          </div>
        )}

        {/* Available tests by category */}
        {categories.map(cat=>(
          <div key={cat} style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>{cat}</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {c.investigations.filter(i=>i.category===cat).map(inv=>{
                const done = ordered.find(o=>o.id===inv.id)
                const canAfford = budget >= inv.cost
                return (
                  <div key={inv.id} onClick={()=>!done&&canAfford&&orderTest(inv)}
                    style={{background:done?`${c.color}08`:C.card,borderRadius:14,padding:'12px 14px',border:done?`1px solid ${c.color}30`:canAfford?`1px solid ${C.border}`:'1px solid rgba(36,63,82,0.60)',cursor:done||!canAfford?'default':'pointer',opacity:done?0.7:canAfford?1:0.4,display:'flex',alignItems:'center',gap:12,transition:'all 0.2s'}}>
                    <span style={{fontSize:20,flexShrink:0}}>{inv.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:done?c.color:C.text}}>{inv.label}</div>
                      {done&&<div style={{fontSize:11,color:'rgba(10,22,40,0.85)',marginTop:2,lineHeight:1.4}}>{inv.result}</div>}
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      {done ? <span style={{fontSize:12,color:'#30d158',fontWeight:700}}>✓ Done</span>
                        : <span style={{fontSize:12,fontWeight:700,color:canAfford?'#ffd60a':'#ff453a'}}>{inv.cost===0?'FREE':`-${inv.cost}`}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <button onClick={()=>setPhase('diagnose')} disabled={ordered.length<2}
          style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:ordered.length>=2?`linear-gradient(135deg,${c.color},${c.color}bb)`:'rgba(255,255,255,0.18)',color:'var(--text-primary, #0A1628)',fontSize:15,fontWeight:800,cursor:ordered.length>=2?'pointer':'not-allowed',boxShadow:ordered.length>=2?`0 6px 24px ${c.color}44`:'none',opacity:ordered.length>=2?1:0.5}}>
          🩺 Make Diagnosis ({ordered.length} tests done)
        </button>
      </div>
    )
  }

  // ── DIAGNOSE ──
  if (phase === 'diagnose') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <button onClick={()=>setPhase('investigate')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← More Tests</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>🩺 Make Your Diagnosis</div>
          <div style={{fontSize:11,color:C.sub}}>Remaining budget: {budget} pts</div>
        </div>
      </div>

      <div style={{background:`${c.color}10`,borderRadius:18,padding:'14px',marginBottom:14,border:`1px solid ${c.color}25`}}>
        <div style={{fontSize:11,color:c.color,fontWeight:700,marginBottom:6}}>📊 Summary — {ordered.length} tests ordered</div>
        <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{c.chiefComplaint}</div>
      </div>

      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>What is your diagnosis?</div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
        {c.ddx.map((dx,i)=>(
          <div key={i} onClick={()=>setSelectedDx(i)}
            style={{background:selectedDx===i?`${c.color}15`:C.card,borderRadius:16,padding:'16px',border:selectedDx===i?`2px solid ${c.color}`:`1px solid ${C.border}`,cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.2s',boxShadow:selectedDx===i?`0 4px 20px ${c.color}25`:'none'}}>
            <div style={{width:30,height:30,borderRadius:9,background:selectedDx===i?`${c.color}25`:'rgba(255,255,255,0.12)',border:`1px solid ${selectedDx===i?c.color:'rgba(0,196,180,0.20)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:selectedDx===i?c.color:C.muted,flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:14,fontWeight:600,color:selectedDx===i?C.text:C.sub,flex:1}}>{dx}</div>
            {selectedDx===i&&<span style={{color:c.color,fontSize:18}}>◉</span>}
          </div>
        ))}
      </div>

      <button onClick={submitDx} disabled={selectedDx===null}
        style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:selectedDx!==null?'linear-gradient(135deg,#00C4B4,#0a84ff)':'rgba(255,255,255,0.12)',color:'var(--text-primary, #0A1628)',fontSize:15,fontWeight:800,cursor:selectedDx!==null?'pointer':'not-allowed',boxShadow:selectedDx!==null?'0 6px 24px rgba(139,92,246,0.4)':'none',opacity:selectedDx!==null?1:0.5}}>
        ✅ Submit Diagnosis
      </button>
    </div>
  )

  // ── RESULT ──
  if (phase === 'result') {
    const correct = selectedDx === c.correctDx
    const efficiency = Math.round((budget / c.budget) * 100)
    const xpEarned = correct ? c.xpReward + Math.round((budget/c.budget)*50) : 20
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{background:correct?'linear-gradient(145deg,rgba(48,209,88,0.15),rgba(10,132,255,0.08))':'linear-gradient(145deg,rgba(255,69,58,0.15),rgba(0,196,180,0.08))',borderRadius:24,padding:'28px 20px',marginBottom:16,border:correct?'1px solid rgba(48,209,88,0.25)':'1px solid rgba(255,69,58,0.25)',textAlign:'center',boxShadow:correct?'0 8px 32px rgba(48,209,88,0.15)':'0 8px 32px rgba(255,69,58,0.15)'}}>
          <div style={{fontSize:60,marginBottom:12}}>{correct?'🎯':'❌'}</div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:6}}>
            {correct ? 'Correct Diagnosis!' : 'Not Quite'}
          </div>
          <div style={{fontSize:16,fontWeight:700,color:correct?'#30d158':'#ff453a',marginBottom:8}}>{c.hiddenDx}</div>
          <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:8}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:'#ffd60a'}}>+{xpEarned} XP</div>
              <div style={{fontSize:10,color:C.muted}}>earned</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:budgetColor}}>{efficiency}%</div>
              <div style={{fontSize:10,color:C.muted}}>efficiency</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:900,color:'#00C4B4'}}>{ordered.length}</div>
              <div style={{fontSize:10,color:C.muted}}>tests used</div>
            </div>
          </div>
        </div>

        {/* Final advice */}
        <div style={{background:`${c.color}08`,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${c.color}20`}}>
          <div style={{fontSize:10,color:c.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>💊 MANAGEMENT</div>
          <div style={{fontSize:13,color:'#0A1628',lineHeight:1.8}}>{c.finalAdvice}</div>
        </div>

        {/* Key learning */}
        <div style={{background:'rgba(10,132,255,0.06)',borderRadius:18,padding:'16px',marginBottom:16,border:'1px solid rgba(0,196,180,0.15)'}}>
          <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>💡 KEY LEARNING</div>
          {c.keyLearning.map((l,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
              <span style={{color:'#30d158',flexShrink:0,marginTop:2}}>✓</span>
              <span style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.6}}>{l}</span>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>startCase(c)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${c.color}30`,background:`${c.color}10`,color:c.color,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
          <button onClick={()=>setPhase('intro')} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#bf5af2,#8b5cf6)',color:'var(--text-primary, #0A1628)',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(0,196,180,0.4)'}}>🕵️ New Case</button>
        </div>
      </div>
    )
  }

  return null
}
