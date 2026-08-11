"use client";

import { motion, AnimatePresence } from "../lib/motion";
import { ConsensusCircle, FadePresence, staggerContainer, staggerItem, easeSmooth } from "../lib/motion";

export type ConsensusStatus = "agreed" | "conflicting" | "low";
export type ResponseStatus  = "agreed" | "conflict" | "error";

export interface AIModelInfo  { name: string; version: string; }
export interface AIResponse {
  model: AIModelInfo; score: number; answer: string;
  status: ResponseStatus; tags?: string[];
}
export interface ConsensusData {
  consensus_score: number; status: ConsensusStatus; question: string;
  individual_responses: AIResponse[];
  summary?: string; recommendation?: string;
}

function ClinicalQuestionCard({ question }: { question: string }) {
  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:0.1, duration:0.4 }}
      style={{
        background:"#FFFFFF", borderRadius:18, padding:16,
        border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
        marginBottom:16,
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{
          width:28, height:28, borderRadius:"50%",
          background:"#F0FDFA", display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ color:"#0D9488", fontSize:14, fontWeight:700 }}>?</span>
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Clinical Question</span>
      </div>
      <p style={{ fontSize:15, lineHeight:1.6, color:"#111827", margin:0 }}>{question}</p>
    </motion.div>
  );
}

function AIResponseItem({ model, score, answer, status, tags=[], index=0 }: AIResponse & { index?: number }) {
  const isOk   = status === "agreed";
  const color  = isOk ? "#0D9488" : "#EF4444";
  const border = isOk ? "#D1FAE5" : "#FECACA";

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: 0.15 + index * 0.08, duration:0.4 }}
      whileHover={{ y:-2, boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}
      style={{
        background:"#FFFFFF", borderRadius:18, padding:16,
        border:`1.5px solid ${border}`,
        boxShadow:"0 2px 8px rgba(0,0,0,0.05)", marginBottom:12,
        cursor:"default",
      }}
    >
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            background: isOk ? "#0D9488" : "#EF4444",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"white", fontSize:13, fontWeight:700,
          }}>
            {isOk ? "✓" : "✕"}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827", margin:0 }}>{model.name}</p>
            <p style={{ fontSize:11, color:"#6B7280", margin:0 }}>{model.version}</p>
          </div>
        </div>
        <span style={{ fontSize:18, fontWeight:800, color }}>{score}%</span>
      </div>

      {/* Progress bar */}
      <div style={{ height:5, background:"#F3F4F6", borderRadius:99, marginBottom:12, overflow:"hidden" }}>
        <motion.div
          style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${color}99,${color})` }}
          initial={{ width:0 }}
          animate={{ width:`${score}%` }}
          transition={{ delay: 0.25 + index * 0.08, duration:0.7, ease:"easeOut" }}
        />
      </div>

      <p style={{ fontSize:13, lineHeight:1.6, color:"#374151", marginBottom: tags?.length ? 10 : 0 }}>{answer}</p>

      {tags && tags.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:99,
              background: isOk ? "#F0FDFA" : "#FEF2F2",
              color: isOk ? "#0F766E" : "#B91C1C",
              border: `1px solid ${isOk ? "#99F6E4" : "#FECACA"}`,
            }}>{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface ConsensusResultProps {
  data?: ConsensusData; loading?: boolean;
  error?: string | null; onRetry?: () => void; onBack?: () => void;
}

export default function ConsensusResult({ data, loading=false, error=null, onRetry, onBack }: ConsensusResultProps) {
  if (loading) return (
    <div style={{
      minHeight:"100dvh", background:"#F7FAFA",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px",
      fontFamily:"-apple-system,'SF Pro Display',sans-serif",
    }}>
      <div style={{
        width:40, height:40, border:"3px solid #0D9488",
        borderTopColor:"transparent", borderRadius:"50%",
        animation:"spin 0.8s linear infinite", marginBottom:20,
      }}/>
      <p style={{ fontSize:16, fontWeight:500, color:"#374151" }}>Consulting multiple AI models...</p>
      <p style={{ fontSize:13, color:"#6B7280", marginTop:6 }}>Claude · DeepSeek · Grok · Llama</p>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight:"100dvh", background:"#F7FAFA",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0 24px", textAlign:"center",
      fontFamily:"-apple-system,'SF Pro Display',sans-serif",
    }}>
      <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
      <h2 style={{ fontSize:18, fontWeight:600, color:"#111827", marginBottom:8 }}>Unable to reach AI models</h2>
      <p style={{ fontSize:13, color:"#6B7280", marginBottom:24, maxWidth:280 }}>{error}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          background:"#0D9488", color:"white", fontWeight:600,
          padding:"10px 28px", borderRadius:14, border:"none", cursor:"pointer", fontSize:14,
        }}>Try Again</button>
      )}
    </div>
  );

  if (!data) return null;

  const isConflict = data.status === "conflicting";

  return (
    <div style={{
      minHeight:"100dvh", background:"#F7FAFA", paddingBottom:40,
      fontFamily:"-apple-system,'SF Pro Display',sans-serif",
    }}>
      {/* Header */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        background:"rgba(255,255,255,0.92)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid #E2E8F0", padding:"12px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <button onClick={onBack} style={{
          fontSize:22, color:"#111827", background:"none", border:"none", cursor:"pointer", padding:4,
        }}>←</button>
        <h1 style={{ fontSize:16, fontWeight:700, color:"#111827", margin:0 }}>Multi-AI Consensus</h1>
        <span style={{ fontSize:11, fontWeight:600, color:"#0D9488" }}>Clinical Arsenal</span>
      </div>

      <div style={{ padding:"24px 16px 0" }}>
        {/* Score Circle */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
          <ConsensusCircle score={data.consensus_score} />
          <FadePresence show={isConflict}>
            <div style={{
              marginTop:12, display:"flex", alignItems:"center", gap:6,
              padding:"6px 16px", background:"#FEF2F2",
              color:"#DC2626", borderRadius:99, fontSize:13, fontWeight:600,
            }}>
              <span>⚠️</span><span>CONFLICTING VIEWS</span>
            </div>
          </FadePresence>
        </div>

        <ClinicalQuestionCard question={data.question} />

        {/* Responses */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:"#111827", margin:0 }}>AI Responses</h2>
          <span style={{ fontSize:12, color:"#6B7280" }}>{data.individual_responses.length} AI Models</span>
        </div>

        {data.individual_responses.map((item, i) => (
          <AIResponseItem key={`${item.model.name}-${i}`} {...item} index={i} />
        ))}

        {/* Disclaimer */}
        <div style={{
          marginTop:8, padding:12,
          background:"#FFFBEB", borderRadius:14,
          border:"1px solid #FDE68A",
        }}>
          <p style={{ fontSize:11, color:"#92400E", textAlign:"center", lineHeight:1.6, margin:0 }}>
            ⚠️ Educational use only. AI-generated content is not a substitute for clinical judgment.
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export { ConsensusCircle, ClinicalQuestionCard, AIResponseItem };
