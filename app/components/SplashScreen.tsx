"use client";

import { useEffect, useState } from "react";

const T = {
  bg: "#080C16",
  panel: "#111827",
  text: "#F8FAFC",
  sub: "#94A3B8",
  blue: "#3B82F6",
  violet: "#8B5CF6",
  teal: "#14B8A6",
};

interface Props {
  onDone: () => void;
  /** Keep this brief: native launch reliability is more important than decorative delay. */
  duration?: number;
}

export default function SplashScreen({ onDone, duration = 700 }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDone();
    }, Math.max(250, duration));
    return () => window.clearTimeout(timer);
  }, [duration, onDone]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Cliniverse AI is starting"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: `radial-gradient(circle at 50% 28%, rgba(59,130,246,.16), transparent 34%), radial-gradient(circle at 70% 38%, rgba(139,92,246,.10), transparent 30%), ${T.bg}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        color: T.text,
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 76,
          height: 76,
          borderRadius: 22,
          background: `linear-gradient(145deg, ${T.panel}, #172033)`,
          border: "1px solid rgba(148,163,184,.18)",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 18px 60px rgba(0,0,0,.28)",
          marginBottom: 22,
        }}
      >
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
          <path d="M34 12.5A16 16 0 1 0 34 35.5" stroke={T.blue} strokeWidth="5" strokeLinecap="round" />
          <path d="M22 24h5" stroke={T.teal} strokeWidth="4" strokeLinecap="round" />
          <path d="M29 18v12" stroke={T.violet} strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ fontSize: 29, fontWeight: 850, letterSpacing: "-0.035em" }}>Cliniverse AI</div>
      <div style={{ marginTop: 7, color: T.sub, fontSize: 13, lineHeight: 1.55, maxWidth: 310 }}>
        Clinical learning and workflow support
      </div>
      <div style={{ marginTop: 14, color: T.blue, fontSize: 11, fontWeight: 800, letterSpacing: .9 }}>
        A NEURAOPS PRODUCT
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "calc(30px + env(safe-area-inset-bottom))",
          color: T.sub,
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        Human review · No real patient data in this release
      </div>
    </div>
  );
}
