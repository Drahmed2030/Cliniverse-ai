"use client";
import { useState } from "react";

const MED_CATEGORIES = [
  { id:"cardiac", name:"Cardiac Medications", emoji:"❤️", color:"#FF453A",
    drugs:[
      {name:"Aspirin",class:"Antiplatelet",dose:"75–325 mg/day",route:"PO",indication:"ACS, Secondary prevention",contraindication:"Active bleeding, peptic ulcer",sideEffects:"GI bleeding, tinnitus",monitoring:"Renal function"},
      {name:"Atorvastatin",class:"Statin",dose:"10–80 mg/day",route:"PO",indication:"Hyperlipidemia, CV prevention",contraindication:"Active liver disease, pregnancy",sideEffects:"Myopathy, elevated LFTs",monitoring:"CK, LFTs"},
      {name:"Metoprolol",class:"β-blocker",dose:"25–200 mg/day",route:"PO/IV",indication:"HTN, HF, ACS, AF rate control",contraindication:"Severe bradycardia, cardiogenic shock",sideEffects:"Fatigue, bradycardia, bronchospasm",monitoring:"HR, BP"},
      {name:"Furosemide",class:"Loop diuretic",dose:"20–600 mg/day",route:"PO/IV",indication:"HF, edema, HTN",contraindication:"Anuria, sulfa allergy",sideEffects:"Hypokalemia, hyponatremia, ototoxicity",monitoring:"K+, Na+, Cr, BP"},
      {name:"Lisinopril",class:"ACE inhibitor",dose:"2.5–40 mg/day",route:"PO",indication:"HTN, HF, post-MI, DKD",contraindication:"Angioedema history, pregnancy, bilateral RAS",sideEffects:"Dry cough, angioedema, hyperkalemia",monitoring:"K+, Cr, BP"},
      {name:"Amlodipine",class:"CCB (DHP)",dose:"2.5–10 mg/day",route:"PO",indication:"HTN, angina",contraindication:"Cardiogenic shock",sideEffects:"Peripheral edema, flushing",monitoring:"BP, HR"},
      {name:"Warfarin",class:"VKA anticoagulant",dose:"Individualized",route:"PO",indication:"AF, DVT/PE, mechanical valves",contraindication:"Active bleeding, pregnancy",sideEffects:"Bleeding, skin necrosis",monitoring:"INR (target 2–3)"},
      {name:"Apixaban",class:"DOAC (Factor Xa)",dose:"5 mg BID (2.5 BID if criteria)",route:"PO",indication:"AF, DVT/PE treatment",contraindication:"Active bleeding, CrCl <15",sideEffects:"Bleeding",monitoring:"Renal function annually"},
    ]
  },
  { id:"antibiotics", name:"Antibiotics", emoji:"🦠", color:"#30D158",
    drugs:[
      {name:"Amoxicillin-Clavulanate",class:"β-lactam + inhibitor",dose:"875/125 mg q8-12h",route:"PO",indication:"RTI, UTI, skin infections",contraindication:"Penicillin allergy",sideEffects:"Diarrhea, rash, hepatotoxicity",monitoring:"LFTs if prolonged"},
      {name:"Piperacillin-Tazobactam",class:"Extended β-lactam",dose:"4.5g q6-8h",route:"IV",indication:"Severe infections, febrile neutropenia",contraindication:"Penicillin allergy",sideEffects:"Hypokalemia, neurotoxicity (high doses)",monitoring:"Renal function, K+"},
      {name:"Vancomycin",class:"Glycopeptide",dose:"15–20 mg/kg q8-12h",route:"IV",indication:"MRSA, severe gram-positive infections",contraindication:"Known allergy",sideEffects:"Nephrotoxicity, Red man syndrome",monitoring:"Trough/AUC levels, Cr"},
      {name:"Meropenem",class:"Carbapenem",dose:"1–2g q8h",route:"IV",indication:"Severe/multi-drug resistant infections",contraindication:"Penicillin allergy (relative)",sideEffects:"Seizures (high dose), diarrhea",monitoring:"Renal function"},
      {name:"Azithromycin",class:"Macrolide",dose:"500 mg day 1, 250 mg days 2–5",route:"PO/IV",indication:"CAP, atypical organisms, STIs",contraindication:"QT prolongation",sideEffects:"QT prolongation, GI upset",monitoring:"ECG if cardiac risk"},
      {name:"Ciprofloxacin",class:"Fluoroquinolone",dose:"500–750 mg q12h (PO); 400 mg q8-12h (IV)",route:"PO/IV",indication:"UTI, GI infections, anthrax",contraindication:"Tendinopathy history, <18y",sideEffects:"Tendon rupture, QT prolongation, C.diff",monitoring:"ECG, renal function"},
    ]
  },
  { id:"dm_meds", name:"Diabetes Medications", emoji:"💉", color:"#64D2FF",
    drugs:[
      {name:"Metformin",class:"Biguanide",dose:"500–2000 mg/day",route:"PO",indication:"T2DM first-line",contraindication:"eGFR <30, iodinated contrast",sideEffects:"GI upset, lactic acidosis (rare)",monitoring:"Cr, B12 levels"},
      {name:"Empagliflozin",class:"SGLT2 inhibitor",dose:"10–25 mg/day",route:"PO",indication:"T2DM, HF, CKD",contraindication:"eGFR <20, DKA risk",sideEffects:"UTI, genital infections, DKA",monitoring:"Renal function, ketones"},
      {name:"Semaglutide",class:"GLP-1 RA",dose:"0.5–2 mg/week (SC); 7–14 mg/day (PO)",route:"SC/PO",indication:"T2DM, obesity, CV prevention",contraindication:"MEN2, medullary thyroid CA",sideEffects:"Nausea, vomiting, pancreatitis",monitoring:"Renal function, HR"},
      {name:"Insulin Glargine",class:"Basal insulin",dose:"0.1–0.3 U/kg/day at bedtime",route:"SC",indication:"T1DM, T2DM",contraindication:"Hypoglycemia",sideEffects:"Hypoglycemia, weight gain",monitoring:"FBG, HbA1c"},
    ]
  },
  { id:"pain", name:"Analgesics", emoji:"💊", color:"#FF9F0A",
    drugs:[
      {name:"Paracetamol",class:"Non-opioid analgesic",dose:"500–1000 mg q4-6h (max 4g/day)",route:"PO/IV",indication:"Mild-moderate pain, fever",contraindication:"Hepatic failure",sideEffects:"Hepatotoxicity (overdose)",monitoring:"LFTs if chronic use"},
      {name:"Ibuprofen",class:"NSAID",dose:"400–800 mg q6-8h",route:"PO",indication:"Pain, inflammation, fever",contraindication:"GI ulcer, renal failure, HF",sideEffects:"GI bleeding, renal impairment, CV events",monitoring:"Renal function, BP"},
      {name:"Morphine",class:"Opioid",dose:"2.5–10 mg q3-4h PRN",route:"PO/IV/SC",indication:"Severe pain, dyspnea in palliative",contraindication:"Respiratory depression",sideEffects:"Constipation, N/V, respiratory depression",monitoring:"Respiratory rate, sedation"},
      {name:"Tramadol",class:"Opioid-like",dose:"50–100 mg q4-6h (max 400 mg/day)",route:"PO",indication:"Moderate-severe pain",contraindication:"Seizure disorder, MAOIs",sideEffects:"Seizures, serotonin syndrome, N/V",monitoring:"CNS effects, seizure risk"},
    ]
  },
];

