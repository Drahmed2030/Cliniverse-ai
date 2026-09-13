"use client";
/**
 * CodeLabHub.tsx
 * Entry: Ward tab → Code Lab button
 * Design: shared semantic light/dark surfaces within the commercial shell
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
  progressMode?: 'local' | 'session';
  accountProgress?: { completedIds: string[]; complete: (lessonId: string, errors: number) => Promise<boolean>; saving: boolean; ready: boolean };
}

interface TrackProgress {
  completedIds: string[];
}

function loadProgress(): TrackProgress {
  if (typeof window === "undefined") return { completedIds: [] };
  try {
    const raw = localStorage.getItem("codelab_bls_progress");
    const parsed = raw ? JSON.parse(raw) : null;
    return { completedIds: Array.isArray(parsed?.completedIds)
      ? parsed.completedIds.filter((id: unknown): id is string => typeof id === 'string') : [] };
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

export default function CodeLabHub({ isPro, onUpgrade, onBack, progressMode = 'local', accountProgress }: CodeLabHubProps) {
  const [progress, setProgress] = useState<TrackProgress>({ completedIds: [] });
  const [activeTrack, setActiveTrack] = useState<"bls" | "acls">("bls");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  useEffect(() => {
    if (progressMode === 'session') return;
    const refresh = () => setProgress(loadProgress());
    const frame = requestAnimationFrame(refresh);
    window.addEventListener('storage', refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('storage', refresh); };
  }, [progressMode]);

  const lessons = activeTrack === 'bls' ? BLS_LESSONS : ACLS_LESSONS;
  const completedIds = accountProgress?.completedIds ?? progress.completedIds;
  const completedCount = lessons.filter(lesson => completedIds.includes(lesson.id)).length;
  const totalBLS = lessons.length;
  const pct = Math.round((completedCount / totalBLS) * 100);

  // PRO gate: free = lessons 1–2 only
  function canAccess(lessonOrder: number): boolean {
    if (isPro) return true;
    return lessonOrder <= 2;
  }

  async function handleLessonComplete(lessonId: string, errors = 0) {
    if (accountProgress) {
      if (await accountProgress.complete(lessonId, errors)) setActiveLesson(null);
      return;
    }
    const next = { completedIds: [...new Set([...progress.completedIds, lessonId])] };
    setProgress(next);
    if (progressMode === 'local') {
      try { localStorage.setItem("codelab_bls_progress", JSON.stringify(next)); } catch { /* Keep this session usable when storage is unavailable. */ }
    }
    setActiveLesson(null);
  }

  if (activeLesson) {
    const lesson = lessons.find((l) => l.id === activeLesson);
    if (lesson && canAccess(lesson.order)) return (
      <BLSLessonPlayer
        key={lesson.id}
        lesson={lesson}
        isPro={isPro}
        onComplete={(errors) => { void handleLessonComplete(lesson.id, errors); }}
        completionDisabled={Boolean(accountProgress && (!accountProgress.ready || accountProgress.saving))}
        completionLabel={accountProgress ? (accountProgress.saving ? 'Saving…' : 'Save lesson completion') : undefined}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <div style={styles.root} data-codelab>
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
              <circle cx={28} cy={28} r={24} fill="none" stroke="var(--cv-border, #334155)" strokeWidth={5} />
              <circle
                cx={28} cy={28} r={24}
                fill="none"
                stroke="var(--cv-teal, #2dd4bf)"
                strokeWidth={5}
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
              />
              <text x={28} y={33} textAnchor="middle" fill="var(--cv-text, #F8FAFC)" fontSize={13} fontWeight={700}>
                {pct}%
              </text>
            </svg>
          </div>
          <div style={styles.progressText}>
            <div style={styles.progressLabel}>{activeTrack.toUpperCase()} Track</div>
            <div style={styles.progressSub}>{completedCount} / {totalBLS} lessons complete</div>
          </div>
        </div>
      </div>

      {/* BLS Lessons */}
      <div style={styles.section}>
        <div role="group" aria-label="Learning track" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {(['bls', 'acls'] as const).map(track => (
            <button key={track} type="button" aria-pressed={activeTrack === track}
              style={{ ...styles.backBtn, minHeight: 44, padding: '8px 16px', border: '1px solid currentColor', borderRadius: 12, color: activeTrack === track ? 'var(--cv-teal, #2dd4bf)' : 'var(--cv-text-secondary, #94A3B8)', background: activeTrack === track ? 'var(--cv-learning-success, #042F2E)' : 'transparent', fontWeight: activeTrack === track ? 800 : 500 }}
              onClick={() => { setActiveTrack(track); setActiveLesson(null); }}>
              {track.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={styles.sectionLabel}>{activeTrack.toUpperCase()} TRACK — {lessons.length} LESSONS</div>
        {lessons.map((lesson) => {
          const done = completedIds.includes(lesson.id);
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
                  background: done ? "var(--cv-learning-action, #0f766e)" : locked ? "var(--cv-border, #334155)" : "var(--cv-learning-action, #0f766e)",
                  color: locked ? "var(--cv-text-secondary, #94A3B8)" : "#fff",
                }}>
                  {done ? "✓" : locked ? "🔒" : lesson.order}
                </div>
                <div>
                  <div style={styles.lessonTitle}>{lesson.title}</div>
                  <div style={styles.lessonMeta}>~{lesson.durationMin} min{done ? " · Completed" : locked ? " · PRO" : ""}</div>
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
            Free: Lessons 1–2 in each track · PRO unlocks all BLS and ACLS lessons
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
      <div style={styles.disclaimer}>{activeTrack === 'bls' ? BLS_DISCLAIMER : ACLS_DISCLAIMER}</div>
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "auto",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 24,
    maxWidth: 880,
    margin: "0 auto",
    background: "var(--cv-surface-elevated, #0B1220)",
    color: "var(--cv-text, #F8FAFC)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    paddingBottom: 24,
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
    color: "var(--cv-text-secondary, #94A3B8)",
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
    padding: "8px 0",
  },
  proBadge: {
    background: "var(--cv-learning-action, #0f766e)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    padding: "3px 10px",
    borderRadius: 20,
  },
  hero: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid var(--cv-border, #334155)",
  },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    color: "var(--cv-teal, #2dd4bf)",
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
    color: "var(--cv-text-secondary, #94A3B8)",
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
    color: "var(--cv-text, #F8FAFC)",
  },
  progressSub: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
    marginTop: 2,
  },
  section: {
    padding: "20px 20px 0",
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: "var(--cv-text-secondary, #94A3B8)",
    fontWeight: 700,
    marginBottom: 12,
  },
  lessonCard: {
    width: "100%",
    background: "var(--cv-surface-subtle, #111827)",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    cursor: "pointer",
    minHeight: 44,
    textAlign: "left",
    transition: "border-color 0.15s",
  },
  lessonDone: {
    borderColor: "var(--cv-teal, #2dd4bf)",
    opacity: 1,
  },
  lessonLocked: {
    opacity: 1,
    cursor: "pointer",
    minHeight: 44,
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
    color: "var(--cv-text, #F8FAFC)",
    marginBottom: 2,
  },
  lessonMeta: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
  },
  lessonArrow: {
    color: "var(--cv-text-secondary, #94A3B8)",
    fontSize: 16,
  },
  trackCardDisabled: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    background: "var(--cv-surface-subtle, #0F172A)",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 10,
    opacity: 1,
  },
  trackIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--cv-text, #F8FAFC)",
    marginBottom: 2,
  },
  trackDesc: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
  },
  upgradeBanner: {
    margin: "20px",
    background: "var(--cv-learning-action, #0f766e)",
    borderRadius: 16,
    padding: "16px 18px",
  },
  upgradeText: {
    fontSize: 13,
    color: "#fff",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  upgradeBtn: {
    background: "#fff",
    color: "var(--cv-learning-action, #0f766e)",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    minHeight: 44,
    width: "100%",
  },
  ahaCta: {
    margin: "20px 20px 0",
    background: "var(--cv-surface-subtle, #111827)",
    borderRadius: 14,
    padding: "14px 16px",
    border: "1px solid var(--cv-border, #334155)",
  },
  ahaText: {
    fontSize: 13,
    color: "var(--cv-text-secondary, #94A3B8)",
    marginBottom: 4,
  },
  ahaLink: {
    fontSize: 14,
    color: "var(--cv-teal, #2dd4bf)",
    fontWeight: 600,
    cursor: "pointer",
    minHeight: 44,
  },
  disclaimer: {
    margin: "16px 20px 0",
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
    lineHeight: 1.6,
    borderTop: "1px solid var(--cv-border, #334155)",
    paddingTop: 14,
  },
};
