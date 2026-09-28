"use client";

import { useState } from "react";
import {
  signInWithMagicLink,
  signInWithOAuth,
  signInWithPassword,
  signUpWithPassword,
  type CliniverseAuthProvider,
} from "../lib/identity";
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from "../lib/nativeSafeArea";
import { useAppearance } from "./release/AppearanceSettings";

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
    title: "Continue your learning record.",
    subtitle: "Sign in to sync progress and continue where you left off.",
    releaseNote: "Your Cliniverse account stores learning progress. Do not enter real patient-identifiable information.",
    apple: "Continue with Apple",
    google: "Continue with Google",
    email: "Continue with email",
    or: "or",
    emailLabel: "Email",
    passwordLabel: "Password",
    magic: "Use a secure email link instead",
    password: "Use password instead",
    continueEmail: "Sign in",
    createAccount: "Create account",
    existingAccount: "Already have an account? Sign in",
    signupSent: "Check your email to confirm your account, then return to Cliniverse.",
    back: "Back",
    guest: "Explore as guest",
    trust: "Private learning account · Human clinical judgment remains essential",
    terms: "Terms",
    privacy: "Privacy",
    emailError: "Enter a valid email",
    passwordError: "Password must be at least 8 characters",
    genericError: "Sign-in failed. Please check that this account already exists.",
    magicSent: "Check your email for the secure sign-in link.",
  },
  ar: {
    kicker: "CLINIVERSE AI · من NEURAOPS",
    title: "تابع سجل تعلّمك.",
    subtitle: "سجّل الدخول لمزامنة التقدم والمتابعة من حيث توقفت.",
    releaseNote: "يحفظ حساب Cliniverse تقدمك التعليمي. لا تدخل بيانات تعريفية حقيقية للمرضى.",
    apple: "المتابعة مع Apple",
    google: "المتابعة مع Google",
    email: "المتابعة بالبريد الإلكتروني",
    or: "أو",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    magic: "استخدم رابط دخول آمن عبر البريد",
    password: "استخدم كلمة المرور",
    continueEmail: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    existingAccount: "لديك حساب؟ سجّل الدخول",
    signupSent: "تحقق من بريدك لتأكيد الحساب، ثم ارجع إلى Cliniverse.",
    back: "رجوع",
    guest: "استكشف كزائر",
    trust: "حساب تعليمي خاص · الحكم السريري البشري يظل أساسياً",
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
  const appearance = useAppearance();
  const [mode, setMode] = useState<Mode>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagic, setUseMagic] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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

      if (isSignUp) {
        const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
        const { data, error: authError } = await signUpWithPassword(normalizedEmail, password, redirectTo);
        if (authError) {
          setError(authError.message || t.genericError);
          return;
        }
        if (data.session && data.user) {
          onComplete({ method: "email", email: normalizedEmail });
          return;
        }
        setNotice(t.signupSent);
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
    <main
      dir={dir}
      data-commercial-shell
      data-appearance={appearance}
      data-auth-entry
      aria-labelledby="cliniverse-auth-title"
      className="cv-auth"
      style={{
        paddingTop: `max(24px, ${NATIVE_SAFE_AREA_TOP})`,
        paddingRight: `max(20px, ${NATIVE_SAFE_AREA_RIGHT})`,
        paddingBottom: `max(24px, ${NATIVE_SAFE_AREA_BOTTOM})`,
        paddingLeft: `max(20px, ${NATIVE_SAFE_AREA_LEFT})`,
      }}
    >
      <div className="cv-auth-frame">
        <ProductMark />
        <div className="cv-auth-intro">
          <p className="cv-auth-kicker">{t.kicker}</p>
          <h1 id="cliniverse-auth-title">{t.title}</h1>
          <p className="cv-auth-subtitle">{t.subtitle}</p>
          <p className="cv-auth-note">{t.releaseNote}</p>
        </div>

        <section className="cv-auth-surface" aria-label={locale === "ar" ? "خيارات تسجيل الدخول" : "Sign-in options"}>
          {mode === "landing" ? (
            <div className="cv-auth-stack">
              {appleEnabled ? <AuthButton label={t.apple} kind="apple" onClick={() => handleOAuth("apple")} disabled={loading} icon="" /> : null}
              {googleEnabled ? <AuthButton label={t.google} kind="secondary" onClick={() => handleOAuth("google")} disabled={loading} icon="G" /> : null}
              {oauthEnabled ? <div className="cv-auth-divider"><span />{t.or}<span /></div> : null}
              <AuthButton label={t.email} kind="primary" onClick={() => { setIsSignUp(false); setMode("email"); setError(""); setNotice(""); }} disabled={loading} />
              <AuthButton label={t.createAccount} kind="secondary" onClick={() => { setIsSignUp(true); setMode("email"); setError(""); setNotice(""); }} disabled={loading} />
              {allowGuest ? <button className="cv-auth-quiet" onClick={() => onComplete({ method: "guest" })}>{t.guest}</button> : null}
            </div>
          ) : (
            <div className="cv-auth-stack">
              <Field label={t.emailLabel} value={email} onChange={setEmail} type="email" autoComplete="email" />
              {!magicLinkMode ? <Field label={t.passwordLabel} value={password} onChange={setPassword} type="password" autoComplete={isSignUp ? "new-password" : "current-password"} /> : null}
              {enableMagicLink ? <button className="cv-auth-link" onClick={() => { setUseMagic(!useMagic); setError(""); setNotice(""); }}>{magicLinkMode ? t.password : t.magic}</button> : null}
              {error ? <div role="alert" className="cv-auth-error">{error}</div> : null}
              {notice ? <div role="status" className="cv-auth-success">{notice}</div> : null}
              <AuthButton label={loading ? "…" : isSignUp ? t.createAccount : t.continueEmail} kind="primary" onClick={handleEmail} disabled={loading} />
              {isSignUp ? <button className="cv-auth-link cv-auth-link-center" onClick={() => { setIsSignUp(false); setError(""); setNotice(""); }}>{t.existingAccount}</button> : null}
              <button className="cv-auth-quiet" onClick={() => { setMode("landing"); setIsSignUp(false); setError(""); setNotice(""); }}>{t.back}</button>
            </div>
          )}
        </section>

        <footer className="cv-auth-footer">
          <p>{t.trust}</p>
          <p><a href="/terms">{t.terms}</a><span aria-hidden="true"> · </span><a href="/privacy">{t.privacy}</a></p>
        </footer>
      </div>
      <style>{AUTH_CSS}</style>
    </main>
  );
}

