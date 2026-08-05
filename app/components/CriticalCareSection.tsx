"use client";
import { useState, useEffect } from "react";

const DIAGNOSES_CRITICAL = [
  { dx:"Anterior STEMI — Post PCI", specialty:"Cardiology", color:"#FF453A",
    ecg:"sr_stemi", vitals:{bp:"108/70",hr:"95",spo2:"96",temp:"37.2",rr:"18"},
    management:["Primary PCI within 90 min","Aspirin 300mg + Ticagrelor 180mg","Anticoagulation: UFH or Bivalirudin","High-intensity statin immediately","Beta-blocker within 24h"],
    mortality:"TIMI risk: High (>5% 14-day mortality)" },
  { dx:"Septic Shock — UTI source", specialty:"ICU", color:"#BF5AF2",
    ecg:"sr_tachy", vitals:{bp:"82/50",hr:"125",spo2:"93",temp:"39.2",rr:"26"},
    management:["Cultures × 2 before antibiotics","Pip-Taz 4.5g TDS IV within 1 hour","30 mL/kg crystalloid bolus","Noradrenaline if MAP <65","Lactate remeasure at 2h"],
    mortality:"qSOFA 3: 24% in-hospital mortality" },
  { dx:"Massive Pulmonary Embolism", specialty:"Respiratory", color:"#0A84FF",
    ecg:"s1q3t3", vitals:{bp:"88/55",hr:"122",spo2:"87",temp:"37.0",rr:"28"},
    management:["Systemic thrombolysis if haemodynamically unstable","Alteplase 100mg over 2h","LMWH bridge after thrombolysis","ICU monitoring","Echocardiogram urgently"],
    mortality:"Wells High + Haemodynamic instability: 30% mortality" },
  { dx:"Hypertensive Emergency", specialty:"Cardiology", color:"#FF9F0A",
    ecg:"lvh", vitals:{bp:"215/125",hr:"98",spo2:"96",temp:"37.1",rr:"18"},
    management:["IV Labetalol 20mg bolus","Target: reduce BP 25% in 1h","Nitrates if pulmonary oedema","CT head urgently","Ophthalmology review"],
    mortality:"End-organ damage present: 1-year mortality 10-15%" },
  { dx:"Status Epilepticus", specialty:"Neurology", color:"#30D158",
    ecg:"sr_normal", vitals:{bp:"145/88",hr:"108",spo2:"94",temp:"38.1",rr:"20"},
    management:["IV Lorazepam 4mg — repeat once if needed","Levetiracetam 60mg/kg IV if persists","Check glucose immediately","CT head + EEG","Neurologist urgent referral"],
    mortality:"Refractory SE: 20% mortality" },
  { dx:"Acute Respiratory Failure — ARDS", specialty:"ICU", color:"#64D2FF",
    ecg:"sr_tachy", vitals:{bp:"102/65",hr:"118",spo2:"82",temp:"38.5",rr:"32"},
    management:["Intubation if refractory hypoxaemia","Low tidal volume 6mL/kg IBW","PEEP 8-15 cmH2O","Prone positioning >12h/day","Avoid fluid overload"],
    mortality:"Severe ARDS: 40-45% ICU mortality" },
];

const ECG_PATHS: Record<string, string> = {
  sr_stemi: "M0,25 L8,25 L12,5 L16,45 L20,25 L28,25 L32,8 L36,42 L40,25 L60,25",
  sr_tachy: "M0,25 L5,25 L7,15 L9,35 L11,25 L20,25 L22,15 L24,35 L26,25 L35,25",
  s1q3t3:  "M0,25 L8,25 L10,18 L14,32 L18,25 L28,25 L30,32 L34,18 L38,25 L60,25",
  lvh:     "M0,25 L8,25 L10,5 L12,5 L14,45 L16,25 L28,25 L30,18 L34,32 L38,25",
  sr_normal:"M0,25 L8,25 L10,18 L12,25 L14,20 L16,35 L18,25 L28,25 L30,18 L34,32 L38,25",
};

