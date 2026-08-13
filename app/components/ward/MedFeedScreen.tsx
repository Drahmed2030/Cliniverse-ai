"use client";
/**
 * MedFeedScreen.tsx
 * Save to: app/components/ward/MedFeedScreen.tsx
 * Signal — live PubMed feed with AI summary
 * Design: Light 2026 system (matches Ward)
 */

import React, { useState, useEffect, useCallback } from "react";

interface FeedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  isNew: boolean;
  specialty: string;
  aiSignal?: string;
  loadingSignal?: boolean;
}

interface MedFeedScreenProps {
  isPro: boolean;
  onUpgrade: () => void;
  onBack: () => void;
}

const SPECIALTIES = [
  { id: "all", label: "All", icon: "📡" },
  { id: "cardiology", label: "Cardiology", icon: "❤️" },
  { id: "emergency", label: "Emergency", icon: "🚨" },
  { id: "internal", label: "Internal Med", icon: "🏥" },
  { id: "neurology", label: "Neurology", icon: "🧠" },
  { id: "surgery", label: "Surgery", icon: "⚕️" },
];

const SPECIALTY_TERMS: Record<string, string> = {
  all: "clinical guidelines 2025 2026",
  cardiology: "cardiology heart failure SGLT2 guidelines",
  emergency: "emergency medicine resuscitation guidelines",
  internal: "internal medicine diabetes hypertension guidelines",
  neurology: "neurology stroke management guidelines",
  surgery: "surgery perioperative guidelines",
};

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
  redBg: "#FEF2F2",
};

