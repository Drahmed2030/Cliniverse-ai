"use client";

import { useState } from "react";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  bg: "#0B1220",
  card: "#121A2B",
  white: "#FFFFFF",
  text: "#F8FAFC",
  sub: "#94A3B8",
  muted: "#64748B",
  border: "rgba(148,163,184,0.22)",
  gold: "#FBBF24",
};

type Plan = "monthly" | "yearly";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubscribe: (plan: Plan) => void;
  onRestore?: () => void;
  monthlyPrice?: string;
  yearlyPrice?: string;
  yearlyPerMonth?: string;
  locale?: "en" | "ar";
}

const COPY = {
  en: {
    title: "Cliniverse PRO",
    subtitle: "Unlock the full virtual hospital experience",
    features: [
      "Unlimited Ward cases & live census",
      "Full Patient Journey + SOAP notes",
      "Discharge summary & home instructions",
      "Multi-AI clinical consensus",
      "Priority updates for clinical modules",
    ],
    monthly: "Monthly",
    yearly: "Yearly",
    best: "Best value",
    cta: "Start 7-day free trial",
    restore: "Restore purchases",
    legal: "Cancel anytime · Terms · Privacy",
    renew: "Renews after trial unless cancelled",
  },
  ar: {
    title: "Cliniverse PRO",
    subtitle: "افتح تجربة المستشفى الافتراضي كاملة",
    features: [
      "حالات Ward غير محدودة وتعداد حي",
      "رحلة المريض كاملة + ملاحظات SOAP",
      "ملخص الخروج وتعليمات المنزل",
      "إجماع سريري متعدد الذكاء",
      "تحديثات أولوية للوحدات السريرية",
    ],
    monthly: "شهري",
    yearly: "سنوي",
    best: "أفضل قيمة",
    cta: "ابدأ تجربة 7 أيام مجانًا",
    restore: "استعادة المشتريات",
    legal: "إلغاء في أي وقت · الشروط · الخصوصية",
    renew: "يتجدد بعد التجربة ما لم يُلغَ",
  },
};

export default function PaywallSheet({
  open,
  onClose,
  onSubscribe,
  onRestore,
  monthlyPrice = "$14.99",
  yearlyPrice = "$99.99",
  yearlyPerMonth = "$8.33/mo",
  locale = "en",
}: Props) {
  const [plan, setPlan] = useState<Plan>("yearly");
  if (!open) return null;

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(2,6,23,0.72)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={function (e) {
          e.stopPropagation();
        }}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(180deg, " + T.card + " 0%, " + T.bg + " 100%)",
          borderRadius: "28px 28px 0 0",
          borderTop: "1px solid " + T.border,
          padding: "18px 20px 28px",
          color: T.text,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <div
            style={{
              width: 42,
              height: 4,
              borderRadius: 99,
              background: "rgba(148,163,184,0.35)",
            }}
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            {t.title}
          </div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.45 }}>
            {t.subtitle}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {t.features.map(function (f, i) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 13,
                  color: T.text,
                }}
              >
                <span style={{ color: T.teal, fontWeight: 900, marginTop: 1 }}>✓</span>
                <span style={{ lineHeight: 1.4 }}>{f}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <PlanCard
            active={plan === "monthly"}
            title={t.monthly}
            price={monthlyPrice}
            onClick={function () {
              setPlan("monthly");
            }}
          />
          <PlanCard
            active={plan === "yearly"}
            title={t.yearly}
            price={yearlyPrice}
            sub={yearlyPerMonth}
            badge={t.best}
            onClick={function () {
              setPlan("yearly");
            }}
          />
        </div>

        <button
          onClick={function () {
            onSubscribe(plan);
          }}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 16,
            padding: "14px 16px",
            background: T.tealD,
            color: T.white,
            fontSize: 15,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          {t.cta}
        </button>

        {onRestore ? (
          <button
            onClick={onRestore}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: T.sub,
              fontSize: 13,
              fontWeight: 700,
              padding: "8px",
              marginBottom: 8,
            }}
          >
            {t.restore}
          </button>
        ) : null}

        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: T.muted,
            lineHeight: 1.45,
          }}
        >
          <div>{t.renew}</div>
          <div style={{ marginTop: 4 }}>{t.legal}</div>
        </div>
      </div>
    </div>
  );
}

function PlanCard(props: {
  active: boolean;
  title: string;
  price: string;
  sub?: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        flex: 1,
        textAlign: "left",
        borderRadius: 16,
        padding: "12px 12px",
        border: props.active ? "1.5px solid " + T.teal : "1px solid " + T.border,
        background: props.active ? "rgba(13,148,136,0.14)" : "rgba(255,255,255,0.03)",
        color: T.text,
        position: "relative",
      }}
    >
      {props.badge ? (
        <div
          style={{
            position: "absolute",
            top: -8,
            right: 10,
            fontSize: 9,
            fontWeight: 800,
            background: T.gold,
            color: "#111827",
            borderRadius: 99,
            padding: "3px 7px",
          }}
        >
          {props.badge}
        </div>
      ) : null}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>{props.title}</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{props.price}</div>
      {props.sub ? (
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{props.sub}</div>
      ) : null}
    </button>
  );
}
