"use client";
import { useState } from "react";

const LAB_CATEGORIES = [
  { id:"cbc", name:"Complete Blood Count", emoji:"🩸", color:"#FF453A",
    labs:[
      {name:"Hemoglobin",male:"13.5–17.5 g/dL",female:"12.0–15.5 g/dL",critical:"<7 or >20 g/dL",unit:"g/dL"},
      {name:"Hematocrit",male:"41–53%",female:"36–46%",critical:"<21% or >60%",unit:"%"},
      {name:"WBC",male:"4.5–11.0 ×10³/µL",female:"4.5–11.0 ×10³/µL",critical:"<2.0 or >30 ×10³",unit:"×10³/µL"},
      {name:"Platelets",male:"150–400 ×10³/µL",female:"150–400 ×10³/µL",critical:"<50 or >1000 ×10³",unit:"×10³/µL"},
      {name:"MCV",male:"80–100 fL",female:"80–100 fL",critical:"—",unit:"fL"},
      {name:"Neutrophils",male:"1.8–7.7 ×10³/µL",female:"1.8–7.7 ×10³/µL",critical:"<0.5 ×10³",unit:"×10³/µL"},
    ]
  },
  { id:"metabolic", name:"Metabolic Panel", emoji:"⚗️", color:"#0A84FF",
    labs:[
      {name:"Sodium",male:"136–145 mEq/L",female:"136–145 mEq/L",critical:"<120 or >160",unit:"mEq/L"},
      {name:"Potassium",male:"3.5–5.1 mEq/L",female:"3.5–5.1 mEq/L",critical:"<2.5 or >6.5",unit:"mEq/L"},
      {name:"Creatinine",male:"0.74–1.35 mg/dL",female:"0.59–1.04 mg/dL",critical:">10 mg/dL",unit:"mg/dL"},
      {name:"BUN",male:"7–25 mg/dL",female:"7–25 mg/dL",critical:">100 mg/dL",unit:"mg/dL"},
      {name:"Glucose (fasting)",male:"70–100 mg/dL",female:"70–100 mg/dL",critical:"<40 or >500",unit:"mg/dL"},
      {name:"Calcium (total)",male:"8.5–10.5 mg/dL",female:"8.5–10.5 mg/dL",critical:"<6.0 or >13.0",unit:"mg/dL"},
      {name:"Bicarbonate",male:"22–29 mEq/L",female:"22–29 mEq/L",critical:"<10 or >40",unit:"mEq/L"},
      {name:"Chloride",male:"98–107 mEq/L",female:"98–107 mEq/L",critical:"<80 or >115",unit:"mEq/L"},
    ]
  },
  { id:"cardiac", name:"Cardiac Markers", emoji:"❤️", color:"#FF2D55",
    labs:[
      {name:"Troponin I (hs)",male:"<0.04 ng/mL",female:"<0.04 ng/mL",critical:">0.4 ng/mL (AMI likely)",unit:"ng/mL"},
      {name:"BNP",male:"<100 pg/mL",female:"<100 pg/mL",critical:">500 pg/mL (HF likely)",unit:"pg/mL"},
      {name:"NT-proBNP",male:"<125 pg/mL",female:"<125 pg/mL",critical:">900 pg/mL",unit:"pg/mL"},
      {name:"CK-MB",male:"<6.3 ng/mL",female:"<4.4 ng/mL",critical:">25 ng/mL",unit:"ng/mL"},
      {name:"D-Dimer",male:"<0.5 µg/mL FEU",female:"<0.5 µg/mL FEU",critical:">4.0 (high PE risk)",unit:"µg/mL"},
      {name:"CRP (hs)",male:"<1.0 mg/L (low risk)",female:"<1.0 mg/L",critical:">10 mg/L (infection)",unit:"mg/L"},
    ]
  },
  { id:"liver", name:"Liver Function", emoji:"🟤", color:"#FF9F0A",
    labs:[
      {name:"ALT (SGPT)",male:"7–56 U/L",female:"7–45 U/L",critical:">500 U/L",unit:"U/L"},
      {name:"AST (SGOT)",male:"10–40 U/L",female:"10–35 U/L",critical:">500 U/L",unit:"U/L"},
      {name:"Bilirubin (total)",male:"0.1–1.2 mg/dL",female:"0.1–1.2 mg/dL",critical:">15 mg/dL",unit:"mg/dL"},
      {name:"Albumin",male:"3.5–5.0 g/dL",female:"3.5–5.0 g/dL",critical:"<2.0 g/dL",unit:"g/dL"},
      {name:"ALP",male:"44–147 U/L",female:"33–130 U/L",critical:">1000 U/L",unit:"U/L"},
      {name:"PT/INR",male:"0.8–1.1 INR",female:"0.8–1.1 INR",critical:">3.0 INR",unit:"INR"},
    ]
  },
  { id:"thyroid", name:"Thyroid Function", emoji:"🦋", color:"#30D158",
    labs:[
      {name:"TSH",male:"0.4–4.0 mIU/L",female:"0.4–4.0 mIU/L",critical:"<0.1 or >10",unit:"mIU/L"},
      {name:"Free T4",male:"0.8–1.8 ng/dL",female:"0.8–1.8 ng/dL",critical:"—",unit:"ng/dL"},
      {name:"Free T3",male:"2.3–4.2 pg/mL",female:"2.3–4.2 pg/mL",critical:"—",unit:"pg/mL"},
    ]
  },
  { id:"abg", name:"Arterial Blood Gas", emoji:"💨", color:"#64D2FF",
    labs:[
      {name:"pH",male:"7.35–7.45",female:"7.35–7.45",critical:"<7.20 or >7.60",unit:""},
      {name:"PaO₂",male:"80–100 mmHg",female:"80–100 mmHg",critical:"<60 mmHg",unit:"mmHg"},
      {name:"PaCO₂",male:"35–45 mmHg",female:"35–45 mmHg",critical:"<20 or >70",unit:"mmHg"},
      {name:"HCO₃",male:"22–26 mEq/L",female:"22–26 mEq/L",critical:"<10 or >40",unit:"mEq/L"},
      {name:"SaO₂",male:">95%",female:">95%",critical:"<90%",unit:"%"},
      {name:"Lactate",male:"0.5–1.6 mmol/L",female:"0.5–1.6 mmol/L",critical:">4.0 mmol/L",unit:"mmol/L"},
    ]
  },
];

