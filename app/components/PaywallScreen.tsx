"use client";

import PaywallSheet, { type PaywallPlan } from "./PaywallSheet";
import type { StoreProduct } from '../lib/storekit-purchase-contract'

interface PaywallScreenProps {
  onClose: () => void;
  onSubscribe: (plan: PaywallPlan) => void | Promise<void>;
  onRestore?: () => void | Promise<void>;
  products?: StoreProduct[];
  purchaseEnabled?: boolean;
  trialLabel?: string | null;
  busy?: boolean;
  statusLabel?: string | null;
  catalogLoading?: boolean;
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
  products = [],
  purchaseEnabled = false,
  trialLabel = null,
  busy = false,
  statusLabel = null,
  catalogLoading = false,
}: PaywallScreenProps) {
  return (
    <PaywallSheet
      open
      onClose={onClose}
      onSubscribe={onSubscribe}
      onRestore={onRestore}
      products={products}
      purchaseEnabled={purchaseEnabled}
      trialLabel={trialLabel}
      busy={busy}
      statusLabel={statusLabel}
      catalogLoading={catalogLoading}
    />
  );
}
