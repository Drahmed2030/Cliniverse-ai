'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'var(--border-card, rgba(10,132,255,0.12))',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.72)',
  muted:  'rgba(238,246,250,0.50)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

// ── DRUG CALCULATOR ──
function DrugCalculator() {
  const [weight, setWeight] = useState(70)
  const [egfr, setEgfr]     = useState(90)
  const [age, setAge]       = useState(55)
  const [drug, setDrug]     = useState('vancomycin')

  const DRUGS = [
    {
      id:'vancomycin', label:'Vancomycin', icon:'💉', color:T.blue,
      category:'Antibiotic',
      calc: (w:number, e:number) => {
        const dose = e>50 ? '15-20 mg/kg' : e>30 ? '10-15 mg/kg' : e>10 ? '5-10 mg/kg' : 'Avoid'
        const interval = e>50 ? 'Q8-12H' : e>30 ? 'Q24H' : e>10 ? 'Q48H' : 'HD-dependent'
        const actual = e>50 ? Math.round(17.5*w) : e>30 ? Math.round(12.5*w) : e>10 ? Math.round(7.5*w) : 0
        return { dose, interval, actual: actual>0?`${actual}mg`:'Consult pharmacy', target:'AUC/MIC 400-600', monitor:'Trough <10 or AUC monitoring' }
      },
      note:'Adjust for renal function. Monitor levels. Infuse over 60+ min to prevent Red Man Syndrome.'
    },
    {
      id:'gentamicin', label:'Gentamicin', icon:'🧪', color:T.teal,
      category:'Aminoglycoside',
      calc: (w:number, e:number) => {
        const dose = e>60 ? '5-7 mg/kg' : e>40 ? '4-5 mg/kg' : e>20 ? '2-3 mg/kg' : 'Avoid'
        const interval = e>60 ? 'Q24H' : e>40 ? 'Q36H' : e>20 ? 'Q48H' : 'Avoid'
        const actual = e>60 ? Math.round(6*w) : e>40 ? Math.round(4.5*w) : e>20 ? Math.round(2.5*w) : 0
        return { dose, interval, actual: actual>0?`${actual}mg`:'Contraindicated', target:'Peak 5-10 mg/L (Q24H dosing)', monitor:'Trough <1 mg/L before next dose' }
      },
      note:'Ototoxic and nephrotoxic. Avoid in pregnancy. Monitor renal function daily.'
    },
    {
      id:'heparin', label:'Unfractionated Heparin', icon:'🩸', color:T.red,
      category:'Anticoagulant',
      calc: (w:number, e:number) => {
        const bolus = Math.round(80*w)
        const infusion = Math.round(18*w)
        return { dose:'80 units/kg bolus', interval:'Then 18 units/kg/hr', actual:`Bolus: ${bolus}u · Infusion: ${infusion}u/hr`, target:'APTT 60-100 seconds (1.5-2.5x normal)', monitor:'APTT 6h after initiation, then Q24H' }
      },
      note:'Use ideal body weight if >130% IBW. Monitor platelets for HIT (Day 4-10).'
    },
    {
      id:'enoxaparin', label:'Enoxaparin (LMWH)', icon:'💊', color:T.orange,
      category:'Anticoagulant',
      calc: (w:number, e:number) => {
        const tx = e>30 ? Math.round(1.0*w) : Math.round(0.5*w)
        const px = e>30 ? 40 : 20
        return {
          dose: e>30 ? '1 mg/kg' : '0.5 mg/kg (CKD)',
          interval: e>30 ? 'BD (treatment)' : 'OD (reduced)',
          actual: `Treatment: ${tx}mg BD · Prophylaxis: ${px}mg OD`,
          target: 'Anti-Xa 0.6-1.0 IU/mL (4h post-dose)',
          monitor: e<30 ? 'Anti-Xa levels essential' : 'Anti-Xa if weight >100kg or <50kg'
        }
      },
      note:'Avoid if eGFR <15. Use UFH in severe renal failure. Check weight regularly.'
    },
    {
      id:'morphine', label:'Morphine', icon:'🌿', color:T.purple,
      category:'Opioid Analgesic',
      calc: (w:number, e:number, a:number) => {
        const base = a>65 ? '2.5-5' : '5-10'
        const iv = a>65 ? Math.round(2.5*w/10) : Math.round(5*w/10)
        const reduced = e<30 || a>80
        return {
          dose: reduced ? `${base}mg reduced dose` : `${base}mg`,
          interval: reduced ? 'Q6-8H (reduce/avoid)' : 'Q4H PRN',
          actual: reduced ? `Start ${Math.round(iv*0.5)}mg IV — titrate carefully` : `${iv}mg IV PRN`,
          target: 'Pain score <4/10',
          monitor: 'RR, sedation score, SpO2'
        }
      },
      note:'Reduce dose by 50% in elderly >75 or eGFR<30. Active metabolite accumulates in renal failure.'
    },
    {
      id:'metformin', label:'Metformin', icon:'💊', color:T.green,
      category:'Antidiabetic',
      calc: (w:number, e:number) => {
        const allowed = e>=45
        const dose = e>=60 ? '500-1000mg BD' : e>=45 ? '500mg OD-BD (caution)' : 'STOP'
        return {
          dose,
          interval: e>=45 ? 'With food' : 'Contraindicated',
          actual: e>=60 ? '500-1000mg twice daily' : e>=45 ? '500mg once daily — monitor' : 'STOP METFORMIN',
          target: 'HbA1c <53 mmol/mol (<7%)',
          monitor: 'eGFR every 3-6 months'
        }
      },
      note:'STOP if eGFR<45 for new starts. Hold 48h before contrast. Risk of lactic acidosis.'
    },
    {
      id:'amoxicillin', label:'Amoxicillin/Clavulanate', icon:'💉', color:T.teal,
      category:'Antibiotic',
      calc: (w:number, e:number) => {
        const dose = e>=30 ? '625mg TDS or 1.2g IV TDS' : e>=10 ? '625mg BD' : '625mg OD'
        return {
          dose,
          interval: e>=30 ? 'TDS (Q8H)' : e>=10 ? 'BD (Q12H)' : 'OD (Q24H)',
          actual: e>=30 ? '625mg TDS PO or 1.2g TDS IV' : `Reduced: ${e>=10?'BD':'OD'}`,
          target: 'Clinical improvement 48-72h',
          monitor: 'LFTs if >14 days. Allergy history.'
        }
      },
      note:'Most common cause of drug-induced liver injury. Check penicillin allergy. Diarrhoea common.'
    },
    {
      id:'digoxin', label:'Digoxin', icon:'🫀', color:T.red,
      category:'Cardiac Glycoside',
      calc: (w:number, e:number, a:number) => {
        const dose = e<30 || a>70 ? '62.5 mcg OD' : e<60 ? '125 mcg OD' : '125-250 mcg OD'
        const level = '0.5-0.9 ng/mL (HF) · 1.5-2 ng/mL (AF rate control)'
        return {
          dose,
          interval: 'Once daily',
          actual: e<30 ? '62.5 mcg (max) — consider alternate day' : dose,
          target: level,
          monitor: 'Digoxin level 6h post-dose. K+, Mg2+, Creatinine'
        }
      },
      note:'Narrow therapeutic index. Toxicity risk with hypokalaemia. Many drug interactions (amiodarone doubles levels).'
    },
  ]

  const selected = DRUGS.find(d=>d.id===drug)||DRUGS[0]
  const result   = selected.calc(weight, egfr, age)

  return (
    <div style={{fontFamily:F}}>
      <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>SELECT DRUG</div>
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:16}}>
        {DRUGS.map(d=>(
          <button key={d.id} onClick={()=>setDrug(d.id)} style={{
            flexShrink:0,
            background:drug===d.id?`${d.color}18`:T.glass2,
            border:`1.5px solid ${drug===d.id?d.color:'rgba(10,22,40,0.38)'}`,
            borderRadius:14,padding:'8px 12px',cursor:'pointer',fontFamily:F,
            transition:'all 0.2s',
            boxShadow:drug===d.id?`0 0 14px ${d.color}25`:'none',
          }}>
            <div style={{fontSize:16,marginBottom:2,textAlign:'center'}}>{d.icon}</div>
            <div style={{fontSize:9,fontWeight:700,color:drug===d.id?d.color:T.muted,textAlign:'center',whiteSpace:'nowrap'}}>{d.label.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {/* Patient params */}
      <div style={{background:T.glass,backdropFilter:'blur(16px)',borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${T.border}`}}>
        <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:12}}>PATIENT PARAMETERS</div>
        {[
          {label:'Weight (kg)', value:weight, set:setWeight, min:30, max:200, step:1,  color:T.blue},
          {label:'eGFR (ml/min)', value:egfr, set:setEgfr,   min:5,  max:120, step:5,  color:T.teal},
          {label:'Age (years)',  value:age,   set:setAge,    min:18, max:100, step:1,  color:T.purple},
        ].map(p=>(
          <div key={p.label} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',fontWeight:600}}>{p.label}</span>
              <span style={{fontSize:14,fontWeight:900,color:p.color}}>{p.value}</span>
            </div>
            <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
              onChange={e=>p.set(Number(e.target.value))}
              style={{width:'100%',accentColor:p.color}}/>
          </div>
        ))}

        {/* eGFR stage indicator */}
        <div style={{display:'flex',gap:4,marginTop:4}}>
          {[
            {l:'G5',  min:0,  max:14,  c:T.red},
            {l:'G4',  min:15, max:29,  c:T.orange},
            {l:'G3b', min:30, max:44,  c:'#FFB300'},
            {l:'G3a', min:45, max:59,  c:T.gold},
            {l:'G2',  min:60, max:89,  c:T.green},
            {l:'G1',  min:90, max:120, c:T.teal},
          ].map(s=>(
            <div key={s.l} style={{flex:1,height:4,borderRadius:2,background:egfr>=s.min&&egfr<=s.max?s.c:'rgba(255,255,255,0.08)',transition:'background 0.3s'}}/>
          ))}
        </div>
        <div style={{fontSize:9,color:T.muted,marginTop:4}}>
          CKD Stage: {egfr>=90?'G1 (Normal)':egfr>=60?'G2 (Mild)':egfr>=45?'G3a':egfr>=30?'G3b':egfr>=15?'G4 (Severe)':'G5 (Failure)'}
        </div>
      </div>

      {/* Result card */}
      <div style={{
        background:`${selected.color}10`,backdropFilter:'blur(16px)',
        borderRadius:20,padding:'18px',marginBottom:12,
        border:`1.5px solid ${selected.color}30`,
        boxShadow:`0 0 24px ${selected.color}18`,
        position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${selected.color}18,transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <div style={{width:48,height:48,borderRadius:15,background:`${selected.color}18`,border:`1.5px solid ${selected.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{selected.icon}</div>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:'var(--text-primary,#0A1628)'}}>{selected.label}</div>
            <div style={{fontSize:10,color:selected.color,fontWeight:600}}>{selected.category}</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          {[
            {l:'Dose',     v:result.dose,     c:selected.color},
            {l:'Interval', v:result.interval, c:T.blue},
            {l:'For this patient', v:result.actual, c:result.actual.includes('Avoid')||result.actual.includes('Contra')||result.actual.includes('STOP')?T.red:T.green},
            {l:'Target',   v:result.target,   c:T.gold},
          ].map(r=>(
            <div key={r.l} style={{background:'var(--bg-card,rgba(255,255,255,0.06))',borderRadius:12,padding:'10px 10px'}}>
              <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>{r.l.toUpperCase()}</div>
              <div style={{fontSize:11,fontWeight:800,color:r.c,lineHeight:1.4}}>{r.v}</div>
            </div>
          ))}
        </div>

        <div style={{background:'var(--bg-card,rgba(255,255,255,0.04))',borderRadius:12,padding:'10px 12px',marginBottom:10,border:`1px solid rgba(255,255,255,0.08)`}}>
          <div style={{fontSize:8,color:T.orange,fontWeight:700,letterSpacing:1,marginBottom:4}}>📊 MONITORING</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.5}}>{result.monitor}</div>
        </div>

        <div style={{background:'rgba(255,59,48,0.06)',borderRadius:12,padding:'10px 12px',border:`1px solid rgba(255,59,48,0.15)`}}>
          <div style={{fontSize:8,color:T.red,fontWeight:700,letterSpacing:1,marginBottom:4}}>⚠️ CLINICAL NOTE</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.5}}>{selected.note}</div>
        </div>
      </div>
    </div>
  )
}

