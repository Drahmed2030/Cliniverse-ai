"use client";
import { useState } from "react";

export default function MedicalConsultant() {
  const [question, setQuestion] = useState("");
  const [specialty, setSpecialty] = useState("Cardiology");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const specialties = ["Cardiology","Emergency","Pulmonology","Neurology","Nephrology","Endocrinology","Infectious Disease","Surgery"];

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/medical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, specialty })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ answer: "Error — please try again." });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", padding:"24px 20px", fontFamily:"-apple-system, sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ color:"#0A84FF", fontSize:13, fontWeight:600, marginBottom:4 }}>POWERED BY PUBMED + FDA + CLAUDE</div>
        <div style={{ color:"#fff", fontSize:26, fontWeight:800 }}>Medical AI Consultant</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>Evidence-based answers in seconds</div>
      </div>

      {/* Specialty */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {specialties.map(s => (
          <button key={s} onClick={() => setSpecialty(s)}
            style={{ background: specialty===s ? "#0A84FF" : "rgba(255,255,255,0.06)", border: specialty===s ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a clinical question... e.g. What is the first-line treatment for STEMI?"
        rows={3}
        style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(10,132,255,0.3)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:16, fontFamily:"-apple-system, sans-serif", outline:"none", resize:"none", boxSizing:"border-box", marginBottom:12 }}
      />

      <button onClick={ask} disabled={!question.trim() || loading}
        style={{ width:"100%", background: question.trim() ? "linear-gradient(135deg,#0A84FF,#0066CC)" : "rgba(255,255,255,0.1)", border:"none", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:700, cursor: question.trim() ? "pointer" : "default", marginBottom:24, boxShadow: question.trim() ? "0 4px 20px rgba(10,132,255,0.3)" : "none" }}>
        {loading ? "⏳ Searching PubMed + FDA..." : "🔬 Get Evidence-Based Answer"}
      </button>

      {/* Result */}
      {result && (
        <div>
          {/* Answer */}
          <div style={{ background:"rgba(10,132,255,0.08)", border:"1px solid rgba(10,132,255,0.2)", borderRadius:16, padding:20, marginBottom:16 }}>
            <div style={{ color:"#0A84FF", fontSize:12, fontWeight:700, marginBottom:12 }}>CLINICAL ANSWER</div>
            <div style={{ color:"rgba(255,255,255,0.9)", fontSize:15, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{result.answer}</div>
          </div>

          {/* FDA */}
          {result.fdaData && (
            <div style={{ background:"rgba(255,149,0,0.08)", border:"1px solid rgba(255,149,0,0.2)", borderRadius:16, padding:16, marginBottom:16 }}>
              <div style={{ color:"#FF9500", fontSize:12, fontWeight:700, marginBottom:8 }}>FDA DRUG INFO</div>
              <div style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{result.fdaData.name} {result.fdaData.brand && `(${result.fdaData.brand})`}</div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, marginTop:4 }}>{result.fdaData.dosage?.substring(0,150)}...</div>
            </div>
          )}

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:16 }}>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, fontWeight:700, marginBottom:12 }}>PUBMED SOURCES</div>
              {result.sources.map((s: any, i: number) => (
                <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom: i < result.sources.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ color:"#fff", fontSize:13, fontWeight:600, marginBottom:2 }}>{s.title}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{s.authors} • {s.journal} • {s.year}</div>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ color:"#0A84FF", fontSize:12 }}>View on PubMed →</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
