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

export type PaywallPlan = "monthly" | "yearly";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubscribe: (plan: PaywallPlan) => void | Promise<void>;
  onRestore?: () => void | Promise<void>;
  monthlyPrice?: string;
  yearlyPrice?: string;
  yearlyPerMonth?: string;
  locale?: "en" | "ar";
  purchaseEnabled?: boolean;
  trialLabel?: string | null;
  busy?: boolean;
  statusLabel?: string | null;
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
    continue: "Continue",
    unavailable: "Purchases are not available yet",
    restore: "Restore purchases",
    legal: "Terms · Privacy",
    renew: "Price and renewal terms are provided by the App Store purchase sheet.",
    loadingPrice: "Loading from App Store…",
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
    continue: "متابعة",
    unavailable: "المشتريات غير متاحة بعد",
    restore: "استعادة المشتريات",
    legal: "الشروط · الخصوصية",
    renew: "يعرض متجر App Store السعر وشروط التجديد عند الشراء.",
    loadingPrice: "جارٍ تحميل السعر من App Store…",
  },
};

export default function PaywallSheet({
  open,
  onClose,
  onSubscribe,
  onRestore,
  monthlyPrice,
  yearlyPrice,
  yearlyPerMonth,
  locale = "en",
  purchaseEnabled = false,
  trialLabel = null,
  busy = false,
  statusLabel = null,
}: Props) {
  const [plan, setPlan] = useState<PaywallPlan>("yearly");
  if (!open) return null;

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const canPurchase = purchaseEnabled && !busy && Boolean(monthlyPrice && yearlyPrice);
  const cta = busy ? "…" : canPurchase ? (trialLabel || t.continue) : t.unavailable;

  return (
    <div dir={dir} onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(2,6,23,0.72)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width:"100%", maxWidth:480, background:`linear-gradient(180deg, ${T.card} 0%, ${T.bg} 100%)`, borderRadius:"28px 28px 0 0", borderTop:`1px solid ${T.border}`, padding:"18px 20px 28px", color:T.text }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><div style={{ width:42, height:4, borderRadius:99, background:"rgba(148,163,184,0.35)" }}/></div>

        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em", marginBottom:6 }}>{t.title}</div>
          <div style={{ fontSize:13, color:T.sub, lineHeight:1.45 }}>{t.subtitle}</div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
          {t.features.map((feature, index) => (
            <div key={index} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:T.text }}>
              <span style={{ color:T.teal, fontWeight:900, marginTop:1 }}>✓</span>
              <span style={{ lineHeight:1.4 }}>{feature}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <PlanCard active={plan === "monthly"} title={t.monthly} price={monthlyPrice || t.loadingPrice} onClick={() => setPlan("monthly")} />
          <PlanCard active={plan === "yearly"} title={t.yearly} price={yearlyPrice || t.loadingPrice} sub={yearlyPerMonth} badge={yearlyPrice ? t.best : undefined} onClick={() => setPlan("yearly")} />
        </div>

        {statusLabel ? <div role="status" style={{ textAlign:"center", fontSize:12, color:T.sub, marginBottom:10 }}>{statusLabel}</div> : null}

        <button disabled={!canPurchase} onClick={() => { if (canPurchase) void onSubscribe(plan); }} style={{ width:"100%", border:"none", borderRadius:16, padding:"14px 16px", background:T.tealD, color:T.white, fontSize:15, fontWeight:800, marginBottom:10, opacity:canPurchase ? 1 : 0.5, cursor:canPurchase ? "pointer" : "not-allowed" }}>
          {cta}
        </button>

        {onRestore ? (
          <button disabled={busy} onClick={() => { if (!busy) void onRestore(); }} style={{ width:"100%", border:"none", background:"transparent", color:T.sub, fontSize:13, fontWeight:700, padding:8, marginBottom:8, opacity:busy ? 0.5 : 1 }}>
            {t.restore}
          </button>
        ) : null}

        <div style={{ textAlign:"center", fontSize:11, color:T.muted, lineHeight:1.45 }}>
          <div>{t.renew}</div>
          <div style={{ marginTop:4 }}>{t.legal}</div>
        </div>
      </div>
    </div>
  );
}

function PlanCard(props: { active:boolean; title:string; price:string; sub?:string; badge?:string; onClick:() => void }) {
  return (
    <button onClick={props.onClick} style={{ flex:1, textAlign:"left", borderRadius:16, padding:"12px 12px", border:props.active ? `1.5px solid ${T.teal}` : `1px solid ${T.border}`, background:props.active ? "rgba(13,148,136,0.14)" : "rgba(255,255,255,0.03)", color:T.text, position:"relative" }}>
      {props.badge ? <div style={{ position:"absolute", top:-8, right:10, fontSize:9, fontWeight:800, background:T.gold, color:"#111827", borderRadius:99, padding:"3px 7px" }}>{props.badge}</div> : null}
      <div style={{ fontSize:12, fontWeight:700, color:T.sub }}>{props.title}</div>
      <div style={{ fontSize:16, fontWeight:800, marginTop:4 }}>{props.price}</div>
      {props.sub ? <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{props.sub}</div> : null}
    </button>
  );
}
