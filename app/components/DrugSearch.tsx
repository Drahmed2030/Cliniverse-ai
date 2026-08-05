"use client";
import { useState } from "react";

export default function DrugSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [tab, setTab] = useState<"info"|"interactions"|"research"|"trials">("info");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setTrials([]);

    try {
      const [drugRes, trialsRes] = await Promise.all([
        fetch(`/api/rxnorm?drug=${encodeURIComponent(query)}`),
        fetch(`/api/clinical-trials?condition=${encodeURIComponent(query)}`)
      ]);
      const drugData = await drugRes.json();
      const trialsData = await trialsRes.json();
      setResult(drugData);
      setTrials(trialsData.trials || []);
    } catch (e) {
      setResult({ error: "Search failed" });
    }
    setLoading(false);
    setTab("info");
  };

  const QUICK = ["Aspirin","Metformin","Atorvastatin","Lisinopril","Warfarin","Amoxicillin","Furosemide","Metoprolol","Insulin","Apixaban"];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 50%,#f5f0ff 100%)",padding:"0 0 120px",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      
      {/* Header */}
      <div style={{padding:"48px 20px 24px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:300,height:200,background:"radial-gradient(circle,rgba(10,132,255,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontSize:48,marginBottom:12}}>🔍</div>
        <div style={{color:"#1c1c1e",fontSize:28,fontWeight:800,marginBottom:4}}>Drug Search</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:15}}>FDA · PubMed · ClinicalTrials.gov</div>
      </div>

      {/* Search */}
      <div style={{padding:"0 16px",marginBottom:16}}>
        <div style={{display:"flex",gap:8}}>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&search()}
            placeholder="Search any drug..."
            style={{flex:1,background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",color:"#1c1c1e",fontSize:16,outline:"none",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}
          />
          <button onClick={search} disabled={!query.trim()||loading}
            style={{background:query.trim()?"linear-gradient(135deg,#0A84FF,#0066CC)":"rgba(0,0,0,0.1)",border:"none",borderRadius:14,padding:"14px 20px",color:"#fff",fontSize:16,fontWeight:700,cursor:query.trim()?"pointer":"default",boxShadow:query.trim()?"0 4px 16px rgba(10,132,255,0.3)":"none"}}>
            {loading?"⏳":"→"}
          </button>
        </div>
      </div>

      {/* Quick Search */}
      {!result && (
        <div style={{padding:"0 16px",marginBottom:24}}>
          <div style={{color:"rgba(60,60,67,0.5)",fontSize:13,fontWeight:600,marginBottom:10}}>QUICK SEARCH</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {QUICK.map(d=>(
              <button key={d} onClick={()=>{setQuery(d);setTimeout(()=>search(),100);}}
                style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:"7px 14px",color:"#0A84FF",fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:32,marginBottom:12}}>⏳</div>
          <div style={{color:"rgba(60,60,67,0.6)",fontSize:16}}>Searching FDA + PubMed...</div>
        </div>
      )}

      {/* Results */}
      {result && !result.error && (
        <div style={{padding:"0 16px"}}>
          
          {/* Drug Header */}
          <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:20,marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <div style={{color:"#1c1c1e",fontSize:24,fontWeight:800,marginBottom:4}}>{result.name}</div>
            {result.brandName&&<div style={{color:"rgba(60,60,67,0.6)",fontSize:15,marginBottom:8}}>Brand: {result.brandName}</div>}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {result.drugClass&&<span style={{background:"rgba(10,132,255,0.1)",color:"#0A84FF",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:8}}>{result.drugClass}</span>}
              <span style={{background:"rgba(48,209,88,0.1)",color:"#30D158",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:8}}>FDA Approved</span>
              {trials.length>0&&<span style={{background:"rgba(191,90,242,0.1)",color:"#BF5AF2",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:8}}>{trials.length} Active Trials</span>}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",background:"rgba(118,118,128,0.12)",borderRadius:12,padding:2,gap:2,marginBottom:16}}>
            {([
              {id:"info",label:"💊 Info"},
              {id:"interactions",label:"⚠️ Interactions"},
              {id:"research",label:"🔬 Research"},
              {id:"trials",label:"🏥 Trials"},
            ] as const).map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{flex:1,background:tab===t.id?"#fff":"transparent",border:"none",borderRadius:10,padding:"8px 4px",color:tab===t.id?"#1c1c1e":"rgba(60,60,67,0.5)",fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",transition:"all 0.2s",boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.1)":"none"}}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab==="info"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {label:"💊 Dosage & Administration",value:result.dosage,color:"#0A84FF"},
                {label:"🚫 Contraindications",value:result.contraindications,color:"#FF453A"},
                {label:"⚠️ Side Effects",value:result.sideEffects,color:"#FF9F0A"},
                {label:"🏭 Manufacturer",value:result.manufacturer,color:"#30D158"},
              ].filter(i=>i.value).map((item,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                  <div style={{color:item.color,fontSize:13,fontWeight:700,marginBottom:6}}>{item.label}</div>
                  <div style={{color:"rgba(60,60,67,0.85)",fontSize:14,lineHeight:1.6}}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab==="interactions"&&(
            <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{color:"#FF9F0A",fontSize:13,fontWeight:700,marginBottom:10}}>⚠️ Drug Interactions</div>
              {result.interactions
                ? <div style={{color:"rgba(60,60,67,0.85)",fontSize:14,lineHeight:1.7}}>{result.interactions}</div>
                : <div style={{color:"rgba(60,60,67,0.4)",fontSize:14}}>No interaction data available</div>
              }
            </div>
          )}

          {tab==="research"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {result.pubmedArticles?.length>0
                ? result.pubmedArticles.map((a:any,i:number)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                    <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:6,lineHeight:1.4}}>{a.title}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:"rgba(60,60,67,0.5)",fontSize:12}}>PubMed {a.year}</span>
                      <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#0A84FF",fontSize:13,fontWeight:600}}>View →</a>
                    </div>
                  </div>
                ))
                : <div style={{background:"rgba(255,255,255,0.75)",borderRadius:16,padding:20,textAlign:"center",color:"rgba(60,60,67,0.4)",fontSize:14}}>No recent articles found</div>
              }
            </div>
          )}

          {tab==="trials"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {trials.length>0
                ? trials.map((t:any,i:number)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                    <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:8,lineHeight:1.4}}>{t.title}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                      <span style={{background:"rgba(48,209,88,0.1)",color:"#30D158",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{t.status}</span>
                      <span style={{background:"rgba(10,132,255,0.1)",color:"#0A84FF",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{t.phase}</span>
                    </div>
                    <div style={{color:"rgba(60,60,67,0.5)",fontSize:12,marginBottom:6}}>{t.sponsor}</div>
                    <a href={t.url} target="_blank" rel="noreferrer" style={{color:"#0A84FF",fontSize:13,fontWeight:600}}>View Trial →</a>
                  </div>
                ))
                : <div style={{background:"rgba(255,255,255,0.75)",borderRadius:16,padding:20,textAlign:"center",color:"rgba(60,60,67,0.4)",fontSize:14}}>No active trials found</div>
              }
            </div>
          )}

          {/* Source */}
          <div style={{textAlign:"center",marginTop:16}}>
            <span style={{color:"rgba(60,60,67,0.4)",fontSize:12}}>Data from FDA · PubMed · ClinicalTrials.gov</span>
          </div>
        </div>
      )}

      {result?.error && (
        <div style={{padding:"0 16px"}}>
          <div style={{background:"rgba(255,69,58,0.08)",border:"1px solid rgba(255,69,58,0.2)",borderRadius:16,padding:20,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🔍</div>
            <div style={{color:"#FF453A",fontSize:16,fontWeight:600}}>Drug not found</div>
            <div style={{color:"rgba(60,60,67,0.6)",fontSize:14,marginTop:4}}>Try the generic name</div>
          </div>
        </div>
      )}
    </div>
  );
}
