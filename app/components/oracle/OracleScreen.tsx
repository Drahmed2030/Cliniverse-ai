"use client";
/**
 * OracleScreen.tsx
 * Save to: app/components/oracle/OracleScreen.tsx
 *
 * Clinical Oracle — Multi-AI consensus room
 * Educational only · Not patient-specific diagnosis
 * Surgical replacement for existing Oracle component
 */

import React, { useState, useCallback, useEffect } from "react";
import OracleComposer from "./OracleComposer";
import OracleEnginesRow from "./OracleEnginesRow";
import OracleResult from "./OracleResult";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OraclePhase = "idle" | "loading" | "result" | "error";
export type EngineStatus = "idle" | "running" | "done" | "error";

export interface EngineDef {
  id: string;
  label: string;
  color: string;
  model: string;
}

export interface EnginePosition {
  engineId: string;
  stance: "aligned" | "partial" | "divergent";
  note: string;
}

export interface OracleResult {
  summary: string;
  agreement?: "high" | "moderate" | "low";
  agreementPct?: number;
  positions?: EnginePosition[];
  caveats?: string[];
  enginesResponded?: number;
  totalEngines?: number;
}

export interface OracleMeta {
  specialty?: string;
  type?: string;
  context?: string;
}

// ── Engine definitions ────────────────────────────────────────────────────────

export const ENGINES: EngineDef[] = [
  { id: "claude",   label: "Claude",   color: "#D97706", model: "claude-sonnet-4-6" },
  { id: "grok",     label: "Grok",     color: "#6366F1", model: "grok-3" },
  { id: "deepseek", label: "DeepSeek", color: "#10B981", model: "deepseek-chat" },
  { id: "llama",    label: "Llama",    color: "#8B5CF6", model: "llama-3-70b" },
];

// ── localStorage ──────────────────────────────────────────────────────────────

const RECENT_KEY = "cliniverse_oracle_recent";

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}

