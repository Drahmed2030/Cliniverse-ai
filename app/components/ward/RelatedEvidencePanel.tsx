"use client";

import React, { useState, useEffect } from "react";

interface EvidenceItem {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  relevance: string;
}

interface RelatedEvidencePanelProps {
  templateId?: string;
  diagnosis: string;
  isPro: boolean;
}

const T = {
  white: "#111827",
  text: "#F8FAFC",
  sub: "#CBD5E1",
  muted: "#94A3B8",
  border: "rgba(148,163,184,0.20)",
  teal: "#2DD4BF",
  blue: "#60A5FA",
  red: "#F87171",
};

export default function RelatedEvidencePanel({
  templateId,
  diagnosis,
  isPro,
}: RelatedEvidencePanelProps) {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded || !isPro) return;
    void fetchEvidence();
  }, [expanded, isPro]);

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

  if (!expanded) {
    return (
      <button
        type="button"
        disabled={!isPro}
        onClick={() => {
          if (isPro) setExpanded(true);
        }}
        style={{
          width: "100%",
          background: T.white,
          border: "1px solid " + T.border,
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: isPro ? "pointer" : "default",
          marginBottom: 4,
          textAlign: "left",
          opacity: isPro ? 1 : 0.78,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📚</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              Related Evidence
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>
              {isPro ? "PubMed · Guidelines" : "Release-gated for this account"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!isPro && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              background: T.blue,
              color: "#fff",
              borderRadius: 4,
              padding: "2px 6px",
            }}>
              GATED
            </span>
          )}
          {isPro && <span style={{ color: T.muted, fontSize: 16 }}>→</span>}
        </div>
      </button>
    );
  }

  return (
    <div style={{
      background: T.white,
      border: "1px solid " + T.border,
      borderRadius: 14,
      overflow: "hidden",
    }}>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Related Evidence</div>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, border: "1px solid " + T.teal, borderRadius: 6, padding: "1px 6px" }}>
            PubMed
          </span>
        </div>
        <span style={{ color: T.muted, fontSize: 13 }}>↑ Close</span>
      </div>

      <div style={{ padding: "12px 14px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 24, height: 24, border: "3px solid " + T.border, borderTop: "3px solid " + T.teal, borderRadius: "50%", margin: "0 auto 10px" }} />
            <div style={{ fontSize: 12, color: T.muted }}>Loading evidence...</div>
          </div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: T.red, padding: "12px 0" }}>
            {error}
            <button type="button" onClick={() => void fetchEvidence()} style={{ marginLeft: 10, background: "none", border: "1px solid " + T.red, borderRadius: 6, color: T.red, fontSize: 11, padding: "2px 8px", cursor: "pointer" }}>
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
          <div key={item.pmid} style={{ borderBottom: "1px solid " + T.border, paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: item.relevance === "High" ? T.teal : T.sub, border: "1px solid " + (item.relevance === "High" ? T.teal : T.border), borderRadius: 4, padding: "1px 6px" }}>
                {item.relevance} relevance
              </span>
              <span style={{ fontSize: 10, color: T.muted }}>{item.year}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.4, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{item.authors} · {item.journal}</div>
            <a href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: T.teal, textDecoration: "none" }}>
              View on PubMed →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