export default function MedFeedScreen({ isPro, onUpgrade, onBack }: MedFeedScreenProps) {
  const [activeSpecialty, setActiveSpecialty] = useState("all");
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (specialty: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/medfeed?specialty=${specialty}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setArticles(data.items || []);
    } catch {
      setError("Could not load feed. Check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(activeSpecialty);
  }, [activeSpecialty, fetchFeed]);

  async function handleAISignal(pmid: string) {
    if (!isPro) { onUpgrade(); return; }
    setArticles((prev) =>
      prev.map((a) => a.pmid === pmid ? { ...a, loadingSignal: true } : a)
    );
    try {
      const article = articles.find((a) => a.pmid === pmid);
      const res = await fetch("/api/medfeed/ai-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pmid, title: article?.title }),
      });
      const data = await res.json();
      setArticles((prev) =>
        prev.map((a) =>
          a.pmid === pmid
            ? { ...a, aiSignal: data.signal || "No signal available", loadingSignal: false }
            : a
        )
      );
    } catch {
      setArticles((prev) =>
        prev.map((a) =>
          a.pmid === pmid ? { ...a, loadingSignal: false } : a
        )
      );
    }
  }

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={onBack} style={S.backBtn}>← Ward</button>
        <div style={S.headerTitle}>Signal</div>
        <div style={S.liveTag}>
          <div style={S.liveDot} />
          LIVE
        </div>
      </div>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroEyebrow}>LIVE · PUBMED · UPDATED DAILY</div>
        <div style={S.heroTitle}>Signal</div>
        <div style={S.heroSub}>Medical intelligence · Evidence-based · Real-time</div>
      </div>

      {/* Breaking banner — static for now */}
      <div style={S.breaking}>
        <span style={S.breakingTag}>BREAKING</span>
        <span style={S.breakingText}>ESC 2026: New HFrEF guidelines — SGLT2i now first-line</span>
        <span style={S.breakingTime}>2h ago</span>
      </div>

      {/* Specialty filter */}
      <div style={S.filterScroll}>
        {SPECIALTIES.map((sp) => (
          <button
            key={sp.id}
            style={{
              ...S.filterChip,
              ...(activeSpecialty === sp.id ? S.filterChipActive : {}),
            }}
            onClick={() => setActiveSpecialty(sp.id)}
          >
            {sp.icon} {sp.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={S.feed}>
        {loading && (
          <div style={S.stateBlock}>
            <div style={S.spinner} />
            <div style={S.stateText}>Loading latest evidence...</div>
          </div>
        )}

        {error && (
          <div style={S.errorBlock}>
            <div style={S.errorText}>{error}</div>
            <button style={S.retryBtn} onClick={() => fetchFeed(activeSpecialty)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div style={S.stateBlock}>
            <div style={S.stateText}>No articles found for this specialty.</div>
          </div>
        )}

        {!loading && articles.map((article, idx) => (
          <div key={article.pmid} style={{
            ...S.articleCard,
            borderLeftColor: idx === 0 ? T.teal : T.border,
            borderLeftWidth: idx === 0 ? 3 : 1,
          }}>
            {/* Tags */}
            <div style={S.articleTags}>
              <span style={S.tagPubmed}>PubMed</span>
              <span style={S.tagYear}>{article.year}</span>
              {article.isNew && <span style={S.tagNew}>NEW</span>}
              <button style={S.pinBtn} title="Save">📌</button>
            </div>

            {/* Title */}
            <div style={S.articleTitle}>{article.title}</div>

            {/* Authors */}
            <div style={S.articleMeta}>
              {article.authors} · {article.journal}
            </div>

            {/* AI Signal expanded */}
            {article.aiSignal && (
              <div style={S.signalBox}>
                <div style={S.signalLabel}>🤖 AI Signal</div>
                <div style={S.signalText}>{article.aiSignal}</div>
              </div>
            )}

            {/* Actions */}
            <div style={S.articleActions}>
              <button
                style={S.btnSignal}
                onClick={() => handleAISignal(article.pmid)}
                disabled={article.loadingSignal}
              >
                {article.loadingSignal ? "..." : "🤖 AI Signal"}
                {!isPro && <span style={S.proBadge}>PRO</span>}
              </button>
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={S.btnPubmed}
              >
                PubMed →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: T.bg,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    paddingBottom: 100,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: T.white,
    borderBottom: "1px solid " + T.border,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: T.sub,
    fontSize: 15,
    cursor: "pointer",
    padding: "4px 0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: T.text,
  },
  liveTag: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    color: T.teal,
    letterSpacing: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: T.teal,
    animation: "pulse 2s infinite",
  },
  hero: {
    background: "linear-gradient(160deg, #0F172A 0%, #1E293B 100%)",
    padding: "28px 20px 24px",
    position: "relative" as const,
  },
  heroEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: T.teal,
    fontWeight: 700,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 900,
    color: "#F8FAFC",
    letterSpacing: -1,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: "#94A3B8",
  },
  breaking: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#FFF5F5",
    borderBottom: "1px solid #FECACA",
    padding: "10px 16px",
    flexWrap: "wrap" as const,
  },
  breakingTag: {
    fontSize: 9,
    fontWeight: 800,
    color: T.red,
    border: "1.5px solid " + T.red,
    borderRadius: 4,
    padding: "2px 6px",
    letterSpacing: 1,
    flexShrink: 0,
  },
  breakingText: {
    fontSize: 13,
    fontWeight: 600,
    color: T.text,
    flex: 1,
  },
  breakingTime: {
    fontSize: 11,
    color: T.muted,
    flexShrink: 0,
  },
  filterScroll: {
    display: "flex",
    gap: 8,
    padding: "14px 16px",
    overflowX: "auto" as const,
    background: T.white,
    borderBottom: "1px solid " + T.border,
    WebkitOverflowScrolling: "touch" as unknown as undefined,
  },
  filterChip: {
    flexShrink: 0,
    background: T.bg,
    border: "1px solid " + T.border,
    borderRadius: 99,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: T.sub,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  filterChipActive: {
    background: T.teal,
    color: "#fff",
    border: "1px solid " + T.teal,
    fontWeight: 700,
  },
  feed: {
    padding: "16px",
  },
  stateBlock: {
    textAlign: "center" as const,
    padding: "48px 20px",
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid " + T.border,
    borderTop: "3px solid " + T.teal,
    borderRadius: "50%",
    margin: "0 auto 14px",
    animation: "spin 0.8s linear infinite",
  },
  stateText: {
    fontSize: 14,
    color: T.muted,
  },
  errorBlock: {
    background: T.redBg,
    border: "1px solid #FECACA",
    borderRadius: 14,
    padding: "16px",
    textAlign: "center" as const,
  },
  errorText: {
    fontSize: 14,
    color: T.red,
    marginBottom: 10,
  },
  retryBtn: {
    background: T.red,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 20px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  articleCard: {
    background: T.white,
    borderRadius: 16,
    border: "1px solid " + T.border,
    borderLeft: "3px solid " + T.teal,
    padding: "16px",
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  articleTags: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  tagPubmed: {
    fontSize: 10,
    fontWeight: 700,
    color: T.teal,
    border: "1px solid " + T.teal,
    borderRadius: 6,
    padding: "2px 7px",
  },
  tagYear: {
    fontSize: 10,
    fontWeight: 700,
    color: T.blue,
    border: "1px solid " + T.blue,
    borderRadius: 6,
    padding: "2px 7px",
  },
  tagNew: {
    fontSize: 10,
    fontWeight: 700,
    color: "#D97706",
    border: "1px solid #D97706",
    borderRadius: 6,
    padding: "2px 7px",
  },
  pinBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    padding: 0,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: T.text,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  articleMeta: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  signalBox: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: 10,
    padding: "10px 12px",
    marginBottom: 12,
  },
  signalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#065F46",
    marginBottom: 4,
  },
  signalText: {
    fontSize: 13,
    color: "#047857",
    lineHeight: 1.5,
  },
  articleActions: {
    display: "flex",
    gap: 8,
  },
  btnSignal: {
    flex: 1,
    background: T.bg,
    border: "1px solid " + T.border,
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: T.text,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  proBadge: {
    fontSize: 9,
    fontWeight: 800,
    background: T.blue,
    color: "#fff",
    borderRadius: 4,
    padding: "1px 5px",
  },
  btnPubmed: {
    flex: 1,
    background: T.bg,
    border: "1px solid " + T.border,
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: T.sub,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
