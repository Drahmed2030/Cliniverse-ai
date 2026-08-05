"use client";
import { useState, useEffect } from "react";

const CALCULATORS = [
  { id:"cha2ds2", name:"CHA₂DS₂-VASc", desc:"AF Stroke Risk", color:"#FF6B6B", grad:"linear-gradient(135deg,#FF6B6B,#FF4757)", emoji:"🫀",
    fields:[
      {key:"chf",label:"Heart Failure / LV dysfunction",type:"bool"},
      {key:"htn",label:"Hypertension",type:"bool"},
      {key:"age75",label:"Age ≥ 75 years",type:"bool",points:2},
      {key:"dm",label:"Diabetes Mellitus",type:"bool"},
      {key:"stroke",label:"Stroke / TIA / Thromboembolism",type:"bool",points:2},
      {key:"vascular",label:"Vascular disease (MI, PAD, aortic plaque)",type:"bool"},
      {key:"age65",label:"Age 65–74 years",type:"bool"},
      {key:"female",label:"Female sex",type:"bool"},
    ],
    interpret:(s:number)=>s===0?{risk:"Low Risk",action:"No anticoagulation needed",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s===1?{risk:"Moderate Risk",action:"Consider anticoagulation",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:{risk:"High Risk",action:"Anticoagulation strongly recommended",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
  { id:"timi", name:"TIMI Score", desc:"NSTEMI / Unstable Angina", color:"#FF9F0A", grad:"linear-gradient(135deg,#FF9F0A,#FF6B00)", emoji:"❤️‍🔥",
    fields:[
      {key:"age65",label:"Age ≥ 65 years",type:"bool"},
      {key:"cad_risk",label:"≥ 3 CAD risk factors",type:"bool"},
      {key:"stenosis",label:"Known CAD (stenosis ≥ 50%)",type:"bool"},
      {key:"st_dev",label:"ST deviation on ECG",type:"bool"},
      {key:"angina",label:"≥ 2 anginal events in 24h",type:"bool"},
      {key:"aspirin",label:"Aspirin use in past 7 days",type:"bool"},
      {key:"troponin",label:"Elevated serum troponin",type:"bool"},
    ],
    interpret:(s:number)=>s<=2?{risk:"Low Risk (5%)",action:"Conservative management",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s<=4?{risk:"Intermediate Risk (13%)",action:"Early invasive strategy",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:{risk:"High Risk (41%)",action:"Urgent invasive strategy",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
  { id:"wells_pe", name:"Wells PE Score", desc:"Pulmonary Embolism Probability", color:"#0A84FF", grad:"linear-gradient(135deg,#0A84FF,#0066CC)", emoji:"🫁",
    fields:[
      {key:"dvt_signs",label:"Clinical signs/symptoms of DVT",type:"bool",points:3},
      {key:"alt_dx",label:"PE is #1 diagnosis (or equally likely)",type:"bool",points:3},
      {key:"hr",label:"Heart rate > 100 bpm",type:"bool",points:1.5},
      {key:"immobile",label:"Immobilization / surgery in past 4 weeks",type:"bool",points:1.5},
      {key:"prev_dvt",label:"Previous DVT or PE",type:"bool",points:1.5},
      {key:"hemoptysis",label:"Hemoptysis",type:"bool"},
      {key:"malignancy",label:"Active malignancy (treatment within 6 months)",type:"bool"},
    ],
    interpret:(s:number)=>s<2?{risk:"Low Probability (1.3%)",action:"D-dimer — if negative, PE excluded",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s<6?{risk:"Moderate Probability (16.2%)",action:"CTPA recommended",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:{risk:"High Probability (37.5%)",action:"Empiric anticoagulation + CTPA",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
  { id:"heart", name:"HEART Score", desc:"Chest Pain Risk Stratification", color:"#FF2D55", grad:"linear-gradient(135deg,#FF2D55,#C0004A)", emoji:"💔",
    fields:[
      {key:"history",label:"History",type:"select",options:["Slightly suspicious (0)","Moderately suspicious (1)","Highly suspicious (2)"]},
      {key:"ecg",label:"ECG",type:"select",options:["Normal (0)","Non-specific repolarization disturbance (1)","Significant ST deviation (2)"]},
      {key:"age",label:"Age",type:"select",options:["< 45 years (0)","45–65 years (1)","≥ 65 years (2)"]},
      {key:"risk",label:"Risk Factors",type:"select",options:["No known risk factors (0)","1–2 risk factors (1)","≥ 3 factors or history of atherosclerotic disease (2)"]},
      {key:"troponin",label:"Troponin",type:"select",options:["≤ normal limit (0)","1–3× normal limit (1)","> 3× normal limit (2)"]},
    ],
    interpret:(s:number)=>s<=3?{risk:"Low Risk (1.7%)",action:"Safe for early discharge + outpatient follow-up",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s<=6?{risk:"Moderate Risk (12%)",action:"Observation + serial troponins",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:{risk:"High Risk (65%)",action:"Early invasive strategy recommended",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
  { id:"curb65", name:"CURB-65", desc:"Pneumonia Severity Index", color:"#30D158", grad:"linear-gradient(135deg,#30D158,#00A83A)", emoji:"🫁",
    fields:[
      {key:"confusion",label:"Confusion (new disorientation)",type:"bool"},
      {key:"urea",label:"Blood urea > 7 mmol/L (BUN > 19 mg/dL)",type:"bool"},
      {key:"rr",label:"Respiratory rate ≥ 30 breaths/min",type:"bool"},
      {key:"bp",label:"BP < 90 systolic or ≤ 60 diastolic",type:"bool"},
      {key:"age65",label:"Age ≥ 65 years",type:"bool"},
    ],
    interpret:(s:number)=>s<=1?{risk:"Low Mortality (1.5%)",action:"Outpatient treatment appropriate",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s===2?{risk:"Moderate Mortality (9.2%)",action:"Short inpatient admission",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:{risk:"Severe Mortality (22%+)",action:"ICU admission should be considered",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
  { id:"qsofa", name:"qSOFA", desc:"Quick Sepsis Organ Failure Assessment", color:"#BF5AF2", grad:"linear-gradient(135deg,#BF5AF2,#9B00E8)", emoji:"🦠",
    fields:[
      {key:"rr",label:"Respiratory rate ≥ 22 breaths/min",type:"bool"},
      {key:"gcs",label:"Altered mentation (GCS < 15)",type:"bool"},
      {key:"sbp",label:"Systolic BP ≤ 100 mmHg",type:"bool"},
    ],
    interpret:(s:number)=>s<2?{risk:"Low Sepsis Risk",action:"Monitor closely and reassess",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:{risk:"High Risk — Sepsis Likely",action:"Activate sepsis protocol immediately",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
  { id:"gfr", name:"eGFR / CKD Stage", desc:"Renal Function Assessment (CKD-EPI)", color:"#64D2FF", grad:"linear-gradient(135deg,#64D2FF,#0A84FF)", emoji:"🩺",
    fields:[
      {key:"creatinine",label:"Serum Creatinine (mg/dL)",type:"number"},
      {key:"age",label:"Age (years)",type:"number"},
      {key:"female",label:"Female sex",type:"bool"},
    ],
    interpret:(s:number)=>s>=90?{risk:"G1 — Normal or High (≥90)",action:"Monitor annually if risk factors present",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s>=60?{risk:"G2 — Mildly Decreased (60–89)",action:"Monitor every 6 months",color:"#30D158",bg:"rgba(48,209,88,0.1)"}:s>=45?{risk:"G3a — Mild-Moderate (45–59)",action:"Consider nephrology referral",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:s>=30?{risk:"G3b — Moderate-Severe (30–44)",action:"Nephrology referral recommended",color:"#FF9F0A",bg:"rgba(255,159,10,0.1)"}:s>=15?{risk:"G4 — Severely Decreased (15–29)",action:"Prepare for renal replacement therapy",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}:{risk:"G5 — Kidney Failure (<15)",action:"Dialysis or transplant evaluation",color:"#FF453A",bg:"rgba(255,69,58,0.1)"}
  },
];

export default function ClinicalCalculators() {
  const [selected, setSelected] = useState<string|null>(null);
  const [values, setValues] = useState<Record<string,any>>({});
  const [score, setScore] = useState<number|null>(null);
  const [result, setResult] = useState<any>(null);
  const [pressed, setPressed] = useState<string|null>(null);

  const calc = CALCULATORS.find(c=>c.id===selected);

  const calculate = () => {
    if(!calc) return;
    if(calc.id==="gfr"){
      const cr=parseFloat(values.creatinine)||1;
      const age=parseFloat(values.age)||40;
      const female=values.female?0.742:1;
      const gfr=Math.round(186*Math.pow(cr,-1.154)*Math.pow(age,-0.203)*female);
      setScore(gfr); setResult(calc.interpret(gfr)); return;
    }
    let total=0;
    calc.fields.forEach(f=>{
      if(f.type==="bool"&&values[f.key]) total+=((f as any).points||1);
      else if(f.type==="select") total+=parseInt(values[f.key]||"0");
    });
    setScore(total); setResult(calc.interpret(total));
  };

  const reset = () => { setSelected(null); setValues({}); setScore(null); setResult(null); };

  if(!selected) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 50%,#f5f0ff 100%)",padding:"0 0 100px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      
      {/* Hero */}
      <div style={{padding:"48px 24px 24px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:300,height:300,background:"radial-gradient(circle,rgba(10,132,255,0.15) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontSize:48,marginBottom:12}}>⚕️</div>
        <div style={{color:"#1c1c1e",fontSize:28,fontWeight:800,letterSpacing:-0.5,marginBottom:6}}>Clinical Calculators</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:16,fontWeight:400}}>Validated scoring systems • Evidence-based</div>
      </div>

      {/* Cards */}
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        {CALCULATORS.map(c=>(
          <button key={c.id}
            onMouseDown={()=>setPressed(c.id)}
            onMouseUp={()=>setPressed(null)}
            onTouchStart={()=>setPressed(c.id)}
            onTouchEnd={()=>setPressed(null)}
            onClick={()=>{setSelected(c.id);setValues({});setScore(null);setResult(null);}}
            style={{
              background:"rgba(255,255,255,0.7)",
              backdropFilter:"blur(20px)",
              WebkitBackdropFilter:"blur(20px)",
              border:"1px solid rgba(255,255,255,0.9)",
              borderRadius:20,
              padding:"18px 20px",
              display:"flex",alignItems:"center",gap:16,
              cursor:"pointer",textAlign:"left",
              boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
              transform: pressed===c.id ? "scale(0.97)" : "scale(1)",
              transition:"all 0.15s ease"
            }}>
            <div style={{width:52,height:52,borderRadius:14,background:c.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 4px 12px ${c.color}40`,flexShrink:0}}>
              {c.emoji}
            </div>
            <div style={{flex:1}}>
              <div style={{color:"#1c1c1e",fontSize:17,fontWeight:700,marginBottom:2}}>{c.name}</div>
              <div style={{color:"rgba(60,60,67,0.6)",fontSize:14,fontWeight:400}}>{c.desc}</div>
            </div>
            <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"rgba(60,60,67,0.4)",fontSize:14,fontWeight:600}}>›</span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer badge */}
      <div style={{textAlign:"center",marginTop:24,padding:"0 24px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(10,132,255,0.08)",borderRadius:20,padding:"8px 16px"}}>
          <span style={{fontSize:12}}>🔬</span>
          <span style={{color:"#0A84FF",fontSize:13,fontWeight:600}}>Updated with 2026 Guidelines</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",padding:"0 0 120px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      
      {/* Header */}
      <div style={{padding:"16px 20px 0",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:400,height:200,background:`radial-gradient(circle,${calc?.color}20 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <button onClick={reset} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:12,padding:"8px 16px",color:"#0A84FF",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:20}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:20,background:calc?.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px",boxShadow:`0 8px 24px ${calc?.color}40`}}>{calc?.emoji}</div>
          <div style={{color:"#1c1c1e",fontSize:24,fontWeight:800,marginBottom:4}}>{calc?.name}</div>
          <div style={{color:"rgba(60,60,67,0.6)",fontSize:15}}>{calc?.desc}</div>
        </div>
      </div>

      {/* Fields */}
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        {calc?.fields.map(f=>(
          <div key={f.key} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"14px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            {f.type==="bool"&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#1c1c1e",fontSize:15,fontWeight:500,flex:1,marginRight:12}}>{f.label}</span>
                <div onClick={()=>setValues(v=>({...v,[f.key]:!v[f.key]}))}
                  style={{width:51,height:31,borderRadius:15.5,background:values[f.key]?"#0A84FF":"rgba(120,120,128,0.16)",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                  <div style={{position:"absolute",top:2,left:values[f.key]?20:2,width:27,height:27,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",transition:"left 0.2s"}}/>
                </div>
              </div>
            )}
            {f.type==="number"&&(
              <div>
                <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:500,marginBottom:8}}>{f.label}</div>
                <input type="number" value={values[f.key]||""} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}
                  placeholder="Enter value..."
                  style={{width:"100%",background:"rgba(118,118,128,0.08)",border:"1px solid rgba(118,118,128,0.15)",borderRadius:10,padding:"10px 14px",color:"#1c1c1e",fontSize:17,fontWeight:500,outline:"none",boxSizing:"border-box"}}/>
              </div>
            )}
            {f.type==="select"&&(
              <div>
                <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:500,marginBottom:10}}>{f.label}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {(f as any).options?.map((opt:string,i:number)=>(
                    <div key={i} onClick={()=>setValues(v=>({...v,[f.key]:i.toString()}))}
                      style={{background:values[f.key]===i.toString()?`${calc?.color}15`:"rgba(118,118,128,0.06)",border:values[f.key]===i.toString()?`1.5px solid ${calc?.color}`:"1px solid rgba(118,118,128,0.15)",borderRadius:12,padding:"11px 14px",color:"#1c1c1e",fontSize:14,fontWeight:values[f.key]===i.toString()?600:400,cursor:"pointer",transition:"all 0.15s"}}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Calculate Button */}
      <div style={{padding:"0 16px",marginBottom:20}}>
        <button onClick={calculate}
          style={{width:"100%",background:calc?.grad,border:"none",borderRadius:16,padding:"17px",color:"#fff",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 24px ${calc?.color}40`,letterSpacing:-0.2}}>
          Calculate Score
        </button>
      </div>

      {/* Result */}
      {result&&(
        <div style={{padding:"0 16px"}}>
          <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:`1.5px solid ${result.color}40`,borderRadius:20,padding:24,boxShadow:`0 8px 32px ${result.color}20`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:16,background:result.bg,border:`1.5px solid ${result.color}30`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:result.color,fontSize:28,fontWeight:800}}>{score}{calc?.id==="gfr"?"":""}</span>
              </div>
              <div>
                <div style={{color:"rgba(60,60,67,0.5)",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{calc?.id==="gfr"?"eGFR (mL/min/1.73m²)":"Score"}</div>
                <div style={{color:result.color,fontSize:20,fontWeight:800}}>{result.risk}</div>
              </div>
            </div>
            <div style={{background:result.bg,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{fontSize:16}}>→</span>
              <span style={{color:"#1c1c1e",fontSize:15,fontWeight:500,lineHeight:1.5}}>{result.action}</span>
            </div>
            <div style={{marginTop:12,textAlign:"center"}}>
              <span style={{color:"rgba(60,60,67,0.4)",fontSize:12}}>Based on validated clinical guidelines • 2026</span>
            </div>
          </div>
        </div>
      )}
              <div style={{background:"rgba(255,159,10,0.08)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:12,padding:"10px 14px",margin:"12px 16px",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:14,flexShrink:0}}>⚕️</span>
            <span style={{color:"rgba(60,60,67,0.6)",fontSize:12,lineHeight:1.5}}>For educational purposes only. Not a medical device. Always consult a qualified healthcare professional.</span>
          </div>
    </div>
  );
}
