"use client";
import { useState, useEffect } from "react";

export default function RehabSection({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pubmed?q=rehabilitation+physiotherapy+2026")
      .then(r=>r.json())
      .then(d=>{ setArticles(d.results||[]); setLoading(false); });
  }, []);

  const PROGRAMS = ["Cardiac Rehabilitation","Stroke Recovery","Post-Surgical Rehab","Pulmonary Rehab","Orthopedic Rehab","Neurological Rehab","Sports Medicine","Pain Management"];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff4f0 0%,#ffe8e0 60%,#fff0f4 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(255,107,53,0.12)",border:"none",borderRadius:10,padding:"8px 14px",color:"#FF6B35",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>🏃 Rehabilitation</div>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:18,marginBottom:16}}>
          <div style={{color:"#FF6B35",fontSize:13,fontWeight:700,marginBottom:12}}>🏃 REHAB PROGRAMS</div>
          {PROGRAMS.map((c,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<PROGRAMS.length-1?"1px solid rgba(0,0,0,0.06)":"none",color:"#1c1c1e",fontSize:15,display:"flex",justifyContent:"space-between"}}>
              {c}<span style={{color:"rgba(60,60,67,0.4)"}}>›</span>
            </div>
          ))}
        </div>
        <div style={{background:"rgba(255,159,10,0.08)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",gap:8}}>
          <span>⚕️</span>
          <span style={{color:"rgba(60,60,67,0.6)",fontSize:12}}>For educational purposes only. Consult a physiotherapist or rehabilitation specialist.</span>
        </div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:700,marginBottom:10}}>LATEST RESEARCH — PubMed 2026</div>
        {loading ? <div style={{textAlign:"center",padding:20,color:"rgba(60,60,67,0.4)"}}>Loading...</div> :
          articles.map((a,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:4,lineHeight:1.4}}>{a.title}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"rgba(60,60,67,0.45)",fontSize:12}}>{a.journal} · {a.year}</span>
                <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#FF6B35",fontSize:12,fontWeight:600}}>Read →</a>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