function ProductMark() {
  return (
    <div className="cv-auth-mark" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <path d="M35 14.5C31.8 10.8 27.3 8.8 22.5 8.8C14.7 8.8 8.5 15 8.5 22.8C8.5 30.6 14.7 36.8 22.5 36.8C27.3 36.8 31.8 34.8 35 31" stroke="var(--cv-blue)" strokeWidth="4.7" strokeLinecap="round" />
        <path d="M17 23L22.5 29.2L35 16.6" stroke="var(--cv-teal)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="35" cy="14.5" r="2.8" fill="var(--cv-surface-elevated)" />
        <circle cx="35" cy="31" r="2.7" fill="var(--cv-violet)" />
      </svg>
    </div>
  );
}

function AuthButton(props: { label: string; kind: "primary" | "secondary" | "apple"; onClick: () => void; disabled?: boolean; icon?: string }) {
  return <button type="button" onClick={props.onClick} disabled={props.disabled} className="cv-auth-button" data-kind={props.kind}>{props.icon ? <span aria-hidden="true">{props.icon}</span> : null}<span>{props.label}</span></button>;
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string }) {
  return <label className="cv-auth-field"><span>{props.label}</span><input aria-label={props.label} value={props.value} type={props.type || "text"} autoComplete={props.autoComplete} onChange={(e) => props.onChange(e.target.value)} /></label>;
}

