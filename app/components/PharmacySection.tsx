"use client";
import { useState } from "react";

const CATEGORIES = [
  { id:"otc", emoji:"💊", label:"OTC Medications", ar:"أدوية بدون وصفة", color:"#30D158" },
  { id:"vitamins", emoji:"🌿", label:"Vitamins & Supplements", ar:"فيتامينات ومكملات", color:"#FF9F0A" },
  { id:"firstaid", emoji:"🩹", label:"First Aid", ar:"إسعافات أولية", color:"#FF453A" },
  { id:"chronic", emoji:"💉", label:"Chronic Disease Meds", ar:"أدوية الأمراض المزمنة", color:"#0A84FF" },
  { id:"cosmetics", emoji:"✨", label:"Cosmetics & Skin", ar:"مستحضرات التجميل", color:"#BF5AF2" },
  { id:"baby", emoji:"👶", label:"Baby & Mother", ar:"الطفل والأم", color:"#FF2D55" },
];

const OTC_DRUGS = [
  { name:"Paracetamol", dose:"500-1000mg q4-6h", max:"4g/day", use:"Pain, fever", warning:"Avoid in liver disease" },
  { name:"Ibuprofen", dose:"400-800mg q6-8h", max:"2400mg/day", use:"Pain, inflammation", warning:"Take with food. Avoid in renal disease" },
  { name:"Antacids (Al/Mg)", dose:"10-20ml after meals", max:"4x/day", use:"Heartburn, indigestion", warning:"Separate from other meds by 2h" },
  { name:"Loperamide", dose:"2mg after loose stool", max:"16mg/day", use:"Acute diarrhoea", warning:"Avoid if bloody diarrhoea or fever" },
  { name:"Cetirizine", dose:"10mg once daily", max:"10mg/day", use:"Allergies, urticaria", warning:"May cause drowsiness" },
  { name:"Omeprazole", dose:"20mg before breakfast", max:"40mg/day", use:"Acid reflux, ulcer", warning:"Long-term use — check B12" },
];

const VITAMINS = [
  { name:"Vitamin D3", dose:"1000-2000 IU/day", use:"Bone health, immunity", food:"Sun exposure, fatty fish" },
  { name:"Vitamin C", dose:"500-1000mg/day", use:"Immunity, antioxidant", food:"Citrus, berries, peppers" },
  { name:"Iron", dose:"325mg once daily", use:"Anaemia prevention", food:"Red meat, legumes, spinach" },
  { name:"Folic Acid", dose:"400mcg/day", use:"Pregnancy, cell growth", food:"Leafy greens, beans" },
  { name:"Omega-3", dose:"1000mg/day", use:"Heart health, brain", food:"Fatty fish, walnuts, flaxseed" },
  { name:"Zinc", dose:"25-50mg/day", use:"Immunity, wound healing", food:"Meat, shellfish, seeds" },
  { name:"Magnesium", dose:"300-400mg/day", use:"Muscle, nerve, sleep", food:"Nuts, seeds, dark chocolate" },
  { name:"B12", dose:"1000mcg/day", use:"Nerve function, energy", food:"Meat, fish, dairy, eggs" },
];

const FIRST_AID = [
  { situation:"Cut/Wound", steps:["Clean with water","Apply antiseptic","Cover with clean dressing","Change dressing daily","Seek help if deep or infected"] },
  { situation:"Burns", steps:["Cool under running water 20min","Do NOT use ice","Cover with clean wrap","Do NOT burst blisters","Seek ER if large or on face"] },
  { situation:"Choking (Adult)", steps:["Encourage coughing","5 back blows between shoulders","5 abdominal thrusts (Heimlich)","Alternate until clear or unconscious","Call 911 if unconscious"] },
  { situation:"Fainting", steps:["Lay person flat","Elevate legs 30cm","Loosen tight clothing","Do not give food/drink until alert","Seek medical attention"] },
  { situation:"Nosebleed", steps:["Sit upright, lean forward","Pinch soft part of nose 10-15min","Breathe through mouth","Do NOT tilt head back","Seek help if >20 minutes"] },
];

