'use client'

import { useState } from 'react'
import { BookOpen, Check, HeartPulse, RotateCcw, Stethoscope, type LucideIcon } from 'lucide-react'
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
    title: "Try Cliniverse PRO free for 7 days",
    subtitle: "Full access across every learning and reference surface. Cancel anytime.",
    trialDefault: "7 days free, then",
    groups: [
      { icon: Stethoscope, title: "Learn & simulate", items: ["Ward Simulation — fictional care-flow cases", "Resuscitation Intelligence — scenario simulation with debrief", "Code Lab — 12 lessons (BLS + ACLS)"] },
      { icon: HeartPulse, title: "Interpret", items: ["ECG Challenge — 7 real ECG cases with multi-image views", "Echo Studies — real cardiac ultrasound with guided assessment"] },
      { icon: BookOpen, title: "Reference & operate", items: ["Clinical Reference — source-linked reference tools with capability-level review status", "Cardiology Operations — full console and Care Beam coordination practice"] },
      { icon: RotateCcw, title: "Track & review", items: ["Pathway Replay — event-based case replay with an evidence trail", "Progress and mastery tracking across every case"] },
    ] as CapabilityGroup[],
    monthly: "Monthly",
    yearly: "Yearly",
    best: "Best value",
    startTrial: "Start my free trial",
    unavailable: "Purchases are not available yet",
    restore: "Restore purchases",
    legal: "Terms · Privacy",
    renew: "Auto-renewing. Cancel anytime in Settings. By continuing, you agree to our Terms and Privacy Policy.",
    loadingPrice: "Loading from App Store…",
  },
  ar: {
    title: "جرّب Cliniverse PRO مجانًا لمدة 7 أيام",
    subtitle: "وصول كامل إلى كل واجهات التعلّم والمرجع. ألغِ في أي وقت.",
    trialDefault: "7 أيام مجانية، ثم",
    groups: [
      { icon: Stethoscope, title: "تعلّم ومارس", items: ["محاكاة Ward — حالات افتراضية لمسار الرعاية", "ذكاء الإنعاش — محاكاة سيناريوهات مع مراجعة الأداء", "معمل الأكواد — 12 درسًا (BLS + ACLS)"] },
      { icon: HeartPulse, title: "فسّر", items: ["تحدي تخطيط القلب — 7 حالات حقيقية بعرض متعدد الصور", "دراسات الإيكو — تصوير قلب حقيقي مع تقييم موجّه"] },
      { icon: BookOpen, title: "مرجع وتشغيل", items: ["المرجع السريري — أدوات مرجعية مرتبطة بالمصادر مع حالة المراجعة لكل قدرة", "عمليات أمراض القلب — وحدة تحكم كاملة وتنسيق Care Beam"] },
      { icon: RotateCcw, title: "تتبّع وراجع", items: ["إعادة تشغيل المسار — إعادة عرض الحالات مع سجل أدلة", "تتبع التقدم والإتقان عبر جميع الحالات"] },
    ] as CapabilityGroup[],
    monthly: "شهري",
    yearly: "سنوي",
    best: "أفضل قيمة",
    startTrial: "ابدأ تجربتي المجانية",
    unavailable: "المشتريات غير متاحة بعد",
    restore: "استعادة المشتريات",
    legal: "الشروط · الخصوصية",
    renew: "يتجدد تلقائيًا. يمكنك الإلغاء في أي وقت من الإعدادات. بالمتابعة، فإنك توافق على الشروط وسياسة الخصوصية.",
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
  const appearance = useAppearance()
  if (!open) return null;

  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedProduct = products.find(product => product.plan === plan) || products[0]
  const selectedPlan = selectedProduct?.plan || plan
  const canPurchase = purchaseEnabled && !busy && Boolean(selectedProduct?.displayPrice)
  const cta = busy ? "…" : canPurchase ? t.startTrial : t.unavailable;
  const trialCopy = trialLabel ?? t.trialDefault

  return (
    <div dir={dir} onClick={onClose} className="cv-paywall-scrim" data-commercial-shell data-appearance={appearance}>
      <div role="dialog" aria-modal="true" aria-labelledby="cliniverse-pro-title" onClick={(e) => e.stopPropagation()} className="cv-paywall-sheet">
        <button type="button" aria-label="Close Cliniverse PRO plans" onClick={onClose} className="cv-paywall-close">×</button>
        <div className="cv-paywall-grabber-row"><div className="cv-paywall-grabber" /></div>

        <div style={{ textAlign: "center", marginBottom: 18, padding: '0 44px' }}>
          <div id="cliniverse-pro-title" className="cv-paywall-title">{t.title}</div>
          <div className="cv-paywall-subtitle">{t.subtitle}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
          {t.groups.map(group => {
            const Icon = group.icon
            return (
              <div key={group.title} className="cv-paywall-group">
                <div className="cv-paywall-group-header">
                  <Icon size={16} color="var(--cv-teal)" strokeWidth={2} aria-hidden="true" />
                  <span>{group.title}</span>
                </div>
                {group.items.map(item => (
                  <div key={item} className="cv-paywall-feature">
                    <Check size={13} strokeWidth={3} aria-hidden="true" className="cv-paywall-check" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )
          })}
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
          <div role="status" aria-live="polite" className="cv-paywall-loading">
            {catalogLoading ? t.loadingPrice : t.unavailable}
          </div>
        )}

        {statusLabel ? <div role="status" aria-live="polite" className="cv-paywall-status">{statusLabel}</div> : null}

        {canPurchase && trialCopy ? <div className="cv-paywall-trial-copy">{trialCopy}</div> : null}

        <button type="button" disabled={!canPurchase} onClick={() => { if (canPurchase) void onSubscribe(selectedPlan); }} className="cv-paywall-cta">
          {cta}
        </button>

        {onRestore ? (
          <button type="button" disabled={busy} onClick={() => { if (!busy) void onRestore(); }} className="cv-paywall-restore">
            {t.restore}
          </button>
        ) : null}

        <div className="cv-paywall-legal">
          <div>{t.renew}</div>
          <div style={{ marginTop:4 }}>
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
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(2, 6, 23, 0.55);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .cv-paywall-sheet {
    width: 100%;
    max-width: 480px;
    max-height: calc(100dvh - 16px);
    overflow-y: auto;
    background: var(--cv-surface-elevated);
    border-radius: 28px 28px 0 0;
    border: 1px solid var(--cv-border);
    border-bottom: none;
    padding: 18px 20px calc(28px + ${NATIVE_SAFE_AREA_BOTTOM});
    color: var(--cv-text);
    position: relative;
  }
  @media (min-width: 700px) {
    .cv-paywall-scrim { align-items: center; padding: 24px; }
    .cv-paywall-sheet { border-radius: var(--cv-radius-xl); border-bottom: 1px solid var(--cv-border); max-height: min(720px, calc(100dvh - 48px)); }
  }
  .cv-paywall-close {
    position: absolute; top: 16px; right: 18px; width: 44px; height: 44px;
    border-radius: 999px; border: 1px solid var(--cv-border); background: var(--cv-surface);
    color: var(--cv-text-secondary); font-size: 20px; cursor: pointer;
    display: grid; place-items: center;
  }
  .cv-paywall-grabber-row { display: flex; justify-content: center; margin-bottom: 10px; }
  .cv-paywall-grabber { width: 42px; height: 4px; border-radius: 99px; background: var(--cv-border); }
  .cv-paywall-title { font-size: clamp(1.25rem, 5.5vw, 1.625rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 6px; color: var(--cv-text); }
  .cv-paywall-subtitle { font-size: 13px; color: var(--cv-text-secondary); line-height: 1.45; }
  .cv-paywall-group { border: 1px solid var(--cv-border); border-radius: var(--cv-radius-md); padding: 12px 14px; background: var(--cv-surface); }
  .cv-paywall-group-header { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.03em; color: var(--cv-text); margin-bottom: 8px; }
  .cv-paywall-feature { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--cv-text-secondary); line-height: 1.45; padding: 3px 0; }
  .cv-paywall-check { color: var(--cv-teal); flex-shrink: 0; margin-top: 2px; }
  .cv-paywall-loading { border: 1px solid var(--cv-border); border-radius: var(--cv-radius-md); padding: 14px; text-align: center; color: var(--cv-text-secondary); font-size: 12px; margin-bottom: 16px; }
  .cv-paywall-status { text-align: center; font-size: 12px; color: var(--cv-text-secondary); margin-bottom: 10px; }
  .cv-paywall-trial-copy { text-align: center; font-size: 12px; color: var(--cv-text-secondary); margin-bottom: 8px; }
  .cv-paywall-cta {
    width: 100%; min-height: 50px; border: none; border-radius: var(--cv-radius-md); padding: 14px 16px;
    background: var(--cv-teal); color: #ffffff; font-size: 15px; font-weight: 800; margin-bottom: 10px; cursor: pointer;
  }
  .cv-paywall-cta:disabled { opacity: 0.5; cursor: not-allowed; }
  .cv-paywall-restore { width: 100%; min-height: 44px; border: none; background: transparent; color: var(--cv-text-secondary); font-size: 13px; font-weight: 700; padding: 8px; margin-bottom: 8px; cursor: pointer; }
  .cv-paywall-restore:disabled { opacity: 0.5; }
  .cv-paywall-legal { text-align: center; font-size: 11px; color: var(--cv-text-secondary); line-height: 1.45; }
  .cv-paywall-legal a { color: var(--cv-text-secondary); }
  .cv-paywall-plan {
    flex: 1; text-align: left; border-radius: var(--cv-radius-md); padding: 12px;
    border: 1px solid var(--cv-border); background: var(--cv-surface); color: var(--cv-text);
    position: relative; cursor: pointer;
  }
  .cv-paywall-plan[data-active="true"] { border: 1.5px solid var(--cv-teal); background: color-mix(in srgb, var(--cv-teal) 12%, var(--cv-surface)); }
  .cv-paywall-plan-badge { position: absolute; top: -8px; right: 10px; font-size: 9px; font-weight: 800; background: var(--cv-gold); color: #111827; border-radius: 99px; padding: 3px 7px; }
  .cv-paywall-plan-title { font-size: 12px; font-weight: 700; color: var(--cv-text-secondary); }
  .cv-paywall-plan-price { font-size: 16px; font-weight: 800; margin-top: 4px; color: var(--cv-text); }
  .cv-paywall-plan-sub { font-size: 11px; color: var(--cv-text-secondary); margin-top: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .cv-paywall-sheet { scroll-behavior: auto; }
  }
`;
