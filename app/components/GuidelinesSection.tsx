"use client";
import { useState, useEffect } from "react";

const GUIDELINES = [
  { id:"acs", title:"ACS Management 2026", org:"ESC", color:"#FF453A", emoji:"❤️‍🔥", year:"2026",
    sections:[
      { title:"STEMI — First 24 Hours", points:[
        "Dual antiplatelet: Aspirin 300mg + Ticagrelor 180mg loading",
        "Primary PCI within 90 min (door-to-balloon)",
        "Anticoagulation: UFH or Bivalirudin during PCI",
        "β-blocker within 24h if no contraindication",
        "High-intensity statin immediately (Atorvastatin 80mg)",
      ]},
      { title:"NSTEMI/UA — Risk Stratification", points:[
        "HEART Score or TIMI for risk stratification",
        "High risk: invasive strategy within 24h",
        "Very high risk: immediate invasive (<2h)",
        "Anticoagulation: Fondaparinux preferred (unless PCI planned)",
        "GPIIb/IIIa inhibitor if high-risk PCI",
      ]},
      { title:"Post-ACS Long-term", points:[
        "DAPT: 12 months (Aspirin + P2Y12 inhibitor)",
        "ACE inhibitor/ARB: all patients with EF <40%",
        "β-blocker: minimum 12 months",
        "LDL target: <1.4 mmol/L (<55 mg/dL)",
        "Cardiac rehabilitation: strongly recommended",
      ]},
    ]
  },
  { id:"hf", title:"Heart Failure 2026", org:"ESC", color:"#0A84FF", emoji:"💙", year:"2026",
    sections:[
      { title:"HFrEF — Foundational Therapy", points:[
        "ACE-I/ARB/ARNI + β-blocker + MRA + SGLT2i (Fantastic Four)",
        "ARNI (Sacubitril/Valsartan): preferred over ACE-I if tolerated",
        "SGLT2 inhibitor (Dapagliflozin/Empagliflozin): all HFrEF",
        "Ivabradine if HR >70 on max β-blocker",
        "ICD if EF <35% after 3 months optimal therapy",
      ]},
      { title:"Acute Decompensated HF", points:[
        "IV diuretics: Furosemide 40-80mg IV bolus",
        "Target: UO >0.5 mL/kg/h + symptom relief",
        "Vasodilators if SBP >90 (Nitrates/Nitroprusside)",
        "Inotropes only if hypoperfusion (Dobutamine/Milrinone)",
        "Ultrafiltration if diuretic resistance",
      ]},
    ]
  },
  { id:"af", title:"Atrial Fibrillation 2026", org:"ESC/AHA", color:"#FF9F0A", emoji:"⚡", year:"2026",
    sections:[
      { title:"Rate vs Rhythm Control", points:[
        "Rate control target: HR <110 bpm at rest",
        "Rate control agents: β-blocker, CCB (non-DHP), Digoxin",
        "Rhythm control: preferred in symptomatic, young patients",
        "Early rhythm control: reduces CV outcomes (EAST-AFNET)",
        "Cardioversion: electrical or pharmacological (Flecainide/Amiodarone)",
      ]},
      { title:"Stroke Prevention", points:[
        "CHA₂DS₂-VASc ≥2 men / ≥3 women: anticoagulation",
        "DOAC preferred over VKA (Apixaban, Rivaroxaban, Dabigatran)",
        "Warfarin: if mechanical valve or significant mitral stenosis",
        "Left atrial appendage occlusion: if anticoagulation contraindicated",
        "Aspirin NOT recommended for AF stroke prevention",
      ]},
    ]
  },
  { id:"sepsis", title:"Sepsis & Septic Shock 2026", org:"Surviving Sepsis", color:"#BF5AF2", emoji:"🦠", year:"2026",
    sections:[
      { title:"Hour-1 Bundle", points:[
        "Lactate measurement (repeat if >2 mmol/L)",
        "Blood cultures before antibiotics (2 sets)",
        "Broad-spectrum antibiotics within 1 hour",
        "IV crystalloid 30 mL/kg for hypotension/lactate ≥4",
        "Norepinephrine if MAP <65 despite fluids",
      ]},
      { title:"Antibiotic Strategy", points:[
        "Empiric: Piperacillin-Tazobactam ± Vancomycin",
        "De-escalate based on cultures within 48-72h",
        "Duration: 7 days for most infections",
        "Procalcitonin-guided de-escalation",
        "Source control: drainage/debridement within 6-12h",
      ]},
    ]
  },
  { id:"stroke", title:"Acute Stroke 2026", org:"AHA/ASA", color:"#30D158", emoji:"🧠", year:"2026",
    sections:[
      { title:"Ischemic Stroke — Acute", points:[
        "IV tPA (Alteplase): within 4.5 hours of onset",
        "Tenecteplase: alternative to Alteplase (0.25 mg/kg)",
        "Mechanical thrombectomy: up to 24h with imaging selection",
        "BP target before thrombolysis: <185/110 mmHg",
        "Aspirin 300mg within 24-48h (after ruling out hemorrhage)",
      ]},
      { title:"Secondary Prevention", points:[
        "Dual antiplatelet (Aspirin + Clopidogrel): 21 days for minor stroke",
        "Anticoagulation for AF-related stroke: after 2 weeks",
        "Statin therapy: all ischemic stroke patients",
        "BP target: <130/80 mmHg long-term",
        "Carotid endarterectomy: if stenosis >70%",
      ]},
    ]
  },
  { id:"dm", title:"Diabetes Management 2026", org:"ADA/EASD", color:"#64D2FF", emoji:"💉", year:"2026",
    sections:[
      { title:"Glycemic Targets", points:[
        "HbA1c target: <7% (individualised)",
        "Fasting glucose: 4.4–7.2 mmol/L (80–130 mg/dL)",
        "Post-meal glucose: <10 mmol/L (<180 mg/dL)",
        "CGM: recommended for all on insulin",
        "Time-in-range (TIR) >70% as additional target",
      ]},
      { title:"Pharmacotherapy", points:[
        "First-line: Metformin (if tolerated and no contraindication)",
        "With CVD/HF/CKD: SGLT2i or GLP-1 RA first-line",
        "SGLT2i: reduces HF hospitalization and CKD progression",
        "GLP-1 RA: weight loss + CV benefit (Semaglutide, Liraglutide)",
        "Insulin: basal first, then add prandial as needed",
      ]},
    ]
  },
];

