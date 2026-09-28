'use client'

import { useState } from 'react'
import { BookOpen, Check, HeartPulse, RotateCcw, type LucideIcon } from 'lucide-react'
import type { StoreProduct } from '../lib/storekit-purchase-contract'
import { NATIVE_SAFE_AREA_BOTTOM } from '../lib/nativeSafeArea'
import { useAppearance } from './release/AppearanceSettings'

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

interface CapabilityGroup {
  icon: LucideIcon
  title: string
  items: string[]
}

const COPY = {
  en: {
    eyebrow: "CLINIVERSE PRO",
    title: "More deliberate practice, in one place.",
    subtitle: "Unlock the current reviewed learning experiences and keep your practice history connected.",
    groups: [
      { icon: HeartPulse, title: "ECG · Echo · Ward", items: ["Governed ECG interpretation", "Licensed Echo cine learning", "Seven current Ward decision cases"] },
      { icon: BookOpen, title: "Pathway · Reference", items: ["Pathway Replay learning", "Source-linked clinical reference tools"] },
      { icon: RotateCcw, title: "Progress · Review", items: ["Saved activity, review history and what to revisit next"] },
    ] as CapabilityGroup[],
    monthly: "Monthly", yearly: "Yearly", annual: "Annual",
    continueStore: "Continue with App Store",
    unavailable: "App Store plans are not available right now",
    restore: "Restore purchases",
    renew: "The App Store confirms price, billing period and any eligible offer before purchase. Auto-renews unless cancelled in Settings.",
    loadingPrice: "Loading plans from App Store…",
  },
  ar: {
    eyebrow: "CLINIVERSE PRO",
    title: "ممارسة سريرية أعمق في مكان واحد.",
    subtitle: "افتح تجارب التعلّم المُراجعة الحالية واحتفظ بسجل ممارستك مترابطًا.",
    groups: [
      { icon: HeartPulse, title: "ECG · Echo · Ward", items: ["تفسير ECG منظم", "تعلّم Echo بمقاطع مرخصة", "سبع حالات Ward لاتخاذ القرار"] },
      { icon: BookOpen, title: "المسار · المراجع", items: ["Pathway Replay التعليمي", "مراجع سريرية مرتبطة بالمصادر"] },
      { icon: RotateCcw, title: "التقدم · المراجعة", items: ["النشاط المحفوظ وسجل المراجعة وما ينبغي مراجعته لاحقًا"] },
    ] as CapabilityGroup[],
    monthly: "شهري", yearly: "سنوي", annual: "سنوي",
    continueStore: "المتابعة عبر App Store",
    unavailable: "خطط App Store غير متاحة الآن",
    restore: "استعادة المشتريات",
    renew: "يؤكد App Store السعر وفترة الفوترة وأي عرض مؤهل قبل الشراء. يتجدد الاشتراك تلقائيًا ما لم يتم إلغاؤه من الإعدادات.",
    loadingPrice: "جارٍ تحميل الخطط من App Store…",
  },
}

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
  const appearance = useAppearance()
  if (!open) return null;

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedProduct = products.find(product => product.plan === plan) || products[0]
  const selectedPlan = selectedProduct?.plan || plan
  const canPurchase = purchaseEnabled && !busy && Boolean(selectedProduct?.displayPrice)
  const cta = busy ? "…" : canPurchase ? t.continueStore : t.unavailable;

  return (
    <div dir={dir} onClick={onClose} className="cv-paywall-scrim" data-commercial-shell data-appearance={appearance}>
      <div role="dialog" aria-modal="true" aria-labelledby="cliniverse-pro-title" onClick={(e) => e.stopPropagation()} className="cv-paywall-sheet">
        <div className="cv-paywall-top">
          <button type="button" aria-label="Close Cliniverse PRO plans" onClick={onClose} className="cv-paywall-back">{locale === 'ar' ? 'رجوع' : 'Back'}</button>
          {onRestore ? <button type="button" disabled={busy} onClick={() => { if (!busy) void onRestore(); }} className="cv-paywall-restore-top">{locale === 'ar' ? 'استعادة' : 'Restore'}</button> : null}
        </div>

        <div className="cv-paywall-intro">
          <div className="cv-paywall-eyebrow">{t.eyebrow}</div>
          <h2 id="cliniverse-pro-title" className="cv-paywall-title">{t.title}</h2>
          <p className="cv-paywall-subtitle">{t.subtitle}</p>
        </div>

        <div className="cv-paywall-groups">
          {t.groups.map(group => {
            const Icon = group.icon
            return (
              <section key={group.title} className="cv-paywall-group">
                <div className="cv-paywall-group-header">
                  <Icon size={16} color="var(--cv-blue)" strokeWidth={2} aria-hidden="true" />
                  <span>{group.title}</span>
                </div>
                {group.items.map(item => (
                  <div key={item} className="cv-paywall-feature">
                    <Check size={13} strokeWidth={3} aria-hidden="true" className="cv-paywall-check" />
                    <span>{item}</span>
                  </div>
                ))}
              </section>
            )
          })}
        </div>

        {products.length > 0 ? (
          <div className="cv-paywall-plans">
            {products.map(product => (
              <PlanCard
                key={product.productId}
                active={selectedPlan === product.plan}
                title={product.displayName || (product.plan === 'monthly' ? t.monthly : t.yearly)}
                price={product.displayPrice}
                sub={product.subscriptionPeriod}
                badge={product.plan === 'yearly' ? t.annual : undefined}
                onClick={() => setPlan(product.plan)}
              />
            ))}
          </div>
        ) : (
          <div role="status" aria-live="polite" className="cv-paywall-loading">
            {catalogLoading ? t.loadingPrice : t.unavailable}
          </div>
        )}

        {statusLabel ? <div role="status" aria-live="polite" className="cv-paywall-status">{statusLabel}</div> : null}
        {canPurchase && trialLabel ? <div className="cv-paywall-trial-copy">{trialLabel}</div> : null}

        <button type="button" disabled={!canPurchase} onClick={() => { if (canPurchase) void onSubscribe(selectedPlan); }} className="cv-paywall-cta">
          {cta}
        </button>

        <div className="cv-paywall-legal">
          <div>{t.renew}</div>
          <div className="cv-paywall-links">
            <a href="/terms">{locale === 'ar' ? 'الشروط' : 'Terms'}</a>
            {' · '}
            <a href="/privacy">{locale === 'ar' ? 'الخصوصية' : 'Privacy'}</a>
          </div>
        </div>
      </div>
      <style>{PAYWALL_CSS}</style>
    </div>
  );
}

