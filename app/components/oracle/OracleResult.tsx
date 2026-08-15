"use client";
/**
 * OracleResult.tsx
 * Save to: app/components/oracle/OracleResult.tsx
 * Consensus result: agreement · summary · engine positions · caveats · actions
 */

import React, { useState } from "react";
import type { OracleResult, EngineDef, OraclePhase } from "./OracleScreen";

interface OracleResultProps {
  result: OracleResult;
  question: string;
  engines: EngineDef[];
  onReset: () => void;
  onFollowUp: (q: string) => void;
  phase: OraclePhase;
}

const AGREEMENT_CONFIG = {
  high:     { label: "High Agreement",     color: "#10B981", bg: "#ECFDF5", bar: "#10B981", icon: "✓" },
  moderate: { label: "Moderate Agreement", color: "#F59E0B", bg: "#FFFBEB", bar: "#F59E0B", icon: "~" },
  low:      { label: "Low Agreement",      color: "#EF4444", bg: "#FEF2F2", bar: "#EF4444", icon: "!" },
};

const STANCE_CONFIG = {
  aligned:   { label: "Aligned",   color: "#10B981", barWidth: "100%", icon: "●●●●" },
  partial:   { label: "Partial",   color: "#F59E0B", barWidth: "65%",  icon: "●●●○" },
  divergent: { label: "Divergent", color: "#EF4444", barWidth: "35%",  icon: "●●○○" },
};

const T = {
  text: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  teal: "#0D9488",
  bg: "#F8FAFC",
};