export default function GuidelinesSection() {
  const [selected, setSelected] = useState<string|null>(null);
  const [openSection, setOpenSection] = useState<number|null>(null);
  const [pressed, setPressed] = useState<string|null>(null);

  const guide = GUIDELINES.find(g=>g.id===selected);

  if(!selected) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 50%,#f5f0ff 100%)",padding:"0 0 100px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"48px 24px 24px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:300,height:200,background:"radial-gradient(circle,rgba(10,132,255,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontSize:48,marginBottom:12}}>📋</div>
        <div style={{color:"#1c1c1e",fontSize:28,fontWeight:800,letterSpacing:-0.5,marginBottom:6}}>Clinical Guidelines</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:15}}>ESC · AHA · ADA · Surviving Sepsis 2026</div>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        {GUIDELINES.map(g=>(
          <button key={g.id}
            onTouchStart={()=>setPressed(g.id)} onTouchEnd={()=>setPressed(null)}
            onMouseDown={()=>setPressed(g.id)} onMouseUp={()=>setPressed(null)}
            onClick={()=>{setSelected(g.id);setOpenSection(null);}}
            style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",textAlign:"left",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",transform:pressed===g.id?"scale(0.97)":"scale(1)",transition:"all 0.15s"}}>
            <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${g.color},${g.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,boxShadow:`0 4px 12px ${g.color}40`}}>{g.emoji}</div>
            <div style={{flex:1}}>
              <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:2}}>{g.title}</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{background:`${g.color}15`,color:g.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{g.org}</span>
                <span style={{color:"rgba(60,60,67,0.5)",fontSize:12}}>{g.year}</span>
              </div>
            </div>
            <span style={{color:"rgba(60,60,67,0.3)",fontSize:20}}>›</span>
          </button>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:20}}>
        <span style={{background:"rgba(10,132,255,0.08)",color:"#0A84FF",fontSize:13,fontWeight:600,padding:"8px 16px",borderRadius:20,display:"inline-block"}}>🔬 Updated 2026 Guidelines</span>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",padding:"0 0 120px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"16px 20px 0",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:400,height:200,background:`radial-gradient(circle,${guide?.color}15 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:12,padding:"8px 16px",color:"#0A84FF",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:20}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${guide?.color},${guide?.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px",boxShadow:`0 8px 24px ${guide?.color}40`}}>{guide?.emoji}</div>
          <div style={{color:"#1c1c1e",fontSize:22,fontWeight:800,marginBottom:4}}>{guide?.title}</div>
          <span style={{background:`${guide?.color}15`,color:guide?.color,fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:8}}>{guide?.org} {guide?.year}</span>
        </div>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {guide?.sections.map((sec,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <button onClick={()=>setOpenSection(openSection===i?null:i)}
              style={{width:"100%",background:"none",border:"none",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <span style={{color:"#1c1c1e",fontSize:16,fontWeight:700,textAlign:"left"}}>{sec.title}</span>
              <span style={{color:guide?.color,fontSize:18,transform:openSection===i?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>›</span>
            </button>
            {openSection===i&&(
              <div style={{padding:"0 20px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {sec.points.map((p,j)=>(
                  <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:guide?.color,flexShrink:0,marginTop:7}}/>
                    <span style={{color:"rgba(60,60,67,0.85)",fontSize:14,lineHeight:1.6}}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