const AUTH_CSS = `
.cv-auth {
  min-height: 100dvh;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  background: var(--cv-bg);
  color: var(--cv-text);
}
.cv-auth-frame { width: min(100%, 430px); display: grid; gap: var(--cv-space-5); }
.cv-auth-mark { display: grid; place-items: center; width: 64px; height: 64px; border-radius: var(--cv-radius-md); background: #0b0f19; border: 1px solid color-mix(in srgb, var(--cv-blue) 32%, var(--cv-border)); }
.cv-auth-intro { display: grid; gap: var(--cv-space-2); }
.cv-auth-kicker { margin: 0; color: var(--cv-blue); font-size: var(--cv-text-eyebrow); font-weight: 800; letter-spacing: .1em; }
.cv-auth-intro h1 { margin: 0; font-size: var(--cv-text-display); line-height: 1.1; letter-spacing: -.025em; }
.cv-auth-subtitle { margin: 0; color: var(--cv-text-secondary); font-size: 1rem; line-height: 1.5; }
.cv-auth-note { margin: 0; color: var(--cv-text-secondary); font-size: var(--cv-text-support); line-height: 1.5; }
.cv-auth-surface { padding: var(--cv-space-4); border: 1px solid var(--cv-border); border-radius: var(--cv-radius-md); background: var(--cv-surface-elevated); }
.cv-auth-stack { display: grid; gap: var(--cv-space-3); }
.cv-auth-button { width: 100%; min-height: 50px; border-radius: var(--cv-radius-sm); padding: 12px 16px; font-size: var(--cv-text-body); font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
.cv-auth-button[data-kind="primary"] { border: 1px solid transparent; background: var(--cv-blue); color: #fff; }
.cv-auth-button[data-kind="secondary"] { border: 1px solid var(--cv-border); background: var(--cv-surface-soft); color: var(--cv-text); }
.cv-auth-button[data-kind="apple"] { border: 1px solid var(--cv-text); background: var(--cv-text); color: var(--cv-bg); }
.cv-auth-button:disabled { opacity: .55; cursor: default; }
.cv-auth-divider { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--cv-space-3); color: var(--cv-text-secondary); font-size: var(--cv-text-caption); }
.cv-auth-divider span { height: 1px; background: var(--cv-border); }
.cv-auth-field { display: grid; gap: var(--cv-space-1); color: var(--cv-text-secondary); font-size: var(--cv-text-support); font-weight: 700; }
.cv-auth-field input { min-height: 48px; width: 100%; box-sizing: border-box; border: 1px solid var(--cv-border); border-radius: var(--cv-radius-sm); background: var(--cv-surface); color: var(--cv-text); padding: 12px 14px; font-size: 1rem; }
.cv-auth-link,.cv-auth-quiet { min-height: 44px; border: 0; background: transparent; cursor: pointer; }
.cv-auth-link { color: var(--cv-blue); font-size: var(--cv-text-support); font-weight: 800; text-align: start; padding: 0; }
.cv-auth-link-center { text-align: center; }
.cv-auth-quiet { color: var(--cv-text-secondary); font-size: var(--cv-text-support); font-weight: 700; }
.cv-auth-error { color: var(--cv-learning-danger); font-size: var(--cv-text-support); font-weight: 700; }
.cv-auth-success { color: color-mix(in srgb, var(--cv-teal) 72%, var(--cv-text)); font-size: var(--cv-text-support); font-weight: 700; }
.cv-auth-footer { text-align: center; color: var(--cv-text-secondary); font-size: var(--cv-text-caption); line-height: 1.5; }
.cv-auth-footer p { margin: 0 0 var(--cv-space-1); }
.cv-auth-footer a { color: var(--cv-text-secondary); font-weight: 700; }
@media (max-height: 700px) { .cv-auth { place-items: start center; } }
`;
