"use client";
/**
 * OracleEnginesRow.tsx
 * Save to: app/components/oracle/OracleEnginesRow.tsx
 * Live engine status row — idle / running / done / error
 * Animated: opacity + pulse only (no layout jump)
 */

import React from "react";
import type { EngineDef, EngineStatus, OraclePhase } from "./OracleScreen";

interface OracleEnginesRowProps {
  engines: EngineDef[];
  statuses: Record<string, EngineStatus>;
  phase: OraclePhase;
}

const STATUS_CONFIG = {
  idle:    { label: "Ready",     dot: "#CBD5E1", pulse: false },
  running: { label: "Thinking…", dot: "#F59E0B", pulse: true  },
  done:    { label: "Done",      dot: "#10B981", pulse: false },
  error:   { label: "Timeout",   dot: "#EF4444", pulse: false },
};

export default function OracleEnginesRow({ engines, statuses, phase }: OracleEnginesRowProps) {
  const doneCount = Object.values(statuses).filter(s => s === "done").length;
  const runningCount = Object.values(statuses).filter(s => s === "running").length;

  return (
    <div style={S.root}>
      {/* Section label */}
      <div style={S.header}>
        <div style={S.label}>AI ENGINES</div>
        {phase === "loading" && (
          <div style={S.synth}>
            {runningCount > 0
              ? `Consulting engines…`
              : doneCount > 0
              ? "Synthesizing consensus…"
              : ""}
          </div>
        )}
        {phase === "idle" && (
          <div style={S.synth}>All engines ready</div>
        )}
      </div>

      {/* Engine cards */}
      <div style={S.enginesGrid}>
        {engines.map((engine) => {
          const status = statuses[engine.id] || "idle";
          const cfg = STATUS_CONFIG[status];

          return (
            <div
              key={engine.id}
              style={{
                ...S.engineCard,
                borderColor: status === "done"
                  ? "#BBF7D0"
                  : status === "error"
                  ? "#FECACA"
                  : status === "running"
                  ? engine.color + "40"
                  : "#E2E8F0",
                background: status === "done"
                  ? "#F0FDF4"
                  : status === "error"
                  ? "#FEF2F2"
                  : status === "running"
                  ? engine.color + "08"
                  : "#FAFBFC",
                opacity: status === "error" ? 0.7 : 1,
                transition: "all 0.25s ease",
              }}
            >
              {/* Engine color bar */}
              <div style={{
                width: 3,
                alignSelf: "stretch",
                borderRadius: 99,
                background: engine.color,
                opacity: status === "idle" ? 0.3 : 1,
                flexShrink: 0,
              }} />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: status === "idle" ? "#94A3B8" : "#0F172A",
                  marginBottom: 2,
                }}>
                  {engine.label}
                </div>
                <div style={{
                  fontSize: 10,
                  color: status === "done" ? "#059669"
                    : status === "error" ? "#DC2626"
                    : status === "running" ? "#D97706"
                    : "#CBD5E1",
                  fontWeight: 600,
                }}>
                  {cfg.label}
                </div>
              </div>

              {/* Status dot */}
              <div style={{ position: "relative" as const, flexShrink: 0 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: cfg.dot,
                  transition: "background 0.25s",
                }} />
                {cfg.pulse && (
                  <div style={{
                    position: "absolute" as const,
                    inset: -3,
                    borderRadius: "50%",
                    border: "2px solid " + cfg.dot,
                    opacity: 0.4,
                    animation: "ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }} />
                )}
              </div>

              {/* Done checkmark */}
              {status === "done" && (
                <div style={{ fontSize: 14, color: "#10B981", flexShrink: 0 }}>✓</div>
              )}
              {status === "error" && (
                <div style={{ fontSize: 14, color: "#EF4444", flexShrink: 0 }}>✗</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Partial response note */}
      {phase === "result" && (
        <div style={S.partialNote}>
          {doneCount} of {engines.length} engines responded
          {doneCount < engines.length && (
            <span style={{ color: "#EF4444", marginLeft: 6 }}>
              · {engines.length - doneCount} timed out
            </span>
          )}
        </div>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    marginBottom: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#94A3B8",
    fontWeight: 800,
  },
  synth: {
    fontSize: 11,
    color: "#0D9488",
    fontWeight: 600,
  },
  enginesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  engineCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "10px 12px",
    transition: "all 0.25s ease",
  },
  partialNote: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center" as const,
    marginTop: 8,
    fontWeight: 600,
  },
};
