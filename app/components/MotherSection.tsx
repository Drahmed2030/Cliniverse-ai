"use client";
import { useState, useEffect } from "react";

const TOPICS = [
  { id:"newborn", label:"Newborn Care", ar:"رعاية المولود", emoji:"👶", query:"newborn care breastfeeding 2026" },
  { id:"vaccines", label:"Vaccines", ar:"التطعيمات", emoji:"💉", query:"childhood vaccines immunization schedule 2026" },
  { id:"growth", label:"Growth & Development", ar:"النمو والتطور", emoji:"📈", query:"child growth development milestones 2026" },
  { id:"fever", label:"Fever & Illness", ar:"الحمى والمرض", emoji:"🌡️", query:"child fever management pediatrics 2026" },
  { id:"nutrition", label:"Nutrition", ar:"التغذية", emoji:"🥗", query:"child nutrition breastfeeding complementary feeding 2026" },
  { id:"pregnancy", label:"Pregnancy", ar:"الحمل", emoji:"🤰", query:"pregnancy care prenatal 2026" },
];

const VACCINE_SCHEDULE = [
  { age:"Birth", vaccines:["BCG","Hepatitis B (1st)"] },
  { age:"2 months", vaccines:["DTaP (1st)","IPV (1st)","Hib (1st)","PCV (1st)","Rotavirus (1st)"] },
  { age:"4 months", vaccines:["DTaP (2nd)","IPV (2nd)","Hib (2nd)","PCV (2nd)","Rotavirus (2nd)"] },
  { age:"6 months", vaccines:["DTaP (3rd)","Hepatitis B (3rd)","Influenza (yearly)"] },
  { age:"12 months", vaccines:["MMR (1st)","Varicella (1st)","Hepatitis A (1st)"] },
  { age:"18 months", vaccines:["DTaP (4th)","Hepatitis A (2nd)"] },
  { age:"4-6 years", vaccines:["DTaP (5th)","IPV (4th)","MMR (2nd)","Varicella (2nd)"] },
];

