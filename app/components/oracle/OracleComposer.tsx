"use client";
/**
 * OracleComposer.tsx
 * Save to: app/components/oracle/OracleComposer.tsx
 * Question input, example chips, optional meta, recent questions
 */

import React, { useState, useRef, useEffect } from "react";
import type { OracleMeta } from "./OracleScreen";

interface OracleComposerProps {
  question: string;
  setQuestion: (q: string) => void;
  meta: OracleMeta;
  setMeta: (m: OracleMeta) => void;
  onSubmit: () => void;
  personalWarn: boolean;
  setPersonalWarn: (v: boolean) => void;
  disabled: boolean;
  recent: string[];
  onRecentSelect: (q: string) => void;
}

const EXAMPLE_CHIPS = [
  "LMWH vs UFH in STEMI",
  "First-line rate control in AF with HF",
  "When to prefer PCI-capable transfer",
  "GDMT foundational four in HFrEF",
];

const SPECIALTIES = ["Cardiology", "Emergency", "Internal Medicine", "Surgery", "Neurology", "Other"];
const QUESTION_TYPES = ["Drug choice", "Clinical pathway", "Differential diagnosis", "Dosing education", "Guidelines review"];

const T = {
  text: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  teal: "#0D9488",
  bg: "#F8FAFC",
  amber: "#F59E0B",
};

