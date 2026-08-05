"use client";
import { useState, useEffect } from "react";

const CITIES = [
  {city:"Riyadh",flag:"🇸🇦"},{city:"London",flag:"🇬🇧"},
  {city:"Dubai",flag:"🇦🇪"},{city:"Toronto",flag:"🇨🇦"},
  {city:"Cairo",flag:"🇪🇬"},{city:"Paris",flag:"🇫🇷"},
  {city:"New York",flag:"🇺🇸"},{city:"Sydney",flag:"🇦🇺"},
  {city:"Tokyo",flag:"🇯🇵"},{city:"Berlin",flag:"🇩🇪"},
];

const CASES = [
  {level:"CRITICAL",color:"#FF453A",title:"52M — Anterior STEMI",detail:"Door-to-balloon: 67 min · Cath Lab activated",specialty:"Cardiology"},
  {level:"URGENT",color:"#FF9F0A",title:"34F — Status Epilepticus",detail:"IV Lorazepam given · Neuro team called",specialty:"Neurology"},
  {level:"CRITICAL",color:"#FF453A",title:"28F — Septic Shock",detail:"Noradrenaline started · Cultures sent",specialty:"ICU"},
  {level:"URGENT",color:"#FF9F0A",title:"71M — Acute Stroke",detail:"NIHSS 14 · CT clear · tPA candidate",specialty:"Neurology"},
  {level:"CRITICAL",color:"#FF453A",title:"65M — Massive PE",detail:"BP 85/50 · ECHO RV strain · Thrombolysis",specialty:"Respiratory"},
  {level:"URGENT",color:"#FF9F0A",title:"45F — DKA severe",detail:"pH 7.18 · Insulin protocol · ICU referral",specialty:"Endocrinology"},
  {level:"CRITICAL",color:"#FF453A",title:"78M — COPD Exacerbation",detail:"SpO2 82% · BiPAP started · ABG pending",specialty:"Respiratory"},
  {level:"URGENT",color:"#FF9F0A",title:"55F — Hypertensive Emergency",detail:"BP 210/120 · IV Labetalol · Echo ordered",specialty:"Cardiology"},
  {level:"CRITICAL",color:"#FF453A",title:"42M — Anaphylaxis",detail:"Epi 0.5mg IM · Airway secured · Improving",specialty:"Emergency"},
  {level:"URGENT",color:"#FF9F0A",title:"33F — Eclampsia",detail:"MgSO4 loading · OB team called · CTG",specialty:"Obstetrics"},
  {level:"RESOLVED",color:"#30D158",title:"61M — AKI Stage 3",detail:"Dialysis initiated · K+ normalised",specialty:"Nephrology"},
  {level:"RESOLVED",color:"#30D158",title:"49F — Pneumonia severe",detail:"Antibiotics day 3 · Improving · HDU step-down",specialty:"Respiratory"},
];

function getDailyFeed() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  const pseudo = (n: number) => ((seed * 1103515245 + n * 12345) & 0x7fffffff) % 100;
  
  return Array.from({length: 8}, (_, i) => {
    const caseIdx = pseudo(i * 7) % CASES.length;
    const cityIdx = pseudo(i * 13) % CITIES.length;
    const c = CASES[caseIdx];
    const city = CITIES[cityIdx];
    return {
      id: i + 1,
      ...c,
      ...city,
      status: c.level === "RESOLVED" ? "SOLVED" : "LIVE",
      timeAgo: `${pseudo(i * 17) % 55 + 1}m ago`,
    };
  });
}

interface Props { onCase?: (id: string) => void }

export default function ClinicalPulseFeed({ onCase }: Props) {
  const [feed, setFeed] = useState(getDailyFeed());
  const [tick, setTick] = useState(0);
  const [expanded, setExpanded] = useState<number|null>(null);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 4000);
    return () => clearInterval(t);
  }, []);

  // Refresh feed every hour
  useEffect(() => {
    const t = setInterval(() => setFeed(getDailyFeed()), 3600000);
    return () => clearInterval(t);
  }, []);

  const current = feed[tick % feed.length];
  const live = feed.filter(f => f.status === "LIVE").length;

  return (
    <div style={{marginBottom:16}}>
      
      {/* Live header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#FF453A",boxShadow:"0 0 8px #FF453A",animation:"pulse 1s infinite"}}/>
          <span style={{fontSize:11,color:"#FF453A",fontWeight:800,letterSpacing:1.5}}>LIVE CLINICAL FEED</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"rgba(60,60,67,0.5)"}}>{live} live · {feed.length - live} resolved</span>
        </div>
      </div>

      {/* Current rotating case */}
      <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",border:`1.5px solid ${current.color}30`,borderRadius:16,padding:14,marginBottom:12,boxShadow:`0 4px 20px ${current.color}15`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:current.color,boxShadow:`0 0 10px ${current.color}`,flexShrink:0,animation:current.status==="LIVE"?"pulse 1s infinite":"none"}}/>
          <span style={{fontSize:11,color:current.color,fontWeight:800,letterSpacing:1}}>{current.level}</span>
          <span style={{fontSize:11,color:"rgba(60,60,67,0.4)",marginLeft:"auto"}}>{current.flag} {current.city}</span>
        </div>
        <div style={{color:"#1c1c1e",fontSize:15,fontWeight:700,margin:"8px 0 4px",lineHeight:1.3}}>{current.title}</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,lineHeight:1.5}}>{current.detail}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <span style={{background:`${current.color}15`,color:current.color,fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{current.specialty}</span>
          <span style={{color:"rgba(60,60,67,0.4)",fontSize:11}}>{current.timeAgo}</span>
        </div>
      </div>

      {/* Feed list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {feed.slice(0,5).map((f,i)=>(
          <div key={f.id}
            onClick={()=>setExpanded(expanded===f.id?null:f.id)}
            style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"10px 14px",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:f.color,flexShrink:0}}/>
              <span style={{color:"#1c1c1e",fontSize:14,fontWeight:600,flex:1,lineHeight:1.3}}>{f.title}</span>
              <span style={{fontSize:12}}>{f.flag}</span>
            </div>
            {expanded===f.id && (
              <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(0,0,0,0.06)"}}>
                <div style={{color:"rgba(60,60,67,0.7)",fontSize:13,lineHeight:1.5,marginBottom:6}}>{f.detail}</div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{background:`${f.color}15`,color:f.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{f.specialty}</span>
                  <span style={{color:"rgba(60,60,67,0.4)",fontSize:11}}>{f.city} · {f.timeAgo}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        {[
          {label:"Cases Today",value:feed.length,color:"#0A84FF"},
          {label:"Live",value:live,color:"#FF453A"},
          {label:"Resolved",value:feed.length-live,color:"#30D158"},
        ].map((s,i)=>(
          <div key={i} style={{flex:1,background:"rgba(255,255,255,0.7)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
            <div style={{color:s.color,fontSize:20,fontWeight:800}}>{s.value}</div>
            <div style={{color:"rgba(60,60,67,0.5)",fontSize:10,fontWeight:600,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
