"use client";
import { useState, useEffect } from "react";

const F = "-apple-system, SF Pro Display, sans-serif";

const JOURNALS = [
  { id:"all",       label:"All",     color:"#0A84FF", icon:"🌐" },
  { id:"cardiology",label:"Cardiology", color:"#FF453A", icon:"🫀" },
  { id:"emergency", label:"Emergency",  color:"#FF9F0A", icon:"🚨" },
  { id:"neurology", label:"Neurology",  color:"#BF5AF2", icon:"🧠" },
  { id:"oncology",  label:"Oncology",   color:"#30D158", icon:"🔬" },
  { id:"infectious",label:"Infectious", color:"#64D2FF", icon:"🦠" },
  { id:"surgery",   label:"Surgery",    color:"#FF6B35", icon:"🔪" },
  { id:"pediatrics",label:"Pediatrics", color:"#FF2D55", icon:"👶" },
];

const SPECIALTY_QUERIES: Record<string, string> = {
  all:        "clinical trial 2026 medicine",
  cardiology: "cardiology heart failure STEMI 2026",
  emergency:  "emergency medicine sepsis resuscitation 2026",
  neurology:  "neurology stroke seizure 2026",
  oncology:   "oncology cancer treatment 2026",
  infectious: "infectious disease antibiotic resistance 2026",
  surgery:    "surgery minimally invasive outcomes 2026",
  pediatrics: "pediatrics child health 2026",
};

interface Article {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  url: string;
}

export default function MedFeed({ onXP }: { onXP?: (n: number) => void }) {
  const [specialty, setSpecialty] = useState("all");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<string|null>(null);

  const fetchArticles = async (spec: string) => {
    setLoading(true);
    setArticles([]);
    try {
      const query = SPECIALTY_QUERIES[spec] || spec;
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setArticles(data.results || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchArticles(specialty); }, [specialty]);

  const getAISummary = async (article: Article) => {
    if (aiSummary[article.id]) return;
    setLoadingAI(article.id);
    try {
      const res = await fetch("/api/medical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Summarize this medical article in 2-3 sentences for a clinician: "${article.title}"`,
          specialty: specialty
        })
      });
      const data = await res.json();
      setAiSummary(prev => ({ ...prev, [article.id]: data.answer || "Summary unavailable." }));
      onXP?.(5);
    } catch (e) {}
    setLoadingAI(null);
  };

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    onXP?.(2);
  };

  const jColors: Record<string, string> = {
    cardiology:"#FF453A", emergency:"#FF9F0A", neurology:"#BF5AF2",
    oncology:"#30D158", infectious:"#64D2FF", surgery:"#FF6B35",
    pediatrics:"#FF2D55", all:"#0A84FF"
  };
  const accent = jColors[specialty] || "#0A84FF";

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 50%,#f5f0ff 100%)", fontFamily:F, paddingBottom:100 }}>
      
      {/* Header */}
      <div style={{ padding:"24px 20px 16px", position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:300,height:150,background:`radial-gradient(circle,${accent}20 0%,transparent 70%)`,pointerEvents:"none" }}/>
        <div style={{ color:"#1c1c1e", fontSize:26, fontWeight:800, marginBottom:4 }}>MedFeed</div>
        <div style={{ color:"rgba(60,60,67,0.6)", fontSize:14 }}>Live research · PubMed · Updated daily</div>
      </div>

      {/* Specialty Filter */}
      <div style={{ overflowX:"auto", padding:"0 16px 16px", display:"flex", gap:8 }}>
        {JOURNALS.map(j => (
          <button key={j.id} onClick={() => setSpecialty(j.id)}
            style={{ flexShrink:0, background:specialty===j.id?`${j.color}20`:"rgba(255,255,255,0.7)", backdropFilter:"blur(10px)", border:`1.5px solid ${specialty===j.id?j.color:"rgba(255,255,255,0.9)"}`, borderRadius:20, padding:"7px 14px", color:specialty===j.id?j.color:"rgba(60,60,67,0.6)", fontSize:13, fontWeight:specialty===j.id?700:400, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
            <span>{j.icon}</span>{j.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:12 }}>
        
        {loading && (
          <div style={{ textAlign:"center", padding:40 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔬</div>
            <div style={{ color:"rgba(60,60,67,0.5)", fontSize:15 }}>Loading latest research...</div>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"rgba(60,60,67,0.4)", fontSize:15 }}>
            No articles found
          </div>
        )}

        {articles.map((article, i) => (
          <div key={article.id} style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.9)", borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
            
            {/* Badge */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", gap:8 }}>
                <span style={{ background:`${accent}15`, color:accent, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:8 }}>
                  PubMed
                </span>
                <span style={{ background:"rgba(48,209,88,0.1)", color:"#30D158", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:8 }}>
                  {article.year}
                </span>
              </div>
              <button onClick={() => toggleSave(article.id)}
                style={{ background:"none", border:"none", fontSize:20, cursor:"pointer" }}>
                {saved.has(article.id) ? "🔖" : "📌"}
              </button>
            </div>

            {/* Title */}
            <div style={{ color:"#1c1c1e", fontSize:16, fontWeight:700, marginBottom:8, lineHeight:1.4 }}>
              {article.title}
            </div>

            {/* Authors + Journal */}
            <div style={{ color:"rgba(60,60,67,0.5)", fontSize:13, marginBottom:12 }}>
              {article.authors && <span>{article.authors.split(",")[0]} et al. · </span>}
              {article.journal}
            </div>

            {/* AI Summary */}
            {aiSummary[article.id] && (
              <div style={{ background:`${accent}08`, border:`1px solid ${accent}20`, borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
                <div style={{ color:accent, fontSize:11, fontWeight:700, marginBottom:6 }}>🤖 AI PEARL</div>
                <div style={{ color:"rgba(60,60,67,0.85)", fontSize:13, lineHeight:1.6 }}>{aiSummary[article.id]}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:8 }}>
              {!aiSummary[article.id] && (
                <button onClick={() => getAISummary(article)}
                  disabled={loadingAI === article.id}
                  style={{ background:`${accent}15`, border:`1px solid ${accent}30`, borderRadius:10, padding:"8px 14px", color:accent, fontSize:13, fontWeight:600, cursor:"pointer", flex:1 }}>
                  {loadingAI === article.id ? "⏳ Summarising..." : "🤖 AI Summary"}
                </button>
              )}
              <a href={article.url} target="_blank" rel="noreferrer"
                style={{ background:"rgba(255,255,255,0.8)", border:"1px solid rgba(0,0,0,0.08)", borderRadius:10, padding:"8px 14px", color:"rgba(60,60,67,0.7)", fontSize:13, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                PubMed →
              </a>
            </div>
          </div>
        ))}

        {/* Source badge */}
        {!loading && articles.length > 0 && (
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <span style={{ color:"rgba(60,60,67,0.4)", fontSize:12 }}>
              Live data from PubMed/NCBI · {articles.length} articles
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
