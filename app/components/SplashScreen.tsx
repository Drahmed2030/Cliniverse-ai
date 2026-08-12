"use client";

import { useEffect, useState } from "react";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  bg: "#070B14",
  text: "#F8FAFC",
  sub: "#94A3B8",
  muted: "#64748B",
};

interface Props {
  onDone: () => void;
  /** ms before auto-continue */
  duration?: number;
}

/**
 * Cliniverse identity splash — trust first, no inflated stats.
 * Replace file at: app/components/SplashScreen.tsx
 */
export default function SplashScreen({ onDone, duration = 2200 }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(
    function () {
      var t = setTimeout(function () {
        setVisible(false);
        onDone();
      }, duration);
      return function () {
        clearTimeout(t);
      };
    },
    [duration, onDone]
  );

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(13,148,136,0.18) 0%, " +
          T.bg +
          " 55%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        color: T.text,
      }}
    >
      {/* Mark */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, " + T.tealD + ", " + T.teal + ")",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 40px rgba(13,148,136,0.35)",
          marginBottom: 22,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12h4l2-5 4 10 2-5h6"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          marginBottom: 8,
        }}
      >
        Cliniverse
      </div>
      <div
        style={{
          fontSize: 14,
          color: T.sub,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        Clinical intelligence for real practice
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 48,
          fontSize: 11,
          color: T.muted,
          letterSpacing: 0.3,
          textAlign: "center",
        }}
      >
        Practice safely · No real patient data
      </div>
    </div>
  );
}