export default function OracleComposer({
  question, setQuestion, meta, setMeta,
  onSubmit, personalWarn, setPersonalWarn,
  disabled, recent, onRecentSelect,
}: OracleComposerProps) {
  const [metaOpen, setMetaOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(100, textareaRef.current.scrollHeight) + "px";
    }
  }, [question]);

  function handleChip(chip: string) {
    setQuestion(chip);
    setPersonalWarn(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!disabled && question.trim()) onSubmit();
    }
  }

  return (
    <div>
      {/* Composer label */}
      <div style={S.label}>YOUR CLINICAL QUESTION</div>

      {/* Textarea */}
      <div style={{
        ...S.textareaWrap,
        borderColor: personalWarn ? T.amber : question.length > 0 ? T.teal : T.border,
        boxShadow: question.length > 0 ? "0 0 0 3px " + T.teal + "18" : "none",
      }}>
        <textarea
          ref={textareaRef}
          value={question}
          onChange={e => { setQuestion(e.target.value); setPersonalWarn(false); }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a focused clinical question (guidelines, differentials, drug choice…)"
          disabled={disabled}
          style={S.textarea}
          rows={4}
        />
        {question.length > 0 && (
          <div style={S.charHint}>{question.length} · ⌘↵ to submit</div>
        )}
      </div>

      {/* Personal question warning */}
      {personalWarn && (
        <div style={S.warnBanner}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 2 }}>
              Frame as an educational clinical scenario
            </div>
            <div style={{ fontSize: 12, color: "#A16207" }}>
              Clinical Oracle provides educational consensus — not personal medical advice. 
              Try: "In a patient with… what is the recommended approach to…?"
            </div>
          </div>
        </div>
      )}

      {/* Example chips */}
      <div style={S.chipsSection}>
        <div style={S.chipsLabel}>QUICK EXAMPLES</div>
        <div style={S.chips}>
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip}
              style={{
                ...S.chip,
                background: question === chip ? T.teal + "15" : T.bg,
                borderColor: question === chip ? T.teal : T.border,
                color: question === chip ? T.teal : T.sub,
              }}
              onClick={() => handleChip(chip)}
              disabled={disabled}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced meta (collapsed by default) */}
      <button
        style={S.metaToggle}
        onClick={() => setMetaOpen(!metaOpen)}
      >
        <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
          {metaOpen ? "▲" : "▼"} Advanced options
          {(meta.specialty || meta.type) && (
            <span style={{ color: T.teal, marginLeft: 6 }}>
              {[meta.specialty, meta.type].filter(Boolean).join(" · ")}
            </span>
          )}
        </span>
      </button>

      {metaOpen && (
        <div style={S.metaPanel}>
          {/* Specialty */}
          <div style={S.metaRow}>
            <div style={S.metaLabel}>Specialty</div>
            <div style={S.metaOptions}>
              {SPECIALTIES.map(s => (
                <button
                  key={s}
                  style={{
                    ...S.metaChip,
                    background: meta.specialty === s ? T.teal : T.bg,
                    color: meta.specialty === s ? "#fff" : T.sub,
                    borderColor: meta.specialty === s ? T.teal : T.border,
                  }}
                  onClick={() => setMeta({ ...meta, specialty: meta.specialty === s ? undefined : s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question type */}
          <div style={S.metaRow}>
            <div style={S.metaLabel}>Question type</div>
            <div style={S.metaOptions}>
              {QUESTION_TYPES.map(t => (
                <button
                  key={t}
                  style={{
                    ...S.metaChip,
                    background: meta.type === t ? T.teal : T.bg,
                    color: meta.type === t ? "#fff" : T.sub,
                    borderColor: meta.type === t ? T.teal : T.border,
                  }}
                  onClick={() => setMeta({ ...meta, type: meta.type === t ? undefined : t })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Educational context */}
          <div style={S.metaRow}>
            <div style={S.metaLabel}>Educational context <span style={{ color: T.muted }}>(no identifiers)</span></div>
            <input
              style={S.contextInput}
              placeholder="e.g. post-MI day 3, eGFR 35, on warfarin…"
              value={meta.context || ""}
              onChange={e => setMeta({ ...meta, context: e.target.value })}
              maxLength={200}
            />
          </div>
        </div>
      )}

      {/* Recent questions */}
      {recent.length > 0 && (
        <div style={S.recentSection}>
          <div style={S.chipsLabel}>RECENT</div>
          {recent.map((r, i) => (
            <button
              key={i}
              style={S.recentItem}
              onClick={() => onRecentSelect(r)}
              disabled={disabled}
            >
              <span style={{ fontSize: 12, marginRight: 6 }}>🕐</span>
              <span style={{ fontSize: 12, color: T.sub, flex: 1, textAlign: "left" as const }}>{r}</span>
              <span style={{ fontSize: 10, color: T.muted }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* Evidence hint */}
      <div style={S.evidenceHint}>
        💡 Cross-check ESC · AHA · NICE guidelines when applicable to your setting
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#94A3B8",
    fontWeight: 800,
    marginBottom: 8,
  },
  textareaWrap: {
    border: "1.5px solid #E2E8F0",
    borderRadius: 14,
    background: "#FAFBFC",
    padding: "2px 4px 2px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    position: "relative" as const,
    marginBottom: 12,
  },
  textarea: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 15,
    color: "#0F172A",
    lineHeight: 1.7,
    padding: "10px 12px",
    resize: "none" as const,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    minHeight: 100,
    boxSizing: "border-box" as const,
  },
  charHint: {
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "right" as const,
    padding: "0 12px 8px",
  },
  warnBanner: {
    display: "flex",
    gap: 10,
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  chipsSection: {
    marginBottom: 12,
  },
  chipsLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#94A3B8",
    fontWeight: 800,
    marginBottom: 6,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
  },
  chip: {
    border: "1px solid #E2E8F0",
    borderRadius: 99,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  },
  metaToggle: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 0",
    marginBottom: 4,
  },
  metaPanel: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "14px",
    marginBottom: 12,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  metaRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#475569",
    letterSpacing: 0.5,
  },
  metaOptions: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 5,
  },
  metaChip: {
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  contextInput: {
    width: "100%",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "#0F172A",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  recentSection: {
    marginBottom: 10,
  },
  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
    background: "none",
    border: "none",
    borderBottom: "1px solid #F1F5F9",
    padding: "9px 0",
    cursor: "pointer",
  },
  evidenceHint: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center" as const,
    padding: "8px 0 2px",
  },
};
