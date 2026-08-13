"use client";
/**
 * RelatedEvidencePanel.tsx
 * Save to: app/components/ward/RelatedEvidencePanel.tsx
 * Shows related PubMed evidence inside PatientJourney — after Workup section
 */

import React, { useState, useEffect } from "react";

interface EvidenceItem {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  relevance: string; // e.g. "High" | "Moderate"
}

interface RelatedEvidencePanelProps {
  templateId?: string;
  diagnosis: string;
  isPro: boolean;
  onUpgrade: () => void;
}

const T = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  teal: "#0D9488",
  blue: "#1E40AF",
  red: "#EF4444",
};

export default function RelatedEvidencePanel({
  templateId,
  diagnosis,
  isPro,
  onUpgrade,
}: RelatedEvidencePanelProps) {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    fetchEvidence();
  }, [expanded]);

  async function fetchEvidence() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (templateId) params.set("templateId", templateId);
      if (diagnosis) params.set("diagnosis", diagnosis);

      const res = await fetch(`/api/ward/case-evidence?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError("Could not load evidence.");
    } finally {
      setLoading(false);
    }
  }

  // Collapsed state — just a button
  if (!expanded) {
    return (
      <div
        style={{
          background: T.white,
          border: "1px solid " + T.border,
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          marginBottom: 4,
        }}
        onClick={() => {
          if (!isPro) { onUpgrade(); return; }
          setExpanded(true);
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📚</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              Related Evidence
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>
              PubMed · Guidelines · PRO
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!isPro && (
            <span style={{
              fontSize: 9, fontWeight: 800,
              background: T.blue, color: "#fff",
              borderRadius: 4, padding: "2px 6px",
            }}>
              PRO
            </span>
          )}
          <span style={{ color: T.muted, fontSize: 16 }}>→</span>
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div style={{
      background: T.white,
      border: "1px solid " + T.border,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid " + T.border,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📚</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Related Evidence
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: T.teal, border: "1px solid " + T.teal,
            borderRadius: 6, padding: "1px 6px",
          }}>
            PubMed
          </span>
        </div>
        <span style={{ color: T.muted, fontSize: 13 }}>↑ Close</span>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{
              width: 24, height: 24,
              border: "3px solid " + T.border,
              borderTop: "3px solid " + T.teal,
              borderRadius: "50%",
              margin: "0 auto 10px",
              animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontSize: 12, color: T.muted }}>
              Loading evidence...
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: T.red, padding: "12px 0" }}>
            {error}
            <button
              onClick={fetchEvidence}
              style={{
                marginLeft: 10, background: "none",
                border: "1px solid " + T.red,
                borderRadius: 6, color: T.red,
                fontSize: 11, padding: "2px 8px", cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ fontSize: 12, color: T.muted, padding: "12px 0", textAlign: "center" }}>
            No related evidence found for this case.
          </div>
        )}

        {!loading && items.map((item) => (
          <div key={item.pmid} style={{
            borderBottom: "1px solid " + T.border,
            paddingBottom: 12,
            marginBottom: 12,
          }}>
            {/* Relevance tag */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{
                fontSize: 9, fontWeight: 800,
                color: item.relevance === "High" ? T.teal : T.sub,
                border: "1px solid " + (item.relevance === "High" ? T.teal : T.border),
                borderRadius: 4, padding: "1px 6px",
              }}>
                {item.relevance} relevance
              </span>
              <span style={{ fontSize: 10, color: T.muted }}>{item.year}</span>
            </div>

            {/* Title */}
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: T.text, lineHeight: 1.4, marginBottom: 4,
            }}>
              {item.title}
            </div>

            {/* Meta */}
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>
              {item.authors} · {item.journal}
            </div>

            {/* PubMed link */}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12, fontWeight: 600,
                color: T.teal, textDecoration: "none",
              }}
            >
              View on PubMed →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
