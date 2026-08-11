"use client";

interface OracleResponseCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  answer: string;
  confidence: number;
  evidence: string;
  keyPoints?: string[];
  caution?: string;
  latency?: number;
  status: "ok" | "error";
  error?: string;
  isExpanded: boolean;
  onToggle: () => void;
  animDelay?: number;
}

export default function OracleResponseCard({
  name, icon, color, desc, answer, confidence, evidence,
  keyPoints = [], caution, latency, status, error,
  isExpanded, onToggle, animDelay = 0,
}: OracleResponseCardProps) {
  const isOk = status === "ok";
  const isHigh = confidence >= 80;
  const isMid = confidence >= 60 && confidence < 80;

  const confColor = !isOk ? "#EF4444" : isHigh ? "#10B981" : isMid ? "#F59E0B" : "#EF4444";
  const borderColor = !isOk ? "#FECACA" : isHigh ? "#D1FAE5" : isMid ? "#FEF3C7" : "#FECACA";

  return (
    <div
      className="oracle-response-card oracle-card-enter"
      onClick={onToggle}
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        border: `1.5px solid ${borderColor}`,
        padding: "16px",
        marginBottom: 12,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        animationDelay: `${animDelay}ms`,
        fontFamily: "-apple-system,'SF Pro Display',sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Model icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: isOk ? `${color}18` : "#FEF2F2",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, border: `1.5px solid ${isOk ? color + "30" : "#FECACA"}`,
          }}>
            {isOk ? icon : "❌"}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{desc}</div>
          </div>
        </div>
        {/* Score */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: confColor }}>{confidence}%</div>
          {latency && <div style={{ fontSize: 10, color: "#9CA3AF" }}>{(latency/1000).toFixed(1)}s</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "#F3F4F6", borderRadius: 99, marginBottom: 12, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${confidence}%`,
          background: `linear-gradient(90deg, ${color}, ${confColor})`,
          transition: "width 0.8s ease",
        }}/>
      </div>

      {/* Answer */}
      {isOk ? (
        <>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#374151", marginBottom: 8 }}>
            {answer}
          </div>

          {/* Key Points */}
          {isExpanded && keyPoints.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {keyPoints.map((pt, i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, marginBottom: 4, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%", background: color,
                    marginTop: 6, flexShrink: 0,
                  }}/>
                  <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}>{pt}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tags row */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {/* Evidence tag */}
            {evidence && evidence !== "Clinical judgment" && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
                background: "#F0FDFA", color: "#0F766E", border: "1px solid #99F6E4",
              }}>📚 {evidence.slice(0, 40)}</span>
            )}
            {/* Caution tag */}
            {caution && caution !== "None" && caution.length > 3 && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
                background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A",
              }}>⚠️ {caution.slice(0, 40)}</span>
            )}
            {/* Confidence tag */}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
              background: isHigh ? "#F0FDF4" : isMid ? "#FFFBEB" : "#FEF2F2",
              color: confColor,
              border: `1px solid ${confColor}30`,
            }}>
              {isHigh ? "✅ High confidence" : isMid ? "⚡ Moderate" : "⚠️ Low confidence"}
            </span>
          </div>

          {/* Expand hint */}
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#9CA3AF" }}>
            {isExpanded ? "▲ Less" : "▼ More details"}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: "#EF4444" }}>❌ {error}</div>
      )}
    </div>
  );
}
