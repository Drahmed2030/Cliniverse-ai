"use client";
/**
 * CodeLabHub.tsx
 * Entry: Ward tab → Code Lab button
 * Design: dark mode (#0B1220) — intentionally separate from app Light 2026 system
 * Disclaimer: permanent footer, every screen
 */

import React, { useState, useEffect } from "react";
import { BLS_LESSONS, BLS_DISCLAIMER } from "../../lib/codelab/blsLessons";
import { ACLS_LESSONS, ACLS_DISCLAIMER } from "../../lib/codelab/aclsLessons";
import BLSLessonPlayer from "./BLSLessonPlayer";

interface CodeLabHubProps {
  isPro: boolean;
  onUpgrade: () => void;
  onBack: () => void;
}

interface TrackProgress {
  completedIds: string[];
}

function loadProgress(): TrackProgress {
  if (typeof window === "undefined") return { completedIds: [] };
  try {
    const raw = localStorage.getItem("codelab_bls_progress");
    return raw ? JSON.parse(raw) : { completedIds: [] };
  } catch {
    return { completedIds: [] };
  }
}

const TRACKS = [
  {
    id: "bls",
    label: "BLS Track",
    icon: "❤️",
    desc: "High-quality CPR, AED, airway — fundamentals that save the first minutes",
    lessonCount: 6,
    available: true,
  },
  {
    id: "acls",
    label: "ACLS Track",
    icon: "⚡",
    desc: "Arrest algorithms, peri-arrest, team roles — think in the code",
    lessonCount: 6,
    available: true,
  },
  {
    id: "megacode",
    label: "Megacode",
    icon: "🔴",
    desc: "Run a full simulated code with timer, roles, and debrief",
    lessonCount: 0,
    available: false,
  },
  {
    id: "drills",
    label: "Rhythm Drills",
    icon: "📊",
    desc: "2–4 minute daily skills under pressure",
    lessonCount: 0,
    available: false,
  },
];