export default function MotherSection({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState<string|null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"research"|"vaccines"|"tips">("tips");
  const [lang, setLang] = useState<"en"|"ar">("en");

  const TIPS: Record<string, string[]> = {
    newborn: ["Breastfeed within 1 hour of birth","Keep baby warm (36.5–37.5°C)","Rooming-in promotes bonding","Watch for jaundice in first week","Umbilical cord care — keep dry"],
    vaccines: ["Follow national immunization schedule","Never skip doses — catch up if missed","Mild fever after vaccine is normal","Keep vaccination card safe","Inform doctor of any allergies"],
    growth: ["Track weight, height & head circumference","Developmental milestones vary by child","Tummy time from day 1","Read and talk to your baby daily","Screen time: none under 18 months"],
    fever: ["Fever >38°C in <3 months → ER immediately","Paracetamol: 15mg/kg every 4-6 hours","Keep child hydrated","Tepid sponging if >39°C","Seek help: fever >5 days or seizure"],
    nutrition: ["Exclusive breastfeeding for 6 months","Introduce solids at 6 months","Avoid honey under 1 year","Iron-rich foods from 6 months","Vitamin D drops from birth"],
    pregnancy: ["Folic acid 400mcg daily before conception","First antenatal visit before 10 weeks","Avoid raw fish, unpasteurised cheese","Gentle exercise is safe","Take iron + folic acid supplements"],
  };

  const fetchArticles = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setArticles(data.results || []);
    } catch(e) {}
    setLoading(false);
  };

  const selectedTopic = TOPICS.find(t => t.id === topic);

  if (!topic) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff0f4 0%,#ffe8f0 60%,#fff0f8 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(255,45,85,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#FF2D55",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>👩‍👧 Mother & Child</div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {(["en","ar"] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?"rgba(255,45,85,0.15)":"transparent",border:"1px solid "+(lang===l?"#FF2D55":"rgba(0,0,0,0.1)"),borderRadius:20,padding:"4px 10px",color:lang===l?"#FF2D55":"rgba(60,60,67,0.5)",fontSize:12,cursor:"pointer"}}>
              {l==="en"?"EN":"ع"}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"20px 16px"}}>
        <div style={{background:"rgba(255,45,85,0.06)",border:"1px solid rgba(255,45,85,0.15)",borderRadius:16,padding:"14px 16px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>🤱</div>
          <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700}}>{lang==="ar"?"صحة الأم والطفل":"Mother & Child Health"}</div>
          <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,marginTop:4}}>{lang==="ar"?"معلومات موثوقة من WHO + PubMed":"Trusted info from WHO + PubMed"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {TOPICS.map(t=>(
            <button key={t.id} onClick={()=>{setTopic(t.id);fetchArticles(t.query);setTab("tips");}}
              style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:32,marginBottom:8}}>{t.emoji}</div>
              <div style={{color:"#1c1c1e",fontSize:14,fontWeight:700}}>{lang==="ar"?t.ar:t.label}</div>
            </button>
          ))}
        </div>
        <div style={{marginTop:20}}>
          <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:700,marginBottom:10}}>💉 VACCINE SCHEDULE</div>
          {VACCINE_SCHEDULE.map((v,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{background:"rgba(255,45,85,0.1)",borderRadius:8,padding:"4px 10px",flexShrink:0}}>
                <div style={{color:"#FF2D55",fontSize:12,fontWeight:700}}>{v.age}</div>
              </div>
              <div style={{color:"rgba(60,60,67,0.85)",fontSize:13,lineHeight:1.6}}>{v.vaccines.join(" · ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff0f4 0%,#ffe8f0 60%,#fff0f8 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={()=>setTopic(null)} style={{background:"rgba(255,45,85,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#FF2D55",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700}}>{selectedTopic?.emoji} {lang==="ar"?selectedTopic?.ar:selectedTopic?.label}</div>
      </div>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{display:"flex",background:"rgba(118,118,128,0.12)",borderRadius:12,padding:2,gap:2,marginBottom:16}}>
          {[{id:"tips",label:lang==="ar"?"نصائح":"Tips"},{id:"research",label:lang==="ar"?"أبحاث":"Research"},{id:"vaccines",label:lang==="ar"?"جدول":"Schedule"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              style={{flex:1,background:tab===t.id?"#fff":"transparent",border:"none",borderRadius:10,padding:"8px 4px",color:tab===t.id?"#1c1c1e":"rgba(60,60,67,0.5)",fontSize:13,fontWeight:tab===t.id?700:400,cursor:"pointer",boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.1)":"none"}}>
              {t.label}
            </button>
          ))}
        </div>
        {tab==="tips" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(TIPS[topic]||[]).map((tip,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",display:"flex",gap:10}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#FF2D55",flexShrink:0,marginTop:6}}/>
                <span style={{color:"rgba(60,60,67,0.85)",fontSize:15,lineHeight:1.6}}>{tip}</span>
              </div>
            ))}
          </div>
        )}
        {tab==="research" && (
          <div>
            {loading?<div style={{textAlign:"center",padding:30,color:"rgba(60,60,67,0.4)"}}>Loading PubMed...</div>:
              articles.map((a,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
                  <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:4,lineHeight:1.4}}>{a.title}</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"rgba(60,60,67,0.45)",fontSize:12}}>{a.journal} · {a.year}</span>
                    <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#FF2D55",fontSize:12,fontWeight:600}}>Read →</a>
                  </div>
                </div>
              ))
            }
          </div>
        )}
        {tab==="vaccines" && (
          <div>
            {VACCINE_SCHEDULE.map((v,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",marginBottom:8}}>
                <div style={{color:"#FF2D55",fontSize:13,fontWeight:700,marginBottom:6}}>{v.age}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {v.vaccines.map((vac,j)=>(
                    <span key={j} style={{background:"rgba(255,45,85,0.08)",border:"1px solid rgba(255,45,85,0.15)",borderRadius:20,padding:"4px 10px",color:"#FF2D55",fontSize:12,fontWeight:600}}>{vac}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
