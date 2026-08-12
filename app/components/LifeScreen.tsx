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
      {/* ── Settings Bottom Sheet ── */}
      {showSettings && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        }} onClick={() => setShowSettings(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              borderRadius: "28px 28px 0 0",
              padding: "0 0 40px",
              maxHeight: "85dvh", overflowY: "auto",
              fontFamily: "-apple-system,'SF Pro Display',sans-serif",
              border: "1px solid rgba(255,255,255,0.6)",
              borderBottom: "none",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(0,0,0,0.12)" }}/>
            </div>

            {/* Title */}
            <div style={{
              padding: "12px 20px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Settings</div>
              <button onClick={() => setShowSettings(false)} style={{
                width: 28, height: 28, borderRadius: "50%",
                background: T.border, border: "none",
                fontSize: 14, cursor: "pointer", color: T.sub,
              }}>×</button>
            </div>

            {/* ── Profile ── */}
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.muted, marginBottom: 8, textTransform: "uppercase" }}>Profile</div>
              <div style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 16, padding: "14px",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>Display Name</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Dr. Your Name"
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 10,
                      border: `1px solid ${T.border}`, fontSize: 14,
                      outline: "none", background: T.white,
                    }}
                  />
                  <button onClick={() => {
                    localStorage.setItem("cliniverse_user_name", editName);
                    setShowSettings(false);
                  }} style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: T.teal, color: "white", fontSize: 13,
                    fontWeight: 700, cursor: "pointer",
                  }}>Save</button>
                </div>
              </div>

              {/* ── PRO Subscription ── */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.muted, marginBottom: 8, textTransform: "uppercase" }}>Subscription</div>
              <div style={{
                borderRadius: 14, marginBottom: 16, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 4px 20px rgba(13,148,136,0.12)",
              }}>
                <div style={{
                  padding: "14px 16px",
                  background: isPro
                    ? "linear-gradient(135deg,rgba(13,148,136,0.25),rgba(30,64,175,0.18))"
                    : "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{isPro ? "💎" : "⭐"}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                        {isPro ? "PRO Active" : "Free Plan"}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        {isPro ? "Full clinical intelligence unlocked" : "Upgrade for unlimited access"}
                      </div>
                    </div>
                  </div>
                  {!isPro && (
                    <button onClick={() => { setShowSettings(false); onUpgrade(); }} style={{
                      padding: "6px 14px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg,#0D9488,#1E40AF)",
                      color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}>Upgrade</button>
                  )}
                </div>
              </div>

              {/* ── Appearance ── */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.muted, marginBottom: 8, textTransform: "uppercase" }}>Appearance</div>
              <div style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 16, padding: "4px",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                marginBottom: 16,
                display: "flex", gap: 4,
              }}>
                {(["light", "dark"] as const).map(mode => (
                  <button key={mode} onClick={() => setAppearance(mode)} style={{
                    flex: 1, padding: "10px", borderRadius: 10, border: "none",
                    background: appearance === mode ? T.white : "transparent",
                    boxShadow: appearance === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    fontSize: 13, fontWeight: 600,
                    color: appearance === mode ? T.teal : T.muted,
                    cursor: "pointer", textTransform: "capitalize",
                  }}>
                    {mode === "light" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                ))}
              </div>

              {/* ── Privacy & Legal ── */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.muted, marginBottom: 8, textTransform: "uppercase" }}>Privacy & Legal</div>
              <div style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                marginBottom: 16,
                overflow: "hidden",
              }}>
                {[
                  { icon: "🔒", label: "Privacy Policy", action: () => window.open("https://cliniverseai.com/privacy", "_blank") },
                  { icon: "📄", label: "Terms of Service", action: () => window.open("https://cliniverseai.com/terms", "_blank") },
                  { icon: "📧", label: "Contact Support", action: () => window.open("mailto:support@cliniverseai.com") },
                ].map((item, i, arr) => (
                  <button key={i} onClick={item.action} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 16px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 500, flex: 1 }}>{item.label}</span>
                    <span style={{ color: T.muted, fontSize: 14 }}>›</span>
                  </button>
                ))}
              </div>

              {/* ── Danger Zone ── */}
              <button onClick={() => { setShowSettings(false); onReset(); }} style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "rgba(239,68,68,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(239,68,68,0.2)",
                boxShadow: "0 2px 12px rgba(239,68,68,0.06)",
                color: T.red, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                🔄 Reset & Choose Role Again
              </button>
            </div>
          </div>
        </div>
      )}
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
      {/* ── Settings Bottom Sheet ── */}
      
    </div>
  );
}