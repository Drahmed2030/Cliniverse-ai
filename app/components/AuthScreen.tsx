"use client";

import { useState } from "react";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  bg: "#070B14",
  card: "#0F1623",
  white: "#FFFFFF",
  text: "#F8FAFC",
  sub: "#94A3B8",
  muted: "#64748B",
  border: "rgba(148,163,184,0.22)",
  apple: "#FFFFFF",
  google: "#FFFFFF",
  danger: "#F87171",
};

type Mode = "landing" | "email";

interface Props {
  onComplete: (payload?: {
    method: "apple" | "google" | "email" | "guest";
    email?: string;
  }) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  allowGuest?: boolean;
  locale?: "en" | "ar";
}

const COPY = {
  en: {
    kicker: "CLINIVERSE",
    title: "Sign in to save your clinical progress",
    subtitle:
      "Ward cases, SOAP notes, and discharge summaries stay with you across devices.",
    apple: "Continue with Apple",
    google: "Continue with Google",
    email: "Continue with Email",
    or: "or",
    emailLabel: "Email",
    passwordLabel: "Password",
    magic: "Prefer a magic link instead",
    continueEmail: "Continue",
    back: "Back",
    guest: "Continue as guest",
    trust: "Practice safely · No real patient data",
    terms: "Terms",
    privacy: "Privacy",
    emailError: "Enter a valid email",
    passwordError: "Password must be at least 8 characters",
  },
  ar: {
    kicker: "CLINIVERSE",
    title: "سجّل دخولك لحفظ تقدمك السريري",
    subtitle:
      "حالات الورد وملاحظات SOAP وملخصات الخروج تبقى معك عبر أجهزتك.",
    apple: "المتابعة مع Apple",
    google: "المتابعة مع Google",
    email: "المتابعة بالبريد",
    or: "أو",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    magic: "أفضل رابط دخول سريع",
    continueEmail: "متابعة",
    back: "رجوع",
    guest: "المتابعة كزائر",
    trust: "تدرّب بأمان · لا بيانات مرضى حقيقية",
    terms: "الشروط",
    privacy: "الخصوصية",
    emailError: "أدخل بريدًا صالحًا",
    passwordError: "كلمة المرور 8 أحرف على الأقل",
  },
};

export default function AuthScreen({
  onComplete,
  onOpenTerms,
  onOpenPrivacy,
  allowGuest = true,
  locale = "en",
}: Props) {
  const [mode, setMode] = useState<Mode>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagic, setUseMagic] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function handleOAuth(method: "apple" | "google") {
    if (loading) return;
    setLoading(true);
    // Wire to NextAuth / Supabase / Clerk later.
    // For now complete optimistically so funnel is testable.
    setTimeout(function () {
      setLoading(false);
      onComplete({ method: method });
    }, 350);
  }

  function handleEmail() {
    setError("");
    if (!validEmail(email)) {
      setError(t.emailError);
      return;
    }
    if (!useMagic && password.trim().length < 8) {
      setError(t.passwordError);
      return;
    }
    setLoading(true);
    setTimeout(function () {
      setLoading(false);
      onComplete({ method: "email", email: email.trim() });
    }, 350);
  }

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, " + T.bg + " 0%, #0B1220 55%, #0A1F1C 100%)",
        color: T.text,
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420, width: "100%", margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: T.teal,
              marginBottom: 10,
            }}
          >
            {t.kicker}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            {t.title}
          </div>
          <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.5 }}>
            {t.subtitle}
          </div>
        </div>

        {mode === "landing" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AuthButton
              label={t.apple}
              bg={T.white}
              color="#0F172A"
              onClick={function () {
                handleOAuth("apple");
              }}
              disabled={loading}
              icon=""
            />
            <AuthButton
              label={t.google}
              bg="rgba(255,255,255,0.06)"
              color={T.white}
              border={"1px solid " + T.border}
              onClick={function () {
                handleOAuth("google");
              }}
              disabled={loading}
              icon="G"
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "8px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <div style={{ fontSize: 12, color: T.muted }}>{t.or}</div>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            <AuthButton
              label={t.email}
              bg={T.tealD}
              color={T.white}
              onClick={function () {
                setMode("email");
                setError("");
              }}
              disabled={loading}
            />

            {allowGuest ? (
              <button
                onClick={function () {
                  onComplete({ method: "guest" });
                }}
                style={{
                  marginTop: 4,
                  border: "none",
                  background: "transparent",
                  color: T.sub,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "12px 8px",
                }}
              >
                {t.guest}
              </button>
            ) : null}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field
              label={t.emailLabel}
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />
            {!useMagic ? (
              <Field
                label={t.passwordLabel}
                value={password}
                onChange={setPassword}
                type="password"
                autoComplete="current-password"
              />
            ) : null}

            <button
              onClick={function () {
                setUseMagic(!useMagic);
                setError("");
              }}
              style={{
                border: "none",
                background: "transparent",
                color: T.teal,
                fontSize: 12,
                fontWeight: 700,
                textAlign: "left",
                padding: 0,
              }}
            >
              {t.magic}
            </button>

            {error ? (
              <div style={{ fontSize: 12, color: T.danger, fontWeight: 600 }}>
                {error}
              </div>
            ) : null}

            <AuthButton
              label={loading ? "..." : t.continueEmail}
              bg={T.tealD}
              color={T.white}
              onClick={handleEmail}
              disabled={loading}
            />

            <button
              onClick={function () {
                setMode("landing");
                setError("");
              }}
              style={{
                border: "none",
                background: "transparent",
                color: T.sub,
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 8px",
              }}
            >
              {t.back}
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", paddingTop: 18 }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>
          {t.trust}
        </div>
        <div style={{ fontSize: 12, color: T.muted }}>
          <button
            onClick={onOpenTerms}
            style={{
              border: "none",
              background: "transparent",
              color: T.sub,
              fontWeight: 700,
              padding: "0 6px",
            }}
          >
            {t.terms}
          </button>
          ·
          <button
            onClick={onOpenPrivacy}
            style={{
              border: "none",
              background: "transparent",
              color: T.sub,
              fontWeight: 700,
              padding: "0 6px",
            }}
          >
            {t.privacy}
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthButton(props: {
  label: string;
  bg: string;
  color: string;
  border?: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: string;
}) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        width: "100%",
        border: props.border || "none",
        background: props.bg,
        color: props.color,
        borderRadius: 16,
        padding: "14px 16px",
        fontSize: 15,
        fontWeight: 800,
        opacity: props.disabled ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {props.icon ? <span style={{ fontSize: 16 }}>{props.icon}</span> : null}
      {props.label}
    </button>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: T.muted,
          marginBottom: 6,
          letterSpacing: 0.4,
        }}
      >
        {props.label}
      </div>
      <input
        value={props.value}
        type={props.type || "text"}
        autoComplete={props.autoComplete}
        onChange={function (e) {
          props.onChange(e.target.value);
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 14,
          border: "1px solid " + T.border,
          background: "rgba(255,255,255,0.04)",
          color: T.white,
          padding: "13px 14px",
          fontSize: 15,
          outline: "none",
        }}
      />
    </label>
  );
}
