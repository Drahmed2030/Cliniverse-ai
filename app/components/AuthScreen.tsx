"use client";

import { useState } from "react";
import {
  signInWithMagicLink,
  signInWithOAuth,
  signInWithPassword,
  type CliniverseAuthProvider,
} from "../lib/identity";
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from "../lib/nativeSafeArea";

const T = {
  bg: "#050814",
  panel: "rgba(15,23,42,.72)",
  text: "#F8FAFC",
  sub: "#A7B0C0",
  muted: "#6F7B91",
  border: "rgba(148,163,184,.18)",
  blue: "#4F7CFF",
  violet: "#7567FF",
  teal: "#2CC9C0",
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
  enableMagicLink?: boolean;
}

const COPY = {
  en: {
    kicker: "CLINIVERSE AI · BY NEURAOPS",
    title: "Welcome back to Cliniverse.",
    subtitle: "Clinical intelligence, organized around you.",
    releaseNote: "Sign in with an existing account to continue your workspace. Account creation is not enabled in this release.",
    apple: "Continue with Apple",
    google: "Continue with Google",
    email: "Continue with email",
    or: "or",
    emailLabel: "Email",
    passwordLabel: "Password",
    magic: "Use a secure email link instead",
    password: "Use password instead",
    continueEmail: "Sign in",
    back: "Back",
    guest: "Explore as guest",
    trust: "Human judgment leads · Privacy-conscious by design",
    terms: "Terms",
    privacy: "Privacy",
    emailError: "Enter a valid email",
    passwordError: "Password must be at least 8 characters",
    genericError: "Sign-in failed. Please check that this account already exists.",
    magicSent: "Check your email for the secure sign-in link.",
  },
  ar: {
    kicker: "CLINIVERSE AI · من NEURAOPS",
    title: "مرحبًا بعودتك إلى Cliniverse.",
    subtitle: "ذكاء سريري منظم حول احتياجاتك.",
    releaseNote: "سجّل الدخول بحساب موجود لمتابعة مساحة عملك. إنشاء الحسابات غير مفعّل في هذا الإصدار.",
    apple: "المتابعة مع Apple",
    google: "المتابعة مع Google",
    email: "المتابعة بالبريد الإلكتروني",
    or: "أو",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    magic: "استخدم رابط دخول آمن عبر البريد",
    password: "استخدم كلمة المرور",
    continueEmail: "تسجيل الدخول",
    back: "رجوع",
    guest: "استكشف كزائر",
    trust: "الحكم السريري يقود · الخصوصية جزء من التصميم",
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
  enableMagicLink = false,
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
  const magicLinkMode = enableMagicLink && useMagic;
  const appleEnabled = enabledOAuthProviders.includes("apple");
  const googleEnabled = enabledOAuthProviders.includes("google");
  const oauthEnabled = appleEnabled || googleEnabled;

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
    if (!magicLinkMode && password.trim().length < 8) {
      setError(t.passwordError);
      return;
    }

    setLoading(true);
    try {
      if (magicLinkMode) {
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
    <div
      dir={dir}
      style={{
        minHeight: "100dvh",
        background: `radial-gradient(circle at 18% 8%, rgba(79,124,255,.18), transparent 28%), radial-gradient(circle at 82% 32%, rgba(117,103,255,.12), transparent 26%), linear-gradient(180deg, ${T.bg} 0%, #080D1A 62%, #07121A 100%)`,
        color: T.text,
        display: "flex",
        flexDirection: "column",
        paddingTop: `calc(28px + ${NATIVE_SAFE_AREA_TOP})`,
        paddingRight: `max(20px, ${NATIVE_SAFE_AREA_RIGHT})`,
        paddingBottom: `calc(24px + ${NATIVE_SAFE_AREA_BOTTOM})`,
        paddingLeft: `max(20px, ${NATIVE_SAFE_AREA_LEFT})`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div aria-hidden="true" style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", marginBottom: 24, background: "linear-gradient(145deg, rgba(79,124,255,.18), rgba(117,103,255,.08))", border: `1px solid ${T.border}`, boxShadow: "0 20px 70px rgba(40,84,255,.14)" }}>
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none"><path d="M34 12.5A16 16 0 1 0 34 35.5" stroke={T.blue} strokeWidth="5" strokeLinecap="round"/><circle cx="29" cy="24" r="3" fill={T.teal}/></svg>
        </div>

        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10, fontWeight: 850, letterSpacing: 1.15, color: T.blue, marginBottom: 10 }}>{t.kicker}</div>
          <div style={{ fontSize: "clamp(30px,8vw,38px)", fontWeight: 850, letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 10 }}>{t.title}</div>
          <div style={{ fontSize: 15, color: T.sub, lineHeight: 1.55 }}>{t.subtitle}</div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 8 }}>{t.releaseNote}</div>
        </div>

        <div style={{ border: `1px solid ${T.border}`, background: T.panel, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderRadius: 24, padding: 16, boxShadow: "0 24px 80px rgba(0,0,0,.24)" }}>
          {mode === "landing" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {appleEnabled ? <AuthButton label={t.apple} bg={T.text} color="#0B1020" onClick={() => handleOAuth("apple")} disabled={loading} icon="" /> : null}
              {googleEnabled ? <AuthButton label={t.google} bg="rgba(255,255,255,.045)" color={T.text} border={`1px solid ${T.border}`} onClick={() => handleOAuth("google")} disabled={loading} icon="G" /> : null}
              {oauthEnabled ? <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "7px 0" }}><div style={{ flex: 1, height: 1, background: T.border }} /><div style={{ fontSize: 11, color: T.muted }}>{t.or}</div><div style={{ flex: 1, height: 1, background: T.border }} /></div> : null}
              <AuthButton label={t.email} bg={`linear-gradient(135deg, ${T.blue}, ${T.violet})`} color={T.text} onClick={() => { setMode("email"); setError(""); setNotice(""); }} disabled={loading} />
              {allowGuest ? <button onClick={() => onComplete({ method: "guest" })} style={{ marginTop: 2, border: "none", background: "transparent", color: T.sub, fontSize: 13, fontWeight: 700, padding: "11px 8px", cursor: "pointer" }}>{t.guest}</button> : null}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label={t.emailLabel} value={email} onChange={setEmail} type="email" autoComplete="email" />
              {!magicLinkMode ? <Field label={t.passwordLabel} value={password} onChange={setPassword} type="password" autoComplete="current-password" /> : null}
              {enableMagicLink ? <button onClick={() => { setUseMagic(!useMagic); setError(""); setNotice(""); }} style={{ border: "none", background: "transparent", color: T.blue, fontSize: 12, fontWeight: 700, textAlign: dir === "rtl" ? "right" : "left", padding: 0, cursor: "pointer" }}>{magicLinkMode ? t.password : t.magic}</button> : null}
              {error ? <div role="alert" style={{ fontSize: 12, color: T.danger, fontWeight: 650 }}>{error}</div> : null}
              {notice ? <div role="status" style={{ fontSize: 12, color: T.success, fontWeight: 650 }}>{notice}</div> : null}
              <AuthButton label={loading ? "…" : t.continueEmail} bg={`linear-gradient(135deg, ${T.blue}, ${T.violet})`} color={T.text} onClick={handleEmail} disabled={loading} />
              <button onClick={() => { setMode("landing"); setError(""); setNotice(""); }} style={{ border: "none", background: "transparent", color: T.sub, fontSize: 13, fontWeight: 700, padding: "10px 8px", cursor: "pointer" }}>{t.back}</button>
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: "center", paddingTop: 18, maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{t.trust}</div>
        <div style={{ fontSize: 12, color: T.muted }}>
          <a href="/terms" style={{ color: T.sub, fontWeight: 700, padding: "0 6px", textDecoration: "none" }}>{t.terms}</a> · <a href="/privacy" style={{ color: T.sub, fontWeight: 700, padding: "0 6px", textDecoration: "none" }}>{t.privacy}</a>
        </div>
      </div>
    </div>
  );
}

function AuthButton(props: { label: string; bg: string; color: string; border?: string; onClick: () => void; disabled?: boolean; icon?: string; }) {
  return <button onClick={props.onClick} disabled={props.disabled} style={{ width: "100%", border: props.border || "none", background: props.bg, color: props.color, borderRadius: 16, padding: "14px 16px", minHeight: 50, fontSize: 15, fontWeight: 800, opacity: props.disabled ? 0.55 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: props.disabled ? "default" : "pointer" }}>{props.icon ? <span aria-hidden="true" style={{ fontSize: 16 }}>{props.icon}</span> : null}<span>{props.label}</span></button>;
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; }) {
  return <label style={{ display: "block" }}><div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, letterSpacing: 0.35 }}>{props.label}</div><input aria-label={props.label} value={props.value} type={props.type || "text"} autoComplete={props.autoComplete} onChange={(e) => props.onChange(e.target.value)} style={{ width: "100%", boxSizing: "border-box", borderRadius: 14, border: `1px solid ${T.border}`, background: "rgba(255,255,255,.035)", color: T.text, padding: "13px 14px", minHeight: 48, fontSize: 16, outline: "none" }} /></label>;
}