export default function MedicationsDB() {
  const [selected, setSelected] = useState<string|null>(null);
  const [drug, setDrug] = useState<any|null>(null);
  const [pressed, setPressed] = useState<string|null>(null);
  const [search, setSearch] = useState("");

  const cat = MED_CATEGORIES.find(c=>c.id===selected);

  const allDrugs = MED_CATEGORIES.flatMap(c=>c.drugs.map(d=>({...d,catColor:c.color,catEmoji:c.emoji})));
  const filtered = search.length>1 ? allDrugs.filter(d=>d.name.toLowerCase().includes(search.toLowerCase())||d.indication.toLowerCase().includes(search.toLowerCase())) : [];

  if(drug) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",padding:"0 0 120px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"16px 20px"}}>
        <button onClick={()=>setDrug(null)} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:12,padding:"8px 16px",color:"#0A84FF",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:20}}>← Back</button>
        <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:20,marginBottom:12,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
          <div style={{color:"#1c1c1e",fontSize:22,fontWeight:800,marginBottom:4}}>{drug.name}</div>
          <span style={{background:`${drug.catColor}15`,color:drug.catColor,fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:8}}>{drug.class}</span>
        </div>
        {[
          {label:"💊 Dose",value:drug.dose},
          {label:"🔀 Route",value:drug.route},
          {label:"✅ Indication",value:drug.indication},
          {label:"🚫 Contraindication",value:drug.contraindication},
          {label:"⚠️ Side Effects",value:drug.sideEffects},
          {label:"🔬 Monitoring",value:drug.monitoring},
        ].map((item,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"14px 18px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <div style={{color:"rgba(60,60,67,0.5)",fontSize:12,fontWeight:600,marginBottom:4}}>{item.label}</div>
            <div style={{color:"#1c1c1e",fontSize:15,fontWeight:500,lineHeight:1.5}}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if(!selected) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 50%,#f5f0ff 100%)",padding:"0 0 100px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"48px 24px 16px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>💊</div>
        <div style={{color:"#1c1c1e",fontSize:28,fontWeight:800,marginBottom:6}}>Medications</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:15}}>Drug database · Doses · Monitoring</div>
      </div>
      <div style={{padding:"0 16px",marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drug or indication..."
          style={{width:"100%",background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"12px 16px",color:"#1c1c1e",fontSize:16,outline:"none",boxSizing:"border-box",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}/>
        {filtered.length>0&&(
          <div style={{background:"rgba(255,255,255,0.9)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,marginTop:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
            {filtered.slice(0,5).map((d,i)=>(
              <button key={i} onClick={()=>{setDrug(d);setSearch("");}}
                style={{width:"100%",background:"none",border:"none",borderBottom:i<filtered.length-1?"1px solid rgba(0,0,0,0.06)":"none",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:20}}>{d.catEmoji}</span>
                <div>
                  <div style={{color:"#1c1c1e",fontSize:15,fontWeight:600}}>{d.name}</div>
                  <div style={{color:"rgba(60,60,67,0.5)",fontSize:13}}>{d.class}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        {MED_CATEGORIES.map(c=>(
          <button key={c.id}
            onTouchStart={()=>setPressed(c.id)} onTouchEnd={()=>setPressed(null)}
            onMouseDown={()=>setPressed(c.id)} onMouseUp={()=>setPressed(null)}
            onClick={()=>setSelected(c.id)}
            style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",textAlign:"left",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",transform:pressed===c.id?"scale(0.97)":"scale(1)",transition:"all 0.15s"}}>
            <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${c.color},${c.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,boxShadow:`0 4px 12px ${c.color}40`}}>{c.emoji}</div>
            <div style={{flex:1}}>
              <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:2}}>{c.name}</div>
              <div style={{color:"rgba(60,60,67,0.5)",fontSize:13}}>{c.drugs.length} medications</div>
            </div>
            <span style={{color:"rgba(60,60,67,0.3)",fontSize:20}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",padding:"0 0 120px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"16px 20px 0"}}>
        <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:12,padding:"8px 16px",color:"#0A84FF",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:20}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>{cat?.emoji}</div>
          <div style={{color:"#1c1c1e",fontSize:22,fontWeight:800}}>{cat?.name}</div>
        </div>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {cat?.drugs.map((d,i)=>(
          <button key={i} onClick={()=>setDrug({...d,catColor:cat.color,catEmoji:cat.emoji})}
            style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",display:"flex",flexDirection:"column",alignItems:"flex-start",cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center",marginBottom:4}}>
              <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700}}>{d.name}</div>
              <span style={{background:`${cat.color}15`,color:cat.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{d.class}</span>
            </div>
            <div style={{color:"rgba(60,60,67,0.55)",fontSize:13}}>{d.dose} • {d.route}</div>
            <div style={{color:"rgba(60,60,67,0.45)",fontSize:12,marginTop:2}}>{d.indication}</div>
          </button>
        ))}
      </div>
              <div style={{background:"rgba(255,159,10,0.08)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:12,padding:"10px 14px",margin:"12px 16px",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:14,flexShrink:0}}>⚕️</span>
            <span style={{color:"rgba(60,60,67,0.6)",fontSize:12,lineHeight:1.5}}>For educational purposes only. Not a medical device. Always consult a qualified healthcare professional.</span>
          </div>
    </div>
  );
}
