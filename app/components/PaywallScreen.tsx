"use client";
import { useState } from "react";

interface PaywallScreenProps {
  onClose: () => void;
  onSubscribe: (plan: "monthly" | "yearly") => void;
}

const FEATURES = [
  { icon: "🔮", title: "Unlimited Multi-AI Consensus", desc: "Cross-verify with top AI models instantly." },
  { icon: "📋", title: "Full Clinical Log + PDF Export", desc: "Track rotations, procedures & export logs." },
  { icon: "🧠", title: "Advanced Cases & Board Prep", desc: "Realistic cases, explanations & high-yield tools." },
  { icon: "🌍", title: "Priority in Global Room", desc: "Collaborate with clinicians worldwide." },
];

export default function PaywallScreen({ onClose, onSubscribe }: PaywallScreenProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const url = plan === "yearly"
      ? "https://cliniverse.lemonsqueezy.com/checkout/buy/pro-yearly"
      : "https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly";
    window.open(url, "_blank");
    setTimeout(() => { setLoading(false); onClose(); }, 1000);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      fontFamily: "-apple-system,'SF Pro Display',sans-serif",
      overflowY: "auto",
    }}>
      {/* Background */}
      <div style={{
        position: "fixed", inset: 0,
        background: "linear-gradient(160deg,#0A1628 0%,#0D2A3A 50%,#0A1628 100%)",
        zIndex: 0,
      }}/>

      {/* Animated orbs */}
      <div style={{
        position: "fixed", top: "10%", right: "10%",
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(13,148,136,0.2),transparent 70%)",
        zIndex: 0,
      }}/>
      <div style={{
        position: "fixed", bottom: "20%", left: "5%",
        width: 150, height: 150, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(30,64,175,0.15),transparent 70%)",
        zIndex: 0,
      }}/>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "52px 24px 40px", maxWidth: 420, margin: "0 auto" }}>

        {/* Close button */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)", border: "none",
          color: "rgba(255,255,255,0.6)", fontSize: 18,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>✚</span>🩺
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: "white",
            margin: "0 0 10px", lineHeight: 1.15, letterSpacing: -0.5,
          }}>
            Unlock Full<br/>Clinical Intelligence
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
            Unlimited AI consensus, cases & clinical tools.
          </p>
        </div>

        {/* Features */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 20, padding: "4px 0",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 24,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "14px 20px",
              borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#0D9488,#0891B2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>✓</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>

          {/* Yearly */}
          <button onClick={() => setPlan("yearly")} style={{
            width: "100%", padding: "16px 20px", borderRadius: 16,
            border: `2px solid ${plan === "yearly" ? "#0D9488" : "rgba(255,255,255,0.12)"}`,
            background: plan === "yearly" ? "rgba(13,148,136,0.12)" : "rgba(255,255,255,0.04)",
            cursor: "pointer", textAlign: "left", position: "relative",
            transition: "all 0.2s",
          }}>
            {/* Best Value badge */}
            <div style={{
              position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
              background: "linear-gradient(135deg,#0D9488,#0891B2)",
              color: "white", fontSize: 10, fontWeight: 800, letterSpacing: 1,
              padding: "3px 14px", borderRadius: 99,
            }}>BEST VALUE</div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(13,148,136,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>📅</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Yearly</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>$99.99 / year</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0D9488" }}>$99.99</div>
                <div style={{ fontSize: 11, color: "#0D9488", fontWeight: 600 }}>Only $8.33/mo</div>
              </div>
            </div>
          </button>

          {/* Monthly */}
          <button onClick={() => setPlan("monthly")} style={{
            width: "100%", padding: "16px 20px", borderRadius: 16,
            border: `2px solid ${plan === "monthly" ? "#0D9488" : "rgba(255,255,255,0.12)"}`,
            background: plan === "monthly" ? "rgba(13,148,136,0.08)" : "rgba(255,255,255,0.04)",
            cursor: "pointer", textAlign: "left",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(13,148,136,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>🕐</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Monthly</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Flexible, cancel anytime</div>
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>$14.99</div>
            </div>
          </button>
        </div>

        {/* CTA Button */}
        <button onClick={handleSubscribe} disabled={loading} style={{
          width: "100%", padding: "18px", borderRadius: 16,
          background: "linear-gradient(135deg,#0D9488,#0891B2)",
          border: "none", color: "white", fontSize: 17, fontWeight: 800,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.8 : 1,
          boxShadow: "0 8px 32px rgba(13,148,136,0.4)",
          marginBottom: 14, transition: "all 0.2s",
        }}>
          {loading ? "Opening..." : "Start 7-Day Free Trial"}
        </button>

        {/* Footer */}
        <div style={{
          textAlign: "center", fontSize: 12,
          color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
        }}>
          🔒 Cancel anytime · Secured by Apple
        </div>
      </div>
    </div>
  );
}
