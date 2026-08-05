"use client";
import { useState } from "react";

const CALCULATORS = [
  {
    id: "cha2ds2",
    name: "CHA₂DS₂-VASc",
    desc: "AF Stroke Risk",
    color: "#FF453A",
    emoji: "🫀",
    fields: [
      { key: "chf", label: "Heart Failure", type: "bool" },
      { key: "htn", label: "Hypertension", type: "bool" },
      { key: "age75", label: "Age ≥ 75", type: "bool", points: 2 },
      { key: "dm", label: "Diabetes", type: "bool" },
      { key: "stroke", label: "Stroke/TIA history", type: "bool", points: 2 },
      { key: "vascular", label: "Vascular disease", type: "bool" },
      { key: "age65", label: "Age 65-74", type: "bool" },
      { key: "female", label: "Female sex", type: "bool" },
    ],
    interpret: (score: number) => {
      if (score === 0) return { risk: "Low", action: "No anticoagulation", color: "#30D158" };
      if (score === 1) return { risk: "Moderate", action: "Consider anticoagulation", color: "#FF9500" };
      return { risk: "High", action: "Anticoagulation recommended", color: "#FF453A" };
    }
  },
  {
    id: "timi",
    name: "TIMI Score",
    desc: "NSTEMI/UA Risk",
    color: "#FF9500",
    emoji: "❤️",
    fields: [
      { key: "age65", label: "Age ≥ 65", type: "bool" },
      { key: "cad_risk", label: "≥3 CAD risk factors", type: "bool" },
      { key: "stenosis", label: "Known CAD (stenosis ≥50%)", type: "bool" },
      { key: "st_dev", label: "ST deviation on ECG", type: "bool" },
      { key: "angina", label: "≥2 anginal events in 24h", type: "bool" },
      { key: "aspirin", label: "Aspirin use in past 7 days", type: "bool" },
      { key: "troponin", label: "Elevated troponin", type: "bool" },
    ],
    interpret: (score: number) => {
      if (score <= 2) return { risk: "Low (5%)", action: "Conservative management", color: "#30D158" };
      if (score <= 4) return { risk: "Intermediate (13%)", action: "Early invasive strategy", color: "#FF9500" };
      return { risk: "High (41%)", action: "Urgent invasive strategy", color: "#FF453A" };
    }
  },
  {
    id: "wells_pe",
    name: "Wells PE Score",
    desc: "Pulmonary Embolism",
    color: "#0A84FF",
    emoji: "🫁",
    fields: [
      { key: "dvt_signs", label: "Clinical signs of DVT", type: "bool", points: 3 },
      { key: "alt_dx", label: "PE most likely diagnosis", type: "bool", points: 3 },
      { key: "hr", label: "Heart rate > 100", type: "bool", points: 1.5 },
      { key: "immobile", label: "Immobilization/surgery in 4 weeks", type: "bool", points: 1.5 },
      { key: "prev_dvt", label: "Previous DVT/PE", type: "bool", points: 1.5 },
      { key: "hemoptysis", label: "Hemoptysis", type: "bool" },
      { key: "malignancy", label: "Active malignancy", type: "bool" },
    ],
    interpret: (score: number) => {
      if (score < 2) return { risk: "Low (1.3%)", action: "D-dimer if negative → PE excluded", color: "#30D158" };
      if (score < 6) return { risk: "Moderate (16.2%)", action: "CTPA recommended", color: "#FF9500" };
      return { risk: "High (37.5%)", action: "Empiric treatment + CTPA", color: "#FF453A" };
    }
  },
  {
    id: "heart",
    name: "HEART Score",
    desc: "Chest Pain Risk",
    color: "#FF2D55",
    emoji: "💔",
    fields: [
      { key: "history", label: "Highly suspicious history", type: "select", options: ["Non-suspicious (0)", "Moderately suspicious (1)", "Highly suspicious (2)"] },
      { key: "ecg", label: "ECG changes", type: "select", options: ["Normal (0)", "Non-specific repolarization (1)", "Significant ST deviation (2)"] },
      { key: "age", label: "Age", type: "select", options: ["< 45 (0)", "45-64 (1)", "≥ 65 (2)"] },
      { key: "risk", label: "Risk factors", type: "select", options: ["None (0)", "1-2 factors (1)", "≥3 factors or history (2)"] },
      { key: "troponin", label: "Troponin", type: "select", options: ["Normal (0)", "1-3x normal (1)", ">3x normal (2)"] },
    ],
    interpret: (score: number) => {
      if (score <= 3) return { risk: "Low (1.7%)", action: "Early discharge, outpatient follow-up", color: "#30D158" };
      if (score <= 6) return { risk: "Moderate (12%)", action: "Observation, serial troponins", color: "#FF9500" };
      return { risk: "High (65%)", action: "Early invasive strategy", color: "#FF453A" };
    }
  },
  {
    id: "curb65",
    name: "CURB-65",
    desc: "Pneumonia Severity",
    color: "#30D158",
    emoji: "🫁",
    fields: [
      { key: "confusion", label: "Confusion (new)", type: "bool" },
      { key: "urea", label: "Urea > 7 mmol/L (BUN > 19)", type: "bool" },
      { key: "rr", label: "Respiratory rate ≥ 30", type: "bool" },
      { key: "bp", label: "BP < 90/60 mmHg", type: "bool" },
      { key: "age65", label: "Age ≥ 65", type: "bool" },
    ],
    interpret: (score: number) => {
      if (score <= 1) return { risk: "Low mortality (1.5%)", action: "Outpatient treatment", color: "#30D158" };
      if (score === 2) return { risk: "Moderate (9.2%)", action: "Short inpatient admission", color: "#FF9500" };
      return { risk: "Severe (22%+)", action: "ICU consideration", color: "#FF453A" };
    }
  },
  {
    id: "qsofa",
    name: "qSOFA",
    desc: "Sepsis Quick Screen",
    color: "#BF5AF2",
    emoji: "🦠",
    fields: [
      { key: "rr", label: "Respiratory rate ≥ 22", type: "bool" },
      { key: "gcs", label: "Altered mentation (GCS < 15)", type: "bool" },
      { key: "sbp", label: "Systolic BP ≤ 100 mmHg", type: "bool" },
    ],
    interpret: (score: number) => {
      if (score < 2) return { risk: "Low risk", action: "Monitor, reassess", color: "#30D158" };
      return { risk: "High risk — Sepsis likely", action: "Urgent sepsis protocol", color: "#FF453A" };
    }
  },
  {
    id: "gfr",
    name: "eGFR / CKD Stage",
    desc: "Renal Function",
    color: "#64D2FF",
    emoji: "🩺",
    fields: [
      { key: "creatinine", label: "Creatinine (mg/dL)", type: "number" },
      { key: "age", label: "Age (years)", type: "number" },
      { key: "female", label: "Female sex", type: "bool" },
    ],
    interpret: (score: number) => {
      if (score >= 90) return { risk: "G1 — Normal", action: "Monitor annually", color: "#30D158" };
      if (score >= 60) return { risk: "G2 — Mildly decreased", action: "Monitor every 6 months", color: "#30D158" };
      if (score >= 45) return { risk: "G3a — Mild-moderate", action: "Nephrology referral consider", color: "#FF9500" };
      if (score >= 30) return { risk: "G3b — Moderate-severe", action: "Nephrology referral", color: "#FF9500" };
      if (score >= 15) return { risk: "G4 — Severely decreased", action: "Prepare for RRT", color: "#FF453A" };
      return { risk: "G5 — Kidney failure", action: "Dialysis/transplant", color: "#FF453A" };
    }
  },
];