export default function LabReference() {
  const [selected, setSelected] = useState<string|null>(null);
  const [pressed, setPressed] = useState<string|null>(null);
  const [sex, setSex] = useState<"male"|"female">("male");

  const cat = LAB_CATEGORIES.find(c=>c.id===selected);

  if(!selected) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 50%,#f5f0ff 100%)",padding:"0 0 100px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"48px 24px 24px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:300,height:200,background:"radial-gradient(circle,rgba(255,69,58,0.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontSize:48,marginBottom:12}}>🧪</div>
        <div style={{color:"#1c1c1e",fontSize:28,fontWeight:800,marginBottom:6}}>Lab Reference</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:15}}>Normal ranges · Critical values · Units</div>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        {LAB_CATEGORIES.map(c=>(
          <button key={c.id}
            onTouchStart={()=>setPressed(c.id)} onTouchEnd={()=>setPressed(null)}
            onMouseDown={()=>setPressed(c.id)} onMouseUp={()=>setPressed(null)}
            onClick={()=>setSelected(c.id)}
            style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",textAlign:"left",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",transform:pressed===c.id?"scale(0.97)":"scale(1)",transition:"all 0.15s"}}>
            <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${c.color},${c.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,boxShadow:`0 4px 12px ${c.color}40`}}>{c.emoji}</div>
            <div style={{flex:1}}>
              <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:2}}>{c.name}</div>
              <div style={{color:"rgba(60,60,67,0.5)",fontSize:13}}>{c.labs.length} tests</div>
            </div>
            <span style={{color:"rgba(60,60,67,0.3)",fontSize:20}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",padding:"0 0 120px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      <div style={{padding:"16px 20px 0",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:400,height:200,background:`radial-gradient(circle,${cat?.color}12 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:12,padding:"8px 16px",color:"#0A84FF",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:20}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>{cat?.emoji}</div>
          <div style={{color:"#1c1c1e",fontSize:22,fontWeight:800,marginBottom:12}}>{cat?.name}</div>
          <div style={{display:"flex",background:"rgba(118,118,128,0.12)",borderRadius:12,padding:2,gap:2,width:"fit-content",margin:"0 auto"}}>
            {(["male","female"] as const).map(s=>(
              <button key={s} onClick={()=>setSex(s)}
                style={{background:sex===s?"#fff":"transparent",border:"none",borderRadius:10,padding:"6px 20px",color:sex===s?"#1c1c1e":"rgba(60,60,67,0.5)",fontSize:14,fontWeight:sex===s?700:400,cursor:"pointer",transition:"all 0.2s",boxShadow:sex===s?"0 1px 4px rgba(0,0,0,0.1)":"none"}}>
                {s==="male"?"♂ Male":"♀ Female"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {cat?.labs.map((lab,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700}}>{lab.name}</div>
              <div style={{color:"rgba(60,60,67,0.4)",fontSize:12,fontWeight:500}}>{lab.unit}</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <div style={{background:"rgba(48,209,88,0.1)",border:"1px solid rgba(48,209,88,0.2)",borderRadius:10,padding:"6px 12px",flex:1}}>
                <div style={{color:"rgba(60,60,67,0.5)",fontSize:11,fontWeight:600,marginBottom:2}}>NORMAL</div>
                <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600}}>{sex==="male"?lab.male:lab.female}</div>
              </div>
              {lab.critical!=="—"&&(
                <div style={{background:"rgba(255,69,58,0.08)",border:"1px solid rgba(255,69,58,0.2)",borderRadius:10,padding:"6px 12px",flex:1}}>
                  <div style={{color:"rgba(60,60,67,0.5)",fontSize:11,fontWeight:600,marginBottom:2}}>⚠️ CRITICAL</div>
                  <div style={{color:"#FF453A",fontSize:13,fontWeight:600}}>{lab.critical}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
              <div style={{background:"rgba(255,159,10,0.08)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:12,padding:"10px 14px",margin:"12px 16px",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:14,flexShrink:0}}>⚕️</span>
            <span style={{color:"rgba(60,60,67,0.6)",fontSize:12,lineHeight:1.5}}>For educational purposes only. Not a medical device. Always consult a qualified healthcare professional.</span>
          </div>
    </div>
  );
}
