'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C', pink:'#DB2777',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#10B981,#0D9488)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(16,185,129,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const SPECIALTIES = [
  { id:'cardiology',   label:'Cardiology',    icon:'🫀', color:L.red,    img:'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80', cases:42 },
  { id:'neurology',    label:'Neurology',     icon:'🧠', color:L.violet, img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', cases:38 },
  { id:'infectious',   label:'Infectious',    icon:'🦠', color:L.amber,  img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', cases:35 },
  { id:'respiratory',  label:'Respiratory',   icon:'🫁', color:L.cobalt, img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80', cases:28 },
  { id:'critical',     label:'Critical Care', icon:'🏥', color:L.red,    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80', cases:45 },
  { id:'gastro',       label:'Gastro',        icon:'🔬', color:L.teal,   img:'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80', cases:22 },
  { id:'endocrine',    label:'Endocrine',     icon:'⚗️', color:L.orange, img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', cases:18 },
  { id:'renal',        label:'Nephrology',    icon:'💧', color:L.cobalt, img:'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80', cases:20 },
]

const CASES: Record<string, any[]> = {
  cardiology: [
    {
      id:'c1', title:'72M — Anterior STEMI',
      tags:['STEMI','Cardiology','Critical'],
      difficulty:'Advanced', mortality:'8-10%',
      img:'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80',
      history:'72-year-old male, smoker, hypertensive, diabetic. 2-hour history of severe crushing central chest pain radiating to left arm and jaw. Diaphoresis, nausea, vomiting.',
      examination:'BP 90/60, HR 110 irregular, RR 22, SpO2 94% on air. Pale, diaphoretic. JVP elevated. S3 gallop. Bilateral basal crepitations.',
      ecg:'Sinus tachycardia HR 110. ST elevation V1-V4 (3-5mm). Reciprocal ST depression II, III, aVF. New LBBB pattern.',
      labs:{
        troponin:'Troponin I: 8.4 ng/mL (↑↑↑ Normal <0.04)',
        ck:'CK-MB: 180 U/L (↑↑)',
        bnp:'BNP: 890 pg/mL (↑↑)',
        cbc:'WBC 14.2, Hgb 13.1, Plt 220',
        chemistry:'Na 138, K 4.1, Cr 1.4, Glucose 210',
        coag:'PT 12s, INR 1.1',
      },
      imaging:{
        cxr:'Cardiomegaly. Bilateral pulmonary edema. Kerley B lines. No pneumothorax.',
        echo:'EF 30%. Anterior wall akinesis. Mild MR. No pericardial effusion. RWMA anterior territory.',
        ct:'Not indicated — primary PCI preferred',
      },
      management:[
        'Dual antiplatelet: Aspirin 300mg + Ticagrelor 180mg loading',
        'Anticoagulation: UFH 60 units/kg IV bolus',
        'Primary PCI — door-to-balloon <90 minutes target',
        'O2 if SpO2 <94%. IV access x2. Continuous monitoring',
        'GTN contraindicated — hypotensive',
        'Morphine 2-4mg IV for pain if not hypotensive',
        'Beta-blocker if hemodynamically stable post-PCI',
        'ACEI/ARB within 24h post-PCI',
        'Statin: Atorvastatin 80mg',
        'ICU/CCU admission post-PCI',
      ],
      teaching:[
        'Door-to-balloon time <90 min reduces mortality by 40%',
        'New LBBB with chest pain = treat as STEMI until proven otherwise',
        'Cardiogenic shock complicates 5-8% of STEMI — mortality 40-60%',
        'Dual antiplatelet therapy for 12 months post-DES',
      ],
      outcome:'Post-PCI: LAD stented. Residual EF 35% at 30 days. Started on GDMT. Discharged day 5.'
    },
    {
      id:'c2', title:'58F — Acute Decompensated Heart Failure',
      tags:['Heart Failure','Cardiology','HFrEF'],
      difficulty:'Intermediate', mortality:'3-5%',
      img:'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
      history:'58-year-old female with known HFrEF (EF 25%), NYHA III. 3-day worsening dyspnea, orthopnea (3 pillows), PND. Weight gain 4kg in 1 week. Recent medication non-compliance.',
      examination:'BP 160/95, HR 95 regular, RR 28, SpO2 88% on air → 94% on 4L O2. JVP 16cm. Bibasal crepitations to mid-zones. Pitting edema to knees. S3 gallop.',
      ecg:'Sinus rhythm. LVH voltage. LBBB (unchanged). QTc 460ms.',
      labs:{
        bnp:'BNP: 2,800 pg/mL (↑↑↑)',
        troponin:'Troponin I: 0.08 ng/mL (mildly elevated)',
        cbc:'WBC 9.2, Hgb 10.8 (mild anemia), Plt 180',
        chemistry:'Na 132 (↓), K 3.2 (↓), Cr 1.8 (↑ baseline 1.4), eGFR 38',
        lft:'ALT 85 (↑ — hepatic congestion)',
        tsh:'TSH 2.1 (normal)',
      },
      imaging:{
        cxr:'Cardiomegaly. Bilateral pleural effusions. Pulmonary edema. Vascular redistribution.',
        echo:'EF 22% (↓ from 25%). Dilated LV. Severe global hypokinesis. Moderate functional MR. RVSP 55mmHg.',
      },
      management:[
        'IV Furosemide 80mg bolus then 20mg/hr infusion — target UO 100-200ml/hr',
        'Supplemental O2 — consider NIV (BiPAP) if not improving',
        'Fluid restriction 1.5L/day',
        'Daily weights + strict fluid balance',
        'Hold ACEi temporarily — Cr rising',
        'KCl replacement for hypokalemia',
        'Optimize GDMT once euvolemic: Beta-blocker, ACEi, MRA, SGLT2i',
        'Cardiology + HF team review',
        'Identify precipitant: non-compliance, infection, ACS',
      ],
      teaching:[
        'BNP >1000 indicates significant decompensation',
        'Hyponatremia in HF = poor prognostic marker',
        'SGLT2i (dapagliflozin/empagliflozin) reduce HF hospitalization by 26%',
        'IV diuresis target: 3-5L negative balance over 24-48h',
      ],
      outcome:'Achieved euvolemia by day 3. BNP 680 at discharge. SGLT2i added. Home with HF nurse follow-up.'
    },
    {
      id:'c3', title:'45M — Hypertensive Emergency',
      tags:['Hypertension','Emergency','End-organ damage'],
      difficulty:'Intermediate', mortality:'1-2%',
      img:'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80',
      history:'45-year-old male, known hypertensive, non-compliant with medications. Severe headache, blurred vision, confusion for 6 hours. No chest pain. Denies drug use.',
      examination:'BP 240/140 (both arms equal), HR 98, RR 18, SpO2 98%. GCS 13/15 (E4V4M5). Papilledema bilateral. Grade IV hypertensive retinopathy. No focal neurology.',
      ecg:'LVH with strain pattern. No ischemic changes.',
      labs:{
        chemistry:'Cr 2.8 (↑↑ — AKI), BUN 45, Na 140, K 4.8',
        cbc:'Normal',
        urine:'Proteinuria 3+, RBC casts (↑ — renal involvement)',
        troponin:'Troponin 0.12 (↑ mild)',
        bnp:'BNP 450',
      },
      imaging:{
        ct:'CT Brain: No hemorrhage. Posterior white matter hypodensities — PRES pattern.',
        cxr:'Mild cardiomegaly. No pulmonary edema.',
        echo:'EF 55%. Concentric LVH. Grade II diastolic dysfunction.',
      },
      management:[
        'ICU admission — continuous BP monitoring (arterial line)',
        'Target: reduce MAP by 20-25% in first hour ONLY',
        'IV Labetalol 20mg bolus then infusion OR Nicardipine infusion',
        'Avoid: rapid BP reduction (causes stroke/MI)',
        'Ophthalmology review — papilledema',
        'Nephrology input — AKI',
        'MRI Brain to confirm PRES',
        'Resume oral antihypertensives when stable',
        'Investigate secondary causes: renal artery stenosis, pheo',
      ],
      teaching:[
        'Hypertensive emergency = BP >180/120 + end organ damage',
        'PRES (Posterior Reversible Encephalopathy Syndrome) — reversible if treated',
        'Never use sublingual nifedipine — uncontrolled rapid drop = stroke',
        'Target BP reduction 20-25% in 1 hour, then gradual normalization over 24-48h',
      ],
      outcome:'MAP reduced 25% in 1h with IV nicardipine. Symptoms improved. Oral amlodipine + ramipril at discharge. PRES resolved on follow-up MRI.'
    },
  ],
  neurology: [
    {
      id:'n1', title:'68M — Acute Ischemic Stroke',
      tags:['Stroke','Neurology','tPA'],
      difficulty:'Advanced', mortality:'5-10%',
      img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      history:'68-year-old male, AF on warfarin (INR subtherapeutic 1.4), hypertensive. Sudden onset right-sided weakness + speech difficulty 90 minutes ago. Last seen well 2 hours ago.',
      examination:'BP 185/100, HR 88 irregular, RR 16, SpO2 96%, Temp 36.8. NIHSS 14. Right hemiplegia, global aphasia, right facial droop. No hemorrhage signs.',
      ecg:'Atrial fibrillation. Rate 88. No acute ST changes.',
      labs:{
        cbc:'WBC 9.8, Hgb 13.2, Plt 195',
        coag:'INR 1.4, PT 16s, APTT 32s',
        chemistry:'Glucose 9.2 (↑), Na 139, K 4.0, Cr 1.1',
        troponin:'Troponin 0.03 (normal)',
      },
      imaging:{
        ct:'CT Brain: No hemorrhage. Early ischemic changes left MCA territory. ASPECTS 8.',
        cta:'CTA: Left MCA M1 occlusion. Good collaterals.',
        mri:'DWI: Left MCA infarct. PWI-DWI mismatch — penumbra present.',
      },
      management:[
        'Activate stroke team — time is brain (1.9 million neurons/minute)',
        'IV Alteplase 0.9mg/kg (max 90mg) — within 4.5h of onset',
        'Mechanical thrombectomy — large vessel occlusion, within 24h',
        'BP target pre-tPA: <185/110. Post-tPA: <180/105',
        'NPO — swallowing assessment before oral intake',
        'Aspirin 300mg — 24h after tPA',
        'DVT prophylaxis — compression stockings',
        'Statin: Atorvastatin 80mg',
        'Investigate AF — anticoagulation after hemorrhagic transformation excluded',
        'Stroke unit admission — multidisciplinary rehab',
      ],
      teaching:[
        '"Time is Brain" — 1.9 million neurons lost per minute of stroke',
        'tPA window: 4.5 hours from onset (or last seen well)',
        'Thrombectomy window: up to 24 hours in selected patients (DAWN/DEFUSE-3)',
        'AF causes 20% of ischemic strokes — anticoagulate after acute phase',
      ],
      outcome:'tPA given at 110 min. Thrombectomy — TICI 2b reperfusion. NIHSS 6 at 24h. Anticoagulation started day 5. Discharged to rehab.'
    },
  ],
  infectious: [
    {
      id:'i1', title:'55M — Septic Shock',
      tags:['Sepsis','Critical Care','Shock'],
      difficulty:'Advanced', mortality:'25-40%',
      img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
      history:'55-year-old male, diabetic. 3-day history fever, rigors, dysuria. Progressive confusion since morning. Family called ambulance.',
      examination:'Temp 39.8°C, BP 75/40, HR 128, RR 28, SpO2 91% on air. GCS 12/15. Warm peripheries. Cap refill 4s. Tender suprapubic. No focal neurology.',
      ecg:'Sinus tachycardia 128. No ischemic changes.',
      labs:{
        cbc:'WBC 22.4 (↑↑), Bands 18%, Hgb 11.2, Plt 88 (↓)',
        chemistry:'Na 131 (↓), K 5.1 (↑), Cr 3.2 (↑↑ AKI), Glucose 18.4 (↑)',
        lactate:'Lactate 5.8 mmol/L (↑↑↑)',
        cultures:'Blood cultures x2 — pending. Urine culture — pending.',
        pct:'Procalcitonin 48 ng/mL (↑↑↑)',
        coag:'PT 18s, INR 1.6, APTT 42s, Fibrinogen 1.8 (↓ — early DIC)',
      },
      imaging:{
        cxr:'No pneumonia. Normal.',
        ct:'CT Abdomen/Pelvis: Thickened bladder wall. Perinephric stranding bilateral. No abscess.',
        us:'Renal US: Bilateral hydronephrosis grade 1.',
      },
      management:[
        'HOUR-1 BUNDLE: Begin immediately',
        '1. Blood cultures x2 BEFORE antibiotics',
        '2. Broad-spectrum antibiotics within 1 hour: Pip-Taz 4.5g IV + Gentamicin',
        '3. 30ml/kg crystalloid bolus (Lactated Ringers preferred)',
        '4. Vasopressors if MAP <65 despite fluids: Norepinephrine first-line',
        '5. Repeat lactate if initial >2 mmol/L',
        'ICU admission — arterial line + CVC',
        'Target MAP ≥65, UO ≥0.5ml/kg/hr',
        'Add Vasopressin 0.03 units/min if NE >0.25 mcg/kg/min',
        'Hydrocortisone 200mg/day if refractory shock',
        'Urological review — possible ureteric stenting',
        'Insulin infusion for glucose >10 mmol/L',
      ],
      teaching:[
        'Surviving Sepsis Campaign Hour-1 Bundle reduces mortality by 40%',
        'Lactate >4 = septic shock even if BP normal',
        'Norepinephrine first-line vasopressor — preserves cardiac output',
        'Source control within 6-12 hours — drainage, antibiotics, surgery',
        'Procalcitonin guides antibiotic de-escalation',
      ],
      outcome:'MAP achieved 68 on NE 0.15mcg/kg/min. Cultures: E.coli ESBL. Narrowed to Meropenem. AKI improved. ICU day 4. Step-down day 7.'
    },
  ],
  respiratory: [
    {
      id:'r1', title:'42F — Massive Pulmonary Embolism',
      tags:['PE','Emergency','Thrombolysis'],
      difficulty:'Advanced', mortality:'15-30%',
      img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      history:'42-year-old female, OCP user, recent 12h flight from Australia. Sudden onset dyspnea, pleuritic chest pain, pre-syncope. No leg swelling noted.',
      examination:'BP 80/50, HR 128, RR 32, SpO2 82% on air → 91% on 15L NRB. Distressed. JVP elevated. Right heart strain signs. Right calf tender.',
      ecg:'Sinus tachycardia. S1Q3T3 pattern. New RBBB. T-wave inversions V1-V4.',
      labs:{
        ddimer:'D-dimer: >10,000 ng/mL (↑↑↑)',
        troponin:'Troponin I: 1.8 ng/mL (↑↑ — RV strain)',
        bnp:'BNP: 1,200 pg/mL (↑↑)',
        abg:'pH 7.48, PaO2 52, PaCO2 28, HCO3 21 — Type 1 RF',
        cbc:'WBC 11.2, Hgb 12.8, Plt 210',
      },
      imaging:{
        ctpa:'CTPA: Bilateral saddle embolus. Main pulmonary artery + bilateral main branches. RV:LV ratio 1.4 (↑ — massive PE).',
        echo:'RV dilatation. McConnell sign. TAPSE 12mm (↓). TR gradient 50mmHg. D-sign on parasternal short axis.',
        us:'Doppler: DVT right popliteal + femoral veins.',
      },
      management:[
        'MASSIVE PE — Hemodynamically UNSTABLE',
        'Immediate: O2 + IV access + monitoring + resuscitation team',
        'Systemic thrombolysis: Alteplase 100mg over 2h (if no contraindications)',
        'UFH: 80 units/kg bolus → infusion (continue during/after thrombolysis)',
        'Avoid excessive fluid — worsens RV failure',
        'Vasopressors: Norepinephrine if persistent hypotension',
        'Surgical embolectomy or catheter-directed therapy if thrombolysis fails/contraindicated',
        'ICU admission — monitor closely post-thrombolysis for bleeding',
        'Echocardiography to assess RV response',
        'Anticoagulation: LMWH → DOAC for 3-6 months',
        'Investigate thrombophilia: Factor V Leiden, Protein C/S, APS',
      ],
      teaching:[
        'Massive PE = PE + hemodynamic instability (SBP <90 or >40mmHg drop)',
        'S1Q3T3 present in only 20% — sinus tachycardia most common ECG finding',
        'McConnell sign: RV free wall hypokinesis with preserved apex — specific for PE',
        'Thrombolysis reduces mortality in massive PE from 30% to 15%',
        'OCP + long-haul flight = multiplicative VTE risk',
      ],
      outcome:'Thrombolysis with alteplase. BP improved to 105/65 at 1h. ICU 3 days. Discharged on apixaban. Thrombophilia screen: APS positive.'
    },
  ],
  critical: [
    {
      id:'cc1', title:'35M — ARDS Post-COVID Pneumonia',
      tags:['ARDS','Critical Care','Ventilation'],
      difficulty:'Advanced', mortality:'30-40%',
      img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
      history:'35-year-old male, obese (BMI 38), unvaccinated. 10-day history of COVID pneumonia, worsening hypoxia despite high-flow O2. Transferred from ward.',
      examination:'Temp 38.9, BP 105/65, HR 115, RR 32, SpO2 84% on 60% Venturi. GCS 14. Bilateral coarse crepitations. No wheeze.',
      ecg:'Sinus tachycardia. No ischemic changes.',
      labs:{
        abg:'pH 7.35, PaO2 52, PaCO2 38, HCO3 20. P/F ratio: 87 (↓↓ — severe ARDS)',
        cbc:'WBC 18.4 (↑), Lymphopenia 0.4, CRP 280 (↑↑)',
        dimer:'D-dimer 3,400 (↑↑ — COVID coagulopathy)',
        ferritin:'Ferritin 12,000 (↑↑↑)',
        chemistry:'Cr 1.6 (↑), LDH 580 (↑↑)',
      },
      imaging:{
        cxr:'Bilateral diffuse infiltrates — "white-out" appearance. No pneumothorax.',
        ct:'CT Chest: Bilateral GGO + consolidation. >75% lung involvement. No PE.',
      },
      management:[
        'Intubation — RSI with video laryngoscopy',
        'Lung-protective ventilation: TV 6ml/kg IBW, PEEP titration (10-14cmH2O)',
        'Plateau pressure <30cmH2O',
        'Prone positioning 16h/day — reduces mortality 16% (PROSEVA trial)',
        'Neuromuscular blockade first 48h — cisatracurium',
        'Conservative fluid strategy post-resuscitation',
        'Dexamethasone 6mg IV for 10 days',
        'Therapeutic anticoagulation — COVID coagulopathy',
        'High-dose Vitamin C + Zinc (adjunctive)',
        'Daily SBT when P/F >200 and improving',
        'Tracheostomy if prolonged ventilation expected',
      ],
      teaching:[
        'Berlin Definition: ARDS P/F <300 (mild), <200 (moderate), <100 (severe)',
        'Prone positioning most proven intervention in severe ARDS (NNT=11)',
        'Low tidal volume (6ml/kg IBW) reduces mortality from 40% to 31% (ARDSnet)',
        'COVID ARDS often has preserved compliance early — "silent hypoxemia"',
      ],
      outcome:'Prone 16h x5 days. P/F improved to 180. Extubated day 14. Discharged day 28. Rehab follow-up.'
    },
  ],
}

export default function ClinicalLibrary({ onXP }:{ onXP?:(n:number)=>void }) {
  const [specialty, setSpecialty] = useState<string|null>(null)
  const [activeCase, setActiveCase] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'history'|'labs'|'imaging'|'management'|'teaching'>('history')
  const [pressed, setPressed] = useState<string|null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiComment, setAiComment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const getAIComment = async () => {
    if(!activeCase) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`Clinical case: ${activeCase.title}. ${activeCase.history} Key findings: ${JSON.stringify(activeCase.labs)}. Provide a concise clinical pearl (2-3 sentences) about this case that would be most valuable for a trainee physician. Focus on what makes this case distinctive.`,
          specialty: specialty||'Internal Medicine'
        })
      })
      const data = await res.json()
      setAiComment(data.answer||'')
      onXP?.(15)
    } catch {}
    setAiLoading(false)
  }

  // Case detail view
  if(activeCase) return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src={activeCase.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.92))'}}/>
        <button onClick={()=>{setActiveCase(null);setAiComment('');setActiveTab('history')}} style={{
          position:'absolute',top:16,left:16,
          background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:12,padding:'8px 16px',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',
        }}>← Back</button>
        <div style={{position:'absolute',top:16,right:16,display:'flex',gap:6}}>
          <span style={{background:'rgba(239,68,68,0.2)',backdropFilter:'blur(8px)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:99,padding:'4px 10px',fontSize:9,fontWeight:800,color:'#FCA5A5'}}>
            {activeCase.difficulty}
          </span>
          <span style={{background:'rgba(245,183,49,0.2)',backdropFilter:'blur(8px)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:99,padding:'4px 10px',fontSize:9,fontWeight:800,color:L.amber}}>
            Mortality: {activeCase.mortality}
          </span>
        </div>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
            {activeCase.tags.map((t:string)=>(
              <span key={t} style={{fontSize:9,fontWeight:700,letterSpacing:1,color:'white',background:'rgba(255,255,255,0.15)',borderRadius:99,padding:'3px 10px'}}>{t}</span>
            ))}
          </div>
          <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:-0.4}}>{activeCase.title}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{overflowX:'auto',padding:'12px 16px 0',display:'flex',gap:6}}>
        {(['history','labs','imaging','management','teaching'] as const).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{
            flexShrink:0,padding:'8px 14px',borderRadius:99,border:'none',cursor:'pointer',
            background:activeTab===tab?L.gradient:'rgba(0,0,0,0.05)',
            color:activeTab===tab?'white':L.textMuted,
            fontSize:11,fontWeight:700,transition:smooth,
            boxShadow:activeTab===tab?L.shadowGlow:'none',
          }}>
            {tab==='history'?'📋 History':tab==='labs'?'🧪 Labs':tab==='imaging'?'🩻 Imaging':tab==='management'?'💊 Management':'💎 Pearls'}
          </button>
        ))}
      </div>

      <div style={{padding:'14px 16px'}}>
        {activeTab==='history' && (
          <>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:'4px solid #0D9488',borderRadius:20,padding:'16px 18px',marginBottom:12,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>HISTORY</div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.7}}>{activeCase.history}</div>
            </div>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:'4px solid #EF4444',borderRadius:20,padding:'16px 18px',marginBottom:12,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>EXAMINATION</div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.7}}>{activeCase.examination}</div>
            </div>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:'4px solid #7C3AED',borderRadius:20,padding:'16px 18px',boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>ECG</div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.7}}>{activeCase.ecg}</div>
            </div>
          </>
        )}

        {activeTab==='labs' && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {Object.entries(activeCase.labs).map(([key,val]:any)=>(
              <div key={key} style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:16,padding:'12px 16px',boxShadow:L.shadowSm}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:L.textMuted,marginBottom:4,textTransform:'uppercase'}}>{key.replace(/_/g,' ')}</div>
                <div style={{fontSize:13,color:val.includes('↑')||val.includes('↓')?L.red:L.textPrimary,fontWeight:val.includes('↑')||val.includes('↓')?700:500,lineHeight:1.5}}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab==='imaging' && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {Object.entries(activeCase.imaging).map(([key,val]:any)=>(
              <div key={key} style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:'4px solid #1E40AF',borderRadius:16,padding:'14px 16px',boxShadow:L.shadowSm}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:L.cobalt,marginBottom:6,textTransform:'uppercase'}}>{key.toUpperCase()}</div>
                <div style={{fontSize:13,color:L.textSub,lineHeight:1.6}}>{val}</div>
              </div>
            ))}

            {/* NIH Open-i Reference Images */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:16,padding:'14px 16px',boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:L.teal,marginBottom:10}}>📚 NIH OPEN-I REFERENCE IMAGES</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {label:'CXR Reference',url:`https://openi.nlm.nih.gov/imgs/512/1/1-s2.0-S1369526613000927-gr1.png`},
                  {label:'ECG Reference',url:`https://openi.nlm.nih.gov/imgs/512/145/3952225/3952225_rcrj-7-16-g001.png`},
                ].map((img,i)=>(
                  <div key={i} style={{borderRadius:12,overflow:'hidden',border:`1px solid ${L.border}`}}>
                    <img src={img.url} alt={img.label}
                      style={{width:'100%',height:100,objectFit:'cover'}}
                      onError={(e:any)=>e.target.style.display='none'}/>
                    <div style={{padding:'6px 8px',fontSize:10,fontWeight:600,color:L.textMuted,background:L.raised}}>{img.label}</div>
                  </div>
                ))}
              </div>
              <a href={`https://openi.nlm.nih.gov/search?q=${encodeURIComponent(activeCase.title)}`}
                target="_blank" rel="noreferrer"
                style={{display:'block',marginTop:10,padding:'8px',borderRadius:10,background:'rgba(13,148,136,0.08)',border:'1px solid rgba(13,148,136,0.2)',color:L.teal,fontSize:11,fontWeight:700,textAlign:'center',textDecoration:'none'}}>
                Search NIH Open-i Library →
              </a>
            </div>

            {/* YouTube Clinical Videos */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:16,padding:'14px 16px',boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:'#EF4444',marginBottom:10}}>▶️ CLINICAL VIDEOS</div>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeCase.title+' clinical teaching')}`}
                target="_blank" rel="noreferrer"
                style={{display:'flex',alignItems:'center',gap:10,padding:'12px',borderRadius:12,background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',textDecoration:'none'}}>
                <div style={{width:44,height:44,borderRadius:10,background:'#EF4444',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>▶️</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{activeCase.title} — Teaching Videos</div>
                  <div style={{fontSize:11,color:L.textMuted}}>YouTube Medical Education</div>
                </div>
              </a>
            </div>
          </div>
        )}

        {activeTab==='management' && (
          <div>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
              {activeCase.management.map((m:string,i:number)=>(
                <div key={i} style={{
                  display:'flex',gap:10,
                  background:m.includes('HOUR-1')||m.includes('MASSIVE')||m.includes('Immediate')?'rgba(239,68,68,0.06)':L.surface,
                  border:`1px solid ${m.includes('HOUR-1')||m.includes('MASSIVE')||m.includes('Immediate')?'rgba(239,68,68,0.2)':L.border}`,
                  borderRadius:12,padding:'10px 14px',boxShadow:L.shadowSm,
                }}>
                  <div style={{
                    width:22,height:22,borderRadius:'50%',
                    background:m.includes('HOUR-1')||m.includes('MASSIVE')?L.red:L.teal,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:10,fontWeight:900,color:'white',flexShrink:0,marginTop:1,
                  }}>{i+1}</div>
                  <div style={{fontSize:13,color:L.textPrimary,lineHeight:1.5,fontWeight:m.includes('HOUR-1')||m.includes('MASSIVE')?700:500}}>{m}</div>
                </div>
              ))}
            </div>
            <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16,padding:'12px 16px'}}>
              <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>⚠️ Educational only. Always follow local protocols and senior guidance.</div>
            </div>
          </div>
        )}

        {activeTab==='teaching' && (
          <>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
              {activeCase.teaching.map((t:string,i:number)=>(
                <div key={i} style={{background:L.surface,border:'1px solid rgba(124,58,237,0.2)',borderLeft:'4px solid #7C3AED',borderRadius:14,padding:'12px 16px',boxShadow:L.shadowSm}}>
                  <div style={{display:'flex',gap:8}}>
                    <span style={{fontSize:16}}>💎</span>
                    <div style={{fontSize:13,color:L.textSub,lineHeight:1.6}}>{t}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Outcome */}
            <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:16,padding:'14px 16px',marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.sage,marginBottom:6}}>OUTCOME</div>
              <div style={{fontSize:13,color:L.textSub,lineHeight:1.6}}>{activeCase.outcome}</div>
            </div>

            {/* AI Clinical Pearl */}
            {aiComment ? (
              <div style={{background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:16,padding:'14px 16px'}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.violet,marginBottom:8}}>🤖 AI CLINICAL PEARL</div>
                <div style={{fontSize:13,color:L.textSub,lineHeight:1.7}}>{aiComment}</div>
              </div>
            ) : (
              <button onClick={getAIComment} disabled={aiLoading}
                style={{
                  width:'100%',padding:'13px',borderRadius:14,border:'none',cursor:'pointer',
                  background:aiLoading?L.raised:'linear-gradient(135deg,#7C3AED,#4F46E5)',
                  color:aiLoading?L.textMuted:'white',fontSize:13,fontWeight:700,
                  boxShadow:aiLoading?'none':'0 4px 16px rgba(124,58,237,0.3)',
                }}>
                {aiLoading?'🤖 Generating Pearl...':'🤖 Get AI Clinical Pearl — +15 XP'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )

  // Specialty view
  if(specialty) {
    const spec = SPECIALTIES.find(s=>s.id===specialty)
    const cases = CASES[specialty] || []
    const filtered = cases.filter(c=>
      !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t:string)=>t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
      <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
        {/* Hero */}
        <div style={{position:'relative',height:180,overflow:'hidden'}}>
          <img src={spec?.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.92))`}}/>
          <button onClick={()=>setSpecialty(null)} style={{
            position:'absolute',top:16,left:16,
            background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:12,padding:'8px 16px',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',
          }}>← Back</button>
          <div style={{position:'absolute',bottom:16,left:16}}>
            <div style={{fontSize:28,marginBottom:4}}>{spec?.icon}</div>
            <div style={{fontSize:24,fontWeight:900,color:'white'}}>{spec?.label}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{spec?.cases} cases · Evidence-based</div>
          </div>
        </div>

        <div style={{padding:'14px 16px'}}>
          {/* Search */}
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            placeholder="Search cases..."
            style={{width:'100%',padding:'12px 16px',borderRadius:14,boxSizing:'border-box',border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none',marginBottom:14,fontFamily:'inherit'}}/>

          {filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0',color:L.textMuted}}>
              <div style={{fontSize:32,marginBottom:8}}>🔬</div>
              <div style={{fontSize:14}}>More cases coming soon...</div>
              <div style={{fontSize:12,marginTop:4}}>AI generating new cases daily</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {filtered.map(c=>(
                <div key={c.id}
                  onClick={()=>setActiveCase(c)}
                  onMouseDown={()=>setPressed(c.id)} onMouseUp={()=>setPressed(null)}
                  style={{
                    position:'relative',height:130,borderRadius:20,overflow:'hidden',cursor:'pointer',
                    transform:pressed===c.id?'scale(0.97)':'scale(1)',
                    transition:spring,boxShadow:L.shadowSm,
                  }}>
                  <img src={c.img} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.88))'}}/>
                  <div style={{position:'absolute',top:12,right:12,display:'flex',gap:4}}>
                    <span style={{background:'rgba(239,68,68,0.2)',backdropFilter:'blur(8px)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:99,padding:'3px 8px',fontSize:9,fontWeight:800,color:'#FCA5A5'}}>{c.difficulty}</span>
                  </div>
                  <div style={{position:'absolute',bottom:12,left:14,right:14}}>
                    <div style={{display:'flex',gap:4,marginBottom:5,flexWrap:'wrap'}}>
                      {c.tags.slice(0,2).map((t:string)=>(
                        <span key={t} style={{fontSize:8,fontWeight:700,color:'white',background:'rgba(255,255,255,0.15)',borderRadius:99,padding:'2px 8px'}}>{t}</span>
                      ))}
                    </div>
                    <div style={{fontSize:15,fontWeight:800,color:'white'}}>{c.title}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',marginTop:2}}>Mortality: {c.mortality}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main view
  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.15),rgba(15,23,42,0.92))'}}/>
        <div style={{position:'absolute',top:16,left:16,background:'rgba(16,185,129,0.2)',backdropFilter:'blur(12px)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:99,padding:'5px 14px',display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:L.sage,boxShadow:`0 0 8px ${L.sage}`}}/>
          <span style={{fontSize:10,fontWeight:700,color:'white',letterSpacing:1}}>500+ CASES · EVIDENCE-BASED</span>
        </div>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:6}}>GLOBAL CLINICAL LIBRARY · 8 SPECIALTIES</div>
          <div style={{fontSize:28,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>🏥 Clinical Library</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>History · Labs · Imaging · Management · AI Pearls</div>
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
          {[
            {label:'Cases',value:'500+',color:L.teal},
            {label:'Specialties',value:'8',color:L.cobalt},
            {label:'AI Powered',value:'100%',color:L.violet},
          ].map(s=>(
            <div key={s.label} style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:14,padding:'12px 8px',textAlign:'center',boxShadow:L.shadowSm}}>
              <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:10,color:L.textMuted,fontWeight:600,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Specialties grid */}
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>SELECT SPECIALTY</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {SPECIALTIES.map(spec=>(
            <div key={spec.id}
              onClick={()=>setSpecialty(spec.id)}
              onMouseDown={()=>setPressed(spec.id)} onMouseUp={()=>setPressed(null)}
              style={{
                position:'relative',height:110,borderRadius:18,overflow:'hidden',cursor:'pointer',
                transform:pressed===spec.id?'scale(0.97)':'scale(1)',
                transition:spring,boxShadow:`0 4px 12px ${spec.color}20`,
              }}>
              <img src={spec.img} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
              <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${spec.color}AA,rgba(15,23,42,0.75))`}}/>
              <div style={{position:'absolute',inset:0,padding:'12px',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
                <div style={{fontSize:20,marginBottom:3}}>{spec.icon}</div>
                <div style={{fontSize:13,fontWeight:800,color:'white'}}>{spec.label}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.7)'}}>{spec.cases} cases</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:16,padding:'12px 16px',background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16}}>
          <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
            ⚠️ Educational purposes only. Cases are for training. Always apply clinical judgment and follow local protocols.
          </div>
        </div>
      </div>
    </div>
  )
}
