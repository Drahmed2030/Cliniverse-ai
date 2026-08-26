"use client";

import { useState } from "react";
import {
  signInWithMagicLink,
  signInWithOAuth,
  signInWithPassword,
  type CliniverseAuthProvider,
} from "../lib/identity";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  bg: "#070B14",
  white: "#FFFFFF",
  text: "#F8FAFC",
  sub: "#94A3B8",
  muted: "#64748B",
  border: "rgba(148,163,184,0.22)",
  danger: "#F87171",
  success: "#34D399",
};

type Mode = "landing" | "email";

interface Props {
  onComplete: (payload?: {
    method: "apple" | "google" | "email" | "guest";
    email?: string;
  }) => void;
  allowGuest?: boolean;
  locale?: "en" | "ar";
  enabledOAuthProviders?: CliniverseAuthProvider[];
}

const COPY = {
  en: {
    kicker: "CLINIVERSE",
    title: "Sign in to save your progress",
    subtitle: "Use an existing Cliniverse account. Account creation is not enabled in this release.",
    apple: "Continue with Apple",
    google: "Continue with Google",
    unavailable: "Not configured",
    email: "Continue with Email",
    or: "or",
    emailLabel: "Email",
    passwordLabel: "Password",
    magic: "Use a magic link instead",
    password: "Use password instead",
    continueEmail: "Continue",
    back: "Back",
    guest: "Continue as guest",
    trust: "Practice safely · Do not enter real patient data",
    terms: "Terms",
    privacy: "Privacy",
    emailError: "Enter a valid email",
    passwordError: "Password must be at least 8 characters",
    genericError: "Sign-in failed. Please check that this account already exists.",
    magicSent: "Check your email for the secure sign-in link.",
  },
  ar: {
    kicker: "CLINIVERSE",
    title: "سجّل دخولك لحفظ تقدمك",
    subtitle: "استخدم حساب Cliniverse موجودًا. إنشاء الحسابات غير مفعّل في هذا الإصدار.",
    apple: "المتابعة مع Apple",
    google: "المتابعة مع Google",
    unavailable: "غير مفعّل",
    email: "المتابعة بالبريد",
    or: "أو",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    magic: "استخدم رابط دخول سريع",
    password: "استخدم كلمة المرور",
    continueEmail: "متابعة",
    back: "رجوع",
    guest: "المتابعة كزائر",
    trust: "تدرّب بأمان · لا تُدخل بيانات مرضى حقيقية",
    terms: "الشروط",
    privacy: "الخصوصية",
    emailError: "أدخل بريدًا صالحًا",
    passwordError: "كلمة المرور 8 أحرف على الأقل",
    genericError: "تعذر تسجيل الدخول. تحقق من أن الحساب موجود مسبقًا.",
    magicSent: "تحقق من بريدك للحصول على رابط الدخول الآمن.",
  },
};