export default function OracleResult({
  result, question, engines, onReset, onFollowUp, phase,
}: OracleResultProps) {
  const [copied, setCopied] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);

  const agrCfg = result.agreement ? AGREEMENT_CONFIG[result.agreement] : null;

  function handleCopy() {
    const text = [
      `Clinical Oracle — ${question}`,
      "",
      "CONSENSUS SUMMARY",
      result.summary,
      "",
      result.caveats?.length ? "CAVEATS\n" + result.caveats.map(c => "• " + c).join("\n") : "",
      "",
      "Educational only. Not a substitute for clinical judgment.",
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleFollowUpSubmit() {
    if (followUpText.trim()) {
      onFollowUp(followUpText.trim());
    }
  }

  if (phase === "error") {
    return (
      <div>
        <div style={S.errorCard}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#991B1B", marginBottom: 6 }}>
            Unable to reach engines
          </div>
          <div style={{ fontSize: 13, color: "#B91C1C", marginBottom: 16 }}>
            {result?.summary || "Please check your connection and try again."}
          </div>
          <button style={S.resetBtn} onClick={onReset}>← New question</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Question echo */}
      <div style={S.questionEcho}>
        <div style={S.questionLabel}>YOUR QUESTION</div>
        <div style={S.questionText}>{question}</div>
      </div>

      {/* Low agreement warning */}
      {result.agreement === "low" && (
        <div style={S.lowAgreementBanner}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
            Low agreement — verify in primary sources and local protocols
          </div>
        </div>
      )}

      {/* Partial engines note */}
      {result.enginesResponded !== undefined && result.enginesResponded < (result.totalEngines || 4) && (
        <div style={S.partialBanner}>
          {result.enginesResponded} of {result.totalEngines} engines responded
        </div>
      )}

      {/* Agreement badge */}
      {agrCfg && (
        <div style={{ ...S.agrCard, background: agrCfg.bg, borderColor: agrCfg.color + "30" }}>
          <div style={S.agrHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ ...S.agrBadge, background: agrCfg.color }}>
                {agrCfg.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: agrCfg.color }}>
                  {agrCfg.label}
                </div>
                <div style={{ fontSize: 10, color: T.muted }}>AGREEMENT LEVEL</div>
              </div>
            </div>
            {result.agreementPct !== undefined && (
              <div style={{ fontSize: 28, fontWeight: 900, color: agrCfg.color }}>
                {result.agreementPct}%
              </div>
            )}
          </div>

          {/* Agreement bar */}
          {result.agreementPct !== undefined && (
            <div style={S.agrBarBg}>
              <div style={{
                height: "100%",
                width: result.agreementPct + "%",
                background: agrCfg.color,
                borderRadius: 4,
                transition: "width 0.8s ease",
              }} />
            </div>
          )}
        </div>
      )}

      {/* Consensus summary */}
      <div style={S.section}>
        <div style={S.sectionLabel}>CONSENSUS SUMMARY</div>
        <div style={S.summaryCard}>
          <div style={S.summaryText}>{result.summary}</div>
        </div>
      </div>

      {/* Engine positions */}
      {result.positions && result.positions.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>ENGINE POSITIONS</div>
          {result.positions.map(pos => {
            const engine = engines.find(e => e.id === pos.engineId);
            const stanceCfg = STANCE_CONFIG[pos.stance];
            if (!engine) return null;
            return (
              <div key={pos.engineId} style={S.positionCard}>
                <div style={S.positionHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: engine.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{engine.label}</div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 800,
                    color: stanceCfg.color,
                    background: stanceCfg.color + "15",
                    borderRadius: 6,
                    padding: "2px 8px",
                  }}>
                    {stanceCfg.label.toUpperCase()}
                  </div>
                </div>

                {/* Stance bar */}
                <div style={S.stanceBarBg}>
                  <div style={{
                    height: "100%",
                    width: stanceCfg.barWidth,
                    background: stanceCfg.color,
                    borderRadius: 3,
                    transition: "width 0.6s ease",
                  }} />
                </div>

                {pos.note && (
                  <div style={S.positionNote}>{pos.note}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Caveats */}
      {result.caveats && result.caveats.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>KEY CAVEATS</div>
          <div style={S.caveatsCard}>
            {result.caveats.map((c, i) => (
              <div key={i} style={S.caveatItem}>
                <div style={S.caveatDot} />
                <div style={S.caveatText}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={S.actionsRow}>
        <button
          style={{ ...S.actionBtn, background: copied ? "#ECFDF5" : T.bg, color: copied ? "#059669" : T.sub }}
          onClick={handleCopy}
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
        <button
          style={{ ...S.actionBtn, background: T.bg, color: T.sub }}
          onClick={() => setShowFollowUp(!showFollowUp)}
        >
          💬 Follow-up
        </button>
        <button
          style={{ ...S.actionBtn, background: T.bg, color: T.sub }}
          onClick={onReset}
        >
          ← New
        </button>
      </div>

      {/* Follow-up composer */}
      {showFollowUp && (
        <div style={S.followUpBox}>
          <div style={S.sectionLabel}>ASK A FOLLOW-UP</div>
          <input
            style={S.followUpInput}
            placeholder="Refine or build on this question…"
            value={followUpText}
            onChange={e => setFollowUpText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleFollowUpSubmit(); }}
            autoFocus
          />
          <button
            style={{
              ...S.followUpBtn,
              opacity: followUpText.trim() ? 1 : 0.4,
            }}
            onClick={handleFollowUpSubmit}
            disabled={!followUpText.trim()}
          >
            Ask →
          </button>
        </div>
      )}

      {/* Result disclaimer */}
      <div style={S.resultDisclaimer}>
        Clinical Oracle compares multiple AI engines for educational consensus.
        It does not provide patient-specific medical advice or replace professional care.
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  questionEcho: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#94A3B8",
    fontWeight: 800,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0F172A",
    lineHeight: 1.5,
  },
  lowAgreementBanner: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 10,
    padding: "10px 12px",
    marginBottom: 10,
  },
  partialBanner: {
    fontSize: 11,
    fontWeight: 700,
    color: "#F59E0B",
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: 8,
    padding: "6px 12px",
    marginBottom: 10,
    textAlign: "center" as const,
  },
  agrCard: {
    border: "1px solid",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 14,
  },
  agrHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  agrBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
  },
  agrBarBg: {
    height: 8,
    background: "rgba(0,0,0,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#94A3B8",
    fontWeight: 800,
    marginBottom: 8,
  },
  summaryCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "16px",
    borderLeft: "3px solid #0D9488",
  },
  summaryText: {
    fontSize: 14,
    color: "#0F172A",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap" as const,
  },
  positionCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
  },
  positionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stanceBarBg: {
    height: 6,
    background: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  positionNote: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 1.5,
  },
  caveatsCard: {
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: 12,
    padding: "12px 14px",
  },
  caveatItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  caveatDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#D97706",
    flexShrink: 0,
    marginTop: 6,
  },
  caveatText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 1.6,
  },
  actionsRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "10px 8px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  followUpBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "12px",
    marginBottom: 12,
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  followUpInput: {
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    color: "#0F172A",
  },
  followUpBtn: {
    background: "#0D9488",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  resultDisclaimer: {
    fontSize: 10,
    color: "#94A3B8",
    lineHeight: 1.6,
    textAlign: "center" as const,
    borderTop: "1px solid #E2E8F0",
    paddingTop: 10,
  },
  errorCard: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 14,
    padding: "28px 20px",
    textAlign: "center" as const,
  },
  resetBtn: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    color: "#475569",
  },
};