// ── CLINICAL SCORES ──
function ClinicalScores() {
  const [activeScore, setActiveScore] = useState('chadsvasc')

  const SCORES = [
    {
      id:'chadsvasc', label:'CHA₂DS₂-VASc', icon:'🫀', color:T.red,
      use:'Stroke risk in non-valvular AF',
      fields:[
        {id:'chf',    label:'Congestive Heart Failure',  points:1},
        {id:'htn',    label:'Hypertension',              points:1},
        {id:'age75',  label:'Age ≥ 75 years',            points:2},
        {id:'dm',     label:'Diabetes Mellitus',         points:1},
        {id:'stroke', label:'Stroke/TIA/Thromboembolism',points:2},
        {id:'vascular',label:'Vascular disease (MI/PAD)', points:1},
        {id:'age65',  label:'Age 65-74 years',           points:1},
        {id:'female', label:'Female sex',                points:1},
      ],
      interpret:(score:number)=>{
        if(score===0) return {risk:'Low',color:T.green,action:'No anticoagulation needed',annual:'0%'}
        if(score===1) return {risk:'Low-Moderate',color:T.orange,action:'Consider anticoagulation (especially if female)',annual:'1.3%'}
        return {risk:'High',color:T.red,action:'Anticoagulate — DOAC preferred (apixaban/rivaroxaban)',annual:`${(score*1.5).toFixed(1)}%`}
      }
    },
    {
      id:'wells_pe', label:'Wells PE', icon:'🫁', color:T.blue,
      use:'Pre-test probability for Pulmonary Embolism',
      fields:[
        {id:'dvt_sx',   label:'Clinical signs/symptoms of DVT',    points:3},
        {id:'pe_likely',label:'PE more likely than alternative',   points:3},
        {id:'hr100',    label:'Heart rate > 100 bpm',              points:1.5},
        {id:'immob',    label:'Immobilisation ≥3d or surgery <4wk',points:1.5},
        {id:'prev_pe',  label:'Previous PE or DVT',                points:1.5},
        {id:'hemopt',   label:'Haemoptysis',                       points:1},
        {id:'malign',   label:'Malignancy (active)',                points:1},
      ],
      interpret:(score:number)=>{
        if(score<2)  return {risk:'Low',color:T.green,action:'D-dimer — if negative, PE excluded',annual:'1.3%'}
        if(score<=6) return {risk:'Moderate',color:T.orange,action:'D-dimer or CT-PA if clinical suspicion',annual:'16.2%'}
        return {risk:'High',color:T.red,action:'CT-PA immediately — do not wait for D-dimer',annual:'37.5%'}
      }
    },
    {
      id:'curb65', label:'CURB-65', icon:'🫁', color:T.orange,
      use:'Pneumonia severity & admission decision',
      fields:[
        {id:'confusion',label:'Confusion (new disorientation)',     points:1},
        {id:'urea',     label:'Urea > 7 mmol/L (BUN >19 mg/dL)',  points:1},
        {id:'rr30',     label:'Respiratory Rate ≥ 30/min',         points:1},
        {id:'bp',       label:'BP <90 systolic or ≤60 diastolic',  points:1},
        {id:'age65c',   label:'Age ≥ 65 years',                    points:1},
      ],
      interpret:(score:number)=>{
        if(score<=1) return {risk:'Low',color:T.green,action:'Outpatient treatment — oral antibiotics',annual:'<3% mortality'}
        if(score===2) return {risk:'Moderate',color:T.orange,action:'Consider admission — short stay or supervised',annual:'9% mortality'}
        return {risk:'Severe',color:T.red,action:'Hospital admission — consider ICU if score 4-5',annual:`${score>=4?'22-40':'15-20'}% mortality`}
      }
    },
    {
      id:'qsofa', label:'qSOFA', icon:'🦠', color:T.purple,
      use:'Sepsis screening in non-ICU patients',
      fields:[
        {id:'alt_mental',label:'Altered mental status (GCS <15)',  points:1},
        {id:'rr22',      label:'Respiratory Rate ≥ 22/min',        points:1},
        {id:'sbp100',    label:'Systolic BP ≤ 100 mmHg',           points:1},
      ],
      interpret:(score:number)=>{
        if(score<2) return {risk:'Low',color:T.green,action:'Low risk — continue monitoring, reassess if deteriorates',annual:'<3%'}
        return {risk:'High',color:T.red,action:'Sepsis likely — initiate 1-hour bundle immediately',annual:'>10% in-hospital mortality'}
      }
    },
    {
      id:'gcs', label:'Glasgow Coma', icon:'🧠', color:T.purple,
      use:'Consciousness level assessment',
      fields:[
        {id:'eye4', label:'Eye opening: Spontaneous (4)',           points:4},
        {id:'eye3', label:'Eye opening: To voice (3)',              points:3},
        {id:'eye2', label:'Eye opening: To pain (2)',               points:2},
        {id:'eye1', label:'Eye opening: None (1)',                  points:1},
        {id:'ver5', label:'Verbal: Orientated (5)',                 points:5},
        {id:'ver3', label:'Verbal: Words only (3)',                 points:3},
        {id:'ver1', label:'Verbal: None (1)',                       points:1},
        {id:'mot6', label:'Motor: Obeys commands (6)',              points:6},
        {id:'mot4', label:'Motor: Withdraws (4)',                   points:4},
        {id:'mot1', label:'Motor: None (1)',                        points:1},
      ],
      interpret:(score:number)=>{
        if(score>=13) return {risk:'Mild',color:T.green,action:'Monitor — reassess regularly',annual:'GCS 13-15'}
        if(score>=9)  return {risk:'Moderate',color:T.orange,action:'CT head — neurosurgery consult',annual:'GCS 9-12'}
        return {risk:'Severe',color:T.red,action:'Intubation likely — ICU/neurosurgery urgent',annual:'GCS ≤8: Intubate'}
      }
    },
    {
      id:'meld', label:'MELD Score', icon:'🫀', color:T.gold,
      use:'Liver disease severity & transplant priority',
      fields:[
        {id:'cr2',    label:'Creatinine > 2.0 mg/dL or dialysis', points:2},
        {id:'bili3',  label:'Bilirubin > 3.0 mg/dL',              points:2},
        {id:'inr2',   label:'INR > 2.0',                           points:2},
        {id:'na130',  label:'Sodium < 130 mEq/L',                  points:2},
        {id:'hep',    label:'Hepatocellular carcinoma',            points:1},
      ],
      interpret:(score:number)=>{
        if(score<10) return {risk:'Low',color:T.green,action:'Outpatient management — 6-monthly review',annual:'<5% 90-day mortality'}
        if(score<20) return {risk:'Moderate',color:T.orange,action:'Hepatology follow-up — transplant listing discussion',annual:'6-20% 90-day mortality'}
        return {risk:'High',color:T.red,action:'Urgent transplant listing — ICU if >30',annual:`${score>=30?'>50':'20-50'}% 90-day mortality`}
      }
    },
    {
      id:'news2', label:'NEWS2', icon:'📊', color:T.teal,
      use:'National Early Warning Score — NHS Standard',
      fields:[
        {id:'rr25',   label:'RR ≥ 25/min',                         points:3},
        {id:'rr21',   label:'RR 21-24/min',                        points:2},
        {id:'spo291', label:'SpO2 < 92% (or per scale 2)',         points:3},
        {id:'spo294', label:'SpO2 92-93%',                         points:2},
        {id:'sbp90',  label:'Systolic BP < 90 mmHg',               points:3},
        {id:'sbp100', label:'Systolic BP 91-100 mmHg',             points:2},
        {id:'hr130',  label:'Heart Rate > 130 bpm',                points:3},
        {id:'hr111',  label:'Heart Rate 111-130 bpm',              points:2},
        {id:'neuro',  label:'New confusion/altered consciousness', points:3},
        {id:'temp35', label:'Temperature < 35°C or > 39.1°C',     points:2},
      ],
      interpret:(score:number)=>{
        if(score<=4)  return {risk:'Low',color:T.green,action:'Ward monitoring Q4-6H',annual:'Score 0-4'}
        if(score<=6)  return {risk:'Medium',color:T.orange,action:'Urgent review — consider HDU/ICU',annual:'Score 5-6'}
        return {risk:'HIGH',color:T.red,action:'EMERGENCY — continuous monitoring, senior review NOW',annual:'Score ≥7'}
      }
    },
  ]

  const score = SCORES.find(s=>s.id===activeScore)||SCORES[0]
  const [checked, setChecked] = useState<Record<string,boolean>>({})

  const toggle = (id:string) => setChecked(prev=>({...prev,[id]:!prev[id]}))
  const total = score.fields.reduce((sum,f)=>sum+(checked[f.id]?f.points:0),0)
  const result = score.interpret(total)

  const resetScore = () => setChecked({})

  return (
    <div style={{fontFamily:F}}>
      {/* Score selector */}
      <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CLINICAL SCORE</div>
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:16}}>
        {SCORES.map(s=>(
          <button key={s.id} onClick={()=>{setActiveScore(s.id);resetScore()}} style={{
            flexShrink:0,
            background:activeScore===s.id?`${s.color}18`:T.glass2,
            border:`1.5px solid ${activeScore===s.id?s.color:'rgba(10,22,40,0.38)'}`,
            borderRadius:14,padding:'8px 12px',cursor:'pointer',fontFamily:F,
            transition:'all 0.2s',
            boxShadow:activeScore===s.id?`0 0 14px ${s.color}25`:'none',
          }}>
            <div style={{fontSize:14,marginBottom:2,textAlign:'center'}}>{s.icon}</div>
            <div style={{fontSize:9,fontWeight:700,color:activeScore===s.id?s.color:T.muted,textAlign:'center',whiteSpace:'nowrap'}}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Score info */}
      <div style={{background:`${score.color}08`,borderRadius:16,padding:'12px 14px',marginBottom:14,border:`1px solid ${score.color}20`}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--text-primary,#0A1628)',marginBottom:2}}>{score.label}</div>
        <div style={{fontSize:11,color:score.color,fontWeight:600}}>{score.use}</div>
      </div>

      {/* Live score display */}
      <div style={{
        background:result.color+'18',border:`2px solid ${result.color}40`,
        borderRadius:20,padding:'16px',marginBottom:14,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        boxShadow:`0 0 20px ${result.color}20`,
      }}>
        <div>
          <div style={{fontSize:10,color:result.color,fontWeight:700,letterSpacing:1,marginBottom:4}}>CURRENT SCORE</div>
          <div style={{fontSize:36,fontWeight:900,color:result.color,lineHeight:1}}>{typeof total==='number'?total.toFixed(total%1?1:0):total}</div>
          <div style={{fontSize:12,fontWeight:800,color:result.color,marginTop:4}}>{result.risk} RISK</div>
        </div>
        <div style={{flex:1,marginLeft:16}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>ACTION</div>
          <div style={{fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.5}}>{result.action}</div>
          <div style={{fontSize:10,color:result.color,marginTop:6,fontWeight:700}}>{result.annual}</div>
        </div>
      </div>

      {/* Criteria checklist */}
      <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>CRITERIA</div>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
        {score.fields.map(f=>(
          <div key={f.id} onClick={()=>toggle(f.id)} style={{
            display:'flex',alignItems:'center',gap:12,
            background:checked[f.id]?`${score.color}12`:T.glass,
            backdropFilter:'blur(20px)',
            border:`1.5px solid ${checked[f.id]?score.color:'rgba(10,22,40,0.40)'}`,
            borderRadius:14,padding:'12px 14px',cursor:'pointer',
            transition:'all 0.2s',
            boxShadow:checked[f.id]?`0 0 12px ${score.color}20`:'none',
          }}>
            <div style={{
              width:24,height:24,borderRadius:8,flexShrink:0,
              background:checked[f.id]?score.color:'rgba(10,22,40,0.38)',
              border:`1.5px solid ${checked[f.id]?score.color:'rgba(10,22,40,0.45)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:13,color:'var(--text-primary, white)',fontWeight:900,transition:'all 0.2s',
            }}>
              {checked[f.id]?'✓':''}
            </div>
            <div style={{flex:1,fontSize:12,color:checked[f.id]?T.text:T.sub,fontWeight:checked[f.id]?700:500,lineHeight:1.4}}>{f.label}</div>
            <div style={{
              background:checked[f.id]?score.color:'rgba(10,22,40,0.38)',
              borderRadius:8,padding:'2px 8px',
              fontSize:12,fontWeight:900,
              color:checked[f.id]?'white':T.muted,
              flexShrink:0,transition:'all 0.2s',
            }}>+{f.points}</div>
          </div>
        ))}
      </div>

      <button onClick={resetScore} style={{
        width:'100%',padding:'13px',borderRadius:16,
        border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',
        color:'var(--text-secondary,rgba(10,22,40,0.55))',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,
      }}>
        🔄 Reset Score
      </button>
    </div>
  )
}

// ── MAIN ──
export default function ClinicalToolkit({ onXP }: { onXP?: (n:number)=>void }) {
  const [tab, setTab] = useState<'drugs'|'scores'>('scores')

  return (
    <div style={{fontFamily:F}}>
      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>CLINICAL TOOLKIT</div>
        <div style={{fontSize:22,fontWeight:900,color:'var(--text-primary,#0A1628)',letterSpacing:-0.5}}>
          Clinical <span style={{color:T.teal}}>Toolkit</span>
        </div>
        <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))',marginTop:4}}>Drug dosing · Renal adjustment · Clinical scores</div>
      </div>

      {/* Tab */}
      <div style={{display:'flex',gap:4,background:T.glass2,borderRadius:16,padding:4,marginBottom:20,border:`1px solid ${T.border}`}}>
        <button onClick={()=>setTab('scores')} style={{
          flex:1,padding:'11px',border:'none',cursor:'pointer',borderRadius:12,fontFamily:F,fontWeight:700,fontSize:13,
          background:tab==='scores'?T.glass:'transparent',
          color:tab==='scores'?T.teal:T.muted,
          border:tab==='scores'?`1px solid ${T.teal}25`:'1px solid transparent',transition:'all 0.2s',
        }}>📊 Clinical Scores</button>
        <button onClick={()=>setTab('drugs')} style={{
          flex:1,padding:'11px',border:'none',cursor:'pointer',borderRadius:12,fontFamily:F,fontWeight:700,fontSize:13,
          background:tab==='drugs'?T.glass:'transparent',
          color:tab==='drugs'?T.orange:T.muted,
          border:tab==='drugs'?`1px solid ${T.orange}25`:'1px solid transparent',transition:'all 0.2s',
        }}>💊 Drug Calculator</button>
      </div>

      {tab==='scores' && <ClinicalScores/>}
      {tab==='drugs'  && <DrugCalculator/>}
    </div>
  )
}