export default function ClinicalCalculators() {
  const [selected, setSelected] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [score, setScore] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  const calc = CALCULATORS.find(c => c.id === selected);

  const calculate = () => {
    if (!calc) return;
    
    if (calc.id === "gfr") {
      const cr = parseFloat(values.creatinine) || 1;
      const age = parseFloat(values.age) || 40;
      const female = values.female ? 0.742 : 1;
      const gfr = Math.round(186 * Math.pow(cr, -1.154) * Math.pow(age, -0.203) * female);
      setScore(gfr);
      setResult(calc.interpret(gfr));
      return;
    }

    let total = 0;
    calc.fields.forEach(f => {
      if (f.type === "bool" && values[f.key]) {
        total += (f as any).points || 1;
      } else if (f.type === "select") {
        total += parseInt(values[f.key] || "0");
      }
    });
    setScore(total);
    setResult(calc.interpret(total));
  };

  const reset = () => { setSelected(null); setValues({}); setScore(null); setResult(null); };

  if (!selected) return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", padding:"24px 20px", fontFamily:"-apple-system, sans-serif" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ color:"#0A84FF", fontSize:13, fontWeight:600, marginBottom:4 }}>EVIDENCE-BASED</div>
        <div style={{ color:"#fff", fontSize:26, fontWeight:800 }}>Clinical Calculators</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>Validated scoring systems</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {CALCULATORS.map(c => (
          <button key={c.id} onClick={() => { setSelected(c.id); setValues({}); setScore(null); setResult(null); }}
            style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${c.color}30`, borderRadius:16, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontSize:28 }}>{c.emoji}</div>
            <div>
              <div style={{ color:"#fff", fontSize:16, fontWeight:700 }}>{c.name}</div>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:13 }}>{c.desc}</div>
            </div>
            <div style={{ marginLeft:"auto", color:c.color, fontSize:20 }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", padding:"24px 20px", fontFamily:"-apple-system, sans-serif" }}>
      <button onClick={reset} style={{ background:"none", border:"none", color:"#0A84FF", fontSize:16, marginBottom:20, cursor:"pointer" }}>← Back</button>
      
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:32, marginBottom:8 }}>{calc?.emoji}</div>
        <div style={{ color:"#fff", fontSize:24, fontWeight:800 }}>{calc?.name}</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>{calc?.desc}</div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
        {calc?.fields.map(f => (
          <div key={f.key} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 16px" }}>
            {f.type === "bool" && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:"#fff", fontSize:15 }}>{f.label}</span>
                <button onClick={() => setValues(v => ({ ...v, [f.key]: !v[f.key] }))}
                  style={{ background: values[f.key] ? "#0A84FF" : "rgba(255,255,255,0.1)", border:"none", borderRadius:20, width:51, height:31, cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ width:27, height:27, background:"#fff", borderRadius:"50%", transform: values[f.key] ? "translateX(20px)" : "translateX(2px)", transition:"all 0.2s" }} />
                </button>
              </div>
            )}
            {f.type === "number" && (
              <div>
                <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, marginBottom:6 }}>{f.label}</div>
                <input type="number" value={values[f.key] || ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:16, width:"100%", boxSizing:"border-box", outline:"none" }} />
              </div>
            )}
            {f.type === "select" && (
              <div>
                <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, marginBottom:8 }}>{f.label}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {(f as any).options?.map((opt: string, i: number) => (
                    <button key={i} onClick={() => setValues(v => ({ ...v, [f.key]: i.toString() }))}
                      style={{ background: values[f.key] === i.toString() ? "rgba(10,132,255,0.2)" : "rgba(255,255,255,0.04)", border: values[f.key] === i.toString() ? "1px solid #0A84FF" : "1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, textAlign:"left", cursor:"pointer" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={calculate}
        style={{ width:"100%", background:"linear-gradient(135deg,#0A84FF,#0066CC)", border:"none", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:700, cursor:"pointer", marginBottom:20, boxShadow:"0 4px 20px rgba(10,132,255,0.3)" }}>
        Calculate Score
      </button>

      {result && (
        <div style={{ background:`${result.color}15`, border:`1px solid ${result.color}40`, borderRadius:16, padding:20 }}>
          <div style={{ color:result.color, fontSize:36, fontWeight:800, marginBottom:4 }}>{score} {calc?.id === "gfr" ? "mL/min" : "pts"}</div>
          <div style={{ color:"#fff", fontSize:18, fontWeight:700, marginBottom:8 }}>{result.risk}</div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:15 }}>→ {result.action}</div>
        </div>
      )}
    </div>
  );
}