export default function AuthScreen({
  onComplete,
  allowGuest = true,
  locale = "en",
  enabledOAuthProviders = [],
}: Props) {
  const [mode, setMode] = useState<Mode>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagic, setUseMagic] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function handleOAuth(method: CliniverseAuthProvider) {
    if (loading || !enabledOAuthProviders.includes(method)) return;
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error: authError } = await signInWithOAuth(method, redirectTo);
      if (authError) {
        setError(authError.message || t.genericError);
        return;
      }
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail() {
    setError("");
    setNotice("");
    const normalizedEmail = email.trim();
    if (!validEmail(normalizedEmail)) {
      setError(t.emailError);
      return;
    }
    if (!useMagic && password.trim().length < 8) {
      setError(t.passwordError);
      return;
    }

    setLoading(true);
    try {
      if (useMagic) {
        const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
        const { error: authError } = await signInWithMagicLink(normalizedEmail, redirectTo);
        if (authError) {
          setError(authError.message || t.genericError);
          return;
        }
        setNotice(t.magicSent);
        return;
      }

      const { data, error: authError } = await signInWithPassword(normalizedEmail, password);
      if (authError || !data.session || !data.user) {
        setError(authError?.message || t.genericError);
        return;
      }
      onComplete({ method: "email", email: normalizedEmail });
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={dir} style={{ minHeight: "100dvh", background: "linear-gradient(180deg, " + T.bg + " 0%, #0B1220 55%, #0A1F1C 100%)", color: T.text, display: "flex", flexDirection: "column", padding: "28px 20px 24px", boxSizing: "border-box" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420, width: "100%", margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: T.teal, marginBottom: 10 }}>{t.kicker}</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>{t.title}</div>
          <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.5 }}>{t.subtitle}</div>
        </div>

        {mode === "landing" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AuthButton label={t.apple} badge={!enabledOAuthProviders.includes("apple") ? t.unavailable : undefined} bg={T.white} color="#0F172A" onClick={() => handleOAuth("apple")} disabled={loading || !enabledOAuthProviders.includes("apple")} icon="" />
            <AuthButton label={t.google} badge={!enabledOAuthProviders.includes("google") ? t.unavailable : undefined} bg="rgba(255,255,255,0.06)" color={T.white} border={"1px solid " + T.border} onClick={() => handleOAuth("google")} disabled={loading || !enabledOAuthProviders.includes("google")} icon="G" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0" }}><div style={{ flex: 1, height: 1, background: T.border }} /><div style={{ fontSize: 12, color: T.muted }}>{t.or}</div><div style={{ flex: 1, height: 1, background: T.border }} /></div>
            <AuthButton label={t.email} bg={T.tealD} color={T.white} onClick={() => { setMode("email"); setError(""); setNotice(""); }} disabled={loading} />
            {allowGuest ? <button onClick={() => onComplete({ method: "guest" })} style={{ marginTop: 4, border: "none", background: "transparent", color: T.sub, fontSize: 13, fontWeight: 700, padding: "12px 8px" }}>{t.guest}</button> : null}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label={t.emailLabel} value={email} onChange={setEmail} type="email" autoComplete="email" />
            {!useMagic ? <Field label={t.passwordLabel} value={password} onChange={setPassword} type="password" autoComplete="current-password" /> : null}
            <button onClick={() => { setUseMagic(!useMagic); setError(""); setNotice(""); }} style={{ border: "none", background: "transparent", color: T.teal, fontSize: 12, fontWeight: 700, textAlign: "left", padding: 0 }}>{useMagic ? t.password : t.magic}</button>
            {error ? <div role="alert" style={{ fontSize: 12, color: T.danger, fontWeight: 600 }}>{error}</div> : null}
            {notice ? <div role="status" style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>{notice}</div> : null}
            <AuthButton label={loading ? "..." : t.continueEmail} bg={T.tealD} color={T.white} onClick={handleEmail} disabled={loading} />
            <button onClick={() => { setMode("landing"); setError(""); setNotice(""); }} style={{ border: "none", background: "transparent", color: T.sub, fontSize: 13, fontWeight: 700, padding: "10px 8px" }}>{t.back}</button>
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", paddingTop: 18 }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{t.trust}</div>
        <div style={{ fontSize: 12, color: T.muted }}>
          <a href="/terms" style={{ color: T.sub, fontWeight: 700, padding: "0 6px", textDecoration: "none" }}>{t.terms}</a> · <a href="/privacy" style={{ color: T.sub, fontWeight: 700, padding: "0 6px", textDecoration: "none" }}>{t.privacy}</a>
        </div>
      </div>
    </div>
  );
}

function AuthButton(props: { label: string; bg: string; color: string; border?: string; onClick: () => void; disabled?: boolean; icon?: string; badge?: string; }) {
  return <button onClick={props.onClick} disabled={props.disabled} style={{ width: "100%", border: props.border || "none", background: props.bg, color: props.color, borderRadius: 16, padding: "14px 16px", fontSize: 15, fontWeight: 800, opacity: props.disabled ? 0.55 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{props.icon ? <span style={{ fontSize: 16 }}>{props.icon}</span> : null}<span>{props.label}</span>{props.badge ? <span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>· {props.badge}</span> : null}</button>;
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; }) {
  return <label style={{ display: "block" }}><div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, letterSpacing: 0.4 }}>{props.label}</div><input value={props.value} type={props.type || "text"} autoComplete={props.autoComplete} onChange={(e) => props.onChange(e.target.value)} style={{ width: "100%", boxSizing: "border-box", borderRadius: 14, border: "1px solid " + T.border, background: "rgba(255,255,255,0.04)", color: T.white, padding: "13px 14px", fontSize: 15, outline: "none" }} /></label>;
}
