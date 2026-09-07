"use client";

import { useState } from "react";
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_TOP,
} from "../lib/nativeSafeArea";

const T = {
  bg: "#080C16",
  panel: "#111827",
  elevated: "#172033",
  text: "#F8FAFC",
  sub: "#94A3B8",
  border: "rgba(148,163,184,.20)",
  blue: "#3B82F6",
  violet: "#8B5CF6",
  teal: "#14B8A6",
};

type UserType = "doctor" | "patient";

interface Props {
  onComplete: (type?: UserType) => void;
}

const SLIDES = [
  {
    eyebrow: "CLINIVERSE AI · BY NEURAOPS",
    accent: T.blue,
    title: "A clearer path through clinical learning and workflow.",
    body: "Cliniverse brings focused care workflows, curated clinical tools and account controls into one calm workspace for healthcare professionals.",
    chips: ["Care", "Atlas", "Me"],
  },
  {
    eyebrow: "SIMULATED & RELEASE-SCOPED",
    accent: T.teal,
    title: "Learn and review without pretending sample data is live care.",
    body: "The current release is designed for learning and workflow support. Do not enter real patient-identifiable information. Human clinical judgment remains essential.",
    chips: ["Simulated cases", "Human review", "No real patient data"],
  },
  {
    eyebrow: "TRUST BEFORE EXPANSION",
    accent: T.violet,
    title: "Advanced AI stays gated until its safety and privacy checks pass.",
    body: "Cliniverse expands deliberately. AI, connected health data and other higher-risk capabilities remain unavailable in this release until their disclosure, consent and validation gates are complete.",
    chips: ["Privacy first", "Clear boundaries", "Controlled release"],
  },
] as const;

export default function OnboardingFunnel({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    if (isLast) {
      onComplete("doctor");
      return;
    }
    setIndex(current => current + 1);
  }

  return (
    <main
      aria-labelledby="onboarding-title"
      style={{
        minHeight: "100dvh",
        background: `radial-gradient(circle at 18% 12%, rgba(59,130,246,.16), transparent 28%), radial-gradient(circle at 82% 28%, rgba(139,92,246,.10), transparent 28%), ${T.bg}`,
        color: T.text,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: `max(22px, ${NATIVE_SAFE_AREA_TOP}) 20px calc(28px + ${NATIVE_SAFE_AREA_BOTTOM})`,
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 26 }} aria-label={`Step ${index + 1} of ${SLIDES.length}`}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: i <= index ? T.blue : "rgba(148,163,184,.22)",
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: 560, width: "100%", margin: "auto" }}>
        <div
          aria-hidden="true"
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            display: "grid",
            placeItems: "center",
            background: T.panel,
            border: `1px solid ${T.border}`,
            marginBottom: 26,
          }}
        >
          <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
            <path d="M34 12.5A16 16 0 1 0 34 35.5" stroke={slide.accent} strokeWidth="5" strokeLinecap="round" />
            <circle cx="29" cy="24" r="3" fill={T.teal} />
          </svg>
        </div>

        <div style={{ color: slide.accent, fontSize: 11, fontWeight: 850, letterSpacing: 1, marginBottom: 10 }}>
          {slide.eyebrow}
        </div>
        <h1 id="onboarding-title" style={{ fontSize: "clamp(30px,8vw,42px)", lineHeight: 1.08, letterSpacing: "-.04em", margin: 0 }}>
          {slide.title}
        </h1>
        <p style={{ color: T.sub, fontSize: 15, lineHeight: 1.7, margin: "18px 0 20px", maxWidth: 520 }}>
          {slide.body}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {slide.chips.map(chip => (
            <span key={chip} style={{ border: `1px solid ${T.border}`, background: T.elevated, color: T.sub, padding: "7px 10px", borderRadius: 999, fontSize: 11, fontWeight: 750 }}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 560, margin: "26px auto 0" }}>
        <button
          type="button"
          onClick={next}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 16,
            padding: "15px 18px",
            background: T.text,
            color: "#0F172A",
            fontSize: 15,
            fontWeight: 850,
            cursor: "pointer",
          }}
        >
          {isLast ? "Continue to sign in →" : "Continue →"}
        </button>
        <button
          type="button"
          onClick={() => onComplete("doctor")}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            color: T.sub,
            fontSize: 13,
            fontWeight: 650,
            padding: "13px 8px 2px",
            cursor: "pointer",
          }}
        >
          Skip introduction
        </button>
      </div>
    </main>
  );
}
