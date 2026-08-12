"use client";
import { useState, useEffect, useRef } from "react";
import { computeLifeScore } from "../lib/lifeScoring";

interface Props {
  xp: number;
  streak: number;
  casesCompleted: number;
  mcqCorrect: number;
  isPro: boolean;
  name?: string;
  onUpgrade: () => void;
  onReset: () => void;
}

const T = {
  teal:   "#0D9488",
  cobalt: "#1E40AF",
  canvas: "#F7FAFA",
  white:  "#FFFFFF",
  border: "#E2E8F0",
  text:   "#0F172A",
  sub:    "#475569",
  muted:  "#94A3B8",
  grad:   "linear-gradient(135deg,#0D9488,#1E40AF)",
  green:  "#10B981",
  purple: "#7C3AED",
  amber:  "#F59E0B",
  red:    "#EF4444",
};

// ── Animated Score Circle ─────────────────────────────────────
function ScoreCircle({ score, size = 140 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 80 ? T.green : score >= 60 ? T.teal : T.amber;
  const offset = circ - (animated / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#E2E8F0" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: T.text, lineHeight: 1 }}>
          {animated}
        </span>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
}

// ── Pillar Card ───────────────────────────────────────────────
function PillarCard({ icon, label, sub, score, color, detail }: {
  icon: string; label: string; sub: string; score: number;
  color: string; detail: string;
}) {
  return (
    <div style={{
      background: T.white, borderRadius: 16, padding: "14px",
      border: `1px solid ${T.border}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `${color}18`, border: `1.5px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</div>
          <div style={{ fontSize: 10, color: T.muted }}>{sub}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color }}>{score}</div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99, marginBottom: 8, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg,${color}88,${color})`,
          width: `${score}%`,
          transition: "width 1s ease",
        }}/>
      </div>
      <div style={{ fontSize: 11, color: T.sub }}>{detail}</div>
    </div>
  );
}

// ── Stat Badge ────────────────────────────────────────────────
function StatBadge({ icon, value, label, sub }: {
  icon: string; value: string; label: string; sub: string;
}) {
  return (
    <div style={{
      background: T.white, borderRadius: 14, padding: "12px 10px",
      border: `1px solid ${T.border}`, textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: T.muted }}>{sub}</div>
    </div>
  );
}

export default function LifeScreen({ xp, streak, casesCompleted, isPro, name, onUpgrade, onReset }: Props) {
  const [grokInsight, setGrokInsight] = useState<{ insight: string; suggestion?: string; tone?: string } | null>(null);
  const [grokLoading, setGrokLoading] = useState(false);
  const hasFetched = useRef(false);

  // ── Manual health inputs (localStorage) ──────────────────
  const [steps, setSteps]         = useState(() => parseInt(localStorage.getItem("life_steps") || "0"));
  const [sleepHours, setSleepHours] = useState(() => parseFloat(localStorage.getItem("life_sleep") || "0"));
  const [activeMin, setActiveMin]  = useState(() => parseInt(localStorage.getItem("life_active") || "0"));
  const [showEdit, setShowEdit]    = useState(false);

  // ── Compute score ─────────────────────────────────────────
  const score = computeLifeScore({
    steps, activeMinutes: activeMin, sleepHours: sleepHours || undefined,
    casesCompleted, xpEarned: xp, streakDays: streak,
  });

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const displayName = name || "Doctor";

  // ── Fetch Grok insight ────────────────────────────────────
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setGrokLoading(true);
    fetch("/api/life-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: score.total,
        physicalSummary: `${steps} steps · ${sleepHours}h sleep · ${activeMin} min active`,
        mentalSummary: `${sleepHours}h sleep`,
        professionalSummary: `${casesCompleted} cases · ${xp} XP · ${streak}-day streak`,
      }),
    })
    .then(r => r.json())
    .then(d => setGrokInsight(d))
    .catch(() => setGrokInsight({ insight: "Keep up your clinical excellence today.", tone: "encouraging" }))
    .finally(() => setGrokLoading(false));
  }, []);

  const pillars = [
    { icon: "🏃", label: "Physical",     sub: "Move & Energy",          score: score.pillars.physical,     color: T.green,  detail: `${steps.toLocaleString()} steps · ${activeMin} min active` },
    { icon: "🧠", label: "Mental",       sub: "Mind & Recovery",        score: score.pillars.mental,       color: T.purple, detail: `${sleepHours}h sleep` },
    { icon: "👥", label: "Social",       sub: "Connection & Belonging", score: score.pillars.social,       color: T.cobalt, detail: "Logged interactions" },
    { icon: "💼", label: "Professional", sub: "Growth & Contribution",  score: score.pillars.professional, color: T.teal,   detail: `${casesCompleted} cases · ${xp} XP · ${streak}-day streak` },
  ];

  const stats = [
    { icon: "😴", value: sleepHours ? `${sleepHours}h` : "—",    label: "Sleep",         sub: "Last night" },
    { icon: "👟", value: steps ? steps.toLocaleString() : "—",   label: "Steps",         sub: "Today" },
    { icon: "⚡", value: `${activeMin} min`,                      label: "Active Time",   sub: "Today" },
    { icon: "📋", value: `${casesCompleted}`,                     label: "Cases",         sub: "Today" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: T.canvas, fontFamily: "-apple-system,'SF Pro Display',sans-serif", paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{
        background: T.grad, padding: "52px 20px 24px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>Dr. {displayName}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>Life Overview</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>📅 {today}</div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 14,
            padding: "6px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>STREAK</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>🔥 {streak}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ── Daily Life Score ── */}
        <div style={{
          background: T.white, borderRadius: 20, padding: "20px",
          border: `1px solid ${T.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>🌿 Daily Life Score</div>
            <div style={{ fontSize: 11, color: T.muted }}>Overall balance of your day</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "8px 0" }}>
            <ScoreCircle score={score.total} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 18, fontWeight: 800, color: T.teal, marginBottom: 6,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {score.label} ✦
              </div>
              <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginBottom: 8 }}>
                {score.total >= 80
                  ? "You're building strong life momentum. Small, consistent choices today create exponential impact tomorrow."
                  : score.total >= 60
                  ? "Good progress today. Keep balancing your clinical work with recovery time."
                  : "Focus on rest and movement today — small steps make a big difference."}
              </div>
              {score.deltaVsYesterday !== undefined && (
                <div style={{ fontSize: 12, color: score.deltaVsYesterday >= 0 ? T.green : T.red, fontWeight: 600 }}>
                  {score.deltaVsYesterday >= 0 ? "↑" : "↓"} {Math.abs(score.deltaVsYesterday)} pts vs yesterday
                </div>
              )}
            </div>
          </div>
          {/* Edit inputs */}
          <button onClick={() => setShowEdit(!showEdit)} style={{
            width: "100%", marginTop: 12, padding: "8px",
            background: "rgba(13,148,136,0.06)", border: `1px solid rgba(13,148,136,0.15)`,
            borderRadius: 10, fontSize: 12, color: T.teal, fontWeight: 600, cursor: "pointer",
          }}>
            {showEdit ? "▲ Hide" : "✏️ Update today's activity"}
          </button>
          {showEdit && (
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Steps", value: steps, key: "life_steps", setter: setSteps, unit: "" },
                { label: "Sleep (hrs)", value: sleepHours, key: "life_sleep", setter: setSleepHours, unit: "" },
                { label: "Active (min)", value: activeMin, key: "life_active", setter: setActiveMin, unit: "" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>{f.label}</div>
                  <input
                    type="number"
                    value={f.value || ""}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      (f.setter as any)(v);
                      localStorage.setItem(f.key, String(v));
                    }}
                    style={{
                      width: "100%", padding: "6px 8px", borderRadius: 8,
                      border: `1px solid ${T.border}`, fontSize: 13,
                      outline: "none", boxSizing: "border-box" as const,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Grok Insight ── */}
        <div style={{
          background: "linear-gradient(135deg,rgba(13,148,136,0.06),rgba(30,64,175,0.04))",
          borderRadius: 18, padding: "16px",
          border: "1px solid rgba(13,148,136,0.15)",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>✦</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Health Insight from Grok</span>
          </div>
          {grokLoading ? (
            <div style={{ fontSize: 13, color: T.muted }}>⏳ Analyzing your day...</div>
          ) : grokInsight ? (
            <>
              <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.7, marginBottom: 8 }}>
                {grokInsight.insight}
              </div>
              {grokInsight.suggestion && (
                <div style={{
                  fontSize: 12, color: T.teal, fontWeight: 600,
                  background: "rgba(13,148,136,0.08)", borderRadius: 8,
                  padding: "6px 10px", marginBottom: 8,
                }}>
                  💡 {grokInsight.suggestion}
                </div>
              )}
              <div style={{ fontSize: 10, color: T.muted }}>
                Powered by Grok · Personalized for you
              </div>
            </>
          ) : null}
        </div>

        {/* ── Vitality Pillars ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Vitality Pillars</div>
          <div style={{ fontSize: 11, color: T.muted }}>2×2 grid</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {pillars.map((p, i) => <PillarCard key={i} {...p} />)}
        </div>

        {/* ── Life Stats ── */}
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 10 }}>Life Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {stats.map((s, i) => <StatBadge key={i} {...s} />)}
        </div>

        {/* ── Settings ── */}
        <div style={{
          background: T.white, borderRadius: 16, padding: "4px 0",
          border: `1px solid ${T.border}`,
        }}>
          {[
            { icon: "⭐", label: `${xp} XP earned`, sub: "Total experience points" },
            { icon: "🔥", label: `${streak} day streak`, sub: "Keep it going!" },
            { icon: "📋", label: `${casesCompleted} cases completed`, sub: "Clinical practice" },
          ].map((item, i, arr) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{item.sub}</div>
              </div>
            </div>
          ))}
          <button onClick={onReset} style={{
            width: "100%", padding: "12px 16px", background: "none",
            border: "none", textAlign: "left", cursor: "pointer",
            fontSize: 13, color: T.red, fontWeight: 600,
            borderTop: `1px solid ${T.border}`,
          }}>
            🔄 Reset & choose role again
          </button>
        </div>

      </div>
    </div>
  );
}