export default function CodeLabHub({ isPro, onUpgrade, onBack }: CodeLabHubProps) {
  const [progress, setProgress] = useState<TrackProgress>({ completedIds: [] });
  const [activeTrack, setActiveTrack] = useState<"bls" | "acls">("bls");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completedCount = progress.completedIds.length;
  const totalBLS = BLS_LESSONS.length;
  const pct = Math.round((completedCount / totalBLS) * 100);

  // PRO gate: free = lessons 1–2 only
  function canAccess(lessonOrder: number): boolean {
    if (isPro) return true;
    return lessonOrder <= 2;
  }

  function handleLessonComplete(lessonId: string) {
    const next = { completedIds: [...new Set([...progress.completedIds, lessonId])] };
    setProgress(next);
    localStorage.setItem("codelab_bls_progress", JSON.stringify(next));
    setActiveLesson(null);
  }

  if (activeLesson) {
    const lesson = BLS_LESSONS.find((l) => l.id === activeLesson);
    if (!lesson) return null;
    return (
      <BLSLessonPlayer
        lesson={lesson}
        isPro={isPro}
        onComplete={() => handleLessonComplete(lesson.id)}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Ward
        </button>
        <div style={styles.proBadge}>
          {isPro ? "PRO" : "FREE"}
        </div>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroEyebrow}>EDUCATIONAL · AHA 2025 SCIENCE</div>
        <div style={styles.heroTitle}>Code Lab</div>
        <div style={styles.heroSub}>Stay code-ready between certifications</div>

        {/* Progress ring summary */}
        <div style={styles.progressRow}>
          <div style={styles.progressRing}>
            <svg width={56} height={56} viewBox="0 0 56 56">
              <circle cx={28} cy={28} r={24} fill="none" stroke="#1E293B" strokeWidth={5} />
              <circle
                cx={28} cy={28} r={24}
                fill="none"
                stroke="#0D9488"
                strokeWidth={5}
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
              />
              <text x={28} y={33} textAnchor="middle" fill="#F8FAFC" fontSize={13} fontWeight={700}>
                {pct}%
              </text>
            </svg>
          </div>
          <div style={styles.progressText}>
            <div style={styles.progressLabel}>BLS Track</div>
            <div style={styles.progressSub}>{completedCount} / {totalBLS} lessons complete</div>
          </div>
        </div>
      </div>

      {/* BLS Lessons */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>BLS TRACK — 6 LESSONS</div>
        {(activeTrack === 'bls' ? BLS_LESSONS : ACLS_LESSONS).map((lesson) => {
          const done = progress.completedIds.includes(lesson.id);
          const locked = !canAccess(lesson.order);
          return (
            <button
              key={lesson.id}
              style={{
                ...styles.lessonCard,
                ...(done ? styles.lessonDone : {}),
                ...(locked ? styles.lessonLocked : {}),
              }}
              onClick={() => {
                if (locked) { onUpgrade(); return; }
                setActiveLesson(lesson.id);
              }}
            >
              <div style={styles.lessonLeft}>
                <div style={{
                  ...styles.lessonNum,
                  background: done ? "#0D9488" : locked ? "#1E293B" : "#1E40AF",
                  color: locked ? "#475569" : "#F8FAFC",
                }}>
                  {done ? "✓" : locked ? "🔒" : lesson.order}
                </div>
                <div>
                  <div style={styles.lessonTitle}>{lesson.title}</div>
                  <div style={styles.lessonMeta}>~{lesson.durationMin} min</div>
                </div>
              </div>
              <div style={styles.lessonArrow}>
                {locked ? "" : "→"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Other tracks — coming soon */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>COMING SOON</div>
        {TRACKS.filter((t) => !t.available).map((track) => (
          <div key={track.id} style={styles.trackCardDisabled}>
            <span style={styles.trackIcon}>{track.icon}</span>
            <div>
              <div style={styles.trackTitle}>{track.label}</div>
              <div style={styles.trackDesc}>{track.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PRO upgrade banner */}
      {!isPro && (
        <div style={styles.upgradeBanner}>
          <div style={styles.upgradeText}>
            Free: Lessons 1–2 only · PRO unlocks full BLS, ACLS, Megacode & debrief history
          </div>
          <button style={styles.upgradeBtn} onClick={onUpgrade}>
            Upgrade to PRO
          </button>
        </div>
      )}

      {/* AHA CTA */}
      <div style={styles.ahaCta}>
        <div style={styles.ahaText}>Official certification?</div>
        <div style={styles.ahaLink}>Find an AHA skills session →</div>
      </div>

      {/* Disclaimer */}
      <div style={styles.disclaimer}>{BLS_DISCLAIMER}</div>
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#0B1220",
    color: "#F8FAFC",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    paddingBottom: 100,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px 0",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: 15,
    cursor: "pointer",
    padding: "8px 0",
  },
  proBadge: {
    background: "#1E40AF",
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    padding: "3px 10px",
    borderRadius: 20,
  },
  hero: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid #1E293B",
  },
  heroEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#0D9488",
    fontWeight: 700,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: -0.5,
    lineHeight: 1.1,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 15,
    color: "#94A3B8",
    marginBottom: 20,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  progressRing: {},
  progressText: {},
  progressLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#F8FAFC",
  },
  progressSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  section: {
    padding: "20px 20px 0",
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#475569",
    fontWeight: 700,
    marginBottom: 12,
  },
  lessonCard: {
    width: "100%",
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 0.15s",
  },
  lessonDone: {
    borderColor: "#0D9488",
    opacity: 0.8,
  },
  lessonLocked: {
    opacity: 0.5,
    cursor: "pointer",
  },
  lessonLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  lessonNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#F8FAFC",
    marginBottom: 2,
  },
  lessonMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  lessonArrow: {
    color: "#475569",
    fontSize: 16,
  },
  trackCardDisabled: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 10,
    opacity: 0.4,
  },
  trackIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#F8FAFC",
    marginBottom: 2,
  },
  trackDesc: {
    fontSize: 12,
    color: "#64748B",
  },
  upgradeBanner: {
    margin: "20px",
    background: "linear-gradient(135deg, #1E40AF 0%, #0D9488 100%)",
    borderRadius: 16,
    padding: "16px 18px",
  },
  upgradeText: {
    fontSize: 13,
    color: "rgba(248,250,252,0.85)",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  upgradeBtn: {
    background: "#F8FAFC",
    color: "#1E40AF",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  },
  ahaCta: {
    margin: "20px 20px 0",
    background: "#111827",
    borderRadius: 14,
    padding: "14px 16px",
    border: "1px solid #1E293B",
  },
  ahaText: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 4,
  },
  ahaLink: {
    fontSize: 14,
    color: "#0D9488",
    fontWeight: 600,
    cursor: "pointer",
  },
  disclaimer: {
    margin: "16px 20px 0",
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.6,
    borderTop: "1px solid #1E293B",
    paddingTop: 14,
  },
};