function PlanCard(props: { active:boolean; title:string; price:string; sub?:string; badge?:string; onClick:() => void }) {
  return (
    <button type="button" aria-pressed={props.active} onClick={props.onClick} className="cv-paywall-plan" data-active={props.active}>
      {props.badge ? <div className="cv-paywall-plan-badge">{props.badge}</div> : null}
      <div className="cv-paywall-plan-title">{props.title}</div>
      <div className="cv-paywall-plan-price">{props.price}</div>
      {props.sub ? <div className="cv-paywall-plan-sub">{props.sub}</div> : null}
    </button>
  );
}

const PAYWALL_CSS = `
  .cv-paywall-scrim {
    position: fixed; inset: 0; z-index: 100; background: rgba(2,6,23,.52);
    display: flex; align-items: flex-end; justify-content: center;
  }
  .cv-paywall-sheet {
    width: 100%; max-width: 480px; max-height: calc(100dvh - 12px); overflow-y: auto;
    background: var(--cv-surface-elevated); border-radius: 24px 24px 0 0;
    border: 1px solid var(--cv-border); border-bottom: none;
    padding: 16px 20px calc(28px + ${NATIVE_SAFE_AREA_BOTTOM}); color: var(--cv-text);
  }
  @media (min-width:700px) {
    .cv-paywall-scrim { align-items:center; padding:24px; }
    .cv-paywall-sheet { border-radius:var(--cv-radius-lg); border-bottom:1px solid var(--cv-border); max-height:min(760px,calc(100dvh - 48px)); }
  }
  .cv-paywall-top { display:flex; align-items:center; justify-content:space-between; min-height:44px; margin-bottom:var(--cv-space-3); }
  .cv-paywall-back,.cv-paywall-restore-top { min-height:44px; border:0; background:transparent; font-size:var(--cv-text-support); font-weight:800; cursor:pointer; }
  .cv-paywall-back { color:var(--cv-text-secondary); }
  .cv-paywall-restore-top { color:var(--cv-blue); }
  .cv-paywall-restore-top:disabled { opacity:.5; cursor:default; }
  .cv-paywall-intro { margin-bottom:var(--cv-space-5); }
  .cv-paywall-eyebrow { color:var(--cv-blue); font-size:var(--cv-text-eyebrow); font-weight:800; letter-spacing:.1em; margin-bottom:var(--cv-space-2); }
  .cv-paywall-title { margin:0; font-size:clamp(1.65rem,7vw,2rem); line-height:1.12; letter-spacing:-.03em; }
  .cv-paywall-subtitle { margin:var(--cv-space-2) 0 0; color:var(--cv-text-secondary); font-size:var(--cv-text-body); line-height:1.5; }
  .cv-paywall-groups { display:grid; gap:var(--cv-space-2); margin-bottom:var(--cv-space-5); }
  .cv-paywall-group { padding:var(--cv-space-3) 0; border-bottom:1px solid var(--cv-border); }
  .cv-paywall-group:first-child { border-top:1px solid var(--cv-border); }
  .cv-paywall-group-header { display:flex; align-items:center; gap:8px; font-size:var(--cv-text-body); font-weight:800; margin-bottom:6px; }
  .cv-paywall-feature { display:flex; gap:9px; align-items:flex-start; color:var(--cv-text-secondary); font-size:var(--cv-text-support); line-height:1.45; padding:2px 0; }
  .cv-paywall-check { color:color-mix(in srgb,var(--cv-teal) 72%,var(--cv-text)); flex-shrink:0; margin-top:2px; }
  .cv-paywall-plans { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:var(--cv-space-4); }
  .cv-paywall-plan { position:relative; min-height:88px; text-align:left; border-radius:var(--cv-radius-sm); padding:12px; border:1px solid var(--cv-border); background:var(--cv-surface); color:var(--cv-text); cursor:pointer; }
  .cv-paywall-plan[data-active="true"] { border:2px solid var(--cv-blue); background:color-mix(in srgb,var(--cv-blue) 7%,var(--cv-surface)); }
  .cv-paywall-plan-badge { position:absolute; top:-8px; right:10px; font-size:9px; font-weight:800; background:var(--cv-gold); color:#111827; border-radius:99px; padding:3px 7px; }
  .cv-paywall-plan-title { font-size:var(--cv-text-support); font-weight:700; color:var(--cv-text-secondary); }
  .cv-paywall-plan-price { font-size:1.125rem; font-weight:800; margin-top:4px; color:var(--cv-text); }
  .cv-paywall-plan-sub { font-size:var(--cv-text-caption); color:var(--cv-text-secondary); margin-top:2px; }
  .cv-paywall-loading { border:1px solid var(--cv-border); border-radius:var(--cv-radius-sm); padding:14px; text-align:center; color:var(--cv-text-secondary); font-size:var(--cv-text-support); margin-bottom:16px; }
  .cv-paywall-status,.cv-paywall-trial-copy { text-align:center; font-size:var(--cv-text-support); color:var(--cv-text-secondary); margin-bottom:10px; }
  .cv-paywall-cta { width:100%; min-height:52px; border:0; border-radius:var(--cv-radius-sm); padding:14px 16px; background:var(--cv-blue); color:#fff; font-size:var(--cv-text-body); font-weight:800; margin-bottom:10px; cursor:pointer; }
  .cv-paywall-cta:disabled { opacity:.5; cursor:not-allowed; }
  .cv-paywall-legal { text-align:center; font-size:var(--cv-text-caption); color:var(--cv-text-secondary); line-height:1.45; }
  .cv-paywall-links { margin-top:4px; }
  .cv-paywall-legal a { color:var(--cv-text-secondary); font-weight:700; }
`
