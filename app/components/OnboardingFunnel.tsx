"use client";

import { useState } from "react";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  bg: "#070B14",
  white: "#FFFFFF",
  text: "#F8FAFC",
  sub: "rgba(248,250,252,0.78)",
  muted: "rgba(148,163,184,0.9)",
  border: "rgba(255,255,255,0.14)",
};

type UserType = "doctor" | "patient";

interface Slide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  body: string;
  image: string;
  audience: "all" | "doctor" | "patient";
}

interface Props {
  onComplete: (type?: UserType) => void;
}

/**
 * High-conversion onboarding
 * - Curated Unsplash (stable ids, medical, premium crop)
 * - Copy oriented to value → PRO desire
 * - Doctor / Patient branch at the end
 *
 * Drop in: app/components/OnboardingFunnel.tsx
 */
var SLIDES: Slide[] = [
  {
    id: "promise",
    badge: "CLINIVERSE · CLINICAL OS",
    badgeColor: T.teal,
    title: "Train like you’re on service tonight",
    body:
      "A virtual hospital OS for sharper clinical judgment — not passive scrolling. Cases, documentation, and decisions in one flow.",
    image:
      "https://images.unsplash.com/photo-1551076805-e1648902dd0b?auto=format&fit=crop&w=1200&q=80",
    audience: "all",
  },
  {
    id: "ward",
    badge: "VIRTUAL HOSPITAL",
    badgeColor: T.teal,
    title: "Every shift builds real instinct",
    body:
      "Admit, work up, document SOAP, and discharge simulated patients. Your choices leave a trail — just like on the ward.",
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80",
    audience: "doctor",
  },
  {
    id: "boards",
    badge: "MRCP · USMLE · FRCP",
    badgeColor: "#7C3AED",
    title: "Board readiness, built into the day",
    body:
      "High-yield MCQs and clinical scenarios mapped to the systems you actually get examined on — daily, not crammed.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    audience: "doctor",
  },
  {
    id: "ai",
    badge: "MULTI-AI CLINICAL SUPPORT",
    badgeColor: T.teal,
    title: "Second opinions, structured",
    body:
      "Ask with the case context in front of you. Compare guidance, tighten reasoning, and document with more confidence.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    audience: "doctor",
  },
  {
    id: "global",
    badge: "GLOBAL LEARNING NETWORK",
    badgeColor: "#2563EB",
    title: "Learn with doctors worldwide",
    body:
      "Compare approaches on live-style cases and track growth against a global peer rhythm — without the noise of social feeds.",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80",
    audience: "doctor",
  },
  {
    id: "afia",
    badge: "AFIA · HEALTH FOR ALL",
    badgeColor: T.teal,
    title: "For your family — not only clinicians",
    body:
      "Clear guidance on mother & child health, pharmacy basics, and everyday decisions — intelligent, calm, and safe to explore.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
    audience: "patient",
  },
  {
    id: "pro",
    badge: "CLINIVERSE PRO",
    badgeColor: "#FBBF24",
    title: "Unlock the full hospital OS",
    body:
      "Unlimited Ward depth, full Patient Journey, SOAP + discharge tools, and advanced AI consensus. Built for physicians who take practice seriously.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    audience: "doctor",
  },
];

export default function OnboardingFunnel({ onComplete }: Props) {
  var [index, setIndex] = useState(0);
  var [track, setTrack] = useState<"unset" | UserType>("unset");
  var [showChooser, setShowChooser] = useState(true);

  var slides =
    track === "unset"
      ? []
      : SLIDES.filter(function (s) {
          return s.audience === "all" || s.audience === track;
        });

  var slide = slides[index];
  var total = slides.length;
  var isLast = index >= total - 1 && total > 0;

  function chooseTrack(type: UserType) {
    setTrack(type);
    setShowChooser(false);
    setIndex(0);
  }

  function next() {
    if (isLast) {
      onComplete(track === "unset" ? "doctor" : track);
      return;
    }
    setIndex(index + 1);
  }

  function skip() {
    onComplete(track === "patient" ? "patient" : "doctor");
  }

  // ── Role chooser ──────────────────────────────────────────
  if (showChooser || track === "unset") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: T.bg,
          color: T.text,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "28px 20px 36px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(7,11,20,0.2) 0%, rgba(7,11,20,0.75) 45%, rgba(7,11,20,0.96) 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 420, margin: "0 auto", width: "100%" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
              color: T.teal,
              marginBottom: 10,
            }}
          >
            CLINIVERSE
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Who is learning today?
          </div>
          <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.5, marginBottom: 22 }}>
            Choose your path. You can switch later from settings.
          </div>

          <button
            onClick={function () {
              chooseTrack("doctor");
            }}
            style={primaryBtn()}
          >
            I’m a clinician →
          </button>
          <button
            onClick={function () {
              chooseTrack("patient");
            }}
            style={secondaryBtn()}
          >
            I’m here for family health (Afia)
          </button>
        </div>
      </div>
    );
  }

  if (!slide) {
    onComplete(track);
    return null;
  }

  // ── Slide ─────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100dvh",
        position: "relative",
        color: T.text,
        overflow: "hidden",
        background: T.bg,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(" + slide.image + ")",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7,11,20,0.25) 0%, rgba(7,11,20,0.55) 40%, rgba(7,11,20,0.94) 78%)",
        }}
      />

      {/* Progress */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          gap: 6,
          padding: "16px 20px 0",
        }}
      >
        {slides.map(function (_, i) {
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: i <= index ? T.white : "rgba(255,255,255,0.25)",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "24px 20px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            borderRadius: 99,
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.4,
            marginBottom: 14,
            background: slide.badgeColor,
            color: slide.id === "pro" ? "#111827" : T.white,
          }}
        >
          {slide.badge}
        </div>

        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            marginBottom: 12,
            maxWidth: 360,
          }}
        >
          {slide.title}
        </div>
        <div
          style={{
            fontSize: 15,
            color: T.sub,
            lineHeight: 1.5,
            marginBottom: 24,
            maxWidth: 380,
          }}
        >
          {slide.body}
        </div>

        <button onClick={next} style={primaryBtn()}>
          {isLast
            ? track === "patient"
              ? "Enter Afia →"
              : slide.id === "pro"
              ? "Continue to PRO options →"
              : "Get Started →"
            : "Continue →"}
        </button>

        <button
          onClick={skip}
          style={{
            border: "none",
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            fontWeight: 600,
            padding: "12px 8px",
            marginTop: 4,
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function primaryBtn() {
  return {
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "15px 18px",
    background: T.white,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: 800,
    marginBottom: 4,
  } as const;
}

function secondaryBtn() {
  return {
    width: "100%",
    border: "1px solid " + T.border,
    borderRadius: 16,
    padding: "14px 18px",
    background: "rgba(255,255,255,0.06)",
    color: T.white,
    fontSize: 14,
    fontWeight: 700,
    marginTop: 10,
  } as const;
}
