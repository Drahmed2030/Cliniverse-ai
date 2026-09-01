"use client";

import PaywallSheet, { type PaywallPlan } from "./PaywallSheet";

interface PaywallScreenProps {
  onClose: () => void;
  onSubscribe: (plan: PaywallPlan) => void | Promise<void>;
  onRestore?: () => void | Promise<void>;
  monthlyPrice?: string;
  yearlyPrice?: string;
  yearlyPerMonth?: string;
  purchaseEnabled?: boolean;
  trialLabel?: string | null;
  busy?: boolean;
  statusLabel?: string | null;
}

/**
 * Release-safe paywall surface.
 *
 * This component deliberately contains no external checkout URL and never
 * grants PRO access. Purchase execution is delegated to the caller (StoreKit
 * on iOS), while entitlement remains derived from the verified subscription
 * authority after server-side verification.
 */
export default function PaywallScreen({
  onClose,
  onSubscribe,
  onRestore,
  monthlyPrice,
  yearlyPrice,
  yearlyPerMonth,
  purchaseEnabled = false,
  trialLabel = null,
  busy = false,
  statusLabel = null,
}: PaywallScreenProps) {
  return (
    <PaywallSheet
      open
      onClose={onClose}
      onSubscribe={onSubscribe}
      onRestore={onRestore}
      monthlyPrice={monthlyPrice}
      yearlyPrice={yearlyPrice}
      yearlyPerMonth={yearlyPerMonth}
      purchaseEnabled={purchaseEnabled}
      trialLabel={trialLabel}
      busy={busy}
      statusLabel={statusLabel}
    />
  );
}