export default function PharmacySection({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<string|null>(null);
  const [drug, setDrug] = useState<any|null>(null);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<"en"|"ar">("en");
  const [searchResult, setSearchResult] = useState<any|null>(null);
  const [searching, setSearching] = useState(false);

  const searchFDA = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/rxnorm?drug=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSearchResult(data);
    } catch(e) {}
    setSearching(false);
  };

  if (drug) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0fff8 0%,#e8fff4 60%,#f0f8ff 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={()=>setDrug(null)} style={{background:"rgba(48,209,88,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#30D158",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:20,marginBottom:12}}>
          <div style={{color:"#1c1c1e",fontSize:22,fontWeight:800,marginBottom:4}}>{drug.name}</div>
          <div style={{color:"rgba(60,60,67,0.6)",fontSize:14,marginBottom:16}}>{drug.dose}</div>
          {[
            {label:"✅ Used for",value:drug.use||drug.indication},
            {label:"⚠️ Warning",value:drug.warning||drug.contraindication},
            {label:"🍽️ Natural source",value:drug.food},
          ].filter(i=>i.value).map((item,i)=>(
            <div key={i} style={{background:"rgba(0,0,0,0.03)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
              <div style={{color:"rgba(60,60,67,0.5)",fontSize:12,fontWeight:600,marginBottom:4}}>{item.label}</div>
              <div style={{color:"#1c1c1e",fontSize:14,lineHeight:1.6}}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!category) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0fff8 0%,#e8fff4 60%,#f0f8ff 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(48,209,88,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#30D158",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>💊 Pharmacy</div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {(["en","ar"] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?"rgba(48,209,88,0.15)":"transparent",border:"1px solid "+(lang===l?"#30D158":"rgba(0,0,0,0.1)"),borderRadius:20,padding:"4px 10px",color:lang===l?"#30D158":"rgba(60,60,67,0.5)",fontSize:12,cursor:"pointer"}}>
              {l==="en"?"EN":"ع"}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchFDA()}
            placeholder={lang==="ar"?"ابحث عن دواء...":"Search any drug (FDA)..."}
            style={{flex:1,background:"rgba(255,255,255,0.8)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"12px 16px",color:"#1c1c1e",fontSize:16,outline:"none"}}/>
          <button onClick={searchFDA} style={{background:"linear-gradient(135deg,#30D158,#00A83A)",border:"none",borderRadius:14,padding:"12px 18px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>
            {searching?"⏳":"→"}
          </button>
        </div>
        {searchResult && !searchResult.error && (
          <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:18,marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <div style={{color:"#1c1c1e",fontSize:18,fontWeight:800,marginBottom:4}}>{searchResult.name}</div>
            {searchResult.brandName&&<div style={{color:"rgba(60,60,67,0.6)",fontSize:13,marginBottom:8}}>Brand: {searchResult.brandName}</div>}
            {searchResult.drugClass&&<span style={{background:"rgba(48,209,88,0.1)",color:"#30D158",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:8,display:"inline-block",marginBottom:12}}>{searchResult.drugClass}</span>}
            {searchResult.dosage&&<div style={{background:"rgba(0,0,0,0.03)",borderRadius:12,padding:"10px 14px",marginBottom:8}}><div style={{color:"rgba(60,60,67,0.5)",fontSize:11,fontWeight:600,marginBottom:4}}>💊 DOSAGE</div><div style={{color:"#1c1c1e",fontSize:13,lineHeight:1.5}}>{searchResult.dosage}</div></div>}
            {searchResult.contraindications&&<div style={{background:"rgba(255,69,58,0.06)",borderRadius:12,padding:"10px 14px"}}><div style={{color:"#FF453A",fontSize:11,fontWeight:600,marginBottom:4}}>🚫 CONTRAINDICATIONS</div><div style={{color:"rgba(60,60,67,0.85)",fontSize:13,lineHeight:1.5}}>{searchResult.contraindications}</div></div>}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCategory(c.id)}
              style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:28,marginBottom:8}}>{c.emoji}</div>
              <div style={{color:"#1c1c1e",fontSize:13,fontWeight:700}}>{lang==="ar"?c.ar:c.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0fff8 0%,#e8fff4 60%,#f0f8ff 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={()=>setCategory(null)} style={{background:"rgba(48,209,88,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#30D158",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
      </div>
      <div style={{padding:"16px"}}>
        {category==="otc"&&OTC_DRUGS.map((d,i)=>(
          <button key={i} onClick={()=>setDrug(d)} style={{width:"100%",background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"14px 18px",marginBottom:10,display:"flex",flexDirection:"column",alignItems:"flex-start",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:4}}>{d.name}</div>
            <div style={{color:"rgba(60,60,67,0.55)",fontSize:13}}>{d.dose} · Max: {d.max}</div>
            <div style={{color:"rgba(60,60,67,0.45)",fontSize:12,marginTop:2}}>{d.use}</div>
          </button>
        ))}
        {category==="vitamins"&&VITAMINS.map((v,i)=>(
          <button key={i} onClick={()=>setDrug(v)} style={{width:"100%",background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"14px 18px",marginBottom:10,display:"flex",flexDirection:"column",alignItems:"flex-start",cursor:"pointer"}}>
            <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:4}}>{v.name}</div>
            <div style={{color:"rgba(60,60,67,0.55)",fontSize:13}}>{v.dose}</div>
            <div style={{color:"rgba(60,60,67,0.45)",fontSize:12,marginTop:2}}>{v.use}</div>
          </button>
        ))}
        {category==="firstaid"&&FIRST_AID.map((f,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",marginBottom:12}}>
            <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:12}}>{f.situation}</div>
            {f.steps.map((s,j)=>(
              <div key={j} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:j<f.steps.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(48,209,88,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:"#30D158",fontSize:12,fontWeight:700}}>{j+1}</span>
                </div>
                <span style={{color:"rgba(60,60,67,0.85)",fontSize:14,lineHeight:1.5}}>{s}</span>
              </div>
            ))}
          </div>
        ))}
        {(category==="chronic"||category==="cosmetics"||category==="baby")&&(
          <div style={{textAlign:"center",padding:40}}>
            <div style={{fontSize:48,marginBottom:16}}>🚀</div>
            <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700,marginBottom:8}}>Coming Soon</div>
            <div style={{color:"rgba(60,60,67,0.6)",fontSize:14}}>This section is being expanded</div>
          </div>
        )}
      </div>
    </div>
  );
}
