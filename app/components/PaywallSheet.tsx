'use client'

import { useState } from 'react'
import type { StoreProduct } from '../lib/storekit-purchase-contract'

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
  products?: StoreProduct[];
  locale?: "en" | "ar";
  purchaseEnabled?: boolean;
  trialLabel?: string | null;
  busy?: boolean;
  statusLabel?: string | null;
  catalogLoading?: boolean;
}

const COPY = {
  en: {
    title: "Cliniverse PRO",
    subtitle: "Unlock expanded cardiovascular learning and simulated care workflows",
    features: [
      "Cardiology Operations and QAPAS workflow simulation",
      "Nexus role-based cardiovascular learning",
      "Expanded fictional Ward cases",
      "Related evidence for supported simulation templates",
      "Verified access on your signed-in Cliniverse account",
    ],
    monthly: "Monthly",
    yearly: "Yearly",
    best: "Best value",
    continue: "Continue",
    unavailable: "Purchases are not available yet",
    restore: "Restore purchases",
    legal: "Terms · Privacy",
    renew: "Payment is charged to your Apple ID after confirmation. The subscription renews automatically until canceled. Manage or cancel it in Apple ID subscription settings.",
    loadingPrice: "Loading from App Store…",
  },
  ar: {
    title: "Cliniverse PRO",
    subtitle: "افتح تعليم القلب الموسع ومسارات الرعاية التدريبية",
    features: [
      "محاكاة عمليات القلب ومسار QAPAS",
      "تعليم Nexus لأدوار فريق القلب",
      "حالات Ward تدريبية موسعة",
      "مراجع مرتبطة بقوالب المحاكاة المدعومة",
      "وصول موثق عبر حساب Cliniverse المسجل",
    ],
    monthly: "شهري",
    yearly: "سنوي",
    best: "أفضل قيمة",
    continue: "متابعة",
    unavailable: "المشتريات غير متاحة بعد",
    restore: "استعادة المشتريات",
    legal: "الشروط · الخصوصية",
    renew: "يخصم المبلغ من Apple ID بعد التأكيد. يتجدد الاشتراك تلقائيا حتى تلغيه. تدير الاشتراك أو تلغيه من إعدادات اشتراكات Apple ID.",
    loadingPrice: "جارٍ تحميل السعر من App Store…",
  },
};

export default function PaywallSheet({
  open,
  onClose,
  onSubscribe,
  onRestore,
  products = [],
  locale = "en",
  purchaseEnabled = false,
  trialLabel = null,
  busy = false,
  statusLabel = null,
  catalogLoading = false,
}: Props) {
  const [plan, setPlan] = useState<PaywallPlan>('monthly')
  if (!open) return null;

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedProduct = products.find(product => product.plan === plan) || products[0]
  const selectedPlan = selectedProduct?.plan || plan
  const canPurchase = purchaseEnabled && !busy && Boolean(selectedProduct?.displayPrice)
  const cta = busy ? "…" : canPurchase ? (trialLabel || t.continue) : t.unavailable;

  return (
    <div dir={dir} onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(2,6,23,0.72)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="cliniverse-pro-title" onClick={(e) => e.stopPropagation()} style={{ width:"100%", maxWidth:480, maxHeight:'calc(100dvh - 16px)', overflowY:'auto', background:`linear-gradient(180deg, ${T.card} 0%, ${T.bg} 100%)`, borderRadius:"28px 28px 0 0", borderTop:`1px solid ${T.border}`, padding:'18px 20px calc(28px + env(safe-area-inset-bottom, 0px))', color:T.text, position:'relative' }}>
        <button type="button" aria-label="Close Cliniverse PRO plans" onClick={onClose} style={{ position:'absolute', top:16, right:18, width:34, height:34, borderRadius:99, border:`1px solid ${T.border}`, background:'rgba(255,255,255,0.04)', color:T.sub, fontSize:20, cursor:'pointer' }}>×</button>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><div style={{ width:42, height:4, borderRadius:99, background:"rgba(148,163,184,0.35)" }}/></div>

        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div id="cliniverse-pro-title" style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em", marginBottom:6 }}>{t.title}</div>
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

        {products.length > 0 ? (
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            {products.map(product => (
              <PlanCard
                key={product.productId}
                active={selectedPlan === product.plan}
                title={product.displayName || (product.plan === 'monthly' ? t.monthly : t.yearly)}
                price={product.displayPrice}
                sub={product.subscriptionPeriod}
                badge={product.plan === 'yearly' ? t.best : undefined}
                onClick={() => setPlan(product.plan)}
              />
            ))}
          </div>
        ) : (
          <div role="status" aria-live="polite" style={{ border:`1px solid ${T.border}`, borderRadius:16, padding:14, textAlign:'center', color:T.sub, fontSize:12, marginBottom:16 }}>
            {catalogLoading ? t.loadingPrice : t.unavailable}
          </div>
        )}

        {statusLabel ? <div role="status" aria-live="polite" style={{ textAlign:"center", fontSize:12, color:T.sub, marginBottom:10 }}>{statusLabel}</div> : null}

        <button type="button" disabled={!canPurchase} onClick={() => { if (canPurchase) void onSubscribe(selectedPlan); }} style={{ width:"100%", border:"none", borderRadius:16, padding:"14px 16px", background:T.tealD, color:T.white, fontSize:15, fontWeight:800, marginBottom:10, opacity:canPurchase ? 1 : 0.5, cursor:canPurchase ? "pointer" : "not-allowed" }}>
          {cta}
        </button>

        {onRestore ? (
          <button type="button" disabled={busy} onClick={() => { if (!busy) void onRestore(); }} style={{ width:"100%", border:"none", background:"transparent", color:T.sub, fontSize:13, fontWeight:700, padding:8, marginBottom:8, opacity:busy ? 0.5 : 1 }}>
            {t.restore}
          </button>
        ) : null}

        <div style={{ textAlign:"center", fontSize:11, color:T.muted, lineHeight:1.45 }}>
          <div>{t.renew}</div>
          <div style={{ marginTop:4 }}>
            <a href="/terms" style={{ color:T.sub }}>{locale === 'ar' ? 'الشروط' : 'Terms'}</a>
            {' · '}
            <a href="/privacy" style={{ color:T.sub }}>{locale === 'ar' ? 'الخصوصية' : 'Privacy'}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard(props: { active:boolean; title:string; price:string; sub?:string; badge?:string; onClick:() => void }) {
  return (
    <button type="button" aria-pressed={props.active} onClick={props.onClick} style={{ flex:1, textAlign:"left", borderRadius:16, padding:"12px 12px", border:props.active ? `1.5px solid ${T.teal}` : `1px solid ${T.border}`, background:props.active ? "rgba(13,148,136,0.14)" : "rgba(255,255,255,0.03)", color:T.text, position:"relative", cursor:'pointer' }}>
      {props.badge ? <div style={{ position:"absolute", top:-8, right:10, fontSize:9, fontWeight:800, background:T.gold, color:"#111827", borderRadius:99, padding:"3px 7px" }}>{props.badge}</div> : null}
      <div style={{ fontSize:12, fontWeight:700, color:T.sub }}>{props.title}</div>
      <div style={{ fontSize:16, fontWeight:800, marginTop:4 }}>{props.price}</div>
      {props.sub ? <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{props.sub}</div> : null}
    </button>
  );
}