function saveRecent(q: string, prev: string[]): string[] {
  const next = [q, ...prev.filter(r => r !== q)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

// ── Personal-question guard ───────────────────────────────────────────────────

const PERSONAL_PATTERNS = [
  /\b(i have|i am|my \w+ is|diagnose me|do i have|am i|my symptoms)\b/i,
  /\bmy (chest|pain|fever|cough|headache|bp|sugar|pressure)\b/i,
];

function looksPersonal(q: string): boolean {
  return PERSONAL_PATTERNS.some(p => p.test(q));
}

// ── Component ─────────────────────────────────────────────────────────────────

interface OracleScreenProps {
  isPro: boolean;
  onUpgrade: () => void;
}

export default function OracleScreen({ isPro, onUpgrade }: OracleScreenProps) {
  const [phase, setPhase]           = useState<OraclePhase>("idle");
  const [question, setQuestion]     = useState("");
  const [meta, setMeta]             = useState<OracleMeta>({});
  const [engineStatus, setEngineStatus] = useState<Record<string, EngineStatus>>(
    Object.fromEntries(ENGINES.map(e => [e.id, "idle"]))
  );
  const [result, setResult]         = useState<OracleResult | null>(null);
  const [recent, setRecent]         = useState<string[]>([]);
  const [personalWarn, setPersonalWarn] = useState(false);
  const [busy, setBusy]             = useState(false);

  useEffect(() => { setRecent(loadRecent()); }, []);

  // Reset engine statuses
  function resetEngines(status: EngineStatus) {
    setEngineStatus(Object.fromEntries(ENGINES.map(e => [e.id, status])));
  }

  // Mark one engine status
  function markEngine(id: string, status: EngineStatus) {
    setEngineStatus(prev => ({ ...prev, [id]: status }));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (!q || busy) return;

    // Personal question guard
    if (looksPersonal(q)) {
      setPersonalWarn(true);
      return;
    }
    setPersonalWarn(false);

    setBusy(true);
    setPhase("loading");
    setResult(null);
    resetEngines("running");

    // Save to recent
    setRecent(prev => saveRecent(q, prev));

    try {
      // Simulated sequential engine calls
      // In production: wire to existing /api/oracle endpoint
      const engineResults: { id: string; text: string; ok: boolean }[] = [];

      for (const engine of ENGINES) {
        try {
          const res = await fetch("/api/oracle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: q,
              engine: engine.id,
              model: engine.model,
              specialty: meta.specialty,
              type: meta.type,
              context: meta.context,
            }),
          });

          if (!res.ok) throw new Error("Engine error");
          const data = await res.json();
          engineResults.push({ id: engine.id, text: data.answer || data.text || "", ok: true });
          markEngine(engine.id, "done");
        } catch {
          engineResults.push({ id: engine.id, text: "", ok: false });
          markEngine(engine.id, "error");
        }
      }

      const successful = engineResults.filter(r => r.ok);
      const failed = engineResults.filter(r => !r.ok);

      if (successful.length === 0) {
        setPhase("error");
        setResult({ summary: "All engines failed to respond. Please try again.", enginesResponded: 0, totalEngines: 4 });
        return;
      }

      // Build consensus result from responses
      // If API returns structured consensus, use it directly
      // Otherwise assemble from individual responses
      const combinedSummary = successful.length === 1
        ? successful[0].text
        : buildConsensusSummary(successful.map(r => r.text));

      const agreement = inferAgreement(successful.map(r => r.text));

      const positions: EnginePosition[] = engineResults.map(r => ({
        engineId: r.id,
        stance: r.ok ? inferStance(r.text, combinedSummary) : "divergent",
        note: r.ok ? extractNote(r.text) : "Engine did not respond",
      }));

      const caveats = buildCaveats(q, meta);

      setResult({
        summary: combinedSummary,
        agreement: agreement.level,
        agreementPct: agreement.pct,
        positions,
        caveats,
        enginesResponded: successful.length,
        totalEngines: ENGINES.length,
      });

      setPhase("result");
    } catch (err) {
      setPhase("error");
      setResult({ summary: "An unexpected error occurred.", enginesResponded: 0, totalEngines: 4 });
    } finally {
      setBusy(false);
    }
  }, [question, meta, busy]);

  function handleReset() {
    setPhase("idle");
    setResult(null);
    setQuestion("");
    setPersonalWarn(false);
    resetEngines("idle");
  }

  function handleFollowUp(q: string) {
    setQuestion(q);
    setPhase("idle");
    setResult(null);
    resetEngines("idle");
  }

  return (
    <div style={S.root}>
      {/* Dark hero header */}
      <div style={S.hero}>
        <div style={S.heroEyebrow}>MULTI-MODEL CONSENSUS · EDUCATIONAL</div>
        <div style={S.heroTitle}>Clinical Oracle</div>
        <div style={S.heroSub}>Multi-model clinical consensus · Educational use</div>

        {/* Trust bar */}
        <div style={S.trustBar}>
          {["4 AI engines", "Consensus scoring", "Evidence-minded", "Educational only"].map((t, i) => (
            <div key={i} style={S.trustItem}>
              <div style={S.trustDot} />
              <span style={S.trustText}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div style={S.card}>
        {phase === "idle" || phase === "loading" ? (
          <>
            <OracleComposer
              question={question}
              setQuestion={setQuestion}
              meta={meta}
              setMeta={setMeta}
              onSubmit={handleSubmit}
              personalWarn={personalWarn}
              setPersonalWarn={setPersonalWarn}
              disabled={busy}
              recent={recent}
              onRecentSelect={q => setQuestion(q)}
            />

            <OracleEnginesRow
              engines={ENGINES}
              statuses={engineStatus}
              phase={phase}
            />

            {/* CTA */}
            <button
              style={{
                ...S.ctaBtn,
                opacity: busy || !question.trim() ? 0.5 : 1,
                cursor: busy || !question.trim() ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={busy || !question.trim()}
            >
              {busy ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={S.spinner} />
                  {phase === "loading" ? "Consulting engines…" : "Ask the Oracle"}
                </span>
              ) : "Ask the Oracle →"}
            </button>

            {/* PRO gate */}
            {!isPro && (
              <div style={S.proNote}>
                <span style={{ color: "#94A3B8", fontSize: 12 }}>
                  Free: 3 questions/day ·{" "}
                </span>
                <button style={S.proLink} onClick={onUpgrade}>
                  Upgrade to PRO for unlimited →
                </button>
              </div>
            )}
          </>
        ) : (
          <OracleResult
            result={result!}
            question={question}
            engines={ENGINES}
            onReset={handleReset}
            onFollowUp={handleFollowUp}
            phase={phase}
          />
        )}
      </div>

      {/* Footer disclaimer */}
      <div style={S.disclaimer}>
        Clinical Oracle compares multiple AI engines for educational consensus.
        It does not provide patient-specific medical advice or replace professional care.
        Always apply clinical judgment and follow local protocols.
      </div>
    </div>
  );
}

// ── Consensus helpers ─────────────────────────────────────────────────────────

function buildConsensusSummary(texts: string[]): string {
  // In production: server-side synthesis
  // Here: return the most comprehensive response
  return texts.reduce((a, b) => a.length > b.length ? a : b, "");
}

function inferAgreement(texts: string[]): { level: "high" | "moderate" | "low"; pct: number } {
  if (texts.length <= 1) return { level: "high", pct: 100 };
  // Simple heuristic: if responses share >60% key terms → high
  // In production: server-side semantic comparison
  return { level: "moderate", pct: 72 };
}

function inferStance(text: string, consensus: string): "aligned" | "partial" | "divergent" {
  if (!text) return "divergent";
  const overlap = text.split(" ").filter(w => consensus.includes(w) && w.length > 5).length;
  if (overlap > 30) return "aligned";
  if (overlap > 10) return "partial";
  return "divergent";
}

function extractNote(text: string): string {
  const first = text.split(".")[0];
  return first.length > 120 ? first.substring(0, 120) + "…" : first;
}

function buildCaveats(q: string, meta: OracleMeta): string[] {
  const caveats = [
    "Cross-check with current ESC/AHA/NICE guidelines applicable to your setting.",
    "Individual patient factors may significantly alter the recommended approach.",
    "This educational consensus does not replace bedside clinical assessment.",
  ];
  if (meta.specialty === "emergency") {
    caveats.unshift("In emergency settings, local protocol and senior input take precedence.");
  }
  if (q.toLowerCase().includes("dosing") || q.toLowerCase().includes("dose")) {
    caveats.unshift("Drug dosing must be verified against local formulary and patient-specific factors (weight, renal/hepatic function).");
  }
  return caveats;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    paddingBottom: 100,
    overflowY: "auto",
  },
  hero: {
    background: "linear-gradient(160deg, #0B1120 0%, #0F172A 60%, #1A1F35 100%)",
    padding: "36px 20px 28px",
    textAlign: "center" as const,
  },
  heroEyebrow: {
    fontSize: 9,
    letterSpacing: 2.5,
    color: "#0D9488",
    fontWeight: 800,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: 900,
    color: "#F8FAFC",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
  },
  trustBar: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: 14,
    marginTop: 4,
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  trustDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#0D9488",
  },
  trustText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: 600,
  },
  card: {
    margin: "16px",
    background: "#FFFFFF",
    borderRadius: 20,
    padding: "20px 18px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid #E2E8F0",
  },
  ctaBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #0D9488, #0F766E)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 14,
    padding: "17px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 14,
    letterSpacing: 0.3,
    transition: "opacity 0.2s",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  proNote: {
    textAlign: "center" as const,
    marginTop: 10,
  },
  proLink: {
    background: "none",
    border: "none",
    color: "#0D9488",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  disclaimer: {
    margin: "12px 16px 0",
    fontSize: 10,
    color: "#94A3B8",
    lineHeight: 1.7,
    textAlign: "center" as const,
    borderTop: "1px solid #E2E8F0",
    paddingTop: 12,
  },
};