function ECGStrip({ type, color }: { type: string, color: string }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setOffset(p => (p + 2) % 60), 50);
    return () => clearInterval(t);
  }, []);
  const path = ECG_PATHS[type] || ECG_PATHS.sr_normal;
  return (
    <svg width="100%" height="50" viewBox="0 0 60 50" preserveAspectRatio="none"
      style={{display:"block",borderRadius:8,background:"rgba(0,0,0,0.04)"}}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        strokeDasharray="60" strokeDashoffset={offset} style={{transition:"stroke-dashoffset 0.05s linear"}}/>
    </svg>
  );
}

function getDailyCase() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  return DIAGNOSES_CRITICAL[seed % DIAGNOSES_CRITICAL.length];
}

export default function CriticalCareSection({ onXP }: { onXP?: (n: number) => void }) {
  const [selected, setSelected] = useState<number|null>(null);
  const [tab, setTab] = useState<"cases"|"daily"|"research">("daily");
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [answered, setAnswered] = useState<Record<number,boolean>>({});

  const dailyCase = getDailyCase();

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch("/api/pubmed?q=critical+care+ICU+management+2026");
      const data = await res.json();
      setArticles(data.results || []);
    } catch(e) {}
    setLoadingArticles(false);
  };

  useEffect(() => { if (tab === "research") fetchArticles(); }, [tab]);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff0f0 0%,#ffe8e8 60%,#fff0f4 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:120}}>
      
      {/* Header */}
      <div style={{padding:"20px 20px 16px",background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <div style={{color:"#FF453A",fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:4}}>CRITICAL CARE</div>
        <div style={{color:"#1c1c1e",fontSize:24,fontWeight:800,marginBottom:4}}>ED · ICU · CCU</div>
        <div style={{color:"rgba(60,60,67,0.5)",fontSize:13}}>Evidence-based · Daily updated · PubMed live</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"rgba(118,118,128,0.12)",margin:"16px 16px 0",borderRadius:12,padding:2,gap:2}}>
        {[{id:"daily",label:"📅 Daily Case"},{id:"cases",label:"🏥 All Cases"},{id:"research",label:"🔬 Research"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)}
            style={{flex:1,background:tab===t.id?"#fff":"transparent",border:"none",borderRadius:10,padding:"8px 4px",color:tab===t.id?"#1c1c1e":"rgba(60,60,67,0.5)",fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.1)":"none"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"16px"}}>

        {/* Daily Case */}
        {tab==="daily" && (
          <div>
            <div style={{background:"rgba(255,69,58,0.06)",border:"1px solid rgba(255,69,58,0.15)",borderRadius:4,padding:"4px 10px",marginBottom:12,display:"inline-block"}}>
              <span style={{color:"#FF453A",fontSize:11,fontWeight:700}}>📅 TODAY'S CRITICAL CASE</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:20,marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{background:`${dailyCase.color}15`,color:dailyCase.color,fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:8}}>{dailyCase.specialty}</span>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#FF453A",boxShadow:"0 0 8px #FF453A"}}/>
              </div>
              <div style={{color:"#1c1c1e",fontSize:18,fontWeight:800,marginBottom:16,lineHeight:1.3}}>{dailyCase.dx}</div>
              
              {/* ECG */}
              <div style={{marginBottom:16}}>
                <div style={{color:"rgba(60,60,67,0.5)",fontSize:11,fontWeight:600,marginBottom:6}}>⚡ ECG RHYTHM</div>
                <ECGStrip type={dailyCase.ecg} color={dailyCase.color} />
              </div>

              {/* Vitals */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:16}}>
                {Object.entries(dailyCase.vitals).map(([k,v])=>(
                  <div key={k} style={{background:"rgba(0,0,0,0.04)",borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
                    <div style={{color:"#1c1c1e",fontSize:14,fontWeight:700}}>{v}</div>
                    <div style={{color:"rgba(60,60,67,0.45)",fontSize:9,fontWeight:600,marginTop:2}}>{k.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Management */}
              <div style={{background:"rgba(255,69,58,0.06)",border:"1px solid rgba(255,69,58,0.15)",borderRadius:14,padding:"14px 16px",marginBottom:12}}>
                <div style={{color:"#FF453A",fontSize:12,fontWeight:700,marginBottom:10}}>🚨 MANAGEMENT PROTOCOL</div>
                {dailyCase.management.map((m,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:i<dailyCase.management.length-1?"1px solid rgba(255,69,58,0.08)":"none"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,69,58,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{color:"#FF453A",fontSize:10,fontWeight:700}}>{i+1}</span>
                    </div>
                    <span style={{color:"rgba(60,60,67,0.85)",fontSize:13,lineHeight:1.5}}>{m}</span>
                  </div>
                ))}
              </div>

              {/* Mortality */}
              <div style={{background:"rgba(0,0,0,0.04)",borderRadius:12,padding:"10px 14px",marginBottom:12}}>
                <div style={{color:"rgba(60,60,67,0.5)",fontSize:11,fontWeight:600,marginBottom:4}}>📊 PROGNOSIS</div>
                <div style={{color:"#1c1c1e",fontSize:13,fontWeight:600}}>{dailyCase.mortality}</div>
              </div>

              <button onClick={()=>{onXP?.(50);}}
                style={{width:"100%",background:"linear-gradient(135deg,#FF453A,#CC0000)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(255,69,58,0.3)"}}>
                ✅ Mark Complete — +50 XP
              </button>
            </div>

            <div style={{background:"rgba(255,159,10,0.08)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:12,padding:"10px 14px",display:"flex",gap:8}}>
              <span>⚕️</span>
              <span style={{color:"rgba(60,60,67,0.6)",fontSize:12}}>For educational purposes only. Not a medical device. Always follow local protocols.</span>
            </div>
          </div>
        )}

        {/* All Cases */}
        {tab==="cases" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {DIAGNOSES_CRITICAL.map((c,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:`1px solid ${c.color}20`,borderRadius:18,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
                <button onClick={()=>setSelected(selected===i?null:i)}
                  style={{width:"100%",background:"none",border:"none",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{color:"#1c1c1e",fontSize:15,fontWeight:700}}>{c.dx}</div>
                    <div style={{color:"rgba(60,60,67,0.5)",fontSize:12,marginTop:2}}>{c.specialty}</div>
                  </div>
                  <span style={{color:c.color,fontSize:18}}>{selected===i?"▲":"›"}</span>
                </button>
                {selected===i && (
                  <div style={{padding:"0 18px 16px"}}>
                    <ECGStrip type={c.ecg} color={c.color} />
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,margin:"10px 0"}}>
                      {Object.entries(c.vitals).map(([k,v])=>(
                        <div key={k} style={{background:"rgba(0,0,0,0.04)",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                          <div style={{color:"#1c1c1e",fontSize:12,fontWeight:700}}>{v}</div>
                          <div style={{color:"rgba(60,60,67,0.4)",fontSize:8,marginTop:1}}>{k.toUpperCase()}</div>
                        </div>
                      ))}
                    </div>
                    {c.management.map((m,j)=>(
                      <div key={j} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:j<c.management.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                        <span style={{color:c.color,fontSize:11,fontWeight:700,flexShrink:0}}>{j+1}.</span>
                        <span style={{color:"rgba(60,60,67,0.8)",fontSize:13}}>{m}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10,background:`${c.color}08`,borderRadius:10,padding:"8px 12px"}}>
                      <span style={{color:"rgba(60,60,67,0.6)",fontSize:12}}>{c.mortality}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Research */}
        {tab==="research" && (
          <div>
            {loadingArticles ? (
              <div style={{textAlign:"center",padding:40,color:"rgba(60,60,67,0.4)"}}>Loading PubMed...</div>
            ) : articles.map((a,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"14px 16px",marginBottom:12}}>
                <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:6,lineHeight:1.4}}>{a.title}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"rgba(60,60,67,0.45)",fontSize:12}}>{a.journal} · {a.year}</span>
                  <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#FF453A",fontSize:12,fontWeight:600}}>PubMed →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
